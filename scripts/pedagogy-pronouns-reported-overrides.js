const h = (label, text) => ({ label, text });
const m = (wrong, fix) => ({ wrong, fix });
const c = (title, points, example, ruleOrder, sourceTitle, sourceExample, extra = {}) => ({
  title,
  points,
  example,
  ruleOrder,
  sourceTitle,
  sourceExample,
  ...extra,
});

module.exports = {
  arabic: {
    "Pronouns & Reference": [
      c(
        "الضمائر المنفصلة للفاعل",
        [
          "تظهر الضمائر المنفصلة مثل أنا وأنتَ وهو عندما تريد تسمية الفاعل صراحةً.",
          "في العربية يمكن للفعل أن يعبّر عن الفاعل، لكن الضمير المنفصل يفيد التوضيح أو التوكيد.",
        ],
        "أنا أكتب رسالةً.",
        ["الفاعل", "الفعل", "المفعول"],
        "independent subject pronouns",
        "I am writing a letter.",
        { mistakes: [m("أنا يكتب رسالةً.", "أنا أكتب رسالةً.")] }
      ),
      c(
        "الضمائر المتصلة للملكية",
        [
          "الملكية كثيرًا ما تُعبَّر عنها بلاحقة متصلة بالاسم مثل كتابي وكتابك.",
          "اختَر اللاحقة بحسب المالك، لا بحسب الشيء المملوك.",
        ],
        "كتابي جديد.",
        ["الاسم", "ضمير الملكية", "الخبر"],
        "possessive suffixes on nouns",
        "My book is new.",
        { mistakes: [m("كتاب أنا جديد.", "كتابي جديد.")] }
      ),
      c(
        "الضمير المستتر مع الفعل",
        [
          "الفعل المصروف يحمل غالبًا معلومات الشخص والعدد، لذلك قد يُفهم الفاعل من الفعل نفسه.",
          "يظهر الضمير المنفصل عند الحاجة إلى التوكيد أو إزالة اللبس، لا في كل جملة.",
        ],
        "أدرس العربية كلَّ يوم.",
        ["الفعل", "المفعول", "الظرف"],
        "subject pronouns can stay implicit in the verb",
        "I study Arabic every day."
      ),
      c(
        "أسماء الإشارة هذا / هذه / ذلك",
        [
          "تُستخدم أسماء الإشارة للإحالة إلى شيء قريب أو بعيد مع مراعاة الجنس والعدد.",
          "هذا وهذاك ليسا بديلًا عن أدوات تعريف إنجليزية، بل وسيلة للإشارة داخل السياق.",
        ],
        "هذه السيارةُ سريعةٌ.",
        ["اسم الإشارة", "الاسم", "الخبر"],
        "demonstratives for reference",
        "This car is fast."
      ),
      c(
        "ضمائر المفعول المتصلة",
        [
          "يمكن أن يتصل ضمير المفعول بالفعل مثل رأيته أو سمعتها.",
          "هذا النوع يربط الفعل بالمفعول مباشرةً من غير اسم ظاهر.",
        ],
        "رأيته أمس.",
        ["الفعل", "ضمير المفعول", "الظرف"],
        "attached object pronouns",
        "I saw him yesterday."
      ),
      c(
        "ضمائر التوكيد بالنفس",
        [
          "تُستعمل نفس أو بنفسه ونفسي لتوكيد المرجع نفسه لا لإضافة فاعل جديد.",
          "هذا الأسلوب يقوّي المعنى عندما تريد إبراز أن الشخص نفسه قام بالفعل.",
        ],
        "أنا نفسي سأذهب.",
        ["الضمير", "التوكيد", "الفعل"],
        "emphatic self reference",
        "I myself will go."
      ),
      c(
        "أسماء الاستفهام للإحالة المجهولة",
        [
          "أسماء الاستفهام مثل من وماذا وأين تُستعمل عندما يكون المرجع مجهولًا وتريد تحديده بالسؤال.",
          "اختَر اسم الاستفهام بحسب الشخص أو الشيء أو المكان أو السبب.",
        ],
        "من يدرس هنا؟",
        ["اسم الاستفهام", "الفعل", "الظرف"],
        "interrogative pronouns and question words",
        "Who is studying here?"
      ),
    ],
    "Reported Speech": [
      c(
        "الاقتباس المباشر",
        [
          "في الاقتباس المباشر ننقل الكلام كما قيل مع علامتي اقتباس أو بعد نقطتين.",
          "تَبقى صياغة الجملة قريبة من كلام المتكلم الأصلي.",
        ],
        "قال محمد: «أحب القراءة».",
        ["فعل القول", "الاقتباس"],
        "direct quotation with qala",
        "Muhammad said, “I love reading.”"
      ),
      c(
        "القول غير المباشر مع إنَّ",
        [
          "عند نقل خبر أو تصريح نستعمل كثيرًا قال إنَّ ... أو ذكر أنَّ ....",
          "لا تحتاج الجملة هنا إلى علامات اقتباس لأننا ننقل المعنى لا اللفظ الحرفي.",
        ],
        "قال محمد إنه يحب القراءة.",
        ["فعل القول", "أداة الربط", "الجملة المنقولة"],
        "reported statements with inna",
        "Muhammad said that he likes reading."
      ),
      c(
        "نقل الأسئلة",
        [
          "السؤال المنقول قد يأتي مع هل في أسئلة نعم/لا أو مع اسم الاستفهام نفسه.",
          "لا توجد قاعدة واحدة تلزم تحويل كل سؤال إلى زمن ماضٍ.",
        ],
        "سألته هل سيأتي.",
        ["فعل السؤال", "أداة السؤال", "الجملة"],
        "reported questions",
        "I asked him whether he would come."
      ),
      c(
        "تبديل الضمائر بحسب منظور الراوي",
        [
          "عند النقل تتغير الضمائر حتى تطابق منظور المتكلم الجديد والسياق الحالي.",
          "المهم هو المرجع المقصود، لا المحافظة الآلية على الضمير الأصلي.",
        ],
        "قالت فاطمة إنها متعبة.",
        ["فعل القول", "الضمير الجديد", "الخبر"],
        "pronoun shift in reported speech",
        "Fatima said that she was tired."
      ),
      c(
        "الزمن يتبع المعنى لا قاعدة رجوع آلية",
        [
          "في العربية نختار الزمن الذي يحفظ المعنى المقصود في وقت النقل.",
          "ليست هناك قاعدة إنجليزية ثابتة تُرجِع كل حاضر إلى ماضٍ داخل الكلام المنقول.",
        ],
        "قال أحمد إنه سيسافر غدًا.",
        ["فعل القول", "أداة الربط", "الحدث المنقول"],
        "tense follows meaning in reported speech",
        "Ahmad said that he will travel tomorrow."
      ),
      c(
        "نقل الطلب أو الأمر",
        [
          "عند نقل طلب أو أمر تستعمل أفعالًا مثل طلب أو أمر أو نصح مع أنْ أو مصدر مناسب.",
          "صيغة النقل تتبع معنى الطلب نفسه لا شكل الأمر الأصلي فقط.",
        ],
        "طلب مني الأستاذ أن أكتب الإجابة.",
        ["فعل الطلب", "المفعول", "الفعل المنقول"],
        "reported requests and commands",
        "The teacher asked me to write the answer."
      ),
    ],
  },
  chinese: {
    "Pronouns & Reference": [
      c(
        "人称代词",
        [
          "我、你、他、她、它用来指说话者、听话者和第三方。",
          "先看说话关系，再决定用哪一个人称形式。",
        ],
        "我喜欢这本书。",
        ["主语", "动词", "宾语"],
        "personal pronouns",
        "I like this book.",
        {
          exampleHighlights: [h("主语", "我"), h("动词", "喜欢"), h("宾语", "这本书")],
        }
      ),
      c(
        "指示代词 这 / 那",
        [
          "这、那、这个、那个用来指近处或远处的人和事物。",
          "它们可以单独出现，也可以和名词搭配使用。",
        ],
        "那个是我的朋友。",
        ["指示", "判断", "补足"],
        "demonstratives that stand alone",
        "That one is my friend.",
        {
          exampleHighlights: [h("指示", "那个"), h("判断", "是"), h("补足", "我的朋友")],
        }
      ),
      c(
        "主语按语境省略",
        [
          "在对话里，如果主语已经很清楚，汉语常常把它省掉。",
          "省略来自语境，不是任何句子都能随便去掉主语。",
        ],
        "吃了吗？",
        ["动作", "语气"],
        "subject omission in context",
        "Have you eaten?",
        {
          exampleHighlights: [h("动作", "吃了"), h("语气", "吗")],
        }
      ),
      c(
        "礼貌称呼 您",
        [
          "您是对长辈、顾客或正式对象的礼貌说法。",
          "普通对话多用你，礼貌距离更大时才用您。",
        ],
        "您要喝水吗？",
        ["称呼", "动作", "语气"],
        "polite second-person pronoun",
        "Would you like some water?",
        {
          exampleHighlights: [h("称呼", "您"), h("动作", "要喝水"), h("语气", "吗")],
        }
      ),
      c(
        "反身用法 自己",
        [
          "自己表示动作回到同一个人身上，或强调“本人”。",
          "它常跟前面的主语保持同一指向。",
        ],
        "他自己做的。",
        ["主语", "强调", "动作"],
        "reflexive self with ziji",
        "He made it himself.",
        {
          exampleHighlights: [h("主语", "他"), h("强调", "自己"), h("动作", "做的")],
        }
      ),
      c(
        "泛指代词: 有人 / 大家 / 别人",
        [
          "有人、大家、别人这类形式表示不具体或泛指的人群。",
          "它们不是普通疑问词，而是直接给出一种不特定的指称。",
        ],
        "有人在门口等你。",
        ["指称", "地点", "动作"],
        "indefinite reference words",
        "Someone is waiting for you at the door.",
        {
          exampleHighlights: [h("指称", "有人"), h("地点", "在门口"), h("动作", "等你")],
        }
      ),
      c(
        "“们”构成复数代词",
        [
          "我们、你们、他们里的“们”最常见于人称代词和表示人的名词。",
          "它不是给所有名词都随便加的复数词尾。",
        ],
        "我们明天见。",
        ["主语", "时间", "动作"],
        "men for plural pronouns",
        "We will meet tomorrow.",
        {
          exampleHighlights: [h("主语", "我们"), h("时间", "明天"), h("动作", "见")],
        }
      ),
    ],
    "Reported Speech": [
      c(
        "直接引语用引号",
        [
          "直接引语保留原话，通常和说、问等动词一起出现。",
          "引号帮助读者分清原话和叙述部分。",
        ],
        "她说：“我明天去商店。”",
        ["引述", "原话"],
        "direct quotation with quotation marks",
        "She said, “I am going to the store tomorrow.”",
        {
          exampleHighlights: [h("引述", "她说"), h("原话", "“我明天去商店”")],
        }
      ),
      c(
        "间接转述常接在 说 后面",
        [
          "转述内容时，汉语常直接把句子放在说后面，不必强求英语里的 that。",
          "重点是把意思说清楚，而不是机械复制外语结构。",
        ],
        "她说明天去商店。",
        ["引述", "时间", "动作"],
        "reported statements after shuo",
        "She said that she is going to the store tomorrow.",
        {
          exampleHighlights: [h("引述", "她说"), h("时间", "明天"), h("动作", "去商店")],
        }
      ),
      c(
        "告诉 要带听话人",
        [
          "告诉后面通常要出现被告知的人，比如告诉我、告诉老师。",
          "说重在“说了什么”，告诉还强调“告诉了谁”。",
        ],
        "他告诉我他会迟到。",
        ["说话人", "听话人", "内容"],
        "gaosu takes a listener object",
        "He told me that he would be late.",
        {
          exampleHighlights: [h("说话人", "他"), h("听话人", "告诉我"), h("内容", "他会迟到")],
        }
      ),
      c(
        "转述一般疑问句",
        [
          "转述是非问句时，常用会不会、是不是、要不要、是否等形式。",
          "汉语不靠时态回退来表示转述关系。",
        ],
        "她问我明天会不会下雨。",
        ["提问", "时间", "疑问内容"],
        "reported yes-no questions",
        "She asked me whether it would rain tomorrow.",
        {
          exampleHighlights: [h("提问", "她问我"), h("时间", "明天"), h("疑问内容", "会不会下雨")],
        }
      ),
      c(
        "转述特殊疑问句保留疑问词",
        [
          "为什么、哪里、谁等疑问词在转述中通常会保留下来。",
          "和英语不同，形式变化较少，主要看语境和句法位置。",
        ],
        "老师问我为什么迟到。",
        ["提问者", "对象", "疑问词"],
        "reported wh-questions keep the question word",
        "The teacher asked me why I was late.",
        {
          exampleHighlights: [h("提问者", "老师"), h("对象", "问我"), h("疑问词", "为什么迟到")],
        }
      ),
      c(
        "人称和时间按语境调整",
        [
          "转述时，今天、这里、我这类词要按新的说话视角调整。",
          "汉语没有英语式的强制时态回退，主要看时间意义是否变化。",
        ],
        "她说那天不能来。",
        ["引述", "时间", "内容"],
        "reference words shift by context, not tense backshift",
        "She said that she could not come that day.",
        {
          exampleHighlights: [h("引述", "她说"), h("时间", "那天"), h("内容", "不能来")],
        }
      ),
    ],
  },
  dutch: {
    "Pronouns & Reference": [
      c(
        "Persoonlijke voornaamwoorden",
        [
          "Persoonlijke voornaamwoorden verwijzen naar spreker, luisteraar of iemand anders in de zin.",
          "In het Nederlands laat je het onderwerp in gewone mededelende zinnen meestal niet weg.",
        ],
        "Ik zie hem in het park.",
        ["onderwerp", "werkwoord", "voornaamwoord", "plaats"],
        "personal pronouns for reference",
        "I see him in the park."
      ),
      c(
        "Bezittelijke voornaamwoorden",
        [
          "Mijn, jouw, zijn en haar drukken bezit of relatie uit.",
          "Ze staan vaak voor een zelfstandig naamwoord, maar sommige vormen kunnen ook zelfstandig staan.",
        ],
        "Dit is mijn boek.",
        ["aanwijzing", "werkwoord", "bezit"],
        "possessive pronouns and determiners",
        "This is my book."
      ),
      c(
        "Aanwijzende voornaamwoorden",
        [
          "Die, dat, deze en dit helpen je om iets in de context aan te wijzen.",
          "Kies de vorm op basis van afstand en soms ook het grammaticale woordgeslacht.",
        ],
        "Die is van mijn zus.",
        ["aanwijzing", "werkwoord", "aanvulling"],
        "demonstrative pronouns for reference",
        "That one belongs to my sister."
      ),
      c(
        "Wederkerende voornaamwoorden",
        [
          "Zich, me en je verwijzen terug naar hetzelfde onderwerp.",
          "Ze zijn nodig bij veel wederkerende werkwoorden zoals zich wassen en zich herinneren.",
        ],
        "Hij wast zich elke ochtend.",
        ["onderwerp", "werkwoord", "wederkerend", "tijd"],
        "reflexive pronouns",
        "He washes himself every morning."
      ),
      c(
        "Onbepaalde voornaamwoorden",
        [
          "Iemand, niemand, iets en niets verwijzen naar een niet nader gespecificeerd persoon of ding.",
          "Ze zijn nuttig wanneer de precieze identiteit niet belangrijk of onbekend is.",
        ],
        "Iemand belt aan.",
        ["voornaamwoord", "werkwoord"],
        "indefinite pronouns",
        "Someone is ringing the doorbell."
      ),
      c(
        "Verwijswoord er",
        [
          "Er verwijst vaak terug naar een eerder genoemd ding of combineert met een voorzetsel: eraan, erover, ermee.",
          "Dit woord is typisch Nederlands en belangrijk voor natuurlijk klinkende zinnen.",
        ],
        "Ik denk er vaak aan.",
        ["onderwerp", "werkwoord", "verwijswoord", "voorzetsel"],
        "reference word er",
        "I often think about it.",
        { mistakes: [m("Ik denk vaak aan het.", "Ik denk er vaak aan.")] }
      ),
      c(
        "Formele en informele aanspreekvormen",
        [
          "Je en jij gebruik je informeel; u is formeler en schept meer afstand.",
          "De keuze hangt af van relatie, leeftijd, situatie en toon.",
        ],
        "Kunt u mij helpen?",
        ["werkwoord", "formeel voornaamwoord", "rest"],
        "formal and informal address pronouns",
        "Can you help me?"
      ),
    ],
    "Reported Speech": [
      c(
        "Direct citaat",
        [
          "Bij een direct citaat geef je de woorden weer zoals iemand ze zei.",
          "Aanhalingstekens of een dubbele punt maken het citaat zichtbaar.",
        ],
        "Hij zei: 'Ik ga naar de winkel.'",
        ["inleiding", "citaat"],
        "direct quotation",
        "He said, 'I am going to the store.'"
      ),
      c(
        "Indirecte mededeling met dat",
        [
          "In een indirecte mededeling gebruik je vaak dat om de bijzin in te leiden.",
          "Je rapporteert dan de inhoud, niet de exacte woorden.",
        ],
        "Hij zei dat hij naar de winkel ging.",
        ["hoofdzin", "voegwoord", "bijzin"],
        "reported statements with dat",
        "He said that he was going to the store."
      ),
      c(
        "Indirecte ja/nee-vraag met of",
        [
          "Voor gerapporteerde ja/nee-vragen gebruik je meestal of.",
          "De woordvolgorde wordt die van een bijzin, niet van een directe vraag.",
        ],
        "Ze vroeg of ik meekwam.",
        ["hoofdzin", "vraaginleider", "bijzin"],
        "reported yes-no questions with of",
        "She asked whether I was coming along."
      ),
      c(
        "Indirecte vraag met vraagwoord",
        [
          "Bij wie-, waar-, waarom- en hoe-vragen blijft het vraagwoord meestal staan.",
          "Ook hier volgt daarna de gewone bijzinsvolgorde.",
        ],
        "Hij vroeg waar ik woonde.",
        ["hoofdzin", "vraagwoord", "bijzin"],
        "reported wh-questions",
        "He asked where I lived."
      ),
      c(
        "Voornaamwoorden en tijdswoorden verschuiven met de context",
        [
          "Woorden als ik, hier, vandaag en morgen moeten passen bij het nieuwe vertelperspectief.",
          "Er is geen verplichte Engelse backshiftregel; de tijd volgt de bedoelde betekenis.",
        ],
        "Ze zei dat ze die dag thuiswerkte.",
        ["hoofdzin", "voegwoord", "bijzin"],
        "reference words shift with context in reported speech",
        "She said that she was working from home that day."
      ),
      c(
        "Verzoek of bevel rapporteren",
        [
          "Voor een gerapporteerd verzoek gebruik je vaak vragen om te + infinitief.",
          "Bij bevelen kies je een werkwoord dat de bedoeling van het spreken weergeeft.",
        ],
        "Hij vroeg me om te wachten.",
        ["hoofdzin", "ontvanger", "doel"],
        "reported requests and commands",
        "He asked me to wait."
      ),
    ],
  },
  french: {
    "Pronouns & Reference": [
      c(
        "Pronoms sujets",
        [
          "En français standard, le pronom sujet accompagne normalement le verbe conjugué.",
          "On ne l'efface pas comme dans des langues où le sujet peut rester implicite.",
        ],
        "Je mange une pomme.",
        ["sujet", "verbe", "complément"],
        "subject pronouns before a finite verb",
        "I am eating an apple.",
        { mistakes: [m("Mange une pomme.", "Je mange une pomme.")] }
      ),
      c(
        "Pronoms objets directs",
        [
          "Les pronoms me, te, le, la, nous, vous, les remplacent un complément direct.",
          "Ils se placent avant le verbe conjugué dans les phrases simples.",
        ],
        "Je le vois.",
        ["sujet", "pronom", "verbe"],
        "direct object pronouns",
        "I see him."
      ),
      c(
        "Pronoms objets indirects",
        [
          "Lui et leur remplacent souvent un complément introduit par à pour une personne.",
          "L'ordre des pronoms avant le verbe est un point clé de la phrase française.",
        ],
        "Je lui parle.",
        ["sujet", "pronom", "verbe"],
        "indirect object pronouns",
        "I am talking to him."
      ),
      c(
        "Pronoms réfléchis",
        [
          "Me, te, se, nous, vous marquent que l'action revient vers le sujet.",
          "Ils sont fréquents avec les verbes pronominaux comme se laver ou se souvenir.",
        ],
        "Elle se lave.",
        ["sujet", "pronom", "verbe"],
        "reflexive pronouns",
        "She is washing herself."
      ),
      c(
        "Pronoms relatifs : qui / que",
        [
          "Qui et que relient un nom à une proposition relative.",
          "Le choix dépend du rôle joué dans la relative: sujet avec qui, objet avec que.",
        ],
        "La fille qui chante est talentueuse.",
        ["groupe nominal", "relatif", "suite"],
        "relative pronouns qui and que",
        "The girl who is singing is talented."
      ),
      c(
        "Pronoms démonstratifs : celui / celle",
        [
          "Celui, celle, ceux et celles remplacent un nom déjà connu du contexte.",
          "Ce ne sont pas des déterminants comme ce livre, mais de vrais pronoms.",
        ],
        "Celle-ci est plus rapide.",
        ["pronom", "verbe", "comparaison"],
        "demonstrative pronouns celui and celle",
        "This one is faster."
      ),
      c(
        "Tu / vous et la politesse",
        [
          "Tu s'emploie avec la proximité ou l'informel; vous marque la distance, le respect ou le pluriel.",
          "Le choix du pronom change la relation sociale, pas seulement la grammaire.",
        ],
        "Vous êtes très aimable.",
        ["pronom", "verbe", "attribut"],
        "tu and vous for politeness",
        "You are very kind."
      ),
    ],
    "Reported Speech": [
      c(
        "Discours direct avec guillemets",
        [
          "Le discours direct reprend les paroles exactes du locuteur.",
          "Les guillemets ou les deux-points signalent clairement la citation.",
        ],
        "Il a dit : « Je viens demain. »",
        ["verbe introducteur", "citation"],
        "direct quotation with guillemets",
        "He said, “I am coming tomorrow.”"
      ),
      c(
        "Discours indirect avec que",
        [
          "On emploie souvent que après un verbe de parole pour rapporter une déclaration.",
          "Le but est de transmettre le contenu, pas de garder les mots exacts.",
        ],
        "Il dit qu'il vient demain.",
        ["verbe introducteur", "que", "proposition"],
        "reported statements with que",
        "He says that he is coming tomorrow."
      ),
      c(
        "Concordance des temps après un verbe au passé",
        [
          "Après un verbe introducteur au passé, le français ajuste souvent le temps pour garder le bon repérage.",
          "On change aussi souvent des mots comme demain en le lendemain selon le point de vue.",
        ],
        "Il a dit qu'il viendrait le lendemain.",
        ["verbe introducteur", "que", "proposition"],
        "sequence of tense after a past reporting verb",
        "He said that he would come the next day."
      ),
      c(
        "Questions indirectes avec si",
        [
          "Pour rapporter une question oui/non, on emploie si et non pas l'ordre interrogatif direct.",
          "La phrase rapportée reprend ensuite l'ordre d'une proposition subordonnée.",
        ],
        "Elle demande si tu viens.",
        ["verbe introducteur", "si", "proposition"],
        "reported yes-no questions with si",
        "She is asking whether you are coming."
      ),
      c(
        "Questions indirectes avec mot interrogatif",
        [
          "Quand la question porte sur où, quand, pourquoi, comment, le mot interrogatif reste en tête de la subordonnée.",
          "Le verbe suit alors l'ordre normal d'une subordonnée, sans inversion.",
        ],
        "Il a demandé où Marie habitait.",
        ["verbe introducteur", "mot interrogatif", "proposition"],
        "reported wh-questions",
        "He asked where Marie lived."
      ),
      c(
        "Ordres et conseils avec de + infinitif",
        [
          "Pour rapporter un ordre, un conseil ou une consigne, on emploie souvent de + infinitif.",
          "La structure change parce qu'on ne garde pas l'impératif tel quel.",
        ],
        "Il m'a dit de fermer la porte.",
        ["verbe introducteur", "destinataire", "infinitif"],
        "reported orders with de plus infinitive",
        "He told me to close the door."
      ),
    ],
  },
  german: {
    "Pronouns & Reference": [
      c(
        "Personalpronomen im Nominativ",
        [
          "Ich, du, er, sie, es, wir und ihr stehen als Subjektformen im Nominativ.",
          "In normalen Aussagesätzen bleibt das Subjekt im Deutschen sichtbar.",
        ],
        "Ich komme heute.",
        ["Subjekt", "Verb", "Zeit"],
        "subject pronouns in the nominative",
        "I am coming today.",
        { mistakes: [m("Komme heute.", "Ich komme heute.")] }
      ),
      c(
        "Personalpronomen im Akkusativ",
        [
          "Mich, dich, ihn, sie, es, uns und euch benutzt man als direkte Objekte.",
          "Der Kasus zeigt im Deutschen die Satzfunktion deutlich an.",
        ],
        "Ich sehe ihn.",
        ["Subjekt", "Verb", "Objekt"],
        "direct object pronouns in the accusative",
        "I see him."
      ),
      c(
        "Personalpronomen im Dativ",
        [
          "Mir, dir, ihm, ihr und ihnen stehen oft bei indirekten Objekten.",
          "Viele Verben und feste Wendungen verlangen im Deutschen gerade den Dativ.",
        ],
        "Ich gebe ihm das Buch.",
        ["Subjekt", "Verb", "Empfänger", "Objekt"],
        "indirect object pronouns in the dative",
        "I am giving him the book."
      ),
      c(
        "Reflexivpronomen",
        [
          "Sich, mich, dich und uns verweisen auf dasselbe Subjekt zurück.",
          "Sie gehören zu vielen reflexiven Verben wie sich waschen oder sich freuen.",
        ],
        "Ich wasche mich.",
        ["Subjekt", "Verb", "Reflexiv"],
        "reflexive pronouns",
        "I am washing myself."
      ),
      c(
        "Demonstrativpronomen",
        [
          "Dieser, diese, dieses oder der da heben eine Referenz besonders hervor.",
          "Sie klingen kontrastreicher als ein bloßes Personalpronomen.",
        ],
        "Dieser hier ist günstiger.",
        ["Demonstrativ", "Adverb", "Vergleich"],
        "demonstrative pronouns for contrast",
        "This one here is cheaper."
      ),
      c(
        "Indefinitpronomen",
        [
          "Jemand, niemand, etwas und nichts verweisen unbestimmt auf Personen oder Dinge.",
          "Sie sind nützlich, wenn die genaue Identität unbekannt oder unwichtig ist.",
        ],
        "Jemand hat angerufen.",
        ["Pronomen", "Verb"],
        "indefinite pronouns",
        "Someone called."
      ),
      c(
        "Possessivpronomen und -artikel",
        [
          "Mein, dein, sein und ihr zeigen Besitz oder Zugehörigkeit an.",
          "Je nach Gebrauch verhalten sie sich wie Begleiter oder stehen selbstständig für ein Nomen.",
        ],
        "Das ist mein Auto.",
        ["Einleitung", "Verb", "Besitz"],
        "possessive reference with mein and dein",
        "That is my car."
      ),
    ],
    "Reported Speech": [
      c(
        "Direktes Zitat",
        [
          "Ein direktes Zitat gibt die Worte einer Person wörtlich wieder.",
          "Anführungszeichen und ein Einleitungssatz markieren die Grenze deutlich.",
        ],
        "Er sagte: „Ich komme morgen.“",
        ["Einleitung", "Zitat"],
        "direct quotation",
        "He said, “I am coming tomorrow.”"
      ),
      c(
        "Indirekte Aussage mit dass",
        [
          "Im Alltag wird Gesagtes oft mit dass als Nebensatz wiedergegeben.",
          "Die Zeit richtet sich nach der gemeinten Bedeutung, nicht nach einer starren englischen Backshift-Regel.",
        ],
        "Er sagte, dass er morgen kommt.",
        ["Hauptsatz", "dass", "Nebensatz"],
        "reported statements with dass",
        "He said that he is coming tomorrow."
      ),
      c(
        "Konjunktiv I in der indirekten Rede",
        [
          "Konjunktiv I schafft Distanz zum Gesagten und ist typisch für Berichte und Nachrichtenstil.",
          "Er signalisiert: Das ist die Aussage einer anderen Person, nicht unbedingt die des Erzählers.",
        ],
        "Die Sprecherin sagte, sie sei bereit.",
        ["Einleitung", "Subjekt", "Konjunktiv"],
        "konjunktiv i in reported speech",
        "The speaker said that she was ready."
      ),
      c(
        "Indirekte Ja/Nein-Fragen mit ob",
        [
          "Für berichtete Ja/Nein-Fragen verwendet man ob.",
          "Danach steht der Nebensatz mit Verb am Ende.",
        ],
        "Er fragte, ob ich Zeit habe.",
        ["Einleitung", "ob", "Nebensatz"],
        "reported yes-no questions with ob",
        "He asked whether I have time."
      ),
      c(
        "Indirekte Fragen mit Fragewort",
        [
          "Warum, wann, wo und wie bleiben als Fragewörter in der indirekten Frage stehen.",
          "Im gehobenen Stil kann dabei ebenfalls Konjunktiv erscheinen.",
        ],
        "Sie fragte, warum er zu spät sei.",
        ["Einleitung", "Fragewort", "Nebensatz"],
        "reported wh-questions",
        "She asked why he was late."
      ),
      c(
        "Bitten und Aufforderungen berichten",
        [
          "Für berichtete Bitten und Aufforderungen benutzt man oft bitten, auffordern oder sagen mit zu + Infinitiv.",
          "So wird die Funktion des Originals ausgedrückt, ohne den Imperativ direkt zu wiederholen.",
        ],
        "Er bat mich, zu warten.",
        ["Einleitung", "Empfänger", "Infinitiv"],
        "reported requests and commands",
        "He asked me to wait."
      ),
    ],
  },
  hindi: {
    "Pronouns & Reference": [
      c(
        "व्यक्तिगत सर्वनाम",
        [
          "मैं, हम, तुम, वह जैसे सर्वनाम बोलने वाले, सुनने वाले और तीसरे व्यक्ति की ओर संकेत करते हैं।",
          "सर्वनाम चुनते समय व्यक्ति, वचन और संदर्भ तीनों देखे जाते हैं।",
        ],
        "मैं स्कूल जा रहा हूँ।",
        ["कर्ता", "स्थान", "क्रिया"],
        "personal pronouns",
        "I am going to school."
      ),
      c(
        "तू / तुम / आप से आदर का स्तर",
        [
          "हिंदी में दूसरे व्यक्ति के सर्वनाम से सम्मान और निकटता दोनों व्यक्त होते हैं।",
          "आप औपचारिक या आदरसूचक है, तुम सामान्य है, और तू बहुत घनिष्ठ या बहुत नीचा दर्जा दिखा सकता है।",
        ],
        "आप कैसे हैं?",
        ["सर्वनाम", "प्रश्न", "क्रिया"],
        "honorific levels in second-person pronouns",
        "How are you?"
      ),
      c(
        "संकेतवाचक सर्वनाम: यह / वह",
        [
          "यह और वह निकटता या दूरी के आधार पर किसी व्यक्ति या वस्तु की ओर संकेत करते हैं।",
          "यही रूप कई बार तीसरे व्यक्ति के अर्थ में भी काम करते हैं।",
        ],
        "यह मेरी किताब है।",
        ["संकेत", "संबंध", "संज्ञा", "क्रिया"],
        "demonstrative pronouns this and that",
        "This is my book."
      ),
      c(
        "संबंधवाचक जो ... वह",
        [
          "जो ... वह संरचना हिंदी में किसी पहचाने हुए संदर्भ को जोड़ने का बहुत सामान्य तरीका है।",
          "पहले संबंधवाचक भाग आता है, फिर उसके अनुरूप मुख्य भाग आता है।",
        ],
        "जो लड़का खड़ा है, वह मेरा भाई है।",
        ["संबंधवाचक भाग", "मुख्य भाग"],
        "relative-correlative jo ... vo",
        "The boy who is standing is my brother."
      ),
      c(
        "अनिश्चित सर्वनाम: कोई / कुछ",
        [
          "कोई, कुछ, किसी आदि ऐसे संदर्भ देते हैं जिनकी पहचान निश्चित नहीं है।",
          "वे प्रश्नवाचक शब्दों से अलग हैं क्योंकि वे केवल पूछते नहीं, बल्कि अनिश्चित उल्लेख भी करते हैं।",
        ],
        "कोई दरवाज़े पर है।",
        ["अनिश्चित संदर्भ", "स्थान", "क्रिया"],
        "indefinite pronouns",
        "Someone is at the door."
      ),
      c(
        "अपना / खुद से आत्म-संदर्भ",
        [
          "अपना अक्सर कर्ता की ओर लौटता है और स्वामित्व को उसी से जोड़ता है।",
          "खुद या स्वयं से यह भी दिखाया जा सकता है कि काम उसी व्यक्ति ने किया।",
        ],
        "सीमा अपना बैग लाई।",
        ["कर्ता", "संबंध", "संज्ञा", "क्रिया"],
        "self reference with apna and khud",
        "Seema brought her own bag."
      ),
      c(
        "संदर्भ से सर्वनाम का लोप",
        [
          "हिंदी में जब कर्ता संदर्भ से साफ हो, तो सर्वनाम छोड़ देना स्वाभाविक हो सकता है।",
          "लोप तभी करें जब अर्थ बिना भ्रम के समझ में आ रहा हो।",
        ],
        "आ रहा हूँ।",
        ["क्रिया-समूह", "संदर्भ"],
        "pronouns can be dropped from context",
        "I am coming."
      ),
    ],
    "Reported Speech": [
      c(
        "प्रत्यक्ष कथन",
        [
          "प्रत्यक्ष कथन में बोलने वाले के शब्द उसी रूप में उद्धृत किए जाते हैं।",
          "उद्धरण चिह्न यह दिखाते हैं कि अगला भाग मूल कथन है।",
        ],
        "राज ने कहा, \"मैं स्कूल जा रहा हूँ।\"",
        ["कथन-आरंभ", "मूल वाक्य"],
        "direct speech with quotation marks",
        "Raj said, “I am going to school.”"
      ),
      c(
        "अप्रत्यक्ष कथन में कि",
        [
          "किसी कथन को अप्रत्यक्ष रूप में बताने के लिए हिंदी में अक्सर कि आता है।",
          "यहाँ हम ठीक-ठीक शब्द नहीं, बल्कि कथन की सूचना दे रहे होते हैं।",
        ],
        "राज ने कहा कि वह स्कूल जा रहा है।",
        ["कथन-आरंभ", "कि", "रिपोर्टेड भाग"],
        "reported statements with ki",
        "Raj said that he was going to school."
      ),
      c(
        "हाँ/ना प्रश्न का प्रतिवेदन",
        [
          "हाँ/ना प्रकार के प्रश्न को रिपोर्ट करते समय क्या जैसी संरचना उपयोगी होती है।",
          "सीधे प्रश्नचिह्न की जगह आश्रित वाक्य बनता है।",
        ],
        "उसने पूछा कि क्या मैं तैयार हूँ।",
        ["प्रश्न-आरंभ", "क्या", "रिपोर्टेड भाग"],
        "reported yes-no questions",
        "He asked whether I was ready."
      ),
      c(
        "प्रश्नवाचक शब्द वाले प्रश्न",
        [
          "कहाँ, क्यों, कब, कैसे जैसे प्रश्नवाचक शब्द रिपोर्टेड वाक्य में बने रहते हैं।",
          "रचना प्रश्न जैसी लग सकती है, लेकिन पूरा वाक्य अब आश्रित होता है।",
        ],
        "उसने पूछा कि मैं कहाँ जा रहा था।",
        ["प्रश्न-आरंभ", "कि", "प्रश्नवाचक भाग"],
        "reported wh-questions",
        "He asked where I was going."
      ),
      c(
        "काल अर्थ और संदर्भ से तय होता है",
        [
          "हिंदी में रिपोर्टेड स्पीच के भीतर काल का चुनाव अर्थ, समय और संदर्भ से तय होता है।",
          "हर वर्त्तमान रूप को अपने-आप भूतकाल में बदलना सही नियम नहीं है।",
        ],
        "रीमा ने कहा कि वह कल आएगी।",
        ["कथन-आरंभ", "कि", "भविष्य अर्थ"],
        "tense follows meaning in reported speech",
        "Reema said that she would come tomorrow."
      ),
      c(
        "आदेश और अनुरोध का प्रतिवेदन",
        [
          "आदेश या अनुरोध को बैठने को कहा, जाने के लिए कहा जैसी संरचनाओं से बताया जाता है।",
          "यहाँ रिपोर्टेड भाग अक्सर infinitive-जैसी क्रिया-संरचना में आता है।",
        ],
        "शिक्षक ने मुझे बैठने को कहा।",
        ["आदेश-आरंभ", "प्राप्तकर्ता", "क्रिया"],
        "reported requests and commands",
        "The teacher told me to sit down."
      ),
    ],
  },
  japanese: {
    "Pronouns & Reference": [
      c(
        "人称代名詞は場面で選ぶ",
        [
          "私、僕、俺などは話し手の立場や場面によって選び方が変わります。",
          "英語の I のようにいつも同じ形を使うわけではありません。",
        ],
        "私は学生です。",
        ["話し手", "名詞", "丁寧さ"],
        "personal pronouns depend on situation",
        "I am a student.",
        {
          exampleHighlights: [h("話し手", "私"), h("名詞", "学生"), h("丁寧さ", "です")],
        }
      ),
      c(
        "主語は文脈で省略する",
        [
          "日本語では主語や目的語が文脈から分かるとき、言わないほうが自然なことがあります。",
          "省略できるのは意味が共有されているときだけです。",
        ],
        "もう食べました。",
        ["副詞", "述語"],
        "subjects can be omitted from context",
        "I have already eaten.",
        {
          exampleHighlights: [h("副詞", "もう"), h("述語", "食べました")],
        }
      ),
      c(
        "こそあど言葉で指す",
        [
          "これ・それ・あれ・どれは距離や共有知識に応じて使い分けます。",
          "この・その・あのは名詞の前に置き、これ・それ・あれは単独で使えます。",
        ],
        "これは本です。",
        ["指示", "名詞", "丁寧さ"],
        "ko-so-a-do demonstratives",
        "This is a book.",
        {
          exampleHighlights: [h("指示", "これ"), h("名詞", "本"), h("丁寧さ", "です")],
        }
      ),
      c(
        "相手には名前や肩書きを使うことが多い",
        [
          "日本語ではあなたを多用するより、名前や先生・部長などの肩書きで呼ぶほうが自然です。",
          "呼び方そのものが人間関係や丁寧さを表します。",
        ],
        "田中さんはもう帰りましたか。",
        ["呼びかけ", "副詞", "述語"],
        "names and titles are often more natural than anata",
        "Has Tanaka already gone home?",
        {
          exampleHighlights: [h("呼びかけ", "田中さん"), h("副詞", "もう"), h("述語", "帰りましたか")],
        }
      ),
      c(
        "自分で自分を指す",
        [
          "自分は文脈によって主語に戻る再帰的な表現として使われます。",
          "誰を指すかは会話の流れで判断する必要があります。",
        ],
        "彼は自分で決めた。",
        ["主題", "自己参照", "述語"],
        "self reference with jibun",
        "He decided for himself.",
        {
          exampleHighlights: [h("主題", "彼は"), h("自己参照", "自分で"), h("述語", "決めた")],
        }
      ),
      c(
        "複数は たち / ら を必要なときだけ使う",
        [
          "私たち、彼らのような複数形はありますが、英語ほど頻繁には出ません。",
          "人数や集合性をはっきり示したいときに使うと自然です。",
        ],
        "私たちは学生です。",
        ["話し手たち", "名詞", "丁寧さ"],
        "plural pronouns with tachi and ra",
        "We are students.",
        {
          exampleHighlights: [h("話し手たち", "私たちは"), h("名詞", "学生"), h("丁寧さ", "です")],
        }
      ),
      c(
        "彼 / 彼女 より名詞が自然なことが多い",
        [
          "会話では彼・彼女よりも人名や役割名を繰り返すほうが自然なことが多いです。",
          "代名詞の使いすぎは翻訳調に聞こえることがあります。",
        ],
        "山田さんは明日来ます。",
        ["人物", "時間", "述語"],
        "names are often more natural than kare or kanojo",
        "Yamada is coming tomorrow.",
        {
          exampleHighlights: [h("人物", "山田さんは"), h("時間", "明日"), h("述語", "来ます")],
        }
      ),
    ],
    "Reported Speech": [
      c(
        "直接引用は「」で囲む",
        [
          "直接引用では元の発話を「」でそのまま示します。",
          "引用の後ろにと言う・と聞くなどの動詞が続きます。",
        ],
        "彼は「明日行きます」と言いました。",
        ["話者", "引用", "伝達"],
        "direct quotation with Japanese quotation marks",
        "He said, “I will go tomorrow.”",
        {
          exampleHighlights: [h("話者", "彼は"), h("引用", "「明日行きます」"), h("伝達", "と言いました")],
        }
      ),
      c(
        "普通形 + と言う",
        [
          "内容を間接的に伝えるときは普通形の文に と言う を続ける形が基本です。",
          "英語の that のような別の接続語を足さないのが自然です。",
        ],
        "彼は明日行くと言いました。",
        ["話者", "内容", "伝達"],
        "reported statements with to iu",
        "He said that he would go tomorrow.",
        {
          exampleHighlights: [h("話者", "彼は"), h("内容", "明日行く"), h("伝達", "と言いました")],
        }
      ),
      c(
        "伝聞の そうだ",
        [
          "人づてに聞いた情報を伝えるときは そうだ がよく使われます。",
          "自分で確認した事実ではなく、聞いた内容として示せます。",
        ],
        "田中さんは明日来るそうです。",
        ["人物", "内容", "伝聞"],
        "hearsay with so da",
        "I heard that Tanaka is coming tomorrow.",
        {
          exampleHighlights: [h("人物", "田中さんは"), h("内容", "明日来る"), h("伝聞", "そうです")],
        }
      ),
      c(
        "依頼や指示は 〜ように言う",
        [
          "依頼や指示を報告するときは ように言う がよく使われます。",
          "命令形をそのまま残すより、日本語らしい報告の形になります。",
        ],
        "先生は早く来るように言いました。",
        ["話者", "内容", "伝達"],
        "reported requests with yo ni iu",
        "The teacher told us to come early.",
        {
          exampleHighlights: [h("話者", "先生は"), h("内容", "早く来る"), h("伝達", "ように言いました")],
        }
      ),
      c(
        "疑問の内容は か / かどうか",
        [
          "間接的に質問内容を伝えるときは か や かどうか を使います。",
          "元の疑問文の語順を保つのではなく、内容を名詞化して扱うイメージです。",
        ],
        "彼は来られるかどうか聞きました。",
        ["話者", "疑問内容", "伝達"],
        "reported questions with ka or ka do ka",
        "He asked whether someone could come.",
        {
          exampleHighlights: [h("話者", "彼は"), h("疑問内容", "来られるかどうか"), h("伝達", "聞きました")],
        }
      ),
      c(
        "敬意を込めて報告する",
        [
          "話し手本人への敬意は おっしゃる などの敬語動詞で示せます。",
          "引用内容そのものより、誰の発話をどう扱うかが大切です。",
        ],
        "部長は後で説明するとおっしゃいました。",
        ["話者", "内容", "敬語動詞"],
        "honorific reporting verbs",
        "The manager said that he would explain later.",
        {
          exampleHighlights: [h("話者", "部長は"), h("内容", "後で説明する"), h("敬語動詞", "とおっしゃいました")],
        }
      ),
    ],
  },
  korean: {
    "Pronouns & Reference": [
      c(
        "나 / 저 와 주어 표현",
        [
          "나와 저는 둘 다 1인칭이지만, 저는 더 공손한 상황에서 씁니다.",
          "한국어에서는 주어를 자주 생략하지만 필요할 때는 높임 수준에 맞는 형태를 고릅니다.",
        ],
        "저는 오늘 바쁩니다.",
        ["주어", "시간", "서술"],
        "first-person pronouns na and jeo",
        "I am busy today."
      ),
      c(
        "목적어 대명사",
        [
          "나를, 너를, 그를처럼 목적어 자리에 오는 대명사는 동작의 대상을 나타냅니다.",
          "실제 회화에서는 사람 이름이나 생략을 더 자주 쓰기도 합니다.",
        ],
        "그는 나를 도와준다.",
        ["주어", "목적어", "동사"],
        "object pronouns",
        "He helps me."
      ),
      c(
        "소유 표현: 내 / 제",
        [
          "내는 반말 쪽, 제는 공손한 말에서 많이 쓰는 소유 표현입니다.",
          "소유를 나타낼 때 대명사 형태가 말높이에 따라 달라집니다.",
        ],
        "이것은 제 책입니다.",
        ["지시", "소유", "명사", "서술"],
        "possessive forms nae and je",
        "This is my book."
      ),
      c(
        "지시 표현: 이 / 그 / 저, 이것 / 그것 / 저것",
        [
          "이, 그, 저는 화자와 청자의 거리나 공유 여부에 따라 달라집니다.",
          "명사 없이 쓸 때는 이것, 그것, 저것 같은 형태가 자연스럽습니다.",
        ],
        "저것은 우리 집이 아닙니다.",
        ["지시", "주어", "서술"],
        "demonstratives i geu jeo",
        "That over there is not our house."
      ),
      c(
        "재귀 표현 자기",
        [
          "자기는 앞에 나온 사람을 다시 가리킬 때 쓰는 대표적인 재귀 표현입니다.",
          "누구를 가리키는지는 문맥으로 판단해야 합니다.",
        ],
        "민수는 자기를 믿는다.",
        ["주어", "재귀", "동사"],
        "reflexive reference with jagi",
        "Minsu believes in himself."
      ),
      c(
        "문맥에서 주어와 대명사를 생략",
        [
          "한국어는 문맥이 분명하면 주어와 목적어를 자주 생략합니다.",
          "대명사를 매번 넣으면 오히려 번역투처럼 들릴 수 있습니다.",
        ],
        "밥 먹었어요?",
        ["명사", "동사"],
        "pronouns are often omitted in context",
        "Have you eaten?"
      ),
      c(
        "당신보다 이름이나 직함이 더 자연스럽다",
        [
          "일상 한국어에서는 당신보다 이름, 선생님, 부장님 같은 호칭이 훨씬 자연스럽습니다.",
          "당신은 특정한 감정, 노래 가사, 부부 호칭 등 제한된 맥락에서만 많이 씁니다.",
        ],
        "선생님은 지금 바쁘세요?",
        ["호칭", "시간", "서술"],
        "names and titles are more natural than dangsin",
        "Teacher, are you busy right now?"
      ),
    ],
    "Reported Speech": [
      c(
        "직접 인용: -라고 말하다",
        [
          "직접 인용은 실제 말을 그대로 따옴표 안에 넣고 -라고 말하다와 함께 씁니다.",
          "원래 문장의 말투를 그대로 보여 주고 싶을 때 적합합니다.",
        ],
        "그는 \"내일 갈 거야\"라고 말했다.",
        ["화자", "인용", "서술"],
        "direct quotation with -rago malhada",
        "He said, “I will go tomorrow.”"
      ),
      c(
        "간접 인용: -다고 하다",
        [
          "평서문 내용을 전할 때는 -다고 하다 형태가 기본입니다.",
          "영어처럼 기계적으로 시제를 뒤로 미는 규칙보다 의미와 시점을 더 중요하게 봅니다.",
        ],
        "그는 내일 간다고 말했다.",
        ["화자", "내용", "전달"],
        "reported statements with -dago hada",
        "He said that he was going tomorrow."
      ),
      c(
        "간접 의문문: -냐고 / -는지 묻다",
        [
          "예/아니오 질문이나 의문 내용을 전할 때는 -냐고 하다, -는지 묻다 같은 형태를 씁니다.",
          "질문이라는 기능을 보존하면서도 종결형은 간접 인용에 맞게 바뀝니다.",
        ],
        "그는 내가 오는지 물었다.",
        ["화자", "질문 내용", "서술"],
        "reported questions with -nyago or -neunji",
        "He asked whether I was coming."
      ),
      c(
        "부탁과 요구: -아/어 달라고 하다",
        [
          "누군가에게 무엇을 해 달라고 한 말을 전할 때 달라고 하다를 자주 씁니다.",
          "부탁의 방향이 누구에게 향하는지도 함께 드러납니다.",
        ],
        "그는 나에게 기다려 달라고 했다.",
        ["화자", "대상", "요청"],
        "reported requests with -dalrago hada",
        "He asked me to wait."
      ),
      c(
        "제안 인용: -자고 하다",
        [
          "함께 하자고 제안한 내용을 전할 때는 -자고 하다를 씁니다.",
          "직접 제안문을 그대로 반복하지 않고 기능만 옮겨 오는 방식입니다.",
        ],
        "친구가 같이 가자고 했다.",
        ["화자", "내용", "전달"],
        "reported suggestions with -jago hada",
        "My friend suggested that we go together."
      ),
      c(
        "시제와 지시는 의미에 맞춘다",
        [
          "내일, 그날, 여기 같은 말은 새로운 보고 시점에 맞게 바뀔 수 있습니다.",
          "한국어 간접 인용은 영어식 backshift보다 의미 보존이 우선입니다.",
        ],
        "민지는 내일 오겠다고 했다.",
        ["화자", "시간", "내용"],
        "tense and deixis follow meaning in reported speech",
        "Minji said that she would come tomorrow."
      ),
    ],
  },
  portuguese: {
    "Pronouns & Reference": [
      c(
        "Pronomes pessoais de sujeito",
        [
          "Eu, tu, você, ele, ela, nós e eles identificam quem participa da ação.",
          "Em português, o sujeito pode às vezes ficar implícito, mas o sistema pronominal continua importante para contraste e clareza.",
        ],
        "Eu gosto de música.",
        ["sujeito", "verbo", "complemento"],
        "subject pronouns in Portuguese",
        "I like music."
      ),
      c(
        "Pronomes oblíquos diretos",
        [
          "Me, te, o, a, nos e os substituem objetos diretos em muitos registros.",
          "A colocação pode variar, mas a função principal é retomar o objeto sem repeti-lo.",
        ],
        "Eu o vi ontem.",
        ["sujeito", "pronome", "verbo", "tempo"],
        "direct object pronouns",
        "I saw him yesterday."
      ),
      c(
        "Pronomes possessivos",
        [
          "Meu, minha, seu, nossa e formas afins marcam posse ou vínculo.",
          "Essas formas concordam com a coisa possuída, não com o possuidor.",
        ],
        "Este livro é meu.",
        ["demonstração", "nome", "verbo", "posse"],
        "possessive pronouns",
        "This book is mine."
      ),
      c(
        "Pronomes demonstrativos",
        [
          "Este, esse e aquele ajudam a localizar algo no espaço, no discurso ou na memória compartilhada.",
          "Também podem retomar partes já mencionadas da conversa.",
        ],
        "Aquele é o meu carro.",
        ["demonstração", "verbo", "complemento"],
        "demonstrative pronouns",
        "That one is my car."
      ),
      c(
        "Pronomes relativos com que",
        [
          "Que liga uma oração relativa ao nome que ela descreve.",
          "Ele evita repetir o nome e ajuda a manter a frase encadeada.",
        ],
        "O livro que eu li é interessante.",
        ["nome", "relativo", "continuação"],
        "relative pronouns with que",
        "The book that I read is interesting."
      ),
      c(
        "Pronomes indefinidos",
        [
          "Alguém, ninguém, tudo e algo referem-se a pessoas ou coisas não especificadas.",
          "São úteis quando a identidade exata não é o foco da frase.",
        ],
        "Alguém deixou a porta aberta.",
        ["pronome", "verbo", "complemento"],
        "indefinite pronouns",
        "Someone left the door open."
      ),
      c(
        "Você / o senhor / a senhora",
        [
          "As formas de tratamento mudam conforme distância social, respeito e região.",
          "Escolher entre você, o senhor e a senhora também é uma decisão pragmática.",
        ],
        "O senhor pode me ajudar?",
        ["tratamento", "verbo", "resto"],
        "forms of address in Portuguese",
        "Can you help me?"
      ),
    ],
    "Reported Speech": [
      c(
        "Discurso direto com aspas",
        [
          "No discurso direto, reproduzimos as palavras exatas de quem falou.",
          "Aspas ou travessão ajudam a marcar a mudança para a fala citada.",
        ],
        "Ela disse: \"Eu volto amanhã.\"",
        ["introdução", "citação"],
        "direct quotation with quotation marks",
        "She said, “I will return tomorrow.”"
      ),
      c(
        "Discurso indireto com que",
        [
          "Para relatar uma afirmação, o português usa com frequência que depois do verbo introdutor.",
          "O foco passa a ser o conteúdo transmitido, não a formulação literal.",
        ],
        "Ela disse que voltaria amanhã.",
        ["introdução", "que", "oração relatada"],
        "reported statements with que",
        "She said that she would return tomorrow."
      ),
      c(
        "Perguntas indiretas com se",
        [
          "Perguntas de sim ou não costumam ser relatadas com se.",
          "A oração deixa de ter a entoação de pergunta direta e assume ordem declarativa.",
        ],
        "Ela perguntou se eu iria à festa.",
        ["introdução", "se", "oração relatada"],
        "reported yes-no questions with se",
        "She asked whether I was going to the party."
      ),
      c(
        "Perguntas indiretas com palavra interrogativa",
        [
          "Em perguntas com onde, quando, por que ou como, a palavra interrogativa permanece.",
          "Depois dela, a frase segue a ordem normal da oração subordinada.",
        ],
        "Ele perguntou como eu estava.",
        ["introdução", "palavra interrogativa", "oração relatada"],
        "reported wh-questions",
        "He asked how I was."
      ),
      c(
        "Pedidos e ordens relatados",
        [
          "Pedidos podem aparecer com para + infinitivo ou com que + subjuntivo, conforme o verbo e o registro.",
          "A estrutura escolhida mostra a intenção do original sem copiar o imperativo diretamente.",
        ],
        "Ela pediu para eu ajudar.",
        ["introdução", "ligação", "ação"],
        "reported requests and commands",
        "She asked me to help."
      ),
      c(
        "Tempo e deíxis dependem do contexto",
        [
          "Hoje, amanhã, aqui, eu e outros elementos de referência mudam conforme o novo ponto de vista.",
          "O português ajusta tempos e expressões para preservar sentido, não por uma regra mecânica única.",
        ],
        "Ele disse que chegaria no dia seguinte.",
        ["introdução", "que", "oração relatada"],
        "time and deixis depend on context in reported speech",
        "He said that he would arrive the next day."
      ),
    ],
  },
  spanish: {
    "Pronouns & Reference": [
      c(
        "Pronombres de sujeto y sujeto tácito",
        [
          "Yo, tú, él, ella y nosotros existen, pero el español muchas veces deja el sujeto implícito porque la forma verbal ya ayuda.",
          "El pronombre aparece sobre todo para contraste, énfasis o aclaración.",
        ],
        "Voy al cine.",
        ["verbo", "complemento"],
        "subject pronouns and null subjects",
        "I am going to the cinema."
      ),
      c(
        "Pronombres de objeto directo",
        [
          "Me, te, lo, la, nos y los sustituyen al objeto directo de la oración.",
          "Normalmente se colocan antes del verbo conjugado.",
        ],
        "La veo en el parque.",
        ["pronombre", "verbo", "complemento"],
        "direct object pronouns",
        "I see her in the park."
      ),
      c(
        "Pronombres de objeto indirecto",
        [
          "Me, te, le, nos y les indican a quién se dirige la acción o quién recibe algo.",
          "En español, el objeto indirecto puede duplicarse con un nombre explícito.",
        ],
        "Le doy un libro a Juan.",
        ["pronombre", "verbo", "objeto", "destinatario"],
        "indirect object pronouns",
        "I give Juan a book."
      ),
      c(
        "Pronombres reflexivos",
        [
          "Me, te, se, nos y os muestran que la acción vuelve sobre el mismo sujeto.",
          "Aparecen con muchos verbos pronominales y cambian la interpretación de la acción.",
        ],
        "Me lavo las manos.",
        ["pronombre", "verbo", "complemento"],
        "reflexive pronouns",
        "I wash my hands."
      ),
      c(
        "Demostrativos y deixis",
        [
          "Este, ese y aquel sirven para señalar personas, objetos o ideas según la distancia o el contexto discursivo.",
          "La deixis no es solo temporal: también organiza cercanía espacial y referencia en la conversación.",
        ],
        "Ese es mi problema.",
        ["demostrativo", "verbo", "complemento"],
        "demonstratives and deixis",
        "That is my problem."
      ),
      c(
        "Pronombres relativos: que / quien",
        [
          "Que y quien conectan una referencia con la información adicional que la describe.",
          "Ayudan a evitar repeticiones y a enlazar ideas dentro de la misma oración.",
        ],
        "La chica que canta es mi amiga.",
        ["referencia", "relativo", "resto"],
        "relative pronouns que and quien",
        "The girl who is singing is my friend."
      ),
      c(
        "Tú / usted y la cortesía",
        [
          "Tú expresa cercanía o informalidad; usted marca distancia, respeto o formalidad.",
          "El contraste depende tanto de la región como de la relación entre hablantes.",
        ],
        "¿Usted quiere café?",
        ["tratamiento", "verbo", "complemento"],
        "tu and usted for politeness",
        "Would you like coffee?"
      ),
    ],
    "Reported Speech": [
      c(
        "Estilo directo con comillas",
        [
          "El estilo directo conserva las palabras exactas de la persona que habló.",
          "Las comillas o el guion marcan claramente la cita.",
        ],
        "Ella dijo: \"Vendré mañana.\"",
        ["introducción", "cita"],
        "direct quotation with quotation marks",
        "She said, “I will come tomorrow.”"
      ),
      c(
        "Estilo indirecto con que",
        [
          "Para relatar una afirmación, el español usa con frecuencia que después del verbo de habla.",
          "Así transmitimos el contenido sin repetir la forma exacta del original.",
        ],
        "Ella dijo que vendría mañana.",
        ["introducción", "que", "oración reportada"],
        "reported statements with que",
        "She said that she would come tomorrow."
      ),
      c(
        "Preguntas indirectas con si",
        [
          "Las preguntas de sí o no se reportan normalmente con si.",
          "La oración subordinada deja la inversión propia de la pregunta directa.",
        ],
        "Ella preguntó si venías a la fiesta.",
        ["introducción", "si", "oración reportada"],
        "reported yes-no questions with si",
        "She asked whether you were coming to the party."
      ),
      c(
        "Preguntas indirectas con palabra interrogativa",
        [
          "Quién, dónde, cuándo, por qué y cómo permanecen al inicio de la parte reportada.",
          "Después de esa palabra, la oración sigue el orden normal de una subordinada.",
        ],
        "Ella preguntó dónde vivías.",
        ["introducción", "interrogativo", "oración reportada"],
        "reported wh-questions",
        "She asked where you lived."
      ),
      c(
        "Mandatos y pedidos en estilo indirecto",
        [
          "Para reportar órdenes o peticiones se usan estructuras como que + subjuntivo o infinitivo según el verbo.",
          "No se conserva el imperativo tal cual, sino la intención pragmática del original.",
        ],
        "Me dijo que cerrara la puerta.",
        ["introducción", "que", "acción reportada"],
        "reported requests and commands",
        "She told me to close the door."
      ),
      c(
        "Tiempo y deixis dependen del contexto",
        [
          "Palabras como hoy, mañana, aquí, yo o este pueden cambiar para ajustarse al nuevo punto de vista.",
          "La secuencia de tiempos existe, pero se interpreta junto con el contexto y el sentido temporal real.",
        ],
        "Ella dijo que vendría al día siguiente.",
        ["introducción", "que", "oración reportada"],
        "time and deixis depend on context in reported speech",
        "She said that she would come the next day."
      ),
    ],
  },
  swedish: {
    "Pronouns & Reference": [
      c(
        "Personliga pronomen",
        [
          "Jag, du, han, hon, vi och de visar vem som deltar i handlingen.",
          "I vanliga huvudsatser står subjektet normalt kvar och utelämnas inte fritt.",
        ],
        "Jag ser henne.",
        ["subjekt", "verb", "objekt"],
        "personal pronouns",
        "I see her.",
        { mistakes: [m("Ser henne.", "Jag ser henne.")] }
      ),
      c(
        "Objektsformer av pronomen",
        [
          "Mig, dig, honom, henne och dem används som objektformer.",
          "Svenskan skiljer alltså mellan subjektformer och objektsformer i många personliga pronomen.",
        ],
        "Hon hjälper mig.",
        ["subjekt", "verb", "objekt"],
        "object forms of pronouns",
        "She helps me."
      ),
      c(
        "Reflexivt pronomen sig",
        [
          "Sig syftar tillbaka på subjektet i tredje person.",
          "Det används när samma person både gör handlingen och påverkas av den.",
        ],
        "Hon tvättar sig.",
        ["subjekt", "verb", "reflexivt pronomen"],
        "reflexive pronoun sig",
        "She is washing herself."
      ),
      c(
        "Possessiva pronomen",
        [
          "Min, mitt och mina visar ägande och böjs efter det som ägs.",
          "Det är den ägda saken, inte ägaren, som styr formen.",
        ],
        "Det här är min bok.",
        ["inledning", "verb", "ägande"],
        "possessive pronouns",
        "This is my book."
      ),
      c(
        "Demonstrativa former",
        [
          "Den här, det där och den där pekar ut något i situationen eller i texten.",
          "De fungerar som referenspunkter, inte bara som översättningar av this och that.",
        ],
        "Den där är min.",
        ["demonstrativ", "verb", "komplement"],
        "demonstrative pronouns and forms",
        "That one is mine."
      ),
      c(
        "Indefinita pronomen",
        [
          "Någon, ingen, något och allt syftar på obestämda personer eller saker.",
          "De används när identiteten inte är känd eller inte spelar roll.",
        ],
        "Någon ringde på dörren.",
        ["pronomen", "verb", "plats"],
        "indefinite pronouns",
        "Someone rang the doorbell."
      ),
      c(
        "Du, ni och tilltal",
        [
          "Du är standardsättet att tilltala en person i modern svenska.",
          "Ni kan vara plural eller användas artigt i vissa sammanhang, men det är inte ett gammalt formellt standardsystem som i franskan.",
        ],
        "Kan ni hjälpa mig?",
        ["verb", "tilltal", "rest"],
        "du and ni in address",
        "Can you help me?"
      ),
    ],
    "Reported Speech": [
      c(
        "Direkt anföring",
        [
          "Direkt anföring återger orden exakt som de sades.",
          "Citattecken eller kolon visar tydligt var citatet börjar.",
        ],
        "Hon sa: \"Jag kommer imorgon.\"",
        ["inledning", "citat"],
        "direct quotation",
        "She said, “I am coming tomorrow.”"
      ),
      c(
        "Indirekt anföring med att",
        [
          "När du återger ett påstående indirekt används ofta att.",
          "Det viktiga är innehållet i utsagan, inte den exakta ordalydelsen.",
        ],
        "Hon sa att hon skulle komma imorgon.",
        ["inledning", "att", "bisats"],
        "reported statements with att",
        "She said that she would come tomorrow."
      ),
      c(
        "Indirekta ja/nej-frågor med om",
        [
          "Ja/nej-frågor återges ofta med om i svenskan.",
          "Efter om följer vanlig bisatsordföljd, inte direkt frågeordning.",
        ],
        "Hon frågade om jag ville följa med.",
        ["inledning", "om", "bisats"],
        "reported yes-no questions with om",
        "She asked whether I wanted to come along."
      ),
      c(
        "Indirekta frågor med frågeord",
        [
          "Var, när, varför och hur kan stå kvar när frågan rapporteras.",
          "Resten av satsen följer sedan normal ordföljd för bisats.",
        ],
        "Han frågade var jag bodde.",
        ["inledning", "frågeord", "bisats"],
        "reported wh-questions",
        "He asked where I lived."
      ),
      c(
        "Pronomen och tidsord skiftar med perspektivet",
        [
          "Ord som jag, här, idag och imorgon måste anpassas till den nya berättarsituationen.",
          "Svenskan kräver inte en automatisk engelsk backshift; formen styrs av betydelsen och tidsperspektivet.",
        ],
        "Hon sa att hon skulle komma dagen efter.",
        ["inledning", "att", "bisats"],
        "reference words shift with perspective in reported speech",
        "She said that she would come the next day."
      ),
      c(
        "Uppmaningar och önskemål i referat",
        [
          "När man återger en uppmaning används ofta bad, uppmanade eller sa åt följt av infinitiv eller bisats.",
          "Det återgivna yttrandet blir alltså en vanlig rapporterad konstruktion, inte ett nytt imperativ.",
        ],
        "Hon bad mig att vänta.",
        ["inledning", "mottagare", "handling"],
        "reported requests and commands",
        "She asked me to wait."
      ),
    ],
  },
};
