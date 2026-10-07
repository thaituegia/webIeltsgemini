import { execFile } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const projectDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const composeArguments = [
  "compose",
  "--project-directory",
  projectDirectory,
  "-f",
  resolve(projectDirectory, "compose.yaml"),
];
const action = process.argv[2] || "start";
const mongoPort = process.env.MONGO_PORT || "27017";

async function docker(arguments_) {
  const result = await run("docker", arguments_, {
    cwd: projectDirectory,
    timeout: 180_000,
    maxBuffer: 1024 * 1024,
  });
  if (result.stdout.trim()) console.log(result.stdout.trim());
  if (result.stderr.trim()) console.log(result.stderr.trim());
  return result;
}

async function ping() {
  const result = await run(
    "docker",
    [
      "exec",
      "website-ielts-ai-mongo",
      "mongosh",
      "--quiet",
      "--eval",
      "JSON.stringify(db.adminCommand({ping: 1}))",
    ],
    { timeout: 10_000 },
  );
  const reply = JSON.parse(result.stdout.trim());
  if (reply.ok !== 1)
    throw new Error("MongoDB did not return a successful admin ping");
  return reply;
}

try {
  if (action === "start") {
    await mkdir(resolve(projectDirectory, ".local/mongo"), { recursive: true });
    await docker([
      ...composeArguments,
      "up",
      "-d",
      "--wait",
      "--wait-timeout",
      "90",
      "mongo",
    ]);
    console.log(`MongoDB ready: ${JSON.stringify(await ping())}`);
    console.log(
      `Local application database: mongodb://127.0.0.1:${mongoPort}/ielts_ai`,
    );
  } else if (action === "stop") {
    await docker([...composeArguments, "stop", "mongo"]);
    console.log(
      "MongoDB stopped. The data directory .local/mongo was preserved.",
    );
  } else if (action === "status") {
    await docker([...composeArguments, "ps", "mongo"]);
    console.log(`MongoDB admin ping: ${JSON.stringify(await ping())}`);
  } else {
    throw new Error("Usage: node scripts/mongo.mjs [start|stop|status]");
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "MongoDB startup failed",
  );
  console.error(
    "Docker and Docker Compose must be available, or configure an external MongoDB connection in MONGODB_URI and start the app directly.",
  );
  process.exitCode = 1;
}
