import { test as base, expect, type Page } from "@playwright/test";
import { MongoClient, type Db } from "mongodb";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Attempt, StoredContent } from "../../shared/types";

export const test = base.extend<{ db: Db; browserErrors: string[] }>({
  db: async ({}, use) => {
    const uri = process.env.E2E_MONGODB_URI;
    if (!uri) throw new Error("E2E MongoDB URI is missing.");
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    if (!/^ielts_ai_e2e_\d+_\d+$/.test(db.databaseName)) {
      await client.close();
      throw new Error("E2E tests must use an isolated test database.");
    }
    // Keep shared authored seed, clear only this test run's private state.
    await Promise.all(
      [
        "users",
        "sessions",
        "attempts",
        "cards",
        "placements",
        "plans",
        "audio",
        "recordings.files",
        "recordings.chunks",
      ].map((name) => db.collection(name).deleteMany({})),
    );
    try {
      await use(db);
    } finally {
      await client.close();
    }
  },
  browserErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use(errors);
      expect(errors, "Unexpected browser exceptions").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function loginDemo(page: Page, learner: 1 | 2 = 1): Promise<void> {
  await page.goto("/dashboard");
  await page
    .getByRole("button", {
      name: `Học viên ${String(learner).padStart(2, "0")}`,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: /Hiểu thế mạnh của bạn/ }),
  ).toBeVisible();
}

export async function navigate(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator(".page-content")).toBeVisible();
}

export async function noHorizontalOverflow(page: Page): Promise<void> {
  const difference = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(
    difference,
    "The page should fit the viewport without horizontal scrolling",
  ).toBeLessThanOrEqual(1);
}

export async function capturePage(
  page: Page,
  name: string,
  fullPage = true,
): Promise<void> {
  const directory = join(process.cwd(), ".local", "screenshots");
  await mkdir(directory, { recursive: true });
  const prefix = (page.viewportSize()?.width || 1440) < 600 ? "mobile-" : "";
  // Form interactions scroll inputs into view. Restore the document top so a
  // fixed mobile header appears at the top of a full-page screenshot as well.
  await page.evaluate(async () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  await page.screenshot({
    path: join(directory, `${prefix}${name}.png`),
    fullPage,
  });
}

export async function createAttempt(
  page: Page,
  content: StoredContent,
  mode: "practice" | "exam" = "practice",
): Promise<Attempt> {
  const response = await page.request.post("/api/attempts", {
    data: { contentId: content.id, mode },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  const body: { attempt: Attempt } = await response.json();
  return body.attempt;
}

export async function lesson(
  db: Db,
  skill: StoredContent["skill"],
  format: StoredContent["format"] = "lesson",
  options: Record<string, unknown> = {},
): Promise<StoredContent> {
  const record = await db
    .collection<StoredContent>("content")
    .findOne({ skill, format, ...options });
  if (!record) throw new Error(`Missing authored ${skill} ${format}`);
  return record;
}

export async function getAttempt(page: Page, id: string): Promise<Attempt> {
  const response = await page.request.get(`/api/attempts/${id}`);
  expect(response.ok(), await response.text()).toBeTruthy();
  const body: { attempt: Attempt } = await response.json();
  return body.attempt;
}
