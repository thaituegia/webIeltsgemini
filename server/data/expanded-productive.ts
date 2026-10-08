import type { Cefr, ChartVisual, ContentSection, SpatialVisual, StoredContent, VisualAsset } from "../../shared/types.js";
import { newSpeakingPacks, newSpeakingMockPacks } from "./productive-v3/speaking-packs.js";

const generatedAt = "2026-10-08T00:00:00.000Z";
const reportingInstruction = "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.";
const writingInstruction = (task: 1 | 2) => task === 1
  ? "You should spend about 20 minutes on this task. Write at least 150 words."
  : "You should spend about 40 minutes on this task. Write at least 250 words. Give reasons for your answer and include any relevant examples from your own knowledge or experience.";

function base(id: string, skill: "writing" | "speaking", topic: string, index: number): Omit<StoredContent, "sections" | "title" | "description"> {
  const band = [5.5, 6.5, 7.5][index % 3];
  const cefr = (["B1", "B2", "C1"] as Cefr[])[index % 3];
  return {
    id, skill, topic, band, cefr, testType: "both", durationMinutes: skill === "speaking" ? 14 : 20,
    format: "lesson", questions: [], vocabularyIds: [], source: "ai", quality: "ai-unreviewed",
    tags: ["ai-original", "expansion-v3"], createdAt: generatedAt,
    estimatedDifficulty: { band, cefr, basis: "Estimated practice level from topic abstraction, information density and language demands; not an empirically calibrated IELTS score." },
    provenance: { method: "ai-assisted", version: "productive-v3", sourceDocument: "Tong_hop_cac_dang_bai_IELTS.docx", generatedAt },
    review: { status: "unreviewed", checks: [], limitations: ["AI-authored original practice material; not official IELTS content or examiner-reviewed calibration."] },
  };
}

type VisualTask = { topic: string; title: string; family: "line" | "bar" | "pie" | "table" | "map" | "process" | "mixed"; prompt: string; visuals: VisualAsset[] };
function chart(id: string, type: ChartVisual["type"], title: string, unit: string, series: string[], rows: [string, ...number[]][], xLabel?: string): ChartVisual {
  return { id, type, title, unit, series, rows: rows.map(([label, ...values]) => ({ label, values })), ...(xLabel ? { xLabel } : {}) };
}
function map(id: string, title: string, places: [string, number, number][], paths: SpatialVisual["paths"] = []): SpatialVisual {
  const areas: NonNullable<SpatialVisual["areas"]> = places.flatMap(([text, x, y], i) => {
    if (/^(North|Boundary|Entrance|Access road)/i.test(text)) return [];
    const pier = /pier/i.test(text), green = !/car park/i.test(text) && /garden|park|field|pitch/i.test(text);
    const width = pier ? 28 : green ? 200 : 175;
    const height = pier ? (/extended/i.test(text) ? 92 : 68) : green ? 92 : 66;
    return [{ id: `${id}-area-${i + 1}`, x: Math.max(15, Math.min(745 - width, x - width / 2)),
      y: Math.max(15, Math.min(445 - height, y - height / 2)), width, height,
      fill: pier ? "#ddc6a0" : green ? "#dbeacb" : /car park/i.test(text) ? "#e0e3e6" : "#e8dfd1" }];
  });
  return { id, type: "map", title, width: 760, height: 460, areas,
    labels: places.map(([text, x, y], i) => ({ id: `${id}-label-${i + 1}`, text, x, y })), paths };
}
function process(id: string, title: string, stages: string[], cycle = false): SpatialVisual {
  const nodes = stages.map((text, i) => ({ id: `${id}-step-${i + 1}`, text, x: 25 + (i % 3) * 250, y: 35 + Math.floor(i / 3) * 135, width: 205, height: 86 }));
  return { id, type: "process", title, width: 760, height: Math.ceil(stages.length / 3) * 135 + 35, labels: [], nodes,
    connections: nodes.slice(1).map((node, i) => ({ from: nodes[i].id, to: node.id })).concat(cycle ? [{ from: nodes[nodes.length - 1].id, to: nodes[0].id }] : []) };
}

const visualTasks: VisualTask[] = [
  {
    topic: "Water resources", title: "Seasonal reservoir storage", family: "line",
    prompt: "The line graph shows the volume of water stored in two reservoirs at the start of each month from January to June in a particular year. " + reportingInstruction,
    visuals: [chart("w3-line-1", "line", "Water stored in North and South reservoirs", "million cubic metres", ["North reservoir", "South reservoir"], [["January", 48, 35], ["February", 52, 38], ["March", 59, 41], ["April", 55, 44], ["May", 43, 39], ["June", 31, 34]], "Month")],
  },
  {
    topic: "Agriculture", title: "Fruit exports over a decade", family: "line",
    prompt: "The line graph compares the quantities of apples, pears and cherries exported by a country between 2014 and 2024. " + reportingInstruction,
    visuals: [chart("w3-line-2", "line", "Annual fruit exports", "thousand tonnes", ["Apples", "Pears", "Cherries"], [["2014", 92, 54, 12], ["2016", 88, 58, 17], ["2018", 101, 56, 24], ["2020", 97, 47, 28], ["2022", 114, 51, 36], ["2024", 121, 49, 43]], "Year")],
  },
  {
    topic: "Connectivity", title: "Internet access beyond the city", family: "line",
    prompt: "The graph shows the percentage of households with a fixed broadband connection in urban and rural areas of a country from 2008 to 2023. " + reportingInstruction,
    visuals: [chart("w3-line-3", "line", "Households with fixed broadband", "% of households", ["Urban", "Rural"], [["2008", 61, 22], ["2011", 73, 35], ["2014", 82, 51], ["2017", 88, 69], ["2020", 92, 81], ["2023", 95, 90]], "Year")],
  },
  {
    topic: "Energy", title: "Changing sources of electricity", family: "line",
    prompt: "The line graph gives the amount of electricity generated from gas, wind and solar power in a region between 2010 and 2025. " + reportingInstruction,
    visuals: [chart("w3-line-4", "line", "Electricity generated in the region", "terawatt-hours per year", ["Gas", "Wind", "Solar"], [["2010", 45, 5, 1], ["2013", 49, 8, 3], ["2016", 46, 14, 7], ["2019", 40, 22, 12], ["2022", 34, 29, 20], ["2025", 30, 37, 28]], "Year")],
  },
  {
    topic: "Public services", title: "Residents' satisfaction with local services", family: "bar",
    prompt: "The bar chart shows the proportions of residents who were satisfied with three public services in four districts in 2025. Each service was assessed separately. " + reportingInstruction,
    visuals: [chart("w3-bar-1", "bar", "Residents satisfied with each service", "% of survey respondents", ["Waste collection", "Street lighting", "Bus service"], [["Central", 84, 78, 72], ["Riverside", 76, 81, 54], ["Hillview", 91, 69, 43], ["Westgate", 79, 74, 66]], "District")],
  },
  {
    topic: "Rail travel", title: "Why passengers choose the train", family: "bar",
    prompt: "The chart compares the main reasons given by train passengers for choosing rail travel on weekdays and at weekends. Each respondent selected one main reason. " + reportingInstruction,
    visuals: [chart("w3-bar-2", "bar", "Main reason for choosing rail travel", "% of passengers in each group", ["Weekday passengers", "Weekend passengers"], [["Cost", 18, 27], ["Journey time", 34, 16], ["Convenience", 29, 22], ["Environmental concern", 11, 15], ["Comfort", 8, 20]], "Main reason")],
  },
  {
    topic: "Domestic work", title: "Time spent on unpaid activities", family: "bar",
    prompt: "The bar chart compares the average weekly time spent by men and women on four unpaid activities in a country in 2024. " + reportingInstruction,
    visuals: [chart("w3-bar-3", "bar", "Average weekly unpaid work", "hours per person per week", ["Men", "Women"], [["Cooking and cleaning", 7.5, 13.2], ["Childcare", 5.8, 9.4], ["Caring for adults", 1.7, 2.8], ["Home maintenance", 3.6, 1.4]], "Activity")],
  },
  {
    topic: "Buildings", title: "Heating demand in different buildings", family: "bar",
    prompt: "The bar chart compares annual heating energy use per square metre in four types of building in 2010 and 2025. " + reportingInstruction,
    visuals: [chart("w3-bar-4", "bar", "Annual heating energy intensity", "kilowatt-hours per square metre", ["2010", "2025"], [["Detached houses", 185, 128], ["Apartments", 142, 96], ["Offices", 161, 108], ["Schools", 173, 112]], "Building type")],
  },
  {
    topic: "Household spending", title: "A changing household budget", family: "pie",
    prompt: "The pie charts show how households in a city allocated their total expenditure in 2005 and 2025. " + reportingInstruction,
    visuals: [chart("w3-pie-1a", "pie", "Household expenditure, 2005", "% of total expenditure", ["Share"], [["Housing", 28], ["Food", 24], ["Transport", 16], ["Health and education", 10], ["Leisure", 12], ["Other", 10]]), chart("w3-pie-1b", "pie", "Household expenditure, 2025", "% of total expenditure", ["Share"], [["Housing", 37], ["Food", 17], ["Transport", 13], ["Health and education", 15], ["Leisure", 11], ["Other", 7]])],
  },
  {
    topic: "Textile recycling", title: "What happens to collected textiles?", family: "pie",
    prompt: "The pie charts show the destinations of used textiles collected by a recycling organisation in 2015 and 2025. " + reportingInstruction,
    visuals: [chart("w3-pie-2a", "pie", "Destinations of collected textiles, 2015", "% of collected textile weight", ["Share"], [["Local reuse", 22], ["Overseas reuse", 38], ["Fibre recycling", 18], ["Industrial cloths", 12], ["Disposal", 10]]), chart("w3-pie-2b", "pie", "Destinations of collected textiles, 2025", "% of collected textile weight", ["Share"], [["Local reuse", 31], ["Overseas reuse", 24], ["Fibre recycling", 29], ["Industrial cloths", 11], ["Disposal", 5]])],
  },
  {
    topic: "Cultural tourism", title: "Where gallery visitors come from", family: "pie",
    prompt: "The pie charts compare the places of residence of visitors to an art gallery in two different years. " + reportingInstruction,
    visuals: [chart("w3-pie-3a", "pie", "Gallery visitors, 2012", "% of visitors", ["Share"], [["Within the city", 46], ["Elsewhere in the region", 29], ["Rest of the country", 18], ["Overseas", 7]]), chart("w3-pie-3b", "pie", "Gallery visitors, 2024", "% of visitors", ["Share"], [["Within the city", 32], ["Elsewhere in the region", 24], ["Rest of the country", 27], ["Overseas", 17]])],
  },
  {
    topic: "Urban water", title: "Water consumption by sector", family: "pie",
    prompt: "The pie charts show the proportions of a city's total water consumption accounted for by four sectors in 2000 and 2025. " + reportingInstruction,
    visuals: [chart("w3-pie-4a", "pie", "Water consumption, 2000", "% of total water consumption", ["Share"], [["Households", 42], ["Industry", 35], ["Commercial premises", 15], ["Public facilities", 8]]), chart("w3-pie-4b", "pie", "Water consumption, 2025", "% of total water consumption", ["Share"], [["Households", 51], ["Industry", 23], ["Commercial premises", 19], ["Public facilities", 7]])],
  },
  {
    topic: "Small business", title: "Three cafés at lunchtime", family: "table",
    prompt: "The table compares four operating measures for three cafés on a typical weekday in 2025. Revenue is measured during the lunch period only. " + reportingInstruction,
    visuals: [chart("w3-table-1", "table", "Café operations during the lunch period", "units as indicated in column headings", ["Customers served (people)", "Average purchase (currency units)", "Lunch revenue (currency units)", "Staff on duty (people)"], [["Market Café", 120, 8.5, 1020, 6], ["Station Café", 180, 6, 1080, 5], ["Garden Café", 90, 12, 1080, 7]])],
  },
  {
    topic: "Student housing", title: "Comparing student accommodation", family: "table",
    prompt: "The table gives information about three types of student accommodation offered by a university in September 2025. " + reportingInstruction,
    visuals: [chart("w3-table-2", "table", "University accommodation options", "units as indicated in column headings", ["Weekly rent (currency units)", "Total rooms (number)", "Average waiting time (weeks)", "Distance to campus (km)"], [["Traditional halls", 145, 420, 8, 0.4], ["Self-catering flats", 185, 280, 12, 1.2], ["Partner residences", 210, 160, 3, 3.5]])],
  },
  {
    topic: "Accommodation", title: "Tourist stays in coastal accommodation", family: "table",
    prompt: "The table shows overnight stays and average room occupancy in three types of tourist accommodation in a coastal region in 2023 and 2024. " + reportingInstruction,
    visuals: [chart("w3-table-3", "table", "Tourist accommodation in the coastal region", "units as indicated in column headings", ["2023 stays (thousands)", "2024 stays (thousands)", "2023 occupancy (%)", "2024 occupancy (%)"], [["Hotels", 640, 705, 68, 74], ["Guesthouses", 210, 235, 61, 65], ["Holiday cottages", 360, 342, 72, 67]])],
  },
  {
    topic: "Libraries", title: "Book borrowing and late returns", family: "table",
    prompt: "The table compares annual book borrowing and late returns among four age groups at a public library in 2024. " + reportingInstruction,
    visuals: [chart("w3-table-4", "table", "Borrowing at the public library", "units as indicated in column headings", ["Registered borrowers (people)", "Loans per borrower (annual average)", "Loans returned late (%)"], [["Under 18", 1850, 21, 8], ["18–34", 1420, 12, 17], ["35–59", 2310, 18, 11], ["60 and over", 1680, 26, 6]])],
  },
  {
    topic: "Urban renewal", title: "From factory site to neighbourhood hub", family: "map",
    prompt: "The maps show the layout of a factory site in 2000 and the same site after redevelopment in 2025. North is at the top. " + reportingInstruction,
    visuals: [map("w3-map-1a", "Factory site, 2000", [["North ↑", 670, 30], ["Warehouse", 130, 100], ["Main factory", 410, 110], ["Loading yard", 420, 255], ["Staff car park", 125, 280], ["Entrance", 365, 355], ["Boundary", 40, 420]], [{ id: "road", points: [[25, 390], [735, 390]], style: "road" }]), map("w3-map-1b", "Neighbourhood hub, 2025", [["North ↑", 670, 30], ["Workshop studios", 130, 100], ["Community hall", 410, 110], ["Public garden", 420, 255], ["Visitor car park", 125, 280], ["Café", 620, 265], ["Entrance", 365, 355], ["Boundary", 40, 420]], [{ id: "road", points: [[25, 390], [735, 390]], style: "road" }])],
  },
  {
    topic: "Waterfront planning", title: "Changes along a village waterfront", family: "map",
    prompt: "The maps illustrate a village waterfront in 1995 and its layout today. The river lies along the southern edge of both maps. " + reportingInstruction,
    visuals: [map("w3-map-2a", "Village waterfront, 1995", [["North ↑", 670, 25], ["Boat shed", 105, 285], ["Fish market", 330, 280], ["Gravel car park", 600, 285], ["Houses", 130, 85], ["Village shop", 420, 85], ["Pier", 270, 380]], [{ id: "river", points: [[20, 410], [740, 410]], style: "river" }, { id: "street", points: [[20, 185], [740, 185]], style: "road" }]), map("w3-map-2b", "Village waterfront, today", [["North ↑", 670, 25], ["Boat hire", 105, 285], ["Restaurants", 330, 280], ["Riverside park", 600, 285], ["Houses", 130, 85], ["Visitor centre", 420, 85], ["Extended pier", 270, 390]], [{ id: "river", points: [[20, 410], [740, 410]], style: "river" }, { id: "street", points: [[20, 185], [740, 185]], style: "road" }, { id: "promenade", points: [[40, 350], [720, 350]], style: "path" }])],
  },
  {
    topic: "Airports", title: "An airport departure hall is redesigned", family: "map",
    prompt: "The plans show the internal layout of an airport departure hall before and after refurbishment. The entrance and boarding gates remain in the same positions. " + reportingInstruction,
    visuals: [map("w3-map-3a", "Departure hall before refurbishment", [["Boarding gates", 370, 40], ["Seating", 145, 100], ["Café", 580, 100], ["Security", 370, 180], ["Check-in desks", 155, 285], ["Information desk", 570, 290], ["Entrance", 370, 410]], [{ id: "route", points: [[370, 380], [370, 200], [370, 75]], style: "path" }]), map("w3-map-3b", "Departure hall after refurbishment", [["Boarding gates", 370, 40], ["Expanded seating", 145, 100], ["Shop", 580, 100], ["Security", 370, 180], ["Self-service check-in", 155, 285], ["Café", 570, 290], ["Information desk", 580, 365], ["Entrance", 370, 410]], [{ id: "route", points: [[370, 380], [370, 200], [370, 75]], style: "path" }])],
  },
  {
    topic: "Campus development", title: "University sports grounds over twenty years", family: "map",
    prompt: "The two maps show a university's sports grounds in 2005 and 2025. North is at the top, and the main access road is to the west. " + reportingInstruction,
    visuals: [map("w3-map-4a", "University sports grounds, 2005", [["North ↑", 675, 25], ["Car park", 145, 100], ["Tennis courts", 405, 100], ["Grass field", 425, 300], ["Changing rooms", 145, 315], ["Access road", 55, 420]], [{ id: "access", points: [[55, 30], [55, 395]], style: "road" }]), map("w3-map-4b", "University sports grounds, 2025", [["North ↑", 675, 25], ["Car park", 145, 100], ["Indoor sports centre", 405, 100], ["All-weather pitch", 425, 300], ["Fitness room", 145, 245], ["Changing rooms", 145, 345], ["Access road", 55, 420]], [{ id: "access", points: [[55, 30], [55, 395]], style: "road" }, { id: "walkway", points: [[180, 190], [600, 190]], style: "path" }])],
  },
  {
    topic: "Paper production", title: "Making paper from recycled material", family: "process",
    prompt: "The diagram shows how discarded paper is processed into new paper at a recycling plant. " + reportingInstruction,
    visuals: [process("w3-process-1", "Production of recycled paper", ["Collect discarded paper", "Sort and remove unsuitable items", "Mix paper with water to form pulp", "Screen pulp to remove contaminants", "Remove ink from the pulp", "Press pulp between rollers", "Dry the paper with heated rollers", "Wind finished paper onto rolls"])],
  },
  {
    topic: "Food processing", title: "From beehive to packaged honey", family: "process",
    prompt: "The diagram illustrates the stages used to prepare honey for sale after the honeycomb is removed from a hive. " + reportingInstruction,
    visuals: [process("w3-process-2", "Preparing honey for sale", ["Remove frames containing honeycomb", "Uncap the wax covering the cells", "Spin frames in an extractor", "Pass extracted honey through a filter", "Leave honey in a settling tank", "Fill clean jars with honey", "Seal and label the jars"])],
  },
  {
    topic: "Wastewater treatment", title: "Cleaning wastewater for release", family: "process",
    prompt: "The diagram shows the main stages of wastewater treatment at a municipal plant, from arrival to release into a river. " + reportingInstruction,
    visuals: [process("w3-process-3", "Wastewater treatment at a municipal plant", ["Wastewater arrives through a sewer", "Screens remove large solid items", "Grit settles in a grit chamber", "Solids settle in a primary tank", "Air is added in a biological treatment tank", "Remaining solids settle in a secondary tank", "Ultraviolet light disinfects the water", "Treated water is released into the river"])],
  },
  {
    topic: "Geothermal energy", title: "Electricity from underground heat", family: "process",
    prompt: "The diagram shows how a geothermal power station generates electricity and returns water underground. " + reportingInstruction,
    visuals: [{ id: "w3-process-4", type: "process", title: "Geothermal electricity generation cycle", width: 760, height: 450, labels: [],
      nodes: [
        { id: "injection", x: 25, y: 35, width: 205, height: 86, text: "Cooled water is pumped down an injection well" },
        { id: "hot-rock", x: 275, y: 35, width: 205, height: 86, text: "Water passes through hot underground rock" },
        { id: "production", x: 525, y: 35, width: 205, height: 86, text: "Heated water rises through a production well" },
        { id: "steam", x: 525, y: 200, width: 205, height: 86, text: "Pressure is reduced to produce steam" },
        { id: "turbine", x: 275, y: 200, width: 205, height: 86, text: "Steam turns a turbine" },
        { id: "condenser", x: 25, y: 200, width: 205, height: 86, text: "Steam is cooled and condensed into water" },
        { id: "generator", x: 275, y: 335, width: 205, height: 86, text: "A generator produces electricity" },
      ],
      connections: [
        { from: "injection", to: "hot-rock" }, { from: "hot-rock", to: "production" },
        { from: "production", to: "steam" }, { from: "steam", to: "turbine", label: "Steam" },
        { from: "turbine", to: "condenser", label: "Steam" }, { from: "condenser", to: "injection", label: "Water" },
        { from: "turbine", to: "generator", label: "Rotating shaft" },
      ],
    }],
  },
  {
    topic: "Cycling", title: "Cycle hire growth and journey purposes", family: "mixed",
    prompt: "The line graph shows annual trips made using a city's cycle-hire scheme from 2018 to 2024. The pie chart shows the purposes of those trips in 2024. " + reportingInstruction,
    visuals: [chart("w3-mixed-1a", "line", "Annual cycle-hire trips", "million trips", ["Trips"], [["2018", 1.2], ["2020", 1.8], ["2022", 2.7], ["2024", 3.5]], "Year"), chart("w3-mixed-1b", "pie", "Trip purposes, 2024", "% of cycle-hire trips", ["Share"], [["Commuting", 48], ["Leisure", 29], ["Shopping and errands", 17], ["Other", 6]])],
  },
  {
    topic: "Waste management", title: "Waste totals and treatment rates", family: "mixed",
    prompt: "The bar chart shows household waste collected in three towns in 2024. The table gives the percentage treated by each method in those towns in the same year. " + reportingInstruction,
    visuals: [chart("w3-mixed-2a", "bar", "Household waste collected, 2024", "thousand tonnes", ["Collected waste"], [["Easton", 84], ["Lakeford", 56], ["Pinebridge", 72]]), chart("w3-mixed-2b", "table", "Waste treatment methods, 2024", "% of each town's collected waste", ["Recycled", "Composted", "Landfill"], [["Easton", 42, 18, 40], ["Lakeford", 35, 25, 40], ["Pinebridge", 51, 21, 28]])],
  },
  {
    topic: "Museums", title: "Museum attendance and opening hours", family: "mixed",
    prompt: "The line graph shows annual visits to a museum between 2016 and 2024. The table shows its opening hours per week in the same years. " + reportingInstruction,
    visuals: [chart("w3-mixed-3a", "line", "Annual museum visits", "thousand visits", ["Visits"], [["2016", 145], ["2018", 172], ["2020", 68], ["2022", 184], ["2024", 236]], "Year"), chart("w3-mixed-3b", "table", "Museum opening hours", "hours per week", ["Hours open"], [["2016", 36], ["2018", 40], ["2020", 24], ["2022", 42], ["2024", 48]])],
  },
  {
    topic: "Remote working", title: "Home-working frequency and commuting time", family: "mixed",
    prompt: "The bar chart shows the proportions of office employees working from home at least once a week in four industries in 2025. The table gives average one-way commuting times for office employees in those industries. " + reportingInstruction,
    visuals: [chart("w3-mixed-4a", "bar", "Working from home at least weekly, 2025", "% of office employees", ["Employees"], [["Banking", 64], ["Publishing", 58], ["Engineering", 37], ["Retail administration", 29]]), chart("w3-mixed-4b", "table", "Average one-way commute, 2025", "minutes", ["Commuting time"], [["Banking", 48], ["Publishing", 39], ["Engineering", 34], ["Retail administration", 27]])],
  },
];

type LetterTask = { topic: string; title: string; tone: "formal" | "semi-formal" | "informal"; prompt: string; points: string[] };
const letterTasks: LetterTask[] = [
  { topic: "Housing", title: "Repairs following a water leak", tone: "formal", prompt: "You rent an apartment through a property agency. A water leak has damaged one room, and an earlier repair appointment was missed. Write a letter to the agency manager.", points: ["Describe the leak and the damage it has caused.", "Explain what happened with the previous appointment.", "Say what action you would like the agency to take now."] },
  { topic: "Community projects", title: "Arrange a handover to a volunteer coordinator", tone: "semi-formal", prompt: "You volunteer at a community garden, but your work schedule is about to change. Write a letter to the coordinator, whom you know.", points: ["Explain how your availability will change.", "Describe the responsibilities that need to be handed over.", "Suggest how you can help a replacement get started."] },
  { topic: "Friendship", title: "A friend is moving into your area", tone: "informal", prompt: "A friend is moving to your neighbourhood and has asked for advice about settling in. Write a letter to your friend.", points: ["Recommend a useful local service or facility.", "Describe an activity where your friend could meet people.", "Offer practical help during the move."] },
  { topic: "Employment", title: "Request a change to a professional course booking", tone: "formal", prompt: "Your employer has enrolled you on a training course, but the organiser has changed its dates. Write a letter to the course organiser.", points: ["Give the details of your booking.", "Explain why the new dates are unsuitable.", "Ask for an alternative arrangement."] },
];
type EssayTask = { topic: string; title: string; family: "opinion" | "discussion" | "advantages-disadvantages" | "problems-solutions" | "causes-effects" | "two-part"; prompt: string };
const essayTasks: EssayTask[] = [
  { topic: "Education policy", title: "Should schools assess group projects?", family: "opinion", prompt: "Schools should give individual students marks for their contribution to group projects rather than giving the whole group the same mark. To what extent do you agree or disagree?" },
  { topic: "Digital privacy", title: "Limits on collecting children's online data", family: "opinion", prompt: "Companies should not be allowed to collect personal data from children, even when parents give permission. To what extent do you agree or disagree?" },
  { topic: "Public transport", title: "Free buses or better service?", family: "discussion", prompt: "Some people believe public buses should be free for everyone. Others think public money should be used to improve the frequency and reliability of services instead. Discuss both views and give your own opinion." },
  { topic: "Historical heritage", title: "Who should pay to preserve historic buildings?", family: "discussion", prompt: "Some people think governments should pay to preserve privately owned historic buildings. Others believe their owners should bear the cost. Discuss both views and give your own opinion." },
  { topic: "Consumer culture", title: "Repair services inside retail shops", family: "advantages-disadvantages", prompt: "More shops are offering repair services alongside the sale of new products. What are the advantages and disadvantages of this development?" },
  { topic: "Work arrangements", title: "A shorter working week", family: "advantages-disadvantages", prompt: "Some employers are reducing the working week to four days while keeping employees' weekly pay unchanged. Do the advantages of this change outweigh the disadvantages?" },
  { topic: "Public space", title: "Congestion around school entrances", family: "problems-solutions", prompt: "Traffic congestion near school entrances has become a serious problem in many towns. What problems does this cause, and what measures could reduce them?" },
  { topic: "Health services", title: "Missed medical appointments", family: "problems-solutions", prompt: "Many people book medical appointments but do not attend them or cancel in advance. What problems does this create, and what can be done to address them?" },
  { topic: "Family life", title: "Fewer shared meals", family: "causes-effects", prompt: "In many households, family members eat fewer meals together than they did in the past. What are the causes of this change, and what effects can it have on family life?" },
  { topic: "Employment geography", title: "Skilled workers leave smaller towns", family: "causes-effects", prompt: "Many skilled young workers move from small towns to large cities. Why does this happen, and what effects does it have on the towns they leave?" },
  { topic: "Language learning", title: "Maintaining a heritage language", family: "two-part", prompt: "Some parents living abroad teach their children the language of their home country. Why do they consider this important? How can schools support children who speak a different language at home?" },
  { topic: "Citizenship", title: "Young adults and local decision-making", family: "two-part", prompt: "Young adults are often less involved in local decision-making than older residents. How important is it for young adults to take part? What could encourage them to become more involved?" },
  { topic: "Sport", title: "Funding elite sport or everyday exercise", family: "discussion", prompt: "Some people think national sports funding should support athletes who compete internationally. Others argue that it should mainly help ordinary people participate in sport. Discuss both views and give your own opinion." },
  { topic: "Housing markets", title: "Short-term holiday rentals in residential areas", family: "advantages-disadvantages", prompt: "Owners in many cities rent their homes to tourists for short stays. Do the advantages of this practice outweigh the disadvantages for local communities?" },
  { topic: "Media", title: "Public access to research findings", family: "opinion", prompt: "Research paid for with public money should be freely available to everyone rather than restricted to paid publications. To what extent do you agree or disagree?" },
  { topic: "Food systems", title: "Reducing edible food discarded by shops", family: "problems-solutions", prompt: "Supermarkets discard large quantities of food that is still safe to eat. What problems result from this, and what measures could reduce the waste?" },
];

function visualSection(task: VisualTask, id: string): ContentSection {
  return { id: `${id}-task1`, title: "Academic Writing Task 1", task: 1, text: task.prompt, instructions: writingInstruction(1), visuals: task.visuals };
}
function letterSection(task: LetterTask, id: string): ContentSection {
  return { id: `${id}-task1`, title: "General Training Writing Task 1", task: 1, text: task.prompt, cuePoints: task.points,
    instructions: writingInstruction(1) + " You do not need to write any addresses. Begin your letter as appropriate for the person you are writing to." };
}
function essaySection(task: EssayTask, id: string): ContentSection {
  return { id: `${id}-task2`, title: "Writing Task 2", task: 2, text: task.prompt, instructions: writingInstruction(2) };
}
export const expandedWritingLessons: StoredContent[] = [
  ...visualTasks.map((task, i) => {
    const id = `writing-v3-lesson-${String(i + 1).padStart(3, "0")}`;
    return { ...base(id, "writing", task.topic, i), title: task.title, description: "Original Academic Task 1 with fully specified visual data; fictional practice material.", testType: "academic" as const,
      sections: [visualSection(task, id)], tags: ["expansion-v3", "ai-original", "task-1", task.family], objectives: ["Select an accurate overview", "Compare features without inventing causes"], errorTypes: ["missing-overview", "inaccurate-data-selection", "unsupported-causal-inference"] };
  }),
  ...letterTasks.map((task, i) => {
    const id = `writing-v3-lesson-${String(i + 29).padStart(3, "0")}`;
    return { ...base(id, "writing", task.topic, i), title: task.title, description: "An original General Training letter with three communicative purposes.", testType: "general" as const,
      sections: [letterSection(task, id)], tags: ["expansion-v3", "ai-original", "task-1", "letter", task.tone], objectives: ["Address all three bullet points", "Use an appropriate register"], errorTypes: ["unaddressed-bullet-point", "inappropriate-register", "unclear-letter-purpose"] };
  }),
  ...essayTasks.map((task, i) => {
    const id = `writing-v3-lesson-${String(i + 33).padStart(3, "0")}`;
    return { ...base(id, "writing", task.topic, i), title: task.title, description: "An original extended argument task with an explicit IELTS-style question family.", durationMinutes: 40,
      sections: [essaySection(task, id)], tags: ["expansion-v3", "ai-original", "task-2", task.family], objectives: ["Address each part of the task", "Develop relevant arguments with explained examples"], errorTypes: ["incomplete-task-response", "unsupported-argument", "inconsistent-position"] };
  }),
];

const mockVisualTasks: VisualTask[] = [
  { topic: "Freight transport", title: "Freight carried by three modes", family: "line", prompt: "The graph shows the amount of freight transported by road, rail and inland waterway in a country from 2000 to 2025. " + reportingInstruction,
    visuals: [chart("w3-mock-line", "line", "Freight transport, 2000–2025", "billion tonne-kilometres", ["Road", "Rail", "Inland waterway"], [["2000", 62, 34, 19], ["2005", 72, 32, 22], ["2010", 81, 38, 24], ["2015", 89, 42, 23], ["2020", 94, 48, 27], ["2025", 101, 55, 31]], "Year")] },
  { topic: "Energy efficiency", title: "Energy consumption in a hotel", family: "pie", prompt: "The pie charts compare how a hotel's total energy consumption was divided among different uses in 2010 and 2025. " + reportingInstruction,
    visuals: [chart("w3-mock-pie-a", "pie", "Hotel energy use, 2010", "% of total energy consumption", ["Share"], [["Space heating", 39], ["Water heating", 23], ["Lighting", 18], ["Kitchen equipment", 12], ["Other", 8]]), chart("w3-mock-pie-b", "pie", "Hotel energy use, 2025", "% of total energy consumption", ["Share"], [["Space heating", 31], ["Water heating", 27], ["Lighting", 9], ["Kitchen equipment", 19], ["Other", 14]])] },
  { topic: "Town planning", title: "Redevelopment of a town square", family: "map", prompt: "The maps show a town square in 2010 and its present-day layout. North is at the top. " + reportingInstruction,
    visuals: [map("w3-mock-map-a", "Town square, 2010", [["North ↑", 670, 25], ["Town hall", 370, 70], ["Car park", 170, 230], ["Flower beds", 580, 240], ["Bus stop", 580, 365], ["Shops", 160, 365]], [{ id: "road", points: [[25, 410], [735, 410]], style: "road" }]), map("w3-mock-map-b", "Town square, today", [["North ↑", 670, 25], ["Town hall", 370, 70], ["Pedestrian plaza", 170, 230], ["Fountain", 580, 240], ["Cycle parking", 580, 320], ["Bus stop", 670, 365], ["Shops", 160, 365]], [{ id: "road", points: [[25, 410], [735, 410]], style: "road" }, { id: "walk", points: [[180, 320], [560, 320]], style: "path" }])] },
  { topic: "Manufacturing", title: "Producing glass bottles", family: "process", prompt: "The diagram shows the manufacture of glass bottles from raw materials. " + reportingInstruction,
    visuals: [process("w3-mock-process", "Manufacture of glass bottles", ["Mix sand, soda ash and limestone", "Melt the mixture in a furnace", "Cut molten glass into measured portions", "Place portions in bottle moulds", "Blow air into moulds to shape bottles", "Cool bottles gradually in an annealing oven", "Inspect bottles for defects", "Pack accepted bottles for distribution"])] },
  { topic: "Higher education", title: "Applicants and accepted places", family: "mixed", prompt: "The bar chart shows applicants to four university departments in 2025. The table shows the number of places accepted and the percentage of accepted places taken by international students. " + reportingInstruction,
    visuals: [chart("w3-mock-mixed-a", "bar", "Applications by department, 2025", "number of applicants", ["Applicants"], [["Architecture", 960], ["Nursing", 1440], ["Computing", 1820], ["Languages", 740]]), chart("w3-mock-mixed-b", "table", "Accepted places, 2025", "units as indicated in column headings", ["Accepted places (number)", "International students (% of accepted places)"], [["Architecture", 180, 28], ["Nursing", 320, 12], ["Computing", 360, 35], ["Languages", 160, 31]])] },
  { topic: "Postal services", title: "Parcel delivery performance", family: "table", prompt: "The table compares domestic parcel services offered by three companies in a country in 2025. All prices are for a parcel weighing one kilogram. " + reportingInstruction,
    visuals: [chart("w3-mock-table", "table", "Domestic parcel services, 2025", "units as indicated in column headings", ["Standard price (currency units)", "Average delivery time (days)", "Delivered within promised time (%)", "Collection points (number)"], [["ParcelLink", 5.8, 2.6, 94, 420], ["SwiftPost", 7.2, 1.8, 91, 260], ["HomeRoute", 4.9, 3.4, 97, 610]])] },
];
const mockLetterTasks: LetterTask[] = [
  { topic: "Travel disruption", title: "A missing bag after a coach journey", tone: "formal", prompt: "After travelling by coach, you discovered that a bag you had placed in the luggage compartment was missing. Write a letter to the coach company's customer service manager.", points: ["Give details of your journey and describe the bag.", "Explain how the missing bag has affected you.", "Say what you would like the company to do."] },
  { topic: "Hospitality", title: "Thank a friend for hosting a relative", tone: "informal", prompt: "A friend recently allowed one of your relatives to stay at their home during a short visit. Write a letter to your friend.", points: ["Thank your friend and explain what your relative enjoyed.", "Mention something your relative left behind.", "Suggest a way to return your friend's kindness."] },
];
const mockEssays: EssayTask[] = [
  { topic: "Transport safety", title: "Mandatory safety training for cyclists", family: "opinion", prompt: "Adults should be required to complete road-safety training before cycling on public roads. To what extent do you agree or disagree?" },
  { topic: "Rural development", title: "Tourism or other employment in rural areas", family: "discussion", prompt: "Some people think tourism is the best way to create jobs in rural areas. Others believe governments should encourage a wider range of industries. Discuss both views and give your own opinion." },
  { topic: "Food culture", title: "Ready-to-cook meal kits", family: "advantages-disadvantages", prompt: "An increasing number of households buy meal kits containing measured ingredients and cooking instructions. What are the advantages and disadvantages of this development?" },
  { topic: "Urban housing", title: "Empty homes in cities with housing shortages", family: "problems-solutions", prompt: "Some cities have many empty homes while residents struggle to find affordable housing. What problems arise from this situation, and what measures could address them?" },
  { topic: "Academic motivation", title: "Students change their degree subjects", family: "causes-effects", prompt: "Many university students change their main subject after beginning their degree. Why does this happen, and what effects can it have on students and universities?" },
  { topic: "Environmental behaviour", title: "Sharing environmental information at work", family: "two-part", prompt: "Some workplaces encourage employees to share ideas for reducing their environmental impact. How useful is this approach? What can employers do to turn these ideas into lasting changes?" },
  { topic: "Neighbourhoods", title: "Meeting neighbours through organised events", family: "two-part", prompt: "Local organisations often arrange events to help neighbours get to know one another. Why can such events be valuable? What makes residents more likely to participate?" },
  { topic: "Workplace fairness", title: "Experience or potential when promoting staff", family: "discussion", prompt: "Some people believe employees should be promoted mainly on the basis of their experience. Others think their potential to learn and lead is more important. Discuss both views and give your own opinion." },
];
export const expandedWritingMocks: StoredContent[] = mockEssays.map((essay, i) => {
  const id = `writing-v3-mock-${String(i + 1).padStart(3, "0")}`;
  const first = i < 6 ? visualSection(mockVisualTasks[i], id) : letterSection(mockLetterTasks[i - 6], id);
  return { ...base(id, "writing", essay.topic, i), title: `${i < 6 ? "Academic" : "General Training"} Writing — Original V3 Test ${i + 1}`,
    description: "Two independently authored tasks under one 60-minute clock. Task 2 carries twice the assessment weight of Task 1.", testType: i < 6 ? "academic" : "general", durationMinutes: 60, format: "full-mock",
    sections: [first, essaySection(essay, id)], tags: ["expansion-v3", "ai-original", "full-mock", "task-1", "task-2", i < 6 ? mockVisualTasks[i].family : "letter", essay.family],
    objectives: [i < 6 ? "Report key visual features with an accurate overview" : "Address all letter bullet points using an appropriate register", "Develop relevant arguments and answer every part of Task 2", "Allocate approximately 20 and 40 minutes to the two tasks"],
    errorTypes: [i < 6 ? "missing-overview" : "inappropriate-register", "incomplete-task-response", "unsupported-argument", "insufficient-task-development"] };
});

type SpeakingPack = (typeof newSpeakingPacks)[number];
function speakingSections(pack: SpeakingPack, id: string): ContentSection[] {
  return [
    { id: `${id}-part1`, title: "Part 1 — Introduction and interview", text: pack.part1.map((q, i) => `${i + 1}. ${q}`).join("\n"), instructions: "Allow 4–5 minutes for the interview." },
    { id: `${id}-part2`, title: "Part 2 — Individual long turn", text: pack.cue, cuePoints: pack.points, instructions: "You have one minute to prepare. You may make notes. Then speak for one to two minutes." },
    { id: `${id}-part3`, title: "Part 3 — Discussion", text: pack.part3.map((q, i) => `${i + 1}. ${q}`).join("\n"), instructions: "Allow 4–5 minutes for the discussion." },
  ];
}
const supportObjectives = [
  ["Practice only: record a short answer, listen for word stress and repeat naturally; pronunciation requires audio assessment", "Practice only: extend a personal answer with one reason and one specific example"],
  ["Practice only: rehearse linking words between sense groups without memorising a complete response", "Practice only: answer an unpredictable follow-up after the long turn"],
  ["Practice only: compare two viewpoints and explain a consequence", "Practice only: review a recording for sentence stress and meaningful pauses; do not infer pronunciation from a transcript"],
];
export const expandedSpeakingLessons: StoredContent[] = newSpeakingPacks.map((pack, i) => {
  const id = `speaking-v3-lesson-${String(i + 1).padStart(3, "0")}`;
  return { ...base(id, "speaking", pack.topic, i), title: pack.title, description: "An original three-part speaking practice set: six interview questions, a four-point cue card and six discussion questions.",
    sections: speakingSections(pack, id), tags: ["expansion-v3", "ai-original", "part-1", "part-2", "part-3", "pronunciation-practice", "follow-up-practice", "opinion-development"], objectives: supportObjectives[i % supportObjectives.length], errorTypes: ["underdeveloped-personal-answer", "unclear-comparison", "unsupported-generalisation"] };
});
export const expandedSpeakingMocks: StoredContent[] = newSpeakingMockPacks.map((pack, i) => {
  const id = `speaking-v3-mock-${String(i + 1).padStart(3, "0")}`;
  return { ...base(id, "speaking", pack.topic, i), title: `Speaking — Original V3 Test ${i + 1}: ${pack.title}`, description: "A complete independently authored three-part speaking simulation with no answer hints.",
    durationMinutes: 14, format: "full-mock", sections: speakingSections(pack, id), tags: ["expansion-v3", "ai-original", "full-mock", "part-1", "part-2", "part-3"],
    objectives: ["Answer personal questions with relevant details", "Sustain a coherent long turn using the cue card", "Explain and compare broader viewpoints with supporting reasons"],
    errorTypes: ["underdeveloped-personal-answer", "disorganised-long-turn", "unsupported-generalisation"] };
});
