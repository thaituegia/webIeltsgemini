export type Skill = "listening" | "reading" | "writing" | "speaking";
export type Cefr = "A2" | "B1" | "B2" | "C1";
export interface User {
  id: string;
  name: string;
  email: string;
  currentBand: number | null;
  targetBand: number;
  cefr: Cefr | null;
  createdAt: string;
}
export interface Question {
  id: string;
  text: string;
  type: "choice" | "text";
  options?: string[];
}
export interface ExerciseSection {
  title: string;
  content: string;
  speaker?: string;
}
export interface VocabularyWord {
  front: string;
  back: string;
  example: string;
  cefr: Cefr;
}
export interface Exercise {
  id: string;
  skill: Skill;
  title: string;
  description: string;
  band: number;
  cefr: Cefr;
  durationMinutes: number;
  content: string;
  sections: ExerciseSection[];
  questions: Question[];
  vocabulary: VocabularyWord[];
  task?: 1 | 2;
  chart?: { label: string; value: number }[];
  source: "sample" | "ai";
}
export interface Criterion {
  name: string;
  band: number | null;
  feedback: string;
  evidence: string[];
}
export interface Feedback {
  id: string;
  skill: Skill | "placement";
  score: number | null;
  maxScore?: number;
  correct?: number;
  total?: number;
  summary: string;
  criteria: Criterion[];
  corrections: { original: string; suggestion: string; explanation: string }[];
  paragraphs: { index: number; feedback: string }[];
  answers?: {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
    explanation: string;
  }[];
  transcript?: string;
  fillerCount?: number;
  fillerDensity?: number;
  wordCount?: number;
  pronunciation?: {
    accuracy: number;
    fluency: number;
    completeness: number | null;
    prosody?: number;
  } | null;
  source: "sample" | "ai";
  createdAt: string;
}
export interface HistoryItem {
  id: string;
  skill: Skill | "placement";
  title: string;
  score: number | null;
  source: "sample" | "ai";
  createdAt: string;
  feedback: Feedback;
}
export interface Dashboard {
  profile: User;
  overallBand: number | null;
  skills: Record<Skill, number | null>;
  history: HistoryItem[];
  activity: { date: string; count: number }[];
  streak: number;
  dueCount: number;
  vocabularyCount: number;
  completedTests: number;
  recommendations: string[];
  mode: "demo" | "live";
}
export interface PlacementQuestion {
  id: string;
  text: string;
  options: string[];
  cefr: Cefr;
}
export interface PlacementState {
  placementId: string;
  answered: number;
  total: number;
  currentBand: number;
  question?: PlacementQuestion;
  completed?: boolean;
  result?: Feedback;
}
export interface VocabCard {
  id: string;
  front: string;
  back: string;
  example: string;
  cefr: Cefr;
  difficulty: number;
  stability: number;
  retrievability: number;
  dueDate: string;
  reps: number;
  due: boolean;
}
export interface Health {
  status: "ok";
  mode: "demo" | "live";
  demoEnabled?: boolean;
  services: {
    openai: boolean;
    elevenlabs: boolean;
    azure: boolean;
    supabase: boolean;
  };
}
