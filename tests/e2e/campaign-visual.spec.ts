import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Page, TestInfo } from "@playwright/test";
import type { DuoAssessmentView } from "../../shared/duo";
import {
  test,
  expect,
  duoLogin,
  duoSnapshot,
  finishPlacement,
  objectiveAttempt,
  noOverflow,
} from "./duo-fixtures";

// Screenshots contain synthetic accounts in a disposable fixture database only.
// These checks test font availability, usable navigation and server-owned rewards,
// rather than freezing the CSS implementation in snapshots.
const vietnameseSample =
  "Một kỹ năng. Một bước tiến. Đường đến đỉnh núi, thử thách và những phần thưởng.";

async function screenshot(page: Page, info: TestInfo, name: string) {
  const directory = join(process.cwd(), ".local", "campaign-v5");
  await mkdir(directory, { recursive: true });
  await page.screenshot({
    path: join(directory, `${info.project.name}-${name}.png`),
    fullPage: true,
  });
  if (["auth", "dashboard", "library", "plan"].includes(name))
    await page.screenshot({
      path: join(directory, `${info.project.name}-${name}-viewport.png`),
      fullPage: false,
    });
  if (name.startsWith("plan")) {
    await page.locator(".duo-campaign-map").screenshot({
      path: join(directory, `${info.project.name}-${name}-board.png`),
    });
    await page.locator(".duo-rewards").screenshot({
      path: join(directory, `${info.project.name}-${name}-rewards.png`),
    });
  }
}

async function vietnameseFont(page: Page) {
  const result = await page.evaluate(async (sample) => {
    await document.fonts.ready;
    const weights = [400, 600, 700];
    const loaded = await Promise.all(
      weights.map(async (weight) => {
        const faces = await document.fonts.load(
          `${weight} 20px "Be Vietnam Pro"`,
          sample,
        );
        return faces.length > 0 && faces.every((face) => face.status === "loaded");
      }),
    );
    return {
      loaded,
      families: [document.body, ...document.querySelectorAll("h1, h2")].map(
        (element) => getComputedStyle(element).fontFamily,
      ),
    };
  }, vietnameseSample);
  expect(result.loaded, "Vietnamese font files must load for all text weights").toEqual([
    true,
    true,
    true,
  ]);
  expect(result.families.length).toBeGreaterThan(1);
  for (const family of result.families)
    expect(family, "Headings and body must use the Vietnamese-capable font").toContain(
      "Be Vietnam Pro",
    );
}

test("campaign pages load Vietnamese fonts and remain usable on desktop and mobile", async ({
  page,
  browser,
  duoServer,
}, info) => {
  test.setTimeout(150_000);
  const unavailableAssets: string[] = [];
  page.on("response", (response) => {
    if (
      /\.(?:woff2?|webp|png|svg)(?:\?|$)/i.test(response.url()) &&
      response.status() >= 400
    )
      unavailableAssets.push(`${response.status()} ${new URL(response.url()).pathname}`);
  });
  page.on("requestfailed", (request) => {
    if (/\.(?:woff2?|webp|png|svg)(?:\?|$)/i.test(request.url()))
      unavailableAssets.push(new URL(request.url()).pathname);
  });
  await page.goto(`${duoServer.url}/dashboard`);
  await expect(page.getByLabel("Số điện thoại", { exact: true })).toBeVisible();
  await vietnameseFont(page);
  await noOverflow(page);
  await screenshot(page, info, "auth");
  await duoLogin(page, duoServer, 0);
  await finishPlacement(page, duoServer, false);
  const partnerContext = await browser.newContext({ baseURL: duoServer.url });
  try {
    const partner = await partnerContext.newPage();
    await duoLogin(partner, duoServer, 1);
    await finishPlacement(partner, duoServer, false);
    for (const route of [
      "dashboard",
      "library",
      "exams",
      "placement",
      "plan",
      "vocabulary",
      "history",
      "errors",
      "settings",
    ]) {
      await page.goto(`${duoServer.url}/${route}`);
      await expect(page.locator(".main-content h1")).toBeVisible();
      await expect(page.locator(".main-content .loading")).toHaveCount(0);
      await vietnameseFont(page);
      await noOverflow(page);
      if (route === "library") {
        await expect(page.locator(".content-card").first()).toBeVisible();
        await expect(page.getByText("Một kỹ năng. Một bước tiến.", { exact: true })).toBeVisible();
      }
      if (route === "plan") {
        await expect(page.locator(".duo-board-stop")).toHaveCount(10);
        await expect(page.locator(".duo-reward")).toHaveCount(4);
        await expect(page.locator(".duo-reward.earned")).toHaveCount(0);
        await expect(page.locator(".duo-board-stop.locked")).toHaveCount(5);
      }
      await screenshot(page, info, route);
    }
  } finally {
    await partnerContext.close();
  }
  expect(unavailableAssets, "Self-hosted fonts and campaign illustrations must load").toEqual([]);
});

test("campaign pieces and rewards show actual shared completions and gate passes", async ({
  page,
  browser,
  duoServer,
}, info) => {
  test.setTimeout(150_000);
  await duoLogin(page, duoServer, 0);
  await finishPlacement(page, duoServer, false);
  const partnerContext = await browser.newContext({ baseURL: duoServer.url });
  const partner = await partnerContext.newPage();
  try {
    await duoLogin(partner, duoServer, 1);
    await finishPlacement(partner, duoServer, false);
    const initial = await duoSnapshot(page);
    const band = initial.bands.find((item) => item.band === initial.path!.currentBand)!;
    const first = band.lessons[0];
    const complete = async (learner: Page, contentId: string, lessonId: string) => {
      const attempt = await objectiveAttempt(learner, duoServer, contentId);
      const response = await learner.request.post(`/api/duo/lessons/${lessonId}/complete`, {
        data: { attemptId: attempt.id },
      });
      expect(response.ok(), await response.text()).toBeTruthy();
    };
    await complete(page, first.contentId!, first.id);
    await page.goto(`${duoServer.url}/plan`);
    await expect(page.locator(".duo-board-stop.partial")).toHaveCount(1);
    await expect(page.locator(".duo-reward.earned")).toHaveCount(0);
    await expect(page.getByLabel("Các mốc hai người đã cùng hoàn thành").locator("strong").first()).toHaveText("0");
    await complete(partner, first.contentId!, first.id);
    await page.reload();
    await expect(page.locator(".duo-board-stop.complete")).toHaveCount(1);
    await expect(page.locator(".duo-reward.earned")).toHaveCount(1);
    await expect(page.locator(".duo-reward").first()).toContainText("Đã mở huy hiệu");
    await expect(page.getByLabel("Các mốc hai người đã cùng hoàn thành").locator("strong").first()).toHaveText("1");
    await noOverflow(page);
    await screenshot(page, info, "plan-first-milestone");
    // The map scrolls to the corresponding real lesson, including a locked stop.
    await page.getByRole("link", { name: /^Buổi 6:/ }).click();
    await expect(page.getByTestId("duo-lesson-6")).toBeFocused();
    await expect(page.getByTestId("duo-lesson-6").getByRole("button")).toBeDisabled();
    for (const lesson of band.lessons.slice(1, 5))
      for (const learner of [page, partner])
        await complete(learner, lesson.contentId!, lesson.id);
    const gate = band.gates[0];
    for (const learner of [page, partner]) {
      const start = await learner.request.post(`/api/duo/gates/${gate.id}/start`);
      expect(start.ok(), await start.text()).toBeTruthy();
      const assessment: DuoAssessmentView = (await start.json()).assessment;
      for (const part of assessment.parts)
        await objectiveAttempt(learner, duoServer, part.contentId, true, assessment.id);
      if (learner === page) {
        await page.reload();
        await expect(page.locator(".duo-reward.earned")).toHaveCount(1);
        await expect(page.locator(".duo-board-stop.locked")).toHaveCount(5);
      }
    }
    await page.reload();
    await expect(page.locator(".duo-board-stop.complete")).toHaveCount(5);
    await expect(page.locator(".duo-board-stop.locked")).toHaveCount(0);
    await expect(page.locator(".duo-reward.earned")).toHaveCount(2);
    await expect(page.locator(".duo-reward").nth(2)).toContainText("Chưa mở huy hiệu");
    await expect(page.locator(".duo-reward").nth(3)).toContainText("Chưa mở huy hiệu");
    await expect(page.getByLabel("Các mốc hai người đã cùng hoàn thành").locator("strong").nth(1)).toHaveText("1");
    expect((await duoSnapshot(page)).path?.currentBand).toBe(band.band);
    await noOverflow(page);
    await screenshot(page, info, "plan-first-gate");
  } finally {
    await partnerContext.close();
  }
});
