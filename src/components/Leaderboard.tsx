// src/components/Leaderboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, SectionTitle, TabButton } from './ui'; // <-- ✅ 匯入 TabButton

type LeaderboardEntry = {
  id: number;
  full_name: string;
  score: number;
};

type GameType = 'snake' | 'tetris'; // ✅ 定義遊戲類型

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<GameType>('snake'); // ✅ 新增狀態來追蹤目前選擇的遊戲

  // ✅ 當 activeGame 改變時，重新獲取分數
  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        setError(null); // 重置錯誤訊息

        const { data, error } = await supabase
          .from('leaderboard')
          .select('id, full_name, score')
          .eq('game', activeGame) // ✅ 根據 activeGame 來篩選
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;
        setScores(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [activeGame]); // ✅ 依賴 activeGame

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  const gameTitles = {
    snake: '🐍 貪吃蛇排行榜 (Top 10)',
    tetris: '🧱 方塊排行榜 (Top 10)',
  };

  const gameDescs = {
    snake: '挑戰最高分，成為單字之王！',
    tetris: '消除最多行，成為文法大師！',
  };

  return (
    <Card>
      <SectionTitle title={gameTitles[activeGame]} desc={gameDescs[activeGame]} />

      {/* ✅ 新增遊戲切換按鈕 */}
      <div className="flex gap-2 mb-4 border-b pb-3">
        <TabButton active={activeGame === 'snake'} onClick={() => setActiveGame('snake')}>
          貪吃蛇
        </TabButton>
        <TabButton active={activeGame === 'tetris'} onClick={() => setActiveGame('tetris')}>
          方塊
        </TabButton>
      </div>

      {loading && <p>讀取中...</p>}
      {error && <p className="text-red-500">無法載入排行榜：{error}</p>}

      {!loading && !error && (
        <ol className="space-y-2">
          {scores.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border">
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold w-8 text-center">
                  {getRankIcon(index)}
                </span>
                <span className="font-medium">{entry.full_name}</span>
              </div>
              <span className="font-bold text-lg">{entry.score} 分</span>
            </li>
          ))}
          {scores.length === 0 && <p className="text-neutral-500">目前還沒有人上榜，快來搶頭香！</p>}
        </ol>
      )}
    </Card>
  );
}