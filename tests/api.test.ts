import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import type { Server } from "node:http";
import type {
  Dashboard,
  Exercise,
  Feedback,
  HistoryItem,
  PlacementState,
  User,
  VocabCard,
} from "../shared/types";

// Import the application only after selecting an isolated database and disabling paid services.
process.env.DATABASE_PATH = ":memory:";
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET =
  "integration-test-secret-with-at-least-32-characters";
for (const key of [
  "OPENAI_API_KEY",
  "IELTS_OPENAI_API_KEY",
  "ELEVENLABS_API_KEY",
  "AZURE_SPEECH_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
])
  process.env[key] = "";
const { createApp } = await import("../server/app");
const { database } = await import("../server/db");
const { placementBank } = await import("../server/curriculum");

let server: Server;
let origin: string;

interface ApiResponse<T> {
  status: number;
  body: T;
  cookie: string | null;
  headers: Headers;
}
async function request<T>(
  path: string,
  options: {
    cookie?: string;
    body?: unknown;
    method?: string;
    headers?: Record<string, string>;
  } = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${origin}${path}`, {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: {
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.cookie ? { Cookie: options.cookie } : {}),
      ...options.headers,
    },
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });
  const body = (await response.json()) as T;
  return {
    status: response.status,
    body,
    cookie: response.headers.get("set-cookie")?.split(";")[0] ?? null,
    headers: response.headers,
  };
}
async function demo(learner: 1 | 2): Promise<{ cookie: string; user: User }> {
  const response = await request<{ user: User }>("/api/auth/demo", {
    body: { learner },
  });
  assert.equal(response.status, 200);
  assert.ok(response.cookie);
  return { cookie: response.cookie, user: response.body.user };
}
function firstAnswers(exercise: Exercise): Record<string, string> {
  return Object.fromEntries(
    exercise.questions.map((question) => [
      question.id,
      question.options?.[0] ?? "test answer",
    ]),
  );
}

before(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  origin = `http://127.0.0.1:${address.port}`;
});
beforeEach(() => {
  database.exec(
    "DELETE FROM sessions; DELETE FROM learner_state; DELETE FROM accounts;",
  );
});
after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  database.close();
});

test("authentication rejects invalid inputs, cross-site requests and tampered or logged-out sessions", async () => {
  assert.equal((await request("/api/dashboard")).status, 401);
  assert.equal(
    (
      await request("/api/auth/register", {
        body: { email: "invalid", name: "", password: "short", targetBand: 10 },
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/api/auth/demo", { body: { learner: 3 } })).status,
    400,
  );
  assert.equal(
    (
      await request("/api/auth/login", {
        body: { email: "missing@example.com", password: "some-long-password" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/demo", {
        body: { learner: 1 },
        headers: {
          Origin: "https://different-site.example",
          "Sec-Fetch-Site": "cross-site",
        },
      })
    ).status,
    403,
  );
  const login = await request<{ user: User }>("/api/auth/demo", {
    body: { learner: 1 },
  });
  assert.ok(login.cookie);
  assert.match(login.headers.get("set-cookie") ?? "", /HttpOnly/);
  assert.match(login.headers.get("set-cookie") ?? "", /SameSite=Lax/);
  const validCookie = login.cookie;
  const alteredCookie = `${validCookie.slice(0, -1)}${validCookie.endsWith("a") ? "b" : "a"}`;
  assert.equal(
    (await request("/api/dashboard", { cookie: alteredCookie })).status,
    401,
  );
  assert.equal(
    (await request("/api/dashboard", { cookie: validCookie })).status,
    200,
  );
  assert.equal(
    (await request("/api/auth/logout", { cookie: validCookie, body: {} }))
      .status,
    200,
  );
  assert.equal(
    (await request("/api/dashboard", { cookie: validCookie })).status,
    401,
  );
});

test("registered learners have password-protected sessions and the workspace accepts only two accounts", async () => {
  const first = await request<{ user: User }>("/api/auth/register", {
    body: {
      name: "First learner",
      email: "first@example.com",
      password: "A-good-password-123",
      targetBand: 6.5,
    },
  });
  assert.equal(first.status, 201);
  assert.ok(first.cookie);
  assert.equal(first.body.user.currentBand, null);
  assert.equal(
    (
      await request("/api/auth/register", {
        body: {
          name: "Again",
          email: "first@example.com",
          password: "A-good-password-123",
          targetBand: 6,
        },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request("/api/auth/login", {
        body: { email: "first@example.com", password: "wrong-password" },
      })
    ).status,
    401,
  );
  const login = await request<{ user: User }>("/api/auth/login", {
    body: { email: "first@example.com", password: "A-good-password-123" },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.id, first.body.user.id);
  assert.equal(
    (
      await request("/api/auth/register", {
        body: {
          name: "Second learner",
          email: "second@example.com",
          password: "Another-good-password-123",
          targetBand: 7,
        },
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await request("/api/auth/register", {
        body: {
          name: "Third learner",
          email: "third@example.com",
          password: "Another-good-password-123",
          targetBand: 7,
        },
      })
    ).status,
    409,
  );
});

test("reading answers are checked on the server, saved once, and cannot leak across learners", async () => {
  const learnerA = await demo(1);
  const learnerB = await demo(2);
  const emptyDashboard = await request<Dashboard>("/api/dashboard", {
    cookie: learnerA.cookie,
  });
  assert.equal(emptyDashboard.body.completedTests, 0);
  assert.equal(emptyDashboard.body.overallBand, null);
  const assigned = await request<{ exercise: Exercise }>(
    "/api/exercises/reading",
    { cookie: learnerA.cookie },
  );
  assert.equal(assigned.status, 200);
  const exercise = assigned.body.exercise;
  assert.ok(exercise.questions.length > 1);
  assert.ok(!("answers" in exercise));
  for (const question of exercise.questions)
    assert.ok(!("answer" in question) && !("correctAnswer" in question));
  const answers = firstAnswers(exercise);
  assert.equal(
    (
      await request("/api/practice/submit", {
        cookie: learnerB.cookie,
        body: { exerciseId: exercise.id, answers },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/api/practice/submit", {
        cookie: learnerA.cookie,
        body: { exerciseId: exercise.id, answers: {} },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/practice/submit", {
        cookie: learnerA.cookie,
        body: {
          exerciseId: exercise.id,
          answers: { ...answers, "unassigned-question": "forged" },
        },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/practice/submit", {
        cookie: learnerA.cookie,
        body: { exerciseId: exercise.id, answers, correct: true, score: 9 },
      })
    ).status,
    400,
  );
  const submitted = await request<{ result: Feedback }>(
    "/api/practice/submit",
    { cookie: learnerA.cookie, body: { exerciseId: exercise.id, answers } },
  );
  assert.equal(submitted.status, 200);
  assert.ok(submitted.body.result.answers);
  assert.equal(submitted.body.result.total, exercise.questions.length);
  assert.equal(
    submitted.body.result.correct,
    submitted.body.result.answers.filter((answer) => answer.correct).length,
  );
  assert.notEqual(submitted.body.result.score, 9);
  assert.equal(
    (
      await request("/api/practice/submit", {
        cookie: learnerA.cookie,
        body: { exerciseId: exercise.id, answers },
      })
    ).status,
    409,
  );
  const historyA = await request<{ history: HistoryItem[] }>("/api/history", {
    cookie: learnerA.cookie,
  });
  const historyB = await request<{ history: HistoryItem[] }>("/api/history", {
    cookie: learnerB.cookie,
  });
  assert.equal(historyA.body.history.length, 1);
  assert.equal(historyA.body.history[0].feedback.id, submitted.body.result.id);
  assert.equal(historyB.body.history.length, 0);
  const cardsA = await request<{ cards: VocabCard[] }>("/api/vocabulary", {
    cookie: learnerA.cookie,
  });
  const cardsB = await request<{ cards: VocabCard[] }>("/api/vocabulary", {
    cookie: learnerB.cookie,
  });
  assert.equal(cardsA.body.cards.length, exercise.vocabulary.length);
  assert.equal(cardsB.body.cards.length, 0);
  assert.equal(
    (
      await request(`/api/vocabulary/${cardsA.body.cards[0].id}/review`, {
        cookie: learnerB.cookie,
        body: { rating: 4 },
      })
    ).status,
    404,
  );
  const newSession = await demo(1);
  assert.notEqual(newSession.cookie, learnerA.cookie);
  assert.equal(
    (
      await request<{ history: HistoryItem[] }>("/api/history", {
        cookie: newSession.cookie,
      })
    ).body.history.length,
    1,
  );
});

test("placement serves 15 unique questions, rejects a mismatched question and persists the result", async () => {
  const learnerA = await demo(1);
  const learnerB = await demo(2);
  let state = (
    await request<PlacementState>("/api/placement/start", {
      cookie: learnerA.cookie,
      body: {},
    })
  ).body;
  assert.equal(state.total, 15);
  assert.equal(state.answered, 0);
  assert.ok(state.question);
  assert.equal(
    (
      await request("/api/placement/answer", {
        cookie: learnerB.cookie,
        body: {
          placementId: state.placementId,
          questionId: state.question.id,
          answer: state.question.options[0],
        },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/api/placement/answer", {
        cookie: learnerA.cookie,
        body: {
          placementId: state.placementId,
          questionId: "not-current-question",
          answer: state.question.options[0],
        },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request("/api/placement/answer", {
        cookie: learnerA.cookie,
        body: {
          placementId: state.placementId,
          questionId: state.question.id,
          answer: state.question.options[0],
          correct: true,
        },
      })
    ).status,
    400,
  );
  const seen = new Set<string>();
  let previousQuestion = "";
  for (let index = 0; index < 15; index++) {
    assert.ok(state.question);
    assert.ok(!seen.has(state.question.id));
    seen.add(state.question.id);
    assert.ok(!("answer" in state.question) && !("correct" in state.question));
    const key = placementBank.find(
      (question) => question.id === state.question?.id,
    );
    assert.ok(key);
    const answer =
      index % 2 === 0
        ? key.answer
        : state.question.options.find((option) => option !== key.answer);
    assert.ok(answer);
    const expectedBand = Math.min(
      7,
      Math.max(3, state.currentBand + (index % 2 === 0 ? 0.5 : -0.5)),
    );
    previousQuestion = state.question.id;
    const response: ApiResponse<PlacementState> = await request<PlacementState>(
      "/api/placement/answer",
      {
        cookie: learnerA.cookie,
        body: {
          placementId: state.placementId,
          questionId: state.question.id,
          answer,
        },
      },
    );
    assert.equal(response.status, 200);
    state = response.body;
    assert.equal(state.answered, index + 1);
    assert.equal(state.currentBand, expectedBand);
  }
  assert.equal(seen.size, 15);
  assert.equal(state.completed, true);
  assert.equal(state.question, undefined);
  assert.ok(state.result && state.result.score !== null);
  assert.ok(state.result.score >= 3 && state.result.score <= 7);
  assert.equal(
    (
      await request("/api/placement/answer", {
        cookie: learnerA.cookie,
        body: {
          placementId: state.placementId,
          questionId: previousQuestion,
          answer: "ignored",
        },
      })
    ).status,
    409,
  );
  const dashboard = await request<Dashboard>("/api/dashboard", {
    cookie: learnerA.cookie,
  });
  assert.equal(dashboard.body.profile.currentBand, state.result.score);
  assert.equal(dashboard.body.completedTests, 1);
  assert.equal(dashboard.body.history[0].skill, "placement");
  assert.equal(
    (await request<Dashboard>("/api/dashboard", { cookie: learnerB.cookie }))
      .body.profile.currentBand,
    null,
  );
});

test("FSRS review updates stored difficulty, stability, repetitions and the next due date", async () => {
  const learner = await demo(1);
  assert.equal(
    (
      await request("/api/vocabulary", {
        cookie: learner.cookie,
        body: { front: "", back: "" },
      })
    ).status,
    400,
  );
  const created = await request<{ card: VocabCard }>("/api/vocabulary", {
    cookie: learner.cookie,
    body: {
      front: "sustainable",
      back: "bền vững",
      example: "Sustainable transport improves cities.",
      cefr: "B2",
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.card.reps, 0);
  assert.equal(created.body.card.due, true);
  assert.equal(
    (
      await request(`/api/vocabulary/${created.body.card.id}/review`, {
        cookie: learner.cookie,
        body: { rating: 5 },
      })
    ).status,
    400,
  );
  const beforeReview = Date.now();
  const reviewed = await request<{ card: VocabCard }>(
    `/api/vocabulary/${created.body.card.id}/review`,
    { cookie: learner.cookie, body: { rating: 4 } },
  );
  assert.equal(reviewed.status, 200);
  assert.equal(reviewed.body.card.reps, 1);
  assert.ok(reviewed.body.card.stability > 0);
  assert.ok(
    reviewed.body.card.difficulty >= 1 && reviewed.body.card.difficulty <= 10,
  );
  assert.ok(new Date(reviewed.body.card.dueDate).getTime() > beforeReview);
  assert.equal(reviewed.body.card.due, false);
  const subsequent = await demo(1);
  const vocabulary = await request<{ cards: VocabCard[]; dueCount: number }>(
    "/api/vocabulary",
    { cookie: subsequent.cookie },
  );
  assert.equal(vocabulary.body.cards[0].reps, 1);
  assert.equal(vocabulary.body.cards[0].dueDate, reviewed.body.card.dueDate);
  assert.equal(vocabulary.body.dueCount, 0);
});

test("writing and Speaking retain honest offline feedback, ownership, JSON and streaming API responses", async () => {
  const learnerA = await demo(1);
  const learnerB = await demo(2);
  const writing = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=2", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  const essay =
    "Public transport can reduce pollution. Cities should support reliable buses.\n\nFor example, good services help commuters travel without cars.";
  assert.equal(
    (
      await request("/api/writing/evaluate", {
        cookie: learnerB.cookie,
        body: { exerciseId: writing.id, essay },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/api/writing/evaluate", {
        cookie: learnerA.cookie,
        body: { exerciseId: writing.id, essay: "short" },
      })
    ).status,
    400,
  );
  const writingResult = await request<{ result: Feedback }>(
    "/api/writing/evaluate",
    { cookie: learnerA.cookie, body: { exerciseId: writing.id, essay } },
  );
  assert.equal(writingResult.status, 200);
  assert.equal(writingResult.body.result.score, null);
  assert.ok(
    writingResult.body.result.criteria.every(
      (criterion) => criterion.band === null,
    ),
  );
  assert.equal(
    (
      await request("/api/writing/evaluate", {
        cookie: learnerA.cookie,
        body: { exerciseId: writing.id, essay },
      })
    ).status,
    409,
  );
  const speaking = (
    await request<{ exercise: Exercise }>("/api/exercises/speaking", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  assert.equal(
    (
      await request("/api/speaking/evaluate", {
        cookie: learnerA.cookie,
        body: { exerciseId: speaking.id },
      })
    ).status,
    400,
  );
  const jsonResult = await request<{ result: Feedback }>(
    "/api/speaking/evaluate",
    {
      cookie: learnerA.cookie,
      body: {
        exerciseId: speaking.id,
        transcript:
          "Um, I enjoy parks because they offer quiet places to relax.",
      },
      headers: { Accept: "application/json" },
    },
  );
  assert.equal(jsonResult.status, 200);
  assert.match(
    jsonResult.headers.get("content-type") ?? "",
    /application\/json/,
  );
  assert.equal(jsonResult.body.result.score, null);
  assert.equal(jsonResult.body.result.fillerCount, 1);
  const streamExercise = (
    await request<{ exercise: Exercise }>("/api/exercises/speaking", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  const stream = await fetch(`${origin}/api/speaking/evaluate`, {
    method: "POST",
    headers: {
      Cookie: learnerA.cookie,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      exerciseId: streamExercise.id,
      transcript: "My city has reliable buses and comfortable parks.",
    }),
  });
  assert.equal(stream.status, 200);
  assert.match(stream.headers.get("content-type") ?? "", /text\/event-stream/);
  const events = await stream.text();
  assert.ok(
    events.indexOf("event: progress") < events.indexOf("event: result"),
  );
  assert.ok(events.includes('"stage":"transcript"'));
  assert.ok(events.includes('"score":null'));
  assert.ok(!events.includes("event: error"));
  const history = await request<{ history: HistoryItem[] }>("/api/history", {
    cookie: learnerA.cookie,
  });
  assert.equal(history.body.history.length, 3);
  assert.ok(history.body.history.every((item) => item.score === null));
  assert.equal(
    (
      await request<{ history: HistoryItem[] }>("/api/history", {
        cookie: learnerB.cookie,
      })
    ).body.history.length,
    0,
  );
});

test("unconfigured audio explains its prerequisite and malformed exercise routes fail clearly", async () => {
  const learner = await demo(1);
  const listening = (
    await request<{ exercise: Exercise }>("/api/exercises/listening", {
      cookie: learner.cookie,
    })
  ).body.exercise;
  const audio = await request<{ error: string }>("/api/listening/audio", {
    cookie: learner.cookie,
    body: { exerciseId: listening.id },
  });
  assert.equal(audio.status, 503);
  assert.match(audio.body.error, /ElevenLabs/);
  assert.equal(
    (await request("/api/exercises/invalid", { cookie: learner.cookie }))
      .status,
    400,
  );
  assert.equal(
    (await request("/api/exercises/writing?task=3", { cookie: learner.cookie }))
      .status,
    400,
  );
  assert.equal(
    (await request("/api/does-not-exist", { cookie: learner.cookie })).status,
    404,
  );
});

test("writing assignments survive refresh per learner and task, then advance after submission", async () => {
  const learnerA = await demo(1);
  const learnerB = await demo(2);
  const task2 = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=2", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  const refreshed = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=2", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  assert.equal(refreshed.id, task2.id);
  const task1 = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=1", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  assert.notEqual(task1.id, task2.id);
  assert.equal(task1.task, 1);
  const otherLearner = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=2", {
      cookie: learnerB.cookie,
    })
  ).body.exercise;
  assert.notEqual(otherLearner.id, task2.id);
  assert.equal(
    (
      await request("/api/writing/evaluate", {
        cookie: learnerA.cookie,
        body: {
          exerciseId: task2.id,
          essay:
            "Public transport can reduce pollution. Cities should support reliable buses.",
        },
      })
    ).status,
    200,
  );
  const next = (
    await request<{ exercise: Exercise }>("/api/exercises/writing?task=2", {
      cookie: learnerA.cookie,
    })
  ).body.exercise;
  assert.notEqual(next.id, task2.id);
  assert.equal(
    (
      await request<{ exercise: Exercise }>("/api/exercises/writing?task=1", {
        cookie: learnerA.cookie,
      })
    ).body.exercise.id,
    task1.id,
  );
});

test("temporary cloud refresh failures preserve sessions, invalid refreshes revoke them, and logout skips refresh", async () => {
  const originalFetch = globalThis.fetch;
  process.env.SUPABASE_URL = "https://test-project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "sb_publishable_test_key";
  try {
    let providerStatus = 503;
    const providerPaths: string[] = [];
    globalThis.fetch = async (url, init) => {
      if (String(url).startsWith(origin)) return originalFetch(url, init);
      providerPaths.push(new URL(String(url)).pathname);
      return Response.json(
        { error: "Provider request failed" },
        { status: providerStatus },
      );
    };
    const learner = await demo(1);
    const sessionId = learner.cookie.split("=")[1].split(".")[0];
    const cloud = {
      id: learner.user.id,
      email: learner.user.email,
      name: learner.user.name,
      accessToken: "fake-access",
      refreshToken: "fake-refresh",
      expiresAt: Date.now() - 1_000,
    };
    database
      .prepare("UPDATE sessions SET cloud_json = ? WHERE id = ?")
      .run(JSON.stringify(cloud), sessionId);
    assert.equal(
      (await request("/api/dashboard", { cookie: learner.cookie })).status,
      503,
    );
    assert.ok(
      database.prepare("SELECT id FROM sessions WHERE id = ?").get(sessionId),
    );
    assert.deepEqual(providerPaths, ["/auth/v1/token"]);
    providerStatus = 401;
    assert.equal(
      (await request("/api/dashboard", { cookie: learner.cookie })).status,
      401,
    );
    assert.equal(
      database.prepare("SELECT id FROM sessions WHERE id = ?").get(sessionId),
      undefined,
    );
    const another = await demo(1);
    const anotherId = another.cookie.split("=")[1].split(".")[0];
    database
      .prepare("UPDATE sessions SET cloud_json = ? WHERE id = ?")
      .run(JSON.stringify(cloud), anotherId);
    providerPaths.length = 0;
    providerStatus = 503;
    assert.equal(
      (await request("/api/auth/logout", { cookie: another.cookie, body: {} }))
        .status,
      200,
    );
    assert.ok(!providerPaths.includes("/auth/v1/token"));
    assert.equal(
      database.prepare("SELECT id FROM sessions WHERE id = ?").get(anotherId),
      undefined,
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env.SUPABASE_URL = "";
    process.env.SUPABASE_ANON_KEY = "";
  }
});
