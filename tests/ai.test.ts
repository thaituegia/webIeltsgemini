import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  aiCapabilities,
  AiServiceError,
  evaluateSpeaking,
  evaluateWriting,
  generateExercise,
  synthesizeListening,
} from "../server/ai";
import type { Exercise } from "../shared/types";

const originalFetch = globalThis.fetch;
const credentialNames = [
  "IELTS_OPENAI_API_KEY",
  "OPENAI_API_KEY",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_BRITISH_ID",
  "ELEVENLABS_VOICE_AUSTRALIAN_ID",
  "ELEVENLABS_VOICE_AMERICAN_ID",
  "AZURE_SPEECH_KEY",
  "AZURE_SPEECH_REGION",
];
beforeEach(() => {
  for (const name of credentialNames) process.env[name] = "";
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const writing: Exercise = {
  id: "writing-fixture",
  skill: "writing",
  title: "Public transport",
  description: "Task 2",
  band: 6,
  cefr: "B2",
  durationMinutes: 40,
  content: "Should cities invest more in public transport?",
  sections: [],
  questions: [],
  vocabulary: [],
  task: 2,
  source: "sample",
};
const essay =
  "Public transport can reduce pollution. Cities should support reliable buses.\n\nFor example, good services help commuters travel without cars.";
function chat(content: unknown): Response {
  return Response.json({
    choices: [{ message: { content: JSON.stringify(content) } }],
  });
}
function assertAiError(status: number): (error: unknown) => boolean {
  return (error) => {
    assert.ok(error instanceof AiServiceError);
    assert.equal(error.status, status);
    return true;
  };
}
function pcmWav(seconds: number): Buffer {
  const bytes = Buffer.alloc(44 + seconds * 32_000);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write("WAVE", 8);
  bytes.write("fmt ", 12);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16_000, 24);
  bytes.writeUInt32LE(32_000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(bytes.length - 44, 40);
  return bytes;
}

test("offline writing and transcript practice provide measurements without fabricated IELTS bands", async () => {
  globalThis.fetch = async () => {
    throw new Error("Offline practice must not call a provider");
  };
  const result = await evaluateWriting(writing, essay);
  assert.equal(result.source, "sample");
  assert.equal(result.score, null);
  assert.equal(result.criteria.length, 4);
  assert.ok(result.criteria.every((criterion) => criterion.band === null));
  assert.equal(result.paragraphs.length, 2);
  assert.ok((result.wordCount ?? 0) > 0);
  const speaking = await evaluateSpeaking(
    { ...writing, skill: "speaking" },
    Buffer.alloc(0),
    "audio/wav",
    "Um, I like parks. Uh, you know, parks matter.",
  );
  assert.equal(speaking.score, null);
  assert.equal(speaking.pronunciation, null);
  assert.equal(speaking.fillerCount, 3);
  assert.ok(speaking.criteria.every((criterion) => criterion.band === null));
  await assert.rejects(evaluateWriting(writing, "  "), assertAiError(400));
  await assert.rejects(
    evaluateSpeaking(
      { ...writing, skill: "speaking" },
      Buffer.alloc(0),
      "audio/wav",
    ),
    assertAiError(400),
  );
});

test("writing separates evidence extraction from scoring, discards invented quotes and averages four criteria", async () => {
  process.env.IELTS_OPENAI_API_KEY = "test-only-openai-credential";
  const extraction = {
    taskResponse: [
      {
        quote: "Public transport can reduce pollution.",
        observation: "Luận điểm phù hợp.",
      },
      { quote: "An invented sentence.", observation: "Không có trong bài." },
    ],
    coherenceCohesion: [],
    lexicalResource: [],
    grammaticalRangeAccuracy: [],
    paragraphObservations: [
      { index: 1, observation: "Mở bài." },
      { index: 2, observation: "Ví dụ." },
    ],
  };
  const criterion = (band: number) => ({
    band,
    feedback: "Nhận xét có dẫn chứng.",
    evidence: [
      "Public transport can reduce pollution.",
      "Another invented quote.",
    ],
  });
  const assessment = {
    summary: "Nhận xét luyện tập.",
    taskResponse: criterion(6),
    coherenceCohesion: criterion(6.5),
    lexicalResource: criterion(6),
    grammaticalRangeAccuracy: criterion(6.5),
    corrections: [
      {
        original: "Cities should support reliable buses.",
        suggestion: "Cities should fund reliable bus services.",
        explanation: "Diễn đạt cụ thể hơn.",
      },
      {
        original: "Not submitted by this learner.",
        suggestion: "Invalid correction.",
        explanation: "Không có trong bài.",
      },
    ],
    paragraphs: [
      { index: 1, feedback: "Rõ ý chính." },
      { index: 2, feedback: "Bổ sung dữ kiện." },
      { index: 3, feedback: "Đoạn không tồn tại." },
    ],
  };
  const calls: { name: string; data: Record<string, unknown> }[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/chat/completions");
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-only-openai-credential",
    );
    assert.equal(typeof init?.body, "string");
    const payload = JSON.parse(String(init?.body)) as {
      response_format: { json_schema: { name: string; strict: boolean } };
      messages: { role: string; content: string }[];
    };
    assert.equal(payload.response_format.json_schema.strict, true);
    const data = JSON.parse(payload.messages[1].content) as Record<
      string,
      unknown
    >;
    calls.push({ name: payload.response_format.json_schema.name, data });
    assert.equal(data.essay, essay);
    if (calls.length === 1) return chat(extraction);
    const evidence = data.evidence as typeof extraction;
    assert.equal(evidence.taskResponse.length, 1);
    assert.equal(
      evidence.taskResponse[0].quote,
      extraction.taskResponse[0].quote,
    );
    return chat(assessment);
  };
  const result = await evaluateWriting(writing, essay);
  assert.deepEqual(
    calls.map((call) => call.name),
    ["writing_evidence", "writing_assessment"],
  );
  assert.equal(result.source, "ai");
  assert.equal(result.score, 6.5);
  assert.equal(result.corrections.length, 1);
  assert.equal(result.paragraphs.length, 2);
  assert.ok(result.criteria.every((item) => item.evidence.length === 1));
});

test("invalid structured output, refusals and provider failures return safe errors without secrets", async () => {
  process.env.IELTS_OPENAI_API_KEY =
    "test-credential-must-never-appear-in-an-error";
  globalThis.fetch = async () => chat({ taskResponse: [] });
  await assert.rejects(evaluateWriting(writing, essay), assertAiError(502));
  globalThis.fetch = async () =>
    Response.json({
      choices: [{ message: { content: null, refusal: "cannot assess" } }],
    });
  await assert.rejects(evaluateWriting(writing, essay), assertAiError(422));
  globalThis.fetch = async () =>
    new Response(
      "secret-provider-body test-credential-must-never-appear-in-an-error",
      { status: 401 },
    );
  await assert.rejects(evaluateWriting(writing, essay), (error: unknown) => {
    assert.ok(error instanceof AiServiceError);
    assert.equal(error.status, 503);
    assert.ok(
      !error.message.includes("test-credential") &&
        !error.message.includes("secret-provider-body"),
    );
    return true;
  });
  globalThis.fetch = async () => {
    throw new DOMException("timeout", "TimeoutError");
  };
  await assert.rejects(evaluateWriting(writing, essay), assertAiError(504));
});

test("generated reading materials reject duplicated IDs and inconsistent answer keys", async () => {
  process.env.IELTS_OPENAI_API_KEY = "test-only";
  const material = {
    title: "A generated passage",
    description: "Bài đọc luyện tập",
    durationMinutes: 20,
    content: "A passage about urban transport.",
    sections: [],
    questions: Array.from({ length: 8 }, (_, index) => ({
      id: `q${index}`,
      text: `Question ${index}?`,
      type: "choice",
      options: ["A", "B", "C", "D"],
    })),
    answerKey: Array.from({ length: 8 }, (_, index) => ({
      questionId: `q${index}`,
      answer: "A",
      explanation: "Supported by the passage.",
    })),
    vocabulary: Array.from({ length: 4 }, (_, index) => ({
      front: `term${index}`,
      back: "nghĩa",
      example: "A complete example.",
      cefr: "B2",
    })),
    chart: null,
  };
  globalThis.fetch = async () => chat(material);
  const generated = await generateExercise("reading", 6);
  assert.equal(generated.exercise.source, "ai");
  assert.equal(generated.exercise.questions.length, 8);
  assert.equal(Object.keys(generated.answers).length, 8);
  assert.ok(!("answerKey" in generated.exercise));
  material.questions[1].id = "q0";
  await assert.rejects(generateExercise("reading", 6), assertAiError(502));
  material.questions[1].id = "q1";
  material.answerKey[0].answer = "Not one of the options";
  await assert.rejects(generateExercise("reading", 6), assertAiError(502));
});

test("Whisper transcription precedes text scoring and never invents an overall Speaking or pronunciation band", async () => {
  process.env.IELTS_OPENAI_API_KEY = "test-only";
  const calls: string[] = [];
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    if (calls.length === 1) {
      assert.ok(init?.body instanceof FormData);
      assert.equal(init.body.get("model"), "whisper-1");
      assert.ok(init.body.get("file") instanceof Blob);
      return Response.json({
        text: "Um, cities should invest in reliable buses.",
      });
    }
    return chat({
      summary: "Nhận xét dựa trên bản chép lời.",
      lexicalResource: {
        band: 6,
        feedback: "Vốn từ phù hợp.",
        evidence: ["reliable buses"],
      },
      grammaticalRangeAccuracy: {
        band: 6.5,
        feedback: "Câu rõ ràng.",
        evidence: ["cities should invest"],
      },
      fluencyAndCoherence: {
        band: 7,
        feedback: "Có một từ chêm.",
        evidence: [],
      },
      pronunciation: {
        band: 8,
        feedback: "Không có dữ liệu âm thanh Azure.",
        evidence: [],
      },
      corrections: [],
    });
  };
  const stages: string[] = [];
  const result = await evaluateSpeaking(
    { ...writing, skill: "speaking" },
    Buffer.from("test audio bytes"),
    "audio/webm",
    undefined,
    (event) => stages.push(event.stage),
  );
  assert.deepEqual(stages, ["transcribing", "transcript", "scoring"]);
  assert.equal(calls.length, 2);
  assert.ok(calls[0].endsWith("/audio/transcriptions"));
  assert.equal(result.score, null);
  assert.equal(result.pronunciation, null);
  assert.equal(result.fillerCount, 1);
  assert.equal(
    result.criteria.find((item) => item.name === "Lexical Resource")?.band,
    6,
  );
  assert.equal(
    result.criteria.find((item) => item.name === "Pronunciation")?.band,
    null,
  );
  await assert.rejects(
    evaluateSpeaking(
      { ...writing, skill: "speaking" },
      Buffer.from("bad"),
      "text/plain",
    ),
    assertAiError(415),
  );
});

test("listening requires explicit voice configuration and sends complete scripts as multi-voice dialogue", async () => {
  const listening: Exercise = {
    ...writing,
    skill: "listening",
    sections: [
      {
        title: "Section 1",
        content: "Anna: It is Tuesday.\nBen: Actually, we moved it to Friday.",
      },
      { title: "Section 2", content: "Guide: The museum opens at nine." },
      {
        title: "Section 3",
        content:
          "Student: We considered the library.\nTutor: However, the laboratory is more useful.",
      },
      {
        title: "Section 4",
        content: "Lecturer: Sustainable transport reduces pollution.",
      },
    ],
  };
  await assert.rejects(synthesizeListening(listening), assertAiError(503));
  process.env.ELEVENLABS_API_KEY = "test-only";
  assert.equal(aiCapabilities().elevenlabs, false);
  process.env.ELEVENLABS_VOICE_BRITISH_ID = "british";
  process.env.ELEVENLABS_VOICE_AUSTRALIAN_ID = "australian";
  process.env.ELEVENLABS_VOICE_AMERICAN_ID = "american";
  assert.equal(aiCapabilities().elevenlabs, true);
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/v1\/text-to-dialogue\?/);
    const payload = JSON.parse(String(init?.body)) as {
      inputs: { text: string; voice_id: string }[];
      model_id: string;
    };
    assert.equal(payload.model_id, "eleven_v3");
    assert.equal(payload.inputs.length, 6);
    assert.equal(
      new Set(payload.inputs.map((input) => input.voice_id)).size,
      3,
    );
    assert.ok(
      payload.inputs.some(
        (input) => input.text === "Actually, we moved it to Friday.",
      ),
    );
    return new Response(Uint8Array.from([1, 2, 3]), {
      headers: { "content-type": "audio/mpeg" },
    });
  };
  assert.deepEqual(
    await synthesizeListening(listening),
    Buffer.from([1, 2, 3]),
  );
  globalThis.fetch = async () =>
    Response.json({ unexpected: "json instead of audio" });
  await assert.rejects(synthesizeListening(listening), assertAiError(502));
});

test("measured Azure evidence is passed to the Speaking scorer before a complete four-criterion estimate", async () => {
  process.env.IELTS_OPENAI_API_KEY = "test-only";
  process.env.AZURE_SPEECH_KEY = "test-only-azure";
  process.env.AZURE_SPEECH_REGION = "southeastasia";
  const transcript = "Cities should invest in reliable public buses.";
  const metrics = {
    AccuracyScore: 81,
    FluencyScore: 77,
    CompletenessScore: 92,
    ProsodyScore: 74,
  };
  const criterion = (band: number, evidence: string[]) => ({
    band,
    feedback: "Ước lượng luyện tập có giới hạn.",
    evidence,
  });
  let calls = 0;
  globalThis.fetch = async (url, init) => {
    calls++;
    if (calls === 1) return Response.json({ text: transcript });
    if (calls === 2) {
      assert.match(String(url), /southeastasia\.stt\.speech\.microsoft\.com/);
      assert.equal(
        new Headers(init?.headers).get("Ocp-Apim-Subscription-Key"),
        "test-only-azure",
      );
      return Response.json({
        RecognitionStatus: "Success",
        NBest: [{ PronunciationAssessment: metrics }],
      });
    }
    const payload = JSON.parse(String(init?.body)) as {
      messages: { content: string }[];
    };
    const data = JSON.parse(payload.messages[1].content) as {
      acousticEvidence: {
        durationSeconds: number;
        metrics: {
          accuracy: number;
          fluency: number;
          completeness: number;
          prosody: number;
        };
      };
    };
    assert.equal(data.acousticEvidence.durationSeconds, 2);
    assert.equal(data.acousticEvidence.metrics.accuracy, 81);
    assert.equal(data.acousticEvidence.metrics.fluency, 77);
    return chat({
      summary: "Band AI luyện tập.",
      fluencyAndCoherence: criterion(7, ["Azure FluencyScore 77"]),
      lexicalResource: criterion(6, ["reliable public buses"]),
      grammaticalRangeAccuracy: criterion(6.5, ["Cities should invest"]),
      pronunciation: criterion(6, ["Azure AccuracyScore 81"]),
      corrections: [],
    });
  };
  const stages: string[] = [];
  const result = await evaluateSpeaking(
    { ...writing, skill: "speaking" },
    pcmWav(2),
    "audio/wav",
    undefined,
    (event) => stages.push(event.stage),
  );
  assert.equal(calls, 3);
  assert.deepEqual(stages, [
    "transcribing",
    "transcript",
    "pronunciation",
    "scoring",
  ]);
  assert.deepEqual(result.pronunciation, {
    accuracy: 81,
    fluency: 77,
    completeness: 92,
    prosody: 74,
  });
  assert.deepEqual(
    result.criteria.map((criterion) => criterion.band),
    [7, 6, 6.5, 6],
  );
  assert.equal(result.score, 6.5);
});
