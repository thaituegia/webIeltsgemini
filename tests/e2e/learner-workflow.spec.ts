import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import type { CardRecord, UserRecord } from "../../server/storage";
import type { StudyPlan } from "../../shared/types";
import {
  test,
  expect,
  loginDemo,
  navigate,
  noHorizontalOverflow,
  lesson,
  createAttempt,
} from "./fixtures";

async function logout(page: Page): Promise<void> {
  const menu = page.getByRole("button", { name: "Mở menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chào mừng bạn trở lại." }),
  ).toBeVisible();
}

async function register(
  page: Page,
  name: string,
  email: string,
): Promise<void> {
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  const form = page.locator(".auth-form");
  await form.getByLabel("Tên của bạn").fill(name);
  await form.getByLabel("Email", { exact: true }).fill(email);
  await form.getByLabel("Mật khẩu", { exact: true }).fill("Ielts-Study-2026!");
  await form.getByLabel("Mục tiêu band").selectOption("6.5");
  await form
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page.locator(".main-content")).toBeVisible();
  if (!page.url().endsWith("/dashboard")) await navigate(page, "/dashboard");
  await expect(
    page.getByRole("heading", { name: "Hiểu thế mạnh của bạn" }),
  ).toBeVisible();
}

test("real accounts save goals, resume history, and keep another learner's data separate", async ({
  page,
  db,
}, testInfo) => {
  await page.goto("/dashboard");
  await register(page, "Minh Anh", "minhanh@example.test");
  await navigate(page, "/settings");
  await page.getByLabel("Ngày dự định thi").fill("2027-02-20");
  await page.getByLabel("Thời gian học mỗi ngày (phút)").fill("60");
  await page.getByLabel("Thời gian học mỗi tuần (phút)").fill("360");
  await page
    .getByRole("combobox", { name: "Reading", exact: true })
    .selectOption("5.5");
  await page
    .getByRole("combobox", { name: "Listening", exact: true })
    .selectOption("4.5");
  await page.getByRole("button", { name: "Lưu thay đổi", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã cập nhật hồ sơ");
  await page.reload();
  await expect(page.getByLabel("Ngày dự định thi")).toHaveValue("2027-02-20");
  await expect(
    page.getByRole("combobox", { name: "Reading", exact: true }),
  ).toHaveValue("5.5");
  const savedProfile = await db
    .collection<UserRecord>("users")
    .findOne({ email: "minhanh@example.test" });
  expect(savedProfile?.examDate).toBe("2027-02-20");
  expect(savedProfile?.passwordHash).toBeTruthy();
  expect(savedProfile?.passwordHash).not.toBe("Ielts-Study-2026!");

  await navigate(page, "/plan");
  const complete = page.getByRole("button", { name: /^Hoàn thành / }).first();
  const taskName = (await complete.getAttribute("aria-label"))?.replace(
    /^Hoàn thành /,
    "",
  );
  expect(taskName).toBeTruthy();
  await complete.click();
  await expect(
    page.getByRole("button", { name: `Bỏ đánh dấu ${taskName}`, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: `Bỏ đánh dấu ${taskName}`, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const planBody: { plan: StudyPlan } = await (
    await page.request.get("/api/plan")
  ).json();
  expect(
    planBody.plan.tasks.some(
      (task) => task.title === taskName && task.completed,
    ),
  ).toBeTruthy();

  const reading = await lesson(db, "reading");
  await createAttempt(page, reading);
  await navigate(page, "/history");
  await expect(
    page.getByRole("heading", { name: reading.title, exact: true }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await navigate(page, "/dashboard");
  await expect(
    page.getByRole("heading", { name: "Hiểu thế mạnh của bạn" }),
  ).toBeVisible();
  await mkdir(join(process.cwd(), ".local", "screenshots"), {
    recursive: true,
  });
  await page.screenshot({
    path: join(
      process.cwd(),
      ".local",
      "screenshots",
      `${testInfo.project.name}.png`,
    ),
    fullPage: true,
  });

  await logout(page);
  await register(page, "Lan Chi", "lanchi@example.test");
  await navigate(page, "/history");
  await expect(
    page.getByRole("heading", {
      name: "Chưa có bài học trong bộ lọc này",
      exact: true,
    }),
  ).toBeVisible();
  await navigate(page, "/settings");
  await expect(page.getByLabel("Ngày dự định thi")).toHaveValue("");
  await logout(page);
  await page
    .locator(".auth-form")
    .getByLabel("Email", { exact: true })
    .fill("minhanh@example.test");
  await page
    .locator(".auth-form")
    .getByLabel("Mật khẩu", { exact: true })
    .fill("Ielts-Study-2026!");
  await page
    .locator(".auth-form")
    .getByRole("button", { name: "Đăng nhập", exact: true })
    .click();
  await expect(page.locator(".main-content")).toBeVisible();
  await navigate(page, "/history");
  await expect(
    page.getByRole("heading", { name: reading.title, exact: true }),
  ).toBeVisible();
});

test("vocabulary filters, meaning details, and a real FSRS review persist after reload", async ({
  page,
  db,
}) => {
  await loginDemo(page);
  await navigate(page, "/vocabulary");
  await page
    .getByLabel("Chủ đề từ vựng", { exact: true })
    .selectOption("Education");
  await page.getByLabel("Cấp độ CEFR", { exact: true }).selectOption("B1");
  const wordCard = page.locator(".vocab-card").first();
  await expect(wordCard).toBeVisible();
  await expect(wordCard).toContainText("Education");
  const word = await wordCard.locator(".vocab-word").innerText();
  await wordCard.locator(".vocab-word").click();
  const detail = page.getByRole("dialog", { name: word, exact: true });
  await expect(
    detail.getByRole("heading", { name: "Collocations", exact: true }),
  ).toBeVisible();
  await expect(
    detail.getByRole("heading", { name: "Ví dụ trong ngữ cảnh", exact: true }),
  ).toBeVisible();
  await detail.getByRole("button", { name: "Đóng", exact: true }).click();
  await wordCard
    .getByRole("button", { name: `Lưu ${word}`, exact: true })
    .click();
  await expect(
    wordCard.getByRole("button", { name: `Đã lưu ${word}`, exact: true }),
  ).toBeDisabled();
  await page.getByRole("tab", { name: /^Ôn hôm nay/ }).click();
  await expect(
    page.getByRole("heading", { name: word, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lật thẻ", exact: true }).click();
  await page.getByRole("button", { name: /Nhớ được/ }).click();
  await expect
    .poll(
      async () =>
        (
          await db
            .collection<CardRecord>("cards")
            .findOne({ userId: "demo-1", word })
        )?.reps,
    )
    .toBe(1);
  const card = await db
    .collection<CardRecord>("cards")
    .findOne({ userId: "demo-1", word });
  expect(card?.stability).toBeGreaterThan(0);
  expect(card?.reviewLog).toHaveLength(1);
  expect(card?.difficulty).toBeGreaterThan(0);
  await page.reload();
  await page.getByRole("tab", { name: /^Từ đã lưu/ }).click();
  const saved = page
    .locator(".saved-card")
    .filter({ has: page.getByRole("heading", { name: word, exact: true }) });
  await expect(saved).toContainText("1 lần ôn");
  await noHorizontalOverflow(page);
  await logout(page);
  await page.getByRole("button", { name: "Học viên 02", exact: true }).click();
  await navigate(page, "/vocabulary");
  await page.getByRole("tab", { name: /^Từ đã lưu/ }).click();
  await expect(
    page.getByRole("heading", { name: "Sổ từ vựng đang chờ bạn", exact: true }),
  ).toBeVisible();
});
