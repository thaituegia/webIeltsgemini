import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, chmod, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import express, { type Response } from "express";
import cookieParser from "cookie-parser";
import { BSON } from "mongodb";
import { attachLearner, COOKIE_NAME, createSession, hashPassword, hashToken, initialProfile, verifyPassword, type AuthenticatedRequest } from "../server/auth";
import { duoCredentialVersion, loadDuoCredentials, loginDuo, normalizeDuoPhone, parseDuoCredentials, provisionDuoAccounts, type DuoCredentialSettings } from "../server/duo-auth";
import { connectDatabase, type UserRecord } from "../server/storage";

async function fixture(): Promise<DuoCredentialSettings> {
  return parseDuoCredentials({ duoId: "synthetic-duo-test", accounts: [
    { role: "husband", name: "Synthetic first learner", phone: "0390000001", passwordHash: await hashPassword("first-test-password") },
    { role: "wife", name: "Synthetic second learner", phone: "0390000002", passwordHash: await hashPassword("second-test-password") },
  ] });
}

test("fixed duo credentials reject ambiguous roles, third accounts, plaintext passwords and unsafe files", async () => {
  const settings = await fixture();
  assert.equal(settings.accounts.length, 2);
  assert.equal(Object.isFrozen(settings), true);
  assert.equal(await verifyPassword("first-test-password", settings.accounts[0].passwordHash), true);
  assert.equal(await verifyPassword("wrong", settings.accounts[0].passwordHash), false);
  for (const invalid of [
    null, [], { accounts: [] }, { ...settings, accounts: [...settings.accounts, settings.accounts[0]] },
    { ...settings, accounts: [settings.accounts[0], settings.accounts[0]] },
    { ...settings, accounts: [{ ...settings.accounts[0], password: "plaintext" }, settings.accounts[1]] },
    { ...settings, accounts: [{ ...settings.accounts[0], passwordHash: "plaintext" }, settings.accounts[1]] },
    { ...settings, accounts: [{ ...settings.accounts[0], phone: { $ne: "" } }, settings.accounts[1]] },
  ]) assert.throws(() => parseDuoCredentials(invalid), /Cấu hình hai tài khoản/);
  for (const hash of ["scrypt:a:bb", "scrypt:" + "0".repeat(32) + ":aa", "scrypt:" + "0".repeat(32) + ":" + "0".repeat(128) + ":extra"])
    assert.equal(await verifyPassword("test", hash), false);
  const directory = await mkdtemp(join(tmpdir(), "ielts-duo-auth-"));
  const file = join(directory, "credentials.json");
  try {
    await writeFile(file, JSON.stringify(settings), { mode: 0o600 });
    assert.deepEqual(loadDuoCredentials({ credentialsFile: file, accountsJson: "" }), settings);
    assert.deepEqual(loadDuoCredentials({ credentialsFile: "", accountsJson: JSON.stringify(settings) }), settings);
    assert.throws(() => loadDuoCredentials({ credentialsFile: file, accountsJson: JSON.stringify(settings) }));
    assert.throws(() => loadDuoCredentials({ credentialsFile: "", accountsJson: "" }));
    assert.throws(() => loadDuoCredentials({ credentialsFile: "relative/path", accountsJson: "" }));
    await chmod(file, 0o644);
    assert.throws(() => loadDuoCredentials({ credentialsFile: file, accountsJson: "" }));
    await chmod(file, 0o600);
    const alias = join(directory, "alias.json");
    await symlink(file, alias);
    assert.throws(() => loadDuoCredentials({ credentialsFile: alias, accountsJson: "" }));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("phone login normalization is narrow and never coerces JSON query objects", () => {
  assert.equal(normalizeDuoPhone("0390 000 001"), "0390000001");
  assert.equal(normalizeDuoPhone("+84 390 000 001"), "0390000001");
  for (const input of [null, undefined, 390000001, { $ne: "" }, "0390000001extra", "0390000001\nignored", "0000000000"])
    assert.equal(normalizeDuoPhone(input), null);
});

test("Mongo duo provisioning preserves owners and all learning data; only fixed phones and fresh bound sessions authenticate", { timeout: 60_000 }, async () => {
  const databaseName = `ielts_duo_auth_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(databaseName, /^ielts_duo_auth_test_[a-f0-9]{32}$/);
  const database = await connectDatabase(process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017", databaseName);
  const settings = await fixture();
  const legacyA: UserRecord = { ...initialProfile({ name: "Earlier synthetic name", email: "existing-person@example.invalid", targetBand: 6.5, testType: "general" }, "existing-owned-learner"), _id: "existing-owned-learner", phone: settings.accounts[0].phone, passwordHash: await hashPassword("older-private-password"), registrationSlot: 1, currentBand: 4.5, cefr: "B1", selfAssessment: { reading: 5 }, dailyMinutes: 30 };
  const legacyB: UserRecord = { ...initialProfile({ name: "Third synthetic learner", email: "third-person@example.invalid", targetBand: 7, testType: "academic" }, "legacy-third-learner"), _id: "legacy-third-learner", passwordHash: await hashPassword("third-private-password"), registrationSlot: 2 };
  const serialize = (value: unknown) => JSON.stringify(BSON.EJSON.serialize(value, { relaxed: false }));
  let server: ReturnType<ReturnType<typeof express>["listen"]> | undefined;
  try {
    await database.users.insertMany([legacyA, legacyB]);
    const legacyToken = randomUUID();
    await database.sessions.insertOne({ _id: hashToken(legacyToken), userId: legacyA._id, createdAt: new Date(), expiresAt: new Date(Date.now() + 60_000) });
    const collections = ["attempts", "cards", "placements", "plans", "audio", "recordings.files", "recordings.chunks", "content", "vocabulary", "placementItems", "sessions"];
    for (const name of collections.filter((item) => item !== "sessions"))
      await database.db.collection<{ _id: string; userId: string; payload: string; state: { placed: number; completed: boolean } }>(name).insertOne({ _id: `preserved-${name}`, userId: legacyA._id, payload: `Synthetic private ${name} data`, state: { placed: 4.5, completed: true } });
    const before = new Map(await Promise.all(collections.map(async (name) => [name, serialize(await database.db.collection(name).find().sort({ _id: 1 }).toArray())] as const)));
    const thirdBefore = serialize(await database.users.findOne({ _id: legacyB._id }));
    const provisioned = await provisionDuoAccounts(database, settings);
    assert.equal(provisioned.length, 2);
    assert.equal(provisioned[0].id, legacyA.id);
    assert.equal(provisioned[1].id, `${settings.duoId}-wife`);
    for (const property of ["email", "id", "registrationSlot", "currentBand", "testType", "dailyMinutes", "createdAt", "selfAssessment"] as const)
      assert.deepEqual(provisioned[0][property], legacyA[property], `preserve ${property}`);
    assert.equal(provisioned[0].name, settings.accounts[0].name);
    assert.equal(provisioned[0].targetBand, 8);
    assert.equal(provisioned[1].targetBand, 8);
    assert.equal(provisioned[1].registrationSlot, undefined);
    assert.equal(await database.users.countDocuments(), 3);
    const firstProvision = serialize(await database.users.find().sort({ _id: 1 }).toArray());
    await Promise.all([provisionDuoAccounts(database, settings), provisionDuoAccounts(database, settings)]);
    assert.equal(serialize(await database.users.find().sort({ _id: 1 }).toArray()), firstProvision);
    assert.equal(serialize(await database.users.findOne({ _id: legacyB._id })), thirdBefore);
    for (const [name, snapshot] of before) assert.equal(serialize(await database.db.collection(name).find().sort({ _id: 1 }).toArray()), snapshot, `preserve ${name}`);
    assert.equal((await loginDuo(database, settings, { phone: settings.accounts[0].phone, password: "first-test-password" }))._id, legacyA._id);
    assert.equal((await loginDuo(database, settings, { phone: "+84390000002", password: "second-test-password" })).duoRole, "wife");
    for (const input of [
      { phone: settings.accounts[0].phone, password: "wrong" },
      { phone: "0390000003", password: "third-private-password" },
      { phone: { $ne: "" }, password: "first-test-password" },
      { email: legacyA.email, password: "first-test-password" },
    ]) await assert.rejects(loginDuo(database, settings, input), /Số điện thoại hoặc mật khẩu/);

    const app = express();
    app.use(cookieParser(), attachLearner(database, { duo: settings }));
    app.get("/identity", (request, response) => response.json({ userId: (request as AuthenticatedRequest).learner?.id ?? null }));
    app.post("/bound-session", async (_request, response) => { await createSession(database, response, legacyA.id, false, { duo: settings }); response.json({ ok: true }); });
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const identity = async (token: string) => (await (await fetch(`${origin}/identity`, { headers: { Cookie: `${COOKIE_NAME}=${token}` } })).json() as { userId: string | null }).userId;
    assert.equal(await identity(legacyToken), null, "a pre-migration session is not allowed after identity binding");
    await assert.rejects(createSession(database, {} as Response, legacyB.id, false, { duo: settings }), /không được phép/);
    const login = await fetch(`${origin}/bound-session`, { method: "POST" });
    assert.equal(login.status, 200);
    const token = login.headers.getSetCookie().at(-1)!.split(";")[0].split("=")[1];
    assert.equal(await identity(token), legacyA.id);
    const session = await database.sessions.findOne({ _id: hashToken(token) });
    assert.equal(session?.duoCredentialVersion, duoCredentialVersion(settings, settings.accounts[0]));
    const rotated = parseDuoCredentials({ ...settings, accounts: [{ ...settings.accounts[0], passwordHash: await hashPassword("changed-private-password") }, settings.accounts[1]] });
    await provisionDuoAccounts(database, rotated);
    assert.equal(await identity(token), null, "a session for an older credential version is rejected");
    await provisionDuoAccounts(database, settings);
    // A conflict in the second role aborts before the first identity is changed.
    const collision = parseDuoCredentials({ ...settings, accounts: [{ ...settings.accounts[0], name: "Must not be written" }, { ...settings.accounts[1], phone: settings.accounts[0].phone.slice(0, -1) + "4" }] });
    await assert.rejects(provisionDuoAccounts(database, collision), /danh tính khác/);
    assert.equal((await database.users.findOne({ _id: legacyA.id }))?.name, settings.accounts[0].name);
  } finally {
    if (server) await new Promise<void>((resolve, reject) => server!.close((error) => error ? reject(error) : resolve()));
    assert.match(database.db.databaseName, /^ielts_duo_auth_test_[a-f0-9]{32}$/);
    await database.db.dropDatabase();
    await database.client.close();
  }
});
