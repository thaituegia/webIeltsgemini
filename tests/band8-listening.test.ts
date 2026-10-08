import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { band8ListeningLessons, band8ListeningMocks } from '../server/data/band8/listening.js';
import { contentBank } from '../server/data/index.js';
import { gradeObjective } from '../server/learning.js';
import { contentStructureIssues, withinAnswerLimit } from '../shared/content-visuals.js';
import type { StoredContent } from '../shared/types.js';
import { visualSignature } from '../scripts/audit-band8.js';

const bank = [...band8ListeningLessons, ...band8ListeningMocks];
const spoken = (section: StoredContent['sections'][number]): string => section.dialogue!.map(line => line.text).join(' ');
const countWords = (value: string): number => value.trim().split(/\s+/u).filter(Boolean).length;
const signature = (value: string): string => createHash('sha256').update(value.toLowerCase().replace(/\s+/gu, ' ').trim()).digest('hex');

test('advanced Listening adds two target levels and four Parts with a separate ID namespace', () => {
  assert.equal(band8ListeningLessons.length, 16);
  assert.equal(band8ListeningMocks.length, 4);
  assert.equal(bank.reduce((sum, item) => sum + item.questions.length, 0), 352);
  assert.equal(new Set(bank.map(item => item.id)).size, 20);
  for (const band of [7.5, 8]) {
    assert.equal(band8ListeningLessons.filter(item => item.band === band).length, 8);
    assert.equal(band8ListeningMocks.filter(item => item.band === band).length, 2);
    for (const part of [1, 2, 3, 4]) assert.equal(band8ListeningLessons.filter(item => item.band === band && item.tags.includes(`part-${part}`)).length, 2);
  }
  assert.ok(bank.every(item => item.id.startsWith('listening-v4-band8-') && item.source === 'ai' && item.quality === 'ai-unreviewed' && item.cefr === 'C1'));
  assert.ok(bank.every(item => item.estimatedDifficulty?.band === item.band && item.review?.limitations.some(limit => limit.includes('chưa hiệu chuẩn'))));
});

test('advanced scripts are independent of lessons, other mocks and the prior Listening bank', () => {
  const original = contentBank.filter(item => item.skill === 'listening' && !item.id.startsWith('listening-v4-band8-'));
  const oldSignatures = new Set(original.flatMap(item => item.sections.map(section => signature(section.dialogue ? spoken(section) : section.text))));
  const added = bank.flatMap(item => item.sections.map(section => signature(spoken(section))));
  assert.equal(added.length, 32);
  assert.equal(new Set(added).size, 32);
  assert.ok(added.every(value => !oldSignatures.has(value)));
});

test('every advanced mock has four authentic speaker settings, thirty minutes and forty answers', () => {
  for (const mock of band8ListeningMocks) {
    assert.equal(mock.durationMinutes, 30);
    assert.equal(mock.sections.length, 4);
    assert.equal(mock.questions.length, 40);
    mock.sections.forEach((section, index) => {
      assert.match(section.title, new RegExp(`^Part ${index + 1}:`));
      const speakers = new Set(section.dialogue!.map(line => line.speaker));
      assert.ok(index === 1 || index === 3 ? speakers.size === 1 : speakers.size >= 2);
      assert.equal(mock.questions.filter(question => question.sectionIndex === index).length, 10);
    });
  }
  for (const item of bank) for (const section of item.sections) {
    const words = countWords(spoken(section));
    assert.ok(words >= 650 && words <= 850, `${section.id}: ${words} actual spoken words`);
  }
});

test('all keys have chronological verbatim evidence and obey declared word limits', () => {
  for (const item of bank) {
    assert.deepEqual(contentStructureIssues(item), [], item.id);
    for (const [sectionIndex, section] of item.sections.entries()) {
      let previous = -1;
      for (const question of item.questions.filter(row => row.sectionIndex === sectionIndex)) {
        const location = spoken(section).indexOf(question.evidence);
        assert.ok(location >= previous && location >= 0, question.id);
        previous = location;
        if (question.type === 'text') {
          assert.ok(question.evidence.toLowerCase().includes(question.answer.toLowerCase()), `${question.id}: keyed text is not spoken in evidence`);
          assert.ok(withinAnswerLimit(question.answer, question.wordLimit, question.allowNumbers), question.id);
          assert.ok(question.acceptedAnswers?.every(answer => withinAnswerLimit(answer, question.wordLimit, question.allowNumbers)));
        }
      }
    }
  }
});

test('maps, plans, diagrams and completion layouts are public-safe and cover the intended tasks', () => {
  const types = new Set(bank.flatMap(item => item.questions.map(question => question.questionType)));
  for (const type of ['map-labelling', 'plan-labelling', 'diagram-labelling', 'matching', 'multiple-choice', 'multiple-choice-multiple', 'form-completion', 'note-completion', 'table-completion', 'sentence-completion', 'summary-completion']) assert.ok(types.has(type as never), type);
  const assets = bank.flatMap(item => item.sections.flatMap(section => section.visuals ?? []));
  assert.equal(assets.length, 16);
  assert.equal(assets.filter(asset => asset.type === 'map' || asset.type === 'plan').length, 8);
  assert.equal(assets.filter(asset => asset.type === 'process').length, 8);
  const priorVisuals = new Set(contentBank.filter(item => !item.id.startsWith('listening-v4-band8-')).flatMap(item => item.sections.flatMap(section => section.visuals ?? [])).map(visualSignature));
  const signatures = assets.map(visualSignature);
  // Renamed blank boxes are still copies: fingerprints intentionally ignore
  // IDs, titles, colours and question numbers, while retaining real topology.
  assert.equal(new Set(signatures).size, 16);
  assert.ok(signatures.every(signature => !priorVisuals.has(signature)));
  for (const item of bank) for (const section of item.sections) for (const asset of section.visuals ?? []) {
    assert.ok('labels' in asset);
    if (!('labels' in asset)) continue;
    for (const label of [...asset.labels, ...(asset.nodes ?? [])]) if (label.questionNumber !== undefined) assert.equal(label.text, undefined);
    if (asset.type === 'map' || asset.type === 'plan') {
      assert.match(spoken(section), /north(?: is)? at the top/iu);
      const numbered = asset.labels.filter(label => label.questionNumber !== undefined).sort((a, b) => a.questionNumber! - b.questionNumber!);
      assert.equal(numbered.length, 4);
      assert.ok(numbered[0]!.x < asset.width / 2 && numbered[0]!.y < asset.height / 2);
      assert.ok(numbered[1]!.x > asset.width / 2 && numbered[1]!.y < asset.height / 2);
      assert.ok(numbered[2]!.x < asset.width / 2 && numbered[2]!.y > asset.height / 2);
      assert.ok(numbered[3]!.x > asset.width / 2 && numbered[3]!.y > asset.height / 2);
    }
  }
});

test('all advanced keys score correctly, grouped selections are order independent and empty submissions earn zero', () => {
  for (const item of bank) {
    const responses = Object.fromEntries(item.questions.map(question => [question.id, question.selectionGroup
      ? JSON.stringify(item.questions.filter(row => row.selectionGroup?.id === question.selectionGroup!.id).map(row => row.answer).reverse())
      : question.answer]));
    const correct = gradeObjective(item, responses);
    assert.equal(correct.rawScore, item.questions.length, item.id);
    assert.equal(correct.total, item.questions.length);
    assert.equal(gradeObjective(item, {}).rawScore, 0);
    if (item.format === 'full-mock') assert.equal(correct.estimatedBand, 9);
  }
});

test('booking corrections distinguish final arrangements from discarded dates, fees and venues', () => {
  const repair = band8ListeningLessons[0]!;
  assert.equal(gradeObjective(repair, { [repair.questions[2]!.id]: 'Tuesday' }).rawScore, 0);
  assert.equal(gradeObjective(repair, { [repair.questions[2]!.id]: 'Thursday' }).rawScore, 1);
  assert.equal(gradeObjective(repair, { [repair.questions[5]!.id]: '35' }).rawScore, 0);
  const theatre = band8ListeningLessons[2]!;
  assert.equal(gradeObjective(theatre, { [theatre.questions[6]!.id]: '7:00 pm' }).rawScore, 1);
  assert.equal(gradeObjective(theatre, { [theatre.questions[6]!.id]: '18:30' }).rawScore, 0);
});
