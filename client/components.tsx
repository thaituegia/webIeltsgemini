import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Headphones,
  Mic,
  PenLine,
} from "lucide-react";
import type { Feedback, Skill } from "../shared/types";

export const skillLabels: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};
export const skillDescriptions: Record<Skill, string> = {
  listening: "Lắng nghe, hiểu đúng, vượt qua thông tin gây nhiễu.",
  reading: "Đọc sâu hơn. Tìm ý chính và những chi tiết quan trọng.",
  writing: "Biến ý tưởng thành bài viết có cấu trúc và sức thuyết phục.",
  speaking: "Luyện phản xạ, diễn đạt tự nhiên và tự tin hơn.",
};
export const skillIcons = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
};
export const skills: Skill[] = ["listening", "reading", "writing", "speaking"];

export function Loading({
  text = "Đang chuẩn bị không gian học tập…",
}: {
  text?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="notice error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
    </div>
  );
}

export function FeedbackView({ feedback }: { feedback: Feedback }) {
  return (
    <div className="feedback-view stack">
      <div className="feedback-summary card">
        <div className="feedback-score">
          <span className="eyebrow">
            {feedback.score === null
              ? "Phản hồi luyện tập"
              : feedback.skill === "placement"
                ? "Band khởi điểm"
                : "Band tham khảo"}
          </span>
          <strong>
            {feedback.score === null ? (
              <Check size={36} />
            ) : (
              feedback.score.toFixed(1)
            )}
          </strong>
          {feedback.correct !== undefined && (
            <span>
              {feedback.correct}/{feedback.total} câu đúng
            </span>
          )}
        </div>
        <div>
          <span className={`badge ${feedback.source === "ai" ? "green" : ""}`}>
            {feedback.source === "ai" ? "Phản hồi AI" : "Luyện tập mẫu"}
          </span>
          <h2>
            {feedback.score === null
              ? "Một bước tiến trong hành trình của bạn."
              : "Hiểu kết quả. Biết bước tiếp theo."}
          </h2>
          <p>{feedback.summary}</p>
          <p className="small muted">
            Kết quả luyện tập là gợi ý học tập, không thay thế điểm thi IELTS
            chính thức.
          </p>
        </div>
      </div>
      {feedback.criteria.length > 0 && (
        <div className="criteria-grid">
          {feedback.criteria.map((criterion) => (
            <div className="card criterion" key={criterion.name}>
              <div className="section-heading">
                <h3>{criterion.name}</h3>
                <strong>
                  {criterion.band === null ? "—" : criterion.band.toFixed(1)}
                </strong>
              </div>
              <p>{criterion.feedback}</p>
              {criterion.evidence.length > 0 && (
                <details>
                  <summary>Dẫn chứng trong bài</summary>
                  {criterion.evidence.map((evidence, i) => (
                    <blockquote key={i}>{evidence}</blockquote>
                  ))}
                </details>
              )}
            </div>
          ))}
        </div>
      )}
      {feedback.pronunciation && (
        <div className="card">
          <h3>Phân tích phát âm</h3>
          <div className="pronunciation-grid">
            {Object.entries(feedback.pronunciation).map(([key, value]) => (
              <div key={key}>
                <span className="muted">
                  {
                    (
                      {
                        accuracy: "Độ chính xác",
                        fluency: "Độ trôi chảy",
                        completeness: "Độ trọn vẹn",
                        prosody: "Ngữ điệu",
                      } as Record<string, string>
                    )[key]
                  }
                </span>
                <strong>{value === null ? "—" : `${value}%`}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
      {feedback.fillerCount !== undefined && (
        <div className="notice">
          <Mic size={18} />
          <span>
            {feedback.fillerCount} từ chêm được ghi nhận
            {feedback.fillerDensity !== undefined
              ? ` · ${feedback.fillerDensity.toFixed(1)} từ chêm / 100 từ`
              : ""}
            . Luyện dừng ngắn và sắp xếp ý trước khi nói.
          </span>
        </div>
      )}
      {feedback.paragraphs.length > 0 && (
        <div className="card">
          <h3>Nhận xét từng đoạn văn</h3>
          <div className="paragraph-feedback">
            {feedback.paragraphs.map((paragraph, i) => (
              <div key={i}>
                <span className="number-dot">{paragraph.index}</span>
                <p>{paragraph.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {feedback.corrections.length > 0 && (
        <div className="card">
          <h3>Tinh chỉnh cách diễn đạt</h3>
          {feedback.corrections.map((correction, i) => (
            <div className="correction" key={i}>
              <p className="original">{correction.original}</p>
              <ArrowRight size={16} />
              <p className="suggestion">{correction.suggestion}</p>
              <p className="muted small">{correction.explanation}</p>
            </div>
          ))}
        </div>
      )}
      {feedback.answers && (
        <div className="card">
          <h3>Đối chiếu đáp án</h3>
          {feedback.answers.map((answer, i) => (
            <div className="answer-feedback" key={answer.questionId}>
              <span
                className={`number-dot ${answer.correct ? "correct" : "incorrect"}`}
              >
                {i + 1}
              </span>
              <div>
                <p>
                  <strong>
                    {answer.correct ? "Chính xác" : "Cần xem lại"}
                  </strong>{" "}
                  · Bạn trả lời: {answer.userAnswer || "(bỏ trống)"}
                </p>
                <p className="small">
                  Đáp án: <strong>{answer.correctAnswer}</strong>
                </p>
                <p className="muted small">{answer.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {feedback.transcript && (
        <div className="card">
          <h3>Bản ghi lời nói</h3>
          <p className="transcript">{feedback.transcript}</p>
        </div>
      )}
    </div>
  );
}
