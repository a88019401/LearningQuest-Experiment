# LearningQuest: 可模組化英語學習平台

LearningQuest 是一個可模組化的英語學習網站原型，採用 **React + TypeScript + Vite + Tailwind CSS** 打造。  
專案以「**資料驅動**」為核心，教材內容可輕易擴充，並整合 **Supabase** 作為後端，實現：

- 使用者身份驗證（Email + 密碼）
- 雲端進度儲存（XP、星等、徽章、遊戲表現）
- 排行榜與未來學習分析的基礎資料

---

## 核心技術

- 前端：React, TypeScript, Vite, Tailwind CSS v4  
- 後端與資料庫：Supabase（PostgreSQL + Auth + RLS）  
- 核心功能：
  - 互動式單字、文法、課文練習
  - 小遊戲：貪吃蛇（單字）、俄羅斯方塊式文法重組
  - **資料驅動的徽章系統（30 枚徽章、銅銀金三級）**
  - 雲端進度同步與排行榜

---

## 系統架構與執行流程

### 1. 使用者登入流程

1. 使用者在首頁由 `AuthGate` 元件進行登入／註冊：
   - **註冊**：輸入 Email + 密碼 建立帳號  
   - **登入**：使用 Email + 密碼驗證
   - 提供「忘記密碼」功能，會寄出重設連結

2. 首次登入成功後，會導向 `ProfileSetup` 頁面：
   - 填寫：**姓名 (`full_name`)**、**學校 (`school`)**、**年級 (`grade`)**
   - 儲存於 Supabase 的 `profiles` 資料表中

3. Profile 完成後，進入主應用程式 `LearningQuestApp`。

### 2. 資料載入與狀態管理

- `AuthProvider`（`state/AuthContext.tsx`）負責：
  - 監聽 Supabase Auth 狀態
  - 取得當前使用者資料與進度

- `useProgress`（`state/progress.ts`）負責：
  - 從 `profiles.progress` 讀取學習進度（JSONB）
  - 建立本地 `Progress` 狀態（byUnit / stats / badges / totalXP）
  - 任何進度更新（XP、星等、徽章）都會自動：
    - 更新 React 狀態
    - 同步回 Supabase（雲端儲存）

### 3. 主應用畫面結構

`App.tsx` 主要提供四個分頁：

- **學習區（Learn）**
  - 單字（Vocab）：單字集、貪吃蛇遊戲
  - 文法（Grammar）：文法說明、文法俄羅斯方塊
  - 課文（Text）：課文故事閱讀、句子排列遊戲
- **挑戰區（Challenge）**
  - 每單元最多 10 關，每關 10 題
  - 依星等解鎖下一關（通常 2 星以上解鎖）
- **獎章區（Badges）**
  - 顯示 30 枚徽章，依類別（參與 / 技巧 / 鼓勵）分類
  - 每枚徽章有「未解鎖／銅／銀／金」四個等級
- **排行榜（Leaderboard）**
  - 顯示遊戲相關成績（目前主要針對小遊戲與挑戰的表現）
  - 後端使用 Supabase 儲存與查詢分數

---

## 檔案結構（重點）

```text
src/
├─ components/
│  ├─ ProfileSetup.tsx         # 首次登入的個人資料設定頁面
│  ├─ SnakeChallenge.tsx       # 貪吃蛇遊戲（會回報成績與用時）
│  ├─ ReorderSentenceGame.tsx  # 俄羅斯方塊式文法句子重組遊戲
│  ├─ StoryViewer.tsx          # 課文雙語閱讀元件
│  ├─ ArrangeSentencesGame.tsx # 句子排列遊戲
│  ├─ BadgesView.tsx           # 徽章展示頁面（30 枚徽章分類顯示）
│  ├─ Leaderboard.tsx          # 排行榜畫面
│  └─ ... 其他 UI 與小元件
│
├─ data/
│  └─ units.ts                 # 核心教材資料（單字、文法、課文）
│
├─ lib/
│  └─ questionGen.ts           # 題目自動生成器（例如單字四選一）
│
├─ state/
│  ├─ AuthContext.tsx          # 使用者登入狀態與個人資料
│  └─ progress.ts              # 核心狀態管理 Hook（useProgress），含徽章系統
│
├─ supabaseClient.ts           # Supabase 連線設定
├─ types.ts                    # 全域 TypeScript 型別定義
├─ App.tsx                     # 主應用程式：頁籤切換與學習流程
└─ main.tsx                    # 應用程式入口，掛載 AuthProvider
```
後端設定（Supabase）

本專案使用 Supabase 處理使用者認證與資料儲存。若要自行架設，請依下列步驟：

1. 建立 Supabase 專案

前往 Supabase
 建立專案。

2. 設定環境變數

在專案根目錄建立 .env.local 檔案，填入下列內容：

VITE_SUPABASE_URL="你的 Supabase Project URL"
VITE_SUPABASE_ANON_KEY="你的 Supabase anon public 金鑰"

3. 建立資料表與觸發器

在 Supabase 專案的 SQL Editor 執行以下 SQL：

-- 1. Profiles Table: 儲存使用者個人資料與學習進度
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  updated_at TIMESTAMPTZ,
  full_name TEXT,
  school TEXT,
  grade TEXT,
  progress JSONB, -- 使用 JSONB 格式儲存整個進度物件

  CONSTRAINT profiles_id_fkey FOREIGN KEY (id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 2. 設定資料列級安全性 (RLS)，確保使用者只能存取自己的資料
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. 建立觸發器：當有新使用者註冊時，自動建立對應的 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

進度與徽章系統（Progress & Badge System）
1. Progress 資料結構（簡要）

在 state/progress.ts 中，系統使用下列結構管理學習進度：

type UnitProgress = {
  stars: number; // 該單元 0–3 星
  xp: number;
  vocab: { studied: number; quizBest: number };
  grammar: { studied: number; reorderBest: number };
  text: { read: number; arrangeBest: number };
  challenge: {
    clearedLevels: number;
    bestTimeSec: number;
    bestScore: number;
    levels: Record<number, { bestScore: number; bestTimeSec: number; stars: number }>;
  };
};

type UserStats = {
  totalLogins: number;
  totalTimeSec: number;
  totalErrors: number;
  totalHints: number;
  totalRetries: number;
  gamesPlayed: number;
  perfectRuns: number;
  storiesRead: number;
  longSessions: number;
  closeCalls: number;
  comebackRuns: number;
  failedChallenges: number;
};

type Progress = {
  byUnit: Record<UnitId, UnitProgress>;
  badges: Record<string, { tier: BadgeTier; unlockedAt?: string }>;
  stats: UserStats;
  totalXP: number;
};


這個 Progress 物件會以 JSONB 形式存進 profiles.progress 欄位，並在登入時自動載入、合併預設值。

2. 資料驅動的徽章系統

新版徽章系統採用「**資料驅動（data-driven）」的方式：

共 30 枚徽章，分為 3 類：

參與類 Participation：10 枚

技巧類 Skill：10 枚

鼓勵類 Encouragement：10 枚

每枚徽章具有 4 個等級 (BadgeTier)：

0：未解鎖（🔒）

1：銅級（🥉）

2：銀級（🥈）

3：金級（🥇）

徽章定義集中在 BADGE_QR：

export const BADGE_QR: Record<string, {
  type: 'participation' | 'skill' | 'encouragement';
  thresholds: [number, number, number]; // 銅、銀、金門檻
  reverse?: boolean; // true 表示「數值越小越好」（例如完成時間）
}>

3. 行為統計：reportActivity 流程

所有學習活動（單字集、課文閱讀、小遊戲、挑戰關卡）在完成時都會呼叫：

reportActivity({
  gamesPlayed: 1,
  totalTimeSec: timeUsed,
  totalErrors: wrongCount,
  perfectRuns: isPerfect ? 1 : 0,
  // ...其他需要的欄位
});


reportActivity 會：

將這些數值累加到 progress.stats

呼叫 evaluateBadges(progress)，根據最新的 UserStats 與各單元成績，重新評估 30 枚徽章的等級

若有徽章升級，更新 progress.badges，並記錄 unlockedAt 時間戳

4. BadgesView 顯示

components/BadgesView.tsx 會依照：

類別（參與 / 技巧 / 鼓勵）分區顯示

每個徽章顯示：

中文名稱（例如：持之以恆、貪吃蛇王、逆轉勝…）

簡短描述

目前等級（未解鎖／銅／銀／金）

下一級的目標值提示（例如「目標：10」）

這個設計兼顧：

可讀性（給學生與老師看）

可維護性（未來修改門檻或新增徽章時，只需調整定義與統計來源）

學習區與遊戲機制
1. 學習區（Learn）

單字 Vocab

VocabSet：單字卡瀏覽與基本練習，完成一次可獲得 XP 並記錄「單字練習次數」

SnakeChallenge：貪吃蛇式單字遊戲

根據作答記錄：

回報作答數、正確數、錯誤數、使用時間

更新 vocab.quizBest 與徽章統計（如 gamesPlayed、totalErrors、perfectRuns）

文法 Grammar

GrammarExplain：文法重點說明，閱讀後可獲得 XP 並記錄「文法學習次數」

ReorderSentenceGame：將句子以俄羅斯方塊方式重組

完成回合後，會更新：

grammar.reorderBest

gamesPlayed、perfectRuns、totalErrors 等統計

課文 Text

StoryViewer：課文中英雙語閱讀，閱讀一次會：

增加 XP

更新 text.read

更新 storiesRead（用來觸發故事類徽章，如 STORY_FAN）

ArrangeSentencesGame：將課文句子打散後要求學生重新排列

完成後更新：

text.arrangeBest

perfectRuns / totalErrors 等統計

2. 挑戰區（Challenge）

每單元預設 10 關，每關約 10 題選擇題

星等計算（預設）：

10 題全對：3 星

≥ 7 題：2 星

≥ 4 題：1 星

解鎖規則：

通過一關（通常 2 星以上），才會解鎖下一關

結束時會呼叫 handleChallengeFinish：

更新單元內部 challenge.levels[level]

更新以下統計：

gamesPlayed

totalTimeSec

perfectRuns / failedChallenges

longSessions（例如遊玩 ≥ 20 分鐘）

comebackRuns（比過去最佳成績進步 ≥ 3 分）

closeCalls（剛好及格）

totalErrors

這些統計會被徽章系統用來頒發例如「馬拉松」、「逆轉勝」、「倖存者」等鼓勵類徽章。

安裝與開發
環境需求

Node.js 20.19+

常用指令
# 安裝依賴
npm install

# 啟動開發伺服器 (http://localhost:5173/)
npm run dev

# 建置專案
npm run build

# 預覽建置後的專案
npm run preview

未來方向

排行榜擴充

目前已實作基本排行榜頁面，未來可新增：

不同遊戲／單元的子排行榜

依學校、班級或年級篩選

登出與帳號管理 UI

目前已有 Supabase Auth，未來可加入：

前端明確的「登出」按鈕

帳號資訊檢視／修改介面

學習分析（Learning Analytics）

以現有 UserStats 與 Progress 為基礎：

紀錄錯題類型、作答時間分布

自動產生個人化複習建議

結合 SRL（自我調整學習）相關量表或反思機制

更多小遊戲與徽章變體

新增其他型態的遊戲（例如聽力、拼字、對話選擇）

實驗不同的徽章呈現方式（例如概念圖式 Badge Tree、學習者自訂徽章條件）