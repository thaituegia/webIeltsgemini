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
import { band8ReadingLessons, band8ReadingMocks } from "./band8/reading.js";
import { band8ListeningLessons, band8ListeningMocks } from "./band8/listening.js";
import { band8WritingLessons, band8SpeakingLessons, band8GrammarLessons, band8WritingMocks, band8SpeakingMocks } from "./band8/productive.js";
import { band8Vocabulary } from "./band8/vocabulary.js";
import { band8Placement } from "./band8/placement.js";

export const v3VocabularyBank = [...legacyVocabularyBank, ...expandedVocabularyBank];
export const v3PlacementBank = [...legacyPlacementBank, ...expandedPlacementBank];
export const vocabularyBank = [...v3VocabularyBank, ...band8Vocabulary];
export const placementBank = [...v3PlacementBank, ...band8Placement];

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
function withVocabulary(content: StoredContent, availableWords: typeof vocabularyBank): StoredContent {
  const contentTopics = content.topic.split(" / ");
  const text = content.sections
    .map((section) => section.text)
    .join(" ")
    .toLowerCase();
  // Retain the existing lessons' vocabulary references and learner progress.
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
}
// Preserve every previous reference as well as the original exercises. Adding
// advanced vocabulary must not change a saved lesson or an existing attempt.
export const v3ContentBank: StoredContent[] = rawBank.map(content => withVocabulary(content, content.source === "authored" ? legacyVocabularyBank : v3VocabularyBank));
export const contentBank: StoredContent[] = [
  ...v3ContentBank,
  ...[...band8ReadingLessons, ...band8ListeningLessons, ...band8WritingLessons, ...band8SpeakingLessons, ...band8GrammarLessons, ...band8ReadingMocks, ...band8ListeningMocks, ...band8WritingMocks, ...band8SpeakingMocks].map(content => withVocabulary(content, vocabularyBank)),
];
