-- ============================================================================
-- LearningQuest 實驗組 - 研究資料查詢與維護範例
-- 注意：本檔不是初始化 Schema。請在確認篩選條件後逐段執行。
-- 所有姓名與 UUID 均改為參數化提示，避免把學生個資寫進交接文件。
-- ============================================================================

-- 1. 貪吃蛇排行榜前 5 名
select full_name, score
from public.leaderboard
where game = 'snake'
order by score desc
limit 5;

-- 2. 確認必要資料表存在
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'leaderboard', 'lsa_logs');

-- 3. 查看 leaderboard 欄位
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'leaderboard'
order by ordinal_position;

-- 4. 查看 Auth 使用者（只能在 SQL Editor / 管理環境執行）
select id, email, created_at
from auth.users
order by email asc;

-- 5. 獎章排行榜前 10 名
select *
from public.badge_leaderboard_ranked
order by score desc, gold desc, silver desc, bronze desc, full_name asc
limit 10;

-- 6. 查詢特定學生的完整 LSA 時序
-- 將 <USER_UUID> 替換成目標使用者 UUID。
select
  id,
  user_id,
  full_name,
  session_id,
  action_state,
  context_data,
  created_at
from public.lsa_logs
where user_id = '<USER_UUID>'::uuid
order by created_at asc;

-- 7. 依實驗組標籤統計事件數、session 數與起訖時間
select
  p.full_name,
  p.grade,
  count(*) as lsa_event_count,
  count(distinct l.session_id) as session_count,
  min(l.created_at) as first_log,
  max(l.created_at) as last_log
from public.lsa_logs l
join public.profiles p on p.id = l.user_id
where p.grade = '902(實驗組)'
group by p.full_name, p.grade
order by lsa_event_count desc;

-- 8. Session 首末事件差：簡單但可能高估閒置時間
with session_lengths as (
  select
    l.user_id,
    l.session_id,
    extract(epoch from max(l.created_at) - min(l.created_at))::int
      as session_duration_sec
  from public.lsa_logs l
  group by l.user_id, l.session_id
)
select
  p.full_name,
  p.grade,
  coalesce(sum(s.session_duration_sec), 0) as total_usage_sec,
  round(coalesce(sum(s.session_duration_sec), 0) / 60.0, 2) as total_usage_min
from public.profiles p
left join session_lengths s on p.id = s.user_id
where p.grade = '902(實驗組)'
group by p.id, p.full_name, p.grade
order by total_usage_sec desc;

-- 9. 建議使用：只累加相鄰事件間隔 <= 10 分鐘的活躍時間
with ordered_logs as (
  select
    l.user_id,
    l.session_id,
    p.full_name,
    p.grade,
    l.created_at,
    extract(
      epoch from (
        l.created_at
        - lag(l.created_at) over (
            partition by l.user_id, l.session_id
            order by l.created_at
          )
      )
    )::int as gap_sec
  from public.lsa_logs l
  join public.profiles p on p.id = l.user_id
  where p.grade = '902(實驗組)'
),
active_time as (
  select
    user_id,
    full_name,
    grade,
    case
      when gap_sec between 0 and 600 then gap_sec
      else 0
    end as active_sec
  from ordered_logs
)
select
  user_id,
  full_name,
  grade,
  sum(active_sec)::int as total_usage_sec,
  round(sum(active_sec) / 60.0, 2) as total_usage_min
from active_time
group by user_id, full_name, grade
order by total_usage_sec desc;

-- 10. 各 action_state 次數分布
select
  p.grade,
  l.action_state,
  count(*) as event_count,
  count(distinct l.user_id) as user_count
from public.lsa_logs l
join public.profiles p on p.id = l.user_id
where p.grade = '902(實驗組)'
group by p.grade, l.action_state
order by event_count desc, l.action_state;

-- 11. 匯出挑戰結束事件
select
  l.user_id,
  p.full_name,
  p.grade,
  l.session_id,
  l.context_data ->> 'level' as level,
  nullif(l.context_data ->> 'score', '')::int as score,
  nullif(l.context_data ->> 'timeUsed', '')::int as time_used_sec,
  l.context_data -> 'items' as items,
  l.created_at
from public.lsa_logs l
join public.profiles p on p.id = l.user_id
where l.action_state = 'CHALLENGE_FINISH'
order by l.created_at;

-- 12. 匯出 SRL 計畫與反思事件
select
  l.user_id,
  p.full_name,
  p.grade,
  l.action_state,
  l.context_data,
  l.created_at
from public.lsa_logs l
join public.profiles p on p.id = l.user_id
where l.action_state in (
  'SRL_PLAN_OPEN',
  'SRL_PLAN_SAVE',
  'SRL_REFLECTION_SAVE',
  'SRL_PLAN_RETIRE'
)
order by l.user_id, l.created_at;

-- 13. 維護範例：修正單一學生 LSA 姓名
-- 執行前必須先以 SELECT 確認 user_id。
-- update public.lsa_logs
-- set full_name = '<CORRECT_FULL_NAME>'
-- where user_id = '<USER_UUID>'::uuid;

-- 14. 維護範例：把班級代碼轉成研究組別標籤
-- 建議先備份 profiles，並先執行對應 SELECT。
-- update public.profiles
-- set grade = case
--   when grade = '902' then '902(實驗組)'
--   when grade = '905' then '905(對照組)'
--   else grade
-- end
-- where grade in ('902', '905');

-- 15. 不建議放入初始化腳本的語句
-- DROP EVENT TRIGGER IF EXISTS "ensure_rls";
-- 原因：它是全資料庫層級操作，與本專案建表無直接必要，可能移除其他安全機制。
