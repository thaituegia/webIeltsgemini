import type { Cefr, SpatialVisual } from '../../../shared/types.js';

/** Independently written fictional source texts, not reports of real research. */
export interface ReadingSource {
  title: string;
  topic: string;
  level: Cefr;
  paragraphs: string[];
  headings: string[];
  distractorHeadings: string[];
  detail: { prompt: string; answer: string; quote: string };
  trueStatement: { statement: string; quote: string };
  falseStatement: { statement: string; quote: string };
  notGiven: { statement: string; anchor: string; reason: string };
  authorYes: { statement: string; quote: string };
  authorNo: { statement: string; quote: string };
  authorNotGiven: { statement: string; anchor: string; reason: string };
  information: { prompt: string; paragraph: number; quote: string };
  features: { prompt: string; answer: string; options: string[]; quote: string };
  ending: { stem: string; answer: string; distractors: string[]; quote: string };
  completion: { stem: string; answer: string; quote: string; label: string };
  multiple?: { prompt: string; answers: [string,string]; distractors: [string,string,string]; quote: string };
  visual?: { asset: SpatialVisual; prompt: string; answer: string; quote: string };
  completionAnchors?: {stem:string;answer:string;quote:string;label:string}[];
  featureAnchors?: {name:string;role:string;quote:string}[];
  paragraphInfoAnchors?: {paragraph:number;quote:string}[];
  flow?: {title:string;steps:string[];answer:string;quote:string};
}
