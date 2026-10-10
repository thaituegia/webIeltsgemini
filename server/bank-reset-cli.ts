import "dotenv/config";
import { MongoClient } from "mongodb";
import { resolve } from "node:path";
import { loadDuoCredentials } from "./duo-auth";
import { inspectBankReset, resetBank, verifyBankReset } from "./bank-reset";
import { replacementBank } from "./data/index";

// This administrator entrypoint never provisions users or starts an HTTP
// server. Inspect is the default. The application must be stopped for apply.
const [action = "inspect", backup, ...extra] = process.argv.slice(2);
if (!["inspect", "apply", "verify"].includes(action) || extra.length ||
    (action === "apply" ? !backup : Boolean(backup)))
  throw Error("Usage: bank-reset-cli.ts inspect | verify | apply ABSOLUTE_NEW_BACKUP_DIRECTORY");
if (action === "apply" && (process.env.IELTS_APP_OFFLINE !== "true" || !backup?.startsWith("/")))
  throw Error("Stop the IELTS app first; apply requires IELTS_APP_OFFLINE=true and an absolute new backup directory.");
const credentials = await loadDuoCredentials();
if (!credentials) throw Error("The private configuration for exactly two existing accounts is required.");
const client = new MongoClient(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ielts_ai", {
  serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000, maxPoolSize: 2,
});
try {
  await client.connect();
  const db = client.db();
  if (db.databaseName !== "ielts_ai") throw Error("This command operates only on the IELTS application's ielts_ai database.");
  const result = action === "apply"
    ? await resetBank(db, credentials, replacementBank, { expectedDatabase: "ielts_ai", backupDirectory: resolve(backup!), appOffline: true })
    : action === "verify" ? await verifyBankReset(db, credentials, replacementBank)
    : await inspectBankReset(db, credentials, replacementBank);
  console.log(JSON.stringify(result, null, 2));
} catch {
  // URI, credentials, documents and provider errors must not enter public logs.
  throw Error("IELTS reset did not complete. Keep the app stopped after apply; inspect the private backup receipt before recovery.");
} finally { await client.close(); }
