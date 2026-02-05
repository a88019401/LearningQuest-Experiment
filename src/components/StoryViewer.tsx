// components/StoryViewer.tsx
import { useState } from "react"; 
import type { Story, StoryParagraph } from "../types";
import { Card, SectionTitle } from "./ui";

// 30 秒冷卻時間（毫秒）
const READ_COOLDOWN_MS = 30_000;
type Props = { story: Story; onRead: () => void; readCount?: number; onHint: () => void;};

function isBilingual(p: StoryParagraph): p is { en: string; zh?: string } {
  return typeof p === "object" && p !== null && "en" in p;
}

export default function StoryViewer({ story, onRead, readCount = 0, onHint }: Props) {
    
  // 上一次「成功標記為已閱讀」的時間戳記
  const [lastMarkedAt, setLastMarkedAt] = useState<number | null>(null);
  // 是否顯示警告視窗
  const [showWarning, setShowWarning] = useState(false);

  const handleMarkRead = () => {
    const now = Date.now();

    // 如果有紀錄過，且距離上次成功標記未滿 30 秒 → 只跳警告，不觸發 onRead
    if (lastMarkedAt && now - lastMarkedAt < READ_COOLDOWN_MS) {
      setShowWarning(true);
      return;
    }

    // 否則：真的算一次「已閱讀」
    onRead();
    setLastMarkedAt(now);
  };
  return (
    <Card>
      <SectionTitle title={`課文：${story.title}`} />
      <div className="space-y-4">
        {story.paragraphs.map((p, i) => {
          if (!isBilingual(p)) {
            return (
              <p key={i} className="leading-7 text-neutral-800">
                {p}
              </p>
            );
          }
          return (
            <div key={i} className="leading-7">
              <p className="text-neutral-900">{p.en}</p>
              {p.zh && (
                <details
                  className="mt-1 group"
                  onToggle={(e) => {
                    const el = e.currentTarget as HTMLDetailsElement;
                    // ✅ 只有在「打開」的瞬間算一次 hint
                    if (el.open) {
                      onHint();
                    }
                  }}
                >
                  <summary className="list-none cursor-pointer inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
                    <span className="rounded-md border px-2 py-0.5 text-xs">中文</span>
                    <span className="underline decoration-dotted">顯示／隱藏翻譯</span>
                    <span className="transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <div className="mt-2 rounded-lg border bg-neutral-50 px-3 py-2 text-neutral-700">
                    {p.zh}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleMarkRead} // ⬅️ 改成用我們的處理函式
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm disabled:opacity-60"
        >
          {readCount > 0
            ? `已標記為已閱讀（共 ${readCount} 次）`
            : "標記為已閱讀"}
        </button>
      </div>

      {/* ⚠️ 30 秒內第二次點擊時出現的警告視窗 */}
      {showWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          {/* 半透明背景 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowWarning(false)}
          />
          {/* 視窗本體：風格跟你其他 Modal / Card 一致 */}
          <div className="relative z-[71] w-[min(90vw,380px)] rounded-2xl bg-white shadow-2xl border border-neutral-200 p-5">
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">
              你真的已經讀完了嗎？
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              再多花一點時間把故事讀完吧！<br />
              
            </p>
            <button
              type="button"
              onClick={() => setShowWarning(false)}
              className="w-full px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm"
            >
              好的，我再讀一下
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

