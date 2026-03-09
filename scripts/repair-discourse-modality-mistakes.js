const m = (wrong, fix) => ({ mistakes: [{ wrong, fix }] });

const MISTAKE_UPDATES = {
  arabic: {
    "Discourse & Flow": [
      m("أحب القراءة، وأنا متعب.", "أحب القراءة، لكنني متعب."),
      m("تأخرت لذلك الطريق مزدحم، لأنني اتصلت بك.", "تأخرت لأن الطريق مزدحم، لذلك اتصلت بك."),
      m("أخيرًا أراجع الدرس، ثم أكتب الملاحظات، وأولًا أتدرّب.", "أولًا أراجع الدرس، ثم أكتب الملاحظات، وأخيرًا أتدرّب."),
      m("قال المدير إن الاجتماع غدًا، وهذا المدير.", "قال المدير إن الاجتماع غدًا، وهذا مهم."),
      m("يمكنك الدراسة بطرق مختلفة؛ في النهاية، بالقراءة أو الاستماع.", "يمكنك الدراسة بطرق مختلفة؛ مثلًا، بالقراءة أو الاستماع."),
    ],
    Modality: [
      m("ينبغي أن تنهي العمل اليوم.", "يجب أن تنهي العمل اليوم."),
      m("يجب أن تنام مبكرًا.", "ينبغي أن تنام مبكرًا."),
      m("أريد أن أسبح بسرعة.", "أستطيع أن أسبح بسرعة."),
      m("يصل القطار متأخرًا.", "ربما يصل القطار متأخرًا."),
      m("لا أستطيع التدخين هنا.", "لا يجوز التدخين هنا."),
    ],
  },
  chinese: {
    "Discourse & Flow": [
      m("这本书很短，而且很有意思。", "这本书很短，但是很有意思。"),
      m("因为下雨，因为我没出去。", "因为下雨，所以我没出去。"),
      m("最后洗手，然后吃饭，先收拾桌子。", "先洗手，然后吃饭，最后收拾桌子。"),
      m("我已经看过了，这本书。", "这本书，我已经看过了。"),
      m("可以用很多方法练习，总之跟读。", "可以用很多方法练习，比如跟读。"),
    ],
    Modality: [
      m("你应该今天交作业。", "你必须今天交作业。"),
      m("你必须早点休息。", "你应该早点休息。"),
      m("我想开车。", "我会开车。"),
      m("他已经到了。", "他可能已经到了。"),
      m("这里不会拍照。", "这里不能拍照。"),
    ],
  },
  dutch: {
    "Discourse & Flow": [
      m("Ik lees veel, en ik schrijf weinig.", "Ik lees veel, maar ik schrijf weinig."),
      m("Ik bleef thuis daarom het regende.", "Ik bleef thuis omdat het regende, daarom belde ik eerst."),
      m("Daarna lees ik de tekst, eerst maak ik de oefening.", "Eerst lees ik de tekst, dan maak ik de oefening."),
      m("We hebben de afspraak veranderd; omdat is het probleem opgelost.", "We hebben de afspraak veranderd; daarmee is het probleem opgelost."),
      m("Je kunt op veel manieren oefenen, kortom met luisterteksten.", "Je kunt op veel manieren oefenen, bijvoorbeeld met luisterteksten."),
    ],
    Modality: [
      m("Je zou nu vertrekken.", "Je moet nu vertrekken."),
      m("Je moet meer slapen.", "Je zou meer moeten slapen."),
      m("Ik moet goed zwemmen.", "Ik kan goed zwemmen."),
      m("Hij moet later komen.", "Hij zou later kunnen komen."),
      m("Je kan hier niet roken.", "Je mag hier niet roken."),
    ],
  },
  french: {
    "Discourse & Flow": [
      m("Je lis beaucoup, et j'écris peu.", "Je lis beaucoup, mais j'écris peu."),
      m("Je suis resté chez moi donc il pleuvait.", "Je suis resté chez moi parce qu'il pleuvait, donc j'ai étudié."),
      m("Enfin je lis, puis je note, d'abord je révise.", "D'abord je lis, puis je note, enfin je révise."),
      m("Par exemple, le problème est plus simple.", "En fait, le problème est plus simple."),
      m("Tu peux pratiquer de plusieurs façons, en résumé avec des dialogues.", "Tu peux pratiquer de plusieurs façons, par exemple avec des dialogues."),
    ],
    Modality: [
      m("Je peux partir maintenant.", "Je dois partir maintenant."),
      m("Tu dois dormir plus tôt.", "Tu devrais dormir plus tôt."),
      m("Je veux venir demain.", "Je peux venir demain."),
      m("Il est chez lui.", "Il doit être chez lui."),
      m("Il peut-être chez lui.", "Il doit être chez lui."),
    ],
  },
  german: {
    "Discourse & Flow": [
      m("Ich lese viel, und ich schreibe wenig.", "Ich lese viel, aber ich schreibe wenig."),
      m("Ich bleibe zu Hause deshalb es regnet.", "Ich bleibe zu Hause, weil es regnet, deshalb arbeite ich online."),
      m("Schließlich lese ich den Text, dann mache ich die Übung, zuerst plane ich alles.", "Zuerst lese ich den Text, dann mache ich die Übung."),
      m("Zum Beispiel, das ist der wichtigste Punkt.", "Also, das ist der wichtigste Punkt."),
      m("Du kannst auf viele Arten üben, zusammenfassend mit Dialogen.", "Du kannst auf viele Arten üben, zum Beispiel mit Dialogen."),
    ],
    Modality: [
      m("Ich sollte jetzt gehen.", "Ich muss jetzt gehen."),
      m("Du musst früher schlafen.", "Du solltest früher schlafen."),
      m("Ich darf gut schwimmen.", "Ich kann gut schwimmen."),
      m("Du kannst hier nicht rauchen.", "Du darfst hier nicht rauchen."),
      m("Er kommt später.", "Er könnte später kommen."),
    ],
  },
  hindi: {
    "Discourse & Flow": [
      m("मैं पढ़ता हूँ, और जल्दी थक जाता हूँ।", "मैं पढ़ता हूँ, लेकिन जल्दी थक जाता हूँ।"),
      m("मैं घर पर रहा इसलिए बारिश हो रही थी, क्योंकि काम पूरा किया।", "मैं घर पर रहा क्योंकि बारिश हो रही थी, इसलिए काम पूरा किया।"),
      m("आखिर में पाठ पढ़ो, फिर प्रश्न लिखो, पहले सोचो।", "पहले पाठ पढ़ो, फिर प्रश्न लिखो।"),
      m("राम तो आज आया।", "राम ही आज आया।"),
      m("अभ्यास कई तरह से हो सकता है; आखिर में, सुनकर दोहराना।", "अभ्यास कई तरह से हो सकता है; उदाहरण के लिए, सुनकर दोहराना।"),
    ],
    Modality: [
      m("मुझे आज देर तक काम करना चाहिए।", "मुझे आज देर तक काम करना पड़ेगा।"),
      m("तुम्हें जल्दी सोना पड़ता है।", "तुम्हें जल्दी सोना चाहिए।"),
      m("मैं यह काम चाहता हूँ।", "मैं यह काम कर सकता हूँ।"),
      m("वह देर से आएगा।", "वह शायद देर से आए।"),
      m("यहाँ फोटो लेना नहीं सकता।", "यहाँ फोटो लेना मना है।"),
    ],
  },
  japanese: {
    "Discourse & Flow": [
      m("日本語を勉強しています。そして、まだ難しいです。", "日本語を勉強しています。でも、まだ難しいです。"),
      m("雨が降っているので、だから出かけません。", "雨が降っているので、出かけません。"),
      m("最後に本文を読み、次にメモを取ります。", "まず本文を読み、次にメモを取ります。"),
      m("この本が、もう読みました。", "この本は、もう読みました。"),
      m("勉強法はいろいろあります。つまり、音読です。", "勉強法はいろいろあります。例えば、音読です。"),
    ],
    Modality: [
      m("宿題をしたほうがいい。", "宿題をしなければならない。"),
      m("早く寝なければならないです。", "早く寝たほうがいいです。"),
      m("日本語を話したいです。", "日本語を話すことができます。"),
      m("明日は雨です。", "明日は雨かもしれない。"),
      m("ここで写真を撮ってもいいです。", "ここで写真を撮ってはいけません。"),
    ],
  },
  korean: {
    "Discourse & Flow": [
      m("저는 공부해요. 그리고 아직 어렵습니다.", "저는 공부해요. 하지만 아직 어렵습니다."),
      m("비가 와서 집에 있었어요. 하지만 일을 끝냈어요.", "비가 와서 집에 있었어요. 그래서 일을 끝냈어요."),
      m("마지막으로 본문을 읽고, 다음에 메모하세요.", "먼저 본문을 읽고, 다음에 메모하세요."),
      m("이 책이 이미 읽었어요.", "이 책은 이미 읽었어요."),
      m("연습 방법은 많아요. 결국, 따라 읽기예요.", "연습 방법은 많아요. 예를 들어, 따라 읽기예요."),
    ],
    Modality: [
      m("오늘 숙제를 하면 좋아요.", "오늘 숙제를 해야 해요."),
      m("일찍 자야 해요.", "일찍 자는 게 좋아요."),
      m("저는 수영하고 싶어요.", "저는 수영할 수 있어요."),
      m("그가 늦어요.", "그가 늦을지도 몰라요."),
      m("여기서 사진을 찍어도 돼요.", "여기서 사진을 찍으면 안 돼요."),
    ],
  },
  portuguese: {
    "Discourse & Flow": [
      m("Eu leio muito, e escrevo pouco.", "Eu leio muito, mas escrevo pouco."),
      m("Fiquei em casa por isso chovia.", "Fiquei em casa porque chovia, por isso terminei o trabalho."),
      m("Finalmente leio o texto, depois faço o exercício, primeiro planejo.", "Primeiro leio o texto, depois faço o exercício."),
      m("Por exemplo, o problema é simples.", "Na verdade, o problema é simples."),
      m("Há muitas formas de praticar, em resumo com diálogos.", "Há muitas formas de praticar, por exemplo com diálogos."),
    ],
    Modality: [
      m("Eu deveria sair agora.", "Eu tenho de sair agora."),
      m("Você tem de dormir mais cedo.", "Você deveria dormir mais cedo."),
      m("Eu quero tocar violão.", "Eu sei tocar violão."),
      m("Ele chega mais tarde.", "Talvez ele chegue mais tarde."),
      m("Você não consegue fumar aqui.", "Você não pode fumar aqui."),
    ],
  },
  spanish: {
    "Discourse & Flow": [
      m("Leo mucho, y escribo poco.", "Leo mucho, pero escribo poco."),
      m("Me quedé en casa por eso llovía.", "Me quedé en casa porque llovía, por eso terminé el trabajo."),
      m("Finalmente leo el texto, luego hago el ejercicio, primero pienso.", "Primero leo el texto, luego hago el ejercicio."),
      m("Además, el problema es sencillo.", "De hecho, el problema es sencillo."),
      m("Hay muchas formas de practicar, en resumen con diálogos.", "Hay muchas formas de practicar, por ejemplo con diálogos."),
    ],
    Modality: [
      m("Puedo salir ahora.", "Tengo que salir ahora."),
      m("Tienes que dormir más temprano.", "Deberías dormir más temprano."),
      m("Quiero tocar la guitarra.", "Sé tocar la guitarra."),
      m("Llega más tarde.", "Quizá llegue más tarde."),
      m("Aquí no puedes fumar.", "Aquí no se puede fumar."),
    ],
  },
  swedish: {
    "Discourse & Flow": [
      m("Jag läser mycket, och jag skriver lite.", "Jag läser mycket, men jag skriver lite."),
      m("Jag stannade hemma därför det regnade.", "Jag stannade hemma eftersom det regnade, därför arbetade jag online."),
      m("Slutligen läser jag texten, sedan gör jag uppgiften, först planerar jag.", "Först läser jag texten, sedan gör jag uppgiften."),
      m("Dessutom är problemet ganska enkelt.", "Faktiskt är problemet ganska enkelt."),
      m("Du kan öva på många sätt, sammanfattningsvis med dialoger.", "Du kan öva på många sätt, till exempel med dialoger."),
    ],
    Modality: [
      m("Jag borde gå nu.", "Jag måste gå nu."),
      m("Du måste sova tidigare.", "Du bör sova tidigare."),
      m("Jag vill simma.", "Jag kan simma."),
      m("Han kommer senare.", "Han kanske kommer senare."),
      m("Du kan inte röka här.", "Du får inte röka här."),
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

const repairDiscourseModalityMistakesInPack = (pack, worldKey) => {
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
  repairDiscourseModalityMistakesInPack,
};
