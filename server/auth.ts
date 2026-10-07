import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import type { Request, Response } from "express";
import type { User } from "../shared/types";
import {
  accountByEmail,
  database,
  deleteSession,
  emptyState,
  insertAccount,
  insertSession,
  readLocalState,
  registeredCount,
  saveLocalState,
  sessionById,
  sessionSecret,
  updateSessionCloud,
  withLearnerLock,
  type LearnerState,
  type Session,
} from "./db";
import {
  cloudRefresh,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  supabaseConfigured,
  supabaseGetState,
  supabaseSaveState,
} from "./supabase";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const cookieName = "ielts_session";
const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
const secret = sessionSecret();
const cookieSettings = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
const signature = (id: string): string =>
  createHmac("sha256", secret).update(id).digest("base64url");

function passwordKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await passwordKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [salt, stored] = hash.split(":");
  if (!salt || !stored || stored.length !== 128) return false;
  const actual = await passwordKey(password, salt);
  const expected = Buffer.from(stored, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSession(
  res: Response,
  userId: string,
  demo = false,
  cloud?: Session["cloud"],
): Session {
  const session: Session = {
    id: randomBytes(32).toString("base64url"),
    userId,
    demo,
    expiresAt: Date.now() + sessionLifetime,
    ...(cloud ? { cloud } : {}),
  };
  insertSession(session);
  res.cookie(cookieName, `${session.id}.${signature(session.id)}`, {
    ...cookieSettings,
    maxAge: sessionLifetime,
  });
  return session;
}
export async function getSession(
  req: Request,
  refresh = true,
): Promise<Session | null> {
  const cookie: unknown = req.cookies?.[cookieName];
  if (typeof cookie !== "string") return null;
  const [id, provided, extra] = cookie.split(".");
  if (
    !id ||
    !provided ||
    extra ||
    !/^[A-Za-z0-9_-]{43}$/.test(id) ||
    !/^[A-Za-z0-9_-]{43}$/.test(provided)
  )
    return null;
  const expected = signature(id);
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return null;
  return withLearnerLock(`session:${id}`, async () => {
    const session = sessionById(id);
    if (
      refresh &&
      session?.cloud &&
      session.cloud.expiresAt < Date.now() + 60000
    ) {
      try {
        session.cloud = await cloudRefresh(session.cloud.refreshToken);
        updateSessionCloud(session.id, session.cloud);
      } catch (error) {
        // Transient upstream failures must not destroy a usable refresh session.
        if (!(
          error instanceof Error &&
          "status" in error &&
          (error.status === 401 || error.status === 403)
        ))
          throw error;
        deleteSession(session.id);
        throw new ApiError(
          401,
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        );
      }
    }
    return session;
  });
}
export async function requireSession(req: Request): Promise<Session> {
  const session = await getSession(req);
  if (!session) throw new ApiError(401, "Bạn cần đăng nhập để tiếp tục.");
  return session;
}

export async function loadState(session: Session): Promise<LearnerState> {
  const state = session.cloud
    ? await supabaseGetState(session.userId, session.cloud.accessToken)
    : readLocalState(session.userId);
  if (!state || state.profile.id !== session.userId)
    throw new ApiError(404, "Không tìm thấy hồ sơ học viên.");
  return state;
}
export async function saveState(
  session: Session,
  state: LearnerState,
): Promise<void> {
  if (state.profile.id !== session.userId)
    throw new ApiError(403, "Hồ sơ không thuộc tài khoản hiện tại.");
  if (session.cloud)
    await supabaseSaveState(session.userId, state, session.cloud.accessToken);
  else saveLocalState(session.userId, state);
}

function newProfile(
  id: string,
  name: string,
  email: string,
  targetBand: number,
): User {
  return {
    id,
    name,
    email,
    currentBand: null,
    targetBand,
    cefr: null,
    createdAt: new Date().toISOString(),
  };
}
export async function register(
  input: { email: string; name: string; password: string; targetBand: number },
  res: Response,
): Promise<User> {
  if (supabaseConfigured()) {
    const cloud = await cloudSignUp(input);
    const existing = await supabaseGetState(cloud.id, cloud.accessToken);
    const state =
      existing ??
      emptyState(
        newProfile(cloud.id, input.name, input.email, input.targetBand),
      );
    await supabaseSaveState(cloud.id, state, cloud.accessToken);
    createSession(res, cloud.id, false, cloud);
    return state.profile;
  }
  if (accountByEmail(input.email))
    throw new ApiError(409, "Email này đã được đăng ký.");
  if (registeredCount() >= 2)
    throw new ApiError(
      409,
      "Không gian học tập này dành cho tối đa 2 học viên.",
    );
  const passwordHash = await hashPassword(input.password);
  const id = randomUUID();
  const profile = newProfile(id, input.name, input.email, input.targetBand);
  database.exec("BEGIN IMMEDIATE");
  try {
    if (registeredCount() >= 2)
      throw new ApiError(409, "Không gian học tập đã đủ 2 học viên.");
    if (accountByEmail(input.email))
      throw new ApiError(409, "Email này đã được đăng ký.");
    insertAccount({ id, email: input.email, name: input.name, passwordHash });
    saveLocalState(id, emptyState(profile));
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
  createSession(res, id);
  return profile;
}
export async function login(
  input: { email: string; password: string },
  res: Response,
): Promise<User> {
  if (supabaseConfigured()) {
    const cloud = await cloudSignIn(input);
    let state = await supabaseGetState(cloud.id, cloud.accessToken);
    if (!state) {
      state = emptyState(newProfile(cloud.id, cloud.name, cloud.email, 6.5));
      await supabaseSaveState(cloud.id, state, cloud.accessToken);
    }
    createSession(res, cloud.id, false, cloud);
    return state.profile;
  }
  const account = accountByEmail(input.email);
  // Do equal-cost work when the account is absent to reduce account timing leaks.
  const fallbackHash = `${"0".repeat(32)}:${"0".repeat(128)}`;
  const valid = await verifyPassword(
    input.password,
    account?.passwordHash ?? fallbackHash,
  );
  if (!account || !valid)
    throw new ApiError(401, "Email hoặc mật khẩu chưa đúng.");
  const state = readLocalState(account.id);
  if (!state) throw new ApiError(404, "Không tìm thấy hồ sơ học viên.");
  createSession(res, account.id);
  return state.profile;
}
export function demoLogin(learner: 1 | 2, res: Response): User {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO !== "true"
  )
    throw new ApiError(403, "Chế độ trải nghiệm chưa được bật.");
  const id = `demo-learner-${learner}`;
  let state = readLocalState(id);
  if (!state) {
    state = emptyState(
      newProfile(
        id,
        learner === 1 ? "Minh Anh" : "Tuấn Minh",
        `learner${learner}@demo.local`,
        learner === 1 ? 6.5 : 7,
      ),
    );
    saveLocalState(id, state);
  }
  createSession(res, id, true);
  return state.profile;
}
export async function logout(req: Request, res: Response): Promise<void> {
  const session = await getSession(req, false);
  if (session) {
    deleteSession(session.id);
    if (session.cloud)
      await cloudSignOut(session.cloud.accessToken).catch(() => undefined);
  }
  res.clearCookie(cookieName, cookieSettings);
}

export function verifyOrigin(req: Request): void {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  if (req.get("sec-fetch-site") === "cross-site")
    throw new ApiError(403, "Yêu cầu cần được gửi từ website này.");
  const origin = req.get("origin");
  if (!origin) return; // Non-browser API clients do not provide Origin; JSON endpoints do not accept HTML form payloads.
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    throw new ApiError(403, "Nguồn yêu cầu không hợp lệ.");
  }
  const expected = process.env.APP_ORIGIN
    ? new URL(process.env.APP_ORIGIN).origin
    : `${req.protocol}://${req.get("host")}`;
  if (parsed.origin !== expected)
    throw new ApiError(403, "Yêu cầu cần được gửi từ website này.");
}
