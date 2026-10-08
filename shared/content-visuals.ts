import { z } from "zod";
import type { ContentSection, Question, StoredContent } from "./types";

const label = z.string().trim().min(1).max(300);
const identity = z.string().min(1).max(100);
const coordinate = z.number().finite().min(0).max(2000);
const visualBase = {
  id: identity,
  title: label,
  description: z.string().max(1500).optional(),
};
const visualLabel = {
  id: identity,
  x: coordinate,
  y: coordinate,
  text: label.optional(),
  questionNumber: z.number().int().min(1).max(100).optional(),
};
const labelSchema = z.object(visualLabel).strict();
const spatialFields = {
  ...visualBase,
  width: z.number().finite().min(64).max(2000),
  height: z.number().finite().min(64).max(2000),
  areas: z.array(z.object({
    id: identity, x: coordinate, y: coordinate,
    width: z.number().finite().positive().max(2000),
    height: z.number().finite().positive().max(2000),
    fill: z.string().regex(/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i).optional(),
  }).strict()).max(80).optional(),
  paths: z.array(z.object({
    id: identity,
    points: z.array(z.tuple([coordinate, coordinate])).min(2).max(80),
    style: z.enum(["path", "road", "river"]).optional(),
  }).strict()).max(40).optional(),
  labels: z.array(labelSchema).max(100),
  nodes: z.array(z.object({
    ...visualLabel,
    width: z.number().finite().positive().max(2000),
    height: z.number().finite().positive().max(2000),
  }).strict()).max(80).optional(),
  connections: z.array(z.object({
    from: identity, to: identity, label: label.optional(),
  }).strict()).max(120).optional(),
};
const chartFields = {
  ...visualBase,
  rows: z.array(z.object({
    label,
    values: z.array(z.number().finite()).min(1).max(12),
  }).strict()).min(1).max(30),
  series: z.array(label).min(1).max(12),
  unit: label,
  xLabel: label.optional(),
  yLabel: label.optional(),
};
export const visualAssetSchema = z.discriminatedUnion("type", [
  z.object({ ...chartFields, type: z.literal("bar") }).strict(),
  z.object({ ...chartFields, type: z.literal("line") }).strict(),
  z.object({ ...chartFields, type: z.literal("pie") }).strict(),
  z.object({ ...chartFields, type: z.literal("table") }).strict(),
  z.object({ ...spatialFields, type: z.literal("map") }).strict(),
  z.object({ ...spatialFields, type: z.literal("plan") }).strict(),
  z.object({ ...spatialFields, type: z.literal("process") }).strict(),
  z.object({ ...spatialFields, type: z.literal("diagram") }).strict(),
]);
export const questionBlockSchema = z.object({
  id: identity,
  type: z.enum(["form", "note", "table", "flow-chart", "summary", "sentence"]),
  title: label,
  instructions: z.string().min(1).max(2000),
  questionNumbers: z.array(z.number().int().min(1).max(100)).min(1).max(40),
  text: z.string().max(8000).optional(),
  rows: z.array(z.object({
    label: label.optional(),
    cells: z.array(z.string().max(2000)).min(1).max(12),
  }).strict()).max(40).optional(),
}).strict();
export const ieltsQuestionTypeSchema = z.enum([
  "multiple-choice", "multiple-choice-multiple", "matching",
  "plan-labelling", "map-labelling", "diagram-labelling",
  "form-completion", "note-completion", "table-completion",
  "flow-chart-completion", "summary-completion", "sentence-completion",
  "short-answer", "matching-headings", "matching-information",
  "matching-features", "matching-sentence-endings",
  "true-false-not-given", "yes-no-not-given",
]);

/** Hyphenated words count as one; numeric variants remain explicitly keyed. */
export function withinAnswerLimit(value: string, limit?: number, allowNumbers = false): boolean {
  if (limit === undefined) return true;
  const tokens = value.trim().split(/\s+/u).filter(Boolean);
  if (!allowNumbers) return tokens.length <= limit;
  const numeric = tokens.filter((token) => /^[£$€]?\d+(?:[.,:/-]\d+)*(?:st|nd|rd|th|%|[£$€])?$/iu.test(token)).length;
  return numeric <= 1 && tokens.length - numeric <= limit;
}
const normalized = (value: string): string => value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
const unique = (values: string[]): boolean => new Set(values.map(normalized)).size === values.length;
const placeholders = (value: string): number[] => Array.from(value.matchAll(/\{\{(\d+)\}\}/gu), (match) => Number(match[1]));

/** Structural checks only: these cannot replace an independent linguistic review. */
export function contentAssetIssues(content: Pick<StoredContent, "sections" | "questions">): string[] {
  const issues: string[] = [];
  const allVisualIds: string[] = [];
  const allBlockIds: string[] = [];
  const groups = new Map<string, typeof content.questions>();
  for (const question of content.questions) {
    if (question.type === "choice-multiple") {
      if (!question.selectionGroup) issues.push(`Question ${question.number}: missing selection group.`);
      else {
        const key = question.selectionGroup.id;
        groups.set(key, [...(groups.get(key) ?? []), question]);
      }
    } else if (question.selectionGroup) issues.push(`Question ${question.number}: selection group on a single-answer question.`);
    if (question.type === "text" && (!question.wordLimit || !withinAnswerLimit(question.answer, question.wordLimit, question.allowNumbers) || question.acceptedAnswers?.some((answer) => !withinAnswerLimit(answer, question.wordLimit, question.allowNumbers))))
      issues.push(`Question ${question.number}: answer exceeds the declared word/number limit.`);
  }
  for (const [id, questions] of groups) {
    const first = questions[0];
    const count = first.selectionGroup!.count;
    if (!Number.isInteger(count) || count < 2 || count > 3 || questions.length !== count)
      issues.push(`Selection group ${id}: expected 2–3 separate answer slots.`);
    if (!unique(questions.map((question) => question.answer))) issues.push(`Selection group ${id}: duplicate answer keys.`);
    if (!first.options || first.options.length <= count || !unique(first.options)) issues.push(`Selection group ${id}: missing distinct distractors.`);
    for (const [index, question] of questions.entries())
      if (question.selectionGroup?.count !== count || question.sectionIndex !== first.sectionIndex || question.number !== first.number + index || question.prompt !== first.prompt || JSON.stringify(question.options) !== JSON.stringify(first.options) || question.groupInstructions !== first.groupInstructions || !first.options?.includes(question.answer))
        issues.push(`Selection group ${id}: inconsistent rows, numbering or answer/options.`);
  }
  for (const [sectionIndex, section] of content.sections.entries()) {
    const questions = content.questions.filter((question) => question.sectionIndex === sectionIndex);
    const byNumber = new Map(questions.map((question) => [question.number, question]));
    for (const visual of section.visuals ?? []) {
      allVisualIds.push(visual.id);
      const parsed = visualAssetSchema.safeParse(visual);
      if (!parsed.success) { issues.push(`Visual ${visual.id}: invalid or unsafe typed asset.`); continue; }
      const asset = parsed.data;
      if ("rows" in asset) {
        if (!unique(asset.rows.map((row) => row.label)) || !unique(asset.series) || asset.rows.some((row) => row.values.length !== asset.series.length))
          issues.push(`Visual ${asset.id}: duplicate labels/series or inconsistent data dimensions.`);
        if (asset.type === "pie" && (asset.series.length !== 1 || asset.rows.length < 2 || asset.rows.some((row) => row.values[0] < 0) || asset.rows.every((row) => row.values[0] === 0) || ((asset.unit === "%" || /percent/iu.test(asset.unit)) && Math.abs(asset.rows.reduce((sum, row) => sum + row.values[0], 0) - 100) > 0.01)))
          issues.push(`Visual ${asset.id}: invalid pie proportions.`);
        continue;
      }
      const labels = [...asset.labels, ...(asset.nodes ?? [])];
      const inferredLegend = asset.type === "map" || asset.type === "plan"
        ? (asset.paths ?? []).map((path) => path.style === "road" ? "Road" : path.style === "river" ? "River" : "Footpath")
        : [];
      if (!unique([...labels, ...(asset.areas ?? []), ...(asset.paths ?? [])].map((entry) => entry.id))) issues.push(`Visual ${asset.id}: duplicate element IDs.`);
      const blanks: number[] = [];
      for (const entry of labels) {
        if ((entry.text !== undefined) === (entry.questionNumber !== undefined)) issues.push(`Visual ${asset.id}/${entry.id}: label must be fixed text OR a blank, never both.`);
        if (entry.x > asset.width || entry.y > asset.height)
          issues.push(`Visual ${asset.id}/${entry.id}: label outside canvas.`);
        if (entry.questionNumber !== undefined) {
          blanks.push(entry.questionNumber);
          const question = byNumber.get(entry.questionNumber);
          if (!question || question.visualId !== asset.id) issues.push(`Visual ${asset.id}: blank ${entry.questionNumber} has no matching local question reference.`);
          if (question?.type === "text") {
            const answers = [question.answer, ...(question.acceptedAnswers ?? [])].map(normalized);
            if (labels.some((other) => other.text && answers.includes(normalized(other.text)))) issues.push(`Visual ${asset.id}: fixed label reveals blank ${entry.questionNumber}.`);
            const captions = [asset.title, asset.description ?? "", asset.id, ...labels.flatMap((label) => [label.id, label.text ?? ""]), ...(asset.connections?.map((edge) => edge.label ?? "") ?? []), ...(asset.areas?.map((area) => area.id) ?? []), ...(asset.paths?.map((path) => path.id) ?? []), ...inferredLegend].join(" ").toLowerCase();
            if (answers.some((answer) => answer.length >= 3 && new RegExp(`\\b${answer.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\b`, "iu").test(captions)))
              issues.push(`Visual ${asset.id}: caption reveals blank ${entry.questionNumber}.`);
          }
        }
      }
      if (new Set(blanks).size !== blanks.length) issues.push(`Visual ${asset.id}: repeated numbered blank.`);
      if (asset.nodes?.some((node) => node.x + node.width > asset.width || node.y + node.height > asset.height) || asset.areas?.some((area) => area.x + area.width > asset.width || area.y + area.height > asset.height) || asset.paths?.some((path) => path.points.some(([x, y]) => x > asset.width || y > asset.height)))
        issues.push(`Visual ${asset.id}: geometry outside canvas.`);
      const nodeIds = new Set(asset.nodes?.map((node) => node.id) ?? []);
      if (asset.connections?.some((edge) => edge.from === edge.to || !nodeIds.has(edge.from) || !nodeIds.has(edge.to))) issues.push(`Visual ${asset.id}: unknown or self-connected node.`);
      if (asset.type === "process" && (nodeIds.size < 2 || !asset.connections?.length)) issues.push(`Visual ${asset.id}: process requires nodes and connections.`);
      if (asset.type === "process" && nodeIds.size > 1) {
        const reachable = new Set([nodeIds.values().next().value!]);
        for (let iteration = 0; iteration < nodeIds.size; iteration++)
          for (const edge of asset.connections ?? []) {
            if (reachable.has(edge.from)) reachable.add(edge.to);
            if (reachable.has(edge.to)) reachable.add(edge.from);
          }
        if ([...nodeIds].some((id) => !reachable.has(id))) issues.push(`Visual ${asset.id}: process contains disconnected stages.`);
      }
    }
    for (const block of section.questionBlocks ?? []) {
      allBlockIds.push(block.id);
      const parsed = questionBlockSchema.safeParse(block);
      if (!parsed.success) { issues.push(`Block ${block.id}: invalid completion layout.`); continue; }
      const text = [block.text ?? "", ...(block.rows?.flatMap((row) => [row.label ?? "", ...row.cells]) ?? [])].join("\n");
      const blanks = placeholders(text);
      if (!blanks.length || new Set(blanks).size !== blanks.length || new Set(block.questionNumbers).size !== block.questionNumbers.length || [...blanks].sort((a, b) => a - b).join(",") !== [...block.questionNumbers].sort((a, b) => a - b).join(","))
        issues.push(`Block ${block.id}: numbered blanks do not match questionNumbers exactly once.`);
      for (const number of block.questionNumbers) {
        const question = byNumber.get(number);
        if (!question || question.blockId !== block.id || !["text", "matching"].includes(question.type)) issues.push(`Block ${block.id}: blank ${number} has no matching local question.`);
      }
    }
    for (const question of questions) {
      if (question.visualId && !(section.visuals ?? []).some((visual) => visual.id === question.visualId && "labels" in visual && [...visual.labels, ...(visual.nodes ?? [])].some((entry) => entry.questionNumber === question.number)))
        issues.push(`Question ${question.number}: orphan visual reference.`);
      if (question.blockId && !(section.questionBlocks ?? []).some((block) => block.id === question.blockId && block.questionNumbers.includes(question.number)))
        issues.push(`Question ${question.number}: orphan completion reference.`);
    }
  }
  if (!unique(allVisualIds)) issues.push("Visual IDs must be unique across sections.");
  if (!unique(allBlockIds)) issues.push("Completion block IDs must be unique across sections.");
  return issues;
}

export function questionIsPubliclyRenderable(question: Question, section: ContentSection): boolean {
  return (!question.visualId || section.visuals?.some((visual) => visual.id === question.visualId) === true) &&
    (!question.blockId || section.questionBlocks?.some((block) => block.id === question.blockId) === true);
}

export function contentStructureIssues(content: Pick<StoredContent, "sections" | "questions" | "skill" | "format">): string[] {
  const issues = contentAssetIssues(content);
  if (!content.sections.length || !unique(content.sections.map((section) => section.id))) issues.push("Sections must exist and have distinct IDs.");
  if (!unique(content.questions.map((question) => question.id))) issues.push("Question IDs must be distinct.");
  for (const [index, question] of content.questions.entries()) {
    if (question.number !== index + 1 || !Number.isInteger(question.sectionIndex) || !content.sections[question.sectionIndex]) issues.push(`Question ${question.number}: invalid consecutive numbering or section reference.`);
    if (question.options && !unique(question.options)) issues.push(`Question ${question.number}: duplicate options.`);
    if (["choice", "matching", "choice-multiple"].includes(question.type) && (!question.options || question.options.filter((option) => option === question.answer).length !== 1)) issues.push(`Question ${question.number}: key must match exactly one option.`);
    if (question.type === "true-false" && !["TRUE", "FALSE", "NOT GIVEN"].includes(question.answer)) issues.push(`Question ${question.number}: invalid T/F/NG key.`);
    if (question.type === "yes-no" && !["YES", "NO", "NOT GIVEN"].includes(question.answer)) issues.push(`Question ${question.number}: invalid Y/N/NG key.`);
    if (question.questionType?.endsWith("-completion") && !question.blockId) issues.push(`Question ${question.number}: completion type requires an actual numbered blank in a block.`);
    if (question.questionType?.endsWith("-labelling") && !question.visualId) issues.push(`Question ${question.number}: labelling type requires an actual visual blank.`);
    if (question.questionType === "multiple-choice-multiple" && question.type !== "choice-multiple") issues.push(`Question ${question.number}: multiple-choice-multiple requires grouped answer slots.`);
    if (question.questionType?.startsWith("matching-") && question.type !== "matching") issues.push(`Question ${question.number}: matching taxonomy requires a matching input.`);
    if (question.questionType === "true-false-not-given" && question.type !== "true-false") issues.push(`Question ${question.number}: T/F/NG taxonomy and input disagree.`);
    if (question.questionType === "yes-no-not-given" && question.type !== "yes-no") issues.push(`Question ${question.number}: Y/N/NG taxonomy and input disagree.`);
  }
  if (content.format === "full-mock" && ["reading", "listening"].includes(content.skill) && content.questions.length !== 40) issues.push("Receptive full mocks require exactly 40 numbered answer slots.");
  return issues;
}

export function validateContentStructure(content: Pick<StoredContent, "sections" | "questions" | "skill" | "format">): void {
  const issues = contentStructureIssues(content);
  if (issues.length) throw new Error(issues.join("\n"));
}
