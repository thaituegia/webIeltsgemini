import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  HeartHandshake,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Attempt } from "../shared/types";
import type {
  DuoAssessmentView,
  DuoBandView,
  DuoGateView,
  DuoLessonView,
  DuoResultStatus,
  DuoRoomView,
  DuoSnapshot,
} from "../shared/duo";
import { api, json } from "./api";
import { useSession } from "./hooks";
import {
  Badge,
  Button,
  Card,
  ErrorNotice,
  Loading,
  PageHeader,
  SkillBadge,
  bandLabel,
} from "./components";
import "./duo.css";

const message = (cause: unknown) =>
  cause instanceof Error
    ? cause.message
    : "Không thể thực hiện thao tác. Hãy thử lại.";
const roleName = { husband: "Chồng", wife: "Vợ" };
const resultName: Record<DuoResultStatus, string> = {
  "in-progress": "Đang làm",
  "pending-ai": "Chờ chấm bài",
  passed: "Đã đạt",
  failed: "Cần ôn và thi lại",
};
const statusName: Record<DuoSnapshot["status"], string> = {
  NOT_STARTED: "Chờ đủ hai kết quả đầu vào",
  IN_PROGRESS: "Đang cùng tiến bộ",
  GATE_LOCKED: "Hoàn thành chặng học trước Duo Gate",
  WAITING_FOR_PARTNER: "Chờ bạn đồng hành hoàn thành",
  BAND_EXAM_AVAILABLE: "Sẵn sàng thi nâng band",
  BAND_EXAM_IN_PROGRESS: "Đang thi nâng band",
  WAITING_FOR_BAND_PASS: "Chờ cả hai đạt kỳ thi nâng band",
  BAND_COMPLETED: "Đã hoàn thành mục tiêu chung",
};
function useDuo() {
  const { health } = useSession();
  const enabled = health?.duoEnabled !== false;
  return usePolling<{ duo: DuoSnapshot }>(enabled ? "/duo" : null);
}
function usePolling<T>(path: string | null, interval = 5000) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(!!path);
  const generation = useRef(0);
  const reload = useCallback(async () => {
    if (!path) return;
    const current = generation.current;
    try {
      const result = await api<T>(path);
      if (current === generation.current) {
        setData(result);
        setError("");
      }
    } catch (cause) {
      if (current === generation.current) setError(message(cause));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    generation.current++;
    setData(null);
    setError("");
    setLoading(!!path);
    void reload();
    if (!path) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void reload();
    }, interval);
    return () => {
      generation.current++;
      clearInterval(timer);
    };
  }, [path, interval, reload]);
  return { data, error, loading, reload, setData };
}
function ResultBadge({ status }: { status: DuoResultStatus | null }) {
  return (
    <Badge
      className={
        status === "passed"
          ? "success"
          : status === "failed"
            ? "duo-revision"
            : "neutral"
      }
    >
      {status === "passed" && <Check size={12} />}
      {status ? resultName[status] : "Chưa làm"}
    </Badge>
  );
}
function MemberLevels({ duo }: { duo: DuoSnapshot }) {
  return (
    <div className="duo-members">
      {duo.members.map((member) => (
        <div className="duo-member" key={member.id}>
          <span className="avatar">{member.name.split(" ").at(-1)?.[0]}</span>
          <div>
            <strong>{member.name}</strong>
            <small>
              {roleName[member.role]}
              {member.role === duo.role ? " · Bạn" : ""}
            </small>
          </div>
          <dl>
            <div>
              <dt>Đầu vào</dt>
              <dd>{bandLabel(member.placementBand)}</dd>
            </div>
            <div>
              <dt>Ước lượng cá nhân</dt>
              <dd>{bandLabel(member.personalEstimatedBand)}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
export function DuoDashboardCard() {
  const state = useDuo();
  const { health } = useSession();
  if (health?.duoEnabled === false) return null;
  if (state.loading) return <Loading text="Đang cập nhật hành trình chung…" />;
  if (state.error || !state.data)
    return (
      <ErrorNotice
        message={state.error || "Không tải được lộ trình chung."}
        retry={() => void state.reload()}
      />
    );
  const duo = state.data.duo;
  return (
    <Card className="duo-overview">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">HAI NGƯỜI · MỘT HÀNH TRÌNH</p>
          <h2>Lộ trình Duo của chúng mình</h2>
        </div>
        <HeartHandshake size={30} />
      </div>
      <div className="duo-levels">
        <div>
          <span>Band chung đang học</span>
          <strong>{bandLabel(duo.path?.currentBand)}</strong>
        </div>
        <ArrowRight size={24} />
        <div>
          <span>Mục tiêu chung</span>
          <strong>{bandLabel(duo.path?.targetBand ?? 8)}</strong>
        </div>
        <Badge>{statusName[duo.status]}</Badge>
      </div>
      <MemberLevels duo={duo} />
      <div className="duo-overview-footer">
        <p>
          {duo.path
            ? "Bài làm của mỗi người được lưu riêng. Chỉ khi cả hai đạt, lộ trình mới đi tiếp."
            : "Mỗi người làm bài đầu vào riêng. Lộ trình bắt đầu từ band thấp hơn sau khi cả hai hoàn thành."}
        </p>
        <Link className="button secondary small" to="/plan">
          Xem hành trình chung
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}
export function DuoPlacementStatus() {
  const state = useDuo();
  const { health } = useSession();
  if (health?.duoEnabled === false || !state.data) return null;
  return (
    <Card className="duo-placement-status">
      <div className="section-heading compact">
        <h2>Điểm xuất phát của hai người</h2>
        <Users size={23} />
      </div>
      <MemberLevels duo={state.data.duo} />
      <p className="muted">
        {state.data.duo.path
          ? `Lộ trình đang học band ${bandLabel(state.data.duo.path.currentBand)}. Làm lại đầu vào chỉ cập nhật ước lượng cá nhân; band chung được giữ nguyên.`
          : "Làm bài vào thời điểm phù hợp với bạn. Khi cả hai hoàn thành, band thấp hơn sẽ là điểm bắt đầu chung."}
      </p>
    </Card>
  );
}
export function DuoPlanPage() {
  const state = useDuo();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null),
    [busy, setBusy] = useState(""),
    [actionError, setError] = useState("");
  const duo = state.data?.duo;
  const previousBand = useRef<number | null>(null);
  useEffect(() => {
    if (duo?.path && duo.path.currentBand !== previousBand.current) {
      previousBand.current = duo.path.currentBand;
      setSelected(duo.path.currentBand);
    }
  }, [duo?.path?.currentBand]);
  async function startLesson(lesson: DuoLessonView) {
    if (!lesson.contentId) return navigate("/vocabulary");
    setBusy(lesson.id);
    setError("");
    try {
      const result = await api<{ attempt: Attempt }>("/attempts", {
        method: "POST",
        body: json({ contentId: lesson.contentId, mode: "practice" }),
      });
      navigate(
        `/learn/${result.attempt.id}${lesson.completed[duo!.role] ? "" : `?duoLesson=${encodeURIComponent(lesson.id)}`}`,
      );
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy("");
    }
  }
  async function startGate(gate: DuoGateView) {
    setBusy(gate.id);
    setError("");
    try {
      const result = await api<{ assessment: DuoAssessmentView }>(
        `/duo/gates/${encodeURIComponent(gate.id)}/start`,
        { method: "POST" },
      );
      navigate(`/duo/assessments/${result.assessment.id}`);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy("");
    }
  }
  async function room() {
    setBusy("room");
    setError("");
    try {
      const result = await api<{ room: DuoRoomView }>("/duo/rooms", {
        method: "POST",
      });
      navigate(`/duo/rooms/${result.room.id}`);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy("");
    }
  }
  if (state.loading) return <Loading text="Đang chuẩn bị hành trình chung…" />;
  if (state.error || !duo)
    return (
      <ErrorNotice
        message={state.error || "Không tải được hành trình."}
        retry={() => void state.reload()}
      />
    );
  const band = duo.bands.find(
    (item) => item.band === (selected ?? duo.path?.currentBand),
  );
  return (
    <div className="stack page-stack duo-plan">
      <PageHeader
        eyebrow="MỘT MỤC TIÊU, HAI NGƯỜI ĐỒNG HÀNH"
        title="Lộ trình của hai người"
        description="Học riêng theo nhịp của mình. Vượt Duo Gate và cùng thi để bước lên band tiếp theo."
        action={
          <Link className="button secondary small" to="/library">
            Luyện tập bổ sung
            <ArrowRight size={16} />
          </Link>
        }
      />
      <Card className="duo-overview">
        <div className="duo-levels">
          <div>
            <span>Band chung đang học</span>
            <strong>{bandLabel(duo.path?.currentBand)}</strong>
          </div>
          <ArrowRight size={24} />
          <div>
            <span>Mục tiêu chung</span>
            <strong>{bandLabel(duo.path?.targetBand ?? 8)}</strong>
          </div>
          <Badge>{statusName[duo.status]}</Badge>
        </div>
        <MemberLevels duo={duo} />
      </Card>
      <div className="notice">
        <ShieldCheck size={20} />
        <span>
          Kho bài tập và thi thử luôn mở để mỗi người học riêng. Duo Gate được
          làm riêng; chỉ kỳ thi nâng band cần cả hai cùng vào phòng và sẵn sàng.
        </span>
      </div>
      {actionError && <ErrorNotice message={actionError} />}
      {!duo.path ? (
        <Card className="duo-waiting">
          <Users size={38} />
          <h2>Chờ đủ hai kết quả đầu vào</h2>
          <p>
            Mỗi người hoàn thành bài kiểm tra độc lập. Điểm thấp hơn quyết định
            band khởi đầu; kết quả riêng của cả hai vẫn được giữ.
          </p>
          <Link className="button" to="/placement">
            Làm bài kiểm tra đầu vào
            <ArrowRight size={17} />
          </Link>
          <Link className="text-link" to="/library">
            Trong lúc chờ, tiếp tục luyện tập riêng
          </Link>
        </Card>
      ) : (
        <>
          <div
            className="duo-band-tabs"
            role="group"
            aria-label="Band trong lộ trình"
          >
            {duo.bands.map((item) => (
              <button
                key={item.band}
                className={item.band === band?.band ? "selected" : ""}
                aria-pressed={item.band === band?.band}
                onClick={() => setSelected(item.band)}
              >
                {item.completed ? (
                  <CircleCheck size={15} />
                ) : !item.unlocked ? (
                  <LockKeyhole size={14} />
                ) : null}
                Band {item.band.toFixed(1)}
              </button>
            ))}
          </div>
          {band && (
            <>
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">
                    {band.completed
                      ? "ÔN LẠI KIẾN THỨC ĐÃ HỌC"
                      : "CHẶNG ĐƯỜNG HIỆN TẠI"}
                  </p>
                  <h2>
                    Band {band.band.toFixed(1)} · {band.lessons.length} buổi học
                  </h2>
                </div>
                <Badge>{duo.path.gateInterval} buổi / Duo Gate</Badge>
              </div>
              {!band.unlocked && (
                <div className="notice">
                  <LockKeyhole size={20} />
                  <span>
                    Band này mở sau khi cả hai đạt kỳ thi nâng band trước đó.
                    Bạn vẫn có thể luyện nội dung cùng trình độ trong kho bài
                    tập.
                  </span>
                </div>
              )}
              <div className="duo-journey">
                {band.lessons.map((lesson) => (
                  <div className="duo-journey-group" key={lesson.id}>
                    <article
                      className={`duo-lesson ${!lesson.unlocked ? "locked" : ""}`}
                      data-testid={`duo-lesson-${lesson.number}`}
                    >
                      <div className="duo-step-number">
                        {String(lesson.number).padStart(2, "0")}
                      </div>
                      <div className="duo-lesson-copy">
                        {lesson.kind === "vocabulary" ? (
                          <Badge>Từ vựng</Badge>
                        ) : (
                          <SkillBadge skill={lesson.kind} />
                        )}
                        <h3>{lesson.title}</h3>
                        <div className="duo-completion">
                          {duo.members.map((member) => (
                            <span
                              key={member.role}
                              className={
                                lesson.completed[member.role] ? "done" : ""
                              }
                            >
                              {lesson.completed[member.role] ? (
                                <CircleCheck size={14} />
                              ) : (
                                <Clock3 size={14} />
                              )}
                              {member.name.split(" ").at(-1)} ·{" "}
                              {lesson.completed[member.role]
                                ? "Đã hoàn thành"
                                : "Chưa hoàn thành"}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="secondary small"
                        disabled={!!busy || !lesson.unlocked}
                        onClick={() => void startLesson(lesson)}
                      >
                        {!lesson.unlocked ? (
                          <>
                            <LockKeyhole size={14} /> Chưa mở
                          </>
                        ) : lesson.completed[duo.role] ? (
                          "Ôn lại buổi học"
                        ) : (
                          "Bắt đầu buổi học"
                        )}
                        <ArrowRight size={15} />
                      </Button>
                    </article>
                    {band.gates
                      .filter((gate) => gate.afterLesson === lesson.number)
                      .map((gate) => (
                        <GateCard
                          key={gate.id}
                          gate={gate}
                          duo={duo}
                          busy={!!busy}
                          onStart={() => void startGate(gate)}
                        />
                      ))}
                  </div>
                ))}
              </div>
              <PromotionCard
                band={band}
                duo={duo}
                busy={!!busy}
                onOpen={() => void room()}
              />
            </>
          )}
          <Card className="duo-assessment-history">
            <h2>Các lượt đánh giá của bạn</h2>
            {duo.assessments.length ? (
              <div className="duo-history-list">
                {duo.assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    to={`/duo/assessments/${assessment.id}`}
                  >
                    <div>
                      <strong>
                        {assessment.kind === "gate"
                          ? "Duo Gate"
                          : "Thi nâng band"}{" "}
                        · Band {assessment.band.toFixed(1)}
                      </strong>
                      <small>
                        {new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Bangkok",
                        }).format(new Date(assessment.createdAt))}
                      </small>
                    </div>
                    <ResultBadge status={assessment.status} />
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">
                Kết quả Duo Gate và kỳ thi nâng band sẽ được lưu tại đây.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
function GateCard({
  gate,
  duo,
  busy,
  onStart,
}: {
  gate: DuoGateView;
  duo: DuoSnapshot;
  busy: boolean;
  onStart: () => void;
}) {
  const mine = gate.results[duo.role];
  return (
    <Card className={`duo-gate ${gate.unlocked ? "passed" : ""}`}>
      <div className="duo-gate-heading">
        <span className="duo-gate-icon">
          {gate.unlocked ? (
            <ShieldCheck size={25} />
          ) : (
            <LockKeyhole size={25} />
          )}
        </span>
        <div>
          <p className="eyebrow">ĐIỂM DỪNG CỦA HAI NGƯỜI</p>
          <h3>Duo Gate {gate.number}</h3>
          <p>
            Ôn kiến thức buổi {gate.fromLesson}–{gate.afterLesson}. Mỗi người có
            thể làm vào thời điểm khác nhau.
          </p>
        </div>
      </div>
      <div className="duo-result-row">
        {duo.members.map((member) => (
          <div key={member.role}>
            <span>{member.name}</span>
            <ResultBadge status={gate.results[member.role]} />
          </div>
        ))}
      </div>
      <div className="duo-gate-footer">
        <p>
          {gate.unlocked
            ? "Cả hai đã đạt. Các buổi học tiếp theo đã mở."
            : mine === "passed"
              ? "Bạn đã đạt và được bảo lưu kết quả. Chờ bạn đồng hành; vẫn có thể ôn tập."
              : gate.eligible
                ? "Cả hai đã hoàn thành chặng học. Sẵn sàng kiểm tra kiến thức."
                : "Cả hai cần hoàn thành các buổi học trước Gate."}
        </p>
        {mine === "passed" ? (
          <Badge className="success">Đã đạt · bảo lưu</Badge>
        ) : (
          <Button
            className="small"
            disabled={busy || !gate.eligible}
            onClick={onStart}
          >
            {mine === "failed"
              ? "Thi lại Duo Gate"
              : mine === "in-progress"
                ? "Tiếp tục Duo Gate"
                : "Làm Duo Gate"}
            <ArrowRight size={15} />
          </Button>
        )}
      </div>
    </Card>
  );
}
function PromotionCard({
  band,
  duo,
  busy,
  onOpen,
}: {
  band: DuoBandView;
  duo: DuoSnapshot;
  busy: boolean;
  onOpen: () => void;
}) {
  const current = band.band === duo.path?.currentBand;
  return (
    <Card className="duo-promotion">
      <div className="duo-gate-heading">
        <span className="duo-gate-icon">
          <Users size={28} />
        </span>
        <div>
          <p className="eyebrow">CÙNG SẴN SÀNG · CÙNG BƯỚC TIẾP</p>
          <h2>
            {band.band === 8
              ? "Đánh giá mục tiêu band 8.0"
              : `Kỳ thi nâng band ${band.band.toFixed(1)} → ${Math.min(8, band.band + 0.5).toFixed(1)}`}
          </h2>
          <p>
            Cả hai vào phòng và xác nhận sẵn sàng. Đề bài, đáp án và kết quả
            được lưu riêng cho từng người.
          </p>
        </div>
      </div>
      <div className="duo-result-row">
        {duo.members.map((member) => (
          <div key={member.role}>
            <span>{member.name}</span>
            <ResultBadge status={band.promotionResults[member.role]} />
          </div>
        ))}
      </div>
      <div className="duo-gate-footer">
        <p>
          {band.completed
            ? "Chặng band này đã hoàn thành. Tiếp tục ôn tập bất cứ lúc nào."
            : !band.promotionEligible
              ? "Mở sau khi cả hai hoàn thành mọi buổi học và đạt tất cả Duo Gate trong band."
              : band.promotionResults[duo.role] === "passed"
                ? "Kết quả đạt của bạn được bảo lưu. Vào phòng với vai trò đồng hành khi người kia thi lại."
                : "Sẵn sàng mở phòng. Band chung chỉ thay đổi khi cả hai đạt."}
        </p>
        <Button
          disabled={
            busy || !band.promotionEligible || !current || band.completed
          }
          onClick={onOpen}
        >
          <Users size={16} />
          {duo.room &&
          duo.room.band === band.band &&
          ["waiting", "countdown", "in-progress"].includes(duo.room.status)
            ? "Vào phòng thi chung"
            : "Mở phòng thi nâng band"}
        </Button>
      </div>
    </Card>
  );
}
function useRoomHeartbeat(
  roomId: string | null,
  enabled = true,
  onError?: (message: string) => void,
) {
  const errorRef = useRef(onError);
  errorRef.current = onError;
  useEffect(() => {
    if (!roomId || !enabled) return;
    let cancelled = false;
    async function beat() {
      try {
        await api(`/duo/rooms/${encodeURIComponent(roomId!)}/heartbeat`, {
          method: "POST",
        });
      } catch (cause) {
        if (!cancelled) errorRef.current?.(message(cause));
      }
    }
    void beat();
    const timer = setInterval(() => void beat(), 10_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [roomId, enabled]);
}
export function DuoRoomPage() {
  const { roomId = "" } = useParams();
  const navigate = useNavigate();
  const state = usePolling<{ room: DuoRoomView }>(
    `/duo/rooms/${encodeURIComponent(roomId)}`,
    3000,
  );
  const duoState = useDuo();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [companion, setCompanion] = useState(false),
    [tick, setTick] = useState(Date.now());
  const started = useRef(false),
    joined = useRef("");
  const room = state.data?.room,
    duo = duoState.data?.duo;
  useEffect(() => {
    if (!roomId || joined.current === roomId) return;
    joined.current = roomId;
    started.current = false;
    api<{ room: DuoRoomView }>(
      `/duo/rooms/${encodeURIComponent(roomId)}/join`,
      { method: "POST" },
    )
      .then((result) => {
        state.setData(result);
        setError("");
      })
      .catch((cause) => setError(message(cause)));
  }, [roomId]);
  useRoomHeartbeat(
    roomId,
    !!room && !["completed", "cancelled"].includes(room.status),
    setError,
  );
  const nowOffset = room ? new Date(room.serverNow).getTime() - Date.now() : 0;
  const offset = useRef(0);
  useEffect(() => {
    offset.current = nowOffset;
  }, [room?.serverNow]);
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);
  const remaining = room?.startsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(room.startsAt).getTime() - (tick + offset.current)) / 1000,
        ),
      )
    : null;
  async function begin() {
    if (started.current || busy) return;
    started.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api<{
        room: DuoRoomView;
        assessment: DuoAssessmentView | null;
        companion: boolean;
      }>(`/duo/rooms/${encodeURIComponent(roomId)}/start`, { method: "POST" });
      state.setData({ room: result.room });
      if (result.assessment && !result.companion)
        navigate(`/duo/assessments/${result.assessment.id}`);
    } catch (cause) {
      started.current = false;
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (
      !error &&
      ((room?.status === "countdown" && remaining === 0) ||
        (room?.status === "in-progress" && !started.current))
    )
      void begin();
  }, [room?.status, remaining, error]);
  async function ready(value: boolean) {
    setBusy(true);
    setError("");
    try {
      state.setData(
        await api<{ room: DuoRoomView }>(
          `/duo/rooms/${encodeURIComponent(roomId)}/ready`,
          { method: "POST", body: json({ ready: value, companion }) },
        ),
      );
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  async function leave() {
    setBusy(true);
    try {
      await api(`/duo/rooms/${encodeURIComponent(roomId)}/leave`, {
        method: "POST",
      });
      navigate("/plan");
    } catch (cause) {
      setError(message(cause));
      setBusy(false);
    }
  }
  if (state.loading || duoState.loading)
    return <Loading text="Đang kết nối phòng thi của hai người…" />;
  if (!room || !duo)
    return (
      <ErrorNotice
        message={state.error || duoState.error || "Không tải được phòng thi."}
        retry={() => {
          void state.reload();
          void duoState.reload();
        }}
      />
    );
  const mine = room.members[duo.role];
  const retained =
    duo.bands.find((band) => band.band === room.band)?.promotionResults[
      duo.role
    ] === "passed";
  return (
    <div className="stack page-stack duo-room">
      <PageHeader
        eyebrow="CÙNG SẴN SÀNG CHO BƯỚC TIẾP THEO"
        title={`Phòng thi nâng band ${room.band.toFixed(1)}`}
        description="Hai người xác nhận sẵn sàng; máy chủ bắt đầu đếm ngược và giữ cùng hạn nộp khi tải lại trang."
      />
      {(error || state.error) && (
        <ErrorNotice
          message={error || state.error}
          retry={() => {
            setError("");
            void state.reload();
          }}
        />
      )}
      <Card className="duo-room-card">
        <div className="duo-room-symbol">
          <Users size={40} />
        </div>
        <h2>
          {room.status === "completed"
            ? "Phiên thi đã kết thúc"
            : room.status === "cancelled"
              ? "Phiên thi đã đóng"
              : room.status === "in-progress"
                ? mine.companion
                  ? "Bạn đang đồng hành"
                  : "Bài thi đang diễn ra"
                : room.status === "countdown"
                  ? "Cả hai đã sẵn sàng"
                  : "Chờ hai người cùng sẵn sàng"}
        </h2>
        <div className="duo-room-members">
          {duo.members.map((member) => {
            const presence = room.members[member.role];
            return (
              <div
                key={member.role}
                className={presence.present ? "present" : ""}
              >
                <span className="avatar">
                  {member.name.split(" ").at(-1)?.[0]}
                </span>
                <strong>{member.name}</strong>
                <span>
                  <span
                    className={`status-dot ${presence.present ? "" : "offline"}`}
                  />
                  {presence.present
                    ? "Đang có mặt"
                    : presence.joined
                      ? "Đang mất kết nối"
                      : "Chưa vào phòng"}
                </span>
                <Badge className={presence.ready ? "success" : "neutral"}>
                  {presence.ready ? "Đã sẵn sàng" : "Chưa sẵn sàng"}
                </Badge>
                {presence.companion && (
                  <small>Vai trò đồng hành · kết quả đạt được bảo lưu</small>
                )}
              </div>
            );
          })}
        </div>
        {room.status === "countdown" && (
          <div className="duo-countdown" role="status">
            <strong>{remaining}</strong>
            <span>Bài thi bắt đầu sau {remaining} giây</span>
          </div>
        )}
        {room.status === "waiting" && (
          <>
            <p className="muted">
              Nếu một người chưa có mặt hoặc chưa sẵn sàng, bài thi chưa bắt
              đầu.
            </p>
            {retained && !duo.path?.strictRetakeMode && (
              <label className="duo-companion-choice">
                <input
                  type="checkbox"
                  checked={companion}
                  disabled={mine.ready || busy}
                  onChange={(event) => setCompanion(event.target.checked)}
                />
                Tham gia với vai trò đồng hành, bảo lưu kết quả đã đạt
              </label>
            )}
            <Button
              disabled={busy || !mine.present}
              onClick={() => void ready(!mine.ready)}
            >
              {mine.ready ? "Hủy sẵn sàng" : "Tôi đã sẵn sàng"}
              <Check size={17} />
            </Button>
          </>
        )}
        {room.status === "in-progress" && !mine.companion && (
          <Button
            disabled={busy}
            onClick={() => {
              if (mine.assessmentId)
                navigate(`/duo/assessments/${mine.assessmentId}`);
              else void begin();
            }}
          >
            Tiếp tục bài thi của tôi
            <ArrowRight size={17} />
          </Button>
        )}
        {room.status === "in-progress" && mine.companion && (
          <p className="notice">
            Bạn đã đạt ở lượt trước. Giữ phòng mở để đồng hành; bài làm của
            người kia vẫn riêng tư.
          </p>
        )}
        {room.deadlineAt && (
          <p className="muted tiny">
            Hạn nộp:{" "}
            {new Intl.DateTimeFormat("vi-VN", {
              timeStyle: "medium",
              timeZone: "Asia/Bangkok",
            }).format(new Date(room.deadlineAt))}
            . Mất kết nối? Đăng nhập lại và tiếp tục trước hạn; thời gian không
            được đặt lại.
          </p>
        )}
        {["completed", "cancelled"].includes(room.status) && (
          <Link className="button" to="/plan">
            Xem kết quả và band chung
            <ArrowRight size={17} />
          </Link>
        )}
      </Card>
      <div className="row wrap">
        <Button
          className="secondary small"
          disabled={busy}
          onClick={() => void leave()}
        >
          <ArrowLeft size={16} />
          {room.status === "in-progress" ? "Rời phòng" : "Quay lại lộ trình"}
        </Button>
        <span className="muted tiny">
          Bản nháp và kết quả đã nộp vẫn được giữ.
        </span>
      </div>
    </div>
  );
}
export function DuoAssessmentPage() {
  const { assessmentId = "" } = useParams();
  const navigate = useNavigate();
  const { health, refresh } = useSession();
  const state = usePolling<{ assessment: DuoAssessmentView }>(
    `/duo/assessments/${encodeURIComponent(assessmentId)}`,
    4000,
  );
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const assessment = state.data?.assessment;
  useRoomHeartbeat(
    assessment?.roomId ?? null,
    assessment?.status === "in-progress" || assessment?.status === "pending-ai",
    setError,
  );
  async function start(contentId: string, attemptId: string | null) {
    if (attemptId)
      return navigate(
        `/learn/${attemptId}?duoAssessment=${encodeURIComponent(assessmentId)}`,
      );
    setBusy(contentId);
    setError("");
    try {
      const result = await api<{ attempt: Attempt }>("/attempts", {
        method: "POST",
        body: json({ contentId, mode: "exam", duoAssessmentId: assessmentId }),
      });
      navigate(
        `/learn/${result.attempt.id}?duoAssessment=${encodeURIComponent(assessmentId)}`,
      );
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy("");
    }
  }
  async function regrade(attemptId: string) {
    setBusy(attemptId);
    setError("");
    try {
      await api(`/attempts/${encodeURIComponent(attemptId)}/regrade`, {
        method: "POST",
      });
      await state.reload();
      await refresh();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy("");
    }
  }
  if (state.loading) return <Loading text="Đang lấy bài đánh giá của bạn…" />;
  if (!assessment)
    return (
      <ErrorNotice
        message={state.error || "Không tải được bài đánh giá."}
        retry={() => void state.reload()}
      />
    );
  const active = assessment.status === "in-progress";
  const canStart = (index: number) =>
    new Date(assessment.parts[index].startsAt).getTime() <=
      new Date(assessment.serverNow).getTime() &&
    (assessment.kind !== "promotion" ||
      assessment.parts
        .slice(0, index)
        .every((part) => part.attemptId && part.status !== "in-progress"));
  return (
    <div className="stack page-stack duo-assessment">
      <PageHeader
        eyebrow="KẾT QUẢ RIÊNG · TIẾN BỘ CHUNG"
        title={`${assessment.kind === "gate" ? "Duo Gate" : "Bài thi nâng band"} · Band ${assessment.band.toFixed(1)}`}
        description={
          assessment.kind === "gate"
            ? "Bạn làm bài riêng; không cần đợi người kia vào cùng lúc. Cả hai đạt mới mở chặng tiếp theo."
            : "Phiên thi chung đã bắt đầu. Hoàn thành các kỹ năng trong bài của riêng bạn."
        }
      />
      {(error || state.error) && <ErrorNotice message={error || state.error} />}
      <Card className="duo-assessment-summary">
        <ResultBadge status={assessment.status} />
        <p>
          {assessment.status === "passed"
            ? "Bạn đã đạt. Kết quả được bảo lưu trong khi chờ bạn đồng hành; xem lộ trình để biết trạng thái chung."
            : assessment.status === "failed"
              ? "Hãy xem phản hồi, ôn lại phần còn yếu và quay về lộ trình để thi lại. Kết quả đạt của người kia vẫn được giữ."
              : assessment.status === "pending-ai"
                ? "Bài đã nộp, đang chờ chấm AI. Speaking còn cần bản ghi và phân tích âm thanh hợp lệ. Chưa nâng band khi thiếu kết quả chấm đầy đủ."
                : `Hoàn thành các phần bên dưới. Mức đạt cho câu hỏi khách quan: ${assessment.passPercent}%. Writing/Speaking cần band ước lượng từ chấm AI hợp lệ ít nhất ${assessment.requiredBand.toFixed(1)}.`}
        </p>
        <div className="row wrap">
          <Clock3 size={17} />
          <span>
            Hạn nộp chung:{" "}
            {new Intl.DateTimeFormat("vi-VN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Bangkok",
            }).format(new Date(assessment.deadlineAt))}
          </span>
        </div>
      </Card>
      <div className="duo-assessment-parts">
        {assessment.parts.map((part, index) => (
          <Card key={part.contentId}>
            <div className="duo-part-heading">
              <span className="duo-step-number">{index + 1}</span>
              <SkillBadge skill={part.skill} />
              <ResultBadge status={part.status} />
            </div>
            <h2>{part.title}</h2>
            <p className="muted tiny">
              Lịch phần thi:{" "}
              {new Intl.DateTimeFormat("vi-VN", {
                timeStyle: "short",
                timeZone: "Asia/Bangkok",
              }).format(new Date(part.startsAt))}
              –
              {new Intl.DateTimeFormat("vi-VN", {
                timeStyle: "short",
                timeZone: "Asia/Bangkok",
              }).format(new Date(part.deadlineAt))}
            </p>
            <p className="muted">
              {part.scorePercent !== null
                ? `${part.scorePercent.toFixed(0)}% câu đúng`
                : part.estimatedBand !== null
                  ? `Band cá nhân ước lượng ${part.estimatedBand.toFixed(1)}`
                  : part.status === "pending-ai"
                    ? part.skill === "speaking"
                      ? "Đã lưu bài nói, chờ chấm AI và phân tích âm thanh hợp lệ."
                      : "Đã lưu bài viết, chờ chấm AI hợp lệ."
                    : "Câu trả lời và bản nháp chỉ thuộc tài khoản của bạn."}
            </p>
            <Button
              className="secondary small"
              disabled={
                !!busy ||
                (!active && !part.attemptId) ||
                (!part.attemptId && !canStart(index))
              }
              onClick={() => void start(part.contentId, part.attemptId)}
            >
              {part.attemptId
                ? part.status === "in-progress"
                  ? "Tiếp tục phần này"
                  : "Xem bài và phản hồi"
                : !canStart(index)
                  ? "Chờ đến lịch phần thi"
                  : "Bắt đầu phần này"}
              <ArrowRight size={16} />
            </Button>
            {part.status === "pending-ai" && part.attemptId && (
              <div className="duo-regrade">
                <p className="muted tiny">
                  {part.skill === "speaking"
                    ? "Chấm lại từ bài nói đã lưu. Band Speaking đầy đủ cần bản ghi và phân tích âm thanh thực tế; chỉ chấm bản chép lời bằng AI chưa đủ để nâng band."
                    : health?.services.openai
                      ? "Chấm lại từ bài viết đã lưu. Kết quả mới chỉ được dùng khi chấm thành công."
                      : "Bài đã được lưu. Cần kết nối dịch vụ chấm AI để xác định kết quả nâng band."}
                </p>
                <Button
                  className="secondary small"
                  disabled={!!busy || !health?.services.openai}
                  onClick={() => void regrade(part.attemptId!)}
                >
                  {busy === part.attemptId
                    ? "Đang chấm lại…"
                    : health?.services.openai
                      ? "Yêu cầu chấm lại bài đã lưu"
                      : "Chờ kết nối chấm AI"}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      <div className="row wrap">
        <Link className="button secondary" to="/plan">
          <ArrowLeft size={17} />
          Về lộ trình chung
        </Link>
        {assessment.roomId && (
          <Link
            className="button secondary"
            to={`/duo/rooms/${assessment.roomId}`}
          >
            <Users size={17} />
            Phòng thi chung
          </Link>
        )}
        <Button className="secondary small" onClick={() => void state.reload()}>
          <RefreshCw size={15} />
          Cập nhật kết quả
        </Button>
      </div>
    </div>
  );
}
export function DuoAttemptContext({ attempt }: { attempt: Attempt }) {
  const [params] = useSearchParams();
  const { health } = useSession();
  const lessonId = params.get("duoLesson"),
    assessmentId = attempt.duoAssessmentId || params.get("duoAssessment");
  const assessment = usePolling<{ assessment: DuoAssessmentView }>(
    assessmentId
      ? `/duo/assessments/${encodeURIComponent(assessmentId)}`
      : null,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [completed, setCompleted] = useState(false);
  useRoomHeartbeat(
    assessment.data?.assessment.roomId ?? null,
    attempt.status === "in-progress",
    setError,
  );
  async function complete() {
    if (!lessonId) return;
    setBusy(true);
    setError("");
    try {
      await api(`/duo/lessons/${encodeURIComponent(lessonId)}/complete`, {
        method: "POST",
        body: json({ attemptId: attempt.id }),
      });
      setCompleted(true);
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }
  if (health?.duoEnabled === false || (!lessonId && !assessmentId)) return null;
  return (
    <Card className="duo-attempt-context">
      <div className="row wrap">
        <HeartHandshake size={22} />
        <strong>
          {assessmentId
            ? "Bài làm riêng trong đánh giá Duo"
            : "Buổi học trong lộ trình chung"}
        </strong>
      </div>
      <p>
        {assessmentId
          ? "Nộp bài để máy chủ cập nhật kết quả của bạn. Câu trả lời không được chia sẻ cho bạn đồng hành."
          : completed
            ? "Đã ghi nhận hoàn thành buổi học cho riêng bạn."
            : attempt.status === "submitted"
              ? "Bài đã nộp. Ghi nhận buổi học hoàn thành trong lộ trình chung của bạn."
              : "Hoàn thành bài và nộp, sau đó ghi nhận buổi học. Câu hỏi khách quan cần trả lời ít nhất 80%; Writing cần đủ từng task, Speaking cần bản ghi hoặc câu trả lời đủ dài."}
      </p>
      {error && <ErrorNotice message={error} />}
      <div className="row wrap">
        {lessonId && attempt.status === "submitted" && !completed && (
          <Button
            className="small"
            disabled={busy}
            onClick={() => void complete()}
          >
            <CircleCheck size={16} />
            Ghi nhận hoàn thành buổi học
          </Button>
        )}
        <Link
          className="button secondary small"
          to={assessmentId ? `/duo/assessments/${assessmentId}` : "/plan"}
        >
          <ArrowLeft size={15} />
          {assessmentId ? "Xem các phần đánh giá" : "Về lộ trình chung"}
        </Link>
      </div>
    </Card>
  );
}
