import "dotenv/config";
import { connectDatabase, seedDatabase } from "../server/storage";
const database = await connectDatabase();
try {
  await seedDatabase(database);
  console.log(
    JSON.stringify(
      {
        content: await database.content.countDocuments(),
        vocabulary: await database.vocabulary.countDocuments(),
        placement: await database.placementItems.countDocuments(),
      },
      null,
      2,
    ),
  );
} finally {
  await database.client.close();
}
