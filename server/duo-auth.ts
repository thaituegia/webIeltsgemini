import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { isAbsolute } from "node:path";
import { ApiError } from "./errors";
import { initialProfile, verifyPassword } from "./auth";
import type { Database, UserRecord } from "./storage";

export type DuoRole = "husband" | "wife";
export interface DuoAccountCredential {
  role: DuoRole;
  name: string;
  phone: string;
  passwordHash: string;
}
export interface DuoCredentialSettings {
  duoId: string;
  accounts: readonly DuoAccountCredential[];
}
export interface DuoAuthenticationOptions {
  duo?: DuoCredentialSettings;
}

const invalidSettings = () => new Error("Cấu hình hai tài khoản chưa hợp lệ. Kiểm tra tệp thông tin đăng nhập riêng.");
const hashPattern = /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/;
const phonePattern = /^0[35789]\d{8}$/;
// A valid salted scrypt value for the same-cost rejection path. It is not an account.
const dummyPasswordHash = `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;

export function normalizeDuoPhone(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 24) return null;
  const clean = value.trim().replace(/[ .()-]/g, "");
  const phone = clean.startsWith("+84") ? `0${clean.slice(3)}` : clean;
  return phonePattern.test(phone) ? phone : null;
}

export function parseDuoCredentials(value: unknown): DuoCredentialSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidSettings();
  const root = value as Record<string, unknown>;
  if (Object.keys(root).some((key) => !["duoId", "accounts"].includes(key))) throw invalidSettings();
  const duoId = root.duoId ?? "ielts-duo-01";
  if (typeof duoId !== "string" || !/^[a-z0-9][a-z0-9-]{2,79}$/.test(duoId)) throw invalidSettings();
  if (!Array.isArray(root.accounts) || root.accounts.length !== 2) throw invalidSettings();
  const accounts = root.accounts.map((value): DuoAccountCredential => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw invalidSettings();
    const account = value as Record<string, unknown>;
    if (Object.keys(account).some((key) => !["role", "name", "phone", "passwordHash"].includes(key))) throw invalidSettings();
    if (account.role !== "husband" && account.role !== "wife") throw invalidSettings();
    if (typeof account.name !== "string" || account.name.trim().length < 2 || account.name.length > 80 || /[\u0000-\u001f]/u.test(account.name)) throw invalidSettings();
    const phone = normalizeDuoPhone(account.phone);
    if (!phone || phone !== account.phone) throw invalidSettings();
    if (typeof account.passwordHash !== "string" || !hashPattern.test(account.passwordHash)) throw invalidSettings();
    return { role: account.role, name: account.name.trim(), phone, passwordHash: account.passwordHash };
  });
  if (new Set(accounts.map((account) => account.role)).size !== 2 || new Set(accounts.map((account) => account.phone)).size !== 2) throw invalidSettings();
  return Object.freeze({ duoId, accounts: Object.freeze(accounts.map((account) => Object.freeze(account))) });
}

export function loadDuoCredentials(input: { credentialsFile?: string; accountsJson?: string } = {}): DuoCredentialSettings {
  const credentialsFile = input.credentialsFile ?? process.env.DUO_CREDENTIALS_FILE;
  const accountsJson = input.accountsJson ?? process.env.DUO_ACCOUNTS_JSON;
  if (Boolean(credentialsFile) === Boolean(accountsJson)) throw invalidSettings();
  let raw: string;
  if (credentialsFile) {
    if (!isAbsolute(credentialsFile)) throw invalidSettings();
    try {
      const stat = lstatSync(credentialsFile);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size < 2 || stat.size > 16_384 || (stat.mode & 0o077) !== 0) throw invalidSettings();
      raw = readFileSync(credentialsFile, "utf8");
    } catch { throw invalidSettings(); }
  } else {
    if (!accountsJson || accountsJson.length > 16_384) throw invalidSettings();
    raw = accountsJson;
  }
  try { return parseDuoCredentials(JSON.parse(raw)); } catch { throw invalidSettings(); }
}

export function duoAccountForUser(settings: DuoCredentialSettings, user: UserRecord): DuoAccountCredential | undefined {
  return settings.accounts.find((account) =>
    user.duoId === settings.duoId && user.duoRole === account.role &&
    user.phone === account.phone && user.passwordHash === account.passwordHash && !user.demo,
  );
}

export function duoCredentialVersion(settings: DuoCredentialSettings, account: DuoAccountCredential): string {
  return createHash("sha256").update(JSON.stringify([settings.duoId, account.role, account.phone, account.passwordHash])).digest("hex");
}

function assertCompatibleIdentity(user: UserRecord, settings: DuoCredentialSettings, account: DuoAccountCredential): void {
  if (user.demo || (user.phone && user.phone !== account.phone) ||
    (user.duoId && user.duoId !== settings.duoId) || (user.duoRole && user.duoRole !== account.role))
    throw new Error("Không thể gắn tài khoản cố định: danh tính hiện có khác cấu hình. Dữ liệu học vẫn được giữ nguyên.");
}

export async function provisionDuoAccounts(database: Database, settings: DuoCredentialSettings): Promise<UserRecord[]> {
  // Validate first; no public bank, progress, attempt, placement or session is rewritten.
  const validated = parseDuoCredentials(settings);
  const results: UserRecord[] = [];
  const identities: { account: DuoAccountCredential; id: string; existing: UserRecord | null }[] = [];
  for (const account of validated.accounts) {
    const exactPhone = await database.users.find({ phone: account.phone }).limit(3).toArray();
    if (exactPhone.length > 1) throw new Error("Có nhiều tài khoản dùng cùng số điện thoại. Dừng để giữ nguyên danh tính và dữ liệu học.");
    const stableId = `${validated.duoId}-${account.role}`;
    let existing: UserRecord | null = exactPhone[0] ?? await database.users.findOne({ _id: stableId });
    if (existing) {
      if (!exactPhone.length && existing.phone !== account.phone) throw new Error("Mã tài khoản cố định đang thuộc danh tính khác. Dữ liệu học vẫn được giữ nguyên.");
      assertCompatibleIdentity(existing, validated, account);
    }
    const id = existing?._id ?? stableId;
    identities.push({ account, id, existing });
  }
  // Reject a conflicting second identity before changing the first account.
  for (const identity of identities) {
    const { account, id } = identity;
    let { existing } = identity;
    const binding = { name: account.name, phone: account.phone, duoRole: account.role, duoId: validated.duoId, passwordHash: account.passwordHash, demo: false, targetBand: 8 };
    const initial = initialProfile({ name: account.name, email: `duo-${account.role}@${validated.duoId}.invalid`, targetBand: 8, testType: "academic" }, id);
    if (!existing) {
      try { await database.users.insertOne({ ...initial, ...binding, _id: id }); }
      catch (error) {
        if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) throw error;
        existing = await database.users.findOne({ _id: id });
        if (!existing) throw new Error("Không thể tạo tài khoản cố định vì danh tính bị xung đột.");
        assertCompatibleIdentity(existing, validated, account);
      }
    }
    // Update the fixed identity and authorized target of 8. Preserve assessed band, ID,
    // email, dates, personal settings, placement and all learning records.
    await database.users.updateOne({ _id: id, phone: account.phone }, { $set: binding });
    const user = await database.users.findOne({ _id: id });
    if (!user || !duoAccountForUser(validated, user)) throw new Error("Không thể xác minh tài khoản cố định sau khi tạo.");
    results.push(user);
  }
  return results;
}

export async function loginDuo(database: Database, settings: DuoCredentialSettings, input: { phone?: unknown; password?: unknown }): Promise<UserRecord> {
  const phone = normalizeDuoPhone(input.phone);
  const password = typeof input.password === "string" && input.password.length <= 128 ? input.password : "";
  const account = settings.accounts.find((item) => item.phone === phone);
  const valid = await verifyPassword(password, account?.passwordHash ?? dummyPasswordHash);
  if (!account || !valid || !password) throw new ApiError(401, "Số điện thoại hoặc mật khẩu không đúng.");
  const users = await provisionDuoAccounts(database, settings);
  const user = users.find((item) => item.duoRole === account.role);
  if (!user) throw new Error("Tài khoản cố định chưa sẵn sàng.");
  return user;
}
