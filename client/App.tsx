import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import {
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { Health, Skill, User } from "../shared/types";
import { api, errorMessage } from "./api";
import { ErrorNotice, Loading, skills } from "./components";
import {
  DashboardPage,
  HistoryPage,
  PlacementPage,
  PracticeHub,
  VocabularyPage,
} from "./pages";
import PracticePage from "./Practice";
import { useDialog } from "./useDialog";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const location = useLocation();
  const bootstrap = async () => {
    setLoading(true);
    setBootstrapError("");
    const [session, status] = await Promise.allSettled([
      api<{ user: User | null }>("/api/auth/me"),
      api<Health>("/api/health"),
    ]);
    if (session.status === "fulfilled") setUser(session.value.user);
    if (status.status === "fulfilled") setHealth(status.value);
    else setBootstrapError(errorMessage(status.reason));
    setLoading(false);
  };
  useEffect(() => {
    void bootstrap();
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  if (loading)
    return (
      <div className="app-loading">
        <Compass size={42} />
        <Loading />
      </div>
    );
  if (bootstrapError)
    return (
      <div className="app-loading">
        <div className="card">
          <ErrorNotice message={bootstrapError} />
          <button className="button" onClick={() => void bootstrap()}>
            Kết nối lại
          </button>
        </div>
      </div>
    );
  if (!user) return <AuthPage onAuthenticated={setUser} health={health} />;
  return (
    <Layout user={user} health={health} onLogout={() => setUser(null)}>
      <Routes>
        <Route
          path="/dashboard"
          element={<DashboardPage user={user} onUserChange={setUser} />}
        />
        <Route
          path="/placement"
          element={
            <PlacementPage
              onProfileRefresh={async () => {
                const result = await api<{ user: User }>("/api/auth/me");
                setUser(result.user);
              }}
            />
          }
        />
        <Route path="/practice" element={<PracticeHub user={user} />} />
        <Route
          path="/practice/:skill"
          element={
            <PracticeRoute user={user} health={health} onUserChange={setUser} />
          }
        />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function PracticeRoute({
  user,
  health,
  onUserChange,
}: {
  user: User;
  health: Health | null;
  onUserChange: (user: User) => void;
}) {
  const { skill } = useParams();
  if (!skills.includes(skill as Skill))
    return <Navigate to="/practice" replace />;
  return (
    <PracticePage
      key={skill}
      skill={skill as Skill}
      user={user}
      health={health}
      onSubmitted={() => {
        void api<{ user: User }>("/api/auth/me")
          .then((result) => onUserChange(result.user))
          .catch(() => undefined);
      }}
    />
  );
}

function AuthPage({
  onAuthenticated,
  health,
}: {
  onAuthenticated: (user: User) => void;
  health: Health | null;
}) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy("form");
    const data = new FormData(event.currentTarget);
    try {
      const result = await api<{ user: User }>(
        `/api/auth/${register ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(
            register
              ? {
                  name: data.get("name"),
                  email: data.get("email"),
                  password: data.get("password"),
                  targetBand: Number(data.get("targetBand") || 7),
                }
              : { email: data.get("email"), password: data.get("password") },
          ),
        },
      );
      onAuthenticated(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };
  const demo = async (learner: 1 | 2) => {
    setError("");
    setBusy(`demo${learner}`);
    try {
      const result = await api<{ user: User }>("/api/auth/demo", {
        method: "POST",
        body: JSON.stringify({ learner }),
      });
      onAuthenticated(result.user);
      navigate("/dashboard");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-story">
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon">
            <Compass size={26} />
          </span>
          <span>
            IELTS <b>Compass</b>
            <small>YOUR WAY FORWARD</small>
          </span>
        </NavLink>
        <div className="auth-story-content">
          <span className="eyebrow">MỖI NGÀY MỘT BƯỚC TIẾN</span>
          <h1>
            Đi đúng hướng.
            <br />
            Chạm <em>mục tiêu.</em>
          </h1>
          <p>
            Một không gian học tập dành riêng cho bạn. Hiểu năng lực, luyện đúng
            kỹ năng, và nhìn thấy sự tiến bộ mỗi ngày.
          </p>
          <div className="auth-visual" aria-hidden="true">
            <div className="compass-ring ring-one" />
            <div className="compass-ring ring-two" />
            <div className="compass-ring ring-three" />
            <span className="compass-n">N</span>
            <div className="compass-needle" />
            <div className="visual-tag tag-a">
              <BookOpen size={18} /> Learn with purpose
            </div>
            <div className="visual-tag tag-b">
              <Target size={18} /> Band 3.0 → 7.0
            </div>
            <span className="visual-star">✳</span>
          </div>
        </div>
        <div className="auth-story-footer">
          <span>
            <Check size={15} /> 4 kỹ năng, 1 hành trình
          </span>
          <span>
            <Check size={15} /> Cá nhân hóa theo trình độ
          </span>
        </div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <span className="badge">
            <Sparkles size={13} /> KHỞI ĐẦU CỦA BẠN
          </span>
          <h2>{register ? "Hành trình mới bắt đầu." : "Chào mừng trở lại."}</h2>
          <p className="muted">
            {register
              ? "Tạo tài khoản và đặt mục tiêu IELTS của bạn."
              : "Đăng nhập để tiếp tục hành trình IELTS của bạn."}
          </p>
          <div className="tabs auth-tabs">
            <button
              className={!register ? "active" : ""}
              onClick={() => {
                setRegister(false);
                setError("");
              }}
            >
              Đăng nhập
            </button>
            <button
              className={register ? "active" : ""}
              onClick={() => {
                setRegister(true);
                setError("");
              }}
            >
              Tạo tài khoản
            </button>
          </div>
          {error && <ErrorNotice message={error} />}
          <form onSubmit={submit} className="auth-form stack">
            {register && (
              <label className="field">
                Tên của bạn
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Bạn muốn được gọi là…"
                />
              </label>
            )}
            <label className="field">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="ban@example.com"
              />
            </label>
            <label className="field">
              Mật khẩu
              <input
                type="password"
                name="password"
                autoComplete={register ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={128}
                placeholder="Ít nhất 8 ký tự"
              />
            </label>
            {register && (
              <label className="field">
                Band mục tiêu
                <select name="targetBand" defaultValue="7">
                  {[3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7].map((band) => (
                    <option key={band} value={band}>
                      {band.toFixed(1)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="button full-width" disabled={busy !== null}>
              {busy === "form"
                ? "Đang kết nối…"
                : register
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
              <ArrowRight size={18} />
            </button>
          </form>
          {health?.demoEnabled !== false && (
            <>
              <div className="divider">
                <span>HOẶC KHÁM PHÁ TRƯỚC</span>
              </div>
              <div className="demo-accounts">
                <button
                  aria-label="Học viên 01"
                  onClick={() => void demo(1)}
                  disabled={busy !== null}
                >
                  <span className="avatar peach">01</span>
                  <span>
                    <strong>Học viên 01</strong>
                    <small>Không gian cá nhân</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
                <button
                  aria-label="Học viên 02"
                  onClick={() => void demo(2)}
                  disabled={busy !== null}
                >
                  <span className="avatar sage">02</span>
                  <span>
                    <strong>Học viên 02</strong>
                    <small>Không gian cá nhân</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          <p className="auth-note">
            <GraduationCap size={16} />{" "}
            {health?.services.openai
              ? "AI đã được cấu hình cho buổi học của bạn."
              : "Chế độ mẫu hoạt động ngay. Lịch sử của hai học viên được lưu riêng."}
          </p>
        </div>
        <p className="auth-copyright">
          IELTS Compass · Học có định hướng, tiến bộ có cơ sở.
        </p>
      </section>
    </div>
  );
}

function Layout({
  user,
  health,
  onLogout,
  children,
}: {
  user: User;
  health: Health | null;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  useDialog(servicesOpen, () => setServicesOpen(false));
  const location = useLocation();
  const links = [
    { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/practice", label: "Luyện kỹ năng", icon: BookOpen },
    { to: "/vocabulary", label: "Sổ từ vựng", icon: GraduationCap },
    { to: "/history", label: "Lịch sử học tập", icon: CalendarDays },
  ];
  const active =
    links.find((link) => location.pathname.startsWith(link.to))?.label ??
    "Kiểm tra đầu vào";
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);
  const logout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
      onLogout();
    } catch (error) {
      setLogoutError(errorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  };
  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <NavLink to="/dashboard" className="brand">
          <span className="brand-icon">
            <Compass size={25} />
          </span>
          <span>
            IELTS <b>Compass</b>
            <small>YOUR WAY FORWARD</small>
          </span>
        </NavLink>
        <button
          className="mobile-close icon-button"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="nav-label">KHÔNG GIAN HỌC TẬP</div>
        <nav aria-label="Điều hướng chính">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {to === "/practice" && <span className="nav-count">4</span>}
            </NavLink>
          ))}
        </nav>
        <div className="nav-label secondary-label">BƯỚC KHỞI ĐẦU</div>
        <NavLink
          to="/placement"
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Flag size={19} />
          <span>Kiểm tra đầu vào</span>
        </NavLink>
        <div className="sidebar-goal">
          <div>
            <Target size={21} />
            <span>MỤC TIÊU CỦA BẠN</span>
          </div>
          <strong>
            {user.targetBand.toFixed(1)}
            <small> IELTS BAND</small>
          </strong>
          <p>
            Một chút kiên trì hôm nay.
            <br />
            Một bước gần hơn ngày mai.
          </p>
          <NavLink to="/dashboard">
            Xem hành trình <ArrowRight size={14} />
          </NavLink>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>Hành trình của riêng bạn</small>
            </div>
          </div>
          <button
            className="logout-button"
            onClick={() => void logout()}
            disabled={loggingOut}
          >
            <LogOut size={17} />
            {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
          </button>
          {logoutError && (
            <p className="logout-error" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Mở menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span className="breadcrumb">
              Không gian học tập<span>/</span>
              <strong>{active}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="today">
              {new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Bangkok",
              }).format(new Date())}
            </span>
            <button
              className="mode-button"
              onClick={() => setServicesOpen(true)}
            >
              <span
                className={`status-dot ${health?.services.openai ? "live" : ""}`}
              />
              {health?.services.openai ? "Đã cấu hình AI" : "Luyện tập mẫu"}
              <ChevronDown size={13} />
            </button>
            <span className="avatar header-avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="app-footer">
          <Compass size={15} />
          <span>IELTS Compass</span>
          <span>Học một chút. Tiến xa hơn.</span>
        </footer>
      </div>
      {servicesOpen && (
        <div className="modal-backdrop" onClick={() => setServicesOpen(false)}>
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="services-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="section-heading">
              <span className="eyebrow">
                <Settings2 size={16} /> KHÔNG GIAN CỦA BẠN
              </span>
              <button
                className="icon-button"
                onClick={() => setServicesOpen(false)}
                aria-label="Đóng trạng thái dịch vụ"
              >
                <X size={20} />
              </button>
            </div>
            <h2 id="services-title">Trạng thái kết nối</h2>
            <p className="muted">
              Bạn luôn có thể luyện tập với học liệu mẫu. Các dịch vụ đã cấu
              hình mở thêm tính năng cá nhân hóa.
            </p>
            <div className="service-list">
              {(
                [
                  {
                    key: "openai",
                    title: "AI học tập",
                    text: "Tạo bài tập, nhận xét bài viết và bản ghi lời nói.",
                  },
                  {
                    key: "elevenlabs",
                    title: "Âm thanh đa giọng",
                    text: "Hội thoại bài nghe được tạo bằng ElevenLabs.",
                  },
                  {
                    key: "azure",
                    title: "Phân tích phát âm",
                    text: "Đánh giá tín hiệu âm thanh bằng Azure Speech.",
                  },
                  {
                    key: "supabase",
                    title: "Đồng bộ tài khoản",
                    text: "Tài khoản đăng ký đồng bộ qua Supabase. Hồ sơ luyện mẫu được lưu riêng trên máy chủ.",
                  },
                ] as const
              ).map((service) => (
                <div key={service.key}>
                  <div>
                    <strong>{service.title}</strong>
                    <p>{service.text}</p>
                  </div>
                  <span
                    className={`badge ${health?.services[service.key] ? "green" : ""}`}
                  >
                    {health?.services[service.key]
                      ? "Đã cấu hình"
                      : "Chưa cấu hình"}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="button full-width"
              onClick={() => setServicesOpen(false)}
            >
              Tiếp tục học <ArrowRight size={17} />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
