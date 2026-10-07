import { z } from "zod";
import { randomUUID } from "./crypto";
import { ApiError } from "./errors";
import { sampleExercise, shuffledOptions } from "../server/curriculum";
import {
  addVocabulary,
  answerPlacement,
  dashboard,
  ensureUnsubmitted,
  findExercise,
  publicCard,
  recordFeedback,
  reviewVocabulary,
  startPlacement,
  submitPractice,
} from "../server/learning";
import type { LearnerState, Session } from "../server/db";
import type { Exercise, Feedback, Health } from "../shared/types";

// These keys belong only to the downloadable preview, never the live service.
const namespace = "IELTSCompassPreview:webIeltsgemini:v1";
type Learner = 1 | 2;
const memory = new Map<Learner, LearnerState>();
let activeLearner: Learner | null = null;
let installed = false;
const band = z.number().min(3).max(7).multipleOf(0.5);
const skill = z.enum(["reading", "listening", "writing", "speaking"]);
const cefr = z.enum(["A2", "B1", "B2", "C1"]);
const id = z.string().min(1).max(100);
const task = z.union([z.literal(1), z.literal(2)]);
const source = z.enum(["sample", "ai"]);
const timestamp = z.iso
  .datetime({ offset: true })
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Invalid stored timestamp",
  );
const counter = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const schedulerState = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);
const reviewRating = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
const schedulerCardSchema = z
  .object({
    due: timestamp,
    stability: z.number().nonnegative(),
    difficulty: z.number().min(0).max(10),
    elapsed_days: z.number().nonnegative(),
    scheduled_days: z.number().nonnegative(),
    learning_steps: counter,
    reps: counter,
    lapses: counter,
    state: schedulerState,
    last_review: timestamp.nullable().optional(),
  })
  .superRefine((card, context) => {
    if (
      card.reps > 0 &&
      (card.stability <= 0 || card.difficulty < 1 || !card.last_review)
    ) {
      context.addIssue({
        code: "custom",
        message: "Invalid reviewed FSRS card",
      });
    }
  });
const schedulerLogSchema = z.object({
  rating: z.union([z.literal(0), reviewRating]),
  state: schedulerState,
  due: timestamp,
  stability: z.number().nonnegative(),
  difficulty: z.number().min(0).max(10),
  elapsed_days: z.number().nonnegative(),
  last_elapsed_days: z.number().nonnegative(),
  scheduled_days: z.number().nonnegative(),
  learning_steps: counter,
  review: timestamp,
});
function storedJson(schema: z.ZodType) {
  return z.string().refine((encoded) => {
    try {
      const value: unknown = JSON.parse(encoded);
      return schema.safeParse(value).success;
    } catch {
      return false;
    }
  }, "Invalid stored FSRS JSON");
}
const vocabularySchema = z.strictObject({
  front: z.string().trim().min(1).max(200),
  back: z.string().trim().min(1).max(1000),
  example: z.string().trim().max(1000).default(""),
  cefr: cefr.default("B2"),
});
const exerciseSchema = z.object({
  id,
  skill,
  title: z.string(),
  description: z.string(),
  band: z.number(),
  cefr,
  durationMinutes: z.number(),
  content: z.string(),
  source,
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      speaker: z.string().optional(),
    }),
  ),
  questions: z.array(
    z.object({
      id,
      text: z.string(),
      type: z.enum(["choice", "text"]),
      options: z.array(z.string()).optional(),
    }),
  ),
  vocabulary: z.array(vocabularySchema),
  task: task.optional(),
  chart: z.array(z.object({ label: z.string(), value: z.number() })).optional(),
});
const feedbackSchema = z.object({
  id,
  skill: z.enum(["reading", "listening", "writing", "speaking", "placement"]),
  score: z.number().nullable(),
  maxScore: z.number().optional(),
  correct: z.number().optional(),
  total: z.number().optional(),
  summary: z.string(),
  criteria: z.array(
    z.object({
      name: z.string(),
      band: z.number().nullable(),
      feedback: z.string(),
      evidence: z.array(z.string()),
    }),
  ),
  corrections: z.array(
    z.object({
      original: z.string(),
      suggestion: z.string(),
      explanation: z.string(),
    }),
  ),
  paragraphs: z.array(z.object({ index: z.number(), feedback: z.string() })),
  answers: z
    .array(
      z.object({
        questionId: id,
        userAnswer: z.string(),
        correctAnswer: z.string(),
        correct: z.boolean(),
        explanation: z.string(),
      }),
    )
    .optional(),
  transcript: z.string().optional(),
  fillerCount: z.number().optional(),
  fillerDensity: z.number().optional(),
  wordCount: z.number().optional(),
  pronunciation: z
    .object({
      accuracy: z.number(),
      fluency: z.number(),
      completeness: z.number().nullable(),
      prosody: z.number().optional(),
    })
    .nullable()
    .optional(),
  source,
  createdAt: timestamp,
});
// Revalidate stored JSON: local storage is editable and may contain old versions.
const stateSchema = z.object({
  profile: z.object({
    id,
    name: z.string(),
    email: z.string(),
    currentBand: band.nullable(),
    targetBand: band,
    cefr: cefr.nullable(),
    createdAt: timestamp,
  }),
  exercises: z.array(
    z.object({
      exercise: exerciseSchema,
      answers: z.record(
        z.string(),
        z.object({ answer: z.string(), explanation: z.string() }),
      ),
    }),
  ),
  history: z.array(
    z.object({
      id,
      skill: feedbackSchema.shape.skill,
      title: z.string(),
      score: z.number().nullable(),
      source,
      createdAt: timestamp,
      feedback: feedbackSchema,
    }),
  ),
  cards: z.array(
    vocabularySchema.extend({
      id,
      scheduler: storedJson(schedulerCardSchema),
      reviews: z.array(
        z.object({
          reviewedAt: timestamp,
          rating: reviewRating,
          log: storedJson(schedulerLogSchema),
        }),
      ),
    }),
  ),
  placements: z.array(
    z.object({
      id,
      band,
      questionId: id.nullable(),
      answers: z.array(
        z.object({
          questionId: id,
          answer: z.string(),
          correct: z.boolean(),
          band,
        }),
      ),
      questionBank: z
        .array(
          z.object({
            id,
            text: z.string(),
            options: z.array(z.string()),
            cefr,
            answer: z.string(),
            band,
          }),
        )
        .optional(),
      source: source.optional(),
      result: feedbackSchema.optional(),
    }),
  ),
});

function storedValue(kind: "local" | "session", key: string): string | null {
  try {
    return (
      kind === "local" ? window.localStorage : window.sessionStorage
    ).getItem(key);
  } catch {
    return null;
  }
}
function storeValue(
  kind: "local" | "session",
  key: string,
  value: string | null,
): void {
  try {
    const storage =
      kind === "local" ? window.localStorage : window.sessionStorage;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* In file/sandbox contexts, the in-memory state remains usable. */
  }
}
function emptyState(learner: Learner): LearnerState {
  return {
    profile: {
      id: `preview-learner-${learner}`,
      name: learner === 1 ? "Minh Anh" : "Tuấn Minh",
      email: `learner${learner}@preview.local`,
      targetBand: learner === 1 ? 6.5 : 7,
      currentBand: null,
      cefr: null,
      createdAt: new Date().toISOString(),
    },
    exercises: [],
    history: [],
    cards: [],
    placements: [],
  };
}
function readState(learner: Learner): LearnerState {
  // Prefer memory so a failed storage write never restores stale browser data.
  const existing = memory.get(learner);
  if (existing) return structuredClone(existing);
  const encoded = storedValue("local", `${namespace}:learner:${learner}`);
  if (encoded) {
    try {
      const value: unknown = JSON.parse(encoded);
      const parsed = stateSchema.safeParse(value);
      if (
        parsed.success &&
        parsed.data.profile.id === `preview-learner-${learner}`
      ) {
        memory.set(learner, parsed.data);
        return structuredClone(parsed.data);
      }
    } catch {
      /* Corrupt or incompatible local data starts a clean preview. */
    }
  }
  const state = emptyState(learner);
  memory.set(learner, state);
  return structuredClone(state);
}
function saveState(learner: Learner, state: LearnerState): void {
  memory.set(learner, structuredClone(state));
  storeValue("local", `${namespace}:learner:${learner}`, JSON.stringify(state));
}
function requireLearner(learner: Learner | null): Learner {
  if (learner === null)
    throw new ApiError(
      401,
      "Hãy chọn Học viên 01 hoặc Học viên 02 để trải nghiệm bản xem trước.",
    );
  return learner;
}
function useState<T>(
  learner: Learner | null,
  mutate: boolean,
  action: (state: LearnerState, session: Session) => T,
): T {
  const owner = requireLearner(learner);
  const state = readState(owner);
  const session: Session = {
    id: `preview-session-${owner}`,
    userId: state.profile.id,
    demo: true,
    expiresAt: Date.now() + 86400000,
  };
  const result = action(state, session);
  if (mutate) saveState(owner, state);
  return result;
}
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
function checkAbort(signal: AbortSignal): void {
  if (signal.aborted)
    throw new DOMException("The operation was aborted.", "AbortError");
}
async function bodyJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(
      415,
      "Bản xem trước chỉ nhận dữ liệu JSON ở chức năng này.",
    );
  const body = await request.text();
  checkAbort(request.signal);
  if (body.length > 100000)
    throw new ApiError(413, "Dữ liệu gửi lên vượt quá giới hạn 100 KB.");
  try {
    const parsed: unknown = JSON.parse(body);
    return parsed;
  } catch {
    throw new ApiError(400, "JSON không hợp lệ.");
  }
}
function wordsOf(text: string): string[] {
  return text.match(/\b[\p{L}]+(?:['’-][\p{L}]+)*\b/gu) ?? [];
}
function feedbackBase(
  skillName: "writing" | "speaking",
): Pick<
  Feedback,
  | "id"
  | "skill"
  | "source"
  | "createdAt"
  | "score"
  | "corrections"
  | "paragraphs"
> {
  return {
    id: randomUUID(),
    skill: skillName,
    source: "sample",
    createdAt: new Date().toISOString(),
    score: null,
    corrections: [],
    paragraphs: [],
  };
}
function offlineWriting(exercise: Exercise, essay: string): Feedback {
  const words = wordsOf(essay);
  const paragraphs = essay
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  const sentences =
    essay
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.filter((sentence) => wordsOf(sentence).length > 0) ?? [];
  const minimum = exercise.task === 1 ? 150 : 250;
  const uniqueCount = new Set(words.map((word) => word.toLowerCase())).size;
  return {
    ...feedbackBase("writing"),
    wordCount: words.length,
    summary:
      "Bản xem trước ngoại tuyến: thống kê độ dài và bố cục từ bài bạn đã nhập. AI chưa kết nối nên chưa chấm band, ngữ pháp hoặc chất lượng lập luận.",
    criteria: [
      {
        name: exercise.task === 1 ? "Task Achievement" : "Task Response",
        band: null,
        evidence: [],
        feedback: `${words.length} từ; tối thiểu ${minimum} từ. ${words.length < minimum ? `Cần bổ sung ít nhất ${minimum - words.length} từ.` : "Đã đủ độ dài tối thiểu."} Chưa đánh giá mức độ đáp ứng đề.`,
      },
      {
        name: "Coherence and Cohesion",
        band: null,
        evidence: [],
        feedback: `Bài có ${paragraphs.length} đoạn. Tự kiểm tra ý chính, dẫn chứng và liên kết giữa các đoạn; chưa đánh giá chất lượng mạch lạc.`,
      },
      {
        name: "Lexical Resource",
        band: null,
        evidence: [],
        feedback: `${uniqueCount} từ khác nhau trong ${words.length} từ. Thống kê này chưa phản ánh độ chính xác trong ngữ cảnh hoặc band IELTS.`,
      },
      {
        name: "Grammatical Range and Accuracy",
        band: null,
        evidence: [],
        feedback: `Phát hiện ${sentences.length} câu dựa trên dấu câu. Chưa kiểm tra ngữ pháp bằng AI.`,
      },
    ],
    paragraphs: paragraphs.map((paragraph, index) => ({
      index: index + 1,
      feedback: `Đoạn ${index + 1}: ${wordsOf(paragraph).length} từ. Kiểm tra ý chính, ví dụ và câu nối với đoạn tiếp theo.`,
    })),
  };
}
function offlineSpeaking(transcript: string): Feedback {
  const words = wordsOf(transcript);
  const fillerCount =
    transcript.match(/\b(?:um|uh|erm|hmm|you know|I mean)\b/gi)?.length ?? 0;
  const fillerDensity = words.length
    ? Math.round((fillerCount / words.length) * 1000) / 10
    : 0;
  const uniqueCount = new Set(words.map((word) => word.toLowerCase())).size;
  return {
    ...feedbackBase("speaking"),
    transcript,
    fillerCount,
    fillerDensity,
    wordCount: words.length,
    pronunciation: null,
    summary:
      "Bản xem trước ngoại tuyến: thống kê từ bản chép lời bạn nhập. Chưa chấm band, nhận diện ghi âm hoặc phân tích phát âm.",
    criteria: [
      {
        name: "Fluency and Coherence",
        band: null,
        evidence: [],
        feedback: `${words.length} từ; ${fillerCount} lần xuất hiện các cụm đệm (um, uh, erm, hmm, you know, I mean), mật độ ${fillerDensity} trên 100 từ. Đây là số lần xuất hiện trong văn bản; chưa đo tốc độ nói hoặc khoảng dừng.`,
      },
      {
        name: "Lexical Resource",
        band: null,
        evidence: [],
        feedback: `${uniqueCount} từ khác nhau. Chưa đánh giá chất lượng sử dụng từ bằng AI.`,
      },
      {
        name: "Grammatical Range and Accuracy",
        band: null,
        evidence: [],
        feedback:
          "Tự kiểm tra thì, hòa hợp chủ ngữ–động từ và câu hoàn chỉnh. AI chưa kiểm tra ngữ pháp.",
      },
      {
        name: "Pronunciation",
        band: null,
        evidence: [],
        feedback:
          "Không thể đánh giá phát âm từ văn bản. Cần bản Node.js kết nối dịch vụ phân tích âm thanh.",
      },
    ],
  };
}
async function route(
  request: Request,
  url: URL,
  learner: Learner | null,
): Promise<Response> {
  const path = url.pathname;
  const method = request.method.toUpperCase();
  if (path === "/api/health" && method === "GET") {
    const health: Health = {
      status: "ok",
      mode: "demo",
      demoEnabled: true,
      services: {
        openai: false,
        elevenlabs: false,
        azure: false,
        supabase: false,
      },
    };
    return json(health);
  }
  if (path === "/api/auth/me" && method === "GET")
    return json({ user: learner === null ? null : readState(learner).profile });
  if (path === "/api/auth/demo" && method === "POST") {
    const input = z
      .strictObject({ learner: task })
      .parse(await bodyJson(request));
    checkAbort(request.signal);
    const state = readState(input.learner);
    saveState(input.learner, state);
    activeLearner = input.learner;
    storeValue("session", `${namespace}:active`, String(input.learner));
    return json({ user: state.profile });
  }
  if (
    (path === "/api/auth/login" || path === "/api/auth/register") &&
    method === "POST"
  )
    throw new ApiError(
      400,
      "Bản xem trước: chọn Học viên 01 hoặc 02; đăng nhập thật cần bản Node.js. Không nhập mật khẩu thật vào bản xem trước.",
    );
  if (path === "/api/auth/logout" && method === "POST") {
    activeLearner = null;
    storeValue("session", `${namespace}:active`, null);
    return json({ ok: true });
  }
  requireLearner(learner);
  if (path === "/api/profile" && method === "PATCH") {
    const input = z
      .strictObject({ targetBand: band })
      .parse(await bodyJson(request));
    return json({
      user: useState(learner, true, (state) => {
        state.profile.targetBand = input.targetBand;
        return state.profile;
      }),
    });
  }
  if (path === "/api/dashboard" && method === "GET")
    return json(useState(learner, false, dashboard));
  if (path === "/api/history" && method === "GET")
    return json({
      history: useState(learner, false, (state) => state.history),
    });
  const exerciseMatch = /^\/api\/exercises\/([^/]+)$/.exec(path);
  if (exerciseMatch && method === "GET") {
    const selected = skill.parse(exerciseMatch[1]);
    const selectedTask = url.searchParams.has("task")
      ? task.parse(Number(url.searchParams.get("task")))
      : 2;
    const exercise = useState(learner, true, (state) => {
      if (selected === "writing") {
        const unfinished = state.exercises.findLast(
          (item) =>
            item.exercise.skill === "writing" &&
            (item.exercise.task ?? 2) === selectedTask &&
            !state.history.some((history) => history.id === item.exercise.id),
        );
        if (unfinished) return unfinished.exercise;
      }
      const generated = sampleExercise(
        selected,
        state.profile.currentBand ?? 5.5,
        selectedTask,
      );
      state.exercises.push(generated);
      return generated.exercise;
    });
    return json({ exercise });
  }
  if (path === "/api/exercises/generate" && method === "POST") {
    const input = z
      .strictObject({ skill, band, task: task.optional() })
      .parse(await bodyJson(request));
    const exercise = useState(learner, true, (state) => {
      const generated = sampleExercise(input.skill, input.band, input.task);
      generated.exercise.questions = generated.exercise.questions.map(
        (question) => ({
          ...question,
          ...(question.options
            ? { options: shuffledOptions(question.options) }
            : {}),
        }),
      );
      state.exercises.push(generated);
      return generated.exercise;
    });
    return json({ exercise });
  }
  if (path === "/api/practice/submit" && method === "POST") {
    const input = z
      .strictObject({
        exerciseId: id,
        answers: z.record(z.string().min(1).max(100), z.string().max(500)),
      })
      .parse(await bodyJson(request));
    return json({
      result: useState(learner, true, (state) =>
        submitPractice(state, input.exerciseId, input.answers),
      ),
    });
  }
  if (path === "/api/placement/start" && method === "POST")
    return json(useState(learner, true, (state) => startPlacement(state)));
  if (path === "/api/placement/answer" && method === "POST") {
    const input = z
      .strictObject({
        placementId: id,
        questionId: id,
        answer: z.string().trim().min(1).max(500),
      })
      .parse(await bodyJson(request));
    return json(
      useState(learner, true, (state) => answerPlacement(state, input)),
    );
  }
  if (path === "/api/vocabulary" && method === "GET") {
    const cards = useState(learner, false, (state) =>
      state.cards
        .map((card) => publicCard(card))
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    );
    return json({ cards, dueCount: cards.filter((card) => card.due).length });
  }
  if (path === "/api/vocabulary" && method === "POST") {
    const input = vocabularySchema.parse(await bodyJson(request));
    return json(
      {
        card: useState(learner, true, (state) =>
          publicCard(addVocabulary(state, input)),
        ),
      },
      201,
    );
  }
  const reviewMatch = /^\/api\/vocabulary\/([^/]+)\/review$/.exec(path);
  if (reviewMatch && method === "POST") {
    const cardId = id.parse(decodeURIComponent(reviewMatch[1]));
    const input = z
      .strictObject({
        rating: z.union([
          z.literal(1),
          z.literal(2),
          z.literal(3),
          z.literal(4),
        ]),
      })
      .parse(await bodyJson(request));
    return json({
      card: useState(learner, true, (state) =>
        reviewVocabulary(state, cardId, input.rating),
      ),
    });
  }
  if (path === "/api/writing/evaluate" && method === "POST") {
    const input = z
      .strictObject({
        exerciseId: id,
        essay: z.string().trim().min(20).max(30000),
      })
      .parse(await bodyJson(request));
    const result = useState(learner, true, (state) => {
      const stored = findExercise(state, input.exerciseId, "writing");
      ensureUnsubmitted(state, input.exerciseId);
      const feedback = offlineWriting(stored.exercise, input.essay);
      recordFeedback(state, stored, feedback);
      return feedback;
    });
    return json({ result });
  }
  if (path === "/api/speaking/evaluate" && method === "POST") {
    const form = await request.formData().catch(() => {
      throw new ApiError(400, "Hãy gửi bản chép lời bằng biểu mẫu hợp lệ.");
    });
    checkAbort(request.signal);
    const fields: Record<string, unknown> = Object.fromEntries(form.entries());
    const input = z
      .strictObject({
        exerciseId: id,
        transcript: z.string().trim().max(30000).optional(),
        audio: z.instanceof(Blob).optional(),
      })
      .parse(fields);
    if (input.audio && input.audio.size > 10 * 1024 * 1024)
      throw new ApiError(413, "Tệp ghi âm vượt quá giới hạn 10 MB.");
    useState(learner, false, (state) => {
      findExercise(state, input.exerciseId, "speaking");
      ensureUnsubmitted(state, input.exerciseId);
    });
    if (input.audio && !input.transcript)
      throw new ApiError(
        503,
        "Bản xem trước chưa kết nối Whisper để nhận diện ghi âm. Nhập bản chép lời để nhận thống kê, hoặc dùng bản Node.js có cấu hình OpenAI.",
      );
    if (!input.transcript)
      throw new ApiError(400, "Hãy nhập bản chép lời trước khi gửi.");
    const transcript = input.transcript;
    const result = useState(learner, true, (state) => {
      const stored = findExercise(state, input.exerciseId, "speaking");
      const feedback = offlineSpeaking(transcript);
      recordFeedback(state, stored, feedback);
      return feedback;
    });
    if (request.headers.get("accept")?.includes("text/event-stream")) {
      const stream = `event: progress\ndata: ${JSON.stringify({ stage: "transcript", transcript })}\n\nevent: result\ndata: ${JSON.stringify({ result })}\n\n`;
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }
    return json({ result });
  }
  if (path === "/api/listening/audio" && method === "POST") {
    const input = z
      .strictObject({ exerciseId: id })
      .parse(await bodyJson(request));
    useState(learner, false, (state) =>
      findExercise(state, input.exerciseId, "listening"),
    );
    throw new ApiError(
      503,
      "Bản xem trước chưa kết nối ElevenLabs để tạo âm thanh. Bạn có thể hiện bản chép lời để luyện Nghe; âm thanh AI cần bản Node.js đã cấu hình ElevenLabs.",
    );
  }
  throw new ApiError(404, "API không tồn tại trong bản xem trước.");
}

export function installPreviewApi(): void {
  if (installed) return;
  installed = true;
  const saved = storedValue("session", `${namespace}:active`);
  activeLearner = saved === "1" ? 1 : saved === "2" ? 2 : null;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const rawUrl =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.href
          : input;
    // HTML artifacts may be displayed inside an about:blank or blob iframe.
    const base = ["http:", "https:", "file:"].includes(window.location.protocol)
      ? window.location.href
      : "https://ielts-preview.local/";
    const url = new URL(rawUrl, base);
    if (url.pathname !== "/api" && !url.pathname.startsWith("/api/"))
      return originalFetch(input, init);
    const request =
      input instanceof Request
        ? new Request(input, init)
        : new Request(url, init);
    const learner = activeLearner;
    try {
      checkAbort(request.signal);
      const result = await route(request, url, learner);
      checkAbort(request.signal);
      return result;
    } catch (error: unknown) {
      if (
        request.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      )
        throw new DOMException("The operation was aborted.", "AbortError");
      if (error instanceof z.ZodError)
        return json(
          {
            error:
              "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các trường và thử lại.",
          },
          400,
        );
      if (error instanceof ApiError)
        return json({ error: error.message }, error.status);
      return json(
        {
          error:
            "Bản xem trước chưa xử lý được yêu cầu. Hãy thử lại hoặc mở lại tệp xem trước.",
        },
        500,
      );
    }
  };
}
