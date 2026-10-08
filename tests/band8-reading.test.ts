import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { band8ReadingLessons, band8ReadingMocks } from '../server/data/band8/reading.js';
import { band8LessonSources } from '../server/data/band8/reading/lesson-sources.js';
import { band8MockSources } from '../server/data/band8/reading/mock-sources.js';
import { readingLessons, receptiveMocks } from '../server/data/receptive.js';
import { expandedReadingLessons, expandedReadingMocks } from '../server/data/expanded-reading.js';
import { gradeObjective } from '../server/learning.js';
import { contentStructureIssues, withinAnswerLimit } from '../shared/content-visuals.js';

const advanced = [...band8ReadingLessons,...band8ReadingMocks];
const oldReading = [...readingLessons,...receptiveMocks.filter(item=>item.skill==='reading'),...expandedReadingLessons,...expandedReadingMocks];
const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const words = (value: string) => value.trim().split(/\s+/u).filter(Boolean).length;
const shingles = (value: string) => {
  const tokens=normalize(value).split(' ');
  return new Set(tokens.slice(0,-4).map((_,index)=>tokens.slice(index,index+5).join(' ')));
};

test('band8 reading adds sixteen independent lessons and four complete mocks with disclosed estimates',()=>{
  assert.equal(band8ReadingLessons.length,16);
  assert.equal(band8ReadingMocks.length,4);
  assert.deepEqual(band8ReadingLessons.map(item=>item.band),[...Array(8).fill(7.5),...Array(8).fill(8)]);
  assert.deepEqual(band8ReadingMocks.map(item=>item.band),[7.5,7.5,8,8]);
  assert.equal(band8ReadingLessons.filter(item=>item.testType==='general').length,4);
  assert.equal(new Set(advanced.map(item=>item.id)).size,20);
  assert.ok(advanced.every(item=>item.id.startsWith('reading-v4-band8-')));
  assert.equal(advanced.reduce((total,item)=>total+item.questions.length,0),384);
  for (const item of advanced) {
    assert.equal(item.source,'ai'); assert.equal(item.quality,'ai-unreviewed'); assert.equal(item.cefr,'C1');
    assert.equal(item.review?.status,'unreviewed'); assert.ok(item.review?.limitations.length);
    assert.equal(item.estimatedDifficulty?.band,item.band); assert.ok(item.estimatedDifficulty?.basis);
    assert.ok(item.objectives?.length); assert.ok(item.errorTypes?.length);
    assert.deepEqual(contentStructureIssues(item),[],item.id);
  }
});

test('advanced reading workload uses original 750–950-word lessons and 2150–2750-word three-passage mocks',()=>{
  for (const item of band8ReadingLessons) {
    assert.equal(item.sections.length,1); assert.equal(item.questions.length,14);
    const length=words(item.sections[0]!.text);
    assert.ok(length>=750&&length<=950,`${item.id}: ${length} words`);
  }
  for (const item of band8ReadingMocks) {
    assert.equal(item.durationMinutes,60); assert.equal(item.sections.length,3); assert.equal(item.questions.length,40);
    assert.deepEqual(item.sections.map((_,index)=>item.questions.filter(question=>question.sectionIndex===index).length),[13,13,14]);
    for(const [index,section] of item.sections.entries()) {
      const blocks=section.questionBlocks??[];
      assert.equal(blocks.length,1,`${item.id}/${index}: mock must retain one contiguous completion group`);
      assert.equal(blocks[0]!.questionNumbers.length,index===2?4:3);
      assert.equal(new Set(item.questions.filter(question=>question.sectionIndex===index).map(question=>question.questionType)).size,4);
    }
    const length=item.sections.reduce((total,section)=>total+words(section.text),0);
    assert.ok(length>=2150&&length<=2750,`${item.id}: ${length} words`);
  }
});

test('every reading answer has a local exact evidence span, a complete rationale, and compatible word limit',()=>{
  for (const item of advanced) for (const question of item.questions) {
    const text=item.sections[question.sectionIndex]!.text;
    assert.ok(question.explanation.trim(),question.id); assert.ok(question.subskill,question.id);
    assert.ok(text.includes(question.evidence),`${question.id}: source span missing`);
    if (question.type==='text') {
      assert.ok(normalize(question.evidence).includes(normalize(question.answer)),`${question.id}: text key absent from quoted evidence`);
      assert.ok(withinAnswerLimit(question.answer,question.wordLimit,question.allowNumbers),question.id);
    }
    if(question.answer==='NOT GIVEN') assert.ok(question.explanation.length>25,`${question.id}: missing reason information is absent`);
  }
});

test('all 384 correctly keyed answers receive full objective credit including paired selection groups',()=>{
  for (const item of advanced) {
    const responses=Object.fromEntries(item.questions.map(question=>[question.id,question.type==='choice-multiple'
      ? JSON.stringify(item.questions.filter(row=>row.selectionGroup?.id===question.selectionGroup?.id).map(row=>row.answer))
      :question.answer]));
    const feedback=gradeObjective(item,responses);
    assert.equal(feedback.rawScore,item.questions.length,item.id);
    assert.equal(feedback.total,item.questions.length,item.id);
  }
});

test('advanced lessons cover each real reading task family including natural processes and multiple selections',()=>{
  const types=new Set<string | undefined>(advanced.flatMap(item=>item.questions.map(question=>question.questionType)));
  for(const required of ['multiple-choice','multiple-choice-multiple','true-false-not-given','yes-no-not-given','matching-headings','matching-information','matching-features','matching-sentence-endings','summary-completion','note-completion','table-completion','flow-chart-completion','sentence-completion','diagram-labelling','short-answer'])
    assert.ok(types.has(required),required);
  assert.ok(band8ReadingLessons.filter(item=>item.sections.some(section=>section.visuals?.length)).length>=3);
  const flows=band8ReadingLessons.flatMap(item=>item.sections.flatMap(section=>section.questionBlocks?.filter(block=>block.type==='flow-chart')??[]));
  assert.ok(flows.length>=2);
  assert.ok(flows.every(flow=>flow.rows?.length===3&&flow.questionNumbers.length===1));
});

test('advanced passages do not reuse old or newly generated passages or lengthy templates',()=>{
  const old=oldReading.flatMap(item=>item.sections.map(section=>({id:item.id,text:section.text,grams:shingles(section.text)})));
  const seenHashes=new Map<string,string>();
  for(const item of advanced) for(const section of item.sections) {
    const hash=createHash('sha256').update(normalize(section.text)).digest('hex');
    assert.equal(seenHashes.has(hash),false,`${item.id}: repeats ${seenHashes.get(hash)}`);
    seenHashes.set(hash,item.id);
    const current=shingles(section.text);
    for(const previous of old) {
      const [small,large]=current.size<previous.grams.size?[current,previous.grams]:[previous.grams,current];
      const overlap=[...small].filter(gram=>large.has(gram)).length/Math.max(1,small.size);
      assert.ok(overlap<=0.55,`${item.id}: excessive overlap with ${previous.id} (${overlap})`);
    }
    old.push({id:item.id,text:section.text,grams:current});
  }
});

test('source drafts retain five distinct paragraphs, exact extractable keys and explicit missing-information reasons',()=>{
  const sources=[...band8LessonSources,...band8MockSources.flat()];
  assert.equal(sources.length,28);
  assert.equal(new Set(sources.map(source=>source.title)).size,28);
  for(const source of sources) {
    assert.equal(source.paragraphs.length,5,source.title);
    assert.equal(source.headings.length,5,source.title);
    assert.equal(new Set([...source.headings,...source.distractorHeadings]).size,7,source.title);
    for(const row of [source.detail,source.completion,...(source.visual?[source.visual]:[])])
      assert.ok(normalize(row.quote).includes(normalize(row.answer)),`${source.title}: ${row.answer}`);
    for(const row of source.completionAnchors??[]) {
      assert.ok(source.paragraphs.some(paragraph=>paragraph.includes(row.quote)),`${source.title}: missing completion evidence`);
      assert.ok(normalize(row.quote).includes(normalize(row.answer)),`${source.title}: completion key missing`);
      assert.ok(words(row.answer)<=3,`${source.title}: completion key exceeds shared three-word limit`);
    }
    assert.ok(source.facts.notGiven.reason); assert.ok(source.views.notGiven.reason);
    assert.equal(source.multiple.answers.length,2); assert.equal(source.multiple.distractors.length,3);
    assert.ok(source.paragraphs.some(paragraph=>paragraph.includes(source.multiple.quote)),`${source.title}: paired-choice evidence crosses a paragraph boundary`);
  }
});
