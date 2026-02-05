// src/components/GrammarExplain.tsx
import { useState } from "react";
import type { GrammarPoint } from "../types";
import { Card, SectionTitle } from "./ui";

type Props = {
  points: GrammarPoint[];
  onAcquire?: (index: number) => void;
  onComplete?: () => void;
};

export default function GrammarExplain({ points, onAcquire, onComplete }: Props) {
  const [mastered, setMastered] = useState<Set<number>>(new Set());
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const progress = points.length > 0 ? Math.round((mastered.size / points.length) * 100) : 100;
  const isAllMastered = mastered.size === points.length;

  const handleMaster = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mastered.has(index)) {
      const next = new Set(mastered);
      next.add(index);
      setMastered(next);
      onAcquire?.(index);
      setActiveCard(null);
    }
  };

  return (
    <div className="space-y-6 p-1"> {/* 加一點 padding 避免陰影被切 */}
      {/* 頂部儀表板 */}
      <Card className="border-b-4 border-neutral-200 overflow-hidden relative">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <SectionTitle title="⚡ 文法技能樹 (Skill Tree)" />
          <div className="text-right">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sync Rate</span>
            <div className="text-2xl font-black font-mono text-indigo-600">{progress}%</div>
          </div>
        </div>
        
        {/* 能量條動畫 (改用 CSS inline style 處理動畫，不需改 config) */}
        <div className="relative w-full h-3 bg-neutral-100 rounded-full overflow-hidden shadow-inner mt-2">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* 純 CSS 掃光動畫 */}
          <style>{`
            @keyframes shimmer-move {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
          <div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{ 
              animation: 'shimmer-move 2s infinite linear' // 直接在這裡寫動畫
            }} 
          />
        </div>
      </Card>

      {/* 卡片網格區：加入 items-start 防止拉伸 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {points.map((g, i) => {
          const isMastered = mastered.has(i);
          const isActive = activeCard === i;

          return (
            <div
              key={i}
              onClick={() => setActiveCard(isActive ? null : i)}
              className={`
                relative group cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${
                  isMastered
                    ? "border-emerald-400 bg-emerald-50 shadow-sm scale-[0.98] opacity-80 hover:opacity-100" // 已掌握
                    : isActive
                    ? "border-indigo-500 bg-white ring-4 ring-indigo-100 shadow-xl scale-[1.02] z-20" // 展開中 (加了 z-20 確保蓋在上面)
                    : "border-neutral-200 bg-white hover:border-indigo-300 hover:shadow-md z-0" // 預設
                }
              `}
            >
              {/* 卡片標題區 */}
              <div className="p-4 flex items-start gap-3">
                <div 
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-colors
                    ${isMastered ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"}
                  `}
                >
                  {isMastered ? "✓" : i + 1}
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-lg leading-tight ${isMastered ? "text-emerald-800 line-through opacity-70" : "text-neutral-800"}`}>
                    {g.point}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-mono">
                    {isMastered ? "STATUS: COMPLETED" : isActive ? "STATUS: LEARNING..." : "CLICK TO UNLOCK"}
                  </p>
                </div>
              </div>

              {/* 展開內容區 */}
              <div 
                className={`
                  transition-all duration-500 ease-in-out bg-neutral-50/50
                  ${isActive ? "max-h-[800px] opacity-100 border-t border-indigo-100" : "max-h-0 opacity-0"}
                `}
              >
                <div className="p-5 space-y-4">
                  <div className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-100 shadow-sm">
                    <span className="text-indigo-500 font-bold text-lg mr-2">💡</span>
                    {g.desc}
                  </div>

                  {/* 例句區 (含翻譯功能) */}
                  <div className="bg-slate-800 rounded-xl p-4 text-slate-200 font-mono text-sm relative overflow-visible shadow-inner">
                    <div className="absolute top-0 right-0 px-2 py-1 bg-slate-700 rounded-bl-lg text-xs text-slate-400 select-none">EXAMPLES</div>
                    <ul className="space-y-3 mt-2">
                      {g.examples.map((ex, j) => {
                        // 判斷是純字串還是物件
                        const text = typeof ex === "string" ? ex : ex.en;
                        const translation = typeof ex === "string" ? null : ex.zh;

                        return (
                          <li 
                            key={j} 
                            className={`
                              relative flex items-start gap-2 group/ex
                              ${translation ? "cursor-help" : ""}
                            `}
                          >
                            <span className="text-pink-400 select-none mt-0.5">❯</span>
                            
                            {/* 英文句子 (有翻譯的話底部加虛線提示) */}
                            <span className={`
                              transition-colors duration-200
                              ${translation ? "border-b border-dashed border-slate-600 group-hover/ex:border-pink-400 group-hover/ex:text-white" : ""}
                            `}>
                              {text}
                            </span>

                            {/* 懸浮翻譯氣泡 (Tooltip) */}
                            {translation && (
                              <div className="
                                absolute left-0 bottom-full mb-2 z-50
                                w-max max-w-[280px] px-3 py-2
                                bg-gradient-to-r from-pink-600 to-rose-500
                                text-white text-xs font-sans font-bold tracking-wide rounded-lg shadow-xl
                                opacity-0 translate-y-2 scale-95 pointer-events-none
                                group-hover/ex:opacity-100 group-hover/ex:translate-y-0 group-hover/ex:scale-100
                                transition-all duration-300 ease-out
                              ">
                                {translation}
                                {/* 小三角形指標 */}
                                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-pink-600"></div>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {!isMastered && (
                    <button
                      onClick={(e) => handleMaster(i, e)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-200/50 transition-all flex items-center justify-center gap-2"
                    >
                      <span>獲得技能</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>

              {isMastered && (
                <div className="absolute top-2 right-2 opacity-20 rotate-[-15deg] pointer-events-none">
                  <div className="border-4 border-emerald-600 text-emerald-600 font-black text-xs px-2 py-1 rounded">
                    MASTERED
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center pb-8"> {/* pb-8 增加底部空間 */}
        <button
          onClick={onComplete}
          disabled={!isAllMastered}
          className={`
            relative px-8 py-4 rounded-full font-black text-lg tracking-widest transition-all duration-500
            ${
              isAllMastered
                ? "bg-neutral-900 text-white shadow-2xl hover:scale-105 hover:shadow-indigo-500/30 cursor-pointer"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }
          `}
        >
          {isAllMastered ? "🏆 領取最終獎勵" : `尚有 ${points.length - mastered.size} 個技能未解鎖`}
        </button>
      </div>
    </div>
  );
}