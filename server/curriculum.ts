import { randomInt, randomUUID } from "node:crypto";
import type {
  Cefr,
  Exercise,
  PlacementQuestion,
  Skill,
  VocabularyWord,
} from "../shared/types";
import type { StoredExercise } from "./db";

export function cefrForBand(band: number): Cefr {
  return band < 4 ? "A2" : band < 5.5 ? "B1" : band < 7 ? "B2" : "C1";
}
export function roundBand(value: number): number {
  return Math.round(value * 2) / 2;
}
export function overallBand(scores: number[]): number | null {
  if (
    scores.length !== 4 ||
    scores.some((value) => !Number.isFinite(value) || value < 0 || value > 9)
  )
    return null;
  return roundBand(scores.reduce((sum, value) => sum + value, 0) / 4);
}
const word = (
  front: string,
  back: string,
  example: string,
  cefr: Cefr,
): VocabularyWord => ({ front, back, example, cefr });
export function shuffledOptions(options: string[]): string[] {
  const result = [...options];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = randomInt(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

interface ReadingSample {
  title: string;
  content: string;
  band: number;
  questions: {
    text: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[];
  words: VocabularyWord[];
}
const readings: Record<Cefr, ReadingSample> = {
  A2: {
    title: "A library that welcomes everyone",
    band: 3.5,
    content: `The River Street Library opened a new reading room last month. Before the change, children and adults used the same small room. Some students found it difficult to study because the children's activities were noisy. The new room is upstairs and is only for quiet reading.\n\nThe library opens at nine every morning. From Monday to Friday it closes at seven in the evening. At weekends it closes earlier, at four. People can borrow five books at a time for two weeks. They can keep a book for another week by asking a member of staff, provided nobody else is waiting for it.\n\nOn Wednesday afternoons, volunteers help adults practise English. The sessions are free, but visitors must book a place because there are only twelve seats. The first session begins at two o'clock and lasts one hour. Participants read a short story together and then talk about it in pairs.\n\nLibrary manager Laura says the new room has brought in more students. However, the library is not planning to buy more computers this year. Its next project is a small garden behind the building, where visitors will be able to read outside during the summer.`,
    questions: [
      {
        text: "Why did some students find studying difficult before the change?",
        options: [
          "The children’s activities were noisy",
          "There were no books",
          "The library closed early",
        ],
        answer: "The children’s activities were noisy",
        explanation:
          "The first paragraph identifies noise from children’s activities.",
      },
      {
        text: "At what time does the library close on Sunday? Write ONE number.",
        answer: "4|four",
        explanation: "At weekends it closes at four.",
      },
      {
        text: "For how many weeks can people initially borrow a book? Write ONE number.",
        answer: "2|two",
        explanation: "Books may initially be borrowed for two weeks.",
      },
      {
        text: "How much do the Wednesday English sessions cost?",
        options: ["Nothing", "Five pounds", "Twelve pounds"],
        answer: "Nothing",
        explanation: "The sessions are free; booking is still required.",
      },
      {
        text: "What is the library’s next project?",
        options: ["A small garden", "More computers", "Another floor"],
        answer: "A small garden",
        explanation:
          "The final paragraph says the next project is a garden behind the building.",
      },
    ],
    words: [
      word("borrow", "mượn", "Students can borrow five books.", "A2"),
      word(
        "volunteer",
        "tình nguyện viên",
        "A volunteer helps visitors practise English.",
        "A2",
      ),
      word(
        "provided",
        "với điều kiện là",
        "You can renew the book provided nobody is waiting.",
        "B1",
      ),
    ],
  },
  B1: {
    title: "The return of the urban garden",
    band: 4.5,
    content: `In many cities, small pieces of unused land are being turned into community gardens. These spaces are managed by local residents rather than commercial farms. Participants share tools, decide what to plant and divide the harvest. Although producing food is important, gardeners often describe the social benefits as their main reason for joining.\n\nA project in Northbridge began in 2018 on a former car park. The council offered residents a five-year lease, and twenty households volunteered to help. At first, the group expected to grow vegetables directly in the ground. Tests showed that the soil contained traces of industrial pollution, so they built raised beds and brought in clean soil. This added to the initial cost, but it also made the beds easier for older residents to reach.\n\nWater was another challenge. During the first summer the garden used the public water supply, which was expensive. The group later installed tanks to collect rainwater from a nearby building. These tanks now meet most of the garden's needs, except during unusually dry periods. A local school uses the garden for science lessons, and several pupils have started growing vegetables at home.\n\nThe project has limits. Volunteers sometimes disagree about how to use the available space, and not every household has enough spare time to participate. Nevertheless, a survey found that most members knew more of their neighbours than they did before joining. The council has renewed the lease, but it will not provide regular financial support. To cover costs, the group sells a small part of its harvest at a monthly market.`,
    questions: [
      {
        text: "What do many gardeners describe as their main reason for joining?",
        options: ["Social benefits", "Commercial profit", "Free parking"],
        answer: "Social benefits",
        explanation:
          "Paragraph one distinguishes social benefits from food production.",
      },
      {
        text: "Why did residents build raised beds?",
        options: [
          "The original soil was polluted",
          "The council required more parking",
          "The ground was too wet",
        ],
        answer: "The original soil was polluted",
        explanation:
          "Tests identified traces of industrial pollution in the soil.",
      },
      {
        text: "What do the tanks collect? Write ONE word.",
        answer: "rainwater|rain water",
        explanation: "The tanks collect rainwater from a nearby building.",
      },
      {
        text: "The tanks meet the garden’s water needs in every season without exception. TRUE, FALSE or NOT GIVEN?",
        answer: "FALSE",
        explanation: "The text gives an exception: unusually dry periods.",
      },
      {
        text: "How does the group raise money for its running costs?",
        options: [
          "By selling some of its harvest",
          "Through regular council funding",
          "By charging school pupils",
        ],
        answer: "By selling some of its harvest",
        explanation: "The final sentence specifies sales at a monthly market.",
      },
    ],
    words: [
      word(
        "harvest",
        "vụ thu hoạch; thu hoạch",
        "The group divides the harvest.",
        "B1",
      ),
      word("resident", "cư dân", "Local residents manage the garden.", "B1"),
      word(
        "lease",
        "hợp đồng thuê",
        "The council renewed the five-year lease.",
        "B2",
      ),
    ],
  },
  B2: {
    title: "When cities become living laboratories",
    band: 6,
    content: `Urban planners have traditionally relied on forecasts to decide whether a new transport scheme will succeed. Yet forecasts are only as useful as the assumptions behind them. Recently, some cities have adopted a different approach: making temporary changes to public space and observing what happens before committing to expensive construction. These small-scale interventions are sometimes called urban experiments.\n\nIn one coastal city, planners used movable barriers to separate a cycle lane from traffic for twelve weeks. Local shopkeepers initially opposed the trial because they expected the loss of parking spaces to reduce sales. During the experiment, however, the number of pedestrians increased and overall retail revenue remained stable. The results did not prove that every shop benefited; businesses selling heavy goods reported greater difficulties with deliveries. The council consequently altered the design to include loading bays before installing a permanent lane.\n\nTemporary projects can also reveal problems that computer models miss. In another city, painted benches in a newly pedestrianised street remained empty during the afternoon. Designers had assumed that people would welcome extra seating, but observation showed that the benches offered no shade in hot weather. Planting trees would eventually address the problem, though movable shelters provided an immediate solution.\n\nCritics argue that the people who take part in these trials may not represent the whole community. A survey conducted only during working hours can exclude commuters, while online feedback may overlook older residents. Researchers therefore recommend collecting evidence at different times and combining numerical counts with interviews. They also caution against interpreting a short trial as proof of long-term success: people may visit a redesigned street simply because it is new.\n\nExperiments are valuable when decision-makers treat them as opportunities to learn rather than demonstrations that a preferred policy is correct. This requires publishing disappointing findings as openly as positive ones. A temporary intervention should inform a lasting decision, not merely provide an attractive photograph for a press release.`,
    questions: [
      {
        text: "What distinguishes the newer planning approach?",
        options: [
          "Testing temporary changes before permanent construction",
          "Using forecasts without assumptions",
          "Avoiding all observation",
        ],
        answer: "Testing temporary changes before permanent construction",
        explanation:
          "The opening paragraph contrasts temporary observation with committing to construction.",
      },
      {
        text: "Why were loading bays added to the final cycle-lane design?",
        options: [
          "Some businesses had delivery difficulties",
          "Retail revenue fell everywhere",
          "Pedestrians requested extra parking",
        ],
        answer: "Some businesses had delivery difficulties",
        explanation:
          "Businesses selling heavy goods reported delivery problems.",
      },
      {
        text: "What was missing from the unused benches? Write ONE word.",
        answer: "shade",
        explanation: "Observation showed that the benches offered no shade.",
      },
      {
        text: "A survey conducted only during working hours represents every resident equally. TRUE, FALSE or NOT GIVEN?",
        answer: "FALSE",
        explanation: "The text says it can exclude commuters.",
      },
      {
        text: "The author recommends publishing only successful findings. TRUE, FALSE or NOT GIVEN?",
        answer: "FALSE",
        explanation:
          "Disappointing findings should be published as openly as positive ones.",
      },
      {
        text: "Which risk makes a short trial difficult to interpret?",
        options: [
          "Visitors may be attracted by novelty",
          "Numerical evidence cannot be collected",
          "Permanent construction is always cheaper",
        ],
        answer: "Visitors may be attracted by novelty",
        explanation:
          "A new street may attract visitors simply because it is new.",
      },
    ],
    words: [
      word(
        "intervention",
        "sự can thiệp; biện pháp",
        "Temporary interventions help cities test new ideas.",
        "B2",
      ),
      word(
        "assumption",
        "giả định",
        "A forecast depends on its assumptions.",
        "B2",
      ),
      word(
        "novelty",
        "sự mới lạ",
        "Initial interest may reflect novelty.",
        "C1",
      ),
      word("revenue", "doanh thu", "Retail revenue remained stable.", "B2"),
    ],
  },
  C1: {
    title: "The hidden cost of an efficient forest",
    band: 7,
    content: `Forestry has often equated efficiency with uniformity. A plantation containing trees of the same species and age is convenient to harvest and comparatively straightforward to model. Its projected output can be expressed as a single figure, giving investors a reassuring sense of predictability. Ecologists argue, however, that this apparent clarity conceals a less measurable cost: reduced resilience to disturbance.\n\nA diverse forest does not necessarily produce more timber in an uneventful year. Its advantage emerges when conditions depart from expectations. A pathogen that devastates one species may leave its neighbours untouched, while deep-rooted trees can draw moisture from layers inaccessible to shallower-rooted ones. Diversity therefore functions less like a guarantee of higher yield than a portfolio in which risks are distributed. This analogy has limits, since organisms interact rather than merely coexist, but it usefully challenges the assumption that the best annual output must also be the best long-term outcome.\n\nInterpreting the evidence is complicated by the history of the sites being compared. Mixed woodland may occur on less productive land precisely because commercially valuable plantations were established elsewhere. Simple comparisons can consequently underestimate the benefits of diversity. Conversely, enthusiasts sometimes attribute a forest's recovery entirely to species variety while neglecting soil conditions, management practices and the intensity of the original disturbance. Both errors arise from treating correlation as sufficient evidence of causation.\n\nSome managers now favour gradual diversification rather than an abrupt replacement of plantations. Introducing species in small patches allows them to monitor survival and adjust their choices. It can also preserve income during a transition that would otherwise be financially unfeasible. Such pragmatism is occasionally criticised as insufficiently ambitious, but advocates contend that a policy which landowners can sustain is more valuable than an ideal plan they cannot implement.\n\nThe dispute is ultimately about what counts as efficiency and whose timescale matters. A measure focused on next year's harvest can reward decisions that expose future communities to considerable risk. Broader accounting would include uncertainty, ecological services and the costs of recovery. It would not eliminate difficult trade-offs, but it would make those trade-offs visible.`,
    questions: [
      {
        text: "Why can a uniform plantation appear attractive to investors?",
        options: [
          "Its output is easier to predict",
          "It is immune to pathogens",
          "It always supports more wildlife",
        ],
        answer: "Its output is easier to predict",
        explanation:
          "Paragraph one describes a reassuring sense of predictability.",
      },
      {
        text: "The portfolio analogy illustrates that diversity…",
        options: [
          "distributes the risk of disturbances",
          "guarantees higher annual timber output",
          "prevents organisms from interacting",
        ],
        answer: "distributes the risk of disturbances",
        explanation:
          "The author explicitly compares diversity to distributed risks, not guaranteed yield.",
      },
      {
        text: "Comparisons may undervalue diversity because mixed woodland occupies less productive land. TRUE, FALSE or NOT GIVEN?",
        answer: "TRUE",
        explanation:
          "Paragraph three explains this historical selection effect.",
      },
      {
        text: "What mistaken inference do both sides sometimes make?",
        options: [
          "Treating correlation as proof of causation",
          "Ignoring every financial constraint",
          "Assuming recovery is impossible",
        ],
        answer: "Treating correlation as proof of causation",
        explanation:
          "The last sentence of paragraph three identifies the shared error.",
      },
      {
        text: "Name ONE financial benefit of gradual diversification in TWO words.",
        answer: "preserve income|preserves income|preserving income",
        explanation:
          "Gradual diversification can preserve income during the transition.",
      },
      {
        text: "What does the author ultimately favour?",
        options: [
          "Accounting that makes ecological trade-offs visible",
          "Maximising only next year’s harvest",
          "Eliminating all difficult decisions",
        ],
        answer: "Accounting that makes ecological trade-offs visible",
        explanation:
          "The conclusion supports broader accounting without claiming it removes trade-offs.",
      },
    ],
    words: [
      word(
        "resilience",
        "khả năng phục hồi và chống chịu",
        "Diversity can improve a forest’s resilience.",
        "C1",
      ),
      word(
        "causation",
        "quan hệ nhân quả",
        "Correlation alone does not establish causation.",
        "C1",
      ),
      word(
        "trade-off",
        "sự đánh đổi",
        "Every policy involves a trade-off.",
        "C1",
      ),
      word(
        "feasible",
        "khả thi",
        "An abrupt change may not be financially feasible.",
        "B2",
      ),
    ],
  },
};

function base(skill: Skill, band: number): Exercise {
  return {
    id: randomUUID(),
    skill,
    title: "",
    description: "",
    band,
    cefr: cefrForBand(band),
    durationMinutes: 15,
    content: "",
    sections: [],
    questions: [],
    vocabulary: [],
    source: "sample",
  };
}
export function sampleExercise(
  skill: Skill,
  band = 5.5,
  task: 1 | 2 = 2,
): StoredExercise {
  const exercise = base(skill, band);
  const answers: StoredExercise["answers"] = {};
  if (skill === "reading") {
    const sample = readings[exercise.cefr];
    Object.assign(exercise, {
      title: sample.title,
      content: sample.content,
      band: sample.band,
      description:
        "Bài đọc ngắn có đáp án và giải thích. Điểm luyện tập chỉ là ước lượng, không tương đương đề IELTS 40 câu.",
      durationMinutes: 15,
      vocabulary: sample.words,
    });
    exercise.questions = sample.questions.map((question, i) => {
      const id = `reading-${i + 1}`;
      answers[id] = {
        answer: question.answer,
        explanation: question.explanation,
      };
      return {
        id,
        text: question.text,
        type: question.options ? "choice" : "text",
        ...(question.options
          ? { options: shuffledOptions(question.options) }
          : {}),
      };
    });
  } else if (skill === "listening") {
    Object.assign(exercise, {
      title: "A greener campus",
      durationMinutes: 20,
      description:
        "Bốn phần nghe ngắn tăng độ khó, chứa bẫy đính chính và đổi quyết định. Dùng nghe trình duyệt để thử; ElevenLabs tạo hội thoại khi có cấu hình.",
      sections: [
        {
          title: "Section 1 · Booking a bicycle",
          speaker: "British + Australian",
          content:
            "Receptionist: Good morning, Green Wheels bicycle hire. How can I help?\nStudent: I would like to book a bike for Tuesday. Sorry, I have a seminar then. Could I book it for Friday instead?\nReceptionist: Friday is fine. Our standard price is eighteen pounds per day.\nStudent: Do you offer a student discount?\nReceptionist: Yes, with a student card it is twelve pounds.\nStudent: Great. I thought the collection point was the east gate.\nReceptionist: It used to be there, but this month please collect your bike at the north gate.\nStudent: And I need to return it by six?\nReceptionist: Actually, the desk closes at five, so return it by five o’clock.",
        },
        {
          title: "Section 2 · Campus travel information",
          speaker: "American",
          content:
            "Welcome to the campus travel centre. We first planned to hold our safety workshop in the library, but building work makes that unsuitable. Instead, the workshop will take place in the sports hall. It begins at ten in the morning and lasts ninety minutes. You do not need to bring your own helmet: we will lend you one. Although the usual shuttle fare is two dollars, it is free during orientation week. The shuttle leaves every twenty minutes, not every fifteen as the old leaflet says.",
        },
        {
          title: "Section 3 · Planning a research project",
          speaker: "British + Australian",
          content:
            "Alex: For our transport project, I suggest measuring how fast cyclists travel.\nMia: That sounds interesting, but we would need specialised equipment. What about asking students why they choose a particular mode of transport?\nAlex: We could use an online survey.\nMia: We considered that last week, but it would exclude students who rarely check their email. Face-to-face interviews outside the cafeteria would be more representative.\nAlex: Agreed. I initially thought cost would be the main influence.\nMia: The preliminary interviews suggest convenience matters more than cost or environmental concern.\nAlex: Then let’s focus on convenience and carry out face-to-face interviews. We should collect responses in both the morning and evening to avoid a biased sample.",
        },
        {
          title: "Section 4 · The science of urban cooling",
          speaker: "American",
          content:
            "Today we examine urban trees and temperature. Many people assume trees cool streets mainly by blocking sunlight. Shade is certainly important, but water released from leaves also cools the surrounding air through evaporation. Early studies compared a single shaded street with an open one and attributed the entire temperature difference to trees. Later research found that building height and wind patterns were also influential. Modern studies therefore control for those factors. A city should not simply plant as many trees as possible: species selection and the availability of water determine whether trees survive long enough to provide benefits. Researchers recommend prioritising neighbourhoods with limited existing canopy rather than distributing new trees equally across every district.",
        },
      ],
      vocabulary: [
        word(
          "orientation",
          "buổi định hướng",
          "The shuttle is free during orientation week.",
          "B2",
        ),
        word(
          "representative",
          "mang tính đại diện",
          "A survey needs a representative sample.",
          "B2",
        ),
        word("evaporation", "sự bay hơi", "Evaporation cools the air.", "C1"),
      ],
    });
    exercise.content = exercise.sections
      .map((section) => `${section.title}\n${section.content}`)
      .join("\n\n");
    const questions = [
      {
        text: "Section 1: On which day will the student hire the bicycle? Write ONE word.",
        answer: "Friday",
        explanation: "Tuesday is mentioned first, then corrected to Friday.",
      },
      {
        text: "Section 1: What is the discounted daily price? Write ONE number.",
        answer: "12|twelve",
        explanation:
          "Eighteen pounds is the standard price; students pay twelve.",
      },
      {
        text: "Section 2: Where will the safety workshop take place?",
        options: ["Sports hall", "Library", "Travel centre"],
        answer: "Sports hall",
        explanation:
          "The original library location was rejected because of building work.",
      },
      {
        text: "Section 2: How often does the shuttle leave? Write ONE number (minutes).",
        answer: "20|twenty",
        explanation:
          "The current interval is twenty minutes; fifteen is from an outdated leaflet.",
      },
      {
        text: "Section 3: Which research method do the students finally choose?",
        options: [
          "Face-to-face interviews",
          "Online surveys",
          "Speed measurements",
        ],
        answer: "Face-to-face interviews",
        explanation:
          "Both speed measurement and online surveys are considered but rejected.",
      },
      {
        text: "Section 3: Which factor matters most in the preliminary interviews?",
        options: ["Convenience", "Cost", "Environmental concern"],
        answer: "Convenience",
        explanation:
          "Cost was the initial assumption; preliminary interviews point to convenience.",
      },
      {
        text: "Section 4: What process cools the air when leaves release water? Write ONE word.",
        answer: "evaporation",
        explanation:
          "The lecturer explicitly names evaporation as a cooling mechanism.",
      },
      {
        text: "Section 4: Which areas should receive priority for new trees?",
        options: [
          "Neighbourhoods with limited canopy",
          "Every district equally",
          "Neighbourhoods with the tallest buildings",
        ],
        answer: "Neighbourhoods with limited canopy",
        explanation:
          "The recommendation prioritises areas with limited existing canopy.",
      },
    ];
    exercise.questions = questions.map((question, index) => {
      const id = `listening-${index + 1}`;
      answers[id] = {
        answer: question.answer,
        explanation: question.explanation,
      };
      return {
        id,
        text: question.text,
        type: question.options ? "choice" : "text",
        ...(question.options
          ? { options: shuffledOptions(question.options) }
          : {}),
      };
    });
  } else if (skill === "writing") {
    exercise.task = task;
    exercise.durationMinutes = task === 1 ? 20 : 40;
    exercise.title =
      task === 1
        ? "Task 1 · How a city travels"
        : "Task 2 · The future of our cities";
    exercise.description =
      task === 1
        ? "Viết ít nhất 150 từ. Mô tả xu hướng, so sánh và trình bày overview; không nêu ý kiến cá nhân."
        : "Viết ít nhất 250 từ. Phát triển lập luận rõ ràng, kèm dẫn chứng cụ thể.";
    exercise.content =
      task === 1
        ? "The chart below shows the percentage of commuters using five modes of transport in the city of Northbridge in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant."
        : "Some people believe governments should invest more in public transport, while others think improving roads for private vehicles is more important. Discuss both views and give your own opinion.";
    if (task === 1)
      exercise.chart = [
        { label: "Car", value: 40 },
        { label: "Bus", value: 25 },
        { label: "Train", value: 20 },
        { label: "Bicycle", value: 10 },
        { label: "Walking", value: 5 },
      ];
    exercise.sections = [
      {
        title: task === 1 ? "Checklist · Task 1" : "Checklist · Task 2",
        content:
          task === 1
            ? "Paraphrase the title → provide an overview → group key comparisons → support with data. Values are percentages and total 100%."
            : "Introduce both perspectives → develop each with an example → state and support your position → conclude clearly.",
      },
    ];
    exercise.vocabulary = [
      word(
        "infrastructure",
        "cơ sở hạ tầng",
        "Cities need reliable transport infrastructure.",
        "B2",
      ),
      word(
        "congestion",
        "sự ùn tắc",
        "Public transport can reduce congestion.",
        "B2",
      ),
    ];
  } else {
    exercise.title = "Speaking · A place that inspires you";
    exercise.durationMinutes = 12;
    exercise.description =
      "Luyện cả ba phần Speaking. Ghi âm câu trả lời; điểm phát âm chỉ xuất hiện khi có đánh giá âm học thực.";
    exercise.sections = [
      {
        title: "Part 1 · Home and neighbourhood",
        content:
          "Where do you live? What do you like most about your neighbourhood? How has it changed in recent years? Answer each question in two or three sentences.",
      },
      {
        title: "Part 2 · Cue card",
        content:
          "Describe a public place that you enjoy visiting. You should say: where it is, how often you go there, what you do there, and explain why you enjoy it. Take one minute to prepare, then speak for one to two minutes.",
      },
      {
        title: "Part 3 · Discussion",
        content:
          "Why are public spaces important in cities? How can planners make them accessible to everyone? Should local people have more influence over urban development? Develop your answers with reasons and examples.",
      },
    ];
    exercise.content = exercise.sections
      .map((section) => `${section.title}\n${section.content}`)
      .join("\n\n");
    exercise.vocabulary = [
      word(
        "accessible",
        "dễ tiếp cận",
        "Public spaces should be accessible to everyone.",
        "B2",
      ),
      word(
        "atmosphere",
        "bầu không khí",
        "The park has a peaceful atmosphere.",
        "B1",
      ),
    ];
  }
  return { exercise, answers };
}

export interface PlacementItem extends PlacementQuestion {
  answer: string;
  band: number;
}
const placementData: Record<Cefr, [string, string[], string][]> = {
  A2: [
    [
      "She ____ breakfast at seven every day.",
      ["has", "have", "having", "had been"],
      "has",
    ],
    ["There ____ two books on the desk.", ["are", "is", "be", "am"], "are"],
    [
      "I went to the shop ____ buy some bread.",
      ["to", "for", "at", "by"],
      "to",
    ],
    [
      "Which word means the opposite of “expensive”?",
      ["cheap", "heavy", "empty", "polite"],
      "cheap",
    ],
    [
      "We ____ a film yesterday evening.",
      ["watched", "watch", "watching", "watches"],
      "watched",
    ],
    ["My brother is taller ____ me.", ["than", "then", "that", "as"], "than"],
    [
      "Could you ____ me the salt, please?",
      ["pass", "past", "passing", "passes"],
      "pass",
    ],
    ["The train arrives ____ Monday morning.", ["on", "in", "at", "to"], "on"],
  ],
  B1: [
    [
      "I have lived here ____ 2020.",
      ["since", "for", "during", "until"],
      "since",
    ],
    [
      "If I had more time, I ____ learn another language.",
      ["would", "will", "am", "did"],
      "would",
    ],
    [
      "The museum ____ by thousands of people every year.",
      ["is visited", "visits", "has visiting", "is visit"],
      "is visited",
    ],
    [
      "She decided to put off the meeting. “Put off” means:",
      ["postpone", "attend", "arrange", "remember"],
      "postpone",
    ],
    [
      "He was tired, ____ he finished the assignment.",
      ["but", "because", "so that", "unless"],
      "but",
    ],
    [
      "You ____ wear a seat belt; it is required by law.",
      ["must", "might", "would", "could have"],
      "must",
    ],
    [
      "This is the restaurant ____ we first met.",
      ["where", "who", "whose", "which person"],
      "where",
    ],
    [
      "I look forward to ____ from you.",
      ["hearing", "hear", "heard", "have heard"],
      "hearing",
    ],
  ],
  B2: [
    [
      "By the time we arrived, the lecture ____.",
      ["had started", "has started", "starts", "will start"],
      "had started",
    ],
    [
      "____ the heavy rain, the match continued.",
      ["Despite", "Although", "Because", "Even"],
      "Despite",
    ],
    [
      "The findings are “tentative”. This means they are:",
      ["not yet certain", "completely false", "widely published", "very old"],
      "not yet certain",
    ],
    [
      "Had I known about the delay, I ____ earlier.",
      ["would have left", "will leave", "had leave", "would leaving"],
      "would have left",
    ],
    [
      "The proposal is likely to ____ considerable debate.",
      ["spark", "sparkle", "spare", "split up"],
      "spark",
    ],
    [
      "The person ____ application was successful has been notified.",
      ["whose", "who", "whom", "which"],
      "whose",
    ],
    [
      "She suggested ____ the experiment under different conditions.",
      ["repeating", "to repeat", "repeat", "repeated"],
      "repeating",
    ],
    [
      "The results were inconsistent; ____, further research was needed.",
      ["therefore", "nevertheless", "whereas", "similarly"],
      "therefore",
    ],
  ],
  C1: [
    [
      "Not until the data were checked ____ the error.",
      ["did we notice", "we noticed", "we did notice", "noticed we"],
      "did we notice",
    ],
    [
      "The argument rests on a “dubious” assumption. The assumption is:",
      ["questionable", "widely accepted", "irrelevant", "unavoidable"],
      "questionable",
    ],
    [
      "The new evidence calls the earlier conclusion ____ question.",
      ["into", "onto", "under", "over"],
      "into",
    ],
    [
      "____ convincing the theory may appear, it still requires testing.",
      ["However", "Whatever", "Although", "Despite"],
      "However",
    ],
    [
      "The report provides a “nuanced” account, meaning it:",
      [
        "recognises subtle distinctions",
        "uses very few words",
        "rejects all evidence",
        "repeats a single opinion",
      ],
      "recognises subtle distinctions",
    ],
    [
      "Were the funding to be withdrawn, the project ____.",
      ["would cease", "will cease", "had ceased", "has ceased"],
      "would cease",
    ],
    [
      "The benefits are contingent ____ continued investment.",
      ["on", "of", "for", "by"],
      "on",
    ],
    [
      "The author concedes that the policy has limitations. “Concedes” means:",
      [
        "acknowledges reluctantly",
        "denies categorically",
        "predicts confidently",
        "explains repeatedly",
      ],
      "acknowledges reluctantly",
    ],
  ],
};
const levelBands: Record<Cefr, number> = { A2: 3.5, B1: 4.5, B2: 6, C1: 7 };
export const placementBank: PlacementItem[] = (
  Object.keys(placementData) as Cefr[]
).flatMap((cefr) =>
  placementData[cefr].map(([text, options, answer], index) => ({
    id: `${cefr}-${index + 1}`,
    text,
    options,
    answer,
    cefr,
    band: levelBands[cefr],
  })),
);

export function selectPlacementQuestion(
  band: number,
  used: string[],
  bank: PlacementItem[] = placementBank,
): PlacementItem {
  const remaining = bank.filter((question) => !used.includes(question.id));
  const nearest = remaining.sort(
    (a, b) => Math.abs(a.band - band) - Math.abs(b.band - band),
  );
  if (!nearest[0]) throw new Error("Placement question bank exhausted");
  return nearest[0];
}
export function publicPlacementQuestion(
  question: PlacementItem,
): PlacementQuestion {
  return {
    id: question.id,
    text: question.text,
    options: shuffledOptions(question.options),
    cefr: question.cefr,
  };
}
