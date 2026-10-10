import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { BSON, Binary, Decimal128, GridFSBucket, Long, MongoClient, ObjectId, type Db } from "mongodb";
import { hashPassword, initialProfile, verifyPassword } from "../server/auth";
import { parseDuoCredentials, type DuoCredentialSettings } from "../server/duo-auth";
import { inspectBankReset, resetBank, verifyBankReset, type ReplacementBank } from "../server/bank-reset";
import type { UserRecord } from "../server/storage";
import type { StoredContent } from "../shared/types";

// Every native test creates, reads and drops only its own unguessable database.
// Do not inherit MONGODB_URI, provision application users, or seed the real bank.
const ownedDatabasePattern = /^ielts_reset_test_\d+_[a-f0-9]{32}$/;
const publicNames = ["content", "vocabulary", "placementItems"] as const;
const privateNames = [
  "sessions", "attempts", "cards", "placements", "plans", "audio",
  "duo_learning_paths", "duo_placement_results", "duo_assessments", "duo_promotion_rooms",
  "custom_teacher_notes", "custom_imported_bank",
] as const;
const canonical = (value: unknown): string => {
  const sorted = (v: unknown): unknown => Array.isArray(v) ? v.map(sorted)
    : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, sorted(x)])) : v;
  return JSON.stringify(sorted(BSON.EJSON.serialize(value, { relaxed: false })));
};
const checksum = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

function freshBank(): ReplacementBank {
  const base: StoredContent = {
    id: "fresh-synthetic-reading-lesson", title: "Synthetic boat timetable", description: "A controlled reset fixture.",
    skill: "reading", topic: "Synthetic transport", band: 4.5, cefr: "B1", testType: "both", durationMinutes: 5,
    format: "lesson", sections: [{ id: "fresh-synthetic-reading-section", title: "Timetable", text: "The first boat leaves at nine." }],
    questions: [{ id: "fresh-synthetic-reading-question", number: 1, type: "choice", questionType: "multiple-choice",
      sectionIndex: 0, prompt: "When does the first boat leave?", options: ["Nine", "Ten", "Eleven"], answer: "Nine",
      subskill: "detail", explanation: "The timetable gives nine.", evidence: "The first boat leaves at nine." }],
    vocabularyIds: ["fresh-synthetic-vocabulary"], tags: ["controlled-test"], source: "authored", quality: "authored-unreviewed",
    createdAt: "2026-10-11T00:00:00.000Z", objectives: undefined,
  };
  const mock: StoredContent = {
    ...base, id: "fresh-synthetic-reading-mock", title: "Synthetic full reading mock", format: "full-mock",
    durationMinutes: 60,
    questions: Array.from({ length: 40 }, (_, index) => ({ ...base.questions[0],
      id: `fresh-synthetic-mock-q-${index + 1}`, number: index + 1,
    })),
  };
  return {
    version: "fresh-synthetic-reset", content: [base, mock],
    vocabulary: [{ id: "fresh-synthetic-vocabulary", word: "timetable", meaning: "Controlled schedule meaning",
      definition: "A list of scheduled times.", partOfSpeech: "noun", ipa: "/ˈtaɪmteɪbəl/", cefr: "B1", topic: "transport",
      collocations: ["consult a timetable"], examples: ["They checked the timetable before leaving."], family: [],
      commonError: "Do not confuse the schedule with the duration.", synonyms: ["schedule"], register: "neutral" }],
    placementItems: [{ id: "fresh-synthetic-placement", skill: "reading", text: "The synthetic boat leaves at nine.",
      question: "What time does it leave?", options: ["Nine", "Ten", "Eleven", "Twelve"], answer: "Nine",
      explanation: "The sentence states nine.", band: 4.5, cefr: "B1", difficulty: 0.2, subskill: "detail" }],
  };
}

const credentialsPromise: Promise<DuoCredentialSettings> = (async () => parseDuoCredentials({
  duoId: "synthetic-reset-duo", accounts: [
    { role: "husband", name: "Synthetic reset learner A", phone: "0390000081", passwordHash: await hashPassword("synthetic-reset-password-a") },
    { role: "wife", name: "Synthetic reset learner B", phone: "0390000082", passwordHash: await hashPassword("synthetic-reset-password-b") },
  ],
}))();

interface Fixture {
  client: MongoClient; db: Db; settings: DuoCredentialSettings; bank: ReplacementBank;
  users: UserRecord[]; directory: string; backupDirectory: string;
  options: { expectedDatabase: string; backupDirectory: string; appOffline: boolean; testDatabase: boolean };
  close: () => Promise<void>;
}
async function fixture(): Promise<Fixture> {
  const name = `ielts_reset_test_${process.pid}_${randomBytes(16).toString("hex")}`;
  assert.match(name, ownedDatabasePattern);
  const client = new MongoClient("mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000, maxPoolSize: 2 });
  await client.connect();
  const db = client.db(name);
  const directory = await mkdtemp(join(tmpdir(), "ielts-reset-native-"));
  const backupDirectory = join(directory, "private-backup");
  const settings = await credentialsPromise;
  const users: UserRecord[] = settings.accounts.map((account, index) => {
    const id = `synthetic-retained-${account.role}`;
    return { ...initialProfile({ name: account.name, email: `${account.role}@reset.invalid`, targetBand: 7,
      testType: "general", weeklyMinutes: 900, dailyMinutes: 120, examDate: "2027-06-01",
      selfAssessment: { reading: 6, listening: 5.5, writing: 5, speaking: 5.5 } }, id),
      _id: id, phone: account.phone, duoRole: account.role, duoId: settings.duoId, passwordHash: account.passwordHash,
      registrationSlot: index + 1, currentBand: 6, personalEstimatedBand: 6.5, cefr: "B2", createdAt: "2026-01-02T03:04:05.000Z" };
  });
  const bank = freshBank();
  const close = async () => {
    assert.equal(db.databaseName, name);
    assert.match(db.databaseName, ownedDatabasePattern);
    try { await db.dropDatabase(); } finally {
      await client.close();
      await rm(directory, { recursive: true, force: true });
    }
  };
  try {
    await db.collection<UserRecord>("users").insertMany([...users, {
      ...initialProfile({ name: "Synthetic legacy third learner", email: "third@reset.invalid", targetBand: 6, testType: "academic" }, "synthetic-third"),
      _id: "synthetic-third", passwordHash: await hashPassword("synthetic-third-password"),
    }]);
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    for (const name of [...publicNames, ...privateNames]) {
      await db.collection<{ _id: string; userId: string; payload: { old: boolean; score: number } }>(name)
        .insertOne({ _id: `old-${name}`, userId: users[0]._id, payload: { old: true, score: 73 } });
      await db.collection(name).createIndex({ userId: 1 }, { name: "synthetic_owner" });
    }
    await db.createCollection("custom_bson_records", {
      validator: { $jsonSchema: { bsonType: "object", required: ["marker"] } }, validationLevel: "moderate",
    });
    await db.collection("custom_bson_records").insertOne({
      marker: "synthetic-bson", created: new Date("2025-05-06T07:08:09.123Z"), objectId: new ObjectId("0123456789abcdef01234567"),
      exactLargeInteger: Long.fromString("9007199254740993"), decimal: Decimal128.fromString("1234.56700"),
      binary: new Binary(Buffer.from([0, 255, 13, 10, 128, 2]), 128), nested: { values: ["one", null, 1.5], trueValue: true },
    });
    const bucket = new GridFSBucket(db, { bucketName: "recordings", chunkSizeBytes: 8 });
    const upload = bucket.openUploadStream("synthetic-private-answer.webm", { metadata: { userId: users[1]._id, purpose: "test only" } });
    const completed = once(upload, "finish");
    upload.end(Buffer.from("synthetic private recording bytes\0\xff", "utf8"));
    await completed;
    // Empty collections and their definitions must survive a reset too.
    await db.createCollection("custom_empty_collection");
    return { client, db, settings, bank, users, directory, backupDirectory,
      options: { expectedDatabase: name, backupDirectory, appOffline: true, testDatabase: true }, close };
  } catch (error) { await close(); throw error; }
}

async function snapshot(db: Db) {
  assert.match(db.databaseName, ownedDatabasePattern);
  const result: Record<string, { documents: string; metadata: string }> = {};
  for (const definition of await db.listCollections({}, { nameOnly: false }).toArray()) {
    result[definition.name] = {
      documents: canonical(await db.collection(definition.name).find().sort({ _id: 1 }).toArray()),
      metadata: canonical({ definition, indexes: await db.collection(definition.name).listIndexes().toArray() }),
    };
  }
  return result;
}
async function absent(path: string) {
  await assert.rejects(stat(path), (error: unknown) => !!error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}

test("reset inspection is read-only and reports every collection and the two retained IDs", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    const report = await inspectBankReset(f.db, f.settings, f.bank);
    assert.equal(report.database, f.db.databaseName);
    assert.deepEqual(report.retainedAccountIds, f.users.map(x => x._id));
    assert.equal(report.counts.users, 3);
    for (const name of [...publicNames, ...privateNames, "recordings.files", "recordings.chunks", "custom_bson_records"])
      assert.ok(report.counts[name] > 0, `inspection includes ${name}`);
    assert.equal(report.counts.custom_empty_collection, 0);
    assert.deepEqual(report.replacement, { version: f.bank.version, content: 2, vocabulary: 1, placementItems: 1 });
    assert.deepEqual(await snapshot(f.db), before);
    await absent(f.backupDirectory);
  } finally { await f.close(); }
});

test("native reset replaces the whole bank, clears custom/private/GridFS data, and preserves exact account identity and collection definitions", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    const result = await resetBank(f.db, f.settings, f.bank, f.options);
    assert.equal(result.status, "verified");
    assert.equal(result.retainedAccounts, 2);
    assert.equal(result.lessons, 1);
    assert.equal(result.mocks, 1);
    assert.equal(result.privateLearningDataEmpty, true);
    const after = await snapshot(f.db);
    assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort(), "all existing collection definitions survive");
    for (const name of Object.keys(before)) assert.equal(after[name].metadata, before[name].metadata, `definitions and indexes preserved for ${name}`);
    for (const name of Object.keys(after).filter(name => name !== "users" && !publicNames.includes(name as typeof publicNames[number])))
      assert.equal(await f.db.collection(name).countDocuments(), 0, `cleared ${name}`);
    for (const name of publicNames) assert.deepEqual(
      (await f.db.collection(name).find().sort({ _id: 1 }).toArray()).map(x => x._id), f.bank[name].map(x => x.id).sort(),
    );
    assert.equal(await f.db.collection("users").countDocuments(), 2);
    assert.equal(await f.db.collection<{ _id: string }>("users").findOne({ _id: "synthetic-third" }), null);
    for (const old of f.users) {
      const kept = await f.db.collection<UserRecord>("users").findOne({ _id: old._id });
      assert.ok(kept);
      for (const key of ["_id", "id", "name", "email", "phone", "duoId", "duoRole", "passwordHash", "createdAt"] as const)
        assert.equal(kept[key], old[key], `retained identity ${key}`);
      for (const key of ["currentBand", "personalEstimatedBand", "cefr", "examDate"] as const) assert.equal(kept[key], null);
      assert.equal(kept.selfAssessment, undefined);
      assert.equal(kept.registrationSlot, undefined);
      assert.equal(kept.targetBand, 8);
      assert.equal(kept.testType, "academic");
      assert.equal(kept.dailyMinutes, 45);
      assert.equal(kept.weeklyMinutes, 300);
      assert.equal(kept.demo, false);
      assert.equal(await verifyPassword(old.duoRole === "husband" ? "synthetic-reset-password-a" : "synthetic-reset-password-b", kept.passwordHash!), true);
    }
    assert.equal((await verifyBankReset(f.db, f.settings, f.bank)).status, "verified");
  } finally { await f.close(); }
});

test("backup is complete private canonical EJSON with faithful BSON/GridFS bytes, indexes, options and verified file checksums", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    await resetBank(f.db, f.settings, f.bank, f.options);
    const receipt = JSON.parse(await readFile(join(f.backupDirectory, "receipt.json"), "utf8")) as {
      database: string; state: string; retainedAccountIds: string[];
      backups: Record<string, { file: string; count: number; sha256: string; metadataFile: string; metadataSha256: string }>;
    };
    assert.equal(receipt.database, f.db.databaseName);
    assert.equal(receipt.state, "complete");
    assert.deepEqual(receipt.retainedAccountIds, f.users.map(x => x._id));
    assert.deepEqual(Object.keys(receipt.backups).sort(), Object.keys(before).sort());
    assert.equal((await stat(f.backupDirectory)).mode & 0o777, 0o700);
    for (const [name, entry] of Object.entries(receipt.backups)) {
      const bytes = await readFile(join(f.backupDirectory, entry.file));
      assert.equal(checksum(bytes), entry.sha256, `document SHA for ${name}`);
      const lines = bytes.toString("utf8").split("\n").filter(Boolean);
      assert.equal(lines.length, entry.count);
      const recovered = lines.map(line => BSON.EJSON.parse(line, { relaxed: false }));
      assert.equal(canonical(recovered), before[name].documents, `lossless document backup for ${name}`);
      const metadata = await readFile(join(f.backupDirectory, entry.metadataFile));
      assert.equal(checksum(metadata), entry.metadataSha256, `metadata SHA for ${name}`);
      assert.equal(canonical(BSON.EJSON.parse(metadata.toString("utf8"), { relaxed: false })), before[name].metadata, `indexes/options backup for ${name}`);
    }
    for (const file of await readdir(f.backupDirectory)) assert.equal((await stat(join(f.backupDirectory, file))).mode & 0o777, 0o600, `private mode for ${file}`);
    const bsonFile = receipt.backups.custom_bson_records.file;
    const recovered = BSON.EJSON.parse((await readFile(join(f.backupDirectory, bsonFile), "utf8")).trim(), { relaxed: false });
    assert.ok(recovered.objectId instanceof ObjectId);
    assert.ok(recovered.created instanceof Date);
    assert.ok(recovered.exactLargeInteger instanceof Long);
    assert.equal(recovered.exactLargeInteger.toString(), "9007199254740993");
    assert.ok(recovered.decimal instanceof Decimal128);
    assert.equal(recovered.decimal.toString(), "1234.56700");
    assert.ok(recovered.binary instanceof Binary);
    assert.equal(recovered.binary.sub_type, 128);
    assert.deepEqual(Buffer.from(recovered.binary.buffer), Buffer.from([0, 255, 13, 10, 128, 2]));
    const chunkLines = (await readFile(join(f.backupDirectory, receipt.backups["recordings.chunks"].file), "utf8")).trim().split("\n");
    assert.ok(chunkLines.length > 1, "real GridFS stream produces multiple backed-up chunks");
    const chunkDocs = chunkLines.map(line => BSON.EJSON.parse(line, { relaxed: false }));
    chunkDocs.sort((a, b) => Number(a.n) - Number(b.n));
    assert.deepEqual(Buffer.concat(chunkDocs.map(x => Buffer.from(x.data.buffer))), Buffer.from("synthetic private recording bytes\0\xff", "utf8"));
  } finally { await f.close(); }
});

test("wrong scope, missing test opt-in, online app and relative backups abort before filesystem or database mutations", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    for (const change of [
      { expectedDatabase: `ielts_reset_test_${process.pid}_${randomBytes(16).toString("hex")}` },
      { expectedDatabase: "other_project" }, { testDatabase: false }, { appOffline: false }, { backupDirectory: "relative-backup" },
    ]) {
      await assert.rejects(resetBank(f.db, f.settings, f.bank, { ...f.options, ...change }), /exact IELTS database|offline app|absolute private backup/);
      assert.deepEqual(await snapshot(f.db), before);
      await absent(f.backupDirectory);
    }
  } finally { await f.close(); }
});

test("invalid, incomplete, duplicate or dangling-reference replacement banks abort before any deletion", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    const badBanks: ReplacementBank[] = [
      { ...f.bank, version: "legacy-bank" }, { ...f.bank, content: [] }, { ...f.bank, vocabulary: [] }, { ...f.bank, placementItems: [] },
      { ...f.bank, content: [f.bank.content[0], f.bank.content[0]] },
      { ...f.bank, vocabulary: [{ ...f.bank.vocabulary[0], id: "old-vocabulary" }] },
      { ...f.bank, content: [{ ...f.bank.content[0], vocabularyIds: ["fresh-missing-vocabulary"] }] },
      { ...f.bank, content: [{ ...f.bank.content[0], questions: [{ ...f.bank.content[0].questions[0], sectionIndex: 100 }] }] },
    ];
    for (const bank of badBanks) {
      await assert.rejects(resetBank(f.db, f.settings, bank, f.options));
      assert.deepEqual(await snapshot(f.db), before);
      await absent(f.backupDirectory);
    }
  } finally { await f.close(); }
});

for (const conflict of ["missing", "duplicate-phone", "wrong-password-hash", "wrong-name", "wrong-role", "wrong-id"] as const) {
  test(`conflicting retained identity (${conflict}) aborts before backing up or clearing any data`, { timeout: 30_000 }, async () => {
    const f = await fixture();
    try {
      const second = f.users[1];
      const users = f.db.collection<UserRecord>("users");
      if (conflict === "missing") await users.deleteOne({ _id: second._id });
      else if (conflict === "duplicate-phone") await users.insertOne({ ...second, _id: "synthetic-phone-collision", id: "synthetic-phone-collision", email: "collision@reset.invalid" });
      else await users.updateOne({ _id: second._id }, { $set: {
        ...(conflict === "wrong-password-hash" ? { passwordHash: await hashPassword("synthetic-incorrect-password") } : {}),
        ...(conflict === "wrong-name" ? { name: "Synthetic different identity" } : {}),
        ...(conflict === "wrong-role" ? { duoRole: "husband" as const } : {}),
        ...(conflict === "wrong-id" ? { id: "synthetic-mismatched-id" } : {}),
      } });
      const before = await snapshot(f.db);
      await assert.rejects(resetBank(f.db, f.settings, f.bank, f.options), /existing configured Duo identities|identities overlap/);
      assert.deepEqual(await snapshot(f.db), before);
      await absent(f.backupDirectory);
    } finally { await f.close(); }
  });
}

for (const change of ["document", "new-collection", "new-index", "account"] as const) {
  test(`a concurrent ${change} change during backup is detected before reset mutations`, { timeout: 30_000 }, async () => {
    const f = await fixture();
    try {
      let afterExternalWrite: Awaited<ReturnType<typeof snapshot>> | undefined;
      await assert.rejects(resetBank(f.db, f.settings, f.bank, { ...f.options, beforeMutation: async () => {
        if (change === "document") await f.db.collection<{ _id: string; payload: unknown }>("attempts").updateOne({ _id: "old-attempts" }, { $set: { payload: { changed: true } } });
        if (change === "new-collection") await f.db.collection<{ _id: string; value: string }>("concurrent_new_private_records").insertOne({ _id: "synthetic-new-write", value: "must survive aborted reset" });
        if (change === "new-index") await f.db.collection("attempts").createIndex({ concurrentField: 1 }, { name: "concurrent_new_index" });
        if (change === "account") await f.db.collection<UserRecord>("users").updateOne({ _id: f.users[0]._id }, { $set: { dailyMinutes: 99 } });
        afterExternalWrite = await snapshot(f.db);
      } }), /changed during backup/);
      assert.ok(afterExternalWrite);
      assert.deepEqual(await snapshot(f.db), afterExternalWrite, "the concurrent write survives and reset deleted nothing");
      const receipt = JSON.parse(await readFile(join(f.backupDirectory, "receipt.json"), "utf8"));
      assert.equal(receipt.state, "backed-up");
      assert.equal(await f.db.collection("users").countDocuments(), 3);
      assert.equal(await f.db.collection("recordings.files").countDocuments(), 1);
    } finally { await f.close(); }
  });
}

test("views are rejected rather than partially clearing a mixed database", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    await f.db.createCollection("synthetic_attempt_view", { viewOn: "attempts", pipeline: [] });
    // snapshot intentionally excludes the view: listIndexes is invalid on views.
    const before = canonical(await f.db.collection("attempts").find().toArray());
    await assert.rejects(resetBank(f.db, f.settings, f.bank, f.options), /Unexpected view\/system collection/);
    assert.equal(canonical(await f.db.collection("attempts").find().toArray()), before);
    assert.equal(await f.db.collection("users").countDocuments(), 3);
    await absent(f.backupDirectory);
  } finally { await f.close(); }
});

test("backup I/O failure and an existing backup directory leave the entire database unchanged", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    const before = await snapshot(f.db);
    const obstruction = join(f.directory, "not-a-directory");
    await writeFile(obstruction, "synthetic backup obstruction", { mode: 0o600 });
    await assert.rejects(resetBank(f.db, f.settings, f.bank, { ...f.options, backupDirectory: join(obstruction, "child") }));
    assert.deepEqual(await snapshot(f.db), before);
    await resetBank(f.db, f.settings, f.bank, { ...f.options, beforeMutation: async () => { throw Error("synthetic stop after backup"); } }).then(
      () => assert.fail("the deliberate pre-mutation failure must abort"), error => assert.match(String(error), /synthetic stop/),
    );
    assert.deepEqual(await snapshot(f.db), before);
    const filesBefore = Object.fromEntries(await Promise.all((await readdir(f.backupDirectory)).map(async file => [file, checksum(await readFile(join(f.backupDirectory, file)))])));
    await assert.rejects(resetBank(f.db, f.settings, f.bank, f.options));
    assert.deepEqual(await snapshot(f.db), before);
    const filesAfter = Object.fromEntries(await Promise.all((await readdir(f.backupDirectory)).map(async file => [file, checksum(await readFile(join(f.backupDirectory, file)))])));
    assert.deepEqual(filesAfter, filesBefore, "a second invocation never overwrites a prior backup");
  } finally { await f.close(); }
});

for (const fileKind of ["file", "metadataFile"] as const) {
  test(`corruption of a ${fileKind} backup after initial verification aborts before deletion`, { timeout: 30_000 }, async () => {
    const f = await fixture();
    try {
      const before = await snapshot(f.db);
      await assert.rejects(resetBank(f.db, f.settings, f.bank, { ...f.options, beforeMutation: async () => {
        const receipt = JSON.parse(await readFile(join(f.backupDirectory, "receipt.json"), "utf8"));
        await writeFile(join(f.backupDirectory, receipt.backups.attempts[fileKind]), "synthetic corrupted backup", { mode: 0o600 });
      } }), /Backup file verification failed|backup.*changed|Backup.*changed|Database changed during backup/);
      assert.deepEqual(await snapshot(f.db), before);
      assert.equal(JSON.parse(await readFile(join(f.backupDirectory, "receipt.json"), "utf8")).state, "backed-up");
    } finally { await f.close(); }
  });
}

test("verification rejects old private/GridFS residue, edited public content and a reintroduced third learner without making writes", { timeout: 30_000 }, async () => {
  const f = await fixture();
  try {
    await resetBank(f.db, f.settings, f.bank, f.options);
    const clean = await snapshot(f.db);
    await f.db.collection<{ _id: string; leaked: boolean }>("custom_teacher_notes").insertOne({ _id: "synthetic-old-residue", leaked: true });
    const residue = await snapshot(f.db);
    await assert.rejects(verifyBankReset(f.db, f.settings, f.bank), /Old learning data remains/);
    assert.deepEqual(await snapshot(f.db), residue);
    await f.db.collection("custom_teacher_notes").deleteMany({});
    await f.db.collection("recordings.chunks").insertOne({ files_id: new ObjectId(), n: 0, data: new Binary(Buffer.from("synthetic orphaned audio")) });
    const gridfs = await snapshot(f.db);
    await assert.rejects(verifyBankReset(f.db, f.settings, f.bank), /Old learning data remains/);
    assert.deepEqual(await snapshot(f.db), gridfs);
    await f.db.collection("recordings.chunks").deleteMany({});
    await f.db.collection<{ _id: string; title: string }>("content").updateOne({ _id: f.bank.content[0].id }, { $set: { title: "Synthetic incorrect replacement" } });
    const edited = await snapshot(f.db);
    await assert.rejects(verifyBankReset(f.db, f.settings, f.bank), /Replacement bank differs/);
    assert.deepEqual(await snapshot(f.db), edited);
    await f.db.collection<{ _id: string; title: string }>("content").updateOne({ _id: f.bank.content[0].id }, { $set: { title: f.bank.content[0].title } });
    await f.db.collection<UserRecord>("users").insertOne({ ...f.users[0], _id: "synthetic-reintroduced-third", id: "synthetic-reintroduced-third", email: "returned-third@reset.invalid", phone: "0390000083" });
    const third = await snapshot(f.db);
    await assert.rejects(verifyBankReset(f.db, f.settings, f.bank), /Account identity\/reset verification failed/);
    assert.deepEqual(await snapshot(f.db), third);
    await f.db.collection<UserRecord>("users").deleteOne({ _id: "synthetic-reintroduced-third" });
    assert.deepEqual(await snapshot(f.db), clean);
  } finally { await f.close(); }
});
