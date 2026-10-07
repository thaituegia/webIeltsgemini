import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type {
  Exercise,
  Feedback,
  HistoryItem,
  PlacementQuestion,
  User,
  VocabularyWord,
} from "../shared/types";

export interface AnswerKey {
  answer: string;
  explanation: string;
}
export interface StoredExercise {
  exercise: Exercise;
  answers: Record<string, AnswerKey>;
}
export interface StoredCard extends VocabularyWord {
  id: string;
  scheduler: string;
  reviews: { reviewedAt: string; rating: number; log: string }[];
}
export interface StoredPlacement {
  id: string;
  band: number;
  questionId: string | null;
  answers: {
    questionId: string;
    answer: string;
    correct: boolean;
    band: number;
  }[];
  questionBank?: (PlacementQuestion & { answer: string; band: number })[];
  source?: "sample" | "ai";
  result?: Feedback;
}
export interface LearnerState {
  profile: User;
  exercises: StoredExercise[];
  history: HistoryItem[];
  cards: StoredCard[];
  placements: StoredPlacement[];
}
export interface CloudIdentity {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
export interface Session {
  id: string;
  userId: string;
  expiresAt: number;
  demo: boolean;
  cloud?: CloudIdentity;
}
export interface Account {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
}

const databaseFile =
  process.env.DATABASE_PATH === ":memory:"
    ? ":memory:"
    : resolve(process.env.DATABASE_PATH || ".local/ielts.sqlite");
if (databaseFile !== ":memory:")
  mkdirSync(dirname(databaseFile), { recursive: true, mode: 0o700 });
export const database = new DatabaseSync(databaseFile);
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS learner_state (user_id TEXT PRIMARY KEY, state_json TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL, demo INTEGER NOT NULL, cloud_json TEXT);
  CREATE TABLE IF NOT EXISTS server_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

type Row = Record<string, string | number | bigint | null | Uint8Array>;
function rowText(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error("Invalid stored record");
  return value;
}

export function sessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    if (process.env.SESSION_SECRET.length < 32)
      throw new Error("SESSION_SECRET must contain at least 32 characters");
    return process.env.SESSION_SECRET;
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("Set SESSION_SECRET (32+ characters) for production");
  const existing = database
    .prepare("SELECT value FROM server_settings WHERE key = ?")
    .get("session_secret");
  if (existing) return rowText(existing, "value");
  const secret = randomBytes(48).toString("hex");
  database
    .prepare("INSERT INTO server_settings (key, value) VALUES (?, ?)")
    .run("session_secret", secret);
  return secret;
}

export function accountByEmail(email: string): Account | null {
  const row = database
    .prepare("SELECT * FROM accounts WHERE email = ?")
    .get(email);
  return row
    ? {
        id: rowText(row, "id"),
        email: rowText(row, "email"),
        passwordHash: rowText(row, "password_hash"),
        name: rowText(row, "name"),
      }
    : null;
}
export function registeredCount(): number {
  return Number(
    database.prepare("SELECT COUNT(*) AS n FROM accounts").get()?.n ?? 0,
  );
}
export function insertAccount(account: Account): void {
  database
    .prepare(
      "INSERT INTO accounts (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
    )
    .run(account.id, account.email, account.passwordHash, account.name);
}
export function readLocalState(userId: string): LearnerState | null {
  const row = database
    .prepare("SELECT state_json FROM learner_state WHERE user_id = ?")
    .get(userId);
  return row ? (JSON.parse(rowText(row, "state_json")) as LearnerState) : null;
}
export function saveLocalState(userId: string, state: LearnerState): void {
  database
    .prepare(
      "INSERT INTO learner_state (user_id, state_json) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json",
    )
    .run(userId, JSON.stringify(state));
}
export function emptyState(profile: User): LearnerState {
  return { profile, exercises: [], history: [], cards: [], placements: [] };
}
export function insertSession(session: Session): void {
  database.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  database
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at, demo, cloud_json) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      session.id,
      session.userId,
      session.expiresAt,
      Number(session.demo),
      session.cloud ? JSON.stringify(session.cloud) : null,
    );
}
export function sessionById(id: string): Session | null {
  const row = database
    .prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > ?")
    .get(id, Date.now());
  if (!row) return null;
  const rawCloud = row.cloud_json;
  return {
    id: rowText(row, "id"),
    userId: rowText(row, "user_id"),
    expiresAt: Number(row.expires_at),
    demo: Boolean(row.demo),
    ...(typeof rawCloud === "string"
      ? { cloud: JSON.parse(rawCloud) as CloudIdentity }
      : {}),
  };
}
export function updateSessionCloud(id: string, cloud: CloudIdentity): void {
  database
    .prepare("UPDATE sessions SET cloud_json = ? WHERE id = ?")
    .run(JSON.stringify(cloud), id);
}
export function deleteSession(id: string): void {
  database.prepare("DELETE FROM sessions WHERE id = ?").run(id);
}

// The mutex prevents overlapping browser requests from overwriting a learner's state.
const locks = new Map<string, Promise<void>>();
export async function withLearnerLock<T>(
  userId: string,
  task: () => Promise<T>,
): Promise<T> {
  const previous = locks.get(userId) ?? Promise.resolve();
  let release: () => void = () => undefined;
  const lock = new Promise<void>((resolveLock) => {
    release = resolveLock;
  });
  const chained = previous.then(() => lock);
  locks.set(userId, chained);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (locks.get(userId) === chained) locks.delete(userId);
  }
}
