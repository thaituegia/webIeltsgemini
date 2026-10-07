import { MongoClient } from "mongodb";

export default async function cleanup(): Promise<void> {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) throw new Error("No isolated E2E MongoDB URI was configured.");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    if (!/^ielts_ai_e2e_\d+_\d+$/.test(db.databaseName)) {
      throw new Error(
        "Refusing to delete a database outside the E2E namespace.",
      );
    }
    await db.dropDatabase();
  } finally {
    await client.close();
  }
}
