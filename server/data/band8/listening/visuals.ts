import type { SpatialVisual } from '../../../../shared/types.js';
import type { ListeningSource } from './source-types.js';

/** Schematic orientation, with landmarks and access distinctions stated in each
 * spoken source. The corner positions are intentional: all eight recordings
 * explicitly use them. Additional geometry expresses the actual setting. */
export function listeningOrientationVisual(source: ListeningSource, id: string, start: number, type: 'map' | 'plan'): SpatialVisual {
  const asset: SpatialVisual = {
    id, type, title: source.title, width: 640, height: 480,
    description: 'Schematic, not to scale. North is at the top; public access begins on the southern edge. Complete the four numbered facilities using the spoken directions.',
    areas: [
      { id: 'area-a', x: 45, y: 75, width: 210, height: 110, fill: '#e0f2fe' },
      { id: 'area-b', x: 385, y: 75, width: 210, height: 110, fill: '#dcfce7' },
      { id: 'area-c', x: 45, y: 285, width: 210, height: 115, fill: '#fef3c7' },
      { id: 'area-d', x: 385, y: 285, width: 210, height: 115, fill: '#fae8ff' },
    ],
    paths: [
      { id: 'main-route', points: [[320, 440], [320, 55]], style: 'path' },
      { id: 'cross-route', points: [[150, 235], [490, 235]], style: 'path' },
      { id: 'west-link', points: [[150, 130], [150, 340]], style: 'path' },
      { id: 'east-link', points: [[490, 130], [490, 340]], style: 'path' },
    ],
    labels: [
      { id: 'north', x: 320, y: 18, text: 'N ↑' },
      { id: 'entrance', x: 320, y: 465, text: 'Entrance' },
      { id: 'junction', x: 320, y: 258, text: 'Junction' },
      { id: 'a', x: 150, y: 120, questionNumber: start + 1 },
      { id: 'b', x: 490, y: 120, questionNumber: start + 2 },
      { id: 'c', x: 150, y: 335, questionNumber: start + 3 },
      { id: 'd', x: 490, y: 335, questionNumber: start + 4 },
    ],
  };
  const path = (localId: string, points: [number, number][], style: 'path' | 'road' | 'river' = 'path'): void => { asset.paths!.push({ id: localId, points, style }); };
  const label = (localId: string, x: number, y: number, text: string): void => { asset.labels.push({ id: localId, x, y, text }); };
  switch (source.title) {
    case 'Orientation to the restored tidal gardens':
      // The recording identifies deliveries from a lane behind the north wall.
      path('northern-lane', [[20, 38], [620, 38]], 'road');
      path('boundary-wall', [[20, 62], [620, 62]]);
      label('lane-caption', 155, 25, 'Delivery lane');
      label('wall-caption', 500, 60, 'Northern wall');
      asset.areas![3] = { id: 'area-d', x: 405, y: 290, width: 170, height: 110, fill: '#fae8ff' };
      // An enclosed structure rather than the open area of the early proposal.
      path('enclosure', [[405, 290], [575, 290], [575, 400], [405, 400], [405, 290]]);
      break;
    case 'Finding your way around a neighbourhood music festival':
      // A protected rehearsal enclosure and tool-handling boundary distinguish
      // this event from an unrestricted garden or park.
      path('closed-enclosure', [[50, 290], [250, 290], [250, 400], [50, 400], [50, 290]]);
      label('restricted-caption', 150, 385, 'No public entry');
      path('work-boundary', [[390, 300], [585, 300], [585, 400], [390, 400]]);
      label('tool-caption', 490, 385, 'Technicians handle tools');
      label('crossing-caption', 320, 218, 'Equipment crossing');
      break;
    case 'Tour of a reopened urban nature centre':
      // The outer trail is explicitly distinguished from the level central
      // paths. It is drawn as a perimeter route, not an accessible shortcut.
      path('outer-trail', [[25, 425], [25, 55], [610, 55], [610, 425]]);
      label('trail-caption', 480, 35, 'Optional outer trail');
      path('viewing-boundary', [[55, 88], [55, 175], [245, 175]]);
      label('viewing-caption', 155, 170, 'Viewing openings');
      asset.areas![3] = { id: 'area-d', x: 405, y: 295, width: 170, height: 85, fill: '#bfdbfe' };
      label('care-caption', 490, 395, 'No paddling');
      break;
    case 'Introduction to a cooperative community kitchen':
      // Internal corridors, controlled north-east access and street-facing
      // windows are features of this converted building, not open-air paths.
      path('outer-building', [[20, 65], [620, 65], [620, 440], [20, 440], [20, 65]]);
      path('controlled-door', [[400, 205], [455, 205]]);
      label('controlled-caption', 490, 170, 'Controlled access');
      path('south-windows', [[410, 430], [460, 430], [510, 430], [570, 430]]);
      label('window-caption', 490, 417, 'Street-facing windows');
      label('corridor-caption', 320, 330, 'Central corridor');
      break;
    case 'Welcome to the riverside boat-building fair':
      // The river is outside the north boundary, with the launch approach
      // aligned to the north-east facility and kept under supervision.
      path('river', [[0, 40], [160, 30], [350, 45], [640, 32]], 'river');
      label('river-caption', 175, 20, 'River: no public access');
      path('supervised-approach', [[490, 90], [490, 48]]);
      label('approach-caption', 490, 65, 'Supervised access');
      path('covered-workspace', [[70, 305], [150, 285], [235, 305], [235, 390], [70, 390], [70, 305]]);
      label('cloth-caption', 150, 380, 'Sheltered workspace');
      break;
    case 'Exploring a community reuse and repair hub':
      // Larger furniture movements need the clear main aisle; electrical
      // assessment is separated from supervised public textile activities.
      path('building-shell', [[25, 60], [610, 60], [610, 435], [25, 435], [25, 60]]);
      asset.areas![0] = { id: 'area-a', x: 45, y: 75, width: 240, height: 115, fill: '#e0f2fe' };
      path('technical-partition', [[385, 75], [385, 185], [595, 185]]);
      label('technical-caption', 490, 165, 'Trained technicians');
      label('trolley-caption', 320, 360, 'Keep aisle clear');
      label('public-caption', 150, 385, 'Supervised public activity');
      break;
    case 'Introduction to an open-air sculpture trail':
      // An open demonstration area, water surface and enclosed interpretation
      // facility are intentionally represented differently on this park map.
      asset.areas![0] = { id: 'area-a', x: 65, y: 95, width: 170, height: 70, fill: '#e7e5e4' };
      asset.areas![1] = { id: 'area-b', x: 410, y: 95, width: 165, height: 75, fill: '#bfdbfe' };
      path('water-edge', [[395, 110], [410, 88], [570, 88], [592, 122], [570, 175], [410, 175], [395, 110]]);
      path('hut-walls', [[55, 295], [245, 295], [245, 390], [55, 390], [55, 295]]);
      label('open-area-caption', 150, 180, 'Outdoor demonstration');
      label('access-material-caption', 150, 385, 'Guide collection');
      label('park-caption', 320, 58, 'Park route continues');
      break;
    case 'Welcome to a restored hilltop weather station':
      // Visitors are told about the low barrier at the north-west structure
      // and the steep staff track behind the station.
      path('service-track', [[20, 40], [180, 30], [375, 45], [620, 30]], 'road');
      label('track-caption', 465, 20, 'Steep track: staff only');
      path('low-barrier', [[45, 165], [255, 165], [255, 85]]);
      label('barrier-caption', 150, 185, 'Low barrier');
      label('handling-caption', 490, 180, 'Do not turn controls');
      break;
    default: throw new Error(`${source.title}: a source-specific orientation asset is required`);
  }
  return asset;
}

/** Every graph expands the narrated two numbered stages with its real inputs,
 * constraints or outputs. The numbered answers remain hidden. */
export function listeningProcessVisual(source: ListeningSource, id: string, start: number): SpatialVisual {
  const asset: SpatialVisual = {
    id, type: 'process', title: source.title, width: 760, height: 420,
    description: 'The numbered left and right stages are the two items named in the recording. Fixed nodes show the specific evidence, constraints or follow-up described around them.',
    labels: [], nodes: [
      { id: 'left', x: 175, y: 175, width: 170, height: 65, questionNumber: start + 9 },
      { id: 'right', x: 435, y: 175, width: 170, height: 65, questionNumber: start + 10 },
    ], connections: [{ from: 'left', to: 'right' }],
  };
  const node = (localId: string, text: string, x: number, y: number, width = 160): void => { asset.nodes!.push({ id: localId, text, x, y, width, height: 50 }); };
  const edge = (from: string, to: string, label?: string): void => { asset.connections!.push({ from, to, label }); };
  switch (source.title) {
    case 'Why urban flood defences need more than capacity':
      node('sensor', 'Drainage sensor', 10, 75); edge('sensor', 'left');
      node('threshold', 'Agreed threshold', 435, 50); edge('threshold', 'right', 'reached');
      node('team', 'Responsible team', 435, 320); edge('right', 'team');
      break;
    case 'Reading the history of a repaired ceramic object':
      node('damage', 'Observed damage', 15, 50); edge('damage', 'left');
      node('earlier', 'Earlier interventions', 15, 310); edge('earlier', 'left');
      node('purpose', 'Purpose and risk', 435, 40); edge('purpose', 'right');
      node('options', 'Possible actions', 580, 320); edge('right', 'options');
      break;
    case 'How seed banks preserve options without preserving everything':
      node('history', 'Collection history', 15, 55); edge('history', 'left');
      node('conditions', 'Assessment conditions', 430, 40); edge('conditions', 'right');
      node('later', 'Later assessments', 435, 320); edge('right', 'later'); edge('later', 'right', 'accumulate');
      break;
    case 'The hidden scheduling work in shared public spaces':
      node('times', 'Actual starts and ends', 5, 40, 185); edge('times', 'left');
      node('interruptions', 'Recorded interruptions', 5, 320, 185); edge('interruptions', 'left');
      node('priorities', 'Stated priorities', 420, 40); edge('priorities', 'right');
      node('consultation', 'Consultation', 595, 320); edge('consultation', 'right');
      break;
    case 'Designing darkness into urban lighting plans':
      node('fixtures', 'Existing fixtures', 10, 45); edge('fixtures', 'left');
      node('operation', 'Direction and hours', 10, 315); edge('operation', 'left');
      node('problems', 'Observed problems', 435, 40); edge('problems', 'right');
      node('adjust', 'Re-aim, dim or schedule', 565, 320, 185); edge('right', 'adjust');
      break;
    case 'Interpreting sound in shallow coastal waters':
      node('recording', 'Original recording', 15, 45); edge('recording', 'left');
      node('evidence', 'Evidence and alternatives', 405, 40, 190); edge('evidence', 'right');
      node('revisit', 'Revisit uncertain cases', 555, 320, 190); edge('right', 'revisit'); edge('revisit', 'left', 're-examine');
      break;
    case 'Using historical maps without taking them literally':
      node('old', 'Historical sheet', 5, 45); edge('old', 'left');
      node('reference', 'Reference system', 5, 315); edge('reference', 'left');
      node('fit', 'Inspect local alignment', 555, 315, 190); edge('right', 'fit');
      break;
    case 'When waste heat can support greenhouse production':
      node('source', 'Measured source conditions', 5, 45, 195); edge('source', 'left');
      node('needs', 'Greenhouse needs', 435, 40); edge('needs', 'right');
      node('cases', 'Check insufficient hours', 555, 310, 195); edge('right', 'cases');
      node('backup', 'Backup response', 245, 340); edge('cases', 'backup');
      break;
    default: throw new Error(`${source.title}: a source-specific process graph is required`);
  }
  return asset;
}
