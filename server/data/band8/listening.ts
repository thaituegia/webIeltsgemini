import type { ContentSection, DialogueLine, QuestionBlock, SpatialVisual, StoredContent, StoredQuestion } from '../../../shared/types.js';
import { validateContentStructure } from '../../../shared/content-visuals.js';
import { part1Lessons, part1Mocks } from './listening/part1.js';
import { part2Lessons, part2Mocks } from './listening/part2.js';
import { part3Lessons, part3Mocks } from './listening/part3.js';
import { part4Lessons, part4Mocks } from './listening/part4.js';
import type { ListeningSource } from './listening/source-types.js';
import { listeningOrientationVisual, listeningProcessVisual } from './listening/visuals.js';

const generatedAt = '2026-10-08T00:00:00.000Z';
const words = (text: string): number => text.trim().split(/\s+/u).filter(Boolean).length;
const rotate = <T>(values: T[], offset: number): T[] => [...values.slice(offset % values.length), ...values.slice(0, offset % values.length)];
const lessonSources = [part1Lessons, part2Lessons, part3Lessons, part4Lessons];
const mockSources = [part1Mocks, part2Mocks, part3Mocks, part4Mocks];

function variants(answer: string): string[] {
  const values = new Set([answer.toLowerCase()]);
  const time = /^(\d{1,2}):(\d{2})$/u.exec(answer);
  if (time) {
    const hour = Number(time[1]);
    const twelve = hour % 12 || 12;
    const period = hour < 12 ? 'am' : 'pm';
    values.add(`${hour}.${time[2]}`);
    values.add(`${twelve}:${time[2]}`);
    values.add(`${twelve}.${time[2]}`);
    values.add(`${twelve}:${time[2]} ${period}`);
    values.add(`${twelve}.${time[2]} ${period}`);
  }
  if (answer === 'six') values.add('6');
  if (answer === 'ten') values.add('10');
  if (answer === 'second') { values.add('2nd'); values.add('2'); }
  return [...values];
}

function buildSection(source: ListeningSource, contentId: string, sectionIndex: number, serial: number): { section: ContentSection; questions: StoredQuestion[] } {
  const prefix = `${contentId}-part${source.part}`;
  const start = sectionIndex * 10;
  const speakerOrder = [...new Set(source.speech.map(([speaker]) => speaker))];
  const dialogue: DialogueLine[] = source.speech.map(([speaker, text]) => ({ speaker, text, accent: speakerOrder.indexOf(speaker) === 1 ? 'australian' : speakerOrder.indexOf(speaker) === 2 ? 'american' : 'british' }));
  const spoken = dialogue.map(line => line.text).join(' ');
  if (words(spoken) < 650 || words(spoken) > 850) throw new Error(`${source.title}: expected 650–850 spoken words, got ${words(spoken)}`);
  if ((source.part === 2 || source.part === 4) && speakerOrder.length !== 1) throw new Error(`${source.title}: monologue required`);
  if ((source.part === 1 || source.part === 3) && speakerOrder.length < 2) throw new Error(`${source.title}: dialogue required`);
  const visuals: SpatialVisual[] = [];
  const orientationType = source.title.includes('kitchen') || source.title.includes('reuse') ? 'plan' : 'map';
  const blocks = new Map<string, QuestionBlock>();
  const addCompletion = (q: StoredQuestion, type: QuestionBlock['type'], localId: string): void => {
    const id = `${prefix}-${localId}`;
    q.blockId = id;
    q.questionType = `${type === 'form' ? 'form' : type === 'table' ? 'table' : type === 'summary' ? 'summary' : type === 'sentence' ? 'sentence' : 'note'}-completion`;
    let block = blocks.get(id);
    if (!block) {
      block = { id, type, title: type === 'form' ? 'Booking details' : type === 'table' ? 'Methods and functions' : type === 'summary' ? 'Final summary' : type === 'sentence' ? 'Project arrangements' : 'Listening notes', instructions: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', questionNumbers: [], rows: [] };
      blocks.set(id, block);
    }
    block.questionNumbers.push(q.number);
    block.rows!.push(type === 'sentence' ? { cells: [`${q.prompt} {{${q.number}}}.`] } : { label: q.prompt, cells: [`{{${q.number}}}`] });
  };
  const matchingOptions = [...new Set(source.facts.slice(source.part === 2 ? 4 : 6, source.part === 2 ? 8 : 9).map(fact => fact[1]))];
  const multiOptions = source.part === 3
    ? rotate([source.facts[4]![1], ...(source.facts[4]![3] ?? []), source.facts[5]![1]], serial)
    : source.facts.length === 12 && source.part === 1
      ? rotate([source.facts[10]![1], 'printed route', 'spare tools', source.facts[11]![1]], serial)
      : [];
  let previousEvidence = -1;
  const questions: StoredQuestion[] = source.facts.map(([label, answer, evidence, distractors], index) => {
    const position = spoken.indexOf(evidence);
    if (position < previousEvidence || position < 0) throw new Error(`${source.title}/${index + 1}: missing or out-of-order evidence`);
    previousEvidence = position;
    const q: StoredQuestion = {
      id: `${prefix}-q${index + 1}`, number: start + index + 1, sectionIndex,
      type: 'text', questionType: 'short-answer', prompt: label, answer,
      acceptedAnswers: variants(answer), wordLimit: 2,
      allowNumbers: /\d/u.test(answer) || ['six', 'ten', 'second'].includes(answer),
      evidence, explanation: `Đoạn nói xác nhận “${evidence}”. Điền đúng thông tin cuối cùng, giữ giới hạn từ và phân biệt với đề xuất hoặc thông tin cũ.`, subskill: 'confirmed-detail-and-paraphrase',
    };
    if (source.part === 1 && index < 5) addCompletion(q, 'form', 'form');
    else if (source.part === 1 && index < 9) addCompletion(q, 'note', 'notes');
    else if (source.part === 1 && index === 9 || source.part === 2 && (index === 8 || index === 9) || source.part === 3 && index < 4) {
      if (!distractors?.length) throw new Error(`${source.title}/${index + 1}: authored choice distractors required`);
      q.type = 'choice'; q.questionType = 'multiple-choice'; q.options = rotate([answer, ...distractors], serial + index);
      q.wordLimit = undefined; q.allowNumbers = undefined; q.acceptedAnswers = undefined;
      q.explanation = `Đáp án diễn đạt lại ý được xác nhận: “${evidence}”. Các lựa chọn còn lại nói về phương án khác hoặc kết luận không được người nói chấp nhận.`;
      q.subskill = 'paraphrase-and-rejected-alternatives';
    } else if (source.part === 1 && index >= 10 || source.part === 3 && (index === 4 || index === 5)) {
      q.type = 'choice-multiple'; q.questionType = 'multiple-choice-multiple'; q.options = multiOptions;
      q.prompt = source.part === 1 ? 'Which TWO items or factors does the speaker explicitly ask you to consider?' : source.facts[4]![0];
      q.selectionGroup = { id: `${prefix}-multiple`, count: 2 }; q.groupInstructions = 'Choose TWO options. Each correct selection earns one mark; order does not matter.';
      q.wordLimit = undefined; q.allowNumbers = undefined; q.acceptedAnswers = undefined;
      q.explanation = `Hai nội dung được nói rõ là “${source.facts[source.part === 1 ? 10 : 4]![1]}” và “${source.facts[source.part === 1 ? 11 : 5]![1]}”. Chọn đúng hai, không thêm phương án suy đoán.`;
      q.subskill = 'two-explicit-selections';
    } else if (source.part === 2 && index < 4) {
      q.visualId = `${prefix}-orientation`; q.questionType = orientationType === 'map' ? 'map-labelling' : 'plan-labelling'; q.subskill = 'spatial-directions';
      q.explanation = `Theo hướng Bắc ở trên và cổng vào phía Nam, đoạn “${evidence}” xác định đúng vị trí trống trên sơ đồ. Các vị trí đề xuất cũ không phải bố trí đang dùng.`;
    } else if (source.part === 2 && index < 8 || source.part === 3 && index >= 6 && index < 9) {
      q.type = 'matching'; q.questionType = 'matching'; q.options = rotate(matchingOptions, serial);
      q.groupInstructions = 'Match each item with the appropriate feature. Options may be used more than once.';
      q.wordLimit = undefined; q.allowNumbers = undefined; q.acceptedAnswers = undefined;
      q.explanation = `Ghép mục này với đặc điểm được diễn đạt trong “${evidence}”; không gán đặc điểm của hoạt động hoặc công cụ đứng trước.`;
      q.subskill = 'matching-features';
    } else if (source.part === 3) addCompletion(q, 'sentence', 'sentences');
    else if (source.part === 4 && index < 4) addCompletion(q, 'note', 'notes');
    else if (source.part === 4 && index < 8) addCompletion(q, 'table', 'table');
    else if (source.part === 4 && index < 10) {
      q.visualId = `${prefix}-sequence`; q.questionType = 'diagram-labelling'; q.subskill = 'spoken-sequence-and-diagram';
    } else if (source.part === 4) addCompletion(q, 'summary', 'summary');
    else addCompletion(q, 'note', 'final-notes');
    return q;
  });
  if (source.part === 2) visuals.push(listeningOrientationVisual(source, `${prefix}-orientation`, start, orientationType));
  if (source.part === 4) visuals.push(listeningProcessVisual(source, `${prefix}-sequence`, start));
  const section: ContentSection = {
    id: prefix, title: `Part ${source.part}: ${source.title}`, text: dialogue.map(line => `${line.speaker}: ${line.text}`).join('\n\n'), dialogue,
    instructions: 'Listen once in exam mode. Follow the word limit, match features and choose the required number of options for each group.',
    questionBlocks: [...blocks.values()], visuals: visuals.length ? visuals : undefined,
  };
  return { section, questions };
}

function content(id: string, title: string, sources: ListeningSource[], band: number, format: StoredContent['format'], serial: number): StoredContent {
  const parts = sources.map((draft, index) => buildSection(draft, id, index, serial));
  const item: StoredContent = {
    id, skill: 'listening', title, description: format === 'lesson' ? `Bài Listening nâng cao Part ${sources[0]!.part}, biên soạn nguyên bản để luyện mục tiêu ${band.toFixed(1)}. Có bản ghi, câu hỏi theo thứ tự, bằng chứng và giải thích.` : `Đề Listening độc lập đủ bốn Parts, 40 câu và 30 phút; hỗ trợ mục tiêu ${band.toFixed(1)}, không phải đề IELTS chính thức.`,
    topic: sources[0]!.topic, band, cefr: 'C1', testType: 'both', durationMinutes: format === 'full-mock' ? 30 : 12, format,
    sections: parts.map(part => part.section), questions: parts.flatMap(part => part.questions), vocabularyIds: [],
    tags: ['band8-expansion', 'advanced-listening', 'difficulty-estimated', ...sources.map(draft => `part-${draft.part}`), ...new Set(parts.flatMap(part => part.questions.map(question => question.questionType!)))],
    source: 'ai', quality: 'ai-unreviewed', createdAt: generatedAt,
    estimatedDifficulty: { band, cefr: 'C1', basis: 'Ước tính theo diễn đạt tương đương, thông tin sửa lại, theo dõi lập luận và mật độ từ vựng; chưa hiệu chuẩn từ kết quả thi thật.' },
    objectives: ['Phân biệt thông tin hiện hành với đề xuất bị bác bỏ', 'Theo dõi hướng trên sơ đồ và tiến trình giải thích', 'Kết nối paraphrase với bằng chứng theo đúng thứ tự nghe'],
    errorTypes: ['distractor-selection', 'word-limit', 'spatial-direction', 'paraphrase', 'multi-select'],
    provenance: { method: 'ai-assisted', version: 'content-bank-v4-band8', sourceDocument: 'Duo shared learning path v1.1: target 8.0 supplement', generatedAt },
    review: { status: 'structural-checks-passed', checks: ['650-850-spoken-words-per-part', 'chronological-verbatim-evidence', 'typed-visuals', 'completion-blanks', 'independent-source-scripts'], limitations: ['Chưa được chuyên gia IELTS kiểm định và chưa hiệu chuẩn độ khó.', 'Metadata accent phục vụ lựa chọn giọng; không chứng minh accent của audio khi chưa được tổng hợp.'] },
  };
  validateContentStructure(item);
  return item;
}

export const band8ListeningLessons: StoredContent[] = lessonSources.flatMap((sources, partIndex) => sources.map((draft, index) => content(`listening-v4-band8-lesson-${String(partIndex * 4 + index + 1).padStart(2, '0')}`, draft.title, [draft], index < 2 ? 7.5 : 8, 'lesson', partIndex * 4 + index)));
export const band8ListeningMocks: StoredContent[] = Array.from({ length: 4 }, (_, index) => content(`listening-v4-band8-mock-${String(index + 1).padStart(2, '0')}`, `Advanced Listening ${index + 1}: four independent contexts`, mockSources.map(sources => sources[index]!), index < 2 ? 7.5 : 8, 'full-mock', index + 20));
