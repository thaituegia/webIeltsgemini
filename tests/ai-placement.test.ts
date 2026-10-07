import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { AiServiceError, generatePlacementBank } from "../server/ai.js";
import type { Cefr } from "../shared/types.js";

const fetchBefore = globalThis.fetch;
const savedKeys = {
  primary: process.env.IELTS_OPENAI_API_KEY,
  conventional: process.env.OPENAI_API_KEY,
};
beforeEach(() => {
  process.env.IELTS_OPENAI_API_KEY = "mock-placement-only";
  process.env.OPENAI_API_KEY = "";
});
afterEach(() => {
  globalThis.fetch = fetchBefore;
  if (savedKeys.primary === undefined) delete process.env.IELTS_OPENAI_API_KEY;
  else process.env.IELTS_OPENAI_API_KEY = savedKeys.primary;
  if (savedKeys.conventional === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = savedKeys.conventional;
});

function material() {
  return {
    questions: (["A2", "B1", "B2", "C1"] as Cefr[]).flatMap((cefr) =>
      Array.from({ length: 8 }, (_, index) => ({
        id: `${cefr}-${index}`,
        cefr,
        text: `Choose the word for the ${cefr} context number ${index}.`,
        options: ["correct", "wrong one", "wrong two", "wrong three"],
        answer: "correct",
      })),
    ),
  };
}
function mockProvider(value: unknown) {
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.openai.com/v1/chat/completions");
    assert.equal(init?.redirect, "error");
    return Response.json({
      choices: [{ message: { content: JSON.stringify(value) } }],
    });
  };
}
const invalidBank = (error: unknown) =>
  error instanceof AiServiceError && error.status === 502;

test("one placement request yields a private 32-question pool with server-derived bands and randomized unique IDs", async () => {
  mockProvider(material());
  const questions = await generatePlacementBank();
  assert.equal(questions.length, 32);
  assert.equal(new Set(questions.map((question) => question.id)).size, 32);
  const bands = { A2: 3.5, B1: 4.5, B2: 6, C1: 7 };
  for (const cefr of ["A2", "B1", "B2", "C1"] as const)
    assert.equal(
      questions.filter((question) => question.cefr === cefr).length,
      8,
    );
  for (const question of questions) {
    assert.equal(question.band, bands[question.cefr]);
    assert.equal(
      question.options.filter((option) => option === question.answer).length,
      1,
    );
    assert.ok(question.id.startsWith("placement-ai-"));
  }
});

test("placement validates CEFR coverage, duplicate questions and distractors, and exact answer membership", async () => {
  const badCoverage = material();
  badCoverage.questions[0].cefr = "B1";
  mockProvider(badCoverage);
  await assert.rejects(generatePlacementBank(), invalidBank);
  const duplicate = material();
  duplicate.questions[1].text = duplicate.questions[0].text;
  mockProvider(duplicate);
  await assert.rejects(generatePlacementBank(), invalidBank);
  const duplicateId = material();
  duplicateId.questions[1].id = duplicateId.questions[0].id;
  mockProvider(duplicateId);
  await assert.rejects(generatePlacementBank(), invalidBank);
  const duplicateOptions = material();
  duplicateOptions.questions[0].options[1] = " CORRECT ";
  mockProvider(duplicateOptions);
  await assert.rejects(generatePlacementBank(), invalidBank);
  const absentAnswer = material();
  absentAnswer.questions[0].answer = "not in options";
  mockProvider(absentAnswer);
  await assert.rejects(generatePlacementBank(), invalidBank);
  const missingQuestion = material();
  missingQuestion.questions.pop();
  mockProvider(missingQuestion);
  await assert.rejects(generatePlacementBank(), invalidBank);
});
