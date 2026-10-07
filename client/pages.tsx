import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Flame,
  Flag,
  GraduationCap,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import type {
  Dashboard,
  HistoryItem,
  PlacementState,
  Skill,
  User,
  VocabCard,
} from "../shared/types";
import { api, errorMessage, formatDate } from "./api";
import {
  ErrorNotice,
  FeedbackView,
  Loading,
  skillDescriptions,
  skillIcons,
  skillLabels,
  skills,
} from "./components";
import { useDialog } from "./useDialog";

export function DashboardPage({
  user,
  onUserChange,
}: {
  user: User;
  onUserChange: (user: User) => void;
}) {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [editingTarget, setEditingTarget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chartSkill, setChartSkill] = useState<Skill | "all">("all");
  useDialog(editingTarget, () => setEditingTarget(false));
  const load = async () => {
    setError("");
    try {
      const next = await api<Dashboard>("/api/dashboard");
      setData(next);
      onUserChange(next.profile);
    } catch (err) {
      setError(errorMessage(err));
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const targetSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const result = await api<{ user: User }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ targetBand: Number(form.get("targetBand")) }),
      });
      onUserChange(result.user);
      setData((previous) =>
        previous ? { ...previous, profile: result.user } : previous,
      );
      setEditingTarget(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  if (!data)
    return error ? (
      <div className="card">
        <ErrorNotice message={error} />
        <button className="button secondary" onClick={() => void load()}>
          Thử lại
        </button>
      </div>
    ) : (
      <Loading />
    );
  const firstName = user.name.split(" ").at(-1);
  const band = data.overallBand;
  const latest = data.history.slice(0, 3);
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const activityWeek = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(`${todayKey}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() - (6 - index));
    const date = day.toISOString().slice(0, 10);
    return {
      date,
      count:
        data.activity.find((item) => item.date.slice(0, 10) === date)?.count ??
        0,
    };
  });
  const trend = data.history
    .filter(
      (item) =>
        item.score !== null &&
        item.skill !== "placement" &&
        (chartSkill === "all" || item.skill === chartSkill),
    )
    .slice(0, 12)
    .reverse();
  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            CHÀO {firstName?.toUpperCase()} · SẴN SÀNG TIẾN THÊM MỘT BƯỚC?
          </span>
          <h1 className="page-title">
            Hành trình của bạn<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Mỗi buổi học là một bước gần hơn đến band điểm bạn mong muốn.
          </p>
        </div>
        <Link className="button secondary" to="/practice">
          Bắt đầu luyện tập <ArrowRight size={17} />
        </Link>
      </div>
      {error && <ErrorNotice message={error} />}
      <section className="journey-banner">
        <div className="journey-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> MỘT LỘ TRÌNH DÀNH RIÊNG CHO BẠN
          </span>
          <h2>
            {user.currentBand === null
              ? "Biết mình ở đâu.\nĐể đi xa hơn."
              : "Chậm mà chắc.\nBạn đang đi đúng hướng."}
          </h2>
          <p>
            {user.currentBand === null
              ? "15 câu hỏi thích ứng giúp xác định điểm khởi đầu và gợi ý bài tập vừa sức với bạn."
              : `Mục tiêu ${user.targetBand.toFixed(1)} đang chờ bạn. Duy trì luyện tập đều đặn và tập trung vào kỹ năng cần cải thiện.`}
          </p>
          <Link
            to={user.currentBand === null ? "/placement" : "/practice"}
            className="button light"
          >
            {user.currentBand === null
              ? "Khám phá trình độ của tôi"
              : "Tiếp tục luyện tập"}
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="journey-art" aria-hidden="true">
          <div className="orbit" />
          <div className="orbit inner" />
          <div className="target-sticker">
            <Target size={26} />
            <small>YOUR NEXT CHAPTER</small>
            <strong>{user.targetBand.toFixed(1)}</strong>
            <span>IELTS BAND</span>
          </div>
          <div className="art-star">✳</div>
          <div className="art-label">a little better, every day</div>
          <span className="dotted-path" />
        </div>
      </section>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            Overall Band <BarChart3 size={17} />
          </div>
          <div className="stat-number">
            {band === null ? "—" : band.toFixed(1)}
            <span>/ 9.0</span>
          </div>
          <p>
            {band === null
              ? "Cần kết quả đủ 4 kỹ năng"
              : "Từ kết quả luyện tập gần nhất"}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Band mục tiêu <Target size={17} />
          </div>
          <div className="stat-number">
            {user.targetBand.toFixed(1)}
            <button
              className="text-button"
              onClick={() => setEditingTarget(true)}
            >
              Điều chỉnh
            </button>
          </div>
          <p>
            {user.currentBand === null
              ? "Bắt đầu bằng kiểm tra đầu vào"
              : `Khởi điểm ${user.currentBand.toFixed(1)} · ${user.cefr}`}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Chuỗi ngày học <Flame size={17} />
          </div>
          <div className="stat-number">
            {data.streak}
            <span>ngày</span>
          </div>
          <p>
            {data.streak > 0
              ? "Giữ nhịp học tập của bạn nhé"
              : "Hôm nay là một ngày tốt để bắt đầu"}
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-label">
            Bài đã hoàn thành <Check size={17} />
          </div>
          <div className="stat-number">
            {data.completedTests}
            <span>bài</span>
          </div>
          <p>Từng kết quả đều được lưu lại</p>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-primary stack">
          <section className="card skill-overview">
            <div className="section-heading">
              <div>
                <span className="eyebrow">BỨC TRANH HIỆN TẠI</span>
                <h2>Năng lực 4 kỹ năng</h2>
              </div>
              <Link className="text-link" to="/practice">
                Luyện ngay <ArrowRight size={15} />
              </Link>
            </div>
            <div className="skill-band-grid">
              {skills.map((skill) => {
                const Icon = skillIcons[skill];
                const score = data.skills[skill];
                return (
                  <Link
                    className={`skill-band skill-${skill}`}
                    key={skill}
                    to={`/practice/${skill}`}
                  >
                    <span className="skill-icon">
                      <Icon size={21} />
                    </span>
                    <span>{skillLabels[skill]}</span>
                    <strong>{score === null ? "—" : score.toFixed(1)}</strong>
                    <div className="skill-track">
                      <span
                        style={{
                          width: `${score === null ? 0 : Math.min(score / 9, 1) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {score === null ? "Chưa có kết quả" : "Band tham khảo"}
                      <ArrowRight size={13} />
                    </small>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="card progress-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">THEO DÕI TỪNG BƯỚC TIẾN</span>
                <h2>Nhìn thấy sự tiến bộ</h2>
              </div>
              <label className="visually-hidden" htmlFor="chart-skill">
                Kỹ năng hiển thị
              </label>
              <select
                id="chart-skill"
                className="compact-select"
                value={chartSkill}
                onChange={(event) =>
                  setChartSkill(event.target.value as Skill | "all")
                }
              >
                <option value="all">Tất cả kỹ năng</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skillLabels[skill]}
                  </option>
                ))}
              </select>
            </div>
            {trend.length >= 2 ? (
              <TrendChart history={trend} />
            ) : (
              <div className="chart-empty">
                <div className="chart-grid-decoration" aria-hidden="true" />
                <span className="empty-icon">
                  <TrendingUp size={26} />
                </span>
                <h3>Tiến bộ bắt đầu từ buổi học đầu tiên.</h3>
                <p>
                  Biểu đồ sẽ xuất hiện khi có ít nhất 2 bài luyện tập có điểm.
                </p>
                <Link to="/practice" className="text-link">
                  Luyện một bài hôm nay <ArrowRight size={15} />
                </Link>
              </div>
            )}
            <div className="chart-footnote">
              <span className="status-dot live" /> Dữ liệu từ bài luyện tập đã
              hoàn thành của bạn
            </div>
          </section>
          <section className="card recent-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">DẤU CHÂN HỌC TẬP</span>
                <h2>Hoạt động gần đây</h2>
              </div>
              <Link className="text-link" to="/history">
                Xem tất cả <ArrowRight size={15} />
              </Link>
            </div>
            {latest.length === 0 ? (
              <div className="compact-empty">
                <BookOpen size={23} />
                <p>Bài học đầu tiên của bạn sẽ được ghi lại tại đây.</p>
              </div>
            ) : (
              latest.map((item) => (
                <Link to="/history" className="recent-item" key={item.id}>
                  <span className={`skill-icon skill-${item.skill}`}>
                    {item.skill === "placement" ? (
                      <Flag size={19} />
                    ) : (
                      (() => {
                        const Icon = skillIcons[item.skill];
                        return <Icon size={19} />;
                      })()
                    )}
                  </span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {formatDate(item.createdAt)} ·{" "}
                      {item.source === "ai" ? "Phản hồi AI" : "Luyện tập mẫu"}
                    </small>
                  </div>
                  <span className="recent-score">
                    {item.score === null ? "Đã luyện" : item.score.toFixed(1)}
                  </span>
                  <ChevronRight size={17} />
                </Link>
              ))
            )}
          </section>
        </div>
        <aside className="dashboard-secondary stack">
          <section className="card next-step">
            <span className="eyebrow">GỢI Ý CHO HÔM NAY</span>
            <h2>Bước tiếp theo</h2>
            <p className="muted">Một việc nhỏ, một tiến bộ mới.</p>
            <div className="recommendations">
              {data.recommendations.map((recommendation, i) => (
                <Link
                  to={
                    i === 0 && user.currentBand === null
                      ? "/placement"
                      : i === data.recommendations.length - 1 &&
                          data.dueCount > 0
                        ? "/vocabulary"
                        : "/practice"
                  }
                  key={i}
                >
                  <span className="number-dot">0{i + 1}</span>
                  <p>{recommendation}</p>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </section>
          <section className="vocab-promo">
            <div className="vocab-promo-icon">
              <GraduationCap size={25} />
            </div>
            <span className="eyebrow">GHI NHỚ LÂU HƠN</span>
            <h2>Từ vựng cần ôn</h2>
            <div className="vocab-count">
              {data.dueCount}
              <span>thẻ hôm nay</span>
            </div>
            <p>
              Ôn đúng lúc để kiến thức
              <br />ở lại lâu hơn.
            </p>
            <Link className="button full-width" to="/vocabulary">
              {data.dueCount > 0 ? "Ôn tập ngay" : "Mở sổ từ vựng"}
              <ArrowRight size={16} />
            </Link>
            <small>{data.vocabularyCount} từ trong sổ của bạn · FSRS</small>
          </section>
          <section className="card consistency-card">
            <div className="section-heading">
              <h3>Nhịp học tuần này</h3>
              <Flame size={17} />
            </div>
            <div className="activity-bars">
              {activityWeek.map((day) => (
                <div key={day.date}>
                  <span className="activity-column">
                    <span
                      style={{
                        height: `${Math.max(0, Math.min(100, day.count * 22))}%`,
                      }}
                    />
                  </span>
                  <small>
                    {formatDate(day.date, {
                      weekday: "narrow",
                      day: undefined,
                      month: undefined,
                    })}
                  </small>
                  <span className="visually-hidden">{day.count} bài</span>
                </div>
              ))}
            </div>
            <p className="small muted">
              Những buổi học nhỏ tạo nên thay đổi lớn.
            </p>
          </section>
        </aside>
      </div>
      {editingTarget && (
        <div className="modal-backdrop">
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="target-title"
          >
            <div className="section-heading">
              <h2 id="target-title">Đặt mục tiêu của bạn</h2>
              <button
                className="icon-button"
                aria-label="Đóng điều chỉnh mục tiêu"
                onClick={() => setEditingTarget(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="muted">
              Chọn band bạn muốn hướng đến. Bạn có thể thay đổi khi cần.
            </p>
            <form onSubmit={targetSubmit} className="stack">
              <label className="field">
                Band mục tiêu
                <select name="targetBand" defaultValue={user.targetBand}>
                  {[3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7].map((value) => (
                    <option value={value} key={value}>
                      {value.toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu mục tiêu"}
                <Check size={16} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function TrendChart({ history }: { history: HistoryItem[] }) {
  const points = history.map((item, index) => ({
    x: 48 + (index / (history.length - 1)) * 620,
    y: 210 - ((item.score ?? 0) / 9) * 180,
    item,
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <div className="trend-chart">
      <svg
        viewBox="0 0 700 250"
        role="img"
        aria-label="Biểu đồ điểm luyện tập theo thời gian"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#477464" stopOpacity=".2" />
            <stop offset="100%" stopColor="#477464" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[3, 5, 7, 9].map((value) => (
          <g key={value}>
            <line
              x1="48"
              x2="668"
              y1={210 - (value / 9) * 180}
              y2={210 - (value / 9) * 180}
              stroke="#e8ebe5"
              strokeDasharray="4 5"
            />
            <text
              x="15"
              y={215 - (value / 9) * 180}
              fill="#8a9189"
              fontSize="12"
            >
              {value}.0
            </text>
          </g>
        ))}
        <polygon points={`48,210 ${line} 668,210`} fill="url(#chart-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#32624f"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {points.map(({ x, y, item }, i) => (
          <g key={item.id}>
            <circle
              cx={x}
              cy={y}
              r="5"
              fill="#fafaf6"
              stroke="#32624f"
              strokeWidth="2.5"
            >
              <title>
                {skillLabels[item.skill as Skill]} · {item.score?.toFixed(1)} ·{" "}
                {formatDate(item.createdAt)}
              </title>
            </circle>
            {(i === 0 || i === points.length - 1 || points.length <= 6) && (
              <text
                x={x}
                y="237"
                textAnchor="middle"
                fill="#8a9189"
                fontSize="11"
              >
                {formatDate(item.createdAt)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function PracticeHub({ user }: { user: User }) {
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LUYỆN ĐỀU · HỌC SÂU · TIẾN XA</span>
          <h1 className="page-title">
            Một hành trình. Bốn kỹ năng<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Chọn kỹ năng bạn muốn luyện hôm nay. Một buổi học tốt bắt đầu từ sự
            tập trung.
          </p>
        </div>
        <span className="badge green">
          <Target size={14} /> Mục tiêu {user.targetBand.toFixed(1)}
        </span>
      </div>
      {user.currentBand === null && (
        <div className="placement-reminder">
          <Flag size={22} />
          <div>
            <strong>Chưa biết nên bắt đầu từ đâu?</strong>
            <p>Kiểm tra đầu vào trong 15 câu để học đúng trình độ của bạn.</p>
          </div>
          <Link className="text-link" to="/placement">
            Khám phá trình độ <ArrowRight size={17} />
          </Link>
        </div>
      )}
      <div className="practice-hub-grid">
        {skills.map((skill, index) => {
          const Icon = skillIcons[skill];
          return (
            <Link
              className={`practice-hub-card skill-${skill}`}
              key={skill}
              to={`/practice/${skill}`}
            >
              <div className="hub-card-top">
                <span className="skill-icon">
                  <Icon size={28} />
                </span>
                <span className="hub-number">0{index + 1}</span>
              </div>
              <span className="eyebrow">
                {
                  [
                    "NGHE & HIỂU",
                    "ĐỌC & KHÁM PHÁ",
                    "VIẾT & DIỄN ĐẠT",
                    "NÓI & KẾT NỐI",
                  ][index]
                }
              </span>
              <h2>{skillLabels[skill]}</h2>
              <p>{skillDescriptions[skill]}</p>
              <div className="hub-features">
                {(
                  {
                    listening: ["4 sections", "Audio & transcript"],
                    reading: ["Bài đọc theo CEFR", "Đáp án có giải thích"],
                    writing: ["Task 1 & Task 2", "Nhận xét từng đoạn"],
                    speaking: ["Part 1, 2 & 3", "Ghi âm trực tiếp"],
                  } as Record<Skill, string[]>
                )[skill].map((feature) => (
                  <span key={feature}>
                    <Check size={14} />
                    {feature}
                  </span>
                ))}
              </div>
              <div className="hub-card-bottom">
                <span>Bắt đầu luyện tập</span>
                <span className="round-arrow">
                  <ArrowRight size={20} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="study-tip">
        <Sparkles size={20} />
        <p>
          <strong>Nhỏ thôi, nhưng đều đặn.</strong> Dành 20 phút tập trung mỗi
          ngày thường hữu ích hơn một buổi học dài vội vã.
        </p>
      </div>
    </div>
  );
}

export function PlacementPage({
  onProfileRefresh,
}: {
  onProfileRefresh: () => Promise<void>;
}) {
  const [state, setState] = useState<PlacementState | null>(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const start = async () => {
    setBusy(true);
    setError("");
    try {
      setState(
        await api<PlacementState>("/api/placement/start", { method: "POST" }),
      );
      setSelected("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const answer = async () => {
    if (!state?.question || !selected) return;
    setBusy(true);
    setError("");
    try {
      const next = await api<PlacementState>("/api/placement/answer", {
        method: "POST",
        body: JSON.stringify({
          placementId: state.placementId,
          questionId: state.question.id,
          answer: selected,
        }),
      });
      setState(next);
      setSelected("");
      if (next.completed) await onProfileRefresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="placement-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">BƯỚC KHỞI ĐẦU</span>
          <h1 className="page-title">
            Hiểu mình. Học đúng hướng<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Kiểm tra thích ứng giúp tìm điểm bắt đầu phù hợp với bạn.
          </p>
        </div>
        <span className="badge">
          <Clock3 size={14} /> Khoảng 10 phút
        </span>
      </div>
      {error && <ErrorNotice message={error} />}
      {!state ? (
        <section className="placement-intro card">
          <div className="placement-illustration" aria-hidden="true">
            <div className="placement-rings">
              <Flag size={70} />
            </div>
            <span className="placement-art-label">
              every journey starts somewhere
            </span>
          </div>
          <div>
            <span className="eyebrow">DÀNH RIÊNG CHO TRÌNH ĐỘ CỦA BẠN</span>
            <h2>Một điểm bắt đầu rõ ràng.</h2>
            <p>
              Bài kiểm tra gồm 15 câu từ vựng và ngữ pháp. Độ khó thay đổi theo
              câu trả lời của bạn, từ A2 đến C1.
            </p>
            <ul className="placement-benefits">
              <li>
                <Check size={17} /> 15 câu hỏi · độ khó thích ứng
              </li>
              <li>
                <Check size={17} /> Không áp lực thời gian
              </li>
              <li>
                <Check size={17} /> Kết quả khởi điểm band 3.0 – 7.0
              </li>
            </ul>
            <p className="small muted">
              Đây là đánh giá nền tảng ngôn ngữ, không thay thế bài thi đầy đủ 4
              kỹ năng.
            </p>
            <button
              className="button"
              onClick={() => void start()}
              disabled={busy}
            >
              {busy ? "Đang chuẩn bị…" : "Bắt đầu kiểm tra"}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      ) : state.completed && state.result ? (
        <>
          <FeedbackView feedback={state.result} />
          <div className="result-actions">
            <Link className="button" to="/practice">
              Khám phá bài luyện phù hợp <ArrowRight size={17} />
            </Link>
            <Link className="button secondary" to="/dashboard">
              Về tổng quan
            </Link>
            <button
              className="text-button"
              onClick={() => {
                setState(null);
                setSelected("");
              }}
            >
              Làm lại kiểm tra
            </button>
          </div>
        </>
      ) : state.question ? (
        <section className="placement-test card">
          <div className="section-heading">
            <span className="eyebrow">
              CÂU {state.answered + 1} / {state.total}
            </span>
            <span className="badge green">
              {state.question.cefr} · Thích ứng theo bạn
            </span>
          </div>
          <div
            className="placement-progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={state.total}
            aria-valuenow={state.answered}
            aria-label="Tiến độ kiểm tra"
          >
            <span
              style={{ width: `${(state.answered / state.total) * 100}%` }}
            />
          </div>
          <p className="muted small">Chọn đáp án đúng nhất.</p>
          <h2 className="placement-question">{state.question.text}</h2>
          <fieldset className="placement-options">
            <legend className="visually-hidden">
              Đáp án câu {state.answered + 1}
            </legend>
            {state.question.options.map((option, index) => (
              <label
                className={`placement-option ${selected === option ? "selected" : ""}`}
                key={option}
              >
                <input
                  type="radio"
                  name="placement-answer"
                  value={option}
                  checked={selected === option}
                  onChange={() => setSelected(option)}
                  disabled={busy}
                />
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
                {selected === option && <Check size={18} />}
              </label>
            ))}
          </fieldset>
          <div className="placement-bottom">
            <p className="small muted">
              <Sparkles size={15} /> Câu hỏi tiếp theo điều chỉnh theo câu trả
              lời của bạn.
            </p>
            <button
              className="button"
              disabled={!selected || busy}
              onClick={() => void answer()}
            >
              {busy
                ? "Đang cập nhật…"
                : state.answered === state.total - 1
                  ? "Hoàn thành kiểm tra"
                  : "Câu tiếp theo"}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export function VocabularyPage() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const [filter, setFilter] = useState<"all" | "due">("all");
  useDialog(adding, () => setAdding(false));
  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await api<{ cards: VocabCard[]; dueCount: number }>(
        "/api/vocabulary",
      );
      setCards(result.cards);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const dueCards = cards.filter((card) => card.due);
  const activeCard =
    dueCards.find((card) => card.id === activeId) ?? dueCards[0];
  const rate = async (rating: 1 | 2 | 3 | 4) => {
    if (!activeCard) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ card: VocabCard }>(
        `/api/vocabulary/${activeCard.id}/review`,
        { method: "POST", body: JSON.stringify({ rating }) },
      );
      const other = dueCards.find((card) => card.id !== activeCard.id);
      setCards((previous) =>
        previous.map((card) =>
          card.id === result.card.id ? result.card : card,
        ),
      );
      setActiveId(other?.id ?? null);
      setFlipped(false);
      setReviewed((previous) => previous + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await api<{ card: VocabCard }>("/api/vocabulary", {
        method: "POST",
        body: JSON.stringify({
          front: form.get("front"),
          back: form.get("back"),
          example: form.get("example"),
          cefr: form.get("cefr"),
        }),
      });
      setCards((previous) => [
        result.card,
        ...previous.filter((card) => card.id !== result.card.id),
      ]);
      setAdding(false);
      setActiveId(result.card.id);
      setFlipped(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const displayCards = filter === "due" ? dueCards : cards;
  return (
    <div className="vocabulary-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">TỪ VỰNG NHỎ · NỀN TẢNG LỚN</span>
          <h1 className="page-title">
            Để kiến thức ở lại lâu hơn<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Ôn đúng thời điểm, ghi nhớ tự nhiên. Sổ từ vựng của bạn được lên
            lịch bằng FSRS.
          </p>
        </div>
        <button className="button" onClick={() => setAdding(true)}>
          <Plus size={17} />
          Thêm từ mới
        </button>
      </div>
      {error && <ErrorNotice message={error} />}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="vocab-stats">
            <span>
              <BookOpen size={19} />
              <strong>{cards.length}</strong> từ trong sổ
            </span>
            <span>
              <RotateCcw size={19} />
              <strong>{dueCards.length}</strong> thẻ cần ôn
            </span>
            <span>
              <Check size={19} />
              <strong>{reviewed}</strong> lượt ôn trong buổi này
            </span>
          </div>
          <div className="vocab-review-layout">
            <section className="flashcard-section">
              {activeCard ? (
                <>
                  <div className="section-heading">
                    <span className="eyebrow">
                      THẺ CẦN ÔN · NHỚ TRƯỚC KHI LẬT
                    </span>
                    <span className="badge">{activeCard.cefr}</span>
                  </div>
                  <button
                    className={`flashcard ${flipped ? "flipped" : ""}`}
                    onClick={() => setFlipped((previous) => !previous)}
                    aria-label={flipped ? "Xem lại mặt trước" : "Lật thẻ"}
                  >
                    <span className="flashcard-corner">
                      <GraduationCap size={23} />
                    </span>
                    <span className="eyebrow">
                      {flipped ? "NGHĨA & CÁCH DÙNG" : "BẠN CÒN NHỚ TỪ NÀY?"}
                    </span>
                    <strong>
                      {flipped ? activeCard.back : activeCard.front}
                    </strong>
                    {flipped && activeCard.example && (
                      <p>{activeCard.example}</p>
                    )}
                    <span className="flashcard-hint">
                      <RotateCcw size={14} />
                      {flipped ? "Chạm để xem lại từ" : "Lật thẻ để xem nghĩa"}
                    </span>
                  </button>
                  {flipped ? (
                    <div className="rating-buttons">
                      {(
                        [
                          { rating: 1, label: "Quên", note: "Cần học lại" },
                          { rating: 2, label: "Khó", note: "Nhớ hơi chậm" },
                          { rating: 3, label: "Tốt", note: "Nhớ chính xác" },
                          { rating: 4, label: "Dễ", note: "Rất tự tin" },
                        ] as const
                      ).map((item) => (
                        <button
                          className={`rating rating-${item.rating}`}
                          key={item.rating}
                          onClick={() => void rate(item.rating)}
                          disabled={busy}
                        >
                          <strong>{item.label}</strong>
                          <small>{item.note}</small>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="flashcard-instruction">
                      Nói nghĩa của từ thành tiếng, rồi lật thẻ để kiểm tra.
                    </p>
                  )}
                </>
              ) : (
                <div className="card vocab-done">
                  <span className="empty-icon">
                    <Check size={33} />
                  </span>
                  <span className="eyebrow">MỘT CHÚT MỖI NGÀY</span>
                  <h2>
                    {cards.length
                      ? "Hôm nay bạn đã sẵn sàng."
                      : "Bắt đầu sổ từ của riêng bạn."}
                  </h2>
                  <p>
                    {cards.length
                      ? "Chưa có thẻ nào đến hạn. Quay lại khi đến lịch để củng cố kiến thức đúng lúc."
                      : "Thêm từ mới hoặc hoàn thành bài Reading và Listening. Từ vựng của bài học sẽ được lưu để ôn lại."}
                  </p>
                  <button
                    className="button secondary"
                    onClick={() => setAdding(true)}
                  >
                    <Plus size={16} />
                    Thêm từ mới
                  </button>
                </div>
              )}
            </section>
            <aside className="card fsrs-guide">
              <span className="eyebrow">HỌC CÓ CƠ SỞ</span>
              <h2>
                Trí nhớ cần
                <br />
                đúng thời điểm.
              </h2>
              <p>
                FSRS chọn thời điểm ôn dựa trên mức độ nhớ của bạn, thay vì lặp
                lại mọi từ mỗi ngày.
              </p>
              <div className="fsrs-steps">
                <div>
                  <span className="number-dot">1</span>
                  <p>
                    <strong>Thử nhớ lại</strong>
                    <span>Dành vài giây nghĩ trước khi lật thẻ.</span>
                  </p>
                </div>
                <div>
                  <span className="number-dot">2</span>
                  <p>
                    <strong>Đánh giá thật</strong>
                    <span>Chọn Quên, Khó, Tốt hoặc Dễ.</span>
                  </p>
                </div>
                <div>
                  <span className="number-dot">3</span>
                  <p>
                    <strong>Ôn đúng lúc</strong>
                    <span>Lịch ôn điều chỉnh theo trí nhớ của bạn.</span>
                  </p>
                </div>
              </div>
              <span className="badge green">
                <Target size={13} /> Mục tiêu ghi nhớ 90%
              </span>
            </aside>
          </div>
          <section className="card vocab-library">
            <div className="section-heading">
              <div>
                <span className="eyebrow">KHO KIẾN THỨC CÁ NHÂN</span>
                <h2>Sổ từ vựng của bạn</h2>
              </div>
              <div className="tabs small-tabs">
                <button
                  className={filter === "all" ? "active" : ""}
                  onClick={() => setFilter("all")}
                >
                  Tất cả ({cards.length})
                </button>
                <button
                  className={filter === "due" ? "active" : ""}
                  onClick={() => setFilter("due")}
                >
                  Cần ôn ({dueCards.length})
                </button>
              </div>
            </div>
            {displayCards.length === 0 ? (
              <div className="compact-empty">
                <BookOpen size={22} />
                <p>
                  {filter === "due"
                    ? "Không có từ nào cần ôn lúc này."
                    : "Những từ mới học sẽ xuất hiện tại đây."}
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table className="vocab-table">
                  <thead>
                    <tr>
                      <th>Từ / cụm từ</th>
                      <th>Nghĩa tiếng Việt</th>
                      <th>Trình độ</th>
                      <th>Lượt ôn</th>
                      <th>Lịch ôn tiếp theo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCards.map((card) => (
                      <tr key={card.id}>
                        <td>
                          <strong>{card.front}</strong>
                          {card.example && <small>{card.example}</small>}
                        </td>
                        <td>{card.back}</td>
                        <td>
                          <span className="badge">{card.cefr}</span>
                        </td>
                        <td>{card.reps}</td>
                        <td>
                          {card.due ? (
                            <span className="due-label">Đến hạn</span>
                          ) : (
                            formatDate(card.dueDate)
                          )}
                          {card.reps > 0 && (
                            <small>
                              Ổn định {card.stability.toFixed(1)} ngày
                            </small>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      {adding && (
        <div className="modal-backdrop">
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-word-title"
          >
            <div className="section-heading">
              <h2 id="add-word-title">Một từ mới, một ý mới.</h2>
              <button
                className="icon-button"
                aria-label="Đóng thêm từ"
                onClick={() => setAdding(false)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="muted">Thêm từ hoặc cụm từ bạn muốn ghi nhớ.</p>
            <form onSubmit={add} className="stack">
              <label className="field">
                Từ / cụm từ
                <input
                  name="front"
                  autoFocus
                  required
                  maxLength={120}
                  placeholder="e.g. sustainable development"
                />
              </label>
              <label className="field">
                Nghĩa tiếng Việt
                <input
                  name="back"
                  required
                  maxLength={400}
                  placeholder="e.g. sự phát triển bền vững"
                />
              </label>
              <label className="field">
                Ví dụ (tùy chọn)
                <textarea
                  name="example"
                  maxLength={1000}
                  rows={2}
                  placeholder="Một câu giúp bạn nhớ cách dùng…"
                />
              </label>
              <label className="field">
                Trình độ
                <select name="cefr" defaultValue="B1">
                  {["A2", "B1", "B2", "C1"].map((cefr) => (
                    <option key={cefr}>{cefr}</option>
                  ))}
                </select>
              </label>
              {error && <ErrorNotice message={error} />}
              <button className="button" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu từ"}
                <Check size={16} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const [filter, setFilter] = useState<Skill | "all" | "placement">("all");
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api<{ history: HistoryItem[] }>("/api/history");
      setHistory(result.history);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const displayed = useMemo(
    () => history.filter((item) => filter === "all" || item.skill === filter),
    [history, filter],
  );
  const download = (item: HistoryItem) => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(item, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ielts-compass-${item.skill}-${item.createdAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  if (selected)
    return (
      <div>
        <button
          className="text-link history-back"
          onClick={() => setSelected(null)}
        >
          <ArrowLeft size={16} />
          Trở lại lịch sử
        </button>
        <div className="page-heading">
          <div>
            <span className="eyebrow">
              {selected.skill === "placement"
                ? "KIỂM TRA ĐẦU VÀO"
                : skillLabels[selected.skill].toUpperCase()}{" "}
              · {formatDate(selected.createdAt, { year: "numeric" })}
            </span>
            <h1 className="page-title">{selected.title}</h1>
            <p className="page-description">
              Nhìn lại kết quả, biến phản hồi thành bước tiến tiếp theo.
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => download(selected)}
          >
            <Download size={16} />
            Tải báo cáo
          </button>
        </div>
        <FeedbackView feedback={selected.feedback} />
        <div className="result-actions">
          <Link
            className="button"
            to={
              selected.skill === "placement"
                ? "/practice"
                : `/practice/${selected.skill}`
            }
          >
            Luyện thêm một bài <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  return (
    <div>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MỖI BUỔI HỌC ĐỀU CÓ Ý NGHĨA</span>
          <h1 className="page-title">
            Những bước tiến đã qua<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Kết quả, nhận xét và những điều cần cải thiện — tất cả ở một nơi.
          </p>
        </div>
        <span className="badge">
          <BarChart3 size={14} /> {history.length} bài đã ghi nhận
        </span>
      </div>
      {error && (
        <div className="stack">
          <ErrorNotice message={error} />
          <button className="button secondary" onClick={() => void load()}>
            Thử lại
          </button>
        </div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="tabs history-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>
            {skills.map((skill) => (
              <button
                key={skill}
                className={filter === skill ? "active" : ""}
                onClick={() => setFilter(skill)}
              >
                {skillLabels[skill]}
              </button>
            ))}
            <button
              className={filter === "placement" ? "active" : ""}
              onClick={() => setFilter("placement")}
            >
              Đầu vào
            </button>
          </div>
          {displayed.length === 0 ? (
            <section className="card history-empty">
              <span className="empty-icon">
                <BookOpen size={29} />
              </span>
              <h2>Hành trình đang chờ dấu chân đầu tiên.</h2>
              <p className="muted">
                Hoàn thành một bài luyện để lưu kết quả và phản hồi tại đây.
              </p>
              <Link to="/practice" className="button">
                Bắt đầu luyện tập <ArrowRight size={17} />
              </Link>
            </section>
          ) : (
            <div className="history-list">
              {displayed.map((item) => {
                const Icon =
                  item.skill === "placement" ? Flag : skillIcons[item.skill];
                return (
                  <button
                    key={item.id}
                    className="history-row card"
                    onClick={() => setSelected(item)}
                  >
                    <span className={`skill-icon skill-${item.skill}`}>
                      <Icon size={22} />
                    </span>
                    <div className="history-row-copy">
                      <span className="eyebrow">
                        {item.skill === "placement"
                          ? "KIỂM TRA ĐẦU VÀO"
                          : skillLabels[item.skill]}
                      </span>
                      <h3>{item.title}</h3>
                      <p>
                        {formatDate(item.createdAt, {
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ·{" "}
                        {item.source === "ai" ? "Phản hồi AI" : "Luyện tập mẫu"}
                      </p>
                    </div>
                    <div className="history-row-score">
                      <strong>
                        {item.score === null ? (
                          <Check size={24} />
                        ) : (
                          item.score.toFixed(1)
                        )}
                      </strong>
                      <small>
                        {item.score === null ? "Đã luyện" : "Band tham khảo"}
                      </small>
                    </div>
                    <span className="history-detail-label">
                      Xem kết quả <ChevronRight size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
