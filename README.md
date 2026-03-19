# LearningQuest

> 一個以 **React + TypeScript + Vite + Tailwind CSS + Supabase** 打造的模組化英文學習平台原型，結合教材瀏覽、遊戲化挑戰、排行榜，以及自我調節學習（SRL）獎章規劃。

## 專案簡介

LearningQuest 是一個以「**資料驅動教材**」與「**遊戲化學習歷程**」為核心的英語學習網站。專案目前提供：

- Email / Password 註冊、登入與忘記密碼流程。
- 首次登入後的個人資料建立。
- 單字、文法、挑戰、排行榜等互動式學習功能。
- 以 Supabase 儲存使用者個人資料、學習進度與排行榜。
- 依學習表現自動升級的獎章系統。
- 可由使用者自行設定目標的 **SRL（Self-Regulated Learning）獎章規劃面板**。

這份 README 依照目前程式碼實作內容重新整理，並改寫成適合直接放在 GitHub 專案首頁閱讀的格式。

---

## 主要功能

### 1. 驗證與個人資料
- 支援 **註冊 / 登入 / 登出 / 忘記密碼**。
- 使用 Supabase Auth 管理 session。
- 首次登入後需填寫 `full_name`、`school`、`grade`，並寫入 `profiles` 資料表。

### 2. 學習區
目前 UI 主要開放以下內容：

- **單字集**：瀏覽單字與發音互動。
- **單字貪吃蛇**：把單字練習做成遊戲化挑戰。
- **文法說明**：分點呈現文法概念與例句。
- **文法方塊**：句型重組遊戲，並可寫入排行榜。

程式中也保留了課文閱讀與句子排列元件，但目前主介面預設未開啟對應 tab。

### 3. 挑戰區
- 每個單元預設以 **10 個關卡** 顯示。
- 關卡依星等 / 通關狀態逐步解鎖。
- 每次挑戰會記錄：
  - 分數
  - 完成秒數
  - 星等
  - 是否通關
- 目前程式實際固定載入的題庫是 **Unit 1 / Level 1 JSON 題庫**；其他關卡結構已預留，但尚未全部接上。

### 4. 獎章系統
- 內建參與類、技巧類、鼓勵類等多種獎章。
- 會依學習 / 遊戲數據自動升級為銅、銀、金級。
- 支援解鎖 toast 提示。

### 5. SRL 獎章規劃面板
這是本專案很有特色的一塊：

- 使用者可以自己設定部分獎章的門檻。
- 可追蹤目前進度、退休目標、撰寫通關反思。
- 適合搭配研究、教學實驗或自主學習歷程設計。

### 6. 排行榜
- 提供 **貪吃蛇** 與 **文法方塊** 兩種排行榜切換。
- 透過 Supabase `leaderboard` 資料表讀寫成績。
- 畫面顯示前 10 名分數。

---

## 技術棧

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- dnd-kit
- PixiJS

### Backend / BaaS
- Supabase Auth
- Supabase Database (PostgreSQL)

### 開發工具
- ESLint
- TypeScript Compiler

---

## 專案結構

```text
src/
├─ components/
│  ├─ ArrangeSentencesGame.tsx
│  ├─ BadgesView.tsx
│  ├─ ChallengeRun.tsx
│  ├─ GrammarExplain.tsx
│  ├─ Leaderboard.tsx
│  ├─ ProfileSetup.tsx
│  ├─ ReorderSentenceGame.tsx
│  ├─ SnakeChallenge.tsx
│  ├─ StoryViewer.tsx
│  ├─ VocabQuiz.tsx
│  ├─ VocabSet.tsx
│  └─ ui.tsx
├─ data/
│  ├─ challenges/
│  └─ units.ts
├─ lib/
│  └─ questionGen.ts
├─ state/
│  ├─ AuthContext.tsx
│  └─ progress.ts
├─ App.tsx
├─ main.tsx
├─ supabaseClient.ts
└─ types.ts
```

---

## 資料模型概念

### `profiles`
儲存使用者基本資料與學習進度。

建議欄位至少包含：
- `id`
- `full_name`
- `school`
- `grade`
- `progress` (JSONB)
- `updated_at`

### `leaderboard`
用來儲存小遊戲排行榜資料。

建議欄位至少包含：
- `id`
- `full_name`
- `game` (`snake` / `tetris`)
- `score`
- `updated_at`

### `progress` JSONB
程式中的進度狀態包含：
- `byUnit`
- `badges`
- `stats`
- `totalXP`
- `badgePlans`
- `lastBadgeEvents`

也就是說，這個專案不只是記錄「有沒有完成」，還會記錄：
- 遊戲場次
- 總錯誤數
- 重試次數
- 發音點擊次數
- 連勝紀錄
- 挑戰最佳秒數
- 自訂獎章計畫

---

## 本機開發

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立環境變數
請在專案根目錄建立 `.env.local`：

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

### 4. 建置正式版本

```bash
npm run build
```

### 5. 檢查程式風格

```bash
npm run lint
```

---

## Supabase 設定建議

### 1. `profiles` 資料表

```sql
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  updated_at timestamptz,
  full_name text,
  school text,
  grade text,
  progress jsonb
);
```

### 2. 啟用 RLS

```sql
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

### 3. 新使用者建立 profile

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 4. `leaderboard` 資料表（示意）

```sql
create table public.leaderboard (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  game text not null check (game in ('snake', 'tetris')),
  score integer not null default 0,
  updated_at timestamptz not null default now()
);
```

> 若你要正式上線，建議再補上更細的 RLS 政策與寫入限制，避免匿名或惡意覆蓋排行榜。

---

## 目前內容狀態

這份專案已經具備可操作的核心流程，但也有一些很值得先知道的現況：

- `UNITS` 已建立到 **6 個單元** 的資料結構。
- 目前主畫面固定使用 **Unit 1**。
- 挑戰區雖然 UI 顯示 10 關，但實際固定接上的 JSON 題庫目前以 **Unit 1 / Level 1** 為主。
- 課文閱讀與句子排列的元件仍存在，但預設 tab 在主畫面中被註解掉。
- 建置可成功完成，但 Vite 目前會提示輸出 chunk 偏大，後續可考慮 code splitting。

如果你接下來要把這個專案整理成正式產品，建議優先處理：

1. 補齊全部單元與挑戰題庫。
2. 把目前註解中的學習分頁整理回正式流程。
3. 完善 Supabase schema、RLS 與 migration。
4. 新增 demo 截圖、資料流程圖與部署說明。
5. 將大型 bundle 拆分，改善首次載入體驗。

---

## 適合的使用情境

- 國中 / 高中英文補充教材平台
- 遊戲化語言學習原型
- 教育科技展示專案
- 結合 SRL 研究的學習介面實驗
- React + Supabase 的前後端整合練習專案

---

## 未來可擴充方向

- 多單元切換與教師後台
- 題庫編輯器
- 學習分析儀表板
- 成就牆 / 班級排行 / 班級管理
- 語音辨識與發音評量
- 部署到 Vercel / Netlify + Supabase

---

## 授權

目前倉庫內未見明確授權條款。若要公開發布到 GitHub，建議補上 `LICENSE` 檔案後再對外說明使用方式。
