const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "frontend", "worlds", "french", "translations.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));

const c = (title, points, example, template, wrong, fix) => ({
  title,
  points,
  example,
  template,
  mistakes: [{ wrong, fix }],
});

j.grammar = j.grammar || {};
j.grammar.sectionLabels = {
  "Sentence Structure": "Structure de la phrase",
  Verbs: "Verbes et groupes verbaux",
  "Tenses & Aspect": "Temps et aspects",
  "Nouns & Articles": "Noms, genres et articles",
  "Pronouns & Reference": "Pronoms et reprises",
  Modifiers: "Adjectifs et adverbes",
  Questions: "Interrogation",
  Negation: "Négation",
  Connections: "Connecteurs logiques",
  Conditions: "Condition et hypothèse",
  "Voice & Focus": "Voix et mise en relief",
  Modality: "Modalité et nuance",
  "Reported Speech": "Discours rapporté",
  "Formality & Style": "Registres et style",
  "Discourse & Flow": "Cohérence du discours",
};

j.grammar.cards = {
  "Sentence Structure": [
    c("ordre canonique", ["sujet avant verbe", "compléments après verbe"], "Marie lit un roman le soir.", "sujet + verbe + complément", "Lit Marie un roman le soir.", "Marie lit un roman le soir."),
    c("mise en relief c'est ... qui/que", ["focaliser un élément", "garder qui/que correct"], "C'est Paul qui prépare le dîner.", "c'est + focus + qui/que + proposition", "C'est Paul que prépare le dîner.", "C'est Paul qui prépare le dîner."),
  ],
  Verbs: [
    c("verbes irréguliers fréquents", ["être, avoir, aller, faire", "accord sujet-verbe"], "Ils vont au marché.", "sujet + verbe irrégulier + complément", "Ils va au marché.", "Ils vont au marché."),
    c("verbes pronominaux", ["pronom réfléchi avant verbe", "être aux temps composés"], "Elle se lève tôt.", "sujet + pronom réfléchi + verbe", "Elle lève se tôt.", "Elle se lève tôt."),
  ],
  "Tenses & Aspect": [
    c("passé composé", ["avoir/être + participe passé", "accord avec être"], "Nous avons terminé le chapitre.", "sujet + auxiliaire + participe passé", "Nous avons terminer le chapitre.", "Nous avons terminé le chapitre."),
    c("imparfait vs passé composé", ["imparfait = contexte", "passé composé = action ponctuelle"], "Il pleuvait quand je suis sorti.", "imparfait + quand + passé composé", "Il a plu quand je sortais.", "Il pleuvait quand je suis sorti."),
  ],
  "Nouns & Articles": [
    c("genre et article", ["mémoriser nom + article", "accorder genre"], "La table est près du mur.", "article + nom", "Le table est près du mur.", "La table est près du mur."),
    c("articles partitifs", ["du, de la, de l', des", "de après négation complète"], "Nous buvons du thé.", "verbe + article partitif + nom", "Nous buvons de thé.", "Nous buvons du thé."),
  ],
  "Pronouns & Reference": [
    c("pronoms COD/COI", ["le/la/les avant verbe", "lui/leur pour COI"], "Je la connais bien.", "sujet + pronom + verbe", "Je connais la bien.", "Je la connais bien."),
    c("pronoms y et en", ["y = lieu / à + chose", "en = de + chose / quantité"], "Tu vas à Paris ? Oui, j'y vais.", "question + reprise avec y/en", "Tu vas à Paris ? Oui, je vais y.", "Tu vas à Paris ? Oui, j'y vais."),
  ],
  Modifiers: [
    c("accord des adjectifs", ["genre + nombre", "formes féminines/plurielles"], "Ces filles sont contentes.", "nom + adjectif accordé", "Ces filles sont contents.", "Ces filles sont contentes."),
    c("comparatif et superlatif", ["plus/moins/aussi ... que", "le plus / le moins"], "Ce film est plus long que l'autre.", "comparatif + que", "Ce film est plus long comme l'autre.", "Ce film est plus long que l'autre."),
  ],
  Questions: [
    c("question avec est-ce que", ["registre neutre", "ordre sujet-verbe conservé"], "Est-ce que vous avez fini ?", "est-ce que + sujet + verbe", "Est-ce que avez vous fini ?", "Est-ce que vous avez fini ?"),
    c("inversion sujet-verbe", ["trait d'union", "t euphonique si besoin"], "Parle-t-il français ?", "verbe-pronom + complément", "Parle il français ?", "Parle-t-il français ?"),
  ],
  Negation: [
    c("ne ... pas", ["ne avant verbe", "pas après verbe"], "Je ne comprends pas.", "sujet + ne + verbe + pas", "Je comprends ne pas.", "Je ne comprends pas."),
    c("ne ... jamais / plus", ["jamais = aucune fois", "plus = arrêt"], "Elle n'arrive jamais en retard.", "sujet + ne + verbe + jamais/plus", "Elle arrive jamais en retard.", "Elle n'arrive jamais en retard."),
  ],
  Connections: [
    c("cause et conséquence", ["parce que / car", "donc / alors"], "Le train est annulé, donc nous attendons.", "proposition + connecteur + proposition", "Le train est annulé donc, nous attendons.", "Le train est annulé, donc nous attendons."),
    c("opposition et concession", ["mais / pourtant / cependant", "relier deux idées"], "Il est fatigué, mais il continue.", "proposition + connecteur d'opposition + proposition", "Il est fatigué, pourtant mais il continue.", "Il est fatigué, mais il continue."),
  ],
  Conditions: [
    c("si + présent, futur", ["condition réelle", "futur en principale"], "Si tu étudies, tu réussiras.", "si + présent, futur simple", "Si tu étudieras, tu réussiras.", "Si tu étudies, tu réussiras."),
    c("si + imparfait, conditionnel", ["hypothèse", "résultat conditionnel"], "Si j'avais le temps, je voyagerais.", "si + imparfait, conditionnel présent", "Si j'aurais le temps, je voyagerais.", "Si j'avais le temps, je voyagerais."),
  ],
  "Voice & Focus": [
    c("voix passive", ["être + participe passé", "accord du participe"], "Le repas est préparé par le chef.", "sujet patient + être + participe passé", "Le repas est préparer par le chef.", "Le repas est préparé par le chef."),
    c("présentatifs et focalisation", ["il y a / voici / voilà", "c'est ... qui/que"], "C'est demain que nous partons.", "présentatif / focalisation", "C'est demain qui nous partons.", "C'est demain que nous partons."),
  ],
  Modality: [
    c("obligation et conseil", ["devoir, il faut", "conditionnel de politesse"], "Vous devriez vous reposer.", "sujet + modal + infinitif", "Vous devriez vous repose.", "Vous devriez vous reposer."),
    c("possibilité et probabilité", ["pouvoir", "peut-être / probablement"], "Il est probablement déjà parti.", "sujet + adverbe modal + verbe", "Il probablement est déjà parti.", "Il est probablement déjà parti."),
  ],
  "Reported Speech": [
    c("discours indirect", ["dire que", "adapter temps et repères"], "Il a dit qu'il viendrait le lendemain.", "verbe introducteur + que + proposition", "Il a dit qu'il viendra le lendemain.", "Il a dit qu'il viendrait le lendemain."),
    c("questions rapportées", ["demander si / pourquoi", "ordre déclaratif en subordonnée"], "Elle a demandé si nous étions prêts.", "demander + si/mot interrogatif + proposition", "Elle a demandé si étions-nous prêts.", "Elle a demandé si nous étions prêts."),
  ],
  "Formality & Style": [
    c("tu / vous", ["choisir selon relation", "rester cohérent dans l'échange"], "Bonjour Madame, vous avez un moment ?", "formule + vous + verbe", "Bonjour Madame, tu as un moment ?", "Bonjour Madame, vous avez un moment ?"),
    c("politesse écrite", ["formules d'ouverture et clôture", "conditionnel de demande"], "Pourriez-vous me confirmer la date ?", "conditionnel de politesse + infinitif", "Confirmez-moi la date.", "Pourriez-vous me confirmer la date ?"),
  ],
  "Discourse & Flow": [
    c("enchaînement logique", ["d'abord, ensuite, enfin", "progression claire"], "D'abord nous observons, ensuite nous analysons.", "connecteur + proposition", "D'abord ensuite nous observons.", "D'abord nous observons, ensuite nous analysons."),
    c("reformulation et synthèse", ["c'est-à-dire / autrement dit", "en résumé / en bref"], "En résumé, la solution reste efficace.", "marqueur de synthèse + idée principale", "En résumé, et aussi un autre sujet.", "En résumé, la solution reste efficace."),
  ],
};

fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`, "utf8");
console.log("French grammar rewritten.");
