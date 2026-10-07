import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import { z } from "zod";
import type { Health, User } from "../shared/types";
import {
  ApiError,
  demoLogin,
  getSession,
  loadState,
  login,
  logout,
  register,
  requireSession,
  saveState,
  verifyOrigin,
} from "./auth";
import { withLearnerLock, type LearnerState, type Session } from "./db";
import { sampleExercise, shuffledOptions } from "./curriculum";
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
} from "./learning";
import {
  aiCapabilities,
  evaluateSpeaking,
  evaluateWriting,
  generateExercise,
  generatePlacementBank,
  synthesizeListening,
} from "./ai";
import { supabaseConfigured } from "./supabase";

const band = z.number().min(3).max(7).multipleOf(0.5);
const skill = z.enum(["reading", "listening", "writing", "speaking"]);
const email = z
  .email()
  .max(254)
  .transform((value) => value.trim().toLowerCase());
const password = z.string().min(8).max(128);
const loginSchema = z.strictObject({
  email,
  password: z.string().min(1).max(128),
});
const registerSchema = z.strictObject({
  email,
  password,
  name: z.string().trim().min(2).max(80),
  targetBand: band.default(6.5),
});
const id = z.string().min(1).max(100);
const audioMimeTypes = new Set([
  "audio/webm",
  "video/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 2, fieldSize: 30000 },
  fileFilter(_req, file, callback) {
    if (audioMimeTypes.has(file.mimetype)) callback(null, true);
    else
      callback(
        new ApiError(
          415,
          "Chỉ hỗ trợ tệp âm thanh WebM, WAV, MP3, OGG hoặc M4A.",
        ),
      );
  },
});

function route(
  handler: (req: Request, res: Response) => Promise<unknown>,
): express.RequestHandler {
  return (req, res, next) => {
    void handler(req, res).catch(next);
  };
}
async function useState<T>(
  req: Request,
  mutate: boolean,
  action: (state: LearnerState, session: Session) => T | Promise<T>,
): Promise<T> {
  const session = await requireSession(req);
  return withLearnerLock(session.userId, async () => {
    const state = await loadState(session);
    const result = await action(state, session);
    if (mutate) await saveState(session, state);
    return result;
  });
}
function errorDetails(error: unknown): { status: number; error: string } {
  if (error instanceof z.ZodError)
    return {
      status: 400,
      error: "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra các trường và thử lại.",
    };
  if (error instanceof multer.MulterError)
    return {
      status: error.code === "LIMIT_FILE_SIZE" ? 413 : 400,
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Tệp ghi âm vượt quá giới hạn 10 MB."
          : "Dữ liệu tải lên không hợp lệ.",
    };
  if (
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 600
  ) {
    return { status: error.status, error: error.message };
  }
  if (
    error instanceof Error &&
    "type" in error &&
    error.type === "entity.parse.failed"
  )
    return { status: 400, error: "JSON không hợp lệ." };
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "Unknown error",
  );
  return {
    status: 500,
    error: "Máy chủ chưa xử lý được yêu cầu. Vui lòng thử lại.",
  };
}

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production"
          ? { directives: { mediaSrc: ["'self'", "blob:"] } }
          : false,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    try {
      verifyOrigin(req);
      next();
    } catch (error) {
      next(error);
    }
  });
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 200,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        error: "Bạn gửi yêu cầu quá nhanh. Vui lòng thử lại sau một phút.",
      },
    }),
  );
  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 40,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Quá nhiều lượt đăng nhập. Vui lòng thử lại sau 15 phút.",
    },
  });
  const aiLimiter = rateLimit({
    windowMs: 60 * 60_000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Đã đạt giới hạn 30 lượt xử lý AI mỗi giờ. Vui lòng thử lại sau.",
    },
  });

  app.get("/api/health", (_req, res) => {
    const providers = aiCapabilities();
    const health: Health = {
      status: "ok",
      mode: providers.openai ? "live" : "demo",
      demoEnabled:
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_DEMO === "true",
      services: { ...providers, supabase: supabaseConfigured() },
    };
    res.json(health);
  });
  app.post(
    "/api/auth/register",
    authLimiter,
    route(async (req, res) => {
      const user = await register(registerSchema.parse(req.body), res);
      res.status(201).json({ user });
    }),
  );
  app.post(
    "/api/auth/login",
    authLimiter,
    route(async (req, res) => {
      const user = await login(loginSchema.parse(req.body), res);
      res.json({ user });
    }),
  );
  app.post(
    "/api/auth/demo",
    authLimiter,
    route(async (req, res) => {
      const input = z
        .strictObject({ learner: z.union([z.literal(1), z.literal(2)]) })
        .parse(req.body);
      res.json({ user: demoLogin(input.learner, res) });
    }),
  );
  app.post(
    "/api/auth/logout",
    route(async (req, res) => {
      await logout(req, res);
      res.json({ ok: true });
    }),
  );
  app.get(
    "/api/auth/me",
    route(async (req, res) => {
      const session = await getSession(req);
      const user: User | null = session
        ? (await loadState(session)).profile
        : null;
      res.json({ user });
    }),
  );
  app.patch(
    "/api/profile",
    route(async (req, res) => {
      const input = z.strictObject({ targetBand: band }).parse(req.body);
      const user = await useState(req, true, (state) => {
        state.profile.targetBand = input.targetBand;
        return state.profile;
      });
      res.json({ user });
    }),
  );
  app.get(
    "/api/dashboard",
    route(async (req, res) => {
      res.json(await useState(req, false, dashboard));
    }),
  );
  app.get(
    "/api/history",
    route(async (req, res) => {
      res.json({
        history: await useState(req, false, (state) => state.history),
      });
    }),
  );
  app.get(
    "/api/exercises/:skill",
    route(async (req, res) => {
      const selected = skill.parse(req.params.skill);
      const task =
        req.query.task === undefined
          ? 2
          : z.coerce
              .number()
              .pipe(z.union([z.literal(1), z.literal(2)]))
              .parse(req.query.task);
      const exercise = await useState(req, true, (state) => {
        if (selected === "writing") {
          const unfinished = state.exercises.findLast(
            (item) =>
              item.exercise.skill === "writing" &&
              (item.exercise.task ?? 2) === task &&
              !state.history.some((history) => history.id === item.exercise.id),
          );
          if (unfinished) return unfinished.exercise;
        }
        const generated = sampleExercise(
          selected,
          state.profile.currentBand ?? 5.5,
          task,
        );
        state.exercises.push(generated);
        return generated.exercise;
      });
      res.json({ exercise });
    }),
  );
  app.post(
    "/api/exercises/generate",
    aiLimiter,
    route(async (req, res) => {
      const input = z
        .strictObject({
          skill,
          band,
          task: z.union([z.literal(1), z.literal(2)]).optional(),
        })
        .parse(req.body);
      const exercise = await useState(req, true, async (state) => {
        // A local authored exercise is a usable default when no provider is configured.
        const generated = aiCapabilities().openai
          ? await generateExercise(input.skill, input.band, input.task)
          : sampleExercise(input.skill, input.band, input.task);
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
      res.json({ exercise });
    }),
  );
  app.post(
    "/api/practice/submit",
    route(async (req, res) => {
      const input = z
        .strictObject({
          exerciseId: id,
          answers: z.record(z.string().min(1).max(100), z.string().max(500)),
        })
        .parse(req.body);
      const result = await useState(req, true, (state) =>
        submitPractice(state, input.exerciseId, input.answers),
      );
      res.json({ result });
    }),
  );
  app.post(
    "/api/placement/start",
    aiLimiter,
    route(async (req, res) => {
      const placement = await useState(req, true, async (state) => {
        const unfinished = state.placements.some((item) => !item.result);
        const bank =
          aiCapabilities().openai && !unfinished
            ? await generatePlacementBank()
            : undefined;
        return startPlacement(state, bank);
      });
      res.json(placement);
    }),
  );
  app.post(
    "/api/placement/answer",
    route(async (req, res) => {
      const input = z
        .strictObject({
          placementId: id,
          questionId: id,
          answer: z.string().trim().min(1).max(500),
        })
        .parse(req.body);
      res.json(
        await useState(req, true, (state) => answerPlacement(state, input)),
      );
    }),
  );
  app.get(
    "/api/vocabulary",
    route(async (req, res) => {
      const cards = await useState(req, false, (state) =>
        state.cards
          .map((card) => publicCard(card))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      );
      res.json({ cards, dueCount: cards.filter((card) => card.due).length });
    }),
  );
  app.post(
    "/api/vocabulary",
    route(async (req, res) => {
      const input = z
        .strictObject({
          front: z.string().trim().min(1).max(200),
          back: z.string().trim().min(1).max(1000),
          example: z.string().trim().max(1000).default(""),
          cefr: z.enum(["A2", "B1", "B2", "C1"]).default("B2"),
        })
        .parse(req.body);
      const card = await useState(req, true, (state) =>
        publicCard(addVocabulary(state, input)),
      );
      res.status(201).json({ card });
    }),
  );
  app.post(
    "/api/vocabulary/:id/review",
    route(async (req, res) => {
      const input = z
        .strictObject({
          rating: z.union([
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
          ]),
        })
        .parse(req.body);
      const cardId = id.parse(req.params.id);
      res.json({
        card: await useState(req, true, (state) =>
          reviewVocabulary(state, cardId, input.rating),
        ),
      });
    }),
  );
  app.post(
    "/api/writing/evaluate",
    aiLimiter,
    route(async (req, res) => {
      const input = z
        .strictObject({
          exerciseId: id,
          essay: z.string().trim().min(20).max(30000),
        })
        .parse(req.body);
      const result = await useState(req, true, async (state) => {
        const exercise = findExercise(state, input.exerciseId, "writing");
        ensureUnsubmitted(state, input.exerciseId);
        const feedback = await evaluateWriting(exercise.exercise, input.essay);
        recordFeedback(state, exercise, feedback);
        return feedback;
      });
      res.json({ result });
    }),
  );
  app.post(
    "/api/speaking/evaluate",
    aiLimiter,
    upload.single("audio"),
    route(async (req, res) => {
      const input = z
        .strictObject({
          exerciseId: id,
          transcript: z.string().trim().max(30000).optional(),
        })
        .parse(req.body);
      if (!req.file && !input.transcript)
        throw new ApiError(
          400,
          "Hãy ghi âm hoặc nhập transcript trước khi gửi.",
        );
      if (req.file && req.file.size < 100)
        throw new ApiError(400, "Tệp ghi âm trống hoặc quá ngắn.");
      const stream = req.get("accept")?.includes("text/event-stream") === true;
      // Verify authorization and ownership before opening a streaming response.
      await useState(req, false, (state) => {
        findExercise(state, input.exerciseId, "speaking");
        ensureUnsubmitted(state, input.exerciseId);
      });
      if (stream) {
        res
          .status(200)
          .set({
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
          });
        res.flushHeaders();
      }
      const emit = (event: string, data: unknown): void => {
        if (!res.destroyed)
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };
      try {
        const result = await useState(req, true, async (state) => {
          const exercise = findExercise(state, input.exerciseId, "speaking");
          ensureUnsubmitted(state, input.exerciseId);
          const uploadedMime = req.file?.mimetype;
          const normalMime =
            uploadedMime === "video/webm"
              ? "audio/webm"
              : uploadedMime === "audio/mp3"
                ? "audio/mpeg"
                : uploadedMime === "audio/x-m4a"
                  ? "audio/mp4"
                  : uploadedMime;
          const feedback = await evaluateSpeaking(
            exercise.exercise,
            req.file?.buffer ?? Buffer.alloc(0),
            normalMime ?? "text/plain",
            input.transcript,
            stream ? (progress) => emit("progress", progress) : undefined,
          );
          recordFeedback(state, exercise, feedback);
          return feedback;
        });
        if (stream) {
          emit("result", { result });
          res.end();
        } else res.json({ result });
      } catch (error) {
        if (!stream) throw error;
        emit("error", { error: errorDetails(error).error });
        res.end();
      }
    }),
  );
  app.post(
    "/api/listening/audio",
    aiLimiter,
    route(async (req, res) => {
      const input = z.strictObject({ exerciseId: id }).parse(req.body);
      const audio = await useState(req, false, (state) =>
        synthesizeListening(
          findExercise(state, input.exerciseId, "listening").exercise,
        ),
      );
      res.type("audio/mpeg").send(audio);
    }),
  );
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API không tồn tại." });
  });

  const staticDirectory = resolve("dist");
  if (existsSync(resolve(staticDirectory, "index.html"))) {
    app.use(express.static(staticDirectory));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(resolve(staticDirectory, "index.html"));
    });
  }
  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (res.headersSent) {
        res.end();
        return;
      }
      const details = errorDetails(error);
      res.status(details.status).json({ error: details.error });
    },
  );
  return app;
}
