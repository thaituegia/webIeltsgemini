import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const helper = readFileSync(new URL("../deploy/run-bank-reset.sh", import.meta.url), "utf8");
const nativePython = spawnSync("python3", ["-c", "import sys;print(sys.executable)"], { encoding: "utf8" }).stdout.trim();
assert.ok(nativePython.startsWith("/"));
const commit = "a".repeat(40), archiveSha = "b".repeat(64), containerId = "c".repeat(64);
const project = "website-ielts-ai-synthetic-operator";
const settings = {
  duoId: "synthetic-operator-duo",
  accounts: [
    { role: "husband", name: "Synthetic Việt O'Neil $ $(touch HACKED) `touch HACKED`", phone: "0390000091", passwordHash: `scrypt:${"a".repeat(32)}:${"b".repeat(128)}` },
    { role: "wife", name: "Synthetic Nguyễn & người thứ hai", phone: "0390000092", passwordHash: `scrypt:${"c".repeat(32)}:${"d".repeat(128)}` },
  ],
};
interface State {
  ids: string[];
  inspected: { Config: { Labels: Record<string, string>; Env: string[] }; State: { Running: boolean } }[];
  ownerTrusted: boolean;
  curlFail: boolean;
  secondTempFail: boolean;
  downstreamFail: boolean;
}
function getSettings(state: State) {
  const raw = state.inspected[0].Config.Env.find(x => x.startsWith("DUO_ACCOUNTS_JSON="))!;
  return JSON.parse(raw.slice("DUO_ACCOUNTS_JSON=".length)) as typeof settings;
}
function changeSettings(state: State, change: (value: typeof settings) => void) {
  const value = getSettings(state); change(value);
  state.inspected[0].Config.Env = state.inspected[0].Config.Env.map(x => x.startsWith("DUO_ACCOUNTS_JSON=") ? `DUO_ACCOUNTS_JSON=${JSON.stringify(value)}` : x);
}
function run(modify: (state: State) => void = () => {}, incorrectChecksum = false) {
  const directory = mkdtempSync(join(tmpdir(), "ielts-operator-test-"));
  const root = join(directory, "live"), bin = join(directory, "bin"), temporary = join(directory, "temps");
  mkdirSync(join(root, ".local", "deploy"), { recursive: true }); mkdirSync(bin); mkdirSync(temporary);
  writeFileSync(join(root, ".local", "deploy", "deploy.env"), `IELTS_COMPOSE_PROJECT=${project}\n`, { mode: 0o600 });
  const fixtureFile = join(directory, "fixture.json"), captured = join(directory, "received.json"), argsFile = join(directory, "received-args"), callsFile = join(directory, "calls.jsonl"), modeFile = join(directory, "stdin-mode");
  const state: State = {
    ids: [containerId], inspected: [{ Config: { Labels: {
      "com.docker.compose.project": project, "com.docker.compose.service": "app", "com.docker.compose.project.working_dir": `${root}/deploy`,
    }, Env: ["DUO_ENABLED=true", "DUO_CREDENTIALS_FILE=", `DUO_ACCOUNTS_JSON=${JSON.stringify(settings)}`] }, State: { Running: true } }],
    ownerTrusted: true, curlFail: false, secondTempFail: false, downstreamFail: false,
  };
  modify(state); writeFileSync(fixtureFile, JSON.stringify(state), { mode: 0o600 });
  const fakeReset = `#!/usr/bin/env bash\nset -euo pipefail\nstat -L -c %a /proc/self/fd/0 > "$IELTS_TEST_INPUT_MODE"\ncat > "$IELTS_TEST_CAPTURE"\nprintf '%s\\0' "$@" > "$IELTS_TEST_ARGS"\n[[ "$IELTS_TEST_DOWNSTREAM_FAIL" != true ]] || exit 77\nprintf '%s\\n' 'synthetic reset invoked'\n`;
  const fakeResetPath = join(directory, "pinned-reset.sh"); writeFileSync(fakeResetPath, fakeReset, { mode: 0o600 });
  const sha = incorrectChecksum ? "0".repeat(64) : createHash("sha256").update(fakeReset).digest("hex");
  const executable = (name: string, code: string) => { const file = join(bin, name); writeFileSync(file, `#!${nativePython}\n${code}`, { mode: 0o700 }); chmodSync(file, 0o700); };
  executable("docker", `import json,os,sys\nstate=json.load(open(os.environ['IELTS_TEST_FIXTURE']))\nwith open(os.environ['IELTS_TEST_CALLS'],'a') as log: log.write(json.dumps(['docker']+sys.argv[1:])+'\\n')\nif sys.argv[1]=='ps': print('\\n'.join(state['ids']))\nelif sys.argv[1]=='inspect': print(json.dumps(state['inspected'],ensure_ascii=False))\nelse: sys.exit(78)\n`);
  executable("curl", `import json,os,shutil,sys\nstate=json.load(open(os.environ['IELTS_TEST_FIXTURE']))\nwith open(os.environ['IELTS_TEST_CALLS'],'a') as log: log.write(json.dumps(['curl']+sys.argv[1:])+'\\n')\nif state['curlFail']: sys.exit('synthetic download failure')\nassert '-o' in sys.argv\nshutil.copyfile(os.environ['IELTS_TEST_RESET_SOURCE'],sys.argv[sys.argv.index('-o')+1])\n`);
  executable("mktemp", `import json,os,subprocess,sys\nstate=json.load(open(os.environ['IELTS_TEST_FIXTURE']))\nif state['secondTempFail'] and 'ielts-reset-code' in sys.argv[1]: sys.exit('synthetic second temporary-file failure')\nname=os.path.basename(sys.argv[1]);template=os.path.join(os.environ['IELTS_TEST_TEMPS'],name)\nr=subprocess.run(['/usr/bin/mktemp',template],capture_output=True,text=True)\nprint(r.stdout,end='');sys.exit(r.returncode)\n`);
  // The production source is unchanged. CI runs as an unprivileged user, so
  // emulate only the root-owned deployment context for its actual Python block.
  // All parsing, realpath, Docker subprocess, JSON and validation code executes.
  executable("python3", `import json,os,sys\nstate=json.load(open(os.environ['IELTS_TEST_FIXTURE']))\ncode=sys.stdin.read();real_stat=os.stat;root=os.environ['IELTS_TEST_ROOT']\ndef contextual_stat(path,*args,**kwargs):\n result=real_stat(path,*args,**kwargs)\n if path in (root,root+'/.local/deploy/deploy.env'):\n  fields=list(result);fields[4]=0 if state['ownerTrusted'] else 1000;return os.stat_result(fields)\n return result\nos.stat=contextual_stat\nsys.argv=sys.argv[1:]\nexec(compile(code,'actual-run-bank-reset-credentials','exec'))\n`);
  assert.equal(helper.split("&& $EUID == 0").length, 2, "the actual root-only preflight must remain in production");
  const contextualHelper = helper.replace("&& $EUID == 0", "");
  try {
    const result = spawnSync("bash", ["-c", contextualHelper, "actual-operator-helper", root, commit, archiveSha, sha], {
      cwd: directory, encoding: "utf8", timeout: 10_000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, IELTS_TEST_FIXTURE: fixtureFile, IELTS_TEST_ROOT: root,
        IELTS_TEST_TEMPS: temporary, IELTS_TEST_CALLS: callsFile, IELTS_TEST_RESET_SOURCE: fakeResetPath,
        IELTS_TEST_CAPTURE: captured, IELTS_TEST_INPUT_MODE: modeFile, IELTS_TEST_ARGS: argsFile, IELTS_TEST_DOWNSTREAM_FAIL: String(state.downstreamFail) },
    });
    const calls: string[][] = existsSync(callsFile) ? readFileSync(callsFile, "utf8").trim().split("\n").map(x => JSON.parse(x)) : [];
    const received = existsSync(captured) ? JSON.parse(readFileSync(captured, "utf8")) : null;
    if (received) assert.equal(readFileSync(modeFile, "utf8").trim(), "600", "credentials reach reset only from a private 0600 file");
    const args = existsSync(argsFile) ? readFileSync(argsFile, "utf8").split("\0").filter(Boolean) : [];
    assert.deepEqual(readdirSync(temporary), [], "private temp files must be removed on success and failure");
    assert.equal(existsSync(join(directory, "HACKED")), false, "credential names never execute shell substitutions");
    for (const account of settings.accounts) for (const secret of [account.name, account.phone, account.passwordHash]) {
      assert.ok(!result.stdout.includes(secret), "credentials must not enter stdout");
      assert.ok(!result.stderr.includes(secret), "credentials must not enter stderr");
    }
    return { ...result, calls, received, args, root };
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test("operator helper is valid Bash and refuses an incomplete/unpinned invocation before Docker or downloading", () => {
  assert.equal(spawnSync("bash", ["-n", "deploy/run-bank-reset.sh"], { encoding: "utf8" }).status, 0);
  for (const args of [[], ["/tmp", "main", archiveSha, "d".repeat(64)], ["/tmp", commit, "bad-digest", "d".repeat(64)]]) {
    const result = spawnSync("bash", ["deploy/run-bank-reset.sh", ...args], { encoding: "utf8" });
    assert.equal(result.status, 2);
    assert.ok(!result.stdout.includes("scrypt:"));
  }
});

test("verified existing credentials round-trip Vietnamese, apostrophe, dollar and literal shell substitutions safely to the SHA-pinned reset via stdin", () => {
  const result = run(); assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.received, settings);
  assert.deepEqual(result.args, [result.root, commit, archiveSha]);
  assert.equal(result.stdout, "synthetic reset invoked\n");
  assert.deepEqual(result.calls[0], ["docker", "ps", "-q", "--no-trunc", "--filter", `label=com.docker.compose.project=${project}`, "--filter", "label=com.docker.compose.service=app"]);
  assert.deepEqual(result.calls[1], ["docker", "inspect", containerId]);
  const download = result.calls.find(x => x[0] === "curl")!;
  assert.ok(download.includes(`https://raw.githubusercontent.com/thaituegia/websiteIeltsAi/${commit}/deploy/reset-bank.sh`));
  assert.ok(download.includes("--proto") && download.includes("--proto-redir"));
});

const negative: [string, (state: State) => void][] = [
  ["foreign project label", state => { state.inspected[0].Config.Labels["com.docker.compose.project"] = "other-project"; }],
  ["foreign service label", state => { state.inspected[0].Config.Labels["com.docker.compose.service"] = "mongo"; }],
  ["foreign working directory", state => { state.inspected[0].Config.Labels["com.docker.compose.project.working_dir"] = "/other-project/deploy"; }],
  ["multiple candidate apps", state => { state.ids.push("d".repeat(64)); }],
  ["multiple inspect records", state => { state.inspected.push(structuredClone(state.inspected[0])); }],
  ["a stopped app", state => { state.inspected[0].State.Running = false; }],
  ["disabled Duo", state => { state.inspected[0].Config.Env[0] = "DUO_ENABLED=false"; }],
  ["file-only Duo credentials", state => { state.inspected[0].Config.Env[1] = "DUO_CREDENTIALS_FILE=/private/accounts.json"; }],
  ["duplicate environment keys", state => { state.inspected[0].Config.Env.push("DUO_ENABLED=true"); }],
  ["plaintext password hash", state => changeSettings(state, value => { value.accounts[0].passwordHash = "synthetic-plaintext-password"; })],
  ["duplicate phones", state => changeSettings(state, value => { value.accounts[1].phone = value.accounts[0].phone; })],
  ["invalid phone", state => changeSettings(state, value => { value.accounts[0].phone = "not-a-phone"; })],
  ["Unicode phone digits", state => changeSettings(state, value => { value.accounts[0].phone = "03900٠0091"; })],
  ["duplicate roles", state => changeSettings(state, value => { value.accounts[1].role = "husband"; })],
  ["a control character in the name", state => changeSettings(state, value => { value.accounts[0].name = "Synthetic\nDUO_ENABLED=false"; })],
  ["an invalid Duo identity", state => changeSettings(state, value => { value.duoId = "BAD ID"; })],
  ["a third account", state => changeSettings(state, value => { value.accounts.push({ ...value.accounts[0], phone: "0390000093" }); })],
  ["an extra plaintext password field", state => changeSettings(state, value => { Object.assign(value.accounts[0], { password: "synthetic-plaintext-password" }); })],
  ["an untrusted deployment owner", state => { state.ownerTrusted = false; }],
];
for (const [label, modify] of negative) test(`operator helper rejects ${label} without downloading, invoking reset or revealing credentials`, () => {
  const result = run(modify);
  assert.notEqual(result.status, 0);
  assert.equal(result.received, null);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Cannot verify existing private Duo configuration/);
  assert.ok(!result.calls.some(x => x[0] === "curl"));
  assert.ok(!result.stderr.includes("synthetic-plaintext-password"));
});

test("a download failure cleans both temp files and never invokes reset", () => {
  const result = run(state => { state.curlFail = true; });
  assert.notEqual(result.status, 0); assert.equal(result.received, null);
  assert.match(result.stderr, /synthetic download failure/);
});
test("a wrong SHA refuses the fetched script and cleans temporary credentials", () => {
  const result = run(() => {}, true);
  assert.notEqual(result.status, 0); assert.equal(result.received, null); assert.equal(result.stdout, "");
});
test("failure creating the second temp file removes the first and never inspects Docker", () => {
  const result = run(state => { state.secondTempFail = true; });
  assert.notEqual(result.status, 0); assert.equal(result.received, null); assert.deepEqual(result.calls, []);
});
test("a downstream reset failure preserves its exit status while removing private temporary files", () => {
  const result = run(state => { state.downstreamFail = true; });
  assert.equal(result.status, 77); assert.deepEqual(result.received, settings); assert.equal(result.stdout, "");
});
