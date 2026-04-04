// src/data/units.ts
import type { UnitConfig, UnitId } from "../types";

/* =========================
   ✅ Unit 1: Family + Free Time（已合併）
========================= */

// ✅ Unit 1: 單字（原 37 筆 + Free Time 41 筆 → 合併；不含 example）
const UNIT1_WORDS: UnitConfig["words"] = [
  { term: "shy", def: "adj. 害羞的", note: "114會考出現過" },
  { term: "lonely", def: "adj. 寂寞的；孤獨的", note: "常和 alone 比較" },
  { term: "deal", def: "n. 約定；交易", note: "It’s a deal! 很實用" },
  { term: "national", def: "adj. 國家的；國立的", note: "常見於閱讀題" },
  { term: "row", def: "n. 一排；一行；一列", note: "in a row＝連續" },
  { term: "grade", def: "n. 年級；成績", note: "一字兩義，常考" },
  { term: "miss", def: "v. 想念；錯過；趕不上", note: "113會考出現過" },
  { term: "quite", def: "adv. 相當；頗", note: "作文也很常用" },
  { term: "correct", def: "v. 更正；adj. 正確的", note: "詞性變化要小心" },
  { term: "power", def: "n. 力量；權力；電力", note: "一字多義重點字" },
  { term: "course", def: "n. 課程；路線", note: "不是只有課程" },
  { term: "mind", def: "v. 介意", note: "Do you mind...? 必背" },
  { term: "study", def: "n./v. 研究；學習", note: "可當名詞也可當動詞" },
  { term: "sign", def: "n. 跡象；徵兆；標誌", note: "閱讀題很常見" },
  { term: "country", def: "n. 鄉村；鄉下；國家", note: "113會考語境出現過" },
  { term: "sight", def: "n. 視線；景象；視力", note: "一字多義，很值得背" },
  { term: "tidy", def: "adj./v. 整齊的；整理", note: "生活英語常出現" },
  { term: "item", def: "n. 品項；項目", note: "清單、菜單常看到" },
  { term: "repeat", def: "v. 重複；重說", note: "口說課常用字" },
  { term: "package", def: "n. 包裹；一小包", note: "網購情境常見字" },

  { term: "either", def: "adv./pron./adj. 也（不）；任一的；任一者", note: "易和 neither 混淆" },
  { term: "neither", def: "adv./pron./adj. 也不；兩者都不", note: "文法選擇題常考" },
  { term: "lonely", def: "adj. 寂寞的；孤獨的", note: "不是 alone 的完全同義字" },
  { term: "deal", def: "n. 約定；交易", note: "口語感很強，好記" },
  { term: "national", def: "adj. 國家的；國立的", note: "可延伸 international" },
  { term: "row", def: "n. 一排；一行；一列", note: "位置題、場景題常見" },
  { term: "correct", def: "v. 更正；adj. 正確的", note: "看到錯誤改正就想到它" },
  { term: "power", def: "n. 力量；權力；電力", note: "閱讀理解很好用" },
  { term: "course", def: "n. 課程；路線", note: "多義字代表" },
  { term: "sight", def: "n. 視線；景象；視力", note: "高機率出現在文章裡" },
];

// ✅ Unit 1：文法重點（已升級為雙語例句）
const UNIT1_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "附和句：so / too / either / neither",
    desc: "肯定附和用 so / too，否定用 either / neither。so/neither 放句首且必須「倒裝」(助動詞/be動詞 + 主詞)；too/either 放句尾。\n💡 易犯錯誤：(1) 忘記倒裝，寫成 so I can (應為 so can I)。(2) 前後動詞不一致：前面用 be 動詞，後面卻誤用 do/does。",
    examples: [
      { en: "Mina can sing, and so can I.", zh: "Mina 會唱歌，我也會。" },
      { en: "Leo was tired, and I was, too.", zh: "Leo 很累，我也是。" },
      { en: "Ben doesn’t cook, and I don’t, either.", zh: "Ben 不下廚，我也不會。" },
      { en: "Amy isn’t late, and neither is Jill.", zh: "Amy 沒遲到，Jill 也沒有。" },
    ],
  },
  {
    point: "連接詞：both...and...",
    desc: "表示「兩者皆是」。當連接兩個主詞時，動詞永遠視為「複數」。\n💡 易犯錯誤：看到 both A and B 的 B 是單數名詞，就誤用單數動詞。例如 Both you and he 'is' (應改為 are)。",
    examples: [
      { en: "Both Tina and Kevin are here.", zh: "Tina 和 Kevin 都在。" },
      { en: "He is both kind and smart.", zh: "他又善良又聰明。" },
      { en: "She can both sing and dance.", zh: "她會唱也會跳。" },
    ],
  },
  {
    point: "連接詞：not only... but also...",
    desc: "表示「不只 A，還有 B」。當連接兩個主詞時，動詞的單複數由「最靠近的」主詞 (也就是 B) 決定。\n💡 易犯錯誤：以為是兩個人就自動用複數，例如 Not only you but also he 'are' (應配合 he 改為 is)。",
    examples: [
      { en: "Not only Jack but also his mom is here.", zh: "不只 Jack，他媽媽也在。" },
      { en: "She not only cooked but also cleaned.", zh: "她不只煮飯，也打掃了。" },
      { en: "I bought not only tea but also bread.", zh: "我不只買了茶，也買了麵包。" },
    ],
  },
  {
    point: "連接詞：either...or... / neither...nor...",
    desc: "Either...or (不是A就是B)，Neither...nor (兩者皆非)。連接主詞時，動詞一樣由「最靠近的 B」決定。\n💡 易犯錯誤：(1) 搭配錯亂，把 either 配到 nor。(2) 誤以為 neither 也是兩人，錯用複數動詞：Neither you nor he 'have' (應配合 he 改為 has)。",
    examples: [
      { en: "Either you or Kevin has the key.", zh: "你或 Kevin 其中一人有鑰匙。" },
      { en: "We can either walk or wait.", zh: "我們可以走路或等。" },
      { en: "Neither Amy nor her brothers were ready.", zh: "Amy 和她哥哥們都沒準備好。" },
      { en: "She likes neither coffee nor tea.", zh: "她咖啡和茶都不喜歡。" },
    ],
  },
  {
    point: "被動語態：be + p.p.",
    desc: "用來強調「動作的接受者」。結構一定要有「be 動詞 + 過去分詞 (p.p.)」，時態由 be 動詞決定。\n💡 易犯錯誤：(1) 粗心漏掉 be 動詞，直接寫 The room cleaned。(2) 不規則動詞的 p.p. 拼錯，或誤用成過去式。",
    examples: [
      { en: "The room was cleaned yesterday.", zh: "房間昨天被打掃了。" },
      { en: "The bridge will be built soon.", zh: "橋很快會被蓋好。" },
      { en: "The song was written in Taiwan.", zh: "這首歌是在台灣寫的。" },
    ],
  },
  {
    point: "被動進階：to be / being / have been",
    desc: "被動的變化型：want to be p.p. (想被...)、enjoy being p.p. (享受被...)、have been p.p. (已經被...)。\n💡 易犯錯誤：主詞明明是物品卻誤用主動，例如 The work must 'finish' (應為 must be finished)；或介系詞後方忘記將 be 改為 being。",
    examples: [
      { en: "She wants to be invited.", zh: "她想被邀請。" },
      { en: "He hates being laughed at.", zh: "他討厭被嘲笑。" },
      { en: "Many trees have been planted.", zh: "很多樹已經被種下了。" },
      { en: "He was made to wait.", zh: "他被要求等候。" },
    ],
  },
  {
    point: "連接詞：when / while",
    desc: "when 常接「瞬間發生的短動作」；while 強調「持續進行中的長動作」(常配進行式)。\n💡 易犯錯誤：在 while 後面接瞬間動作，或時態混亂。例如 I was sleeping 'while' the phone rang (應改為 when)。",
    examples: [
      { en: "I was reading when Mom called.", zh: "媽媽打來時，我正在看書。" },
      { en: "While Dad was cooking, I studied.", zh: "爸爸煮飯時，我在讀書。" },
      { en: "The lights went out when we were eating.", zh: "我們吃飯時停電了。" },
      { en: "While she was walking, it began to rain.", zh: "她走路時開始下雨。" },
    ],
  },
  {
    point: "連接詞：until / if / although / because / so",
    desc: "根據句意邏輯選擇。if 條件句要注意「現在式代替未來式」。\n💡 易犯錯誤：(1) 中文常說「因為...所以」，但英文 because 和 so 絕對不能出現在同一句！although 和 but 也一樣。(2) If it 'will rain' (應改為 rains)。",
    examples: [
      { en: "I will wait until you come.", zh: "我會等到你來。" },
      { en: "If it rains, we will stay home.", zh: "如果下雨，我們就待在家。" },
      { en: "Although he was sick, he went out.", zh: "雖然他生病了，還是出門了。" },
      { en: "She stayed home because it rained.", zh: "因為下雨，她待在家。" },
      { en: "I was tired, so I slept early.", zh: "我累了，所以早睡。" },
    ],
  },
  {
    point: "片語動詞：可分 / 不可分",
    desc: "動詞片語分兩種：可分 (動詞+副詞，如 turn on) 與不可分 (動詞+介系詞，如 look for)。\n💡 易犯錯誤：當受詞是「代名詞 (it/them)」時，可分片語『必須』夾在中間！例如 turn it on，絕對不能寫成 turn on it。",
    examples: [
      { en: "Please turn it down.", zh: "請把它關小聲。" },
      { en: "I looked the word up.", zh: "我查了那個字。" },
      { en: "She takes care of her dog.", zh: "她照顧她的狗。" },
      { en: "We must deal with it now.", zh: "我們現在必須處理它。" },
    ],
  },
  {
    point: "關係代名詞：whose",
    desc: "用來代替「所有格 (his/her/its/their)」，表示「...的」。\n💡 易犯錯誤：(1) 拼字搞混，把 whose 寫成 who's (who is)。(2) whose 後面必須緊接一個名詞（它擁有的東西），不能單獨出現或接動詞。",
    examples: [
      { en: "I know the girl whose hair is pink.", zh: "我認識那個頭髮粉紅色的女孩。" },
      { en: "The boy whose dad is a doctor is here.", zh: "那個爸爸是醫生的男孩在這裡。" },
      { en: "I like the desk whose legs are white.", zh: "我喜歡那張桌腳是白色的桌子。" },
    ],
  },
  {
    point: "關係代名詞：where",
    desc: "當先行詞是「地點」，且關代在子句中扮演地方副詞 (在那裡) 時使用，等於 in/at/on which。\n💡 易犯錯誤：只要看到地點就秒選 where！注意：如果後面的句子缺主詞或一般受詞（例如 This is the park ___ I like），必須用 which/that，不能用 where。",
    examples: [
      { en: "This is the shop where I met Amy.", zh: "這就是我遇見 Amy 的店。" },
      { en: "The park where we played is small.", zh: "我們玩耍的公園很小。" },
      { en: "That is the house where he grew up.", zh: "那是他長大的房子。" },
    ],
  },
];
// ✅ Unit 1：小故事（改寫：現在簡單式 × 日記體）
const UNIT1_STORY: UnitConfig["story"] = {
  title: "Diary 1: Our Free Time（我們的日常）",
  paragraphs: [
    {
      en: "Dear Diary, I am Nick. I am a junior high school student, and I live in Taichung with my family.",
      zh: "親愛的日記，我是 Nick。我是國中生，和家人住在台中。",
    },
    {
      en: "We are a warm family. We eat breakfast together every morning.",
      zh: "我們是一個溫暖的家庭。我們每天早上一起吃早餐。",
    },
    {
      en: "Dad is a nurse at a hospital. He works at night on Mondays and Fridays.",
      zh: "爸爸在醫院當護理師。他在星期一和星期五上夜班。",
    },
    {
      en: "He likes sports and plays basketball on weekends. He is on a local team.",
      zh: "他喜歡運動，週末打籃球。他是當地球隊的一員。",
    },
    {
      en: "Mom is a doctor. She plays the piano after dinner and practices every day.",
      zh: "媽媽是醫生。她晚餐後彈鋼琴，而且每天練習。",
    },
    {
      en: "My sister Bella loves music, too. She plays the guitar and sings at home.",
      zh: "我姐姐 Bella 也愛音樂。她在家彈吉他、唱歌。",
    },
    {
      en: "My brother Eddie draws well. He paints animals and makes small cards for friends.",
      zh: "我哥哥 Eddie 很會畫畫。他畫動物，也做小卡片送朋友。",
    },
    {
      en: "I read comics after school. I also fly a kite at the park when the wind is strong.",
      zh: "我放學後看漫畫。風大時我也在公園放風箏。",
    },
    {
      en: "We have a pet dog, Abby. She has big eyes and short legs.",
      zh: "我們有一隻寵物狗，叫 Abby。牠有大眼睛和短短的腿。",
    },
    {
      en: "Grandpa is a farmer. He gets up early and grows vegetables every day.",
      zh: "爺爺是農夫。他每天早起種菜。",
    },
    {
      en: "Grandma is a great cook. She makes a cake for us on Sundays.",
      zh: "奶奶很會煮。她每個星期天為我們做蛋糕。",
    },
    {
      en: "I am 160 centimeters tall. Bella is one hundred and sixty-five centimeters tall.",
      zh: "我身高一百六十公分。Bella 身高一百六十五公分。",
    },
    {
      en: "Every Saturday afternoon, we go to the park. Dad runs, Mom walks, and I join a basketball game with my friends.",
      zh: "每個星期六下午我們去公園。爸爸跑步、媽媽散步，而我跟朋友一起打籃球。",
    },
    {
      en: "I am not tall, but I put my all into the game. My friends say, “You can say that again!”",
      zh: "我不高，但我全力以赴。我的朋友說：「你說得沒錯！」",
    },
    {
      en: "At night, we sit in the living room. We talk about school and share good news.",
      zh: "晚上我們坐在客廳，聊學校的事，也分享好消息。",
    },
    {
      en: "We are different, but we help each other. A nice weekend makes up for a busy week.",
      zh: "我們很不一樣，但彼此會互相幫忙。愉快的週末能彌補忙碌的一週。",
    },
    {
      en: "That is my family. We enjoy simple days, and we love each other a lot.",
      zh: "這就是我的家。我們享受簡單的生活，也非常愛彼此。",
    },
  ],
  sentencesForArrange: [
    "I am Nick, and I live in Taichung with my family. ",
    "I am a junior high school student. ",
    "We eat breakfast together every morning.",
    "Dad works at a hospital.",
    "He plays basketball on weekends, and he is on a local team. ",
    "Mom is a doctor, and she practices the piano after dinner.",
    "My sister Bella plays the guitar and loves music. ",
    "My brother Eddie paints animals and makes small cards for friends.",
    "After school, I read comics or fly a kite at the park.",
    "Grandpa gets up early and grows vegetables every day.",
    "Grandma makes a cake for us on Sundays. ",
    "At night, we sit in the living room and share good news. ",
  ],
};

/* =========================
   ✅ Unit 2: 現在進行式（全新）
========================= */

// ✅ Unit 2：單字（35 筆；精簡定義、與題庫風格一致）
const UNIT2_WORDS: UnitConfig["words"] = [
  { term: "music video", def: "n. 音樂影片（英美少用 MV 縮寫）" },
  { term: "band", def: "n. 樂團" },
  { term: "take a look", def: "phr. 看一看" },
  { term: "all", def: "adj./pron./adv. 全部的；所有；完全" },
  { term: "cute", def: "adj. 可愛的" },
  { term: "great", def: "adj. 很棒的；偉大的；重大的" },
  { term: "free", def: "adj. 有空的；自由的；免費的" },
  { term: "weekend", def: "n. 週末" },
  { term: "Saturday", def: "n. 星期六" },
  { term: "together", def: "adv. 一起地" },
  { term: "ready", def: "adj. 準備好的（be ready for...）" },
  { term: "p.m.", def: "adv. 下午；晚上（時間）" },
  { term: "o'clock", def: "adv. …點鐘（整點）" },
  { term: "day", def: "n. 日；天；白天" },
  { term: "today", def: "adv./n. 今天；如今" },
  { term: "Friday", def: "n. 星期五" },
  { term: "Sunday", def: "n. 星期日" },
  { term: "Monday", def: "n. 星期一" },
  { term: "Tuesday", def: "n. 星期二" },
  { term: "Wednesday", def: "n. 星期三（d 不發音）" },
  { term: "Thursday", def: "n. 星期四" },
  { term: "week", def: "n. 週；星期" },
  { term: "a.m.", def: "adv. 上午；凌晨（時間）" },
  { term: "study", def: "v. 研讀；學習" },
  { term: "English", def: "n./adj. 英文；英國的" },
  { term: "take a walk", def: "phr. 散步" },
  { term: "movie", def: "n. 電影" },
  { term: "take a picture", def: "phr. 拍照" },
  { term: "party", def: "n. 派對" },
  { term: "report", def: "v./n. 報導；報告" },
  { term: "popular", def: "adj. 受歡迎的；流行的" },
  { term: "fan", def: "n. 迷；粉絲" },
  { term: "shake hands", def: "phr. 握手" },
  { term: "everyone", def: "pron. 每個人（接單數動詞）" },
  { term: "sign", def: "v./n. 簽名；標示" },
];

// ✅ Unit 2：文法重點（清潔版；每條例句一個完整句子）
const UNIT2_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "現在進行式：用法與基本句型",
    desc: "表示此刻正在進行的動作；常搭配 now, right now, at the moment。結構：S + be(am/is/are) + V-ing。",
    examples: [
      "I am reading now.",
      "She is cooking dinner.",
      "They are playing basketball at the moment.",
    ],
  },
  {
    point: "V-ing 拼字規則",
    desc: "一般 +ing；字尾 e → 去 e + ing；短母音 + 單子音 → 重複子音 + ing。",
    examples: [
      "He is making a cake.",
      "We are coming home.",
      "Tom is running in the park.",
      "She is sitting next to me.",
    ],
  },
  {
    point: "Look! / Listen! 與現在進行式",
    desc: "句首有 Look! 或 Listen!，常用現在進行式描述眼前的畫面或聲音。",
    examples: [
      "Look! The band is playing on the stage.",
      "Listen! The students are singing.",
    ],
  },
  {
    point: "否定句：be + not + V-ing",
    desc: "在 be 後面加 not；想表達『正在…，不在…』可用 not... but....",
    examples: [
      "Mom is not cooking now.",
      "He is doing homework, not playing games.",
      "They are not watching a movie.",
    ],
  },
  {
    point: "Yes–No 問句與簡答",
    desc: "把 be 動詞移到句首；簡答用人稱代名詞。肯定簡答不可縮寫。",
    examples: [
      "Are you studying?",
      "Yes, I am.",
      "Is she drawing?",
      "No, she is not.",
      "Are they playing?",
      "No, they are not.",
    ],
  },
  {
    point: "Wh- 問句：What / Where + be + S + V-ing",
    desc: "用來問正在做的事或地點。",
    examples: [
      "What are you doing?",
      "I am writing a card.",
      "Where is Jason studying?",
      "He is studying in his room.",
    ],
  },
  {
    point: "and 連接兩個現在分詞（邊…邊…）",
    desc: "S + be + V-ing and V-ing，用來描述同時進行的兩個動作。",
    examples: [
      "The students are talking and laughing.",
      "Susie and Ivy are singing and dancing.",
    ],
  },
  {
    point: "注意：通常不用現在進行式的動詞",
    desc: "狀態動詞如 know, like, want 等通常不用進行式，改用現在簡單式。",
    examples: [
      "I know the answer.",
      "She likes English.",
      "They want some water.",
    ],
  },
];

// ✅ Unit 2：小故事（現在進行式 × 日記體）
const UNIT2_STORY: UnitConfig["story"] = {
  title: "Diary 2: Right Now at the School Fair（此刻在園遊會）",
  paragraphs: [
    {
      en: "Dear Diary, it is Saturday afternoon, and our school fair is starting now.",
      zh: "親愛的日記，現在是星期六下午，我們的園遊會正要開始。",
    },
    {
      en: "Students are setting up the booths. Teachers are helping and smiling.",
      zh: "同學們正在佈置攤位。老師們正在幫忙並露出笑容。",
    },
    {
      en: "Look! A band is playing on the stage, and everyone is clapping.",
      zh: "看！一個樂團正在舞台上表演，大家正在拍手。",
    },
    {
      en: "They are playing a popular song, and we are singing together.",
      zh: "他們正在演奏一首很受歡迎的歌，而我們正一起唱歌。",
    },
    {
      en: "Some parents are taking pictures. My classmates are making a short music video.",
      zh: "有些家長正在拍照。我的同學正在拍一段音樂影片。",
    },
    {
      en: "Listen! The host is reporting the news of every booth.",
      zh: "聽！主持人正在報導每個攤位的新消息。",
    },
    {
      en: "Our English club is giving a show. We are acting and shaking hands with the little kids.",
      zh: "我們的英語社正在表演。我們正在演戲，並和小朋友握手。",
    },
    {
      en: "Grandma is taking a walk near the garden. She is not buying food now.",
      zh: "奶奶正在花園旁散步。她現在沒有在買東西。",
    },
    {
      en: "Dad is ready with the camera. He is taking a picture of our class.",
      zh: "爸爸相機準備好了。他正在幫我們班拍照。",
    },
    {
      en: "It is 3 p.m. now. The lunch team is making noodles, and the cookie team is selling cookies.",
      zh: "現在下午三點。午餐小組正在煮麵，餅乾小組正在賣餅乾。",
    },
    {
      en: "My best friend is not playing a video game. He is helping at the sign-in desk.",
      zh: "我最好的朋友沒有在打電玩。他正在服務報到處。",
    },
    {
      en: "Look at that dog! It is wearing a cute hat and standing out in the crowd.",
      zh: "看那隻狗！牠戴著可愛的帽子，在人群中很顯眼。",
    },
    {
      en: "Now the band is saying, “Take a look at our fan page!” We are scanning the code.",
      zh: "現在樂團正在說：「來看看我們的粉絲頁！」我們正在掃描 QR 碼。",
    },
    {
      en: "The sun is going down, but the lights are coming on. The fair is getting great.",
      zh: "太陽正在下山，但燈光亮起來了。園遊會變得更棒了。",
    },
    {
      en: "We are not tired. We are laughing and taking one last group photo.",
      zh: "我們不累。我們正在大笑，並拍最後一張大合照。",
    },
    {
      en: "It is 6 o’clock now. We are cleaning the stage and saying goodbye.",
      zh: "現在六點整。我們正在清理舞台並說再見。",
    },
    {
      en: "Today is a busy day, and we are enjoying every minute.",
      zh: "今天很忙碌，而我們正享受每一分鐘。",
    },
  ],
  sentencesForArrange: [
    "It is Saturday afternoon, and our school fair is starting now.",
    "Students are setting up the booths.",
    "A band is playing on the stage, and everyone is clapping.",
    "We are singing together.",
    "Parents are taking pictures.",
    "The host is reporting the news of every booth.",
    "Our English club is giving a show.",
    "Dad is taking a picture of our class.",
    "The cookie team is selling cookies.",
    "My friend is helping at the sign-in desk.",
    "The lights are coming on.",
    "We are cleaning the stage and saying goodbye.",
  ],
};

/* =========================
   ✅ Unit 3: 過去簡單式（全新）
========================= */

// ✅ Unit 3：單字（精選＋去重；詞性精簡、題庫友善）
const UNIT3_WORDS: UnitConfig["words"] = [
  { term: "yesterday", def: "adv./n. 昨天；昨日" },
  { term: "the day before yesterday", def: "phr. 前天" },
  {
    term: "last + 時間",
    def: "phr. 上一個…（last week / month / year / night）",
  },
  { term: "… ago", def: "adv. …之前（two days ago）" },
  { term: "at that time", def: "phr. 當時；那時候" },
  { term: "before", def: "adv./prep./conj. 以前；在…之前" },
  { term: "beach", def: "n. 海灘" },
  { term: "trash", def: "n.[U] 垃圾；廢物" },
  { term: "visit", def: "v./n. 拜訪；參觀" },
  { term: "island", def: "n. 島；島嶼" },
  { term: "a few", def: "phr. 一些（接可數複數）" },
  { term: "sea", def: "n.[U] 海；海水" },
  { term: "stop", def: "v./n. 停止；停靠站" },
  { term: "happen", def: "v. 發生" },
  { term: "dead", def: "adj. 死亡的；（電器）沒電的" },
  { term: "warm", def: "adj. 溫暖的；熱情的" },
  { term: "rainforest", def: "n. 雨林" },
  { term: "die", def: "v. 死亡（現在分詞：dying）" },
  { term: "by", def: "prep. 在…旁邊；在…附近；藉由" },
  { term: "How come?", def: "set phrase 為什麼（口語；= Why?）" },
  { term: "then", def: "adv. 那時；然後" },
  { term: "busy", def: "adj. 忙碌的" },
  { term: "river", def: "n. 河流" },
  { term: "lake", def: "n. 湖泊" },
  { term: "hill", def: "n. 山丘" },
  { term: "mountain", def: "n. 山；山脈" },
  { term: "camp", def: "v./n. 露營；營地" },
  { term: "climb", def: "v. 攀爬；爬（山）" },
  { term: "row a boat", def: "phr. 划船" },
  { term: "plant", def: "v./n. 種植；植物" },
  { term: "hike", def: "v./n. 健行" },
  { term: "picnic", def: "v./n. 野餐" },
  { term: "last", def: "adj./v. 上一個的；持續" },
  { term: "live", def: "v. 居住；生活" },
  { term: "playground", def: "n. 遊樂場；操場" },
  { term: "everything", def: "pron. 每件事；一切" },
  { term: "change", def: "v./n. 改變；變化" },
  { term: "burn", def: "v. 燒；燃燒（pt burned/burnt）" },
  { term: "oil", def: "n.[U] 油（食用油／石油等）" },
  { term: "sell", def: "v. 賣；出售（pt sold）" },
  { term: "make money", def: "phr. 賺錢" },
  { term: "miss", def: "v. 想念；錯過" },
  { term: "little by little", def: "phr. 一點一點地；逐漸地" },
  { term: "way", def: "n. 方式；路線；距離" },

  // 旅遊／地點延伸
  { term: "airport", def: "n. 機場" },
  { term: "travel", def: "v./n. 旅行（pt traveled/travelled）" },
  { term: "rest", def: "n./v. 休息" },
  { term: "hotel", def: "n. 旅館；飯店" },
  { term: "plane", def: "n. 飛機（= airplane）" },
  { term: "the sights", def: "n.pl. 名勝；風景" },
  { term: "bookstore", def: "n. 書店" },
  { term: "buy", def: "v. 買（pt bought）" },
  { term: "just", def: "adv. 剛剛；只是；就是" },
  { term: "learn", def: "v. 學習；得知" },
  { term: "story", def: "n. 故事；報導（pl. stories）" },
  { term: "cool", def: "adj. 酷的；涼爽的" },
  { term: "train", def: "n./v. 火車；訓練" },
  { term: "cold", def: "adj. 冷的" },
  { term: "try", def: "v./n. 嘗試" },
  { term: "take", def: "v. 拿；帶；取（pt took）" },
  { term: "the other day", def: "phr. 前幾天" },
  { term: "station", def: "n. 車站；電視/電台" },
  { term: "department store", def: "n. 百貨公司" },
  { term: "restaurant", def: "n. 餐廳" },
  { term: "theater", def: "n. 電影院；戲院" },
  { term: "market", def: "n. 市場" },
  { term: "temple", def: "n. 寺廟" },
  { term: "famous", def: "adj. 有名的（be famous for…）" },
  { term: "during", def: "prep. 在…期間" },
  { term: "besides", def: "prep./adv. 除了…之外；此外" },
  { term: "fall in love", def: "phr. 墜入愛河（pt fell）" },
  { term: "age", def: "n. 年齡" },
  { term: "lose", def: "v. 失去；輸（pt lost）" },
  { term: "cry", def: "v. 哭；喊叫" },
  { term: "hide", def: "v. 躲；藏；隱瞞（pt hid）" },
  { term: "build", def: "v. 建造（pt built）" },
  { term: "trip", def: "n. 旅行；行程" },
  { term: "sadly", def: "adv. 令人傷心地；可惜地" },
];

// ✅ Unit 3：文法重點（清潔版；每例皆為單一句）
const UNIT3_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "過去簡單式：用法與時間副詞",
    desc: "表示過去的事實、狀態或已完成的動作。常見時間語：yesterday, last + 時間, … ago, at that time, before, the day before yesterday；this + 時間 依語境亦可用過去式。",
    examples: [
      "I played basketball yesterday.",
      "She was busy this morning.",
      "We visited Taipei last summer.",
      "He moved here two years ago.",
    ],
  },
  {
    point: "be 動詞過去式：直述句",
    desc: "was 是 am/is 的過去式；were 是 are 的過去式；否定：was not / were not（wasn’t / weren’t）。",
    examples: [
      "I was at the library at that time.",
      "They were happy last night.",
      "She was not at home yesterday.",
      "We were not tired after the trip.",
    ],
  },
  {
    point: "be 動詞過去式：Yes–No 問句與簡答",
    desc: "把 be 移到句首；簡答用人稱代名詞；肯定簡答不縮寫。",
    examples: [
      "Was she at school this morning?",
      "Yes, she was.",
      "Were they at the park last night?",
      "No, they were not.",
    ],
  },
  {
    point: "be 動詞過去式：Wh- 問句",
    desc: "Wh- + was/were + 主詞，用來問地點、時間、身分或狀態。",
    examples: [
      "Where were you last Sunday?",
      "I was at the beach.",
      "When was the party?",
      "It was last weekend.",
    ],
  },
  {
    point: "一般動詞過去式：規則變化",
    desc: "多數 +ed；字尾 e 加 d；子音 + y → 去 y 加 ied；短母音 + 單子音 → 重複子音 + ed；母音 + y 直接 + ed。",
    examples: [
      "I visited the museum yesterday.",
      "She used my phone a minute ago.",
      "He studied English last night.",
      "They stopped at the bus stop.",
      "We played soccer last weekend.",
    ],
  },
  {
    point: "一般動詞過去式：肯定句",
    desc: "主詞 + 動詞過去式 + 其他 + 過去時間語。",
    examples: [
      "John played the piano yesterday.",
      "My parents watched the movie in 2011.",
    ],
  },
  {
    point: "一般動詞過去式：否定句",
    desc: "主詞 + did not + 原形動詞 + 其他 + 過去時間語。",
    examples: [
      "John did not play the piano yesterday.",
      "We did not go to the theater last week.",
    ],
  },
  {
    point: "一般動詞過去式：Yes–No 問句與簡答",
    desc: "Did + 主詞 + 原形動詞 + 其他 + 過去時間語？Yes, S did. / No, S did not.",
    examples: [
      "Did John play the piano yesterday?",
      "Yes, he did.",
      "Did they travel last summer?",
      "No, they did not.",
    ],
  },
  {
    point: "一般動詞過去式：Wh- 問句",
    desc: "Wh- + did + 主詞 + 原形動詞 + 其他 + 過去時間語？",
    examples: [
      "What did you do yesterday morning?",
      "I rowed a boat yesterday morning.",
      "Where did Frank live five years ago?",
      "He lived in the USA five years ago.",
    ],
  },
  {
    point: "常見不規則動詞：例句",
    desc: "不規則動詞需記憶；否定與疑問句用 did，主要動詞回原形。",
    examples: [
      "He went to the station the other day.",
      "We had dinner at a famous restaurant.",
      "I saw a movie at the theater.",
      "She took a picture at the temple.",
      "They made cookies last night.",
      "He came home at ten.",
      "I wrote a story last week.",
      "She wore a red coat yesterday.",
      "They built a house in 1986.",
      "He lost his umbrella on the way home.",
      "We met at the airport at noon.",
      "I woke up at seven yesterday.",
      "She read that book last month.",
      "They ran to the bus stop in the rain.",
      "He put the trash in the trash can.",
      "I drank a big glass of juice before dinner.",
    ],
  },
  {
    point: "today / this + 時間 也可能用過去式",
    desc: "若時間點已經過去（如 this morning, this Monday 已結束），可用過去式。",
    examples: [
      "She was busy this morning.",
      "We finished the report this Monday.",
    ],
  },
];

// ✅ Unit 3：閱讀摘要（過去簡單式 × 雙語 × 排序題庫）
const UNIT3_STORY: UnitConfig["story"] = {
  title: "Diary: A Weekend by the Lake（湖邊的週末）",
  paragraphs: [
    {
      en: "Last weekend, my family went to a small lake near the mountains.",
      zh: "上週末，我的家人去了山邊的一座小湖。",
    },
    {
      en: "We left home early and arrived at the lake at nine o’clock.",
      zh: "我們很早出門，九點整到達湖邊。",
    },
    {
      en: "The weather was warm, and the sky was clear.",
      zh: "天氣很溫暖，天空很晴朗。",
    },
    {
      en: "Dad set up the tent, and Mom prepared sandwiches.",
      zh: "爸爸搭了帳篷，媽媽準備了三明治。",
    },
    {
      en: "My sister and I took a walk by the water and picked a few flowers.",
      zh: "我和妹妹在水邊散步，還摘了幾朵花。",
    },
    {
      en: "After that, we rowed a boat on the lake.",
      zh: "之後，我們在湖上划船。",
    },
    {
      en: "Grandpa told us a story, and everyone laughed.",
      zh: "爺爺講了故事，大家都笑了。",
    },
    {
      en: "At noon, we had a picnic under a big tree.",
      zh: "中午，我們在一棵大樹下野餐。",
    },
    {
      en: "I took some pictures, and Dad taught me a new way to hold the camera.",
      zh: "我拍了幾張照片，爸爸教我一個新的握相機方式。",
    },
    {
      en: "In the afternoon, we visited a small temple near the lake.",
      zh: "下午，我們造訪了湖邊的一座小寺廟。",
    },
    {
      en: "We went home before sunset and felt tired but happy.",
      zh: "我們在日落前回家，覺得累但很開心。",
    },
    {
      en: "That day was simple, and we enjoyed every minute.",
      zh: "那天很簡單，而我們珍惜每一分鐘。",
    },
  ],
  sentencesForArrange: [
    "Last weekend, my family went to a small lake near the mountains.",
    "We left home early and arrived at the lake at nine o’clock.",
    "The weather was warm, and the sky was clear.",
    "Dad set up the tent, and Mom prepared sandwiches.",
    "My sister and I took a walk by the water.",
    "After that, we rowed a boat on the lake.",
    "Grandpa told us a story, and everyone laughed.",
    "At noon, we had a picnic under a big tree.",
    "I took some pictures with my camera.",
    "In the afternoon, we visited a small temple near the lake.",
    "We went home before sunset.",
    "We felt tired but happy.",
  ],
};
/* =========================
   ✅ Unit 4: 過去進行式（全新）
========================= */

// ✅ Unit 4：單字（對齊你提供的單字摘要；精簡為題庫風格）
const UNIT4_WORDS: UnitConfig["words"] = [
  { term: "someone", def: "pron. 某人（= somebody）" },
  { term: "break", def: "v. 打破；損壞（pt broke, pp broken）" },
  { term: "do the dishes", def: "phr. 洗碗盤（= wash the dishes）" },
  { term: "half", def: "n. 一半；二分之一（pl. halves）" },
  { term: "past", def: "prep./adv./adj./n. 經過；過去（的）" },
  { term: "leave", def: "v. 離開；留下（pt/pp left）" },
  { term: "quarter", def: "n. 四分之一；十五分鐘" },
  { term: "remember", def: "v. 記得；回想起" },
  { term: "take it easy", def: "phr. 放輕鬆" },
  { term: "cool down", def: "phr. 冷卻；冷靜" },
  { term: "close", def: "adj. 靠近的；接近的" },
  { term: "feed", def: "v. 餵養（pt/pp fed）" },
  { term: "pet", def: "n. 寵物" },
  { term: "sweep", def: "v. 掃（pt/pp swept）" },
  { term: "floor", def: "n. 地板；樓層" },
  { term: "fix", def: "v. 修理；解決" },
  { term: "drawer", def: "n. 抽屜" },
  { term: "mop", def: "v./n. 拖地；拖把" },
  { term: "stairs", def: "n.pl. 樓梯" },
  { term: "wipe", def: "v. 擦拭" },
  { term: "window", def: "n. 窗戶；櫥窗" },
  { term: "dry", def: "v./adj. 使乾；乾的" },
  { term: "hang", def: "v. 掛；吊（pt/pp hung）" },
  { term: "clothes", def: "n.pl. 衣服" },
  { term: "move", def: "v./n. 搬遷；移動；動作" },
  { term: "city", def: "n. 城市" },
  { term: "dream", def: "n./v./adj. 夢；夢想；夢想的" },
  { term: "almost", def: "adv. 幾乎；差一點" },
  { term: "fall asleep", def: "phr. 睡著" },
  { term: "scared", def: "adj. 害怕的（be scared of…）" },
  { term: "problem", def: "n. 問題；習題" },
  { term: "tip", def: "n. 訣竅；小費" },
  { term: "however", def: "adv. 然而；不過" },
  { term: "nothing", def: "pron. 沒什麼；無事；無物" },
  { term: "catch", def: "v. 抓住；接住；趕上（pt/pp caught）" },
  { term: "through", def: "prep. 穿越；從頭到尾" },
  { term: "finally", def: "adv. 終於；最後" },
  { term: "save", def: "v. 拯救；節省" },
  { term: "terrible", def: "adj. 糟糕的；可怕的" },
];

// ✅ Unit 4：文法重點（過去進行式；每例單一句、無對話標記）
const UNIT4_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "過去進行式：定義與構造",
    desc: "表示『過去某一時間點／某段時間』正在進行的動作。構造：S + was/were + V-ing。",
    examples: [
      "I was reading at nine last night.",
      "They were playing chess at that time.",
      "She was not doing homework then.",
    ],
  },
  {
    point: "與過去簡單式的差別（概念對比）",
    desc: "過去簡單式敘述已發生的事實；過去進行式強調當時進行中的背景動作。",
    examples: [
      "Mark wrote a letter last night.",
      "Mark was writing a letter at nine last night.",
    ],
  },
  {
    point: "常見時間語與位置",
    desc: "then, at that time, at + 具體時間（at 6:30, at noon）, this morning/afternoon/evening, last night；時間語可放句首（後加逗號）或句尾。",
    examples: [
      "At ten last night, I was writing my diary.",
      "They were waiting at the station this morning.",
      "We were having dinner at that time.",
    ],
  },
  {
    point: "直述句：肯定／否定",
    desc: "肯定：S + was/were + V-ing。否定：S + was/were + not + V-ing（縮寫：wasn’t / weren’t）。",
    examples: [
      "Jamie was washing the dishes.",
      "Jamie was not watching TV.",
      "They were not doing their homework.",
    ],
  },
  {
    point: "Yes–No 問句與簡答",
    desc: "把 was/were 倒裝到句首；簡答用人稱代名詞。肯定簡答不縮寫。",
    examples: [
      "Was Zoe drying her hair then?",
      "Yes, she was.",
      "Were Pam and Papa fixing the drawer?",
      "No, they were not.",
    ],
  },
  {
    point: "Wh- 問句：What / Where + was/were + S + V-ing",
    desc: "用來問人在過去某時正在做的事或所在位置。",
    examples: [
      "What were your parents doing at that time?",
      "They were wiping the windows.",
      "Where were you at six last night?",
      "I was in the kitchen.",
    ],
  },
  {
    point: "when 與過去進行式：短動作打斷長動作",
    desc: "用 when + 過去簡單式 搭配主句過去進行式，表『短暫動作發生時，另一動作正在進行』。",
    examples: [
      "I was sleeping when John called.",
      "She broke the plate when she was doing the dishes.",
    ],
  },
  {
    point: "狀態動詞通常不用過去進行式",
    desc: "如 know, like, want 等多用過去簡單式。",
    examples: [
      "I knew the answer then.",
      "She liked the music last night.",
      "They wanted a break at that time.",
    ],
  },
  {
    point: "主詞與 be 動詞選擇",
    desc: "was 用於 I/he/she/it 單數；were 用於 you/we/they 複數；問就用 be 問，答就用 be 答。",
    examples: [
      "I was cleaning the floor.",
      "You were not at home then.",
      "Were they hanging the clothes?",
    ],
  },
];

// ✅ Unit 4：閱讀（過去進行式 × 雙語 × 排序題）
const UNIT4_STORY: UnitConfig["story"] = {
  title: "Diary 4: Half Past Twelve at Home（十二點半的家中現場）",
  paragraphs: [
    {
      en: "It was half past twelve, and the house was busy.",
      zh: "當時是十二點半，家裡正忙成一團。",
    },
    {
      en: "Mom was doing the dishes in the kitchen, and the water was running.",
      zh: "媽媽在廚房洗碗，水還在流著。",
    },
    {
      en: "Dad was mopping the floor, and he was humming a song.",
      zh: "爸爸正在拖地，還哼著一首歌。",
    },
    {
      en: "My sister was hanging the clothes by the window.",
      zh: "我妹妹在窗邊晾衣服。",
    },
    {
      en: "Grandma was feeding our pet rabbit in the yard.",
      zh: "奶奶在院子裡餵我們的寵物兔子。",
    },
    {
      en: "I was fixing the old drawer, but the screw was stuck.",
      zh: "我在修舊抽屜，但螺絲卡住了。",
    },
    {
      en: "Suddenly, someone knocked at the door, and the dog started barking.",
      zh: "突然，有人敲門，狗就開始叫。",
    },
    {
      en: "When I opened the door, the wind blew through the hall.",
      zh: "我打開門時，一陣風從走廊穿過。",
    },
    {
      en: "A plate slipped from Mom’s hand and broke into pieces.",
      zh: "一個盤子從媽媽手裡滑落，摔得粉碎。",
    },
    {
      en: "Dad was wiping the water, and I was picking up the pieces carefully.",
      zh: "爸爸在擦水，而我小心地撿碎片。",
    },
    {
      en: "Grandma said, “Take it easy.” We were all cooling down.",
      zh: "奶奶說：「放輕鬆。」我們大家都在冷靜下來。",
    },
    {
      en: "At that time, my brother was running down the stairs with a big smile.",
      zh: "那時，我弟帶著大大的笑容從樓梯跑下來。",
    },
    {
      en: "He was holding a card that said, “Lunch is ready!”",
      zh: "他拿著一張寫著「午餐好了！」的卡片。",
    },
    {
      en: "Finally, we were sitting at the table and talking about the terrible mess.",
      zh: "最後，我們坐在餐桌前，聊著剛才那場糟糕的混亂。",
    },
    {
      en: "We were laughing, and the house felt close and warm again.",
      zh: "我們笑著，家裡又變得溫暖而親近。",
    },
  ],
  sentencesForArrange: [
    "It was half past twelve, and the house was busy.",
    "Mom was doing the dishes in the kitchen.",
    "Dad was mopping the floor and humming a song.",
    "My sister was hanging the clothes by the window.",
    "Grandma was feeding our pet rabbit in the yard.",
    "I was fixing the old drawer, but the screw was stuck.",
    "Someone knocked at the door, and the dog started barking.",
    "When I opened the door, the wind blew through the hall.",
    "A plate slipped from Mom’s hand and broke into pieces.",
    "Dad was wiping the water, and I was picking up the pieces.",
    "Grandma said, “Take it easy,” and we were cooling down.",
    "Finally, we were sitting at the table and laughing.",
  ],
};
/* =========================
   ✅ Unit 5: 未來式（全新）
========================= */

// ✅ Unit 5：單字（對齊你的摘要；題庫友善精簡）
const UNIT5_WORDS: UnitConfig["words"] = [
  { term: "will", def: "aux. 將；會（後接原形動詞）" },
  { term: "ugly", def: "adj. 醜的；醜惡的" },
  { term: "sweater", def: "n. 毛衣" },
  { term: "tonight", def: "adv./n. 今晚" },
  { term: "funny", def: "adj. 滑稽的；奇怪的" },
  { term: "cost", def: "v./n. 價錢為；花費（cost–cost–cost）" },
  { term: "price", def: "n. 價格（常與 of/for）" },
  { term: "spend", def: "v. 花費（時間/金錢）（spent）" },
  { term: "expensive", def: "adj. 昂貴的（↔ cheap）" },
  { term: "on sale", def: "phr. 特價中" },
  { term: "pair", def: "n. 一雙；一對" },
  { term: "total", def: "n./adj. 總計；總共的" },
  { term: "pay", def: "v./n. 付費；工資（paid）" },
  { term: "thousand", def: "n. 千（數字前用單數）" },
  { term: "tomorrow", def: "adv./n. 明天" },
  { term: "high", def: "adj. 高的；高價的（↔ low）" },
  { term: "save", def: "v. 節省；省下；拯救" },
  { term: "would like", def: "phr. 想要（較有禮貌）" },
  { term: "change", def: "n. 找零；零錢（[U]）" },
  { term: "take", def: "v. 花費（時間）；拿取（took）" },
  { term: "dress", def: "v./n. 打扮；洋裝" },
  { term: "cap", def: "n. 帽子（有遮簷/無邊）" },
  { term: "shirt", def: "n. 襯衫" },
  { term: "belt", def: "n. 腰帶" },
  { term: "jeans", def: "n.pl. 牛仔褲（一條：a pair of jeans）" },
  { term: "sock", def: "n. 襪子" },
  { term: "tie", def: "n. 領帶；v. 繫；打結" },
  { term: "pants", def: "n.pl. 長褲（一條：a pair of pants）" },
  { term: "shoe", def: "n. 鞋（一雙：a pair of shoes）" },
  { term: "T-shirt", def: "n. T 恤" },
  { term: "shorts", def: "n.pl. 短褲（一條：a pair of shorts）" },
  { term: "hat", def: "n. 帽子（四周有帽簷）" },
  { term: "coat", def: "n. 外套；大衣" },
  { term: "skirt", def: "n. 裙子" },
  { term: "glasses", def: "n.pl. 眼鏡（一副：a pair of glasses）" },
  { term: "ring", def: "n. 戒指；v. 鈴響（rang, rung）" },
  { term: "take off", def: "phr. 脫下" },
  { term: "fast", def: "adj./adv. 快的；快速地" },
  { term: "low", def: "adj. 低的；低價的" },
  { term: "cheap", def: "adj. 便宜的；廉價的" },
  { term: "what’s more", def: "phr. 而且；此外" },
  { term: "most", def: "adj. 大部分的" },
  { term: "hurt", def: "v. 使疼痛；受傷（hurt–hurt–hurt）" },
  { term: "come off", def: "phr. 從…脫落" },
  { term: "second", def: "n. 秒；一小會兒" },
];

// ✅ Unit 5：文法重點（清潔版；單句例）
const UNIT5_GRAMMAR: UnitConfig["grammar"] = [
  {
    point: "未來式：will / be going to 基本用法",
    desc: "表未來將發生的動作或情況；否定：will not(won’t) / be not going to。",
    examples: [
      "Cody will have lunch later.",
      "Cody will not have lunch later.",
      "Cody is going to have lunch later.",
      "Cody is not going to have lunch later.",
    ],
  },
  {
    point: "縮寫與人稱",
    desc: "will 可縮為 ’ll；won’t 為否定縮寫；be going to 的 be 依主詞變化。",
    examples: [
      "I’ll call you tonight.",
      "They’ll be free this weekend.",
      "She is going to study English.",
      "We are not going to buy that coat.",
    ],
  },
  {
    point: "未來時間語：this/next/in/soon/later/tonight/tomorrow",
    desc: "this + 一段時間；next + 一段時間；in + 時間段；soon/later/tonight/tomorrow。",
    examples: [
      "I will go to the club this afternoon.",
      "We are going to travel next year.",
      "The show will start in five minutes.",
      "He will call me soon.",
    ],
  },
  {
    point: "直述句：There will be / There is going to be",
    desc: "存在句的未來式；will 後接原形 be。",
    examples: [
      "There will be a big sale tomorrow.",
      "There is going to be a concert next weekend.",
      "I won’t be at home tonight.",
    ],
  },
  {
    point: "Yes–No 問句（will）與簡答",
    desc: "Will + 主詞 + 原形動詞…? Yes, S will. / No, S will not(won’t).",
    examples: [
      "Will he wear the white shirt tomorrow?",
      "Yes, he will.",
      "Will they visit the museum next Friday?",
      "No, they will not.",
    ],
  },
  {
    point: "Yes–No 問句（be going to）與簡答",
    desc: "Be + S + going to + 原形…? Yes, S be. / No, S be not.",
    examples: [
      "Is Hank going to visit the UK someday?",
      "Yes, he is.",
      "Are you going to buy that coat?",
      "No, I am not.",
    ],
  },
  {
    point: "Wh- 問句（will / be going to）",
    desc: "What/When/Who/Where + will/be going to…",
    examples: [
      "What will you do tomorrow?",
      "I will study math tomorrow.",
      "What are you going to do tonight?",
      "I am going to cook dinner tonight.",
    ],
  },
  {
    point: "以現在進行式表未來（來去動詞）",
    desc: "含 go/come/leave 等行程安排可用現在進行式表未來。",
    examples: [
      "My aunt is leaving Taiwan next month.",
      "We are coming back this summer.",
    ],
  },
  {
    point: "時間副詞子句表未來：主句未來，從句現在",
    desc: "when / after 等引導時間子句時，用現在簡單式表未來語境。",
    examples: [
      "He will call you when he gets home.",
      "She will pay the money after she works there.",
    ],
  },
  {
    point: "Would like 的禮貌用法",
    desc: "would like + 名詞 / to V；問句把 would 移到句首。",
    examples: [
      "I would like a bowl of salad.",
      "We would like to go swimming.",
      "Would you like some tea?",
    ],
  },
  {
    point: "購物常用動詞：cost / price / spend / pay / take(time)",
    desc: "主詞角色不同；cost/price 講物品價格；spend/pay 講人；take 講所需時間。",
    examples: [
      "The coat costs three thousand dollars.",
      "The price is low today.",
      "She spent an hour choosing a dress.",
      "Tom paid $200 for the cap.",
      "It will take ten minutes to get there.",
    ],
  },
];

// ✅ Unit 5：閱讀（未來式 × 購物情境 × 雙語 × 排序題）
const UNIT5_STORY: UnitConfig["story"] = {
  title: "Diary 5: Tomorrow’s Shopping Plan（明天的購物計畫）",
  paragraphs: [
    {
      en: "Dear Diary, tomorrow is my cousin’s party, and we will dress up.",
      zh: "親愛的日記，明天是我表弟的派對，我們會好好打扮。",
    },
    {
      en: "Tonight, Mom and I are going to the department store because everything is on sale.",
      zh: "今晚我和媽媽要去百貨公司，因為全部都在特價中。",
    },
    {
      en: "We will get there fast, and it will take only ten minutes by bus.",
      zh: "我們會很快到那裡，搭公車只要十分鐘。",
    },
    {
      en: "I would like a new sweater, but the price may be high.",
      zh: "我想要一件新的毛衣，但價格可能很高。",
    },
    {
      en: "What’s more, I am going to buy a pair of jeans and a belt.",
      zh: "而且，我打算買一條牛仔褲和一條腰帶。",
    },
    {
      en: "My sister will buy a T-shirt, a skirt, and a funny hat for the photo time.",
      zh: "我妹妹會買一件 T 恤、一條裙子和一頂搞笑的帽子，為了拍照時間。",
    },
    {
      en: "Dad will try on a coat, but he won’t take the ugly one.",
      zh: "爸爸會試穿一件外套，但他不會選那件醜的。",
    },
    {
      en: "Mom is going to get a pair of shoes because her old ones hurt her feet.",
      zh: "媽媽要買一雙鞋，因為她的舊鞋會讓她腳痛。",
    },
    {
      en: "We will also buy socks, a tie for Grandpa, and a pair of glasses for Aunt May.",
      zh: "我們也會買襪子、給爺爺的領帶，還有給阿姨梅的一副眼鏡。",
    },
    {
      en: "The clerk will say the total, and we will pay and get the change.",
      zh: "店員會報總額，我們會付錢並拿到找零。",
    },
    {
      en: "I will try to save money, so I won’t spend too much on a cap.",
      zh: "我會試著省錢，所以我不會在帽子上花太多。",
    },
    {
      en: "If the tag comes off, I will take it back to the counter in a second.",
      zh: "如果標籤脫落，我會立刻把它拿回櫃台。",
    },
    {
      en: "When we get home, we will take off the tags and get ready for tomorrow.",
      zh: "我們到家後會把標籤拆掉，準備迎接明天。",
    },
    {
      en: "At the party tomorrow night, the bell will ring at seven, and most guests will arrive soon.",
      zh: "在明天晚上的派對，鈴會在七點響起，而且大多數的客人很快會到。",
    },
    {
      en: "We will take pictures, and my cousin will say, “This will be the best day of the year!”",
      zh: "我們會拍照，而我表弟會說：「這將是今年最好的一天！」",
    },
  ],
  sentencesForArrange: [
    "Tomorrow is my cousin’s party, and we will dress up.",
    "Tonight we are going to the department store because everything is on sale.",
    "It will take ten minutes to get there by bus.",
    "I would like a new sweater.",
    "I am going to buy a pair of jeans and a belt.",
    "Dad will try on a coat, but he won’t take the ugly one.",
    "Mom is going to buy a pair of shoes.",
    "We will buy socks, a tie, and a pair of glasses.",
    "The clerk will say the total, and we will pay and get the change.",
    "I will try to save money and won’t spend too much on a cap.",
    "When we get home, we will take off the tags.",
    "The bell will ring at seven, and most guests will arrive soon.",
  ],
};

/* =========================
   mkUnit 工廠函式（修正 story 樣板字串）
========================= */

const mkUnit = (
  id: UnitId,
  title: string,
  opts?: {
    words?: UnitConfig["words"];
    grammar?: UnitConfig["grammar"];
    story?: UnitConfig["story"];
  },
): UnitConfig => ({
  id,
  title,
  words: opts?.words ?? [
    { term: "hello", def: "你好", example: "Hello, my name is Tom." },
    { term: "goodbye", def: "再見", example: "Goodbye! See you tomorrow." },
    { term: "teacher", def: "老師", example: "The teacher is kind." },
    { term: "student", def: "學生", example: "I am a student." },
    { term: "school", def: "學校", example: "Our school is big." },
  ],
  grammar: opts?.grammar ?? [
    {
      point: "be 動詞 (am/is/are)",
      desc: "主詞 + be + 補語。",
      examples: ["I am a student.", "She is a teacher.", "They are friends."],
    },
    {
      point: "一般現在式",
      desc: "描述習慣或事實。第三人稱單數動詞 + s。",
      examples: ["He goes to school.", "We play basketball."],
    },
  ],
  story: opts?.story ?? {
    title: `${title} — A New Friend`,
    paragraphs: [
      "Tom is new at school. He says hello to everyone.",
      "He meets a teacher and a student in the hallway.",
      "They show him the library and the playground.",
    ],
    sentencesForArrange: [
      "Tom is new at school.",
      "He meets a teacher and a student.",
      "They show him the library.",
      "They play together at the playground.",
    ],
  },
});

/* =========================
   UNITS 註冊（維持原本 1~6）
========================= */

export const UNITS: UnitConfig[] = [
  mkUnit(1, "Unit 1: 現在簡單式", {
    words: UNIT1_WORDS,
    grammar: UNIT1_GRAMMAR,
    story: UNIT1_STORY,
  }),
  mkUnit(2, "Unit 2: 現在進行式", {
    words: UNIT2_WORDS,
    grammar: UNIT2_GRAMMAR,
    story: UNIT2_STORY,
  }),
  mkUnit(3, "Unit 3: 過去簡單式", {
    words: UNIT3_WORDS,
    grammar: UNIT3_GRAMMAR,
    story: UNIT3_STORY,
  }),
  mkUnit(4, "Unit 4: 過去進行式", {
    words: UNIT4_WORDS,
    grammar: UNIT4_GRAMMAR,
    story: UNIT4_STORY,
  }),
  mkUnit(5, "Unit 5: 未來式", {
    words: UNIT5_WORDS,
    grammar: UNIT5_GRAMMAR,
    story: UNIT5_STORY,
  }),
];
