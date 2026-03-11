// src/state/progress.ts
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { UnitId } from "../types";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

// === 型別定義 ===
export type BadgeUnlockEvent = { key: string; tier: BadgeTier; unlockedAt: string; };

export type CustomThresholds = { bronze: number; silver: number; gold: number; };

export type BadgePlanConfig = {
  id: string; // 🌟 核心升級：每一個計畫都有獨立的身分證！
  key: string; name: string; category: string; method: string;
  thresholds: CustomThresholds; confidence: number; justification: string;
  retired?: boolean; retireReason?: string; retireNote?: string;
  passReflectReason?: string; passReflectNote?: string;
  updatedAt: string;
  activatedAt?: string;             
  baselineValue?: number;           
  bestValueSincePlan?: number | null; 
};

export type Progress = {
  byUnit: Record<UnitId, UnitProgress>;
  badges: Record<string, BadgeProgress>;
  stats: UserStats;
  totalXP: number;
  badgePlans: Record<string, BadgePlanConfig>; 
  lastBadgeEvents?: BadgeUnlockEvent[];
};

export type BadgeTier = 0 | 1 | 2 | 3;
export type BadgeProgress = { tier: BadgeTier; unlockedAtByTier?: Partial<Record<1 | 2 | 3, string>>; };
export type UnitProgress = {
  stars: number; xp: number;
  vocab: { studied: number; quizBest: number };
  grammar: { studied: number; reorderBest: number };
  text: { read: number; arrangeBest: number };
  challenge: { clearedLevels: number; bestTimeSec: number; bestScore: number; levels: Record<number, { bestScore: number; bestTimeSec: number; stars: number; passed?: boolean; }>; };
};

export type UserStats = {
  totalLogins: number; totalTimeSec: number; totalErrors: number; totalHints: number; totalRetries: number;
  gamesPlayed: number; perfectRuns: number; storiesRead: number; longSessions: number; closeCalls: number;
  comebackRuns: number; failedChallenges: number; currentGameStreak: number; maxGameStreak: number;
  arrangePerfectRuns: number; snakeCorrectTotal: number; totalPronunciations: number;
};

export const BADGE_QR: Record<string, { type: "participation" | "skill" | "encouragement"; thresholds: [number, number, number]; reverse?: boolean; }> = {
  GAME_LOVER: { type: "participation", thresholds: [3, 6, 10] },
  VOCAB_DRILLER: { type: "participation", thresholds: [3, 10, 30] },
  GRAMMAR_NERD: { type: "participation", thresholds: [3, 10, 30] },
  XP_COLLECTOR: { type: "participation", thresholds: [100, 500, 2000] },
  REVIEWER: { type: "participation", thresholds: [2, 10, 20] },
  AUDIO_LEARNER: { type: "participation", thresholds: [10, 50, 100] },
  SNAKE_MASTER: { type: "skill", thresholds: [10, 30, 60] },
  TETRIS_ARCH: { type: "skill", thresholds: [10, 40, 80] },
  SPEED_DEMON: { type: "skill", thresholds: [50, 40, 30], reverse: true },
  STAR_CATCHER: { type: "skill", thresholds: [3, 9, 18] },
  ACCURACY_GOD: { type: "skill", thresholds: [5, 15, 30] },
  LEVEL_CRUSHER: { type: "skill", thresholds: [3, 6, 10] },
  UNIT_MASTER: { type: "skill", thresholds: [3, 6, 10] },
  PERSISTENT: { type: "encouragement", thresholds: [5, 20, 50] },
  NEVER_GIVE_UP: { type: "encouragement", thresholds: [1, 5, 15] },
  TRY_HARD: { type: "encouragement", thresholds: [10, 50, 100] },
  COMEBACK_KID: { type: "encouragement", thresholds: [1, 3, 5] },
  PRACTICE_MAKE: { type: "encouragement", thresholds: [5, 15, 30] },
  BRAVE_HEART: { type: "encouragement", thresholds: [1, 5, 10] },
  SURVIVOR: { type: "encouragement", thresholds: [1, 3, 5] },
};

const defaultUnitProgress = (): UnitProgress => ({
  stars: 0, xp: 0, vocab: { studied: 0, quizBest: 0 }, grammar: { studied: 0, reorderBest: 0 },
  text: { read: 0, arrangeBest: 0 }, challenge: { clearedLevels: 0, bestTimeSec: 0, bestScore: 0, levels: {} },
});

const defaultProgress = (): Progress => ({
  byUnit: { 1: defaultUnitProgress(), 2: defaultUnitProgress(), 3: defaultUnitProgress(), 4: defaultUnitProgress(), 5: defaultUnitProgress(), 6: defaultUnitProgress() } as unknown as Record<UnitId, UnitProgress>,
  badges: {}, stats: { totalLogins: 0, totalTimeSec: 0, totalErrors: 0, totalHints: 0, totalRetries: 0, gamesPlayed: 0, perfectRuns: 0, storiesRead: 0, longSessions: 0, closeCalls: 0, comebackRuns: 0, failedChallenges: 0, currentGameStreak: 0, maxGameStreak: 0, arrangePerfectRuns: 0, snakeCorrectTotal: 0, totalPronunciations: 0 },
  totalXP: 0, badgePlans: {}, lastBadgeEvents: [],
});

const SRL_CUSTOM_KEYS = new Set(["VOCAB_DRILLER", "AUDIO_LEARNER", "SPEED_DEMON", "UNIT_MASTER", "NEVER_GIVE_UP", "COMEBACK_KID"]);

// 🌟 Helper: 尋找該任務目前「正在進行中 (未退休)」的計畫
export function getActivePlan(key: string, p: Progress): BadgePlanConfig | undefined {
  return Object.values(p.badgePlans || {}).find(plan => plan.key === key && !plan.retired);
}

function shouldEvaluateBadge(key: string, p: Progress): boolean {
  if (!SRL_CUSTOM_KEYS.has(key)) return true;
  const activePlan = getActivePlan(key, p);
  if (!activePlan) return false; 
  return true;
}

function getEffectiveBadgeRule(key: string, p: Progress) {
  const base = BADGE_QR[key];
  if (!SRL_CUSTOM_KEYS.has(key)) return base;
  
  const plan = getActivePlan(key, p);
  if (!plan) return base;
  
  return {
    ...base,
    thresholds: [plan.thresholds.bronze, plan.thresholds.silver, plan.thresholds.gold] as [number, number, number],
  };
}

function checkTier(current: number, thresholds: [number, number, number], isReverse = false): BadgeTier {
  if (isReverse) {
    if (current > 0 && current <= thresholds[2]) return 3;
    if (current > 0 && current <= thresholds[1]) return 2;
    if (current > 0 && current <= thresholds[0]) return 1;
  } else {
    if (current >= thresholds[2]) return 3;
    if (current >= thresholds[1]) return 2;
    if (current >= thresholds[0]) return 1;
  }
  return 0;
}

export function getBadgeValue(key: string, p: Progress): number {
  const s = p.stats;
  const units = Object.values(p.byUnit);
  switch (key) {
    case "GAME_LOVER": return s.maxGameStreak;
    case "VOCAB_DRILLER": return units.reduce((acc, u) => acc + u.vocab.studied, 0);
    case "GRAMMAR_NERD": return units.reduce((acc, u) => acc + u.grammar.studied, 0);
    case "XP_COLLECTOR": return p.totalXP;
    case "REVIEWER": return s.gamesPlayed;
    case "AUDIO_LEARNER": return s.totalPronunciations;
    case "SNAKE_MASTER": return Math.max(...units.map((u) => u.vocab.quizBest), 0);
    case "TETRIS_ARCH": return Math.max(...units.map((u) => u.grammar.reorderBest), 0);
    case "SPEED_DEMON": {
      const allTimes = units.flatMap((u) => Object.values(u.challenge.levels || {})).filter((lv) => (lv.stars ?? 0) >= 1 && (lv.bestTimeSec ?? 0) > 0).map((lv) => lv.bestTimeSec);
      return allTimes.length > 0 ? Math.min(...allTimes) : 0;
    }
    case "STAR_CATCHER": return units.reduce((acc, u) => acc + Object.values(u.challenge.levels || {}).reduce((sum, lv) => sum + (lv.stars ?? 0), 0), 0);
    case "ACCURACY_GOD": return s.snakeCorrectTotal;
    case "LEVEL_CRUSHER": return units.reduce((acc, u) => acc + Object.values(u.challenge.levels || {}).filter((lv) => lv.passed === true || (lv.stars ?? 0) >= 2).length, 0);
    case "UNIT_MASTER": return units.reduce((acc, u) => acc + Object.values(u.challenge.levels || {}).filter((lv) => (lv.stars ?? 0) >= 3).length, 0);
    case "PERSISTENT": return s.totalErrors;
    case "NEVER_GIVE_UP": return s.totalRetries;
    case "TRY_HARD": return s.gamesPlayed + s.totalRetries;
    case "COMEBACK_KID": return s.comebackRuns;
    case "PRACTICE_MAKE": return s.gamesPlayed;
    case "BRAVE_HEART": return s.failedChallenges;
    case "SURVIVOR": return s.closeCalls;
    default: return 0;
  }
}

// 🌟 支援傳入特定 plan 計算進度
export function getEffectiveProgress(key: string, p: Progress, specificPlan?: BadgePlanConfig): number {
  const currentTotal = getBadgeValue(key, p);
  if (!SRL_CUSTOM_KEYS.has(key)) return currentTotal; 
  
  const plan = specificPlan || getActivePlan(key, p);
  if (!plan) return currentTotal;

  if (key === "SPEED_DEMON") return plan.bestValueSincePlan ?? 0; 
  const baseline = plan.baselineValue ?? 0;
  return Math.max(0, currentTotal - baseline);
}

function evaluateBadges(p: Progress): Progress {
  const nextBadges: Record<string, BadgeProgress> = { ...p.badges };
  const unlockedEvents: BadgeUnlockEvent[] = [];

  for (const key of Object.keys(BADGE_QR)) {
    if (!shouldEvaluateBadge(key, p)) continue;

    const def = getEffectiveBadgeRule(key, p); 
    const effectiveVal = getEffectiveProgress(key, p); 
    
    const newTier = checkTier(effectiveVal, def.thresholds, def.reverse);
    const old = nextBadges[key];
    const oldTier = old?.tier ?? 0;

    if (newTier > oldTier) {
      const ts = new Date().toISOString();
      const prevByTier = old?.unlockedAtByTier ?? {};
      const nextByTier = newTier >= 1 ? ({ ...prevByTier, [newTier]: ts } as BadgeProgress["unlockedAtByTier"]) : prevByTier;
      nextBadges[key] = { tier: newTier, unlockedAtByTier: nextByTier };
      unlockedEvents.push({ key, tier: newTier, unlockedAt: ts });
    }
  }
  return { ...p, badges: nextBadges, lastBadgeEvents: unlockedEvents };
}

// === Reducer ===
type ReportPayload = Partial<UserStats> & { isGame?: boolean; isLearn?: boolean; };

type Action =
  | { type: "ADD_XP"; unit: UnitId; amount: number }
  | { type: "PATCH_UNIT"; unit: UnitId; patch: Partial<UnitProgress> }
  | { type: "REPORT_ACTIVITY"; payload: ReportPayload }
  | { type: "RESET" }
  | { type: "LOAD"; progress: Progress }
  | { type: "UPSERT_BADGE_PLAN"; plan: BadgePlanConfig } // 改吃整包 plan
  | { type: "RETIRE_BADGE_PLAN"; id: string; reason: string; note: string } // 🌟 改用 id
  | { type: "PASS_REFLECT_BADGE_PLAN"; id: string; reason: string; note: string } // 🌟 改用 id
  | { type: "REPORT_CHALLENGE_RUN"; payload: { score: number; timeUsed: number; stars: number } }; 

function reducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "ADD_XP": {
      const byUnit = { ...state.byUnit };
      const u = byUnit[action.unit] ?? defaultUnitProgress();
      byUnit[action.unit] = { ...u, xp: u.xp + action.amount };
      return evaluateBadges({ ...state, byUnit, totalXP: state.totalXP + action.amount });
    }
    case "PATCH_UNIT": {
      const byUnit = { ...state.byUnit };
      const prev = byUnit[action.unit] ?? defaultUnitProgress();
      const patch = action.patch as any;
      byUnit[action.unit] = {
        ...prev, ...patch,
        vocab: { ...prev.vocab, ...(patch.vocab ?? {}) },
        grammar: { ...prev.grammar, ...(patch.grammar ?? {}) },
        text: { ...prev.text, ...(patch.text ?? {}) },
        challenge: { ...prev.challenge, ...(patch.challenge ?? {}) },
      };
      return evaluateBadges({ ...state, byUnit });
    }
    case "REPORT_ACTIVITY": {
      const stats: UserStats = { ...state.stats };
      const { isGame, isLearn, ...rest } = action.payload;
      Object.entries(rest).forEach(([k, v]) => {
        if (typeof v === "number") {
          const key = k as keyof UserStats;
          stats[key] = (stats[key] ?? 0) + v;
        }
      });
      if (isGame) {
        stats.currentGameStreak = (stats.currentGameStreak ?? 0) + 1;
        stats.maxGameStreak = Math.max(stats.maxGameStreak ?? 0, stats.currentGameStreak);
      }
      if (isLearn) stats.currentGameStreak = 0;
      return evaluateBadges({ ...state, stats });
    }
    case "REPORT_CHALLENGE_RUN": {
      let newState = { ...state };
      const { timeUsed, stars } = action.payload;
      if (stars >= 1) {
        const sdPlan = getActivePlan("SPEED_DEMON", newState); // 🌟 找到進行中的極速傳說
        if (sdPlan) {
          const currentBest = sdPlan.bestValueSincePlan;
          if (currentBest == null || timeUsed < currentBest) {
            newState.badgePlans = { ...newState.badgePlans, [sdPlan.id]: { ...sdPlan, bestValueSincePlan: timeUsed } };
          }
        }
      }
      return evaluateBadges(newState);
    }
    case "UPSERT_BADGE_PLAN": {
      // 🌟 防呆：如果該獎章還有「未退休」的計畫，不允許新增同類型的
      const hasActive = Object.values(state.badgePlans).some(p => p.key === action.plan.key && !p.retired);
      if (hasActive) return state; 

      const currentVal = getBadgeValue(action.plan.key, state);
      const newPlan: BadgePlanConfig = {
        ...action.plan,
        activatedAt: new Date().toISOString(),
        baselineValue: action.plan.key !== "SPEED_DEMON" ? currentVal : undefined,
        bestValueSincePlan: action.plan.key === "SPEED_DEMON" ? null : undefined,
      };

      const badgePlans = { ...state.badgePlans, [action.plan.id]: newPlan };
      return evaluateBadges({ ...state, badgePlans });
    }
    case "RETIRE_BADGE_PLAN": {
      const prev = state.badgePlans[action.id];
      if (!prev) return state;
      const badgePlans = {
        ...state.badgePlans,
        [action.id]: { ...prev, retired: true, retireReason: action.reason, retireNote: action.note, updatedAt: new Date().toISOString() },
      };
      return evaluateBadges({ ...state, badgePlans }); 
    }
    case "PASS_REFLECT_BADGE_PLAN": {
      const prev = state.badgePlans[action.id];
      if (!prev) return state;
      const badgePlans = {
        ...state.badgePlans,
        [action.id]: { ...prev, passReflectReason: action.reason, passReflectNote: action.note, updatedAt: new Date().toISOString() },
      };
      return { ...state, badgePlans };
    }
    case "RESET": return defaultProgress();
    case "LOAD": return evaluateBadges(action.progress);
    default: return state;
  }
}

// === Hook ===
export function useProgress() {
  const { session } = useAuth();
  const userId = session?.user?.id as string | undefined;

  const [progress, dispatch] = useReducer(reducer, undefined, defaultProgress);
  const [loading, setLoading] = useState(true);
  const isSaving = useRef(false);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    restore(userId)
      .then((p) => {
        p.stats.totalLogins = (p.stats.totalLogins ?? 0) + 1;
        dispatch({ type: "LOAD", progress: p });
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId || loading) return;
    if (isSaving.current) return;
    isSaving.current = true;
    persist(progress, userId).finally(() => { isSaving.current = false; });
  }, [progress, userId, loading]);

  const addXP = useCallback((unit: UnitId, amount: number) => dispatch({ type: "ADD_XP", unit, amount }), []);
  const patchUnit = useCallback((unit: UnitId, patch: Partial<UnitProgress>) => dispatch({ type: "PATCH_UNIT", unit, patch }), []);
  const reportActivity = useCallback((payload: ReportPayload) => dispatch({ type: "REPORT_ACTIVITY", payload }), []);

  const reportGrammarTetris = useCallback((payload: { roundsPlayed: number; reason: "completed" | "no-fit" | "wrong-limit"; }) => {
    reportActivity({ isGame: true, gamesPlayed: 1, failedChallenges: payload.reason === "wrong-limit" ? 1 : 0 });
  }, [reportActivity]);

  const reportSnake = useCallback((payload: { correct: number; total: number; wrong: number; usedTime?: number; }) => {
    reportActivity({ isGame: true, gamesPlayed: 1, totalErrors: payload.wrong, totalTimeSec: payload.usedTime ?? 0, snakeCorrectTotal: payload.correct });
  }, [reportActivity]);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const upsertBadgePlan = useCallback((plan: BadgePlanConfig) => dispatch({ type: "UPSERT_BADGE_PLAN", plan }), []);
  const retireBadgePlan = useCallback((id: string, reason: string, note: string) => dispatch({ type: "RETIRE_BADGE_PLAN", id, reason, note }), []);
  const reflectBadgePlan = useCallback((id: string, reason: string, note: string) => dispatch({ type: "PASS_REFLECT_BADGE_PLAN", id, reason, note }), []);
  const reportChallengeRun = useCallback((payload: { score: number; timeUsed: number; stars: number }) => dispatch({ type: "REPORT_CHALLENGE_RUN", payload }), []);

  return {
    progress,
    addXP, patchUnit, reportActivity, reportGrammarTetris, reportSnake, reset,
    upsertBadgePlan, retireBadgePlan, reflectBadgePlan, reportChallengeRun,
    loadingProgress: loading,
  };
}

function sanitizeBadges(input: any): Record<string, BadgeProgress> {
  const out: Record<string, BadgeProgress> = {};
  for (const [k, v] of Object.entries(input ?? {})) {
    const rawTier = (v as any)?.tier;
    const tierNum = typeof rawTier === "string" ? Number(rawTier) : rawTier;
    const tier: BadgeTier = tierNum === 1 || tierNum === 2 || tierNum === 3 ? tierNum : 0;
    const base = v && typeof v === "object" ? (v as any) : {};
    out[k] = { ...base, tier };
  }
  return out;
}

// === Supabase 存取 ===
async function restore(userId: string): Promise<Progress> {
  try {
    const { data, error } = await supabase.from("profiles").select("progress").eq("id", userId).single();
    if (error) { console.error("[progress.restore] error:", error); return defaultProgress(); }

    if (data?.progress && typeof data.progress === "object") {
      const remote = data.progress as Partial<Progress>;
      const def = defaultProgress();
      
      // 🌟 舊版相容處理：幫你以前存進去的資料加上 ID，避免壞掉
      const safeBadgePlans: Record<string, BadgePlanConfig> = {};
      for (const [k, v] of Object.entries(remote.badgePlans ?? {})) {
         const plan = v as BadgePlanConfig;
         if (!plan.id) plan.id = k; 
         safeBadgePlans[plan.id] = plan;
      }

      return {
        ...def,
        ...remote,
        lastBadgeEvents: [],
        byUnit: { ...def.byUnit, ...(remote.byUnit ?? {}) },
        badges: sanitizeBadges({ ...def.badges, ...(remote.badges ?? {}) }),
        stats: { ...def.stats, ...(remote.stats ?? {}) },
        badgePlans: safeBadgePlans,
      };
    }
  } catch (e) { console.error("[progress.restore] exception:", e); }
  return defaultProgress();
}

async function persist(p: Progress, userId: string) {
  try {
    const { lastBadgeEvents, ...persistable } = p; 
    await supabase.from("profiles").update({ progress: persistable, updated_at: new Date().toISOString() }).eq("id", userId);
  } catch (e) { console.error("[progress.persist] exception:", e); }
}