const CONDITION_UPDATES = {
  arabic: [
    {
      title: "إذا للشرط المحتمل",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "idha for likely conditions",
      sourceExample: "If I go to the market, I will buy fruit.",
    },
    {
      title: "لو للشرط غير الواقعي",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "law for unreal present conditions",
      sourceExample: "If I were rich, I would buy a big house.",
    },
    {
      title: "إذا مع نتيجة مستقبلية",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "idha with a future result",
      sourceExample: "If you study well, you will succeed in the exam.",
    },
    {
      title: "لو للماضي المخالف للواقع",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "law for past counterfactual conditions",
      sourceExample: "If you had studied, you would have succeeded.",
    },
    {
      title: "إذا للحالة المتكررة",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "idha for repeated conditions",
      sourceExample: "If you are at home, I will be happy.",
    },
    {
      title: "إذا للاحتمال المتوقع",
      ruleOrder: ["أداة الشرط", "جملة الشرط", "جملة النتيجة"],
      sourceTitle: "idha for an expected condition",
      sourceExample: "If the weather is nice, we will go out.",
    },
  ],
  chinese: [
    {
      sourceTitle: "ru guo ... jiu for standard if-then conditions",
      sourceExample: "If it rains tomorrow, then we will not go to the park.",
    },
    {
      sourceTitle: "yao shi ... jiu for conversational conditions",
      sourceExample: "If you have time, then come to my home.",
    },
    {
      sourceTitle: "zhi yao ... jiu for sufficient conditions",
      sourceExample: "As long as you work hard, you can succeed.",
    },
    {
      sourceTitle: "jia ru with hui in the result clause",
      sourceExample: "If there is an exam tomorrow, I will review.",
    },
    {
      sourceTitle: "ji shi ... ye for concessive conditions",
      sourceExample: "Even if it rains, I will still go running.",
    },
    {
      sourceTitle: "chu fei ... fou ze for unless otherwise",
      sourceExample: "Unless you come, otherwise I will not go.",
    },
  ],
  dutch: [
    {
      ruleOrder: ["voorwaardezin", "hoofdzin"],
      sourceTitle: "als for real conditions",
      sourceExample: "If it rains, I will take an umbrella.",
    },
    {
      ruleOrder: ["voorwaardezin", "resultaatzin"],
      sourceTitle: "als with zou for hypothetical conditions",
      sourceExample: "If I were rich, I would buy a house.",
    },
    {
      ruleOrder: ["hoofdzin", "tenzij-zin"],
      sourceTitle: "tenzij for unless clauses",
      sourceExample: "I am going to the party unless it rains.",
    },
    {
      ruleOrder: ["voorwaardezin", "resultaatzin"],
      sourceTitle: "als with zou in more complex hypotheticals",
      sourceExample: "If I had more time, I would read more often.",
    },
    {
      ruleOrder: ["toegevingszin", "hoofdzin"],
      sourceTitle: "ook al for concessive conditions",
      sourceExample: "Even if it rains, I am going outside.",
    },
    {
      ruleOrder: ["hoofdzin", "mits-zin"],
      sourceTitle: "mits for provided-that conditions",
      sourceExample: "I will come provided that you pick me up.",
    },
  ],
  french: [
    {
      title: "Si + imparfait, conditionnel présent",
      ruleOrder: ["proposition en si", "résultat"],
      sourceTitle: "si + imperfect with present conditional",
      sourceExample: "If I had money, I would buy a car.",
    },
    {
      title: "Si + plus-que-parfait, conditionnel passé",
      ruleOrder: ["proposition en si", "résultat"],
      sourceTitle: "si + pluperfect with past conditional",
      sourceExample: "If I had known, I would not have come.",
    },
    {
      title: "Si + présent, futur",
      points: [
        "Utilisé pour exprimer une condition réelle ou probable dans l'avenir.",
        "Après 'si', on emploie ici le présent, pas le futur.",
        "Exemple : Si tu étudies, tu réussiras."
      ],
      ruleOrder: ["proposition en si", "résultat"],
      sourceTitle: "si + present with future result",
      sourceExample: "If you study, you will succeed.",
    },
    {
      title: "Au cas où + conditionnel",
      ruleOrder: ["proposition de précaution", "résultat"],
      sourceTitle: "au cas ou + conditional for precautions",
      sourceExample: "In case it rains, take an umbrella.",
    },
    {
      title: "Si + présent, impératif",
      ruleOrder: ["proposition en si", "impératif"],
      sourceTitle: "si + present with imperative result",
      sourceExample: "If you want, do it now.",
    },
    {
      title: "À condition que + subjonctif",
      ruleOrder: ["condition", "résultat"],
      sourceTitle: "a condition que + subjunctive",
      sourceExample: "Provided that you are ready, we will leave.",
    },
  ],
  german: [
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "wenn for real conditions",
      sourceExample: "If it rains, I stay at home.",
    },
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "wenn with Konjunktiv II for hypothetical conditions",
      sourceExample: "If I were rich, I would travel.",
    },
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "wenn for past counterfactual conditions",
      sourceExample: "If I had known that, I would have come.",
    },
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "conditional clause with a modal result",
      sourceExample: "If I had more time, I could study.",
    },
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "alternative conditions inside a wenn clause",
      sourceExample: "If it rains or snows tomorrow, I will stay at home.",
    },
    {
      ruleOrder: ["wenn-Satz", "Hauptsatz"],
      sourceTitle: "past counterfactual condition with explicit time reference",
      sourceExample: "If I had known yesterday, I would have come.",
    },
  ],
  hindi: [
    {
      title: "यदि ... तो ... वास्तविक शर्त",
      ruleOrder: ["शर्त सूचक", "शर्त खंड", "परिणाम खंड"],
      sourceTitle: "yadi ... to for real conditions",
      sourceExample: "If you study, then you will pass.",
    },
    {
      title: "अगर ... तो ... संभावित भविष्य",
      ruleOrder: ["शर्त सूचक", "शर्त खंड", "परिणाम खंड"],
      sourceTitle: "agar ... to for likely future conditions",
      sourceExample: "If he comes, then we will play.",
      example: "अगर वह आएगा, तो हम खेलेंगे।",
      mistakes: [
        {
          wrong: "अगर वह आए, तो हम खेलेंगे।",
          fix: "अगर वह आएगा, तो हम खेलेंगे।"
        }
      ]
    },
    {
      title: "अगर ... तो ... अतीत की अवास्तविक शर्त",
      ruleOrder: ["शर्त सूचक", "शर्त खंड", "परिणाम खंड"],
      sourceTitle: "agar for past counterfactual conditions",
      sourceExample: "If you had come, then we would have met.",
      example: "अगर तुम आए होते, तो हम मिलते।",
      mistakes: [
        {
          wrong: "अगर तुम आए, तो हम मिलते।",
          fix: "अगर तुम आए होते, तो हम मिलते।"
        }
      ]
    },
    {
      title: "यदि ... तो ... नकारात्मक परिणाम",
      ruleOrder: ["शर्त सूचक", "शर्त खंड", "परिणाम खंड"],
      sourceTitle: "yadi ... to with a negative result",
      sourceExample: "If it rains, then we will not go.",
    },
    {
      title: "जब तक ... नहीं ...",
      points: [
        "'जब तक ... नहीं' यह दिखाता है कि शर्त पूरी होने से पहले परिणाम नहीं होगा।",
        "यह सीमा, रोक या 'unless / until' जैसी नकारात्मक शर्त दिखा सकता है।",
        "उदाहरण: 'जब तक तुम तैयार नहीं हो, हम नहीं चलेंगे।'"
      ],
      example: "जब तक तुम तैयार नहीं हो, हम नहीं चलेंगे।",
      ruleOrder: ["शर्त सूचक", "शर्त खंड", "परिणाम खंड"],
      exampleHighlights: [
        {
          label: "शर्त सूचक",
          text: "जब तक"
        },
        {
          label: "शर्त खंड",
          text: "तुम तैयार नहीं हो"
        },
        {
          label: "परिणाम खंड",
          text: "हम नहीं चलेंगे"
        }
      ],
      mistakes: [
        {
          wrong: "जब तक तुम तैयार हो, हम नहीं चलेंगे।",
          fix: "जब तक तुम तैयार नहीं हो, हम नहीं चलेंगे।"
        }
      ],
      sourceTitle: "jab tak ... nahin for until or unless conditions",
      sourceExample: "Until you are ready, we will not leave.",
    },
    {
      title: "चाहे ... फिर भी ...",
      points: [
        "'चाहे ... फिर भी ...' रियायती शर्त दिखाता है: बाधा के बावजूद परिणाम बना रहता है।",
        "यह 'even if' जैसी concessive meaning देता है।",
        "उदाहरण: 'चाहे बारिश हो, फिर भी हम जाएंगे।'"
      ],
      example: "चाहे बारिश हो, फिर भी हम जाएंगे।",
      ruleOrder: ["रियायती सूचक", "रियायती खंड", "परिणाम खंड"],
      exampleHighlights: [
        {
          label: "रियायती सूचक",
          text: "चाहे"
        },
        {
          label: "रियायती खंड",
          text: "बारिश हो"
        },
        {
          label: "परिणाम खंड",
          text: "फिर भी हम जाएंगे"
        }
      ],
      mistakes: [
        {
          wrong: "चाहे बारिश हो, हम नहीं जाएंगे।",
          fix: "चाहे बारिश हो, फिर भी हम जाएंगे।"
        }
      ],
      sourceTitle: "chahe ... phir bhi for concessive conditions",
      sourceExample: "Even if it rains, we will still go.",
    },
  ],
  japanese: [
    {
      sourceTitle: "tara for event-dependent conditions",
      sourceExample: "If it rains, I will not go out.",
    },
    {
      sourceTitle: "ba for conditional assumptions",
      sourceExample: "If I have time, I will help.",
    },
    {
      sourceTitle: "nara for topic-based conditions",
      sourceExample: "If you are going to Japan, please go to Kyoto too.",
    },
    {
      sourceTitle: "to for automatic or habitual results",
      sourceExample: "When spring comes, cherry blossoms bloom.",
    },
    {
      sourceTitle: "nakereba for negative conditions",
      sourceExample: "If there is no money, I cannot buy it.",
    },
    {
      sourceTitle: "temo for concessive conditions",
      sourceExample: "Even if it rains, I will go.",
    },
  ],
  korean: [
    {
      title: "-(으)면 기본 조건",
      ruleOrder: ["조건절", "결과절"],
      sourceTitle: "eumyeon for basic conditions",
      sourceExample: "If it rains, I will stay at home.",
    },
    {
      title: "-고 ... -(으)면 복합 조건",
      ruleOrder: ["조건 1", "조건 2", "결과절"],
      sourceTitle: "stacked conditions with go and eumyeon",
      sourceExample: "If it rains and the wind blows, I will stay at home.",
    },
    {
      title: "-다면 가정적 조건",
      ruleOrder: ["가정절", "결과절"],
      sourceTitle: "damyeon for hypothetical conditions",
      sourceExample: "If I were rich, I would travel.",
    },
    {
      title: "-면 / -다면의 뉘앙스",
      ruleOrder: ["조건절", "결과절"],
      sourceTitle: "nuance difference between myeon and damyeon",
      sourceExample: "If I have time, I will watch a movie.",
    },
    {
      title: "-지 않으면 부정 조건",
      ruleOrder: ["부정 조건절", "결과절"],
      sourceTitle: "ji anheumyeon for negative conditions",
      sourceExample: "If it does not rain, we will go out.",
    },
    {
      title: "-았/었으면 과거 가정",
      ruleOrder: ["과거 조건절", "결과절"],
      sourceTitle: "asseosseumyeon for past counterfactual conditions",
      sourceExample: "If it had rained yesterday, we would have stayed home.",
    },
  ],
  portuguese: [
    {
      ruleOrder: ["resultado", "oração com se"],
      sourceTitle: "main clause plus se-clause in the simple conditional",
      sourceExample: "I would speak if you invited me.",
    },
    {
      ruleOrder: ["resultado", "oração com se"],
      sourceTitle: "compound conditional with a se-clause",
      sourceExample: "I would have gone if I had known.",
    },
    {
      ruleOrder: ["oração com se", "resultado"],
      sourceTitle: "se + imperfeito do subjuntivo with conditional result",
      sourceExample: "If I had money, I would buy a car.",
    },
    {
      ruleOrder: ["oração com se", "resultado"],
      sourceTitle: "se + imperfeito do subjuntivo for unreal conditions",
      sourceExample: "If I were rich, I would travel the world.",
    },
    {
      ruleOrder: ["oração com se", "resultado"],
      sourceTitle: "se + future-oriented condition",
      sourceExample: "If you study, you will pass the exam.",
    },
    {
      ruleOrder: ["oração com se", "resultado"],
      sourceTitle: "mixed conditional with a present result",
      sourceExample: "If I had studied, I would now be prepared.",
    },
  ],
  spanish: [
    {
      title: "Si + imperfecto de subjuntivo, condicional simple",
      points: [
        "Se utiliza para hablar de situaciones hipotéticas en el presente o el futuro.",
        "La prótasis lleva imperfecto de subjuntivo y la consecuencia suele ir en condicional.",
        "Ejemplo: 'Yo comería si tuviera hambre.'"
      ],
      ruleOrder: ["condición", "resultado"],
      sourceTitle: "si + imperfect subjunctive with simple conditional",
      sourceExample: "I would eat if I were hungry.",
    },
    {
      title: "Si + pluscuamperfecto de subjuntivo, condicional compuesto",
      points: [
        "Se usa para hablar de situaciones hipotéticas no cumplidas en el pasado.",
        "La prótasis lleva pluscuamperfecto de subjuntivo y la consecuencia suele ir en condicional compuesto.",
        "Ejemplo: 'Yo habría comido si hubiera tenido hambre.'"
      ],
      ruleOrder: ["condición", "resultado"],
      sourceTitle: "si + pluperfect subjunctive with compound conditional",
      sourceExample: "I would have eaten if I had been hungry.",
    },
    {
      title: "Si + presente, futuro",
      points: [
        "Se utiliza para condiciones reales o probables.",
        "La prótasis va en presente y la consecuencia puede ir en futuro o en imperativo.",
        "Ejemplo: 'Si estudias, aprobarás el examen.'"
      ],
      example: "Si estudias, aprobarás el examen.",
      ruleOrder: ["condición", "resultado"],
      exampleHighlights: [
        {
          label: "condición",
          text: "Si estudias"
        },
        {
          label: "resultado",
          text: "aprobarás el examen"
        }
      ],
      mistakes: [
        {
          wrong: "Si estudiarás, aprobarás el examen.",
          fix: "Si estudias, aprobarás el examen."
        }
      ],
      sourceTitle: "si + present with future result",
      sourceExample: "If you study, you will pass the exam.",
    },
    {
      title: "A menos que + subjuntivo",
      points: [
        "A menos que introduce una condición negativa, parecida a 'unless'.",
        "Después de esta expresión suele aparecer el subjuntivo.",
        "Ejemplo: 'A menos que llueva, iremos al parque.'"
      ],
      example: "A menos que llueva, iremos al parque.",
      ruleOrder: ["condición", "resultado"],
      exampleHighlights: [
        {
          label: "condición",
          text: "A menos que llueva"
        },
        {
          label: "resultado",
          text: "iremos al parque"
        }
      ],
      mistakes: [
        {
          wrong: "A menos que llueve, iremos al parque.",
          fix: "A menos que llueva, iremos al parque."
        }
      ],
      sourceTitle: "a menos que + subjunctive",
      sourceExample: "Unless it rains, we will go to the park.",
    },
    {
      title: "Con tal de que + subjuntivo",
      points: [
        "Con tal de que expresa una condición suficiente: algo ocurre siempre que la condición se cumpla.",
        "Después de esta locución se usa normalmente el subjuntivo.",
        "Ejemplo: 'Con tal de que estudies, aprobarás el examen.'"
      ],
      example: "Con tal de que estudies, aprobarás el examen.",
      ruleOrder: ["condición", "resultado"],
      exampleHighlights: [
        {
          label: "condición",
          text: "Con tal de que estudies"
        },
        {
          label: "resultado",
          text: "aprobarás el examen"
        }
      ],
      mistakes: [
        {
          wrong: "Con tal de que estudias, aprobarás el examen.",
          fix: "Con tal de que estudies, aprobarás el examen."
        }
      ],
      sourceTitle: "con tal de que + subjunctive",
      sourceExample: "Provided that you study, you will pass the exam.",
    },
    {
      title: "Siempre que + subjuntivo",
      points: [
        "Siempre que introduce una condición repetida o general.",
        "Con valor condicional suele ir con subjuntivo.",
        "Ejemplo: 'Siempre que tengas tiempo, ven a verme.'"
      ],
      example: "Siempre que tengas tiempo, ven a verme.",
      ruleOrder: ["condición", "resultado"],
      exampleHighlights: [
        {
          label: "condición",
          text: "Siempre que tengas tiempo"
        },
        {
          label: "resultado",
          text: "ven a verme"
        }
      ],
      mistakes: [
        {
          wrong: "Siempre que tienes tiempo, ven a verme.",
          fix: "Siempre que tengas tiempo, ven a verme."
        }
      ],
      sourceTitle: "siempre que + subjunctive",
      sourceExample: "Whenever you have time, come see me.",
    },
  ],
  swedish: [
    {
      ruleOrder: ["om-sats", "huvudsats"],
      sourceTitle: "om for real conditions",
      sourceExample: "If it rains, we stay home.",
    },
    {
      ruleOrder: ["om-sats", "huvudsats"],
      sourceTitle: "om with skulle for hypothetical conditions",
      sourceExample: "If I had money, I would travel.",
    },
    {
      ruleOrder: ["om-sats", "imperativ"],
      sourceTitle: "om with an imperative result",
      sourceExample: "If you want help, ask me.",
    },
    {
      ruleOrder: ["om-sats", "huvudsats"],
      sourceTitle: "vore in literary or formal hypotheticals",
      sourceExample: "If I were rich, I would help others.",
    },
    {
      ruleOrder: ["om-sats", "huvudsats"],
      sourceTitle: "future-oriented condition with om",
      sourceExample: "If it becomes sunny, we will go out.",
    },
    {
      ruleOrder: ["om-sats", "huvudsats"],
      sourceTitle: "combined conditions in one om clause",
      sourceExample: "If it rains and I am home, I stay inside.",
    },
  ],
};

const applyConditionUpdates = (cards, updates) => {
  if (!Array.isArray(cards) || !Array.isArray(updates)) {
    return 0;
  }
  let changed = 0;
  updates.forEach((update, index) => {
    if (!cards[index] || !update) {
      return;
    }
    const card = cards[index];
    let cardChanged = false;
    Object.entries(update).forEach(([key, value]) => {
      if (JSON.stringify(card[key]) !== JSON.stringify(value)) {
        card[key] = value;
        cardChanged = true;
      }
    });
    if (cardChanged) {
      changed += 1;
    }
  });
  return changed;
};

const applySpanishConditionExampleRepairs = (cards) => {
  if (!Array.isArray(cards) || cards.length < 2) {
    return 0;
  }
  const patches = [
    {
      index: 0,
      values: {
        points: [
          "Se utiliza para hablar de situaciones hipot\u00e9ticas en el presente o el futuro.",
          "La pr\u00f3tasis lleva imperfecto de subjuntivo y la consecuencia suele ir en condicional.",
          "Ejemplo: 'Si tuviera hambre, yo comer\u00eda.'",
        ],
        example: "Si tuviera hambre, yo comer\u00eda.",
        ruleOrder: ["condici\u00f3n", "resultado"],
        exampleHighlights: [
          {
            label: "condici\u00f3n",
            text: "Si tuviera hambre",
          },
          {
            label: "resultado",
            text: "yo comer\u00eda",
          },
        ],
        mistakes: [
          {
            wrong: "Si tendr\u00eda hambre, yo comer\u00eda.",
            fix: "Si tuviera hambre, yo comer\u00eda.",
          },
        ],
      },
    },
    {
      index: 1,
      values: {
        points: [
          "Se usa para hablar de situaciones hipot\u00e9ticas no cumplidas en el pasado.",
          "La pr\u00f3tasis lleva pluscuamperfecto de subjuntivo y la consecuencia suele ir en condicional compuesto.",
          "Ejemplo: 'Si hubiera tenido hambre, habr\u00eda comido.'",
        ],
        example: "Si hubiera tenido hambre, habr\u00eda comido.",
        ruleOrder: ["condici\u00f3n", "resultado"],
        exampleHighlights: [
          {
            label: "condici\u00f3n",
            text: "Si hubiera tenido hambre",
          },
          {
            label: "resultado",
            text: "habr\u00eda comido",
          },
        ],
        mistakes: [
          {
            wrong: "Si habr\u00eda tenido hambre, habr\u00eda comido.",
            fix: "Si hubiera tenido hambre, habr\u00eda comido.",
          },
        ],
      },
    },
  ];

  let changed = 0;
  patches.forEach(({ index, values }) => {
    const card = cards[index];
    if (!card) {
      return;
    }
    let cardChanged = false;
    Object.entries(values).forEach(([key, value]) => {
      if (JSON.stringify(card[key]) !== JSON.stringify(value)) {
        card[key] = value;
        cardChanged = true;
      }
    });
    if (cardChanged) {
      changed += 1;
    }
  });
  return changed;
};

const repairConditionsInPack = (pack, worldKey) => {
  const updates = CONDITION_UPDATES[worldKey];
  const cards = pack?.grammar?.cards?.Conditions;
  if (!updates || !Array.isArray(cards)) {
    return 0;
  }
  let changed = applyConditionUpdates(cards, updates);
  if (worldKey === "spanish") {
    changed += applySpanishConditionExampleRepairs(cards);
  }
  return changed;
};

module.exports = {
  repairConditionsInPack,
};
