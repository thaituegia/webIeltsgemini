import type {
  Cefr,
  DialogueLine,
  StoredContent,
  StoredQuestion,
  PlacementItem,
} from "../../shared/types.js";

export const topics = [
  "Education",
  "Environment",
  "Technology",
  "Transport",
  "Health",
  "Work",
  "Travel",
  "Arts",
  "Community",
  "Food",
  "Science",
  "Finance",
] as const;
const levels: Cefr[] = ["A2", "B1", "B2", "C1"];
const bands = [3.5, 4.5, 5.5, 6.5];
const createdAt = "2026-10-07T00:00:00.000Z";
interface CaseStudy {
  title: string;
  place: string;
  organiser: string;
  initiative: string;
  problem: string;
  method: string;
  target: string;
  result: string;
  object: string;
  olderMethod: string;
  evaluation: string;
  next: string;
}
// Each row is a distinct fictional case, written for this project. Quantities below
// are fictional research facts for answerable exercises, not reports of real studies.
const cases: Record<(typeof topics)[number], CaseStudy[]> = {
  Education: [
    {
      title: "The evening reading club",
      place: "North Library",
      organiser: "Lina Park",
      initiative: "an evening reading club",
      problem: "adult beginners found long books discouraging",
      method: "short illustrated stories read in pairs",
      target: "adult beginners",
      result: "more learners finished a book",
      object: "reading diary",
      olderMethod: "silent individual reading",
      evaluation: "attendance logs and learner interviews",
      next: "add a Saturday storytelling session",
    },
    {
      title: "A timetable that travels",
      place: "East College",
      organiser: "Omar Reed",
      initiative: "a flexible timetable trial",
      problem: "commuters missed early laboratory classes",
      method: "two identical laboratory sessions on different days",
      target: "commuting students",
      result: "fewer laboratory sessions were missed",
      object: "travel survey",
      olderMethod: "a single compulsory morning session",
      evaluation: "attendance records and transport diaries",
      next: "test the timetable in the engineering department",
    },
    {
      title: "Learning to explain an answer",
      place: "Harbour School",
      organiser: "Maya Chen",
      initiative: "a peer explanation programme",
      problem:
        "students could recall rules but could not justify their answers",
      method: "students explain a solution before comparing alternatives",
      target: "first-year mathematics students",
      result: "students identified more errors in unfamiliar problems",
      object: "reasoning journal",
      olderMethod: "repeating worked solutions without discussion",
      evaluation: "blind marking of unfamiliar problems",
      next: "investigate whether improvements remain after six months",
    },
    {
      title: "When feedback arrives",
      place: "West Institute",
      organiser: "Elias Grant",
      initiative: "a delayed feedback study",
      problem: "instant corrections encouraged copying rather than reflection",
      method:
        "feedback delivered after students had written their own explanation",
      target: "trainee teachers",
      result: "revised essays contained more independently corrected errors",
      object: "reflection sheet",
      olderMethod: "immediate line-by-line correction",
      evaluation: "anonymous comparison of first and revised drafts",
      next: "compare feedback timing across different subjects",
    },
  ],
  Environment: [
    {
      title: "Buckets for a dry garden",
      place: "Maple Gardens",
      organiser: "Nora Field",
      initiative: "a rainwater collection project",
      problem: "summer watering used too much tap water",
      method: "rainwater stored in covered barrels",
      target: "community gardeners",
      result: "tap-water use fell during dry weeks",
      object: "water meter",
      olderMethod: "watering directly from garden taps",
      evaluation: "weekly meter readings",
      next: "fit a second barrel beside the greenhouse",
    },
    {
      title: "Sorting at the source",
      place: "Bridge Market",
      organiser: "Daniel Fox",
      initiative: "a waste-sorting trial",
      problem: "food scraps were mixed with recyclable packaging",
      method: "clearly labelled bins beside each food stall",
      target: "market traders",
      result: "less contaminated material reached the recycling centre",
      object: "sorting guide",
      olderMethod: "one mixed bin behind the market",
      evaluation: "inspection of sample bags",
      next: "include a separate collection for used cooking oil",
    },
    {
      title: "A cooler street",
      place: "Elm Avenue",
      organiser: "Priya Moss",
      initiative: "a street-tree planting experiment",
      problem: "unshaded pavements became uncomfortable in hot weather",
      method: "trees planted on alternate blocks with temperature sensors",
      target: "shopkeepers and pedestrians",
      result: "shaded pavement temperatures were lower at midday",
      object: "temperature sensor",
      olderMethod: "measuring only regional air temperature",
      evaluation: "paired readings from shaded and exposed blocks",
      next: "measure winter light levels before expanding the project",
    },
    {
      title: "Counting what restoration changes",
      place: "Raven Marsh",
      organiser: "Theo Brooks",
      initiative: "a wetland restoration assessment",
      problem: "bird counts alone could not reveal changes in water quality",
      method: "water samples combined with habitat and bird surveys",
      target: "local conservation volunteers",
      result: "the team detected nutrient changes before bird numbers shifted",
      object: "sampling bottle",
      olderMethod: "an annual bird census without water testing",
      evaluation: "comparison with an unrestored wetland",
      next: "continue sampling through a second winter",
    },
  ],
  Technology: [
    {
      title: "A simpler appointment screen",
      place: "Cedar Clinic",
      organiser: "Hana Wells",
      initiative: "a booking-screen redesign",
      problem: "patients could not find the appointment button",
      method: "one large button with a plain-language label",
      target: "first-time patients",
      result: "more patients completed a booking without help",
      object: "help card",
      olderMethod: "a menu with several unfamiliar icons",
      evaluation: "observations during supervised booking sessions",
      next: "translate the booking instructions into two languages",
    },
    {
      title: "Borrowing a sensor",
      place: "Brook Workshop",
      organiser: "Felix Shaw",
      initiative: "a shared sensor library",
      problem:
        "small businesses could not afford equipment for short experiments",
      method: "sensors borrowed for one week after a safety lesson",
      target: "small business owners",
      result: "more businesses tested ideas before buying equipment",
      object: "loan form",
      olderMethod: "buying a new sensor for every experiment",
      evaluation: "loan records and follow-up questionnaires",
      next: "introduce weekend collection times",
    },
    {
      title: "Warnings people understand",
      place: "Summit Lab",
      organiser: "Aisha Bell",
      initiative: "a privacy-warning experiment",
      problem: "users ignored long technical notices",
      method: "short notices explaining one specific data consequence",
      target: "mobile application users",
      result: "users recalled more of the stated data risks",
      object: "consent screen",
      olderMethod: "a single lengthy legal notice",
      evaluation: "recall tests given after an unrelated task",
      next: "test whether recall predicts later privacy choices",
    },
    {
      title: "The repairable device",
      place: "Harbour Works",
      organiser: "Marco Lane",
      initiative: "a modular electronics study",
      problem: "sealed components made otherwise working devices unusable",
      method: "replaceable modules tested alongside sealed models",
      target: "repair technicians",
      result: "faulty units required fewer complete replacements",
      object: "repair manual",
      olderMethod: "replacing the whole device after one component failed",
      evaluation: "repair-time logs and material-use estimates",
      next: "assess whether connectors remain reliable after repeated repairs",
    },
  ],
  Transport: [
    {
      title: "The bus stop notice",
      place: "Oak Square",
      organiser: "Eva Stone",
      initiative: "a bus information project",
      problem: "passengers waited at the wrong side of the square",
      method: "colour-coded route notices beside both shelters",
      target: "new bus passengers",
      result: "fewer passengers joined the wrong queue",
      object: "route map",
      olderMethod: "a single timetable inside the ticket office",
      evaluation: "staff counts during the morning rush",
      next: "place the same notices at the station entrance",
    },
    {
      title: "A bicycle at the station",
      place: "River Station",
      organiser: "Sam North",
      initiative: "a secure bicycle-parking trial",
      problem: "commuters avoided cycling because outdoor racks were insecure",
      method: "locked storage accessed with a travel card",
      target: "rail commuters",
      result: "more commuters cycled to the station",
      object: "access card",
      olderMethod: "uncovered racks without access control",
      evaluation: "rack counts and user surveys",
      next: "provide a small area for bicycle repairs",
    },
    {
      title: "Delivery outside the rush",
      place: "Market Lane",
      organiser: "Leila Frost",
      initiative: "an off-peak delivery trial",
      problem:
        "delivery vans blocked a narrow street during busy shopping hours",
      method: "deliveries booked into quiet early-afternoon slots",
      target: "independent retailers",
      result: "pedestrians encountered fewer blocked crossings",
      object: "booking calendar",
      olderMethod: "allowing suppliers to arrive whenever convenient",
      evaluation: "street observations and delivery-time records",
      next: "check whether new slots increase warehouse labour costs",
    },
    {
      title: "Measuring a transport connection",
      place: "Bay Terminal",
      organiser: "Arun Ellis",
      initiative: "a transfer-reliability study",
      problem: "average journey times hid the risk of missing connections",
      method:
        "tracking the distribution of waiting times rather than only the mean",
      target: "regional bus operators",
      result:
        "the team identified connections that were unreliable despite short average waits",
      object: "transfer log",
      olderMethod: "ranking services by average travel time alone",
      evaluation: "repeated tracking across weekdays and weekends",
      next: "test revised departure buffers under winter conditions",
    },
  ],
  Health: [
    {
      title: "Walking after lunch",
      place: "Pine Centre",
      organiser: "Isla Green",
      initiative: "a lunchtime walking group",
      problem: "office workers spent their whole break sitting indoors",
      method: "a short guided walk along a marked route",
      target: "office workers",
      result: "more workers took an active lunch break",
      object: "route leaflet",
      olderMethod: "an optional exercise poster in the canteen",
      evaluation: "sign-in sheets and weekly questionnaires",
      next: "offer an indoor route for rainy days",
    },
    {
      title: "The reminder that fits",
      place: "Hill Practice",
      organiser: "Noah Price",
      initiative: "an appointment reminder trial",
      problem: "patients overlooked standard reminder messages",
      method: "patients chose the time when a reminder would arrive",
      target: "patients with repeat appointments",
      result: "fewer repeat appointments were missed",
      object: "preference form",
      olderMethod: "sending every reminder at the same hour",
      evaluation: "appointment records without patient names",
      next: "add a simple way to cancel an appointment",
    },
    {
      title: "Finding a quieter night",
      place: "Meadow Hospital",
      organiser: "Sara Finch",
      initiative: "a night-time noise reduction trial",
      problem:
        "equipment alarms disturbed patients even when no urgent action was required",
      method: "staff reviewed alarm thresholds and moved routine checks",
      target: "patients in recovery wards",
      result: "patients reported fewer avoidable night-time disturbances",
      object: "noise monitor",
      olderMethod:
        "asking staff to speak softly without changing alarm settings",
      evaluation: "noise recordings and morning sleep questionnaires",
      next: "study whether the changes affect staff response times",
    },
    {
      title: "What a health message leaves out",
      place: "Vale University",
      organiser: "Jonah Reed",
      initiative: "a risk-communication study",
      problem:
        "relative percentages made small changes appear larger than they were",
      method: "absolute frequencies presented beside relative risk figures",
      target: "adults reading health leaflets",
      result:
        "readers made more accurate comparisons between treatment options",
      object: "comparison table",
      olderMethod: "reporting relative risk without a baseline",
      evaluation: "scenario-based decisions rather than satisfaction ratings",
      next: "test the format among readers with different numeracy skills",
    },
  ],
  Work: [
    {
      title: "A first-day checklist",
      place: "Stone Bakery",
      organiser: "Mina Cole",
      initiative: "a new-staff checklist",
      problem: "new employees forgot basic closing tasks",
      method: "a short checklist kept beside the exit",
      target: "new bakery employees",
      result: "fewer closing tasks were missed",
      object: "closing checklist",
      olderMethod: "giving instructions once during the first shift",
      evaluation: "supervisors recorded completed tasks",
      next: "make a separate checklist for opening the shop",
    },
    {
      title: "Sharing the late shift",
      place: "Alder Hotel",
      organiser: "Luca Hart",
      initiative: "a fair shift-allocation trial",
      problem: "the same workers repeatedly received unpopular shifts",
      method: "a rotating schedule published four weeks in advance",
      target: "hotel reception staff",
      result: "staff made fewer last-minute shift exchanges",
      object: "rotation chart",
      olderMethod: "assigning shifts individually at short notice",
      evaluation: "schedule changes and confidential staff comments",
      next: "let staff submit preferences before each rotation",
    },
    {
      title: "Meetings with a written start",
      place: "Cobalt Studio",
      organiser: "Anika West",
      initiative: "a silent-start meeting trial",
      problem:
        "the first speaker often determined which ideas received attention",
      method: "participants wrote proposals before speaking",
      target: "design project teams",
      result: "more proposals came from members who usually spoke less",
      object: "proposal sheet",
      olderMethod: "beginning every meeting with open discussion",
      evaluation: "coded meeting notes and anonymous idea ratings",
      next: "compare idea selection with later project outcomes",
    },
    {
      title: "The limits of an output score",
      place: "Granite Office",
      organiser: "Dylan Moss",
      initiative: "a performance-measure review",
      problem:
        "counting completed tickets encouraged easy cases to be chosen first",
      method: "case complexity included alongside completion counts",
      target: "customer support managers",
      result: "difficult cases waited less time before being handled",
      object: "case register",
      olderMethod: "rewarding staff solely for the number of tickets closed",
      evaluation: "waiting-time patterns and independent case ratings",
      next: "check whether complexity ratings are applied consistently",
    },
  ],
  Travel: [
    {
      title: "A better arrival guide",
      place: "Lake Hostel",
      organiser: "Tessa Moon",
      initiative: "a visitor arrival guide",
      problem: "guests confused the coach stop with the railway entrance",
      method: "a picture guide showing the walk from each arrival point",
      target: "first-time hostel guests",
      result: "fewer guests telephoned for directions",
      object: "arrival guide",
      olderMethod: "a written street address without a map",
      evaluation: "reception call records",
      next: "add directions for guests arriving by bicycle",
    },
    {
      title: "Booking a quieter visit",
      place: "Copper Museum",
      organiser: "Ben Rose",
      initiative: "a timed-entry experiment",
      problem: "large tour groups crowded the entrance at the same time",
      method: "groups selected separate arrival windows",
      target: "group tour leaders",
      result: "visitors spent less time waiting outside",
      object: "entry ticket",
      olderMethod: "accepting every group at the hour",
      evaluation: "queue measurements and visitor comments",
      next: "reserve a quieter hour for visitors needing extra assistance",
    },
    {
      title: "Trails and local livelihoods",
      place: "Fern Valley",
      organiser: "Zara Mills",
      initiative: "a walking-route partnership",
      problem:
        "visitors passed through villages without spending money locally",
      method: "routes connected village markets and locally run guesthouses",
      target: "rural tourism cooperatives",
      result: "a larger share of visitor spending stayed in the valley",
      object: "trail booklet",
      olderMethod: "advertising only the main scenic viewpoint",
      evaluation: "anonymous spending diaries and business interviews",
      next: "monitor whether increased visitor numbers strain water supplies",
    },
    {
      title: "Counting the hidden journey",
      place: "Silver Port",
      organiser: "Kiran Dale",
      initiative: "a tourism emissions comparison",
      problem:
        "hotel energy figures ignored travel to and within a destination",
      method: "door-to-door travel included in each visitor itinerary",
      target: "regional tourism planners",
      result:
        "some short stays had higher total emissions than longer local visits",
      object: "itinerary survey",
      olderMethod: "comparing only energy used inside accommodation",
      evaluation: "sensitivity analysis using several transport assumptions",
      next: "publish ranges rather than a single emissions estimate",
    },
  ],
  Arts: [
    {
      title: "Labels you can read",
      place: "Willow Gallery",
      organiser: "Cora Nash",
      initiative: "a gallery-label redesign",
      problem: "visitors found small labels difficult to read",
      method: "larger print and a short plain-language introduction",
      target: "gallery visitors",
      result: "more visitors read a label before moving on",
      object: "display label",
      olderMethod: "small print containing specialist terms",
      evaluation: "observations near selected artworks",
      next: "create a large-print guide for the temporary exhibition",
    },
    {
      title: "Music beyond the hall",
      place: "Quarry Hall",
      organiser: "Leon Birch",
      initiative: "a neighbourhood concert series",
      problem: "residents far from the centre rarely attended concerts",
      method: "short performances held in local community rooms",
      target: "residents of outer neighbourhoods",
      result: "more first-time listeners attended a live performance",
      object: "programme leaflet",
      olderMethod: "holding every performance in the central concert hall",
      evaluation: "postcode data and optional audience surveys",
      next: "offer a daytime performance for shift workers",
    },
    {
      title: "An exhibition shaped by listeners",
      place: "Moss Archive",
      organiser: "Sofia Lake",
      initiative: "an oral-history exhibition",
      problem:
        "official records omitted everyday experiences of factory workers",
      method:
        "recorded interviews displayed alongside photographs and documents",
      target: "former factory workers",
      result: "visitors described a wider range of perspectives on the factory",
      object: "audio guide",
      olderMethod: "displaying only management records and dates",
      evaluation: "visitor reflections coded for different viewpoints",
      next: "invite interviewees to review how their accounts are presented",
    },
    {
      title: "Who chooses what survives",
      place: "Marble Centre",
      organiser: "Otto Vale",
      initiative: "a digital archive selection review",
      problem:
        "digitisation quotas favoured easily scanned objects over culturally significant ones",
      method: "community significance considered alongside technical cost",
      target: "archivists and community advisers",
      result: "previously overlooked materials entered the digitisation queue",
      object: "selection register",
      olderMethod: "prioritising materials according to scanning speed",
      evaluation: "comparison of selected and rejected collections",
      next: "examine whose voices remain absent from the selection panel",
    },
  ],
  Community: [
    {
      title: "A noticeboard for everyone",
      place: "Ash Estate",
      organiser: "Rosa Brook",
      initiative: "a shared noticeboard",
      problem: "residents did not know when local activities happened",
      method: "a weekly calendar posted beside the main entrance",
      target: "housing-estate residents",
      result: "more residents attended a local activity",
      object: "event calendar",
      olderMethod: "announcing events only through a private online group",
      evaluation: "attendance lists and doorstep conversations",
      next: "add a box where residents can suggest activities",
    },
    {
      title: "Tools instead of cupboards",
      place: "Hawthorn Centre",
      organiser: "Adam Grey",
      initiative: "a neighbourhood tool library",
      problem: "residents bought expensive tools they used only once",
      method: "tools borrowed after a brief demonstration",
      target: "residents carrying out small home repairs",
      result: "fewer borrowers bought a duplicate tool",
      object: "borrower card",
      olderMethod: "each household buying its own equipment",
      evaluation: "loan records and borrower follow-ups",
      next: "hold a monthly repair workshop",
    },
    {
      title: "A meeting at the right time",
      place: "Canal Ward",
      organiser: "Nadia Snow",
      initiative: "a public consultation redesign",
      problem:
        "evening meetings excluded carers and people working late shifts",
      method:
        "the same discussion offered at three times with written submissions accepted",
      target: "residents affected by a redevelopment plan",
      result: "comments came from a wider range of households",
      object: "response form",
      olderMethod: "one evening meeting without another way to respond",
      evaluation: "anonymous participation data",
      next: "report which suggestions changed the final plan",
    },
    {
      title: "Trust after a small decision",
      place: "Beech District",
      organiser: "Imran Hale",
      initiative: "a participatory budgeting trial",
      problem: "residents doubted whether consultations influenced spending",
      method: "residents chose between a small set of costed projects",
      target: "district residents",
      result:
        "participants could more often identify a decision their vote had affected",
      object: "ballot paper",
      olderMethod:
        "collecting broad suggestions without publishing a decision trail",
      evaluation: "follow-up interviews with participants and non-participants",
      next: "check whether participation remains broad when budgets increase",
    },
  ],
  Food: [
    {
      title: "Lunch without the queue",
      place: "Birch Canteen",
      organiser: "Yuki Hill",
      initiative: "a lunch pre-order scheme",
      problem: "students spent most of their lunch break waiting",
      method: "a paper order placed before the morning lesson",
      target: "college students",
      result: "students collected meals more quickly",
      object: "order slip",
      olderMethod: "taking every order at the counter at lunchtime",
      evaluation: "queue timing on comparable weekdays",
      next: "offer a second collection point",
    },
    {
      title: "A smaller serving first",
      place: "Acorn Café",
      organiser: "Miles Kent",
      initiative: "a flexible-portion trial",
      problem: "large fixed portions produced avoidable food waste",
      method: "a smaller first serving with a free additional portion",
      target: "café customers",
      result: "less edible food remained on plates",
      object: "portion guide",
      olderMethod: "serving the same large portion to every customer",
      evaluation: "weighing plate waste after lunch",
      next: "test the approach during the evening service",
    },
    {
      title: "Dates that mean different things",
      place: "Poppy Store",
      organiser: "Amelia Birch",
      initiative: "a food-label explanation project",
      problem: "customers confused quality dates with safety dates",
      method: "short explanations placed beside two types of date labels",
      target: "food shoppers",
      result: "shoppers distinguished the two date types more accurately",
      object: "label card",
      olderMethod: "displaying a date without explaining its purpose",
      evaluation: "scenario questions rather than self-reported understanding",
      next: "test labels on products sold in different packaging",
    },
    {
      title: "Resilience beyond one crop",
      place: "Saffron Farm",
      organiser: "Ravi Marsh",
      initiative: "a crop-diversification assessment",
      problem:
        "a single profitable crop left farms exposed to weather and price shocks",
      method: "rotations compared using income variability and soil measures",
      target: "small farm cooperatives",
      result:
        "diverse rotations reduced income variation despite a lower peak return",
      object: "harvest ledger",
      olderMethod: "judging crops solely by the best annual yield",
      evaluation: "multi-season records from matched plots",
      next: "assess whether labour needs make diversification less feasible for some farms",
    },
  ],
  Science: [
    {
      title: "A weather diary at school",
      place: "Aspen School",
      organiser: "Ella Dawn",
      initiative: "a student weather diary",
      problem:
        "students confused a single rainy day with a long-term weather pattern",
      method: "daily observations recorded on the same chart",
      target: "primary school students",
      result: "students compared several days before making a claim",
      object: "weather chart",
      olderMethod: "describing the weather from memory",
      evaluation: "short tasks using an unfamiliar week of observations",
      next: "add wind direction to the chart",
    },
    {
      title: "Testing the same soil twice",
      place: "Juniper Lab",
      organiser: "Alex Rowan",
      initiative: "a soil-sampling lesson",
      problem:
        "students treated one measurement as a complete description of a field",
      method: "several samples collected from marked locations",
      target: "introductory science students",
      result: "students reported a range rather than one isolated value",
      object: "sample tray",
      olderMethod: "taking one sample beside the gate",
      evaluation: "laboratory reports and sampling maps",
      next: "compare samples before and after heavy rainfall",
    },
    {
      title: "The citizen observation gap",
      place: "Falcon Reserve",
      organiser: "Chloe Mead",
      initiative: "a volunteer wildlife survey",
      problem: "most observations came from easily reached paths",
      method: "volunteers assigned to both popular and less accessible routes",
      target: "citizen-science volunteers",
      result: "records covered more of the reserve",
      object: "route grid",
      olderMethod: "letting volunteers choose any route",
      evaluation: "coverage maps and checks of duplicate observations",
      next: "study whether less accessible routes need extra safety support",
    },
    {
      title: "Results before interpretation",
      place: "Quartz Laboratory",
      organiser: "Owen Flint",
      initiative: "a preregistration exercise",
      problem:
        "analysts could change their preferred explanation after seeing results",
      method: "analysis plans recorded before data were examined",
      target: "postgraduate researchers",
      result:
        "reports distinguished planned tests from later exploratory analyses",
      object: "protocol file",
      olderMethod: "writing an analysis plan after viewing the data",
      evaluation: "independent comparison of plans and final reports",
      next: "examine how unexpected findings can be reported transparently",
    },
  ],
  Finance: [
    {
      title: "A budget in envelopes",
      place: "Hazel Centre",
      organiser: "Grace Moor",
      initiative: "a weekly budgeting class",
      problem: "learners lost track of small daily purchases",
      method: "planned spending divided into labelled envelopes",
      target: "young adults managing their first income",
      result: "learners recorded more small purchases",
      object: "spending diary",
      olderMethod: "checking only the bank balance at the end of the month",
      evaluation: "anonymous weekly spending records",
      next: "add a lesson on irregular expenses",
    },
    {
      title: "Saving with a reminder",
      place: "Orchard Bank",
      organiser: "Finn Bell",
      initiative: "a savings reminder trial",
      problem: "customers intended to save but forgot on payday",
      method: "an optional reminder linked to the date income arrived",
      target: "customers with regular monthly income",
      result: "more customers made their planned monthly transfer",
      object: "reminder card",
      olderMethod: "a general savings advertisement sent at random times",
      evaluation: "consented transfer records",
      next: "test reminders for people with irregular income",
    },
    {
      title: "Comparing the whole cost",
      place: "Atlas Cooperative",
      organiser: "Layla Rivers",
      initiative: "a borrowing-cost workshop",
      problem: "low monthly payments concealed longer repayment periods",
      method: "loans compared by total cost and repayment duration",
      target: "first-time borrowers",
      result:
        "participants identified more costly loans despite smaller monthly payments",
      object: "cost worksheet",
      olderMethod: "choosing the smallest advertised monthly payment",
      evaluation: "decisions on fictional loan offers",
      next: "include fees that depend on payment behaviour",
    },
    {
      title: "A guarantee with conditions",
      place: "Topaz Institute",
      organiser: "Hugo Lane",
      initiative: "a financial-disclosure study",
      problem:
        "prominent guarantees distracted readers from important exceptions",
      method: "exceptions displayed beside the headline guarantee",
      target: "adults comparing savings products",
      result: "readers noticed more conditions affecting the guarantee",
      object: "disclosure sheet",
      olderMethod: "placing exceptions in a distant footnote",
      evaluation: "comprehension questions on unfamiliar products",
      next: "test whether understanding changes choices under time pressure",
    },
  ],
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const pick = (index: number, values: string[]) =>
  values[index % values.length]!;
const makeQuestion = (
  id: string,
  number: number,
  type: StoredQuestion["type"],
  prompt: string,
  answer: string,
  evidence: string,
  explanation: string,
  options?: string[],
  subskill = "detail",
  wordLimit?: number,
): StoredQuestion => ({
  id: `${id}-q${number}`,
  number,
  type,
  prompt,
  answer,
  evidence,
  explanation,
  sectionIndex: 0,
  subskill,
  ...(options ? { options } : {}),
  ...(wordLimit ? { wordLimit } : {}),
});

function readingLesson(
  topic: string,
  entry: CaseStudy,
  level: number,
  serial: number,
): StoredContent {
  const id = `reading-${slug(topic)}-${level + 1}`;
  const count = 28 + serial * 3;
  const weeks = 4 + level * 2;
  const completion = 76 + (serial % 19);
  const year = 2021 + (serial % 5);
  const beginning =
    level === 0
      ? `${entry.organiser} works at ${entry.place}. In ${year}, the team started ${entry.initiative}. It wanted to help ${entry.target}. The problem was clear: ${entry.problem}. Before the project, people relied on ${entry.olderMethod}. This did not solve the problem.`
      : `In ${year}, ${entry.organiser} coordinated ${entry.initiative} at ${entry.place}. The project responded to a practical difficulty: ${entry.problem}. Its intended participants were ${entry.target}, rather than the general population. Previously, the organisation had relied on ${entry.olderMethod}. Although familiar, this approach left the central difficulty unresolved. The new project was therefore designed around a specific change, not a promise to solve every related problem.`;
  const protocol = `The team introduced ${entry.method}. A total of ${count} participants signed up for the project, which lasted ${weeks} weeks. Every participant received a ${entry.object}. Joining the project was free; participation did not require buying the equipment used by the team. Participants could leave at any time. Only ${completion}% of those who signed up completed the whole programme. The organisers recorded departures as well as successful completions, so the result did not simply describe the people who stayed.`;
  const evidence = `To evaluate the change, the team used ${entry.evaluation}. The central finding was that ${entry.result}. The organisers did not collect participants' salary information. The evaluation was limited to this setting and this group; it was not a comparison of every possible solution. Several participants explained that clear instructions mattered as much as the new arrangement. A successful result in one location may therefore depend on how the work is organised.`;
  const caution =
    level < 2
      ? `The author thinks it is too early to say this approach works everywhere. Another place may have different needs. The next step is to ${entry.next}. The team will first check whether it can keep the useful parts of the project running. A larger project is not automatically a better one.`
      : `The author argues that these findings do not establish that the approach will work everywhere. An encouraging local result is evidence worth investigating, but it is not proof of a universal effect. Differences in staffing, resources and participant selection may alter the outcome. The next step is to ${entry.next}. This follow-up is intended to examine a remaining uncertainty rather than merely repeat a favourable headline. In particular, the team wants to preserve the distinction between observing a change and demonstrating why that change occurred.`;
  const text = `[A] ${beginning}\n\n[B] ${protocol}\n\n[C] ${evidence}\n\n[D] ${caution}`;
  const q: StoredQuestion[] = [
    makeQuestion(
      id,
      1,
      "choice",
      `Which difficulty led to ${entry.initiative}?`,
      entry.problem,
      `The problem was clear: ${entry.problem}.`,
      "Chọn khó khăn được nêu trong đoạn A; các phương án khác là phương pháp hoặc kế hoạch, không phải nguyên nhân.",
      [
        entry.problem,
        "participants refused all forms of evaluation",
        "the organisation had no physical location",
        "the project needed to advertise a commercial product",
      ],
      "main-idea",
    ),
    makeQuestion(
      id,
      2,
      "text",
      `Where did the case study "${entry.title}" take place? Write NO MORE THAN TWO WORDS.`,
      entry.place,
      `at ${entry.place}`,
      "Tên địa điểm được nêu ở đoạn A; không trả lời tên người điều phối.",
      undefined,
      "detail",
      2,
    ),
    makeQuestion(
      id,
      3,
      "text",
      `How many people initially signed up for ${entry.initiative}? Write ONE NUMBER.`,
      String(count),
      `A total of ${count} participants signed up`,
      "Phân biệt số người đăng ký ban đầu và phần trăm hoàn thành.",
      undefined,
      "number",
      1,
    ),
    makeQuestion(
      id,
      4,
      "true-false",
      `${entry.place}: participation required an equipment purchase.`,
      "FALSE",
      "Joining the project was free; participation did not require buying the equipment used by the team.",
      "FALSE: văn bản trực tiếp nói không cần mua thiết bị, trái với phát biểu.",
      ["TRUE", "FALSE", "NOT GIVEN"],
      "contradiction",
    ),
    makeQuestion(
      id,
      5,
      "true-false",
      `Every person who joined ${entry.organiser}'s project completed it.`,
      "FALSE",
      `Only ${completion}% of those who signed up completed the whole programme.`,
      'FALSE: phần trăm hoàn thành nhỏ hơn 100%; "every" là tuyệt đối không đúng.',
      ["TRUE", "FALSE", "NOT GIVEN"],
      "quantifier",
    ),
    makeQuestion(
      id,
      6,
      "true-false",
      `Most participants at ${entry.place} preferred attending meetings on Fridays.`,
      "NOT GIVEN",
      "The passage gives no information about a preferred day of the week.",
      "NOT GIVEN: không có dữ liệu sở thích ngày trong tuần; không suy từ lịch chương trình.",
      ["TRUE", "FALSE", "NOT GIVEN"],
      "absence-of-evidence",
    ),
    makeQuestion(
      id,
      7,
      "matching",
      `Which paragraph explains how the outcome of "${entry.title}" was assessed?`,
      "C",
      `To evaluate the change, the team used ${entry.evaluation}.`,
      "Đoạn C mô tả cách thu thập bằng chứng đánh giá; B mô tả cách triển khai.",
      ["A", "B", "C", "D"],
      "matching-information",
    ),
    makeQuestion(
      id,
      8,
      "text",
      `How many weeks did the trial at ${entry.place} last? Write ONE NUMBER.`,
      String(weeks),
      `which lasted ${weeks} weeks`,
      "Cần số tuần, không lấy năm bắt đầu.",
      undefined,
      "duration",
      1,
    ),
    makeQuestion(
      id,
      9,
      "choice",
      `What was actually introduced in ${entry.organiser}'s initiative?`,
      entry.method,
      `The team introduced ${entry.method}.`,
      "Đọc phương pháp mới ở đoạn B; đừng chọn cách làm cũ được nhắc ở đoạn A.",
      [
        entry.olderMethod,
        entry.method,
        "a compulsory fee for every participant",
        "a ban on leaving the programme",
      ],
      "paraphrase",
    ),
    makeQuestion(
      id,
      10,
      "choice",
      `What follow-up is proposed after "${entry.title}"?`,
      entry.next,
      `The next step is to ${entry.next}.`,
      "Kế hoạch tương lai nằm ở đoạn D, không phải kết quả đã đạt được.",
      [
        entry.evaluation,
        "publish the salary of each participant",
        entry.next,
        "stop collecting evidence permanently",
      ],
      "future-plan",
    ),
    makeQuestion(
      id,
      11,
      "yes-no",
      `The author believes that the findings from ${entry.place} prove the approach works everywhere.`,
      "NO",
      level < 2
        ? "The author thinks it is too early to say this approach works everywhere."
        : "The author argues that these findings do not establish that the approach will work everywhere.",
      "NO: tác giả trực tiếp bác bỏ khẳng định hiệu quả phổ quát; đây là quan điểm, không chỉ là thông tin thiếu.",
      ["YES", "NO", "NOT GIVEN"],
      "author-position",
    ),
    makeQuestion(
      id,
      12,
      "true-false",
      `The project led by ${entry.organiser} recorded people who left before the end.`,
      "TRUE",
      "The organisers recorded departures as well as successful completions",
      "TRUE: dữ liệu gồm cả người rời chương trình, không chỉ người hoàn thành.",
      ["TRUE", "FALSE", "NOT GIVEN"],
      "detail",
    ),
    makeQuestion(
      id,
      13,
      "text",
      `What did every participant in "${entry.title}" receive? Write NO MORE THAN TWO WORDS.`,
      entry.object,
      `Every participant received a ${entry.object}.`,
      "Chép đúng cụm danh từ cho vật/tài liệu nhận được; không thêm mạo từ vì hạn hai từ.",
      undefined,
      "completion",
      2,
    ),
    makeQuestion(
      id,
      14,
      "choice",
      `Which summary best captures the conclusion about "${entry.title}"?`,
      "A useful local change needs further investigation.",
      caution,
      "Kết quả có triển vọng nhưng giới hạn địa phương; tác giả chưa khẳng định thành công ở mọi nơi.",
      [
        "A useful local change needs further investigation.",
        "The original difficulty has been solved in every setting.",
        "No evidence was collected during the trial.",
        "Leaving a project always proves the method is ineffective.",
      ],
      "inference",
    ),
  ];
  // Evidence references point into the actual passage. The A2 wording has a
  // shorter first paragraph; use its exact variant for item 1.
  q[0]!.evidence =
    level === 0
      ? `The problem was clear: ${entry.problem}.`
      : `The project responded to a practical difficulty: ${entry.problem}.`;
  return {
    id,
    skill: "reading",
    title: entry.title,
    description: `Đọc case study nguyên bản về ${entry.initiative}; luyện phân biệt thông tin, mâu thuẫn và điều chưa được cung cấp.`,
    topic,
    band: bands[level]!,
    cefr: levels[level]!,
    testType: level % 2 ? "academic" : "both",
    durationMinutes: 20,
    format: "lesson",
    questions: q,
    sections: [{ id: `${id}-section`, title: entry.title, text }],
    vocabularyIds: [],
    tags: [
      "case-study",
      "detail",
      "true-false-not-given",
      "author-position",
      `difficulty:${levels[level]}`,
      "fictional-case",
    ],
    source: "authored",
    quality: "authored-unreviewed",
    createdAt,
  };
}

function listeningLesson(
  topic: string,
  entry: CaseStudy,
  level: number,
  serial: number,
): StoredContent {
  const id = `listening-${slug(topic)}-${level + 1}`;
  const firstName = pick(serial, [
    "Jamie",
    "Alex",
    "Morgan",
    "Robin",
    "Taylor",
    "Casey",
  ]);
  const date = String(12 + (serial % 15));
  const previousDate = String(Number(date) - 2);
  const price = String(18 + (serial % 13));
  const oldPrice = String(Number(price) + 6);
  const places = String(10 + (serial % 17));
  const duration = String(40 + (serial % 5) * 10);
  const room = String(201 + serial);
  const contact = `learn${serial + 1}@example.org`;
  const start = pick(serial, [
    "nine thirty",
    "ten fifteen",
    "eleven thirty",
    "two fifteen",
  ]);
  const accent = pick(serial, [
    "british",
    "american",
    "australian",
  ]) as DialogueLine["accent"];
  const lines: DialogueLine[] = [
    {
      speaker: firstName,
      accent,
      text: `Hello. I'm asking about the session connected with ${entry.initiative}. Is it at ${entry.place}?`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `Yes, at ${entry.place}. The session is designed for ${entry.target}. We focus on the problem that ${entry.problem}.`,
    },
    {
      speaker: firstName,
      accent,
      text: `My first message says the session is on the ${previousDate}th. Is that still correct?`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `We originally planned the ${previousDate}th, but changed it. The confirmed date is the ${date}th of November. Please use the new date.`,
    },
    {
      speaker: firstName,
      accent,
      text: `And the price is ${oldPrice} pounds, isn't it?`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `That includes an optional printed booklet. The session alone costs ${price} pounds. You do not need to buy the booklet.`,
    },
    {
      speaker: firstName,
      accent,
      text: `Will you be demonstrating ${entry.olderMethod}? I saw it mentioned online.`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `We mention that as the older approach. The main demonstration uses ${entry.method}. This distinction is important because our aim is to address the original difficulty.`,
    },
    {
      speaker: firstName,
      accent,
      text: `What should I bring? I could bring a laptop, or perhaps a camera.`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `Neither is needed. Please bring a ${entry.object}. We'll use that during the practical activity. We supply any other equipment.`,
    },
    {
      speaker: firstName,
      accent,
      text: `How long is the actual session, excluding the break?`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `The teaching lasts ${duration} minutes. A separate ten-minute break comes afterwards. The start time is ${start}.`,
    },
    {
      speaker: firstName,
      accent,
      text: `I can see two locations on the notice: the main hall and a classroom.`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `The main hall is only the meeting point. Teaching takes place in room ${room}. There are ${places} available places; that is the capacity, not the number already booked.`,
    },
    { speaker: firstName, accent, text: `Can I book by telephone?` },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `Our telephone line only gives general information. To book, send an email to ${contact}. The subject line should be "November session".`,
    },
    {
      speaker: firstName,
      accent,
      text: `How will you know if the activity helps?`,
    },
    {
      speaker: entry.organiser,
      accent: "british",
      text: `Our evaluation will use ${entry.evaluation}. We want evidence rather than just enthusiastic comments. Later we plan to ${entry.next}. That is a proposal, not a service available at this session.`,
    },
    {
      speaker: firstName,
      accent,
      text: `Let me check: the revised date, the session-only price, and the classroom number. Thank you for explaining the differences.`,
    },
  ];
  if (level >= 2) {
    lines.splice(17, 0, {
      speaker: "Dr Ellis",
      accent: "american",
      text: `A useful result does not settle every question. The earlier project found that ${entry.result}, but the group was restricted to ${entry.target}. We should distinguish the observation from a claim that the effect will be identical in every setting.`,
    });
  }
  const text = lines
    .map((line) => `${line.speaker}: ${line.text}`)
    .join("\n\n");
  const q: StoredQuestion[] = [
    makeQuestion(
      id,
      1,
      "text",
      `Write the confirmed November date for the "${entry.title}" session. ONE NUMBER ONLY.`,
      date,
      `The confirmed date is the ${date}th of November.`,
      "Người nói tự đính chính ngày dự kiến; lấy ngày confirmed, không lấy ngày trong tin nhắn cũ.",
      undefined,
      "self-correction",
      1,
    ),
    makeQuestion(
      id,
      2,
      "text",
      `How many pounds does the "${entry.title}" session cost without the booklet? ONE NUMBER ONLY.`,
      price,
      `The session alone costs ${price} pounds.`,
      "Giá cao hơn bao gồm booklet tùy chọn; câu hỏi yêu cầu session alone.",
      undefined,
      "distractor",
      1,
    ),
    makeQuestion(
      id,
      3,
      "text",
      `What item must participants bring to ${entry.place}? NO MORE THAN TWO WORDS.`,
      entry.object,
      `Please bring a ${entry.object}.`,
      "Laptop và camera được nhắc rồi phủ định; ghi vật được yêu cầu.",
      undefined,
      "negation",
      2,
    ),
    makeQuestion(
      id,
      4,
      "text",
      `How many minutes of teaching does ${entry.organiser} announce? ONE NUMBER ONLY.`,
      duration,
      `The teaching lasts ${duration} minutes.`,
      "Không cộng thêm 10 phút nghỉ vì câu hỏi loại trừ break.",
      undefined,
      "number",
      1,
    ),
    makeQuestion(
      id,
      5,
      "text",
      `Which room is used for the teaching at ${entry.place}? ONE NUMBER ONLY.`,
      room,
      `Teaching takes place in room ${room}.`,
      "Main hall chỉ là meeting point, không phải phòng học.",
      undefined,
      "location",
      1,
    ),
    makeQuestion(
      id,
      6,
      "text",
      `How many places are available for the session coordinated by ${entry.organiser}? ONE NUMBER ONLY.`,
      places,
      `There are ${places} available places; that is the capacity`,
      "Phân biệt sức chứa tối đa với số người đã đặt.",
      undefined,
      "capacity",
      1,
    ),
    makeQuestion(
      id,
      7,
      "choice",
      `How should a participant book the "${entry.title}" session?`,
      "Send an email.",
      `To book, send an email to ${contact}.`,
      "Telephone chỉ cung cấp thông tin; booking qua email.",
      [
        "Call the information line.",
        "Buy a booklet in the main hall.",
        "Send an email.",
        "Arrive without registering.",
      ],
      "purpose",
    ),
    makeQuestion(
      id,
      8,
      "choice",
      `Which technique is the main demonstration in the ${topic.toLowerCase()} session?`,
      entry.method,
      `The main demonstration uses ${entry.method}.`,
      "Cách làm cũ chỉ được nhắc để đối chiếu, không phải kỹ thuật chính.",
      [
        entry.olderMethod,
        "taking photographs throughout the lesson",
        entry.method,
        "buying personal equipment in advance",
      ],
      "contrast",
    ),
    makeQuestion(
      id,
      9,
      "matching",
      `Match the evaluation of "${entry.title}" to the method announced.`,
      entry.evaluation,
      `Our evaluation will use ${entry.evaluation}.`,
      "Chọn cách thu evidence, không chọn kế hoạch mở rộng trong tương lai.",
      [
        entry.next,
        "the number of booklets sold",
        entry.evaluation,
        "the volume of telephone enquiries",
      ],
      "matching-method",
    ),
    makeQuestion(
      id,
      10,
      "choice",
      `What status does the follow-up to "${entry.title}" have?`,
      "It is a proposal for later.",
      `That is a proposal, not a service available at this session.`,
      "Từ later/plan/proposal cho thấy hoạt động tương lai, chưa có ở buổi này.",
      [
        "It is included in the current session.",
        "It has been cancelled permanently.",
        "It is a proposal for later.",
        "It is compulsory before registration.",
      ],
      "speaker-intention",
    ),
  ];
  return {
    id,
    skill: "listening",
    title: `${entry.title}: a practical conversation`,
    description:
      "Hội thoại nguyên bản có tự đính chính, phủ định và thông tin dễ nhầm. Audio dùng provider nếu đã cấu hình; transcript này là nguồn duy nhất của đáp án.",
    topic,
    band: bands[level]!,
    cefr: levels[level]!,
    testType: "both",
    durationMinutes: 15,
    format: "lesson",
    questions: q,
    sections: [
      {
        id: `${id}-section`,
        title:
          level < 2 ? "An enquiry and an organiser" : "A project discussion",
        text,
        dialogue: lines,
        instructions:
          "Answer from the conversation. Look out for information corrected later.",
      },
    ],
    vocabularyIds: [],
    tags: [
      "dialogue",
      "self-correction",
      "negation",
      "number",
      "matching-method",
      `difficulty:${levels[level]}`,
      "fictional-session",
    ],
    source: "authored",
    quality: "authored-unreviewed",
    createdAt,
  };
}

export const readingLessons: StoredContent[] = [];
export const listeningLessons: StoredContent[] = [];
for (const [topicIndex, topic] of topics.entries()) {
  for (const [level, entry] of cases[topic].entries()) {
    readingLessons.push(
      readingLesson(topic, entry, level, topicIndex * 4 + level),
    );
    listeningLessons.push(
      listeningLesson(topic, entry, level, topicIndex * 4 + level),
    );
  }
}

// Topic background modules extend only mock passages. These are original authored
// context, reused transparently across forms; the short lessons remain unchanged.
// They discuss general mechanisms, not additional participant facts from the case.
const readingBackground: Record<string, string[]> = {
  Education: [
    `A community learning project usually needs more than a room and a stack of books. People need to know what they can expect before they arrive: whether they will work alone, talk to a partner, or ask for help. A clear welcome sheet can explain these choices without promising a particular result. It can also distinguish the activity from a formal examination. Some learners value a certificate, while others simply want to complete a task they once avoided. A programme that states its purpose plainly makes it easier for people to decide whether that purpose matches their own needs.`,
    `Practical arrangements can influence participation before any teaching takes place. Directions should identify the correct entrance and explain how to ask for access assistance. Materials need to be available in a readable format, with a way to borrow them rather than an assumption that everyone owns suitable equipment. An organiser should describe what happens if someone misses a session. Catch-up notes may be useful, but they are not necessarily a substitute for interaction. These arrangements make a programme understandable; they do not guarantee that every person who initially expresses interest will continue to the end.`,
    `There is an important difference between making a task easier to start and removing the challenge that makes it educational. An explanation given too early can turn a problem into a copying exercise. Withholding every hint, however, may prevent a learner from discovering where to begin. Teachers can make the next step visible while leaving the reasoning to the student. For example, asking someone to explain why an alternative is unsuitable reveals more than asking for a correct final answer. This approach requires time for discussion, which should be included in planning rather than treated as an optional extra.`,
    `Peer work has similar trade-offs. A confident learner may describe an answer so quickly that a partner has no opportunity to think. Giving partners different responsibilities can help: one proposes an explanation, while the other checks whether it fits the evidence. Responsibilities can then be exchanged. The value of the exchange depends on the task and the relationship between the learners; putting two people at the same table is not itself evidence of collaboration. Observation notes should therefore distinguish talking, taking turns and reconsidering an answer. Each behaviour provides a different indication of what the activity has achieved.`,
    `Assessment also shapes behaviour. If only speed is rewarded, a student who checks a difficult assumption may appear less successful than someone who guesses quickly. If only completion is counted, a student can finish without understanding the underlying idea. A useful review combines the product with some record of the process, such as a short explanation of a decision. Such evidence is imperfect: people may struggle to describe knowledge they can use correctly, or write a fluent explanation of a familiar example. Unfamiliar tasks help reveal whether an apparent improvement extends beyond material practised during the programme.`,
    `Longer-term interpretation requires restraint. A better performance soon after instruction may reflect familiarity with the activity, greater confidence, or genuine learning, and these explanations can overlap. A later check should use a comparable challenge rather than merely repeat the original questions. It should also record whether learners had further opportunities to practise in the meantime. Retention cannot be inferred from attendance alone. Nor does an improvement in one subject automatically establish a benefit in another. The strongest conclusion identifies what changed, for whom, and under which conditions, while leaving the unanswered questions visible to the reader.`,
  ],
  Environment: [
    `A local environmental activity benefits from instructions that show what residents can do immediately. A collection point needs a visible label, a description of acceptable materials and a contact for problems. If a container is intended for one kind of waste, the notice should say what must not go into it as well as what may. Maintenance responsibilities should be clear. A damaged lid or a blocked access path can undermine a sensible design. Residents should not have to guess whether the project is still operating when the physical arrangement differs from the information on its noticeboard.`,
    `Before making a change, organisers can walk through the existing process from the user's point of view. Where does a person obtain the necessary material? How far must it be carried? What happens when the usual collection point is full? These questions reveal obstacles that an attractive poster cannot remove. A project may need a small operational change rather than a larger publicity campaign. Providing a way to report problems is useful only if someone has responsibility for responding. Publishing a brief update about a resolved problem shows that the reporting route leads to practical action rather than an unanswered message.`,
    `Environmental outcomes are rarely captured by a single visible improvement. A tidy collection area does not establish that its contents were processed appropriately after removal. Similarly, healthier-looking plants do not by themselves show how much additional water was used. Measures need to follow the relevant material or process far enough to answer the project's question. This does not mean a small local team must measure every possible effect. It means that the boundary of an evaluation should be stated. A result about one stage should not be presented as evidence about the entire system that contains it.`,
    `Seasonal variation can complicate a comparison. An intervention introduced during a cooler or wetter period may appear successful partly because demand changed for reasons outside the project. Comparing neighbouring areas can help, but they may differ in exposure, use or maintenance. Repeated observations are more informative than a photograph taken on a favourable day. The timing of measurements matters as well: a daily average may conceal a short period when conditions are especially difficult. An honest report explains why its observation schedule was chosen and identifies conditions that the schedule did not capture. This makes the apparent precision easier to interpret.`,
    `Trade-offs become clearer when resources are counted beyond the immediate site. A durable product may take more material to produce but require fewer replacements. A lightweight product may reduce transport effort while being harder to repair or recycle. Neither property alone settles the comparison. Analysts need a common basis, such as providing the same function over a stated period. They should examine what happens to recovered material, not assume that placing it in a recycling container completes the process. Local decisions can still be sensible when the full calculation is uncertain, provided that the uncertainty is described rather than hidden.`,
    `Community participation can also change the meaning of an outcome. People who volunteer may already have habits that differ from those of other residents. A successful result among volunteers therefore raises a question about wider adoption, rather than answering it. It may be possible to preserve the helpful parts of a programme while reducing the effort needed to join. Expansion should be accompanied by fresh observation, because equipment, staffing and motivation can change at a larger scale. The aim is not to dismiss a promising local result, but to understand which features need to remain in place for the benefit to continue.`,
  ],
  Technology: [
    `A technology service should explain its basic operation before asking people to commit to using it. The first screen can show what information is required, what can be changed later, and where to obtain assistance. Labels should describe actions rather than rely entirely on symbols. A person should be able to distinguish saving a draft from sending a final request. Confirmation messages are useful when they state what has happened and what, if anything, the user should do next. A message that merely says success can leave an important practical question unanswered, even when the software has completed its operation correctly.`,
    `Access instructions need to cover ordinary interruptions. A user may lose a connection, close a window or move to another device. The service should state whether unfinished work is retained and how the person can resume it. Borrowed equipment requires clear return and damage procedures, while shared accounts need a reliable way to end a session. These arrangements are not glamorous technical features, but they influence whether a system can be used confidently. Support staff also need a route for reporting repeated difficulties; otherwise the same problem may be explained to each new user without ever being corrected.`,
    `Usability testing is strongest when people carry out a realistic task rather than describe whether a screen looks appealing. An observer can note where they hesitate, which label they interpret differently from its designer, and whether they recover from an error. Assistance should be recorded, because a task completed with continuous guidance is different from an independent completion. A test environment can nevertheless change behaviour: someone may persist longer while an observer is present. The findings therefore identify plausible obstacles, not a guarantee about every future interaction. Revising a design and testing again helps show whether the intended obstacle has actually been reduced.`,
    `Privacy and convenience can pull in different directions. Retaining a previous choice can make a later visit simpler, but it may also retain information a person did not expect to be stored. A short notice is not automatically informative, just as a long notice is not automatically complete. The relevant question is whether people understand a consequence important to their decision. Designers can separate essential explanations from optional detail without hiding the latter. They also need to distinguish consent from simple acknowledgement: a person who dismisses a warning to reach a service has not necessarily expressed a meaningful preference about data use.`,
    `Repairability presents a related problem of measurement. A device can be physically easy to open while its replacement parts remain unavailable. A component can be replaceable in principle but require specialist tools that ordinary users cannot obtain. Counting removable pieces would miss these barriers. A more useful comparison follows an actual fault through diagnosis, part replacement and successful return to use. It should include unsuccessful attempts and the time spent waiting for parts. Material savings depend on these steps as well as on design. A promising modular arrangement needs reliable connections and continuing support if its theoretical advantage is to become a practical one.`,
    `The interpretation of a technical trial should remain tied to its operating conditions. Experienced users may adapt to a complicated design, while newcomers reveal problems that familiarity has concealed. A prototype used for a short period may not expose failures that emerge after repeated handling. Reporting only the best demonstration encourages readers to confuse capability with dependable performance. A useful account describes what the system did, what help was available and which demands were not tested. Further investigation can then target a specific uncertainty. It need not claim that a locally successful tool is suitable for every organisation or every user.`,
  ],
  Transport: [
    `Passenger information works best when it answers the decision a traveller must make at a particular point. At an entrance, the immediate question may be which direction to walk; at a platform, it may be whether the arriving service goes to the intended destination. A complete timetable placed in the wrong location can be less helpful than a small, well-positioned sign. Notices should distinguish a temporary change from the normal route. When a service is moved, information at the old stop matters as much as information at the new one, because that is where an unfamiliar passenger is likely to begin searching.`,
    `A practical travel notice should also explain the limits of the information it gives. An advertised departure time is different from a guaranteed connection, and a map of walking distance does not show every accessibility obstacle. People need a way to check whether lifts, gates or bicycle spaces are available. If a booking is required, the procedure should be visible before someone reaches the restricted area. Instructions for reporting a faulty access card or an unavailable storage space help staff identify recurring operational difficulties. A travel scheme becomes easier to use when these small decisions are anticipated rather than left to guesswork.`,
    `Transport measures can favour one kind of user while concealing another's experience. Average travel time combines journeys with different starting points, waiting periods and transfer risks. A service that is quick when it arrives may still be unreliable for a person with a fixed appointment. The spread of journey times is therefore relevant alongside their average. Planners can distinguish scheduled waiting from delays caused by a missed connection. They should also identify which trips were excluded from a study. An assessment based only on completed journeys may overlook people who abandoned a trip because the service was unavailable or too uncertain.`,
    `Changes to street use create trade-offs between groups who share limited space. A delivery arrangement that benefits pedestrians may require retailers to alter staffing or storage. Moving activity away from a crowded period can reduce obstruction without reducing the total amount of work. The practical question is whether the alternative period is usable for suppliers and receiving businesses. Consultation should ask about constraints, not merely whether people support a broad idea such as safer streets. Observations can then check whether the arrangement actually changes the specific obstruction it was meant to address. The existence of a new timetable does not establish that it is followed.`,
    `Infrastructure and behaviour also interact. Secure bicycle storage can remove one reason not to cycle, but it cannot make every route comfortable or every journey short enough for that choice. An increase at one station may include users who moved from another parking area rather than people who previously travelled by car. A study interested in changed travel choices needs information about previous behaviour, collected without assuming that all new users have the same history. Counting occupied spaces remains useful, but it answers a narrower question. The distinction between use of a facility and a wider transport effect should be preserved in reporting.`,
    `Reliability is particularly sensitive to conditions that a brief trial may not include. Weather, road works and variation in passenger demand can alter the value of a connection or a loading slot. A buffer that protects one transfer may delay other travellers, so a revised arrangement should be assessed as a network rather than an isolated success. Scenario comparisons can identify where the result is most sensitive to assumptions. They do not eliminate uncertainty, but they show which uncertainty matters. The most defensible conclusion describes an improvement in a stated context and explains why continued observation is needed before the arrangement is expanded.`,
  ],
  Health: [
    `Health-related activities need clear information about their purpose and their limits. An invitation to a walking group should explain the route, the expected level of effort and how to ask about access needs. An appointment notice should identify the service and provide a practical cancellation route. These details help people act on the information without assuming that they already know the organisation. A general activity is not the same as individual medical advice. Participants should be told when a question needs to be directed to a qualified professional rather than answered by a volunteer or an administrative member of staff.`,
    `A useful reminder gives a person something specific to do. It may confirm an arrangement, request a response or explain how to change a booking. Repeating a message without clarifying its purpose can create more irritation than understanding. Organisations can ask which communication route is accessible while avoiding unnecessary personal information. They should describe what happens when a message is not delivered. A record that a reminder was sent is not proof that it was read. Staff need to distinguish a communication failure from a deliberate cancellation if they want to improve the service rather than simply count outgoing messages.`,
    `Measurement should match the outcome a project is meant to influence. Attendance can show whether a service was used, but it does not by itself establish an improvement in health. A person's report of better sleep describes an important experience, yet it is not identical to an objective record of every interruption. Different measures can complement each other when their limits are stated. A disagreement between them may reveal something useful: the same noise level, for example, may be experienced differently depending on timing and expectation. Combining evidence should not mean treating unlike measures as if they were interchangeable.`,
    `Changes in a clinical setting can affect patients and staff in different ways. Reducing a nuisance may also alter how quickly a warning is noticed. Reviewing an alarm therefore requires attention to the action it is intended to trigger, not just the sound it produces. A quiet environment is not the sole objective if safety depends on timely communication. Practical trials should describe how important warnings remain visible and who is responsible for responding. Staff feedback can identify unexpected difficulties, while patient feedback can identify disturbances that routine records miss. Both perspectives are relevant, but neither alone resolves every question about effectiveness.`,
    `Risk communication creates another challenge. A relative change can sound large while describing a small difference in absolute terms. Conversely, a small relative change can matter when a condition is common or a large population is affected. Readers need a baseline, a defined group and a stated time period to interpret the comparison. A table can make these relationships clearer, but only if labels distinguish the number of people from the number of events. Repeated events in one person should not be mistaken for several different people. Clear presentation supports a decision; it does not replace discussion of uncertainty or individual circumstances.`,
    `A careful interpretation avoids turning a limited service evaluation into a broad treatment claim. People who choose to join an activity may differ from those who do not, and an improvement can coincide with changes outside the programme. A comparison group can reduce some uncertainty while introducing questions about how comparable the groups really are. Ethical and practical constraints may prevent an ideal experiment, but they do not justify stronger language than the evidence supports. A report can still be useful by identifying the observed change, the population studied and the alternatives not ruled out. Further work should investigate those alternatives rather than simply repeat the positive summary.`,
  ],
  Work: [
    `Workplace instructions are most useful at the point where a task must be performed. A closing list kept near the relevant equipment is easier to consult than a document stored in an unfamiliar folder. Each item should describe an action that can be checked, rather than a vague request to be careful. Instructions also need a route for exceptions: what should a worker do if a tool is missing or a normal step cannot be completed? A checklist should make the sequence clearer without suggesting that reporting a problem is a failure. Supervisors can then distinguish an omitted step from an obstacle that needs their attention.`,
    `Changes to work arrangements should be communicated before people are expected to rely on them. A schedule can identify when it takes effect, which version is current and how a correction will be announced. A meeting notice can explain whether participants should prepare a proposal or simply attend a discussion. These practical details reduce avoidable uncertainty, particularly for people who are new to a team. Staff should know where to raise a conflicting commitment or an access requirement. A published procedure is not automatically a fair one, but making the procedure visible allows people to understand and question the decisions made through it.`,
    `Performance measures influence which tasks receive attention. A target based solely on the number of completed jobs may encourage quick, simple cases to be selected before difficult ones. The resulting total can look impressive while unresolved problems become older. Including complexity can provide a more balanced picture, but a complexity rating is itself a judgement that needs consistent rules. Managers should inspect examples near category boundaries and explain disagreements. Otherwise a revised measure may reward the skill of classifying work rather than the work that actually benefits users. No single total captures quality, timeliness and effort equally well.`,
    `Meetings provide a different example of how procedure shapes an outcome. People may have useful ideas but require time to formulate them, while an early confident proposal can frame the discussion. A written beginning gives participants a record to compare with the eventual decision. It does not remove differences in status or expertise, and some proposals still need discussion to become understandable. An evaluation should ask whose ideas were considered and why they were selected, rather than count the amount of talk. Longer meetings are not necessarily more inclusive, just as a quiet meeting is not necessarily evidence that participants agree.`,
    `Predictability can matter as much as an apparently attractive arrangement. A worker may accept an inconvenient task more easily when there is a clear rotation and enough notice to make plans. A system that allows preferences can nevertheless favour those who submit requests earliest or feel most comfortable asking. Fairness therefore requires a way to examine the distribution of unwanted duties as well as the number of satisfied requests. Confidential feedback may reveal difficulties that public discussion misses. It should be collected in a form that protects individuals, particularly when the team is small enough for a detailed description to reveal its author.`,
    `Interpreting a workplace trial requires attention to adaptation. Staff often make an unfamiliar process work by adding informal steps that are not recorded in the official design. An apparent benefit may depend on this hidden effort, and expansion can become difficult if a larger team cannot reproduce it. Observers should ask how the work was actually performed and compare that account with the intended procedure. This is not an argument against improvement. It is a reason to identify the resources and habits that support it. A sustainable change reduces the original difficulty without quietly moving an unreasonable burden to a different group.`,
  ],
  Travel: [
    `Visitors need information in the order in which they will use it. Arrival directions should begin with the relevant transport stop and identify a recognisable landmark, not assume that a street name is familiar. A guide can separate walking instructions from vehicle access, because the most direct route for one may be unsuitable for the other. It should explain where to ask for help if the expected entrance is closed. Clear directions reduce uncertainty, but the notice should avoid promising that every route is accessible unless that claim has been checked. Visitors can then choose an option that suits their practical needs.`,
    `Booking information should distinguish entry permission from other arrangements. A reservation may provide an arrival window without including transport, refreshments or a guided visit. These differences need to be visible before payment or confirmation. Group organisers should know how to communicate a change in numbers and whether a late arrival affects the booking. A cancellation procedure can prevent unused reservations from blocking places for others. Staff need a current record that is understandable without access to private messages. The aim is not to make visitors learn an elaborate system, but to make the few decisions they need to take reliably clear.`,
    `Crowding is more than a count of visitors over an entire season. The same total can produce very different conditions when arrivals are concentrated into a short period. Measurements at an entrance, along a route and inside a venue can reveal different bottlenecks. Moving the queue from one place to another may improve a photograph while leaving the waiting time unchanged. A useful evaluation follows the visitor experience through the whole relevant process. It should also consider residents and staff who share the space. An arrangement that works for ticket holders can still create an obstacle for people carrying out ordinary local activities.`,
    `Local economic effects require similarly careful boundaries. Money spent near an attraction does not necessarily remain in the surrounding community; supplies and ownership may connect the business to other places. Conversely, a small purchase from a locally run service can support activity that visitor totals alone do not capture. Spending diaries can provide useful detail, but visitors may forget small transactions or decline to report them. Business interviews describe another perspective without providing a complete account by themselves. Estimates should explain which forms of spending are included and avoid treating an increase in gross sales as an identical increase in local benefit.`,
    `Environmental comparisons can change when the boundary of a trip is widened. Energy used by accommodation is only one part of a visit. Travel to the destination, movement within it and the length of a stay affect the total. A shorter trip is not automatically the lower-impact choice if it involves a demanding journey. Analysts need consistent assumptions about transport and occupancy, and they should show how alternative assumptions change the comparison. Ranges can be more informative than a highly precise single figure. They reveal whether an apparent advantage is robust or depends on a choice that is difficult to verify.`,
    `Expansion also changes a destination rather than simply adding more of the same activity. A successful route may attract businesses, alter prices and place new demands on water, waste collection or access roads. Some benefits reach people who did not participate in the original scheme, while some costs may fall on them as well. Continued consultation should therefore include people beyond the businesses most directly involved. A promising local initiative can be worth extending, but its original result should not be used to guarantee that every later stage will have the same balance of effects. Monitoring should follow the questions that growth creates.`,
  ],
  Arts: [
    `A cultural venue can welcome visitors by explaining how they may use the space. A guide should identify entrances, available assistance and any areas where photography or touching is restricted. Labels need readable print and a clear connection to the object they describe. A visitor should be able to distinguish an artist's words from a curator's interpretation. This distinction helps people understand whose perspective they are encountering rather than treating every sentence as an unquestionable fact. A short introduction can make an unfamiliar work approachable without attempting to settle what every viewer ought to think about it.`,
    `Practical notices can also explain the form of an event. A short performance in a community room may have a different atmosphere from a concert with assigned seating. Visitors need to know whether booking is required and whether they may enter after the start. Access information should be specific enough to support a decision, rather than consist only of a broad statement that everyone is welcome. Staff can provide a contact for questions that the notice cannot answer. A venue that changes its arrangement should update the information as well; an outdated guide can create an avoidable barrier despite well-intended assistance on site.`,
    `Audience figures answer a limited but useful question: they show who attended an activity, not necessarily what people gained from it. A person may encounter an unfamiliar art form, recognise a neglected experience or simply enjoy an evening. These outcomes cannot all be reduced to the same attendance total. Feedback questions should be chosen according to the purpose of the programme, and they should leave room for responses the organisers did not predict. Counting first visits can help examine reach, but it does not establish that later participation will continue. Nor does a return visit automatically reveal the reason someone chose to attend.`,
    `Historical exhibitions make selection particularly visible. A document preserved by an institution may reflect what administrators considered worth keeping, while a personal account may describe experience excluded from that record. Neither source should be treated as complete merely because it has a compelling presentation. Dates, authorship and the conditions of collection help visitors assess what each source can support. Contradictory accounts can be displayed with their differences explained rather than smoothed into a single confident story. The resulting exhibition may be more demanding, but it allows visitors to see that an interpretation depends on evidence and on choices about that evidence.`,
    `Digitisation introduces another layer of selection. Easily scanned material may enter an online collection quickly, while fragile, oversized or difficult-to-identify objects wait. An output target based on the number of files can favour technical convenience over cultural significance. A review can therefore examine both what was included and what remains absent. Community advice can reveal overlooked material, but an advisory group also has limits: its members cannot automatically speak for every relevant person. A transparent selection record makes these decisions open to later revision. It is more informative than an unexplained statement that a collection has been made representative.`,
    `Access and preservation sometimes create competing demands. Handling an object can help people understand it, while repeated exposure may place it at risk. A digital image can widen access without conveying scale, texture or the full context of use. Choosing between these approaches requires attention to the question an activity is meant to answer. A successful local display may depend on staff knowledge and relationships that an online copy does not carry with it. Evaluation should therefore describe the form of access provided, the experiences observed and the limitations that remain. Cultural value is not established by technical availability alone.`,
  ],
  Community: [
    `A local notice should make participation possible without requiring membership of an existing social circle. It can state the activity, the place, the route for asking questions and any practical condition that matters before arrival. A noticeboard is useful when someone maintains it: outdated material can make current opportunities difficult to find. Organisers should remove expired notices and identify changes clearly. A paper notice and an online message can complement each other because residents do not all obtain information in the same way. The purpose is to widen the route into an activity, not merely to increase the amount of information displayed.`,
    `Shared resources need procedures that are understandable to occasional users. A borrower should know how to request an item, check its condition and report damage without guessing who is responsible. Equipment that requires instruction should not be issued on the assumption that ownership experience and safe use are the same thing. A simple record can help identify a missing component before another person begins a task. These arrangements also protect the organiser from relying entirely on memory. Rules can remain proportionate: a small neighbourhood service needs a dependable process, rather than a collection of forms that makes borrowing harder than buying.`,
    `Participation totals do not show whether a public discussion includes a broad range of experiences. A large meeting can repeatedly involve the same confident speakers, while a smaller written response may raise a concern that was absent from the room. Different routes for contributing can reduce some barriers, but they can also require different kinds of effort. An evaluation should examine who is able to use each route and how comments move into the decision process. Accepting a submission is not the same as considering it, and considering it is not the same as agreeing with it. These stages should be distinguishable in a public account.`,
    `Trust can grow when people can follow a decision from proposal to outcome. A summary of comments is helpful, but readers also need to know which constraints affected the choice and how disagreements were handled. Publishing a reason for declining a suggestion can be more informative than offering a general expression of thanks. The explanation should address the suggestion itself rather than imply that a contributor failed to understand the issue. Where choices involve limited resources, comparable descriptions help residents judge the alternatives. A consultation becomes easier to assess when its influence is visible and its limits are stated before people invest time in participating.`,
    `Small decisions can provide a practical setting for learning about collective choices. A clearly costed set of alternatives allows residents to compare an immediate benefit with ongoing maintenance. The project with the most visible launch is not necessarily the one with the strongest continuing use. A voting procedure should explain eligibility, the treatment of tied outcomes and the point at which a result becomes final. These features influence confidence in the process independently of whether a person's preferred option wins. Follow-up should examine how the selected project was delivered, rather than treat the announcement of the vote as the end of accountability.`,
    `Scaling up requires renewed attention to representation. A process that works among neighbours who recognise one another may be harder to navigate in a larger district. New participants may need different information, and informal assurances may no longer be sufficient. Some residents may remain absent because participation carries a cost that the organisers have not observed. A broad claim that the community supports a decision should therefore be tied to evidence about the people reached and the opportunities offered. A local success can justify further work while leaving questions about wider inclusion unresolved. Continuing evaluation should focus on those questions rather than simply reproduce the original participation total.`,
  ],
  Food: [
    `Food-service information should help a customer make a practical choice before joining a queue or placing an order. A menu can distinguish the standard serving from optional additions and explain how to ask about ingredients. Allergen information needs a dependable route to staff who can verify it; a guess is not an acceptable substitute for a checked answer. Collection instructions should identify where an order will be ready and how a change will be announced. A scheme intended to simplify service can become confusing if the displayed information and the actual counter arrangement no longer match. Clear notices help prevent that avoidable uncertainty.`,
    `Operational records can support service without collecting more detail than the task requires. A kitchen may need to know how many portions to prepare, but not the personal background of every customer. A collection point needs a reliable way to match an order to its recipient. Staff should know what to do if an order is missing, a customer arrives late or an ingredient is unavailable. These exceptions are ordinary parts of service rather than evidence that the system has failed completely. Planning for them makes the normal process easier to maintain and reduces the pressure to improvise conflicting instructions during a busy period.`,
    `Waste measurements depend on what is included. Food left on a plate differs from preparation scraps, spoiled ingredients or packaging. Weighing these together can conceal whether a change influenced portion size, storage or production. A useful assessment separates categories relevant to its question and explains how samples were collected. Smaller initial servings may reduce leftovers while requiring a practical route to an additional portion. The evaluation should therefore consider whether customers can obtain enough food, rather than treat every reduction in the weight of waste as an unqualified success. Efficiency and adequacy need to be examined together.`,
    `Date labels can communicate different kinds of information. A quality-related date concerns the condition a producer expects, whereas a safety-related instruction can place a different limit on use. The precise meaning depends on the applicable guidance and the product, so a public explanation should avoid suggesting that every date can be ignored. Examples help readers distinguish a decline in quality from a safety concern without asking them to memorise a slogan. Understanding can be checked with scenarios that require a decision. Merely asking whether a label is clear invites a favourable response without showing whether the important distinction has been understood.`,
    `Production decisions have consequences beyond the largest harvest recorded in a favourable season. A crop can provide a high peak return while exposing a farm to a narrow range of weather or market conditions. Diversification may reduce that exposure, but it can also require different skills, equipment and labour. A comparison should include the variation in outcomes, not only their average. The relevant period matters: one season cannot show every benefit or difficulty of a rotation. Soil measures can add information that income records miss, while income records reveal whether an apparently beneficial practice is feasible for the people expected to adopt it.`,
    `Interpreting a food-related project requires the same distinction between observation and a broad recommendation found in other fields. A café, a shop and a farm face different constraints, even when their activities share a concern about waste or resilience. An approach that works in one setting may depend on storage capacity, staff routines or customers' willingness to take an extra step. Reporting these conditions makes the result more useful rather than less impressive. Further testing should examine which conditions can be changed without losing the benefit. It should not assume that a positive result establishes a single best arrangement for all food businesses or all households.`,
  ],
  Science: [
    `A practical science activity begins with an observation that can be recorded in a consistent way. Instructions should state what is being measured, where to record it and how to mark an uncertain reading. Equipment needs a simple check before use, and samples need labels that remain attached to the right container. If an observation cannot be made, a missing entry should be identified rather than replaced with a plausible-looking guess. These habits may seem less exciting than the experiment itself, but they allow another person to understand what the record actually contains. An orderly sheet is useful only when its entries reflect observations.`,
    `Participants also need to distinguish a demonstration from an investigation. A demonstration illustrates an expected process, while an investigation asks a question whose answer should not be assumed in advance. Instructions can explain the purpose without suggesting which result will count as a successful answer. A surprising reading deserves checking, not automatic removal. The check should follow a stated procedure, such as examining the equipment or repeating the measurement. A record of the original and repeated observation makes the decision visible. Without that record, later readers cannot tell whether a neat pattern emerged from the data or from selective tidying.`,
    `Sampling determines the scope of a conclusion. A convenient location may differ from the wider area a researcher wants to describe. Repeating a measurement at that same location reduces some uncertainty without removing the problem of coverage. A sampling plan should therefore explain why locations or cases were chosen. In a volunteer project, accessible routes may receive more attention than difficult ones, and this difference can resemble a pattern in the phenomenon being studied. Mapping observation effort helps separate the two. An absence of recorded sightings is not automatically evidence that nothing was present where no observation was made.`,
    `Measurement variation has more than one source. An instrument may produce slightly different readings, and the thing being measured may also change across time or location. Treating every difference as instrument error can remove meaningful variation; treating every difference as a real effect can give unreliable equipment too much authority. Repeated readings and calibration checks address different parts of the problem. Reports should state what each check was intended to establish. A range can be more informative than a single rounded value when the underlying observations genuinely differ. Precision in presentation cannot compensate for an unexplained measurement process.`,
    `Analysis decisions influence the questions that a dataset can answer. Choosing a comparison after seeing a striking pattern can be a useful way to generate a new hypothesis, but it is different from testing a prediction recorded beforehand. A transparent report identifies these roles instead of presenting every later exploration as though it had been planned. Recording an analysis plan does not make the plan automatically good, and unexpected results should not be hidden simply because they were not anticipated. The purpose is to show when a decision was made and which evidence informed it. Readers can then judge the strength of the resulting claim more accurately.`,
    `Replication is also more demanding than repeating a familiar activity once. A later investigation may use a different setting, equipment or group, and those differences need to be described before outcomes are compared. A changed result can reveal a limit of the original claim rather than a failure of science as a whole. A similar result can be encouraging without eliminating every alternative explanation. The useful question is what remained consistent and what changed between investigations. A careful conclusion preserves that distinction and identifies which uncertainty has been reduced. It leaves room for further work without treating uncertainty as a reason to ignore all available evidence.`,
  ],
  Finance: [
    `A financial notice should help a reader identify the decision it concerns. A course charge, a savings transfer and a loan repayment are different transactions, even when each appears as a payment on a statement. Instructions should identify what information is needed to raise a query and where to send it. A person should not be asked to share unnecessary account details through an unsecured public channel. A clear explanation can distinguish a fee from an optional addition and show how to check an unfamiliar amount. These practical steps support understanding without promising an outcome before the relevant records have been examined.`,
    `Budgeting information is easier to use when it separates regular commitments from expenses that occur less predictably. A plan may appear balanced if it includes daily purchases but omits a replacement, repair or annual charge. Recording categories helps reveal that omission without requiring every person to use the same categories. A reminder can prompt an intended action, but it cannot establish that the action is affordable at that moment. Practical guidance should leave room to revise a plan when circumstances change. The purpose of a record is to make choices visible, not to imply that a tidy record removes every constraint on those choices.`,
    `Comparing products requires a common basis. A small instalment may seem attractive while a longer payment period increases the total amount paid. Fees that arise only under particular conditions can further change the comparison. A worked example should state which conditions it assumes and separate the example from an individual recommendation. Readers need to know whether a figure describes a rate, an amount or a period. Displaying these units clearly is as important as correct arithmetic. A precise calculation answers only the question built into its assumptions; it does not by itself show that a product is appropriate for every person who reads it.`,
    `Behavioural interventions can address a practical obstacle without solving every underlying problem. A reminder timed to an intended action may help someone who had already decided to act, while doing little for someone who lacks the necessary resources. An observed increase in completed actions should therefore be interpreted in relation to the group and the purpose of the trial. People who consent to share records may differ from those who decline. The evaluation can still provide useful evidence, provided that these limits are visible. It should avoid attributing every change to the reminder when other arrangements changed during the same period.`,
    `Guarantees deserve attention to both their headline and their conditions. A reassuring phrase can draw attention away from an exception printed elsewhere. Placing the exception nearby may improve comprehension, but a reader also needs language that makes the consequence understandable. A comprehension task can ask whether a particular fictional situation falls inside or outside the stated protection. This is more informative than asking whether the document looks trustworthy. The goal is not to remove all qualifications from a financial product. It is to make the qualifications available at the point where they matter to a decision, without requiring the reader to infer them from scattered clues.`,
    `Longer-term assessment should distinguish understanding, intention and action. A person may accurately compare fictional offers yet face a different set of choices in practice. Someone may intend to follow a budget but revise it when an unexpected need appears. These differences do not make education or disclosure useless; they show why one measure cannot represent the whole process. An account of a local project should identify the stage it observed and the circumstances it did not test. Further work can then investigate a specific gap, rather than present an encouraging short-term result as a guarantee of financial security or universally improved decision-making.`,
  ],
};

function expandedReadingSection(
  source: StoredContent,
  index: number,
  general: boolean,
): StoredContent["sections"][number] {
  const section = source.sections[0]!;
  const background = readingBackground[source.topic]!;
  const selected = background.slice(
    0,
    general
      ? index === 0
        ? 2
        : index === 1
          ? 4
          : 6
      : index === 0
        ? 3
        : index === 1
          ? 4
          : 6,
  );
  const parts = section.text.split(/\n\n/);
  const distribution =
    selected.length === 2
      ? [1, 1, 0, 0]
      : selected.length === 3
        ? [1, 1, 0, 1]
        : selected.length === 4
          ? [1, 1, 1, 1]
          : [1, 2, 1, 2];
  let cursor = 0;
  const paragraphs = parts.map((paragraph, part) => {
    const addition = selected
      .slice(cursor, cursor + distribution[part]!)
      .join(" ");
    cursor += distribution[part]!;
    return `${paragraph}${addition ? " " + addition : ""}`;
  });
  const caseNote = `In the case described here, the problem and the method must be read together. The intervention was not simply a new label for the earlier arrangement: the text distinguishes the new approach from what had previously been used. Its evaluation also has a defined scope. The observed outcome is relevant to this group and setting, while the planned follow-up concerns a question still open. A reader should therefore keep three stages separate: the reason for starting the project, the evidence collected during it, and the proposal for later work. Confusing these stages can turn a limited observation into a claim the case does not support.`;
  paragraphs[3] +=
    " " +
    (general && index === 0
      ? "The notice describes this project and the arrangements connected with it. Its account of participation and the next step should be read as information about this particular programme, rather than as a promise about other services."
      : caseNote);
  const context = general
    ? index === 0
      ? "Community information and practical participation notice"
      : index === 1
        ? "Internal workplace briefing and operational review"
        : "Extended analysis of a local initiative"
    : "Extended analytical case study";
  return {
    ...section,
    text: paragraphs.join("\n\n"),
    title: `${context} · ${source.title}`,
    instructions: `Original authored practice passage. Case facts reused from ${source.id}; additional ${source.topic.toLowerCase()} background authored for mock workload (topic-context-v1). General context does not add participant facts to the case.`,
  };
}

function lecturePart(
  source: StoredContent,
  id: string,
  part: number,
): { section: StoredContent["sections"][number]; questions: StoredQuestion[] } {
  const entry = source.sections[0]!;
  const raw = entry.text.replace(/\[[ABCD]\] /g, "");
  const completion = /Only (\d+)%/.exec(raw)![1]!;
  const body = `Dr Ellis: This lecture examines ${source.title.toLowerCase()}. We will look at the original problem, the method chosen, and the limits of the resulting evidence.\n\n${raw}\n\nDr Ellis: Notice the distinction between a result in one setting and a general claim. The case is useful because it makes the method of evaluation visible. In research, a percentage is meaningful only if we know which group it describes. Here, the completion rate refers to the people who signed up, including those who later left. An assessment based only on successful completers would answer a different question. When interpreting a project, identify the population, the observation period and the comparison before drawing a conclusion.`;
  const selections = [0, 2, 7, 8, 12, 9, 13].map((i) => ({
    ...source.questions[i]!,
  }));
  const evaluation = /^To evaluate the change, the team used (.*)\.$/.exec(
    source.questions[6]!.evidence,
  )![1]!;
  const custom: StoredQuestion[] = [
    makeQuestion(
      id,
      8,
      "matching",
      `Which evaluation method is described in the lecture on ${source.title.toLowerCase()}?`,
      evaluation,
      source.questions[6]!.evidence,
      "Chọn cách thu thập bằng chứng được nêu, không suy từ kết luận của tác giả.",
      [
        evaluation,
        "booklet sales",
        "telephone enquiries",
        "advertising revenue",
      ],
      "matching-method",
    ),
    makeQuestion(
      id,
      9,
      "text",
      `What percentage completed the ${source.title.toLowerCase()} programme? ONE NUMBER ONLY.`,
      completion,
      `Only ${completion}% of those who signed up completed the whole programme.`,
      "Lấy tỷ lệ người hoàn thành trên nhóm đăng ký, không suy thành toàn bộ.",
      undefined,
      "number",
      1,
    ),
    makeQuestion(
      id,
      10,
      "choice",
      `According to the lecturer discussing ${source.title.toLowerCase()}, a percentage is meaningful only when we know what?`,
      "The group it describes.",
      "a percentage is meaningful only if we know which group it describes",
      "Không thể diễn giải tỷ lệ nếu chưa biết mẫu số/nhóm được mô tả.",
      [
        "The group it describes.",
        "The popularity of the lecturer.",
        "The price of the equipment.",
        "The preferred day of the participants.",
      ],
      "inference",
    ),
  ];
  return {
    section: {
      id: `${id}-lecture`,
      title: `Part ${part} · Lecture: ${source.title}`,
      text: body,
      dialogue: [
        {
          speaker: "Dr Ellis",
          accent: "british",
          text: body.replace(/Dr Ellis: /g, ""),
        },
      ],
      instructions: `Original academic lecture. Adapted from authored reading lesson ${source.id}; source reuse disclosed.`,
    },
    questions: [...selections, ...custom],
  };
}

function fullMock(
  skill: "reading" | "listening",
  index: number,
): StoredContent {
  const id = `${skill}-mock-${index + 1}`;
  const general = skill === "reading" && index % 2 === 0;
  const sources: StoredContent[] =
    skill === "reading"
      ? [
          readingLessons[(index * 4) % 48]!,
          readingLessons[(index * 4 + 18) % 48]!,
          readingLessons[(index * 4 + 31) % 48]!,
        ]
      : [
          listeningLessons[(index * 4 + 28) % 48]!,
          listeningLessons[(index * 4 + 33) % 48]!,
          listeningLessons[(index % 3) * 4 + 3]!,
          readingLessons[(index * 4 + 19) % 48]!,
        ];
  const length = skill === "reading" ? 3 : 4;
  let number = 0;
  const sections: StoredContent["sections"] = [];
  const questions: StoredQuestion[] = [];
  for (const [sectionIndex, source] of sources.entries()) {
    let section =
      skill === "reading"
        ? expandedReadingSection(source, sectionIndex, general)
        : { ...source.sections[0]! };
    let items = source.questions.slice(
      0,
      skill === "reading" ? (sectionIndex === 0 ? 14 : 13) : 10,
    );
    if (skill === "listening" && sectionIndex === 1) {
      const organiserLines = section.dialogue!.filter(
        (line) =>
          !["Jamie", "Alex", "Morgan", "Robin", "Taylor", "Casey"].includes(
            line.speaker,
          ),
      );
      section = {
        ...section,
        title: `Community information talk · ${source.title}`,
        text: organiserLines
          .map((line) => `${line.speaker}: ${line.text}`)
          .join("\n\n"),
        dialogue: organiserLines,
      };
    }
    if (skill === "listening" && sectionIndex === 2) {
      const dialogue = [
        {
          speaker: "Tutor",
          accent: "british" as const,
          text: "This is an academic project workshop. Listen to the student and the coordinator arranging the research demonstration, then consider the evaluation method.",
        },
        ...section.dialogue!,
      ];
      section = {
        ...section,
        title: `Academic workshop discussion · ${source.title}`,
        text: dialogue
          .map((line) => `${line.speaker}: ${line.text}`)
          .join("\n\n"),
        dialogue,
      };
    }
    if (skill === "listening" && sectionIndex === 3) {
      const lecture = lecturePart(source, id, 4);
      section = lecture.section;
      items = lecture.questions;
    }

    sections.push({
      ...section,
      id: `${id}-section-${sectionIndex + 1}`,
      title: `${skill === "reading" ? "Section" : "Part"} ${sectionIndex + 1} · ${section.title}`,
      instructions: `${skill === "reading" ? section.instructions : "Original practice material. Source lesson: " + source.id + "."} ${skill === "listening" ? "Listen to the part and answer questions " + (sectionIndex * 10 + 1) + "–" + (sectionIndex + 1) * 10 + "." : ""}`,
    });
    questions.push(
      ...items.map((q) => ({
        ...q,
        id: `${id}-q${++number}`,
        number,
        sectionIndex,
        prompt: `Section ${sectionIndex + 1}: ${q.prompt}`,
      })),
    );
  }
  return {
    id,
    skill,
    title: `${skill === "reading" ? "Reading" : "Listening"} full mock ${index + 1}`,
    description: `${length} sections · 40 questions. Sections drawn from authored lessons; this form is a structural practice mock, not an officially calibrated IELTS paper.`,
    topic: sources.map((x) => x.topic).join(" / "),
    band: index < 4 ? 4.5 : 6,
    cefr: index < 4 ? "B1" : "B2",
    testType:
      skill === "reading" ? (index % 2 ? "academic" : "general") : "both",
    durationMinutes: skill === "reading" ? 60 : 30,
    format: "full-mock",
    questions,
    sections,
    vocabularyIds: [],
    tags: [
      "timed",
      "40-questions",
      "section-reuse-disclosed",
      ...(skill === "reading"
        ? sources.map(
            (source) =>
              `context-source:${source.topic.toLowerCase()}-background-v1`,
          )
        : []),
      ...sources.map((x) => `section-source:${x.id}`),
    ],
    source: "authored",
    quality: "authored-unreviewed",
    createdAt,
  };
}
export const receptiveMocks: StoredContent[] = Array.from(
  { length: 8 },
  (_, index) => fullMock("reading", index),
).concat(Array.from({ length: 8 }, (_, index) => fullMock("listening", index)));

export const placementBank: PlacementItem[] = [];
for (const [topicIndex, topic] of topics.entries()) {
  for (const [level, entry] of cases[topic].entries()) {
    const serial = topicIndex * 4 + level;
    const band = bands[level]!;
    const difficulty = (band - 5) * 1.2;
    const base = { band, cefr: levels[level]!, difficulty };
    const count = 31 + serial;
    const subject = `A separate pilot at ${entry.place}`;
    placementBank.push({
      id: `placement-r-${slug(topic)}-${level + 1}-detail`,
      skill: "reading",
      ...base,
      text: `${subject} invited ${count} people. Ten could not attend, so the organiser asked ${count + 5} additional people. Only the originally invited group was included in the pilot report.`,
      question: "How many people were originally invited?",
      options: [
        String(count - 10),
        String(count),
        String(count + 5),
        String(count * 2 - 5),
      ],
      answer: String(count),
      explanation:
        "Originally invited chỉ nhóm đầu tiên; số người bổ sung và số vắng mặt là distractors.",
      subskill: "number",
    });
    placementBank.push({
      id: `placement-r-${slug(topic)}-${level + 1}-inference`,
      skill: "reading",
      ...base,
      text: `A team studying ${entry.initiative} used ${entry.evaluation}. It did not use popularity as its main measure, because enthusiastic comments alone cannot show whether the original difficulty has changed.`,
      question: "Why did the team avoid relying only on enthusiastic comments?",
      options: [
        "Comments do not by themselves show whether the difficulty changed.",
        "No participant was allowed to speak.",
        "The project had no original purpose.",
        "All evaluation methods cost the same amount.",
      ],
      answer:
        "Comments do not by themselves show whether the difficulty changed.",
      explanation:
        "Lý do được nêu sau because; không suy rằng nhận xét bị cấm hoặc không có giá trị nào.",
      subskill: "inference",
    });
    placementBank.push({
      id: `placement-l-${slug(topic)}-${level + 1}-correction`,
      skill: "listening",
      ...base,
      text: `Visitor: I wrote down ${count} as the fee for the new workshop.\nOrganiser: That was our first estimate. We've reduced it to ${count - 4} pounds. The extra booklet costs four pounds, but it is optional.`,
      question: "What is the workshop fee without the optional booklet?",
      options: [String(count + 4), String(count - 4), String(count), "4"],
      answer: String(count - 4),
      explanation:
        "Nghe self-correction reduced it to; giá ban đầu và booklet không phải phí cuối cùng.",
      subskill: "self-correction",
    });
    placementBank.push({
      id: `placement-l-${slug(topic)}-${level + 1}-purpose`,
      skill: "listening",
      ...base,
      text: `Interviewer: Will the next group try ${entry.olderMethod}?\nCoordinator: We will explain that approach first, but they will practise ${entry.method}. We want them to compare the approaches, not assume that mentioning a method means recommending it.`,
      question: "Which approach will the next group practise?",
      options: [
        entry.olderMethod,
        "neither approach",
        entry.method,
        "an approach chosen by the interviewer",
      ],
      answer: entry.method,
      explanation:
        "Explain phương pháp cũ khác với practise phương pháp mới; but đánh dấu thông tin chính.",
      subskill: "contrast",
    });
  }
}
