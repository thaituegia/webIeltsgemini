import assert from "node:assert/strict";
import { test } from "node:test";
import { createEmptyCard } from "ts-fsrs";
import type { AttemptSummary, Profile, StoredContent } from "../shared/types";
import {
  buildDashboard,
  cefrForBand,
  estimatePlacement,
  generatePlan,
  gradeObjective,
  ieltsOverall,
  newScheduler,
  scheduleReview,
  selectPlacementQuestion,
  vocabularyMetrics,
} from "../server/learning";

const profile: Profile = {
  id: "test-learner",
  name: "Learner",
  email: "learner@example.test",
  demo: false,
  currentBand: null,
  targetBand: 7,
  testType: "academic",
  examDate: "2027-01-01",
  weeklyMinutes: 60,
  dailyMinutes: 15,
  cefr: null,
  createdAt: "2026-10-01T00:00:00.000Z",
};
function content(
  count = 3,
  format: "lesson" | "full-mock" = "lesson",
): StoredContent {
  return {
    id: "content",
    skill: "reading",
    title: "Original library test",
    description: "An original test fixture",
    topic: "education",
    band: 5.5,
    cefr: "B2",
    testType: "academic",
    durationMinutes: format === "full-mock" ? 60 : 10,
    format,
    sections: [
      {
        id: "section",
        title: "Community library",
        text: "The library is open on Tuesday. It has two reading rooms.",
      },
    ],
    vocabularyIds: [],
    tags: [],
    source: "authored",
    quality: "authored-unreviewed",
    createdAt: "2026-10-01T00:00:00.000Z",
    questions: Array.from({ length: count }, (_, index) => ({
      id: `q-${index}`,
      number: index + 1,
      type: "text",
      prompt: `Test fixture ${index + 1}`,
      wordLimit: 1,
      sectionIndex: 0,
      subskill: "detail",
      answer: "Tuesday",
      acceptedAnswers: ["tue"],
      explanation: "The opening day is Tuesday.",
      evidence: "The library is open on Tuesday.",
    })),
  };
}
test("IELTS overall requires four measured bands and respects .25/.75 boundaries", () => {
  assert.equal(ieltsOverall([6.5, 6.5, 6, 6]), 6.5);
  assert.equal(ieltsOverall([7, 7, 6.5, 6.5]), 7);
  assert.equal(ieltsOverall([7, 6.5, 5.5, 5.5]), 6);
  assert.equal(ieltsOverall([7, 6.5, 6, 6]), 6.5);
  assert.equal(ieltsOverall([7, 6, null, 6]), null);
  assert.equal(ieltsOverall([7, 6, 6]), null);
  assert.equal(ieltsOverall([NaN, 6, 6, 6]), null);
  assert.equal(cefrForBand(3.5), "A2");
  assert.equal(cefrForBand(5), "B1");
  assert.equal(cefrForBand(6.5), "B2");
  assert.equal(cefrForBand(7), "C1");
});
test("objective marking accepts normalized variants, enforces word limits and keeps drill bands unavailable", () => {
  const lesson = content();
  const feedback = gradeObjective(lesson, {
    "q-0": "  TUESDAY  ",
    "q-1": "tue",
    "q-2": "Tuesday morning",
  });
  assert.equal(feedback.rawScore, 2);
  assert.equal(feedback.total, 3);
  assert.equal(feedback.estimatedBand, null);
  assert.match(feedback.answers[2].explanation, /giới hạn/);
  assert.equal(feedback.answers[0].evidence, lesson.questions[0].evidence);
  const exam = content(40, "full-mock");
  const allCorrect = Object.fromEntries(
    exam.questions.map((q) => [q.id, "Tuesday"]),
  );
  assert.equal(gradeObjective(exam, allCorrect).estimatedBand, 9);
  const thirty = Object.fromEntries(
    exam.questions.slice(0, 30).map((q) => [q.id, "Tuesday"]),
  );
  assert.equal(gradeObjective(exam, thirty).estimatedBand, 7);
  assert.equal(
    gradeObjective({ ...exam, testType: "general" }, thirty).estimatedBand,
    6,
  );
});
test("Rasch MAP moves appropriately with evidence and Fisher selection never repeats a seen item", () => {
  const evidence = Array.from({ length: 15 }, () => ({
    correct: true,
    difficulty: 0,
  }));
  const correct = estimatePlacement(evidence);
  const wrong = estimatePlacement(
    evidence.map((row) => ({ ...row, correct: false })),
  );
  assert(correct.theta > 0);
  assert(wrong.theta < 0);
  assert(correct.estimatedBand > wrong.estimatedBand);
  assert(correct.standardError < 1.5);
  const bank = [
    { id: "easy", difficulty: -2 },
    { id: "middle", difficulty: 0 },
    { id: "hard", difficulty: 2 },
  ].map((row) => ({
    ...row,
    skill: "reading" as const,
    text: "An original short paragraph.",
    question: "Which choice follows?",
    options: ["A", "B"],
    answer: "A",
    explanation: "Evidence.",
    band: 5,
    cefr: "B1" as const,
    subskill: "detail",
  }));
  assert.equal(selectPlacementQuestion(bank, [], 0).id, "middle");
  assert.notEqual(selectPlacementQuestion(bank, ["middle"], 0).id, "middle");
  assert.throws(
    () =>
      selectPlacementQuestion(
        bank,
        bank.map((item) => item.id),
        0,
      ),
    /đã hết/,
  );
});
test("real FSRS updates recall history and date; new cards are due with no invented retention", () => {
  const now = new Date("2026-10-07T10:00:00.000Z");
  const initial = newScheduler(now);
  assert.equal(vocabularyMetrics(initial, now).reps, 0);
  assert.equal(vocabularyMetrics(initial, now).retrievability, 0);
  assert.equal(vocabularyMetrics(initial, now).due, true);
  const easy = scheduleReview(initial, 4, now);
  const good = scheduleReview(initial, 3, now);
  const easyMetrics = vocabularyMetrics(easy.scheduler, now);
  assert.equal(easyMetrics.reps, 1);
  assert(easyMetrics.stability > 0);
  assert(easyMetrics.difficulty >= 1);
  assert(new Date(easyMetrics.dueAt) > now);
  assert.equal(easyMetrics.due, false);
  assert(easyMetrics.retrievability >= 0.99);
  assert(
    new Date(easyMetrics.dueAt) >=
      new Date(vocabularyMetrics(good.scheduler, now).dueAt),
  );
  assert.equal(JSON.parse(easy.log).rating, 4);
  assert.throws(() => vocabularyMetrics("{corrupt", now), /lịch ôn/);
  assert.equal(
    vocabularyMetrics(JSON.stringify(createEmptyCard(now)), now).reps,
    0,
  );
});
test("Bangkok-week planning obeys time budget and empty learners have no invented scores/history", () => {
  const now = new Date("2026-10-11T23:30:00.000Z"); // Monday morning in Bangkok.
  const items = ["reading", "listening", "writing", "speaking"].map(
    (skill) => ({
      ...content(),
      id: skill,
      skill: skill as StoredContent["skill"],
    }),
  );
  const plan = generatePlan(profile, [], [], items, now);
  assert.equal(plan.weekStart, "2026-10-12");
  assert(
    plan.tasks.reduce((total, task) => total + task.minutes, 0) <=
      profile.weeklyMinutes,
  );
  assert(plan.tasks.every((task) => !task.completed));
  const dashboard = buildDashboard(profile, [], [], items, plan, now);
  assert.equal(dashboard.overallBand, null);
  assert.equal(dashboard.completedCount, 0);
  assert.equal(dashboard.streakDays, 0);
  assert.equal(dashboard.vocabularyRetention, null);
  assert(dashboard.skills.every((skill) => skill.estimatedBand === null));
});
test("repeated scored forms retain the first result as independent evidence", () => {
  const attempts: AttemptSummary[] = [
    {
      id: "a",
      contentId: "same",
      title: "Mock",
      skill: "reading",
      mode: "exam",
      status: "submitted",
      startedAt: "2026-10-07T00:00:00Z",
      submittedAt: "2026-10-07T00:01:00Z",
      durationSeconds: 60,
      estimatedBand: 7,
      rawScore: 30,
      total: 40,
      feedbackSource: "rule-based",
    },
    {
      id: "b",
      contentId: "same",
      title: "Mock",
      skill: "reading",
      mode: "exam",
      status: "submitted",
      startedAt: "2026-10-06T00:00:00Z",
      submittedAt: "2026-10-06T00:01:00Z",
      durationSeconds: 60,
      estimatedBand: 3,
      rawScore: 5,
      total: 40,
      feedbackSource: "rule-based",
    },
  ];
  const items = [content(40, "full-mock")];
  const now = new Date("2026-10-07T10:00:00Z");
  const dashboard = buildDashboard(
    profile,
    attempts,
    [],
    items,
    generatePlan(profile, attempts, [], items, now),
    now,
  );
  assert.equal(
    dashboard.skills.find((row) => row.skill === "reading")?.estimatedBand,
    3,
  );
  assert.equal(dashboard.overallBand, null);
});
