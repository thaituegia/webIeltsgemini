import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import { BSON } from "mongodb";
import { auditBand8, currentBand8Bank, jsonHash, v3BankAnchors, visualSignature } from "../scripts/audit-band8";
import { contentBank, vocabularyBank, placementBank, v3ContentBank, v3VocabularyBank, v3PlacementBank } from "../server/data/index";
import { connectDatabase, seedDatabase, type Database } from "../server/storage";
import type { ChartVisual, SpatialVisual } from "../shared/types";

const publicCollections = ["content", "vocabulary", "placementItems"] as const;
type StringDocument = { _id: string; [key: string]: unknown };
const jsonCopy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
function orderKeys(value: unknown): unknown {
  return Array.isArray(value) ? value.map(orderKeys) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, orderKeys(item)])) : value;
}
const documentHash = (value: unknown): string => createHash("sha256").update(JSON.stringify(orderKeys(BSON.EJSON.serialize(value, { relaxed: false })))).digest("hex");

test("visual duplication checks preserve negative measurements and ignore cosmetic identity and property ordering", () => {
  const negative: ChartVisual = { id: "synthetic-negative", type: "bar", title: "Synthetic net change", unit: "units", series: ["Net change"], rows: [{ label: "District A", values: [-5] }] };
  const positive: ChartVisual = { ...negative, id: "synthetic-positive", rows: [{ label: "District A", values: [5] }] };
  assert.notEqual(visualSignature(negative), visualSignature(positive));
  const reordered: ChartVisual = { rows: [{ values: [-5], label: "District A" }], series: ["Net change"], unit: "units", title: "Different cosmetic title", type: "bar", id: "synthetic-reordered" };
  assert.equal(visualSignature(negative), visualSignature(reordered));
  const first: SpatialVisual = { id: "first-diagram", type: "process", title: "First title", width: 400, height: 180, areas: [{ id: "first-background", x: 0, y: 0, width: 400, height: 180, fill: "#eeeeee" }], labels: [], nodes: [{ id: "first-a", x: 10, y: 40, width: 120, height: 80, text: "Collect samples" }, { id: "first-b", x: 200, y: 40, width: 120, height: 80, questionNumber: 12 }], connections: [{ from: "first-a", to: "first-b" }] };
  const second: SpatialVisual = { connections: [{ from: "second-a", to: "second-b" }], nodes: [{ text: "Collect samples", height: 80, width: 120, y: 40, x: 10, id: "second-a" }, { questionNumber: 28, height: 80, width: 120, y: 40, x: 200, id: "second-b" }], areas: [{ fill: "#dddddd", height: 180, width: 400, y: 0, x: 0, id: "second-background" }], labels: [], height: 180, width: 400, title: "Second title", type: "process", id: "second-diagram" };
  assert.equal(visualSignature(first), visualSignature(second), "Re-identifying or renumbering identical blanks bypassed the visual duplicate check");
});

test("v4 retains every pre-extension source byte and passes the global advanced corpus audit", { timeout: 60_000 }, () => {
  assert.deepEqual([contentBank.length, vocabularyBank.length, placementBank.length], [628, 744, 640]);
  assert.equal(jsonHash(v3ContentBank), v3BankAnchors.content.sha256);
  assert.equal(jsonHash(v3VocabularyBank), v3BankAnchors.vocabulary.sha256);
  assert.equal(jsonHash(v3PlacementBank), v3BankAnchors.placementItems.sha256);
  const report = auditBand8();
  assert.equal(report.status, "passed", report.issues.join("\n"));
  assert.deepEqual(report.counts, { lessons: 544, mocks: 84, content: 628, vocabulary: 744, placement: 640 });
  assert.deepEqual(report.additions, { content: 76, vocabulary: 96, placement: 64 });
  assert.deepEqual(report.duplicateSections, []);
  assert.deepEqual(report.duplicateVisuals, []);
  assert.deepEqual(report.similarities, []);
  assert.ok(report.objectiveQuestionsChecked > 600);
  assert.equal(report.receptiveWorkloads.length, 8);
});

test("global audit rejects altered old content, duplicate new sources, wrong keys and unsupported placement configuration", { timeout: 60_000 }, () => {
  const previousIds = new Set(v3ContentBank.map(item => item.id));
  const newReading = contentBank.find(item => !previousIds.has(item.id) && item.skill === "reading")!;
  const duplicate = jsonCopy(newReading);
  duplicate.sections[0]!.text = v3ContentBank.find(item => item.skill === "reading")!.sections[0]!.text;
  duplicate.questions[0]!.answer = "deliberately-invalid-test-answer";
  const previous = jsonCopy(v3ContentBank[0]!);
  previous.description = "Deliberately changed in an isolated in-memory audit fixture.";
  const newPlacement = placementBank.find(item => item.id.startsWith("placement-v4-band8-"))!;
  const invalidPlacement = { ...newPlacement, difficulty: 100, options: [newPlacement.answer, newPlacement.answer, "duplicate fixture", "fourth fixture"] };
  const report = auditBand8({ ...currentBand8Bank,
    content: contentBank.map(item => item.id === duplicate.id ? duplicate : item.id === previous.id ? previous : item),
    placementItems: placementBank.map(item => item.id === invalidPlacement.id ? invalidPlacement : item) });
  assert.equal(report.status, "failed");
  assert.ok(report.issues.some(issue => issue.includes(`${previous.id}: previous document changed`)));
  assert.ok(report.issues.some(issue => issue.includes(`${duplicate.id}`) && /excessive source overlap/.test(issue)));
  assert.ok(report.issues.some(issue => issue.includes(duplicate.id) && issue.includes("key must match exactly one option")), "An answer key outside its options was not rejected");
  assert.ok(report.issues.some(issue => issue.includes(`${invalidPlacement.id}: invalid advanced placement`)));
  assert.ok(report.issues.some(issue => issue.includes(`${invalidPlacement.id}: placement must have four distinct`)));
  assert.equal(jsonHash(v3ContentBank), v3BankAnchors.content.sha256, "audit fixture mutated source data");
});

async function snapshotPrivate(database: Database) {
  const names = (await database.db.listCollections({}, { nameOnly: true }).toArray()).map(row => row.name).filter(name => !(publicCollections as readonly string[]).includes(name)).sort();
  return Object.fromEntries(await Promise.all(names.map(async name => {
    const rows = await database.db.collection(name).find().sort({ _id: 1 }).toArray();
    return [name, { count: rows.length, sha256: documentHash(rows) }];
  })));
}
async function recordingBytes(database: Database, id: Parameters<Database["recordings"]["openDownloadStream"]>[0]): Promise<Buffer> {
  const chunks: Buffer[] = []; for await (const chunk of database.recordings.openDownloadStream(id)) chunks.push(Buffer.from(chunk)); return Buffer.concat(chunks);
}

test("v4 Mongo seed preserves the entire v3 bank, edited existing IDs, custom records, all private data and recordings across two seeds", { timeout: 90_000 }, async () => {
  const databaseName = `ielts_ai_seed_v4_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(databaseName, /^ielts_ai_seed_v4_test_[a-f0-9]{32}$/);
  // The URI chooses a server only. The explicit random database overrides any
  // production database path in TEST_MONGODB_URI before writes or cleanup.
  const database = await connectDatabase(process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017", databaseName);
  const createdAt = "2026-10-08T00:00:00.000Z";
  const userId = "synthetic-v4-seed-user";
  try {
    assert.equal(database.db.databaseName, databaseName);
    const previousBanks = [v3ContentBank, v3VocabularyBank, v3PlacementBank];
    for (const [index, name] of publicCollections.entries()) {
      const rows = previousBanks[index]!;
      await database.db.collection<StringDocument>(name).insertMany(rows.map(item => ({ ...item, _id: item.id })), { ignoreUndefined: true });
      const original = rows[0]!;
      await database.db.collection<StringDocument>(name).updateOne({ _id: original.id }, { $set: { externalRevision: "Synthetic teacher revision retained during seed.", ...(name === "content" ? { title: "Synthetic revised existing title" } : name === "vocabulary" ? { meaning: "Synthetic revised existing meaning" } : { explanation: "Synthetic revised existing feedback" }) } });
      const customId = `synthetic-v4-custom-${name}`;
      await database.db.collection<StringDocument>(name).insertOne({ ...jsonCopy(original), _id: customId, id: customId, customRevision: "Synthetic external learning material retained during seed." });
    }
    // Realistic private fixtures exercise preserved learner state and BSON
    // types. No auth bootstrap, external provider or real learner DB is used.
    await database.users.insertOne({ _id: userId, id: userId, name: "Synthetic preservation learner", email: "synthetic-v4-seed@example.invalid", passwordHash: "synthetic-fixture-not-a-login-hash", demo: false, registrationSlot: 1, currentBand: 6.5, targetBand: 8, testType: "academic", examDate: null, weeklyMinutes: 280, dailyMinutes: 40, cefr: "B2", createdAt });
    await database.sessions.insertOne({ _id: "synthetic-v4-session", userId, createdAt: new Date(createdAt), expiresAt: new Date(Date.now() + 86_400_000), duoCredentialVersion: "synthetic-v4-credential-version" });
    await database.attempts.insertOne({ _id: "synthetic-v4-attempt", id: "synthetic-v4-attempt", userId, contentId: v3ContentBank[0]!.id, title: "Synthetic retained draft", skill: "reading", mode: "practice", status: "in-progress", startedAt: createdAt, deadlineAt: null, submittedAt: null, durationSeconds: 95, responses: { [v3ContentBank[0]!.questions[0]!.id]: "Synthetic saved response" }, essays: {}, transcript: "Synthetic private transcript.", feedback: null });
    await database.cards.insertOne({ _id: "synthetic-v4-card", id: "synthetic-v4-card", userId, vocabularyId: v3VocabularyBank[0]!.id, word: v3VocabularyBank[0]!.word, meaning: "Synthetic saved meaning", example: "Synthetic saved example.", cefr: "A2", topic: v3VocabularyBank[0]!.topic, difficulty: 6.2, stability: 8.1, retrievability: 0.91, dueAt: createdAt, reps: 5, due: true, savedAt: createdAt, scheduler: "{\"fixture\":true,\"reps\":5}", reviewLog: ["Synthetic retained review"] });
    await database.placements.insertOne({ _id: "synthetic-v4-placement", userId, mode: "deep", total: 24, theta: 1.8, standardError: 0.4, estimatedBand: 6.5, currentQuestionId: v3PlacementBank[0]!.id, answers: [{ questionId: v3PlacementBank[1]!.id, answer: v3PlacementBank[1]!.answer, correct: true }], result: null, startedAt: createdAt });
    await database.plans.insertOne({ _id: "synthetic-v4-plan", id: "synthetic-v4-plan", userId, weekStart: "2026-10-05", targetBand: 8, weeklyMinutes: 280, tasks: [{ id: "synthetic-v4-task", day: "2026-10-07", title: "Synthetic completed prior lesson", kind: "reading", contentId: v3ContentBank[0]!.id, minutes: 25, completed: true, reason: "Synthetic previous plan." }], explanation: "Synthetic private plan retained verbatim." });
    for (const name of ["duo_learning_paths", "duo_placement_results", "duo_assessments", "duo_promotion_rooms"]) await database.db.collection<StringDocument>(name).insertOne({ _id: `synthetic-v4-${name}`, userIds: [userId, "synthetic-partner"], privateFixture: { sharedBand: 6.5, targetBand: 8, revision: 4 }, updatedAt: new Date(createdAt) });
    const recording = Buffer.from(Array.from({ length: 4096 }, (_, i) => (i * 29 + 17) % 256));
    const stream = database.recordings.openUploadStream("synthetic-v4-private-recording.bin", { chunkSizeBytes: 128, metadata: { userId, attemptId: "synthetic-v4-attempt", privateFixture: true } });
    const uploaded = once(stream, "finish"); stream.end(recording); await uploaded;
    await database.audio.insertOne({ _id: "synthetic-v4-audio", userId, attemptId: "synthetic-v4-attempt", fileId: stream.id, mime: "audio/wav", createdAt });
    const privateBefore = await snapshotPrivate(database);
    assert.equal(privateBefore["recordings.chunks"]?.count, 32);
    assert.ok(Object.keys(privateBefore).length >= 13);
    const publicBefore = await Promise.all(publicCollections.map(name => database.db.collection(name).find().sort({ _id: 1 }).toArray()));
    assert.deepEqual(publicBefore.map(rows => rows.length), [553, 649, 577]);
    let firstPublicHashes: string[] | undefined;
    for (let pass = 0; pass < 2; pass++) {
      await seedDatabase(database);
      assert.deepEqual(await snapshotPrivate(database), privateBefore, `Seed ${pass + 1} modified private BSON data`);
      assert.deepEqual(await recordingBytes(database, stream.id), recording, `Seed ${pass + 1} modified recording bytes`);
      const after = await Promise.all(publicCollections.map(name => database.db.collection(name).find().sort({ _id: 1 }).toArray()));
      assert.deepEqual(after.map(rows => rows.length), [629, 745, 641]);
      for (const [index, name] of publicCollections.entries()) {
        const current = new Map(after[index]!.map(row => [String(row._id), row]));
        for (const before of publicBefore[index]!) assert.equal(documentHash(current.get(String(before._id))), documentHash(before), `${name}/${before._id}: old/custom record changed during seed ${pass + 1}`);
        const old = new Set(publicBefore[index]!.map(row => String(row._id)));
        for (const item of [contentBank, vocabularyBank, placementBank][index]!) {
          assert.ok(current.has(item.id), `${name}/${item.id}: missing seeded ID`);
          if (!old.has(item.id)) assert.equal(documentHash(current.get(item.id)), documentHash(jsonCopy({ ...item, _id: item.id })), `${name}/${item.id}: new content differs from the source`);
        }
      }
      const hashes = after.map(documentHash);
      if (pass === 0) firstPublicHashes = hashes; else assert.deepEqual(hashes, firstPublicHashes, "Repeated seed changed a public document or added duplicates");
    }
  } finally {
    try { assert.match(database.db.databaseName, /^ielts_ai_seed_v4_test_[a-f0-9]{32}$/); await database.db.dropDatabase(); } finally { await database.client.close(); }
  }
});
