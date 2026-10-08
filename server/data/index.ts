import type { StoredContent } from "../../shared/types.js";
import {
  readingLessons,
  listeningLessons,
  receptiveMocks,
  placementBank as legacyPlacementBank,
} from "./receptive.js";
import {
  writingLessons,
  speakingLessons,
  grammarLessons,
  productiveMocks,
} from "./productive.js";
import { vocabularyBank as legacyVocabularyBank } from "./vocabulary.js";
import { expandedReadingLessons, expandedReadingMocks } from "./expanded-reading.js";
import { expandedListeningLessons, expandedListeningMocks } from "./expanded-listening.js";
import { expandedWritingLessons, expandedWritingMocks, expandedSpeakingLessons, expandedSpeakingMocks } from "./expanded-productive.js";
import { expandedGrammarLessons, expandedVocabularyBank, expandedPlacementBank } from "./expanded-support.js";

export const vocabularyBank = [...legacyVocabularyBank, ...expandedVocabularyBank];
export const placementBank = [...legacyPlacementBank, ...expandedPlacementBank];

const cefrOrder = ["A2", "B1", "B2", "C1"];
const rawBank = [
  ...readingLessons,
  ...listeningLessons,
  ...writingLessons,
  ...speakingLessons,
  ...grammarLessons,
  ...receptiveMocks,
  ...productiveMocks,
  ...expandedReadingLessons,
  ...expandedListeningLessons,
  ...expandedWritingLessons,
  ...expandedSpeakingLessons,
  ...expandedGrammarLessons,
  ...expandedReadingMocks,
  ...expandedListeningMocks,
  ...expandedWritingMocks,
  ...expandedSpeakingMocks,
];
export const contentBank: StoredContent[] = rawBank.map((content) => {
  const contentTopics = content.topic.split(" / ");
  const text = content.sections
    .map((section) => section.text)
    .join(" ")
    .toLowerCase();
  // Retain the existing lessons' vocabulary references and learner progress.
  const availableWords = content.source === "authored" ? legacyVocabularyBank : vocabularyBank;
  const words = availableWords
    .filter(
      (word) =>
        (contentTopics.includes(word.topic) || (content.source === "ai" && text.includes(word.word.toLowerCase()))) &&
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
