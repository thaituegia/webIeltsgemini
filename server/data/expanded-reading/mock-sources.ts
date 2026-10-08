import { compact } from './compact.js';
import { mock01Drafts } from './mock-prose/mock-01.js';
import { mock02Drafts } from './mock-prose/mock-02.js';
import { mock03Drafts } from './mock-prose/mock-03.js';
import { mock04Drafts } from './mock-prose/mock-04.js';
import { mock05Drafts } from './mock-prose/mock-05.js';
import { mock06Drafts } from './mock-prose/mock-06.js';
import { mock07Drafts } from './mock-prose/mock-07.js';
import { mock08Drafts } from './mock-prose/mock-08.js';
import { mock09Drafts } from './mock-prose/mock-09.js';
import { mock10Drafts } from './mock-prose/mock-10.js';
import { mock11Drafts } from './mock-prose/mock-11.js';
import { mock12Drafts } from './mock-prose/mock-12.js';
import { mock13Drafts } from './mock-prose/mock-13.js';
import { mock14Drafts } from './mock-prose/mock-14.js';
import { mock15Drafts } from './mock-prose/mock-15.js';
import { mock16Drafts } from './mock-prose/mock-16.js';

// Ordered sets alternate Academic and General Training. Every set contains
// three separately authored fictional texts; no practice lesson is reused.
const sets = [mock01Drafts, mock02Drafts, mock03Drafts, mock04Drafts,
  mock05Drafts, mock06Drafts, mock07Drafts, mock08Drafts,
  mock09Drafts, mock10Drafts, mock11Drafts, mock12Drafts,
  mock13Drafts, mock14Drafts, mock15Drafts, mock16Drafts];
if (sets.length !== 16 || sets.some(set => set.length !== 3)) {
  throw new Error('The original Reading mock bank requires sixteen sets of three independent texts.');
}
export const expandedReadingMockSources = sets.flatMap(set => set.map(compact));
