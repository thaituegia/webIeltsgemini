import assert from "node:assert/strict";
import { test } from "node:test";
import type { StoredContent } from "../shared/types";
import { contentStructureIssues, validateContentStructure, visualAssetSchema, withinAnswerLimit } from "../shared/content-visuals";

function fixture(): StoredContent {
  return {
    id: "map-drill", skill: "listening", title: "A visitor centre", description: "An original map drill", topic: "travel",
    band: 5.5, cefr: "B2", testType: "both", durationMinutes: 8, format: "lesson", vocabularyIds: [], tags: [], source: "ai", quality: "ai-unreviewed", createdAt: "2026-10-08T00:00:00Z",
    sections: [{
      id: "section", title: "Visitor orientation", text: "The workshop is north of the entrance. Visitors need a pass.",
      visuals: [{ id: "plan", type: "plan", title: "Visitor centre floor plan", width: 500, height: 300, labels: [{ id: "entrance", x: 200, y: 250, text: "Entrance" }, { id: "blank", x: 200, y: 100, questionNumber: 1 }], paths: [{ id: "walkway", style: "path", points: [[200, 250], [200, 100]] }] }],
      questionBlocks: [{ id: "notes", type: "note", title: "Visitor information", instructions: "Write ONE WORD for the answer.", questionNumbers: [2], text: "Visitors need a {{2}}." }],
    }],
    questions: [
      { id: "q1", number: 1, type: "text", questionType: "plan-labelling", prompt: "Identify the room marked 1.", wordLimit: 1, sectionIndex: 0, subskill: "spatial-directions", visualId: "plan", answer: "workshop", explanation: "The room is north of the entrance.", evidence: "The workshop is north of the entrance." },
      { id: "q2", number: 2, type: "text", questionType: "note-completion", prompt: "Complete the visitor information.", wordLimit: 1, sectionIndex: 0, subskill: "completion", blockId: "notes", answer: "pass", explanation: "Visitors need a pass.", evidence: "Visitors need a pass." },
    ],
  };
}
test("natural typed map and inline completion retain answer-free assets with exact references", () => {
  const content = fixture();
  assert.doesNotThrow(() => validateContentStructure(content));
  const publicAsset = JSON.stringify(content.sections[0].visuals);
  assert(!publicAsset.includes("workshop"));
  assert.match(publicAsset, /questionNumber/);
});
test("asset validation rejects hidden keys, exposed blank labels and invalid geometry", () => {
  const content = fixture();
  const plan = content.sections[0].visuals![0];
  assert(!visualAssetSchema.safeParse({ ...plan, svg: '<script>alert(1)</script>' }).success);
  assert(!visualAssetSchema.safeParse({ ...plan, answer: "workshop" }).success);
  if (!("labels" in plan)) throw new Error("Expected plan");
  plan.labels[1].text = "workshop";
  assert(contentStructureIssues(content).some((issue) => issue.includes("never both")));
  delete plan.labels[1].text;
  plan.labels[0].text = "workshop";
  assert(contentStructureIssues(content).some((issue) => issue.includes("reveals blank")));
  plan.labels[0].text = "Entrance";
  plan.labels[1].x = 501;
  assert(contentStructureIssues(content).some((issue) => issue.includes("outside canvas")));
});
test("orphan diagrams, repeated inline blanks, and pie percentages fail before storage", () => {
  const content = fixture();
  content.questions[0].visualId = "missing";
  content.sections[0].questionBlocks![0].text += " The {{2}} must be shown.";
  content.sections[0].visuals!.push({ id: "pie", type: "pie", title: "Survey results", rows: [{ label: "Walking", values: [70] }, { label: "Cycling", values: [40] }], series: ["Travel mode"], unit: "%" });
  const issues = contentStructureIssues(content);
  assert(issues.some((issue) => issue.includes("orphan visual")));
  assert(issues.some((issue) => issue.includes("exactly once")));
  assert(issues.some((issue) => issue.includes("pie proportions")));
  assert.throws(() => validateContentStructure(content), /pie proportions/);
});
test("public fixed-label phrases and arrow captions cannot reveal a blank answer", () => {
  const content = fixture();
  const plan = content.sections[0].visuals![0];
  if (!("labels" in plan)) throw new Error("Expected plan");
  plan.labels[0].text = "Directions to the workshop";
  assert(contentStructureIssues(content).some((issue) => issue.includes("caption reveals blank")));
  plan.labels[0].text = "Entrance";
  plan.nodes = [
    { id: "first-stage", x: 20, y: 20, width: 60, height: 40, text: "Stage A" },
    { id: "second-stage", x: 100, y: 20, width: 60, height: 40, text: "Stage B" },
  ];
  plan.connections = [{ from: "first-stage", to: "second-stage", label: "Towards the workshop" }];
  assert(contentStructureIssues(content).some((issue) => issue.includes("caption reveals blank")));
  plan.connections[0].label = "Visitor route";
  assert.doesNotThrow(() => validateContentStructure(content));
});
test("answer limits distinguish hyphenated words and an explicitly allowed number", () => {
  assert(withinAnswerLimit("eco-friendly", 1));
  assert(withinAnswerLimit("first-floor 12", 1, true));
  assert(!withinAnswerLimit("first floor 12", 1, true));
  assert(!withinAnswerLimit("first-floor 12 13", 1, true));
  assert(!withinAnswerLimit("first-floor 12", 1));
});
test("generated maps reject answer leakage from inferred path legends without inventing diagram legends", () => {
  for (const [answer, style] of [["road", "road"], ["river", "river"], ["footpath", undefined]] as const) {
    const content = fixture();
    const visual = content.sections[0].visuals![0];
    if (!("labels" in visual)) throw new Error("Expected spatial visual");
    content.questions[0].answer = answer;
    visual.paths![0].style = style;
    assert(contentStructureIssues(content).some((issue) => issue.includes("caption reveals blank")), answer);
    visual.type = "diagram";
    content.questions[0].questionType = "diagram-labelling";
    assert.doesNotThrow(() => validateContentStructure(content));
  }
});
