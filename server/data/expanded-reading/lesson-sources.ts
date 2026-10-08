import { foundationOne } from './foundation-1.js';
import { foundationTwo } from './foundation-2.js';
import { foundationThree } from './foundation-3.js';
import { foundationFour } from './foundation-4.js';
import { foundationFive } from './foundation-5.js';
import { foundationSix } from './foundation-6.js';
import { foundationSeven } from './foundation-7.js';
import { foundationEight } from './foundation-8.js';
import { intermediateOne } from './intermediate-1.js';
import { intermediateTwo } from './intermediate-2.js';
import { intermediateThree } from './intermediate-3.js';
import { intermediateFour } from './intermediate-4.js';
import { intermediateFive } from './intermediate-5.js';
import { intermediateSix } from './intermediate-6.js';
import { intermediateSeven } from './intermediate-7.js';
import { intermediateEight } from './intermediate-8.js';
import { upperIntermediate1 } from './upper-intermediate-1.js';
import { upperIntermediate2 } from './upper-intermediate-2.js';
import { upperIntermediate3 } from './upper-intermediate-3.js';
import { upperIntermediate4 } from './upper-intermediate-4.js';
import { upperIntermediate5 } from './upper-intermediate-5.js';
import { upperIntermediate6 } from './upper-intermediate-6.js';
import { upperIntermediate7 } from './upper-intermediate-7.js';
import { upperIntermediate8 } from './upper-intermediate-8.js';
import { advancedOne } from './advanced-1.js';
import { advancedTwo } from './advanced-2.js';
import { advancedThree } from './advanced-3.js';
import { advancedFour } from './advanced-4.js';
import { advancedFive } from './advanced-5.js';
import { advancedSix } from './advanced-6.js';
import { advancedSeven } from './advanced-7.js';
import { advancedEight } from './advanced-8.js';
import { withReadingFlow } from './flows.js';
export const expandedReadingLessonSources=[...foundationOne,...foundationTwo,...foundationThree,...foundationFour,...foundationFive,...foundationSix,...foundationSeven,...foundationEight,
 ...intermediateOne,...intermediateTwo,...intermediateThree,...intermediateFour,...intermediateFive,...intermediateSix,...intermediateSeven,...intermediateEight,
 ...upperIntermediate1,...upperIntermediate2,...upperIntermediate3,...upperIntermediate4,...upperIntermediate5,...upperIntermediate6,...upperIntermediate7,...upperIntermediate8,
 ...advancedOne,...advancedTwo,...advancedThree,...advancedFour,...advancedFive,...advancedSix,...advancedSeven,...advancedEight].map(withReadingFlow);
