const m = (wrong, fix) => ({ mistakes: [{ wrong, fix }] });

const MISTAKE_UPDATES = {
  arabic: {
    "Voice & Focus": [
      m("كُتِبَتِ الرسالةُ.", "كتبَ الطالبُ الرسالةَ."),
      m("كتبَ الطالبُ الرسالةَ.", "كُتِبَتِ الرسالةُ."),
      m("قرأتُ الكتابَ أمس.", "الكتابَ قرأتُ أمس."),
      m("هذا الكتاب قرأتُ أمس.", "هذا الكتاب قرأتُه أمس."),
      m("حضر الأستاذُ.", "ما حضر إلا الأستاذُ."),
    ],
    "Formality & Style": [
      m("مرحبًا، كيف حالك؟", "السلام عليكم، كيف حالك؟"),
      m("ساعدني.", "لو سمحت، هل يمكنك المساعدة؟"),
      m("علي، هل لديك دقيقة؟", "دكتور علي، هل لديك دقيقة؟"),
      m("عايز أناقش الموضوع ده معكم.", "أود مناقشة هذا الأمر معكم."),
    ],
  },
  chinese: {
    "Voice & Focus": [
      m("我已经看过这本书了。", "这本书，我已经看过了。"),
      m("我关上了门。", "我把门关上了。"),
      m("风吹开了门。", "门被风吹开了。"),
      m("我昨天买了这本书。", "这本书是我昨天买的。"),
      m("我买了一本书。", "我只买了一本书。"),
    ],
    "Formality & Style": [
      m("你今天过得怎么样？", "您今天过得怎么样？"),
      m("你帮我看一下。", "麻烦您帮我看一下。"),
      m("小王，你现在方便吗？", "王老师，您现在方便吗？"),
      m("你再说一遍。", "可以请您再说一遍吗？"),
    ],
  },
  dutch: {
    "Voice & Focus": [
      m("Het eten wordt door de kok gekookt.", "De kok kookt het eten."),
      m("De kok kookt het eten.", "Het eten wordt gekookt."),
      m("De deur wordt gesloten.", "De deur is gesloten."),
      m("Dat boek ik heb gisteren gelezen.", "Dat boek heb ik gisteren gelezen."),
      m("Jan belt.", "Het is Jan die belt."),
    ],
    "Formality & Style": [
      m("Hoe gaat het met je?", "Hoe gaat het met u?"),
      m("Help mij even.", "Zou u mij kunnen helpen?"),
      m("Hoi, leuk je te ontmoeten.", "Goedemiddag, fijn u te ontmoeten."),
      m("Leg dat nog eens uit.", "Misschien kunt u dat nog eens uitleggen."),
    ],
  },
  french: {
    "Voice & Focus": [
      m("Le dîner est préparé par le chef.", "Le chef prépare le dîner."),
      m("Le chef prépare le dîner.", "Le dîner est préparé par le chef."),
      m("Ce livre, j'ai déjà lu.", "Ce livre, je l'ai déjà lu."),
      m("Marie a appelé.", "C'est Marie qui a appelé."),
      m("Quelqu'un m'a conseillé ce livre.", "On m'a conseillé ce livre."),
    ],
    "Formality & Style": [
      m("Tu as un moment ?", "Vous avez un moment ?"),
      m("Répétez, s'il vous plaît.", "Pourriez-vous répéter, s'il vous plaît ?"),
      m("Salut Madame, merci.", "Bonjour Madame, je vous remercie."),
      m("Je veux prendre rendez-vous.", "Je voudrais prendre rendez-vous."),
    ],
  },
  german: {
    "Voice & Focus": [
      m("Das Essen wird gekocht.", "Der Koch kocht das Essen."),
      m("Der Koch kocht das Essen.", "Das Essen wird gekocht."),
      m("Die Tür wird geschlossen.", "Die Tür ist geschlossen."),
      m("Dieses Buch ich habe gestern gelesen.", "Dieses Buch habe ich gestern gelesen."),
      m("Maria hat angerufen.", "Nur Maria hat angerufen."),
    ],
    "Formality & Style": [
      m("Hast du kurz Zeit?", "Haben Sie kurz Zeit?"),
      m("Wiederholen Sie das.", "Könnten Sie das bitte wiederholen?"),
      m("Hallo, Weber.", "Guten Tag, Frau Weber."),
      m("Ich will einen Termin vereinbaren.", "Ich würde gern einen Termin vereinbaren."),
    ],
  },
  hindi: {
    "Voice & Focus": [
      m("पत्र लिखा गया।", "रीमा ने पत्र लिखा।"),
      m("रीमा ने पत्र लिखा।", "पत्र लिखा गया।"),
      m("मैंने यह किताब कल पढ़ी।", "यह किताब मैंने कल पढ़ी।"),
      m("सीमा जीती।", "सीमा ही जीती।"),
      m("राम आया।", "राम भी आया।"),
    ],
    "Formality & Style": [
      m("क्या तुम थोड़ा समय दे सकते हैं?", "क्या आप थोड़ा समय दे सकते हैं?"),
      m("यह बात फिर से कहो।", "ज़रा यह बात फिर से कहिए।"),
      m("शर्मा, तुम कब आए?", "शर्मा जी, आप कब आए?"),
      m("बैठो।", "कृपया बैठिए।"),
    ],
  },
  japanese: {
    "Voice & Focus": [
      m("ドアが田中さんに開けられました。", "田中さんがドアを開けました。"),
      m("田中さんがドアを開けました。", "ドアが田中さんに開けられました。"),
      m("この本を、もう読みました。", "この本は、もう読みました。"),
      m("私が知っています。", "私だけが知っています。"),
      m("田中さんが来ました。", "来たのは田中さんです。"),
    ],
    "Formality & Style": [
      m("今日は忙しい。", "今日は忙しいです。"),
      m("田中、少しよろしいですか。", "田中さん、少しよろしいですか。"),
      m("もう一度言って。", "もう一度言ってもらえますか。"),
      m("先に帰ります。", "失礼します、先に帰ります。"),
    ],
  },
  korean: {
    "Voice & Focus": [
      m("문이 열렸어요.", "민수가 문을 열었어요."),
      m("민수가 문을 열었어요.", "문이 열렸어요."),
      m("이 책을 이미 읽었어요.", "이 책은 이미 읽었어요."),
      m("민수가 왔어요.", "민수만 왔어요."),
      m("민수가 왔어요.", "온 사람은 민수예요."),
    ],
    "Formality & Style": [
      m("오늘 바빠?", "오늘 바쁘세요?"),
      m("지금 뭐 해?", "지금 뭐 해요?"),
      m("민수 씨, 잠깐 시간 있으세요?", "선생님, 잠깐 시간 있으세요?"),
      m("한 번 더 말해.", "한 번 더 말씀해 주실 수 있을까요?"),
    ],
  },
  portuguese: {
    "Voice & Focus": [
      m("O jantar foi preparado pelo chef.", "O chef prepara o jantar."),
      m("O chef prepara o jantar.", "O jantar foi preparado pelo chef."),
      m("As pessoas vendem livros usados.", "Vendem-se livros usados."),
      m("Eu já li esse livro.", "Esse livro, eu já li."),
      m("A Ana ligou.", "Foi a Ana que ligou."),
    ],
    "Formality & Style": [
      m("Você pode me ajudar?", "A senhora poderia me ajudar?"),
      m("Repete, por favor.", "Você poderia repetir, por favor?"),
      m("Oi, Helena.", "Bom dia, doutora Helena."),
      m("Quero marcar uma reunião.", "Gostaria de marcar uma reunião."),
    ],
  },
  spanish: {
    "Voice & Focus": [
      m("La cena fue preparada por la chef.", "La chef prepara la cena."),
      m("La chef prepara la cena.", "La cena fue preparada por la chef."),
      m("La gente vende libros usados.", "Se venden libros usados."),
      m("Ese libro, ya leí.", "Ese libro, ya lo leí."),
      m("Ana llamó.", "Fue Ana quien llamó."),
    ],
    "Formality & Style": [
      m("¿Tú tienes un momento?", "¿Usted tiene un momento?"),
      m("Repítalo, por favor.", "¿Podría repetirlo, por favor?"),
      m("Hola, Ruiz.", "Buenos días, señora Ruiz."),
      m("Quiero pedir una cita.", "Quisiera pedir una cita."),
    ],
  },
  swedish: {
    "Voice & Focus": [
      m("Maten lagas av kocken.", "Kocken lagar maten."),
      m("Någon öppnar dörren klockan åtta.", "Dörren öppnas klockan åtta."),
      m("Polisen stoppade honom.", "Han blev stoppad av polisen."),
      m("Den boken jag läste igår.", "Den boken läste jag igår."),
      m("Lisa ringde.", "Det var Lisa som ringde."),
    ],
    "Formality & Style": [
      m("Har ni en minut?", "Har du en minut?"),
      m("Upprepa det.", "Skulle du kunna upprepa det?"),
      m("Lind, har du tid nu?", "Doktor Lind, har ni tid nu?"),
      m("Kan du hjälpa mig?", "Ursäkta, kan du hjälpa mig?"),
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

const repairVoiceFormalityMistakesInPack = (pack, worldKey) => {
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
  repairVoiceFormalityMistakesInPack,
};
