import { strict as assert } from "node:assert";
import { test } from "node:test";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import vm from "node:vm";
import { BSON, MongoClient } from "mongodb";

const script = readFileSync(new URL("../deploy/update.sh", import.meta.url), "utf8");
const guard = script.match(/\/\* UPDATE_ROLLBACK_GUARD_BEGIN \*\/([\s\S]+?)\/\* UPDATE_ROLLBACK_GUARD_END \*\//)?.[1];
assert.ok(guard, "Actual embedded MongoDB rollback guard must be testable");
const mongoInputHelper = script.match(/# UPDATE_MONGO_INPUT_BEGIN\n([\s\S]+?)\n# UPDATE_MONGO_INPUT_END/)?.[1];
assert.ok(mongoInputHelper, "The actual bounded regular-file Mongo input helper must be testable");
type Row = Record<string, unknown>;
function valuesAt(value: unknown, path: string[]): unknown[] {
  if (!path.length) return [value];
  if (Array.isArray(value)) return value.flatMap(item => valuesAt(item, path));
  if (!value || typeof value !== "object") return [undefined];
  return valuesAt((value as Row)[path[0]], path.slice(1));
}
function matches(row: Row, query: Row): boolean {
  return Object.entries(query).every(([key, condition]) => {
    if (key === "$or") return (condition as Row[]).some(clause => matches(row, clause));
    const actual = valuesAt(row, key.split("."));
    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      const rules = condition as Row;
      if ("$elemMatch" in rules) return actual.some(value => Array.isArray(value) && value.some(item => matches(item as Row, rules.$elemMatch as Row)));
      return Object.entries(rules).every(([operator, expected]) => {
        if (operator === "$in") return actual.some(value => (expected as unknown[]).includes(value));
        if (operator === "$nin") return actual.every(value => !(expected as unknown[]).includes(value));
        if (operator === "$ne") return actual.every(value => expected === null ? value != null : value !== expected);
        throw new Error(`Unexpected MongoDB operator ${operator}`);
      });
    }
    return actual.includes(condition);
  });
}
function fixture() {
  const before = {
    content: [{ _id: "legacy-content", id: "legacy-content", questions: [{ answer: "old" }] }],
    vocabulary: [{ _id: "legacy-vocab", id: "legacy-vocab", word: "harbour" }],
    placementItems: [{ _id: "legacy-place", id: "legacy-place", answer: "A" }],
  };
  const manifest = {
    content: [...before.content, { _id: "new-content", id: "new-content", questions: [{ answer: "new" }] }],
    vocabulary: [...before.vocabulary, { _id: "new-vocab", id: "new-vocab", word: "estuary" }],
    placementItems: [...before.placementItems, { _id: "new-place", id: "new-place", answer: "B" }],
  };
  const collections: Record<string, Row[]> = {
    ...structuredClone(manifest),
    users: [{ id: "learner", passwordHash: "private-test-value" }],
    attempts: [{ contentId: "legacy-content" }],
    cards: [{ vocabularyId: null, word: "learner's own word" }, { vocabularyId: "legacy-vocab" }],
    placements: [{ currentQuestionId: null, answers: [{ questionId: "legacy-place" }] }],
    plans: [{ tasks: [{ contentId: null }, { contentId: "legacy-content" }] }],
    audio: [{ attemptId: "legacy-attempt" }],
    "recordings.files": [{ metadata: { attemptId: "legacy-attempt" } }],
  };
  return { before, manifest, collections };
}
function executeGuard(state: ReturnType<typeof fixture>) {
  const deleted: { collection: string; ids: unknown[] }[] = [];
  const db: Record<string, unknown> = {};
  function collection(name: string) {
    return {
      find: () => ({ toArray: () => structuredClone(state.collections[name] || []) }),
      countDocuments: (query: Row) => (state.collections[name] || []).filter(row => matches(row, query)).length,
      deleteMany: (query: Row) => {
        assert.ok(["content", "vocabulary", "placementItems"].includes(name), "A private learner collection must never be changed");
        const removed = state.collections[name].filter(row => matches(row, query));
        deleted.push({ collection: name, ids: removed.map(row => row._id) });
        state.collections[name] = state.collections[name].filter(row => !matches(row, query));
      },
    };
  }
  db.getCollection = collection;
  for (const name of Object.keys(state.collections)) db[name] = collection(name);
  const privateBefore = JSON.stringify(Object.fromEntries(Object.entries(state.collections).filter(([name]) => !["content", "vocabulary", "placementItems"].includes(name))));
  let error: unknown;
  try {
    vm.runInNewContext(guard!, {
      require: (name: string) => { assert.equal(name, "fs"); return { readFileSync: (fd: number) => { assert.equal(fd, 0); return JSON.stringify({ before: state.before, manifest: state.manifest }); } }; },
      EJSON: { parse: JSON.parse, serialize: (value: unknown) => value }, db, print: () => undefined,
    }, { timeout: 1000 });
  } catch (cause) { error = cause; }
  const privateAfter = JSON.stringify(Object.fromEntries(Object.entries(state.collections).filter(([name]) => !["content", "vocabulary", "placementItems"].includes(name))));
  assert.equal(privateAfter, privateBefore, "Learner state remains unchanged on every path");
  return { error, deleted };
}

test("update shell parses and every app recreation stays scoped with no dependency rebuild", () => {
  const syntax = spawnSync("bash", ["-n", "deploy/update.sh"], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
  const upLines = script.split("\n").filter(line => line.includes("docker compose") && line.includes(" up -d "));
  assert.ok(upLines.length >= 3);
  for (const line of upLines) { assert.match(line, /--no-deps --no-build --wait/); assert.match(line, / app >/); }
  assert.doesNotMatch(script, /docker\s+(?:restart|system prune|volume rm)|docker compose[^\n]*\bdown\b|systemctl\s+(?:reload|restart|stop)\s+nginx|\bufw\s|\bapt(?:-get)?\s/);
  assert.match(script, /DOCKER_BUILDKIT=0 docker build --pull --memory=1024m --memory-swap=1024m --cpu-period=100000 --cpu-quota=50000/);
  assert.match(script, /exec -T proxy nginx -s reload/);
});

test("invalid archive identities and redirected live paths stop before any Docker invocation", () => {
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-validation-"));
  try {
    const actual = join(directory, "live"); mkdirSync(actual);
    const link = join(directory, "redirect"); symlinkSync(actual, link);
    const bin = join(directory, "bin"); mkdirSync(bin);
    const calls = join(directory, "docker.calls");
    writeFileSync(join(bin, "docker"), `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> '${calls}'\nexit 99\n`, { mode: 0o700 });
    const commit = "a".repeat(40), hash = "b".repeat(64);
    const bad: string[][] = [[], [actual, "main", hash], [actual, commit.toUpperCase(), hash], [actual, commit, "short"], [link, commit, hash], [actual, commit, hash, "--force"], [actual, commit, hash, "--check", "extra"]];
    for (const args of bad) {
      const result = spawnSync("bash", ["deploy/update.sh", ...args], { encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } });
      assert.equal(result.status, 2, `Invalid input rejected by usage validation: ${args.join(" ")}`);
    }
    assert.ok(!readdirSync(directory).includes("docker.calls"), "No Docker build/up/stop/exec/tag can run on invalid input");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("Mongo input validation rejects empty, oversized and redirected files before Docker", () => {
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-mongo-input-"));
  try {
    const empty = join(directory, "empty.json"); writeFileSync(empty, "");
    const oversized = join(directory, "oversized.json");
    const create = spawnSync("python3", ["-c", "import sys;f=open(sys.argv[1],'wb');f.truncate(64*1024*1024+1);f.close()", oversized]);
    assert.equal(create.status, 0);
    const link = join(directory, "redirect.json"); symlinkSync(empty, link);
    const bin = join(directory, "bin"); mkdirSync(bin);
    const calls = join(directory, "docker.calls");
    writeFileSync(join(bin, "docker"), `#!/bin/bash\nprintf 'called' > '${calls}'\nexit 91\n`, { mode: 0o700 });
    for (const input of [empty, oversized, link, join(directory, "missing.json")]) {
      const result = spawnSync("bash", ["-c", `${mongoInputHelper}\nmongo_id=fixture;mongo_exec_input 'print("unreachable")' "$1"`, "ielts-input-test", input], { encoding: "utf8", env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } });
      assert.notEqual(result.status, 0);
    }
    assert.ok(!readdirSync(directory).includes("docker.calls"));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("mocked Docker preflight accepts only the owned deployment and never reaches mutation commands", () => {
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-preflight-"));
  try {
    const live = join(directory, "live"), deploy = join(live, "deploy"), privateDir = join(live, ".local", "deploy");
    const bin = join(directory, "bin"), callsPath = join(directory, "docker-calls.jsonl");
    mkdirSync(deploy, { recursive: true }); mkdirSync(join(privateDir, "tls"), { recursive: true, mode: 0o700 }); mkdirSync(bin);
    const project = "website-ielts-ai-test";
    for (const path of [join(deploy, "compose.yaml"), join(deploy, "compose.sh"), join(deploy, "nginx.conf"), join(privateDir, "domain.compose.yaml"), join(privateDir, "app.env"), join(privateDir, "tls", "site.crt")]) writeFileSync(path, "test-owned-file\n");
    writeFileSync(join(privateDir, "deploy.env"), `IELTS_COMPOSE_PROJECT=${project}\nIELTS_PUBLIC_HOST=66.42.62.123\nIELTS_PUBLIC_PORT=8088\n`);
    // Root and ownership are explicit simulated inputs in this host-only unit
    // test. The deployable script still enforces both invariants unchanged.
    const rootCheck = "(( EUID == 0 ))"; assert.equal(script.split(rootCheck).length, 2);
    const testScript = join(directory, "test-update.sh"); writeFileSync(testScript, script.replace(rootCheck, "(( 1 == 1 ))"));
    writeFileSync(join(bin, "stat"), '#!/bin/bash\nif [[ "$1" == -c && "$2" == %u ]]; then printf "0\\n"; else exec /usr/bin/stat "$@"; fi\n', { mode: 0o700 });
    writeFileSync(join(bin, "systemctl"), '#!/bin/bash\nif [[ "$1" == is-active ]]; then printf "active\\n"; else printf "1234\\n"; fi\n', { mode: 0o700 });
    writeFileSync(join(bin, "nginx"), '#!/bin/bash\nexit 0\n', { mode: 0o700 });
    writeFileSync(join(bin, "curl"), '#!/bin/bash\nprintf \'%s\\n\' \'{"status":"ok","database":"mongodb","demoEnabled":false}\'\n', { mode: 0o700 });
    writeFileSync(join(bin, "df"), '#!/bin/bash\nprintf "Filesystem 1024-blocks Used Available Capacity Mounted\\nfixture 20000000 1 19999999 1%% /fixture\\n"\n', { mode: 0o700 });
    writeFileSync(join(bin, "getconf"), '#!/bin/bash\nprintf "1024\\n"\n', { mode: 0o700 });
    writeFileSync(join(bin, "ss"), '#!/bin/bash\nexit 0\n', { mode: 0o700 });
    const dockerMock = `#!${process.execPath}
const fs=require('fs');const a=process.argv.slice(2),live=process.env.MOCK_LIVE,project=process.env.MOCK_PROJECT,scenario=process.env.MOCK_SCENARIO;
fs.appendFileSync(process.env.MOCK_CALLS,JSON.stringify(a)+'\\n');
const done=x=>{if(x!==undefined)process.stdout.write(typeof x==='string'?x+'\\n':JSON.stringify(x)+'\\n');process.exit(0)};
const id=s=>({app:'a',mongo:'b',proxy:'c'}[s].repeat(64)),image='sha256:'+'d'.repeat(64);
if(a[0]==='info'){if(a.includes('--format'))done(a.at(-1).includes('DockerRootDir')?live:scenario==='no-caps'?'false true true true':'true true true true');done();}
if(a[0]==='build'&&a.includes('--help'))done('--memory value\\n--memory-swap value\\n--cpu-period value\\n--cpu-quota value');
if(a[0]==='compose'){
 if(a.includes('version')||a.includes('--quiet'))done();
 if(a.includes('--help'))done('--wait Wait\\n--wait-timeout Seconds');
 if(a.includes('--format')){
  const release=a.some(x=>x.endsWith('/release.compose.yaml'));
  const source=release?process.env.MOCK_OLD_SOURCE:live;
  done({services:{app:{image:release?'old-pinned':'old-default',build:{context:source,dockerfile:'Dockerfile'},environment:{APP_ORIGIN:'https://sutonghanyu.vn'}},mongo:{image:release&&scenario==='release-mutates-mongo'?'other-image':'mongo:8'}}});
 }
}
if(a[0]==='ps'){const service=a.find(x=>x.startsWith('label=com.docker.compose.service='))?.split('=').at(-1);done(id(service));}
if(a[0]==='image'&&a[1]==='inspect')done(image);
if(a[0]==='inspect'){
 if(a.includes('--format')){const f=a[a.indexOf('--format')+1];done(f==='{{.Image}}'?image:f==='{{.Config.Image}}'?'old-default':'https://sutonghanyu.vn');}
 done(['app','mongo','proxy'].map(service=>({Config:{Labels:{'com.docker.compose.project':project,'com.docker.compose.service':service,'com.docker.compose.project.working_dir':live+'/deploy'}},State:{Running:true},NetworkSettings:{Ports:service==='app'?{'3001/tcp':[{HostIp:'127.0.0.1',HostPort:scenario==='public-binding'?'3001':'19088'}]}:{}}})));
}
process.stderr.write('Unexpected/mutating Docker command '+JSON.stringify(a));process.exit(91);
`;
    writeFileSync(join(bin, "docker"), dockerMock, { mode: 0o700 });
    const source = join(live, ".local", "releases", "prior", "source"); mkdirSync(source, { recursive: true });
    const env = { ...process.env, PATH: `${bin}:${process.env.PATH}`, MOCK_LIVE: live, MOCK_PROJECT: project, MOCK_CALLS: callsPath, MOCK_OLD_SOURCE: source };
    for (const scenario of ["valid-baseline", "valid-pinned-release", "release-mutates-mongo", "public-binding", "no-caps"]) {
      const override = join(privateDir, "release.compose.yaml");
      if (scenario.includes("release")) writeFileSync(override, "services:\n  app:\n    image: old-pinned\n"); else rmSync(override, { force: true });
      writeFileSync(callsPath, "");
      const result = spawnSync("bash", [testScript, live, "a".repeat(40), "b".repeat(64), "--check"], { encoding: "utf8", env: { ...env, MOCK_SCENARIO: scenario }, timeout: 20000 });
      assert.equal(result.status === 0, scenario.startsWith("valid-"), `${scenario}: ${result.stderr}`);
      const calls = readFileSync(callsPath, "utf8").trim().split("\n").filter(Boolean).map(line => JSON.parse(line) as string[]);
      for (const args of calls) {
        assert.ok(!["run", "exec", "tag"].includes(args[0]));
        assert.ok(!(args[0] === "build" && !args.includes("--help")));
        assert.ok(!(args[0] === "compose" && args.some(arg => ["stop", "start", "restart", "down", "up"].includes(arg)) && !args.includes("--help")));
      }
      assert.ok(!readdirSync(privateDir).some(name => ["update.lock", "updates"].includes(name)), "Preflight leaves private deployment state unchanged");
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("guarded rollback deletes only exact public expansion documents", () => {
  const state = fixture();
  // Canonical comparison accepts different object-key insertion order.
  state.collections.content[0] = { questions: [{ answer: "old" }], id: "legacy-content", _id: "legacy-content" };
  const result = executeGuard(state);
  assert.equal(result.error, undefined);
  assert.deepEqual(result.deleted, [
    { collection: "content", ids: ["new-content"] },
    { collection: "vocabulary", ids: ["new-vocab"] },
    { collection: "placementItems", ids: ["new-place"] },
  ]);
  assert.deepEqual(Object.fromEntries(["content", "vocabulary", "placementItems"].map(name => [name, state.collections[name].map(row => row._id)])), { content: ["legacy-content"], vocabulary: ["legacy-vocab"], placementItems: ["legacy-place"] });
});

const unsafe: { label: string; change: (state: ReturnType<typeof fixture>) => void }[] = [
  { label: "an attempt references new content", change: x => x.collections.attempts.push({ contentId: "new-content" }) },
  { label: "a card references new vocabulary", change: x => x.collections.cards.push({ vocabularyId: "new-vocab" }) },
  { label: "an active placement references a new item", change: x => x.collections.placements.push({ currentQuestionId: "new-place", answers: [] }) },
  { label: "a placement mixes old and new answered items", change: x => x.collections.placements[0].answers = [{ questionId: "legacy-place" }, { questionId: "new-place" }] },
  { label: "a plan mixes old and new content tasks", change: x => x.collections.plans[0].tasks = [{ contentId: "legacy-content" }, { contentId: "new-content" }] },
  { label: "a new attempt references already missing new material", change: x => { x.collections.content = x.collections.content.filter(row => row._id !== "new-content"); x.collections.attempts.push({ contentId: "new-content" }); } },
  { label: "a learner record references unknown generated material", change: x => x.collections.attempts.push({ contentId: "ai-generated-id" }) },
  { label: "an old public document changed", change: x => x.collections.content[0].questions = [{ answer: "changed" }] },
  { label: "an old public document is missing", change: x => x.collections.vocabulary = x.collections.vocabulary.filter(row => row._id !== "legacy-vocab") },
  { label: "an unknown new AI document exists", change: x => x.collections.content.push({ _id: "ai-new", id: "ai-new", questions: [] }) },
  { label: "a known new public document was edited", change: x => x.collections.placementItems[1].answer = "edited" },
  { label: "a new document has null where the manifest omitted an optional field", change: x => x.collections.content[1].unusedOptional = null },
];
for (const item of unsafe) test(`rollback refuses all public deletion when ${item.label}`, () => {
  const state = fixture(); item.change(state);
  const publicBefore = JSON.stringify([state.collections.content, state.collections.vocabulary, state.collections.placementItems]);
  const result = executeGuard(state);
  assert.ok(result.error, "Unsafe rollback must fail closed"); assert.deepEqual(result.deleted, []);
  assert.equal(JSON.stringify([state.collections.content, state.collections.vocabulary, state.collections.placementItems]), publicBefore);
});

test("health verification permits preserved custom public material but still requires every target", () => {
  const healthCheck = script.match(/<<'PYHEALTH'\n([\s\S]*?)\nPYHEALTH/)?.[1]; assert.ok(healthCheck);
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-health-"));
  try {
    const healthPath = join(directory, "health.json");
    for (const [bank, pass] of [
      [{ lessons: 480, mocks: 72, vocabulary: 648, placement: 576 }, true],
      [{ lessons: 481, mocks: 74, vocabulary: 654, placement: 580 }, true],
      [{ lessons: 479, mocks: 75, vocabulary: 654, placement: 580 }, false],
      [{ lessons: "480", mocks: 72, vocabulary: 648, placement: 576 }, false],
    ] as const) {
      writeFileSync(healthPath, JSON.stringify({ status: "ok", database: "mongodb", demoEnabled: false, bank }));
      const result: SpawnSyncReturns<string> = spawnSync("python3", ["-c", healthCheck!, healthPath], { encoding: "utf8" });
      assert.equal(result.status === 0, pass, `Health bank ${JSON.stringify(bank)}`);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test("archive extraction rejects traversal and redirected entries before writing files", () => {
  const extract = script.match(/<<'PYEXTRACT'\n([\s\S]*?)\nPYEXTRACT/)?.[1]; assert.ok(extract);
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-archive-"));
  const commit = "a".repeat(40), prefix = `websiteIeltsAi-${commit}`;
  try {
    const create = `import io,sys,tarfile\nname,kind,path=sys.argv[1:]\nwith tarfile.open(path,'w:gz') as t:\n m=tarfile.TarInfo(name);m.size=2\n if kind=='symlink':m.type=tarfile.SYMTYPE;m.linkname='/tmp/escape';m.size=0\n if kind=='hardlink':m.type=tarfile.LNKTYPE;m.linkname='/tmp/escape';m.size=0\n t.addfile(m,io.BytesIO(b'ok') if m.isfile() else None)\n`;
    for (const [index, [name, kind]] of [[`${prefix}/../escape`, "file"], [`other-${commit}/Dockerfile`, "file"], [`/${prefix}/Dockerfile`, "file"], [`${prefix}/link`, "symlink"], [`${prefix}/link`, "hardlink"]].entries()) {
      const archive = join(directory, `bad-${index}.tar.gz`), target = join(directory, `source-${index}`); mkdirSync(target);
      assert.equal(spawnSync("python3", ["-c", create, name, kind, archive]).status, 0);
      const result = spawnSync("python3", ["-c", extract!, archive, target, commit], { encoding: "utf8" });
      assert.notEqual(result.status, 0); assert.deepEqual(readdirSync(target), [], "Archive validation must finish before extraction starts");
    }
    const archive = join(directory, "good.tar.gz"), target = join(directory, "good"); mkdirSync(target);
    assert.equal(spawnSync("python3", ["-c", create, `${prefix}/Dockerfile`, "file", archive]).status, 0);
    const result = spawnSync("python3", ["-c", extract!, archive, target, commit], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr); assert.equal(readFileSync(join(target, "Dockerfile"), "utf8"), "ok");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

const mongoContainer = process.env.IELTS_UPDATE_GUARD_MONGO_CONTAINER;
async function nativeGuardFixture(blockWithNewPlan: boolean) {
  assert.match(mongoContainer!, /^[a-zA-Z0-9_.-]+$/, "Container name must be a simple local Docker identifier");
  const databaseName = `ielts_update_guard_test_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  assert.match(databaseName, /^ielts_update_guard_test_[a-z0-9_]+$/);
  const client = new MongoClient("mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const database = client.db(databaseName);
  try {
    const state = fixture();
    // The snapshot uses canonical EJSON wrappers, while the image manifest uses
    // plain JSON numbers. Both describe the same BSON values in real MongoDB.
    state.before.content[0] = {
      ...state.before.content[0],
      difficulty: new BSON.Double(7.5), attemptsAllowed: new BSON.Int32(3),
    } as typeof state.before.content[0];
    state.manifest.content[0] = JSON.parse(JSON.stringify(state.before.content[0]));
    state.manifest.content[1] = {
      ...state.manifest.content[1], difficulty: 6.5, attemptsAllowed: 2,
      unusedOptional: undefined,
    } as typeof state.manifest.content[1];
    state.collections.content = structuredClone(state.manifest.content);
    // Native BSON instances are intentionally supplied on the old document.
    state.collections.content[0] = state.before.content[0];
    if (blockWithNewPlan) state.collections.plans[0].tasks = [{ contentId: "legacy-content" }, { contentId: "new-content" }];
    for (const [name, rows] of Object.entries(state.collections)) {
      await database.collection(name).insertMany(rows as never[], { ignoreUndefined: true });
    }
    const publicNames = ["content", "vocabulary", "placementItems"];
    const privateNames = Object.keys(state.collections).filter(name => !publicNames.includes(name));
    const serializeRows = async (names: string[]) => BSON.EJSON.stringify(Object.fromEntries(await Promise.all(names.map(async name => [name, await database.collection(name).find().sort({ _id: 1 }).toArray()]))), { relaxed: false });
    const privateBefore = await serializeRows(privateNames);
    const publicBefore = await serializeRows(publicNames);
    const snapshot = JSON.parse(BSON.EJSON.stringify(state.before, { relaxed: false }));
    const input = JSON.stringify({ before: snapshot, manifest: state.manifest });
    const result = spawnSync("docker", ["exec", "-i", mongoContainer!, "mongosh", "--quiet", "--norc", `mongodb://127.0.0.1:27017/${databaseName}`, "--eval", guard!], { encoding: "utf8", input, timeout: 30000, maxBuffer: 1024 * 1024 });
    assert.equal(await serializeRows(privateNames), privateBefore, "Native MongoDB learner collections are byte-for-byte unchanged");
    if (blockWithNewPlan) {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr + result.stdout, /Learner record references new or missing material/);
      assert.equal(await serializeRows(publicNames), publicBefore, "Native mixed-array references block every public deletion");
    } else {
      assert.equal(result.status, 0, result.stderr + result.stdout);
      for (const name of publicNames) {
        const rows = await database.collection(name).find().toArray();
        assert.equal(rows.length, 1);
        assert.equal(rows[0]._id, state.before[name as keyof typeof state.before][0]._id);
      }
      const content = await database.collection("content").findOne({ id: "legacy-content" });
      assert.equal(content?.difficulty, 7.5);
      assert.equal(content?.attemptsAllowed, 3);
    }
  } finally {
    // The generated prefix is checked before creating and deleting this DB.
    // No production/shared test database is selected by these optional tests.
    assert.match(databaseName, /^ielts_update_guard_test_[a-z0-9_]+$/);
    await database.dropDatabase();
    await client.close();
  }
}
test("native MongoDB rollback compares canonical BSON numbers with plain manifest JSON and omitted optionals", { skip: !mongoContainer }, () => nativeGuardFixture(false));
test("native MongoDB rollback rejects an old/new mixed plan array without changing any collection", { skip: !mongoContainer }, () => nativeGuardFixture(true));

test("native regular-file helper verifies the complete multi-megabyte bank and executes large guarded rollback", { skip: !mongoContainer }, async () => {
  assert.match(mongoContainer!, /^[a-zA-Z0-9_.-]+$/);
  const databaseName = `ielts_update_guard_test_${process.pid}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
  assert.match(databaseName, /^ielts_update_guard_test_[a-z0-9_]+$/);
  const directory = mkdtempSync(join(tmpdir(), "ielts-update-whole-bank-"));
  const client = new MongoClient("mongodb://127.0.0.1:27017", { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  const database = client.db(databaseName);
  try {
    const { v3ContentBank: contentBank, v3VocabularyBank: vocabularyBank, v3PlacementBank: placementBank } = await import("../server/data/index");
    const manifest = JSON.parse(JSON.stringify({ content: contentBank.map(row => ({ ...row, _id: row.id })), vocabulary: vocabularyBank.map(row => ({ ...row, _id: row.id })), placementItems: placementBank.map(row => ({ ...row, _id: row.id })) })) as Record<string, Row[]>;
    const manifestPath = join(directory, "manifest.json");
    const manifestJson = JSON.stringify(manifest); writeFileSync(manifestPath, manifestJson);
    assert.ok(Buffer.byteLength(manifestJson) > 7 * 1024 * 1024, "Exercise the actual full bank rather than small stdin fixtures");
    const names = ["content", "vocabulary", "placementItems"];
    const before = Object.fromEntries(names.map(name => [name, [manifest[name][0]]]));
    for (const name of names) await database.collection(name).insertMany(manifest[name] as never[], { ignoreUndefined: true });
    const learnerRows = { users: [{ _id: "learner", passwordHash: "private-test-value" }], attempts: [{ _id: "attempt", contentId: before.content[0]._id }], cards: [{ _id: "card", vocabularyId: before.vocabulary[0]._id }], placements: [{ _id: "placement", currentQuestionId: null, answers: [{ questionId: before.placementItems[0]._id }] }], plans: [{ _id: "plan", tasks: [{ contentId: before.content[0]._id }] }] };
    for (const [name, rows] of Object.entries(learnerRows)) await database.collection(name).insertMany(rows as never[]);
    const readLearners = async () => BSON.EJSON.stringify(Object.fromEntries(await Promise.all(Object.keys(learnerRows).map(async name => [name, await database.collection(name).find().sort({ _id: 1 }).toArray()]))), { relaxed: false });
    const learnerBefore = await readLearners();
    function executeInput(code: string, file: string) {
      return spawnSync("bash", ["-c", `${mongoInputHelper}\nmongo_id="$1";mongo_exec_input "$2" "$3"`, "ielts-whole-bank-test", mongoContainer!, `db=db.getSiblingDB("${databaseName}");${code}`, file], { encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024 });
    }
    const verify = executeInput('const fs=require("fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));const result={};for(const name of ["content","vocabulary","placementItems"]){const ids=x[name].map(d=>d._id);const seeded=db.getCollection(name).countDocuments({_id:{$in:ids}});if(seeded!==ids.length)throw new Error("Seeded IDs missing");result[name]={seeded,total:db.getCollection(name).countDocuments()};}print(JSON.stringify(result));', manifestPath);
    assert.equal(verify.status, 0, verify.stderr + verify.stdout);
    assert.deepEqual(JSON.parse(verify.stdout.trim()), { content: { seeded: 552, total: 552 }, vocabulary: { seeded: 648, total: 648 }, placementItems: { seeded: 576, total: 576 } });
    assert.equal(await readLearners(), learnerBefore, "Whole-bank verification is read-only");
    const rollbackPath = join(directory, "rollback.json");
    writeFileSync(rollbackPath, JSON.stringify({ before: JSON.parse(BSON.EJSON.stringify(before, { relaxed: false })), manifest }));
    const rollback = executeInput(guard!, rollbackPath);
    assert.equal(rollback.status, 0, rollback.stderr + rollback.stdout);
    for (const name of names) {
      const rows = await database.collection(name).find().toArray();
      assert.equal(rows.length, 1); assert.equal(rows[0]._id, before[name][0]._id);
    }
    assert.equal(await readLearners(), learnerBefore, "Large guarded rollback never changes learner collections");
    const cleanup = spawnSync("docker", ["exec", mongoContainer!, "sh", "-c", 'find /tmp -maxdepth 1 -name "ielts-update-input.*" -print'], { encoding: "utf8" });
    assert.equal(cleanup.status, 0, cleanup.stderr); assert.equal(cleanup.stdout.trim(), "", "Staged files are removed after verification and rollback");
  } finally {
    assert.match(databaseName, /^ielts_update_guard_test_[a-z0-9_]+$/);
    await database.dropDatabase(); await client.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
