import { test, expect, type Page } from "@playwright/test";
import type { Exercise, Feedback, VocabCard } from "../../shared/types";

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
async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}
async function navigate(page: Page, path: string) {
  const menu = page.getByRole("button", { name: "Mở menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  if (path.startsWith("/practice/")) {
    await page.getByRole("link", { name: /Luyện kỹ năng/ }).click();
    const skill = path.split("/")[2];
    await page.locator(`a.practice-hub-card.skill-${skill}`).click();
    return;
  }
  const label = path === "/vocabulary" ? "Sổ từ vựng" : "Lịch sử học tập";
  await page.getByRole("link", { name: label, exact: true }).click();
}

test("learner completes placement, all four skills and a persisted FSRS review with isolated history", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const learner = testInfo.project.name === "mobile" ? "02" : "01";
  const otherLearner = learner === "01" ? "02" : "01";
  const marker = `${testInfo.project.name}-resilience`;
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Chào mừng trở lại." }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page
    .getByRole("button", { name: new RegExp(`Học viên ${learner}`) })
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
  await expectNoHorizontalOverflow(page);

  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Mở menu" }).click();
  await page
    .getByRole("link", { name: "Kiểm tra đầu vào", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Bắt đầu kiểm tra", exact: true })
    .click();
  const seen = new Set<string>();
  for (let index = 0; index < 15; index++) {
    await expect(
      page.getByRole("progressbar", { name: "Tiến độ kiểm tra" }),
    ).toHaveAttribute("aria-valuenow", String(index));
    const question = await page.locator(".placement-question").innerText();
    expect(seen.has(question)).toBe(false);
    seen.add(question);
    await page.locator("label.placement-option").first().click();
    await expect(page.getByRole("radio").first()).toBeChecked();
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/placement/answer") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", {
        name: index === 14 ? "Hoàn thành kiểm tra" : "Câu tiếp theo",
        exact: true,
      })
      .click();
    expect((await saved).status()).toBe(200);
  }
  expect(seen.size).toBe(15);
  await expect(
    page.getByRole("heading", { name: "Hiểu kết quả. Biết bước tiếp theo." }),
  ).toBeVisible();

  const readingLoaded = page.waitForResponse((response) =>
    response.url().includes("/api/exercises/reading"),
  );
  await navigate(page, "/practice/reading");
  const reading = (
    (await (await readingLoaded).json()) as { exercise: Exercise }
  ).exercise;
  await fillQuestions(page);
  const readingSaved = page.waitForResponse((response) =>
    response.url().endsWith("/api/practice/submit"),
  );
  await page.getByRole("button", { name: "Nộp bài & xem kết quả" }).click();
  const readingResponse = await readingSaved;
  expect(readingResponse.status()).toBe(200);
  const readingResult = ((await readingResponse.json()) as { result: Feedback })
    .result;
  expect(readingResult.total).toBe(reading.questions.length);
  await expect(
    page.getByRole("heading", { name: "Đối chiếu đáp án" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await navigate(page, "/vocabulary");
  await expect(page.getByRole("table")).toBeVisible();
  for (const word of reading.vocabulary)
    await expect(page.getByRole("table")).toContainText(word.front);
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
  await expect(
    page.getByRole("button", { name: "Xem lại mặt trước", exact: true }),
  ).toContainText("khả năng phục hồi");
  const reviewSaved = page.waitForResponse((response) =>
    /\/api\/vocabulary\/[^/]+\/review$/.test(response.url()),
  );
  await page.getByRole("button", { name: /^Dễ/ }).click();
  const review = await reviewSaved;
  expect(review.status()).toBe(200);
  const reviewed = ((await review.json()) as { card: VocabCard }).card;
  expect(reviewed.reps).toBe(1);
  expect(reviewed.stability).toBeGreaterThan(0);
  expect(new Date(reviewed.dueDate).getTime()).toBeGreaterThan(Date.now());
  await page.reload();
  const vocabularyRow = page.getByRole("row").filter({ hasText: marker });
  await expect(vocabularyRow.getByRole("cell").nth(3)).toHaveText("1");
  await expect(vocabularyRow).not.toContainText("Đến hạn");
  await expectNoHorizontalOverflow(page);

  await navigate(page, "/practice/writing");
  await page
    .getByRole("button", { name: "Task 2 · Bài luận", exact: true })
    .click();
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
  await expect(
    page.getByRole("textbox", { name: "Bài viết bằng tiếng Anh" }),
  ).toHaveValue(essay);
  const writingSaved = page.waitForResponse((response) =>
    response.url().endsWith("/api/writing/evaluate"),
  );
  await page.getByRole("button", { name: "Nhận phản hồi bài viết" }).click();
  const writingResponse = await writingSaved;
  expect(writingResponse.status()).toBe(200);
  const writingResult = ((await writingResponse.json()) as { result: Feedback })
    .result;
  expect(writingResult.score).toBeNull();
  expect(
    writingResult.criteria.every((criterion) => criterion.band === null),
  ).toBe(true);
  await expect(
    page.getByText(/Chưa cấu hình OpenAI nên bài chưa được chấm band/),
  ).toBeVisible();
  await expect(
    page.locator(".paragraph-feedback .number-dot").first(),
  ).toHaveText("1");
  await expectNoHorizontalOverflow(page);
  const nextWriting = page.waitForResponse((response) =>
    response.url().includes("/api/exercises/writing"),
  );
  await page
    .getByRole("button", { name: "Bắt đầu lượt luyện mới", exact: true })
    .click();
  const nextAssignment = (
    (await (await nextWriting).json()) as { exercise: Exercise }
  ).exercise;
  expect(nextAssignment.id).not.toBe(
    (writingResponse.request().postDataJSON() as { exerciseId: string })
      .exerciseId,
  );
  await expect(
    page.getByRole("textbox", { name: "Bài viết bằng tiếng Anh" }),
  ).toBeEditable();
  await expect(
    page.getByRole("textbox", { name: "Bài viết bằng tiếng Anh" }),
  ).toHaveValue("");

  await navigate(page, "/practice/speaking");
  await page
    .getByRole("textbox", { name: /^Bản chép lời/ })
    .fill(
      "Um, I enjoy visiting parks because they offer quiet places to relax. Uh, my city needs more green space.",
    );
  const speakingSaved = page.waitForResponse((response) =>
    response.url().endsWith("/api/speaking/evaluate"),
  );
  await page.getByRole("button", { name: "Nhận phản hồi bài nói" }).click();
  const speakingResponse = await speakingSaved;
  expect(speakingResponse.status()).toBe(200);
  expect(await speakingResponse.text()).toContain("event: result");
  await expect(
    page.getByRole("heading", { name: "Bản ghi lời nói", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Chưa có chấm band hoặc phân tích phát âm/),
  ).toBeVisible();

  await navigate(page, "/practice/listening");
  await expect(page.locator(".section-overview .section-dot")).toHaveCount(4);
  await expect(page.locator("#listening-transcript")).toHaveCount(0);
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

  await navigate(page, "/history");
  await expect(page.locator(".history-row")).toHaveCount(5);
  await page.getByRole("button", { name: "Writing", exact: true }).click();
  await expect(page.locator(".history-row")).toHaveCount(1);
  await page.locator(".history-row").click();
  await expect(
    page.getByRole("heading", { name: "Nhận xét từng đoạn văn" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);

  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chào mừng trở lại." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: new RegExp(`Học viên ${otherLearner}`) })
    .click();
  await expect(
    page.getByRole("heading", { name: /Hành trình của bạn/ }),
  ).toBeVisible();
  await navigate(page, "/vocabulary");
  await expect(
    page.getByRole("heading", { name: /Để kiến thức ở lại lâu hơn/ }),
  ).toBeVisible();
  await expect(page.locator(".vocab-library")).not.toContainText(marker);
  expect(browserErrors).toEqual([]);
});

test("a registered learner can log out and sign back in through the real authentication form", async ({
  page,
}, testInfo) => {
  const email = `${testInfo.project.name}@example.com`;
  const password = "A-good-browser-password-123";
  await page.goto("/");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await page
    .getByLabel("Tên của bạn", { exact: true })
    .fill(`${testInfo.project.name} learner`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page
    .getByRole("combobox", { name: "Band mục tiêu", exact: true })
    .selectOption("6.5");
  const registered = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/register"),
  );
  await page
    .locator(".auth-form")
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  expect((await registered).status()).toBe(201);
  await expect(
    page.getByRole("heading", { name: /Hành trình của bạn/ }),
  ).toBeVisible();
  await expect(
    page.locator(".stat-card").filter({ hasText: "Band mục tiêu" }),
  ).toContainText("6.5");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("button", { name: "Đăng xuất", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Chào mừng trở lại." }),
  ).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  const loggedIn = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/login"),
  );
  await page
    .locator(".auth-form")
    .getByRole("button", { name: "Đăng nhập", exact: true })
    .click();
  expect((await loggedIn).status()).toBe(200);
  await expect(
    page.getByRole("heading", { name: /Hành trình của bạn/ }),
  ).toBeVisible();
  await expect(
    page.locator(".stat-card").filter({ hasText: "Band mục tiêu" }),
  ).toContainText("6.5");
  await expectNoHorizontalOverflow(page);
});

test("a real browser microphone produces mono 16 kHz WAV and can switch to offline text practice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, options) => {
      if (
        String(input).includes("/api/speaking/evaluate") &&
        options?.body instanceof FormData
      ) {
        const audio = options.body.get("audio");
        if (audio instanceof Blob) {
          const bytes = new Uint8Array(await audio.arrayBuffer());
          (
            window as typeof window & {
              __ieltsUpload?: {
                mimeType: string;
                size: number;
                header: number[];
              };
            }
          ).__ieltsUpload = {
            mimeType: audio.type,
            size: audio.size,
            header: Array.from(bytes.slice(0, 44)),
          };
        }
      }
      return originalFetch(input, options);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Học viên 01", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Hành trình của bạn/ }),
  ).toBeVisible();
  await navigate(page, "/practice/speaking");
  await page
    .getByRole("button", { name: "Bắt đầu ghi âm", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Dừng ghi âm", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".recording-time")).not.toHaveText("00:00");
  await page.getByRole("button", { name: "Dừng ghi âm", exact: true }).click();
  await expect(page.locator("audio.recording-preview")).toBeVisible();
  const wav = await page
    .locator("audio.recording-preview")
    .evaluate(async (element) => {
      const response = await fetch((element as HTMLAudioElement).src);
      const bytes = new Uint8Array(await response.arrayBuffer());
      return Array.from(bytes.slice(0, 44));
    });
  const header = Buffer.from(wav);
  expect(header.toString("ascii", 0, 4)).toBe("RIFF");
  expect(header.toString("ascii", 8, 12)).toBe("WAVE");
  expect(header.readUInt16LE(20)).toBe(1);
  expect(header.readUInt16LE(22)).toBe(1);
  expect(header.readUInt32LE(24)).toBe(16_000);
  expect(header.readUInt16LE(34)).toBe(16);
  const submitted = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/speaking/evaluate") &&
      request.method() === "POST",
  );
  const responded = page.waitForResponse((response) =>
    response.url().endsWith("/api/speaking/evaluate"),
  );
  await page.getByRole("button", { name: "Nhận phản hồi bài nói" }).click();
  expect((await submitted).headers()["content-type"]).toContain(
    "multipart/form-data; boundary=",
  );
  const upload = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __ieltsUpload?: { mimeType: string; size: number; header: number[] };
        }
      ).__ieltsUpload,
  );
  expect(upload?.mimeType).toBe("audio/wav");
  expect(upload?.size).toBeGreaterThan(32_000);
  expect(Buffer.from(upload?.header ?? [])).toEqual(header);
  const response = await responded;
  expect(response.status()).toBe(200); // Streaming provider errors arrive as an explicit error event.
  expect(response.headers()["content-type"]).toContain("text/event-stream");
  await expect(page.getByRole("alert")).toContainText("OpenAI");
  await page
    .getByRole("button", {
      name: "Xóa bản ghi âm để dùng bản chép lời",
      exact: true,
    })
    .click();
  await expect(page.locator("audio.recording-preview")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: /^Bản chép lời/ })
    .fill("My city has reliable buses and quiet parks where people can relax.");
  await page.getByRole("button", { name: "Nhận phản hồi bài nói" }).click();
  await expect(
    page.getByRole("heading", { name: "Bản ghi lời nói", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/Chưa có chấm band hoặc phân tích phát âm/),
  ).toBeVisible();
});
