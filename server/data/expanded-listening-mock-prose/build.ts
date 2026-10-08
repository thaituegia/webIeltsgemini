import type { ContentSection, StoredContent, StoredQuestion, VisualAsset } from "../../../shared/types.js";
import { validateContentStructure } from "../../../shared/content-visuals.js";
import type { ListeningMockDraft } from "./types.js";

const wordCount = (value: string): number => value.trim().split(/\s+/u).filter(Boolean).length;
const remapText = (value: string, start: number): string => value.replace(/\{\{(\d+)\}\}/gu, (_match, number: string) => "{{" + (start + Number(number)) + "}}");
function rotate<T>(items: T[], shift: number): T[] {
  const offset = shift % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}
export function buildListeningMock(draft: ListeningMockDraft): StoredContent {
  const id = "listening-v3-mock-" + String(draft.serial).padStart(2, "0");
  if (draft.parts.length !== 4 || draft.parts.some((part, index) => part.part !== index + 1 || part.questions.length !== 10))
    throw new Error(id + ": exactly four ordered Parts and ten answer slots per Part required.");
  const questions: StoredQuestion[] = [];
  const sections: ContentSection[] = draft.parts.map((part, index) => {
    const prefix = id + "-part" + (index + 1);
    const start = index * 10;
    const speakerOrder = [...new Set(part.script.map(([speaker]) => speaker))];
    const dialogue = part.script.map(([speaker, text, accent]) => ({ speaker, text, accent: accent ?? (index === 2 ? "american" as const : speakerOrder.indexOf(speaker) === 1 ? "australian" as const : "british" as const) }));
    const text = dialogue.map((line) => line.speaker + ": " + line.text).join("\n\n");
    const spokenWords = wordCount(dialogue.map((line) => line.text).join(" "));
    if (spokenWords < 650 || spokenWords > 850) throw new Error(prefix + ": " + spokenWords + " spoken words; expected 650–850.");
    if ([1, 3].includes(index) && new Set(dialogue.map((line) => line.speaker)).size !== 1)
      throw new Error(prefix + ": Part " + (index + 1) + " must be a monologue.");
    const groupOptions = new Map<string, string[]>();
    for (const [questionIndex, question] of part.questions.entries()) {
      if (!text.includes(question.evidence)) throw new Error(prefix + "/question" + (questionIndex + 1) + ": evidence is not a verbatim script substring.");
      let options = question.options;
      if (options && ["choice", "choice-multiple"].includes(question.type)) {
        const key = question.selectionGroup?.id;
        options = key && groupOptions.has(key) ? groupOptions.get(key)! : rotate(options, draft.serial + index + questionIndex);
        if (key) groupOptions.set(key, options);
      }
      questions.push({
        ...question, options, id: prefix + "-q" + (questionIndex + 1),
        number: start + questionIndex + 1, sectionIndex: index,
        visualId: question.visualId ? prefix + "-" + question.visualId : undefined,
        blockId: question.blockId ? prefix + "-" + question.blockId : undefined,
        selectionGroup: question.selectionGroup ? { ...question.selectionGroup, id: prefix + "-" + question.selectionGroup.id } : undefined,
      });
    }
    const visuals = part.visuals?.map((asset): VisualAsset => {
      if ("rows" in asset) return { ...asset, id: prefix + "-" + asset.id };
      return {
        ...asset, id: prefix + "-" + asset.id,
        labels: asset.labels.map((entry) => ({ ...entry, questionNumber: entry.questionNumber === undefined ? undefined : start + entry.questionNumber })),
        nodes: asset.nodes?.map((entry) => ({ ...entry, questionNumber: entry.questionNumber === undefined ? undefined : start + entry.questionNumber })),
      };
    });
    return {
      id: prefix, title: "Part " + (index + 1) + ": " + part.title, text, dialogue, visuals,
      instructions: "Answer the numbered questions as you listen. Follow the word limit or selection instruction for each group.",
      questionBlocks: part.questionBlocks?.map((block) => ({
        ...block, id: prefix + "-" + block.id, questionNumbers: block.questionNumbers.map((number) => start + number),
        text: block.text ? remapText(block.text, start) : undefined,
        rows: block.rows?.map((row) => ({ ...row, label: row.label ? remapText(row.label, start) : undefined, cells: row.cells.map((cell) => remapText(cell, start)) })),
      })),
    };
  });
  const band = draft.serial <= 4 ? 5.5 : draft.serial <= 8 ? 6 : draft.serial <= 12 ? 6.5 : 7;
  const content: StoredContent = {
    id, skill: "listening", title: draft.title,
    description: "Đề Listening AI biên soạn độc lập, đủ bốn Parts với hội thoại đời sống, bài nói xã hội, thảo luận học thuật và bài giảng. Không phải đề IELTS chính thức.",
    topic: draft.topics[0], band, cefr: band >= 7 ? "C1" : "B2", testType: draft.testType,
    durationMinutes: 30, format: "full-mock", sections, questions, vocabularyIds: [],
    tags: [...draft.topics.map((topic) => topic.toLowerCase()), "original-full-mock", "four-parts", "40-answer-slots", "difficulty-estimated"],
    source: "ai", quality: "ai-unreviewed", createdAt: "2026-10-08T00:00:00.000Z",
    estimatedDifficulty: { band, cefr: band >= 7 ? "C1" : "B2", basis: "Mức độ dự kiến theo độ dài diễn ngôn, diễn đạt tương đương và mật độ thông tin; chưa hiệu chuẩn từ kết quả thi." },
    objectives: ["Theo dõi thông tin sửa lại và phương án bị loại", "Phân biệt paraphrase với từ nghe trùng", "Đọc biểu mẫu, sơ đồ và nhóm lựa chọn theo chỉ dẫn"],
    errorTypes: ["distractor-selection", "word-limit", "spatial-direction", "paraphrase", "multi-select"],
    provenance: { method: "ai-assisted", version: "content-bank-v3", sourceDocument: "Tong_hop_cac_dang_bai_IELTS.docx", generatedAt: "2026-10-08T00:00:00.000Z" },
    review: { status: "structural-checks-passed", checks: ["40-consecutive-answer-slots", "four-independent-spoken-scripts", "verbatim-evidence", "typed-visuals-and-completion", "no-lesson-reuse"], limitations: ["Chưa được giám khảo hoặc chuyên gia kiểm định.", "Metadata giọng đọc không chứng minh accent của audio thực tế."] },
  };
  validateContentStructure(content);
  return content;
}
