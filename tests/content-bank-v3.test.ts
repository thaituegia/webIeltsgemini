import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import { BSON } from 'mongodb';
import { sanitizeContent } from '../server/app';
import { contentBank, placementBank, vocabularyBank } from '../server/data/index';
import { readingLessons, listeningLessons, receptiveMocks, placementBank as legacyPlacement } from '../server/data/receptive';
import { grammarLessons, writingLessons, speakingLessons, productiveMocks } from '../server/data/productive';
import { vocabularyBank as legacyVocabulary } from '../server/data/vocabulary';
import { connectDatabase, seedDatabase, type Database, type StoredContentRecord } from '../server/storage';
import { visualAssetSchema, questionBlockSchema } from '../shared/content-visuals';

const privateCollections = ['users', 'sessions', 'attempts', 'cards', 'placements', 'plans', 'audio', 'recordings.files', 'recordings.chunks'] as const;
const legacyContent = [...readingLessons, ...listeningLessons, ...grammarLessons, ...writingLessons, ...speakingLessons, ...receptiveMocks, ...productiveMocks];
const orderKeys = (value: unknown): unknown => Array.isArray(value)
  ? value.map(orderKeys)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => [key, orderKeys(item)]))
    : value;
const documentHash = (value: unknown): string => createHash('sha256').update(JSON.stringify(orderKeys(BSON.EJSON.serialize(value, { relaxed: false })))).digest('hex');
const jsonCopy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

async function snapshotPrivate(database: Database): Promise<Record<string, { count: number; hash: string }>> {
  const snapshot: Record<string, { count: number; hash: string }> = {};
  for (const name of privateCollections) {
    const documents = await database.db.collection(name).find().sort({ _id: 1 }).toArray();
    snapshot[name] = { count: documents.length, hash: documentHash(documents) };
  }
  return snapshot;
}

async function bytesOf(database: Database, fileId: Parameters<Database['recordings']['openDownloadStream']>[0]): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of database.recordings.openDownloadStream(fileId)) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

test('v3 Mongo seed preserves existing learner records and recordings, retains legacy IDs and is idempotent', { timeout: 60_000 }, async () => {
  // The supplied URI selects a server only; an independent random database name
  // is always explicit, even if TEST_MONGODB_URI contains a production db path.
  const databaseName = `ielts_ai_seed_v3_test_${randomUUID().replaceAll('-', '')}`;
  assert.match(databaseName, /^ielts_ai_seed_v3_test_[a-f0-9]{32}$/);
  const database = await connectDatabase(process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017', databaseName);
  assert.equal(database.db.databaseName, databaseName);
  const createdAt = '2026-10-07T11:00:00.000Z';
  const userId = 'synthetic-upgrade-learner';
  const attemptId = 'synthetic-upgrade-attempt';
  try {
    // Populate a pre-upgrade public bank and a complete synthetic learner state.
    // No demo initializer, registration request or real learner database is used.
    await database.content.insertMany(legacyContent.map(item => ({ ...item, _id: item.id })), { ignoreUndefined: true });
    await database.vocabulary.insertMany(legacyVocabulary.map(item => ({ ...item, _id: item.id })), { ignoreUndefined: true });
    await database.placementItems.insertMany(legacyPlacement.map(item => ({ ...item, _id: item.id })), { ignoreUndefined: true });
    const legacyIds = {
      content: (await database.content.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray()).map(item => item._id),
      vocabulary: (await database.vocabulary.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray()).map(item => item._id),
      placementItems: (await database.placementItems.find({}, { projection: { _id: 1 } }).sort({ _id: 1 }).toArray()).map(item => item._id),
    };
    assert.deepEqual(Object.values(legacyIds).map(ids => ids.length), [184, 216, 192]);
    await database.users.insertMany([1, 2].map(slot => ({
      _id: slot === 1 ? userId : `${userId}-second`, id: slot === 1 ? userId : `${userId}-second`,
      name: `Synthetic learner ${slot}`, email: `synthetic-seed-${slot}@example.invalid`, passwordHash: 'synthetic-fixture-not-a-sign-in-hash',
      demo: false, registrationSlot: slot, currentBand: 4.5, targetBand: 6.5, testType: 'academic' as const,
      examDate: null, weeklyMinutes: 210, dailyMinutes: 30, cefr: 'B1' as const, createdAt,
    })));
    await database.sessions.insertOne({ _id: 'synthetic-session', userId, createdAt: new Date(createdAt), expiresAt: new Date(Date.now() + 86_400_000) });
    await database.attempts.insertOne({
      _id: attemptId, id: attemptId, userId, contentId: speakingLessons[0]!.id, title: speakingLessons[0]!.title, skill: 'speaking',
      mode: 'practice', status: 'in-progress', startedAt: createdAt, deadlineAt: null, submittedAt: null, durationSeconds: 83,
      responses: { 'private-draft': 'Synthetic draft that must survive a public-bank update.' }, essays: {},
      transcript: 'Synthetic private speaking transcript.', feedback: null,
    });
    await database.cards.insertOne({
      _id: 'synthetic-card', id: 'synthetic-card', userId, vocabularyId: legacyVocabulary[0]!.id,
      word: legacyVocabulary[0]!.word, meaning: 'Synthetic saved translation', example: 'Synthetic saved example.', cefr: 'A2',
      topic: legacyVocabulary[0]!.topic, difficulty: 5.2, stability: 3.4, retrievability: 0.91, dueAt: createdAt,
      reps: 4, due: true, savedAt: createdAt, scheduler: '{"synthetic":true,"reps":4}', reviewLog: ['synthetic-private-review'],
    });
    await database.placements.insertOne({
      _id: 'synthetic-placement', userId, mode: 'quick', total: 12, theta: -0.25, standardError: 0.6,
      estimatedBand: 4.5, currentQuestionId: legacyPlacement[1]!.id,
      answers: [{ questionId: legacyPlacement[0]!.id, answer: legacyPlacement[0]!.answer, correct: true }], result: null, startedAt: createdAt,
    });
    await database.plans.insertOne({
      _id: 'synthetic-plan', id: 'synthetic-plan', userId, weekStart: '2026-10-05', targetBand: 6.5, weeklyMinutes: 210,
      tasks: [{ id: 'synthetic-task', day: '2026-10-06', title: 'Synthetic completed reading', kind: 'reading', contentId: readingLessons[0]!.id,
        minutes: 20, completed: true, reason: 'Synthetic prior learning plan.' }], explanation: 'Synthetic plan that must remain unchanged.',
    });
    const recording = Buffer.from(Array.from({ length: 1_024 }, (_, index) => (index * 37 + 11) % 256));
    const upload = database.recordings.openUploadStream('synthetic-private-recording.bin', { chunkSizeBytes: 64, metadata: { userId, attemptId, fixture: true } });
    const uploaded = once(upload, 'finish');
    upload.end(recording);
    await uploaded;
    await database.audio.insertOne({ _id: 'synthetic-audio', userId, attemptId, fileId: upload.id, mime: 'audio/wav', createdAt });
    const before = await snapshotPrivate(database);
    assert.deepEqual(Object.fromEntries(Object.entries(before).map(([key, value]) => [key, value.count])), {
      users: 2, sessions: 1, attempts: 1, cards: 1, placements: 1, plans: 1, audio: 1, 'recordings.files': 1, 'recordings.chunks': 16,
    });
    assert.deepEqual(await bytesOf(database, upload.id), recording);

    await seedDatabase(database);
    assert.deepEqual(await snapshotPrivate(database), before, 'first expansion modified a private record or recording metadata/chunk');
    assert.deepEqual(await bytesOf(database, upload.id), recording, 'first expansion changed recording bytes');
    const afterFirst = await Promise.all([
      database.content.find().sort({ _id: 1 }).toArray(), database.vocabulary.find().sort({ _id: 1 }).toArray(), database.placementItems.find().sort({ _id: 1 }).toArray(),
    ]);
    assert.deepEqual(afterFirst.map(rows => rows.length), [552, 648, 576]);
    assert.deepEqual([contentBank.length, vocabularyBank.length, placementBank.length], [552, 648, 576]);
    for (const [index, name] of ['content', 'vocabulary', 'placementItems'].entries()) {
      const current = new Set(afterFirst[index]!.map(item => item._id));
      assert.deepEqual(legacyIds[name as keyof typeof legacyIds].filter(id => current.has(id)), legacyIds[name as keyof typeof legacyIds], `${name}: a legacy ID disappeared`);
      for (const item of afterFirst[index]!) assert.equal(item._id, item.id, `${name}: public identifier changed`);
    }
    const persistedContent = new Map((afterFirst[0]! as StoredContentRecord[]).map(item => [item.id, item]));
    for (const previous of legacyContent) {
      const current = persistedContent.get(previous.id)!;
      assert.deepEqual(current.questions.map(question => question.id), previous.questions.map(question => question.id), `${previous.id}: saved responses lost their question identifiers`);
      assert.deepEqual(current.sections.map(section => section.id), previous.sections.map(section => section.id), `${previous.id}: legacy section identifiers changed`);
      assert.deepEqual(current.questions.map(question => question.answer), previous.questions.map(question => question.answer), `${previous.id}: an existing attempt would be graded against different keys`);
    }

    // Regression for BSON's default undefined -> null conversion. Fixed labels
    // must omit questionNumber; blank labels/nodes must omit the fixed text.
    // Both the typed parser and the learner client rely on this distinction.
    let fixedLabels = 0; let blankLabels = 0; let explicitUndefinedLabels = 0;
    const expected = new Map(contentBank.map(item => [item.id, item]));
    for (const item of afterFirst[0]! as StoredContentRecord[]) {
      const source = expected.get(item.id)!;
      for (const [sectionIndex, section] of item.sections.entries()) {
        for (const [visualIndex, asset] of (section.visuals || []).entries()) {
          assert.ok(visualAssetSchema.safeParse(asset).success, `${item.id}: persisted visual is no longer typed`);
          if (!('labels' in asset)) continue;
          const sourceAsset = source.sections[sectionIndex]!.visuals![visualIndex]!;
          assert.ok('labels' in sourceAsset);
          const originalLabels = [...sourceAsset.labels, ...(sourceAsset.nodes || [])];
          for (const label of [...asset.labels, ...(asset.nodes || [])]) {
            const original = originalLabels.find(entry => entry.id === label.id)!;
            if (original.questionNumber === undefined) {
              fixedLabels += 1;
              assert.equal(Object.hasOwn(label, 'questionNumber'), false, `${item.id}/${label.id}: absent questionNumber became null`);
              if (Object.hasOwn(original, 'questionNumber')) explicitUndefinedLabels += 1;
            } else {
              blankLabels += 1;
              assert.equal(label.questionNumber, original.questionNumber);
              assert.equal(Object.hasOwn(label, 'text'), false, `${item.id}/${label.id}: blank label gained fixed text`);
            }
          }
        }
      }
    }
    assert.ok(fixedLabels > 0 && blankLabels > 0, 'both fixed landmarks and numbered blanks must be persisted');
    assert.ok(explicitUndefinedLabels > 0, 'fixture bank must exercise an explicit undefined questionNumber, which MongoDB otherwise stores as null');

    // Exercise the real API serializer on documents read from MongoDB, including
    // the optional-property regression above, rather than on in-memory seeds.
    let listeningWithLayout = 0;
    for (const stored of afterFirst[0]! as StoredContentRecord[]) {
      const clean = jsonCopy(sanitizeContent(stored, true));
      assert.equal(Object.hasOwn(clean, '_id'), false);
      for (const question of clean.questions) {
        for (const secret of ['answer', 'acceptedAnswers', 'explanation', 'evidence']) assert.equal(Object.hasOwn(question, secret), false, `${stored.id}: leaked ${secret}`);
      }
      for (const [index, section] of clean.sections.entries()) {
        assert.deepEqual(section.visuals, jsonCopy(stored.sections[index]!.visuals ?? null) ?? undefined);
        assert.deepEqual(section.questionBlocks, jsonCopy(stored.sections[index]!.questionBlocks ?? null) ?? undefined);
        for (const asset of section.visuals || []) assert.ok(visualAssetSchema.safeParse(asset).success);
        for (const block of section.questionBlocks || []) assert.ok(questionBlockSchema.safeParse(block).success);
        if (stored.skill === 'listening') {
          assert.equal(section.text, '', `${stored.id}: exam transcript exposed`);
          assert.equal(Object.hasOwn(section, 'dialogue'), false, `${stored.id}: exam dialogue exposed`);
          if (section.visuals?.length || section.questionBlocks?.length) listeningWithLayout += 1;
        }
      }
    }
    assert.ok(listeningWithLayout > 0, 'Listening exam must retain safe layouts while hiding the transcript');

    await seedDatabase(database);
    assert.deepEqual(await snapshotPrivate(database), before, 'repeat seed modified learner data');
    assert.deepEqual(await bytesOf(database, upload.id), recording, 'repeat seed changed recording bytes');
    const afterSecond = await Promise.all([
      database.content.find().sort({ _id: 1 }).toArray(), database.vocabulary.find().sort({ _id: 1 }).toArray(), database.placementItems.find().sort({ _id: 1 }).toArray(),
    ]);
    assert.deepEqual(afterSecond.map(rows => rows.length), [552, 648, 576]);
    assert.deepEqual(afterSecond.map(documentHash), afterFirst.map(documentHash), 'a second seed changed a public document or added a duplicate');
  } finally {
    try {
      assert.match(database.db.databaseName, /^ielts_ai_seed_v3_test_[a-f0-9]{32}$/);
      await database.db.dropDatabase();
    } finally {
      await database.client.close();
    }
  }
});
