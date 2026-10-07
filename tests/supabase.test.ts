import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { createEmptyCard } from "ts-fsrs";
import {
  cloudRefresh,
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  SupabaseError,
  supabaseConfigured,
  supabaseGetState,
  supabaseSaveState,
} from "../server/supabase";
import type { LearnerState } from "../server/db";

const id = "10000000-0000-4000-8000-000000000001";
const otherId = "10000000-0000-4000-8000-000000000002";
const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_ANON_KEY;
beforeEach(() => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_ANON_KEY = "sb_publishable_test";
});
afterEach(() => {
  if (originalUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalKey === undefined) delete process.env.SUPABASE_ANON_KEY;
  else process.env.SUPABASE_ANON_KEY = originalKey;
});

function authBody() {
  return {
    access_token: "learner-access-token",
    refresh_token: "learner-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { id, email: "learner@example.com", user_metadata: { name: "Minh" } },
  };
}
function state(): LearnerState {
  const createdAt = new Date().toISOString();
  return {
    profile: {
      id,
      name: "Minh",
      email: "learner@example.com",
      currentBand: 5.5,
      targetBand: 7,
      cefr: "B2",
      createdAt,
    },
    exercises: [],
    placements: [],
    history: [
      {
        id: "reading-result",
        skill: "reading",
        title: "Reading practice",
        score: 5.5,
        source: "sample",
        createdAt,
        feedback: {
          id: "feedback-1",
          skill: "reading",
          score: 5.5,
          summary: "Practice feedback",
          criteria: [],
          corrections: [],
          paragraphs: [],
          source: "sample",
          createdAt,
        },
      },
    ],
    cards: [
      {
        id: "card-1",
        front: "sustainable",
        back: "bền vững",
        example: "Sustainable development matters.",
        cefr: "B2",
        scheduler: JSON.stringify(createEmptyCard(new Date())),
        reviews: [],
      },
    ],
  };
}
function expectedError(status: number, code: string) {
  return (error: unknown): boolean =>
    error instanceof SupabaseError &&
    error.status === status &&
    error.code === code;
}
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("configuration requires both Supabase bindings", () => {
  assert.equal(supabaseConfigured(), true);
  delete process.env.SUPABASE_ANON_KEY;
  assert.equal(supabaseConfigured(), false);
});

test("signup sends validated metadata and preserves real Supabase identity and expiry", async (t) => {
  const response = authBody();
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(String(input), "https://example.supabase.co/auth/v1/signup");
      assert.equal(init?.method, "POST");
      assert.equal(
        new Headers(init?.headers).get("apikey"),
        "sb_publishable_test",
      );
      assert.equal(new Headers(init?.headers).get("Authorization"), null);
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: "learner@example.com",
        password: "Password123!",
        data: { name: "Minh", target_band: 7 },
      });
      assert.ok(init?.signal instanceof AbortSignal);
      assert.equal(init?.redirect, "error");
      return jsonResponse(response);
    },
  );
  const result = await cloudSignUp({
    email: "learner@example.com",
    password: "Password123!",
    name: "  Minh  ",
    targetBand: 7,
  });
  assert.deepEqual(result, {
    id,
    email: "learner@example.com",
    name: "Minh",
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: response.expires_at * 1000,
  });
});

test("signup without a session explains email confirmation instead of fabricating authentication", async (t) => {
  t.mock.method(globalThis, "fetch", async () => jsonResponse(authBody().user));
  await assert.rejects(
    cloudSignUp({
      email: "learner@example.com",
      password: "Password123!",
      name: "Minh",
      targetBand: 7,
    }),
    expectedError(403, "EMAIL_CONFIRMATION_REQUIRED"),
  );
});

test("malformed successful auth responses are rejected", async (t) => {
  t.mock.method(globalThis, "fetch", async () => jsonResponse({}));
  await assert.rejects(
    cloudSignUp({
      email: "learner@example.com",
      password: "Password123!",
      name: "Minh",
      targetBand: 7,
    }),
    expectedError(503, "SUPABASE_INVALID_RESPONSE"),
  );
});

test("sign-in errors are sanitized and expose a useful status", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    jsonResponse(
      {
        error_code: "invalid_credentials",
        msg: "Never expose upstream diagnostic credentials",
      },
      400,
    ),
  );
  await assert.rejects(
    cloudSignIn({ email: "learner@example.com", password: "Password123!" }),
    (error: unknown) => {
      assert.ok(error instanceof SupabaseError);
      assert.equal(error.status, 401);
      assert.equal(error.code, "SUPABASE_AUTHENTICATION");
      assert.ok(!error.message.includes("upstream diagnostic"));
      return true;
    },
  );
});

test("sign-in accepts existing provider passwords while new signups enforce eight characters", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    jsonResponse(authBody()),
  );
  await assert.rejects(
    cloudSignUp({
      email: "learner@example.com",
      password: "legacy7",
      name: "Minh",
      targetBand: 7,
    }),
    expectedError(400, "INVALID_SIGNUP"),
  );
  assert.equal(fetchMock.mock.callCount(), 0);
  assert.equal(
    (await cloudSignIn({ email: "learner@example.com", password: "legacy7" }))
      .id,
    id,
  );
});

test("refresh exchanges the refresh token and returns a new real session", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(
        String(input),
        "https://example.supabase.co/auth/v1/token?grant_type=refresh_token",
      );
      assert.deepEqual(JSON.parse(String(init?.body)), {
        refresh_token: "old-refresh-token",
      });
      return jsonResponse(authBody());
    },
  );
  assert.equal((await cloudRefresh("old-refresh-token")).id, id);
});

test("logout revokes this session with the learner token", async (t) => {
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(
        String(input),
        "https://example.supabase.co/auth/v1/logout?scope=local",
      );
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer learner-access-token",
      );
      return new Response(null, { status: 204 });
    },
  );
  await cloudSignOut("learner-access-token");
});

test("storage reads only the requested learner under the learner JWT", async (t) => {
  const stored = state();
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      assert.equal(url.searchParams.get("user_id"), `eq.${id}`);
      assert.equal(url.searchParams.get("select"), "state_json");
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer learner-access-token",
      );
      return jsonResponse([{ state_json: stored }]);
    },
  );
  assert.deepEqual(await supabaseGetState(id, "learner-access-token"), stored);
});

test("missing state is distinct from malformed or another learner state", async (t) => {
  let response: unknown = [];
  t.mock.method(globalThis, "fetch", async () => jsonResponse(response));
  assert.equal(await supabaseGetState(id, "learner-access-token"), null);
  response = [
    {
      state_json: { ...state(), profile: { ...state().profile, id: otherId } },
    },
  ];
  await assert.rejects(
    supabaseGetState(id, "learner-access-token"),
    expectedError(503, "SUPABASE_INVALID_STATE"),
  );
  const invalid = state();
  invalid.cards[0].scheduler = "not JSON";
  response = [{ state_json: invalid }];
  await assert.rejects(
    supabaseGetState(id, "learner-access-token"),
    expectedError(503, "SUPABASE_INVALID_STATE"),
  );
});

test("first confirmed login preserves the Auth-trigger profile and chosen target band", async (t) => {
  const profile = state().profile;
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer learner-access-token",
      );
      if (url.pathname === "/rest/v1/learner_state") return jsonResponse([]);
      assert.equal(url.pathname, "/rest/v1/user_profiles");
      assert.equal(url.searchParams.get("user_id"), `eq.${id}`);
      return jsonResponse([
        {
          user_id: id,
          name: profile.name,
          email: profile.email,
          current_band: null,
          target_band: 7,
          cefr: null,
          created_at: profile.createdAt,
        },
      ]);
    },
  );
  const initialized = await supabaseGetState(id, "learner-access-token");
  assert.equal(initialized?.profile.targetBand, 7);
  assert.equal(initialized?.profile.createdAt, profile.createdAt);
  assert.deepEqual(initialized?.history, []);
});

test("continuous pronunciation results retain a missing completeness metric", async (t) => {
  const stored = state();
  stored.history[0].feedback.pronunciation = {
    accuracy: 85,
    fluency: 81,
    completeness: null,
  };
  t.mock.method(globalThis, "fetch", async () =>
    jsonResponse([{ state_json: stored }]),
  );
  assert.equal(
    (await supabaseGetState(id, "learner-access-token"))?.history[0].feedback
      .pronunciation?.completeness,
    null,
  );
});

test("resumable AI placement banks preserve their private answer keys inside learner storage", async (t) => {
  const stored = state();
  stored.placements.push({
    id: "ai-placement",
    band: 5.5,
    questionId: "ai-question",
    answers: [],
    source: "ai",
    questionBank: [
      {
        id: "ai-question",
        text: "Choose a word.",
        options: ["one", "two", "three", "four"],
        answer: "two",
        cefr: "B2",
        band: 5.5,
      },
    ],
  });
  t.mock.method(globalThis, "fetch", async () =>
    jsonResponse([{ state_json: stored }]),
  );
  assert.deepEqual(
    (await supabaseGetState(id, "learner-access-token"))?.placements,
    stored.placements,
  );
});

test("state persistence uses the atomic RLS RPC with an FSRS retrievability snapshot", async (t) => {
  const stored = state();
  t.mock.method(
    globalThis,
    "fetch",
    async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(
        String(input),
        "https://example.supabase.co/rest/v1/rpc/save_learner_state",
      );
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer learner-access-token",
      );
      const body = JSON.parse(String(init?.body)) as {
        state: LearnerState & { cards: { retrievability: number }[] };
      };
      assert.equal(body.state.profile.id, id);
      assert.equal(body.state.history[0].score, 5.5);
      assert.ok(
        body.state.cards[0].retrievability >= 0 &&
          body.state.cards[0].retrievability <= 1,
      );
      return jsonResponse(null);
    },
  );
  await supabaseSaveState(id, stored, "learner-access-token");
  await assert.rejects(
    supabaseSaveState(otherId, stored, "learner-access-token"),
    expectedError(503, "SUPABASE_INVALID_STATE"),
  );
});

test("service-role and non-HTTPS remote configurations are rejected before a network request", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () =>
    jsonResponse(authBody()),
  );
  const login = { email: "learner@example.com", password: "Password123!" };
  process.env.SUPABASE_ANON_KEY = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`;
  await assert.rejects(
    cloudSignIn(login),
    expectedError(503, "SUPABASE_CONFIGURATION"),
  );
  process.env.SUPABASE_ANON_KEY = "sb_secret_private";
  await assert.rejects(
    cloudSignIn(login),
    expectedError(503, "SUPABASE_CONFIGURATION"),
  );
  process.env.SUPABASE_ANON_KEY = "sb_publishable_test";
  process.env.SUPABASE_URL = "http://remote.example.com";
  await assert.rejects(
    cloudSignIn(login),
    expectedError(503, "SUPABASE_CONFIGURATION"),
  );
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("network failures and missing migrations surface as actionable errors", async (t) => {
  let offline = true;
  t.mock.method(globalThis, "fetch", async () => {
    if (offline) throw new TypeError("upstream connection details");
    return jsonResponse(
      { code: "PGRST202", message: "schema cache details" },
      404,
    );
  });
  await assert.rejects(
    supabaseGetState(id, "learner-access-token"),
    expectedError(503, "SUPABASE_UNAVAILABLE"),
  );
  offline = false;
  await assert.rejects(
    supabaseSaveState(id, state(), "learner-access-token"),
    expectedError(503, "SUPABASE_MIGRATION_REQUIRED"),
  );
});
