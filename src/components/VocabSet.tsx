// src/components/VocabSet.tsx
import { useState, useEffect, useMemo, type MouseEvent } from "react";
import { SpeakerWaveIcon } from "@heroicons/react/24/solid";
import type { Word } from "../types";
import { Card, SectionTitle } from "./ui";

type Props = {
  title: string;
  words: Word[];
  onPlayAudio?: (text: string) => void;
  onStudied: () => void;
};

export default function VocabSet({ title, words, onPlayAudio, onStudied }: Props) {
  // 記錄已收集的單字索引
  const [collected, setCollected] = useState<Set<number>>(new Set());
  // 記錄目前翻開的卡片索引
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  
  // 語音支援狀態
  const [ttsSupported, setTtsSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // 1. 監聽單字內容變化，重置進度
  const wordsKey = useMemo(() => words.map(w => w.term).join("|"), [words]);

  useEffect(() => {
    setCollected(new Set());
    setFlippedIndex(null);
  }, [wordsKey]);

  // 2. 初始化語音
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      console.warn("Browser does not support Text-to-Speech");
      setTtsSupported(false);
      return;
    }

    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      if (vs.length > 0) {
        setVoices(vs);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const progress = words.length ? Math.round((collected.size / words.length) * 100) : 0;
  const isAllCollected = words.length > 0 && collected.size === words.length;

  // 🔊 播放函式
  const speak = (text: string) => {
    if (onPlayAudio) onPlayAudio(text); // 這裡會觸發「聽力小耳朵」

    if (!ttsSupported) return;
    
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;

    const prefer = voices.find(v => /en-US/i.test(v.lang) || /Google US English/i.test(v.name));
    if (prefer) utterance.voice = prefer;

    window.speechSynthesis.speak(utterance);
  };

  const handleCardClick = (index: number) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  // ✅ 關鍵修改在這裡：收入圖鑑時，直接觸發父層的 onStudied
  const handleCollect = (e: MouseEvent<HTMLButtonElement>, index: number) => {
    e.stopPropagation();
    if (!collected.has(index)) {
      const next = new Set(collected);
      next.add(index);
      setCollected(next);
      setFlippedIndex(null); // 收集後自動蓋上

      // 🔥 這裡直接呼叫 onStudied！
      // 因為 App.tsx 裡的 onStudied 邏輯就是「次數+1」，所以這裡呼叫它，就會讓單字達人進度+1
      onStudied(); 
    }
  };

  const handleAudioClick = (e: MouseEvent<HTMLButtonElement>, text: string) => {
    e.stopPropagation();
    speak(text);
  };

  return (
    <div className="space-y-6 p-1">
      {/* 頂部儀表板 */}
      <Card className="border-b-4 border-neutral-200 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2 relative z-10">
          <SectionTitle title={`📦 ${title}`} />
          <div className="text-right">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Collection Rate
            </div>
            <div className="text-2xl font-black font-mono text-indigo-600">
              {collected.size} / {words.length}
            </div>
          </div>
        </div>

        {/* 能量條 */}
        <div className="relative w-full h-3 bg-neutral-100 rounded-full overflow-hidden shadow-inner mt-2">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"
            style={{ pointerEvents: "none" }}
          />
        </div>
      </Card>

      {/* 單字卡網格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {words.map((w, i) => {
          const isFlipped = flippedIndex === i;
          const isCollected = collected.has(i);

          return (
            <div
              key={i}
              className="relative h-64 group perspective-1000 cursor-pointer"
              onClick={() => handleCardClick(i)}
            >
              {/* 卡片容器 */}
              <div
                className={`
                  relative w-full h-full transition-all duration-500 transform-style-3d
                  ${isFlipped ? "rotate-y-180" : ""}
                  ${!isFlipped && !isCollected ? "hover:-translate-y-1" : ""}
                `}
              >
                {/* === 正面 === */}
                <div
                  className={`
                    absolute inset-0 backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center p-4 shadow-lg bg-white
                    ${
                      isCollected
                        ? "border-emerald-400 bg-emerald-50/30"
                        : "border-neutral-200 hover:border-indigo-300 hover:shadow-indigo-100"
                    }
                  `}
                >
                  <div className="absolute top-3 left-3 text-xs font-mono text-neutral-300">
                    #{String(i + 1).padStart(2, "0")}
                  </div>

                  <div
                    className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                      isCollected ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-neutral-300"
                    }`}
                  />

                  <h3 className="text-2xl font-black text-neutral-800 text-center mb-2 tracking-tight">
                    {w.term}
                  </h3>

                  <button
                    onClick={(e) => handleAudioClick(e, w.term)}
                    className="mt-2 p-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all shadow-sm"
                  >
                    <SpeakerWaveIcon className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 text-xs text-neutral-400 font-medium tracking-widest uppercase">
                    Tap to Flip
                  </div>
                </div>

                {/* === 背面 === */}
                <div
                  className={`
                    absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 border-indigo-500 bg-slate-900 text-white p-5 flex flex-col shadow-xl
                  `}
                >
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                      <span className="font-bold text-lg text-indigo-300">
                        {w.term}
                      </span>
                      <button
                        onClick={(e) => handleAudioClick(e, w.term)}
                        className="text-white/70 hover:text-white"
                      >
                        <SpeakerWaveIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-sm font-medium leading-relaxed text-slate-200">
                      {w.def}
                    </div>

                    {w.example && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-[10px] text-indigo-400 uppercase tracking-wider mb-1">
                          Example
                        </div>
                        {typeof w.example === "string" ? (
                          <div className="text-xs text-slate-400 italic">
                            "{w.example}"
                          </div>
                        ) : (
                          <>
                            <div className="text-xs text-slate-300 italic mb-1">
                              "{w.example.en}"
                            </div>
                            <div className="text-xs text-slate-500">
                              {w.example.zh}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-2">
                    {!isCollected ? (
                      <button
                        onClick={(e) => handleCollect(e, i)}
                        className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-bold rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span>✨ 收入圖鑑</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 text-center text-emerald-400 text-xs font-bold bg-emerald-900/30 rounded-lg border border-emerald-500/30">
                        ✓ 已掌握 (Collected)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center pb-8">
        <button
          disabled={!isAllCollected}
          className={`
            relative px-10 py-4 rounded-full font-black text-lg tracking-widest transition-all duration-500
            ${
              isAllCollected
                ? "bg-neutral-900 text-white shadow-2xl hover:scale-105 hover:shadow-indigo-500/30 cursor-pointer"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }
          `}
        >
          {isAllCollected ? (
            <span className="flex items-center gap-2">
              🏆 完成單字特訓 <span className="text-xs opacity-50">(Finish)</span>
            </span>
          ) : (
            <span>🔒 收集所有單字以完成</span>
          )}
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}