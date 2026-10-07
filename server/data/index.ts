import type { StoredContent } from "../../shared/types.js";
import {
  readingLessons,
  listeningLessons,
  receptiveMocks,
} from "./receptive.js";
import {
  writingLessons,
  speakingLessons,
  grammarLessons,
  productiveMocks,
} from "./productive.js";
import { vocabularyBank } from "./vocabulary.js";

const cefrOrder = ["A2", "B1", "B2", "C1"];
const rawBank = [
  ...readingLessons,
  ...listeningLessons,
  ...writingLessons,
  ...speakingLessons,
  ...grammarLessons,
  ...receptiveMocks,
  ...productiveMocks,
];
export const contentBank: StoredContent[] = rawBank.map((content) => {
  const contentTopics = content.topic.split(" / ");
  const text = content.sections
    .map((section) => section.text)
    .join(" ")
    .toLowerCase();
  const words = vocabularyBank
    .filter(
      (word) =>
        contentTopics.includes(word.topic) &&
        cefrOrder.indexOf(word.cefr) <= cefrOrder.indexOf(content.cefr),
    )
    .sort((left, right) => {
      const leftInText = text.includes(left.word.toLowerCase()) ? 1 : 0;
      const rightInText = text.includes(right.word.toLowerCase()) ? 1 : 0;
      return (
        rightInText - leftInText ||
        Math.abs(
          cefrOrder.indexOf(left.cefr) - cefrOrder.indexOf(content.cefr),
        ) -
          Math.abs(
            cefrOrder.indexOf(right.cefr) - cefrOrder.indexOf(content.cefr),
          )
      );
    });
  return {
    ...content,
    vocabularyIds: words
      .slice(0, content.format === "full-mock" ? 12 : 6)
      .map((word) => word.id),
  };
});
export { vocabularyBank } from "./vocabulary.js";
export { placementBank } from "./receptive.js";
