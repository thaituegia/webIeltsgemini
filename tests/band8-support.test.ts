import assert from "node:assert/strict";
import { test } from "node:test";
import { band8WritingLessons, band8SpeakingLessons, band8GrammarLessons, band8WritingMocks, band8SpeakingMocks } from "../server/data/band8/productive";
import { band8Vocabulary } from "../server/data/band8/vocabulary";
import { band8Placement } from "../server/data/band8/placement";
import { vocabularyBank as originalVocabulary } from "../server/data/vocabulary";
import { expandedVocabularyBank } from "../server/data/support-v3/vocabulary";
import { contentAssetIssues, contentStructureIssues, visualAssetSchema } from "../shared/content-visuals";
import { gradeObjective } from "../server/learning";

const content = [...band8WritingLessons, ...band8SpeakingLessons, ...band8GrammarLessons, ...band8WritingMocks, ...band8SpeakingMocks];
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const words = (value: string) => value.split(/\s+/).filter(Boolean).length;

test("band8 productive material adds exact counts and balanced advanced practice levels without false review claims", () => {
  assert.deepEqual([band8WritingLessons.length, band8SpeakingLessons.length, band8GrammarLessons.length, band8WritingMocks.length, band8SpeakingMocks.length], [12, 12, 8, 2, 2]);
  for (const lessons of [band8WritingLessons, band8SpeakingLessons, band8GrammarLessons]) {
    assert.equal(lessons.filter(item => item.band === 7.5).length, lessons.length / 2);
    assert.equal(lessons.filter(item => item.band === 8).length, lessons.length / 2);
  }
  assert.equal(new Set(content.map(item => item.id)).size, content.length);
  for (const item of content) {
    assert.match(item.id, /-v4-band8-/);
    assert.equal(item.cefr, "C1");
    assert.equal(item.source, "ai");
    assert.equal(item.quality, "ai-unreviewed");
    assert.equal(item.review?.status, "unreviewed");
    assert.ok(item.review?.limitations.length);
    assert.match(item.estimatedDifficulty?.basis ?? "", /not|neither/i);
    assert.equal(item.estimatedDifficulty?.band, item.band);
    assert.equal(item.provenance?.method, "ai-assisted");
    assert.deepEqual(contentStructureIssues(item), [], item.id);
    assert.deepEqual(contentAssetIssues(item), [], item.id);
  }
});

test("advanced writing covers seven typed visual families, natural distinct data, general letters and full task timing", () => {
  for (const family of ["line", "bar", "pie", "table", "map", "process", "mixed", "letter"]) {
    assert.ok(band8WritingLessons.some(item => item.tags.includes(family)), `Missing ${family}`);
  }
  const seenVisualContent = new Set<string>();
  for (const item of [...band8WritingLessons, ...band8WritingMocks]) {
    for (const section of item.sections) {
      assert.ok(section.task === 1 || section.task === 2);
      assert.match(section.instructions ?? "", section.task === 1 ? /150 words/ : /250 words/);
      for (const visual of section.visuals ?? []) {
        assert.ok(visualAssetSchema.safeParse(visual).success, visual.id);
        const { id: _id, ...payload } = visual;
        const signature = JSON.stringify(payload);
        assert.ok(!seenVisualContent.has(signature), `Repeated visual ${visual.id}`);
        seenVisualContent.add(signature);
        if (visual.type === "pie") assert.equal(visual.rows.reduce((sum, row) => sum + row.values[0]!, 0), 100);
        if (visual.type === "map" || visual.type === "process") {
          for (const area of visual.areas ?? []) {
            assert.ok(area.x + area.width <= visual.width);
            assert.ok(area.y + area.height <= visual.height);
          }
          for (const node of visual.nodes ?? []) {
            assert.ok(node.x + node.width <= visual.width);
            assert.ok(node.y + node.height <= visual.height);
          }
        }
      }
    }
    if (item.format === "lesson") {
      assert.ok(item.objectives?.some(objective => /Model/i.test(objective)), item.id);
      assert.ok(item.objectives?.some(objective => /rubric/i.test(objective)), item.id);
    } else {
      assert.equal(item.durationMinutes, 60);
      assert.deepEqual(item.sections.map(section => section.task), [1, 2]);
      assert.ok(!item.sections.some(section => /Model overview|Model thesis|Model comparison/.test(section.text)));
    }
  }
});

test("advanced speaking maintains authentic three-part prompts and does not infer pronunciation from text", () => {
  const seenCues = new Set<string>();
  for (const item of [...band8SpeakingLessons, ...band8SpeakingMocks]) {
    assert.equal(item.durationMinutes, 14);
    assert.equal(item.sections.length, 3);
    item.sections.forEach((section, i) => assert.ok(section.title.startsWith(`Part ${i + 1}`)));
    assert.equal(item.sections[0]!.text.split("\n").filter(row => /^\d+\. /.test(row)).length, 6);
    assert.equal(item.sections[1]!.cuePoints?.length, 4);
    assert.equal(item.sections[2]!.text.split("\n").filter(row => /^\d+\. /.test(row)).length, 6);
    assert.match(item.sections[1]!.instructions ?? "", /one minute.*one to two minutes/);
    assert.ok(!seenCues.has(normalize(item.sections[1]!.text)));
    seenCues.add(normalize(item.sections[1]!.text));
    if (item.format === "lesson") assert.ok(item.objectives?.some(objective => /recorded audio, not text alone/.test(objective)));
  }
});

test("48 advanced grammar keys receive full credit and their distinct distractors receive zero credit", () => {
  assert.equal(band8GrammarLessons.reduce((sum, item) => sum + item.questions.length, 0), 48);
  const seen = new Set<string>();
  for (const item of band8GrammarLessons) {
    assert.equal(item.questions.length, 6);
    for (const question of item.questions) {
      assert.equal(new Set(question.options).size, 4, question.id);
      assert.equal(question.options?.filter(option => option === question.answer).length, 1);
      assert.ok(item.sections[0]!.text.includes(question.evidence));
      assert.ok(question.explanation.length > 25);
      assert.ok(!seen.has(normalize(question.prompt)), `Repeated grammar prompt ${question.id}`);
      seen.add(normalize(question.prompt));
    }
    const correct = gradeObjective(item, Object.fromEntries(item.questions.map(q => [q.id, q.answer])));
    const incorrect = gradeObjective(item, Object.fromEntries(item.questions.map(q => [q.id, q.options!.find(option => option !== q.answer)!])));
    assert.equal(correct.rawScore, 6);
    assert.equal(correct.total, 6);
    assert.equal(incorrect.rawScore, 0);
  }
});

test("96 advanced vocabulary entries introduce new lexemes and complete contextual usage without modifying existing entries", () => {
  const previous = [...originalVocabulary, ...expandedVocabularyBank];
  const before = JSON.stringify(previous);
  const oldWords = new Set(previous.map(entry => normalize(entry.word)));
  assert.equal(band8Vocabulary.length, 96);
  assert.equal(new Set(band8Vocabulary.map(entry => normalize(entry.word))).size, 96);
  const exampleSet = new Set<string>();
  for (const entry of band8Vocabulary) {
    assert.ok(!oldWords.has(normalize(entry.word)), entry.word);
    assert.equal(entry.cefr, "C1");
    assert.equal(entry.source, "ai");
    assert.equal(entry.quality, "ai-unreviewed");
    assert.ok(entry.definition.length > 20);
    assert.match(entry.ipa, /^\/.+\/$/);
    assert.ok(entry.meaning.length > 5);
    assert.ok(entry.collocations.length >= 2 && entry.examples.length >= 2 && entry.family.length >= 2);
    assert.ok(entry.commonError.length > 25);
    for (const example of entry.examples) {
      assert.ok(!exampleSet.has(normalize(example)), `Repeated vocabulary example ${entry.word}`);
      exampleSet.add(normalize(example));
    }
  }
  assert.equal(JSON.stringify(previous), before);
});

test("64 advanced placement items have diverse context, valid options, supported skill labels and estimated difficulty", () => {
  assert.equal(band8Placement.length, 64);
  assert.equal(band8Placement.filter(item => item.id.includes("-reading-")).length, 32);
  assert.equal(band8Placement.filter(item => item.subskill === "advanced-grammar").length, 24);
  assert.equal(band8Placement.filter(item => item.skill === "listening").length, 8);
  assert.equal(band8Placement.filter(item => item.band === 8).length, 32);
  const contexts = new Set<string>();
  const keyPositions = new Set<number>();
  for (const item of band8Placement) {
    assert.ok(["reading", "listening"].includes(item.skill));
    assert.equal(item.cefr, "C1");
    assert.ok(item.difficulty >= 2 && item.difficulty <= 4);
    assert.ok(Math.abs(item.difficulty - (item.band - 5) * 1.2) < 1e-9);
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options.map(normalize)).size, 4);
    assert.equal(item.options.filter(option => option === item.answer).length, 1);
    assert.ok(words(item.text) >= 35, item.id);
    assert.ok(item.explanation.length > 25);
    assert.ok(!contexts.has(normalize(item.text)), `Repeated placement context ${item.id}`);
    contexts.add(normalize(item.text));
    keyPositions.add(item.options.indexOf(item.answer));
    if (item.skill === "listening") {
      assert.ok(words(item.text) >= 60);
      assert.match(item.text, /^(Tutor|Lecturer|Supervisor|Student A):/);
    }
  }
  assert.equal(keyPositions.size, 4);
});
