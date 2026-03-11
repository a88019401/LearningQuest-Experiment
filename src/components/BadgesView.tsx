// src/components/BadgesView.tsx
import type {
  Progress,
  BadgeTier,
  BadgePlanConfig,
  CustomThresholds,
} from "../state/progress";
import {
  BADGE_QR,
  getBadgeValue,
  getEffectiveProgress,
} from "../state/progress";
import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./ui";

export const BADGE_META: Record<string, { name: string; desc: string }> = {
  GAME_LOVER: {
    name: "遊戲狂熱",
    desc: "在同一次遊戲連續挑戰中，最高連勝場數",
  },
  VOCAB_DRILLER: { name: "單字達人", desc: "完成「單字集」研讀次數累積" },
  GRAMMAR_NERD: { name: "文法專家", desc: "完成「文法說明」掌握/學習次數累積" },
  XP_COLLECTOR: { name: "經驗收藏家", desc: "累積總 XP 達到門檻" },
  REVIEWER: { name: "愛玩遊戲", desc: "累積遊玩遊戲場次達到門檻" },
  AUDIO_LEARNER: {
    name: "聽力小耳朵",
    desc: "點擊單字發音（播放音檔）累積次數",
  },
  SNAKE_MASTER: { name: "貪吃蛇王", desc: "單字測驗最佳分達到門檻" },
  TETRIS_ARCH: { name: "方塊建築師", desc: "文法方塊最高成績達到門檻" },
  SPEED_DEMON: {
    name: "極速傳說",
    desc: "挑戰區中「至少 1★」關卡的最快完成時間",
  },
  STAR_CATCHER: { name: "摘星者", desc: "挑戰區累積獲得星星數達到門檻" },
  ACCURACY_GOD: {
    name: "愛吃的蛇",
    desc: "貪吃蛇累積「答對的單字數」達到門檻",
  },
  LEVEL_CRUSHER: { name: "過關斬將", desc: "挑戰區通過的關卡數累積" },
  UNIT_MASTER: { name: "單元制霸", desc: "挑戰區累積獲得 3★ 的關卡數" },
  PERSISTENT: { name: "越挫越勇", desc: "累積錯誤次數達到門檻" },
  NEVER_GIVE_UP: { name: "永不放棄", desc: "按下重新開始/重試的次數累積" },
  TRY_HARD: { name: "勤能補拙", desc: "總嘗試次數累積（遊戲場次 + 重試次數）" },
  COMEBACK_KID: {
    name: "逆轉勝",
    desc: "挑戰同一關時，分數比過去最佳成績提升 ≥3 分的次數",
  },
  PRACTICE_MAKE: { name: "熟能生巧", desc: "累積遊玩遊戲場次達到門檻" },
  BRAVE_HEART: { name: "勇敢的心", desc: "挑戰失敗次數累積" },
  SURVIVOR: { name: "倖存者", desc: "驚險通關次數累積" },
};

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
const MAX_PLANS = 6;

const SRL_BADGE_TEMPLATES = [
  {
    key: "VOCAB_DRILLER",
    name: "單字達人",
    category: "學習類",
    method: "完成『單字集』研讀次數",
  },
  {
    key: "AUDIO_LEARNER",
    name: "聽力小耳朵",
    category: "學習類",
    method: "點擊播放單字發音",
  },
  {
    key: "SPEED_DEMON",
    name: "極速傳說",
    category: "技巧類",
    method: "挑戰區最快完成時間 (越小越好)",
  },
  {
    key: "UNIT_MASTER",
    name: "單元制霸",
    category: "技巧類",
    method: "獲得 3★ 的關卡數",
  },
  {
    key: "NEVER_GIVE_UP",
    name: "永不放棄",
    category: "鼓勵類",
    method: "重試/重新開始的次數",
  },
  {
    key: "COMEBACK_KID",
    name: "逆轉勝",
    category: "鼓勵類",
    method: "分數比過去最佳提升 ≥3 分的次數",
  },
];

function BadgePlanningPanel({
  plans,
  progress,
  upsertBadgePlan,
  retireBadgePlan,
  reflectBadgePlan,
}: {
  plans: BadgePlanConfig[];
  progress: Progress;
  upsertBadgePlan: (plan: BadgePlanConfig) => void;
  retireBadgePlan: (key: string, reason: string, note: string) => void;
  reflectBadgePlan: (key: string, reason: string, note: string) => void;
}) {
  const [rows, setRows] = useState(() =>
    SRL_BADGE_TEMPLATES.map((t) => ({
      ...t,
      thresholds: { bronze: 0, silver: 0, gold: 0 },
      confidence: 3,
      justification: "",
    })),
  );
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");

  const [retireOpen, setRetireOpen] = useState(false);
  const [retireKey, setRetireKey] = useState("");
  const [retireReason, setRetireReason] = useState("");
  const [retireNote, setRetireNote] = useState("");

  const [passOpen, setPassOpen] = useState(false);
  const [passKey, setPassKey] = useState("");
  const [passReason, setPassReason] = useState("");
  const [passNote, setPassNote] = useState("");

  const updateRow = (key: string, patch: any) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  const currentRow = useMemo(
    () => rows.find((r) => r.key === selectedKey),
    [rows, selectedKey],
  );

  const safeTierOf = (key: string): BadgeTier =>
    (progress.badges?.[key]?.tier as BadgeTier) || 0;

  // 🌟 精準的目標防呆邏輯
  const historicalBest = currentRow
    ? getBadgeValue(currentRow.key, progress)
    : 0;
  const isThresholdsValid = (key: string, t: CustomThresholds) => {
    if (!t || t.bronze <= 0 || t.silver <= 0 || t.gold <= 0) return false;
    if (key === "SPEED_DEMON") {
      if (!(t.bronze > t.silver && t.silver > t.gold)) return false; // 需越來越快
      if (historicalBest > 0 && t.bronze >= historicalBest) return false; // 必須打破歷史最佳
    } else {
      if (!(t.bronze < t.silver && t.silver < t.gold)) return false; // 一般要越來越多
    }
    return true;
  };

  const closeWizard = () => {
    setIsOpen(false);
    setStep(0);
    setSelectedKey("");
  };

  const openWizard = () => {
    if (plans.length >= MAX_PLANS) return;
    const last = plans[plans.length - 1];

    // 若上一枚未通關且未放棄 -> 強制先放棄
    if (last && !last.retired && safeTierOf(last.key) === 0) {
      setRetireKey(last.key);
      setRetireReason("");
      setRetireNote("");
      setRetireOpen(true);
      return;
    }
    // 若上一枚已通關且未反思 -> 強制先反思
    if (
      last &&
      !last.retired &&
      safeTierOf(last.key) >= 1 &&
      !last.passReflectReason
    ) {
      setPassKey(last.key);
      setPassReason("");
      setPassNote("");
      setPassOpen(true);
      return;
    }
    setStep(0);
    setSelectedKey("");
    setIsOpen(true);
  };

  const canNext = () => {
    if (step === 0) return !!selectedKey;
    if (!currentRow) return false;
    if (step === 1)
      return isThresholdsValid(currentRow.key, currentRow.thresholds);
    if (step === 2) return true;
    if (step === 3) return currentRow.justification.trim().length > 0;
    if (step === 4) return currentRow.name.trim().length > 0;
    return false;
  };

  const finishOne = () => {
    if (!currentRow) return;
    upsertBadgePlan({
      key: currentRow.key,
      name: currentRow.name,
      category: currentRow.category,
      method: currentRow.method,
      thresholds: currentRow.thresholds,
      confidence: currentRow.confidence,
      justification: currentRow.justification,
      updatedAt: new Date().toISOString(),
    });
    closeWizard();
  };

  const renderPlannedBadgeCard = (plan: BadgePlanConfig, index: number) => {
    const key = plan.key;
    const tier = safeTierOf(key);
    const style = TIER_STYLES[tier];
    const icon = TIER_ICONS[tier];

    const effectiveVal = getEffectiveProgress(key, progress);
    const isReverse = key === "SPEED_DEMON";

    const { bronze, silver, gold } = plan.thresholds;
    let nextTarget =
      tier === 0 ? bronze : tier === 1 ? silver : tier === 2 ? gold : 0;
    let nextTierLabel =
      tier === 0 ? "銅級" : tier === 1 ? "銀級" : tier === 2 ? "金級" : "";

    let diffText = "";
    if (tier === 3) diffText = "已達最高等級！";
    else if (!isReverse) {
      const remain = Math.max(0, nextTarget - effectiveVal);
      diffText =
        remain === 0 ? `已達 ${nextTierLabel} 門檻` : `還差 ${remain} 次升級`;
    } else {
      if (effectiveVal === 0) diffText = "設定後尚未有新紀錄";
      else if (effectiveVal <= nextTarget)
        diffText = `已達 ${nextTierLabel} 門檻`;
      else diffText = `再快 ${Math.round(effectiveVal - nextTarget)} 秒升級`;
    }

    let ratio = 0;
    if (!isReverse) ratio = gold > 0 ? Math.min(effectiveVal / gold, 1) : 0;
    else
      ratio =
        effectiveVal > 0
          ? effectiveVal <= gold
            ? 1
            : Math.min(bronze / effectiveVal, 1)
          : 0;

    const canRetire = !plan.retired && tier === 0;
    const needsReflect = !plan.retired && tier >= 1 && !plan.passReflectReason;

return (
      <div
        key={key}
        className={`relative p-4 rounded-2xl border transition ${style} ${plan.retired ? "opacity-60" : ""}`}
      >
        <div className="absolute top-3 left-3">
          <span className="text-[11px] font-mono font-semibold bg-black/10 px-2 py-1 rounded-full">
            第 {index + 1} 枚
          </span>
          {plan.retired && (
            <span className="ml-1 text-[11px] font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">
              已退休
            </span>
          )}
          {!plan.retired && tier > 0 && (
            <span className="ml-1 text-[11px] font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
              已達標
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex gap-2 z-20">
          <button
            onClick={() => {
              setPassKey(key);
              setPassOpen(true);
            }}
            disabled={!needsReflect}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${needsReflect ? "border-black bg-white text-black hover:bg-neutral-50" : "opacity-30 cursor-not-allowed"}`}
          >
            反思
          </button>
          <button
            onClick={() => {
              setRetireKey(key);
              setRetireOpen(true);
            }}
            disabled={!canRetire}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${canRetire ? "border-black bg-white text-black hover:bg-neutral-50" : "opacity-30 cursor-not-allowed"}`}
          >
            退休
          </button>
        </div>
        
        <div className="text-4xl mb-2 mt-6 text-center drop-shadow-sm">
          {icon}
        </div>
        
        {/* 🌟 學生自訂的偉大名字 */}
        <div className="font-extrabold text-center text-base mb-1 text-neutral-900">
          {plan.name}
        </div>
        
        {/* 🌟 新增：這枚獎章原本的任務與取得方法 */}
        <div className="text-xs text-center text-neutral-600 mb-3 px-2 leading-snug">
          {/*<span className="font-bold text-neutral-700">{BADGE_META[key]?.name}</span>：*/}
          {BADGE_META[key]?.desc || plan.method}
        </div>

        <div className="mt-3 w-full rounded-xl border border-black/10 bg-white/50 p-2 text-xs text-neutral-800 leading-snug">
          <div>
            <span className="font-semibold">挑戰目標：</span>銅 {bronze} | 銀{" "}
            {silver} | 金 {gold}
          </div>
          <div className="mt-1">
            <span className="font-semibold">理由：</span>
            {plan.justification}
          </div>
          {plan.passReflectReason && !plan.retired && (
            <div className="mt-2 pt-2 border-t border-black/10">
              <div>
                <span className="font-semibold text-green-700">通關反思：</span>
                {plan.passReflectReason}
              </div>
              {plan.passReflectNote && (
                <div className="mt-1 text-neutral-600">
                  {plan.passReflectNote}
                </div>
              )}
            </div>
          )}
          {plan.retired && (
            <div className="mt-2 pt-2 border-t border-black/10">
              <div>
                <span className="font-semibold text-red-700">退休原因：</span>
                {plan.retireReason}
              </div>
              {plan.retireNote && (
                <div className="mt-1 text-neutral-600">{plan.retireNote}</div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-sm font-semibold">{diffText}</div>
          <div className="mt-1 text-xs text-neutral-700 font-mono font-bold text-indigo-800">
            有效挑戰進度：{effectiveVal > 0 ? effectiveVal : "0"}{" "}
            {isReverse ? "秒" : "次"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-5">
      <SectionTitle
        title="🎯 獎章規劃面板 (SRL)"
        desc="決定目標、監控進度、反思學習，成為自己的學習主人！"
      />
      <div className="mt-3 flex justify-between items-center">
        <div className="text-sm text-neutral-700">
          已規劃：<span className="font-semibold">{plans.length}</span> /{" "}
          {MAX_PLANS}
        </div>
        <button
          onClick={openWizard}
          disabled={plans.length >= MAX_PLANS}
          className={`px-4 py-2 rounded-2xl text-sm font-medium border transition ${plans.length >= MAX_PLANS ? "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed" : "bg-neutral-900 text-white hover:bg-neutral-800"}`}
        >
          新增一個挑戰目標
        </button>
      </div>

      {plans.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map((p, i) => renderPlannedBadgeCard(p, i))}
        </div>
      )}

      {/* 🌟 設定目標 Wizard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-xl">
            {/* ✅ 絕對定位的關閉按鈕 */}
            <button
              onClick={closeWizard}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
              title="關閉"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">
              設定目標 (步驟 {step + 1} / 5)
            </h2>
            <div className="min-h-[200px] mt-2">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {rows.map((r) => {
                    // 🌟 防呆：尋找這枚獎章是否已經被設定過且尚未退休
                    const existingPlans = plans.filter((p) => p.key === r.key);
                    const lastPlan = existingPlans[existingPlans.length - 1];

                    let statusText = "";
                    let isDisabled = false;

                    if (lastPlan && !lastPlan.retired) {
                      const tier = safeTierOf(r.key);
                      if (tier > 0) {
                        statusText = "已通關";
                        isDisabled = true; // 已通關不允許再選
                      } else {
                        statusText = "進行中";
                        isDisabled = true; // 進行中不允許再選
                      }
                    }

                    return (
                      <button
                        key={r.key}
                        onClick={() => setSelectedKey(r.key)}
                        disabled={isDisabled}
                        className={`p-3 border rounded-xl text-left relative transition-all 
                          ${selectedKey === r.key ? "bg-neutral-900 text-white border-neutral-900 shadow-md" : "hover:bg-neutral-50 bg-white"} 
                          ${isDisabled ? "opacity-50 cursor-not-allowed bg-neutral-100 hover:bg-neutral-100 grayscale" : ""}`}
                      >
                        <div className="font-bold text-sm flex justify-between items-center">
                          {r.name}
                          {statusText && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-normal ${selectedKey === r.key ? "bg-white/20" : "bg-black/10 text-neutral-800"}`}
                            >
                              {statusText}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs mt-1 ${selectedKey === r.key ? "text-neutral-300" : "opacity-80"}`}
                        >
                          {r.method}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {step === 1 && currentRow && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-900">
                    <strong>歷史提示：</strong>
                    {currentRow.key === "SPEED_DEMON"
                      ? historicalBest > 0
                        ? `你目前的最佳紀錄是 ${historicalBest} 秒，挑戰自己吧！`
                        : "你還沒玩過挑戰區，先預設一個秒數目標吧！"
                      : `這個任務會從你按下設定的這一刻「從 0 開始」累積計算喔！`}
                  </div>
                  <p className="text-sm font-bold">
                    請輸入你要挑戰的數字 (例如：我要再多做 15 次)：
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-amber-700 font-bold mb-1">
                        銅級
                      </label>
                      <input
                        type="number"
                        value={currentRow.thresholds.bronze || ""}
                        onChange={(e) =>
                          updateRow(currentRow.key, {
                            thresholds: {
                              ...currentRow.thresholds,
                              bronze: Number(e.target.value),
                            },
                          })
                        }
                        className="border p-2 w-full rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1">
                        銀級
                      </label>
                      <input
                        type="number"
                        value={currentRow.thresholds.silver || ""}
                        onChange={(e) =>
                          updateRow(currentRow.key, {
                            thresholds: {
                              ...currentRow.thresholds,
                              silver: Number(e.target.value),
                            },
                          })
                        }
                        className="border p-2 w-full rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-yellow-600 font-bold mb-1">
                        金級
                      </label>
                      <input
                        type="number"
                        value={currentRow.thresholds.gold || ""}
                        onChange={(e) =>
                          updateRow(currentRow.key, {
                            thresholds: {
                              ...currentRow.thresholds,
                              gold: Number(e.target.value),
                            },
                          })
                        }
                        className="border p-2 w-full rounded-xl"
                      />
                    </div>
                  </div>
                  {!isThresholdsValid(
                    currentRow.key,
                    currentRow.thresholds,
                  ) && (
                    <p className="text-red-500 text-xs font-bold">
                      ⚠️
                      數值不合理！(極速傳說秒數須遞減且小於歷史最佳，其他需遞增且大於0)
                    </p>
                  )}
                </div>
              )}
              {step === 2 && currentRow && (
                <div>
                  <p className="font-bold mb-3">
                    你有多大的信心能達成呢？(1-5分)
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() =>
                          updateRow(currentRow.key, { confidence: n })
                        }
                        className={`px-5 py-3 border rounded-xl font-bold transition ${currentRow.confidence === n ? "bg-neutral-900 text-white" : "hover:bg-neutral-50 bg-white"}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && currentRow && (
                <div>
                  <p className="font-bold mb-3">為什麼想選這個目標？</p>
                  <textarea
                    rows={4}
                    className="border p-3 w-full rounded-xl outline-none focus:ring-2 focus:ring-neutral-400"
                    placeholder="一句話記錄下來，通關時可以回顧..."
                    value={currentRow.justification}
                    onChange={(e) =>
                      updateRow(currentRow.key, {
                        justification: e.target.value,
                      })
                    }
                  />
                </div>
              )}
              {step === 4 && currentRow && (
                <div>
                  <p className="font-bold mb-3">幫你的挑戰取個響亮的名字！</p>
                  <input
                    className="border p-3 w-full rounded-xl outline-none focus:ring-2 focus:ring-neutral-400"
                    placeholder="例如：單字破壞者"
                    value={currentRow.name}
                    onChange={(e) =>
                      updateRow(currentRow.key, { name: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-4 py-2 border rounded-xl disabled:opacity-30 hover:bg-neutral-50 transition"
              >
                上一步
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext()}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl disabled:opacity-30 hover:bg-neutral-800 transition"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={finishOne}
                  disabled={!canNext()}
                  className="px-6 py-2 bg-indigo-600 font-bold text-white rounded-xl shadow-lg disabled:opacity-30 hover:bg-indigo-700 transition"
                >
                  正式立下目標！
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🌟 退休 Modal */}
      {retireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <button
              onClick={() => setRetireOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
              title="關閉"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="font-bold text-lg mb-1 text-red-700">
              放棄/退休這枚獎章
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              誠實面對自己也是一種學習，請記錄下放棄的原因供後續研究分析。
            </p>
            <select
              value={retireReason}
              onChange={(e) => setRetireReason(e.target.value)}
              className="w-full border p-3 mb-3 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="">請選擇主要原因...</option>
              <option value="目標設太高">目標設太高</option>
              <option value="時間/策略不足">時間/策略不足</option>
              <option value="失去動機/不適合">失去動機/不適合</option>
              <option value="其他">其他</option>
            </select>

            {/* 🌟 強制填寫區塊 */}
            <textarea
              value={retireNote}
              onChange={(e) => setRetireNote(e.target.value)}
              className={`w-full border p-3 mb-1 rounded-xl bg-neutral-50 outline-none focus:ring-2 ${retireNote.trim().length >= 8 ? "focus:ring-green-400 border-green-200" : "focus:ring-red-200"}`}
              placeholder="補充說明 (例如：我原本以為每天10次很容易，但...)"
              rows={3}
            />
            <div
              className={`text-xs text-right mb-2 font-bold ${retireNote.trim().length >= 8 ? "text-green-600" : "text-red-500"}`}
            >
              {retireNote.trim().length >= 8
                ? "✅ 字數達標"
                : `⚠️ 必須填寫至少 8 個字 (目前：${retireNote.trim().length} 字)`}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRetireOpen(false)}
                className="px-4 py-2 border rounded-xl hover:bg-neutral-50"
              >
                取消
              </button>
              {/* 🌟 雙重鎖定：沒選原因 或 字數不到 8 字，按鈕就反灰 */}
              <button
                disabled={!retireReason || retireNote.trim().length < 8}
                onClick={() => {
                  retireBadgePlan(retireKey, retireReason, retireNote);
                  setRetireOpen(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold shadow-md disabled:opacity-30 hover:bg-red-700 transition"
              >
                確定放棄寫入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 反思 Modal */}
      {passOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
            <button
              onClick={() => setPassOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition"
              title="關閉"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="font-bold text-lg mb-1 text-green-700">
              恭喜通關！進行反思
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              你成功達成自己設定的目標了！回顧一下你是怎麼做到的？
            </p>
            <select
              value={passReason}
              onChange={(e) => setPassReason(e.target.value)}
              className="w-full border p-3 mb-3 rounded-xl bg-neutral-50 outline-none focus:ring-2 focus:ring-green-200"
            >
              <option value="">請選擇主要原因...</option>
              <option value="目標設定剛好">目標設定剛好</option>
              <option value="策略有效">策略有效（例如拆分任務）</option>
              <option value="其實偏簡單">其實偏簡單（下次可加強）</option>
              <option value="其他">其他</option>
            </select>

            {/* 🌟 強制填寫區塊 */}
            <textarea
              value={passNote}
              onChange={(e) => setPassNote(e.target.value)}
              className={`w-full border p-3 mb-1 rounded-xl bg-neutral-50 outline-none focus:ring-2 ${passNote.trim().length >= 8 ? "focus:ring-green-400 border-green-200" : "focus:ring-green-200"}`}
              placeholder="補充說明 (例如：我每天固定睡前玩兩場，效果很好...)"
              rows={3}
            />
            <div
              className={`text-xs text-right mb-2 font-bold ${passNote.trim().length >= 8 ? "text-green-600" : "text-red-500"}`}
            >
              {passNote.trim().length >= 8
                ? "✅ 字數達標"
                : `⚠️ 必須分享至少 8 個字 (目前：${passNote.trim().length} 字)`}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setPassOpen(false)}
                className="px-4 py-2 border rounded-xl hover:bg-neutral-50"
              >
                取消
              </button>
              {/* 🌟 雙重鎖定：沒選原因 或 字數不到 8 字，按鈕就反灰 */}
              <button
                disabled={!passReason || passNote.trim().length < 8}
                onClick={() => {
                  reflectBadgePlan(passKey, passReason, passNote);
                  setPassOpen(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-md disabled:opacity-30 hover:bg-green-700 transition"
              >
                記錄反思寫入
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function BadgesView({
  progress,
  upsertBadgePlan,
  retireBadgePlan,
  reflectBadgePlan,
}: {
  progress: Progress;
  upsertBadgePlan: any;
  retireBadgePlan: any;
  reflectBadgePlan: any;
}) {
  const plans = Object.values(progress.badgePlans ?? {});
  const categories: Record<
    "participation" | "skill" | "encouragement",
    string
  > = {
    participation: "參與類 Participation",
    skill: "技巧類 Skill",
    encouragement: "鼓勵類 Encouragement",
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 🌟 實驗組永遠顯示 SRL 面板 */}
      <BadgePlanningPanel
        plans={plans}
        progress={progress}
        upsertBadgePlan={upsertBadgePlan}
        retireBadgePlan={retireBadgePlan}
        reflectBadgePlan={reflectBadgePlan}
      />

      {/* 下方：傳統獎章牆 (永遠排除 6 枚 SRL 獎章) */}
      {(["participation", "skill", "encouragement"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h3 className="text-2xl font-extrabold text-neutral-900 border-l-4 border-neutral-900 pl-3">
            {categories[cat]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(BADGE_QR)
              .filter(([, cfg]) => cfg.type === cat)
              .filter(
                ([key]) =>
                  !(SRL_HIDDEN_KEYS as readonly string[]).includes(key),
              ) // 永遠隱藏！
              .map(([key, cfg]) => {
                const meta = BADGE_META[key] ?? { name: key, desc: "" };
                const userBadge = progress.badges[key] ?? {
                  tier: 0 as BadgeTier,
                };
                const tier = (
                  typeof userBadge.tier === "string"
                    ? Number(userBadge.tier)
                    : userBadge.tier
                ) as BadgeTier;

                const style = TIER_STYLES[tier];
                const icon = TIER_ICONS[tier];
                const tierName = TIER_NAMES[tier];
                const [bronze, silver, gold] = cfg.thresholds;
                const currentVal = getBadgeValue(key, progress);
                const isReverse = !!cfg.reverse;

                let nextTarget =
                  tier === 0
                    ? bronze
                    : tier === 1
                      ? silver
                      : tier === 2
                        ? gold
                        : 0;
                let nextTierLabel =
                  tier === 0
                    ? "銅級"
                    : tier === 1
                      ? "銀級"
                      : tier === 2
                        ? "金級"
                        : "";

                let diffText =
                  tier === 3
                    ? "已達最高等級！"
                    : !isReverse
                      ? Math.max(0, nextTarget - currentVal) === 0
                        ? `已達 ${nextTierLabel} 門檻`
                        : `還差 ${Math.max(0, nextTarget - currentVal)} 升級`
                      : currentVal === 0
                        ? "尚未有紀錄"
                        : currentVal <= nextTarget
                          ? `已達 ${nextTierLabel} 門檻`
                          : `再快約 ${Math.round(currentVal - nextTarget)} 秒升級`;

                let ratio = !isReverse
                  ? gold > 0
                    ? Math.min(currentVal / gold, 1)
                    : 0
                  : currentVal > 0
                    ? currentVal <= gold
                      ? 1
                      : Math.min(bronze / currentVal, 1)
                    : 0;

                return (
                  <div
                    key={key}
                    className={[
                      "relative p-4 rounded-2xl border transition hover:scale-[1.02] cursor-default",
                      style,
                      tier === 0 ? "opacity-90" : "",
                    ].join(" ")}
                    title={meta.desc}
                  >
                    <div className="text-4xl mb-2 text-center drop-shadow-sm">
                      {icon}
                    </div>
                    <div className="font-extrabold text-center text-base mb-1 text-neutral-900">
                      {meta.name}
                    </div>
                    <div className="text-sm text-center text-neutral-800 min-h-[3em] flex items-center justify-center leading-snug">
                      {meta.desc}
                    </div>
                    <div className="mt-3">
                      <div className="h-2 w-full rounded-full bg-black/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
                          style={{ width: `${Math.round(ratio * 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm font-semibold text-neutral-900">
                        {diffText}
                      </div>
                      <div className="mt-1 text-xs text-neutral-700 leading-snug">
                        目前：
                        <span className="font-mono font-semibold text-neutral-900">
                          {currentVal > 0 ? currentVal : "—"}{" "}
                          {isReverse ? "秒" : ""}
                        </span>
                      </div>
                    </div>
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
