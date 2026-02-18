/* ==========================================================================
   APPLY PHRASE SECTION LABELS
   Adds phrases.sectionLabels to non-English world translation packs.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const WORLDS_DIR = path.join(ROOT, "frontend", "worlds");

const LABELS = {
  french: {
    Greetings: "Salutations",
    Politeness: "Politesse",
    Introductions: "Présentations",
    Conversation: "Conversation",
    Questions: "Questions",
    Requests: "Demandes",
    "Time & Plans": "Temps et plans",
    Directions: "Directions",
    Food: "Nourriture",
    Shopping: "Achats",
    Health: "Santé",
    Feelings: "Sentiments",
    Opinions: "Opinions",
    "Work & Study": "Travail et études",
    Problems: "Problèmes",
    "Everyday Expressions": "Expressions quotidiennes",
  },
  german: {
    Greetings: "Begrüßungen",
    Politeness: "Höflichkeit",
    Introductions: "Vorstellungen",
    Conversation: "Konversation",
    Questions: "Fragen",
    Requests: "Bitten",
    "Time & Plans": "Zeit und Pläne",
    Directions: "Wegbeschreibung",
    Food: "Essen",
    Shopping: "Einkaufen",
    Health: "Gesundheit",
    Feelings: "Gefühle",
    Opinions: "Meinungen",
    "Work & Study": "Arbeit und Studium",
    Problems: "Probleme",
    "Everyday Expressions": "Alltägliche Ausdrücke",
  },
  spanish: {
    Greetings: "Saludos",
    Politeness: "Cortesía",
    Introductions: "Presentaciones",
    Conversation: "Conversación",
    Questions: "Preguntas",
    Requests: "Solicitudes",
    "Time & Plans": "Tiempo y planes",
    Directions: "Direcciones",
    Food: "Comida",
    Shopping: "Compras",
    Health: "Salud",
    Feelings: "Sentimientos",
    Opinions: "Opiniones",
    "Work & Study": "Trabajo y estudio",
    Problems: "Problemas",
    "Everyday Expressions": "Expresiones cotidianas",
  },
  portuguese: {
    Greetings: "Saudações",
    Politeness: "Cortesia",
    Introductions: "Apresentações",
    Conversation: "Conversa",
    Questions: "Perguntas",
    Requests: "Pedidos",
    "Time & Plans": "Tempo e planos",
    Directions: "Direções",
    Food: "Comida",
    Shopping: "Compras",
    Health: "Saúde",
    Feelings: "Sentimentos",
    Opinions: "Opiniões",
    "Work & Study": "Trabalho e estudo",
    Problems: "Problemas",
    "Everyday Expressions": "Expressões do dia a dia",
  },
  dutch: {
    Greetings: "Begroetingen",
    Politeness: "Beleefdheid",
    Introductions: "Introducties",
    Conversation: "Gesprek",
    Questions: "Vragen",
    Requests: "Verzoeken",
    "Time & Plans": "Tijd en plannen",
    Directions: "Richtingen",
    Food: "Eten",
    Shopping: "Winkelen",
    Health: "Gezondheid",
    Feelings: "Gevoelens",
    Opinions: "Meningen",
    "Work & Study": "Werk en studie",
    Problems: "Problemen",
    "Everyday Expressions": "Dagelijkse uitdrukkingen",
  },
  swedish: {
    Greetings: "Hälsningar",
    Politeness: "Hövlighet",
    Introductions: "Presentationer",
    Conversation: "Samtal",
    Questions: "Frågor",
    Requests: "Förfrågningar",
    "Time & Plans": "Tid och planer",
    Directions: "Vägbeskrivningar",
    Food: "Mat",
    Shopping: "Shopping",
    Health: "Hälsa",
    Feelings: "Känslor",
    Opinions: "Åsikter",
    "Work & Study": "Arbete och studier",
    Problems: "Problem",
    "Everyday Expressions": "Vardagliga uttryck",
  },
  arabic: {
    Greetings: "تحيات",
    Politeness: "لباقة",
    Introductions: "تعارف",
    Conversation: "محادثة",
    Questions: "أسئلة",
    Requests: "طلبات",
    "Time & Plans": "الوقت والخطط",
    Directions: "الاتجاهات",
    Food: "الطعام",
    Shopping: "التسوق",
    Health: "الصحة",
    Feelings: "المشاعر",
    Opinions: "الآراء",
    "Work & Study": "العمل والدراسة",
    Problems: "المشكلات",
    "Everyday Expressions": "تعبيرات يومية",
  },
  chinese: {
    Greetings: "问候",
    Politeness: "礼貌",
    Introductions: "自我介绍",
    Conversation: "对话",
    Questions: "提问",
    Requests: "请求",
    "Time & Plans": "时间与计划",
    Directions: "方向",
    Food: "食物",
    Shopping: "购物",
    Health: "健康",
    Feelings: "感受",
    Opinions: "观点",
    "Work & Study": "工作与学习",
    Problems: "问题",
    "Everyday Expressions": "日常表达",
  },
  japanese: {
    Greetings: "挨拶",
    Politeness: "丁寧表現",
    Introductions: "自己紹介",
    Conversation: "会話",
    Questions: "質問",
    Requests: "依頼",
    "Time & Plans": "時間と予定",
    Directions: "道案内",
    Food: "食べ物",
    Shopping: "買い物",
    Health: "健康",
    Feelings: "感情",
    Opinions: "意見",
    "Work & Study": "仕事と勉強",
    Problems: "問題",
    "Everyday Expressions": "日常表現",
  },
  korean: {
    Greetings: "인사",
    Politeness: "공손 표현",
    Introductions: "자기소개",
    Conversation: "대화",
    Questions: "질문",
    Requests: "요청",
    "Time & Plans": "시간과 계획",
    Directions: "길 안내",
    Food: "음식",
    Shopping: "쇼핑",
    Health: "건강",
    Feelings: "감정",
    Opinions: "의견",
    "Work & Study": "일과 학습",
    Problems: "문제",
    "Everyday Expressions": "일상 표현",
  },
  hindi: {
    Greetings: "अभिवादन",
    Politeness: "शिष्टाचार",
    Introductions: "परिचय",
    Conversation: "बातचीत",
    Questions: "प्रश्न",
    Requests: "अनुरोध",
    "Time & Plans": "समय और योजनाएँ",
    Directions: "दिशाएँ",
    Food: "भोजन",
    Shopping: "खरीदारी",
    Health: "स्वास्थ्य",
    Feelings: "भावनाएँ",
    Opinions: "राय",
    "Work & Study": "काम और अध्ययन",
    Problems: "समस्याएँ",
    "Everyday Expressions": "दैनिक अभिव्यक्तियाँ",
  },
};

let updated = 0;

for (const [worldKey, sectionLabels] of Object.entries(LABELS)) {
  const filePath = path.join(WORLDS_DIR, worldKey, "translations.json");
  if (!fs.existsSync(filePath)) {
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!data.phrases || typeof data.phrases !== "object") {
    data.phrases = {};
  }
  const before = JSON.stringify(data.phrases.sectionLabels || {});
  data.phrases.sectionLabels = sectionLabels;
  const after = JSON.stringify(data.phrases.sectionLabels || {});
  if (before !== after) {
    data.generatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    updated += 1;
  }
}

console.log(`Applied phrases.sectionLabels to ${updated} world packs.`);
