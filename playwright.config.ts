import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// One real MongoDB database per invocation; never use the developer's learner DB.
const runId = `${Date.now()}_${process.pid}`;
const mongoBase =
  process.env.E2E_MONGODB_BASE_URI || "mongodb://127.0.0.1:27017";
const mongoUrl = new URL(mongoBase);
mongoUrl.pathname = `/ielts_ai_e2e_${runId}`;
// Playwright evaluates this config again inside its workers. Reuse the URI
// inherited from the parent instead of giving fixtures a different database.
const mongoUri = process.env.E2E_MONGODB_URI || mongoUrl.toString();
process.env.E2E_MONGODB_URI = mongoUri;
const chromiumPath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  globalTeardown: "./tests/e2e/cleanup.ts",
  use: {
    baseURL: "http://127.0.0.1:5175",
    browserName: "chromium",
    permissions: ["microphone"],
    acceptDownloads: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: chromiumPath,
      args: [
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5175/api/health",
    timeout: 90_000,
    reuseExistingServer: false,
    env: {
      MONGODB_URI: mongoUri,
      NODE_ENV: "test",
      PORT: "3003",
      API_PORT: "3003",
      WEB_PORT: "5175",
      APP_ORIGIN: "",
      DEMO_ENABLED: "true",
      IELTS_OPENAI_API_KEY: "",
      OPENAI_API_KEY: "",
      ELEVENLABS_API_KEY: "",
      IELTS_AZURE_SPEECH_KEY: "",
      AZURE_SPEECH_KEY: "",
      IELTS_AZURE_SPEECH_REGION: "",
      AZURE_SPEECH_REGION: "",
    },
  },
});
