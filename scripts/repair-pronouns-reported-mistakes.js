const m = (wrong, fix) => ({ mistakes: [{ wrong, fix }] });

const MISTAKE_UPDATES = {
  arabic: {
    "Pronouns & Reference": [
      ,
      ,
      m("أنا يدرس العربية كلَّ يوم.", "أدرس العربية كلَّ يوم."),
      m("هذا السيارةُ سريعةٌ.", "هذه السيارةُ سريعةٌ."),
      m("رأيت هو أمس.", "رأيته أمس."),
      m("أنا سأذهب نفسي.", "أنا نفسي سأذهب."),
      m("ماذا يدرس هنا؟", "من يدرس هنا؟"),
    ],
    "Reported Speech": [
      m("قال محمد إنه يحب القراءة.", "قال محمد: «أحب القراءة»."),
      m("قال محمد يحب القراءة.", "قال محمد إنه يحب القراءة."),
      m("سألته سيأتي.", "سألته هل سيأتي."),
      m("قالت فاطمة إنني متعبة.", "قالت فاطمة إنها متعبة."),
      m("قال أحمد إنه سافر غدًا.", "قال أحمد إنه سيسافر غدًا."),
      m("طلب مني الأستاذ أكتب الإجابة.", "طلب مني الأستاذ أن أكتب الإجابة."),
    ],
  },
  chinese: {
    "Pronouns & Reference": [
      m("你喜欢这本书。", "我喜欢这本书。"),
      m("那个我的朋友。", "那个是我的朋友。"),
      m("你吃了吗？", "吃了吗？"),
      m("你要喝水吗？", "您要喝水吗？"),
      m("他做的自己。", "他自己做的。"),
      m("谁在门口等你。", "有人在门口等你。"),
      m("我明天见。", "我们明天见。"),
    ],
    "Reported Speech": [
      m("她说明天去商店。", "她说：“我明天去商店。”"),
      m("她说的明天去商店。", "她说明天去商店。"),
      m("他告诉他会迟到。", "他告诉我他会迟到。"),
      m("她问我：明天会下雨吗？", "她问我明天会不会下雨。"),
      m("老师问我他为什么迟到。", "老师问我为什么迟到。"),
      m("她说今天不能来。", "她说那天不能来。"),
    ],
  },
  dutch: {
    "Pronouns & Reference": [
      m("Ik zie hij in het park.", "Ik zie hem in het park."),
      m("Dit is mij boek.", "Dit is mijn boek."),
      m("Dat is van mijn zus.", "Die is van mijn zus."),
      m("Hij wast hem elke ochtend.", "Hij wast zich elke ochtend."),
      m("Wie belt aan.", "Iemand belt aan."),
      ,
      m("Kunt jij mij helpen?", "Kunt u mij helpen?"),
    ],
    "Reported Speech": [
      m("Hij zei dat hij naar de winkel ging.", "Hij zei: 'Ik ga naar de winkel.'"),
      m("Hij zei hij naar de winkel ging.", "Hij zei dat hij naar de winkel ging."),
      m("Ze vroeg ik meekwam.", "Ze vroeg of ik meekwam."),
      m("Hij vroeg of ik woonde.", "Hij vroeg waar ik woonde."),
      m("Ze zei dat ze vandaag thuiswerkte.", "Ze zei dat ze die dag thuiswerkte."),
      m("Hij vroeg me wachten.", "Hij vroeg me om te wachten."),
    ],
  },
  french: {
    "Pronouns & Reference": [
      ,
      m("Je vois lui.", "Je le vois."),
      m("Je parle le.", "Je lui parle."),
      m("Elle lave se.", "Elle se lave."),
      m("La fille que chante est talentueuse.", "La fille qui chante est talentueuse."),
      m("Cette-ci est plus rapide.", "Celle-ci est plus rapide."),
      m("Tu êtes très aimable.", "Vous êtes très aimable."),
    ],
    "Reported Speech": [
      m("Il a dit qu'il venait demain.", "Il a dit : « Je viens demain. »"),
      m("Il dit il vient demain.", "Il dit qu'il vient demain."),
      m("Il a dit qu'il vient demain.", "Il a dit qu'il viendrait le lendemain."),
      m("Elle demande est-ce que tu viens.", "Elle demande si tu viens."),
      m("Il a demandé que Marie habitait.", "Il a demandé où Marie habitait."),
      m("Il m'a dit fermer la porte.", "Il m'a dit de fermer la porte."),
    ],
  },
  german: {
    "Pronouns & Reference": [
      ,
      m("Ich sehe er.", "Ich sehe ihn."),
      m("Ich gebe ihn das Buch.", "Ich gebe ihm das Buch."),
      m("Ich wasche mir.", "Ich wasche mich."),
      m("Die hier ist günstiger.", "Dieser hier ist günstiger."),
      m("Wer hat angerufen.", "Jemand hat angerufen."),
      m("Das ist mich Auto.", "Das ist mein Auto."),
    ],
    "Reported Speech": [
      m("Er sagte, dass er morgen kommt.", "Er sagte: „Ich komme morgen.“"),
      m("Er sagte, dass er morgen kommen.", "Er sagte, dass er morgen kommt."),
      m("Die Sprecherin sagte, sie ist bereit.", "Die Sprecherin sagte, sie sei bereit."),
      m("Er fragte, dass ich Zeit habe.", "Er fragte, ob ich Zeit habe."),
      m("Sie fragte, ob er zu spät sei.", "Sie fragte, warum er zu spät sei."),
      m("Er bat mich, ich warte.", "Er bat mich, zu warten."),
    ],
  },
  hindi: {
    "Pronouns & Reference": [
      m("मुझे स्कूल जा रहा हूँ।", "मैं स्कूल जा रहा हूँ।"),
      m("आप कैसे हो?", "आप कैसे हैं?"),
      m("वह मेरी किताब है।", "यह मेरी किताब है।"),
      m("जो लड़का खड़ा है, मेरा भाई है।", "जो लड़का खड़ा है, वह मेरा भाई है।"),
      m("कौन दरवाज़े पर है।", "कोई दरवाज़े पर है।"),
      m("सीमा उसका बैग लाई।", "सीमा अपना बैग लाई।"),
      m("मैं आ रहा है।", "आ रहा हूँ।"),
    ],
    "Reported Speech": [
      m("राज ने कहा कि वह स्कूल जा रहा है।", "राज ने कहा, \"मैं स्कूल जा रहा हूँ।\""),
      m("राज ने कहा वह स्कूल जा रहा है।", "राज ने कहा कि वह स्कूल जा रहा है।"),
      m("उसने पूछा मैं तैयार हूँ।", "उसने पूछा कि क्या मैं तैयार हूँ।"),
      m("उसने पूछा कि मैं क्या जा रहा था।", "उसने पूछा कि मैं कहाँ जा रहा था।"),
      m("रीमा ने कहा कि वह कल आई।", "रीमा ने कहा कि वह कल आएगी।"),
      m("शिक्षक ने मुझे बैठने कहा।", "शिक्षक ने मुझे बैठने को कहा।"),
    ],
  },
  japanese: {
    "Pronouns & Reference": [
      m("私学生です。", "私は学生です。"),
      m("私はもう食べました。", "もう食べました。"),
      m("このは本です。", "これは本です。"),
      m("あなたはもう帰りましたか。", "田中さんはもう帰りましたか。"),
      m("彼は彼で決めた。", "彼は自分で決めた。"),
      m("私は学生です。", "私たちは学生です。"),
      m("彼は明日来ます。", "山田さんは明日来ます。"),
    ],
    "Reported Speech": [
      m("彼は明日行くと言いました。", "彼は「明日行きます」と言いました。"),
      m("彼は明日行くを言いました。", "彼は明日行くと言いました。"),
      m("田中さんは明日来るです。", "田中さんは明日来るそうです。"),
      m("先生は早く来ると言いました。", "先生は早く来るように言いました。"),
      m("彼は来られると聞きました。", "彼は来られるかどうか聞きました。"),
      m("部長は後で説明すると言いました。", "部長は後で説明するとおっしゃいました。"),
    ],
  },
  korean: {
    "Pronouns & Reference": [
      m("나는 오늘 바쁩니다.", "저는 오늘 바쁩니다."),
      m("그는 나는 도와준다.", "그는 나를 도와준다."),
      m("이것은 내 책입니다.", "이것은 제 책입니다."),
      m("그것은 우리 집이 아닙니다.", "저것은 우리 집이 아닙니다."),
      m("민수는 그를 믿는다.", "민수는 자기를 믿는다."),
      m("당신은 밥 먹었어요?", "밥 먹었어요?"),
      m("당신은 지금 바쁘세요?", "선생님은 지금 바쁘세요?"),
    ],
    "Reported Speech": [
      m("그는 내일 간다고 말했다.", "그는 \"내일 갈 거야\"라고 말했다."),
      m("그는 내일 간다 말했다.", "그는 내일 간다고 말했다."),
      m("그는 내가 오는다고 물었다.", "그는 내가 오는지 물었다."),
      m("그는 나에게 기다리라고 했다.", "그는 나에게 기다려 달라고 했다."),
      m("친구가 같이 가다고 했다.", "친구가 같이 가자고 했다."),
      m("민지는 내일 온다고 했다.", "민지는 내일 오겠다고 했다."),
    ],
  },
  portuguese: {
    "Pronouns & Reference": [
      m("Mim gosto de música.", "Eu gosto de música."),
      m("Eu vi ele ontem.", "Eu o vi ontem."),
      m("Este livro é minha.", "Este livro é meu."),
      m("Aquele é a meu carro.", "Aquele é o meu carro."),
      m("O livro quem eu li é interessante.", "O livro que eu li é interessante."),
      m("Quem deixou a porta aberta.", "Alguém deixou a porta aberta."),
      m("O senhor podes me ajudar?", "O senhor pode me ajudar?"),
    ],
    "Reported Speech": [
      m("Ela disse que voltaria amanhã.", "Ela disse: \"Eu volto amanhã.\""),
      m("Ela disse voltaria amanhã.", "Ela disse que voltaria amanhã."),
      m("Ela perguntou eu iria à festa.", "Ela perguntou se eu iria à festa."),
      m("Ele perguntou se eu estava.", "Ele perguntou como eu estava."),
      m("Ela pediu eu ajudar.", "Ela pediu para eu ajudar."),
      m("Ele disse que chegaria amanhã.", "Ele disse que chegaria no dia seguinte."),
    ],
  },
  spanish: {
    "Pronouns & Reference": [
      m("Yo voy al cine.", "Voy al cine."),
      m("Veo ella en el parque.", "La veo en el parque."),
      m("Lo doy un libro a Juan.", "Le doy un libro a Juan."),
      m("Lavo me las manos.", "Me lavo las manos."),
      m("Ese es mío problema.", "Ese es mi problema."),
      m("La chica quien canta es mi amiga.", "La chica que canta es mi amiga."),
      m("¿Tú quiere café?", "¿Usted quiere café?"),
    ],
    "Reported Speech": [
      m("Ella dijo que vendría mañana.", "Ella dijo: \"Vendré mañana.\""),
      m("Ella dijo vendría mañana.", "Ella dijo que vendría mañana."),
      m("Ella preguntó venías a la fiesta.", "Ella preguntó si venías a la fiesta."),
      m("Ella preguntó si vivías.", "Ella preguntó dónde vivías."),
      m("Me dijo cerrar la puerta.", "Me dijo que cerrara la puerta."),
      m("Ella dijo que vendría mañana.", "Ella dijo que vendría al día siguiente."),
    ],
  },
  swedish: {
    "Pronouns & Reference": [
      ,
      m("Hon hjälper jag.", "Hon hjälper mig."),
      m("Hon tvättar henne.", "Hon tvättar sig."),
      m("Det här är mitt bok.", "Det här är min bok."),
      m("Det där är min.", "Den där är min."),
      m("Vem ringde på dörren.", "Någon ringde på dörren."),
      m("Kan du hjälpa mig?", "Kan ni hjälpa mig?"),
    ],
    "Reported Speech": [
      m("Hon sa att hon skulle komma imorgon.", "Hon sa: \"Jag kommer imorgon.\""),
      m("Hon sa hon skulle komma imorgon.", "Hon sa att hon skulle komma imorgon."),
      m("Hon frågade jag ville följa med.", "Hon frågade om jag ville följa med."),
      m("Han frågade om jag bodde.", "Han frågade var jag bodde."),
      m("Hon sa att hon skulle komma imorgon.", "Hon sa att hon skulle komma dagen efter."),
      m("Hon bad att jag väntar.", "Hon bad mig att vänta."),
    ],
  },
};

const applySectionUpdates = (cards, updates) => {
  if (!Array.isArray(cards) || !Array.isArray(updates)) {
    return 0;
  }
  let changed = 0;
  updates.forEach((update, index) => {
    if (!cards[index] || !update) {
      return;
    }
    let cardChanged = false;
    Object.entries(update).forEach(([key, value]) => {
      if (JSON.stringify(cards[index][key]) !== JSON.stringify(value)) {
        cards[index][key] = value;
        cardChanged = true;
      }
    });
    if (cardChanged) {
      changed += 1;
    }
  });
  return changed;
};

const repairPronounsReportedMistakesInPack = (pack, worldKey) => {
  const worldUpdates = MISTAKE_UPDATES[worldKey];
  if (!worldUpdates || !pack?.grammar?.cards) {
    return 0;
  }
  let changed = 0;
  Object.entries(worldUpdates).forEach(([sectionName, updates]) => {
    changed += applySectionUpdates(pack.grammar.cards[sectionName], updates);
  });
  return changed;
};

module.exports = {
  repairPronounsReportedMistakesInPack,
};
