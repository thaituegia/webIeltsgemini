import type { ReadingSource } from './model.js';

/** Ordered steps authored against the actual procedures, not generic decorations. */
const flows:Record<string,NonNullable<ReadingSource['flow']>>={
 'Waiting without standing in line':{title:'A clinic visitor using a number card',steps:['Take a numbered card and sit in the waiting room.','Go to reception when the number appears on the screen.','Used cards go into the ________.'],answer:'return tray',quote:'Used cards go into the return tray.'},
 'A token for the washing machine':{title:'Returning tokens when leaving the building',steps:['Take unused tokens to the office.','The office checks the tokens in a ________.','The office gives the money back.'],answer:'counting tray',quote:'The office gives the money back after checking the tokens in a counting tray.'},
 'Choosing a smaller vegetable box':{title:'From order to home storage',steps:['Choose a box size before Thursday.','The farm packs the box on Friday and delivers it on Saturday.','Put vegetables that need to stay cool in the ________.'],answer:'fridge',quote:'Vegetables that need to stay cool should be put in the fridge.'},
 'Keeping a suitcase after checkout':{title:'Returning a stored bag to its owner',steps:['The guest presents the numbered label.','Staff compare the bag number with the guest label.','The removed label is placed in the ________.'],answer:'paper bin',quote:'Labels removed from collected bags are placed in the paper bin.'},
 'Reading the village rain gauge':{title:'A daily rainfall reading',steps:['Read the gauge scale in ________.','Write the date beside the number.','Empty the tube before the next daily reading.'],answer:'millimetres',quote:'Pupils read the scale in millimetres and write the date beside the number.'},
 'The pantry where everyone chooses':{title:'Choosing pantry items',steps:['Use a basket and the household card.','Select the allowed number of suitable items.','Return the empty basket beside the ________.'],answer:'welcome table',quote:'Empty baskets go back beside the welcome table.'},
 'Booking a slot at the repair café':{title:'Visiting the repair café',steps:['Book a slot and describe the problem.','Bring the item and stay present during the repair attempt.','Write comments on a card beside the ________.'],answer:'booking desk',quote:'Visitors write their comments on a card beside the booking desk.'},
 'Choosing a sowing date from a seed-bank record':{title:'Testing a seed collection',steps:['Put seeds in damp sand and keep them cool for the stated period.','Move the covered tray to a warmer bench and count seedlings.','Return seeds not needed for the test to a labelled ________.'],answer:'storage jar',quote:'Seeds not needed for the test return to a labelled storage jar, with their remaining quantity recorded so later users know how much is available.'},
 'A makerspace keeps unknown materials apart':{title:'Checking an unlabelled donation',steps:['Notice that the donated sheet has no identifying label.','Place the sheet in the ________.','Ask the donor for packaging or a purchase record.'],answer:'holding rack',quote:'An unlabelled sheet goes into the holding rack.'},
};

export function withReadingFlow(source:ReadingSource):ReadingSource {
 const flow=flows[source.title];
 if(!flow)return source;
 const text=source.paragraphs.join('\n\n');
 if(!text.includes(flow.quote))throw new Error(`${source.title}: flow anchor is not a source quote`);
 return {...source,flow};
}
