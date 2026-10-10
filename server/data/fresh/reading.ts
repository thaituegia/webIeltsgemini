import type { Cefr, ContentSection, IeltsQuestionType, StoredContent, StoredQuestion } from '../../../shared/types.js';
import type { FreshReadingSource } from './reading-model.js';
import { freshReadingLessonSources } from './reading-lessons.js';
import { freshReadingMockSources } from './reading-mocks.js';

const generatedAt = '2026-10-11T00:00:00.000Z';

function buildSection(source: FreshReadingSource, id: string, sectionIndex: number, start: number) {
  const sectionId = `${id}-s${sectionIndex + 1}`;
  const section: ContentSection = { id: sectionId, title: source.title,
    text: source.paragraphs.map((paragraph, index) => `[${String.fromCharCode(65 + index)}] ${paragraph}`).join('\n\n'),
    instructions: 'Read the text and answer using only the information it contains.' };
  if (source.blocks) section.questionBlocks = source.blocks.map((block, index) => ({ ...block, id: `${sectionId}-block${index + 1}`,
    questionNumbers: block.questionNumbers.map(number => number + start - 1),
    ...(block.text ? { text: block.text.replace(/\{\{(\d+)\}\}/gu, (_, number: string) => `{{${Number(number) + start - 1}}}`) } : {}),
    ...(block.rows ? { rows: block.rows.map(row => ({ ...row, cells: row.cells.map(cell => cell.replace(/\{\{(\d+)\}\}/gu, (_, number: string) => `{{${Number(number) + start - 1}}}`)) })) } : {}) }));
  const autoBlocks = new Map<IeltsQuestionType, string>();
  const completionTypes: Record<string, NonNullable<ContentSection['questionBlocks']>[number]['type']> = {
    'sentence-completion': 'sentence', 'summary-completion': 'summary', 'note-completion': 'note',
    'table-completion': 'table', 'flow-chart-completion': 'flow-chart',
  };
  for (const [kind, type] of Object.entries(completionTypes)) {
    const entries = source.questions.map((question, index) => ({ question, number: start + index }))
      .filter(entry => entry.question.questionType === kind && entry.question.block === undefined);
    if (!entries.length) continue;
    section.questionBlocks ??= [];
    const blockId = `${sectionId}-block${section.questionBlocks.length + 1}`;
    autoBlocks.set(kind as IeltsQuestionType, blockId);
    const lines = entries.map(entry => entry.question.prompt.replace('________', `{{${entry.number}}}`));
    section.questionBlocks.push({ id: blockId, type, title: 'Information from the text',
      instructions: 'Complete each numbered blank. Follow the word limit stated beside its question.',
      questionNumbers: entries.map(entry => entry.number),
      ...(type === 'table' || type === 'flow-chart' ? { rows: lines.map(line => ({ cells: [line] })) } : { text: lines.join('\n') }) });
  }
  if (source.visuals) section.visuals = source.visuals.map((visual, index) => {
    const asset = { ...visual, id: `${sectionId}-visual${index + 1}` };
    if ('labels' in asset) {
      asset.labels = asset.labels.map(label => ({ ...label, ...(label.questionNumber ? { questionNumber: label.questionNumber + start - 1 } : {}) }));
      if (asset.nodes) asset.nodes = asset.nodes.map(node => ({ ...node, ...(node.questionNumber ? { questionNumber: node.questionNumber + start - 1 } : {}) }));
    }
    return asset;
  });
  const questions: StoredQuestion[] = source.questions.map((question, index) => {
    const number = start + index;
    const rawOptions = question.options;
    const offset = rawOptions ? (number + sectionIndex * 2) % rawOptions.length : 0;
    const options = rawOptions && question.type !== 'true-false' && question.type !== 'yes-no' && question.type !== 'choice-multiple' ? [...rawOptions.slice(offset), ...rawOptions.slice(0, offset)] : rawOptions;
    const completion = question.type === 'text';
    const prompt = completion ? `${question.prompt} Write NO MORE THAN ${question.wordLimit ?? 2} WORDS from the text.` : question.prompt;
    const stored: StoredQuestion = { id: `${id}-q${number}`, number, sectionIndex, type: question.type,
      questionType: question.questionType, prompt, answer: question.answer, evidence: question.evidence,
      explanation: question.explanation, subskill: question.questionType, ...(options ? { options } : {}),
      ...(completion ? { wordLimit: question.wordLimit ?? 2 } : {}),
      ...(question.group ? { selectionGroup: { id: `${sectionId}-${question.group}`, count: 2 }, groupInstructions: 'Choose TWO answers. The two numbered rows share one answer group.' } : {}),
      ...(question.visual ? { visualId: `${sectionId}-visual1` } : {}),
      ...(question.block !== undefined ? { blockId: `${sectionId}-block${question.block + 1}` }
        : autoBlocks.has(question.questionType) ? { blockId: autoBlocks.get(question.questionType)! } : {}),
    };
    if (!section.text.includes(stored.evidence)) throw new Error(`${stored.id}: authored evidence is absent from the new source`);
    if (completion && !section.text.toLowerCase().includes(stored.answer.toLowerCase())) throw new Error(`${stored.id}: completion answer is absent from new source`);
    return stored;
  });
  return { section, questions };
}
function metadata(band: number, cefr: Cefr) {
  return { source: 'ai' as const, quality: 'ai-unreviewed' as const, createdAt: generatedAt,
    estimatedDifficulty: { band, cefr, basis: 'Author estimate based on sentence complexity, text length, paraphrase demands and evidence ambiguity; not calibrated with candidate results.' },
    objectives: ['Read for the requested evidence', 'Distinguish contradictions from missing information', 'Follow reference, conditions and paraphrase'],
    errorTypes: ['unsupported-inference', 'scope-shift', 'false-versus-not-given', 'word-limit', 'distractor-detail'],
    provenance: { method: 'ai-assisted' as const, version: 'fresh-reading-v6-reset', sourceDocument: 'Original replacement bank commissioned 2026-10-11', generatedAt },
    review: { status: 'unreviewed' as const, checks: [], limitations: ['Original fictional teaching texts, not official IELTS papers.', 'Answer evidence and structural audits do not replace expert IELTS review.', 'Difficulty and CEFR labels are author estimates.'] } };
}
export const freshReadingLessons: StoredContent[] = freshReadingLessonSources.map((source, index) => {
  const id = `fresh-r-lesson-${String(index + 1).padStart(2, '0')}`;
  const built = buildSection(source, id, 0, 1);
  return { id, skill: 'reading', title: source.title, description: 'Bài đọc nguyên bản trong ngân hàng thay thế hoàn toàn; luyện tìm chứng cứ và hiểu đúng giới hạn thông tin.',
    topic: source.topic, band: source.band, cefr: source.cefr, testType: source.testType,
    durationMinutes: source.band < 5 ? 12 : source.band < 7 ? 18 : 22, format: 'lesson',
    sections: [built.section], questions: built.questions, vocabularyIds: [],
    tags: ['fresh-reset', 'original-source', ...new Set(built.questions.map(question => question.questionType!))], ...metadata(source.band, source.cefr) };
});
export const freshReadingMocks: StoredContent[] = freshReadingMockSources.map((mock, index) => {
  const id = `fresh-r-mock-${String(index + 1).padStart(2, '0')}`;
  let start = 1;
  const built = mock.sources.map((source, sectionIndex) => {
    const section = buildSection(source, id, sectionIndex, start);
    start += section.questions.length;
    return section;
  });
  const questions = built.flatMap(section => section.questions);
  const wordCount = built.reduce((sum, section) => sum + section.section.text.trim().split(/\s+/u).length, 0);
  if (questions.length !== 40 || built.length !== 3 || wordCount < 2150 || wordCount > 2750) throw new Error(`${id}: invalid full mock workload (${wordCount} words/${questions.length} questions)`);
  return { id, skill: 'reading', title: mock.title, description: 'Đề mô phỏng độc lập: 3 sections, 40 câu, 60 phút; nguồn riêng không lấy lại từ bài luyện.',
    topic: mock.topic, band: mock.band, cefr: mock.cefr, testType: mock.testType, durationMinutes: 60, format: 'full-mock',
    sections: built.map(section => section.section), questions, vocabularyIds: [],
    tags: ['fresh-reset', 'independent-mock', ...new Set(questions.map(question => question.questionType!))], ...metadata(mock.band, mock.cefr) };
});
