import { defineConfig, devices } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
const runId = process.env.IELTS_E2E_RUN_ID || String(process.pid);
process.env.IELTS_E2E_RUN_ID = runId;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: `./test-results/run-${runId}`,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    permissions: ["microphone"],
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: [
        "--no-sandbox",
        "--use-fake-device-for-media-stream",
        "--use-fake-ui-for-media-stream",
      ],
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_PATH: join(tmpdir(), `ielts-compass-e2e-${process.pid}.sqlite`),
      NODE_ENV: "test",
      APP_ORIGIN: "http://127.0.0.1:5173",
      OPENAI_API_KEY: "",
      IELTS_OPENAI_API_KEY: "",
      ELEVENLABS_API_KEY: "",
      AZURE_SPEECH_KEY: "",
      SUPABASE_URL: "",
      SUPABASE_ANON_KEY: "",
    },
  },
});
