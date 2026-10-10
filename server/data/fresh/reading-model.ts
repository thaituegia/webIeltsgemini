import type { Cefr, ContentSection, IeltsQuestionType, SpatialVisual, StoredQuestion, TestType } from '../../../shared/types.js';

/** Original sources commissioned for the October 2026 reset. None reuse an earlier bank. */
export interface FreshReadingSource {
  title: string;
  topic: string;
  paragraphs: string[];
  questions: FreshReadingQuestion[];
  blocks?: Omit<NonNullable<ContentSection['questionBlocks']>[number], 'id'>[];
  visuals?: Omit<SpatialVisual, 'id'>[];
}
export interface FreshReadingQuestion {
  type: StoredQuestion['type'];
  questionType: IeltsQuestionType;
  prompt: string;
  answer: string;
  evidence: string;
  explanation: string;
  options?: string[];
  wordLimit?: number;
  group?: string;
  visual?: boolean;
  block?: number;
}
export interface FreshReadingLessonSource extends FreshReadingSource {
  band: number;
  cefr: Cefr;
  testType: TestType;
}
function explanations(): Partial<Record<IeltsQuestionType, string>> { return {
  'true-false-not-given': 'TRUE xác nhận thông tin; FALSE cần mâu thuẫn rõ; NOT GIVEN nghĩa là thiếu dữ kiện, không phải suy đoán.',
  'yes-no-not-given': 'Đối chiếu đúng quan điểm tác giả; một quan điểm không được bàn tới phải chọn NOT GIVEN.',
  'matching-headings': 'Chọn ý chính của cả đoạn, không chọn một chi tiết phụ hoặc kết luận vượt phạm vi đoạn.',
  'matching-information': 'Tìm đoạn chứa đúng chi tiết được yêu cầu; trùng chủ đề thôi chưa đủ.',
  'matching-features': 'Ghép đúng người hoặc nhóm với hành động được văn bản quy cho họ.',
  'matching-sentence-endings': 'Vế kết thúc phải khớp cả ngữ pháp và quan hệ ý nghĩa trong bài.',
}; }
export function rq(questionType: IeltsQuestionType, prompt: string, answer: string, evidence: string,
  options?: string[], extra: Partial<FreshReadingQuestion> = {}): FreshReadingQuestion {
  const type: StoredQuestion['type'] = questionType === 'true-false-not-given' ? 'true-false'
    : questionType === 'yes-no-not-given' ? 'yes-no'
    : questionType === 'multiple-choice-multiple' ? 'choice-multiple'
    : questionType === 'multiple-choice' ? 'choice'
    : questionType.startsWith('matching') ? 'matching' : 'text';
  return { type, questionType, prompt, answer, evidence, ...(options ? { options } : {}),
    explanation: explanations()[questionType] ?? 'Dùng thông tin được nêu trong bài; giữ đúng điều kiện và giới hạn từ của câu hỏi.', ...extra };
}
export function tf(prompt: string, answer: 'TRUE' | 'FALSE' | 'NOT GIVEN', evidence: string, reason?: string) {
  return rq('true-false-not-given', prompt, answer, evidence, ['TRUE', 'FALSE', 'NOT GIVEN'], reason ? { explanation: reason } : {});
}
export function yn(prompt: string, answer: 'YES' | 'NO' | 'NOT GIVEN', evidence: string, reason?: string) {
  return rq('yes-no-not-given', prompt, answer, evidence, ['YES', 'NO', 'NOT GIVEN'], reason ? { explanation: reason } : {});
}
export function short(prompt: string, answer: string, evidence: string, wordLimit = 2) {
  return rq('short-answer', prompt, answer, evidence, undefined, { wordLimit });
}
export function choice(prompt: string, answer: string, evidence: string, distractors: string[]) {
  return rq('multiple-choice', prompt, answer, evidence, [answer, ...distractors]);
}
