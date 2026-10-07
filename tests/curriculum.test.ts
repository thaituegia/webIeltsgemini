import assert from "node:assert/strict";
import { test } from "node:test";
import { cefrForBand, overallBand, sampleExercise } from "../server/curriculum";

test("IELTS overall rounding follows the quarter-band and three-quarter-band boundaries", () => {
  assert.equal(overallBand([6.5, 6.5, 6, 6]), 6.5); // Average 6.25.
  assert.equal(overallBand([7, 7, 6.5, 6.5]), 7); // Average 6.75.
  assert.equal(overallBand([7, 6.5, 5.5, 5.5]), 6); // Average 6.125.
  assert.equal(overallBand([7, 6.5, 6, 6]), 6.5); // Average 6.375.
  assert.equal(overallBand([6.5, 6.5, 6.5, 7]), 6.5); // Average 6.625.
  assert.equal(overallBand([6, 6, 6]), null);
  assert.equal(overallBand([6, 6, 6, Number.NaN]), null);
  assert.equal(overallBand([6, 6, 6, 10]), null);
});

test("band-specific sample materials include usable question keys, writing tasks and four listening sections", () => {
  assert.deepEqual([3, 4, 5.5, 7].map(cefrForBand), ["A2", "B1", "B2", "C1"]);
  for (const band of [3, 4, 5.5, 7]) {
    const reading = sampleExercise("reading", band);
    assert.ok(reading.exercise.questions.length >= 5);
    assert.equal(reading.exercise.cefr, cefrForBand(band));
    assert.equal(
      Object.keys(reading.answers).length,
      reading.exercise.questions.length,
    );
    for (const question of reading.exercise.questions) {
      assert.ok(reading.answers[question.id]?.explanation);
      if (question.type === "choice")
        assert.ok(
          question.options?.includes(reading.answers[question.id].answer),
        );
    }
  }
  const listening = sampleExercise("listening", 6);
  assert.equal(listening.exercise.sections.length, 4);
  assert.ok(listening.exercise.questions.length >= 8);
  assert.match(listening.exercise.sections[0].content, /Tuesday.*Friday/s);
  const task1 = sampleExercise("writing", 6, 1).exercise;
  const task2 = sampleExercise("writing", 6, 2).exercise;
  assert.ok(task1.chart && task1.chart.length >= 4);
  assert.equal(task1.task, 1);
  assert.equal(task2.task, 2);
  assert.ok(task2.content);
});
