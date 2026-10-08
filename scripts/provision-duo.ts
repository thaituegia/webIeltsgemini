import "dotenv/config";
import { loadDuoCredentials, provisionDuoAccounts } from "../server/duo-auth";
import { connectDatabase } from "../server/storage";

// Fixed credentials are validated before connecting or writing any database.
const settings = loadDuoCredentials();
const database = await connectDatabase();
try {
  const users = await provisionDuoAccounts(database, settings);
  console.log(JSON.stringify({ provisionedAccounts: users.length, fixedLogin: true, preservedLearningRecords: true }));
} finally {
  await database.client.close();
}
