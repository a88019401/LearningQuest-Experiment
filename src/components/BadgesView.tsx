// src/components/BadgesView.tsx
import type { Progress, BadgeTier } from "../state/progress";
import { BADGE_QR, getBadgeValue } from "../state/progress";
import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./ui";

// 顯示文字（名稱 + 說明）
export const BADGE_META: Record<string, { name: string; desc: string }> = {
  // 參與類 Participation
  //STORY_FAN: { name: "故事迷", desc: "完整讀完課文故事很多次" },
  GAME_LOVER: {
    name: "遊戲狂熱",
    desc: "在同一次遊戲連續挑戰中，最高連勝場數達到：銅 3 場｜銀 6 場｜金 10 場",
  },
  VOCAB_DRILLER: {
    name: "單字達人",
    desc: "完成「單字集」研讀次數累積：銅 3 次｜銀 10 次｜金 30 次",
  },
  GRAMMAR_NERD: {
    name: "文法專家",
    desc: "完成「文法說明」掌握/學習次數累積：銅 3 次｜銀 10 次｜金 30 次",
  },
  XP_COLLECTOR: {
    name: "經驗收藏家",
    desc: "累積總 XP 達到：銅 100｜銀 500｜金 2000",
  },
  REVIEWER: {
    name: "愛玩遊戲",
    desc: "累積遊玩遊戲場次達到：銅 2 場｜銀 10 場｜金 20 場",
  },
  AUDIO_LEARNER: {
    name: "聽力小耳朵",
    desc: "點擊單字發音（播放音檔）累積：銅 10 次｜銀 50 次｜金 100 次",
  },
  // 技巧類 Skill
  SNAKE_MASTER: {
    name: "貪吃蛇王",
    desc: "單字測驗最高分（目前以「單字測驗最佳分」計算）達到：銅 10｜銀 30｜金 60",
  },
  TETRIS_ARCH: {
    name: "方塊建築師",
    desc: "文法方塊最高成績（最高消除行/列數）達到：銅 10｜銀 40｜金 80",
  },
  SPEED_DEMON: {
    name: "極速傳說",
    desc: "挑戰區中「曾經達成至少 1★」的關卡，最快完成時間達到：銅 ≤50 秒｜銀 ≤40 秒｜金 ≤30 秒",
  },
  STAR_CATCHER: {
    name: "摘星者",
    desc: "挑戰區累積獲得星星數達到：銅 3 顆｜銀 9 顆｜金 18 顆",
  },
  ACCURACY_GOD: {
    name: "愛吃的蛇",
    desc: "貪吃蛇累積「答對的單字數」達到：銅 5｜銀 15｜金 30",
  },
  LEVEL_CRUSHER: {
    name: "過關斬將",
    desc: "挑戰區通過的關卡數累積：銅 3 關｜銀 6 關｜金 10 關（通過＝該關達到 ≥2★ 或被標記為 passed）",
  },
  UNIT_MASTER: {
    name: "單元制霸",
    desc: "挑戰區累積獲得 3★ 的關卡數達到：銅 3 關｜銀 6 關｜金 10 關",
  },

  // 鼓勵類 Encouragement
  //CURIOUS_MIND: { name: "求知若渴", desc: "善用提示功能" },
  //MARATHONER: { name: "馬拉松", desc: "長時間專注學習" },
  //SLOW_STEADY: { name: "穩紮穩打", desc: "花時間慢慢前進" },
  PERSISTENT: {
    name: "越挫越勇",
    desc: "累積錯誤次數達到：銅 5 次｜銀 20 次｜金 50 次（挑戰/遊戲答錯都會累加）",
  },
  NEVER_GIVE_UP: {
    name: "永不放棄",
    desc: "按下重新開始/重試的次數累積：銅 1 次｜銀 5 次｜金 15 次",
  },
  TRY_HARD: {
    name: "勤能補拙",
    desc: "總嘗試次數累積（遊戲場次 + 重試次數）：銅 10｜銀 50｜金 100",
  },
  COMEBACK_KID: {
    name: "逆轉勝",
    desc: "挑戰同一關時，分數比過去最佳成績提升 ≥3 分的次數：銅 1 次｜銀 3 次｜金 5 次",
  },
  PRACTICE_MAKE: {
    name: "熟能生巧",
    desc: "累積遊玩遊戲場次達到：銅 5 場｜銀 15 場｜金 30 場",
  },
  BRAVE_HEART: {
    name: "勇敢的心",
    desc: "挑戰失敗次數累積：銅 1 次｜銀 5 次｜金 10 次",
  },
  SURVIVOR: {
    name: "倖存者",
    desc: "驚險通關次數累積：銅 1 次｜銀 3 次｜金 5 次（目前定義：挑戰區通關且分數剛好 7 分）",
  },
};

// 等級樣式
export const TIER_STYLES: Record<BadgeTier, string> = {
  0: "bg-neutral-50 text-neutral-700 border-neutral-100",
  1: "bg-orange-50 text-amber-800 border-orange-200",
  2: "bg-slate-100 text-slate-800 border-slate-300",
  3: "bg-yellow-50 text-yellow-800 border-yellow-300 ring-1 ring-yellow-200 shadow-sm",
};

export const TIER_NAMES: Record<BadgeTier, string> = {
  0: "未解鎖",
  1: "銅級",
  2: "銀級",
  3: "金級",
};

export const TIER_ICONS: Record<BadgeTier, string> = {
  0: "🔒",
  1: "🥉",
  2: "🥈",
  3: "🥇",
};

const SRL_HIDDEN_KEYS = [
  "VOCAB_DRILLER",
  "AUDIO_LEARNER",
  "SPEED_DEMON",
  "UNIT_MASTER",
  "NEVER_GIVE_UP",
  "COMEBACK_KID",
] as const;

const MAX_PLANS = 3;

// === 實驗組：SRL「獎章規劃」面板（目前先做 UI，不做儲存/啟用功能） ===

type BadgePlanCategory = "學習類" | "技巧類" | "鼓勵類";

type BadgePlanRow = {
  key: string;
  name: string;
  category: BadgePlanCategory;
  // 第三欄：固定顯示「系統怎麼算」的方式說明（對應 6 枚 SRL 核心獎章）
  method: string;
  // 第四欄：學生自訂條件（可輸入任意門檻/規則）
  condition: string;
  // 第五欄：1-5
  confidence: 1 | 2 | 3 | 4 | 5;
  // 第六欄：一句話理由
  justification: string;
};

const SRL_BADGE_TEMPLATES: Array<
  Pick<BadgePlanRow, "key" | "name" | "category" | "method" | "condition">
> = [
  {
    key: "VOCAB_DRILLER",
    name: "單字達人",
    category: "學習類",
    method:
      "完成『單字集』研讀次數（所有單元 u.vocab.studied 的總和；累積研讀次數）",
    condition: "例如：銅 3｜銀 10｜金 30（次）",
  },
  {
    key: "AUDIO_LEARNER",
    name: "聽力小耳朵",
    category: "學習類",
    method: "點擊播放單字發音累積（stats.totalPronunciations）",
    condition: "例如：銅 10｜銀 50｜金 100（次）",
  },
  {
    key: "SPEED_DEMON",
    name: "極速傳說",
    category: "技巧類",
    method:
      "挑戰區最快完成時間（篩選 stars>=1 且 bestTimeSec>0 的關卡，取 bestTimeSec 最小值；越小越好）",
    condition: "例如：銅 ≤50｜銀 ≤40｜金 ≤30（秒）",
  },
  {
    key: "UNIT_MASTER",
    name: "單元制霸",
    category: "技巧類",
    method: "挑戰區獲得 3★ 的關卡數總和（統計 stars>=3 的關卡數）",
    condition: "例如：銅 3｜銀 6｜金 10（關）",
  },
  {
    key: "NEVER_GIVE_UP",
    name: "永不放棄",
    category: "鼓勵類",
    method: "重試/重新開始的累積次數（stats.totalRetries）",
    condition: "例如：銅 1｜銀 5｜金 15（次）",
  },
  {
    key: "COMEBACK_KID",
    name: "逆轉勝",
    category: "鼓勵類",
    method: "同一關卡分數比過去最佳成績提升 ≥3 分的次數（stats.comebackRuns）",
    condition: "例如：銅 1｜銀 3｜金 5（次）",
  },
];

function BadgePlanningPanel({
  plannedKeys,
  plannedRows,
  onFinishPlan,
  maxPlans,
}: {
  plannedKeys: Record<string, boolean>;
  plannedRows: Record<string, BadgePlanRow>;
  onFinishPlan: (row: BadgePlanRow) => void;
  maxPlans: number;
}) {
  const templates = useMemo(() => SRL_BADGE_TEMPLATES, []);

  // 目前僅做 UI 示意：欄位可輸入，但不會寫回 DB / progress
  const [rows, setRows] = useState<BadgePlanRow[]>(() =>
    templates.map((t) => ({
      key: t.key,
      name: t.name,
      category: t.category,
      method: t.method,
      condition: t.condition,
      confidence: 3,
      justification: "",
    })),
  );

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [selectedKey, setSelectedKey] = useState<string>("");

  const updateRowByKey = (key: string, patch: Partial<BadgePlanRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const currentRow = useMemo(
    () => rows.find((r) => r.key === selectedKey),
    [rows, selectedKey],
  );

  const totalSteps = 5;
  const stepLabel = (s: number) => {
    if (s === 0) return "任務分析：選擇想挑戰的獎章任務";
    if (s === 1) return "目標設定：你想怎麼設定取得條件？";
    if (s === 2) return "自我監控：你有多大信心能達成？";
    if (s === 3) return "自我反思：為什麼你想挑戰這個目標？";
    return "命名：幫這個獎章取一個偉大的名字吧！";
  };

  const resetWizard = () => {
    setStep(0);
    setSelectedKey("");
  };

  const openWizard = () => {
    setIsOpen(true);
    resetWizard();
  };

  const closeWizard = () => {
    setIsOpen(false);
    resetWizard();
  };

  const canNext = () => {
    if (step === 0) return !!selectedKey;
    if (!currentRow) return false;
    if (step === 1) return currentRow.condition.trim().length > 0;
    if (step === 2) return true; // confidence 有預設 3
    if (step === 3) return currentRow.justification.trim().length > 0;
    if (step === 4) return currentRow.name.trim().length > 0;
    return false;
  };

  const next = () => {
    if (!canNext()) return;
    setStep((prev) => (prev < 4 ? ((prev + 1) as any) : prev));
  };

  const back = () => {
    setStep((prev) => (prev > 0 ? ((prev - 1) as any) : prev));
  };

  const finishOne = () => {
    if (!currentRow) return;
    onFinishPlan(currentRow); // ✅ 套用到父層 → grid 會更新
    resetWizard();
    setIsOpen(false);
  };

  const plannedCount = Object.values(plannedKeys).filter(Boolean).length;
  const reachedLimit = plannedCount >= maxPlans;

  return (
    <Card className="p-5">
      <SectionTitle
        title="獎章規劃（SRL）"
        desc="改成一步一步引導式填寫：先選任務 → 設定條件 → 評估信心 → 說明理由 → 命名。此階段僅 UI，不會儲存、不會啟用獎章。"
      />

      <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-700">
          已規劃：
          <span className="font-semibold text-neutral-900">
            {plannedCount}
          </span>{" "}
          / {maxPlans}
        </div>

        <button
          type="button"
          onClick={openWizard}
          disabled={reachedLimit}
          className={[
            "px-4 py-2 rounded-2xl text-sm font-medium border transition",
            reachedLimit
              ? "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed"
              : "border-neutral-900 bg-neutral-900 text-white hover:opacity-90",
          ].join(" ")}
        >
          開始規劃一枚獎章
        </button>
      </div>

      {/* 已規劃清單（小卡） */}
      {plannedCount > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.keys(plannedKeys)
            .filter((k) => plannedKeys[k])
            .map((k) => {
              const r = plannedRows[k] ?? rows.find((x) => x.key === k);
              if (!r) return null;

              return (
                <div
                  key={r.key}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-neutral-900">
                      {r.name}
                    </div>
                    <span className="text-[11px] font-mono px-2 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700">
                      {r.key}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    {r.category}
                  </div>
                  <div className="mt-2 text-xs text-neutral-700 leading-snug">
                    <span className="font-semibold">條件：</span> {r.condition}
                  </div>
                  <div className="mt-1 text-xs text-neutral-700 leading-snug">
                    <span className="font-semibold">信心：</span> {r.confidence}
                    /5
                  </div>
                  <div className="mt-1 text-xs text-neutral-700 leading-snug">
                    <span className="font-semibold">理由：</span>{" "}
                    {r.justification}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Wizard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeWizard} />
          <div className="relative w-[92vw] max-w-2xl">
            <Card className="p-5">
              {/* header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-neutral-500">
                    步驟 {step + 1} / {totalSteps}
                  </div>
                  <div className="text-xl font-extrabold text-neutral-900 mt-1">
                    {stepLabel(step)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeWizard}
                  className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                >
                  ✕
                </button>
              </div>

              {/* step dots */}
              <div className="mt-4 flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "h-2 flex-1 rounded-full",
                      i <= step ? "bg-neutral-900" : "bg-neutral-200",
                    ].join(" ")}
                  />
                ))}
              </div>

              {/* body */}
              <div className="mt-5 space-y-4">
                {/* Step 1: choose badge */}
                {step === 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      請選擇你想挑戰的獎章任務～
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rows.map((r) => {
                        const active = r.key === selectedKey;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setSelectedKey(r.key)}
                            className={[
                              "text-left rounded-2xl border p-3 transition",
                              active
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-semibold">
                                {r.name}
                                {plannedKeys[r.key] ? " ✅" : ""}
                              </div>
                              <span
                                className={[
                                  "text-[11px] font-mono px-2 py-1 rounded-full border",
                                  active
                                    ? "border-white/30 bg-white/10 text-white"
                                    : "border-neutral-200 bg-neutral-50 text-neutral-700",
                                ].join(" ")}
                              >
                                {r.key}
                              </span>
                            </div>
                            <div
                              className={[
                                "mt-1 text-xs",
                                active ? "text-white/80" : "text-neutral-600",
                              ].join(" ")}
                            >
                              類型：{r.category}
                            </div>
                            <div
                              className={[
                                "mt-2 text-xs leading-snug",
                                active ? "text-white/80" : "text-neutral-700",
                              ].join(" ")}
                            >
                              {r.method}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 leading-relaxed">
                      小提示：這一步是「任務分析」——先選定你要挑戰的方向，越清楚越容易成功。
                    </div>
                  </div>
                )}

                {/* Step 2: condition */}
                {step === 1 && currentRow && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      你會想怎麼設定這個獎章的取得條件～
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-900 mb-1">
                        系統指標（固定）
                      </div>
                      {currentRow.method}
                    </div>

                    <label className="block text-xs text-neutral-600">
                      取得條件（自訂）
                    </label>
                    <input
                      value={currentRow.condition}
                      onChange={(e) =>
                        updateRowByKey(currentRow.key, {
                          condition: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                      placeholder="例如：每天至少 10 次；或 銅 3｜銀 10｜金 30…"
                    />

                    <div className="text-xs text-neutral-500 leading-relaxed">
                      建議寫成可衡量的規則（次數 / 秒數 / 星數 / 分數 /
                      連勝…）。
                    </div>
                  </div>
                )}

                {/* Step 3: confidence */}
                {step === 2 && currentRow && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      你有多大信心能達成這個目標呢？
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((n) => {
                        const active = currentRow.confidence === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              updateRowByKey(currentRow.key, {
                                confidence: n as 1 | 2 | 3 | 4 | 5,
                              })
                            }
                            className={[
                              "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                              active
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
                            ].join(" ")}
                          >
                            {n} 分
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 leading-relaxed">
                      小提示：這一步是「自我監控」——信心越低也沒關係，等一下可以在理由中說明你的策略。
                    </div>
                  </div>
                )}

                {/* Step 4: justification */}
                {step === 3 && currentRow && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      為什麼這次會想選擇這個獎章呢？
                    </div>

                    <label className="block text-xs text-neutral-600">
                      自我挑戰理由（Justification）
                    </label>
                    <input
                      value={currentRow.justification}
                      onChange={(e) =>
                        updateRowByKey(currentRow.key, {
                          justification: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                      placeholder="一句話簡述：為什麼選這個目標？"
                    />

                    <div className="text-xs text-neutral-500">
                      例：我想提升單字熟悉度，所以設定每天至少練習 10 次。
                    </div>
                  </div>
                )}

                {/* Step 5: naming */}
                {step === 4 && currentRow && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      最後！請幫這個獎章取一個偉大的名字吧！
                    </div>

                    <label className="block text-xs text-neutral-600">
                      獎章名稱（可自訂）
                    </label>
                    <input
                      value={currentRow.name}
                      onChange={(e) =>
                        updateRowByKey(currentRow.key, { name: e.target.value })
                      }
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                      placeholder="輸入你的獎章名稱"
                    />

                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-900 mb-2">
                        你這枚獎章的規劃摘要
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="font-semibold">任務：</span>
                          {currentRow.key}
                        </div>
                        <div>
                          <span className="font-semibold">類型：</span>
                          {currentRow.category}
                        </div>
                        <div>
                          <span className="font-semibold">條件：</span>
                          {currentRow.condition}
                        </div>
                        <div>
                          <span className="font-semibold">信心：</span>
                          {currentRow.confidence}/5
                        </div>
                        <div>
                          <span className="font-semibold">理由：</span>
                          {currentRow.justification}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* footer buttons */}
              <div className="mt-6 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className={[
                    "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                    step === 0
                      ? "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed"
                      : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  上一步
                </button>

                <div className="flex gap-2">
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!canNext()}
                      className={[
                        "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                        canNext()
                          ? "border-neutral-900 bg-neutral-900 text-white hover:opacity-90"
                          : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
                      ].join(" ")}
                    >
                      下一步
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={finishOne}
                      disabled={!canNext()}
                      className={[
                        "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                        canNext()
                          ? "border-neutral-900 bg-neutral-900 text-white hover:opacity-90"
                          : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
                      ].join(" ")}
                    >
                      完成這枚獎章的規劃
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-neutral-500">
                ※ 此階段為 UI 示意：不會寫入 Supabase、不會啟用/顯示獎章。
              </div>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function BadgesView({ progress }: { progress: Progress }) {
  const categories: Record<
    "participation" | "skill" | "encouragement",
    string
  > = {
    participation: "參與類 Participation",
    skill: "技巧類 Skill",
    encouragement: "鼓勵類 Encouragement",
  };
  const [plannedKeys, setPlannedKeys] = useState<Record<string, boolean>>({});
  const [plannedRows, setPlannedRows] = useState<Record<string, BadgePlanRow>>(
    {},
  );

  const onFinishPlan = (row: BadgePlanRow) => {
    setPlannedKeys((prev) => ({ ...prev, [row.key]: true }));
    setPlannedRows((prev) => ({ ...prev, [row.key]: row }));
  };
  return (
    <div className="space-y-8 pb-10">
      <BadgePlanningPanel
        plannedKeys={plannedKeys}
        plannedRows={plannedRows}
        onFinishPlan={onFinishPlan}
        maxPlans={MAX_PLANS}
      />{" "}
      {(["participation", "skill", "encouragement"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h3 className="text-2xl font-extrabold text-neutral-900 border-l-4 border-neutral-900 pl-3">
            {categories[cat]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(BADGE_QR)
              .filter(([, cfg]) => cfg.type === cat)
              // ✅ SRL 6 枚：未規劃就不顯示（真正「隱藏」）
              .filter(([key]) => {
                const isSrlHidden = (
                  SRL_HIDDEN_KEYS as readonly string[]
                ).includes(key);
                if (!isSrlHidden) return true;
                return !!plannedKeys[key];
              })
              .map(([key, cfg]) => {
                const planned = plannedRows[key];
                const baseMeta = BADGE_META[key] ?? { name: key, desc: "" };

                // ✅ 規劃後：套用自訂名字
                const meta = planned
                  ? { name: planned.name || baseMeta.name, desc: baseMeta.desc }
                  : baseMeta;
                const userBadge = progress.badges[key] ?? {
                  tier: 0 as BadgeTier,
                };

                // ✅ 防呆：tier 只能是 0/1/2/3，其他一律當 0（未解鎖）
                const rawTier = (userBadge as any).tier;
                const tierNum =
                  typeof rawTier === "string" ? Number(rawTier) : rawTier;
                const tier: BadgeTier =
                  tierNum === 1 || tierNum === 2 || tierNum === 3 ? tierNum : 0;

                const style = TIER_STYLES[tier];
                const icon = TIER_ICONS[tier];
                const tierName = TIER_NAMES[tier];

                const [bronze, silver, gold] = cfg.thresholds;
                const currentVal = getBadgeValue(key, progress);
                const isReverse = !!cfg.reverse;

                // 計算「下一級門檻」和文字（銅→銀→金）
                let nextTarget = 0;
                let nextTierLabel = "";
                if (tier === 0) {
                  nextTarget = bronze;
                  nextTierLabel = "銅級";
                } else if (tier === 1) {
                  nextTarget = silver;
                  nextTierLabel = "銀級";
                } else if (tier === 2) {
                  nextTarget = gold;
                  nextTierLabel = "金級";
                }

                let diffText = "";
                if (tier === 3) {
                  diffText = "已達最高等級！";
                } else if (!isReverse) {
                  const remain = Math.max(0, nextTarget - currentVal);
                  diffText =
                    remain === 0
                      ? `已達 ${nextTierLabel} 門檻`
                      : `還差 ${remain} 才能升到 ${nextTierLabel}`;
                } else {
                  if (currentVal === 0) {
                    diffText = "尚未有紀錄，先完成一次挑戰看看。";
                  } else if (currentVal <= nextTarget) {
                    diffText = `已達 ${nextTierLabel} 門檻`;
                  } else {
                    const faster = currentVal - nextTarget;
                    diffText = `再快約 ${Math.round(
                      faster,
                    )} 秒，可達 ${nextTierLabel}`;
                  }
                }

                // 進度條比例
                let ratio = 0;
                if (!isReverse) {
                  ratio = gold > 0 ? Math.min(currentVal / gold, 1) : 0;
                } else {
                  if (currentVal > 0) {
                    if (currentVal <= gold) ratio = 1;
                    else ratio = Math.min(bronze / currentVal, 1);
                  } else {
                    ratio = 0;
                  }
                }

                const isLocked = tier === 0;

                return (
                  <div
                    key={key}
                    className={[
                      "relative p-4 rounded-2xl border transition hover:scale-[1.02] cursor-default",
                      style,
                      // ✅ 未解鎖：可讀但低一階（不要 grayscale，避免太淡）
                      isLocked ? "opacity-90" : "",
                    ].join(" ")}
                    title={meta.desc}
                  >
                    {/* Icon */}
                    <div className="text-4xl mb-2 text-center drop-shadow-sm">
                      {icon}
                    </div>

                    {/* Name */}
                    <div className="font-extrabold text-center text-base mb-1 text-neutral-900">
                      {meta.name}
                    </div>

                    {/* Desc */}
                    <div className="text-sm text-center text-neutral-800 min-h-[3em] flex flex-col items-center justify-center leading-snug">
                      <div>{meta.desc}</div>

                      {planned && (
                        <div className="mt-2 w-full rounded-xl border border-black/10 bg-white/50 p-2 text-xs text-neutral-800 leading-snug">
                          <div>
                            <span className="font-semibold">自訂條件：</span>
                            {planned.condition}
                          </div>
                          <div className="mt-1">
                            <span className="font-semibold">理由：</span>
                            {planned.justification || "—"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
                          style={{ width: `${Math.round(ratio * 100)}%` }}
                        />
                      </div>

                      {/* ✅ 讓「差多少升級」變主視覺 */}
                      <div className="mt-2 text-sm font-semibold text-neutral-900">
                        {diffText}
                      </div>

                      {/* 目前數值（放次要） */}
                      <div className="mt-1 text-xs text-neutral-700 leading-snug">
                        {!isReverse ? (
                          <>
                            目前：
                            <span className="font-mono font-semibold text-neutral-900">
                              {currentVal}
                            </span>
                          </>
                        ) : (
                          <>
                            最佳紀錄：
                            <span className="font-mono font-semibold text-neutral-900">
                              {currentVal > 0 ? `${currentVal} 秒` : "—"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-3 pt-2 border-t border-black/10 flex justify-between items-center text-xs">
                      <span className="font-mono font-semibold bg-black/10 px-2 py-1 rounded">
                        {tierName}
                      </span>
                      <span className="text-neutral-800 text-right leading-tight font-medium">
                        目標：
                        <br />銅 {bronze}／銀 {silver}／金 {gold}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
