import assert from "node:assert/strict";
import {
  contentBank,
  vocabularyBank,
  placementBank,
} from "../server/data/index.js";
import type { ContentKind } from "../shared/types.js";
import { validateContentStructure, withinAnswerLimit } from "../shared/content-visuals.js";

const unique = (values: string[], label: string) =>
  assert.equal(
    new Set(values).size,
    values.length,
    `${label}: duplicate IDs or values`,
  );
unique(
  contentBank.map((x) => x.id),
  "content",
);
unique(
  contentBank.flatMap((x) => x.sections.map((s) => s.id)),
  "section IDs",
);
unique(
  contentBank.flatMap((x) => x.questions.map((q) => q.id)),
  "question IDs",
);
unique(
  vocabularyBank.map((x) => x.id),
  "vocabulary IDs",
);
unique(
  placementBank.map((x) => x.id),
  "placement IDs",
);
const ids = new Set(vocabularyBank.map((x) => x.id));
const types = new Set<string>();
const levels = new Set<string>();
const topics = new Set<string>();
for (const item of contentBank) {
  const expanded = item.provenance?.version?.includes("v3") === true;
  assert.equal(item.source, expanded ? "ai" : "authored", `${item.id}: unexpected source`);
  assert.equal(
    item.quality,
    expanded ? "ai-unreviewed" : "authored-unreviewed",
    `${item.id}: unsupported quality claim`,
  );
  assert.ok(
    item.title && item.description && item.topic,
    `${item.id}: missing metadata`,
  );
  assert.ok(item.sections.length, `${item.id}: missing sections`);
  validateContentStructure(item);
  assert.ok(
    item.band >= 3 && item.band <= 8,
    `${item.id}: band out of authored range`,
  );
  levels.add(item.cefr);
  if (item.format === "lesson") topics.add(item.topic);
  for (const wordId of item.vocabularyIds)
    assert.ok(ids.has(wordId), `${item.id}: unknown vocabulary ${wordId}`);
  for (const section of item.sections) {
    assert.ok(
      section.text.trim().length >= 20,
      `${item.id}: trivial/empty section`,
    );
    if (section.chart) {
      assert.ok(
        section.chartSeries?.length,
        `${item.id}: chart without labels`,
      );
      assert.ok(section.chartUnit, `${item.id}: chart without unit`);
      for (const row of section.chart) {
        assert.equal(
          row.values.length,
          section.chartSeries!.length,
          `${item.id}: chart shape`,
        );
        assert.ok(
          row.values.every(Number.isFinite),
          `${item.id}: non-finite chart`,
        );
      }
    }
    for (const line of section.dialogue ?? [])
      assert.ok(
        line.speaker &&
          line.text &&
          ["british", "american", "australian"].includes(line.accent),
        `${item.id}: dialogue metadata`,
      );
  }
  unique(
    item.questions.filter((q, index, all) => !q.selectionGroup || all.findIndex((candidate) => candidate.selectionGroup?.id === q.selectionGroup?.id) === index).map((q) => q.prompt),
    `${item.id} question wording`,
  );
  for (const [index, q] of item.questions.entries()) {
    types.add(q.type);
    assert.equal(q.number, index + 1, `${item.id}: nonconsecutive numbering`);
    assert.ok(
      Number.isInteger(q.sectionIndex) &&
        q.sectionIndex >= 0 &&
        q.sectionIndex < item.sections.length,
      `${q.id}: invalid section index`,
    );
    assert.ok(
      q.answer && q.explanation && q.evidence && q.subskill,
      `${q.id}: missing answer metadata`,
    );
    if (["choice", "choice-multiple", "matching", "true-false", "yes-no"].includes(q.type)) {
      assert.ok(q.options && q.options.length >= 2, `${q.id}: missing options`);
      unique(q.options!, `${q.id} options`);
      assert.equal(
        q.options!.filter((option) => option === q.answer).length,
        1,
        `${q.id}: not exactly one keyed answer`,
      );
    }
    if (q.wordLimit)
      assert.ok(
        withinAnswerLimit(q.answer, q.wordLimit, q.allowNumbers),
        `${q.id}: answer exceeds word limit`,
      );
    if (item.skill === "reading" || item.skill === "listening") {
      const text = item.sections[q.sectionIndex]!.text;
      if (q.answer !== "NOT GIVEN")
        assert.ok(
          text.includes(q.evidence),
          `${q.id}: evidence is not a passage/transcript span`,
        );
      if (!expanded && q.answer === "NOT GIVEN")
        assert.ok(
          /no information|gives no|not.*provided/i.test(q.evidence),
          `${q.id}: no rationale for absent evidence`,
        );
      if (expanded && q.answer === "NOT GIVEN")
        assert.ok(q.explanation.length >= 40, `${q.id}: missing explanation for absent information`);
      if (!expanded && q.type === "true-false" && q.answer === "FALSE")
        assert.ok(
          /did not require|Only \d+%/.test(q.evidence),
          `${q.id}: FALSE lacks explicit contradiction`,
        );
      if (!expanded && q.type === "yes-no" && q.answer === "NO")
        assert.ok(
          /too early|do not establish/.test(q.evidence),
          `${q.id}: NO lacks author contradiction`,
        );
    }
  }
  if (item.format === "full-mock") {
    if (item.skill === "reading" || item.skill === "listening") {
      assert.equal(
        item.questions.length,
        40,
        `${item.id}: full receptive mock must have 40 questions`,
      );
      assert.equal(
        item.sections.length,
        item.skill === "reading" ? 3 : 4,
        `${item.id}: wrong receptive structure`,
      );
      assert.equal(
        item.durationMinutes,
        item.skill === "reading" ? 60 : 30,
        `${item.id}: wrong duration`,
      );
      if (item.skill === "listening")
        for (let section = 0; section < 4; section++)
          assert.equal(
            item.questions.filter((q) => q.sectionIndex === section).length,
            10,
            `${item.id}: each listening part needs ten questions`,
          );
      if (item.skill === "reading") {
        const words = item.sections.map(
          (section) => section.text.trim().split(/\s+/).length,
        );
        const total = words.reduce((sum, count) => sum + count, 0);
        assert.ok(
          total >= 2150 && total <= 2750,
          `${item.id}: full reading workload ${total} outside 2150–2750 words`,
        );
        if (item.testType === "general")
          assert.ok(
            words[2]! > words[0]! && words[2]! > words[1]!,
            `${item.id}: GT final passage must be longer`,
          );
        if (!expanded) assert.ok(
          item.tags.some((tag) => tag.startsWith("context-source:")),
          `${item.id}: added background provenance missing`,
        );
      }
      if (!expanded) assert.ok(
        item.tags.some((tag) => tag.startsWith("section-source:")),
        `${item.id}: reusable sections need provenance`,
      );
    }
    if (item.skill === "writing") {
      assert.equal(item.durationMinutes, 60, `${item.id}: writing duration`);
      assert.deepEqual(
        item.sections.map((s) => s.task),
        [1, 2],
        `${item.id}: full writing requires both tasks`,
      );
    }
    if (item.skill === "speaking") {
      assert.equal(item.sections.length, 3, `${item.id}: full speaking parts`);
      assert.ok(
        item.durationMinutes >= 11 && item.durationMinutes <= 14,
        `${item.id}: speaking duration`,
      );
      assert.ok(
        item.sections[1]!.cuePoints?.length,
        `${item.id}: missing long-turn cue points`,
      );
    }
  }
}
assert.ok(topics.size >= 12, "lesson topics");
assert.equal(levels.size, 4, "CEFR coverage");
assert.ok(types.size >= 5, "question type coverage");
assert.ok(vocabularyBank.length >= 200, "vocabulary count");
for (const entry of vocabularyBank) {
  assert.ok(
    entry.word &&
      entry.meaning &&
      entry.definition &&
      entry.ipa &&
      entry.partOfSpeech &&
      entry.commonError,
    `${entry.id}: incomplete sense`,
  );
  assert.ok(
    entry.collocations.length >= 2,
    `${entry.id}: collocation coverage`,
  );
  assert.ok(entry.examples.length >= 2, `${entry.id}: example coverage`);
  unique(entry.examples, `${entry.id} examples`);
}
for (const item of placementBank) {
  assert.ok(
    item.text && item.question && item.explanation,
    `${item.id}: missing placement text`,
  );
  unique(item.options, `${item.id} placement options`);
  assert.equal(
    item.options.filter((option) => option === item.answer).length,
    1,
    `${item.id}: invalid keyed option`,
  );
  assert.ok(
    Math.abs(item.difficulty - (item.band - 5) * 1.2) < 1e-9,
    `${item.id}: inconsistent authored Rasch difficulty`,
  );
}
assert.ok(placementBank.length >= 120, "placement bank size");
const kinds: ContentKind[] = [
  "reading",
  "listening",
  "writing",
  "speaking",
  "grammar",
];
const bySkill = Object.fromEntries(
  kinds.map((skill) => [
    skill,
    {
      lessons: contentBank.filter(
        (x) => x.skill === skill && x.format === "lesson",
      ).length,
      mocks: contentBank.filter(
        (x) => x.skill === skill && x.format === "full-mock",
      ).length,
    },
  ]),
);
assert.ok(
  contentBank.filter((x) => x.format === "lesson").length >= 100,
  "lesson count",
);
const originalSectionTexts = new Set(
  contentBank
    .filter((x) => x.format === "lesson")
    .flatMap((x) => x.sections.map((s) => s.text)),
);
console.log(
  JSON.stringify(
    {
      status: "passed",
      quality: "Original bank: authored-unreviewed; expansion: ai-unreviewed",
      lessons: contentBank.filter((x) => x.format === "lesson").length,
      mocks: contentBank.filter((x) => x.format === "full-mock").length,
      bySkill,
      vocabulary: vocabularyBank.length,
      placement: placementBank.length,
      topics: topics.size,
      cefr: [...levels],
      questionTypes: [...types],
      readingMockWords: contentBank
        .filter(
          (item) => item.skill === "reading" && item.format === "full-mock",
        )
        .map((item) => ({
          id: item.id,
          testType: item.testType,
          sections: item.sections.map(
            (section) => section.text.trim().split(/\s+/).length,
          ),
          total: item.sections.reduce(
            (sum, section) => sum + section.text.trim().split(/\s+/).length,
            0,
          ),
        })),
      distinctLessonSectionTexts: originalSectionTexts.size,
      notice:
        "Checks validate structure, keyed answers and evidence spans. They do not establish psychometric calibration or expert review. Legacy mocks disclose reused lesson sections; new v3 mocks use independent source material.",
    },
    null,
    2,
  ),
);
