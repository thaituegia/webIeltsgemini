import assert from "node:assert/strict";
import { test } from "node:test";
import { generateContent } from "../server/ai";
import { ApiError } from "../server/errors";

function envelope(value: unknown): Response {
  return Response.json({ choices: [{ message: { content: JSON.stringify(value) } }] });
}
async function withProvider(draft: unknown, action: (calls: () => number, payloads: unknown[]) => Promise<void>): Promise<void> {
  const previousKey = process.env.IELTS_OPENAI_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.IELTS_OPENAI_API_KEY = "visual-tests-local-only";
  let count = 0;
  const payloads: unknown[] = [];
  globalThis.fetch = async (_url, init) => {
    payloads.push(JSON.parse(String(init?.body)));
    count++;
    return envelope(count === 1 ? draft : { approved: true, issues: [], difficultyReason: "Synthetic test fixture; not a real content review." });
  };
  try { await action(() => count, payloads); }
  finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.IELTS_OPENAI_API_KEY;
    else process.env.IELTS_OPENAI_API_KEY = previousKey;
  }
}
function writingDraft() {
  return {
    title: "A natural water-treatment process", description: "Original process task", cefr: "B2", durationMinutes: 60, format: "full-mock", questions: [], tags: ["process"],
    sections: [
      {
        id: "task1", title: "Task 1", task: 1, text: "The diagram shows how a town treats water. Summarise the information by selecting and reporting the main features.", instructions: "Write at least 150 words in about 20 minutes.",
        visuals: [{ id: "process", type: "process", title: "Water-treatment stages", width: 600, height: 300, labels: [], nodes: [{ id: "stage1", x: 20, y: 100, width: 160, height: 70, text: "Collect raw water" }, { id: "stage2", x: 220, y: 100, width: 160, height: 70, text: "Filter impurities" }, { id: "stage3", x: 420, y: 100, width: 160, height: 70, text: "Disinfect and store" }], connections: [{ from: "stage1", to: "stage2" }, { from: "stage2", to: "stage3" }] }],
      },
      { id: "task2", title: "Task 2", task: 2, text: "Some people think towns should invest more in public water supplies than roads. To what extent do you agree or disagree?", instructions: "Write at least 250 words in about 40 minutes." },
    ],
  };
}
test("AI generation accepts a full typed process task without forcing a bar chart", async () => {
  await withProvider(writingDraft(), async (calls, payloads) => {
    const result = await generateContent({ skill: "writing", band: 6, topic: "water management", testType: "academic" });
    assert.equal(calls(), 2);
    assert.equal(result.sections[0].visuals?.[0].type, "process");
    assert.equal(result.sections[0].chart, undefined);
    assert.equal(result.review?.status, "structural-checks-passed");
    assert.equal(result.quality, "ai-unreviewed");
    assert.equal(result.estimatedDifficulty?.band, 6);
    assert.match(JSON.stringify(payloads[1]), /Water-treatment stages/);
  });
});
test("AI cannot store raw SVG, hidden answer fields, or broken process links", async () => {
  for (const defect of ["svg", "answer", "unknown-link"] as const) {
    const draft = writingDraft();
    const asset = draft.sections[0].visuals![0];
    if (defect === "svg") Object.assign(asset, { svg: "<script>alert(1)</script>" });
    if (defect === "answer") Object.assign(asset, { answer: "revealed answer" });
    if (defect === "unknown-link") asset.connections[0].to = "unknown-stage";
    await withProvider(draft, async (calls) => {
      await assert.rejects(generateContent({ skill: "writing", band: 6, topic: "water management", testType: "academic" }), (error: unknown) => error instanceof ApiError && error.status === 502);
      assert.equal(calls(), 1, `critic should not run for ${defect}`);
    });
  }
});
test("AI keeps distinct multi-select answer slots while validating completion blanks", async () => {
  const passage = "The centre extended its opening hours and introduced quiet study areas. Visitors receive a pass. " + Array.from({ length: 60 }, (_, index) => `The local service review considered access issue ${index + 1} with residents and volunteers.`).join(" ");
  const draft = {
    title: "Access to a study centre", description: "A multi-select fixture", cefr: "B2", durationMinutes: 18, format: "lesson", tags: [],
    sections: [{ id: "reading", title: "The study centre", text: passage, questionBlocks: [{ id: "notes", type: "note", title: "Visitor information", instructions: "Write ONE WORD.", questionNumbers: [4], text: "Visitors receive a {{4}}." }] }],
    questions: Array.from({ length: 10 }, (_, index) => ({
      id: `q${index + 1}`, number: index + 1, type: index < 2 ? "choice-multiple" : index === 2 ? "true-false" : index === 3 ? "text" : "choice",
      prompt: index < 2 ? "Which TWO changes did the centre introduce?" : `Synthetic item ${index + 1}`,
      ...(index < 2 ? { selectionGroup: { id: "changes", count: 2 }, groupInstructions: "Choose TWO options." } : {}),
      ...(index < 2 || index >= 4 ? { options: ["extended hours", "quiet study areas", "paid entry", "new cafe"] } : {}),
      ...(index === 3 ? { wordLimit: 1, blockId: "notes", questionType: "note-completion" } : {}),
      sectionIndex: 0, subskill: "detail", answer: index === 0 ? "extended hours" : index === 1 ? "quiet study areas" : index === 2 ? "TRUE" : index === 3 ? "pass" : "extended hours",
      explanation: "Synthetic answer-key transport fixture.", evidence: index === 3 ? "Visitors receive a pass." : "The centre extended its opening hours and introduced quiet study areas.",
    })),
  };
  await withProvider(draft, async (calls) => {
    const result = await generateContent({ skill: "reading", band: 5.5, topic: "study facilities", testType: "academic" });
    assert.equal(calls(), 2);
    assert.equal(result.questions.length, 10);
    assert.deepEqual(result.questions.slice(0, 2).map((question) => question.answer), ["extended hours", "quiet study areas"]);
    assert.equal(result.sections[0].questionBlocks![0].text, "Visitors receive a {{4}}.");
  });
  draft.sections[0].questionBlocks![0].text = "Visitors receive a {{9}}.";
  await withProvider(draft, async (calls) => {
    await assert.rejects(generateContent({ skill: "reading", band: 5.5, topic: "study facilities", testType: "academic" }), (error: unknown) => error instanceof ApiError && error.status === 502);
    assert.equal(calls(), 1);
  });
});
