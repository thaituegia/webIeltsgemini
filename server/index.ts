import "dotenv/config";
import { createApp } from "./app";
import { connectDatabase, seedDatabase } from "./storage";

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT không hợp lệ.");
const production = process.env.NODE_ENV === "production";
if (production) {
  let origin: URL;
  try {
    origin = new URL(process.env.APP_ORIGIN || "");
  } catch {
    throw new Error(
      "Production cần APP_ORIGIN HTTPS hợp lệ để bảo vệ cookie và kiểm tra Origin.",
    );
  }
  if (origin.protocol !== "https:" || origin.username || origin.password)
    throw new Error("Production cần APP_ORIGIN HTTPS hợp lệ.");
  process.env.APP_ORIGIN = origin.origin;
}
const database = await connectDatabase();
await seedDatabase(database);
const app = createApp(database);
const server = app.listen(port, "0.0.0.0", () =>
  console.log(`IELTS AI API ready on port ${port}; MongoDB connected`),
);
server.requestTimeout = 16 * 60 * 1000;
server.timeout = 16 * 60 * 1000;
let closing = false;
async function shutdown(): Promise<void> {
  if (closing) return;
  closing = true;
  server.close(async () => {
    await database.client.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => {
  void shutdown();
});
process.on("SIGINT", () => {
  void shutdown();
});
