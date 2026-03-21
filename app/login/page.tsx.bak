"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";

const DEMO_USERNAME = "ADmin123";
const DEMO_PASSWORD = "888000";

const content = {
  en: {
    brandSub: "Retail Intelligence Platform",
    heroTag: "Smart Retail Operations",
    heroTitle1: "Welcome to the future of",
    heroTitle2: "Retail AI Management",
    heroDesc:
      "Monitor shelves, analyze products, and optimize store performance with AI-powered insights built for modern retail teams.",
    card1Title: "Store Overview",
    card1Desc: "Unified retail visibility",
    card2Title: "AI Detection",
    card2Desc: "Fast shelf recognition",
    card3Title: "Analytics",
    card3Desc: "Actionable performance data",
    welcome: "Welcome Back",
    signIn: "Sign in to your account",
    signInDesc: "Access your retail dashboard and AI monitoring tools.",
    username: "Username",
    usernamePlaceholder: "Enter your username",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    remember: "Remember me",
    forgot: "Forgot password?",
    button: "Sign In",
    contactText: "Need access for your retail team?",
    contactLink: "Contact administrator",
    langLabel: "Language",
    success: "Login successful. Redirecting...",
    error: "Invalid username or password.",
    demoHint: "Demo account is enabled for local testing.",
  },
  vi: {
    brandSub: "Nền tảng trí tuệ bán lẻ",
    heroTag: "Vận hành bán lẻ thông minh",
    heroTitle1: "Chào mừng đến với tương lai của",
    heroTitle2: "Quản lý AI ngành bán lẻ",
    heroDesc:
      "Giám sát kệ hàng, phân tích sản phẩm và tối ưu hiệu suất cửa hàng với các thông tin chuyên sâu được hỗ trợ bởi AI dành cho đội ngũ bán lẻ hiện đại.",
    card1Title: "Tổng quan cửa hàng",
    card1Desc: "Theo dõi toàn bộ hệ thống bán lẻ",
    card2Title: "Nhận diện AI",
    card2Desc: "Nhận diện kệ hàng nhanh chóng",
    card3Title: "Phân tích dữ liệu",
    card3Desc: "Dữ liệu hành động rõ ràng",
    welcome: "Chào mừng trở lại",
    signIn: "Đăng nhập vào tài khoản",
    signInDesc: "Truy cập bảng điều khiển bán lẻ và công cụ giám sát AI.",
    username: "Tên đăng nhập",
    usernamePlaceholder: "Nhập tên đăng nhập",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    remember: "Ghi nhớ đăng nhập",
    forgot: "Quên mật khẩu?",
    button: "Đăng nhập",
    contactText: "Cần quyền truy cập cho đội ngũ bán lẻ?",
    contactLink: "Liên hệ quản trị viên",
    langLabel: "Ngôn ngữ",
    success: "Đăng nhập thành công. Đang chuyển trang...",
    error: "Sai tên đăng nhập hoặc mật khẩu.",
    demoHint: "Tài khoản demo đang được bật để kiểm tra local.",
  },
  zh: {
    brandSub: "零售智能平台",
    heroTag: "智能零售运营",
    heroTitle1: "欢迎来到",
    heroTitle2: "零售 AI 管理的未来",
    heroDesc:
      "借助 AI 驱动的洞察，监控货架、分析商品并优化门店表现，为现代零售团队提供高效工具。",
    card1Title: "门店概览",
    card1Desc: "统一零售可视化",
    card2Title: "AI 识别",
    card2Desc: "快速识别货架商品",
    card3Title: "数据分析",
    card3Desc: "可执行的绩效数据",
    welcome: "欢迎回来",
    signIn: "登录您的账户",
    signInDesc: "访问您的零售仪表板和 AI 监控工具。",
    username: "用户名",
    usernamePlaceholder: "请输入用户名",
    password: "密码",
    passwordPlaceholder: "请输入密码",
    remember: "记住我",
    forgot: "忘记密码？",
    button: "登录",
    contactText: "需要为您的零售团队开通访问权限？",
    contactLink: "联系管理员",
    langLabel: "语言",
    success: "登录成功。正在跳转...",
    error: "用户名或密码错误。",
    demoHint: "当前已启用本地测试演示账户。",
  },
} as const;

type Language = keyof typeof content;
type Device = "desktop" | "tablet" | "mobile";
type Translation = (typeof content)[Language];

type ToggleProps = {
  activeLanguage: Language;
  onChange: Dispatch<SetStateAction<Language>>;
};

type AuthCardProps = ToggleProps & {
  t: Translation;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  message: string;
  isError: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type MessageBannerProps = {
  text: string;
  isError: boolean;
};

type HeroPanelProps = {
  t: Translation;
};

type PreviewToolbarProps = {
  device: Device;
  onChange: Dispatch<SetStateAction<Device>>;
};

type PreviewSurfaceProps = {
  device: Device;
  children: ReactNode;
};

type LoginExperienceProps = {
  device: Device;
  t: Translation;
  activeLanguage: Language;
  onChangeLanguage: Dispatch<SetStateAction<Language>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  message: string;
  isError: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function LoginPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("vi");
  const [device, setDevice] = useState<Device>("desktop");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const t = useMemo(() => content[language], [language]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setIsError(false);
      setMessage(t.success);

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);

      return;
    }

    setIsError(true);
    setMessage(t.error);
  };

  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="space-y-6">
        <div className="px-4 py-6 sm:px-6 lg:px-10">
          <PreviewToolbar device={device} onChange={setDevice} />
        </div>

        <PreviewSurface device={device}>
          <LoginExperience
            device={device}
            t={t}
            activeLanguage={language}
            onChangeLanguage={setLanguage}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            message={message}
            isError={isError}
            onSubmit={handleSubmit}
          />
        </PreviewSurface>

        <div className="px-4 pb-8 sm:px-6 lg:px-10">
          <ProjectShowcase />
        </div>
      </div>
    </div>
  );
}

function LoginExperience({
  device,
  t,
  activeLanguage,
  onChangeLanguage,
  username,
  setUsername,
  password,
  setPassword,
  message,
  isError,
  onSubmit,
}: LoginExperienceProps) {
  const frameStyles =
    device === "desktop"
      ? "rounded-none border-none shadow-none"
      : "rounded-[40px] border border-slate-200 shadow-[0_40px_120px_rgba(15,23,42,0.25)]";

  return (
    <div
      className={`grid min-h-[720px] overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 lg:grid-cols-2 ${frameStyles}`}
    >
      <HeroPanel t={t} />

      <div className="flex items-center justify-center px-6 py-10 sm:px-10">
        <AuthCard
          t={t}
          activeLanguage={activeLanguage}
          onChange={onChangeLanguage}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          message={message}
          isError={isError}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

function PreviewToolbar({ device, onChange }: PreviewToolbarProps) {
  const options: { label: string; value: Device }[] = [
    { label: "Máy tính", value: "desktop" },
    { label: "Máy tính bảng", value: "tablet" },
    { label: "Điện thoại", value: "mobile" },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Mẫu đăng nhập</p>
        <p className="text-lg font-semibold text-slate-900">ShelfSight AI • ID #19979</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="text-sm font-medium text-slate-500">Chọn thiết bị:</span>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1">
          {options.map((option) => {
            const isActive = option.value === device;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <a
          href="/login"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-cyan-600 transition hover:border-cyan-200 hover:bg-cyan-50"
        >
          Bỏ khung
        </a>
      </div>
    </div>
  );
}

function PreviewSurface({ device, children }: PreviewSurfaceProps) {
  const devicePresets: Record<Device, string> = {
    desktop: "w-full",
    tablet: "w-[1024px] max-w-full",
    mobile: "w-[480px] max-w-full",
  };

  const alignment = device === "desktop" ? "" : "mx-auto";

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-full">
        <div className={`${alignment} transition-all duration-500 ${devicePresets[device]}`}>{children}</div>
      </div>
    </div>
  );
}

function ProjectShowcase() {
  const photos = [
    {
      src: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
      alt: "Nhân viên kiểm tra sản phẩm trên quầy kệ",
      title: "Chuỗi bán lẻ hiện đại",
    },
    {
      src: "https://images.unsplash.com/photo-1515165562835-c4c1bfa1c38a?auto=format&fit=crop&w=900&q=80",
      alt: "Ảnh chụp lối đi trong siêu thị",
      title: "Dữ liệu kệ hàng thời gian thực",
    },
    {
      src: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=900&q=80",
      alt: "Khách hàng lựa chọn sản phẩm",
      title: "Trải nghiệm mua sắm liền mạch",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur lg:p-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-5/12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Giới thiệu dự án</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">Storescope AI • Shelby</h3>
          <p className="mt-3 text-slate-600">
            Nền tảng phân tích bán lẻ giúp đội vận hành giám sát quầy kệ qua AI, theo dõi giá bán theo thời gian thực
            và kích hoạt các chiến dịch tăng trưởng nhanh hơn. Giao diện đăng nhập mới mô phỏng cách 123Website trưng bày
            mẫu, giúp bạn trình diễn trải nghiệm đa thiết bị với một cú nhấp.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-cyan-500">●</span>
              Dashboard đa retailer với biểu đồ động, dữ liệu giá cập nhật liên tục.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-cyan-500">●</span>
              Module AI nhận diện kệ hàng, flag lệch chuẩn tồn kho chỉ trong vài giây.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-cyan-500">●</span>
              Hệ thống phân quyền & onboarding nhanh cho toàn bộ đội ngũ cửa hàng.
            </li>
          </ul>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Khám phá dashboard
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="lg:w-7/12">
          <div className="grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => (
              <div
                key={photo.src}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 shadow-md shadow-slate-900/5"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent p-4">
                    <p className="text-sm font-semibold text-white">{photo.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroPanel({ t }: HeroPanelProps) {
  return (
    <div className="relative hidden min-h-full overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=80"
          alt="Retail AI Banner"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-blue-900/70" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-slate-900 shadow-2xl shadow-cyan-500/30 ring-1 ring-white/20">
            <div className="absolute inset-1 rounded-[20px] border border-white/20" />
            <div className="relative text-2xl font-black text-white">S</div>
            <div className="absolute -right-1 -top-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-900 shadow">
              AI
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
                Shelf<span className="text-cyan-300">Sight</span>
              </h1>
              <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200 backdrop-blur">
                AI
              </span>
            </div>

            <p className="mt-1 text-sm font-medium uppercase tracking-[0.18em] text-slate-300">
              {t.brandSub}
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">{t.heroTag}</p>
          <h2 className="mb-6 text-5xl font-bold leading-tight">
            {t.heroTitle1}
            <span className="block text-cyan-300">{t.heroTitle2}</span>
          </h2>
          <p className="max-w-lg text-lg leading-8 text-slate-200">{t.heroDesc}</p>
        </div>
      </div>

      <div className="relative z-10 grid gap-4 sm:grid-cols-3">
        <HeroStat icon="🏬" title={t.card1Title} description={t.card1Desc} />
        <HeroStat icon="📷" title={t.card2Title} description={t.card2Desc} />
        <HeroStat icon="📊" title={t.card3Title} description={t.card3Desc} />
      </div>
    </div>
  );
}

function HeroStat({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <div className="mb-3 text-2xl text-cyan-300">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-slate-300">{description}</p>
    </div>
  );
}

function AuthCard({
  t,
  activeLanguage,
  onChange,
  username,
  setUsername,
  password,
  setPassword,
  message,
  isError,
  onSubmit,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center lg:hidden">
        <h1 className="text-3xl font-bold text-slate-900">ShelfSight AI</h1>
        <p className="mt-2 text-slate-600">{t.brandSub}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6">
          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t.langLabel}
          </label>
          <LanguageToggle activeLanguage={activeLanguage} onChange={onChange} />
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-600">{t.welcome}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{t.signIn}</h2>
          <p className="mt-2 text-sm text-slate-500">{t.signInDesc}</p>
          <p className="mt-2 text-xs text-slate-400">{t.demoHint}</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{t.username}</label>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t.usernamePlaceholder}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </div>

          {message && <MessageBanner text={message} isError={isError} />}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="rounded" />
              {t.remember}
            </label>
            <a href="#" className="font-medium text-cyan-600 hover:text-cyan-700">
              {t.forgot}
            </a>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.button}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t.contactText}{" "}
          <Link href="#" className="font-semibold text-cyan-600 hover:text-cyan-700">
            {t.contactLink}
          </Link>
        </p>
      </div>
    </div>
  );
}

function LanguageToggle({ activeLanguage, onChange }: ToggleProps) {
  const languages: Language[] = ["en", "vi", "zh"];

  return (
    <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
      {languages.map((languageKey) => {
        const isActive = activeLanguage === languageKey;
        const label =
          languageKey === "en" ? "English" : languageKey === "vi" ? "Tiếng Việt" : "中文";

        return (
          <button
            key={languageKey}
            type="button"
            onClick={() => onChange(languageKey)}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MessageBanner({ text, isError }: MessageBannerProps) {
  const styles = isError
    ? "border-red-200 bg-red-50 text-red-700"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles}`}>{text}</div>
  );
}
