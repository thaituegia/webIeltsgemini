import "dotenv/config";
import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be an integer between 1 and 65535");
const server = createApp().listen(port, process.env.HOST ?? "0.0.0.0", () => {
  console.log(`IELTS Compass API ready on port ${port}`);
});
const shutdown = (): void => {
  server.close(() => process.exit(0));
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
