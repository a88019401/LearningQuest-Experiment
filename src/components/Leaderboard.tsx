// src/components/Leaderboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Card, SectionTitle, TabButton } from './ui';

type LeaderboardEntry = {
  id: number | string;
  full_name: string;
  score: number;
  gold?: number;
  silver?: number;
  bronze?: number;
};

type GameType = 'snake' | 'tetris' | 'badges';

export default function Leaderboard() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<GameType>('snake');

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeGame === 'badges') {
          const { data, error } = await supabase
            .from('badge_leaderboard_ranked')
            .select('id, full_name, gold, silver, bronze, score')
            .order('score', { ascending: false })
            .order('gold', { ascending: false })
            .order('silver', { ascending: false })
            .order('bronze', { ascending: false })
            .order('full_name', { ascending: true })
            .limit(10);

          if (error) throw error;
          setScores(data || []);
        } else {
          const { data, error } = await supabase
            .from('leaderboard')
            .select('id, full_name, score')
            .eq('game', activeGame)
            .order('score', { ascending: false })
            .limit(10);

          if (error) throw error;
          setScores(data || []);
        }
      } catch (err: any) {
        setError(err.message || '未知錯誤');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [activeGame]);

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return index + 1;
  };

  const gameTitles = {
    snake: '🐍 貪吃蛇排行榜 (Top 10)',
    tetris: '🧱 方塊排行榜 (Top 10)',
    badges: '🏅 獎章排行榜 (Top 10)',
  };

  const gameDescs = {
    snake: '挑戰最高分，成為單字之王！',
    tetris: '消除最多行，成為文法大師！',
    badges: '依據獎章積分排序（金牌 5 分、銀牌 3 分、銅牌 1 分）',
  };

  return (
    <Card>
      <SectionTitle title={gameTitles[activeGame]} desc={gameDescs[activeGame]} />

      <div className="flex gap-2 mb-4 border-b pb-3">
        <TabButton active={activeGame === 'snake'} onClick={() => setActiveGame('snake')}>
          貪吃蛇
        </TabButton>

        <TabButton active={activeGame === 'tetris'} onClick={() => setActiveGame('tetris')}>
          方塊
        </TabButton>

        <TabButton active={activeGame === 'badges'} onClick={() => setActiveGame('badges')}>
          獎章
        </TabButton>
      </div>

      {loading && <p>讀取中...</p>}
      {error && <p className="text-red-500">無法載入排行榜：{error}</p>}

      {!loading && !error && (
        <ol className="space-y-2">
          {scores.map((entry, index) => (
            <li
              key={entry.id}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold w-8 text-center">
                  {getRankIcon(index)}
                </span>
                <span className="font-medium">{entry.full_name}</span>
              </div>

              <div className="font-bold text-lg">
                {activeGame === 'badges' ? (
                  <div className="flex gap-3 text-sm items-center">
                    <span className="flex items-center gap-1" title="金牌">
                      🥇 {entry.gold ?? 0}
                    </span>
                    <span className="flex items-center gap-1" title="銀牌">
                      🥈 {entry.silver ?? 0}
                    </span>
                    <span className="flex items-center gap-1" title="銅牌">
                      🥉 {entry.bronze ?? 0}
                    </span>
                    <span className="ml-2 text-indigo-600 w-12 text-right">
                      {entry.score} 分
                    </span>
                  </div>
                ) : (
                  <span>{entry.score} 分</span>
                )}
              </div>
            </li>
          ))}

          {scores.length === 0 && (
            <p className="text-neutral-500">目前還沒有人上榜，快來搶頭香！</p>
          )}
        </ol>
      )}
    </Card>
  );
}