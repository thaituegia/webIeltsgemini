export type Skill = "reading" | "listening" | "writing" | "speaking";
export type ContentKind = Skill | "grammar";
export type Cefr = "A2" | "B1" | "B2" | "C1";
export type TestType = "academic" | "general";
export type Mode = "practice" | "exam";
export type QuestionType =
  | "choice"
  | "true-false"
  | "yes-no"
  | "text"
  | "matching";

export interface Profile {
  id: string;
  name: string;
  email: string;
  demo: boolean;
  currentBand: number | null;
  targetBand: number;
  testType: TestType;
  examDate: string | null;
  weeklyMinutes: number;
  dailyMinutes: number;
  cefr: Cefr | null;
  createdAt: string;
  selfAssessment?: Partial<Record<Skill, number | null>>;
}
export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
  wordLimit?: number;
  sectionIndex: number;
  subskill: string;
}
export interface StoredQuestion extends Question {
  answer: string;
  acceptedAnswers?: string[];
  explanation: string;
  evidence: string;
}
export interface DialogueLine {
  speaker: string;
  accent: "british" | "american" | "australian";
  text: string;
}
export interface ContentSection {
  id: string;
  title: string;
  text: string;
  dialogue?: DialogueLine[];
  task?: 1 | 2;
  instructions?: string;
  chart?: { label: string; values: number[] }[];
  chartSeries?: string[];
  chartUnit?: string;
  cuePoints?: string[];
}
export interface ContentItem {
  id: string;
  skill: ContentKind;
  title: string;
  description: string;
  topic: string;
  band: number;
  cefr: Cefr;
  testType: TestType | "both";
  durationMinutes: number;
  format: "lesson" | "full-mock";
  questions: Question[];
  sections: ContentSection[];
  vocabularyIds: string[];
  tags: string[];
  source: "authored" | "ai";
  quality: "authored-unreviewed" | "ai-unreviewed";
  createdAt: string;
}
export interface StoredContent extends Omit<ContentItem, "questions"> {
  questions: StoredQuestion[];
}
export interface VocabularyEntry {
  id: string;
  word: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  ipa: string;
  cefr: Cefr;
  topic: string;
  collocations: string[];
  examples: string[];
  family: string[];
  commonError: string;
  synonyms: string[];
  register: "neutral" | "academic" | "informal";
}
export interface VocabularyCard {
  id: string;
  vocabularyId: string | null;
  word: string;
  meaning: string;
  example: string;
  cefr: Cefr;
  topic: string;
  difficulty: number;
  stability: number;
  retrievability: number;
  dueAt: string;
  reps: number;
  due: boolean;
  savedAt: string;
}
export interface CriterionFeedback {
  name: string;
  band: number | null;
  confidence: number | null;
  feedback: string;
  evidence: string[];
}
export interface Feedback {
  id: string;
  skill: ContentKind | "placement";
  estimatedBand: number | null;
  rawScore: number | null;
  total: number | null;
  summary: string;
  criteria: CriterionFeedback[];
  corrections: { original: string; suggestion: string; explanation: string }[];
  paragraphs: { index: number; feedback: string }[];
  answers: {
    questionId: string;
    response: string;
    answer: string;
    correct: boolean;
    explanation: string;
    evidence: string;
    subskill: string;
  }[];
  wordCount?: number;
  fillerCount?: number;
  fillerDensity?: number;
  transcript?: string;
  pronunciation?: {
    accuracy: number;
    fluency: number;
    completeness: number | null;
    prosody: number | null;
  } | null;
  taskScores?: {
    task: 1 | 2;
    estimatedBand: number | null;
    criteria: CriterionFeedback[];
  }[];
  source: "rule-based" | "ai";
  createdAt: string;
}
export interface Attempt {
  id: string;
  contentId: string;
  title: string;
  skill: ContentKind;
  mode: Mode;
  status: "in-progress" | "submitted";
  startedAt: string;
  deadlineAt: string | null;
  submittedAt: string | null;
  durationSeconds: number;
  responses: Record<string, string>;
  essays: Record<string, string>;
  transcript: string;
  feedback: Feedback | null;
  content: ContentItem;
  audioAvailable: boolean;
}
export interface AttemptSummary {
  id: string;
  contentId: string;
  title: string;
  skill: ContentKind;
  mode: Mode;
  status: "in-progress" | "submitted";
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number;
  estimatedBand: number | null;
  rawScore: number | null;
  total: number | null;
  feedbackSource: "rule-based" | "ai" | null;
}
export interface SkillEstimate {
  skill: Skill;
  estimatedBand: number | null;
  uncertainty: number | null;
  attempts: number;
}
export interface StudyTask {
  id: string;
  day: string;
  title: string;
  kind: ContentKind | "vocabulary" | "placement";
  contentId: string | null;
  minutes: number;
  completed: boolean;
  reason: string;
}
export interface StudyPlan {
  id: string;
  weekStart: string;
  targetBand: number;
  weeklyMinutes: number;
  tasks: StudyTask[];
  explanation: string;
}
export interface Dashboard {
  profile: Profile;
  skills: SkillEstimate[];
  overallBand: number | null;
  completedCount: number;
  weekMinutes: number;
  streakDays: number;
  dueCards: number;
  totalCards: number;
  vocabularyRetention: number | null;
  recentAttempts: AttemptSummary[];
  recommendations: ContentItem[];
  weaknesses: { tag: string; count: number; skill: ContentKind }[];
  trend: { day: string; skill: Skill; estimatedBand: number }[];
  activity: { day: string; minutes: number }[];
  plan: StudyPlan;
}
export interface PlacementItem {
  id: string;
  skill: "reading" | "listening";
  text: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  band: number;
  cefr: Cefr;
  difficulty: number;
  subskill: string;
}
export interface PlacementState {
  id: string;
  mode: "quick" | "deep";
  total: number;
  completed: number;
  theta: number;
  standardError: number;
  estimatedBand: number;
  question: Omit<PlacementItem, "answer" | "explanation" | "difficulty"> | null;
  result: Feedback | null;
}
export interface PlacementSummary {
  id: string;
  mode: "quick" | "deep";
  total: number;
  completed: number;
  estimatedBand: number;
  standardError: number;
  startedAt: string;
  result: Feedback | null;
}
export interface Health {
  status: "ok";
  database: "mongodb";
  demoEnabled: boolean;
  services: { openai: boolean; elevenlabs: boolean; azure: boolean };
  bank: {
    lessons: number;
    mocks: number;
    vocabulary: number;
    placement: number;
  };
}
export interface LibraryResult {
  items: ContentItem[];
  total: number;
  topics: string[];
}
export interface ErrorNotebook {
  items: {
    tag: string;
    skill: ContentKind;
    count: number;
    examples: {
      prompt: string;
      response: string;
      correction: string;
      explanation: string;
      contentId: string;
    }[];
  }[];
}
