import type { AdvancedSource } from './model.js';

export type SourceDraft = Omit<AdvancedSource, 'facts' | 'views'> & {
  trueFact: [statement: string, quote: string];
  falseFact: [statement: string, quote: string];
  absentFact: [statement: string, anchor: string, reason: string];
  authorView: [affirmation: string, contradiction: string, quote: string];
  absentView: [statement: string, anchor: string, reason: string];
};

export function source(draft: SourceDraft): AdvancedSource {
  const {trueFact,falseFact,absentFact,authorView,absentView,...rest}=draft;
  return {...rest,facts:{
    true:{statement:trueFact[0],quote:trueFact[1]},false:{statement:falseFact[0],quote:falseFact[1]},
    notGiven:{statement:absentFact[0],anchor:absentFact[1],reason:absentFact[2]},
  },views:{
    yes:{statement:authorView[0],quote:authorView[2]},no:{statement:authorView[1],quote:authorView[2]},
    notGiven:{statement:absentView[0],anchor:absentView[1],reason:absentView[2]},
  }};
}
