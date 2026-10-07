import type {
  Cefr,
  ContentSection,
  StoredContent,
  StoredQuestion,
} from "../../shared/types.js";

const createdAt = "2026-10-07T00:00:00.000Z";
const levels: Cefr[] = ["A2", "B1", "B2", "C1"];
const base = (
  id: string,
  skill: StoredContent["skill"],
  topic: string,
  index: number,
): Omit<StoredContent, "sections" | "title" | "description"> => ({
  id,
  skill,
  topic,
  band: [4, 5.5, 6.5, 7.5][index % 4],
  cefr: levels[index % 4],
  testType: "both",
  durationMinutes: 20,
  format: "lesson",
  questions: [],
  vocabularyIds: [],
  tags: ["original-material", `topic:${topic.toLowerCase()}`],
  source: "authored",
  quality: "authored-unreviewed",
  createdAt,
});

type ChartTask = {
  topic: string;
  title: string;
  prompt: string;
  series: string[];
  unit: string;
  rows: [string, number, number, number][];
  notes: string;
};
const charts: ChartTask[] = [
  {
    topic: "Education",
    title: "University study modes, 2005–2025",
    prompt:
      "The chart shows the percentage of university students using three main study modes in a fictional country in 2005, 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Campus only", "Blended learning", "Fully online"],
    unit: "% of students",
    rows: [
      ["2005", 82, 15, 3],
      ["2015", 61, 29, 10],
      ["2025", 38, 44, 18],
    ],
    notes:
      "Each year totals 100%. Describe the shift away from campus-only study; avoid suggesting that enrolment totals are shown.",
  },
  {
    topic: "Environment",
    title: "Household waste by disposal method",
    prompt:
      "The table compares the amount of household waste sent to landfill, recycled and composted in a fictional city in 2010, 2015, 2020 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Landfill", "Recycling", "Composting"],
    unit: "thousand tonnes",
    rows: [
      ["2010", 240, 75, 25],
      ["2015", 220, 100, 40],
      ["2020", 170, 135, 65],
      ["2025", 125, 160, 85],
    ],
    notes:
      "Report absolute amounts rather than percentages. Note the crossover between landfill and recycling and the steady rise in composting.",
  },
  {
    topic: "Technology",
    title: "Digital device ownership by age group",
    prompt:
      "The chart gives the proportions of people in four age groups who owned a smartphone, laptop or tablet in a fictional country in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Smartphone", "Laptop", "Tablet"],
    unit: "% of each age group",
    rows: [
      ["18–29", 97, 84, 31],
      ["30–44", 94, 78, 45],
      ["45–59", 85, 63, 42],
      ["60+", 62, 34, 28],
    ],
    notes:
      "People may own more than one device, so the rows do not total 100%. Smartphones lead in every group; tablet ownership peaks among people aged 30–44.",
  },
  {
    topic: "Transport",
    title: "Commuting choices in two cities",
    prompt:
      "The chart compares the percentages of commuters using cars, public transport and active travel in City A and City B in 2015 and 2025. Active travel means walking or cycling. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Car", "Public transport", "Active travel"],
    unit: "% of commuters",
    rows: [
      ["City A, 2015", 62, 25, 13],
      ["City A, 2025", 47, 33, 20],
      ["City B, 2015", 43, 41, 16],
      ["City B, 2025", 35, 42, 23],
    ],
    notes:
      "All rows total 100%. Compare both change over time and the differences between cities; do not invent reasons for the changes.",
  },
  {
    topic: "Health",
    title: "Exercise participation across age groups",
    prompt:
      "The chart shows the percentage of adults in three age groups who met a recommended weekly exercise target in a fictional country in 2012, 2018 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["18–34 years", "35–54 years", "55+ years"],
    unit: "% meeting the exercise target",
    rows: [
      ["2012", 58, 42, 31],
      ["2018", 63, 49, 40],
      ["2024", 66, 57, 52],
    ],
    notes:
      "The youngest group remains highest, but the oldest group improves most. These are participation rates, not exercise durations or health outcomes.",
  },
  {
    topic: "Work",
    title: "Working arrangements by industry",
    prompt:
      "The table shows the percentage of employees working mainly on site, in a hybrid arrangement or mainly from home in three industries in 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Mainly on site", "Hybrid", "Mainly from home"],
    unit: "% of employees",
    rows: [
      ["Manufacturing", 86, 11, 3],
      ["Financial services", 34, 49, 17],
      ["Information technology", 22, 43, 35],
    ],
    notes:
      "Rows total 100%. Contrast the largely on-site manufacturing workforce with the two service industries. Hybrid work is more common than mainly remote work in both service industries.",
  },
  {
    topic: "Travel",
    title: "Visitors to three attractions",
    prompt:
      "The line chart shows annual visitor numbers at a museum, a nature reserve and a heritage railway in a fictional region between 2016 and 2024. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Museum", "Nature reserve", "Heritage railway"],
    unit: "thousand visits per year",
    rows: [
      ["2016", 180, 95, 130],
      ["2018", 205, 120, 142],
      ["2020", 85, 145, 45],
      ["2022", 190, 175, 120],
      ["2024", 235, 210, 155],
    ],
    notes:
      "Describe the different pattern in 2020 and the subsequent recovery. Do not assign causes that the chart does not state. Visits do not necessarily represent unique people.",
  },
  {
    topic: "Arts",
    title: "Local cultural spending",
    prompt:
      "The table compares annual spending on libraries, museums and live performances by a fictional local council in 2010, 2015, 2020 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    series: ["Libraries", "Museums", "Live performances"],
    unit: "million currency units",
    rows: [
      ["2010", 6.2, 3.5, 2.1],
      ["2015", 6.8, 4.2, 2.5],
      ["2020", 6.5, 5.1, 1.8],
      ["2025", 7.3, 5.8, 3.4],
    ],
    notes:
      "Libraries receive the most money throughout. Museum spending rises continuously; live-performance funding falls in 2020 before recovering. Values are nominal, not adjusted for inflation.",
  },
];

const letters: {
  topic: string;
  title: string;
  situation: string;
  bullets: string[];
  register: string;
}[] = [
  {
    topic: "Community",
    title: "Request a quieter study area",
    situation:
      "You regularly use a public library, but a recent change to its layout has made the study area noisy. Write a letter to the library manager.",
    bullets: [
      "Explain when and how you use the library.",
      "Describe the problem and how it affects your studies.",
      "Suggest practical changes that would help.",
    ],
    register:
      "Formal: use a clear request and a courteous closing; do not invent a required postal address.",
  },
  {
    topic: "Food",
    title: "Arrange a community cooking event",
    situation:
      "You are helping organise a cooking event for your neighbourhood and would like a local chef to take part. Write a letter to the chef.",
    bullets: [
      "Explain the purpose and proposed date of the event.",
      "Describe the activities you would like the chef to lead.",
      "Explain what equipment and support you can provide.",
    ],
    register:
      "Semi-formal: introduce your role, be specific about the invitation, and ask about availability.",
  },
  {
    topic: "Science",
    title: "Tell a friend about a science exhibition",
    situation:
      "A science exhibition is opening near your home. You think a friend who lives in another town would enjoy it. Write a letter to your friend.",
    bullets: [
      "Describe the exhibition and why it interests you.",
      "Explain why you think your friend would enjoy it.",
      "Suggest a date and make arrangements for the visit.",
    ],
    register:
      "Informal: maintain a friendly voice while addressing all three points.",
  },
  {
    topic: "Finance",
    title: "Query an unexpected course charge",
    situation:
      "You paid for an evening course, but your bank statement shows a higher charge than the advertised fee. Write a letter to the course administrator.",
    bullets: [
      "Give details of the course and the payment.",
      "Explain the difference between the advertised fee and the charge.",
      "Ask for an explanation and an appropriate resolution.",
    ],
    register:
      "Formal: distinguish facts from assumptions and request a specific response politely.",
  },
];

const essays: {
  topic: string;
  title: string;
  prompt: string;
  focus: string;
}[] = [
  {
    topic: "Education",
    title: "Broad study or early specialisation?",
    prompt:
      "Some people believe university students should study subjects beyond their main degree. Others think they should focus entirely on their chosen field. Discuss both views and give your own opinion.",
    focus:
      "Discuss genuine benefits and costs on each side, state a consistent position, and support it with plausible examples.",
  },
  {
    topic: "Environment",
    title: "Responsibility for reducing waste",
    prompt:
      "Reducing household waste is mainly the responsibility of manufacturers, rather than individual consumers. To what extent do you agree or disagree?",
    focus:
      "Evaluate the relative influence of product design and consumer choices. Avoid treating the two groups as mutually exclusive.",
  },
  {
    topic: "Technology",
    title: "AI tools in the workplace",
    prompt:
      "Artificial intelligence tools are increasingly used to complete routine work. What are the advantages and disadvantages of this development?",
    focus:
      "Consider productivity, errors, privacy and changes to job roles. Explain mechanisms instead of listing unsupported claims.",
  },
  {
    topic: "Transport",
    title: "Funding city transport",
    prompt:
      "Some people think governments should make public transport free in cities. Others believe improving service quality is more important than reducing fares. Discuss both views and give your own opinion.",
    focus:
      "Compare affordability with frequency, reliability and capacity; consider realistic funding trade-offs.",
  },
  {
    topic: "Health",
    title: "Preventive health policy",
    prompt:
      "Governments should spend more on preventing illness than on treating people who are already ill. To what extent do you agree or disagree?",
    focus:
      "Define prevention, acknowledge essential treatment, and explain how spending priorities affect outcomes over different timescales.",
  },
  {
    topic: "Work",
    title: "A four-day working week",
    prompt:
      "Some employers are considering a four-day working week without reducing employees’ pay. Do the advantages of this approach outweigh the disadvantages?",
    focus:
      "Judge the balance rather than merely listing both sides. Discuss differences between industries and the conditions needed for success.",
  },
  {
    topic: "Travel",
    title: "Pressure on popular destinations",
    prompt:
      "Many popular tourist destinations receive more visitors than local communities can comfortably accommodate. What problems does this cause, and what measures could reduce these problems?",
    focus:
      "Link each proposed measure to a specific problem, such as housing pressure, crowding or damage to natural sites.",
  },
  {
    topic: "Arts",
    title: "Public funding for cultural institutions",
    prompt:
      "Some people argue that museums and theatres should receive public funding, while others think they should be financed entirely through ticket sales and private donations. Discuss both views and give your own opinion.",
    focus:
      "Address access, cultural value and accountability alongside the argument for financial independence.",
  },
  {
    topic: "Community",
    title: "Neighbourhood connections",
    prompt:
      "In many cities, people know fewer of their neighbours than in the past. Why might this be happening, and what could be done to strengthen local connections?",
    focus:
      "Explain possible causes without claiming the trend is universal. Propose changes that fit the causes you identify.",
  },
  {
    topic: "Food",
    title: "Food education at school",
    prompt:
      "All secondary school students should learn how to prepare healthy meals. To what extent do you agree or disagree?",
    focus:
      "Consider practical independence, time in the curriculum and access to facilities. Distinguish teaching useful skills from prescribing one diet.",
  },
  {
    topic: "Science",
    title: "Priorities in scientific research",
    prompt:
      "Some people think scientific research should focus only on problems with immediate practical benefits. Others believe research without a clear short-term application is equally important. Discuss both views and give your own opinion.",
    focus:
      "Compare immediate needs with uncertain long-term discovery. Use illustrative examples without inventing research statistics.",
  },
  {
    topic: "Finance",
    title: "Managing money in early adulthood",
    prompt:
      "Many young adults find it difficult to manage their personal finances. What are the main reasons for this, and what measures could help them?",
    focus:
      "Include education and structural pressures where relevant. Explain how each suggested measure would change decisions or reduce difficulties.",
  },
];

export const writingLessons: StoredContent[] = [
  ...charts.map(
    (task, i): StoredContent => ({
      ...base(`writing-task1-${i + 1}`, "writing", task.topic, i),
      title: task.title,
      description:
        "Academic Task 1: select key features, write an overview and compare accurate data.",
      testType: "academic",
      durationMinutes: 20,
      tags: [
        "task-1",
        "chart",
        "overview",
        "data-comparison",
        "original-material",
      ],
      sections: [
        {
          id: `writing-task1-${i + 1}-section`,
          title: "Academic Writing Task 1",
          task: 1,
          text: task.prompt,
          instructions: `Write at least 150 words. Spend about 20 minutes. All figures are fictional practice data. Study note: ${task.notes}`,
          chartSeries: task.series,
          chartUnit: task.unit,
          chart: task.rows.map(([label, ...values]) => ({ label, values })),
        },
      ],
    }),
  ),
  ...letters.map(
    (task, i): StoredContent => ({
      ...base(`writing-letter-${i + 1}`, "writing", task.topic, i),
      title: task.title,
      description:
        "General Training Task 1: fulfil three communicative purposes with appropriate tone.",
      testType: "general",
      durationMinutes: 20,
      tags: ["task-1", "letter", "register", "original-material"],
      sections: [
        {
          id: `writing-letter-${i + 1}-section`,
          title: "General Training Writing Task 1",
          task: 1,
          text: task.situation,
          cuePoints: task.bullets,
          instructions: `Write at least 150 words. Spend about 20 minutes. You do not need to write any addresses. ${task.register}`,
        },
      ],
    }),
  ),
  ...essays.map(
    (task, i): StoredContent => ({
      ...base(`writing-task2-${i + 1}`, "writing", task.topic, i),
      title: task.title,
      description:
        "Task 2: develop a clear position, organised arguments and supported examples.",
      durationMinutes: 40,
      tags: ["task-2", "argument", "coherence", "original-material"],
      sections: [
        {
          id: `writing-task2-${i + 1}-section`,
          title: "Writing Task 2",
          task: 2,
          text: task.prompt,
          instructions: `Write at least 250 words. Spend about 40 minutes. Give reasons for your answer and include relevant examples from your knowledge or experience. Study focus: ${task.focus}`,
        },
      ],
    }),
  ),
];

type SpeakingPack = {
  topic: string;
  title: string;
  part1: string[];
  cue: string;
  points: string[];
  part3: string[];
};
const speakingPacks: SpeakingPack[] = [
  {
    topic: "Education",
    title: "Learning something difficult",
    part1: [
      "What subject did you enjoy most at school?",
      "Did you prefer studying alone or with classmates?",
      "What do you usually do when a lesson is difficult?",
      "Do you take notes by hand or on a device?",
      "Is there anything you would like to learn this year?",
      "Has the way you study changed since you were younger?",
    ],
    cue: "Describe a skill that took you a long time to learn.",
    points: [
      "what the skill was",
      "why you wanted to learn it",
      "how you practised",
      "and explain what helped you make progress",
    ],
    part3: [
      "Why do some learners give up when a subject becomes difficult?",
      "How can teachers balance encouragement with honest feedback?",
      "Is persistence more important than natural ability?",
      "Should schools allow students to progress at different speeds?",
      "How does learning a practical skill differ from learning facts?",
      "What responsibilities do adults have to continue learning?",
    ],
  },
  {
    topic: "Education",
    title: "A helpful teacher",
    part1: [
      "What was your first school like?",
      "How far did you travel to school?",
      "Were there many activities outside lessons?",
      "What makes a classroom comfortable for you?",
      "Do you enjoy explaining things to other people?",
      "Which type of course would you consider taking now?",
    ],
    cue: "Describe a teacher or instructor who helped you understand something.",
    points: [
      "who the person was",
      "what they taught you",
      "how they explained it",
      "and explain why their approach was useful",
    ],
    part3: [
      "What qualities distinguish a good teacher from a knowledgeable expert?",
      "How can education systems attract effective teachers?",
      "Can technology replace some of the work teachers do?",
      "Should teachers adapt lessons to each learner?",
      "How should a teacher respond to a student who challenges an idea?",
      "What are the limitations of judging teachers only by test results?",
    ],
  },
  {
    topic: "Environment",
    title: "A place in nature",
    part1: [
      "Are there green spaces near your home?",
      "How often do you spend time outdoors?",
      "What kind of weather do you enjoy?",
      "Do you keep any plants at home?",
      "Did you visit natural places as a child?",
      "Would you like more trees in your neighbourhood?",
    ],
    cue: "Describe a natural place you would like to visit again.",
    points: [
      "where the place is",
      "when you visited it",
      "what you did there",
      "and explain why it left an impression on you",
    ],
    part3: [
      "Why do cities need access to natural spaces?",
      "How can authorities protect a place that attracts many visitors?",
      "Who should pay for maintaining public parks?",
      "Can contact with nature influence attitudes towards conservation?",
      "What conflicts arise between conservation and local livelihoods?",
      "How might climate change affect the places people choose to visit?",
    ],
  },
  {
    topic: "Environment",
    title: "Reducing everyday waste",
    part1: [
      "Do you reuse shopping bags?",
      "What do you usually do with old clothes?",
      "Is recycling convenient where you live?",
      "Do you prefer repairing things or replacing them?",
      "Have you ever taken part in a clean-up activity?",
      "What could make your home more energy efficient?",
    ],
    cue: "Describe a change you made to reduce waste or save resources.",
    points: [
      "what you changed",
      "why you decided to do it",
      "whether it was difficult",
      "and explain how useful the change has been",
    ],
    part3: [
      "What prevents people from reducing waste even when they want to?",
      "Are incentives or penalties more effective for changing behaviour?",
      "How much responsibility should producers take for packaging?",
      "Can small personal changes lead to wider environmental progress?",
      "How should a city measure the success of a recycling programme?",
      "Why might an apparently green product still have environmental costs?",
    ],
  },
  {
    topic: "Technology",
    title: "A useful digital tool",
    part1: [
      "What do you use your phone for most often?",
      "Do you enjoy trying new applications?",
      "How do you organise digital photos?",
      "Is there a device you rarely use now?",
      "Do you prefer typing or handwriting short messages?",
      "When do you choose to turn notifications off?",
    ],
    cue: "Describe a digital tool that helps you in everyday life.",
    points: [
      "what the tool does",
      "how you discovered it",
      "when you use it",
      "and explain why it is useful to you",
    ],
    part3: [
      "How can designers make technology accessible to different age groups?",
      "What skills are needed to judge whether online information is reliable?",
      "Should users have more control over their personal data?",
      "Why do people sometimes resist useful new technologies?",
      "How can society avoid excluding people without digital access?",
      "What are the risks of depending on a single digital service?",
    ],
  },
  {
    topic: "Technology",
    title: "Solving a technical problem",
    part1: [
      "Who do you ask for help with a device?",
      "Do you read instructions before using something new?",
      "Have you ever lost an important digital file?",
      "How often do you back up your work?",
      "Is internet access reliable where you live?",
      "Would you enjoy learning to code?",
    ],
    cue: "Describe a time when you solved a problem with a device or application.",
    points: [
      "what the problem was",
      "how it affected you",
      "what you did to solve it",
      "and explain what you learned from the experience",
    ],
    part3: [
      "Should basic troubleshooting be taught in schools?",
      "How should companies support customers with limited technical knowledge?",
      "What is the relationship between convenience and digital security?",
      "Can automated support provide the same quality as a human adviser?",
      "Why might software be difficult even for experienced users?",
      "How can products be designed to last longer?",
    ],
  },
  {
    topic: "Transport",
    title: "A memorable journey",
    part1: [
      "How do you usually travel around your town?",
      "What is your journey to work or study like?",
      "Do you enjoy walking?",
      "Have you used a bicycle recently?",
      "Is there a bus stop near your home?",
      "Which kind of journey do you find tiring?",
    ],
    cue: "Describe a journey that was memorable for a good reason.",
    points: [
      "where you travelled",
      "how you travelled",
      "who was with you",
      "and explain what made the journey memorable",
    ],
    part3: [
      "How does reliable transport affect access to opportunities?",
      "Should cities prioritise pedestrians over private cars?",
      "What makes public transport attractive to people who own cars?",
      "How can transport planners account for an ageing population?",
      "What are the disadvantages of building more roads to ease congestion?",
      "How should governments balance local travel needs with long-distance connections?",
    ],
  },
  {
    topic: "Transport",
    title: "Getting around a new place",
    part1: [
      "Do you find maps easy to use?",
      "Have you ever missed a train or bus?",
      "Do you prefer booking tickets in advance?",
      "What do you do while waiting for transport?",
      "Are there times when traffic is particularly busy near you?",
      "Would you like to live closer to work or study?",
    ],
    cue: "Describe a time when you had to find your way in an unfamiliar place.",
    points: [
      "where you were",
      "why you needed to get somewhere",
      "how you found the route",
      "and explain how you felt when you arrived",
    ],
    part3: [
      "What makes a transport network easy for visitors to understand?",
      "Should ticket prices reflect the actual cost of a journey?",
      "How can transport services improve safety at night?",
      "What problems arise when several operators serve the same city?",
      "How could real-time information change travel decisions?",
      "Why is accessible transport important beyond the needs of wheelchair users?",
    ],
  },
  {
    topic: "Health",
    title: "Building a healthy routine",
    part1: [
      "What do you do to relax after a busy day?",
      "Do you enjoy any form of exercise?",
      "How do you make time for rest?",
      "Do you prefer being active indoors or outdoors?",
      "What helps you sleep well?",
      "Has your daily routine changed recently?",
    ],
    cue: "Describe a healthy habit you have developed.",
    points: [
      "what the habit is",
      "when you began it",
      "how you made it part of your routine",
      "and explain the difference it has made",
    ],
    part3: [
      "Why is it difficult to maintain healthy habits?",
      "How can workplaces support employees’ well-being?",
      "Should health campaigns focus on information or on changing environments?",
      "How do income and housing influence opportunities to stay healthy?",
      "What role can communities play in reducing social isolation?",
      "How can governments evaluate preventive health programmes?",
    ],
  },
  {
    topic: "Health",
    title: "An activity that helps you relax",
    part1: [
      "Do you prefer quiet or busy places when you relax?",
      "What do you usually do at the weekend?",
      "Have you tried a new sport?",
      "Do you enjoy spending time away from screens?",
      "What kind of music helps you unwind?",
      "Do you find it easy to take breaks?",
    ],
    cue: "Describe an activity that helps you manage stress.",
    points: [
      "what the activity is",
      "when and where you do it",
      "whether you do it alone or with others",
      "and explain why it helps you",
    ],
    part3: [
      "What causes stress in modern working life?",
      "How can schools support students during stressful periods?",
      "Is it useful to talk publicly about mental well-being?",
      "What responsibilities should employers have for reasonable workloads?",
      "How does the design of a neighbourhood affect well-being?",
      "Can technology both increase stress and help reduce it?",
    ],
  },
  {
    topic: "Work",
    title: "Working with other people",
    part1: [
      "Do you work or study at the moment?",
      "What part of your daily work or study do you enjoy?",
      "Do you prefer clear instructions or a flexible task?",
      "When are you most productive during the day?",
      "How do you organise a busy schedule?",
      "Would you like to change your working environment?",
    ],
    cue: "Describe a successful task you completed with other people.",
    points: [
      "what the task was",
      "who was involved",
      "what your role was",
      "and explain why the collaboration worked well",
    ],
    part3: [
      "What makes a team effective?",
      "How should a leader handle disagreement?",
      "Is collaboration equally useful for every kind of work?",
      "How can remote teams build trust?",
      "Should individual achievements or team results determine rewards?",
      "What can organisations learn from a project that fails?",
    ],
  },
  {
    topic: "Work",
    title: "A job you would like to try",
    part1: [
      "What did you want to do when you were younger?",
      "Do you like learning practical skills?",
      "Would you prefer working in a large or small organisation?",
      "How important is travel time when choosing a job?",
      "Do you enjoy meeting new people?",
      "What would make a working day satisfying for you?",
    ],
    cue: "Describe a job you would like to try for a short time.",
    points: [
      "what the job is",
      "what it involves",
      "what skills you would need",
      "and explain why you would like to try it",
    ],
    part3: [
      "How should people balance income and job satisfaction?",
      "What might make a career change difficult?",
      "Should schools provide more information about different occupations?",
      "How do automation and technology change the value of skills?",
      "What are the benefits and risks of temporary work?",
      "How can employers create opportunities for people without previous experience?",
    ],
  },
  {
    topic: "Travel",
    title: "A place worth recommending",
    part1: [
      "Do you enjoy visiting new places?",
      "What do you pack first for a trip?",
      "Do you prefer planning a trip or deciding as you go?",
      "Have you travelled alone?",
      "What do you like to photograph when travelling?",
      "Do you enjoy returning to familiar destinations?",
    ],
    cue: "Describe a place you would recommend to a visitor.",
    points: [
      "where it is",
      "what a visitor can do there",
      "when it is best to visit",
      "and explain why you recommend it",
    ],
    part3: [
      "How can tourism benefit a local community?",
      "What happens when a destination becomes too popular?",
      "Should visitors follow different rules in culturally significant places?",
      "How can tourism income be distributed more fairly?",
      "Why do some people prefer familiar destinations?",
      "What responsibilities do travel businesses have towards the places they promote?",
    ],
  },
  {
    topic: "Travel",
    title: "An unexpected travel experience",
    part1: [
      "Do you like staying in hotels?",
      "Have you ever changed a travel plan at the last minute?",
      "What makes accommodation comfortable?",
      "Do you try local food when you travel?",
      "How do you choose a destination?",
      "Would you like to take a longer trip in the future?",
    ],
    cue: "Describe something unexpected that happened during a trip.",
    points: [
      "where you were travelling",
      "what happened",
      "how you responded",
      "and explain how it changed your experience",
    ],
    part3: [
      "Why do people value experiences they could not plan?",
      "How can travellers prepare for uncertainty?",
      "Should travel insurance be encouraged more widely?",
      "What can countries do to make visitors feel welcome?",
      "How has online information changed travel planning?",
      "Can an emphasis on taking photographs reduce enjoyment of a trip?",
    ],
  },
  {
    topic: "Arts",
    title: "A memorable performance",
    part1: [
      "Do you listen to music every day?",
      "What kind of music do you enjoy?",
      "Have you been to a live performance?",
      "Did you learn any art or music at school?",
      "Do you prefer watching films at home or in a cinema?",
      "Is there an artist you would like to see perform?",
    ],
    cue: "Describe a performance you enjoyed watching.",
    points: [
      "what kind of performance it was",
      "where and when you saw it",
      "who you watched it with",
      "and explain what made it enjoyable",
    ],
    part3: [
      "Why do live performances appeal to people despite digital alternatives?",
      "Should cultural events receive public support?",
      "How can artists reach audiences with limited money?",
      "What is the role of criticism in artistic development?",
      "Can a popular work also have considerable artistic value?",
      "How does participation in the arts differ from being an audience member?",
    ],
  },
  {
    topic: "Arts",
    title: "A creative object",
    part1: [
      "Do you enjoy making things?",
      "Are there pictures or decorations in your home?",
      "Have you visited an art exhibition?",
      "What colours do you like?",
      "Do you prefer traditional or modern design?",
      "Would you like to improve a creative skill?",
    ],
    cue: "Describe a handmade or artistic object that is special to you.",
    points: [
      "what the object is",
      "how you obtained it",
      "what it looks like",
      "and explain why it matters to you",
    ],
    part3: [
      "Why can handmade objects feel more valuable than mass-produced ones?",
      "How do cultural traditions influence design?",
      "Should museums return culturally significant objects to their places of origin?",
      "What helps traditional crafts survive?",
      "Can everyday objects be considered art?",
      "How should artists be credited when their work is shared online?",
    ],
  },
  {
    topic: "Community",
    title: "Helping someone nearby",
    part1: [
      "How long have you lived in your neighbourhood?",
      "Do you know any of your neighbours?",
      "What do you like about your local area?",
      "Is there a place where people often meet?",
      "Do you take part in local activities?",
      "What would you improve near your home?",
    ],
    cue: "Describe a time when you helped someone in your community.",
    points: [
      "who needed help",
      "what the situation was",
      "what you did",
      "and explain how you felt about the experience",
    ],
    part3: [
      "What encourages people to help those outside their immediate family?",
      "How can communities include new residents?",
      "Should volunteering be a requirement in education?",
      "What are the limits of relying on volunteers for essential services?",
      "How do shared public spaces affect social relationships?",
      "Why might people be reluctant to ask for help?",
    ],
  },
  {
    topic: "Community",
    title: "A local event",
    part1: [
      "Are there festivals where you live?",
      "Do you enjoy meeting people you do not know?",
      "What public facilities do you use?",
      "Would you like to live in a quieter area?",
      "How do you hear about local news?",
      "Have you joined a club or group?",
    ],
    cue: "Describe a local event you would like to organise.",
    points: [
      "what the event would be",
      "where it would take place",
      "who you would invite",
      "and explain how it could benefit the community",
    ],
    part3: [
      "What makes a community event accessible to different groups?",
      "How should organisers balance tradition with change?",
      "Who should decide how public space is used?",
      "Can online communities provide the same support as local ones?",
      "What can local authorities do to build trust?",
      "How can people disagree on community issues without damaging relationships?",
    ],
  },
  {
    topic: "Food",
    title: "A meal with other people",
    part1: [
      "What do you usually eat for breakfast?",
      "Do you enjoy cooking?",
      "How often do you eat with your family?",
      "Is there a food you disliked as a child but enjoy now?",
      "Do you prefer sweet or savoury snacks?",
      "What would you like to learn to cook?",
    ],
    cue: "Describe a meal you enjoyed sharing with other people.",
    points: [
      "when and where you had it",
      "who was there",
      "what you ate",
      "and explain why the meal was memorable",
    ],
    part3: [
      "Why do meals play an important role in social occasions?",
      "How are eating habits changing in busy households?",
      "Should schools teach practical cooking skills?",
      "What influences people’s decisions about healthy food?",
      "How can restaurants accommodate different dietary needs?",
      "What might be lost when traditional recipes disappear?",
    ],
  },
  {
    topic: "Food",
    title: "Trying an unfamiliar dish",
    part1: [
      "Do you like trying unfamiliar food?",
      "Where do you usually buy groceries?",
      "Do you check food labels?",
      "Have you grown any food yourself?",
      "What food is popular in your area?",
      "Do you prefer eating at home or in a restaurant?",
    ],
    cue: "Describe a food you tried for the first time.",
    points: [
      "what it was",
      "where you tried it",
      "why you decided to try it",
      "and explain what you thought of it",
    ],
    part3: [
      "How does food connect people to their cultural identity?",
      "Why do food trends spread quickly?",
      "Should governments regulate how unhealthy foods are advertised?",
      "How can food waste be reduced across the supply chain?",
      "What are the trade-offs between local and imported food?",
      "Can convenience foods contribute to a balanced diet?",
    ],
  },
  {
    topic: "Science",
    title: "An interesting discovery",
    part1: [
      "Did you enjoy science lessons at school?",
      "Do you watch programmes about science?",
      "What topic would you like to understand better?",
      "Have you visited a science museum?",
      "Do you enjoy finding out how things work?",
      "Where do you hear about new discoveries?",
    ],
    cue: "Describe a scientific idea or discovery that interests you.",
    points: [
      "what the idea or discovery is",
      "how you learned about it",
      "what you understand about it",
      "and explain why it interests you",
    ],
    part3: [
      "Why is scientific literacy useful for everyday decisions?",
      "How can scientists explain uncertainty to the public?",
      "Should all publicly funded research be freely accessible?",
      "What makes a scientific claim more trustworthy?",
      "How should research priorities be chosen?",
      "Why can a discovery have consequences that are difficult to predict?",
    ],
  },
  {
    topic: "Science",
    title: "Learning from an experiment",
    part1: [
      "Have you ever carried out a simple experiment?",
      "Do you like visiting exhibitions?",
      "What kind of factual books do you enjoy?",
      "Do you prefer learning through reading or demonstrations?",
      "Is there a natural phenomenon you find surprising?",
      "Would you like to attend a public science talk?",
    ],
    cue: "Describe an occasion when you learned something through observation or an experiment.",
    points: [
      "what you wanted to find out",
      "what you observed or tested",
      "what the result was",
      "and explain what the experience taught you",
    ],
    part3: [
      "Why is repeating an experiment important?",
      "What is the difference between an observation and an explanation?",
      "How can research institutions encourage honesty about mistakes?",
      "Should scientists be responsible for the uses of their discoveries?",
      "What are the benefits of cooperation between different research fields?",
      "How can public discussion of science avoid oversimplification?",
    ],
  },
  {
    topic: "Finance",
    title: "Saving for something useful",
    part1: [
      "Do you prefer paying by cash or card?",
      "Do you usually compare prices before buying something?",
      "What do you think is worth spending money on?",
      "Do you keep track of small expenses?",
      "Did you save money as a child?",
      "What would you like to save for in the future?",
    ],
    cue: "Describe something you saved money to buy.",
    points: [
      "what you wanted to buy",
      "why you wanted it",
      "how you saved the money",
      "and explain whether the purchase was worthwhile",
    ],
    part3: [
      "Why is saving difficult for some households?",
      "Should personal finance be taught at school?",
      "How does advertising influence financial decisions?",
      "What are the advantages and risks of cashless payments?",
      "How can people judge whether financial advice is reliable?",
      "What responsibilities do lenders have towards inexperienced borrowers?",
    ],
  },
  {
    topic: "Finance",
    title: "A good-value purchase",
    part1: [
      "Do you enjoy shopping?",
      "Have you ever bought something second-hand?",
      "Do you make a list before shopping?",
      "What do you consider before a large purchase?",
      "Do you prefer shopping online or in a store?",
      "Have your spending habits changed recently?",
    ],
    cue: "Describe a purchase that you thought was good value.",
    points: [
      "what you bought",
      "where you bought it",
      "how you judged its value",
      "and explain how useful it has been",
    ],
    part3: [
      "Is the lowest price always the best value?",
      "How should consumers weigh durability against initial cost?",
      "Why can people regret a purchase even when it was discounted?",
      "What is the relationship between consumer spending and sustainability?",
      "Should businesses make subscription charges easier to understand?",
      "How can regulations protect consumers without limiting useful choice?",
    ],
  },
];

const speakingSections = (
  pack: SpeakingPack,
  prefix: string,
): ContentSection[] => [
  {
    id: `${prefix}-part1`,
    title: "Part 1 — Introduction and familiar topics",
    text: pack.part1
      .map((question, index) => `${index + 1}. ${question}`)
      .join("\n"),
    instructions:
      "Allow 4–5 minutes. Answer naturally in a few developed sentences; do not memorise a script.",
  },
  {
    id: `${prefix}-part2`,
    title: "Part 2 — Individual long turn",
    text: pack.cue,
    cuePoints: pack.points,
    instructions:
      "You have 1 minute to prepare and may make notes. Then speak for 1–2 minutes. Address the cue card in your own words.",
  },
  {
    id: `${prefix}-part3`,
    title: "Part 3 — Discussion and abstract ideas",
    text: pack.part3
      .map((question, index) => `${index + 1}. ${question}`)
      .join("\n"),
    instructions:
      "Allow 4–5 minutes. Explain reasons, compare perspectives and consider consequences. The questions invite discussion rather than factual quizzes.",
  },
];

export const speakingLessons: StoredContent[] = speakingPacks.map(
  (pack, index) => ({
    ...base(`speaking-${index + 1}`, "speaking", pack.topic, index),
    title: pack.title,
    description:
      "A complete three-part speaking practice set with personal, extended and abstract questions.",
    durationMinutes: 12,
    tags: [
      "part-1",
      "part-2",
      "part-3",
      "fluency",
      "idea-development",
      "original-material",
    ],
    sections: speakingSections(pack, `speaking-${index + 1}`),
  }),
);

type GrammarQuestion = [
  prompt: string,
  answer: string,
  explanation: string,
  options?: string[],
  acceptedAnswers?: string[],
];
type GrammarPack = {
  title: string;
  topic: string;
  cefr: Cefr;
  band: number;
  tag: string;
  lesson: string;
  questions: GrammarQuestion[];
};
const grammarPacks: GrammarPack[] = [
  {
    title: "Present simple and present continuous",
    topic: "Education",
    cefr: "A2",
    band: 4,
    tag: "present-tenses",
    lesson:
      "Use the present simple for routines and general facts: The library opens at nine. Use the present continuous for an action happening now or a temporary situation: I am studying in the reading room this week. Stative verbs such as know and understand usually take a simple form. Questions in the present simple need do or does; questions with be reverse subject and auxiliary.",
    questions: [
      [
        "Our tutor ___ three classes every Monday.",
        "teaches",
        "Every Monday describes a routine. The third-person singular present simple takes -s.",
        ["teaches", "is teaching", "teach", "taught"],
      ],
      [
        "Please be quiet. The students ___ a listening test now.",
        "are taking",
        "Now signals an action in progress; students is plural.",
        ["take", "are taking", "takes", "took"],
      ],
      [
        "Complete with do or does: ___ your course include a speaking workshop?",
        "Does",
        "Your course is a singular subject, so a present-simple question begins with does.",
        undefined,
        ["does"],
      ],
      [
        "I ___ what this word means.",
        "know",
        "Know is a stative verb; the simple form describes a state of knowledge.",
        ["know", "am knowing", "knows", "knowing"],
      ],
      [
        "This month, Lena ___ at a different campus.",
        "is studying",
        "This month frames a temporary arrangement rather than a permanent routine.",
        ["studies always", "is studying", "study", "studied yesterday"],
      ],
      [
        "Complete the negative: Our class ___ meet on Sundays.",
        "does not",
        "Class is singular. Use does not plus the base verb meet.",
        undefined,
        ["doesn't"],
      ],
    ],
  },
  {
    title: "Past simple: completed events",
    topic: "Travel",
    cefr: "A2",
    band: 4,
    tag: "past-simple",
    lesson:
      "The past simple places a completed event before now. Regular verbs usually take -ed; many common verbs have irregular forms such as went, bought and saw. After did or did not, use the base form, not another past form. Was and were are past forms of be and do not need did.",
    questions: [
      [
        "We ___ the museum last Saturday.",
        "visited",
        "Last Saturday is a finished time; visited is the regular past form.",
        ["visit", "visited", "have visiting", "visits"],
      ],
      [
        "The train ___ at the station ten minutes late.",
        "arrived",
        "The sentence narrates a completed arrival.",
        ["arrived", "arrive", "arrives", "arriving"],
      ],
      [
        "Complete with the past form of go: They ___ to the coast in July.",
        "went",
        "Go has the irregular past form went.",
      ],
      [
        "Which question is grammatically correct?",
        "Did you book the tickets?",
        "After did, use the base form book.",
        [
          "Did you booked the tickets?",
          "Did you book the tickets?",
          "Do you booked the tickets?",
          "Were you book the tickets?",
        ],
      ],
      [
        "I ___ the receipt after the journey.",
        "did not keep",
        "Did not is followed by the base form keep.",
        ["did not kept", "did not keep", "was not keep", "does not kept"],
      ],
      [
        "Complete with was or were: The streets ___ very quiet that evening.",
        "were",
        "Streets is plural, so the past form of be is were.",
      ],
    ],
  },
  {
    title: "Articles and countable nouns",
    topic: "Food",
    cefr: "A2",
    band: 4,
    tag: "articles-countability",
    lesson:
      "Use a or an with a singular countable noun when introducing it: a recipe, an onion. Use the for an identifiable item already mentioned or specified. General plural nouns and general uncountable nouns usually have no article: Vegetables contain fibre. Rice is common in many cuisines. Much goes with uncountable nouns; many goes with plural countable nouns.",
    questions: [
      [
        "She added ___ onion to the soup.",
        "an",
        "Onion begins with a vowel sound and is singular countable.",
        ["a", "an", "many", "no article"],
      ],
      [
        "I bought a cookbook. ___ cookbook has useful photos.",
        "The",
        "The second mention refers to the specific book already introduced.",
        ["A", "An", "The", "Some"],
      ],
      [
        "There is not ___ rice left.",
        "much",
        "Rice is uncountable in this meaning, so much is appropriate.",
        ["many", "much", "a", "an"],
      ],
      [
        "How ___ tomatoes do we need?",
        "many",
        "Tomatoes is a plural countable noun.",
        ["much", "many", "a little", "an"],
      ],
      [
        "Complete with a, an, the or NONE: ___ fresh fruit can be a convenient snack.",
        "NONE",
        "Fruit is used generally as an uncountable noun, so no article is needed.",
        undefined,
        ["none", "no article"],
      ],
      [
        "Which phrase is correct?",
        "two pieces of advice",
        "Advice is uncountable; count individual items as pieces of advice.",
        ["two advices", "an advice", "two pieces of advice", "many advice"],
      ],
    ],
  },
  {
    title: "Comparatives and superlatives",
    topic: "Transport",
    cefr: "A2",
    band: 4,
    tag: "comparison",
    lesson:
      "Compare two things with a comparative and than: faster than, more reliable than. Longer adjectives often use more or less. A superlative identifies an extreme within a group: the fastest, the most reliable. Avoid doubling a comparative with more faster. As ... as expresses equality; not as ... as expresses a lower degree.",
    questions: [
      [
        "Cycling is often ___ than driving over short distances.",
        "faster",
        "Fast forms its comparative with -er; than introduces the comparison.",
        ["more faster", "faster", "fastest", "most fast"],
      ],
      [
        "This is ___ bus route in the district.",
        "the longest",
        "The district provides a comparison group, so use the superlative.",
        ["longer", "the longest", "most long", "as longest"],
      ],
      [
        "The new service is ___ reliable than the old one.",
        "more",
        "Reliable normally forms a comparative with more.",
      ],
      [
        "A return ticket is ___ expensive as two single tickets.",
        "not as",
        "Not as ... as expresses a lower degree of expense.",
        ["not as", "less as", "fewer", "most"],
      ],
      [
        "Complete the comparative of good: The evening connection is ___ than the morning one.",
        "better",
        "Good has the irregular comparative better.",
      ],
      [
        "Which phrase avoids a doubled comparative?",
        "much cheaper",
        "Much intensifies cheaper; more cheaper incorrectly marks the comparison twice.",
        ["more cheaper", "much cheaper", "most cheaper", "very cheapest than"],
      ],
    ],
  },
  {
    title: "Present perfect and past simple",
    topic: "Work",
    cefr: "B1",
    band: 5.5,
    tag: "perfect-vs-past",
    lesson:
      "Use the present perfect for experience or a situation connected to now: I have worked here for two years. Use the past simple with a finished time: I joined in 2023. Since introduces a starting point; for introduces a duration. Already and yet often accompany the present perfect. A continuing state can use a perfect form, but a specific completed event usually uses the past simple.",
    questions: [
      [
        "I ___ at this company since 2022 and still work here.",
        "have worked",
        "Since 2022 links the starting point to the continuing present situation.",
        ["worked yesterday", "have worked", "work yesterday", "am worked"],
      ],
      [
        "Maya ___ the contract last Tuesday.",
        "signed",
        "Last Tuesday is a finished time, so the past simple is required.",
        ["has signed", "signed", "have signed", "signs"],
      ],
      [
        "Complete with for or since: We have used this system ___ six months.",
        "for",
        "Six months is a duration rather than a starting point.",
      ],
      [
        "Have you finished the report ___?",
        "yet",
        "Yet asks about completion up to the present and normally appears at the end.",
        ["yet", "since", "ago", "last"],
      ],
      [
        "Complete with for or since: I have known my manager ___ our first training day.",
        "since",
        "Our first training day is a starting point.",
      ],
      [
        "Which sentence correctly describes an unspecified experience?",
        "I have attended a professional conference.",
        "The present perfect describes experience without locating it at a finished time.",
        [
          "I have attended a conference yesterday.",
          "I have attended a professional conference.",
          "I has attended a conference.",
          "I have attend a conference.",
        ],
      ],
    ],
  },
  {
    title: "Future plans and predictions",
    topic: "Technology",
    cefr: "B1",
    band: 5.5,
    tag: "future-forms",
    lesson:
      "Be going to often expresses an intention already decided or a prediction based on visible evidence. The present continuous can express an arranged future event. Will commonly expresses a decision made at the moment, an offer, or a general prediction. These forms sometimes overlap; interpret the context rather than memorising a one-word rule. Timetables can use the present simple.",
    questions: [
      [
        "The battery indicator is nearly empty. The device ___ shut down soon.",
        "is going to",
        "The prediction is based on visible present evidence.",
        ["is going to", "was", "has", "does"],
      ],
      [
        "“The help desk is busy.” “I ___ answer the next call.”",
        "will",
        "This is an immediate offer or decision made during the conversation.",
        ["will", "have", "was", "did"],
      ],
      [
        "We ___ the software trainer at 10 tomorrow; the appointment is confirmed.",
        "are meeting",
        "The present continuous can express a confirmed future arrangement.",
        ["are meeting", "meet yesterday", "have met last week", "were meet"],
      ],
      [
        "Complete the intention: I am going ___ replace my old laptop next month.",
        "to",
        "Be going to is followed by the base verb.",
      ],
      [
        "The online session ___ at nine according to the published timetable.",
        "starts",
        "The present simple can refer to a scheduled event.",
        ["starts", "started yesterday", "has starting", "start"],
      ],
      [
        "Which sentence is a general prediction?",
        "More services will become digital.",
        "Will plus the base verb expresses a prediction about future developments.",
        [
          "More services will become digital.",
          "More services will becoming digital.",
          "More services did become tomorrow.",
          "More services has become next year.",
        ],
      ],
    ],
  },
  {
    title: "Modals: obligation, advice and permission",
    topic: "Health",
    cefr: "B1",
    band: 5.5,
    tag: "modals",
    lesson:
      "Must and have to express obligation. Must not expresses prohibition; do not have to means there is no obligation. Should gives advice rather than a strict requirement. May and can can express permission. A modal is followed by the base form without to, except forms such as have to. Avoid turning general language practice into medical advice: these sentences illustrate grammar, not clinical guidance.",
    questions: [
      [
        "Visitors ___ smoke inside this building; it is prohibited.",
        "must not",
        "Must not expresses a prohibition.",
        ["must not", "do not have to", "may", "should to"],
      ],
      [
        "You ___ bring a towel; the centre provides one.",
        "do not have to",
        "The towel is provided, so bringing one is optional, not prohibited.",
        ["must not", "do not have to", "must", "cannot"],
      ],
      [
        "For a gentler tone, choose the best advice: You ___ take regular breaks.",
        "should",
        "Should presents advice rather than a binding requirement.",
        ["should", "must to", "should to", "has"],
      ],
      [
        "Complete with the base form: Patients may ___ in the waiting room. (sit)",
        "sit",
        "May is followed by a base verb without to.",
      ],
      [
        "Staff ___ wear identification badges under the centre’s rules.",
        "have to",
        "A stated institutional rule creates an obligation.",
        ["have to", "may to", "should to", "can to"],
      ],
      [
        "Which sentence correctly asks for permission?",
        "May I open the window?",
        "Modal questions place may before the subject and use the base verb.",
        [
          "May I to open the window?",
          "May I open the window?",
          "Do may I open the window?",
          "May I opened the window?",
        ],
      ],
    ],
  },
  {
    title: "First and second conditionals",
    topic: "Environment",
    cefr: "B1",
    band: 5.5,
    tag: "conditionals-1-2",
    lesson:
      "A first conditional commonly uses if + present simple and will + base verb for a real future possibility: If the council adds bins, recycling will become easier. A second conditional commonly uses if + past simple and would + base verb for an imagined present or future situation. Were is widely used in formal hypothetical clauses: If I were in charge. Do not normally put will in the if clause.",
    questions: [
      [
        "If the weather improves, we ___ plant the trees tomorrow.",
        "will",
        "This is a real future possibility: present simple in the if clause, will in the result.",
      ],
      [
        "If the council ___ more funds, it would restore the wetland.",
        "had",
        "Would in the result indicates a hypothetical second conditional.",
        ["has", "had", "will have", "having"],
      ],
      [
        "Which first conditional is correct?",
        "If people reuse bags, they will produce less waste.",
        "The if clause takes the present simple; the result uses will plus base verb.",
        [
          "If people will reuse bags, they produce less waste.",
          "If people reuse bags, they will produce less waste.",
          "If people reused bags, they will produces less waste.",
          "If people reuse bags, they would produced less waste.",
        ],
      ],
      [
        "If I ___ responsible for the park, I would protect the older trees.",
        "were",
        "Were is the standard formal hypothetical form used with I.",
        undefined,
        ["was"],
      ],
      [
        "If more people cycled, traffic ___ decrease.",
        "would",
        "An imagined change is paired with a hypothetical result.",
      ],
      [
        "Which sentence expresses a hypothetical present situation?",
        "If our roof were larger, we would install more panels.",
        "Were and would frame an imagined current condition.",
        [
          "If our roof were larger, we would install more panels.",
          "If it rains tomorrow, we will stay inside.",
          "When it rained, we stayed inside.",
          "We have installed panels.",
        ],
      ],
    ],
  },
  {
    title: "Passive voice in processes and reports",
    topic: "Science",
    cefr: "B2",
    band: 6.5,
    tag: "passive-voice",
    lesson:
      "A passive clause focuses on an action’s recipient: Samples are stored in sealed containers. Form it with the appropriate tense of be plus a past participle. Mention the agent with by only when useful. A process description often uses the present simple passive; a report of a completed experiment uses the past simple passive. Passive voice is useful, but excessive use can hide responsibility or make writing cumbersome.",
    questions: [
      [
        "In this process, the samples ___ at a constant temperature.",
        "are stored",
        "Samples is plural; a general process takes the present simple passive.",
        ["are stored", "is storing", "store by", "have storing"],
      ],
      [
        "The first measurement ___ yesterday.",
        "was recorded",
        "Yesterday places the event in the past; the measurement receives the action.",
        ["is record", "was recorded", "has recording", "recorded it"],
      ],
      [
        "Complete the passive: The results have been ___ by two independent teams. (check)",
        "checked",
        "Present perfect passive uses have been plus the past participle.",
      ],
      [
        "Which passive sentence preserves the original meaning of “Researchers tested the material”?",
        "The material was tested by researchers.",
        "The material becomes the passive subject and the past simple is preserved.",
        [
          "The material is testing researchers.",
          "The material was tested by researchers.",
          "Researchers were tested by the material.",
          "The material has test researchers.",
        ],
      ],
      [
        "The equipment must ___ before use.",
        "be calibrated",
        "A modal passive uses modal + be + past participle.",
        ["be calibrated", "calibrating", "been calibrate", "to calibrated"],
      ],
      [
        "Complete the agent phrase: The survey was designed ___ a research team.",
        "by",
        "By introduces the person or group responsible for the action.",
      ],
    ],
  },
  {
    title: "Defining and non-defining relative clauses",
    topic: "Community",
    cefr: "B2",
    band: 6.5,
    tag: "relative-clauses",
    lesson:
      "A defining relative clause identifies which person or thing is meant: Residents who use the garden have keys. A non-defining clause adds extra information and is separated by commas: The garden, which opened in May, is popular. Use who for people, which for things and whose for possession. That can occur in many defining clauses, but not in a standard non-defining clause. An object relative pronoun can sometimes be omitted in a defining clause.",
    questions: [
      [
        "The volunteer ___ organised the event lives nearby.",
        "who",
        "Who refers to a person and acts as the subject of organised.",
        ["who", "which", "where", "whose"],
      ],
      [
        "The hall, ___ was renovated last year, is now accessible.",
        "which",
        "A non-defining clause referring to a thing uses which, not that.",
        ["that", "which", "who", "what"],
      ],
      [
        "Complete the possessive relative: We met a resident ___ ideas shaped the project.",
        "whose",
        "Whose links the resident to their ideas.",
      ],
      [
        "Which sentence uses commas for extra information correctly?",
        "Our only library, which opens on Sundays, is near the station.",
        "Our only library is already identified; the opening detail is additional information.",
        [
          "Our only library which, opens on Sundays is near the station.",
          "Our only library, which opens on Sundays, is near the station.",
          "Our only library, that opens on Sundays, is near the station.",
          "Our only library who opens on Sundays is near the station.",
        ],
      ],
      [
        "In “The book that I borrowed is useful”, can “that” be omitted?",
        "Yes",
        "That is the object of borrowed in a defining clause, so omission is possible.",
        ["Yes", "No"],
      ],
      [
        "Complete the place relative: The centre is a place ___ neighbours can meet.",
        "where",
        "Where introduces what happens at a place.",
      ],
    ],
  },
  {
    title: "Contrast and concession",
    topic: "Arts",
    cefr: "B2",
    band: 6.5,
    tag: "contrast-concession",
    lesson:
      "Although and even though introduce clauses. Despite and in spite of introduce noun phrases or -ing forms. However connects contrasting independent ideas and normally needs appropriate sentence punctuation. Whereas contrasts two clauses directly. A concessive phrase acknowledges a counterpoint; it does not automatically refute it. Match the connector to the grammatical structure that follows.",
    questions: [
      [
        "___ the exhibition was small, it attracted many visitors.",
        "Although",
        "A full clause follows, so although is appropriate.",
        ["Despite", "Although", "In spite", "However of"],
      ],
      [
        "___ the high ticket price, the performance sold out.",
        "Despite",
        "The high ticket price is a noun phrase, which can follow despite.",
        ["Although", "Despite", "Even though", "Whereas"],
      ],
      [
        "Complete with although or despite: ___ receiving little publicity, the festival was successful.",
        "Despite",
        "Receiving little publicity is an -ing phrase rather than a finite clause.",
        undefined,
        ["despite"],
      ],
      [
        "Which sentence is punctuated correctly?",
        "The venue is small. However, the acoustics are excellent.",
        "However links independent ideas here; a full stop and comma mark the relationship clearly.",
        [
          "The venue is small however the acoustics are excellent.",
          "The venue is small. However, the acoustics are excellent.",
          "However the venue is small, but acoustics.",
          "The venue is small, despite the acoustics are excellent.",
        ],
      ],
      [
        "Some visitors prefer paintings, ___ others enjoy sculpture.",
        "whereas",
        "Whereas directly contrasts two clauses.",
        ["whereas", "despite", "in spite of", "because of"],
      ],
      [
        "Complete the fixed phrase: in spite ___ the limited budget",
        "of",
        "The preposition phrase is in spite of.",
      ],
    ],
  },
  {
    title: "Academic noun phrases and agreement",
    topic: "Finance",
    cefr: "B2",
    band: 6.5,
    tag: "noun-phrases-agreement",
    lesson:
      "In a long noun phrase, the head noun controls agreement: The cost of several services has increased. Modifiers specify meaning without changing the head noun’s number. A number of commonly takes a plural verb, while the number of takes a singular verb. Use fewer with plural countable nouns and less with uncountable quantities. Nominalisation can make writing concise, but do not obscure who acts.",
    questions: [
      [
        "The cost of several household services ___ risen.",
        "has",
        "The head noun cost is singular; services is inside a modifying phrase.",
        ["has", "have", "are", "were"],
      ],
      [
        "A number of customers ___ requested a refund.",
        "have",
        "A number of means several and conventionally takes a plural verb.",
        ["has", "have", "is", "was"],
      ],
      [
        "The number of complaints ___ decreased.",
        "has",
        "The head noun number refers to one total and takes a singular verb.",
      ],
      [
        "The revised plan requires ___ administrative work.",
        "less",
        "Work is uncountable in this sense, so less is used.",
        ["fewer", "less", "many", "a few"],
      ],
      [
        "The revised plan involves ___ separate payments.",
        "fewer",
        "Payments is plural and countable, so fewer is appropriate.",
      ],
      [
        "Which noun phrase is clearest?",
        "a substantial increase in housing costs",
        "Increase is the head noun; substantial and in housing costs specify its scale and subject.",
        [
          "a housing substantially cost increased",
          "a substantial increase in housing costs",
          "a substantially increases housing cost",
          "a housing costs of increasing substantial",
        ],
      ],
    ],
  },
  {
    title: "Inversion for emphasis",
    topic: "Work",
    cefr: "C1",
    band: 7.5,
    tag: "inversion",
    lesson:
      "A fronted negative or restrictive adverbial may trigger inversion of subject and auxiliary: Rarely do teams finish ahead of schedule. Never had I seen such careful planning. Not until the review did we understand the problem. Only when introduces a normal subordinate clause, followed by inversion in the main clause. Use this structure selectively; frequent dramatic inversion can sound unnatural in an essay.",
    questions: [
      [
        "Rarely ___ employees receive such detailed feedback.",
        "do",
        "Fronted rarely triggers do-support before the plural subject.",
      ],
      [
        "Not until the final review ___ the team identify the error.",
        "did",
        "The restrictive fronted phrase triggers past-tense do-support in the main clause.",
      ],
      [
        "Which sentence uses inversion correctly?",
        "Only after the meeting did we change the plan.",
        "The main clause uses auxiliary did before the subject we.",
        [
          "Only after the meeting we did change the plan.",
          "Only after the meeting did we change the plan.",
          "Only after did the meeting we changed the plan.",
          "Only after the meeting did we changed the plan.",
        ],
      ],
      [
        "Never ___ I seen such a well-organised workshop before that day.",
        "had",
        "Past perfect inversion uses had before the subject.",
      ],
      [
        "Only when the data arrived ___ we able to make a decision.",
        "were",
        "The subordinate when-clause stays normal; were precedes we in the main clause.",
      ],
      [
        "Which sentence keeps the subordinate clause in normal order?",
        "Only when the manager explained the change did staff understand it.",
        "Inversion belongs in the main clause, not inside when the manager explained.",
        [
          "Only when did the manager explain the change staff understood it.",
          "Only when the manager explained the change did staff understand it.",
          "Only when the manager explained did staff understood it.",
          "Only when explained the manager did staff understand.",
        ],
      ],
    ],
  },
  {
    title: "Hedging and cautious claims",
    topic: "Science",
    cefr: "C1",
    band: 7.5,
    tag: "hedging",
    lesson:
      "Academic claims should match the evidence. May, might, appears to and suggests can signal uncertainty. Some, many and in this sample limit the scope of a claim. Association does not by itself establish causation. Avoid both unsupported certainty and excessive hedging that leaves no clear position. A cautious claim is still informative when it names the finding and its limits.",
    questions: [
      [
        "Which wording best matches a small observational study?",
        "The results suggest an association in this sample.",
        "It states the finding while limiting certainty and scope; an observational association alone does not prove causation.",
        [
          "The results prove the treatment always works.",
          "The results suggest an association in this sample.",
          "The results settle the question for everyone.",
          "The results guarantee the same outcome.",
        ],
      ],
      [
        "Complete the cautious verb phrase: The intervention appears ___ reduce waiting times.",
        "to",
        "Appears to plus a base verb is a grammatical hedging expression.",
      ],
      [
        "Which claim is appropriately limited?",
        "Some participants reported greater confidence.",
        "Some limits the scope to the people who reported the outcome.",
        [
          "All people became confident forever.",
          "Some participants reported greater confidence.",
          "Nobody could be uncertain again.",
          "Confidence was universally solved.",
        ],
      ],
      [
        "The finding ___ reflect differences in the groups rather than the intervention.",
        "may",
        "May marks a plausible alternative explanation rather than established fact.",
        ["may", "must to", "is definitely", "proves"],
      ],
      [
        "Complete the fixed cautious phrase: on the basis ___ the available evidence",
        "of",
        "On the basis of is the conventional preposition phrase.",
      ],
      [
        "Which statement avoids confusing correlation with causation?",
        "The variables changed together, but other explanations remain possible.",
        "It identifies association and acknowledges that a causal explanation is not established.",
        [
          "One variable changed, proving it caused the other.",
          "The variables changed together, but other explanations remain possible.",
          "A correlation guarantees a mechanism.",
          "A shared trend eliminates all alternative causes.",
        ],
      ],
    ],
  },
  {
    title: "Mixed and third conditionals",
    topic: "Education",
    cefr: "C1",
    band: 7.5,
    tag: "mixed-conditionals",
    lesson:
      "A third conditional imagines a different past: If I had prepared earlier, I would have felt calmer. A mixed conditional can connect a past condition with a present result: If I had taken that course, I would understand the method now. Another mixed pattern links a present characteristic to a past result. Make the time references clear; do not mechanically copy one formula for every meaning.",
    questions: [
      [
        "If I had checked the instructions, I ___ the deadline.",
        "would not have missed",
        "Both the unreal condition and the result refer to a completed past situation.",
        [
          "would not have missed",
          "will not miss",
          "would not missing",
          "did not have miss",
        ],
      ],
      [
        "If she had learned the software last year, she ___ it confidently now.",
        "would use",
        "A past unreal condition is linked to a present hypothetical result.",
        ["would use", "will used", "would have using", "uses yesterday"],
      ],
      [
        "Complete: If we ___ known about the workshop, we would have attended.",
        "had",
        "Third conditional if-clauses use the past perfect.",
      ],
      [
        "Which sentence links a past choice to a present result?",
        "If I had accepted the scholarship, I would be abroad now.",
        "Had accepted is past unreal; would be now is the present result.",
        [
          "If I had accepted the scholarship, I would be abroad now.",
          "If I accept it, I will leave tomorrow.",
          "If I accepted it yesterday, I leave last week.",
          "If I will accept it, I had left.",
        ],
      ],
      [
        "If he were more organised, he ___ his notes yesterday.",
        "would not have lost",
        "A present characteristic is imagined differently, with a hypothetical past consequence.",
        [
          "would not have lost",
          "will not lose",
          "would not lost",
          "has not losing",
        ],
      ],
      [
        "Complete: We would have finished earlier if the room had ___ available. (be)",
        "been",
        "The past perfect of be is had been.",
      ],
    ],
  },
  {
    title: "Participle clauses and clear reference",
    topic: "Transport",
    cefr: "C1",
    band: 7.5,
    tag: "participle-clauses",
    lesson:
      "A participle clause can combine related information when its implied subject is the same as the main clause subject: Having checked the timetable, we left for the station. A past participle can express a passive meaning: Built in 1920, the bridge needs repairs. Avoid dangling modifiers such as Walking to the station, the rain began: the rain is not walking. Use a full clause when the subject relationship would be unclear.",
    questions: [
      [
        "___ the timetable, we chose an earlier train.",
        "Having checked",
        "The passengers checked before choosing; a perfect participle marks the earlier action.",
        ["Having checked", "Having checking", "Have checked", "Being check"],
      ],
      [
        "___ in 1920, the bridge now requires extensive repairs.",
        "Built",
        "The bridge received the building action, so a past participle gives the passive meaning.",
        ["Building", "Built", "Having building", "Builds"],
      ],
      [
        "Which sentence avoids a dangling modifier?",
        "Walking to the station, we noticed the rain.",
        "We is the implied subject of walking and the subject of noticed.",
        [
          "Walking to the station, the rain began.",
          "Walking to the station, we noticed the rain.",
          "Having walked, the platform was crowded.",
          "Waiting for the bus, the timetable fell.",
        ],
      ],
      [
        "Complete: ___ delayed by traffic, the driver apologised on arrival. (be)",
        "Being",
        "Being delayed gives a passive reason with the driver as the shared subject.",
        undefined,
        ["being"],
      ],
      [
        "Which revision makes the subject relationship clear?",
        "As we approached the station, the announcement began.",
        "The full clause explicitly identifies who approached, avoiding the suggestion that the announcement did so.",
        [
          "Approaching the station, the announcement began.",
          "As we approached the station, the announcement began.",
          "Having approaching the station, the announcement began.",
          "Approached the station, the announcement began.",
        ],
      ],
      [
        "Complete the perfect participle: Having ___ the route, the planner compared costs. (review)",
        "reviewed",
        "Having plus the past participle marks a completed earlier action.",
      ],
    ],
  },
];

export const grammarLessons: StoredContent[] = grammarPacks.map(
  (pack, index) => {
    const id = `grammar-${index + 1}`;
    const questions: StoredQuestion[] = pack.questions.map(
      (
        [prompt, answer, explanation, options, acceptedAnswers],
        questionIndex,
      ) => ({
        id: `${id}-q${questionIndex + 1}`,
        number: questionIndex + 1,
        type: options ? "choice" : "text",
        prompt,
        answer,
        ...(options ? { options } : { wordLimit: 5 }),
        ...(acceptedAnswers ? { acceptedAnswers } : {}),
        explanation,
        evidence: explanation,
        sectionIndex: 0,
        subskill: pack.tag,
      }),
    );
    return {
      ...base(id, "grammar", pack.topic, index),
      title: pack.title,
      description:
        "A concise grammar explanation followed by six contextual checks and answer explanations.",
      cefr: pack.cefr,
      band: pack.band,
      durationMinutes: 15,
      tags: ["grammar", pack.tag, `cefr:${pack.cefr}`, "original-material"],
      questions,
      sections: [
        {
          id: `${id}-section`,
          title: pack.title,
          text: pack.lesson,
          instructions:
            "Read the explanation, then complete the six questions. For text responses, enter only the missing word or phrase. Review each explanation after submitting.",
        },
      ],
    };
  },
);

const writingMockPairs = [
  ["writing-task1-1", "writing-task2-1"],
  ["writing-task1-2", "writing-task2-2"],
  ["writing-task1-4", "writing-task2-4"],
  ["writing-letter-4", "writing-task2-12"],
] as const;
const writingMocks: StoredContent[] = writingMockPairs.map(
  ([task1Id, task2Id], index) => {
    const task1 = writingLessons.find((lesson) => lesson.id === task1Id)!;
    const task2 = writingLessons.find((lesson) => lesson.id === task2Id)!;
    const id = `mock-writing-${index + 1}`;
    return {
      ...base(id, "writing", task1.topic, index + 1),
      title: `${task1.testType === "general" ? "General Training" : "Academic"} Writing — Complete Test ${index + 1}`,
      description:
        "Two writing tasks under a single 60-minute clock. Task 2 carries twice the weight of Task 1 in IELTS-style feedback.",
      testType: task1.testType,
      format: "full-mock",
      durationMinutes: 60,
      tags: [
        "full-mock",
        "task-1",
        "task-2",
        "source-sections-reused",
        `source:${task1Id}`,
        `source:${task2Id}`,
        "original-material",
      ],
      sections: [...task1.sections, ...task2.sections].map(
        (section, sectionIndex) => ({
          ...section,
          id: `${id}-section${sectionIndex + 1}`,
          instructions:
            section.task === 1
              ? "Write at least 150 words. Allocate about 20 minutes. These are fictional practice data or an original practice situation. Complete Task 2 within the same 60-minute test."
              : "Write at least 250 words. Allocate about 40 minutes. Give reasons and relevant examples. Task 2 carries twice the weight of Task 1.",
        }),
      ),
    };
  },
);

const speakingMocks: StoredContent[] = [0, 6, 14, 20].map(
  (packIndex, index) => {
    const pack = speakingPacks[packIndex];
    const id = `mock-speaking-${index + 1}`;
    return {
      ...base(id, "speaking", pack.topic, index + 1),
      title: `Speaking — Complete Test ${index + 1}`,
      description:
        "A full three-part speaking simulation: familiar questions, a prepared long turn and a discussion of broader ideas.",
      durationMinutes: 12,
      format: "full-mock",
      tags: [
        "full-mock",
        "part-1",
        "part-2",
        "part-3",
        "source-sections-reused",
        `source:speaking-${packIndex + 1}`,
        "original-material",
      ],
      sections: speakingSections(pack, id),
    };
  },
);

export const productiveMocks: StoredContent[] = [
  ...writingMocks,
  ...speakingMocks,
];
