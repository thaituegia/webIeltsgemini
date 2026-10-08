import type { DialogueLine, QuestionBlock, StoredQuestion, VisualAsset } from "../../../shared/types.js";

export type DraftQuestion = Omit<StoredQuestion, "id" | "number" | "sectionIndex">;
export interface MockPartDraft {
  title: string;
  topic: string;
  part: 1 | 2 | 3 | 4;
  /** Actual English speech; 650–850 words per Part. */
  script: [speaker: string, text: string, accent?: DialogueLine["accent"]][];
  /** Exactly ten answer slots in order. All asset references use local 1–10. */
  questions: DraftQuestion[];
  visuals?: VisualAsset[];
  questionBlocks?: QuestionBlock[];
}
export interface ListeningMockDraft {
  serial: number;
  title: string;
  testType: "academic" | "general";
  topics: string[];
  parts: MockPartDraft[];
}
function acceptedVariants(answer: string): string[] {
  const variants = new Set([answer.toLowerCase()]);
  const time = /^(\d{1,2}):(\d{2})$/u.exec(answer);
  if (time) {
    const hour = Number(time[1]);
    const minute = time[2];
    variants.add(hour + ":" + minute);
    variants.add(time[1] + "." + minute);
    variants.add(hour + "." + minute);
    const twelveHour = hour % 12 || 12;
    const period = hour < 12 ? "am" : "pm";
    variants.add(twelveHour + ":" + minute + period);
    variants.add(twelveHour + "." + minute + period);
    variants.add(twelveHour + ":" + minute + " " + period);
    if (hour > 12) {
      variants.add(twelveHour + ":" + minute);
      variants.add(twelveHour + "." + minute);
    }
  }
  return [...variants];
}
export function shortAnswer(prompt: string, answer: string, evidence: string, wordLimit = 3): DraftQuestion {
  return { type: "text", questionType: "short-answer", prompt, answer, wordLimit, allowNumbers: /^\d+(?:[.:]\d+)?$/u.test(answer), acceptedAnswers: acceptedVariants(answer), evidence, explanation: "Dùng thông tin được nói rõ trong đoạn trích; không thêm chi tiết từ lựa chọn bị loại.", subskill: "specific-information" };
}
export function completion(prompt: string, answer: string, evidence: string, questionType: "form-completion" | "note-completion" | "table-completion" | "flow-chart-completion" | "summary-completion" | "sentence-completion", blockId: string, wordLimit = 3, allowNumbers = false): DraftQuestion {
  return { ...shortAnswer(prompt, answer, evidence, wordLimit), questionType, blockId, allowNumbers, subskill: "completion-and-paraphrase" };
}
export function choice(prompt: string, answer: string, evidence: string, distractors: string[]): DraftQuestion {
  return { type: "choice", questionType: "multiple-choice", prompt, answer, options: [answer, ...distractors], evidence, explanation: "Đáp án diễn đạt thông tin được xác nhận; phân biệt phương án cuối cùng với dự định hoặc đề xuất bị bác bỏ.", subskill: "paraphrase-and-distractors" };
}
export function matching(prompt: string, answer: string, evidence: string, options: string[]): DraftQuestion {
  return { type: "matching", questionType: "matching", prompt, answer, options, evidence, explanation: "Ghép đặc điểm đúng theo người nói, không suy luận thêm từ những hoạt động được nhắc đến.", subskill: "matching-features" };
}
export function multiple(prompt: string, answers: [string, string], evidence: string, distractors: string[], id = "multi"): DraftQuestion[] {
  const options = [answers[0], ...distractors, answers[1]];
  return answers.map((answer) => ({ type: "choice-multiple", questionType: "multiple-choice-multiple", prompt, answer, options, evidence, selectionGroup: { id, count: 2 }, groupInstructions: "Choose TWO options. Each correct selection earns one mark.", explanation: "Chọn đúng hai nội dung được xác nhận. Hai số câu là hai điểm; thứ tự chọn không ảnh hưởng kết quả.", subskill: "multiple-selection" }));
}
