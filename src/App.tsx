// src/App.tsx
import { useState, useEffect, useRef } from "react";
import { UNITS } from "./data/units";
import type { UnitConfig, UnitId, MCQ } from "./types";
import { useProgress } from "./state/progress";
import { makeVocabMCQ } from "./lib/questionGen";
import type { BadgeTier } from "./state/progress";
import { TabButton, Card, SectionTitle } from "./components/ui";
import VocabSet from "./components/VocabSet";
import VocabQuiz from "./components/VocabQuiz";
import GrammarExplain from "./components/GrammarExplain";
import ReorderSentenceGame from "./components/ReorderSentenceGame";
import StoryViewer from "./components/StoryViewer";
import ArrangeSentencesGame from "./components/ArrangeSentencesGame";
import BadgesView, {
  BADGE_META,
  TIER_NAMES,
  TIER_ICONS,
} from "./components/BadgesView";
// 挑戰
import ChallengeRun from "./components/ChallengeRun";
import type { RunReport } from "./components/ChallengeRun";

import SnakeChallenge from "./components/SnakeChallenge";
import type { SnakeReport } from "./components/SnakeChallenge";

// 固定 JSON 題庫（Unit 1 · Level 1）
// 若 tsconfig 已開 resolveJsonModule，下面可直接 import；否則加 // @ts-ignore
// @ts-ignore
import level1 from "./data/challenges/unit-1/level-1.json";

// @ts-ignore 題目設定好之後開啟
import level2 from "./data/challenges/unit-1/level-2.json";
// @ts-ignore
import level3 from "./data/challenges/unit-1/level-3.json";
// @ts-ignore
import level4 from "./data/challenges/unit-1/level-4.json";
// @ts-ignore
import level5 from "./data/challenges/unit-1/level-5.json";
import level6 from "./data/challenges/unit-1/level-6.json";
import level7 from "./data/challenges/unit-1/level-7.json";
import level8 from "./data/challenges/unit-1/level-8.json";
import level9 from "./data/challenges/unit-1/level-9.json";
import level10 from "./data/challenges/unit-1/level-10.json";
import { useAuth } from "./state/AuthContext"; // <-- 匯入 useAuth
import { supabase } from "./supabaseClient"; // <-- 匯入 supabase client
import ProfileSetup from "./components/ProfileSetup";
import Leaderboard from "./components/Leaderboard";
import { logLSAEvent } from "./lib/analytics";
import { LsaState } from "./lib/lsa-states";
/* -----------------------------
   類型（僅供本檔使用）
------------------------------ */
type Tab = "learn" | "challenge" | "badges" | "leaderboard";
type LearnSubTab = "vocab" | "grammar" | "text" | null;
type VocabView = "set" | "quiz" | "snake";
type GrammarView = "explain" | "reorder";
type TextView = "story" | "arrange";
type ChallengeMode = "select" | "play";

type ChallengeItemResult = {
  id?: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  pickedIndex: number | null;
  correct: boolean;
  explain?: string;
  tag?: string;
};

const fixedU1L1: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level1;
/* 預先載入，避免每次切換關卡才載入*/
const fixedU1L2: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level2;
const fixedU1L3: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level3;
const fixedU1L4: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level4;
const fixedU1L5: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level5;
const fixedU1L6: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level6;
const fixedU1L7: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level7;
const fixedU1L8: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level8;
const fixedU1L9: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level9;
const fixedU1L10: {
  meta?: { time?: number; title?: string };
  questions: MCQ[];
} = level10;

/* -----------------------------
   星等 / 解鎖規則
------------------------------ */
function computeLevelStars(score: number) {
  // 10/7/4 → 3★/2★/1★
  if (score >= 10) return 3;
  if (score >= 7) return 2;
  if (score >= 4) return 1;
  return 0;
}
function calcUnlockedCount(
  levels: Record<number, { stars: number; passed?: boolean }> | undefined,
  totalLevels: number,
) {
  let unlocked = 1;
  for (let lv = 1; lv <= totalLevels; lv++) {
    const info = levels?.[lv];
    const passed = info?.passed === true;
    const enoughStars = (info?.stars ?? 0) >= 2;
    if (passed || enoughStars) {
      unlocked = Math.min(totalLevels, lv + 1);
    } else {
      break;
    }
  }
  return unlocked;
}

/* -----------------------------
   關卡選單
------------------------------ */
function LevelGrid({
  total = 10,
  unlockedCount,
  starsByLevel,
  onPick,
}: {
  total?: number;
  unlockedCount: number;
  starsByLevel: number[];
  onPick: (level: number) => void;
}) {
  return (
    <Card>
      <SectionTitle title="選擇關卡 (每單元 10 關)" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: total }, (_, i) => {
          const lv = i + 1;
          const unlocked = lv <= Math.max(1, unlockedCount);
          const stars = starsByLevel[i] ?? 0;
          return (
            <button
              key={lv}
              disabled={!unlocked}
              onClick={() => onPick(lv)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden group ${
                unlocked
                  ? "bg-white hover:bg-neutral-50 hover:-translate-y-1 hover:shadow-lg border-neutral-200"
                  : "bg-neutral-100/50 text-neutral-400 cursor-not-allowed border-neutral-200/50 backdrop-blur-sm"
              }`}
            >
              {!unlocked && (
                <div className="absolute inset-0 bg-neutral-200/20 backdrop-grayscale-[0.5] z-0 flex items-center justify-center">
                  <span className="text-2xl opacity-20 transform -rotate-12">
                    🔒
                  </span>
                </div>
              )}
              {unlocked && stars === 3 && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/40 transition-colors"></div>
              )}
              <div className="relative z-10 flex flex-col h-full justify-between gap-2">
                <div
                  className={`text-xs font-bold tracking-wider ${unlocked ? "text-indigo-600" : "text-neutral-400"}`}
                >
                  LEVEL {lv}
                </div>
                <div className="text-sm flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <span
                      key={idx}
                      className={
                        idx < stars
                          ? "text-yellow-400 drop-shadow-[0_1px_3px_rgba(250,204,21,0.5)] text-lg"
                          : "text-neutral-200 text-lg"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* -----------------------------
   小工具
------------------------------ */
const letter = (i: number) => String.fromCharCode(65 + i);

/* -----------------------------
   結算 Modal（無「摘要」區塊）
------------------------------ */
function ResultModal({
  open,
  onClose,
  title,
  score,
  total,
  stars,
  timeUsed,
  passed,
  items,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  score: number;
  total: number;
  stars: number;
  timeUsed: number;
  passed: boolean;
  items: ChallengeItemResult[];
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[61] w-[min(92vw,800px)] max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="px-5 py-4 border-b flex items-start justify-between">
          <div>
            <div className="text-xs text-neutral-500">挑戰完成</div>
            <div className="text-lg font-semibold">{title}</div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm bg-neutral-100 hover:bg-neutral-200"
          >
            關閉
          </button>
        </div>

        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="col-span-1 md:col-span-2 rounded-xl border p-4">
            <div className="text-sm text-neutral-500 mb-1">本輪星等</div>
            <div className="text-2xl">
              {"⭐".repeat(stars)}
              {"☆".repeat(3 - stars)}
            </div>
            <div className="mt-2 text-sm">
              分數：<span className="font-semibold">{score}</span> / {total}
            </div>
            <div className="text-sm">
              時間：<span className="font-semibold">{timeUsed}s</span>
            </div>
            <div className="mt-1 text-sm">
              通過：{passed ? "✅ 是" : "❌ 否"}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="text-sm text-neutral-500 mb-2">每題詳解</div>
          <div className="overflow-y-auto max-h-[48vh] pr-1">
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-neutral-600 p-4 rounded-xl border bg-neutral-50">
                  本關為非選擇題或未提供詳解。
                </div>
              ) : (
                items.map((it, i) => {
                  const picked =
                    it.pickedIndex === null
                      ? "（未作答）"
                      : `${letter(it.pickedIndex)}. ${
                          it.choices[it.pickedIndex]
                        }`;
                  /*const correct = `${letter(it.correctIndex)}. ${
                    it.choices[it.correctIndex]
                  }`;*/
                  return (
                    <div
                      key={it.id ?? `i-${i}`}
                      className="rounded-xl border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">
                          {i + 1}. {it.prompt}
                        </div>
                        <div
                          className={`text-sm ${
                            it.correct ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {it.correct ? "✔️ 正確" : "❌ 錯誤"}
                        </div>
                      </div>
                      <div className="mt-1 text-sm">
                        你的作答：<span className="font-medium">{picked}</span>
                      </div>
                      {/*<div className="text-sm">
                        參考答案：<span className="font-medium">{correct}</span>
                      </div>*/}
                      {it.explain && (
                        <div className="mt-1 text-sm text-neutral-700">
                          提示：{it.explain}
                        </div>
                      )}
                      {it.tag && (
                        <div className="mt-1 text-xs text-neutral-500">
                          分類：{it.tag}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// 【登入元件】
// 直接用這段覆蓋你現在的 AuthGate 定義即可
function AuthGate() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();

    if (mode === "signup") {
      if (password.length < 6) {
        setError("密碼至少需 6 個字元。");
        return;
      }
      if (password !== confirm) {
        setError("兩次輸入的密碼不一致。");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // 使用你的站點網址作為驗證後回跳位置
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        setMessage("註冊成功！請到信箱完成驗證，再回來登入。");
        setMode("signin");
        setPassword("");
        setConfirm("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // 成功登入後，外層的 AuthProvider / onAuthStateChange 會接手，頁面會自動切到主介面
      }
    } catch (err: any) {
      // 常見：Invalid login credentials / Email not confirmed 等
      const msg =
        err?.message || err?.error_description || "發生未知錯誤，請稍後再試。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    resetMessages();
    if (!email) {
      setError("請先在上方輸入要重設密碼的 Email。");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setMessage("已寄出重設密碼信件，請至信箱查看。");
    } catch (err: any) {
      const msg =
        err?.message || err?.error_description || "寄送失敗，請稍後再試。";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    resetMessages();
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* 裝飾性背景光暈 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div
        className="absolute top-1/2 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="w-full max-w-sm p-8 space-y-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 relative z-10 transition-all duration-300">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white font-bold text-2xl">
            L
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-700">
            {mode === "signin"
              ? "登入 A++會考英文總複習"
              : "註冊 A++會考英文總複習"}
          </h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">
            {mode === "signin"
              ? "請輸入 Email 與密碼以登入。"
              : "請輸入 Email 與密碼以建立帳號。"}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              密碼
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={mode === "signup" ? "至少 6 個字元" : "請輸入密碼"}
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-neutral-500 hover:text-neutral-700"
                aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
              >
                {showPassword ? "隱藏" : "顯示"}
              </button>
            </div>
            {mode === "signup" && (
              <p className="text-xs text-neutral-500">
                建議包含大小寫字母與數字，提升安全性。
              </p>
            )}
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">
                確認密碼
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="請再次輸入密碼"
                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? "處理中..." : mode === "signin" ? "登入" : "建立帳號"}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={switchMode}
            className="text-neutral-700 hover:underline"
          >
            {mode === "signin" ? "沒有帳號？前往註冊" : "已有帳號？前往登入"}
          </button>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="text-neutral-500 hover:underline disabled:opacity-50"
            title="會寄送重設密碼連結至上方 Email"
          >
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   App
------------------------------ */
export default function App() {
  const { session, profile, loading } = useAuth();

  // ✅ 只有「還沒拿到 session」且「正在載入」時才顯示讀取中
  // 這樣 Supabase 背景 refresh（loading短暫=true）就不會把 LearningQuestApp 卸載掉
  if (loading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        讀取中...
      </div>
    );
  }

  // ✅ 沒 session = 一律回登入
  if (!session) {
    return <AuthGate />;
  }

  // ✅ 有 session，但 profile 還在載入中時：不要提早切到 ProfileSetup（避免 unmount）
  // 等 loading 結束後，確認真的沒 full_name 才去 ProfileSetup
  if (!loading && !profile?.full_name) {
    return <ProfileSetup />;
  }

  // ✅ 正常顯示主程式（背景 refresh 時仍保留畫面與 tab state）
  return <LearningQuestApp />;
}
function LearningQuestApp() {
  // 頁籤 / 視圖狀態
  const { signOut, user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>("learn");
  const [unitId] = useState<UnitId>(1);
  const [sub, setSub] = useState<LearnSubTab>(null);
  const [vocabView, setVocabView] = useState<VocabView>("set");
  const [grammarView, setGrammarView] = useState<GrammarView>("explain");
  const [textView, setTextView] = useState<TextView>("story");

  // 進入 learn 分頁的時間（毫秒 timestamp）
  const [learnEnterAt, setLearnEnterAt] = useState<number | null>(null);

  // 挑戰區
  const [mode, setMode] = useState<ChallengeMode>("select");
  const [level, setLevel] = useState(1);

  // 資料與進度
  const unit: UnitConfig = UNITS.find((u) => u.id === unitId)!;
  const {
    progress,
    addXP,
    patchUnit,
    reportActivity,
    reportGrammarTetris,
    reset,
    upsertBadgePlan, // ✅ 新增
    retireBadgePlan, // ✅ 新增
    reflectBadgePlan, // ✅ 新增
    reportChallengeRun,
  } = useProgress();

  // 🔔 獎章解鎖提示 queue
  const [badgeToasts, setBadgeToasts] = useState<
    { id: string; key: string; tier: BadgeTier; unlockedAt: string }[]
  >([]);

  // 用來管理計時器，避免記憶體洩漏
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  // 1. 監聽新事件並加入 Toast 列表
  useEffect(() => {
    const events = progress.lastBadgeEvents ?? [];
    if (!events.length) return;

    // ✅ 不再用 seenBadgeEventIds 過濾，每次都顯示（因為 lastBadgeEvents 只在新獲得時才有值）
    const newToasts = events.map((ev, idx) => ({
      id: `${ev.key}-${ev.tier}-${ev.unlockedAt}-${idx}-${Date.now()}`,
      key: ev.key,
      tier: ev.tier,
      unlockedAt: ev.unlockedAt,
    }));

    setBadgeToasts((prev) => [...prev, ...newToasts]);

    newToasts.forEach((toast) => {
      const timerId = setTimeout(() => {
        setBadgeToasts((prev) => prev.filter((t) => t.id !== toast.id));
        timersRef.current.delete(timerId);
      }, 3500);

      timersRef.current.add(timerId);
    });
  }, [progress.lastBadgeEvents]); // ✅ 改這裡

  // 2. 元件卸載時的清理 (Cleanup)
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const uProg = progress.byUnit[unitId];
  // ✅ 監聽 grammar-tetris-report 事件，交給 progress 判斷是否要頒發 SUPER_GRAMMAR_EXPERT
  useEffect(() => {
    const onReport = (e: Event) => {
      const { detail } = e as CustomEvent<any>;
      if (!detail) return;

      reportGrammarTetris(detail);

      // ✨ 改用專屬的 TETRIS_GAME_END
      logLSAEvent(user?.id, profile?.full_name, LsaState.TETRIS_GAME_END, {
        reason: detail.reason,
        score: detail.score,
        wrongCount: detail.wrongCount,
        roundsPlayed: detail.roundsPlayed,
        wrongItems: detail.wrongItems, // 記錄排錯的句子
        correctItems: detail.correctItems, // 記錄排對的句子
      });
    };
    window.addEventListener(
      "learning-quest:grammar-tetris-report",
      onReport as EventListener,
    );
    return () =>
      window.removeEventListener(
        "learning-quest:grammar-tetris-report",
        onReport as EventListener,
      );
  }, [reportGrammarTetris, user?.id, profile?.full_name]); // 🌟 記得補 dependency
  // 在「學習區 tab」待久一點，算一次 longSessions
  useEffect(() => {
    if (tab === "learn") {
      // 剛切到 learn，開始計時
      if (!learnEnterAt) {
        setLearnEnterAt(Date.now());
      }
    } else {
      // 離開 learn，如果有待過一段時間，就記錄一次 longSessions
      if (learnEnterAt) {
        const stayMs = Date.now() - learnEnterAt;
        const stayMinutes = stayMs / 1000 / 60;
        if (stayMinutes >= 20) {
          // 待滿 20 分鐘就 +1（你可以改成 10 分鐘）
          reportActivity({ longSessions: 1 });
        }
        setLearnEnterAt(null);
      }
    }
  }, [tab, learnEnterAt, reportActivity]);
  /*
  // 監聽貪吃蛇成績，達 78 分即頒發 SNAKE_KING
  useEffect(() => {
    const onSnake = (e: Event) => {
      const { detail } = e as CustomEvent<{ correct: number; total: number }>;
      if (!detail) return;
      if (detail.correct >= 78) {
        awardBadge("SNAKE_KING");
        console.log("[badge] SNAKE_KING unlocked via snake-report:", detail);
      }
    };
    window.addEventListener(
      "learning-quest:snake-report",
      onSnake as EventListener
    );
    return () =>
      window.removeEventListener(
        "learning-quest:snake-report",
        onSnake as EventListener
      );
  }, [awardBadge]);*/

  // 關卡星數（顯示在選單上）
  const starsByLevel = Array.from(
    { length: 10 },
    (_, i) => uProg.challenge.levels?.[i + 1]?.stars ?? 0,
  );
  const unlockedCount = calcUnlockedCount(uProg.challenge.levels, 10);

  // 結算 modal 狀態（使用「本輪星等」）
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    title: string;
    score: number;
    total: number;
    stars: number;
    timeUsed: number;
    passed: boolean;
    items: ChallengeItemResult[];
  } | null>(null);
  const [pendingNextLevel, setPendingNextLevel] = useState<number | null>(null);

  // —— 結算與進度寫回 —— //
  function handleChallengeFinish(
    score: number,
    timeUsed: number,
    report?: RunReport,
  ) {
    const itemsFromRun = (report?.items ?? []).map((it: any) => ({
      ...it,
      correct: typeof it.correct === "boolean" ? it.correct : !!it.isCorrect,
    }));

    const starsThisRun = computeLevelStars(score);
    const passed = starsThisRun >= 2;
    // ✅ 取得至少 1★ 才記秒數（防止 0★ 刷「極速傳說」）
    const recordTime = starsThisRun >= 1;
    const prevLv = uProg.challenge.levels?.[level];
    // 成績進步很多（這裡定義：比之前最佳高 3 分以上）
    const improvedALot = prevLv && score - prevLv.bestScore >= 3;
    // 險勝：剛好及格（例如 7 分）
    const isCloseCall = passed && score === 7;
    // 長時間專注（>= 20 分鐘）
    const isLongSession = timeUsed >= 1200;

    // === 回報統計，讓獎章系統運作 ===
    reportActivity({
      isGame: true,
      gamesPlayed: 1,
      totalTimeSec: timeUsed,
      perfectRuns: score === 10 ? 1 : 0,
      failedChallenges: !passed ? 1 : 0,
      comebackRuns: improvedALot ? 1 : 0,
      closeCalls: isCloseCall ? 1 : 0,
      longSessions: isLongSession ? 1 : 0, // 長時間挑戰也算一次 longSessions
      totalErrors: Math.max(0, 10 - score),
    });
    // 🌟 新增這行：將挑戰結果獨立傳給 SRL 系統，精準攔截「極速傳說」的秒數！
    reportChallengeRun({ score, timeUsed, stars: starsThisRun });
    // === 原本的進度更新邏輯 ===
    const newLv = {
      bestScore: Math.max(prevLv?.bestScore ?? 0, score),
      // ✅ 只有及格（>=1★）才更新秒數；不及格就沿用舊紀錄（或 0）
      bestTimeSec: recordTime
        ? prevLv?.bestTimeSec
          ? Math.min(prevLv.bestTimeSec, timeUsed)
          : timeUsed
        : (prevLv?.bestTimeSec ?? 0),

      stars: Math.max(prevLv?.stars ?? 0, starsThisRun),
      passed: prevLv?.passed === true ? true : passed,
    };

    const bestScore = Math.max(uProg.challenge.bestScore, score);
    const bestTime = recordTime
      ? uProg.challenge.bestTimeSec === 0
        ? timeUsed
        : Math.min(uProg.challenge.bestTimeSec, timeUsed)
      : uProg.challenge.bestTimeSec;

    const nextLevels = { ...(uProg.challenge.levels || {}), [level]: newLv };
    const nextUnlocked = calcUnlockedCount(nextLevels, 10);
    const nextCleared = Math.max(
      uProg.challenge.clearedLevels,
      nextUnlocked - 1,
    );

    patchUnit(unitId, {
      challenge: {
        clearedLevels: nextCleared,
        bestTimeSec: bestTime,
        bestScore,
        levels: nextLevels,
      },
    });

    addXP(unitId, score * 2);

    setModalData({
      title: `Unit ${unitId} · Level ${level}`,
      score,
      total: report?.items?.length ?? 10,
      stars: starsThisRun,
      timeUsed,
      passed,
      items: itemsFromRun,
    });
    setPendingNextLevel(nextUnlocked);
    setModalOpen(true);
  }

  function closeResultModal() {
    setModalOpen(false);
    // 回關卡選單並預選「下一個可玩的關卡」
    setMode("select");
    if (pendingNextLevel) setLevel(pendingNextLevel);
    setPendingNextLevel(null);
  }

  return (
    <div className="min-h-screen text-neutral-900 relative">
      {/* Header */}

      <header className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-20">
        <div className="flex items-center gap-3">
          <div className="min-w-[3.5rem] h-12 px-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg text-white font-extrabold text-lg sm:text-xl leading-none tracking-tight flex-shrink-0">
            A++
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              會考英文總複習
            </div>
            <div className="text-sm font-medium text-neutral-500/80">
              取得獎章、登上排行榜！想辦法全破挑戰區吧！　
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          <TabButton
            active={tab === "learn"}
            onClick={() => {
              logLSAEvent(user?.id, profile?.full_name, LsaState.NAV_LEARN);
              setTab("learn");
              setSub(null);
            }}
          >
            學習區
          </TabButton>
          <TabButton
            active={tab === "challenge"}
            onClick={() => {
              logLSAEvent(user?.id, profile?.full_name, LsaState.NAV_CHALLENGE);
              setTab("challenge");
            }}
          >
            挑戰區
          </TabButton>
          <TabButton
            active={tab === "badges"}
            onClick={() => {
              logLSAEvent(user?.id, profile?.full_name, LsaState.NAV_BADGES);
              setTab("badges");
            }}
          >
            獎章區
          </TabButton>
          <TabButton
            active={tab === "leaderboard"}
            onClick={() => {
              logLSAEvent(
                user?.id,
                profile?.full_name,
                LsaState.NAV_LEADERBOARD,
              );
              setTab("leaderboard");
            }}
          >
            排行榜
          </TabButton>{" "}
          {/* ✅ 新增登出 */}
          <button
            onClick={async () => {
              await signOut();
            }}
            className="px-4 py-2 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-sm font-medium text-rose-600 transition-all flex-shrink-0"
            title="實驗或共用電腦建議一定要登出"
          >
            登出
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10">
        {/* HUD */}
        {/* 將 md:grid-cols-3 改為 md:grid-cols-2 讓剩下的兩張卡片平均分配空間 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
          <Card className="flex flex-col justify-center">
            <div className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>{" "}
              目前單元
            </div>
            <div className="text-xl font-bold text-neutral-800">
              {unit.title}
            </div>
          </Card>
          <Card className="flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl group-hover:bg-yellow-400/30 transition-colors"></div>
            <div className="text-sm font-medium text-neutral-500 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span>{" "}
              本單元 XP
            </div>
            <div className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-yellow-500 to-orange-500 drop-shadow-sm">
              {uProg.xp}
            </div>
            <div className="text-xs font-medium text-neutral-400 mt-1">
              總 XP：{progress.totalXP}
            </div>
          </Card>
          {/*<Card className="flex flex-col justify-center">
            <div className="text-sm font-medium text-neutral-500 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>{" "}
              快捷
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white/50 hover:bg-white text-sm font-medium text-neutral-600 transition-all hover:shadow-sm"
              >
                重置進度
              </button>
              <button
                onClick={() =>
                  alert("請在 data/units.ts 中替換成你的題庫即可擴充 6 單元。")
                }
                className="px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white/50 hover:bg-white text-sm font-medium text-neutral-600 transition-all hover:shadow-sm"
              >
                如何擴充？
              </button>
            </div>
          </Card>*/}
        </div>

        {/* 單元選擇 */}
        {/*         <Card>
          <SectionTitle title={`選擇單元 (共 ${UNITS.length})`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {UNITS.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setUnitId(u.id);
                  if (tab === "challenge") {
                    setMode("select");
                    const unlockedForThisUnit = calcUnlockedCount(
                      progress.byUnit[u.id].challenge.levels,
                      10
                    );
                    setLevel(unlockedForThisUnit);
                  }
                }}
                className={`p-3 rounded-xl border text-left ${u.id === unitId
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white hover:bg-neutral-50"
                  }`}
              >
                <div className="text-xs opacity-80">Unit {u.id}</div>
                <div className="font-semibold truncate">*/}
        {/* {u.title.replace(/^Unit \d+:\s這邊要加上星星*和斜線/與逗點, */}
        {/*"")} */}
        {/*</div>
              </button>*/}
        {/*))}*/}
        {/*</div>*/}
        {/* </Card> */}

        {/* 主區域 */}
        <div className="mt-4 space-y-4">
          {/* 學習區 */}
          {tab === "learn" && (
            <>
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TabButton
                    active={sub === "vocab"}
                    onClick={() => {
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.NAV_LEARN,
                        { sub: "vocab" },
                      );
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.LEARN_VOCAB_SET,
                      );
                      setSub("vocab");
                      setVocabView("set");
                    }}
                  >
                    1. 單字
                  </TabButton>

                  <TabButton
                    active={sub === "grammar"}
                    onClick={() => {
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.NAV_LEARN,
                        { sub: "grammar" },
                      );
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.LEARN_GRAMMAR_EXPLAIN,
                      );
                      setSub("grammar");
                      setGrammarView("explain");
                    }}
                  >
                    2. 文法
                  </TabButton>
                  {/*<TabButton
                    active={sub === "text"}
                    onClick={() => setSub("text")}
                  >
                    3. 課文
                  </TabButton>*/}
                </div>
                {sub === null && (
                  <div className="py-20 text-center border-2 border-dashed border-neutral-200 rounded-3xl">
                    <p className="text-neutral-400 font-medium">
                      請點選上方按鈕開始學習 🚀
                    </p>
                  </div>
                )}

                {sub === "vocab" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={vocabView === "set"}
                      onClick={() => setVocabView("set")}
                    >
                      單字集
                    </TabButton>
                    {/*<TabButton active={vocabView === "quiz"} onClick={() => setVocabView("quiz")}>
                      4 選 1 小遊戲
                    </TabButton>*/}
                    <TabButton
                      active={vocabView === "snake"}
                      onClick={() => setVocabView("snake")}
                    >
                      貪吃蛇
                    </TabButton>
                  </div>
                )}

                {sub === "grammar" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={grammarView === "explain"}
                      onClick={() => setGrammarView("explain")}
                    >
                      文法說明
                    </TabButton>
                    <TabButton
                      active={grammarView === "reorder"}
                      onClick={() => setGrammarView("reorder")}
                    >
                      方塊
                    </TabButton>
                  </div>
                )}

                {sub === "text" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={textView === "story"}
                      onClick={() => setTextView("story")}
                    >
                      課文故事
                    </TabButton>
                    <TabButton
                      active={textView === "arrange"}
                      onClick={() => setTextView("arrange")}
                    >
                      句型排列
                    </TabButton>
                  </div>
                )}
              </Card>

              {/* 內容：單字 */}
              {sub === "vocab" &&
                (vocabView === "set" ? (
                  <VocabSet
                    title={`${unit.title} 單字集`}
                    words={unit.words}
                    onPlayAudio={() => {
                      reportActivity({ totalPronunciations: 1 });
                    }}
                    onStudied={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          studied: uProg.vocab.studied + 1,
                        },
                      });

                      // 單字研讀 = 學習行為，會中斷遊戲連續 Streak
                      reportActivity({ isLearn: true });
                    }}
                  />
                ) : vocabView === "snake" ? (
                  <SnakeChallenge
                    key={`snake-learn-${unitId}`}
                    title={`單字練習：貪吃蛇`}
                    //totalTime={60}
                    words={unit.words}
                    targetScore={7} // 建議 7 分作為過關門檻（可調）
                    onFinish={(score /*, timeUsed*/) => {
                      // 與 4選1 一致：加 XP、寫入 vocab.quizBest（若要分開統計再另外加欄位）
                      addXP(unitId, score);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          quizBest: Math.max(uProg.vocab.quizBest, score),
                        },
                      });
                    }}
                    onReport={(r: SnakeReport) => {
                      const items: ChallengeItemResult[] = r.logs.map((log) => {
                        const correctIndex = log.options.indexOf(
                          log.correctTerm,
                        );
                        const picked = log.options.indexOf(log.selectedTerm);
                        return {
                          id: `snake-${unitId}-${log.round}`,
                          prompt: log.prompt,
                          choices: log.options,
                          correctIndex: correctIndex >= 0 ? correctIndex : 0, // 理論上應該找得到；找不到就先防呆到 0
                          pickedIndex: picked >= 0 ? picked : null, // -1 轉成 null，Modal 會顯示「（未作答）」
                          correct: log.isCorrect,
                          tag: "vocab",
                        };
                      });
                      const isPerfect = r.correct === r.totalQuestions;
                      // 🔸 這裡自己定義「通關門檻」
                      const passScore = 7;
                      // 🌟 修正 Bug：直接用分數判定，不管蛇最後是不是撞牆死掉
                      const safePassed = r.correct >= passScore;

                      setModalData({
                        title: r.title || `單字練習：貪吃蛇`,
                        score: r.correct,
                        total: r.totalQuestions,
                        stars: computeLevelStars(r.correct),
                        timeUsed: r.usedTime,
                        //passed: r.passed,
                        passed: safePassed,
                        items,
                      });
                      setModalOpen(true);
                      reportActivity({
                        isGame: true,
                        gamesPlayed: 1,
                        totalTimeSec: r.usedTime,
                        totalErrors: r.wrong,
                        perfectRuns: isPerfect ? 1 : 0,
                        snakeCorrectTotal: r.correct, // 🔸 給 ACCURACY_GOD 用
                      });

                      // ✨ 新增這段 SNAKE_GAME_END
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.SNAKE_GAME_END,
                        {
                          score: r.correct,
                          wrong: r.wrong,
                          timeUsed: r.usedTime,
                          passed: safePassed,
                          items: items.map((it) => ({
                            prompt: it.prompt,
                            correct: it.correct,
                            picked:
                              it.pickedIndex !== null
                                ? it.choices[it.pickedIndex]
                                : "未作答",
                          })),
                        },
                      );
                    }}
                    onRetry={() => {
                      reportActivity({ totalRetries: 1 });
                      // ✨ 加上 snake retry 紀錄
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.LEARN_SNAKE_GAME,
                        { action: "retry" },
                      );
                    }}
                  />
                ) : (
                  <VocabQuiz
                    questions={makeVocabMCQ(unit, 80).map((q, i) => ({
                      ...q,
                      id: q.id ?? `vocab-${unit.id}-${i}`, // 補上 id
                    }))}
                    onFinished={(score) => {
                      addXP(unitId, score);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          quizBest: Math.max(uProg.vocab.quizBest, score),
                          studied: (uProg.vocab.studied || 0) + 1,
                        },
                      });
                      reportActivity({
                        isGame: true,
                        gamesPlayed: 1,
                        perfectRuns: score === 10 ? 1 : 0,
                        totalErrors: Math.max(0, 10 - score),
                      });
                    }}
                  />
                ))}

              {/* 內容：文法 */}
              {sub === "grammar" &&
                (grammarView === "explain" ? (
                  <GrammarExplain
                    points={unit.grammar}
                    // 1. onAcquire: 每次按「掌握」都會觸發，次數 +1，並給一點點 XP
                    onAcquire={() => {
                      patchUnit(unit.id, {
                        grammar: {
                          studied: (uProg.grammar.studied || 0) + 1, // ✨ 這裡 +1
                          reorderBest: uProg.grammar.reorderBest,
                        },
                      });
                      addXP(unit.id, 10); // ✨ 每學一個觀念給 10 XP
                    }}
                    // 2. onComplete: 全部學完後，給一個大獎勵 (不加次數，只給分)
                    //onComplete={() => {
                      //addXP(unit.id, 50); // ✨ 全部完成給 50 XP
                    //}}
                  />
                ) : (
                  <ReorderSentenceGame
                    targets={unit.grammar.flatMap((g) => g.examples ?? [])}
                    onFinished={(score) => {
                      addXP(unitId, score);
                      patchUnit(unitId, {
                        grammar: {
                          ...uProg.grammar,
                          reorderBest: Math.max(
                            uProg.grammar.reorderBest,
                            score,
                          ),
                        },
                      });
                    }}
                    onRetry={() => {
                      reportActivity({ totalRetries: 1 });
                      // ✨ 加上 tetris retry 紀錄
                      logLSAEvent(
                        user?.id,
                        profile?.full_name,
                        LsaState.LEARN_TETRIS_GAME,
                        { action: "retry" },
                      );
                    }}
                  />
                ))}

              {/* 內容：課文 */}
              {sub === "text" &&
                (textView === "story" ? (
                  <StoryViewer
                    story={unit.story}
                    readCount={uProg.text.read}
                    onRead={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        text: { ...uProg.text, read: uProg.text.read + 1 },
                      });

                      // 完成故事閱讀 = 學習行為 + STORY_FAN 次數
                      reportActivity({
                        isLearn: true,
                        storiesRead: 1,
                      });
                    }}
                    onHint={() => {
                      // 所有提示一律經過同一個useProgress
                      reportActivity({ totalHints: 1 });
                    }}
                  />
                ) : (
                  <ArrangeSentencesGame
                    sentences={unit.story.sentencesForArrange}
                    onFinished={(correct) => {
                      const total = unit.story.sentencesForArrange.length;
                      const isPerfectArrange = correct === total;

                      addXP(unitId, correct);
                      patchUnit(unitId, {
                        text: {
                          ...uProg.text,
                          arrangeBest: Math.max(
                            uProg.text.arrangeBest,
                            correct,
                          ),
                        },
                      });

                      reportActivity({
                        isGame: true,
                        gamesPlayed: 1,
                        perfectRuns: isPerfectArrange ? 1 : 0,
                        arrangePerfectRuns: isPerfectArrange ? 1 : 0, // 給 ARRANGE_PRO 用
                        totalErrors: total - correct,
                      });
                    }}
                  />
                ))}
            </>
          )}

          {/* 挑戰區 */}
          {tab === "challenge" &&
            (mode === "select" ? (
              <LevelGrid
                total={10}
                unlockedCount={unlockedCount}
                starsByLevel={starsByLevel}
                onPick={(lv) => {
                  setLevel(lv);
                  setMode("play");
                }}
              />
            ) : (
              <ChallengeRun
                key={`${unitId}-${level}`}
                unit={unit}
                // @ts-ignore
                perQuestionTime={20}
                fixedSet={
                  unitId === 1
                    ? (
                        {
                          1: fixedU1L1,
                          2: fixedU1L2,
                          3: fixedU1L3,
                          4: fixedU1L4,
                          5: fixedU1L5,
                          6: fixedU1L6,
                          7: fixedU1L7,
                          8: fixedU1L8,
                          9: fixedU1L9,
                          10: fixedU1L10,
                        } as const
                      )[level]
                    : undefined
                }
                onFinish={handleChallengeFinish}
              />
            ))}
          {/* 獎章區 */}
          {tab === "badges" && (
            <BadgesView
              progress={progress}
              upsertBadgePlan={upsertBadgePlan}
              retireBadgePlan={retireBadgePlan}
              reflectBadgePlan={reflectBadgePlan}
            />
          )}
          {/* 4. ✅ 新增顯示排行榜的邏輯 */}
          {tab === "leaderboard" && <Leaderboard />}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-neutral-500">
         © {new Date().getFullYear()} 作者Jimmy｜國立中央大學 網路學習科技研究所
      </footer>

      {/* 結算 Modal */}
      {modalData && (
        <ResultModal
          open={modalOpen}
          onClose={closeResultModal}
          title={modalData.title}
          score={modalData.score}
          total={modalData.total}
          stars={modalData.stars}
          timeUsed={modalData.timeUsed}
          passed={modalData.passed}
          items={modalData.items}
        />
      )}

      {/* 🔔 獎章解鎖 Toast：右下角半透明提示 */}
      {badgeToasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[80] space-y-2 pointer-events-none">
          {badgeToasts.map((toast) => {
            const meta = BADGE_META[toast.key] ?? {
              name: toast.key,
              desc: "",
            };
            const tier = toast.tier as BadgeTier;
            const tierName = TIER_NAMES[tier];
            const icon = TIER_ICONS[tier];

            return (
              <div
                key={toast.id}
                className="badge-toast max-w-xs pointer-events-none rounded-2xl bg-neutral-900/85 text-white shadow-lg border border-white/10 backdrop-blur-md px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-neutral-300">
                      Badge Unlocked!
                    </div>
                    <div className="font-semibold truncate">
                      {meta.name} · {tierName}
                    </div>
                    {meta.desc && (
                      <div className="mt-0.5 text-[11px] text-neutral-300 line-clamp-2">
                        {meta.desc}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
