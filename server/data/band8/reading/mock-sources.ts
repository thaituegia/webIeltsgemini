import type { AdvancedSource } from './model.js';
import { mocksA } from './mock-a.js';
import { mocksB } from './mock-b.js';
import { mocksC } from './mock-c.js';
import { mocksD } from './mock-d.js';

type ExtraAnchors = [detailStem: string, personStem: string, fourth: { stem: string; answer: string; quote: string }];
function withAnchors(sources: AdvancedSource[], extra: ExtraAnchors[]): AdvancedSource[] {
  return sources.map((item,index) => ({...item, completionAnchors: [
    item.completion,
    {stem:extra[index]![0],answer:item.detail.answer,quote:item.detail.quote},
    {stem:extra[index]![1],answer:item.feature.answer,quote:item.feature.quote},
    extra[index]![2],
  ]}));
}

export const band8MockSources: AdvancedSource[][] = [
withAnchors(mocksA,[
  ['A ________ helped investigate the effects of moving soil.','Living threads at the boundary were mapped by ________.',
    {stem:'The researchers recorded ________ near each sampling point.',answer:'moisture',quote:'They also recorded moisture close to each sampling point rather than assuming that equal watering produced equal local conditions.'}],
  ['Station staff entered the size of corrections in a ________.','Clocks with two minute hands were examined by ________.',
    {stem:'Some clocks displayed ________ while local and railway times coexisted.',answer:'two minute hands',quote:'Notices explained both systems, and several clocks displayed two minute hands.'}],
  ['When permission evidence survived, the archive retained a ________.','Revised access arrangements were discussed with speakers by ________.',
    {stem:'If a producer\'s ________ survived, its description was linked to the recording.',answer:'edit sheet',quote:'Where a producer\'s edit sheet survived, its description was linked to the relevant recording, but gaps in that documentation were marked rather than filled with plausible guesses.'}],
]),
withAnchors(mocksB,[
  ['Large particles were removed by a ________ before water entered the test chamber.','Follow-up sampling locations were selected by ________.',
    {stem:'The researchers recorded ________ alongside electrical measurements.',answer:'water temperature',quote:'The researchers therefore recorded water temperature alongside the electrical measurements and replaced cultures according to a documented schedule.'}],
  ['Candidate fillers were first tried on a ________.','Evidence for missing painted details was reviewed by ________.',
    {stem:'Images showing the treatment were kept with a ________.',answer:'material record',quote:'It also photographed the treatment under several lighting angles and retained the images with a material record.'}],
  ['Participants described the display in their own words during a ________.','The follow-up interviews were conducted by ________.',
    {stem:'The first briefing gave a ________ without a range.',answer:'central estimate',quote:'The first gave a central estimate alone.'}],
]),
withAnchors(mocksC,[
  ['A ________ helped identify the conditions associated with moisture.','Participants putting on the sleeve were observed by ________.',
    {stem:'Across the elbow, the prototype included a ________.',answer:'strain strip',quote:'The prototype sleeve included a strain strip across the elbow and a second strip positioned where joint movement produced little stretch.'}],
  ['The fragment\'s position and sediment were described in a ________.','The environmental radiation estimate was prepared by ________.',
    {stem:'Calculations considered the sediment and its ________, not only the ceramic.',answer:'moisture history',quote:'This required information about the sediment and its moisture history, not just the ceramic itself.'}],
  ['The recorders were checked using a ________ played at set distances.','Recognition errors were reviewed by ________.',
    {stem:'Files needed review because a call could be confused with the ________ of a branch.',answer:'creak',quote:'A model trained on clear examples sometimes confused a target call with the creak of a branch or an overlapping call from another species.'}],
]),
withAnchors(mocksD,[
  ['Spaces around the blocks were packed with ________.','The commercial contract clauses were compared by ________.',
    {stem:'The quantity unloaded and its condition appeared in a ________.',answer:'destination record',quote:'A loading ledger recorded the initial estimates, while a destination record described the amount unloaded and its condition.'}],
  ['Charges and parts availability were explained on a ________.','Explanations of guarantees were tested by ________.',
    {stem:'Workshops separated the ________ from an indicative repair estimate.',answer:'diagnostic fee',quote:'Participating workshops separated a diagnostic fee from an indicative repair estimate.'}],
  ['Staff carried temperature instruments along a fixed route called a ________.','The timing of route observations was checked by ________.',
    {stem:'The route measurements were accompanied by a ________ before maps were compared.',answer:'time record',quote:'The analysis therefore kept a time record beside the route measurements, making the difference in observation procedures visible before comparing the resulting maps.'}],
]),
];
