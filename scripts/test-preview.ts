import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium, devices, expect, type Page } from "@playwright/test";

const previewUrl = new URL("../docs/preview/index.html", import.meta.url).href;
// Some managed cloud browsers block file://. Only in that case Playwright
// supplies the same HTML at a local origin without opening a real server.
const html = await readFile(
  new URL("../docs/preview/index.html", import.meta.url),
);
const fallbackUrl = "http://127.0.0.1/ielts-preview/";
const screenshots = fileURLToPath(new URL("../.local/", import.meta.url));
await mkdir(screenshots, { recursive: true });

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
}

async function openMenu(page: Page) {
  const menu = page.getByRole("button", { name: "Mở menu", exact: true });
  if (await menu.isVisible()) await menu.click();
}

async function navigate(page: Page, path: string) {
  await openMenu(page);
  if (path.startsWith("/practice/")) {
    await page.getByRole("link", { name: /Luyện kỹ năng/ }).click();
    await page
      .locator(`a.practice-hub-card.skill-${path.split("/")[2]}`)
      .click();
  } else {
    const labels: Record<string, string> = {
      "/dashboard": "Tổng quan",
      "/placement": "Kiểm tra đầu vào",
      "/practice": "Luyện kỹ năng",
      "/vocabulary": "Sổ từ vựng",
      "/history": "Lịch sử học tập",
    };
    await page
      .getByRole("link", {
        name: path === "/practice" ? /Luyện kỹ năng/ : labels[path],
        exact: path !== "/practice",
      })
      .click();
  }
  await expect(page).toHaveURL(new RegExp(`#${path}$`));
}

async function fillQuestions(page: Page) {
  const questions = page.locator("fieldset.practice-question");
  await expect(questions.first()).toBeVisible();
  for (let index = 0; index < (await questions.count()); index++) {
    const question = questions.nth(index);
    const choices = question.getByRole("radio");
    if (await choices.count()) await choices.first().check();
    else await question.getByRole("textbox").fill("test answer");
  }
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});

try {
  for (const mode of ["desktop", "mobile"] as const) {
    const context = await browser.newContext(
      mode === "desktop"
        ? { viewport: { width: 1440, height: 1000 } }
        : { ...devices["iPhone 13"] },
    );
    const attemptedNetwork: string[] = [];
    await context.route("**/*", async (route) => {
      const url = route.request().url();
      if (
        url === fallbackUrl &&
        route.request().resourceType() === "document"
      ) {
        await route.fulfill({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body: html,
        });
      } else if (/^(file|data|blob):/.test(url)) await route.continue();
      else {
        attemptedNetwork.push(url);
        await route.abort();
      }
    });
    let page = await context.newPage();
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    const marker = `${mode}-preview-resilience`;

    let transport = "file://";
    try {
      await page.goto(previewUrl);
    } catch (error: unknown) {
      if (
        !(error instanceof Error) ||
        !error.message.includes("ERR_BLOCKED_BY_ADMINISTRATOR")
      )
        throw error;
      transport = "managed-browser local document fallback";
      // The blocked document may still be navigating to its error interstitial.
      await page.close();
      page = await context.newPage();
      page.on("pageerror", (error) => browserErrors.push(error.message));
      await page.goto(fallbackUrl);
    }
    await expect(
      page.getByRole("heading", { name: "Chào mừng trở lại." }),
    ).toBeVisible();
    await expect(page.locator(".preview-banner")).toContainText(
      "AI chưa kết nối",
    );
    await expect(page.locator(".auth-form")).toBeHidden();
    await noOverflow(page);
    await page
      .getByRole("button", { name: "Học viên 01", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /Hành trình của bạn/ }),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat-card")
        .filter({ hasText: "Bài đã hoàn thành" })
        .locator(".stat-number"),
    ).toHaveText("0bài");
    await expect(
      page.locator(".stat-card").filter({ hasText: "Overall Band" }),
    ).toContainText("Cần kết quả đủ 4 kỹ năng");
    await noOverflow(page);

    await navigate(page, "/placement");
    await page
      .getByRole("button", { name: "Bắt đầu kiểm tra", exact: true })
      .click();
    const seen = new Set<string>();
    for (let index = 0; index < 15; index++) {
      await expect(
        page.getByRole("progressbar", { name: "Tiến độ kiểm tra" }),
      ).toHaveAttribute("aria-valuenow", String(index));
      const question = await page.locator(".placement-question").innerText();
      assert(!seen.has(question), "Placement repeated a question");
      seen.add(question);
      await page.locator("label.placement-option").first().click();
      await page
        .getByRole("button", {
          name: index === 14 ? "Hoàn thành kiểm tra" : "Câu tiếp theo",
          exact: true,
        })
        .click();
    }
    assert.equal(seen.size, 15);
    await expect(
      page.getByRole("heading", { name: "Hiểu kết quả. Biết bước tiếp theo." }),
    ).toBeVisible();
    await noOverflow(page);

    await navigate(page, "/practice/reading");
    await fillQuestions(page);
    await page.getByRole("button", { name: "Nộp bài & xem kết quả" }).click();
    await expect(
      page.getByRole("heading", { name: "Đối chiếu đáp án" }),
    ).toBeVisible();
    await expect(page.locator(".feedback-score")).toContainText(
      "Band tham khảo",
    );
    await noOverflow(page);
    await navigate(page, "/history");
    await expect(page.locator(".history-row")).toHaveCount(2);

    await navigate(page, "/vocabulary");
    await expect(page.getByRole("table")).toBeVisible();
    await page
      .getByRole("button", { name: "Thêm từ mới", exact: true })
      .first()
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Từ / cụm từ").fill(marker);
    await dialog.getByLabel("Nghĩa tiếng Việt").fill("khả năng phục hồi");
    await dialog
      .getByLabel("Ví dụ (tùy chọn)")
      .fill("Resilience helps learners keep progressing.");
    await dialog.getByRole("button", { name: "Lưu từ" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Lật thẻ", exact: true }),
    ).toContainText(marker);
    await page.getByRole("button", { name: "Lật thẻ", exact: true }).click();
    await page.getByRole("button", { name: /^Dễ/ }).click();
    await page.reload();
    const row = page.getByRole("row").filter({ hasText: marker });
    await expect(row.getByRole("cell").nth(3)).toHaveText("1");
    await expect(row).not.toContainText("Đến hạn");
    await noOverflow(page);

    await navigate(page, "/practice/writing");
    await page
      .getByRole("button", { name: "Task 2 · Bài luận", exact: true })
      .click();
    await expect(page.locator(".word-count")).toContainText("Task 2");
    const essay =
      "Public transport can reduce pollution. Cities should support reliable buses.\n\nFor example, good services help commuters travel without cars.";
    await page
      .getByRole("textbox", { name: "Bài viết bằng tiếng Anh" })
      .fill(essay);
    await expect(page.locator(".draft-status")).toHaveText(
      "Đã lưu trên thiết bị",
    );
    await page.reload();
    await page
      .getByRole("button", { name: "Task 2 · Bài luận", exact: true })
      .click();
    await expect(page.locator(".word-count")).toContainText("Task 2");
    await expect(
      page.getByRole("textbox", { name: "Bài viết bằng tiếng Anh" }),
    ).toHaveValue(essay);
    await page.getByRole("button", { name: "Nhận phản hồi bài viết" }).click();
    await expect(page.locator(".feedback-summary")).toContainText(
      "AI chưa kết nối nên chưa chấm band",
    );
    await expect(page.locator(".feedback-score")).toContainText(
      "Phản hồi luyện tập",
    );
    await expect(page.locator(".feedback-score > strong")).toHaveText("");
    await expect(
      page.locator(".criterion .section-heading > strong"),
    ).toHaveText(["—", "—", "—", "—"]);
    await expect(page.locator(".paragraph-feedback .number-dot")).toHaveText([
      "1",
      "2",
    ]);
    await noOverflow(page);

    await navigate(page, "/practice/speaking");
    await page
      .getByRole("textbox", { name: /^Bản chép lời/ })
      .fill(
        "Um, I enjoy visiting parks because they offer quiet places to relax. Uh, my city needs more green space.",
      );
    await page.getByRole("button", { name: "Nhận phản hồi bài nói" }).click();
    await expect(
      page.getByRole("heading", { name: "Bản ghi lời nói", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".feedback-summary")).toContainText(
      "Chưa chấm band, nhận diện ghi âm hoặc phân tích phát âm",
    );
    await expect(
      page.locator(".criterion .section-heading > strong"),
    ).toHaveText(["—", "—", "—", "—"]);
    await noOverflow(page);

    await navigate(page, "/practice/listening");
    await expect(page.locator(".section-overview .section-dot")).toHaveCount(4);
    await page
      .getByRole("button", { name: "Hiện bản chép lời để ôn tập" })
      .click();
    await expect(page.locator("#listening-transcript")).toContainText("Friday");
    await page
      .getByRole("button", { name: "Ẩn bản chép lời", exact: true })
      .click();
    await fillQuestions(page);
    await page.getByRole("button", { name: "Nộp bài & xem kết quả" }).click();
    await expect(
      page.getByRole("heading", { name: "Đối chiếu đáp án" }),
    ).toBeVisible();
    await noOverflow(page);

    await navigate(page, "/history");
    await expect(page.locator(".history-row")).toHaveCount(5);
    await page.getByRole("button", { name: "Writing", exact: true }).click();
    await expect(page.locator(".history-row")).toHaveCount(1);
    await expect(page.locator(".history-row-score")).toContainText("Đã luyện");
    await page.locator(".history-row").click();
    await expect(
      page.getByRole("heading", { name: "Nhận xét từng đoạn văn" }),
    ).toBeVisible();
    await navigate(page, "/dashboard");
    await expect(
      page
        .locator(".stat-card")
        .filter({ hasText: "Bài đã hoàn thành" })
        .locator(".stat-number"),
    ).toHaveText("5bài");
    await expect(
      page.locator(".stat-card").filter({ hasText: "Overall Band" }),
    ).toContainText("Cần kết quả đủ 4 kỹ năng");
    await noOverflow(page);
    if (mode === "mobile") {
      await expect
        .poll(() =>
          page
            .locator(".sidebar")
            .evaluate((element) => element.getBoundingClientRect().right),
        )
        .toBeLessThanOrEqual(0);
    }
    await page.mouse.move(1000, 0);
    await page.screenshot({
      path: `${screenshots}/preview-${mode}.png`,
      fullPage: true,
      animations: "disabled",
    });

    await openMenu(page);
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Chào mừng trở lại." }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Học viên 02", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: /Hành trình của bạn/ }),
    ).toBeVisible();
    await expect(
      page
        .locator(".stat-card")
        .filter({ hasText: "Bài đã hoàn thành" })
        .locator(".stat-number"),
    ).toHaveText("0bài");
    await navigate(page, "/history");
    await expect(page.locator(".history-row")).toHaveCount(0);
    await navigate(page, "/vocabulary");
    await expect(
      page.getByRole("heading", { name: /Để kiến thức ở lại lâu hơn/ }),
    ).toBeVisible();
    await expect(page.locator(".vocab-library")).not.toContainText(marker);

    // Browser storage is editable. Corrupt nested FSRS data should recover
    // to a usable clean preview rather than breaking every API call.
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (value) =>
          value.startsWith("IELTSCompassPreview:") &&
          value.endsWith(":learner:1"),
      );
      if (!key) throw new Error("Missing persisted preview learner");
      const state = JSON.parse(localStorage.getItem(key)!) as {
        cards: { scheduler: string }[];
      };
      if (!state.cards.length) throw new Error("Missing reviewed FSRS card");
      state.cards[0].scheduler = "{invalid JSON";
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Để kiến thức ở lại lâu hơn/ }),
    ).toBeVisible();
    await openMenu(page);
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
    await page
      .getByRole("button", { name: "Học viên 01", exact: true })
      .click();
    await expect(
      page
        .locator(".stat-card")
        .filter({ hasText: "Bài đã hoàn thành" })
        .locator(".stat-number"),
    ).toHaveText("0bài");
    await navigate(page, "/vocabulary");
    await expect(page.locator(".vocab-library")).not.toContainText(marker);
    await page
      .getByRole("button", { name: "Thêm từ mới", exact: true })
      .first()
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Từ / cụm từ")
      .fill("corrupt-date-regression");
    await page
      .getByRole("dialog")
      .getByLabel("Nghĩa tiếng Việt")
      .fill("kiểm tra ngày không hợp lệ");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Lưu từ" })
      .click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (value) =>
          value.startsWith("IELTSCompassPreview:") &&
          value.endsWith(":learner:1"),
      );
      if (!key) throw new Error("Missing persisted preview learner");
      const state = JSON.parse(localStorage.getItem(key)!) as {
        cards: { scheduler: string }[];
      };
      const scheduler = JSON.parse(state.cards[0].scheduler) as Record<
        string,
        unknown
      >;
      scheduler.due = "invalid-date";
      state.cards[0].scheduler = JSON.stringify(scheduler);
      localStorage.setItem(key, JSON.stringify(state));
    });
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /Để kiến thức ở lại lâu hơn/ }),
    ).toBeVisible();
    await expect(page.locator(".vocab-library")).not.toContainText(
      "corrupt-date-regression",
    );
    await navigate(page, "/dashboard");
    await expect(
      page.getByRole("heading", { name: /Hành trình của bạn/ }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toHaveCount(0);
    assert.deepEqual(browserErrors, []);
    assert.deepEqual(attemptedNetwork, []);
    console.log(
      `${mode} (${transport}): placement, 4 skills, persisted vocabulary, isolated histories, truthful offline feedback, corrupt FSRS recovery, no network, no browser errors or horizontal overflow PASS`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
