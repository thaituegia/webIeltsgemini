import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ContentVisual } from "../client/ContentVisual";
import { buildListeningMock } from "../server/data/expanded-listening-mock-prose/build";
import { mock14Draft } from "../server/data/expanded-listening-mock-prose/mock-14";

test("actual snow-fence diagram preserves numbered blanks without inferring answer labels from path styling", () => {
  const mock = buildListeningMock(mock14Draft);
  const section = mock.sections[3];
  const visual = section.visuals![0];
  const questions = mock.questions.filter(question => question.visualId === visual.id);
  assert.equal(visual.type, "diagram");
  assert.ok("paths" in visual && visual.paths?.some(path => path.style === "road"), "Exercise the actual road-styled ground line that previously leaked the label");
  assert.equal(questions.find(question => question.number === 33)?.answer, "road");
  const markup = renderToStaticMarkup(createElement(ContentVisual, { visual }));
  for (const question of questions) {
    assert.match(markup, new RegExp(`Blank for question ${question.number}\\b`));
    const escaped = question.answer.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    assert.doesNotMatch(markup, new RegExp(`\\b${escaped}\\b`, "iu"), `Label ${question.number} must not reveal its answer in visible text or SVG accessibility metadata`);
  }
  assert.doesNotMatch(markup, /Map legend|Footpath|Arrows indicate the direction between stages/);
  assert.match(markup, /Schematic diagram with numbered labels/);
});

test("actual island map keeps its orientation and footpath legend", () => {
  const mock = buildListeningMock(mock14Draft);
  const visual = mock.sections[1].visuals![0];
  const markup = renderToStaticMarkup(createElement(ContentVisual, { visual }));
  assert.match(markup, /Map legend/);
  assert.match(markup, /Footpath/);
  assert.match(markup, /North is at the top of the map/);
});
