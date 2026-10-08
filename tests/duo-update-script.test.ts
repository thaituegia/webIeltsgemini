import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import vm from "node:vm";
import { BSON, MongoClient } from "mongodb";
const script = readFileSync(
  new URL("../deploy/update-duo.sh", import.meta.url),
  "utf8",
);
const extract = (name: string) => {
  const result = script.match(
    new RegExp(`/\\* ${name}_BEGIN \\*/([\\s\\S]+?)/\\* ${name}_END \\*/`),
  )?.[1];
  assert.ok(result, `Actual embedded ${name} must be testable`);
  return result;
};
const snapshotCode = extract("DUO_PRIVATE_SNAPSHOT"),
  verifyCode = extract("DUO_VERIFY_DATABASE");
const helper = script.match(
  /# UPDATE_MONGO_INPUT_BEGIN\n([\s\S]+?)\n# UPDATE_MONGO_INPUT_END/,
)?.[1];
assert.ok(helper);
const commonHelper = readFileSync(
  new URL("../deploy/update.sh", import.meta.url),
  "utf8",
).match(
  /# UPDATE_MONGO_INPUT_BEGIN\n([\s\S]+?)\n# UPDATE_MONGO_INPUT_END/,
)?.[1];
type Row = Record<string, any>;
const publicNames = ["content", "vocabulary", "placementItems"] as const;
const serialized = (value: unknown) =>
  BSON.EJSON.stringify(value, { relaxed: false });
const clone = <T>(value: T): T =>
  BSON.EJSON.parse(serialized(value), { relaxed: false }) as T;
function databaseVM(collections: Record<string, Row[]>, accessed: string[]) {
  function collection(name: string) {
    return {
      find: () => {
        accessed.push(name);
        let rows = clone(collections[name] ?? []);
        const cursor = {
          sort(order: Row) {
            assert.equal(order._id, 1);
            assert.equal(Object.keys(order).join(","), "_id");
            rows.sort((a, b) => String(a._id).localeCompare(String(b._id)));
            return cursor;
          },
          maxTimeMS(value: number) {
            assert.ok([15000, 30000].includes(value));
            return cursor;
          },
          toArray: () => clone(rows),
          forEach: (callback: (row: Row) => void) => rows.forEach(callback),
        };
        return cursor;
      },
      updateOne: () => assert.fail("Verifier cannot update"),
      insertOne: () => assert.fail("Verifier cannot insert"),
      deleteMany: () => assert.fail("Verifier cannot delete"),
      drop: () => assert.fail("Verifier cannot drop"),
    };
  }
  return {
    getCollectionNames: () => Object.keys(collections),
    getCollection: collection,
    users: collection("users"),
  };
}
function captureSnapshot(collections: Record<string, Row[]>) {
  const output: string[] = [],
    accessed: string[] = [];
  const before = serialized(collections);
  vm.runInNewContext(
    snapshotCode,
    {
      require: (name: string) => {
        assert.equal(name, "crypto");
        return { createHash };
      },
      db: databaseVM(collections, accessed),
      EJSON: BSON.EJSON,
      print: (value: string) => output.push(value),
    },
    { timeout: 1500 },
  );
  assert.equal(serialized(collections), before);
  assert.equal(output.length, 1);
  return {
    snapshot: BSON.EJSON.parse(output[0], { relaxed: false }) as Row,
    accessed,
  };
}
function fixture() {
  const credentials = {
    duoId: "synthetic-update-duo",
    accounts: [
      {
        role: "husband",
        name: "Controlled Account A",
        phone: "0390000031",
        passwordHash: `scrypt:${"0".repeat(32)}:${"1".repeat(128)}`,
      },
      {
        role: "wife",
        name: "Controlled Account B",
        phone: "0390000032",
        passwordHash: `scrypt:${"2".repeat(32)}:${"3".repeat(128)}`,
      },
    ],
  };
  const manifest: Record<string, Row[]> = {
    content: [
      { _id: "old-content", id: "old-content", title: "Original source title" },
      { _id: "new-content", id: "new-content", title: "New high-band text" },
    ],
    vocabulary: [
      { _id: "old-vocabulary", id: "old-vocabulary", word: "source lexeme" },
      { _id: "new-vocabulary", id: "new-vocabulary", word: "new lexeme" },
    ],
    placementItems: [
      { _id: "old-placement", id: "old-placement", answer: "source answer" },
      { _id: "new-placement", id: "new-placement", answer: "new answer" },
    ],
  };
  // Teacher corrections made before deployment must not be overwritten by source seed.
  const before: Record<string, Row[]> = Object.fromEntries(
    publicNames.map((name) => [
      name,
      [
        {
          ...clone(manifest[name][0]),
          teacherCorrection: "Existing learner-approved correction",
          count: new BSON.Int32(2),
        },
        {
          _id: `custom-${name}`,
          id: `custom-${name}`,
          value: new BSON.Double(4.5),
        },
      ],
    ]),
  );
  const oldHusband = {
    _id: "existing-husband-id",
    id: "existing-husband-id",
    name: "Former name",
    phone: credentials.accounts[0].phone,
    passwordHash: "synthetic-old-hash",
    email: "preserved-a@fixture.invalid",
    currentBand: new BSON.Double(5.5),
    personalEstimatedBand: new BSON.Double(5.5),
    weeklyMinutes: new BSON.Int32(360),
    createdAt: new Date("2025-01-01T00:00:00Z"),
    targetBand: 7,
    demo: false,
  };
  const legacyUser = {
    _id: "legacy-unrelated-user",
    id: "legacy-unrelated-user",
    passwordHash: "synthetic-unrelated-hash",
    currentBand: new BSON.Double(4.5),
  };
  const collections: Record<string, Row[]> = {
    ...Object.fromEntries(
      publicNames.map((name) => [
        name,
        [...clone(before[name]), clone(manifest[name][1])],
      ]),
    ),
    users: [clone(oldHusband), clone(legacyUser)],
    attempts: [
      {
        _id: "old-attempt",
        userId: "existing-husband-id",
        contentId: "old-content",
        response: "Private learner answer",
      },
    ],
    sessions: [
      {
        _id: "old-session",
        userId: "existing-husband-id",
        expiresAt: new Date("2030-01-01T00:00:00Z"),
      },
    ],
    duo_learning_paths: [
      {
        _id: "persisted-path",
        currentBand: new BSON.Double(5.5),
        revision: new BSON.Int32(8),
        progress: { husband: "passed", wife: "pending-ai" },
      },
    ],
    duo_assessments: [
      {
        _id: "persisted-assessment",
        status: "pending-ai",
        parts: [{ attemptId: "old-attempt" }],
      },
    ],
    duo_promotion_rooms: [
      {
        _id: "persisted-room",
        status: "in-progress",
        members: { husband: { ready: true } },
      },
    ],
    future_personal_progress: [
      {
        _id: "future-private-sentinel",
        nested: {
          privateDate: new Date("2025-06-07T08:09:10Z"),
          value: new BSON.Long(4),
        },
      },
    ],
    "recordings.files": [
      {
        _id: new BSON.ObjectId("654321001122334455667788"),
        filename: "Private recording",
        metadata: { userId: "existing-husband-id", attemptId: "old-attempt" },
      },
    ],
    "recordings.chunks": [
      {
        _id: new BSON.ObjectId("654321001122334455667799"),
        n: new BSON.Int32(0),
        data: new BSON.Binary(Buffer.from("Controlled private audio bytes")),
      },
    ],
  };
  const learners = captureSnapshot(collections).snapshot;
  collections.users[0] = {
    ...collections.users[0],
    ...credentials.accounts[0],
    duoId: credentials.duoId,
    duoRole: "husband",
    demo: false,
    targetBand: 8,
  };
  delete collections.users[0].role;
  collections.users.push({
    _id: `${credentials.duoId}-wife`,
    id: `${credentials.duoId}-wife`,
    email: "new-fixed@fixture.invalid",
    name: credentials.accounts[1].name,
    phone: credentials.accounts[1].phone,
    passwordHash: credentials.accounts[1].passwordHash,
    duoId: credentials.duoId,
    duoRole: "wife",
    demo: false,
    targetBand: 8,
    currentBand: null,
  });
  return { manifest, before, credentials, learners, collections };
}
function executeVerifier(state: ReturnType<typeof fixture>) {
  const output: string[] = [],
    accessed: string[] = [];
  let error: unknown;
  const before = serialized(state.collections),
    input = serialized({
      manifest: state.manifest,
      before: state.before,
      credentials: state.credentials,
      learners: state.learners,
    });
  try {
    vm.runInNewContext(
      verifyCode,
      {
        require: (name: string) =>
          name === "crypto"
            ? { createHash }
            : name === "fs"
              ? {
                  readFileSync: (fd: number, encoding: string) => {
                    assert.equal(fd, 0);
                    assert.equal(encoding, "utf8");
                    return input;
                  },
                }
              : assert.fail("Unexpected verifier module"),
        db: databaseVM(state.collections, accessed),
        EJSON: BSON.EJSON,
        print: (value: string) => output.push(value),
      },
      { timeout: 1500 },
    );
  } catch (cause) {
    error = cause;
  }
  assert.equal(
    serialized(state.collections),
    before,
    "Successful and failed verification leaves all public/private records unchanged",
  );
  return { output, accessed, error };
}

test("Duo update shell is scoped to app, keeps EAGAIN-safe helper, and compiles every embedded Python block", () => {
  assert.equal(
    spawnSync("bash", ["-n", "deploy/update-duo.sh"], { encoding: "utf8" })
      .status,
    0,
  );
  assert.equal(helper, commonHelper);
  assert.doesNotMatch(
    script,
    /docker\s+(?:restart|system prune|volume rm)|docker compose[^\n]*\bdown\b|systemctl\s+(?:reload|restart|stop)\s+nginx|\bufw\s|\bapt(?:-get)?\s/,
  );
  for (const line of script
    .split("\n")
    .filter(
      (line) => line.includes("docker compose") && line.includes(" up -d "),
    )) {
    assert.match(line, /--no-deps --no-build --wait/);
    assert.match(line, / app >/);
  }
  assert.doesNotMatch(
    verifyCode + snapshotCode,
    /\.(?:insertOne|insertMany|updateOne|updateMany|replaceOne|deleteOne|deleteMany|drop|dropIndexes|bulkWrite|save|findOneAnd\w*)\s*\(/,
  );
  const blocks = [...script.matchAll(/<<'(PY[A-Z]+)'[^\n]*\n([\s\S]*?)\n\1/g)];
  assert.ok(blocks.length >= 10);
  for (const [, name, code] of blocks) {
    const result = spawnSync(
      "python3",
      ["-c", "import sys;compile(sys.stdin.read(),sys.argv[1],'exec')", name],
      { input: code, encoding: "utf8" },
    );
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
  }
  assert.match(script, /--no-env-resolution/);
  assert.match(script, /stat\.S_IMODE\(metadata\.st_mode\)==0o600/);
});

test("Duo snapshot hashes every existing non-public collection including shared path, rooms and future progress", () => {
  const state = fixture();
  const result = captureSnapshot(state.collections);
  const expected = Object.keys(state.collections)
    .filter((name) => !["users", ...publicNames].includes(name))
    .sort();
  assert.deepEqual(Object.keys(result.snapshot.hashes).sort(), expected);
  for (const name of [
    "duo_learning_paths",
    "duo_assessments",
    "duo_promotion_rooms",
    "future_personal_progress",
    "recordings.chunks",
  ])
    assert.ok(result.snapshot.hashes[name]);
});

test("Duo verifier preserves pre-deployment edited seed records, custom material and unrelated learners", () => {
  const state = fixture();
  const result = executeVerifier(state);
  assert.equal(result.error, undefined);
  const report = JSON.parse(result.output[0]);
  for (const name of publicNames)
    assert.deepEqual(report[name], { seeded: 2, total: 3, oldPreserved: 2 });
});
for (const name of publicNames) {
  test(`Duo verifier rejects overwritten pre-existing ${name}`, () => {
    const state = fixture();
    state.collections[name][0] = clone(state.manifest[name][0]);
    assert.match(
      String(executeVerifier(state).error),
      /Pre-existing public record missing or changed/,
    );
  });
  test(`Duo verifier rejects modified new ${name}`, () => {
    const state = fixture();
    state.collections[name][2].wrongNewValue = true;
    assert.match(
      String(executeVerifier(state).error),
      /Seed record missing or changed/,
    );
  });
  test(`Duo verifier rejects missing old ${name}`, () => {
    const state = fixture();
    state.collections[name].splice(1, 1);
    assert.match(
      String(executeVerifier(state).error),
      /Pre-existing public record missing or changed/,
    );
  });
  test(`Duo verifier rejects missing new ${name}`, () => {
    const state = fixture();
    state.collections[name].pop();
    assert.match(
      String(executeVerifier(state).error),
      /Seed record missing or changed/,
    );
  });
}
for (const name of [
  "duo_learning_paths",
  "duo_assessments",
  "duo_promotion_rooms",
  "future_personal_progress",
  "recordings.chunks",
])
  test(`Duo verifier refuses a changed ${name} sentinel`, () => {
    const state = fixture();
    state.collections[name][0].changed = true;
    assert.match(
      String(executeVerifier(state).error),
      new RegExp(`Learner collection changed: ${name.replaceAll(".", "\\.")}`),
    );
  });
test("Duo verifier allows only authorized identity binding and keeps assessed personal bands/IDs", () => {
  const state = fixture();
  assert.equal(executeVerifier(state).error, undefined);
  state.collections.users[0].currentBand = new BSON.Double(8);
  assert.match(
    String(executeVerifier(state).error),
    /Fixed learner identity or assessed progress changed/,
  );
  const other = fixture();
  other.collections.users[1].currentBand = 8;
  assert.match(
    String(executeVerifier(other).error),
    /Unrelated legacy user changed/,
  );
  const surprise = fixture();
  surprise.collections.users.push({
    _id: "unexpected-third",
    phone: "0390000033",
  });
  assert.match(String(executeVerifier(surprise).error), /Unexpected new user/);
});

const container = process.env.IELTS_UPDATE_GUARD_MONGO_CONTAINER;
test(
  "native Duo update: full manifest spools on regular stdin, snapshots actual Duo state, verifies without collection writes",
  { skip: !container, timeout: 70_000 },
  async () => {
    assert.match(container!, /^[A-Za-z0-9_.-]+$/);
    const name = `ielts_duo_update_test_${randomUUID().replaceAll("-", "")}`;
    const directory = mkdtempSync(join(tmpdir(), "ielts-duo-update-native-"));
    const state = fixture();
    const client = new MongoClient(
      process.env.TEST_MONGODB_URI || "mongodb://127.0.0.1:27017",
    );
    await client.connect();
    const db = client.db(name);
    try {
      const { contentBank, vocabularyBank, placementBank } = await import(
        "../server/data/index"
      );
      state.manifest = JSON.parse(
        JSON.stringify({
          content: contentBank.map((row) => ({ ...row, _id: row.id })),
          vocabulary: vocabularyBank.map((row) => ({ ...row, _id: row.id })),
          placementItems: placementBank.map((row) => ({ ...row, _id: row.id })),
        }),
      );
      assert.ok(
        Buffer.byteLength(JSON.stringify(state.manifest)) > 7 * 1024 * 1024,
      );
      state.before = {};
      for (const kind of publicNames) {
        const docs = clone(state.manifest[kind]);
        const old = {
          ...docs[0],
          preservedTeacherCorrection:
            "Native existing correction remains unchanged.",
        };
        docs[0] = old;
        state.before[kind] = [clone(old)];
        await db
          .collection<Row>(kind)
          .insertMany(docs as never[], { ignoreUndefined: true });
      }
      const privateNames = Object.keys(state.collections).filter(
        (kind) => !["users", ...publicNames].includes(kind),
      );
      for (const kind of privateNames)
        await db
          .collection<Row>(kind)
          .insertMany(state.collections[kind] as never[]);
      await db
        .collection<Row>("users")
        .insertMany(clone(state.learners.users) as never[]);
      const prefix = `db=db.getSiblingDB("${name}");`;
      const captured = spawnSync(
        "docker",
        [
          "exec",
          container!,
          "mongosh",
          "--quiet",
          "--norc",
          "--eval",
          prefix + snapshotCode,
        ],
        { encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024 },
      );
      assert.equal(captured.status, 0, captured.stderr);
      state.learners = BSON.EJSON.parse(captured.stdout.trim(), {
        relaxed: false,
      });
      assert.ok(
        state.learners.hashes.duo_learning_paths &&
          state.learners.hashes.future_personal_progress,
      );
      await db.collection("users").deleteMany({});
      await db
        .collection<Row>("users")
        .insertMany(state.collections.users as never[]);
      const snapshotAll = async () =>
        serialized(
          Object.fromEntries(
            await Promise.all(
              (await db.listCollections({}, { nameOnly: true }).toArray()).map(
                async ({ name: kind }) => [
                  kind,
                  await db.collection(kind).find().sort({ _id: 1 }).toArray(),
                ],
              ),
            ),
          ),
        );
      const beforeAll = await snapshotAll();
      const inputPath = join(directory, "verify.ejson");
      writeFileSync(
        inputPath,
        serialized({
          manifest: state.manifest,
          before: state.before,
          learners: state.learners,
          credentials: state.credentials,
        }),
        { mode: 0o600 },
      );
      const proof = `${prefix}const proofFs=require("fs");print(JSON.stringify({regular:proofFs.fstatSync(0).isFile(),mode:proofFs.fstatSync(0).mode&511,path:proofFs.readlinkSync("/proc/self/fd/0")}));`;
      function run(code = verifyCode) {
        return spawnSync(
          "bash",
          [
            "-c",
            `${helper}\nmongo_id="$1";mongo_exec_input "$2" "$3"`,
            "duo-update-native-readonly",
            container!,
            proof + code,
            inputPath,
          ],
          { encoding: "utf8", timeout: 45_000, maxBuffer: 1024 * 1024 },
        );
      }
      const result = run();
      assert.equal(result.status, 0, result.stderr + result.stdout);
      const output = result.stdout
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line));
      assert.equal(output.length, 2);
      assert.equal(output[0].regular, true);
      assert.equal(output[0].mode, 0o600);
      for (const kind of publicNames)
        assert.equal(output[1][kind].seeded, state.manifest[kind].length);
      assert.equal(
        await snapshotAll(),
        beforeAll,
        "Full native verification changes no public/private collection",
      );
      await db
        .collection("duo_learning_paths")
        .updateOne({ _id: "persisted-path" } as never, {
          $set: { illegalChange: true },
        });
      const changed = await snapshotAll();
      const refused = run();
      assert.notEqual(refused.status, 0);
      assert.match(
        refused.stderr + refused.stdout,
        /Learner collection changed: duo_learning_paths/,
      );
      assert.equal(
        await snapshotAll(),
        changed,
        "Failed native verification changes no collection",
      );
      const cleanup = spawnSync(
        "docker",
        [
          "exec",
          container!,
          "sh",
          "-c",
          'test ! -e "$1"',
          "sh",
          output[0].path,
        ],
        { encoding: "utf8" },
      );
      assert.equal(cleanup.status, 0, cleanup.stderr);
    } finally {
      assert.match(name, /^ielts_duo_update_test_[a-f0-9]{32}$/);
      await db.dropDatabase();
      await client.close();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);
