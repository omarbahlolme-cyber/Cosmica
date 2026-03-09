const NEGATION_UPDATES = {
  arabic: [
    {
      sourceTitle: "la for present-tense negation",
      sourceExample: "I do not go to school.",
    },
    {
      sourceTitle: "ma for past-tense negation",
      sourceExample: "Khalid did not go to the market.",
    },
    {
      sourceTitle: "lam plus a jussive verb for past negation",
      sourceExample: "Ahmad did not go to school.",
    },
    {
      sourceTitle: "lan for future negation",
      sourceExample: "I will not travel tomorrow.",
    },
    {
      sourceTitle: "laysa for nominal sentence negation",
      sourceExample: "The weather is not cold.",
    },
    {
      sourceTitle: "a negated main clause with an embedded clause",
      sourceExample: "I do not think that he came.",
    },
  ],
  chinese: [
    {
      sourceTitle: "bu for present and habitual negation",
      sourceExample: "I do not like eating apples.",
    },
    {
      sourceTitle: "mei for past experience or completed events",
      sourceExample: "I have not been to Beijing.",
    },
    {
      sourceTitle: "a time adverb before bu in present negation",
      sourceExample: "Today I am not going to school.",
    },
    {
      sourceTitle: "mei before a verb for completed actions",
      sourceExample: "He did not eat dinner.",
    },
    {
      sourceTitle: "bu before adjectives",
      sourceExample: "This apple is not sweet.",
    },
    {
      title: "\u5f97\u5b57\u8865\u8bed\u4e2d\u7684\u5426\u5b9a",
      points: [
        "\u5728'\u52a8\u8bcd + \u5f97 + \u8865\u8bed'\u91cc\uff0c'\u4e0d'\u901a\u5e38\u653e\u5728'\u5f97'\u540e\u9762\u3002",
        "\u8fd9\u79cd\u5f62\u5f0f\u5e38\u7528\u6765\u5426\u5b9a\u7a0b\u5ea6\u6216\u7ed3\u679c\u8865\u8bed\u3002",
        "\u4f8b\u5982\uff1a'\u4ed6\u8dd1\u5f97\u4e0d\u5feb\u3002'",
      ],
      ruleOrder: ["\u4e3b\u8bed", "\u52a8\u8bcd+\u5f97", "\u5426\u5b9a\u8bcd", "\u8865\u8bed"],
      exampleHighlights: [
        {
          label: "\u4e3b\u8bed",
          text: "\u4ed6",
        },
        {
          label: "\u52a8\u8bcd+\u5f97",
          text: "\u8dd1\u5f97",
        },
        {
          label: "\u5426\u5b9a\u8bcd",
          text: "\u4e0d",
        },
        {
          label: "\u8865\u8bed",
          text: "\u5feb",
        },
      ],
      sourceTitle: "bu inside de-complements for negated degree",
      sourceExample: "He does not run fast.",
    },
  ],
  dutch: [
    {
      sourceTitle: "niet for sentence negation",
      sourceExample: "I do not see it.",
    },
    {
      sourceTitle: "geen for indefinite nouns",
      sourceExample: "I have no money.",
    },
    {
      sourceTitle: "niets as a negative pronoun",
      sourceExample: "I see nothing.",
    },
    {
      sourceTitle: "niet in the perfect tense",
      sourceExample: "He has not done it.",
    },
    {
      sourceTitle: "negation in subordinate clauses",
      sourceExample: "I think that he does not want it.",
    },
    {
      sourceTitle: "negation in yes-no questions",
      sourceExample: "Do you not want to do it?",
    },
  ],
  french: [
    {
      sourceTitle: "ne... pas for basic negation",
      sourceExample: "I do not eat apples.",
    },
    {
      sourceTitle: "ne... jamais for never",
      sourceExample: "He never eats chocolate.",
    },
    {
      sourceTitle: "ne... rien for nothing",
      sourceExample: "She said nothing.",
    },
    {
      sourceTitle: "ne... personne for nobody or no one",
      sourceExample: "We will see nobody.",
    },
    {
      ruleOrder: ["sujet", "ne", "verbe", "aucun", "nom"],
      exampleHighlights: [
        {
          label: "sujet",
          text: "Il",
        },
        {
          label: "ne",
          text: "ne",
        },
        {
          label: "verbe",
          text: "reste",
        },
        {
          label: "aucun",
          text: "aucun",
        },
        {
          label: "nom",
          text: "livre",
        },
      ],
      sourceTitle: "ne... aucun with a noun phrase",
      sourceExample: "No book remains.",
    },
    {
      sourceTitle: "ne... que for only and restriction",
      sourceExample: "She only has friends.",
    },
  ],
  german: [
    {
      ruleOrder: ["Subjekt", "Verb", "nicht", "Ort"],
      exampleHighlights: [
        {
          label: "Subjekt",
          text: "Ich",
        },
        {
          label: "Verb",
          text: "gehe",
        },
        {
          label: "nicht",
          text: "nicht",
        },
        {
          label: "Ort",
          text: "zur Schule",
        },
      ],
      sourceTitle: "nicht for clause negation",
      sourceExample: "I am not going to school.",
    },
    {
      sourceTitle: "kein for noun phrase negation",
      sourceExample: "That is not a dog.",
    },
    {
      ruleOrder: ["Hauptsatz", "dass", "Subjekt", "nicht", "Verb"],
      exampleHighlights: [
        {
          label: "Hauptsatz",
          text: "Ich wei\u00df",
        },
        {
          label: "dass",
          text: "dass",
        },
        {
          label: "Subjekt",
          text: "du",
        },
        {
          label: "nicht",
          text: "nicht",
        },
        {
          label: "Verb",
          text: "kommst",
        },
      ],
      sourceTitle: "nicht in a dass-clause",
      sourceExample: "I know that you are not coming.",
    },
    {
      ruleOrder: ["Subjekt", "Hilfsverb", "nichts", "Partizip"],
      exampleHighlights: [
        {
          label: "Subjekt",
          text: "Ich",
        },
        {
          label: "Hilfsverb",
          text: "habe",
        },
        {
          label: "nichts",
          text: "nichts",
        },
        {
          label: "Partizip",
          text: "gesagt",
        },
      ],
      sourceTitle: "nichts for nothing",
      sourceExample: "I said nothing.",
    },
    {
      sourceTitle: "nicht with modal verbs",
      sourceExample: "I cannot swim.",
    },
    {
      sourceTitle: "negation in questions",
      sourceExample: "Are you not coming to the party?",
    },
  ],
  hindi: [
    {
      ruleOrder: ["\u0935\u093f\u0937\u092f", "\u0928\u0915\u093e\u0930", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      exampleHighlights: [
        {
          label: "\u0935\u093f\u0937\u092f",
          text: "\u0935\u0939",
        },
        {
          label: "\u0928\u0915\u093e\u0930",
          text: "\u0928\u0939\u0940\u0902",
        },
        {
          label: "\u0915\u094d\u0930\u093f\u092f\u093e",
          text: "\u0906\u0924\u093e",
        },
      ],
      sourceTitle: "nahin with a habitual verb",
      sourceExample: "He does not come.",
    },
    {
      ruleOrder: ["\u0935\u093f\u0937\u092f", "\u0930\u0940\u0924\u093f", "\u0928\u0915\u093e\u0930", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      exampleHighlights: [
        {
          label: "\u0935\u093f\u0937\u092f",
          text: "\u0935\u0939",
        },
        {
          label: "\u0930\u0940\u0924\u093f",
          text: "\u0905\u091a\u094d\u091b\u093e",
        },
        {
          label: "\u0928\u0915\u093e\u0930",
          text: "\u0928\u0939\u0940\u0902",
        },
        {
          label: "\u0915\u094d\u0930\u093f\u092f\u093e",
          text: "\u0917\u093e\u0924\u093e",
        },
      ],
      sourceTitle: "nahin after a manner expression",
      sourceExample: "He does not sing well.",
    },
    {
      ruleOrder: ["\u0935\u093f\u0937\u092f", "\u0935\u093f\u0936\u0947\u0937\u0923", "\u0928\u0915\u093e\u0930", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      exampleHighlights: [
        {
          label: "\u0935\u093f\u0937\u092f",
          text: "\u092f\u0939 \u0915\u093f\u0924\u093e\u092c",
        },
        {
          label: "\u0935\u093f\u0936\u0947\u0937\u0923",
          text: "\u0905\u091a\u094d\u091b\u0940",
        },
        {
          label: "\u0928\u0915\u093e\u0930",
          text: "\u0928\u0939\u0940\u0902",
        },
        {
          label: "\u0915\u094d\u0930\u093f\u092f\u093e",
          text: "\u0939\u0948",
        },
      ],
      sourceTitle: "nahin before the copula in predicate negation",
      sourceExample: "This book is not good.",
    },
    {
      ruleOrder: [
        "\u0905\u0928\u0941\u092d\u0935\u0915\u0930\u094d\u0924\u093e",
        "\u0935\u0938\u094d\u0924\u0941",
        "\u092a\u0938\u0902\u0926",
        "\u0928\u0915\u093e\u0930",
        "\u0915\u094d\u0930\u093f\u092f\u093e",
      ],
      exampleHighlights: [
        {
          label: "\u0905\u0928\u0941\u092d\u0935\u0915\u0930\u094d\u0924\u093e",
          text: "\u092e\u0941\u091d\u0947",
        },
        {
          label: "\u0935\u0938\u094d\u0924\u0941",
          text: "\u092f\u0939",
        },
        {
          label: "\u092a\u0938\u0902\u0926",
          text: "\u092a\u0938\u0902\u0926",
        },
        {
          label: "\u0928\u0915\u093e\u0930",
          text: "\u0928\u0939\u0940\u0902",
        },
        {
          label: "\u0915\u094d\u0930\u093f\u092f\u093e",
          text: "\u0939\u0948",
        },
      ],
      sourceTitle: "nahin with pasand constructions",
      sourceExample: "I do not like this.",
    },
    {
      sourceTitle: "negative yes-no questions with kya",
      sourceExample: "Did he not come?",
    },
    {
      ruleOrder: ["\u0915\u0930\u094d\u0924\u093e", "\u0915\u0930\u094d\u092e", "\u0928\u0915\u093e\u0930", "\u0915\u094d\u0930\u093f\u092f\u093e"],
      exampleHighlights: [
        {
          label: "\u0915\u0930\u094d\u0924\u093e",
          text: "\u092e\u0948\u0902\u0928\u0947",
        },
        {
          label: "\u0915\u0930\u094d\u092e",
          text: "\u0909\u0938\u0947",
        },
        {
          label: "\u0928\u0915\u093e\u0930",
          text: "\u0928\u0939\u0940\u0902",
        },
        {
          label: "\u0915\u094d\u0930\u093f\u092f\u093e",
          text: "\u0926\u0947\u0916\u093e",
        },
      ],
      sourceTitle: "nahin before the main verb in perfective clauses",
      sourceExample: "I did not see him.",
    },
  ],
  japanese: [
    {
      sourceTitle: "dewa arimasen for noun predicate negation",
      sourceExample: "He is not a student.",
    },
    {
      sourceTitle: "masen for non-past verb negation",
      sourceExample: "He does not go.",
    },
    {
      sourceTitle: "masen deshita for past polite negation",
      sourceExample: "I did not go yesterday.",
    },
    {
      sourceTitle: "dewa arimasen for na-adjective negation",
      sourceExample: "This room is not quiet.",
    },
    {
      sourceTitle: "kunai desu for i-adjective negation",
      sourceExample: "This book is not expensive.",
    },
    {
      sourceTitle: "nakutemo ii for not having to do something",
      sourceExample: "You do not have to go today.",
    },
  ],
  korean: [
    {
      sourceTitle: "an before the verb for basic negation",
      sourceExample: "I do not eat apples.",
    },
    {
      sourceTitle: "mot for inability or failed ability",
      sourceExample: "I cannot solve that problem.",
    },
    {
      sourceTitle: "an in polite speech",
      sourceExample: "I do not do that work.",
    },
    {
      sourceTitle: "jeoldae plus an for emphatic negation",
      sourceExample: "I absolutely do not watch that movie.",
    },
    {
      sourceTitle: "negative questions with an",
      sourceExample: "Do you not read that book?",
    },
    {
      ruleOrder: ["\uccab \uc808", "\ub458\uc9f8 \uc808"],
      exampleHighlights: [
        {
          label: "\uccab \uc808",
          text: "\ub098\ub294 \uadf8 \uc601\ud654\ub97c \uc548 \ubcf4\uace0",
        },
        {
          label: "\ub458\uc9f8 \uc808",
          text: "\uce5c\uad6c\ub294 \ubabb \ubd10\uc694",
        },
      ],
      sourceTitle: "mixed negative clauses with an and mot",
      sourceExample: "I do not watch that movie, and my friend cannot watch it.",
    },
  ],
  portuguese: [
    {
      sourceTitle: "nao for basic negation",
      sourceExample: "I do not like apples.",
    },
    {
      sourceTitle: "nunca for never",
      sourceExample: "I never go to the cinema.",
    },
    {
      ruleOrder: ["ningu\u00e9m", "verbo", "complemento"],
      exampleHighlights: [
        {
          label: "ningu\u00e9m",
          text: "Ningu\u00e9m",
        },
        {
          label: "verbo",
          text: "veio",
        },
        {
          label: "complemento",
          text: "\u00e0 festa",
        },
      ],
      sourceTitle: "ninguem as a negative subject",
      sourceExample: "Nobody came to the party.",
    },
    {
      sourceTitle: "sem for without phrases",
      sourceExample: "I went without you.",
    },
    {
      sourceTitle: "nao ... nada for nothing",
      sourceExample: "I did not do anything.",
    },
    {
      sourceTitle: "jamais for emphatic never",
      sourceExample: "I will never forget you.",
    },
  ],
  spanish: [
    {
      ruleOrder: ["no", "verbo", "complemento"],
      exampleHighlights: [
        {
          label: "no",
          text: "No",
        },
        {
          label: "verbo",
          text: "quiero",
        },
        {
          label: "complemento",
          text: "ir al cine",
        },
      ],
      sourceTitle: "no before the conjugated verb",
      sourceExample: "I do not want to go to the cinema.",
    },
    {
      ruleOrder: ["nunca", "verbo", "objeto"],
      exampleHighlights: [
        {
          label: "nunca",
          text: "Nunca",
        },
        {
          label: "verbo",
          text: "como",
        },
        {
          label: "objeto",
          text: "carne",
        },
      ],
      sourceTitle: "nunca as a negative adverb",
      sourceExample: "I never eat meat.",
    },
    {
      ruleOrder: ["no", "verbo", "ninguna", "sustantivo"],
      exampleHighlights: [
        {
          label: "no",
          text: "No",
        },
        {
          label: "verbo",
          text: "tengo",
        },
        {
          label: "ninguna",
          text: "ninguna",
        },
        {
          label: "sustantivo",
          text: "idea",
        },
      ],
      sourceTitle: "ningun or ninguna with nouns",
      sourceExample: "I do not have any idea.",
    },
    {
      ruleOrder: ["verbo", "sin", "complemento"],
      exampleHighlights: [
        {
          label: "verbo",
          text: "Vivo",
        },
        {
          label: "sin",
          text: "sin",
        },
        {
          label: "complemento",
          text: "preocupaciones",
        },
      ],
      sourceTitle: "sin for without phrases",
      sourceExample: "I live without worries.",
    },
    {
      ruleOrder: ["no", "pronombre", "verbo", "complemento negativo"],
      exampleHighlights: [
        {
          label: "no",
          text: "No",
        },
        {
          label: "pronombre",
          text: "le",
        },
        {
          label: "verbo",
          text: "hablo",
        },
        {
          label: "complemento negativo",
          text: "a nadie",
        },
      ],
      sourceTitle: "a nadie as a negative object",
      sourceExample: "I do not speak to anyone.",
    },
    {
      ruleOrder: ["no", "verbo", "nada", "infinitivo"],
      exampleHighlights: [
        {
          label: "no",
          text: "No",
        },
        {
          label: "verbo",
          text: "tengo",
        },
        {
          label: "nada",
          text: "nada",
        },
        {
          label: "infinitivo",
          text: "que decir",
        },
      ],
      sourceTitle: "no ... nada for nothing",
      sourceExample: "I have nothing to say.",
    },
  ],
  swedish: [
    {
      sourceTitle: "inte for basic negation",
      sourceExample: "I am not eating the apple.",
    },
    {
      sourceTitle: "inte after the auxiliary",
      sourceExample: "I am not going to eat the apple.",
    },
    {
      sourceTitle: "inte ... nagot in neutral negation",
      sourceExample: "I do not see anything.",
    },
    {
      sourceTitle: "aldrig for never",
      sourceExample: "I never eat the apple.",
    },
    {
      sourceTitle: "inte in questions",
      sourceExample: "Are you not eating the apple?",
    },
    {
      sourceTitle: "ingen with nouns",
      sourceExample: "I have no idea.",
    },
  ],
};

const applyNegationUpdates = (cards, updates) => {
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

const repairNegationInPack = (pack, worldKey) => {
  const updates = NEGATION_UPDATES[worldKey];
  const cards = pack?.grammar?.cards?.Negation;
  if (!updates || !Array.isArray(cards)) {
    return 0;
  }
  return applyNegationUpdates(cards, updates);
};

module.exports = {
  repairNegationInPack,
};
