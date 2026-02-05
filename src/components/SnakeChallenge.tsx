// src/components/SnakeChallenge.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Word } from "../types";
import { Card, SectionTitle } from "./ui";
import { supabase } from "../supabaseClient";
/**
 * 第 2 關：貪吃蛇（Vocabulary Multiple-Choice 版）
 * - 固定 10 題（可調），每題同時出現 3 個選項（紅點），吃到其中一個即作答，立即換下一題
 * - 題目 UI 美化（進度條、卡片風），單字以「白底圓角標籤」清楚顯示在紅點「上方」
 * - ✅ 通關門檻 targetScore：達標立即通關（必填；可用於解鎖下一關）
 * - 研究追蹤：逐題紀錄「作答時間、是否正確、選錯了什麼」，結束時透過 onReport 回傳
 * - 從外部傳入 words（建議用 unit.words 或 UNITS[0].words）
 */

export type SnakeChallengeProps = {
  title?: string;
  totalTime?: number; // 總限時（秒），預設 120
  speedMs?: number; // 蛇移動間隔（毫秒）
  words?: Word[]; // 題庫（建議傳 unit.words）
  totalQuestions?: number; // 保留相容，已不使用
  /** ✅ 必達門檻（達標立即通關、用於解鎖下一關） */
  targetScore: number;
  /** 顯示/回報用門檻；未提供時等同 targetScore */
  passScore?: number; // 保留相容，已不使用
  questionMode?: "defToTerm" | "termToDef"; // 題幹呈現方式（預設 defToTerm：看中吃英）
  growOnCorrect?: boolean; // 答對是否加長蛇身（預設 true）
  onFinish: (score: number, timeUsed: number) => void;
  onReport?: (report: SnakeReport) => void;
  onRetry?: () => void;
};

const GRID = 20;
const DIRS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

type Pos = { x: number; y: number };
type FoodItem = { id: string; pos: Pos; word: Word; correct: boolean };

// ==== 研究紀錄型別 ====
export type SnakeRoundLog = {
  round: number; // 第幾題（1-based）
  prompt: string; // 題幹文字
  promptMode: "defToTerm" | "termToDef";
  correctTerm: string;
  correctDef: string;
  options: string[]; // 呈現的英文選項（term）
  selectedTerm: string; // 玩家實際吃到的 term
  isCorrect: boolean;
  responseTimeMs: number; // 該題出現→作答時間
};

export type SnakeReport = {
  title: string;
  totalQuestions: number;
  passScore: number;
  totalTime: number;
  usedTime: number;
  correct: number;
  wrong: number;
  passed: boolean;
  logs: SnakeRoundLog[];
  wrongByTerm: Record<string, number>; // 錯誤選項統計（term -> 次數）
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function samePos(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y;
}
function randInt(n: number) {
  return Math.floor(Math.random() * n);
}

function randCell(exclude: Pos[]): Pos {
  while (true) {
    const p = { x: randInt(GRID), y: randInt(GRID) };
    if (!exclude.some((e) => samePos(e, p))) return p;
  }
}
function randCells(n: number, exclude: Pos[]): Pos[] {
  const taken: Pos[] = [...exclude];
  const out: Pos[] = [];
  for (let i = 0; i < n; i++) {
    const p = randCell(taken);
    out.push(p);
    taken.push(p);
  }
  return out;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FALLBACK: Word[] = [
  { term: "family", def: "家人；家庭" },
  { term: "husband", def: "丈夫" },
  { term: "wife", def: "妻子" },
  { term: "uncle", def: "叔伯；姑姨丈；舅舅" },
  { term: "aunt", def: "嬸伯母；姑姨媽；舅媽" },
  { term: "cousin", def: "堂（表）兄弟姐妹" },
];

export default function SnakeChallenge({
  title = "第 2 關：貪吃蛇（單字）",
  //totalTime = 120,
  speedMs = 200,
  words = FALLBACK,
  totalQuestions,
  targetScore, // ✅ 必填
  passScore, // 若未提供，稍後以 targetScore 代入
  questionMode = "defToTerm",
  growOnCorrect = true,
  onFinish,
  onReport,
  onRetry,
}: SnakeChallengeProps) {
  //const threshold = passScore ?? targetScore; // 顯示/回報一律用 threshold
  void totalQuestions;
  void targetScore;
  void passScore;
  // 基本狀態
  const [started, setStarted] = useState(false);
  //const [left, setLeft] = useState(totalTime);
  const [gameOver, setGameOver] = useState(false);

  const [dir, setDir] = useState(DIRS.RIGHT);
  const [nextDir, setNextDir] = useState(DIRS.RIGHT);
  const [snake, setSnake] = useState<Pos[]>([
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]);

  const pool = words && words.length >= 3 ? words : FALLBACK;
  //const [round, setRound] = useState(1); // 1..totalQuestions
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [prompt, setPrompt] = useState<string>("");

  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<SnakeRoundLog[]>([]);
  const roundStartRef = useRef<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useMemo(() => 480, []);

  // 防重複結束（時間到 / 撞牆 / 撞身 / 達標 同時觸發）
  const finishedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  // 控制：鍵盤＆D-Pad
  const steer = useCallback(
    (dx: number, dy: number) => {
      if (gameOver || finishedRef.current) return;
      if (dx + dir.x === 0 && dy + dir.y === 0) return; // 禁 180 度回頭
      setNextDir({ x: dx, y: dy });
    },
    [dir.x, dir.y, gameOver]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") steer(0, -1);
      if (k === "arrowdown" || k === "s") steer(0, 1);
      if (k === "arrowleft" || k === "a") steer(-1, 0);
      if (k === "arrowright" || k === "d") steer(1, 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steer]);

  // 倒數
  {
    /*useEffect(() => {
    if (!started || gameOver) return;
    const id = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, [started, gameOver]);

  useEffect(() => {
    if (started && left === 0 && !gameOver) endGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, started]);*/
  }

  const [usedSec, setUsedSec] = useState(0);

  // 整輪固定、最多 78 題、正解不重複
  const deckRef = useRef<Word[] | null>(null);
  if (!deckRef.current) {
    deckRef.current = shuffle(pool).slice(0, Math.min(78, pool.length));
  }
  const deck = deckRef.current!;
  const TOTAL = deck.length;

  // roundIdx：0-based，用來對應 deck[roundIdx]
  const [roundIdx, setRoundIdx] = useState(0);

  // 產生一題
  const makeRound = useCallback(
    (idx: number, curSnake: Pos[]) => {
      const curDeck = deckRef.current!;
      const correctWord = curDeck[idx]; // 正解唯一且不重複
      const distractorPool = pool.filter((w) => w.term !== correctWord.term);
      const distractors = shuffle(distractorPool).slice(0, 2);
      const chosen = shuffle([correctWord, ...distractors]); // 隨機擺位

      const p =
        questionMode === "termToDef"
          ? `請吃掉「${correctWord.term}」的正確中文意思`
          : `請吃掉代表「${correctWord.def}」的英文單字`;

      const ps = randCells(3, curSnake);
      const fs: FoodItem[] = chosen.map((w, i) => ({
        id: uid(),
        word: w,
        correct: w.term === correctWord.term,
        pos: ps[i],
      }));

      setFoods(fs);
      setPrompt(p);
      roundStartRef.current = performance.now();
    },
    [pool, questionMode]
  );

  // 主迴圈
  useEffect(() => {
    if (!started || gameOver) return;

    const step = () => {
      setDir(nextDir);
      setSnake((prev) => {
        const head = { x: prev[0].x + nextDir.x, y: prev[0].y + nextDir.y };

        // 撞牆／撞自己
        if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
          endGame();
          return prev;
        }
        if (prev.some((p) => samePos(p, head))) {
          endGame();
          return prev;
        }

        // 吃到選項？
        const hitIdx = foods.findIndex((f) => samePos(f.pos, head));
        if (hitIdx >= 0) {
          const hit = foods[hitIdx];
          const now = performance.now();
          const responseTimeMs = Math.max(
            0,
            Math.round(now - roundStartRef.current)
          );

          const correctWord = foods.find((f) => f.correct)!.word;
          const options = foods.map((f) => f.word.term);
          const isCorrect = hit.correct;

          setLogs((old) => [
            ...old,
            {
              round: roundIdx + 1, // 1-based for log
              prompt,
              promptMode: questionMode,
              correctTerm: correctWord.term,
              correctDef: correctWord.def,
              options,
              selectedTerm: hit.word.term,
              isCorrect,
              responseTimeMs,
            },
          ]);

          const nextScore = isCorrect ? score + 1 : score;

          // 到下一題或完成所有題
          const nextIdx = roundIdx + 1;
          if (nextIdx >= TOTAL) {
            setScore(nextScore);
            endGame(nextScore); // ✅ 全部題目做完（不一定全對）→ 完成
            return prev;
          } else {
            const nextBody =
              isCorrect && growOnCorrect
                ? [head, ...prev]
                : [head, ...prev.slice(0, -1)];
            setRoundIdx(nextIdx);
            makeRound(nextIdx, nextBody);
            setScore(nextScore);
            return nextBody;
          }
        }

        // 平移
        return [head, ...prev.slice(0, -1)];
      });
    };

    const loop = window.setInterval(step, speedMs);
    return () => window.clearInterval(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    started,
    gameOver,
    foods,
    nextDir,
    speedMs,
    prompt,
    questionMode,
    growOnCorrect,
    score,
    roundIdx,
    TOTAL,
    makeRound,
  ]);

  // 初始一題（未開始也先顯示）
  useEffect(() => {
    makeRound(0, snake);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 畫面
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const W = cv.width,
      H = cv.height;
    const cell = Math.floor(cv.width / GRID);

    // 背景
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    // 柔和格線
    ctx.strokeStyle = "#eef2f7";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      const d = i * cell;
      ctx.beginPath();
      ctx.moveTo(d, 0);
      ctx.lineTo(d, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, d);
      ctx.lineTo(W, d);
      ctx.stroke();
    }

    // 食物：紅點 + 上方白底標籤（清楚可讀）
    foods.forEach((f) => {
      const cx = (f.pos.x + 0.5) * cell;
      const cy = (f.pos.y + 0.5) * cell;

      // 紅點
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx, cy, Math.floor(cell * 0.38), 0, Math.PI * 2);
      ctx.fill();

      // label
      const label = f.word.term;
      ctx.font = `${Math.max(
        16,
        Math.floor(cell * 0.4)
      )}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const padX = Math.floor(cell * 0.28);
      // const padY = Math.floor(cell * 0.18); // ❌ 未使用，已移除避免 TS6133
      const textW = ctx.measureText(label).width;
      const boxW = Math.min(textW + padX * 2, W * 0.9);
      const boxH = Math.floor(cell * 0.9);

      const boxX = Math.min(Math.max(cx - boxW / 2, 4), W - boxW - 4);
      const desiredY = cy - Math.floor(cell * 0.9) - 6;
      const boxY = Math.max(4, desiredY);

      roundRect(ctx, boxX, boxY, boxW, boxH, Math.floor(boxH / 2));
      ctx.fillStyle = "#111827";
      ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2);
    });

    // 蛇
    ctx.fillStyle = "#0ea5e9";
    snake.forEach((p, i) => {
      const r = Math.floor(cell * (i === 0 ? 0.48 : 0.42));
      ctx.beginPath();
      ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [snake, foods]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 6;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();
  }

  // 結束與回報（防重複）
  const endGame = useCallback(
    async (finalScore?: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      // 所有的狀態更新和 onFinish 都排到下一個事件循環，以避免 React 的渲染警告。
      setTimeout(async () => {
        const correct = finalScore ?? score;
        const usedTime =
          startTimeRef.current != null
            ? Math.round((performance.now() - startTimeRef.current) / 1000)
            : 0;

        setUsedSec(usedTime);
        setGameOver(true);
        console.log(`[SnakeChallenge] Game ended. Time used: ${usedTime}s`);

        // 🚨 這是 ResultModal 彈窗邏輯的依賴，需要儘早執行 onFinish
        onFinish(correct, usedTime);

        // --- 1. 日誌去重與準備 Report Data (Map-based de-duplication) ---
        // 使用 Map 確保每個 round 只有一個日誌條目 (Map key = log.round)
        const roundMap = new Map<number, SnakeRoundLog>();
        logs.forEach((log) => {
          // 由於 logs 陣列是按時間順序追加，Map 會自動保留每個 round 的最後一筆記錄
          roundMap.set(log.round, log);
        });
        const dedupedLogs = Array.from(roundMap.values());

        const wrongByTerm: Record<string, number> = {};
        dedupedLogs.forEach((l) => {
          if (!l.isCorrect)
            wrongByTerm[l.selectedTerm] =
              (wrongByTerm[l.selectedTerm] || 0) + 1;
        });

        const reportData: SnakeReport = {
          title,
          totalQuestions: TOTAL,
          passScore: TOTAL,
          totalTime: usedTime,
          usedTime,
          correct,
          wrong: dedupedLogs.filter((l) => !l.isCorrect).length,
          passed: correct === TOTAL,
          logs: dedupedLogs,
          wrongByTerm,
        };

        // --- 2. 立即觸發 UI Modal (同步) ---
        onReport?.(reportData);

        // --- 3. 觸發徽章事件 (同步) ---
        try {
          window.dispatchEvent(
            new CustomEvent("learning-quest:snake-report", {
              detail: { correct, total: TOTAL },
            })
          );
        } catch {}

        // --- 4. 執行耗時的 Supabase 上傳 (非同步) ---
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            // 從 profiles 表取得使用者姓名
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", user.id)
              .single();
            if (profileError) throw profileError;

            // ✅ 【修改重點】開始：先讀取目前分數
            const { data: existingEntry, error: selectError } = await supabase
              .from("leaderboard")
              .select("score")
              .eq("user_id", user.id)
              .eq("game", "snake")
              .single();

            // 如果查詢出錯（且不是「找不到資料」的錯誤），就拋出錯誤
            if (selectError && selectError.code !== "PGRST116") {
              throw selectError;
            }

            const currentScore = existingEntry?.score ?? 0;

            // 只有在新分數更高時才更新
            if (correct > currentScore) {
              const { error: upsertError } = await supabase
                .from("leaderboard")
                .upsert(
                  {
                    user_id: user.id,
                    full_name: profile.full_name,
                    game: "snake",
                    score: correct,
                  },
                  {
                    onConflict: "user_id,game",
                    ignoreDuplicates: false,
                  }
                );

              if (upsertError) throw upsertError;
              console.log("Successfully upserted new high score for snake!");
            } else {
              console.log(
                "New score is not higher. No update needed for snake."
              );
            }
            // ✅ 【修改重點】結束
          }
        } catch (error) {
          console.error("Error updating leaderboard:", error);
        }
      }, 0); // 使用 setTimeout(..., 0)
    },
    [logs, onFinish, onReport, score, title, TOTAL]
  );

  const reset = useCallback(() => {
    // ✅ 只要玩家已經開始過或已經結束過，按「重新開始」就算一次 retry
    if (started || gameOver) onRetry?.();
    finishedRef.current = false;
    startTimeRef.current = null;
    // ✅ 直接重洗，下一輪一定用到新牌
    deckRef.current = shuffle(pool).slice(0, Math.min(78, pool.length));

    setStarted(false);
    setGameOver(false);
    setDir(DIRS.RIGHT);
    setNextDir(DIRS.RIGHT);
    const init = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ];
    setSnake(init);
    setRoundIdx(0);
    setScore(0);
    setUsedSec(0);
    setLogs([]);
    makeRound(0, init);
  }, [makeRound, pool, started, gameOver, onRetry]);

  const DPad = (
    <div className="grid grid-cols-3 gap-2 w-40 select-none">
      <div />
      <button
        aria-label="up"
        onClick={() => steer(0, -1)}
        className="px-3 py-2 rounded-xl border hover:bg-neutral-50"
      >
        ↑
      </button>
      <div />
      <button
        aria-label="left"
        onClick={() => steer(-1, 0)}
        className="px-3 py-2 rounded-xl border hover:bg-neutral-50"
      >
        ←
      </button>
      <div />
      <button
        aria-label="right"
        onClick={() => steer(1, 0)}
        className="px-3 py-2 rounded-xl border hover:bg-neutral-50"
      >
        →
      </button>
      <div />
      <button
        aria-label="down"
        onClick={() => steer(0, 1)}
        className="px-3 py-2 rounded-xl border hover:bg-neutral-50"
      >
        ↓
      </button>
      <div />
    </div>
  );

  const progressPct = Math.min(100, Math.round((roundIdx / TOTAL) * 100));
  //const passingHint = `通關門檻：${threshold}/${totalQuestions}`;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <SectionTitle
          title={title}
          desc={`進度：第 ${roundIdx + 1} / ${TOTAL} 題`}
        />
        {/*<div
          className={`px-3 py-1 rounded-xl text-sm font-semibold ${
            left <= 10
              ? "bg-red-100 text-red-700"
              : "bg-neutral-100 text-neutral-700"
          }`}
        >
          ⏱ 剩餘 {left}s
        </div>*/}
      </div>

      {/* 題目區（美化） */}
      <div className="mt-3 rounded-2xl border bg-gradient-to-br from-white to-neutral-50 p-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-sky-100 text-sky-700">
              任務
            </span>
            <span className="text-sm text-neutral-700">
              吃掉正確選項以回答問題
            </span>
          </div>
          <div className="text-sm text-neutral-500">
            第{" "}
            <span className="font-semibold text-neutral-800">
              {roundIdx + 1}
            </span>{" "}
            / {TOTAL} 題
          </div>
        </div>

        <div className="mt-2 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
          <div
            className="h-full bg-sky-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white border">
          <div className="text-[15px] leading-relaxed text-neutral-900">
            {prompt || "準備中…"}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            提示：靠近並吃掉「正確」的紅點上方單字即可作答。
          </div>
        </div>
      </div>

      {/* 畫布 + 控制區 */}
      <div className="mt-5 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-full max-w-[560px] aspect-square">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-full h-full rounded-2xl border border-neutral-200 bg-white"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="text-xl font-semibold">得分（正確題數）：{score}</div>
          {gameOver && (
            <div className="text-sm text-neutral-500">
              本局耗時：{usedSec} 秒
            </div>
          )}
          {!started ? (
            <button
              onClick={() => {
                setStarted(true);
                startTimeRef.current = performance.now();
                roundStartRef.current = performance.now();
              }}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm hover:opacity-90"
            >
              開始挑戰
            </button>
          ) : !gameOver ? ( // <== 遊戲進行中
            <button
              onClick={reset}
              className="px-4 py-2 rounded-xl border text-sm hover:bg-neutral-50"
            >
              重新開始
            </button>
          ) : (
            // <== 遊戲結束時：改成可點擊的「再玩一次」按鈕
            <button
              onClick={reset} // <--- 點擊後直接重置
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm hover:opacity-90"
            >
              再玩一次
            </button>
          )}
          {DPad}
          <p className="text-xs text-neutral-500">
            也可使用鍵盤（WASD／方向鍵）操控
          </p>
        </div>
      </div>
    </Card>
  );
}
