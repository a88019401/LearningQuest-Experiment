// src/components/BadgesView.tsx
import type { Progress, BadgeTier } from "../state/progress";
import { BADGE_QR, getBadgeValue } from "../state/progress";
import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./ui";

// 顯示文字（名稱 + 說明）
export const BADGE_META: Record<string, { name: string; desc: string }> = {
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

// === SRL 規劃資料型別 ===
type BadgePlanCategory = "學習類" | "技巧類" | "鼓勵類";

type BadgePlanRow = {
  key: string;
  name: string;
  category: BadgePlanCategory;
  method: string;
  condition: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  justification: string;
};

type PlannedBadge = BadgePlanRow & {
  slot: number; // 第幾次規劃（1..MAX_PLANS）
  retired?: boolean;
  retireReason?: string;
  retireNote?: string;

  // ✅ 通關反思（tier>=1 才會要求在開始下一枚前填寫）
  passReflectReason?: string; // 下拉原因
  passReflectNote?: string; // 自由輸入
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
  plans,
  onAddPlan,
  onRetirePlan,
  onPassReflect,
  maxPlans,
  progress,
}: {
  plans: PlannedBadge[];
  onAddPlan: (row: BadgePlanRow) => void;
  onRetirePlan: (slot: number, reason: string, note: string) => void;
  onPassReflect: (slot: number, reason: string, note: string) => void;
  maxPlans: number;
  progress: Progress;
}) {
  const [rows, setRows] = useState<BadgePlanRow[]>(() =>
    SRL_BADGE_TEMPLATES.map((t) => ({
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

  // 退休 modal
  const [retireOpen, setRetireOpen] = useState(false);
  const [retireSlot, setRetireSlot] = useState<number | null>(null);
  const [retireReason, setRetireReason] = useState<string>("");
  const [retireNote, setRetireNote] = useState<string>("");

  // ✅ 通關反思 modal
  const [passOpen, setPassOpen] = useState(false);
  const [passSlot, setPassSlot] = useState<number | null>(null);
  const [passReason, setPassReason] = useState<string>("");
  const [passNote, setPassNote] = useState<string>("");

  const updateRowByKey = (key: string, patch: Partial<BadgePlanRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const currentRow = useMemo(
    () => rows.find((r) => r.key === selectedKey),
    [rows, selectedKey],
  );

  const safeTierOf = (key: string): BadgeTier => {
    const rawTier = (progress.badges?.[key] as any)?.tier ?? 0;
    const tierNum = typeof rawTier === "string" ? Number(rawTier) : rawTier;
    return tierNum === 1 || tierNum === 2 || tierNum === 3 ? tierNum : 0;
  };

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

  const closeWizard = () => {
    setIsOpen(false);
    resetWizard();
  };

  const openRetireForSlot = (slot: number) => {
    const target = plans.find((p) => p.slot === slot);
    setRetireSlot(slot);
    setRetireReason(target?.retireReason ?? "");
    setRetireNote(target?.retireNote ?? "");
    setRetireOpen(true);
  };

  const openPassReflectForSlot = (slot: number) => {
    const target = plans.find((p) => p.slot === slot);
    setPassSlot(slot);
    setPassReason(target?.passReflectReason ?? "");
    setPassNote(target?.passReflectNote ?? "");
    setPassOpen(true);
  };

  const openWizard = () => {
    if (plans.length >= maxPlans) return;

    const last = plans[plans.length - 1];

    // ✅ 1) 上一枚未通關且未退休 → 必須先退休
    if (last && !last.retired && safeTierOf(last.key) === 0) {
      openRetireForSlot(last.slot);
      return;
    }

    // ✅ 2) 上一枚已通關（銅牌就算）但尚未反思 → 必須先反思
    if (last && !last.retired && safeTierOf(last.key) >= 1) {
      const hasPassReflect =
        (last.passReflectReason?.trim()?.length ?? 0) > 0 ||
        (last.passReflectNote?.trim()?.length ?? 0) > 0;

      if (!hasPassReflect) {
        openPassReflectForSlot(last.slot);
        return;
      }
    }

    setIsOpen(true);
    resetWizard();
  };

  const canNext = () => {
    if (step === 0) return !!selectedKey;
    if (!currentRow) return false;
    if (step === 1) return currentRow.condition.trim().length > 0;
    if (step === 2) return true;
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
    onAddPlan(currentRow);
    closeWizard();
  };

  const plannedCount = plans.length;
  const reachedLimit = plannedCount >= maxPlans;

  const retireCanSubmit = retireReason.trim().length > 0;
  const submitRetire = () => {
    if (retireSlot == null) return;
    if (!retireCanSubmit) return;
    onRetirePlan(retireSlot, retireReason, retireNote);
    setRetireOpen(false);
    setRetireSlot(null);
    setRetireReason("");
    setRetireNote("");
  };

  const passCanSubmit = passReason.trim().length > 0;
  const submitPassReflect = () => {
    if (passSlot == null) return;
    if (!passCanSubmit) return;
    onPassReflect(passSlot, passReason, passNote);
    setPassOpen(false);
    setPassSlot(null);
    setPassReason("");
    setPassNote("");
  };

  // SRL 卡片（外觀跟原本 badge 卡一致）
  const renderPlannedBadgeCard = (plan: PlannedBadge) => {
    const key = plan.key;
    const cfg = (BADGE_QR as any)[key];
    if (!cfg) return null;

    const tier = safeTierOf(key);
    const style = TIER_STYLES[tier];
    const icon = TIER_ICONS[tier];
    const tierName = TIER_NAMES[tier];

    const [bronze, silver, gold] = cfg.thresholds as [number, number, number];
    const currentVal = getBadgeValue(key, progress);
    const isReverse = !!cfg.reverse;

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
    if (tier === 3) diffText = "已達最高等級！";
    else if (!isReverse) {
      const remain = Math.max(0, nextTarget - currentVal);
      diffText =
        remain === 0
          ? `已達 ${nextTierLabel} 門檻`
          : `還差 ${remain} 才能升到 ${nextTierLabel}`;
    } else {
      if (currentVal === 0) diffText = "尚未有紀錄，先完成一次挑戰看看。";
      else if (currentVal <= nextTarget)
        diffText = `已達 ${nextTierLabel} 門檻`;
      else
        diffText = `再快約 ${Math.round(currentVal - nextTarget)} 秒，可達 ${nextTierLabel}`;
    }

    let ratio = 0;
    if (!isReverse) ratio = gold > 0 ? Math.min(currentVal / gold, 1) : 0;
    else {
      if (currentVal > 0)
        ratio = currentVal <= gold ? 1 : Math.min(bronze / currentVal, 1);
      else ratio = 0;
    }

    const canRetire = !plan.retired && tier === 0;

    const needsPassReflect =
      !plan.retired &&
      tier >= 1 &&
      (plan.passReflectReason?.trim()?.length ?? 0) === 0 &&
      (plan.passReflectNote?.trim()?.length ?? 0) === 0;

    return (
      <div
        key={plan.slot}
        className={[
          "relative p-4 rounded-2xl border transition",
          style,
          plan.retired ? "opacity-70" : "",
        ].join(" ")}
      >
        {/* slot / status */}
        <div className="absolute top-3 left-3 flex gap-2 items-center">
          <span className="text-[11px] font-mono font-semibold bg-black/10 px-2 py-1 rounded-full">
            第 {plan.slot} 枚
          </span>
          {plan.retired && (
            <span className="text-[11px] font-semibold bg-black/10 px-2 py-1 rounded-full">
              已退休
            </span>
          )}
          {!plan.retired && tier > 0 && (
            <span className="text-[11px] font-semibold bg-black/10 px-2 py-1 rounded-full">
              已通關
            </span>
          )}
        </div>

        {/* top-right buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-20">
          {/* ✅ 反思（通關後才會亮，且尚未填寫才亮） */}
          <button
            type="button"
            onClick={() => openPassReflectForSlot(plan.slot)}
            disabled={!needsPassReflect}
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold border transition",
              needsPassReflect
                ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
                : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
            ].join(" ")}
            title={
              needsPassReflect
                ? "為這枚已通關的獎章留下反思"
                : "已填過反思或尚未通關"
            }
          >
            反思
          </button>

          {/* 退休 */}
          <button
            type="button"
            onClick={() => {
              console.log("RETIRE CLICK", plan.slot, {
                canRetire,
                tier,
                retired: plan.retired,
              });
              openRetireForSlot(plan.slot);
            }}
            disabled={!canRetire}
            className={[
              "px-3 py-1 rounded-full text-xs font-semibold border transition",
              canRetire
                ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
                : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
            ].join(" ")}
            title={canRetire ? "退休這枚獎章" : "通關後或已退休不可再退休"}
          >
            退休
          </button>
        </div>

        {/* Icon */}
        <div className="text-4xl mb-2 text-center drop-shadow-sm">{icon}</div>

        {/* Name */}
        <div className="font-extrabold text-center text-base mb-1 text-neutral-900">
          {plan.name}
        </div>

        {/* Desc + planned info */}
        <div className="text-sm text-center text-neutral-800 min-h-[3em] flex flex-col items-center justify-center leading-snug">
          <div>{(BADGE_META as any)[key]?.desc ?? ""}</div>

          <div className="mt-2 w-full rounded-xl border border-black/10 bg-white/50 p-2 text-xs text-neutral-800 leading-snug">
            <div>
              <span className="font-semibold">自訂條件：</span>
              {plan.condition}
            </div>
            <div className="mt-1">
              <span className="font-semibold">理由：</span>
              {plan.justification || "—"}
            </div>

            {/* ✅ 通關反思顯示 */}
            {(plan.passReflectReason || plan.passReflectNote) &&
              !plan.retired &&
              tier >= 1 && (
                <div className="mt-2 pt-2 border-t border-black/10">
                  <div>
                    <span className="font-semibold">通關反思：</span>
                    {plan.passReflectReason || "—"}
                  </div>
                  <div className="mt-1">
                    <span className="font-semibold">補充：</span>
                    {plan.passReflectNote || "—"}
                  </div>
                </div>
              )}

            {/* 退休顯示 */}
            {plan.retired && (
              <div className="mt-2 pt-2 border-t border-black/10">
                <div>
                  <span className="font-semibold">退休原因：</span>
                  {plan.retireReason || "—"}
                </div>
                <div className="mt-1">
                  <span className="font-semibold">說明：</span>
                  {plan.retireNote || "—"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
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
  };

  return (
    <Card className="p-5">
      <SectionTitle
        title="獎章規劃（SRL）"
        desc="一步一步引導式填寫：先選任務 → 設定條件 → 評估信心 → 說明理由 → 命名。此階段僅 UI，不會儲存。"
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

      {/* 規劃完成的 SRL badge：放在 SRL 大框內 */}
      {plans.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.map(renderPlannedBadgeCard)}
        </div>
      )}

      {/* Wizard Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeWizard} />
          <div className="relative w-[92vw] max-w-2xl">
            <Card className="p-5">
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

              <div className="mt-5 space-y-4">
                {step === 0 && (
                  <div className="space-y-3">
                    <div className="text-sm text-neutral-700">
                      請選擇你想挑戰的獎章任務～
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rows.map((r) => {
                        const active = r.key === selectedKey;
                        const usedBefore = plans.some((p) => p.key === r.key);
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
                                {usedBefore ? "（已規劃過）" : ""}
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
                  </div>
                )}

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
                  </div>
                )}

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
                  </div>
                )}

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
                  </div>
                )}

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
                  </div>
                )}
              </div>

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
                ※ UI 示意：不會寫入 Supabase、不會真正啟用獎章。
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 退休 Modal */}
      {retireOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setRetireOpen(false)}
          />
          <div className="relative w-[92vw] max-w-xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold text-neutral-900">
                    退休這枚獎章
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    若上一枚還沒通關，開始下一次規劃前需要先退休，並留下反思回饋。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRetireOpen(false)}
                  className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs text-neutral-600">
                  為什麼沒有達成？（原因）
                </label>
                <select
                  value={retireReason}
                  onChange={(e) => setRetireReason(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                >
                  <option value="">請選擇…</option>
                  <option value="目標設太高">目標設太高</option>
                  <option value="時間/策略不足">時間/策略不足</option>
                  <option value="能力不足/還沒準備好">
                    能力不足/還沒準備好
                  </option>
                  <option value="失去動機/不適合">失去動機/不適合</option>
                  <option value="其他">其他</option>
                </select>

                <label className="block text-xs text-neutral-600">
                  補充說明（可打字）
                </label>
                <textarea
                  value={retireNote}
                  onChange={(e) => setRetireNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                  placeholder="例如：我把條件設太高，導致中途放棄；下次我會把每日次數調低…"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRetireOpen(false)}
                    className="px-4 py-2 rounded-2xl text-sm font-medium border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submitRetire}
                    disabled={!retireCanSubmit}
                    className={[
                      "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                      retireCanSubmit
                        ? "border-neutral-900 bg-neutral-900 text-white hover:opacity-90"
                        : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
                    ].join(" ")}
                  >
                    確認退休
                  </button>
                </div>

                <div className="text-xs text-neutral-500">
                  ※ UI 示意：目前只在前端 state 記錄，不會寫入資料庫。
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ✅ 通關反思 Modal（銅牌就算通關） */}
      {passOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPassOpen(false)}
          />
          <div className="relative w-[92vw] max-w-xl">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xl font-extrabold text-neutral-900">
                    通關反思
                  </div>
                  <div className="text-sm text-neutral-600 mt-1">
                    在開始下一枚獎章規劃前，先回顧一下這枚「已通關」的獎章：你是怎麼做到的？
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPassOpen(false)}
                  className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block text-xs text-neutral-600">
                  你覺得為什麼能達成？（原因）
                </label>
                <select
                  value={passReason}
                  onChange={(e) => setPassReason(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                >
                  <option value="">請選擇…</option>
                  <option value="目標設定剛好">目標設定剛好</option>
                  <option value="策略有效（例如拆分任務/固定時段）">
                    策略有效（例如拆分任務/固定時段）
                  </option>
                  <option value="動機很強/很投入">動機很強/很投入</option>
                  <option value="其實偏簡單（下次可加強）">
                    其實偏簡單（下次可加強）
                  </option>
                  <option value="其他">其他</option>
                </select>

                <label className="block text-xs text-neutral-600">
                  補充說明（可打字）
                </label>
                <textarea
                  value={passNote}
                  onChange={(e) => setPassNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400"
                  placeholder="例如：我把目標拆成每天 10 次，並固定在通勤時間做，所以很穩定達成…"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPassOpen(false)}
                    className="px-4 py-2 rounded-2xl text-sm font-medium border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={submitPassReflect}
                    disabled={!passCanSubmit}
                    className={[
                      "px-4 py-2 rounded-2xl text-sm font-medium border transition",
                      passCanSubmit
                        ? "border-neutral-900 bg-neutral-900 text-white hover:opacity-90"
                        : "border-neutral-200 bg-white text-neutral-300 cursor-not-allowed",
                    ].join(" ")}
                  >
                    確認反思並繼續
                  </button>
                </div>

                <div className="text-xs text-neutral-500">
                  ※ UI 示意：目前只在前端 state 記錄，不會寫入資料庫。
                </div>
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

  const [plans, setPlans] = useState<PlannedBadge[]>([]);

  const onAddPlan = (row: BadgePlanRow) => {
    setPlans((prev) => {
      const slot = prev.length + 1;
      if (slot > MAX_PLANS) return prev;
      return [...prev, { ...row, slot, retired: false }];
    });
  };

  const onRetirePlan = (slot: number, reason: string, note: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.slot === slot
          ? { ...p, retired: true, retireReason: reason, retireNote: note }
          : p,
      ),
    );
  };

  const onPassReflect = (slot: number, reason: string, note: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.slot === slot
          ? { ...p, passReflectReason: reason, passReflectNote: note }
          : p,
      ),
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <BadgePlanningPanel
        plans={plans}
        onAddPlan={onAddPlan}
        onRetirePlan={onRetirePlan}
        onPassReflect={onPassReflect}
        maxPlans={MAX_PLANS}
        progress={progress}
      />

      {(["participation", "skill", "encouragement"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h3 className="text-2xl font-extrabold text-neutral-900 border-l-4 border-neutral-900 pl-3">
            {categories[cat]}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(BADGE_QR)
              .filter(([, cfg]) => cfg.type === cat)
              // ✅ SRL 6 枚：永遠不出現在下面牆（只在上面 SRL 大框顯示）
              .filter(
                ([key]) =>
                  !(SRL_HIDDEN_KEYS as readonly string[]).includes(key),
              )
              .map(([key, cfg]) => {
                const meta = BADGE_META[key] ?? { name: key, desc: "" };
                const userBadge = progress.badges[key] ?? {
                  tier: 0 as BadgeTier,
                };

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
                if (tier === 3) diffText = "已達最高等級！";
                else if (!isReverse) {
                  const remain = Math.max(0, nextTarget - currentVal);
                  diffText =
                    remain === 0
                      ? `已達 ${nextTierLabel} 門檻`
                      : `還差 ${remain} 才能升到 ${nextTierLabel}`;
                } else {
                  if (currentVal === 0)
                    diffText = "尚未有紀錄，先完成一次挑戰看看。";
                  else if (currentVal <= nextTarget)
                    diffText = `已達 ${nextTierLabel} 門檻`;
                  else
                    diffText = `再快約 ${Math.round(currentVal - nextTarget)} 秒，可達 ${nextTierLabel}`;
                }

                let ratio = 0;
                if (!isReverse)
                  ratio = gold > 0 ? Math.min(currentVal / gold, 1) : 0;
                else {
                  if (currentVal > 0)
                    ratio =
                      currentVal <= gold ? 1 : Math.min(bronze / currentVal, 1);
                  else ratio = 0;
                }

                const isLocked = tier === 0;

                return (
                  <div
                    key={key}
                    className={[
                      "relative p-4 rounded-2xl border transition hover:scale-[1.02] cursor-default",
                      style,
                      isLocked ? "opacity-90" : "",
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
                          className="h-full rounded-full bg-gradient-to-r-r from-amber-400 to-yellow-300 transition-all"
                          style={{ width: `${Math.round(ratio * 100)}%` }}
                        />
                      </div>

                      <div className="mt-2 text-sm font-semibold text-neutral-900">
                        {diffText}
                      </div>

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
