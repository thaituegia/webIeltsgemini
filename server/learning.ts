import { randomUUID } from "node:crypto";
import { createEmptyCard, fsrs, type CardInput } from "ts-fsrs";
import type {
  Dashboard,
  Feedback,
  PlacementState,
  Skill,
  VocabCard,
  VocabularyWord,
} from "../shared/types";
import type {
  LearnerState,
  Session,
  StoredCard,
  StoredExercise,
  StoredPlacement,
} from "./db";
import { ApiError } from "./auth";
import {
  cefrForBand,
  overallBand,
  placementBank,
  publicPlacementQuestion,
  roundBand,
  selectPlacementQuestion,
  type PlacementItem,
} from "./curriculum";

export const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });
function schedulerCard(card: StoredCard): CardInput {
  return JSON.parse(card.scheduler) as CardInput;
}
export function publicCard(card: StoredCard, now = new Date()): VocabCard {
  const stored = schedulerCard(card);
  const retrievability =
    stored.reps === 0 ? 0 : scheduler.get_retrievability(stored, now, false);
  return {
    id: card.id,
    front: card.front,
    back: card.back,
    example: card.example,
    cefr: card.cefr,
    difficulty: stored.difficulty,
    stability: stored.stability,
    retrievability,
    dueDate: new Date(stored.due).toISOString(),
    reps: stored.reps,
    due:
      new Date(stored.due).getTime() <= now.getTime() || retrievability < 0.9,
  };
}
const normalise = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/[.!?]$/, "");
export function addVocabulary(
  state: LearnerState,
  input: VocabularyWord,
): StoredCard {
  const existing = state.cards.find(
    (card) => normalise(card.front) === normalise(input.front),
  );
  if (existing) return existing;
  const card: StoredCard = {
    id: randomUUID(),
    ...input,
    scheduler: JSON.stringify(createEmptyCard()),
    reviews: [],
  };
  state.cards.push(card);
  return card;
}
export function reviewVocabulary(
  state: LearnerState,
  id: string,
  rating: 1 | 2 | 3 | 4,
): VocabCard {
  const card = state.cards.find((item) => item.id === id);
  if (!card) throw new ApiError(404, "Không tìm thấy thẻ từ vựng.");
  const now = new Date();
  const scheduled = scheduler.next(schedulerCard(card), now, rating);
  card.scheduler = JSON.stringify(scheduled.card);
  card.reviews.push({
    reviewedAt: now.toISOString(),
    rating,
    log: JSON.stringify(scheduled.log),
  });
  return publicCard(card, now);
}
export function findExercise(
  state: LearnerState,
  id: string,
  expected?: Skill,
): StoredExercise {
  const exercise = state.exercises.find((item) => item.exercise.id === id);
  if (!exercise || (expected && exercise.exercise.skill !== expected))
    throw new ApiError(404, "Bài tập không tồn tại trong tài khoản của bạn.");
  return exercise;
}
export function ensureUnsubmitted(
  state: LearnerState,
  exerciseId: string,
): void {
  if (state.history.some((item) => item.id === exerciseId))
    throw new ApiError(
      409,
      "Bài tập này đã được nộp. Hãy mở bài mới để tiếp tục.",
    );
}
export function recordFeedback(
  state: LearnerState,
  exercise: StoredExercise,
  feedback: Feedback,
): void {
  ensureUnsubmitted(state, exercise.exercise.id);
  state.history.unshift({
    id: exercise.exercise.id,
    skill: exercise.exercise.skill,
    title: exercise.exercise.title,
    score: feedback.score,
    source: feedback.source,
    createdAt: feedback.createdAt,
    feedback,
  });
  const band = skillSummary(state);
  const overall = overallBand(
    Object.values(band).filter((score): score is number => score !== null),
  );
  if (overall !== null) {
    state.profile.currentBand = overall;
    state.profile.cefr = cefrForBand(overall);
  }
}
export function submitPractice(
  state: LearnerState,
  exerciseId: string,
  provided: Record<string, string>,
): Feedback {
  const stored = findExercise(state, exerciseId);
  if (!["reading", "listening"].includes(stored.exercise.skill))
    throw new ApiError(400, "Bài tập này cần sử dụng phần chấm Viết hoặc Nói.");
  ensureUnsubmitted(state, exerciseId);
  if (
    Object.keys(provided).length !== stored.exercise.questions.length ||
    stored.exercise.questions.some((question) => !provided[question.id]?.trim())
  )
    throw new ApiError(400, "Vui lòng trả lời đầy đủ các câu hỏi.");
  if (
    Object.keys(provided).some(
      (id) => !stored.exercise.questions.some((question) => question.id === id),
    )
  )
    throw new ApiError(400, "Câu trả lời chứa mã câu hỏi không hợp lệ.");
  const answers = stored.exercise.questions.map((question) => {
    const key = stored.answers[question.id];
    if (!key) throw new Error("Exercise answer key is incomplete");
    const userAnswer = provided[question.id];
    const correct = key.answer
      .split("|")
      .some((accepted) => normalise(accepted) === normalise(userAnswer));
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer: key.answer.split("|")[0],
      correct,
      explanation: key.explanation,
    };
  });
  const correct = answers.filter((answer) => answer.correct).length;
  const ceiling = Math.min(7, stored.exercise.band + 0.5);
  const indicativeBand = Math.max(
    3,
    Math.min(7, roundBand(3 + (ceiling - 3) * (correct / answers.length))),
  );
  const feedback: Feedback = {
    id: randomUUID(),
    skill: stored.exercise.skill,
    score: indicativeBand,
    correct,
    total: answers.length,
    summary: `Bạn trả lời đúng ${correct}/${answers.length} câu. Band ${indicativeBand.toFixed(1)} là ước lượng heuristic có xét độ khó của bài luyện ngắn, chưa được hiệu chuẩn và không phải điểm IELTS chính thức. Xem giải thích để luyện lại dạng câu còn sai.`,
    criteria: [],
    corrections: [],
    paragraphs: [],
    answers,
    source: stored.exercise.source,
    createdAt: new Date().toISOString(),
  };
  recordFeedback(state, stored, feedback);
  stored.exercise.vocabulary.forEach((vocabulary) =>
    addVocabulary(state, vocabulary),
  );
  return feedback;
}

function skillSummary(state: LearnerState): Dashboard["skills"] {
  const skills: Skill[] = ["listening", "reading", "writing", "speaking"];
  return Object.fromEntries(
    skills.map((skill) => [
      skill,
      state.history.find((item) => item.skill === skill && item.score !== null)
        ?.score ?? null,
    ]),
  ) as Dashboard["skills"];
}
function localDay(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
export function dashboard(state: LearnerState, session: Session): Dashboard {
  const skills = skillSummary(state);
  const scores = Object.values(skills).filter(
    (score): score is number => score !== null,
  );
  const overall = overallBand(scores);
  const activity = new Map<string, number>();
  state.history.forEach((item) => {
    const date = localDay(item.createdAt);
    activity.set(date, (activity.get(date) ?? 0) + 1);
  });
  state.cards.forEach((card) =>
    card.reviews.forEach((review) => {
      const date = localDay(review.reviewedAt);
      activity.set(date, (activity.get(date) ?? 0) + 1);
    }),
  );
  let streak = 0;
  const now = new Date();
  let cursor = now.getTime();
  if (!activity.has(localDay(now.toISOString()))) cursor -= 86400000;
  while (activity.has(localDay(new Date(cursor).toISOString()))) {
    streak += 1;
    cursor -= 86400000;
  }
  const cards = state.cards.map((card) => publicCard(card));
  const dueCount = cards.filter((card) => card.due).length;
  const weakest = Object.entries(skills)
    .filter((entry): entry is [Skill, number] => entry[1] !== null)
    .sort((a, b) => a[1] - b[1])[0];
  const recommendations = [
    ...(state.profile.currentBand === null
      ? ["Hoàn thành 15 câu đánh giá đầu vào để thiết lập lộ trình cá nhân."]
      : [
          `Mục tiêu ${state.profile.targetBand.toFixed(1)}: luyện đều bốn kỹ năng và kiểm tra tiến độ mỗi tuần.`,
        ]),
    ...(dueCount > 0
      ? [`Ôn ${dueCount} từ đến hạn để duy trì khả năng ghi nhớ trên 90%.`]
      : ["Thêm từ mới từ bài Đọc hoặc Nghe vào bộ thẻ FSRS."]),
    ...(weakest
      ? [
          `Ưu tiên ${weakest[0] === "reading" ? "Đọc" : weakest[0] === "listening" ? "Nghe" : weakest[0] === "writing" ? "Viết" : "Nói"} trong buổi luyện tiếp theo.`,
        ]
      : ["Bắt đầu với một bài Đọc hoặc Nghe ngắn ở trình độ phù hợp."]),
  ];
  return {
    profile: state.profile,
    overallBand: overall,
    skills,
    history: state.history.slice(0, 6),
    activity: [...activity]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count })),
    streak,
    dueCount,
    vocabularyCount: cards.length,
    completedTests: state.history.length,
    recommendations,
    mode: session.demo ? "demo" : "live",
  };
}

export function placementState(placement: StoredPlacement): PlacementState {
  const question = placement.questionId
    ? (placement.questionBank ?? placementBank).find(
        (item) => item.id === placement.questionId,
      )
    : undefined;
  return {
    placementId: placement.id,
    answered: placement.answers.length,
    total: 15,
    currentBand: placement.band,
    ...(question ? { question: publicPlacementQuestion(question) } : {}),
    ...(placement.result ? { completed: true, result: placement.result } : {}),
  };
}
export function startPlacement(
  state: LearnerState,
  bank?: PlacementItem[],
): PlacementState {
  const existing = state.placements.find((item) => !item.result);
  if (existing) return placementState(existing);
  const band = state.profile.currentBand ?? 4.5;
  const question = selectPlacementQuestion(band, [], bank);
  const placement: StoredPlacement = {
    id: randomUUID(),
    band,
    questionId: question.id,
    answers: [],
    ...(bank ? { questionBank: bank, source: "ai" } : { source: "sample" }),
  };
  state.placements.push(placement);
  return placementState(placement);
}
export function answerPlacement(
  state: LearnerState,
  input: { placementId: string; questionId: string; answer: string },
): PlacementState {
  const placement = state.placements.find(
    (item) => item.id === input.placementId,
  );
  if (!placement)
    throw new ApiError(
      404,
      "Không tìm thấy bài đánh giá trong tài khoản của bạn.",
    );
  if (placement.result) throw new ApiError(409, "Bài đánh giá đã hoàn thành.");
  if (placement.questionId !== input.questionId)
    throw new ApiError(409, "Câu hỏi này không phải câu đang được đánh giá.");
  const question = (placement.questionBank ?? placementBank).find(
    (item) => item.id === input.questionId,
  );
  if (!question || !question.options.includes(input.answer))
    throw new ApiError(400, "Vui lòng chọn một đáp án hợp lệ.");
  const correct = normalise(question.answer) === normalise(input.answer);
  placement.answers.push({
    questionId: question.id,
    answer: input.answer,
    correct,
    band: question.band,
  });
  placement.band = Math.min(
    7,
    Math.max(3, roundBand(placement.band + (correct ? 0.5 : -0.5))),
  );
  if (placement.answers.length >= 15) {
    const correctCount = placement.answers.filter(
      (answer) => answer.correct,
    ).length;
    const result: Feedback = {
      id: randomUUID(),
      skill: "placement",
      score: placement.band,
      correct: correctCount,
      total: 15,
      summary: `Trình độ khởi điểm ước lượng: ${placement.band.toFixed(1)} (${cefrForBand(placement.band)}). Đây là mô phỏng CAT dựa trên 15 câu từ vựng/ngữ pháp có độ khó thích ứng${placement.source === "ai" ? ", từ ngân hàng câu hỏi do AI biên soạn" : ""}; chưa phải mô hình IRT đã hiệu chuẩn hay bài thi IELTS đầy đủ.`,
      criteria: [],
      corrections: [],
      paragraphs: [],
      source: placement.source ?? "sample",
      createdAt: new Date().toISOString(),
    };
    placement.result = result;
    placement.questionId = null;
    state.profile.currentBand = placement.band;
    state.profile.cefr = cefrForBand(placement.band);
    state.history.unshift({
      id: placement.id,
      skill: "placement",
      title: "Đánh giá đầu vào thích ứng",
      score: placement.band,
      source: result.source,
      createdAt: result.createdAt,
      feedback: result,
    });
  } else
    placement.questionId = selectPlacementQuestion(
      placement.band,
      placement.answers.map((answer) => answer.questionId),
      placement.questionBank,
    ).id;
  return placementState(placement);
}
