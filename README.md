# LearningQuest 實驗組（SRL 獎章版）

> 國中英語數位遊戲式學習系統，採用 React、TypeScript、Vite、Tailwind CSS 與 Supabase，整合單字學習、文法學習、遊戲化挑戰、排行榜、分級獎章、自我調節學習（SRL）目標規劃，以及 Learning State Analysis（LSA）事件紀錄。

本 README 以 **2026-07-16 上傳的實驗組完整程式檔** 為依據，供後續學弟妹建置、維護、研究資料匯出與功能擴充。更完整的逐檔案、資料流、演算法與維運說明請參閱：

- `LearningQuest_實驗組_程式系統交接說明書.docx`
- `supabase_schema.sql`
- `research_queries.sql`

---

## 1. 專案定位

LearningQuest 實驗組是研究用英文學習網站。系統的主要特色不是只有「遊戲」，而是把下列三層整合在同一個平台：

1. **教材層**：單字、文法、課文與固定挑戰題庫。
2. **遊戲化層**：貪吃蛇、文法方塊、關卡星等、XP、獎章與排行榜。
3. **研究層**：SRL 自訂獎章計畫、反思紀錄、挑戰逐題紀錄與 LSA 事件資料。

實驗組與一般固定獎章版本最大的差異，是部分獎章必須先由學習者自行設定門檻、信心與理由，之後才開始計算進度。

---

## 2. 目前實際可用範圍

### 已開放於主介面

- Email / Password 註冊、登入、登出與忘記密碼。
- 首次登入個人資料設定。
- Unit 1 單字集。
- Unit 1 單字貪吃蛇。
- Unit 1 文法說明。
- Unit 1 文法方塊。
- Unit 1 挑戰區 Level 1–10。
- 固定獎章與 SRL 自訂獎章。
- 貪吃蛇、文法方塊與獎章排行榜。
- Supabase 學習進度保存。
- LSA 行為事件寫入。

### 已有程式，但目前主介面隱藏或未接通

- Unit 2–5 教材已存在於 `src/data/units.ts`，但 `App.tsx` 將 `unitId` 固定為 `1`，單元選擇 UI 被註解。
- 課文閱讀與句子排序元件仍存在，但課文入口被註解。
- `VocabQuiz` 四選一單字測驗仍存在，但入口被註解。
- Unit 2–5 尚未提供固定關卡 JSON，因此挑戰區目前只完整支援 Unit 1。

接手者不應把「程式碼存在」誤認為「功能已在正式實驗中開放」。

---

## 3. 技術棧

| 類別 | 技術 |
|---|---|
| 前端框架 | React 19 |
| 程式語言 | TypeScript 5.8 |
| 建置工具 | Vite 7 |
| 樣式 | Tailwind CSS 4、客製 CSS |
| 拖曳互動 | dnd-kit |
| 圖示 | Heroicons |
| 後端服務 | Supabase Auth、PostgreSQL、PostgREST |
| 本機語音 | Web Speech API / SpeechSynthesis |
| 程式品質 | ESLint、TypeScript strict mode |

`package.json` 中含 `pixi.js`，但目前上傳的核心元件未直接使用 PixiJS。若後續確認沒有其他未上傳模組依賴，可評估移除以降低 bundle 與依賴風險。

---

## 4. 專案目錄

```text
learning-quest/
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.ts
├─ tailwind.config.js
├─ postcss.config.js
├─ eslint.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ .env.local                  # 不可提交 Git
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ App.css
   ├─ index.css
   ├─ types.ts
   ├─ vite-env.d.ts
   ├─ types-web-speech.d.ts
   ├─ supabaseClient.ts
   ├─ data/
   │  ├─ units.ts
   │  └─ challenges/
   │     └─ unit-1/
   │        ├─ level-1.json
   │        ├─ ...
   │        └─ level-10.json
   ├─ state/
   │  ├─ AuthContext.tsx
   │  └─ progress.ts
   ├─ lib/
   │  ├─ analytics.ts
   │  ├─ lsa-states.ts
   │  └─ questionGen.ts
   └─ components/
      ├─ ui.tsx
      ├─ ProfileSetup.tsx
      ├─ VocabSet.tsx
      ├─ VocabQuiz.tsx
      ├─ SnakeChallenge.tsx
      ├─ GrammarExplain.tsx
      ├─ ReorderSentenceGame.tsx
      ├─ StoryViewer.tsx
      ├─ ArrangeSentencesGame.tsx
      ├─ ChallengeRun.tsx
      ├─ BadgesView.tsx
      └─ Leaderboard.tsx
```

---

## 5. 開發環境建置

### 5.1 建議環境

- Node.js 20 LTS 以上。
- npm 10 以上。
- Git。
- 一個 Supabase 專案。
- Chrome 或 Edge；貪吃蛇鍵盤控制與 Web Speech API 在 Chromium 瀏覽器較容易測試。

### 5.2 安裝

```bash
npm ci
```

首次接手請優先使用 `npm ci`，確保依照 `package-lock.json` 安裝。需要更新套件時再改用 `npm install`，並將新的 lock file 一起提交。

### 5.3 環境變數

建立 `.env.local`：

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

注意：

- 前端只能放 Supabase **anon key**。
- 絕對不可放 `service_role` key。
- `.env.local` 必須列入 `.gitignore`。
- Vite 只有 `VITE_` 前綴的變數會暴露給前端。

### 5.4 啟動

```bash
npm run dev
```

### 5.5 正式建置

```bash
npm run build
npm run preview
```

本次交接檢查中，安裝依賴後 `npm run build` 可成功完成。

---

## 6. Supabase 建置

### 6.1 執行順序

1. 建立 Supabase 專案。
2. 在 SQL Editor 執行 `supabase_schema.sql`。
3. 在 Authentication 設定 Email provider。
4. 設定 Site URL 與 Redirect URLs。
5. 建立 `.env.local`。
6. 執行網站並註冊測試帳號。
7. 確認 `auth.users` 新增後，`public.profiles` 會自動產生同 ID row。
8. 完成 ProfileSetup。
9. 測試學習進度、排行榜與 `lsa_logs`。

### 6.2 必要資料庫物件

| 物件 | 用途 |
|---|---|
| `auth.users` | Supabase Auth 帳號 |
| `public.profiles` | 姓名、學校、年級與完整 progress JSONB |
| `public.leaderboard` | snake / tetris 每人最佳分數 |
| `public.lsa_logs` | LSA 與 SRL 行為事件 |
| `public.badge_leaderboard_ranked` | 即時計算獎章排行榜 |
| `public.handle_new_user()` | 註冊後建立空白 profile |
| `on_auth_user_created` | Auth trigger |

### 6.3 為何 profiles 必須有額外欄位

早期 SQL 只有：

- `id`
- `updated_at`
- `username`
- `progress`

但目前前端實際讀寫：

- `full_name`
- `school`
- `grade`

因此不能直接沿用早期 profiles DDL。`supabase_schema.sql` 已補齊。

### 6.4 RLS 基本原則

- `profiles`：學生只能 SELECT / INSERT / UPDATE 自己的 row。
- `leaderboard`：已登入者可讀所有排名，但只能新增或更新自己的成績。
- `lsa_logs`：學生端只能新增自己的 log，不提供一般學生 SELECT。
- 獎章排行榜只能公開 `id`、姓名與牌數，不應公開完整 `progress` JSON。

---

## 7. 登入與個人資料流程

```text
App 啟動
  ↓
AuthProvider 呼叫 supabase.auth.getSession()
  ↓
有 session？
  ├─ 否 → AuthGate
  └─ 是 → 讀取 profiles
             ↓
         full_name 有值？
          ├─ 否 → ProfileSetup
          └─ 是 → LearningQuestApp
```

### AuthGate

功能：

- `signUp`
- `signInWithPassword`
- `resetPasswordForEmail`
- 顯示／隱藏密碼
- 註冊時確認兩次密碼一致

### AuthContext

負責：

- 保存 `session`、`user`、`profile`。
- 初次載入 session。
- 監聽 `onAuthStateChange`。
- 讀取 `profiles`。
- 登出後強制清空本地 React state。

### ProfileSetup

目前以 `UPDATE profiles` 寫入 `full_name`、`school`、`grade`。因此 `handle_new_user` trigger 不可移除，否則沒有 row 可以更新。

---

## 8. 學習進度資料模型

完整進度保存在：

```text
public.profiles.progress (JSONB)
```

主要結構：

```ts
type Progress = {
  byUnit: Record<UnitId, UnitProgress>;
  badges: Record<string, BadgeProgress>;
  stats: UserStats;
  totalXP: number;
  badgePlans: Record<string, BadgePlanConfig>;
};
```

每單元：

```ts
type UnitProgress = {
  stars: number;
  xp: number;
  vocab: {
    studied: number;
    quizBest: number;
  };
  grammar: {
    studied: number;
    reorderBest: number;
  };
  text: {
    read: number;
    arrangeBest: number;
  };
  challenge: {
    clearedLevels: number;
    bestTimeSec: number;
    bestScore: number;
    levels: Record<number, {
      bestScore: number;
      bestTimeSec: number;
      stars: number;
      passed?: boolean;
    }>;
  };
};
```

### 保存方式

`useProgress()`：

1. 登入後由 `restore(userId)` 讀取 `profiles.progress`。
2. 舊資料缺少欄位時與 `defaultProgress()` 合併。
3. Badge tier 若被存成字串，會轉回數字。
4. 舊版 badge plan 若沒有 `id`，會以原 key 補上。
5. React progress state 改變後，將完整 JSON 更新回 profiles。

注意：目前是「整包 JSONB 更新」，不是欄位級 transaction。多人同帳號、多分頁或非常快速連續更新可能發生最後寫入覆蓋前一寫入的情況。

---

## 9. 教材資料格式

### 9.1 UnitConfig

```ts
type UnitConfig = {
  id: UnitId;
  title: string;
  words: Word[];
  grammar: GrammarPoint[];
  story: Story;
};
```

### 9.2 Word

```ts
type Word = {
  term: string;
  def: string;
  note?: string;
  example?: string | { en: string; zh: string };
};
```

### 9.3 GrammarPoint

```ts
type GrammarPoint = {
  point: string;
  desc: string;
  examples: (string | { en: string; zh: string })[];
};
```

### 9.4 Story

```ts
type Story = {
  title: string;
  paragraphs: (string | { en: string; zh?: string })[];
  sentencesForArrange: string[];
};
```

### 9.5 目前教材數量

| Unit | 標題 | 單字 | 文法點 | 課文段落 | 排序句 |
|---:|---|---:|---:|---:|---:|
| 1 | 國中第六冊會考複習 | 30 | 11 | 17 | 12 |
| 2 | 現在進行式 | 35 | 8 | 17 | 12 |
| 3 | 過去簡單式 | 78 | 11 | 12 | 12 |
| 4 | 過去進行式 | 39 | 9 | 15 | 12 |
| 5 | 未來式 | 45 | 11 | 15 | 12 |

目前 `UnitId` 型別允許 1–6，但 `UNITS` 實際只註冊 1–5。

---

## 10. 固定挑戰題庫格式

檔案位置：

```text
src/data/challenges/unit-1/level-1.json
...
src/data/challenges/unit-1/level-10.json
```

格式：

```json
{
  "meta": {
    "time": 60,
    "title": "Unit 1 • Level 1"
  },
  "questions": [
    {
      "id": "u1-l1-q01",
      "prompt": "題幹",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explain": "解析",
      "tag": "vocab"
    }
  ]
}
```

目前每關：

- 10 題。
- 4 題 vocab。
- 6 題 grammar。
- JSON `meta.time` 為 60，但現行 `ChallengeRun` 沒有使用這個值。
- App 固定傳入 `perQuestionTime={20}`，所以實際是每題 20 秒。

新增題目時必須檢查：

- `id` 唯一。
- `correctIndex` 為 0-based。
- `choices[correctIndex]` 真的是正解。
- `tag` 建議只使用 `vocab` 或 `grammar`。
- 每關題數若不是 10，星等演算法仍以分數 10／7／4 判斷，必須同步修改。

---

## 11. App.tsx 核心責任

`App.tsx` 是目前最大的組合檔案，包含：

- 驗證入口。
- 主頁籤狀態。
- 學習子頁籤。
- 關卡解鎖與星等。
- 挑戰結算 modal。
- 進度更新。
- 獎章 toast。
- LSA 導覽事件。
- 各元件 wiring。

主要頁籤：

```ts
type Tab = "learn" | "challenge" | "badges" | "leaderboard";
```

現況：

```ts
const [unitId] = useState<UnitId>(1);
```

沒有 `setUnitId`，代表實驗版刻意固定 Unit 1。

---

## 12. 單字學習

### 12.1 VocabSet

流程：

1. 點卡片翻面。
2. 顯示中文、note、example。
3. 點「收入圖鑑」。
4. 每個單字首次收入時呼叫 `onStudied()`。
5. App 增加 5 XP、`vocab.studied + 1`，並把行為視為 `isLearn`。
6. 點發音按鈕時增加 `totalPronunciations`。

特性：

- 使用瀏覽器 `speechSynthesis`。
- 優先使用 en-US / Google US English voice。
- 語速 0.8。
- collected 狀態只存在元件記憶體；切換或重新整理會重置卡片 UI，但累積數值已存進 progress。

### 12.2 VocabQuiz

- 由 `makeVocabMCQ()` 產生選擇題。
- 入口目前被註解。
- 以 10 題為主，70% 通過。

---

## 13. 貪吃蛇

### 核心規則

- 20 × 20 grid。
- 鍵盤方向鍵或 WASD。
- 每題同時放 3 個食物選項。
- 正解題目順序來自打散後的單字 deck。
- 每個正解在同一輪不重複。
- 最多取 78 個單字。
- 吃到任一食物即視為作答。
- 撞牆或撞到自己會結束。
- 做完全部 deck 也會結束。
- 目前沒有有效總倒數；舊倒數程式被註解。

### 研究紀錄

每題 log 包含：

- round。
- prompt。
- 題型方向。
- 正確 term / def。
- 所有 options。
- 實際 selectedTerm。
- 是否答對。
- responseTimeMs。

結束後：

- 產生 `SnakeReport`。
- 觸發 `learning-quest:snake-report`。
- App 寫入 `SNAKE_GAME_END`。
- 更新 progress 統計。
- 只有高於歷史最佳分數時才 upsert `leaderboard`。

### 排行榜

唯一鍵：

```text
(user_id, game)
```

貪吃蛇使用：

```text
game = 'snake'
```

---

## 14. 文法技能樹

`GrammarExplain`：

- 文法點按順序解鎖。
- 第一個未掌握項目標示為 NEXT TARGET。
- 後續項目呈現鎖定視覺。
- 點「掌握」後觸發 `onAcquire()`。
- 每掌握一點，App 將 `grammar.studied + 1` 並加 10 XP。
- 最下方完成按鈕目前只有視覺特效，不會另寫一筆完成事件。

---

## 15. 文法方塊

`ReorderSentenceGame` 同時結合：

1. 英文句子重組。
2. 1010! 類型 10 × 10 方塊放置。

### 句子階段

- 文法例句先隨機排序成 rounds。
- 句子以 token 拆分。
- 學生依序點擊組句。
- 答對後取得 3 個方塊。
- 答錯累加 `wrongCount`。
- 錯 3 題即終止。

### 方塊階段

- I、O、T、L、J、S、Z 形狀。
- 隨機旋轉。
- 一次放置 3 塊。
- 填滿整列或整行即消除並累加 `linesCleared`。
- 若沒有任何可放位置，結束原因為 `no-fit`。

### 結束資料

- roundsPlayed。
- linesCleared / score。
- wrongCount。
- wrongItems。
- correctItems。
- reason：`completed`、`no-fit` 或 `wrong-limit`。

資料同時：

- 寫入 `localStorage['lq:grammar-tetris:logs']`。
- 觸發 `learning-quest:grammar-tetris-report`。
- 寫入 `TETRIS_GAME_END` LSA。
- 更新排行榜歷史最高分。

---

## 16. 挑戰區

### 星等

```text
10 分以上 → 3 星
7–9 分  → 2 星
4–6 分  → 1 星
0–3 分  → 0 星
```

### 通關

```text
通關 = 至少 2 星 = 至少 7 分
```

### 解鎖

從 Level 1 開始，只有前一關：

- `passed === true`，或
- `stars >= 2`

才解鎖下一關。

### 最佳紀錄

- `bestScore` 取最大。
- 至少 1 星才保存完成時間。
- `bestTimeSec` 取最小。
- 星數只升不降。
- 通關後不會因後續低分而失去 passed。

### XP

每次完成挑戰：

```text
XP = score × 2
```

### 特殊統計

- 10 分：perfectRuns +1。
- 未通過：failedChallenges +1。
- 比舊最佳高至少 3 分：comebackRuns +1。
- 剛好 7 分：closeCalls +1。
- 1200 秒以上：longSessions +1。
- 錯誤數：`10 - score`。

### LSA

開始：`CHALLENGE_START`

結束：`CHALLENGE_FINISH`，包含：

- unitId。
- level title。
- score。
- timeUsed。
- 每題選擇、正解與是否正確。

---

## 17. 固定獎章

系統內建 20 個 Badge key，分為 participation、skill、encouragement。

| Key | 中文名稱 | 指標 | 銅 / 銀 / 金 |
|---|---|---|---|
| GAME_LOVER | 遊戲狂熱 | 最高連續遊戲場次 | 3 / 6 / 10 |
| VOCAB_DRILLER | 單字達人 | 單字研讀次數 | 3 / 10 / 30 |
| GRAMMAR_NERD | 文法專家 | 文法掌握次數 | 3 / 10 / 30 |
| XP_COLLECTOR | 經驗收藏家 | 總 XP | 100 / 300 / 600 |
| REVIEWER | 愛玩遊戲 | 遊戲場次 | 2 / 10 / 20 |
| AUDIO_LEARNER | 聽力小耳朵 | 發音點擊次數 | 10 / 50 / 100 |
| SNAKE_MASTER | 貪吃蛇王 | 單字遊戲最佳分 | 5 / 10 / 25 |
| TETRIS_ARCH | 方塊建築師 | 方塊最佳消除數 | 5 / 10 / 20 |
| SPEED_DEMON | 極速傳說 | 至少 1 星關卡最快秒數 | 50 / 40 / 30，反向 |
| STAR_CATCHER | 摘星者 | 累積星數 | 3 / 9 / 18 |
| ACCURACY_GOD | 愛吃的蛇 | 貪吃蛇累積答對數 | 20 / 30 / 60 |
| LEVEL_CRUSHER | 過關斬將 | 通關數 | 3 / 6 / 10 |
| UNIT_MASTER | 單元制霸 | 3 星關卡數 | 3 / 6 / 10 |
| PERSISTENT | 越挫越勇 | 累積錯誤 | 5 / 20 / 50 |
| NEVER_GIVE_UP | 永不放棄 | 重試次數 | 1 / 5 / 15 |
| TRY_HARD | 勤能補拙 | 遊戲場次 + 重試 | 10 / 50 / 100 |
| COMEBACK_KID | 逆轉勝 | 提升至少 3 分次數 | 1 / 3 / 5 |
| PRACTICE_MAKE | 熟能生巧 | 遊戲場次 | 5 / 15 / 30 |
| BRAVE_HEART | 勇敢的心 | 挑戰失敗次數 | 1 / 5 / 10 |
| SURVIVOR | 倖存者 | 剛好 7 分通關次數 | 1 / 3 / 5 |

---

## 18. SRL 自訂獎章

實驗組把以下六種獎章從一般固定清單隱藏，改由學習者建立個人計畫：

- VOCAB_DRILLER
- AUDIO_LEARNER
- SPEED_DEMON
- UNIT_MASTER
- NEVER_GIVE_UP
- COMEBACK_KID

### 建立計畫

需要填寫：

- 選擇獎章。
- 銅／銀／金門檻。
- 信心水準。
- 設定理由。

### 防呆上限

| Key | 最大設定值 |
|---|---:|
| VOCAB_DRILLER | 100 |
| AUDIO_LEARNER | 200 |
| SPEED_DEMON | 180 秒 |
| UNIT_MASTER | 60 關 |
| NEVER_GIVE_UP | 100 次 |
| COMEBACK_KID | 60 次 |

一般指標要求：

```text
銅 < 銀 < 金
```

速度指標要求：

```text
銅秒數 > 銀秒數 > 金秒數
```

### Baseline

建立計畫時，部分累積指標會記錄當下值為 baseline；之後只計算「建立計畫後新增的進度」。

例外：

- SPEED_DEMON：以 `bestValueSincePlan` 記錄計畫啟動後最佳秒數。
- UNIT_MASTER：直接採歷史 3 星關卡總數，不扣 baseline。

### 計畫生命週期

- active：進行中。
- retired：未達銅級時可放棄，記錄原因與說明。
- reflected：達至少銅級後，建立下一計畫前要求通關反思。
- 最多建立 6 個計畫。

---

## 19. LSA 事件

事件定義於 `src/lib/lsa-states.ts`。

| action_state | 意義 |
|---|---|
| NAV_LEARN | 進入學習區或學習子區 |
| NAV_CHALLENGE | 進入挑戰區 |
| NAV_BADGES | 進入獎章區 |
| NAV_LEADERBOARD | 進入排行榜 |
| LEARN_VOCAB_SET | 開啟單字集／重試語境 |
| LEARN_SNAKE_GAME | 開啟或重試貪吃蛇 |
| LEARN_GRAMMAR_EXPLAIN | 開啟文法說明 |
| LEARN_TETRIS_GAME | 開啟或重試文法方塊 |
| CHALLENGE_START | 開始固定關卡 |
| CHALLENGE_FINISH | 固定關卡結束 |
| SRL_PLAN_OPEN | 開啟計畫精靈 |
| SRL_PLAN_SAVE | 儲存 SRL 計畫 |
| SRL_REFLECTION_SAVE | 儲存達成後反思 |
| SRL_PLAN_RETIRE | 放棄計畫 |
| SNAKE_GAME_END | 貪吃蛇結束 |
| TETRIS_GAME_END | 文法方塊結束 |

### Session ID

`analytics.ts` 使用：

```text
sessionStorage['lsa_session_id']
```

若不存在則以 `crypto.randomUUID()` 建立。代表：

- 同一瀏覽器分頁重新導向通常沿用。
- 關閉分頁後新開分頁會產生新 session。
- 不是後端登入 session ID。

### context_data

採 JSONB，事件可放不同欄位。研究分析時必須依 `action_state` 解讀，不可假設所有 row 具有相同 schema。

---

## 20. 排行榜

### 遊戲排行榜

`leaderboard` 欄位：

- id。
- user_id。
- full_name。
- game。
- score。
- created_at。

唯一限制：

```text
unique(user_id, game)
```

前端先查舊分數，只有新分數更高才 upsert。

### 獎章排行榜

從 `profiles.progress.badges` 拆出 tier：

- 金牌 5 分。
- 銀牌 3 分。
- 銅牌 1 分。

排序：

1. score DESC。
2. gold DESC。
3. silver DESC。
4. bronze DESC。
5. full_name ASC。

---

## 21. 已知風險與技術債

### 高優先

1. **progress 儲存可能遺失快速連續更新**：儲存中使用 `isSaving` 直接跳過下一次 effect，沒有排隊重送最新版。
2. **persist 沒檢查 Supabase 回傳 error**：目前只 catch JavaScript exception，資料庫回傳錯誤可能被靜默忽略。
3. **LSA insert 沒檢查 error**：研究事件可能失敗但前端沒有告警或 retry。
4. **獎章排行榜與 profiles RLS**：不能單純用 own-only RLS 加 security-invoker direct view，否則學生只會看到自己；交付 SQL 已採安全函式投影。
5. **研究個資**：`full_name` 同時寫入 profiles、leaderboard 與 lsa_logs，匯出與分享前必須去識別化。

### 中優先

1. Unit 2–5 未接回 UI。
2. Unit 2–5 無固定挑戰題庫。
3. `meta.time` 與實際每題 20 秒不一致。
4. App.tsx、BadgesView.tsx、ReorderSentenceGame.tsx 過大，維護成本高。
5. leaderboard 的 full_name 是成績寫入當時快照；之後改名不會自動同步舊排行。
6. `totalLogins` 是每次 progress restore 增加，不等同真正登入次數。
7. 學習區 long session 只有離開 tab 時才計算；直接關頁不會記錄。
8. localStorage 的文法方塊 log 沒有容量與清理策略。

### 程式品質檢查結果

本次檢查：

- `npm run build`：成功。
- 產出 JS 約 569.5 kB，Vite 提示 chunk 大於 500 kB。
- `npm run lint`：52 errors、1 warning。
- 問題主要為 `any`、`@ts-ignore`、Fast Refresh 匯出規則、空 catch、prefer-const 與 Hook dependency。
- `npm audit`：13 個弱點（1 low、4 moderate、8 high、0 critical）。更新前需先評估 breaking change，不要直接在正式實驗期間執行強制升級。

---

## 22. 建議接手優先順序

### 第一階段：確保資料不遺失

- 修正 progress persist queue。
- 檢查 Supabase error。
- 為 LSA 加 retry 或失敗緩衝。
- 建立每日備份。

### 第二階段：確保研究資料可解釋

- 建立 action_state data dictionary。
- 固定 context_data schema 版本。
- 記錄 app_version / experiment_version。
- 將姓名改成研究代碼或另做去識別化 View。

### 第三階段：降低維護成本

- 拆分 App.tsx。
- 拆分 BadgesView 常數、計畫精靈與卡片。
- 建立 Supabase generated types。
- 補 ESLint。
- 補單元測試與 E2E 測試。

### 第四階段：擴充教材

- 啟用 Unit selector。
- 補 Unit 2–5 挑戰 JSON。
- 統一時間規則。
- 決定是否重新開放課文與四選一測驗。

---

## 23. 新增一個 Unit

1. 在 `types.ts` 擴充 `UnitId`，若超過 6。
2. 在 `units.ts` 建立 words、grammar、story。
3. 在 `UNITS` 註冊。
4. 恢復 App 的 `setUnitId` 與單元選擇 UI。
5. 在 `defaultProgress().byUnit` 增加預設值。
6. 建立 `data/challenges/unit-N/level-1...10.json`。
7. 將 App 固定題庫 mapping 改為可擴充資料結構或動態 import。
8. 測試 progress 舊資料相容性。

---

## 24. 新增一種獎章

1. `progress.ts` 的 `BADGE_QR` 新增規則。
2. `getBadgeValue()` 新增指標計算。
3. `BadgesView.tsx` 的 `BADGE_META` 新增名稱與描述。
4. 若為 SRL 自訂獎章：
   - 加入 `SRL_CUSTOM_KEYS`。
   - 加入 `SRL_HIDDEN_KEYS`。
   - 加入 `SRL_BADGE_TEMPLATES`。
   - 加入合理上限。
   - 檢查 baseline 邏輯。
5. 建立測試資料，驗證 0→銅→銀→金。
6. 驗證 `badge_leaderboard_ranked` 能正確計數。

---

## 25. 新增一個 LSA 事件

1. 在 `lsa-states.ts` 新增 constant。
2. 在實際互動點呼叫 `logLSAEvent()`。
3. context_data 避免存 React object、循環引用或大型不必要資料。
4. 在交接資料字典記錄：
   - 觸發時機。
   - 每個欄位型別。
   - 是否可能重複。
   - 如何判定一次完整行為。
5. 在 `research_queries.sql` 補匯出查詢。

---

## 26. 部署

本專案是 Vite SPA，可部署至 Vercel、Netlify、Cloudflare Pages 或其他靜態主機。

必要設定：

- Build command：`npm run build`
- Output directory：`dist`
- 環境變數：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
- SPA rewrite：所有前端路徑回到 `index.html`
- Supabase Auth：把正式網域加入 Site URL 與 Redirect URLs

部署後至少測試：

- 註冊驗證信。
- 登入。
- 忘記密碼回跳。
- ProfileSetup。
- progress 保存。
- snake / tetris 排行榜。
- badge leaderboard。
- lsa_logs insert。

---

## 27. 備份與研究資料保存

建議至少保存：

- `auth.users` 的管理匯出資訊。
- `profiles`。
- `leaderboard`。
- `lsa_logs`。
- SQL schema。
- 正式上線 commit hash。
- 當次實驗使用的題庫 JSON 與 units.ts。

研究開始後不要直接修改：

- 題目正解。
- 星等門檻。
- 獎章門檻。
- LSA action_state 名稱。
- 研究組別欄位格式。

若必須修改，請記錄日期、原因、commit hash 與受影響學生。

---

## 28. 常見問題

### 登入後一直停在個人資料頁

- 檢查 `profiles` row 是否存在。
- 檢查 `full_name` 是否為 null 或空字串。
- 檢查 profile UPDATE policy。
- 檢查 trigger。

### 進度重新整理後消失

- 查看瀏覽器 Console 的 `[progress.restore]`。
- 檢查 profiles UPDATE policy。
- 檢查 progress 是否成功寫入 JSONB。
- 檢查是否在兩個分頁同時操作。

### 排行榜讀不到

- 檢查 leaderboard SELECT policy。
- 檢查 `game` 是否是 `snake` 或 `tetris`。
- 檢查 unique constraint。
- 檢查 authenticated table grants。

### 獎章排行榜只有自己

- 代表使用了 `security_invoker` direct view，又受到 profiles own-only RLS。
- 請使用交付 SQL 中的 SECURITY DEFINER aggregate function + projection view。

### LSA 沒有資料

- 檢查 user 是否登入。
- 檢查 INSERT policy。
- 檢查 `user_id` 是否等於 `auth.uid()`。
- 檢查 action_state 是否為空。
- 建議暫時讓 `logLSAEvent` 印出 Supabase error。

### 語音沒有聲音

- 確認瀏覽器支援 SpeechSynthesis。
- 確認系統有英文 voice。
- 確認使用者已與頁面互動，避免瀏覽器 autoplay 限制。

---

## 29. 交接前檢查清單

- [ ] 原始碼已提交 Git，沒有 `.env.local`。
- [ ] 正式 branch 與 commit hash 已記錄。
- [ ] `npm ci` 成功。
- [ ] `npm run build` 成功。
- [ ] Supabase schema 已備份。
- [ ] RLS policy 已截圖或匯出。
- [ ] Auth Redirect URLs 已記錄。
- [ ] 正式題庫版本已封存。
- [ ] profiles / leaderboard / lsa_logs 已匯出備份。
- [ ] 學生個資與研究代碼對照表分開保管。
- [ ] 已執行測試帳號全流程。
- [ ] 已確認研究查詢不會誤改正式資料。

---

## 30. 相關檔案

- `supabase_schema.sql`：可重建的資料庫、RLS、Trigger、View。
- `research_queries.sql`：研究分析與人工維護語句；不是初始化檔。
- `LearningQuest_實驗組_程式系統交接說明書.docx`：更完整的系統說明、逐檔案解讀、資料流、風險與維運流程。

---

## 31. 維護原則

1. 先保住研究資料，再改 UI。
2. 每次改指標，都同步改程式、SQL、資料字典與研究方法紀錄。
3. 不直接在正式資料庫測試 destructive SQL。
4. 不在前端放 service role key。
5. 不把真實學生姓名與 UUID 放進公開 GitHub、論文附件或交接範例。
6. 所有重要修改都要有 Git commit、日期與原因。
