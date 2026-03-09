const buildHighlights = (ruleOrder, example) => {
  const slots = Array.isArray(ruleOrder) ? ruleOrder : [];
  const source = String(example || "").trim().replace(/[.?!。！？،؛:："'«»”“]+$/gu, "");
  if (slots.length < 2 || !source) {
    return [];
  }
  if (/\s/u.test(source)) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= slots.length) {
      return slots.map((label, index) => ({
        label,
        text: index === slots.length - 1 ? parts.slice(index).join(" ") : parts[index],
      }));
    }
  }
  const chars = Array.from(source);
  if (chars.length < slots.length) {
    return [];
  }
  const highlights = [];
  let cursor = 0;
  slots.forEach((label, index) => {
    const remainingSlots = slots.length - index;
    const remainingChars = chars.length - cursor;
    const take = Math.max(1, Math.ceil(remainingChars / remainingSlots));
    highlights.push({
      label,
      text: chars.slice(cursor, cursor + take).join(""),
    });
    cursor += take;
  });
  return highlights;
};

const c = (title, points, example, ruleOrder, sourceTitle, sourceExample, extra = {}) => ({
  title,
  points,
  example,
  ruleOrder,
  exampleHighlights: Array.isArray(extra.exampleHighlights)
    ? extra.exampleHighlights
    : buildHighlights(ruleOrder, example),
  sourceTitle,
  sourceExample,
  ...extra,
});

module.exports = {
  arabic: {
    "Voice & Focus": [
      c(
        "الجملة الفعلية تُبرز الفاعل",
        [
          "في الجملة الفعلية العادية يظهر الفاعل بوصفه صاحب الحدث.",
          "هذا الأسلوب مباشر وواضح عندما تريد إبراز من قام بالفعل.",
        ],
        "كتبَ الطالبُ الرسالةَ.",
        ["الفعل", "الفاعل", "المفعول"],
        "active clauses foreground the doer",
        "The student wrote the letter."
      ),
      c(
        "المبني للمجهول يُخفي الفاعل",
        [
          "المبني للمجهول يجعل الاهتمام منصبًا على الحدث أو النتيجة لا على من قام بالفعل.",
          "يُستعمل عندما يكون الفاعل مجهولًا أو غير مهم في السياق.",
        ],
        "كُتِبَتِ الرسالةُ.",
        ["الفعل المبني للمجهول", "النائب عن الفاعل"],
        "passive voice backgrounds the doer",
        "The letter was written."
      ),
      c(
        "تقديم المفعول يغيّر مركز الانتباه",
        [
          "يمكن تقديم المفعول به إذا كان هو العنصر الأهم في الكلام.",
          "لا يغيّر ذلك المعنى الأساسي، لكنه يغيّر ما يلتقطه السامع أولًا.",
        ],
        "الكتابَ قرأتُ أمس.",
        ["المفعول المقدَّم", "الفعل", "الظرف"],
        "fronting the object for focus",
        "The book, I read yesterday."
      ),
      c(
        "التقديم مع ضمير عائد يصنع موضوعًا واضحًا",
        [
          "أحيانًا يُقدَّم الاسم ثم يعود عليه ضمير داخل الجملة.",
          "هذا يفيد في جعل العنصر المقدم موضوع الحديث بوضوح.",
        ],
        "هذا الكتاب قرأتُه أمس.",
        ["الموضوع", "الفعل مع الضمير", "الظرف"],
        "topic fronting with resumptive pronouns",
        "This book, I read it yesterday."
      ),
      c(
        "القصر يضيّق التركيز",
        [
          "التراكيب مثل ما...إلا أو إنما تحصر المعنى في عنصر واحد.",
          "هذا أسلوب قوي لإبراز المعلومة الأساسية وحدها.",
        ],
        "ما حضر إلا الأستاذُ.",
        ["أداة القصر", "الفعل", "العنصر المركَّز"],
        "exclusive focus structures",
        "Only the teacher came."
      ),
    ],
  },
  chinese: {
    "Voice & Focus": [
      c(
        "话题先行结构",
        [
          "汉语常先说话题，再说对话题的评论。",
          "这样能让听者先抓住“现在在说什么”。",
        ],
        "这本书，我已经看过了。",
        ["话题", "评论"],
        "topic-comment structure",
        "This book, I have already read it.",
        {
          exampleHighlights: [
            { label: "话题", text: "这本书" },
            { label: "评论", text: "我已经看过了" },
          ],
        }
      ),
      c(
        "把字句突出处理结果",
        [
          "把字句常把受影响的对象提前，突出对它的处理结果。",
          "它不是普通 SVO 的机械替换，而是有“处置感”的结构。",
        ],
        "我把门关上了。",
        ["施事", "把字结构", "结果"],
        "ba construction foregrounds handling",
        "I shut the door.",
        {
          exampleHighlights: [
            { label: "施事", text: "我" },
            { label: "把字结构", text: "把门" },
            { label: "结果", text: "关上了" },
          ],
        }
      ),
      c(
        "被字句突出受事",
        [
          "被字句把受到影响的一方放到更显眼的位置。",
          "当你想强调遭遇、结果或受影响者时，这种结构很有用。",
        ],
        "门被风吹开了。",
        ["受事", "被字结构", "结果"],
        "bei passive foregrounds the affected item",
        "The door was blown open by the wind.",
        {
          exampleHighlights: [
            { label: "受事", text: "门" },
            { label: "被字结构", text: "被风" },
            { label: "结果", text: "吹开了" },
          ],
        }
      ),
      c(
        "是……的 强调已知事件中的信息",
        [
          "是……的 常用来强调已经发生事件中的时间、地点、方式或施事。",
          "焦点在某个细节上，不只是单纯叙述事件发生。",
        ],
        "这本书是我昨天买的。",
        ["焦点对象", "是……的结构", "细节"],
        "shi ... de focuses details in a known event",
        "It was yesterday that I bought this book.",
        {
          exampleHighlights: [
            { label: "焦点对象", text: "这本书" },
            { label: "是……的结构", text: "是我昨天" },
            { label: "细节", text: "买的" },
          ],
        }
      ),
      c(
        "只 限定焦点范围",
        [
          "只把焦点缩小到一个成分上，表示“仅仅”。",
          "它会改变整句的范围解释，不只是加一个副词而已。",
        ],
        "我只买了一本书。",
        ["主语", "限定词", "焦点内容"],
        "focus particles limit scope",
        "I bought only one book.",
        {
          exampleHighlights: [
            { label: "主语", text: "我" },
            { label: "限定词", text: "只" },
            { label: "焦点内容", text: "买了一本书" },
          ],
        }
      ),
    ],
  },
  dutch: {
    "Voice & Focus": [
      c(
        "Actieve zinnen zetten de doener voorop",
        [
          "In de actieve vorm staat de handelende persoon centraal.",
          "Dat maakt de zin direct en vaak informatiever over wie iets doet.",
        ],
        "De kok kookt het eten.",
        ["onderwerp", "werkwoord", "object"],
        "active clauses foreground the doer",
        "The chef cooks the food."
      ),
      c(
        "Passief met worden",
        [
          "Met worden + voltooid deelwoord verschuift de aandacht naar het object of de gebeurtenis.",
          "De doener kan wegblijven als die minder belangrijk is.",
        ],
        "Het eten wordt gekookt.",
        ["onderwerp", "passief", "deelwoord"],
        "passive voice with worden",
        "The food is being cooked."
      ),
      c(
        "Resultaat met zijn + voltooid deelwoord",
        [
          "Zijn + voltooid deelwoord legt vaak het resultaat of de toestand na de handeling vast.",
          "Dat is niet hetzelfde als een lopende passieve handeling met worden.",
        ],
        "De deur is gesloten.",
        ["onderwerp", "koppelwerkwoord", "resultaat"],
        "result state with zijn plus participle",
        "The door is closed."
      ),
      c(
        "Vooropplaatsing stuurt de focus",
        [
          "In het Nederlands kan bijna elk zinsdeel vooraan staan, maar het werkwoord blijft in de hoofdzin op plek twee.",
          "Zo kun je tijd, plaats of object in de spotlight zetten.",
        ],
        "Dat boek heb ik gisteren gelezen.",
        ["focusdeel", "werkwoord", "rest"],
        "fronting with verb-second word order",
        "That book, I read yesterday."
      ),
      c(
        "Cleftzinnen met het is ... die/dat",
        [
          "Een cleftzin maakt één element extra opvallend.",
          "Dit patroon is handig als je expliciet wilt corrigeren of benadrukken wie of wat relevant is.",
        ],
        "Het is Jan die belt.",
        ["kader", "focus", "bijzin"],
        "cleft sentences for focus",
        "It is Jan who is calling."
      ),
    ],
  },
  french: {
    "Voice & Focus": [
      c(
        "Les phrases actives montrent l'agent",
        [
          "Dans la phrase active, celui qui fait l'action reste au premier plan.",
          "C'est souvent la forme la plus directe pour raconter un événement.",
        ],
        "Le chef prépare le dîner.",
        ["sujet", "verbe", "complément"],
        "active clauses foreground the doer",
        "The chef is preparing the dinner."
      ),
      c(
        "La voix passive avance le patient",
        [
          "La voix passive met en avant ce qui subit l'action.",
          "L'agent peut être ajouté avec par, mais il peut aussi rester implicite.",
        ],
        "Le dîner est préparé par le chef.",
        ["patient", "passif", "agent"],
        "passive voice with etre",
        "The dinner is prepared by the chef."
      ),
      c(
        "La dislocation met un thème devant",
        [
          "En français parlé et écrit, on peut placer un élément au début puis le reprendre par un pronom.",
          "Cela sert à installer le thème avant le commentaire principal.",
        ],
        "Ce livre, je l'ai déjà lu.",
        ["thème", "reprise", "commentaire"],
        "left dislocation with resumptive pronouns",
        "This book, I have already read it."
      ),
      c(
        "C'est ... qui / que focalise",
        [
          "La structure c'est ... qui/que sert à mettre un constituant en relief.",
          "Elle est très fréquente quand on corrige, contraste ou précise.",
        ],
        "C'est Marie qui a appelé.",
        ["cadre", "focus", "suite"],
        "cleft sentences for focus",
        "It is Marie who called."
      ),
      c(
        "'On' laisse l'agent en arrière-plan",
        [
          "On permet souvent de parler d'une action sans nommer précisément l'agent.",
          "C'est une stratégie très naturelle en français pour garder le focus ailleurs.",
        ],
        "On m'a conseillé ce livre.",
        ["agent flou", "verbe", "objet"],
        "on backgrounds the agent",
        "I was advised to read this book."
      ),
    ],
  },
  german: {
    "Voice & Focus": [
      c(
        "Aktive Sätze nennen den Handelnden",
        [
          "Im Aktiv bleibt klar, wer etwas tut.",
          "Das ist oft die direkteste Form, wenn der Handelnde wichtig ist.",
        ],
        "Der Koch kocht das Essen.",
        ["Subjekt", "Verb", "Objekt"],
        "active clauses foreground the doer",
        "The chef cooks the food."
      ),
      c(
        "Vorgangspassiv mit werden",
        [
          "Das Vorgangspassiv zeigt die Handlung als Prozess.",
          "Es rückt das betroffene Objekt in den Vordergrund und kann den Handelnden ausblenden.",
        ],
        "Das Essen wird gekocht.",
        ["Subjekt", "Passivverb", "Partizip"],
        "event passive with werden",
        "The food is being cooked."
      ),
      c(
        "Zustandspassiv mit sein",
        [
          "Mit sein + Partizip beschreibt man oft den Zustand nach einer Handlung.",
          "Das ist pragmatisch anders als ein laufender Vorgang mit werden.",
        ],
        "Die Tür ist geschlossen.",
        ["Subjekt", "Kopula", "Zustand"],
        "result state with sein plus participle",
        "The door is closed."
      ),
      c(
        "Vorfeldbesetzung lenkt den Fokus",
        [
          "Im Deutschen kann fast jedes Satzglied ins Vorfeld rücken, aber das Verb bleibt im Hauptsatz auf Position zwei.",
          "So lässt sich ein Objekt, eine Zeitangabe oder ein Ort hervorheben.",
        ],
        "Dieses Buch habe ich gestern gelesen.",
        ["Fokusfeld", "Verb", "Rest"],
        "fronting with verb-second word order",
        "This book, I read yesterday."
      ),
      c(
        "Fokuspartikeln wie nur / auch / sogar",
        [
          "Partikeln verändern, worauf sich die Aussage genau bezieht.",
          "Sie sind klein, aber für die Informationsstruktur sehr stark.",
        ],
        "Nur Maria hat angerufen.",
        ["Fokuspartikel", "fokussiertes Element", "Rest"],
        "focus particles change scope",
        "Only Maria called."
      ),
    ],
  },
  hindi: {
    "Voice & Focus": [
      c(
        "सक्रिय वाक्य कर्ता को सामने रखते हैं",
        [
          "सक्रिय वाक्य में करने वाला व्यक्ति साफ दिखाई देता है।",
          "जब एजेंट महत्वपूर्ण हो, यह सबसे सीधी रचना होती है।",
        ],
        "रीमा ने पत्र लिखा।",
        ["कर्ता", "कर्म", "क्रिया"],
        "active clauses foreground the doer",
        "Reema wrote the letter."
      ),
      c(
        "कर्मवाच्य में कर्म आगे आता है",
        [
          "कर्मवाच्य में ध्यान काम के होने या उसके परिणाम पर जाता है।",
          "कर्ता अनुपस्थित भी रह सकता है अगर वह महत्वपूर्ण न हो।",
        ],
        "पत्र लिखा गया।",
        ["कर्म", "कर्मवाच्य क्रिया"],
        "passive voice backgrounds the doer",
        "The letter was written."
      ),
      c(
        "तत्व को आगे रखकर फोकस बदला जा सकता है",
        [
          "हिंदी में किसी कर्म या स्थान को पहले रखकर उस पर ध्यान बढ़ाया जा सकता है।",
          "मूल अर्थ वही रहता है, पर सुनने वाला पहले उसी तत्व को पकड़ता है।",
        ],
        "यह किताब मैंने कल पढ़ी।",
        ["फोकस तत्व", "कर्ता", "समय", "क्रिया"],
        "fronting for focus",
        "This book, I read yesterday."
      ),
      c(
        "ही संकीर्ण फोकस बनाता है",
        [
          "ही किसी एक तत्व को विशेष रूप से सीमित करता है।",
          "यह बताता है कि फोकस उसी पर है, किसी और पर नहीं।",
        ],
        "सीमा ही जीती।",
        ["फोकस", "क्रिया"],
        "narrow focus with hi",
        "Only Seema won."
      ),
      c(
        "भी जोड़ वाला फोकस बनाता है",
        [
          "भी किसी और के साथ जोड़कर कहता है कि यह तत्व भी शामिल है।",
          "इससे तुलना और विस्तार दोनों बनते हैं।",
        ],
        "राम भी आया।",
        ["फोकस", "क्रिया"],
        "additive focus with bhi",
        "Ram came too."
      ),
    ],
  },
  japanese: {
    "Voice & Focus": [
      c(
        "能動文では動作主を普通に述べる",
        [
          "能動文は誰が何をしたかをそのまま述べる基本形です。",
          "行為者を前に出したいときに最も自然です。",
        ],
        "田中さんがドアを開けました。",
        ["動作主", "対象", "述語"],
        "active clauses foreground the doer",
        "Tanaka opened the door.",
        {
          exampleHighlights: [
            { label: "動作主", text: "田中さんが" },
            { label: "対象", text: "ドアを" },
            { label: "述語", text: "開けました" },
          ],
        }
      ),
      c(
        "受け身で受け手を前に出す",
        [
          "受け身は影響を受ける側を前に出します。",
          "行為者を背景に置いたり、省いたりしやすくなります。",
        ],
        "ドアが田中さんに開けられました。",
        ["受け手", "行為者", "受け身述語"],
        "passive voice backgrounds the doer",
        "The door was opened by Tanaka.",
        {
          exampleHighlights: [
            { label: "受け手", text: "ドアが" },
            { label: "行為者", text: "田中さんに" },
            { label: "受け身述語", text: "開けられました" },
          ],
        }
      ),
      c(
        "は で話題を立てる",
        [
          "は は文の話題を立て、後ろでその話題について述べます。",
          "焦点そのものというより、何について話すかを整える働きが強いです。",
        ],
        "この本は、もう読みました。",
        ["話題", "コメント"],
        "topic marking with wa",
        "As for this book, I already read it.",
        {
          exampleHighlights: [
            { label: "話題", text: "この本は" },
            { label: "コメント", text: "もう読みました" },
          ],
        }
      ),
      c(
        "だけ で焦点をしぼる",
        [
          "だけ はその要素だけを取り立てます。",
          "範囲を限定することで、焦点がはっきりします。",
        ],
        "私だけが知っています。",
        ["限定", "述語"],
        "focus particles limit scope",
        "Only I know.",
        {
          exampleHighlights: [
            { label: "限定", text: "私だけが" },
            { label: "述語", text: "知っています" },
          ],
        }
      ),
      c(
        "〜のは ... です で焦点化する",
        [
          "〜のは ... です は、文の一部を答えとして浮かび上がらせる焦点化の形です。",
          "説明や訂正で特に使いやすい構文です。",
        ],
        "来たのは田中さんです。",
        ["枠", "焦点"],
        "cleft-like focus with no wa ... desu",
        "The one who came is Tanaka.",
        {
          exampleHighlights: [
            { label: "枠", text: "来たのは" },
            { label: "焦点", text: "田中さんです" },
          ],
        }
      ),
    ],
  },
  korean: {
    "Voice & Focus": [
      c(
        "능동문은 행위자를 앞에 둔다",
        [
          "능동문은 누가 행동했는지를 가장 직접적으로 보여 줍니다.",
          "행위자가 중요할 때 기본이 되는 방식입니다.",
        ],
        "민수가 문을 열었어요.",
        ["행위자", "대상", "서술"],
        "active clauses foreground the doer",
        "Minsu opened the door.",
        {
          exampleHighlights: [
            { label: "행위자", text: "민수가" },
            { label: "대상", text: "문을" },
            { label: "서술", text: "열었어요" },
          ],
        }
      ),
      c(
        "피동문은 영향을 받은 대상을 세운다",
        [
          "피동문은 결과를 겪은 대상을 더 눈에 띄게 만듭니다.",
          "행위자는 빠지거나 뒤로 밀릴 수 있습니다.",
        ],
        "문이 열렸어요.",
        ["대상", "피동 서술"],
        "passive voice backgrounds the doer",
        "The door was opened.",
        {
          exampleHighlights: [
            { label: "대상", text: "문이" },
            { label: "피동 서술", text: "열렸어요" },
          ],
        }
      ),
      c(
        "은/는 으로 화제를 세운다",
        [
          "은/는 은 문장이 무엇에 대한 말인지 먼저 세워 줍니다.",
          "한국어의 정보 흐름과 초점 배치에서 매우 중요합니다.",
        ],
        "이 책은 이미 읽었어요.",
        ["화제", "설명"],
        "topic marking with eun neun",
        "As for this book, I already read it.",
        {
          exampleHighlights: [
            { label: "화제", text: "이 책은" },
            { label: "설명", text: "이미 읽었어요" },
          ],
        }
      ),
      c(
        "만 으로 초점을 좁힌다",
        [
          "만 은 그 요소만을 제한해서 보여 줍니다.",
          "범위를 좁히는 순간 초점도 선명해집니다.",
        ],
        "민수만 왔어요.",
        ["제한 초점", "서술"],
        "focus particles limit scope",
        "Only Minsu came.",
        {
          exampleHighlights: [
            { label: "제한 초점", text: "민수만" },
            { label: "서술", text: "왔어요" },
          ],
        }
      ),
      c(
        "것은 ... 이다 식으로 성분을 부각한다",
        [
          "것은 ... 이다 류의 구조는 특정 답이나 성분을 부각하는 데 좋습니다.",
          "설명이나 정정에서 자주 쓰이는 초점화 방식입니다.",
        ],
        "온 사람은 민수예요.",
        ["틀", "초점"],
        "cleft-like focus with geoseun ... ida",
        "The person who came is Minsu.",
        {
          exampleHighlights: [
            { label: "틀", text: "온 사람은" },
            { label: "초점", text: "민수예요" },
          ],
        }
      ),
    ],
  },
  portuguese: {
    "Voice & Focus": [
      c(
        "A voz ativa destaca o agente",
        [
          "Na voz ativa, quem faz a ação fica em primeiro plano.",
          "É a forma mais direta quando o agente importa.",
        ],
        "O chef prepara o jantar.",
        ["sujeito", "verbo", "objeto"],
        "active clauses foreground the doer",
        "The chef prepares the dinner."
      ),
      c(
        "Passiva com ser + particípio",
        [
          "A passiva com ser põe foco no elemento afetado pela ação.",
          "O agente pode aparecer com por ou ficar omitido.",
        ],
        "O jantar foi preparado pelo chef.",
        ["paciente", "passiva", "agente"],
        "passive voice with ser",
        "The dinner was prepared by the chef."
      ),
      c(
        "Passiva com se tira o agente do foco",
        [
          "Estruturas com se permitem falar da ação sem destacar quem a faz.",
          "Isso é muito comum em avisos, descrições gerais e linguagem pública.",
        ],
        "Vendem-se livros usados.",
        ["verbo", "se", "paciente"],
        "se passive backgrounds the agent",
        "Used books are sold."
      ),
      c(
        "Topicalização põe um termo em evidência",
        [
          "Um elemento pode ir para a frente da frase para virar o centro do comentário.",
          "Isso muda o foco informacional sem mudar o evento básico.",
        ],
        "Esse livro, eu já li.",
        ["tópico", "comentário"],
        "fronting for focus",
        "That book, I have already read."
      ),
      c(
        "Clivadas com foi ... que",
        [
          "A clivada destaca explicitamente um elemento da frase.",
          "Ela é útil para corrigir, contrastar ou responder com precisão.",
        ],
        "Foi a Ana que ligou.",
        ["moldura", "foco", "oração"],
        "cleft sentences for focus",
        "It was Ana who called."
      ),
    ],
  },
  spanish: {
    "Voice & Focus": [
      c(
        "La voz activa deja visible al agente",
        [
          "La voz activa presenta claramente quién hace la acción.",
          "Es la opción más directa cuando el agente importa.",
        ],
        "La chef prepara la cena.",
        ["sujeto", "verbo", "objeto"],
        "active clauses foreground the doer",
        "The chef prepares the dinner."
      ),
      c(
        "La pasiva con ser pone foco en el paciente",
        [
          "La pasiva con ser mueve al primer plano lo que recibe la acción.",
          "El agente puede aparecer con por o quedar fuera si no interesa.",
        ],
        "La cena fue preparada por la chef.",
        ["paciente", "pasiva", "agente"],
        "passive voice with ser",
        "The dinner was prepared by the chef."
      ),
      c(
        "Se pasivo e impersonal quitan foco del agente",
        [
          "Las construcciones con se permiten hablar de la acción sin centrar a quien la realiza.",
          "Son muy frecuentes en avisos, explicaciones generales y estilo impersonal.",
        ],
        "Se venden libros usados.",
        ["se", "verbo", "paciente"],
        "se passive backgrounds the agent",
        "Used books are sold."
      ),
      c(
        "La topicalización retoma con clítico",
        [
          "En español, un elemento puede adelantarse y luego retomarse con un pronombre.",
          "Así se convierte en el centro informativo de la oración.",
        ],
        "Ese libro, ya lo leí.",
        ["tópico", "retoma", "comentario"],
        "fronting with clitic resumption",
        "That book, I already read it."
      ),
      c(
        "Fue ... quien / que focaliza",
        [
          "La estructura focal hace destacar explícitamente una parte de la oración.",
          "Es muy útil para corregir o responder con precisión.",
        ],
        "Fue Ana quien llamó.",
        ["marco", "foco", "cláusula"],
        "cleft sentences for focus",
        "It was Ana who called."
      ),
    ],
  },
  swedish: {
    "Voice & Focus": [
      c(
        "Aktiva satser lyfter fram den som handlar",
        [
          "I aktiv sats står den handlande personen tydligt i centrum.",
          "Det är ofta den rakaste formen när agenten är viktig.",
        ],
        "Kocken lagar maten.",
        ["subjekt", "verb", "objekt"],
        "active clauses foreground the doer",
        "The chef is cooking the food."
      ),
      c(
        "S-passiv sätter handlingen i fokus",
        [
          "S-passiv används ofta när handlingen eller rutinen är viktigare än agenten.",
          "Den är mycket vanlig i svensk sakprosa och instruktioner.",
        ],
        "Dörren öppnas klockan åtta.",
        ["subjekt", "passiv verbform", "tid"],
        "s-passive backgrounds the doer",
        "The door is opened at eight o'clock."
      ),
      c(
        "Bli-passiv visar händelse och förändring",
        [
          "Bli-passiv betonar ofta att något händer eller förändras.",
          "Den känns mer händelsebetonad än ett rent tillstånd.",
        ],
        "Han blev stoppad av polisen.",
        ["subjekt", "passiv", "agent"],
        "bli-passive foregrounds the event",
        "He was stopped by the police."
      ),
      c(
        "Framflyttning ger fokus men verbet står kvar på plats två",
        [
          "När ett objekt eller en tidsfras flyttas fram måste verbet fortfarande stå på plats två i huvudsatsen.",
          "Det gör framflyttning till ett viktigt fokusverktyg i svenskan.",
        ],
        "Den boken läste jag igår.",
        ["fokusfält", "verb", "rest"],
        "fronting with verb-second word order",
        "That book, I read yesterday."
      ),
      c(
        "Det är ... som markerar fokus",
        [
          "Den här konstruktionen lyfter fram ett särskilt led som extra viktigt.",
          "Den fungerar bra för rättelser och tydliga kontraster.",
        ],
        "Det var Lisa som ringde.",
        ["ram", "fokus", "bisats"],
        "cleft sentences for focus",
        "It was Lisa who called."
      ),
    ],
  },
};
