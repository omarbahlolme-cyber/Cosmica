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

const c = (title, points, example, ruleOrder, sourceTitle, sourceExample) => ({
  title,
  points,
  example,
  ruleOrder,
  exampleHighlights: buildHighlights(ruleOrder, example),
  sourceTitle,
  sourceExample,
});

module.exports = {
  arabic: {
    "Formality & Style": [
      c(
        "التحية تختلف حسب الموقف",
        [
          "التحية في العربية تتغير بحسب العلاقة والمقام.",
          "السلام عليكم أرفع من مرحبًا في كثير من السياقات الرسمية.",
        ],
        "السلام عليكم، كيف حالك؟",
        ["التحية", "السؤال"],
        "greetings shift with context",
        "Peace be upon you, how are you?"
      ),
      c(
        "الطلب المهذب مع من فضلك / لو سمحت",
        [
          "للطلب المهذب نستعمل من فضلك أو لو سمحت مع نبرة مناسبة.",
          "التهذيب هنا يأتي من العبارة ومن طريقة الطلب معًا.",
        ],
        "لو سمحت، هل يمكنك المساعدة؟",
        ["التمهيد", "الطلب"],
        "polite requests with softeners",
        "Excuse me, can you help?"
      ),
      c(
        "الألقاب تعطي احترامًا",
        [
          "الأستاذ والدكتور ونحو ذلك مهمان في الأسلوب الرسمي.",
          "اللقب قد يكون أنسب من الاسم المجرد في الخطاب المهذب.",
        ],
        "دكتور علي، هل لديك دقيقة؟",
        ["اللقب", "السؤال"],
        "titles and honorifics",
        "Doctor Ali, do you have a minute?"
      ),
      c(
        "الأسلوب الرسمي يتجنب العامية",
        [
          "في الكلام الرسمي نختار ألفاظًا أوضح وأقل عامية.",
          "أود وأرغب أنسب من صيغ دارجة جدًا في المواقف المهنية.",
        ],
        "أود مناقشة هذا الأمر معكم.",
        ["التمهيد", "المحتوى"],
        "formal style avoids slang",
        "I would like to discuss this matter with you."
      ),
    ],
    "Discourse & Flow": [
      c(
        "و / لكن للربط والمقابلة",
        [
          "و تضيف فكرة، لكن تقابل بين فكرتين.",
          "اختيار الأداة يحدد علاقة الجملتين في ذهن السامع.",
        ],
        "أحب القراءة، لكنني متعب.",
        ["الفكرة الأولى", "الربط", "الفكرة الثانية"],
        "addition and contrast markers",
        "I like reading, but I am tired."
      ),
      c(
        "لأن / لذلك للسبب والنتيجة",
        [
          "لأن تقدم السبب، لذلك تقدم النتيجة.",
          "ترتيب السبب والنتيجة يصنع وضوحًا في السرد والشرح.",
        ],
        "تأخرت لأن الطريق مزدحم، لذلك اتصلت بك.",
        ["السبب", "النتيجة"],
        "reason and result markers",
        "I was late because the road was crowded, so I called you."
      ),
      c(
        "أولًا / ثم / أخيرًا للتسلسل",
        [
          "هذه العلامات تساعد على ترتيب الخطوات أو الأحداث.",
          "هي مهمة في الشرح والتعليم وسرد الإجراءات.",
        ],
        "أولًا أراجع الدرس، ثم أكتب الملاحظات، وأخيرًا أتدرّب.",
        ["البداية", "الوسط", "النهاية"],
        "sequencing markers",
        "First I review the lesson, then I write notes, and finally I practice."
      ),
      c(
        "هذا / ذلك للعودة إلى فكرة سابقة",
        [
          "اسم الإشارة قد يحيل إلى جملة أو فكرة سابقة لا إلى شيء مادي فقط.",
          "بهذه الطريقة يبقى النص مترابطًا من غير تكرار كامل.",
        ],
        "قال المدير إن الاجتماع غدًا، وهذا مهم.",
        ["الفكرة", "الإحالة"],
        "reference back to a previous idea",
        "The manager said the meeting is tomorrow, and that is important."
      ),
      c(
        "مثلًا / في النهاية لتنظيم العرض",
        [
          "مثلًا يقدم مثالًا، وفي النهاية تساعد على الإغلاق أو الخلاصة.",
          "علامات التنظيم تجعل الكلام أسهل متابعةً.",
        ],
        "يمكنك الدراسة بطرق مختلفة؛ مثلًا، بالقراءة أو الاستماع.",
        ["الفكرة", "المثال"],
        "examples and framing signals",
        "You can study in different ways, for example by reading or listening."
      ),
    ],
    Modality: [
      c(
        "يجب أن للوجوب القوي",
        [
          "يجب أن تعبر عن إلزام أو ضرورة قوية.",
          "هي أقوى من صياغات النصيحة الخفيفة.",
        ],
        "يجب أن تنهي العمل اليوم.",
        ["أداة الوجوب", "الفعل"],
        "strong obligation",
        "You must finish the work today."
      ),
      c(
        "ينبغي أن للنصيحة",
        [
          "ينبغي أن أقرب إلى التوجيه أو النصيحة من الإلزام الصارم.",
          "اختيارها يخفف نبرة الأمر.",
        ],
        "ينبغي أن تنام مبكرًا.",
        ["أداة النصيحة", "الفعل"],
        "advice and recommendation",
        "You should sleep early."
      ),
      c(
        "أستطيع / يمكنني للقدرة",
        [
          "هاتان الصيغتان تدلان على قدرة الشخص على الفعل.",
          "المعنى هنا قدرة أو إمكان شخصي، لا مجرد احتمال عام.",
        ],
        "أستطيع أن أسبح بسرعة.",
        ["الفاعل", "أداة القدرة", "الفعل"],
        "ability",
        "I can swim quickly."
      ),
      c(
        "قد / ربما للاحتمال",
        [
          "قد وربما تضعان الحدث في مجال الاحتمال لا اليقين.",
          "هما مفيدتان للتخمين والتوقع المهذب.",
        ],
        "ربما يصل القطار متأخرًا.",
        ["أداة الاحتمال", "الحدث"],
        "possibility and probability",
        "The train might arrive late."
      ),
      c(
        "يجوز / لا يجوز للإذن والمنع",
        [
          "يجوز يدل على السماح، ولا يجوز على المنع أو عدم الجواز.",
          "هذا الاستعمال شائع في التعليمات والأسلوب الرسمي.",
        ],
        "لا يجوز التدخين هنا.",
        ["أداة المنع", "الفعل"],
        "permission and prohibition",
        "Smoking is not allowed here."
      ),
    ],
  },
  chinese: {
    "Formality & Style": [
      c(
        "你 / 您 的距离感",
        [
          "你用于普通关系，您更礼貌、更有距离感。",
          "选错人称不一定语法错，但会让语气失衡。",
        ],
        "您今天过得怎么样？",
        ["称呼", "提问"],
        "formal and informal second-person address",
        "How are you today?"
      ),
      c(
        "请 / 麻烦 让请求更柔和",
        [
          "请和麻烦能把请求说得更有礼貌。",
          "中文礼貌常靠措辞和语气，不靠复杂词尾变化。",
        ],
        "麻烦您帮我看一下。",
        ["缓和语", "请求"],
        "polite requests with softeners",
        "Could you please take a look for me?"
      ),
      c(
        "称呼常用姓 + 头衔",
        [
          "王老师、李医生这类称呼比直接叫名字更稳妥。",
          "头衔和职业名称经常承担礼貌功能。",
        ],
        "王老师，您现在方便吗？",
        ["称呼", "提问"],
        "titles and respectful address",
        "Teacher Wang, are you available now?"
      ),
      c(
        "委婉表达比直接命令更自然",
        [
          "可以……吗、方便……吗、一下都能让语气更柔和。",
          "礼貌不是单一词汇，而是整句的设计。",
        ],
        "可以请您再说一遍吗？",
        ["委婉提问", "内容"],
        "indirect and softened style",
        "Could you please say it again?"
      ),
    ],
    "Discourse & Flow": [
      c(
        "而且 / 但是 连接关系",
        [
          "而且补充信息，但是形成转折。",
          "连接词先告诉听者两句之间是什么关系。",
        ],
        "这本书很短，但是很有意思。",
        ["前句", "连接词", "后句"],
        "addition and contrast markers",
        "This book is short, but it is very interesting."
      ),
      c(
        "因为……所以…… 表原因和结果",
        [
          "因为提出原因，所以引出结果。",
          "这一组搭配让逻辑关系非常清楚。",
        ],
        "因为下雨，所以我没出去。",
        ["原因", "结果"],
        "reason and result markers",
        "Because it rained, I did not go out."
      ),
      c(
        "先……然后……最后…… 排顺序",
        [
          "说步骤时，先、然后、最后能把流程排清楚。",
          "叙事和说明都很常用这种顺序标记。",
        ],
        "先洗手，然后吃饭，最后收拾桌子。",
        ["开始", "中间", "结束"],
        "sequencing markers",
        "First wash your hands, then eat, and finally clear the table."
      ),
      c(
        "话题先行让信息更顺",
        [
          "中文常先说话题，再补充评论或新信息。",
          "这让听者更快知道后面在说什么。",
        ],
        "这本书，我已经看过了。",
        ["话题", "评论"],
        "topic-comment flow",
        "This book, I have already read it."
      ),
      c(
        "比如 / 总之 帮助组织段落",
        [
          "比如引例子，总之收束前面的内容。",
          "这些词帮助听者知道你是在展开还是总结。",
        ],
        "可以用很多方法练习，比如跟读。",
        ["总说", "举例"],
        "examples and conclusions",
        "You can practice in many ways, for example by shadowing."
      ),
    ],
    Modality: [
      c(
        "必须 表强制义务",
        [
          "必须表示说话人认为这件事不能不做。",
          "语气比应该更强。",
        ],
        "你必须今天交作业。",
        ["义务", "动作"],
        "strong obligation",
        "You must hand in the homework today."
      ),
      c(
        "应该 表建议或应当",
        [
          "应该常用于建议、判断或一般性的应当。",
          "它比必须更容易保留余地。",
        ],
        "你应该早点休息。",
        ["建议", "动作"],
        "advice and recommendation",
        "You should rest earlier."
      ),
      c(
        "会 / 能 表能力",
        [
          "会常说学会的技能，能也可表示有能力或条件允许。",
          "要根据你强调的是技能还是条件来选。",
        ],
        "我会开车。",
        ["主语", "能力"],
        "ability",
        "I can drive."
      ),
      c(
        "可能 / 也许 表推测",
        [
          "可能、也许把事情放在不确定范围里。",
          "它们适合表达猜测和保留判断。",
        ],
        "他可能已经到了。",
        ["推测", "事件"],
        "possibility and probability",
        "He may have arrived already."
      ),
      c(
        "可以 / 不能 表许可和禁止",
        [
          "可以常用于许可，不能常用于禁止或不允许。",
          "同一个形式也可能表示能力，要看上下文。",
        ],
        "这里不能拍照。",
        ["禁止", "动作"],
        "permission and prohibition",
        "You cannot take photos here."
      ),
    ],
  },
  dutch: {
    "Formality & Style": [
      c(
        "Je / jij tegenover u",
        [
          "Je en jij klinken informeel; u is formeler en schept meer afstand.",
          "De keuze hangt af van relatie, context en toon.",
        ],
        "Hoe gaat het met u?",
        ["aanhef", "vraag"],
        "formal and informal second-person address",
        "How are you?"
      ),
      c(
        "Beleefde verzoeken met zou u",
        [
          "Zou u en zou je maken een verzoek minder direct.",
          "Nederlandse beleefdheid zit vaak in verzachting, niet in veel vaste eerbetuigingen.",
        ],
        "Zou u mij kunnen helpen?",
        ["verzachter", "verzoek"],
        "polite requests with zou",
        "Could you help me?"
      ),
      c(
        "Groeten passen bij de situatie",
        [
          "Hoi, hallo en goedemiddag horen bij verschillende sociale afstanden.",
          "Een passende opening zet meteen de juiste toon.",
        ],
        "Goedemiddag, fijn u te ontmoeten.",
        ["groet", "vervolg"],
        "greetings shift with context",
        "Good afternoon, nice to meet you."
      ),
      c(
        "Verzachten met graag en misschien",
        [
          "Woorden als graag en misschien maken een zin vriendelijker.",
          "Ze zijn belangrijk in praktische gesprekken en service-interactie.",
        ],
        "Misschien kunt u dat nog eens uitleggen.",
        ["verzachter", "verzoek"],
        "softening and indirect style",
        "Maybe you could explain that once more."
      ),
    ],
    "Discourse & Flow": [
      c(
        "En / maar voor toevoeging en contrast",
        [
          "En voegt informatie toe; maar zet een tegenstelling neer.",
          "De verbindingskeuze stuurt hoe de luisteraar het verband leest.",
        ],
        "Ik lees veel, maar ik schrijf weinig.",
        ["eerste idee", "verbinder", "tweede idee"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Omdat / daarom voor reden en gevolg",
        [
          "Omdat geeft de reden, daarom het gevolg.",
          "Samen maken ze oorzaak en resultaat helder.",
        ],
        "Ik bleef thuis omdat het regende, daarom belde ik eerst.",
        ["reden", "gevolg"],
        "reason and result markers",
        "I stayed home because it was raining, so I called first."
      ),
      c(
        "Eerst / dan / daarna ordenen stappen",
        [
          "Volgordemarkeerders helpen bij instructies en verhalen.",
          "Ze houden de informatie in een logische reeks.",
        ],
        "Eerst lees ik de tekst, dan maak ik de oefening.",
        ["stap één", "stap twee"],
        "sequencing markers",
        "First I read the text, then I do the exercise."
      ),
      c(
        "Daarmee en zo verwijs je terug",
        [
          "Verwijswoorden helpen om niet alles te herhalen.",
          "Zo blijft de tekst verbonden zonder zwaar te worden.",
        ],
        "We hebben de afspraak veranderd; daarmee is het probleem opgelost.",
        ["eerste zin", "verwijzing"],
        "reference back to previous information",
        "We changed the appointment; with that, the problem is solved."
      ),
      c(
        "Bijvoorbeeld en kortom sturen de lezer",
        [
          "Bijvoorbeeld opent een illustratie; kortom vat samen.",
          "Dat maakt langere uitleg makkelijker te volgen.",
        ],
        "Je kunt op veel manieren oefenen, bijvoorbeeld met luisterteksten.",
        ["algemeen", "voorbeeld"],
        "examples and conclusions",
        "You can practice in many ways, for example with listening texts."
      ),
    ],
    Modality: [
      c(
        "Moeten voor noodzaak",
        [
          "Moeten drukt een sterke verplichting of noodzaak uit.",
          "Het klinkt sterker dan een vrijblijvend advies.",
        ],
        "Je moet nu vertrekken.",
        ["modaal werkwoord", "handeling"],
        "strong obligation",
        "You must leave now."
      ),
      c(
        "Zou moeten voor advies",
        [
          "Zou moeten klinkt vaak meer als raad of verwachting dan als bevel.",
          "Het laat meer ruimte voor keuze.",
        ],
        "Je zou meer moeten slapen.",
        ["advies", "handeling"],
        "advice and recommendation",
        "You should sleep more."
      ),
      c(
        "Kunnen voor vermogen",
        [
          "Kunnen drukt uit dat iemand iets kan doen.",
          "Dat kan vaardigheid, praktische mogelijkheid of gelegenheid zijn, afhankelijk van de context.",
        ],
        "Ik kan goed zwemmen.",
        ["modaal werkwoord", "vaardigheid"],
        "ability",
        "I can swim well."
      ),
      c(
        "Misschien / zou kunnen voor mogelijkheid",
        [
          "Misschien en zou kunnen maken de uitspraak minder zeker.",
          "Ze zijn geschikt voor voorzichtige inschattingen.",
        ],
        "Hij zou later kunnen komen.",
        ["mogelijkheid", "gebeurtenis"],
        "possibility and probability",
        "He might come later."
      ),
      c(
        "Mogen / niet mogen voor toestemming",
        [
          "Mogen geeft toestemming aan; niet mogen verbiedt iets.",
          "Dit modale contrast is centraal in regels en omgang.",
        ],
        "Je mag hier niet roken.",
        ["toestemming", "handeling"],
        "permission and prohibition",
        "You may not smoke here."
      ),
    ],
  },
  french: {
    "Formality & Style": [
      c(
        "Tu / vous selon la relation",
        [
          "Tu marque la proximité; vous marque le respect, la distance ou le pluriel.",
          "Choisir le bon pronom est un choix social autant que grammatical.",
        ],
        "Vous avez un moment ?",
        ["pronom", "demande"],
        "formal and informal second-person address",
        "Do you have a moment?"
      ),
      c(
        "Les demandes polies avec le conditionnel",
        [
          "Pourriez-vous et je voudrais rendent une demande plus douce.",
          "Le conditionnel sert souvent à éviter un impératif trop direct.",
        ],
        "Pourriez-vous répéter, s'il vous plaît ?",
        ["formule polie", "demande"],
        "polite requests with conditional forms",
        "Could you repeat, please?"
      ),
      c(
        "Monsieur / Madame et les salutations",
        [
          "Bonjour, bonsoir, Monsieur et Madame installent un registre plus formel.",
          "En français, l'ouverture de l'échange compte beaucoup pour la politesse.",
        ],
        "Bonjour Madame, je vous remercie.",
        ["salutation", "suite"],
        "titles and formal greetings",
        "Good morning, ma'am, thank you."
      ),
      c(
        "Je voudrais sonne plus diplomatique",
        [
          "Je veux peut paraître abrupt; je voudrais est plus diplomatique.",
          "Le style formel privilégie souvent l'atténuation.",
        ],
        "Je voudrais prendre rendez-vous.",
        ["atténuation", "objectif"],
        "softening and diplomatic style",
        "I would like to make an appointment."
      ),
    ],
    "Discourse & Flow": [
      c(
        "Et / mais pour ajouter ou contraster",
        [
          "Et ajoute une idée; mais introduit une opposition.",
          "Ces petits mots pilotent le mouvement logique du discours.",
        ],
        "Je lis beaucoup, mais j'écris peu.",
        ["idée 1", "connecteur", "idée 2"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Parce que / donc pour cause et conséquence",
        [
          "Parce que donne la cause; donc donne le résultat ou la conclusion.",
          "Les deux n'occupent pas la même place argumentative.",
        ],
        "Je suis resté chez moi parce qu'il pleuvait, donc j'ai étudié.",
        ["cause", "conséquence"],
        "reason and result markers",
        "I stayed home because it was raining, so I studied."
      ),
      c(
        "D'abord / puis / enfin structurent",
        [
          "Ces marqueurs ordonnent des étapes ou un récit.",
          "Ils sont très utiles pour expliquer une méthode.",
        ],
        "D'abord je lis, puis je note, enfin je révise.",
        ["début", "milieu", "fin"],
        "sequencing markers",
        "First I read, then I take notes, and finally I review."
      ),
      c(
        "En fait et d'ailleurs guident l'enchaînement",
        [
          "En fait reformule ou corrige; d'ailleurs ajoute une remarque liée.",
          "Le discours paraît plus naturel quand ces transitions sont bien choisies.",
        ],
        "En fait, le problème est plus simple.",
        ["transition", "reformulation"],
        "flow-managing discourse markers",
        "In fact, the problem is simpler."
      ),
      c(
        "Par exemple et en résumé cadrent le texte",
        [
          "Par exemple annonce une illustration; en résumé ferme et synthétise.",
          "Ces balises aident l'auditeur à suivre la macro-structure.",
        ],
        "Tu peux pratiquer de plusieurs façons, par exemple avec des dialogues.",
        ["idée générale", "exemple"],
        "examples and conclusions",
        "You can practice in several ways, for example with dialogues."
      ),
    ],
    Modality: [
      c(
        "Devoir pour l'obligation",
        [
          "Devoir exprime une obligation ou une nécessité claire.",
          "La force dépend du contexte, mais la pression est réelle.",
        ],
        "Je dois partir maintenant.",
        ["modal", "infinitif"],
        "strong obligation",
        "I must leave now."
      ),
      c(
        "Il faut / tu devrais pour le conseil",
        [
          "Il faut et devoir n'ont pas toujours la même force; devrais donne souvent un conseil plus doux.",
          "Le choix module la relation entre parler et imposer.",
        ],
        "Tu devrais dormir plus tôt.",
        ["conseil", "infinitif"],
        "advice and recommendation",
        "You should sleep earlier."
      ),
      c(
        "Pouvoir pour capacité ou permission",
        [
          "Pouvoir peut parler de capacité, de possibilité ou d'autorisation.",
          "Le contexte décide la nuance exacte.",
        ],
        "Je peux venir demain.",
        ["modal", "infinitif"],
        "ability and permission with pouvoir",
        "I can come tomorrow."
      ),
      c(
        "Vouloir pour intention",
        [
          "Vouloir exprime la volonté, le projet ou l'intention du sujet.",
          "Dans les demandes, il doit souvent être adouci pour rester poli.",
        ],
        "Je veux apprendre plus vite.",
        ["volonté", "objectif"],
        "intention and desire",
        "I want to learn faster."
      ),
      c(
        "Peut-être / devoir pour la probabilité",
        [
          "Peut-être et devoir peuvent signaler une conclusion probable.",
          "On passe alors d'un fait certain à une inférence.",
        ],
        "Il doit être chez lui.",
        ["indice", "inférence"],
        "possibility and probability",
        "He is probably at home."
      ),
    ],
  },
  german: {
    "Formality & Style": [
      c(
        "Du / Sie nach Beziehung und Kontext",
        [
          "Du ist informell; Sie markiert Distanz, Respekt oder institutionellen Rahmen.",
          "Die Anrede steuert sofort den sozialen Ton des Gesprächs.",
        ],
        "Haben Sie kurz Zeit?",
        ["Anrede", "Frage"],
        "formal and informal second-person address",
        "Do you have a moment?"
      ),
      c(
        "Höfliche Bitten mit könnten",
        [
          "Könnten Sie ... klingt höflicher als ein direkter Imperativ.",
          "Konjunktiv II ist im Deutschen ein wichtiges Werkzeug für diplomatische Bitten.",
        ],
        "Könnten Sie das bitte wiederholen?",
        ["Höflichkeitsform", "Bitte"],
        "polite requests with konjunktiv ii",
        "Could you repeat that, please?"
      ),
      c(
        "Titel und formelle Begrüßungen",
        [
          "Herr, Frau und berufliche Titel strukturieren formelle Interaktion.",
          "Auch die Begrüßung selbst trägt stark zum Register bei.",
        ],
        "Guten Tag, Frau Weber.",
        ["Begrüßung", "Anrede"],
        "titles and formal greetings",
        "Good day, Ms. Weber."
      ),
      c(
        "Ich würde gern klingt weicher",
        [
          "Ich will ist direkt; ich würde gern wirkt vorsichtiger und kooperativer.",
          "Formeller Stil bevorzugt oft solche Abschwächungen.",
        ],
        "Ich würde gern einen Termin vereinbaren.",
        ["Abschwächung", "Absicht"],
        "softening and diplomatic style",
        "I would like to make an appointment."
      ),
    ],
    "Discourse & Flow": [
      c(
        "Und / aber für Zusatz und Gegensatz",
        [
          "Und verbindet, aber kontrastiert.",
          "Schon einfache Konnektoren tragen die Hauptlogik eines Texts.",
        ],
        "Ich lese viel, aber ich schreibe wenig.",
        ["Aussage 1", "Konnektor", "Aussage 2"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Weil / deshalb für Grund und Folge",
        [
          "Weil nennt den Grund; deshalb nennt die Folge.",
          "Im Deutschen ändern solche Wörter auch die Satzstellung.",
        ],
        "Ich bleibe zu Hause, weil es regnet, deshalb arbeite ich online.",
        ["Grund", "Folge"],
        "reason and result markers",
        "I stay at home because it is raining, so I work online."
      ),
      c(
        "Zuerst / dann / schließlich ordnen Schritte",
        [
          "Mit diesen Markern bleibt eine Abfolge klar und leicht nachvollziehbar.",
          "Sie sind typisch für Erklärungen, Berichte und Anweisungen.",
        ],
        "Zuerst lese ich den Text, dann mache ich die Übung.",
        ["Schritt 1", "Schritt 2"],
        "sequencing markers",
        "First I read the text, then I do the exercise."
      ),
      c(
        "Also und übrigens steuern den Gesprächsfluss",
        [
          "Also kann ordnen oder zusammenfassen; übrigens bringt eine Nebenbemerkung ein.",
          "Solche Marker machen gesprochene Sprache natürlicher.",
        ],
        "Also, das ist der wichtigste Punkt.",
        ["Marker", "Kernaussage"],
        "flow-managing discourse markers",
        "So, that is the most important point."
      ),
      c(
        "Zum Beispiel und zusammenfassend rahmen",
        [
          "Zum Beispiel signalisiert eine Illustration; zusammenfassend markiert den Abschluss.",
          "So erkennt der Hörer leichter, wo er im Text steht.",
        ],
        "Du kannst auf viele Arten üben, zum Beispiel mit Dialogen.",
        ["Allgemeines", "Beispiel"],
        "examples and conclusions",
        "You can practice in many ways, for example with dialogues."
      ),
    ],
    Modality: [
      c(
        "Müssen für Notwendigkeit",
        [
          "Müssen markiert starke Verpflichtung oder Notwendigkeit.",
          "Es wirkt deutlich stärker als bloßer Rat.",
        ],
        "Ich muss jetzt gehen.",
        ["Modalverb", "Infinitiv"],
        "strong obligation",
        "I must go now."
      ),
      c(
        "Sollen für Rat oder Erwartung",
        [
          "Sollen kann Empfehlung, Auftrag oder fremde Erwartung ausdrücken.",
          "Es ist deshalb pragmatisch anders als müssen.",
        ],
        "Du solltest früher schlafen.",
        ["Rat", "Infinitiv"],
        "advice and recommendation",
        "You should sleep earlier."
      ),
      c(
        "Können für Fähigkeit",
        [
          "Können drückt Fähigkeit oder praktische Möglichkeit aus.",
          "Der Kontext entscheidet, ob die Nuance eher Können oder Gelegenheit ist.",
        ],
        "Ich kann gut schwimmen.",
        ["Modalverb", "Fähigkeit"],
        "ability",
        "I can swim well."
      ),
      c(
        "Dürfen für Erlaubnis und Verbot",
        [
          "Dürfen markiert Erlaubnis; nicht dürfen markiert Verbot.",
          "Das ist ein zentrales Modalpaar für Regeln.",
        ],
        "Du darfst hier nicht rauchen.",
        ["Erlaubnis", "Handlung"],
        "permission and prohibition",
        "You may not smoke here."
      ),
      c(
        "Vielleicht / könnte für Wahrscheinlichkeit",
        [
          "Vielleicht und könnte schwächen die Sicherheit einer Aussage ab.",
          "Sie sind nützlich für vorsichtige Einschätzungen.",
        ],
        "Er könnte später kommen.",
        ["Wahrscheinlichkeit", "Ereignis"],
        "possibility and probability",
        "He might come later."
      ),
    ],
  },
  hindi: {
    "Formality & Style": [
      c(
        "तू / तुम / आप से सामाजिक दूरी",
        [
          "इन तीन रूपों से निकटता, सम्मान और दूरी अलग-अलग व्यक्त होती है।",
          "गलत चयन अर्थ से पहले संबंध को बिगाड़ सकता है।",
        ],
        "क्या आप थोड़ा समय दे सकते हैं?",
        ["संबोधन", "अनुरोध"],
        "formal and informal second-person address",
        "Could you give me a little time?"
      ),
      c(
        "कृपया / ज़रा से अनुरोध नरम होता है",
        [
          "कृपया और ज़रा जैसे शब्द अनुरोध को कम कठोर बनाते हैं।",
          "हिंदी की विनम्रता अक्सर पूरे वाक्य की बनावट में दिखती है।",
        ],
        "ज़रा यह बात फिर से कहिए।",
        ["विनम्रता", "अनुरोध"],
        "polite requests with softeners",
        "Please say that again."
      ),
      c(
        "जी और पदवी से आदर बढ़ता है",
        [
          "जी, सर, मैडम, डॉक्टर जैसे रूप सम्मान दिखाने में काम आते हैं।",
          "व्यक्ति के नाम के साथ जी लगाना भी बहुत सामान्य है।",
        ],
        "शर्मा जी, आप कब आए?",
        ["संबोधन", "प्रश्न"],
        "titles and respectful address",
        "Mr. Sharma, when did you arrive?"
      ),
      c(
        "बैठो, बैठिए में स्तर बदलता है",
        [
          "क्रिया का रूप ही औपचारिकता बदल सकता है।",
          "आदेश, निमंत्रण और अनुरोध में यह अंतर बहुत महत्वपूर्ण है।",
        ],
        "कृपया बैठिए।",
        ["विनम्र रूप", "क्रिया"],
        "formal imperatives and softened style",
        "Please have a seat."
      ),
    ],
    "Discourse & Flow": [
      c(
        "और / लेकिन से जोड़ और विरोध",
        [
          "और विचार जोड़ता है, लेकिन विरोध दिखाता है।",
          "इनसे वाक्य का संबंध तुरंत स्पष्ट हो जाता है।",
        ],
        "मैं पढ़ता हूँ, लेकिन जल्दी थक जाता हूँ।",
        ["पहला विचार", "संबंध", "दूसरा विचार"],
        "addition and contrast markers",
        "I study, but I get tired quickly."
      ),
      c(
        "क्योंकि / इसलिए से कारण और परिणाम",
        [
          "क्योंकि कारण देता है, इसलिए परिणाम बताता है।",
          "यह जोड़ी व्याख्या को बहुत साफ बनाती है।",
        ],
        "मैं घर पर रहा क्योंकि बारिश हो रही थी, इसलिए काम पूरा किया।",
        ["कारण", "परिणाम"],
        "reason and result markers",
        "I stayed home because it was raining, so I finished the work."
      ),
      c(
        "पहले / फिर / आखिर में क्रम बनाते हैं",
        [
          "ये शब्द प्रक्रिया या कहानी को क्रम में रखते हैं।",
          "निर्देश देने में ये बहुत उपयोगी हैं।",
        ],
        "पहले पाठ पढ़ो, फिर प्रश्न लिखो।",
        ["कदम 1", "कदम 2"],
        "sequencing markers",
        "First read the lesson, then write the questions."
      ),
      c(
        "ही / तो से फोकस बनता है",
        [
          "ही किसी हिस्से पर जोर डालता है, तो अक्सर विषय या प्रतिक्रिया का ढाँचा बनाता है।",
          "ये छोटे शब्द सूचना के भार को बदल देते हैं।",
        ],
        "राम ही आज आया।",
        ["फोकस", "मुख्य कथन"],
        "focus and topic markers",
        "Ram alone came today."
      ),
      c(
        "उदाहरण के लिए / अंत में से ढाँचा मिलता है",
        [
          "उदाहरण के लिए से उदाहरण खुलता है, अंत में से समापन आता है।",
          "इससे लंबा कथन सुनने वाले के लिए आसान हो जाता है।",
        ],
        "अभ्यास कई तरह से हो सकता है; उदाहरण के लिए, सुनकर दोहराना।",
        ["सामान्य बात", "उदाहरण"],
        "examples and conclusions",
        "Practice can happen in many ways, for example by repeating what you hear."
      ),
    ],
    Modality: [
      c(
        "पड़ना बाहरी मजबूरी दिखाता है",
        [
          "करना पड़ता है जैसी रचना बाहरी परिस्थिति से बनी मजबूरी दिखाती है।",
          "यह सिर्फ हल्का सुझाव नहीं होता।",
        ],
        "मुझे आज देर तक काम करना पड़ेगा।",
        ["मजबूरी", "क्रिया"],
        "strong obligation",
        "I will have to work late today."
      ),
      c(
        "चाहिए सलाह या अपेक्षा देता है",
        [
          "चाहिए अक्सर सलाह, उचित काम या सामान्य अपेक्षा दिखाता है.",
          "यह पड़ना जितना कठोर नहीं है।",
        ],
        "तुम्हें जल्दी सोना चाहिए।",
        ["सलाह", "क्रिया"],
        "advice and recommendation",
        "You should sleep early."
      ),
      c(
        "सकना क्षमता दिखाता है",
        [
          "सकना किसी काम को कर पाने की क्षमता या सामर्थ्य दिखाता है।",
          "रूप लिंग और वचन के साथ बदलता है।",
        ],
        "मैं यह काम कर सकता हूँ।",
        ["कर्ता", "क्षमता", "क्रिया"],
        "ability",
        "I can do this work."
      ),
      c(
        "शायद / सकता है से संभावना",
        [
          "शायद और सकता है कथन को अनिश्चित बनाते हैं।",
          "ये अनुमान और सावधान बयान के लिए उपयोगी हैं।",
        ],
        "वह शायद देर से आए।",
        ["संभावना", "घटना"],
        "possibility and probability",
        "He might arrive late."
      ),
      c(
        "अनुमति और मनाही अलग ढंग से कही जाती है",
        [
          "अनुमति में सकते हैं जैसी रचना आ सकती है, मनाही में मना है या नहीं सकते।",
          "एक ही अर्थक्षेत्र में कई व्यावहारिक रूप मिलते हैं।",
        ],
        "यहाँ फोटो लेना मना है।",
        ["मनाही", "क्रिया"],
        "permission and prohibition",
        "Taking photos is forbidden here."
      ),
    ],
  },
  japanese: {
    "Formality & Style": [
      c(
        "です / ます 体と普通体",
        [
          "日本語では丁寧さが文末の形で大きく変わります。",
          "同じ内容でも、です / ます にするだけで距離感が変わります。",
        ],
        "今日は忙しいです。",
        ["内容", "丁寧さ"],
        "formal and informal speech styles",
        "I am busy today."
      ),
      c(
        "名前 + さん / 先生 が自然",
        [
          "相手には名前や肩書きを使うほうが自然な場面が多いです。",
          "あなたを多用すると不自然に聞こえることがあります。",
        ],
        "田中さん、少しよろしいですか。",
        ["呼びかけ", "依頼"],
        "titles and respectful address",
        "Tanaka, do you have a moment?"
      ),
      c(
        "依頼は 〜てください と 〜てもらえますか",
        [
          "〜てください は基本的な依頼、〜てもらえますか はさらに柔らかい依頼です。",
          "直接命令より丁寧で協調的に聞こえます。",
        ],
        "もう一度言ってもらえますか。",
        ["依頼", "内容"],
        "polite requests with softeners",
        "Could you say it one more time?"
      ),
      c(
        "失礼します などで場面を整える",
        [
          "失礼します、よろしくお願いします などは場面全体の礼儀を作ります。",
          "単語の意味だけでなく、社会的な振る舞いとして覚える必要があります。",
        ],
        "失礼します、先に帰ります。",
        ["定型表現", "内容"],
        "set polite formulas and softening",
        "Excuse me, I will leave first."
      ),
    ],
    "Discourse & Flow": [
      c(
        "そして / でも で流れを作る",
        [
          "そして は追加、でも は対比や転換を示します。",
          "接続詞を選ぶと、話の動きが聞き手に伝わりやすくなります。",
        ],
        "日本語を勉強しています。でも、まだ難しいです。",
        ["前半", "接続", "後半"],
        "addition and contrast markers",
        "I am studying Japanese, but it is still difficult."
      ),
      c(
        "から / ので / だから で理由と結果",
        [
          "から・ので は理由、だから は結果や結論を示します。",
          "理由をどう出すかで文の響きも変わります。",
        ],
        "雨が降っているので、出かけません。",
        ["理由", "結果"],
        "reason and result markers",
        "Because it is raining, I will not go out."
      ),
      c(
        "まず / 次に / 最後に で順序を示す",
        [
          "手順や説明では順序標識が非常に大切です。",
          "聞き手は何が先で何が後かを簡単に追えます。",
        ],
        "まず本文を読み、次にメモを取ります。",
        ["最初", "次"],
        "sequencing markers",
        "First read the text, then take notes."
      ),
      c(
        "は が情報の流れを整える",
        [
          "は は話題を立て、が は新情報や焦点を強く出すことがあります。",
          "日本語の流れはこの対比でかなり変わります。",
        ],
        "この本は、もう読みました。",
        ["話題", "コメント"],
        "topic and focus marking",
        "As for this book, I have already read it."
      ),
      c(
        "例えば / つまり でまとめる",
        [
          "例えば は具体例、つまり は言い換えや要約に役立ちます。",
          "段落全体の整理に使える重要な標識です。",
        ],
        "勉強法はいろいろあります。例えば、音読です。",
        ["一般論", "例"],
        "examples and conclusions",
        "There are various study methods, for example reading aloud."
      ),
    ],
    Modality: [
      c(
        "〜なければならない で義務",
        [
          "〜なければならない は強い必要や義務を表します。",
          "会話では短い形もありますが、意味の強さは残ります。",
        ],
        "宿題をしなければならない。",
        ["義務", "動作"],
        "strong obligation",
        "I must do my homework."
      ),
      c(
        "〜ほうがいい で助言",
        [
          "〜ほうがいい は相手への助言や勧めを表します。",
          "義務より柔らかく、選択の余地があります。",
        ],
        "早く寝たほうがいいです。",
        ["助言", "内容"],
        "advice and recommendation",
        "You should go to bed early."
      ),
      c(
        "〜ことができる で能力",
        [
          "〜ことができる は能力や可能な行為を表します。",
          "技能としてできることを言いたいときに便利です。",
        ],
        "日本語を話すことができます。",
        ["能力", "内容"],
        "ability",
        "I can speak Japanese."
      ),
      c(
        "〜かもしれない で可能性",
        [
          "〜かもしれない は確信を弱め、推量を表します。",
          "断定を避けたいときにもよく使います。",
        ],
        "明日は雨かもしれない。",
        ["可能性", "出来事"],
        "possibility and probability",
        "It might rain tomorrow."
      ),
      c(
        "〜てもいい / 〜てはいけない で許可と禁止",
        [
          "〜てもいい は許可、〜てはいけない は禁止を表します。",
          "学習初期から非常によく出る基本パターンです。",
        ],
        "ここで写真を撮ってはいけません。",
        ["禁止", "行為"],
        "permission and prohibition",
        "You must not take photos here."
      ),
    ],
  },
  korean: {
    "Formality & Style": [
      c(
        "해요체로 기본 공손함 만들기",
        [
          "한국어에서는 문장 끝 형식이 공손함을 크게 좌우합니다.",
          "해요체는 일상에서 가장 널리 쓰이는 기본 존댓말입니다.",
        ],
        "오늘 바쁘세요?",
        ["내용", "공손함"],
        "formal and informal speech styles",
        "Are you busy today?"
      ),
      c(
        "반말과 존댓말은 관계를 드러낸다",
        [
          "반말과 존댓말의 선택은 친밀도와 사회적 거리를 보여 줍니다.",
          "문법보다 관계 판단이 먼저 필요한 경우가 많습니다.",
        ],
        "지금 뭐 해요?",
        ["질문", "높임"],
        "register choice and social distance",
        "What are you doing right now?"
      ),
      c(
        "이름보다 직함이 더 자연스러운 경우가 많다",
        [
          "선생님, 팀장님 같은 직함은 자연스럽고 공손한 호칭입니다.",
          "상대에 따라 이름보다 호칭이 훨씬 적절할 수 있습니다.",
        ],
        "선생님, 잠깐 시간 있으세요?",
        ["호칭", "요청"],
        "titles and respectful address",
        "Teacher, do you have a moment?"
      ),
      c(
        "주세요 / 주실 수 있을까요 로 완곡하게",
        [
          "주세요는 기본 요청, 주실 수 있을까요는 더 조심스러운 요청입니다.",
          "명령형보다 협조를 구하는 느낌이 강합니다.",
        ],
        "한 번 더 말씀해 주실 수 있을까요?",
        ["완곡 요청", "내용"],
        "polite requests with softeners",
        "Could you say it one more time?"
      ),
    ],
    "Discourse & Flow": [
      c(
        "그리고 / 하지만 으로 연결과 대비",
        [
          "그리고는 정보를 더하고, 하지만은 대비를 만듭니다.",
          "이 연결어만 잘 써도 담화 흐름이 훨씬 명확해집니다.",
        ],
        "저는 공부해요. 하지만 아직 어렵습니다.",
        ["앞문장", "연결", "뒷문장"],
        "addition and contrast markers",
        "I study, but it is still difficult."
      ),
      c(
        "-아서/어서 와 그래서 로 이유와 결과",
        [
          "원인과 결과를 구분해 주면 설명이 훨씬 자연스럽습니다.",
          "문장 연결 방식에 따라 말맛도 달라집니다.",
        ],
        "비가 와서 집에 있었어요. 그래서 일을 끝냈어요.",
        ["이유", "결과"],
        "reason and result markers",
        "It rained, so I stayed home and finished the work."
      ),
      c(
        "먼저 / 다음에 / 마지막으로 순서를 세운다",
        [
          "절차나 설명에서는 순서 표지가 꼭 필요합니다.",
          "듣는 사람이 단계별로 따라가기 쉬워집니다.",
        ],
        "먼저 본문을 읽고, 다음에 메모하세요.",
        ["첫 단계", "다음 단계"],
        "sequencing markers",
        "First read the text, then take notes."
      ),
      c(
        "은/는 이 화제를 세운다",
        [
          "은/는 은 화제를 세우고 흐름의 기준점을 만들어 줍니다.",
          "한국어 담화는 화제를 어떻게 세우느냐에 크게 좌우됩니다.",
        ],
        "이 책은 이미 읽었어요.",
        ["화제", "설명"],
        "topic and focus marking",
        "As for this book, I already read it."
      ),
      c(
        "예를 들어 / 결국 으로 정리한다",
        [
          "예를 들어는 사례를 열고, 결국은 정리나 결론을 이끕니다.",
          "이런 표지는 긴 설명을 따라가기 쉽게 합니다.",
        ],
        "연습 방법은 많아요. 예를 들어, 따라 읽기예요.",
        ["일반화", "예시"],
        "examples and conclusions",
        "There are many practice methods, for example shadowing."
      ),
    ],
    Modality: [
      c(
        "-아/어야 하다 로 의무",
        [
          "이 표현은 해야 하는 필요나 의무를 나타냅니다.",
          "가벼운 조언보다 강도가 높습니다.",
        ],
        "오늘 숙제를 해야 해요.",
        ["의무", "행동"],
        "strong obligation",
        "I must do the homework today."
      ),
      c(
        "-는 게 좋다 로 조언",
        [
          "상대에게 권하거나 추천할 때 자주 씁니다.",
          "의무보다 부드럽고 여지를 남깁니다.",
        ],
        "일찍 자는 게 좋아요.",
        ["조언", "내용"],
        "advice and recommendation",
        "You should go to bed early."
      ),
      c(
        "-ㄹ 수 있다 로 능력",
        [
          "할 수 있다 는 능력이나 실현 가능성을 말할 때 기본형입니다.",
          "누가 할 수 있는지, 상황상 가능한지가 문맥에서 드러납니다.",
        ],
        "저는 수영할 수 있어요.",
        ["주어", "능력"],
        "ability",
        "I can swim."
      ),
      c(
        "-ㄹ지도 모르다 로 가능성",
        [
          "확실하지 않은 추측을 말할 때 쓰기 좋습니다.",
          "단정하지 않고 여지를 남기는 표현입니다.",
        ],
        "그가 늦을지도 몰라요.",
        ["가능성", "사건"],
        "possibility and probability",
        "He might be late."
      ),
      c(
        "-아/어도 되다 / -면 안 되다 로 허가와 금지",
        [
          "해도 되다 는 허가, 하면 안 되다 는 금지를 나타냅니다.",
          "규칙과 사회적 허용을 말할 때 핵심적인 패턴입니다.",
        ],
        "여기서 사진을 찍으면 안 돼요.",
        ["금지", "행동"],
        "permission and prohibition",
        "You must not take photos here."
      ),
    ],
  },
  portuguese: {
    "Formality & Style": [
      c(
        "Você / o senhor / a senhora",
        [
          "Essas formas de tratamento marcam distância social e respeito.",
          "A escolha varia por país, região e situação.",
        ],
        "A senhora poderia me ajudar?",
        ["tratamento", "pedido"],
        "formal and informal second-person address",
        "Could you help me?"
      ),
      c(
        "Pedidos educados com poderia",
        [
          "Poderia e por favor suavizam pedidos.",
          "O português usa muito a flexão verbal para ajustar a delicadeza.",
        ],
        "Você poderia repetir, por favor?",
        ["suavização", "pedido"],
        "polite requests with softeners",
        "Could you repeat that, please?"
      ),
      c(
        "Saudações e títulos mudam o tom",
        [
          "Bom dia, senhor e doutor ajudam a criar um registro mais formal.",
          "A abertura da conversa já define expectativas de estilo.",
        ],
        "Bom dia, doutora Helena.",
        ["saudação", "tratamento"],
        "titles and formal greetings",
        "Good morning, Doctor Helena."
      ),
      c(
        "Queria e gostaria soam mais diplomáticos",
        [
          "Quero pode soar direto; queria ou gostaria muitas vezes soam mais cuidadosos.",
          "Isso importa muito em pedidos e contextos profissionais.",
        ],
        "Gostaria de marcar uma reunião.",
        ["atenuação", "objetivo"],
        "softening and diplomatic style",
        "I would like to schedule a meeting."
      ),
    ],
    "Discourse & Flow": [
      c(
        "E / mas para somar e contrastar",
        [
          "E adiciona informação; mas cria oposição.",
          "Esses conectores básicos sustentam grande parte da fluidez textual.",
        ],
        "Eu leio muito, mas escrevo pouco.",
        ["ideia 1", "conector", "ideia 2"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Porque / por isso para causa e consequência",
        [
          "Porque apresenta a razão; por isso apresenta o resultado.",
          "Separar essas funções evita frases confusas.",
        ],
        "Fiquei em casa porque chovia, por isso terminei o trabalho.",
        ["causa", "resultado"],
        "reason and result markers",
        "I stayed home because it was raining, so I finished the work."
      ),
      c(
        "Primeiro / depois / finalmente organizam",
        [
          "Marcadores de sequência são essenciais em instruções e narrativas.",
          "Eles ajudam o ouvinte a acompanhar cada etapa.",
        ],
        "Primeiro leio o texto, depois faço o exercício.",
        ["passo 1", "passo 2"],
        "sequencing markers",
        "First I read the text, then I do the exercise."
      ),
      c(
        "Na verdade e aliás ajustam o fluxo",
        [
          "Na verdade reformula; aliás acrescenta uma observação relacionada.",
          "Esses marcadores deixam a fala mais natural e guiada.",
        ],
        "Na verdade, o problema é simples.",
        ["marcador", "reformulação"],
        "flow-managing discourse markers",
        "Actually, the problem is simple."
      ),
      c(
        "Por exemplo e em resumo enquadram",
        [
          "Por exemplo abre ilustração; em resumo sinaliza fechamento.",
          "Esses sinais ajudam a organizar explicações mais longas.",
        ],
        "Há muitas formas de praticar, por exemplo com diálogos.",
        ["geral", "exemplo"],
        "examples and conclusions",
        "There are many ways to practice, for example with dialogues."
      ),
    ],
    Modality: [
      c(
        "Ter de / dever para obrigação",
        [
          "Ter de e dever podem marcar necessidade ou obrigação.",
          "A escolha varia por variedade e intensidade pragmática.",
        ],
        "Eu tenho de sair agora.",
        ["modalidade", "ação"],
        "strong obligation",
        "I have to leave now."
      ),
      c(
        "Deveria para conselho",
        [
          "Deveria traz recomendação mais suave que uma obrigação direta.",
          "É útil para orientar sem impor.",
        ],
        "Você deveria dormir mais cedo.",
        ["conselho", "ação"],
        "advice and recommendation",
        "You should sleep earlier."
      ),
      c(
        "Saber / conseguir para habilidade",
        [
          "Saber + infinitivo destaca habilidade aprendida; conseguir pode destacar êxito ou capacidade prática.",
          "Nem toda habilidade usa o mesmo verbo em português.",
        ],
        "Eu sei tocar violão.",
        ["habilidade", "conteúdo"],
        "ability",
        "I can play the guitar."
      ),
      c(
        "Talvez / pode ser para possibilidade",
        [
          "Talvez e pode ser enfraquecem a certeza da afirmação.",
          "São formas úteis de hipótese e cautela.",
        ],
        "Talvez ele chegue mais tarde.",
        ["possibilidade", "evento"],
        "possibility and probability",
        "Maybe he will arrive later."
      ),
      c(
        "Poder e não poder para permissão",
        [
          "Poder pode marcar permissão; não poder marca proibição ou impossibilidade segundo o contexto.",
          "O entorno decide qual leitura é a mais natural.",
        ],
        "Você não pode fumar aqui.",
        ["permissão", "ação"],
        "permission and prohibition",
        "You cannot smoke here."
      ),
    ],
  },
  spanish: {
    "Formality & Style": [
      c(
        "Tú / usted según distancia social",
        [
          "Tú expresa cercanía; usted expresa respeto o distancia.",
          "La elección cambia según país, edad, contexto y relación.",
        ],
        "¿Usted tiene un momento?",
        ["tratamiento", "pregunta"],
        "formal and informal second-person address",
        "Do you have a moment?"
      ),
      c(
        "Las peticiones suaves con podría",
        [
          "Podría y por favor suavizan la petición.",
          "En español, la cortesía suele construirse con tiempo verbal y tono.",
        ],
        "¿Podría repetirlo, por favor?",
        ["suavización", "petición"],
        "polite requests with softeners",
        "Could you repeat it, please?"
      ),
      c(
        "Saludos y títulos marcan registro",
        [
          "Buenos días, señor y doctora sitúan la interacción en un tono más formal.",
          "Las fórmulas de apertura son pragmáticamente importantes.",
        ],
        "Buenos días, señora Ruiz.",
        ["saludo", "tratamiento"],
        "titles and formal greetings",
        "Good morning, Mrs. Ruiz."
      ),
      c(
        "Quisiera suena más diplomático",
        [
          "Quiero puede sonar directo; quisiera suele sonar más cuidadoso.",
          "Ese cambio pequeño importa mucho en servicios y contextos profesionales.",
        ],
        "Quisiera pedir una cita.",
        ["atenuación", "objetivo"],
        "softening and diplomatic style",
        "I would like to request an appointment."
      ),
    ],
    "Discourse & Flow": [
      c(
        "Y / pero para sumar y contrastar",
        [
          "Y añade información; pero introduce oposición.",
          "Conectores simples ya cambian mucho la lógica del discurso.",
        ],
        "Leo mucho, pero escribo poco.",
        ["idea 1", "conector", "idea 2"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Porque / por eso para causa y resultado",
        [
          "Porque expresa la razón; por eso expresa la consecuencia.",
          "Separar ambas funciones ayuda a construir frases más claras.",
        ],
        "Me quedé en casa porque llovía, por eso terminé el trabajo.",
        ["causa", "resultado"],
        "reason and result markers",
        "I stayed home because it was raining, so I finished the work."
      ),
      c(
        "Primero / luego / finalmente ordenan",
        [
          "Estos marcadores organizan pasos y relatos.",
          "Son esenciales cuando explicas un proceso.",
        ],
        "Primero leo el texto, luego hago el ejercicio.",
        ["paso 1", "paso 2"],
        "sequencing markers",
        "First I read the text, then I do the exercise."
      ),
      c(
        "Además y de hecho guían el flujo",
        [
          "Además añade; de hecho refuerza o reencuadra una idea.",
          "Estos marcadores hacen que el discurso suene menos fragmentado.",
        ],
        "De hecho, el problema es sencillo.",
        ["marcador", "reformulación"],
        "flow-managing discourse markers",
        "In fact, the problem is simple."
      ),
      c(
        "Por ejemplo y en resumen enmarcan",
        [
          "Por ejemplo abre una ilustración; en resumen señala síntesis o cierre.",
          "Ayudan a que el oyente sepa dónde está dentro del texto.",
        ],
        "Hay muchas formas de practicar, por ejemplo con diálogos.",
        ["general", "ejemplo"],
        "examples and conclusions",
        "There are many ways to practice, for example with dialogues."
      ),
    ],
    Modality: [
      c(
        "Tener que / deber para obligación",
        [
          "Tener que y deber pueden expresar obligación, aunque no siempre suenan igual de fuertes.",
          "El contexto decide cuánto peso tiene la exigencia.",
        ],
        "Tengo que salir ahora.",
        ["modalidad", "acción"],
        "strong obligation",
        "I have to leave now."
      ),
      c(
        "Deberías para consejo",
        [
          "Deberías suele funcionar como recomendación más que como mandato.",
          "Permite orientar sin imponer tanto.",
        ],
        "Deberías dormir más temprano.",
        ["consejo", "acción"],
        "advice and recommendation",
        "You should sleep earlier."
      ),
      c(
        "Saber / poder para capacidad",
        [
          "Saber + infinitivo suele asociarse a habilidad aprendida; poder también puede expresar capacidad.",
          "No toda capacidad se dice con el mismo verbo.",
        ],
        "Sé tocar la guitarra.",
        ["habilidad", "contenido"],
        "ability",
        "I can play the guitar."
      ),
      c(
        "Quizá / puede que para posibilidad",
        [
          "Estas expresiones bajan el nivel de certeza.",
          "Sirven para hipótesis, conjeturas y prudencia.",
        ],
        "Quizá llegue más tarde.",
        ["posibilidad", "evento"],
        "possibility and probability",
        "He might arrive later."
      ),
      c(
        "Poder / no se puede para permiso",
        [
          "Poder puede marcar permiso; no se puede es una forma común de prohibición general.",
          "La modalidad aquí se conecta con reglas sociales y no solo con habilidad.",
        ],
        "Aquí no se puede fumar.",
        ["prohibición", "acción"],
        "permission and prohibition",
        "You cannot smoke here."
      ),
    ],
  },
  swedish: {
    "Formality & Style": [
      c(
        "Du är normalt tilltal i modern svenska",
        [
          "Modern svenska använder oftast du även i ganska artiga situationer.",
          "Formell distans byggs därför ofta mer med ton än med särskilda pronomen.",
        ],
        "Har du en minut?",
        ["tilltal", "fråga"],
        "modern Swedish uses du as default address",
        "Do you have a minute?"
      ),
      c(
        "Artiga önskemål med skulle du kunna",
        [
          "Skulle du kunna gör en begäran mjukare och mindre direkt.",
          "Det är ett centralt artighetsmönster i vardaglig svenska.",
        ],
        "Skulle du kunna upprepa det?",
        ["förmildring", "begäran"],
        "polite requests with softeners",
        "Could you repeat that?"
      ),
      c(
        "Titlar används i vissa formella sammanhang",
        [
          "Titlar kan förekomma i arbetsliv, service och mycket formella möten.",
          "De är dock inte ett allmänt artighetssystem på samma sätt som i vissa andra språk.",
        ],
        "Doktor Lind, har ni tid nu?",
        ["titel", "fråga"],
        "titles and formal greetings",
        "Doctor Lind, do you have time now?"
      ),
      c(
        "Tack och ursäkta mjukar upp tonen",
        [
          "Artighet i svenska byggs ofta med små ord som tack och ursäkta.",
          "De fungerar som social smörjning snarare än som ren information.",
        ],
        "Ursäkta, kan du hjälpa mig?",
        ["inledning", "begäran"],
        "softening and diplomatic style",
        "Excuse me, can you help me?"
      ),
    ],
    "Discourse & Flow": [
      c(
        "Och / men för tillägg och kontrast",
        [
          "Och lägger till något; men markerar motsats.",
          "Detta är grundläggande för tydlig textbindning.",
        ],
        "Jag läser mycket, men jag skriver lite.",
        ["idé 1", "bindeord", "idé 2"],
        "addition and contrast markers",
        "I read a lot, but I write little."
      ),
      c(
        "Eftersom / därför för orsak och följd",
        [
          "Eftersom anger orsaken; därför anger följden.",
          "När båda används rätt blir resonemanget lättare att följa.",
        ],
        "Jag stannade hemma eftersom det regnade, därför arbetade jag online.",
        ["orsak", "följd"],
        "reason and result markers",
        "I stayed home because it was raining, so I worked online."
      ),
      c(
        "Först / sedan / slutligen ordnar steg",
        [
          "Sådana ord hjälper vid instruktioner och berättelser.",
          "Lyssnaren får en tydlig tidslinje att följa.",
        ],
        "Först läser jag texten, sedan gör jag uppgiften.",
        ["steg 1", "steg 2"],
        "sequencing markers",
        "First I read the text, then I do the task."
      ),
      c(
        "Dessutom och faktiskt styr flödet",
        [
          "Dessutom lägger till; faktiskt kan förstärka eller justera en poäng.",
          "Sådana ord gör talet mer naturligt och styrt.",
        ],
        "Faktiskt är problemet ganska enkelt.",
        ["markör", "påstående"],
        "flow-managing discourse markers",
        "Actually, the problem is quite simple."
      ),
      c(
        "Till exempel och sammanfattningsvis ramar in",
        [
          "Till exempel öppnar ett exempel; sammanfattningsvis signalerar avslutning.",
          "Det hjälper mottagaren att förstå textens större struktur.",
        ],
        "Du kan öva på många sätt, till exempel med dialoger.",
        ["allmänt", "exempel"],
        "examples and conclusions",
        "You can practice in many ways, for example with dialogues."
      ),
    ],
    Modality: [
      c(
        "Måste för nödvändighet",
        [
          "Måste uttrycker tydlig nödvändighet eller stark förpliktelse.",
          "Det är starkare än ett råd.",
        ],
        "Jag måste gå nu.",
        ["modalitet", "handling"],
        "strong obligation",
        "I must go now."
      ),
      c(
        "Bör för råd",
        [
          "Bör används ofta för rekommendationer och normer.",
          "Det låter mindre hårt än måste.",
        ],
        "Du bör sova tidigare.",
        ["råd", "handling"],
        "advice and recommendation",
        "You should go to bed earlier."
      ),
      c(
        "Kan för förmåga",
        [
          "Kan uttrycker förmåga eller praktisk möjlighet.",
          "Kontexten avgör vilken läsning som är starkast.",
        ],
        "Jag kan simma.",
        ["modalitet", "förmåga"],
        "ability",
        "I can swim."
      ),
      c(
        "Kanske och kan för sannolikhet",
        [
          "Kanske och ibland kan markerar osäkerhet eller möjlighet.",
          "De är viktiga när du inte vill låta helt säker.",
        ],
        "Han kanske kommer senare.",
        ["möjlighet", "händelse"],
        "possibility and probability",
        "He might come later."
      ),
      c(
        "Får / får inte för tillåtelse",
        [
          "Får markerar tillåtelse; får inte markerar förbud.",
          "Det används ofta i regler och vardagliga instruktioner.",
        ],
        "Du får inte röka här.",
        ["tillåtelse", "handling"],
        "permission and prohibition",
        "You must not smoke here."
      ),
    ],
  },
};
