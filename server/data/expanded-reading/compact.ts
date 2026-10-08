import type { Cefr } from '../../../shared/types.js';
import type { ReadingSource } from './model.js';

export interface CompactDraft {
  title: string;
  topic: string;
  level: Cefr;
  /** [[answer]] only marks a source span; markers are removed from stored text. */
  paragraphs: string[];
  headings: string[];
  distractorHeadings: string[];
  falseClaim: string;
  falseQuote: string;
  opinion: string;
  contraryOpinion: string;
  people: {name: string; role: string; quote: string}[];
  ending: {stem: string; answer: string; quote: string; distractors: string[]};
  absentClaim: string;
  absentReason: string;
  authorNotGiven: {statement: string; anchor: string; reason: string};
  multiple?: ReadingSource['multiple'];
  visual?: ReadingSource['visual'];
  detailQuestion?: string;
  trueClaim?: string;
  opinionParaphrase?: string;
  informationPrompt?: string;
}

export function compact(d: CompactDraft): ReadingSource {
  const marked: {answer: string; sentence: string; stem: string; paragraph: number}[] = [];
  const paragraphs = d.paragraphs.map((p, paragraph) => {
    const sentences = p.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [p];
    for (const sentence of sentences) {
      for (const found of sentence.matchAll(/\[\[([^\]]+)\]\]/g)) {
        const literal = sentence.replaceAll(/\[\[([^\]]+)\]\]/g, '$1').trim();
        marked.push({answer: found[1]!, sentence: literal,
          stem: sentence.replace(found[0], '________').replaceAll(/\[\[([^\]]+)\]\]/g, '$1').trim(), paragraph});
      }
    }
    return p.replaceAll(/\[\[([^\]]+)\]\]/g, '$1');
  });
  if (marked.length < 3 || d.people.length < 3) throw new Error(`${d.title}: insufficient source anchors`);
  const a = marked[0]!;
  const b = marked[1]!;
  const c = marked.at(-1)!;
  const clean = (s:string) => s.replaceAll(/\[\[([^\]]+)\]\]/g, '$1');
  const quote = (s:string) => {
    const candidate=clean(s);
    const body=paragraphs.join('\n\n');
    if(body.includes(candidate)) return candidate;
    const offset=body.toLowerCase().indexOf(candidate.toLowerCase());
    if(offset>=0) return body.slice(offset,offset+candidate.length);
    throw new Error(`${d.title}: a supplied evidence quote is not in the source: ${candidate}`);
  };
  return {
    title:d.title,topic:d.topic,level:d.level,paragraphs,headings:d.headings,
    distractorHeadings:d.distractorHeadings,
    detail:{prompt:d.detailQuestion ?? (d.people.some(person=>person.name===a.answer)?`Which person ${d.people.find(person=>person.name===a.answer)!.role}?`:`What is the missing information in this context: ${a.stem}`),answer:a.answer,quote:a.sentence},
    trueStatement:{statement:d.trueClaim ?? b.sentence,quote:b.sentence},
    falseStatement:{statement:d.falseClaim,quote:quote(d.falseQuote)},
    notGiven:{statement:d.absentClaim,anchor:a.sentence,reason:d.absentReason},
    authorYes:{statement:d.opinionParaphrase ?? clean(d.opinion),quote:quote(d.opinion)},
    authorNo:{statement:d.contraryOpinion,quote:quote(d.opinion)},
    authorNotGiven:{...d.authorNotGiven,anchor:quote(d.authorNotGiven.anchor)},
    information:{prompt:d.informationPrompt ?? `Which paragraph contains the following information? ${c.sentence}`,paragraph:c.paragraph,quote:c.sentence},
    features:{prompt:`Match the role to the person: ${d.people[1]!.role}`,answer:d.people[1]!.name,options:d.people.map(p=>p.name),quote:quote(d.people[1]!.quote)},
    ending:{...d.ending,quote:quote(d.ending.quote)},
    completion:{stem:c.stem,answer:c.answer,quote:c.sentence,label:d.headings[c.paragraph] ?? 'Final stage'},
    completionAnchors:marked.map(m=>({stem:m.stem,answer:m.answer,quote:m.sentence,label:d.headings[m.paragraph] ?? 'Detail'})),
    featureAnchors:d.people.map(person=>({...person,quote:quote(person.quote)})),
    paragraphInfoAnchors:paragraphs.map((paragraph,index)=>({paragraph:index,quote:(paragraph.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [paragraph])[0]!.trim()})),
    ...(d.multiple ? {multiple:{...d.multiple,quote:quote(d.multiple.quote)}} : {}),
    ...(d.visual ? {visual:{...d.visual,quote:quote(d.visual.quote)}} : {}),
  };
}
