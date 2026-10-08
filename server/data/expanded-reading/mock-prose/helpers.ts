import type { CompactDraft } from '../compact.js';

export interface OriginalMockDraft {
  title: string; topic: string; level: CompactDraft['level'];
  paragraphs: string[]; headings: string[]; distractorHeadings: string[];
  falseClaim: string; falseAgainst: string;
  opinion: string; contraryOpinion: string;
  people: { name: string; role: string; cue?: string }[];
  ending: { stem: string; answer: string; cue: string; distractors: string[] };
  absentClaim: string; absentReason: string;
  authorNotGiven: { statement: string; anchor: string; reason: string };
  detailQuestion: string;
  multiple?: CompactDraft['multiple']; visual?: CompactDraft['visual'];
}
const clean = (text: string) => text.replaceAll(/\[\[([^\]]+)\]\]/g, '$1');
export function originalMock(input: OriginalMockDraft): CompactDraft {
  const paragraphs = input.paragraphs.map(clean);
  const sentences = paragraphs.flatMap(paragraph => paragraph.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [paragraph]).map(sentence => sentence.trim());
  function quote(cue: string) {
    const found = sentences.find(sentence => sentence.includes(cue));
    if (!found) throw new Error(`${input.title}: missing literal evidence for ${cue}`);
    return found;
  }
  if (!paragraphs.some(paragraph => paragraph.includes(input.opinion))) throw new Error(`${input.title}: author opinion is absent`);
  if (input.headings.length !== paragraphs.length) throw new Error(`${input.title}: one heading is required per paragraph`);
  return {
    title: input.title, topic: input.topic, level: input.level, paragraphs: input.paragraphs,
    headings: input.headings, distractorHeadings: input.distractorHeadings,
    falseClaim: input.falseClaim, falseQuote: quote(input.falseAgainst),
    opinion: input.opinion, contraryOpinion: input.contraryOpinion,
    people: input.people.map(person => ({ name: person.name, role: person.role, quote: quote(person.cue || person.name) })),
    ending: { stem: input.ending.stem, answer: input.ending.answer, quote: quote(input.ending.cue), distractors: input.ending.distractors },
    absentClaim: input.absentClaim, absentReason: input.absentReason,
    authorNotGiven: { ...input.authorNotGiven, anchor: quote(input.authorNotGiven.anchor) },
    detailQuestion: input.detailQuestion,
    ...(input.multiple ? { multiple: input.multiple } : {}), ...(input.visual ? { visual: input.visual } : {}),
  };
}
