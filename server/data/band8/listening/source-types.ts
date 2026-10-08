export type Fact = [label: string, answer: string, evidence: string, distractors?: string[]];
export interface ListeningSource {
  title: string;
  topic: string;
  part: 1 | 2 | 3 | 4;
  speech: [speaker: string, text: string][];
  facts: Fact[];
}
export const source = (part: ListeningSource['part'], title: string, topic: string, speech: ListeningSource['speech'], facts: Fact[]): ListeningSource => ({ part, title, topic, speech, facts });
