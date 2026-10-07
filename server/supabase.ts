import { z } from "zod";
import { fsrs, type CardInput } from "ts-fsrs";
import type { CloudIdentity, LearnerState } from "./db";

/** Public Supabase keys only. Every database request runs as the signed-in learner. */
export class SupabaseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "SupabaseError";
  }
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_ANON_KEY?.trim(),
  );
}

function configuration(): { url: string; key: string } {
  const rawUrl = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !key)
    throw new SupabaseError(
      "Chưa cấu hình Supabase.",
      503,
      "SUPABASE_NOT_CONFIGURED",
    );
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SupabaseError(
      "Cấu hình URL Supabase không hợp lệ.",
      503,
      "SUPABASE_CONFIGURATION",
    );
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/*$/.test(url.pathname)
  ) {
    throw new SupabaseError(
      "Supabase cần URL HTTPS hợp lệ.",
      503,
      "SUPABASE_CONFIGURATION",
    );
  }
  if (
    key.startsWith("sb_secret_") ||
    serviceRoleKey(key) ||
    /[\r\n]/.test(key)
  ) {
    throw new SupabaseError(
      "Hãy dùng Supabase anon/publishable key; không dùng service-role key.",
      503,
      "SUPABASE_CONFIGURATION",
    );
  }
  return { url: url.origin, key };
}

function serviceRoleKey(key: string): boolean {
  const encoded = key.split(".")[1];
  if (!encoded) return false;
  try {
    const payload: unknown = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    );
    return (
      z.object({ role: z.string().optional() }).safeParse(payload).data
        ?.role === "service_role"
    );
  } catch {
    return false;
  }
}

const upstreamErrorSchema = z.object({
  code: z.string().optional(),
  error_code: z.string().optional(),
  message: z.string().optional(),
  msg: z.string().optional(),
  error_description: z.string().optional(),
});
function upstreamError(status: number, body: unknown): SupabaseError {
  const error = upstreamErrorSchema.safeParse(body).data;
  const code = error?.error_code ?? error?.code;
  const message =
    error?.message ?? error?.msg ?? error?.error_description ?? "";
  if (code === "email_not_confirmed")
    return new SupabaseError(
      "Hãy xác nhận email trước khi đăng nhập.",
      403,
      "EMAIL_CONFIRMATION_REQUIRED",
    );
  if (code === "invalid_credentials" || status === 401)
    return new SupabaseError(
      "Email hoặc mật khẩu không đúng, hoặc phiên đăng nhập đã hết hạn.",
      401,
      "SUPABASE_AUTHENTICATION",
    );
  if (
    code === "refresh_token_not_found" ||
    code === "refresh_token_already_used" ||
    code === "session_not_found"
  )
    return new SupabaseError(
      "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.",
      401,
      "SUPABASE_SESSION_EXPIRED",
    );
  if (message.includes("IELTS_ACCOUNT_LIMIT"))
    return new SupabaseError(
      "Nhóm học đã có đủ 2 tài khoản.",
      409,
      "ACCOUNT_LIMIT",
    );
  if (
    status === 429 ||
    code === "over_request_rate_limit" ||
    code === "over_email_send_rate_limit"
  )
    return new SupabaseError(
      "Bạn thao tác quá nhanh. Hãy thử lại sau ít phút.",
      429,
      "SUPABASE_RATE_LIMIT",
    );
  if (code === "weak_password")
    return new SupabaseError(
      "Mật khẩu chưa đáp ứng chính sách bảo mật Supabase.",
      400,
      "WEAK_PASSWORD",
    );
  if (status === 403)
    return new SupabaseError(
      "Không có quyền truy cập dữ liệu này.",
      403,
      "SUPABASE_ACCESS_DENIED",
    );
  if (code === "PGRST202" || code === "42P01")
    return new SupabaseError(
      "Cần chạy SQL migration Supabase trước khi sử dụng.",
      503,
      "SUPABASE_MIGRATION_REQUIRED",
    );
  if (status >= 500)
    return new SupabaseError(
      "Supabase đang không khả dụng. Hãy thử lại sau.",
      503,
      "SUPABASE_UNAVAILABLE",
    );
  return new SupabaseError(
    "Supabase không thể xử lý yêu cầu. Kiểm tra cấu hình xác thực và migration.",
    400,
    "SUPABASE_REQUEST_FAILED",
  );
}

async function request(
  path: string,
  options: { method?: "GET" | "POST"; token?: string; body?: unknown } = {},
): Promise<unknown> {
  const { url, key } = configuration();
  if (
    options.token !== undefined &&
    (!options.token || /[\r\n]/.test(options.token))
  ) {
    throw new SupabaseError(
      "Phiên đăng nhập không hợp lệ.",
      401,
      "SUPABASE_AUTHENTICATION",
    );
  }
  let response: Response;
  try {
    response = await fetch(`${url}${path}`, {
      method: options.method ?? "GET",
      headers: {
        apikey: key,
        Accept: "application/json",
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      ...(options.body !== undefined
        ? { body: JSON.stringify(options.body) }
        : {}),
      signal: AbortSignal.timeout(15_000),
      redirect: "error",
    });
  } catch {
    throw new SupabaseError(
      "Không thể kết nối Supabase. Hãy thử lại sau.",
      503,
      "SUPABASE_UNAVAILABLE",
    );
  }
  let text: string;
  try {
    text = await response.text();
  } catch {
    throw new SupabaseError(
      "Không thể đọc phản hồi Supabase.",
      503,
      "SUPABASE_UNAVAILABLE",
    );
  }
  if (text.length > 10_000_000)
    throw new SupabaseError(
      "Dữ liệu Supabase vượt giới hạn cho phép.",
      503,
      "SUPABASE_INVALID_RESPONSE",
    );
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      throw new SupabaseError(
        "Supabase trả về phản hồi không hợp lệ.",
        503,
        "SUPABASE_INVALID_RESPONSE",
      );
    }
  }
  if (!response.ok) throw upstreamError(response.status, body);
  return body;
}

const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  user_metadata: z
    .object({ name: z.string().optional(), full_name: z.string().optional() })
    .optional(),
});
const sessionSchema = z.object({
  user: authUserSchema,
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_at: z.number().positive().optional(),
  expires_in: z.number().positive().optional(),
});
function identity(body: unknown): CloudIdentity {
  const result = sessionSchema.safeParse(body);
  if (!result.success)
    throw new SupabaseError(
      "Supabase trả về phiên đăng nhập không hợp lệ.",
      503,
      "SUPABASE_INVALID_RESPONSE",
    );
  const session = result.data;
  const expiresAt =
    session.expires_at !== undefined
      ? session.expires_at * 1000
      : Date.now() + (session.expires_in ?? 3600) * 1000;
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now())
    throw new SupabaseError(
      "Phiên Supabase đã hết hạn.",
      401,
      "SUPABASE_SESSION_EXPIRED",
    );
  return {
    id: session.user.id,
    email: session.user.email,
    name:
      session.user.user_metadata?.name?.trim() ||
      session.user.user_metadata?.full_name?.trim() ||
      session.user.email.split("@")[0],
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt,
  };
}

const signInSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});
const signUpSchema = signInSchema.extend({
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(80),
  targetBand: z.number().min(3).max(7).multipleOf(0.5),
});
export async function cloudSignUp(input: {
  email: string;
  password: string;
  name: string;
  targetBand: number;
}): Promise<CloudIdentity> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success)
    throw new SupabaseError(
      "Thông tin đăng ký không hợp lệ.",
      400,
      "INVALID_SIGNUP",
    );
  const { email, password, name, targetBand } = parsed.data;
  const body = await request("/auth/v1/signup", {
    method: "POST",
    body: { email, password, data: { name, target_band: targetBand } },
  });
  if (
    !sessionSchema.safeParse(body).success &&
    z
      .union([authUserSchema, z.object({ user: authUserSchema })])
      .safeParse(body).success
  ) {
    throw new SupabaseError(
      "Tài khoản đã được gửi yêu cầu xác nhận. Hãy kiểm tra email rồi đăng nhập.",
      403,
      "EMAIL_CONFIRMATION_REQUIRED",
    );
  }
  return identity(body);
}

export async function cloudSignIn(input: {
  email: string;
  password: string;
}): Promise<CloudIdentity> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success)
    throw new SupabaseError(
      "Email hoặc mật khẩu không hợp lệ.",
      400,
      "INVALID_SIGNIN",
    );
  return identity(
    await request("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: parsed.data,
    }),
  );
}

export async function cloudRefresh(
  refreshToken: string,
): Promise<CloudIdentity> {
  if (!refreshToken || refreshToken.length > 4096)
    throw new SupabaseError(
      "Phiên đăng nhập đã hết hạn.",
      401,
      "SUPABASE_SESSION_EXPIRED",
    );
  return identity(
    await request("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),
  );
}

export async function cloudSignOut(accessToken: string): Promise<void> {
  await request("/auth/v1/logout?scope=local", {
    method: "POST",
    token: accessToken,
  });
}

const skillSchema = z.enum(["listening", "reading", "writing", "speaking"]);
const historySkillSchema = z.enum([
  "listening",
  "reading",
  "writing",
  "speaking",
  "placement",
]);
const cefrSchema = z.enum(["A2", "B1", "B2", "C1"]);
const bandSchema = z.number().min(0).max(9).multipleOf(0.5);
const timestampSchema = z.iso.datetime({ offset: true });
const sourceSchema = z.enum(["sample", "ai"]);
const schedulerSchema: z.ZodType<CardInput> = z.object({
  due: timestampSchema,
  stability: z.number().nonnegative(),
  difficulty: z.number().min(0).max(10),
  elapsed_days: z.number().int().nonnegative(),
  scheduled_days: z.number().int().nonnegative(),
  learning_steps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  last_review: timestampSchema.optional(),
});
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });
const feedbackSchema = z.object({
  id: z.string().min(1).max(200),
  skill: historySkillSchema,
  score: bandSchema.nullable(),
  maxScore: z.number().optional(),
  correct: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
  summary: z.string().max(50_000),
  criteria: z
    .array(
      z.object({
        name: z.string().max(200),
        band: bandSchema.nullable(),
        feedback: z.string().max(10_000),
        evidence: z.array(z.string().max(10_000)).max(100),
      }),
    )
    .max(20),
  corrections: z
    .array(
      z.object({
        original: z.string().max(10_000),
        suggestion: z.string().max(10_000),
        explanation: z.string().max(10_000),
      }),
    )
    .max(200),
  paragraphs: z
    .array(
      z.object({
        index: z.number().int().nonnegative(),
        feedback: z.string().max(10_000),
      }),
    )
    .max(100),
  answers: z
    .array(
      z.object({
        questionId: z.string().max(200),
        userAnswer: z.string().max(10_000),
        correctAnswer: z.string().max(10_000),
        correct: z.boolean(),
        explanation: z.string().max(10_000),
      }),
    )
    .max(200)
    .optional(),
  transcript: z.string().max(100_000).optional(),
  fillerCount: z.number().int().nonnegative().optional(),
  fillerDensity: z.number().nonnegative().optional(),
  wordCount: z.number().int().nonnegative().optional(),
  pronunciation: z
    .object({
      accuracy: z.number().min(0).max(100),
      fluency: z.number().min(0).max(100),
      completeness: z.number().min(0).max(100).nullable(),
      prosody: z.number().min(0).max(100).optional(),
    })
    .nullable()
    .optional(),
  source: sourceSchema,
  createdAt: timestampSchema,
});
const vocabularySchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().max(2000),
  example: z.string().max(5000),
  cefr: cefrSchema,
});
const learnerStateSchema: z.ZodType<LearnerState> = z.object({
  profile: z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).max(80),
    email: z.email().max(254),
    currentBand: bandSchema.nullable(),
    targetBand: z.number().min(3).max(7).multipleOf(0.5),
    cefr: cefrSchema.nullable(),
    createdAt: timestampSchema,
  }),
  exercises: z
    .array(
      z.object({
        exercise: z.object({
          id: z.string().min(1).max(200),
          skill: skillSchema,
          title: z.string().max(500),
          description: z.string().max(10_000),
          band: bandSchema,
          cefr: cefrSchema,
          durationMinutes: z.number().positive(),
          content: z.string().max(100_000),
          sections: z
            .array(
              z.object({
                title: z.string().max(500),
                content: z.string().max(100_000),
                speaker: z.string().max(200).optional(),
              }),
            )
            .max(100),
          questions: z
            .array(
              z.object({
                id: z.string().min(1).max(200),
                text: z.string().max(10_000),
                type: z.enum(["choice", "text"]),
                options: z.array(z.string().max(10_000)).max(20).optional(),
              }),
            )
            .max(200),
          vocabulary: z.array(vocabularySchema).max(1000),
          task: z.union([z.literal(1), z.literal(2)]).optional(),
          chart: z
            .array(z.object({ label: z.string().max(500), value: z.number() }))
            .max(100)
            .optional(),
          source: sourceSchema,
        }),
        answers: z.record(
          z.string().max(200),
          z.object({
            answer: z.string().max(10_000),
            explanation: z.string().max(10_000),
          }),
        ),
      }),
    )
    .max(500),
  history: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        skill: historySkillSchema,
        title: z.string().max(500),
        score: bandSchema.nullable(),
        source: sourceSchema,
        createdAt: timestampSchema,
        feedback: feedbackSchema,
      }),
    )
    .max(10_000),
  cards: z
    .array(
      vocabularySchema.extend({
        id: z.string().min(1).max(200),
        scheduler: z.string().max(20_000),
        reviews: z
          .array(
            z.object({
              reviewedAt: timestampSchema,
              rating: z.number().int().min(1).max(4),
              log: z.string().max(20_000),
            }),
          )
          .max(10_000),
      }),
    )
    .max(10_000),
  placements: z
    .array(
      z.object({
        id: z.string().min(1).max(200),
        band: bandSchema,
        questionId: z.string().max(200).nullable(),
        answers: z
          .array(
            z.object({
              questionId: z.string().max(200),
              answer: z.string().max(1000),
              correct: z.boolean(),
              band: bandSchema,
            }),
          )
          .max(100),
        result: feedbackSchema.optional(),
        source: sourceSchema.optional(),
        questionBank: z
          .array(
            z.object({
              id: z.string().min(1).max(200),
              text: z.string().max(10_000),
              options: z.array(z.string().max(10_000)).max(10),
              answer: z.string().max(10_000),
              cefr: cefrSchema,
              band: bandSchema,
            }),
          )
          .max(32)
          .optional(),
      }),
    )
    .max(500),
});
const profileRowSchema = z.object({
  user_id: z.uuid(),
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  current_band: bandSchema.nullable(),
  target_band: z.number().min(3).max(7).multipleOf(0.5),
  cefr: cefrSchema.nullable(),
  created_at: timestampSchema,
});

function parseState(value: unknown, userId: string): LearnerState {
  const result = learnerStateSchema.safeParse(value);
  if (!result.success || result.data.profile.id !== userId) {
    throw new SupabaseError(
      "Dữ liệu học viên không hợp lệ hoặc không thuộc tài khoản này.",
      503,
      "SUPABASE_INVALID_STATE",
    );
  }
  for (const card of result.data.cards) {
    let parsedScheduler: unknown;
    try {
      parsedScheduler = JSON.parse(card.scheduler) as unknown;
    } catch {
      throw new SupabaseError(
        "Lịch ôn tập Supabase không hợp lệ.",
        503,
        "SUPABASE_INVALID_STATE",
      );
    }
    if (!schedulerSchema.safeParse(parsedScheduler).success)
      throw new SupabaseError(
        "Lịch ôn tập Supabase không hợp lệ.",
        503,
        "SUPABASE_INVALID_STATE",
      );
  }
  return result.data;
}

export async function supabaseGetState(
  userId: string,
  accessToken: string,
): Promise<LearnerState | null> {
  if (!z.uuid().safeParse(userId).success)
    throw new SupabaseError(
      "Tài khoản không hợp lệ.",
      401,
      "SUPABASE_AUTHENTICATION",
    );
  const body = await request(
    `/rest/v1/learner_state?user_id=eq.${encodeURIComponent(userId)}&select=state_json&limit=1`,
    { token: accessToken },
  );
  const result = z
    .array(z.object({ state_json: z.unknown() }))
    .max(1)
    .safeParse(body);
  if (!result.success)
    throw new SupabaseError(
      "Dữ liệu Supabase không hợp lệ.",
      503,
      "SUPABASE_INVALID_RESPONSE",
    );
  if (result.data.length) return parseState(result.data[0].state_json, userId);
  // Email-confirmed signups may have an Auth-trigger profile before any session
  // could save the state. Preserve the chosen target band on their first login.
  const profiles = z
    .array(profileRowSchema)
    .max(1)
    .safeParse(
      await request(
        `/rest/v1/user_profiles?user_id=eq.${encodeURIComponent(userId)}&select=user_id,name,email,current_band,target_band,cefr,created_at&limit=1`,
        { token: accessToken },
      ),
    );
  if (!profiles.success)
    throw new SupabaseError(
      "Hồ sơ Supabase không hợp lệ.",
      503,
      "SUPABASE_INVALID_RESPONSE",
    );
  if (!profiles.data.length) return null;
  const profile = profiles.data[0];
  return parseState(
    {
      profile: {
        id: profile.user_id,
        name: profile.name,
        email: profile.email,
        currentBand: profile.current_band,
        targetBand: profile.target_band,
        cefr: profile.cefr,
        createdAt: profile.created_at,
      },
      exercises: [],
      cards: [],
      history: [],
      placements: [],
    },
    userId,
  );
}

export async function supabaseSaveState(
  userId: string,
  state: LearnerState,
  accessToken: string,
): Promise<void> {
  const validated = parseState(state, userId);
  if (Buffer.byteLength(JSON.stringify(validated), "utf8") > 8_000_000)
    throw new SupabaseError(
      "Dữ liệu học viên vượt dung lượng cho phép.",
      413,
      "LEARNER_STATE_TOO_LARGE",
    );
  const now = new Date();
  const mirrored = {
    ...validated,
    cards: validated.cards.map((card) => ({
      ...card,
      retrievability: scheduler.get_retrievability(
        schedulerSchema.parse(JSON.parse(card.scheduler) as unknown),
        now,
        false,
      ),
    })),
  };
  await request("/rest/v1/rpc/save_learner_state", {
    method: "POST",
    token: accessToken,
    body: { state: mirrored },
  });
}
