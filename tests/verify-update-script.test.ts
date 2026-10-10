import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { readFileSync, mkdtempSync, writeFileSync, rmSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import vm from "node:vm";
import { BSON, MongoClient } from "mongodb";

const script = readFileSync(new URL("../deploy/verify-update.sh", import.meta.url), "utf8");
const updateScript = readFileSync(new URL("../deploy/update.sh", import.meta.url), "utf8");
const query = script.match(/\/\* VERIFY_UPDATE_PUBLIC_BEGIN \*\/([\s\S]+?)\/\* VERIFY_UPDATE_PUBLIC_END \*\//)?.[1];
const helper = script.match(/# UPDATE_MONGO_INPUT_BEGIN\n([\s\S]+?)\n# UPDATE_MONGO_INPUT_END/)?.[1];
const updateHelper = updateScript.match(/# UPDATE_MONGO_INPUT_BEGIN\n([\s\S]+?)\n# UPDATE_MONGO_INPUT_END/)?.[1];
assert.ok(query, "Test the actual embedded public-bank verification body");
assert.ok(helper && updateHelper, "Both deployment scripts expose their actual input helper");
const pythonBodies = new Map([...script.matchAll(/<<'([A-Z][A-Z0-9_]*)'[^\n]*\n([\s\S]*?)\n\1(?:\n|$)/g)].map(match => [match[1], match[2]]));
const sourceCommit = script.match(/source_commit='([a-f0-9]{40})'/)?.[1];
assert.ok(sourceCommit, "Read the exact release pinned by the verifier");
const releasePrefix = sourceCommit.slice(0, 12);
const runPython = (name: string, args: string[] = []) => {
  const body = pythonBodies.get(name);
  assert.ok(body, `Exercise actual ${name} heredoc`);
  return spawnSync("python3", ["-c", body, ...args], { encoding: "utf8", timeout: 5000 });
};

type Row = Record<string, unknown>;
const publicNames = ["content", "vocabulary", "placementItems"] as const;
const clone = <T,>(value: T): T => BSON.EJSON.parse(BSON.EJSON.stringify(value, { relaxed: false })) as T;
const serialized = (value: unknown) => BSON.EJSON.stringify(value, { relaxed: false });

function fixture() {
  const manifest: Record<string, Row[]> = {
    content: [{ _id: "seed-content", id: "seed-content", sections: [{ text: "A complete seeded passage." }], band: 6.5 }],
    vocabulary: [{ _id: "seed-vocabulary", id: "seed-vocabulary", word: "estuary", examples: ["The estuary supports migrating birds."] }],
    placementItems: [{ _id: "seed-placement", id: "seed-placement", answer: "A", difficulty: 1.8 }],
  };
  // These old custom documents deliberately lie outside the source manifest.
  const before: Record<string, Row[]> = {
    content: [{ _id: "old-content", id: "old-content", band: 5.5, version: new BSON.Int32(2), createdAt: new Date("2025-04-05T06:07:08Z") }],
    vocabulary: [{ _id: "old-vocabulary", id: "old-vocabulary", word: "custom learner lexeme" }],
    placementItems: [{ _id: "old-placement", id: "old-placement", answer: "B", difficulty: new BSON.Double(0.6) }],
  };
  const collections: Record<string, Row[]> = Object.fromEntries(publicNames.map(name => [name, [...clone(manifest[name]), ...clone(before[name])]]));
  collections.users = [{ _id: "learner", passwordHash: "synthetic-private-value" }];
  collections.sessions = [{ _id: "session", userId: "learner" }];
  collections.attempts = [{ _id: "attempt", contentId: "old-content", answers: ["learner's own response"] }];
  collections.cards = [{ _id: "card", vocabularyId: "old-vocabulary" }];
  collections.placements = [{ _id: "placement", answers: [{ questionId: "old-placement" }] }];
  collections.plans = [{ _id: "plan", tasks: [{ contentId: "old-content" }] }];
  collections.audio = [{ _id: "audio", attemptId: "attempt" }];
  collections["recordings.files"] = [{ _id: "recording", filename: "synthetic.ogg", metadata: { attemptId: "attempt" } }];
  collections["recordings.chunks"] = [{ _id: "chunk", files_id: "recording", n: 0, data: new BSON.Binary(Buffer.from("synthetic recording")) }];
  return { manifest, before, collections };
}

function executeQuery(state: ReturnType<typeof fixture>) {
  const accessed: string[] = [];
  const output: string[] = [];
  const before = serialized(state.collections);
  const payload = serialized({ manifest: state.manifest, before: state.before });
  const db = {
    getCollection(name: string) {
      assert.ok(publicNames.includes(name as typeof publicNames[number]), "Verifier must not query private learner collections");
      accessed.push(name);
      return {
        find(...args: unknown[]) {
          assert.equal(args.length, 0, "Every current public record is checked, including custom material");
          return {
            maxTimeMS(milliseconds: number) {
              assert.equal(milliseconds, 15000, "Database scan remains bounded");
              return { toArray: () => clone(state.collections[name]) };
            },
          };
        },
        insertOne() { assert.fail("Verification must never insert"); },
        updateOne() { assert.fail("Verification must never update"); },
        deleteMany() { assert.fail("Verification must never delete"); },
        drop() { assert.fail("Verification must never drop"); },
      };
    },
  };
  let error: unknown;
  try {
    vm.runInNewContext(query!, {
      require(name: string) {
        assert.equal(name, "fs");
        return { readFileSync(fd: number, encoding: string) { assert.equal(fd, 0); assert.equal(encoding, "utf8"); return payload; } };
      },
      EJSON: BSON.EJSON, db, print: (value: string) => output.push(value),
    }, { timeout: 1500 });
  } catch (cause) { error = cause; }
  assert.equal(serialized(state.collections), before, "Every public and private document is unchanged on success and failure");
  return { error, accessed, output };
}

test("verifier Bash parses and has no app, database, gateway or firewall mutation commands", () => {
  const result = spawnSync("bash", ["-n", "deploy/verify-update.sh"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(script, /docker\s+(?:build|run|restart|stop|start|kill|rm|tag|push|pull|system\s+prune|volume\s+rm)\b/);
  assert.doesNotMatch(script, /docker\s+compose[^\n]*\b(?:up|down|stop|start|restart|build|pull|exec|run)\b/);
  assert.doesNotMatch(script, /systemctl\s+(?:reload|restart|stop|start|enable|disable)\b|nginx\s+-s\s|\bufw\s|\bapt(?:-get)?\s|npm\s+(?:run\s+)?seed\b/);
  assert.doesNotMatch(query!, /\.(?:insert\w*|update\w*|replace\w*|delete\w*|drop\w*|bulkWrite|save|findOneAnd\w*)\s*\(/);
  assert.doesNotMatch(script, /--insecure\b|curl[^\n]*\s-k\b/);
  assert.match(script, /receipt_dir="\$\(mktemp -d "\$audit_dir\/verification-XXXXXX"\)"/);
  assert.match(script, /find\(\)\.maxTimeMS\(15000\)/);
  assert.match(script, /expected_digest="\$\(docker image inspect --format '\{\{\.Id\}\}' "\$expected_image"\)"/);
  assert.match(script, /docker inspect --format '\{\{\.Image\}\}' "\$app_id"\)" == "\$expected_digest"/);
});

test("all verifier Python heredocs compile without accessing files or Docker", () => {
  assert.deepEqual([...pythonBodies.keys()], ["PYAUDIT", "PYIMAGE", "PYBASELINE", "PYINPUT", "PYHEALTH", "PYASSET", "PYCOUNTS"]);
  for (const [name, body] of pythonBodies) {
    const result = spawnSync("python3", ["-c", "import sys;compile(sys.stdin.read(),sys.argv[1],'exec')", name], { input: body, encoding: "utf8", timeout: 5000 });
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);
  }
});

test("actual audit selector accepts mixed-case mktemp names, chooses the latest, and refuses an ambiguous latest timestamp", () => {
  const directory = mkdtempSync(join(tmpdir(), "ielts-verifier-audit-selection-"));
  try {
    const none = runPython("PYAUDIT", [directory, releasePrefix]);
    assert.notEqual(none.status, 0);
    assert.match(none.stderr, /No matching v3 update audit/);
    const old = `${releasePrefix}-20261007T173011Z-p9Qz3R`;
    const latest = `${releasePrefix}-20261008T091502Z-A7xB2z`;
    for (const name of [old, latest, "wrongrelease-20261008T091502Z-AbC123", `${releasePrefix}-invalid-date-AbC123`]) mkdirSync(join(directory, name));
    writeFileSync(join(directory, `${releasePrefix}-20261009T091502Z-file123`), "not a directory");
    symlinkSync(join(directory, latest), join(directory, `${releasePrefix}-20261010T091502Z-link123`), "dir");
    const chosen = runPython("PYAUDIT", [directory, releasePrefix]);
    assert.equal(chosen.status, 0, chosen.stderr);
    assert.equal(chosen.stdout.trim(), join(directory, latest), "Newer symlinks and files are never selected as audit directories");
    mkdirSync(join(directory, `${releasePrefix}-20261008T091502Z-z7Yw1a`));
    const ambiguous = runPython("PYAUDIT", [directory, releasePrefix]);
    assert.notEqual(ambiguous.status, 0);
    assert.match(ambiguous.stderr, /Ambiguous latest audit; supply AUDIT_DIR explicitly/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("actual image parser accepts the update script's release.compose.new format and rejects foreign or duplicate images", () => {
  const directory = mkdtempSync(join(tmpdir(), "ielts-verifier-image-parser-"));
  const path = join(directory, "release.compose.new");
  const project = "website-ielts-ai-20261007t172235z-7d7gnc";
  const image = `${project}-app:release-${releasePrefix}-ab7x3q`;
  const template = updateScript.match(/cat > "\$audit_dir\/release\.compose\.new" <<EORELEASE\n([\s\S]+?)\nEORELEASE/)?.[1];
  assert.ok(template, "Use the actual original update release override format");
  const release = template.replaceAll("$new_image", image).replaceAll("$source_dir", "/opt/websiteIeltsAi/.local/deploy/releases/v3-release");
  try {
    writeFileSync(path, release);
    const accepted = runPython("PYIMAGE", [path, project, releasePrefix]);
    assert.equal(accepted.status, 0, accepted.stderr);
    assert.equal(accepted.stdout.trim(), image);
    for (const altered of [
      release.replace(image, "unrelated-project-app:release-" + releasePrefix + "-ab7x3q"),
      release.replace(releasePrefix, "000000000000"),
      release.replace("ab7x3q", "Ab7x3Q"),
      release + `\n    image: ${image}\n`,
      release.replace(`    image: ${image}`, "    image:"),
    ]) {
      writeFileSync(path, altered);
      const refused = runPython("PYIMAGE", [path, project, releasePrefix]);
      assert.notEqual(refused.status, 0, "Wrong release/project, invalid nonce, duplicate or missing image must fail closed");
      assert.equal(refused.stdout, "");
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("verifier uses the identical bounded regular-file helper already tested for the update", () => {
  assert.equal(helper, updateHelper, "Do not fork or regress the EAGAIN fix in the recovery verifier");
  assert.match(helper!, /input_bytes <= 64 \* 1024 \* 1024/);
  assert.match(helper!, /umask 077/);
  assert.match(helper!, /sha256sum/);
  assert.match(helper!, /trap .*rm -f/);
  assert.match(helper!, /mongosh[^\n]+< "\$ielts_input"/);
});

test("actual embedded verifier accepts canonical BSON values and differently ordered object keys", () => {
  const state = fixture();
  state.collections.content[0] = { band: 6.5, sections: [{ text: "A complete seeded passage." }], id: "seed-content", _id: "seed-content" };
  const result = executeQuery(state);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.accessed, publicNames);
  assert.deepEqual(JSON.parse(result.output[0]), {
    content: { seeded: 1, total: 2, oldPreserved: 1 },
    vocabulary: { seeded: 1, total: 2, oldPreserved: 1 },
    placementItems: { seeded: 1, total: 2, oldPreserved: 1 },
  });
});

test("custom public extras are retained without weakening seeded and old-record comparisons", () => {
  const state = fixture();
  for (const name of publicNames) state.collections[name].push({ _id: `extra-${name}`, id: `extra-${name}`, source: "custom", nested: { optional: null, order: [2, 1] } });
  const result = executeQuery(state);
  assert.equal(result.error, undefined);
  const report = JSON.parse(result.output[0]);
  for (const name of publicNames) assert.deepEqual(report[name], { seeded: 1, total: 3, oldPreserved: 1 });
});

for (const name of publicNames) {
  test(`actual embedded verifier fails closed when a seeded ${name} document is missing`, () => {
    const state = fixture(); state.collections[name].shift();
    const result = executeQuery(state);
    assert.match(String(result.error), /Seed record missing or changed/);
    assert.deepEqual(result.output, []);
  });
  test(`actual embedded verifier fails closed when a seeded ${name} document changes`, () => {
    const state = fixture(); state.collections[name][0].unexpectedField = null;
    const result = executeQuery(state);
    assert.match(String(result.error), /Seed record missing or changed/);
    assert.deepEqual(result.output, []);
  });
  test(`actual embedded verifier fails closed when an old custom ${name} document is missing`, () => {
    const state = fixture(); state.collections[name].pop();
    const result = executeQuery(state);
    assert.match(String(result.error), /Pre-existing public record missing or changed/);
    assert.deepEqual(result.output, []);
  });
  test(`actual embedded verifier fails closed when an old custom ${name} document changes`, () => {
    const state = fixture(); state.collections[name][1].changedAfterUpdate = true;
    const result = executeQuery(state);
    assert.match(String(result.error), /Pre-existing public record missing or changed/);
    assert.deepEqual(result.output, []);
  });
}

test("canonical verification preserves array order rather than silently treating reordered answers as equal", () => {
  const state = fixture();
  state.manifest.content[0].answerOrder = ["first", "second"];
  state.collections.content[0].answerOrder = ["second", "first"];
  assert.match(String(executeQuery(state).error), /Seed record missing or changed/);
});

const mongoContainer = process.env.IELTS_UPDATE_GUARD_MONGO_CONTAINER;
test("native verifier spools the entire multi-megabyte seed plus old canonical records and performs no collection writes", { skip: !mongoContainer }, async (t) => {
  assert.match(mongoContainer!, /^[a-zA-Z0-9_.-]+$/);
  const databaseName = `ielts_verify_update_test_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  assert.match(databaseName, /^ielts_verify_update_test_[a-z0-9_]+$/);
  const directory = mkdtempSync(join(tmpdir(), "ielts-verify-update-whole-bank-"));
  const client = new MongoClient("mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const database = client.db(databaseName);
  try {
    const { v3ContentBank: contentBank, v3VocabularyBank: vocabularyBank, v3PlacementBank: placementBank } = await import("../server/data/previous-bank");
    const manifest = JSON.parse(JSON.stringify({
      content: contentBank.map(row => ({ ...row, _id: row.id })),
      vocabulary: vocabularyBank.map(row => ({ ...row, _id: row.id })),
      placementItems: placementBank.map(row => ({ ...row, _id: row.id })),
    })) as Record<string, Row[]>;
    assert.deepEqual(publicNames.map(name => manifest[name].length), [552, 648, 576]);
    assert.ok(Buffer.byteLength(JSON.stringify(manifest)) > 7 * 1024 * 1024, "Use the actual whole seed rather than a small input fixture");
    const oldNames = {
      content: manifest.content.filter(row => row.source !== "ai").map(row => row._id),
      vocabulary: manifest.vocabulary.filter(row => !String(row.id).startsWith("vocab-v3-")).map(row => row._id),
      placementItems: manifest.placementItems.filter(row => !String(row.id).startsWith("placement-v3-")).map(row => row._id),
    };
    assert.deepEqual(publicNames.map(name => oldNames[name].length), [184, 216, 192]);
    for (const name of publicNames) {
      await database.collection(name).insertMany(manifest[name] as never[], { ignoreUndefined: true });
      await database.collection(name).insertMany([
        { _id: `old-custom-${name}`, id: `old-custom-${name}`, value: new BSON.Double(7.5), count: new BSON.Int32(3), createdAt: new Date("2025-02-03T04:05:06Z") },
        { _id: `untracked-extra-${name}`, id: `untracked-extra-${name}`, source: "custom", note: "Not part of the manifest or old snapshot" },
      ] as never[]);
    }
    const privateState = fixture().collections;
    const privateNames = Object.keys(privateState).filter(name => !publicNames.includes(name as typeof publicNames[number]));
    for (const name of privateNames) await database.collection(name).insertMany(privateState[name] as never[]);
    const before = Object.fromEntries(await Promise.all(publicNames.map(async name => [name, await database.collection(name).find({ _id: { $in: [...oldNames[name], `old-custom-${name}`] } } as never).toArray()])));
    const snapshot = async (names: readonly string[]) => createHash("sha256").update(serialized(Object.fromEntries(await Promise.all(names.map(async name => [name, await database.collection(name).find().sort({ _id: 1 }).toArray()]))))).digest("hex");
    const publicBefore = await snapshot(publicNames);
    const privateBefore = await snapshot(privateNames);
    const input = serialized({ manifest, before });
    const inputFile = join(directory, "full-input.ejson"); writeFileSync(inputFile, input, { mode: 0o600 });
    assert.ok(Buffer.byteLength(input) > 7 * 1024 * 1024);
    const proof = `db=db.getSiblingDB("${databaseName}");const proofFs=require("fs");print(JSON.stringify({inputPath:proofFs.readlinkSync("/proc/self/fd/0"),regular:proofFs.fstatSync(0).isFile(),mode:proofFs.fstatSync(0).mode&511,bytes:proofFs.fstatSync(0).size}));`;
    const result = spawnSync("bash", ["-c", `${helper}\nmongo_id="$1";mongo_exec_input "$2" "$3"`, "ielts-read-only-full-bank", mongoContainer!, proof + query!, inputFile], { encoding: "utf8", timeout: 45000, maxBuffer: 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const lines = result.stdout.trim().split("\n").map(line => JSON.parse(line));
    assert.equal(lines.length, 2);
    const spool = lines[0];
    assert.match(spool.inputPath, /^\/tmp\/ielts-update-input\.[a-zA-Z0-9]+$/);
    assert.equal(spool.regular, true, "mongosh reads the bounded regular file, not a nonblocking pipe");
    assert.equal(spool.mode, 0o600);
    assert.equal(spool.bytes, Buffer.byteLength(input));
    for (const name of publicNames) assert.deepEqual(lines[1][name], { seeded: manifest[name].length, total: manifest[name].length + 2, oldPreserved: before[name].length });
    assert.equal(await snapshot(publicNames), publicBefore, "Full public documents, including both kinds of custom extras, are byte-for-byte unchanged");
    assert.equal(await snapshot(privateNames), privateBefore, "Every private learner and recording collection is byte-for-byte unchanged");
    t.diagnostic(`${spool.bytes} bytes read from mode-0600 regular stdin; ${manifest.content.length}/${manifest.vocabulary.length}/${manifest.placementItems.length} seeds and ${before.content.length}/${before.vocabulary.length}/${before.placementItems.length} old public documents verified; all three public and ${privateNames.length} private collection hashes unchanged`);
    const cleanup = spawnSync("docker", ["exec", mongoContainer!, "sh", "-c", 'test ! -e "$1"', "ielts-spool-cleanup-test", spool.inputPath], { encoding: "utf8", timeout: 10000 });
    assert.equal(cleanup.status, 0, "Only this invocation's staged file is checked; no unrelated temporary files are deleted");
  } finally {
    // Only this uniquely named fixture database is created or deleted. The
    // deployment's hard-coded URI is overridden in JS before any query runs.
    assert.match(databaseName, /^ielts_verify_update_test_[a-z0-9_]+$/);
    await database.dropDatabase();
    await client.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
