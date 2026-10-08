import type { TestType } from '../../../../shared/types.js';

/** Original teaching texts; research and organisations are fictional. */
export interface AdvancedSource {
  title: string;
  topic: string;
  testType: TestType;
  paragraphs: string[];
  headings: string[];
  distractorHeadings: [string, string];
  facts: {
    true: { statement: string; quote: string };
    false: { statement: string; quote: string };
    notGiven: { statement: string; anchor: string; reason: string };
  };
  views: {
    yes: { statement: string; quote: string };
    no: { statement: string; quote: string };
    notGiven: { statement: string; anchor: string; reason: string };
  };
  detail: { prompt: string; answer: string; quote: string };
  completion: { stem: string; answer: string; quote: string };
  /** Full mocks use consecutive groups of independently keyed completion blanks. */
  completionAnchors?: { stem: string; answer: string; quote: string }[];
  information: { prompt: string; paragraph: number; quote: string };
  feature: { prompt: string; answer: string; options: string[]; quote: string };
  ending: { stem: string; answer: string; distractors: string[]; quote: string };
  multiple: { prompt: string; answers: [string, string]; distractors: [string, string, string]; quote: string };
  visual?: { type: 'diagram' | 'process'; fixedStart: string; fixedEnd: string; prompt: string; answer: string; quote: string };
  flow?: { title: string; steps: string[] };
}
