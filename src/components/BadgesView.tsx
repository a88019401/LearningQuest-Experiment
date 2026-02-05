// src/components/BadgesView.tsx
import type { Progress, BadgeTier } from "../state/progress";
import { BADGE_QR, getBadgeValue } from "../state/progress";

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

export default function BadgesView({ progress }: { progress: Progress }) {
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
      {(["participation", "skill", "encouragement"] as const).map((cat) => (
        <section key={cat} className="space-y-3">
          <h3 className="text-2xl font-extrabold text-neutral-900 border-l-4 border-neutral-900 pl-3">
            {categories[cat]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(BADGE_QR)
              .filter(([, cfg]) => cfg.type === cat)
              .map(([key, cfg]) => {
                const meta = BADGE_META[key] ?? { name: key, desc: "" };
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
                      faster
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
                    <div className="text-sm text-center text-neutral-800 min-h-[3em] flex items-center justify-center leading-snug">
                      {meta.desc}
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
