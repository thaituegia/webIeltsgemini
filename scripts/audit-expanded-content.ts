import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { v3ContentBank as contentBank, v3PlacementBank as placementBank, v3VocabularyBank as vocabularyBank } from "../server/data/previous-bank.js";
import { contentStructureIssues } from "../shared/content-visuals.js";
import type { ContentSection, StoredContent } from "../shared/types.js";
import { gradeObjective } from "../server/learning.js";

const normalize = (s: string) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const words = (s: string) => s.trim().split(/\s+/u).filter(Boolean).length;
const added = contentBank.filter((item) => item.source === "ai" && item.provenance?.version.includes("v3"));
const legacy = contentBank.filter((item) => !added.includes(item));
const issues: string[] = [];
const requireCheck = (test: unknown, message: string) => { if (!test) issues.push(message); };
const bySkill = Object.fromEntries(["reading", "listening", "writing", "speaking", "grammar"].map((skill) => [skill, {
  lessons: contentBank.filter((item) => item.skill === skill && item.format === "lesson").length,
  mocks: contentBank.filter((item) => item.skill === skill && item.format === "full-mock").length,
}]));
assert.deepEqual(bySkill, {
  reading: { lessons: 144, mocks: 24 }, listening: { lessons: 144, mocks: 24 },
  writing: { lessons: 72, mocks: 12 }, speaking: { lessons: 72, mocks: 12 },
  grammar: { lessons: 48, mocks: 0 },
}, "Expansion must triple the original bank, preserving the old records");
assert.equal(legacy.length, 184, "Original content count must remain unchanged");
assert.equal(added.length, 368, "Expansion requires 320 new lessons and 48 new full mocks");
assert.equal(vocabularyBank.length, 648, "Vocabulary must triple 216 → 648");
assert.equal(placementBank.length, 576, "Placement must triple 192 → 576");

const receptiveWorkloads: { id: string; skill: string; words: number[]; total: number }[] = [];
const coverage: Record<string, Record<string, number>> = { reading: {}, listening: {}, writing: {}, speaking: {} };
let objectiveQuestions = 0;
for (const item of added) {
  issues.push(...contentStructureIssues(item).map((issue) => `${item.id}: ${issue}`));
  requireCheck(item.quality === "ai-unreviewed" && item.provenance?.method === "ai-assisted", `${item.id}: incorrect authorship/review claim`);
  requireCheck(item.estimatedDifficulty?.cefr === item.cefr && !!item.estimatedDifficulty.basis && Number.isFinite(item.estimatedDifficulty.band), `${item.id}: missing estimated difficulty provenance`);
  requireCheck(item.objectives?.length && item.errorTypes?.length && item.review?.limitations.length, `${item.id}: missing learning/review metadata`);
  for (const q of item.questions) {
    requireCheck(q.prompt && q.answer && q.explanation && q.evidence && q.subskill, `${q.id}: incomplete answer rationale`);
    if (coverage[item.skill] && q.questionType) coverage[item.skill][q.questionType] = (coverage[item.skill][q.questionType] ?? 0) + 1;
    if (["reading", "listening"].includes(item.skill) && q.answer !== "NOT GIVEN")
      requireCheck(item.sections[q.sectionIndex]?.text.includes(q.evidence), `${q.id}: evidence is not an exact passage/transcript span`);
  }
  if (["reading", "listening", "grammar"].includes(item.skill)) {
    const responses = Object.fromEntries(item.questions.map((question) => [question.id, question.type === "choice-multiple"
      ? JSON.stringify(item.questions.filter((row) => row.selectionGroup?.id === question.selectionGroup?.id).map((row) => row.answer)) : question.answer]));
    const result = gradeObjective(item, responses);
    objectiveQuestions += item.questions.length;
    requireCheck(result.rawScore === item.questions.length && result.total === item.questions.length, `${item.id}: correct-key submission did not receive full raw credit`);
  }
  if (item.format === "full-mock" && ["reading", "listening"].includes(item.skill)) {
    const counts = item.sections.map((section) => words(item.skill === "listening" && section.dialogue ? section.dialogue.map((line) => line.text).join(" ") : section.text));
    const total = counts.reduce((sum, count) => sum + count, 0);
    receptiveWorkloads.push({ id: item.id, skill: item.skill, words: counts, total });
    requireCheck(item.questions.length === 40, `${item.id}: mock does not have exactly 40 questions`);
    if (item.skill === "reading") {
      requireCheck(item.sections.length === 3 && item.durationMinutes === 60 && total >= 2150 && total <= 2750, `${item.id}: wrong Reading mock structure/workload (${total} words)`);
      requireCheck(item.testType !== "general" || (counts[2]! > counts[0]! && counts[2]! > counts[1]!), `${item.id}: General final section must be longer`);
    } else {
      requireCheck(item.sections.length === 4 && item.durationMinutes === 30 && total >= 2600 && total <= 3400, `${item.id}: wrong Listening mock structure/workload (${total} spoken words)`);
      item.sections.forEach((section, index) => {
        requireCheck(item.questions.filter((q) => q.sectionIndex === index).length === 10, `${item.id}: Part ${index + 1} does not have ten questions`);
        requireCheck(counts[index]! >= 650 && counts[index]! <= 850, `${item.id}: Part ${index + 1} must contain 650–850 spoken words`);
        const speakers = new Set(section.dialogue?.map((line) => line.speaker));
        requireCheck(index === 1 || index === 3 ? speakers.size === 1 : speakers.size >= 2, `${item.id}: wrong dialogue/monologue speaker structure in Part ${index + 1}`);
        // Listening answers must arrive in question order in the actual spoken
        // script. Authors fix the source and contiguous task groups rather than
        // reordering isolated questions, which would split forms and map tasks.
        const spoken = section.dialogue?.map((line) => line.text).join(" ") ?? section.text;
        let previousEvidence = -1;
        for (const question of item.questions.filter((q) => q.sectionIndex === index)) {
          const position = spoken.indexOf(question.evidence);
          requireCheck(position >= 0, `${question.id}: evidence is missing from the spoken script`);
          requireCheck(position >= previousEvidence, `${question.id}: Listening evidence occurs before the preceding question`);
          previousEvidence = position;
        }
      });
    }
  }
  if (item.skill === "writing") {
    for (const section of item.sections) {
      if (section.task === 1) {
        const kind = item.tags.find((tag) => ["line", "bar", "pie", "table", "map", "process", "mixed", "letter"].includes(tag)) ?? section.chartType ?? section.visuals?.map((visual) => visual.type).join("+") ?? "letter";
        coverage.writing[kind] = (coverage.writing[kind] ?? 0) + 1;
        requireCheck(/150/u.test(`${section.instructions} ${section.text}`), `${item.id}/${section.id}: missing Task 1 150-word instruction`);
      }
      if (section.task === 2) requireCheck(/250/u.test(`${section.instructions} ${section.text}`), `${item.id}/${section.id}: missing Task 2 250-word instruction`);
    }
    if (item.format === "full-mock") requireCheck(item.durationMinutes === 60 && item.sections.map((s) => s.task).join(",") === "1,2", `${item.id}: Writing mock must contain Task 1 and Task 2`);
  }
  if (item.skill === "speaking") {
    requireCheck(item.sections.length === 3 && item.sections.every((section, index) => section.title.startsWith(`Part ${index + 1}`)), `${item.id}: Speaking must contain all three parts`);
    const numberedQuestions = (section?: ContentSection) => section?.text.split("\n").filter((line) => /^\d+\.\s/u.test(line)).length ?? 0;
    requireCheck(numberedQuestions(item.sections[0]) === 6 && item.sections[1]?.cuePoints?.length === 4 && numberedQuestions(item.sections[2]) === 6, `${item.id}: Speaking requires six personal questions, four cue points and six discussion questions`);
    coverage.speaking["three-part-set"] = (coverage.speaking["three-part-set"] ?? 0) + 1;
  }
}
const readingTypes = ["multiple-choice", "true-false-not-given", "yes-no-not-given", "matching-headings", "matching-information", "matching-features", "matching-sentence-endings", "sentence-completion", "summary-completion", "note-completion", "table-completion", "flow-chart-completion", "diagram-labelling", "short-answer"];
const listeningTypes = ["multiple-choice", "multiple-choice-multiple", "matching", "map-labelling", "plan-labelling", "diagram-labelling", "form-completion", "note-completion", "table-completion", "flow-chart-completion", "summary-completion", "sentence-completion", "short-answer"];
for (const type of readingTypes) requireCheck(coverage.reading[type], `Reading: missing ${type}`);
for (const type of listeningTypes) requireCheck(coverage.listening[type], `Listening: missing ${type}`);
for (const type of ["line", "bar", "pie", "table", "map", "process", "mixed", "letter"])
  requireCheck(coverage.writing[type], `Writing Task 1: missing ${type}`);
const essays = ["opinion", "discussion", "advantages-disadvantages", "problems-solutions", "causes-effects", "two-part"];
for (const type of essays) requireCheck(added.some((item) => item.skill === "writing" && item.tags.includes(type)), `Writing Task 2: missing ${type}`);

// Prompts may use the same IELTS instruction. Uniqueness is assessed together
// with the passage, speaking questions/cue, and all chart/map/process data.
function sectionSignature(section: ContentSection): string {
  return normalize(JSON.stringify({ text: section.text, cuePoints: section.cuePoints,
    chart: section.chart, chartSeries: section.chartSeries, visuals: section.visuals?.map(({ id: _id, ...asset }) => asset) }));
}
const seenSections = new Map<string, { content: StoredContent; section: ContentSection }>();
const duplicateSections: { current: string; previous: string }[] = [];
for (const item of [...legacy, ...added]) for (const section of item.sections) {
  const key = digest(sectionSignature(section));
  const previous = seenSections.get(key);
  if (previous && added.includes(item)) {
    duplicateSections.push({ current: `${item.id}/${section.id}`, previous: `${previous.content.id}/${previous.section.id}` });
    issues.push(`${item.id}/${section.id}: reuses previous section ${previous.content.id}/${previous.section.id}`);
  }
  if (!previous) seenSections.set(key, { content: item, section });
}
const shingles = (text: string): Set<string> => {
  const tokens = normalize(text).split(" ");
  return new Set(tokens.slice(0, -4).map((_, index) => tokens.slice(index, index + 5).join(" ")));
};
const sources = [...legacy, ...added].filter((item) => ["reading", "listening"].includes(item.skill)).flatMap((item) => item.sections.map((section) => ({ item, section, grams: shingles(section.text) })));
const similarities: { first: string; second: string; overlap: number }[] = [];
for (let i = 0; i < sources.length; i++) {
  const current = sources[i]!;
  if (!added.includes(current.item)) continue;
  for (let j = 0; j < i; j++) {
    const other = sources[j]!;
    if (other.item.skill !== current.item.skill) continue;
    const small = current.grams.size < other.grams.size ? current.grams : other.grams;
    const large = small === current.grams ? other.grams : current.grams;
    const intersection = [...small].filter((gram) => large.has(gram)).length;
    const overlap = intersection / Math.max(1, Math.min(current.grams.size, other.grams.size));
    if (overlap > 0.55) {
      similarities.push({ first: `${other.item.id}/${other.section.id}`, second: `${current.item.id}/${current.section.id}`, overlap: Math.round(overlap * 1000) / 1000 });
      issues.push(`${current.item.id}/${current.section.id}: excessive passage overlap with ${other.item.id}/${other.section.id} (${Math.round(overlap * 100)}%)`);
    }
  }
}
const vocabularySenses = new Map<string, string>();
for (const entry of vocabularyBank) {
  const key = normalize(`${entry.word} ${entry.partOfSpeech} ${entry.definition}`);
  requireCheck(!vocabularySenses.has(key), `${entry.id}: duplicated vocabulary sense with ${vocabularySenses.get(key)}`);
  vocabularySenses.set(key, entry.id);
}
const seenPlacement = new Map<string, string>();
for (const item of placementBank) {
  const key = normalize(`${item.text} ${item.question}`);
  requireCheck(!seenPlacement.has(key), `${item.id}: duplicated placement stimulus/question with ${seenPlacement.get(key)}`);
  seenPlacement.set(key, item.id);
}
const report = {
  status: issues.length ? "failed" : "passed", generatedAt: new Date().toISOString(),
  bySkill, lessons: 480, mocks: 72, vocabulary: vocabularyBank.length, placement: placementBank.length,
  addedContentRecords: added.length, objectiveQuestionsChecked: objectiveQuestions, coverage,
  receptiveWorkloads, duplicateSections, similarities, issues,
  limitations: ["Automated structural and similarity checks do not prove expert linguistic review or psychometric calibration.",
    "All generated v3 material retains AI authorship and unreviewed status.",
    "Preserved legacy mocks contain disclosed reused lesson sections; new mock sources must be independent."],
};
const reportIndex = process.argv.indexOf("--report");
if (reportIndex >= 0 && process.argv[reportIndex + 1]) {
  const path = process.argv[reportIndex + 1]!;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}
console.log(JSON.stringify(report, null, 2));
assert.equal(issues.length, 0, `${issues.length} corpus issues; see audit output`);
