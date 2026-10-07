import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  LoaderCircle,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import type { Exercise, Feedback, Health, Skill, User } from "../shared/types";
import { api, errorMessage } from "./api";
import { FeedbackView } from "./components";
import { WavRecorder } from "./audio";

interface PracticeProps {
  skill: Skill;
  user: User;
  health: Health | null;
  onSubmitted?: () => void;
}

const skillCopy: Record<
  Skill,
  { title: string; subtitle: string; label: string }
> = {
  reading: {
    title: "Đọc hiểu, từng bước tiến bộ.",
    subtitle: "Đọc sâu, tìm đúng thông tin và hiểu vì sao mỗi đáp án đúng.",
    label: "READING PRACTICE",
  },
  listening: {
    title: "Lắng nghe. Nắm bắt. Tự tin.",
    subtitle:
      "Luyện nghe qua bốn phần, ghi lại đáp án và kiểm tra cách hiểu của bạn.",
    label: "LISTENING PRACTICE",
  },
  writing: {
    title: "Biến ý tưởng thành bài viết tốt.",
    subtitle:
      "Luyện viết theo tiêu chí IELTS, nhận góp ý cụ thể cho từng đoạn.",
    label: "WRITING STUDIO",
  },
  speaking: {
    title: "Tìm sự tự tin trong giọng nói.",
    subtitle:
      "Luyện ba phần Speaking và nhận phản hồi từ bài nói của chính bạn.",
    label: "SPEAKING ROOM",
  },
};

function timeText(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

interface SpeakingProgress {
  stage: string;
  transcript?: string;
}

async function speakingFeedback(
  body: FormData,
  onProgress: (progress: SpeakingProgress) => void,
): Promise<Feedback> {
  const response = await fetch("/api/speaking/evaluate", {
    method: "POST",
    credentials: "same-origin",
    headers: { Accept: "text/event-stream" },
    body,
  });
  if (!response.ok) {
    let message = `Chưa phân tích được bài nói (${response.status}). Vui lòng thử lại.`;
    try {
      const data: unknown = await response.json();
      if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
      )
        message = data.error;
    } catch {
      /* Keep the HTTP status when the response is not JSON. */
    }
    throw new Error(message);
  }
  if (!response.headers.get("content-type")?.includes("text/event-stream")) {
    const data = (await response.json()) as { result: Feedback };
    return data.result;
  }
  if (!response.body)
    throw new Error(
      "Trình duyệt không đọc được phản hồi trực tiếp. Hãy thử lại.",
    );
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: Feedback | null = null;
  const handleEvent = (block: string) => {
    const lines = block.split("\n");
    const event = lines
      .find((line) => line.startsWith("event:"))
      ?.slice(6)
      .trim();
    const payload = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!payload) return;
    const data: unknown = JSON.parse(payload);
    if (typeof data !== "object" || data === null) return;
    if (event === "error" && "error" in data && typeof data.error === "string")
      throw new Error(data.error);
    if (
      event === "progress" &&
      "stage" in data &&
      typeof data.stage === "string"
    ) {
      onProgress({
        stage: data.stage,
        ...("transcript" in data && typeof data.transcript === "string"
          ? { transcript: data.transcript }
          : {}),
      });
    }
    if (
      event === "result" &&
      "result" in data &&
      typeof data.result === "object" &&
      data.result !== null
    )
      result = data.result as Feedback;
  };
  try {
    while (true) {
      const chunk = await reader.read();
      buffer = (
        buffer + decoder.decode(chunk.value, { stream: !chunk.done })
      ).replace(/\r\n/g, "\n");
      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        handleEvent(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf("\n\n");
      }
      if (chunk.done) break;
    }
    if (buffer.trim()) handleEvent(buffer);
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  if (!result)
    throw new Error(
      "Kết nối kết thúc trước khi nhận được kết quả. Hãy thử gửi lại bài nói.",
    );
  return result;
}

export default function PracticePage({
  skill,
  user,
  health,
  onSubmitted,
}: PracticeProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [task, setTask] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Feedback | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [remaining, setRemaining] = useState(0);
  const [speakingStage, setSpeakingStage] = useState("");
  const [recognizedTranscript, setRecognizedTranscript] = useState("");
  const [reload, setReload] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setExercise(null);
    setResult(null);
    setSpeakingStage("");
    setRecognizedTranscript("");
    api<{ exercise: Exercise }>(
      `/api/exercises/${skill}${skill === "writing" ? `?task=${task}` : ""}`,
      { signal: controller.signal },
    )
      .then((data) => {
        if (currentRequest === requestId.current) setExercise(data.exercise);
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted && currentRequest === requestId.current)
          setError(errorMessage(failure));
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
    return () => controller.abort();
  }, [skill, task, reload, user.id]);

  useEffect(() => {
    setAnswers({});
    setResult(null);
    setRemaining((exercise?.durationMinutes ?? 0) * 60);
  }, [exercise?.id]);

  useEffect(() => {
    if (!exercise || result || loading) return;
    const timer = window.setInterval(
      () => setRemaining((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [exercise?.id, result, loading]);

  useEffect(() => {
    if (result)
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  async function generateExercise() {
    const currentRequest = ++requestId.current;
    setGenerating(true);
    setError("");
    try {
      const data = await api<{ exercise: Exercise }>(
        "/api/exercises/generate",
        {
          method: "POST",
          body: JSON.stringify({
            skill,
            band: Math.min(7, Math.max(3, user.currentBand ?? user.targetBand)),
            ...(skill === "writing" ? { task } : {}),
          }),
        },
      );
      if (currentRequest === requestId.current) setExercise(data.exercise);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(errorMessage(failure));
    } finally {
      setGenerating(false);
    }
  }

  async function submit(path: string, body: string | FormData) {
    const currentRequest = requestId.current;
    setSubmitting(true);
    setError("");
    setSpeakingStage("");
    setRecognizedTranscript("");
    try {
      const feedback =
        path === "/api/speaking/evaluate" && body instanceof FormData
          ? await speakingFeedback(body, (progress) => {
              if (currentRequest !== requestId.current) return;
              setSpeakingStage(progress.stage);
              if (progress.transcript !== undefined)
                setRecognizedTranscript(progress.transcript);
            })
          : (await api<{ result: Feedback }>(path, { method: "POST", body }))
              .result;
      if (currentRequest === requestId.current) {
        setResult(feedback);
        onSubmitted?.();
      }
    } catch (failure) {
      if (currentRequest === requestId.current) setError(errorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  }

  const answered = Object.values(answers).filter((value) =>
    value.trim(),
  ).length;
  const copy = skillCopy[skill];
  return (
    <div className="practice-page stack">
      <header className="page-heading">
        <div>
          <p className="eyebrow">{copy.label}</p>
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-description">{copy.subtitle}</p>
        </div>
        <span className="badge">
          Mục tiêu band {user.targetBand.toFixed(1)}
        </span>
      </header>
      {skill === "writing" && (
        <div className="tabs" aria-label="Chọn dạng bài viết">
          <button
            type="button"
            className={task === 1 ? "active" : ""}
            aria-pressed={task === 1}
            onClick={() => setTask(1)}
            disabled={submitting || generating}
          >
            Task 1 · Biểu đồ
          </button>
          <button
            type="button"
            className={task === 2 ? "active" : ""}
            aria-pressed={task === 2}
            onClick={() => setTask(2)}
            disabled={submitting || generating}
          >
            Task 2 · Bài luận
          </button>
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
          {!exercise && (
            <button
              className="button small secondary"
              type="button"
              onClick={() => setReload((value) => value + 1)}
            >
              Thử lại
            </button>
          )}
        </div>
      )}
      {loading && (
        <div className="card empty-state" role="status">
          <LoaderCircle className="spinner" size={28} />
          <p>Đang chuẩn bị bài luyện của bạn…</p>
        </div>
      )}
      {!loading && exercise && (
        <>
          <div className="card practice-toolbar">
            <div>
              <span className="badge">
                {exercise.cefr} · Band {exercise.band.toFixed(1)}
              </span>
              <span className="badge">
                {exercise.source === "ai" ? "Đề tạo bởi AI" : "Đề mẫu"}
              </span>
            </div>
            <div className="practice-actions">
              <span
                className={`practice-timer${remaining === 0 ? " elapsed" : ""}`}
                title="Thời gian tham khảo"
              >
                <Clock3 size={17} />
                {remaining > 0 ? timeText(remaining) : "Hết giờ tham khảo"}
              </span>
              <button
                className="button secondary small"
                type="button"
                onClick={generateExercise}
                disabled={generating || submitting}
              >
                {generating ? (
                  <LoaderCircle size={16} className="spinner" />
                ) : (
                  <Sparkles size={16} />
                )}
                {generating ? "Đang tạo đề…" : "Tạo đề cá nhân hóa"}
              </button>
            </div>
          </div>
          {exercise.source === "sample" && (
            <p className="muted practice-mode-note">
              Đề mẫu giúp bạn luyện ngay. Tạo đề cá nhân hóa cần dịch vụ AI được
              cấu hình.
            </p>
          )}
          {(skill === "reading" || skill === "listening") && (
            <div className="split-grid practice-columns">
              <article className="card practice-passage">
                <div className="section-heading">
                  <h2>{exercise.title}</h2>
                  {skill === "reading" ? (
                    <FileText size={21} />
                  ) : (
                    <Headphones size={21} />
                  )}
                </div>
                <p className="muted">{exercise.description}</p>
                {skill === "listening" ? (
                  <ListeningPlayer exercise={exercise} health={health} />
                ) : (
                  <Passage exercise={exercise} />
                )}
              </article>
              <form
                className="card question-panel"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit(
                    "/api/practice/submit",
                    JSON.stringify({ exerciseId: exercise.id, answers }),
                  );
                }}
              >
                <div className="section-heading">
                  <h2>Câu hỏi</h2>
                  <span className="badge">
                    {answered}/{exercise.questions.length} đã trả lời
                  </span>
                </div>
                <p className="muted">
                  Chọn đáp án hoặc nhập câu trả lời bằng tiếng Anh.
                </p>
                <div className="question-list">
                  {exercise.questions.map((question, index) => (
                    <fieldset
                      key={question.id}
                      className="practice-question"
                      disabled={submitting || Boolean(result)}
                    >
                      <legend>
                        <span className="question-number">{index + 1}</span>
                        {question.text}
                      </legend>
                      {question.type === "choice" && question.options ? (
                        question.options.map((option, optionIndex) => (
                          <label
                            className={`answer-option${answers[question.id] === option ? " selected" : ""}`}
                            key={option}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() =>
                                setAnswers((values) => ({
                                  ...values,
                                  [question.id]: option,
                                }))
                              }
                            />
                            <span className="option-letter">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span>{option}</span>
                          </label>
                        ))
                      ) : (
                        <label className="field">
                          <span className="sr-only">
                            Câu trả lời cho câu {index + 1}
                          </span>
                          <input
                            value={answers[question.id] ?? ""}
                            onChange={(event) =>
                              setAnswers((values) => ({
                                ...values,
                                [question.id]: event.target.value,
                              }))
                            }
                            placeholder="Nhập câu trả lời…"
                            autoComplete="off"
                          />
                        </label>
                      )}
                    </fieldset>
                  ))}
                </div>
                {!exercise.questions.length && (
                  <p className="notice">
                    Đề này chưa có câu hỏi. Hãy tạo một đề mới.
                  </p>
                )}
                <button
                  className="button practice-submit"
                  type="submit"
                  disabled={
                    !exercise.questions.length ||
                    answered !== exercise.questions.length ||
                    submitting ||
                    Boolean(result)
                  }
                >
                  {submitting ? (
                    <LoaderCircle size={17} className="spinner" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                  {submitting
                    ? "Đang chấm bài…"
                    : result
                      ? "Đã nộp bài"
                      : "Nộp bài & xem kết quả"}
                  <ArrowRight size={16} />
                </button>
                {answered < exercise.questions.length && !result && (
                  <p className="muted">
                    Trả lời đủ {exercise.questions.length} câu để xem kết quả và
                    giải thích.
                  </p>
                )}
              </form>
            </div>
          )}
          {skill === "writing" && (
            <WritingEditor
              key={`${user.id}-${exercise.id}`}
              exercise={exercise}
              user={user}
              busy={submitting}
              completed={Boolean(result)}
              onSubmit={(essay) =>
                submit(
                  "/api/writing/evaluate",
                  JSON.stringify({ exerciseId: exercise.id, essay }),
                )
              }
            />
          )}
          {skill === "speaking" && (
            <SpeakingEditor
              key={`${user.id}-${exercise.id}`}
              exercise={exercise}
              busy={submitting}
              completed={Boolean(result)}
              stage={speakingStage}
              recognizedTranscript={recognizedTranscript}
              onSubmit={(body) => submit("/api/speaking/evaluate", body)}
            />
          )}
          {result && (
            <div ref={resultRef} tabIndex={-1} className="practice-feedback">
              <FeedbackView feedback={result} />
              <button
                type="button"
                className="button secondary"
                disabled={submitting || generating}
                onClick={() => setReload((value) => value + 1)}
              >
                <RefreshCw size={17} />
                Bắt đầu lượt luyện mới
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Passage({ exercise }: { exercise: Exercise }) {
  return (
    <div className="passage-text">
      {exercise.content &&
        exercise.content
          .split(/\n\s*\n/)
          .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      {exercise.sections.map((section, index) => (
        <section key={`${section.title}-${index}`}>
          <h3>{section.title}</h3>
          <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>
        </section>
      ))}
    </div>
  );
}

function ListeningPlayer({
  exercise,
  health,
}: {
  exercise: Exercise;
  health: Health | null;
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(false);
  const [transcript, setTranscript] = useState(false);
  const [selected, setSelected] = useState(0);
  const audioRequest = useRef<AbortController | null>(null);
  const hasVoice = typeof window !== "undefined" && "speechSynthesis" in window;
  useEffect(() => {
    setAudioUrl("");
    setError("");
    setTranscript(false);
    setPlaying(false);
    setSelected(0);
    setBusy(false);
    return () => {
      audioRequest.current?.abort();
      if (hasVoice) window.speechSynthesis.cancel();
    };
  }, [exercise.id, hasVoice]);
  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    [audioUrl],
  );

  async function prepareAudio() {
    setBusy(true);
    setError("");
    const controller = new AbortController();
    audioRequest.current = controller;
    try {
      const response = await fetch("/api/listening/audio", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data: unknown = await response.json();
        throw new Error(
          typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
            ? data.error
            : "Chưa tạo được audio. Bạn có thể dùng giọng đọc của trình duyệt.",
        );
      }
      setAudioUrl(URL.createObjectURL(await response.blob()));
    } catch (failure) {
      if (!controller.signal.aborted) setError(errorMessage(failure));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function playBrowserAudio() {
    if (!hasVoice) {
      setError(
        "Trình duyệt chưa hỗ trợ giọng đọc. Hãy thử Chrome hoặc cấu hình ElevenLabs để nghe audio.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const section = exercise.sections[selected];
    const utterance = new SpeechSynthesisUtterance(
      section ? section.content : exercise.content,
    );
    utterance.lang = "en-GB";
    utterance.rate = 0.88;
    const englishVoice =
      window.speechSynthesis
        .getVoices()
        .find((voice) => voice.lang === "en-GB") ??
      window.speechSynthesis
        .getVoices()
        .find((voice) => voice.lang.startsWith("en"));
    if (englishVoice) utterance.voice = englishVoice;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => {
      setPlaying(false);
      setError(
        "Không phát được giọng đọc trình duyệt. Thử lại hoặc dùng audio ElevenLabs.",
      );
    };
    setPlaying(true);
    setError("");
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="listening-player stack">
      <div className="audio-panel">
        <div className="audio-illustration" aria-hidden="true">
          <Headphones size={34} />
          <div className="audio-wave">
            {Array.from({ length: 24 }, (_, index) => (
              <i
                key={index}
                style={{ height: `${12 + ((index * 13 + 11) % 38)}px` }}
              />
            ))}
          </div>
        </div>
        <p>
          <strong>
            {exercise.sections.length || 1} phần nghe ·{" "}
            {exercise.durationMinutes} phút
          </strong>
        </p>
        {health?.services.elevenlabs && !audioUrl && (
          <button
            type="button"
            className="button"
            onClick={() => void prepareAudio()}
            disabled={busy}
          >
            {busy ? (
              <LoaderCircle size={17} className="spinner" />
            ) : (
              <Volume2 size={17} />
            )}
            {busy ? "Đang tạo audio…" : "Tạo audio ElevenLabs"}
          </button>
        )}
        {audioUrl && (
          <audio
            controls
            src={audioUrl}
            preload="metadata"
            aria-label="Audio của bài luyện Listening"
          />
        )}
        {!audioUrl && (
          <>
            <p className="muted">
              Giọng đọc trình duyệt là phương án luyện mẫu; chất lượng và giọng
              có thể khác với đề thi thực tế.
            </p>
            {exercise.sections.length > 0 && (
              <label className="field">
                <span>Chọn phần nghe</span>
                <select
                  value={selected}
                  onChange={(event) => {
                    if (hasVoice) window.speechSynthesis.cancel();
                    setPlaying(false);
                    setSelected(Number(event.target.value));
                  }}
                >
                  {exercise.sections.map((section, index) => (
                    <option key={index} value={index}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              className="button secondary"
              onClick={
                playing
                  ? () => {
                      window.speechSynthesis.cancel();
                      setPlaying(false);
                    }
                  : playBrowserAudio
              }
              disabled={busy}
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
              {playing ? "Dừng giọng đọc" : "Nghe giọng đọc trình duyệt"}
            </button>
          </>
        )}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="section-overview">
        {exercise.sections.map((section, index) => (
          <div key={index}>
            <span className="section-dot">{index + 1}</span>
            <div>
              <strong>{section.title}</strong>
              {section.speaker && <p className="muted">{section.speaker}</p>}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="button ghost small"
        aria-expanded={transcript}
        aria-controls="listening-transcript"
        onClick={() => setTranscript((value) => !value)}
      >
        <FileText size={16} />
        {transcript ? "Ẩn bản chép lời" : "Hiện bản chép lời để ôn tập"}
      </button>
      {transcript && (
        <div id="listening-transcript" className="transcript-panel">
          <p className="notice">
            Hãy nghe và làm bài trước khi xem bản chép lời.
          </p>
          <Passage exercise={exercise} />
        </div>
      )}
    </div>
  );
}

function WritingEditor({
  exercise,
  user,
  busy,
  completed,
  onSubmit,
}: {
  exercise: Exercise;
  user: User;
  busy: boolean;
  completed: boolean;
  onSubmit: (essay: string) => Promise<void>;
}) {
  const draftKey = `ielts-writing:${user.id}:${exercise.id}`;
  const [essay, setEssay] = useState(() => {
    try {
      return localStorage.getItem(draftKey) ?? "";
    } catch {
      return "";
    }
  });
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const words = essay.trim().match(/\S+/g)?.length ?? 0;
  const minimum = exercise.task === 2 ? 250 : 150;
  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey, essay);
        setSaved(true);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [essay, draftKey]);
  return (
    <div className="split-grid practice-columns writing-columns">
      <article className="card writing-prompt">
        <div className="section-heading">
          <h2>{exercise.title}</h2>
          <FileText size={21} />
        </div>
        <p className="muted">{exercise.description}</p>
        <Passage exercise={exercise} />
        {exercise.chart && exercise.chart.length > 0 && (
          <WritingChart chart={exercise.chart} />
        )}
        <div className="writing-tips">
          <p className="eyebrow">TRƯỚC KHI BẠN VIẾT</p>
          <ul>
            {exercise.task === 2 ? (
              <>
                <li>Xác định lập trường và lập dàn ý rõ ràng.</li>
                <li>Mỗi đoạn thân bài phát triển một ý với ví dụ.</li>
                <li>Kiểm tra liên kết, từ vựng và ngữ pháp.</li>
              </>
            ) : (
              <>
                <li>Nêu đặc điểm tổng quan nổi bật của biểu đồ.</li>
                <li>So sánh các số liệu và xu hướng chính.</li>
                <li>Tránh bổ sung thông tin không có trong đề.</li>
              </>
            )}
          </ul>
          <span className="badge">
            Tối thiểu {minimum} từ · {exercise.durationMinutes} phút
          </span>
        </div>
      </article>
      <form
        className="card writing-editor"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(essay);
        }}
      >
        <div className="section-heading">
          <h2>Bài viết của bạn</h2>
          <span className="muted draft-status" role="status">
            {storageError
              ? "Chưa lưu được bản nháp"
              : saved
                ? "Đã lưu trên thiết bị"
                : "Đang lưu…"}
          </span>
        </div>
        <label className="field">
          <span className="sr-only">Bài viết bằng tiếng Anh</span>
          <textarea
            className="essay-input"
            placeholder="Start writing your response here…"
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            disabled={busy || completed}
            spellCheck
            lang="en"
            rows={18}
          />
        </label>
        <div className="word-count">
          <span className={words >= minimum ? "word-count-good" : ""}>
            <strong>{words}</strong> / {minimum} từ
          </span>
          <span className="muted">Task {exercise.task ?? 1}</span>
        </div>
        {words > 0 && words < minimum && (
          <p className="muted">
            Bạn còn thiếu {minimum - words} từ so với yêu cầu IELTS. Vẫn có thể
            gửi để nhận góp ý.
          </p>
        )}
        {storageError && (
          <p className="notice">
            Trình duyệt không cho phép lưu bản nháp. Sao chép bài viết trước khi
            rời trang.
          </p>
        )}
        <button
          type="submit"
          className="button practice-submit"
          disabled={!essay.trim() || busy || completed}
        >
          {busy ? (
            <LoaderCircle size={17} className="spinner" />
          ) : (
            <Sparkles size={17} />
          )}
          {busy
            ? "Đang phân tích bài viết…"
            : completed
              ? "Đã nhận phản hồi"
              : "Nhận phản hồi bài viết"}
          <ArrowRight size={16} />
        </button>
        <p className="muted">
          Band AI là ước lượng luyện tập. Khi chưa cấu hình AI, hệ thống chỉ đưa
          ra góp ý cơ bản và không gán band.
        </p>
      </form>
    </div>
  );
}

function WritingChart({ chart }: { chart: NonNullable<Exercise["chart"]> }) {
  const maximum = Math.max(1, ...chart.map((entry) => entry.value));
  const height = 290;
  const width = 480;
  const barWidth = Math.min(60, 340 / chart.length);
  const stride = 390 / chart.length;
  return (
    <figure className="writing-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="writing-chart-title writing-chart-desc"
      >
        <title id="writing-chart-title">Số liệu cho Writing Task 1</title>
        <desc id="writing-chart-desc">
          {chart.map((entry) => `${entry.label}: ${entry.value}`).join("; ")}
        </desc>
        {[0, 1, 2, 3, 4].map((tick) => {
          const y = 230 - tick * 48;
          return (
            <g key={tick}>
              <line x1="45" y1={y} x2="460" y2={y} stroke="#e9ecef" />
              <text
                x="35"
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#7a8794"
              >
                {Math.round((maximum * tick) / 4)}
              </text>
            </g>
          );
        })}
        {chart.map((entry, index) => {
          const x = 65 + index * stride;
          const barHeight = (entry.value / maximum) * 192;
          return (
            <g key={`${entry.label}-${index}`}>
              <rect
                x={x}
                y={230 - barHeight}
                width={barWidth}
                height={barHeight}
                rx="5"
                fill={index % 2 ? "#99bbaa" : "#274c3e"}
              />
              <text
                x={x + barWidth / 2}
                y={222 - barHeight}
                textAnchor="middle"
                fontSize="12"
                fill="#274c3e"
              >
                {entry.value}
              </text>
              <text
                x={x + barWidth / 2}
                y="255"
                textAnchor="middle"
                fontSize="11"
                fill="#687782"
              >
                {entry.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="muted">
        Đọc đơn vị và bối cảnh trong đề bài trước khi mô tả số liệu.
      </figcaption>
    </figure>
  );
}

function SpeakingEditor({
  exercise,
  busy,
  completed,
  stage,
  recognizedTranscript,
  onSubmit,
}: {
  exercise: Exercise;
  busy: boolean;
  completed: boolean;
  stage: string;
  recognizedTranscript: string;
  onSubmit: (body: FormData) => Promise<void>;
}) {
  const [part, setPart] = useState(0);
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const recorder = useRef<WavRecorder | null>(null);
  const startTime = useRef(0);
  useEffect(
    () => () => {
      recorder.current?.cancel();
      recorder.current = null;
    },
    [],
  );
  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    [audioUrl],
  );

  const stopRecording = useCallback(() => {
    try {
      const capture = recorder.current?.stop();
      if (capture) {
        setAudio(capture.blob);
        setAudioUrl(URL.createObjectURL(capture.blob));
        setSeconds(Math.round(capture.durationSeconds));
      }
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      recorder.current = null;
      setRecording(false);
    }
  }, []);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= 180) stopRecording();
    }, 250);
    return () => window.clearInterval(timer);
  }, [recording, stopRecording]);

  async function startRecording() {
    setStarting(true);
    setError("");
    const capture = new WavRecorder();
    recorder.current = capture;
    try {
      await capture.start();
      if (recorder.current !== capture) {
        capture.cancel();
        return;
      }
      setAudio(null);
      setAudioUrl("");
      setSeconds(0);
      startTime.current = Date.now();
      setRecording(true);
    } catch (failure) {
      setError(errorMessage(failure));
      recorder.current = null;
    } finally {
      setStarting(false);
    }
  }

  const section = exercise.sections[part];
  const stages: Record<string, string> = {
    transcribing: "Đang chuyển giọng nói thành văn bản…",
    transcript: "Đã nhận bản chép lời. Đang chuẩn bị đánh giá…",
    scoring: "Đang đánh giá nội dung theo tiêu chí IELTS…",
    pronunciation: "Đang phân tích phát âm từ audio…",
  };
  function submitSpeaking() {
    const body = new FormData();
    body.append("exerciseId", exercise.id);
    if (audio) body.append("audio", audio, "speaking-16khz.wav");
    if (transcript.trim()) body.append("transcript", transcript.trim());
    void onSubmit(body);
  }
  return (
    <div className="split-grid practice-columns speaking-columns">
      <article className="card speaking-prompt">
        <div className="section-heading">
          <h2>{exercise.title}</h2>
          <Mic size={21} />
        </div>
        <p className="muted">{exercise.description}</p>
        <div className="tabs speaking-tabs" aria-label="Phần thi Speaking">
          {exercise.sections.map((entry, index) => (
            <button
              type="button"
              key={index}
              className={part === index ? "active" : ""}
              aria-pressed={part === index}
              onClick={() => setPart(index)}
            >
              {entry.title}
            </button>
          ))}
        </div>
        {section ? (
          <div className="speaking-cue">
            <p className="eyebrow">YOUR SPEAKING PROMPT</p>
            <h3>{section.title}</h3>
            <p style={{ whiteSpace: "pre-line" }}>{section.content}</p>
          </div>
        ) : (
          <p style={{ whiteSpace: "pre-line" }}>{exercise.content}</p>
        )}
        <div className="speaking-tips">
          <h3>Một bước nhỏ, mỗi ngày</h3>
          <p className="muted">
            Dành một phút sắp xếp ý tưởng. Nói tự nhiên, mở rộng câu trả lời
            bằng lý do và ví dụ. Bạn có thể ghi một lượt tối đa 3 phút.
          </p>
        </div>
      </article>
      <form
        className="card recording-panel"
        onSubmit={(event) => {
          event.preventDefault();
          submitSpeaking();
        }}
      >
        <div className="section-heading">
          <h2>Bài nói của bạn</h2>
          <span className="badge">WAV · 16 kHz</span>
        </div>
        <div className={`microphone-stage${recording ? " recording" : ""}`}>
          <div className="microphone-circle">
            <Mic size={37} />
          </div>
          <strong className="recording-time">{timeText(seconds)}</strong>
          <p className="muted" role="status">
            {starting
              ? "Đang xin quyền microphone…"
              : recording
                ? "Đang ghi âm · hãy nói bằng tiếng Anh"
                : audio
                  ? "Đã thu âm · nghe lại trước khi gửi"
                  : "Sẵn sàng khi bạn sẵn sàng"}
          </p>
          {recording ? (
            <button type="button" className="button" onClick={stopRecording}>
              <Square size={16} />
              Dừng ghi âm
            </button>
          ) : (
            <button
              type="button"
              className="button"
              onClick={() => void startRecording()}
              disabled={starting || busy || completed}
            >
              {starting ? (
                <LoaderCircle size={17} className="spinner" />
              ) : (
                <Mic size={17} />
              )}
              {audio ? "Ghi âm lại" : "Bắt đầu ghi âm"}
            </button>
          )}
        </div>
        {audioUrl && (
          <>
            <audio
              controls
              src={audioUrl}
              aria-label="Nghe lại bản ghi âm Speaking"
              className="recording-preview"
            />
            <button
              type="button"
              className="text-button"
              disabled={busy || completed}
              onClick={() => {
                setAudio(null);
                setAudioUrl("");
                setSeconds(0);
              }}
            >
              Xóa bản ghi âm để dùng bản chép lời
            </button>
          </>
        )}
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <label className="field transcript-input">
          <span>
            Bản chép lời <span className="muted">(tùy chọn)</span>
          </span>
          <textarea
            rows={5}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            disabled={busy || completed}
            placeholder="Nếu chưa dùng được microphone, nhập câu trả lời bằng tiếng Anh để nhận góp ý về nội dung…"
            lang="en"
          />
        </label>
        <p className="muted">
          Bản chép lời chỉ giúp đánh giá nội dung. Phát âm cần audio và dịch vụ
          Azure; hệ thống không suy ra điểm phát âm từ văn bản.
        </p>
        {busy && (
          <p className="notice" role="status">
            <LoaderCircle size={16} className="spinner" />{" "}
            {stages[stage] ?? "Đang gửi bài nói…"}
          </p>
        )}
        {recognizedTranscript && (
          <div className="transcript-panel">
            <h3>Bản chép lời đã nhận</h3>
            <p style={{ whiteSpace: "pre-line" }}>{recognizedTranscript}</p>
          </div>
        )}
        <button
          type="submit"
          className="button practice-submit"
          disabled={
            (!audio && !transcript.trim()) ||
            recording ||
            starting ||
            busy ||
            completed
          }
        >
          {busy ? (
            <LoaderCircle size={17} className="spinner" />
          ) : (
            <Sparkles size={17} />
          )}
          {busy
            ? "Đang phân tích bài nói…"
            : completed
              ? "Đã nhận phản hồi"
              : "Nhận phản hồi bài nói"}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
