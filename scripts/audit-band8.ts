import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { contentBank, vocabularyBank, placementBank, v3ContentBank, v3VocabularyBank, v3PlacementBank } from "../server/data/index.js";
import { contentStructureIssues, withinAnswerLimit } from "../shared/content-visuals.js";
import { gradeObjective } from "../server/learning.js";
import type { ContentSection, PlacementItem, StoredContent, VisualAsset, VocabularyEntry } from "../shared/types.js";

export const v3BankAnchors = {
  content: { count: 552, sha256: "54a10dbd39072cb6c02e1bddcb3810e01fa923bf97ebfb9f0d221e9c9a523b90" },
  vocabulary: { count: 648, sha256: "38e106952553a3504d85178665cab89fc703b92d0be05697f9eb80d252670365" },
  placementItems: { count: 576, sha256: "56628c7f12cf426ad35892581d3531c8e6788c79453ab1d3cbc403e0b9a3ee1f" },
} as const;
export const jsonHash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalize = (value: string) => value.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const wordCount = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;
const shingles = (value: string): Set<string> => {
  const tokens = normalize(value).split(" ");
  return new Set(tokens.slice(0, -4).map((_, index) => tokens.slice(index, index + 5).join(" ")));
};
const sectionSpeech = (section: ContentSection) => section.dialogue?.length ? section.dialogue.map(line => line.text).join(" ") : section.text;
function canonicalLabels(value: unknown): unknown {
  if (typeof value === "string") return normalize(value);
  if (Array.isArray(value)) return value.map(canonicalLabels);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalLabels(item)]));
  return value;
}
export function visualSignature(asset: VisualAsset): string {
  const ids = new Map<string, number>();
  const collect = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.id === "string") ids.set(record.id, ids.size);
      Object.entries(record).sort(([a], [b]) => a.localeCompare(b)).forEach(([, item]) => collect(item));
    }
  };
  collect(asset);
  const payload = JSON.parse(JSON.stringify(asset, (key, value: unknown) => {
    if (["id", "title", "description", "fill"].includes(key)) return undefined;
    if (key === "questionNumber") return "numbered-blank";
    if ((key === "from" || key === "to") && typeof value === "string") return ids.get(value);
    return value;
  }));
  return JSON.stringify(canonicalLabels(payload));
}
function sectionSignature(section: ContentSection): string {
  return JSON.stringify(canonicalLabels({ text: section.text, dialogue: section.dialogue?.map(({ speaker, text }) => ({ speaker, text })), cuePoints: section.cuePoints, chart: section.chart, chartSeries: section.chartSeries, chartUnit: section.chartUnit, visuals: section.visuals?.map(asset => JSON.parse(visualSignature(asset))) }));
}

export interface Band8AuditBank {
  content: StoredContent[];
  vocabulary: VocabularyEntry[];
  placementItems: PlacementItem[];
  previousContent: StoredContent[];
  previousVocabulary: VocabularyEntry[];
  previousPlacement: PlacementItem[];
}
export const currentBand8Bank: Band8AuditBank = { content: contentBank, vocabulary: vocabularyBank, placementItems: placementBank, previousContent: v3ContentBank, previousVocabulary: v3VocabularyBank, previousPlacement: v3PlacementBank };

export function auditBand8(bank: Band8AuditBank = currentBand8Bank) {
  const issues: string[] = [];
  const check = (condition: unknown, issue: string) => { if (!condition) issues.push(issue); };
  const previous = { content: bank.previousContent, vocabulary: bank.previousVocabulary, placementItems: bank.previousPlacement };
  const preservation = Object.fromEntries((Object.keys(v3BankAnchors) as (keyof typeof v3BankAnchors)[]).map(name => {
    const rows = previous[name];
    const sha256 = jsonHash(rows);
    const anchor = v3BankAnchors[name];
    check(rows.length === anchor.count && sha256 === anchor.sha256, `${name}: fixed pre-v4 source snapshot changed`);
    const current = new Map(bank[name].map(row => [row.id, row]));
    const documentsUnchanged = rows.every(row => current.has(row.id) && JSON.stringify(current.get(row.id)) === JSON.stringify(row));
    for (const row of rows) check(current.has(row.id) && JSON.stringify(current.get(row.id)) === JSON.stringify(row), `${name}/${row.id}: previous document changed or disappeared`);
    check(new Set(bank[name].map(row => row.id)).size === bank[name].length, `${name}: duplicate ID`);
    return [name, { count: rows.length, sha256, expectedSha256: anchor.sha256, unchanged: rows.length === anchor.count && sha256 === anchor.sha256 && documentsUnchanged }];
  }));
  const oldIds = new Set(bank.previousContent.map(item => item.id));
  const added = bank.content.filter(item => !oldIds.has(item.id));
  const newVocabulary = bank.vocabulary.filter(item => !bank.previousVocabulary.some(old => old.id === item.id));
  const newPlacement = bank.placementItems.filter(item => !bank.previousPlacement.some(old => old.id === item.id));
  const bySkill = Object.fromEntries(["reading", "listening", "writing", "speaking", "grammar"].map(skill => [skill, {
    lessons: bank.content.filter(item => item.skill === skill && item.format === "lesson").length,
    mocks: bank.content.filter(item => item.skill === skill && item.format === "full-mock").length,
  }]));
  check(JSON.stringify(bySkill) === JSON.stringify({ reading: { lessons: 160, mocks: 28 }, listening: { lessons: 160, mocks: 28 }, writing: { lessons: 84, mocks: 14 }, speaking: { lessons: 84, mocks: 14 }, grammar: { lessons: 56, mocks: 0 } }), "Final per-skill content counts differ from the approved extension");
  check(bank.content.length === 628 && added.length === 76, "Extension requires 628 content records, including 76 additions");
  check(bank.vocabulary.length === 744 && newVocabulary.length === 96, "Vocabulary extension must be 648 + 96");
  check(bank.placementItems.length === 640 && newPlacement.length === 64, "Placement extension must be 576 + 64");
  const coverage: Record<string, Record<string, number>> = { reading: {}, listening: {}, writing: {}, speaking: {} };
  const receptiveWorkloads: { id: string; skill: string; sections: number[]; total: number }[] = [];
  let objectiveQuestionsChecked = 0;
  for (const item of added) {
    check(item.id.includes("v4-band8"), `${item.id}: missing additive identifier namespace`);
    check(item.source === "ai" && item.quality === "ai-unreviewed" && ["unreviewed", "structural-checks-passed"].includes(item.review?.status ?? ""), `${item.id}: incorrect authorship or review claim`);
    check(item.cefr === "C1" && [7.5, 8].includes(item.band), `${item.id}: unexpected advanced practice level`);
    check(item.estimatedDifficulty?.band === item.band && item.estimatedDifficulty.cefr === "C1" && !!item.estimatedDifficulty.basis, `${item.id}: missing estimated-difficulty explanation`);
    check(item.provenance?.method === "ai-assisted" && !!item.provenance.generatedAt && item.review?.limitations.length, `${item.id}: incomplete provenance/review limits`);
    issues.push(...contentStructureIssues(item).map(issue => `${item.id}: ${issue}`));
    for (const section of item.sections) for (const asset of section.visuals ?? []) {
      if (!("width" in asset)) continue;
      for (const shape of [...asset.labels, ...(asset.nodes ?? []), ...(asset.areas ?? [])]) {
        check(shape.x <= asset.width && shape.y <= asset.height && (!("width" in shape) || shape.x + shape.width <= asset.width && shape.y + shape.height <= asset.height), `${item.id}/${asset.id}/${shape.id}: visual extends beyond its canvas`);
      }
      for (const path of asset.paths ?? []) for (const [x, y] of path.points) check(x <= asset.width && y <= asset.height, `${item.id}/${asset.id}/${path.id}: path extends beyond its canvas`);
    }
    for (const question of item.questions) {
      check(question.answer && question.explanation && question.evidence && question.subskill, `${question.id}: incomplete answer rationale`);
      check(withinAnswerLimit(question.answer, question.wordLimit, question.allowNumbers), `${question.id}: answer exceeds the stated word/number limit`);
      for (const alternative of question.acceptedAnswers ?? []) check(withinAnswerLimit(alternative, question.wordLimit, question.allowNumbers), `${question.id}: accepted answer exceeds the stated limit`);
      if (question.options) check(new Set(question.options.map(normalize)).size === question.options.length, `${question.id}: duplicate options`);
      if (["reading", "listening"].includes(item.skill)) {
        const section = item.sections[question.sectionIndex];
        check(section && section.text.includes(question.evidence), `${question.id}: rationale does not quote an exact source span`);
        if (question.questionType) coverage[item.skill]![question.questionType] = (coverage[item.skill]![question.questionType] ?? 0) + 1;
      }
    }
    if (["reading", "listening", "grammar"].includes(item.skill)) {
      const response = Object.fromEntries(item.questions.map(question => [question.id, question.type === "choice-multiple" ? JSON.stringify(item.questions.filter(row => row.selectionGroup?.id === question.selectionGroup?.id).map(row => row.answer)) : question.answer]));
      const result = gradeObjective(item, response);
      check(result.rawScore === item.questions.length && result.total === item.questions.length, `${item.id}: perfect answer keys do not receive full raw credit`);
      objectiveQuestionsChecked += item.questions.length;
    }
    if (["reading", "listening"].includes(item.skill) && item.format === "full-mock") {
      const counts = item.sections.map(section => wordCount(item.skill === "listening" ? sectionSpeech(section) : section.text));
      const total = counts.reduce((sum, count) => sum + count, 0);
      receptiveWorkloads.push({ id: item.id, skill: item.skill, sections: counts, total });
      check(item.questions.length === 40, `${item.id}: full mock needs 40 numbered answer slots`);
      if (item.skill === "reading") check(item.durationMinutes === 60 && item.sections.length === 3 && total >= 2150 && total <= 2750, `${item.id}: wrong Reading mock timing, sections or workload (${total} words)`);
      else {
        check(item.durationMinutes === 30 && item.sections.length === 4 && total >= 2600 && total <= 3400, `${item.id}: wrong Listening mock timing, sections or spoken workload (${total} words)`);
        item.sections.forEach((section, index) => {
          check(counts[index]! >= 650 && counts[index]! <= 850, `${item.id}: Listening Part ${index + 1} requires 650–850 spoken words`);
          check(item.questions.filter(question => question.sectionIndex === index).length === 10, `${item.id}: Listening Part ${index + 1} needs 10 questions`);
          const speakers = new Set(section.dialogue?.map(line => line.speaker));
          check(index === 1 || index === 3 ? speakers.size === 1 : speakers.size >= 2, `${item.id}: unexpected dialogue/monologue in Part ${index + 1}`);
        });
      }
    }
    if (item.skill === "listening") item.sections.forEach((section, index) => {
      const speech = sectionSpeech(section); let previousPosition = -1;
      for (const question of item.questions.filter(question => question.sectionIndex === index)) {
        const position = speech.indexOf(question.evidence);
        check(position >= 0 && position >= previousPosition, `${question.id}: Listening evidence is missing or out of question order`);
        previousPosition = position;
      }
    });
    if (item.skill === "writing") {
      for (const section of item.sections) {
        if (section.task === 1) {
          check(/150/u.test(section.instructions ?? ""), `${item.id}/${section.id}: missing Task 1 minimum`);
          check(item.testType === "general" ? !section.visuals?.length && /letter/i.test(section.text) : !!section.visuals?.length, `${item.id}/${section.id}: Task 1 lacks Academic assets or General letter context`);
          const family = item.tags.find(tag => ["line", "bar", "pie", "table", "map", "process", "mixed", "letter"].includes(tag)) ?? section.visuals?.[0]?.type ?? "letter";
          coverage.writing![family] = (coverage.writing![family] ?? 0) + 1;
        } else check(section.task === 2 && /250/u.test(section.instructions ?? ""), `${item.id}/${section.id}: invalid Task 2 or missing minimum`);
      }
      if (item.format === "full-mock") check(item.durationMinutes === 60 && item.sections.map(section => section.task).join(",") === "1,2", `${item.id}: Writing mock must have two tasks and 60 minutes`);
    }
    if (item.skill === "speaking") {
      check(item.sections.length === 3 && item.sections.every((section, index) => section.title.startsWith(`Part ${index + 1}`)), `${item.id}: Speaking needs three correctly named parts`);
      check(item.sections[0]?.text.split("\n").filter(line => /^\d+\.\s/u.test(line)).length === 6 && item.sections[1]?.cuePoints?.length === 4 && item.sections[2]?.text.split("\n").filter(line => /^\d+\.\s/u.test(line)).length === 6, `${item.id}: Speaking prompts must follow 6/4/6 structure`);
      check(item.durationMinutes >= 11 && item.durationMinutes <= 14, `${item.id}: Speaking duration must be 11–14 minutes`);
      coverage.speaking!["three-part-set"] = (coverage.speaking!["three-part-set"] ?? 0) + 1;
    }
  }
  for (const family of ["line", "bar", "pie", "table", "map", "process", "mixed", "letter"]) check(coverage.writing![family], `Writing extension lacks ${family} practice`);

  const oldSections = bank.previousContent.flatMap(item => item.sections.map(section => ({ item, section })));
  const newSections = added.flatMap(item => item.sections.map(section => ({ item, section })));
  const duplicateSections: { current: string; previous: string }[] = [];
  const duplicateVisuals: { current: string; previous: string }[] = [];
  const seenSections = new Map<string, string>(); const seenVisuals = new Map<string, string>();
  for (const { item, section } of [...oldSections, ...newSections]) {
    const label = `${item.id}/${section.id}`; const key = sectionSignature(section); const existing = seenSections.get(key);
    if (existing && !oldIds.has(item.id)) { duplicateSections.push({ current: label, previous: existing }); issues.push(`${label}: duplicates source/task ${existing}`); }
    if (!existing) seenSections.set(key, label);
    for (const visual of section.visuals ?? []) {
      const signature = visualSignature(visual); const prior = seenVisuals.get(signature);
      if (prior && !oldIds.has(item.id)) { duplicateVisuals.push({ current: `${label}/${visual.id}`, previous: prior }); issues.push(`${label}/${visual.id}: duplicates visual data ${prior}`); }
      if (!prior) seenVisuals.set(signature, `${label}/${visual.id}`);
    }
  }
  const seenPrompts = new Map<string, { id: string; contentId: string; groupId?: string }>();
  for (const item of [...bank.previousContent, ...added]) for (const question of item.questions) {
    const section = item.sections[question.sectionIndex];
    const signature = normalize(JSON.stringify({ skill: item.skill, source: section?.text, prompt: question.prompt, options: question.options, type: question.type }));
    const previous = seenPrompts.get(signature);
    const sameMultipleGroup = question.type === "choice-multiple" && question.selectionGroup?.id && previous?.contentId === item.id && previous.groupId === question.selectionGroup.id;
    check(oldIds.has(item.id) || !previous || sameMultipleGroup, `${question.id}: repeats the same contextual question as ${previous?.id}`);
    if (!previous) seenPrompts.set(signature, { id: question.id, contentId: item.id, ...(question.selectionGroup ? { groupId: question.selectionGroup.id } : {}) });
  }
  const receptiveSources = [...oldSections, ...newSections].filter(({ item }) => ["reading", "listening"].includes(item.skill)).map(row => ({ ...row, grams: shingles(row.item.skill === "listening" ? sectionSpeech(row.section) : row.section.text) }));
  const similarities: { current: string; previous: string; overlap: number }[] = [];
  for (let i = 0; i < receptiveSources.length; i++) {
    const current = receptiveSources[i]!; if (oldIds.has(current.item.id)) continue;
    for (let j = 0; j < i; j++) {
      const other = receptiveSources[j]!; if (current.item.skill !== other.item.skill) continue;
      const small = current.grams.size < other.grams.size ? current.grams : other.grams; const large = small === current.grams ? other.grams : current.grams;
      const overlap = [...small].filter(gram => large.has(gram)).length / Math.max(1, small.size);
      if (overlap > 0.55) { const row = { current: `${current.item.id}/${current.section.id}`, previous: `${other.item.id}/${other.section.id}`, overlap: Math.round(overlap * 1000) / 1000 }; similarities.push(row); issues.push(`${row.current}: excessive source overlap with ${row.previous} (${Math.round(overlap * 100)}%)`); }
    }
  }
  const oldWords = new Set(bank.previousVocabulary.map(entry => normalize(entry.word))); const newWords = new Set<string>();
  for (const entry of newVocabulary) {
    const key = normalize(entry.word); check(!oldWords.has(key) && !newWords.has(key), `${entry.id}: repeated vocabulary lexeme`); newWords.add(key);
    check(entry.cefr === "C1" && entry.collocations.length >= 2 && entry.examples.length >= 2 && !!entry.definition && !!entry.commonError && /^\/.+\/$/u.test(entry.ipa), `${entry.id}: incomplete advanced vocabulary study entry`);
    const metadata = entry as VocabularyEntry & { source?: string; quality?: string }; check(metadata.source === "ai" && metadata.quality === "ai-unreviewed", `${entry.id}: missing vocabulary authorship/review disclosure`);
  }
  const oldPlacementContexts = new Set(bank.previousPlacement.map(item => normalize(item.text))); const newPlacementContexts = new Set<string>();
  for (const item of newPlacement) {
    const key = normalize(item.text); check(!oldPlacementContexts.has(key) && !newPlacementContexts.has(key), `${item.id}: duplicated placement context`); newPlacementContexts.add(key);
    check(["reading", "listening"].includes(item.skill) && item.cefr === "C1" && [7.5, 8].includes(item.band) && item.difficulty >= 2 && item.difficulty <= 4, `${item.id}: invalid advanced placement configuration`);
    check(Math.abs(item.difficulty - (item.band - 5) * 1.2) < 1e-9, `${item.id}: advanced placement difficulty is inconsistent with the existing estimated CAT scale`);
    check(item.options.length === 4 && new Set(item.options.map(normalize)).size === 4 && item.options.filter(option => option === item.answer).length === 1, `${item.id}: placement must have four distinct options and one keyed answer`);
    check(wordCount(item.text) >= 35 && item.explanation.length > 20, `${item.id}: placement context or explanation is too limited`);
    const metadata = item as PlacementItem & { source?: string; quality?: string }; check(metadata.source === "ai" && metadata.quality === "ai-unreviewed", `${item.id}: missing placement authorship/review disclosure`);
  }
  return { status: issues.length ? "failed" : "passed", generatedAt: new Date().toISOString(), counts: { lessons: bank.content.filter(item => item.format === "lesson").length, mocks: bank.content.filter(item => item.format === "full-mock").length, content: bank.content.length, vocabulary: bank.vocabulary.length, placement: bank.placementItems.length }, additions: { content: added.length, vocabulary: newVocabulary.length, placement: newPlacement.length }, bySkill, preservation, objectiveQuestionsChecked, coverage, receptiveWorkloads, duplicateSections, duplicateVisuals, similarities, issues,
    limitations: ["Structural, answer-key and similarity checks do not establish independent expert review or psychometric calibration.", "All new material retains AI authorship and unreviewed status; band/CEFR/Rasch values are practice estimates.", "Existing pre-v4 lesson/mock reuse is retained; new sources and visual data are checked against the entire preceding bank."] };
}

async function main() {
  const report = auditBand8(); const index = process.argv.indexOf("--report");
  if (index >= 0 && process.argv[index + 1]) { const destination = process.argv[index + 1]!; await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 }); }
  console.log(JSON.stringify({ status: report.status, counts: report.counts, additions: report.additions, objectiveQuestionsChecked: report.objectiveQuestionsChecked, preserved: Object.fromEntries(Object.entries(report.preservation).map(([name, value]) => [name, value.unchanged])), issues: report.issues, limitations: report.limitations }, null, 2));
  if (report.issues.length) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
