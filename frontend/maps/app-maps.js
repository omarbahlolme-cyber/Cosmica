/* ==========================================================================
   MAPS BUNDLE
   Loaded only on words/phrases/grammar pages. Contains heavy datasets,
   translation hydration, map rendering, and grammar modal behavior.
   ========================================================================== */
/* ==========================================================================
   LEARNING DATASETS
   Source lists for words, phrases, and grammar used by map renderers/translations.
   ========================================================================== */
const BASE_LANGUAGES = [
  "albanian",
  "arabic",
  "bulgarian",
  "chinese",
  "croatian",
  "czech",
  "dutch",
  "finnish",
  "german",
  "greek",
  "hebrew",
  "hindi",
  "indonesian",
  "italian",
  "japanese",
  "korean",
  "kurdish",
  "malaysian",
  "norwegian",
  "persian",
  "polish",
  "romanian",
  "russian",
  "somali",
  "spanish",
  "swedish",
  "tagalog",
  "thai",
  "turkish",
  "ukrainian",
  "urdu",
  "uzbek",
  "vietnamese",
];
/* --------------------------------------------------------------------------
   QUICK NAVIGATION (BEGINNER MAP)
   1) Learning datasets (words/phrases/grammar source lists)
   2) Translation caches/loaders and world-pack hydration
   3) Dynamic map renderers (words/phrases/grammar sections + filters)
   4) Grammar modal and explanation runtime translation
   5) Map-page bootstrap and post-hydration refresh flow
   -------------------------------------------------------------------------- */
const MAPS_INVALID_BASE_LANGUAGE_SENTINELS = new Set([
  "none",
  "no-base",
  "nobase",
  "skip",
  "null",
  "undefined",
]);
const normalizeMapsBaseLanguagePreference = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized || MAPS_INVALID_BASE_LANGUAGE_SENTINELS.has(normalized)) {
    return "";
  }
  return normalized;
};
const readMapsBaseLanguagePreference = () =>
  normalizeMapsBaseLanguagePreference(localStorage.getItem("cosmicaBaseLanguage"));

const WORD_SECTION_ORDER = [
  "Greetings",
  "Pronouns",
  "Verbs & Tenses",
  "Questions & Connectors",
  "Numbers & Counting",
  "Time, Date & Frequency",
  "Descriptions & Adjectives",
  "Opinions & Preferences",
  "Weather & Seasons",
  "Places & Directions",
  "countries",
  "Feelings & States",
  "Family & Relationships",
  "Food & Eating",
  "Health & Body",
  "Technology & Communication",
  "Work & School",
];

const WORD_SECTION_LISTS = {
  Greetings: [
    "hi",
    "hello",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "goodbye",
    "bye",
    "see you",
    "take care",
    "welcome",
    "excuse me",
    "sorry",
    "thank you",
    "you're welcome",
    "thanks",
    "good day",
    "how are you",
    "nice to meet you",
    "pleased to meet you",
    "see you later",
    "see you soon",
    "see you tomorrow",
    "have a nice day",
    "have a good day",
    "good luck",
    "welcome back",
    "no problem",
  ],
  Pronouns: [
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "its",
    "our",
    "their",
    "mine",
    "yours",
    "hers",
    "ours",
    "theirs",
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "themselves",
    "this",
    "that",
    "these",
    "those",
    "someone",
    "anyone",
    "everyone",
    "nobody",
    "something",
    "anything",
    "everything",
    "nothing",
    "everybody",
    "somebody",
    "anybody",
    "no one",
    "each",
    "either",
    "neither",
    "both",
    "all",
    "none",
    "each other",
    "one another",
  ],
  "Verbs & Tenses": [
    "be",
    "have",
    "do",
    "go",
    "get",
    "make",
    "take",
    "come",
    "see",
    "look",
    "hear",
    "say",
    "tell",
    "ask",
    "give",
    "bring",
    "put",
    "keep",
    "find",
    "leave",
    "move",
    "live",
    "open",
    "close",
    "start",
    "finish",
    "play",
    "read",
    "write",
    "speak",
    "listen",
    "learn",
    "help",
    "travel",
    "drive",
    "walk",
    "run",
    "sleep",
    "cook",
    "buy",
    "sell",
    "pay",
    "use",
    "eat",
    "drink",
    "teach",
    "understand",
    "remember",
    "forget",
    "wait",
    "stay",
    "arrive",
    "return",
    "meet",
    "visit",
    "send",
    "receive",
    "answer",
    "explain",
    "repeat",
    "practice",
    "plan",
    "decide",
    "try",
    "change",
    "build",
    "fix",
    "stop",
    "stand",
    "sit",
    "turn",
    "carry",
    "hold",
    "wear",
    "wash",
    "grow",
    "win",
    "lose",
    "join",
    "share",
    "order",
    "follow",
    "save",
  ],
  "Questions & Connectors": [
    "who",
    "what",
    "where",
    "when",
    "why",
    "how",
    "which",
    "whose",
    "how many",
    "how much",
    "and",
    "but",
    "or",
    "so",
    "because",
    "if",
    "then",
    "also",
    "before",
    "after",
    "while",
    "since",
    "until",
    "although",
    "however",
    "whom",
    "where from",
    "what time",
    "how long",
    "how often",
    "whether",
    "unless",
    "yet",
    "still",
    "therefore",
    "so that",
    "in case",
    "because of",
    "as",
    "than",
    "through",
    "without",
    "with",
    "about",
    "for",
    "from",
    "to",
    "into",
    "over",
    "under",
    "between",
    "around",
    "across",
    "behind",
    "in front of",
    "next to",
    "past",
  ],
  "Numbers & Counting": [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
    "hundred",
    "thousand",
    "million",
    "billion",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eighth",
    "ninth",
    "tenth",
    "last",
    "eleventh",
    "twelfth",
    "thirteenth",
    "fourteenth",
    "fifteenth",
    "sixteenth",
    "seventeenth",
    "eighteenth",
    "nineteenth",
    "twentieth",
    "thirtieth",
    "fortieth",
    "fiftieth",
    "sixtieth",
    "seventieth",
    "eightieth",
    "ninetieth",
    "hundredth",
    "thousandth",
    "millionth",
    "billionth",
    "half",
    "quarter",
    "dozen",
    "pair",
    "couple",
  ],
  "Time, Date & Frequency": [
    "time",
    "clock",
    "hour",
    "minute",
    "second",
    "day",
    "week",
    "month",
    "year",
    "today",
    "tomorrow",
    "yesterday",
    "dawn",
    "morning",
    "afternoon",
    "dusk",
    "evening",
    "night",
    "weekend",
    "date",
    "calendar",
    "holiday",
    "now",
    "later",
    "soon",
    "early",
    "late",
    "always",
    "usually",
    "often",
    "sometimes",
    "rarely",
    "never",
    "moment",
    "midday",
    "noon",
    "midnight",
    "tonight",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "hourly",
    "once",
    "twice",
    "occasionally",
    "frequently",
  ],
  "Descriptions & Adjectives": [
    "good",
    "bad",
    "big",
    "small",
    "new",
    "old",
    "young",
    "beautiful",
    "ugly",
    "easy",
    "hard",
    "fast",
    "slow",
    "clean",
    "dirty",
    "rich",
    "poor",
    "high",
    "low",
    "short",
    "long",
    "strong",
    "weak",
    "quiet",
    "loud",
    "safe",
    "dangerous",
    "simple",
    "difficult",
    "important",
    "different",
    "same",
    "open",
    "closed",
    "full",
    "empty",
    "bright",
    "dark",
    "tall",
    "wide",
    "narrow",
    "deep",
    "shallow",
    "heavy",
    "light",
    "soft",
    "smooth",
    "rough",
    "sharp",
    "dull",
    "cheap",
    "expensive",
    "busy",
    "free",
    "ready",
    "available",
    "possible",
    "impossible",
    "correct",
    "wrong",
    "friendly",
    "kind",
    "polite",
    "rude",
    "brave",
    "careful",
    "famous",
    "local",
    "foreign",
    "modern",
    "ancient",
    "fresh",
    "stale",
    "round",
    "square",
    "flat",
    "thin",
    "thick",
    "dry",
    "wet",
  ],
  "Opinions & Preferences": [
    "like",
    "love",
    "prefer",
    "enjoy",
    "hate",
    "want",
    "need",
    "think",
    "believe",
    "agree",
    "disagree",
    "favorite",
    "best",
    "worst",
    "choose",
    "opinion",
    "choice",
    "suggest",
    "recommend",
    "wish",
    "guess",
    "maybe",
    "probably",
    "perhaps",
    "definitely",
    "certainly",
    "depends",
    "matter",
  ],
  "Weather & Seasons": [
    "weather",
    "sun",
    "sunny",
    "rain",
    "rainy",
    "snow",
    "snowy",
    "wind",
    "windy",
    "cloud",
    "cloudy",
    "storm",
    "fog",
    "hot",
    "warm",
    "cold",
    "cool",
    "temperature",
    "spring",
    "summer",
    "autumn",
    "winter",
    "forecast",
    "breeze",
    "drizzle",
    "thunder",
    "lightning",
    "hail",
    "stormy",
    "foggy",
    "humid",
    "humidity",
    "dry",
    "wet",
    "icy",
    "freezing",
    "heat",
    "sunrise",
    "sunset",
    "rainbow",
  ],
  "Places & Directions": [
    "home",
    "city",
    "town",
    "village",
    "street",
    "road",
    "way",
    "corner",
    "left",
    "right",
    "straight",
    "north",
    "south",
    "east",
    "west",
    "inside",
    "outside",
    "near",
    "far",
    "here",
    "there",
    "entrance",
    "exit",
    "building",
    "room",
    "bathroom",
    "kitchen",
    "bedroom",
    "station",
    "airport",
    "hotel",
    "restaurant",
    "cafe",
    "shop",
    "market",
    "bank",
    "post office",
    "park",
    "museum",
    "library",
    "hospital",
    "pharmacy",
    "clinic",
    "police station",
    "fire station",
    "gym",
    "stadium",
    "beach",
    "mountain",
    "river",
    "lake",
    "forest",
    "island",
    "bridge",
    "square",
    "mall",
    "store",
    "bakery",
    "zoo",
    "theater",
    "cinema",
    "bus stop",
    "subway",
    "parking lot",
    "farm",
    "factory",
    "harbor",
    "port",
    "dock",
    "church",
    "temple",
    "mosque",
    "synagogue",
  ],
  countries: [
    "United Kingdom",
    "Ireland",
    "France",
    "Germany",
    "Spain",
    "Portugal",
    "Italy",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Iceland",
    "Switzerland",
    "Austria",
    "Greece",
    "Poland",
    "Czechia",
    "Hungary",
    "Romania",
    "Bulgaria",
    "Serbia",
    "Croatia",
    "Slovenia",
    "Slovakia",
    "Bosnia and Herzegovina",
    "Montenegro",
    "Kosovo",
    "Albania",
    "Moldova",
    "Ukraine",
    "Belarus",
    "Russia",
    "Estonia",
    "Latvia",
    "Lithuania",
    "Luxembourg",
    "Malta",
    "Cyprus",
    "Andorra",
    "Liechtenstein",
    "Monaco",
    "San Marino",
    "Vatican City",
    "Georgia",
    "Armenia",
    "Azerbaijan",
    "Turkey",
    "Kazakhstan",
    "Kyrgyzstan",
    "Tajikistan",
    "Turkmenistan",
    "Uzbekistan",
    "Afghanistan",
    "Pakistan",
    "India",
    "Bangladesh",
    "Sri Lanka",
    "Nepal",
    "Bhutan",
    "Maldives",
    "China",
    "Mongolia",
    "North Korea",
    "South Korea",
    "Japan",
    "Taiwan",
    "Hong Kong",
    "Vietnam",
    "Thailand",
    "Malaysia",
    "Indonesia",
    "Philippines",
    "Singapore",
    "Myanmar",
    "Cambodia",
    "Laos",
    "Brunei",
    "Timor-Leste",
    "Papua New Guinea",
    "Australia",
    "New Zealand",
    "Fiji",
    "Samoa",
    "Tonga",
    "Vanuatu",
    "Solomon Islands",
    "Kiribati",
    "Tuvalu",
    "Nauru",
    "Palau",
    "Marshall Islands",
    "Micronesia",
    "United States",
    "Canada",
    "Mexico",
    "Guatemala",
    "Honduras",
    "El Salvador",
    "Nicaragua",
    "Costa Rica",
    "Panama",
    "Cuba",
    "Dominican Republic",
    "Jamaica",
    "Haiti",
    "Bahamas",
    "Barbados",
    "Trinidad and Tobago",
    "Antigua and Barbuda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Grenada",
    "Belize",
    "Guyana",
    "Suriname",
    "Brazil",
    "Argentina",
    "Chile",
    "Uruguay",
    "Paraguay",
    "Bolivia",
    "Peru",
    "Colombia",
    "Venezuela",
    "Ecuador",
    "Qatar",
    "Bahrain",
    "Kuwait",
    "Oman",
    "Saudi Arabia",
    "United Arab Emirates",
    "Yemen",
    "Iraq",
    "Iran",
    "Jordan",
    "Lebanon",
    "Syria",
    "Palestine",
    "Egypt",
    "Libya",
    "Tunisia",
    "Algeria",
    "Morocco",
    "Mauritania",
    "Sudan",
    "Ethiopia",
    "Somalia",
    "Eritrea",
    "Djibouti",
    "Kenya",
    "Uganda",
    "Tanzania",
    "Rwanda",
    "Burundi",
    "Democratic Republic of the Congo",
    "Gabon",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Niger",
    "Nigeria",
    "Ghana",
    "Cote d'Ivoire",
    "Burkina Faso",
    "Mali",
    "Senegal",
    "Gambia",
    "Guinea",
    "Sierra Leone",
    "Liberia",
    "Togo",
    "Benin",
    "Cape Verde",
    "Sao Tome and Principe",
    "Angola",
    "Namibia",
    "Botswana",
    "Zimbabwe",
    "Zambia",
    "Mozambique",
    "Malawi",
    "Madagascar",
    "Comoros",
    "Seychelles",
    "Mauritius",
    "South Africa",
    "Eswatini",
    "Lesotho",
  ],
  "Feelings & States": [
    "happy",
    "sad",
    "angry",
    "afraid",
    "excited",
    "bored",
    "tired",
    "sleepy",
    "hungry",
    "thirsty",
    "nervous",
    "calm",
    "okay",
    "lonely",
    "confused",
    "proud",
    "relaxed",
    "stressed",
    "worried",
    "surprised",
    "shy",
    "ashamed",
    "embarrassed",
    "jealous",
    "grateful",
    "hopeful",
    "frustrated",
    "overwhelmed",
    "confident",
    "insecure",
    "curious",
    "focused",
    "satisfied",
    "disappointed",
    "relieved",
    "anxious",
    "content",
  ],
  "Family & Relationships": [
    "family",
    "parent",
    "mother",
    "father",
    "son",
    "daughter",
    "brother",
    "sister",
    "husband",
    "wife",
    "partner",
    "child",
    "baby",
    "cousin",
    "aunt",
    "uncle",
    "grandmother",
    "grandfather",
    "friend",
    "neighbor",
    "sibling",
    "grandparent",
    "grandchild",
    "grandson",
    "granddaughter",
    "stepmother",
    "stepfather",
    "stepson",
    "stepdaughter",
    "boyfriend",
    "girlfriend",
    "fiancé",
    "fiancée",
    "spouse",
    "relative",
    "roommate",
    "in-law",
    "mother-in-law",
    "father-in-law",
    "brother-in-law",
    "sister-in-law",
  ],
  "Food & Eating": [
    "water",
    "bread",
    "rice",
    "pasta",
    "meat",
    "chicken",
    "fish",
    "egg",
    "milk",
    "cheese",
    "fruit",
    "apple",
    "banana",
    "orange",
    "vegetable",
    "salad",
    "soup",
    "sugar",
    "salt",
    "coffee",
    "tea",
    "juice",
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "dessert",
    "butter",
    "yogurt",
    "beef",
    "pork",
    "ham",
    "sausage",
    "shrimp",
    "seafood",
    "potato",
    "tomato",
    "onion",
    "garlic",
    "carrot",
    "lettuce",
    "pepper",
    "cucumber",
    "corn",
    "beans",
    "mushroom",
    "oil",
    "vinegar",
    "spice",
    "sauce",
    "noodle",
    "sandwich",
    "pizza",
    "burger",
    "steak",
    "cake",
    "cookie",
    "ice cream",
    "chocolate",
    "honey",
    "jam",
    "cereal",
    "oats",
  ],
  "Health & Body": [
    "head",
    "hair",
    "face",
    "eye",
    "ear",
    "nose",
    "mouth",
    "tooth",
    "neck",
    "shoulder",
    "arm",
    "hand",
    "finger",
    "chest",
    "back",
    "stomach",
    "leg",
    "knee",
    "foot",
    "skin",
    "heart",
    "blood",
    "bone",
    "doctor",
    "nurse",
    "medicine",
    "pain",
    "fever",
    "sick",
    "healthy",
    "brain",
    "throat",
    "lip",
    "tongue",
    "elbow",
    "wrist",
    "hip",
    "ankle",
    "toe",
    "nail",
    "lung",
    "liver",
    "kidney",
    "muscle",
    "joint",
    "spine",
    "headache",
    "stomachache",
    "cough",
    "injury",
    "wound",
    "bandage",
    "pill",
    "vaccine",
    "allergy",
    "symptom",
    "appointment",
    "checkup",
  ],
  "Technology & Communication": [
    "phone",
    "computer",
    "internet",
    "email",
    "message",
    "text",
    "call",
    "video",
    "camera",
    "app",
    "website",
    "password",
    "wifi",
    "screen",
    "keyboard",
    "mouse",
    "battery",
    "charger",
    "social media",
    "online",
    "offline",
    "download",
    "upload",
    "file",
    "link",
    "tablet",
    "laptop",
    "desktop",
    "microphone",
    "speaker",
    "headphones",
    "earbuds",
    "browser",
    "search",
    "login",
    "logout",
    "username",
    "account",
    "profile",
    "notification",
    "chat",
    "voice",
    "signal",
    "network",
    "router",
    "bluetooth",
    "printer",
    "scanner",
    "storage",
    "cloud",
    "update",
    "settings",
    "stream",
  ],
  "Work & School": [
    "work",
    "job",
    "office",
    "company",
    "boss",
    "colleague",
    "meeting",
    "project",
    "task",
    "salary",
    "schedule",
    "student",
    "teacher",
    "school",
    "class",
    "lesson",
    "homework",
    "exam",
    "grade",
    "study",
    "book",
    "notebook",
    "pen",
    "pencil",
    "desk",
    "break",
    "university",
    "training",
    "subject",
    "course",
    "assignment",
    "lecture",
    "presentation",
    "report",
    "deadline",
    "group",
    "team",
    "manager",
    "employee",
    "intern",
    "resume",
    "interview",
    "career",
    "promotion",
    "skills",
    "department",
    "principal",
    "professor",
    "assistant",
    "research",
    "quiz",
    "certificate",
    "degree",
  ],
};

const PHRASE_SECTION_ORDER = [
  "Greetings",
  "Politeness",
  "Introductions",
  "Conversation",
  "Questions",
  "Requests",
  "Time & Plans",
  "Directions",
  "Food",
  "Shopping",
  "Health",
  "Feelings",
  "Opinions",
  "Work & Study",
  "Problems",
  "Everyday Expressions",
];

const PHRASE_SECTION_LISTS = {
  Greetings: [
    "hi there",
    "hello there",
    "good morning",
    "good afternoon",
    "good evening",
    "good night",
    "how are you",
    "how are you doing",
    "how is it going",
    "good to see you",
    "nice to see you",
    "welcome back",
    "long time no see",
    "see you later",
    "see you soon",
    "see you tomorrow",
    "take care",
    "have a good day",
    "have a nice day",
  ],
  Politeness: [
    "excuse me",
    "pardon me",
    "i am sorry",
    "sorry about that",
    "thank you",
    "thank you very much",
    "thanks a lot",
    "i appreciate it",
    "you are welcome",
    "no problem",
    "that is okay",
    "after you",
    "my apologies",
    "please forgive me",
  ],
  Introductions: [
    "my name is",
    "i am",
    "i am from",
    "i live in",
    "i work at",
    "i study at",
    "i am a student",
    "i am a teacher",
    "i am new here",
    "let me introduce myself",
    "this is my friend",
    "this is my brother",
    "this is my sister",
    "nice to meet you",
    "pleased to meet you",
    "i am learning english",
    "i speak english",
    "i do not speak english",
  ],
  Conversation: [
    "can you repeat that",
    "can you say that again",
    "what do you mean",
    "i do not understand",
    "i understand",
    "i see",
    "that makes sense",
    "that is interesting",
    "tell me more",
    "i am listening",
    "let me think",
  ],
  Questions: [
    "what is this",
    "what is that",
    "who is that",
    "where are you",
    "where is the bathroom",
    "where is the station",
    "when is it",
    "what time is it",
    "how many people",
    "which one is better",
    "do you speak english",
    "do you have this",
    "is this correct",
    "is it open",
    "is it closed",
    "is there a",
    "are you ready",
    "what do you think",
    "what is your name",
  ],
  Requests: [
    "can you help me",
    "could you help me",
    "please help me",
    "can you show me",
    "could you show me",
    "can you tell me",
    "could you tell me",
    "can you explain",
    "could you explain",
    "can i have",
    "could i have",
    "i would like",
    "i would like to",
    "i need",
    "i need to",
    "i want to",
    "let me know",
    "please wait a moment",
    "please speak slowly",
    "can you speak slowly",
  ],
  "Time & Plans": [
    "what time works",
    "what time is good",
    "do you have time",
    "are you free",
    "i am free",
    "i am busy",
    "let us meet",
    "let us go",
    "let us start",
    "let us finish",
    "i will be late",
    "i will be early",
    "i will be there",
    "see you at",
    "see you on",
    "next week",
    "this weekend",
    "tomorrow morning",
    "this afternoon",
    "tonight at",
    "i have plans",
    "can we meet",
  ],
  Directions: [
    "turn left",
    "turn right",
    "go straight",
    "go back",
    "go ahead",
    "on the left",
    "on the right",
    "next to the",
    "across from the",
    "between the",
    "in front of the",
    "behind the",
    "at the corner",
    "on this street",
    "one block away",
    "two blocks away",
    "near the",
    "far from the",
    "go past the",
    "take the first left",
    "take the second right",
  ],
  Food: [
    "i am hungry",
    "i am thirsty",
    "can i see the menu",
    "table for two",
    "i would like water",
    "i would like coffee",
    "i will have the",
    "can i order",
    "the bill please",
    "no sugar please",
    "no salt please",
    "with no ice",
    "i am allergic to",
    "i do not eat meat",
    "i do not eat pork",
    "is this vegetarian",
    "can i get",
    "takeaway please",
    "to go please",
    "i would like to drink",
    "i would like to eat",
  ],
  Shopping: [
    "i am just looking",
    "i am looking for",
    "do you have another color",
    "do you have a smaller size",
    "do you have a larger size",
    "can i try it on",
    "how much is this",
    "how much is that",
    "i will take it",
    "where is the cashier",
    "do you accept cards",
    "can i pay by card",
    "can i pay in cash",
    "is there a discount",
    "can i return this",
    "i need a receipt",
    "it is too expensive",
  ],
  Health: [
    "i am sick",
    "i feel sick",
    "i have a headache",
    "i have a fever",
    "i have a cough",
    "i have a sore throat",
    "i need a doctor",
    "call a doctor",
    "call an ambulance",
    "i need medicine",
    "where is the pharmacy",
    "it hurts here",
    "i have an allergy",
    "i feel better",
    "i feel worse",
    "my stomach hurts",
    "i have an appointment",
  ],
  Feelings: [
    "i am happy",
    "i am sad",
    "i am angry",
    "i am tired",
    "i am sleepy",
    "i am excited",
    "i am nervous",
    "i am worried",
    "i am stressed",
    "i am calm",
    "i feel fine",
    "i feel great",
    "i feel bad",
    "i feel relaxed",
    "i feel lonely",
    "i feel confused",
    "i feel proud",
    "i feel embarrassed",
    "i feel grateful",
  ],
  Opinions: [
    "i think so",
    "i do not think so",
    "i like it",
    "i love it",
    "i do not like it",
    "it is good",
    "it is bad",
    "it is okay",
    "it is better",
    "it is worse",
    "i prefer",
    "i agree",
    "i disagree",
    "in my opinion",
    "i believe",
    "i am not sure",
    "i am sure",
    "that is true",
    "that is false",
    "that is correct",
    "that is wrong",
  ],
  "Work & Study": [
    "i am at work",
    "i am at school",
    "i have class",
    "i have homework",
    "i have an exam",
    "i have a test",
    "i have a project",
    "i am working",
    "i am studying",
    "i need help with",
    "i have a deadline",
    "i have a question",
    "i am on a break",
    "i am late for class",
    "i am early for work",
    "i work from home",
    "i work in",
  ],
  Problems: [
    "i have a problem",
    "something is wrong",
    "it does not work",
    "it is broken",
    "i need help",
    "i am lost",
    "i lost my",
    "i cannot find",
    "i missed my",
    "i forgot my",
    "i made a mistake",
    "i need to cancel",
    "i need to reschedule",
    "i have no money",
    "my phone is dead",
    "i ran out of",
    "i do not know",
    "i am stuck",
    "there is a mistake",
  ],
  "Everyday Expressions": [
    "just a second",
    "one moment",
    "right now",
    "not yet",
    "maybe later",
    "of course",
    "i am ready",
    "i am not ready",
    "that is fine",
    "that is enough",
    "too much",
    "a little bit",
    "a lot of",
    "almost done",
    "all done",
    "no worries",
    "sounds good",
    "that works",
    "good idea",
    "let us try",
  ],
};

const GRAMMAR_SECTION_ORDER = [
  "Sentence Structure",
  "Verbs",
  "Tenses & Aspect",
  "Nouns & Articles",
  "Pronouns & Reference",
  "Modifiers",
  "Questions",
  "Negation",
  "Connections",
  "Conditions",
  "Voice & Focus",
  "Modality",
  "Reported Speech",
  "Formality & Style",
  "Discourse & Flow",
];

const GRAMMAR_SECTION_LISTS = {
  "Sentence Structure": [
    {
      title: "basic word order",
      points: [
        "basic word order in simple statements",
        "subject usually comes before the verb",
        "if the verb takes an object, put it after the verb",
      ],
      example: "She reads a book.",
    },
    {
      title: "sentence parts",
      points: [
        "a complete clause needs a subject",
        "a complete clause needs a main verb",
        "an object or complement can follow the verb",
      ],
      example: "They named her captain.",
    },
    {
      title: "adding details",
      points: [
        "add a time phrase after the main clause (for example, at noon or yesterday)",
        "add a place phrase after the time phrase (for example, at the station or in the kitchen)",
      ],
      example: "She met him at noon at the station.",
    },
    {
      title: "linking clauses",
      points: [
        "main clause gives the core message",
        "use a connector to link clauses (for example, because or when)",
        "the linked clause needs its own subject and verb",
      ],
      example: "I stayed home because it rained.",
    },
    {
      title: "sentence variety",
      points: [
        "use short sentences for key points",
        "use longer sentences for supporting detail",
        "separate independent clauses with correct punctuation",
      ],
      example: "We finished early. We went home after class because we were tired.",
    },
  ],
  Verbs: [
    {
      title: "action verbs",
      points: [
        "action verbs show what the subject does",
        "in simple statements, place the action verb after the subject",
        "if there is an object, place it after the action verb",
      ],
      example: "They carry the boxes.",
    },
    {
      title: "state verbs",
      points: [
        "state verbs describe a condition, thought, feeling, or possession",
        "in simple statements, place the state verb after the subject",
        "state verbs are usually not used in continuous forms",
      ],
      example: "She feels tired.",
    },
    {
      title: "linking verbs",
      points: [
        "linking verbs connect the subject to a complement",
        "place the linking verb after the subject in a simple statement",
        "use an adjective or noun as the complement after the linking verb",
      ],
      example: "The room feels quiet.",
    },
    {
      title: "verb patterns",
      points: [
        "some verbs are followed by a preposition phrase",
        "after the verb and object, add the required preposition",
        "complete the preposition with a noun phrase",
      ],
      example: "He placed the book on the table.",
    },
    {
      title: "verb combinations",
      points: [
        "one common verb combination is verb + to-infinitive",
        "use to + base verb immediately after the main verb",
        "do not omit to in this pattern",
      ],
      example: "We decided to stay.",
    },
    {
      title: "phrasal verbs",
      points: [
        "verb plus particle",
        "separable phrasal verbs",
        "meaning shift with particles",
      ],
      example: "She turned off the light.",
    },
  ],
  "Tenses & Aspect": [
    {
      title: "present simple",
      points: [
        "present simple for habits",
        "present simple for facts",
        "present simple for schedules",
      ],
      example: "She works every day.",
    },
    {
      title: "present continuous",
      points: [
        "present continuous for now",
        "present continuous for temporary actions",
        "present continuous for near plans",
      ],
      example: "I am waiting outside.",
    },
    {
      title: "past simple",
      points: [
        "past simple for finished actions",
        "past simple for past time words",
        "past simple for sequences",
      ],
      example: "They visited Paris last year.",
    },
    {
      title: "past continuous",
      points: [
        "past continuous for background",
        "past continuous with interruption",
        "past continuous for two actions",
      ],
      example: "I was cooking when he called.",
    },
    {
      title: "present perfect",
      points: [
        "present perfect for experience",
        "present perfect for recent results",
        "present perfect with since and for",
      ],
      example: "He has lived here for years.",
    },
    {
      title: "past perfect",
      points: [
        "past perfect for earlier past",
        "past perfect for cause in past",
        "past perfect with before",
      ],
      example: "She had left before I arrived.",
    },
    {
      title: "future forms",
      points: [
        "use will + base verb for one future form",
        "use be going to + base verb for another future form",
        "use present continuous + future time for arranged plans",
      ],
      example: "I will call you tonight. I am going to study later. I am meeting Sam tomorrow.",
    },
    {
      title: "future continuous",
      points: [
        "future continuous for progress",
        "future continuous for background",
        "future continuous for polite inquiry",
      ],
      example: "I will be working at six.",
    },
    {
      title: "future perfect",
      points: [
        "future perfect for deadlines",
        "future perfect with by time",
        "future perfect for completion",
      ],
      example: "They will have finished by Friday.",
    },
    {
      title: "aspect contrasts",
      points: [
        "simple vs continuous contrast",
        "perfect vs simple contrast",
        "duration focus contrast",
      ],
      example: "I work every day. I am working now. I have worked here for years.",
    },
  ],
  "Nouns & Articles": [
    {
      title: "countable nouns",
      points: [
        "countable nouns can be singular or plural",
        "use a or an before singular countable nouns",
        "use a number with plural countable nouns",
      ],
      example: "I have a coin and two apples.",
    },
    {
      title: "uncountable nouns",
      points: [
        "uncountable nouns usually do not have plural forms",
        "use some with uncountable nouns",
        "use a piece of for countable units",
      ],
      example: "We need some rice and a piece of bread.",
    },
    {
      title: "articles",
      points: [
        "use a or an for first mention of a singular countable noun",
        "use the when the noun is specific or already known",
        "place the article directly before the noun",
      ],
      example: "I saw a dog. The dog is outside.",
    },
    {
      title: "plural forms",
      points: [
        "use a plural noun for more than one",
        "many plurals add -s or -es",
        "some plurals are irregular (child -> children)",
      ],
      example: "Two apples and three children are here.",
    },
    {
      title: "possessive nouns",
      points: [
        "add apostrophe + s to a singular noun to show ownership",
        "place the possessive noun before the thing owned",
        "keep the apostrophe in the correct position",
      ],
      example: "Sara's phone is new.",
    },
    {
      title: "noun phrases",
      points: [
        "a noun phrase can include determiner + noun",
        "an adjective can appear before the noun",
        "keep the order determiner + adjective + noun",
      ],
      example: "She bought the red dress.",
    },
    {
      title: "quantifiers",
      points: [
        "use many with plural countable nouns",
        "use much with uncountable nouns",
        "choose the quantifier by noun type",
      ],
      example: "There are many options, and there is much information.",
    },
  ],
  "Pronouns & Reference": [
    {
      title: "subject pronouns",
      points: [
        "subject pronouns replace noun subjects (i, you, he, she, it, we, they)",
        "use a subject pronoun before the main verb in statements",
        "choose the pronoun that matches number and person",
      ],
      example: "They are ready.",
    },
    {
      title: "object pronouns",
      points: [
        "object pronouns replace noun objects (me, you, him, her, it, us, them)",
        "place object pronouns after the main verb",
        "use object forms, not subject forms, in object position",
      ],
      example: "He saw me.",
    },
    {
      title: "possessive forms",
      points: [
        "use possessive adjectives before nouns (my, your, his, her, our, their)",
        "use possessive pronouns without a noun (mine, yours, his, hers, ours, theirs)",
        "do not add apostrophes to possessive pronouns",
      ],
      example: "My bag is new. Hers is old.",
    },
    {
      title: "reflexive pronouns",
      points: [
        "use reflexive pronouns when subject and object are the same",
        "singular forms: myself, yourself, himself, herself, itself",
        "plural forms: ourselves, yourselves, themselves",
      ],
      example: "He hurt himself.",
    },
    {
      title: "demonstratives",
      points: [
        "use this and these for things near the speaker",
        "use that and those for things farther away",
        "use this or that with singular nouns and these or those with plural nouns",
      ],
      example: "These keys are mine.",
    },
    {
      title: "relative reference",
      points: [
        "use who for people in relative clauses",
        "use which for things in relative clauses",
        "use that for people or things in defining relative clauses",
      ],
      example: "The man who called me left.",
    },
    {
      title: "indefinite reference",
      points: [
        "use someone and something in affirmative statements",
        "use anyone and anything in negative statements and questions",
        "use everyone and everything for complete groups",
      ],
      example: "Someone is waiting outside.",
    },
  ],
  Modifiers: [
    {
      title: "adjectives basics",
      points: [
        "adjectives describe nouns",
        "adjectives can come before nouns",
        "adjectives can come after linking verbs like be",
      ],
      example: "The quiet house is empty.",
    },
    {
      title: "adjective order",
      points: [
        "when several adjectives come before a noun, use a common order",
        "opinion usually comes before size",
        "size usually comes before color",
      ],
      example: "She bought a lovely small red bag.",
    },
    {
      title: "comparatives",
      points: [
        "use comparatives to compare two things",
        "many short adjectives take -er",
        "many longer adjectives use more",
      ],
      example: "This is faster than that.",
    },
    {
      title: "superlatives",
      points: [
        "use superlatives to compare one item with a group",
        "many short adjectives take -est and longer adjectives use most",
        "use the before superlative adjectives",
      ],
      example: "He is the tallest.",
    },
    {
      title: "adverbs basics",
      points: [
        "adverbs can modify verbs",
        "many adverbs of manner end in -ly",
        "adverbs of manner usually come after the verb or object",
      ],
      example: "She speaks clearly.",
    },
    {
      title: "frequency adverbs",
      points: [
        "common frequency adverbs include always, usually, often, sometimes, and never",
        "place frequency adverbs before main verbs",
        "place frequency adverbs after be",
      ],
      example: "She usually wakes early.",
    },
    {
      title: "time and place adverbs",
      points: [
        "place adverbs answer where and time adverbs answer when",
        "in neutral order, place usually comes before time",
        "both often appear near the end of the clause",
      ],
      example: "We met here yesterday.",
    },
    {
      title: "degree words",
      points: [
        "degree words modify adjectives or adverbs",
        "use very to strengthen adjectives or adverbs",
        "use enough after adjectives and adverbs",
      ],
      example: "The room is very warm.",
    },
    {
      title: "participles",
      points: [
        "use -ing adjectives for things that cause a feeling",
        "use -ed adjectives for how people feel",
        "do not mix -ing and -ed meanings",
      ],
      example: "The movie was boring, and I was bored.",
    },
    {
      title: "modifier stacking",
      points: [
        "when multiple modifiers appear, keep a clear order",
        "put degree words before adjectives",
        "keep manner adverbs in a natural position in the clause",
      ],
      example: "She answered the very difficult question quickly.",
    },
  ],
  Questions: [
    {
      title: "yes no questions",
      points: [
        "use do, does, or did before the subject",
        "use the base verb after the subject",
        "end yes-no questions with a question mark",
      ],
      example: "Do you work here?",
    },
    {
      title: "wh questions",
      points: [
        "start with a wh word such as who, what, where, when, why, or how",
        "place the auxiliary before the subject",
        "use the base verb after the subject",
      ],
      example: "Where does he live?",
    },
    {
      title: "questions with be",
      points: [
        "place be before the subject",
        "do not use do or does with be questions",
        "place the complement after the subject",
      ],
      example: "Is the store open?",
    },
    {
      title: "questions with do",
      points: [
        "use do, does, or did before the subject",
        "keep the main verb in base form after do, does, or did",
        "use did for past-time yes-no questions",
      ],
      example: "Did you call her?",
    },
    {
      title: "questions with modals",
      points: [
        "place the modal before the subject",
        "use the base verb after the subject",
        "do not use do or does with modal questions",
      ],
      example: "Could you help me?",
    },
    {
      title: "tag questions",
      points: [
        "add a short tag after a statement",
        "use a negative tag after a positive statement",
        "use a positive tag after a negative statement",
      ],
      example: "You are ready, aren't you?",
    },
    {
      title: "indirect questions",
      points: [
        "start with an introductory phrase such as could you tell me",
        "use statement word order inside the embedded question",
        "do not invert subject and verb inside the embedded question",
      ],
      example: "Could you tell me where it is?",
    },
  ],
  Negation: [
    {
      title: "not with be",
      points: [
        "use be + not to form negatives with be",
        "place not after am, is, are, was, or were",
        "keep the complement after the negative be form",
      ],
      example: "She is not tired.",
    },
    {
      title: "not with do",
      points: [
        "use do, does, or did + not to form negatives with main verbs",
        "use does with he, she, and it in present simple",
        "keep the main verb in base form after do, does, or did + not",
      ],
      example: "They do not agree.",
    },
    {
      title: "negative short forms",
      points: [
        "use short negative forms such as don't, doesn't, isn't, and aren't",
        "keep the same word order as the full negative form",
        "match the short form to the subject and auxiliary",
      ],
      example: "I don't know.",
    },
    {
      title: "negative words",
      points: [
        "common negative words include no, none, never, and nothing",
        "use one negative form per clause in standard english",
        "use any forms after not when needed (anyone, anything, anywhere)",
      ],
      example: "There is no milk.",
    },
    {
      title: "negative questions",
      points: [
        "form negative questions with auxiliary + n't + subject + base verb",
        "use negative questions to check or confirm expectations",
        "keep the main verb in base form after the auxiliary",
      ],
      example: "Don't you want coffee?",
    },
    {
      title: "limited negatives",
      points: [
        "limited negatives include hardly, barely, and rarely",
        "in neutral statements, place them before the main verb",
        "avoid adding a second negative in the same clause",
      ],
      example: "He rarely eats out.",
    },
  ],
  Connections: [
    {
      title: "basic connectors",
      points: [
        "use and to add similar ideas",
        "use but to show contrast",
        "use or to show alternatives",
      ],
      example: "I called but no one answered.",
    },
    {
      title: "reason and result",
      points: [
        "use because + clause to give a reason",
        "use so + clause to show a result",
        "keep both clauses complete",
      ],
      example: "It rained, so we stayed.",
    },
    {
      title: "contrast and choice",
      points: [
        "use but or although to show contrast",
        "use either ... or ... to show a choice",
        "use one connector pattern at a time",
      ],
      example: "She went, although she was tired.",
    },
    {
      title: "time connectors",
      points: [
        "use when for events at the same time",
        "use before and after to order events",
        "keep tense forms natural in time clauses",
      ],
      example: "Call me when you arrive.",
    },
    {
      title: "comparison links",
      points: [
        "use like before a noun phrase",
        "use as for role or function",
        "use than after comparative forms",
      ],
      example: "This feels like home.",
    },
    {
      title: "adding ideas",
      points: [
        "use also to add one more idea",
        "use in addition for a more formal add-on",
        "place the addition marker in a clear position",
      ],
      example: "We also need chairs.",
    },
    {
      title: "ordering ideas",
      points: [
        "use first, then, and finally to show sequence",
        "keep events in chronological order",
        "use one clear sequence marker per step",
      ],
      example: "First we plan, then we act.",
    },
  ],
  Conditions: [
    {
      title: "real conditions",
      points: [
        "use if + present simple for real and possible conditions",
        "use present simple in the result clause for general results",
        "do not use will in the if clause in this pattern",
      ],
      example: "If you press this, it starts.",
    },
    {
      title: "future conditions",
      points: [
        "use if + present simple for future conditions",
        "use will + base verb in the result clause",
        "do not use will in the if clause",
      ],
      example: "If it is sunny, we will go.",
    },
    {
      title: "unreal present",
      points: [
        "use if + past simple for unreal present situations",
        "use would + base verb in the result clause",
        "this pattern expresses imaginary present or future results",
      ],
      example: "If I had time, I would help.",
    },
    {
      title: "unreal past",
      points: [
        "use if + past perfect for unreal past situations",
        "use would have + past participle in the result clause",
        "this pattern expresses regret or an alternative past result",
      ],
      example: "If we had left earlier, we would have arrived.",
    },
    {
      title: "mixed conditions",
      points: [
        "use if + past perfect for a past condition",
        "use would + base verb for a present result",
        "mixed conditionals connect past causes to present consequences",
      ],
      example: "If she had studied, she would be calm now.",
    },
    {
      title: "unless and otherwise",
      points: [
        "use unless to mean if ... not",
        "use present simple after unless for future meaning",
        "keep result and condition clauses clear and complete",
      ],
      example: "We will go unless it rains.",
    },
  ],
  "Voice & Focus": [
    {
      title: "active voice",
      points: [
        "in active voice, the doer is the subject",
        "use subject + action verb + object order",
        "active voice usually sounds more direct and clear",
      ],
      example: "The chef cooked dinner.",
    },
    {
      title: "passive voice",
      points: [
        "in passive voice, the receiver becomes the subject",
        "use be + past participle in the verb phrase",
        "add by + doer only when the doer is important",
      ],
      example: "The meal was cooked.",
    },
    {
      title: "focus shifts",
      points: [
        "move a phrase to the front to emphasize it",
        "separate the fronted phrase with a comma",
        "keep the rest of the clause in normal order",
      ],
      example: "That book, I finished yesterday.",
    },
    {
      title: "cleft sentences",
      points: [
        "use it + be to highlight one part of the sentence",
        "follow the focus with who or that + clause",
        "use who for people and that for things",
      ],
      example: "It is John who called.",
    },
    {
      title: "there and it subjects",
      points: [
        "use there + be to introduce new information",
        "use it + be for weather, time, and distance",
        "match the be verb with the real noun phrase",
      ],
      example: "There is a problem.",
    },
  ],
  Modality: [
    {
      title: "ability",
      points: [
        "use can and could to express ability",
        "place the modal before the base verb",
        "do not add to after can or could",
      ],
      example: "She can swim.",
    },
    {
      title: "permission",
      points: [
        "use can, may, or could to ask for permission",
        "in questions, place the modal before the subject",
        "use the base verb after the modal without to",
      ],
      example: "May I sit here?",
    },
    {
      title: "obligation",
      points: [
        "use must for strong obligation",
        "use have to for external obligation",
        "after must, use the base verb without to",
      ],
      example: "You must wear a seatbelt.",
    },
    {
      title: "advice",
      points: [
        "use should or ought to to give advice",
        "use should + base verb",
        "use ought to + base verb",
      ],
      example: "You should rest.",
    },
    {
      title: "possibility",
      points: [
        "use may or might to express possibility",
        "place the modal before the base verb",
        "do not add to after may or might",
      ],
      example: "It might rain today.",
    },
    {
      title: "probability",
      points: [
        "use will + probably + base verb for likely future events",
        "place probably after will in this pattern",
        "keep the main verb in base form after the probability marker",
      ],
      example: "He will probably come.",
    },
    {
      title: "polite requests",
      points: [
        "use could or would for polite requests",
        "use modal + subject + base verb + object order",
        "you can add please for extra politeness",
      ],
      example: "Could you open the window?",
    },
    {
      title: "offers and invitations",
      points: [
        "use would you like + noun for offers",
        "use would you like to + base verb for invitations",
        "do not use do you like for formal offers or invitations",
      ],
      example: "Would you like some tea?",
    },
  ],
  "Reported Speech": [
    {
      title: "reporting statements",
      points: [
        "report statements with said (that) + clause",
        "that is optional in many neutral sentences",
        "adjust pronouns and time words as needed",
      ],
      example: "She said she was ready.",
    },
    {
      title: "reporting questions",
      points: [
        "use asked if or whether for yes-no questions",
        "use asked + wh-word for information questions",
        "use statement word order in the reported clause",
      ],
      example: "He asked if I was okay.",
    },
    {
      title: "reporting requests",
      points: [
        "report requests with asked + object + to + base verb",
        "keep the infinitive form after to",
        "keep the request meaning without direct question form",
      ],
      example: "She asked me to wait.",
    },
    {
      title: "reporting commands",
      points: [
        "report commands with told or ordered + object + to + base verb",
        "keep the base verb after to",
        "preserve command meaning in indirect form",
      ],
      example: "He told us to leave.",
    },
    {
      title: "backshift basics",
      points: [
        "backshift present to past in many past reporting contexts",
        "backshift will to would",
        "backshift can to could when needed",
      ],
      example: "They said they had time.",
    },
    {
      title: "time place changes",
      points: [
        "change now to then when context requires",
        "change here to there when reference point shifts",
        "change today to that day in past reporting contexts",
      ],
      example: "He said he was there.",
    },
  ],
  "Formality & Style": [
    {
      title: "formal vs informal",
      points: [
        "use formal wording in professional or unfamiliar contexts",
        "use informal wording with friends and familiar contexts",
        "keep register consistent within the same sentence",
      ],
      example: "Could you assist me?",
    },
    {
      title: "contractions",
      points: [
        "contractions are common in casual speech and writing",
        "use apostrophes correctly in contractions",
        "choose full forms in very formal writing when needed",
      ],
      example: "I can't stay long.",
    },
    {
      title: "polite softening",
      points: [
        "use could or would to soften requests",
        "add please when extra politeness is needed",
        "avoid bare imperatives in formal requests",
      ],
      example: "Could you close the door?",
    },
    {
      title: "spoken vs written",
      points: [
        "spoken language allows informal markers and shortcuts",
        "written language prefers clear complete sentences",
        "avoid slang in formal written contexts",
      ],
      example: "Please see the details below.",
    },
    {
      title: "professional style",
      points: [
        "state your purpose clearly and politely",
        "keep a neutral and respectful tone",
        "use a polite closing when appropriate",
      ],
      example: "Thank you for your time.",
    },
    {
      title: "casual style",
      points: [
        "casual style uses friendly greetings",
        "short and simple wording is common",
        "avoid overly formal openings in casual contexts",
      ],
      example: "Hey, how is it going?",
    },
    {
      title: "clarity and brevity",
      points: [
        "use short direct sentences",
        "remove unnecessary filler words",
        "put the main point early",
      ],
      example: "We need a quick answer.",
    },
  ],
  "Discourse & Flow": [
    {
      title: "opening and closing",
      points: [
        "open with a greeting at the start",
        "end with a clear closing signal",
        "keep opening and closing matched to the context",
      ],
      example: "Hi everyone, that is all for today.",
    },
    {
      title: "topic shifts",
      points: [
        "use a shift marker like by the way to change topic",
        "add a complete clause after the shift marker",
        "avoid abrupt topic jumps without a marker",
      ],
      example: "By the way, I have news.",
    },
    {
      title: "cohesion tools",
      points: [
        "use reference words like it or this to connect ideas",
        "use a linker to show the relation between clauses",
        "make each reference clear and easy to track",
      ],
      example: "I bought a book, and it is useful.",
    },
    {
      title: "sequencing ideas",
      points: [
        "use sequence markers like first and then",
        "keep event order clear for the listener or reader",
        "do not repeat the same sequence marker",
      ],
      example: "First we pack, then we leave.",
    },
    {
      title: "clarification moves",
      points: [
        "use a clarification phrase to check meaning",
        "ask a direct clarification question when needed",
        "name the exact item you want to clarify",
      ],
      example: "Do you mean the morning meeting?",
    },
    {
      title: "summaries",
      points: [
        "use a summary marker like in short or to sum up",
        "state only the main point in the summary line",
        "keep summary sentences short and direct",
      ],
      example: "In short, we are ready.",
    },
    {
      title: "emphasis and repetition",
      points: [
        "use do or really to add emphasis when needed",
        "place emphasis words in natural positions",
        "avoid unnecessary repeated words",
      ],
      example: "I do need your answer today.",
    },
    {
      title: "conversation flow",
      points: [
        "use listening signals to show attention",
        "use turn-taking signals to guide the next speaker",
        "keep transitions polite and clear",
      ],
      example: "I see, please continue.",
    },
    {
      title: "giving examples",
      points: [
        "use markers like for example or for instance",
        "follow the marker with a complete example clause",
        "keep the example directly related to your point",
      ],
      example: "For example, call the help desk.",
    },
    {
      title: "repair and correction",
      points: [
        "use repair markers like sorry or I mean",
        "state the correction immediately after the marker",
        "replace only the incorrect part",
      ],
      example: "Sorry, I mean Tuesday, not Monday.",
    },
  ],
};


const createTranslationShell = () => {
  const shell = {};
  BASE_LANGUAGES.forEach((lang) => {
    shell[lang] = "";
  });
  return shell;
};

const WORLD_CARD_ROMANIZATION_KEYS = new Set([
  "arabic",
  "chinese",
  "japanese",
  "korean",
  "hindi",
]);

const shouldDisplayCardRomanization = () => WORLD_CARD_ROMANIZATION_KEYS.has(WORLD_KEY);

const buildWorldGrammarMaps = () => {
  if (!WORLD_TRANSLATIONS?.grammar) {
    WORLD_GRAMMAR_TITLE_MAP = null;
    WORLD_GRAMMAR_EXAMPLE_MAP = null;
    return;
  }
  const titles = WORLD_TRANSLATIONS.grammar.titles || {};
  const examples = WORLD_TRANSLATIONS.grammar.examples || {};
  WORLD_GRAMMAR_TITLE_MAP = {};
  WORLD_GRAMMAR_EXAMPLE_MAP = {};
  Object.entries(titles).forEach(([section, items]) => {
    const map = {};
    Object.entries(items || {}).forEach(([translatedTitle, payload]) => {
      const source = String(payload?.source || "").toLowerCase();
      if (source) {
        map[source] = translatedTitle;
      }
    });
    WORLD_GRAMMAR_TITLE_MAP[section] = map;
  });
  Object.entries(examples).forEach(([section, items]) => {
    const map = {};
    Object.entries(items || {}).forEach(([translatedSentence, payload]) => {
      const source = String(payload?.source || "").toLowerCase();
      if (source) {
        map[source] = translatedSentence;
      }
    });
    WORLD_GRAMMAR_EXAMPLE_MAP[section] = map;
  });
};

const getWorldWordList = (section) => {
  const fromWorld = WORLD_TRANSLATIONS?.words?.[section];
  if (fromWorld && typeof fromWorld === "object") {
    const keys = Object.keys(fromWorld).filter((key) => String(key || "").trim());
    if (keys.length) {
      return keys;
    }
  }
  // Strict rule for non-English worlds: never silently fall back to English cards.
  if (isNonEnglishWorld) {
    return [];
  }
  return WORD_SECTION_LISTS[section] || [];
};

const getWorldPhraseList = (section) => {
  const fromWorld = WORLD_TRANSLATIONS?.phrases?.[section];
  if (fromWorld && typeof fromWorld === "object") {
    const keys = Object.keys(fromWorld).filter((key) => String(key || "").trim());
    if (keys.length) {
      return keys;
    }
  }
  // Strict rule for non-English worlds: never silently fall back to English cards.
  if (isNonEnglishWorld) {
    return [];
  }
  return PHRASE_SECTION_LISTS[section] || [];
};

const getWorldGrammarTitle = (section, title) => {
  const map = WORLD_GRAMMAR_TITLE_MAP?.[section];
  const key = String(title || "").toLowerCase();
  return map?.[key] || title;
};

const getWorldGrammarSectionLabel = (section) => {
  const worldLabel = WORLD_TRANSLATIONS?.grammar?.sectionLabels?.[section];
  if (typeof worldLabel === "string" && worldLabel.trim()) {
    return worldLabel.trim();
  }
  return section;
};

const WORLD_SECTION_LABEL_FALLBACKS = {
  french: {
    phrases: {
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
  },
  german: {
    phrases: {
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
  },
  spanish: {
    phrases: {
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
  },
  portuguese: {
    phrases: {
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
  },
  dutch: {
    phrases: {
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
  },
  swedish: {
    phrases: {
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
  },
  arabic: {
    phrases: {
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
  },
  chinese: {
    phrases: {
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
  },
  japanese: {
    phrases: {
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
  },
  korean: {
    phrases: {
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
  },
  hindi: {
    phrases: {
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
  },
};

const getWorldSectionLabelFromPack = (mapType, section) => {
  const labels = WORLD_TRANSLATIONS?.[mapType]?.sectionLabels;
  if (!labels || typeof labels !== "object") {
    const fallback = WORLD_SECTION_LABEL_FALLBACKS[WORLD_KEY]?.[mapType]?.[section];
    return typeof fallback === "string" && fallback.trim() ? fallback.trim() : "";
  }
  const value = labels?.[section];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  const fallback = WORLD_SECTION_LABEL_FALLBACKS[WORLD_KEY]?.[mapType]?.[section];
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "";
};

const normalizePedagogyKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const findPedagogyMatchAt = (sentence, phrase, fromIndex = 0) => {
  const source = normalizePedagogyKey(sentence);
  const target = normalizePedagogyKey(phrase);
  if (!source || !target) {
    return -1;
  }
  return source.indexOf(target, Math.max(0, Number(fromIndex) || 0));
};

const isStrictPedagogyCard = (card) => {
  if (!card || typeof card !== "object") {
    return false;
  }
  const title = String(card.title || "").trim();
  const example = String(card.example || "").trim();
  if (!title || !example) {
    return false;
  }
  const mistakes = Array.isArray(card.mistakes) ? card.mistakes : [];
  const wrong = String(mistakes?.[0]?.wrong || "").trim();
  const fix = String(mistakes?.[0]?.fix || "").trim();
  if (!wrong || !fix || normalizePedagogyKey(wrong) === normalizePedagogyKey(fix)) {
    return false;
  }

  const ruleOrder = Array.isArray(card.ruleOrder)
    ? card.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (ruleOrder.length < 2) {
    return true;
  }

  const highlights = Array.isArray(card.exampleHighlights)
    ? card.exampleHighlights
        .map((entry) => String(entry?.text || "").trim())
        .filter(Boolean)
    : [];

  if (!highlights.length) {
    return true;
  }

  let cursor = 0;
  for (const phrase of highlights) {
    const at = findPedagogyMatchAt(example, phrase, cursor);
    if (at < 0) {
      return false;
    }
    cursor = at + normalizePedagogyKey(phrase).length;
  }
  return true;
};

const getGrammarCardsForSection = (section) => {
  const worldCards = WORLD_TRANSLATIONS?.grammar?.cards?.[section];
  if (Array.isArray(worldCards) && worldCards.length) {
    if (isNonEnglishWorld) {
      return worldCards.filter((card) => {
        if (!card || typeof card !== "object") {
          return false;
        }
        const hasEnglishSourceMarkers =
          !!String(card.sourceTitle || "").trim() ||
          !!String(card.sourceExample || "").trim() ||
          (Array.isArray(card.sourcePoints) && card.sourcePoints.length > 0) ||
          (Array.isArray(card.mistakes) &&
            card.mistakes.some(
              (mistake) =>
                !!String(mistake?.sourceWrong || "").trim() ||
                !!String(mistake?.sourceFix || "").trim()
            ));
        if (hasEnglishSourceMarkers) {
          return false;
        }
        return isStrictPedagogyCard(card);
      });
    }
    return worldCards;
  }
  if (isNonEnglishWorld) {
    return [];
  }
  return GRAMMAR_SECTION_LISTS[section] || [];
};

const resolveWorldGrammarSourceTitle = (section, title) => {
  const explicit = String(title || "").trim();
  if (!explicit) {
    return "";
  }
  const titleEntries = WORLD_TRANSLATIONS?.grammar?.titles?.[section];
  if (!titleEntries || typeof titleEntries !== "object") {
    return explicit;
  }
  const normalizedExplicit = normalizeWordLookupKey(explicit);
  for (const [translatedTitle, payload] of Object.entries(titleEntries)) {
    const source = String(payload?.source || "").trim();
    if (!source) {
      continue;
    }
    const translated = String(translatedTitle || "").trim();
    if (!translated) {
      continue;
    }
    if (
      normalizeWordLookupKey(translated) === normalizedExplicit ||
      normalizeWordLookupKey(source) === normalizedExplicit
    ) {
      return source;
    }
  }
  return explicit;
};

const getGrammarCardData = (section, index) => {
  const cards = getGrammarCardsForSection(section);
  if (!Array.isArray(cards)) {
    return null;
  }
  const numericIndex = Number(index);
  if (!Number.isFinite(numericIndex) || numericIndex < 0) {
    return null;
  }
  const card = cards[numericIndex];
  if (!card || typeof card !== "object") {
    return null;
  }
  const resolvedSourceTitle = resolveWorldGrammarSourceTitle(
    section,
    String(card.sourceTitle || card.title || "")
  );
  return {
    ...card,
    sourceTitle: resolvedSourceTitle || String(card.sourceTitle || card.title || ""),
  };
};

const WORD_TRANSLATIONS = Object.fromEntries(
  WORD_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (WORD_SECTION_LISTS[section] || []).map((word) => [
        word.toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const PHRASE_TRANSLATIONS = Object.fromEntries(
  PHRASE_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (PHRASE_SECTION_LISTS[section] || []).map((phrase) => [
        phrase.toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const GRAMMAR_TRANSLATIONS = Object.fromEntries(
  GRAMMAR_SECTION_ORDER.map((section) => [
    section,
    Object.fromEntries(
      (GRAMMAR_SECTION_LISTS[section] || []).map((card) => [
        (card.example || "").toLowerCase(),
        createTranslationShell(),
      ])
    ),
  ])
);

const GRAMMAR_EXPLANATION_TRANSLATIONS = Object.fromEntries(
  GRAMMAR_SECTION_ORDER.map((section) => [section, {}])
);

let translationPayloadReady = false;
let translationsLoadPromise = null;
const MAPS_BUNDLE_TRANSLATIONS_CACHE_KEY = "cosmicaMapTranslationsCache:v3";
const MAPS_BUNDLE_TRANSLATIONS_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAPS_WORLD_TRANSLATIONS_CACHE_KEY_PREFIX = "cosmicaWorldTranslationsCache:v1";
const MAPS_WORLD_TRANSLATIONS_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const buildMapsWorldTranslationsCacheKey = (worldKey = WORLD_KEY) =>
  `${MAPS_WORLD_TRANSLATIONS_CACHE_KEY_PREFIX}:${String(worldKey || "").trim().toLowerCase()}`;

const normalizeGrammarSectionLookup = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const resolveGrammarSectionName = (rawSection) => {
  const section = String(rawSection || "").trim();
  if (section && (GRAMMAR_SECTION_LISTS[section] || WORLD_TRANSLATIONS?.grammar?.cards?.[section])) {
    return section;
  }
  const normalized = normalizeGrammarSectionLookup(section);
  if (!normalized) {
    return "";
  }
  return (
    GRAMMAR_SECTION_ORDER.find(
      (candidate) => normalizeGrammarSectionLookup(candidate) === normalized
    ) || ""
  );
};

const ensureGrammarExplanationEntry = (section, key) => {
  const resolvedSection = resolveGrammarSectionName(section);
  const resolvedKey = normalizeTranslationLookupKey(key);
  if (!resolvedSection || !resolvedKey) {
    return null;
  }
  if (!GRAMMAR_EXPLANATION_TRANSLATIONS[resolvedSection]) {
    GRAMMAR_EXPLANATION_TRANSLATIONS[resolvedSection] = {};
  }
  if (!GRAMMAR_EXPLANATION_TRANSLATIONS[resolvedSection][resolvedKey]) {
    GRAMMAR_EXPLANATION_TRANSLATIONS[resolvedSection][resolvedKey] = createTranslationShell();
  }
  return GRAMMAR_EXPLANATION_TRANSLATIONS[resolvedSection][resolvedKey];
};

const hydrateGrammarExplanationTranslations = (data) => {
  if (!data || typeof data !== "object") {
    return;
  }
  const registerTranslations = (section, sourceText, translations) => {
    const entry = ensureGrammarExplanationEntry(section, sourceText);
    if (!entry || !translations || typeof translations !== "object") {
      return;
    }
    Object.entries(translations).forEach(([lang, value]) => {
      if (typeof value === "string" && value.trim()) {
        entry[String(lang).toLowerCase()] = value.trim();
      }
    });
  };
  const explanations = data.grammar?.explanations;
  if (explanations && typeof explanations === "object") {
    Object.entries(explanations).forEach(([section, items]) => {
      Object.entries(items || {}).forEach(([itemKey, payload]) => {
        if (typeof payload === "string") {
          if (data.worldLanguage) {
            registerTranslations(section, itemKey, {
              [String(data.worldLanguage).toLowerCase()]: payload,
            });
          }
          return;
        }
        const source = String(payload?.source || itemKey || "").trim();
        registerTranslations(section, source, payload?.translations);
        if (payload && typeof payload === "object" && !payload.translations) {
          const directLangMap = Object.fromEntries(
            Object.entries(payload).filter(
              ([lang, value]) => lang !== "source" && typeof value === "string"
            )
          );
          registerTranslations(section, source, directLangMap);
        }
      });
    });
  }

  const legacy = data.grammarExplanations;
  const legacyLang = String(data.worldLanguage || "").toLowerCase();
  if (legacy && typeof legacy === "object" && legacyLang) {
    Object.entries(legacy).forEach(([section, items]) => {
      Object.entries(items || {}).forEach(([sourceText, translation]) => {
        const key = String(sourceText || "").trim();
        if (!key || typeof translation !== "string" || !translation.trim()) {
          return;
        }
        registerTranslations(section, key, { [legacyLang]: translation });
      });
    });
  }
};

const hydrateTranslations = (target, source) => {
  if (!source || typeof source !== "object") {
    return;
  }
  Object.entries(source).forEach(([section, items]) => {
    if (!items || typeof items !== "object") {
      return;
    }
    if (!target[section]) {
      target[section] = {};
    }
    Object.entries(items).forEach(([key, langs]) => {
      const normalizedKey = String(key).toLowerCase();
      if (!target[section][normalizedKey]) {
        target[section][normalizedKey] = createTranslationShell();
      }
      if (langs && typeof langs === "object") {
        Object.entries(langs).forEach(([lang, value]) => {
          if (typeof value === "string" && value.trim()) {
            target[section][normalizedKey][String(lang).toLowerCase()] = value;
          }
        });
      }
    });
  });
};

/* ==========================================================================
   TRANSLATION LOADING + HYDRATION
   Fetches static translation JSON files and hydrates in-memory lookup tables.
   ========================================================================== */
const loadTranslations = async () => {
  try {
    const baseResponse = await fetch("maps/translations.json", { cache: "no-store" });
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      hydrateBaseTranslationsPayload(baseData);
      writeMapsBundleTranslationsCache(baseData);
    }
    if (isNonEnglishWorld && WORLD_TRANSLATION_FILE !== "maps/translations.json") {
      const response = await fetch(WORLD_TRANSLATION_FILE, { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const packWorldLanguage = String(data?.worldLanguage || "")
        .trim()
        .toLowerCase();
      if (packWorldLanguage && packWorldLanguage !== WORLD_KEY) {
        console.warn(
          `Ignoring world pack mismatch: expected "${WORLD_KEY}" but got "${packWorldLanguage}" from ${WORLD_TRANSLATION_FILE}`
        );
        return;
      }
      hydrateMapsWorldTranslationsPayload(data);
      writeMapsWorldTranslationsCache(data);
    }
  } catch (error) {
    console.warn("Failed to load maps/translations.json", error);
  } finally {
    translationPayloadReady = true;
  }
};

const ensureTranslationsLoaded = ({ awaitNetwork = false } = {}) => {
  if (!translationsLoadPromise) {
    translationsLoadPromise = loadTranslations();
  }
  if (awaitNetwork) {
    return translationsLoadPromise;
  }
  if (translationPayloadReady) {
    return Promise.resolve();
  }
  return translationsLoadPromise;
};

/* ==========================================================================
   DYNAMIC MAP RENDERERS
   Build Words, Phrases, and Grammar pages from shared section datasets.
   ========================================================================== */
const createMapLoadingCard = () => {
  const card = document.createElement("div");
  card.className = "card map-skeleton-card";
  card.innerHTML =
    '<span class="map-skeleton-line map-skeleton-line-card"></span><span class="map-skeleton-line map-skeleton-line-sub"></span>';
  return card;
};

const createMapLoadingSection = () => {
  const section = document.createElement("section");
  section.className = "section map-skeleton-section";
  const title = document.createElement("div");
  title.className = "section-title";
  title.innerHTML =
    '<span class="map-skeleton-line map-skeleton-line-eyebrow"></span><span class="map-skeleton-line map-skeleton-line-title"></span>';
  const grid = document.createElement("div");
  grid.className = "words-grid";
  for (let index = 0; index < 8; index += 1) {
    grid.appendChild(createMapLoadingCard());
  }
  section.appendChild(title);
  section.appendChild(grid);
  return section;
};

const renderMapLoadingState = (mapType) => {
  const type = String(mapType || "").trim().toLowerCase();
  const controls =
    type === "words"
      ? document.getElementById("wordsControls")
      : type === "phrases"
        ? document.getElementById("phrasesControls")
        : type === "grammar"
          ? document.getElementById("grammarControls")
          : null;
  const container =
    type === "words"
      ? document.getElementById("wordsSections")
      : type === "phrases"
        ? document.getElementById("phrasesSections")
        : type === "grammar"
          ? document.getElementById("grammarSections")
          : null;
  if (!container) {
    return;
  }
  document.body.classList.add("maps-loading");
  if (controls) {
    controls.innerHTML = `
      <div class="map-loading-controls" aria-hidden="true">
        <span class="map-skeleton-line map-skeleton-line-eyebrow"></span>
        <span class="map-skeleton-line map-skeleton-line-label"></span>
        <div class="map-loading-chip-row">
          <span class="map-loading-chip"></span>
          <span class="map-loading-chip"></span>
          <span class="map-loading-chip"></span>
          <span class="map-loading-chip"></span>
          <span class="map-loading-chip"></span>
        </div>
      </div>
    `;
  }
  container.innerHTML = "";
  for (let index = 0; index < 3; index += 1) {
    container.appendChild(createMapLoadingSection());
  }
};

const buildMapUnavailableState = (mapType) => {
  const wrapper = document.createElement("section");
  wrapper.className = "section map-unavailable";
  const mapLabel = String(mapType || "Map").trim();
  wrapper.innerHTML = `
    <div class="section-title">
      <h2>${mapLabel} content is still loading</h2>
      <p>Please wait a moment, then refresh this page if cards do not appear.</p>
    </div>
  `;
  return wrapper;
};

const buildGrammarUnderExpertReviewState = () => {
  const wrapper = document.createElement("section");
  wrapper.className = "section map-unavailable";
  wrapper.innerHTML = `
    <div class="section-title">
      <h2>Grammar map is under expert review</h2>
      <p>This grammar map is temporarily locked while language experts review and refine it.</p>
      <p>Please continue with Letters, Words, and Phrases in the meantime.</p>
    </div>
  `;
  return wrapper;
};

const createSectionFilterButton = (title, value, sourceTitle = title) => {
  const button = document.createElement("button");
  button.className = "words-filter";
  button.type = "button";
  button.dataset.filter = value;
  const normalizedSourceTitle = String(sourceTitle || title || "").trim();
  if (normalizedSourceTitle) {
    button.dataset.sourceTitle = normalizedSourceTitle;
    button.dataset.baseTitle = normalizedSourceTitle;
  }
  const main = document.createElement("span");
  main.className = "words-filter-main";
  main.textContent = String(title || "").trim();
  const translation = document.createElement("span");
  translation.className = "words-filter-translation";
  translation.hidden = true;
  translation.setAttribute("dir", "auto");
  button.appendChild(main);
  button.appendChild(translation);
  return button;
};

const lockSectionFilterButton = (button, title = "Locked section") => {
  if (!button) {
    return;
  }
  button.classList.add("is-locked");
  button.disabled = true;
  button.setAttribute("aria-disabled", "true");
  button.title = String(title || "Locked section");
};

const REGISTER_LEVEL_ORDER = ["informal", "neutral", "polite", "formal"];
const REGISTER_FILTER_LABELS = {
  all: "All Registers",
  informal: "Informal",
  neutral: "Neutral",
  polite: "Polite",
  formal: "Formal",
};

const normalizeRegisterValue = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    return "neutral";
  }
  if (["casual", "friendly", "informal"].includes(raw)) {
    return "informal";
  }
  if (["neutral", "standard", "default"].includes(raw)) {
    return "neutral";
  }
  if (["polite", "respectful", "honorific"].includes(raw)) {
    return "polite";
  }
  if (["formal", "very formal", "ceremonial"].includes(raw)) {
    return "formal";
  }
  return "neutral";
};

const inferKoreanRegisterFromText = (value) => {
  const text = String(value || "")
    .trim()
    .replace(/[.!?]+$/g, "");
  if (!text) {
    return "neutral";
  }

  const explicitInformal = new Set([
    "안녕",
    "잘 가",
    "미안해",
    "고마워",
    "괜찮아",
    "잘 지내?",
    "요즘 어때?",
    "요즘 어때",
  ]);
  if (explicitInformal.has(text)) {
    return "informal";
  }

  if (/(습니다|ㅂ니다|드립니다|올립니다|죄송합니다)$/.test(text)) {
    return "formal";
  }

  if (/(세요|십시오|요|예요|에요|까요|나요|군요|네요)$/.test(text)) {
    return "polite";
  }

  if (/(해|해요|줘|가|와|어|아)\?$/.test(text)) {
    return "informal";
  }

  return "neutral";
};

const inferPhraseRegisterByWorld = (value, section = "") => {
  const text = String(value || "").trim();
  if (!text) {
    return "neutral";
  }
  const lower = text.toLowerCase();
  const sectionKey = String(section || "").trim();

  if (WORLD_KEY === "korean") {
    return inferKoreanRegisterFromText(text);
  }

  if (WORLD_KEY === "french") {
    if (/\b(salut|peux-tu|pourrais-tu|ça va)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(vous\b|excusez|pardonnez|pourriez-vous|s'il vous plaît)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "german") {
    if (/\b(du\b|dir\b|dich\b|kannst du|könntest du|tschüss)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(sie\b|ihnen\b|entschuldigen sie|könnten sie)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "spanish") {
    if (/\b(puedes|podrías|cómo estás|tú)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(disculpe|perdóneme|usted|podría)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "portuguese") {
    if (/\b(oi|tu\b|valeu|tchau)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(com licença|você|desculpe|poderia)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "dutch") {
    if (/\b(doei|kun je|zou je)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(u\b|kunt u|zou u|dank u)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "swedish") {
    if (/\b(hej då|du\b|snälla)\b/.test(lower)) {
      return "informal";
    }
    if (/\b(ursäkta|ni\b|skulle ni)\b/.test(lower)) {
      return "polite";
    }
  }

  if (WORLD_KEY === "arabic") {
    if (/(أهلا|إزيك|ازيك)/.test(text)) {
      return "informal";
    }
    if (/(هل يمكنك|من فضلك|عفوا|أعتذر|اسمح)/.test(text)) {
      return "formal";
    }
  }

  if (sectionKey === "Requests") {
    if (/(please|por favor|s'il vous plaît|bitte|من فضلك)/i.test(text)) {
      return WORLD_KEY === "arabic" ? "formal" : "polite";
    }
  }

  return "neutral";
};

const resolvePhraseNeutralFallbackRegister = () => {
  if (WORLD_KEY === "arabic") {
    return "formal";
  }
  if (
    [
      "korean",
      "japanese",
      "hindi",
      "french",
      "german",
      "spanish",
      "portuguese",
      "dutch",
      "swedish",
    ].includes(WORLD_KEY)
  ) {
    return "polite";
  }
  return "neutral";
};

const resolveCardRegister = (registerValue, fallbackText = "") => {
  const explicit = String(registerValue || "").trim();
  if (explicit) {
    return normalizeRegisterValue(explicit);
  }
  if (WORLD_KEY === "korean") {
    return inferKoreanRegisterFromText(fallbackText);
  }
  return "neutral";
};

const getDefaultRegisterFilterForWorld = () => "all";

const getRegisterFilterLabel = (register) => {
  const key = String(register || "all").trim().toLowerCase();
  return REGISTER_FILTER_LABELS[key] || REGISTER_FILTER_LABELS.neutral;
};

const ensureCardRegisterBadge = (card) => {
  return null;
};

const applyCardRegisterBadge = (card, registerValue) => {
  if (!card) {
    return;
  }
  const normalized = resolveCardRegister(registerValue, card.dataset.word || card.dataset.phrase);
  card.dataset.register = normalized;
  const badge = card.querySelector(".map-register-badge");
  if (badge) {
    badge.remove();
  }
};

const getRegisterFilterOptionsForSections = (sections, cardSelector) => {
  const values = new Set();
  sections.forEach((section) => {
    section.querySelectorAll(cardSelector).forEach((card) => {
      values.add(normalizeRegisterValue(card.dataset.register));
    });
  });
  if (!values.size) {
    return [];
  }
  const hasMeaningfulRegister = Array.from(values).some((value) => value !== "neutral");
  if (!hasMeaningfulRegister) {
    return [];
  }
  return ["all", ...REGISTER_LEVEL_ORDER.filter((value) => values.has(value))];
};

const applySectionAndRegisterFilter = (
  sections,
  sectionFilter,
  registerFilter,
  cardSelector,
  onAfterApply
) => {
  const activeSection = String(sectionFilter || "all");
  const activeRegister = String(registerFilter || "all").trim().toLowerCase();
  sections.forEach((section) => {
    const matchesSection = activeSection === "all" || section.dataset.section === activeSection;
    let visibleCards = 0;
    section.querySelectorAll(cardSelector).forEach((card) => {
      const cardRegister = normalizeRegisterValue(card.dataset.register);
      const matchesRegister = activeRegister === "all" || cardRegister === activeRegister;
      card.style.display = matchesRegister ? "" : "none";
      if (matchesRegister) {
        visibleCards += 1;
      }
    });
    const showSection = matchesSection && visibleCards > 0;
    section.style.display = showSection ? "" : "none";
    if (showSection) {
      section.classList.add("is-visible");
    } else {
      section.classList.remove("is-visible");
    }
  });
  if (typeof onAfterApply === "function") {
    onAfterApply();
  }
};

const trackMapSectionEvent = (mapKey, sectionKey, status = "started", score = null, questToggleMode = "") => {
  if (typeof window.cosmicaTrackLearningProgress !== "function") {
    return;
  }
  const normalizedMap = String(mapKey || "").trim().toLowerCase();
  const normalizedSection = String(sectionKey || "").trim();
  if (!normalizedMap || !normalizedSection) {
    return;
  }
  window.cosmicaTrackLearningProgress({
    status,
    mapKey: normalizedMap,
    sectionKey: normalizedSection,
    score,
    questToggleMode,
  });
};

const slugifyCardPracticeValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const buildCardPracticeSectionKey = (sectionKey, cardKey) => {
  const normalizedSection = String(sectionKey || "core").trim() || "core";
  const normalizedCard = slugifyCardPracticeValue(cardKey) || "card";
  return `card::${normalizedSection}::${normalizedCard}`;
};

const isSectionCompletedInProgressState = (mapKey, sectionKey, mode = "complete") => {
  const normalizedMode = String(mode || "complete").trim().toLowerCase();
  const isPracticeMode = normalizedMode === "practice";
  const overrideSectionKey = isPracticeMode ? `practice::${sectionKey}` : sectionKey;
  const overrideValue =
    typeof window.cosmicaGetSectionCompletionOverride === "function"
      ? window.cosmicaGetSectionCompletionOverride({
          worldKey: WORLD_KEY,
          mapKey,
          sectionKey: overrideSectionKey,
        })
      : null;
  if (typeof overrideValue === "boolean") {
    return overrideValue;
  }
  if (!window.cosmicaGamification || typeof window.cosmicaGamification.getSectionProgress !== "function") {
    return false;
  }
  const progress = window.cosmicaGamification.getSectionProgress({
    worldKey: WORLD_KEY,
    mapKey,
    sectionKey,
  });
  if (isPracticeMode) {
    return Boolean(progress?.practiceQuestCheckedAt);
  }
  return (
    String(progress?.status || "").trim().toLowerCase() === "completed" ||
    Boolean(progress?.firstCompletedAt)
  );
};

const getPremiumAccessState = () => {
  const readPremiumAccessHint = () => {
    try {
      const value = String(sessionStorage.getItem("cosmicaPremiumAccessHint") || "")
        .trim()
        .toLowerCase();
      if (value === "1" || value === "true" || value === "yes") {
        return true;
      }
      if (value === "0" || value === "false" || value === "no") {
        return false;
      }
      return null;
    } catch {
      return null;
    }
  };

  const snapshot =
    typeof window.cosmicaGamification?.getState === "function"
      ? window.cosmicaGamification.getState()
      : null;
  if (!snapshot) {
    return readPremiumAccessHint() === true ? "loading" : "non-premium";
  }
  if (snapshot.ready !== true) {
    const premiumHint = readPremiumAccessHint();
    if (premiumHint === true) {
      return "loading";
    }
    if (snapshot.isAuthenticated !== true) {
      return "non-premium";
    }
    return "loading";
  }
  if (snapshot.isAuthenticated !== true) {
    return "non-premium";
  }
  const user = snapshot && snapshot.user && typeof snapshot.user === "object" ? snapshot.user : null;
  const premiumFlagRaw = user?.isPremium ?? user?.premium;
  const premiumFlagText = String(premiumFlagRaw ?? "")
    .trim()
    .toLowerCase();
  const premiumTier = String(user?.planTier || user?.tier || user?.plan || user?.membership || "")
    .trim()
    .toLowerCase();
  const premiumStatus = String(
    user?.premiumStatus ||
      user?.subscriptionStatus ||
      user?.premiumStripeSubscriptionStatus ||
      user?.stripeSubscriptionStatus ||
      ""
  )
    .trim()
    .toLowerCase();
  const premiumEndRaw = String(
    user?.premiumCurrentPeriodEnd ||
      user?.premiumEndsAt ||
      user?.premiumExpiresAt ||
      user?.subscriptionEndsAt ||
      user?.currentPeriodEnd ||
      user?.planEndsAt ||
      user?.expiresAt ||
      ""
  ).trim();
  const premiumEndMs = Date.parse(premiumEndRaw);
  const hasFuturePremiumEnd = Number.isFinite(premiumEndMs) && premiumEndMs > Date.now();
  const statusIndicatesPremium =
    premiumStatus === "active" ||
    premiumStatus === "trialing" ||
    premiumStatus === "past_due" ||
    premiumStatus === "canceling" ||
    premiumStatus === "grace";
  const hasPremiumAccess = (
    premiumFlagRaw === true ||
    premiumFlagText === "1" ||
    premiumFlagText === "true" ||
    premiumFlagText === "yes" ||
    premiumFlagText === "premium" ||
    premiumFlagText === "pro" ||
    premiumFlagText === "plus" ||
    premiumTier === "premium" ||
    premiumTier === "pro" ||
    premiumTier === "plus" ||
    premiumTier === "paid" ||
    statusIndicatesPremium ||
    hasFuturePremiumEnd
  );
  return hasPremiumAccess ? "premium" : "non-premium";
};

const GRAMMAR_PREVIEW_SECTION_LIMIT = 2;
const GRAMMAR_PREVIEW_CARD_LIMIT = 4;
const GRAMMAR_FREE_PREVIEW_UNLOCKED_SECTIONS = new Set(["sentence structure", "verbs"]);
const WORDS_PREVIEW_SECTION_LIMIT = 5;
const PHRASES_PREVIEW_SECTION_LIMIT = 5;
const MAPS_GRAMMAR_UNDER_EXPERT_REVIEW_WORLDS = new Set([]);

const normalizeGrammarSectionKey = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase();

const isGrammarWorldUnderExpertReview = () =>
  MAPS_GRAMMAR_UNDER_EXPERT_REVIEW_WORLDS.has(
    String(WORLD_KEY || "")
      .trim()
      .toLowerCase()
  );

const isGrammarSectionFreePreviewUnlocked = (sectionName = "") =>
  GRAMMAR_FREE_PREVIEW_UNLOCKED_SECTIONS.has(normalizeGrammarSectionKey(sectionName));

const isGrammarSectionLockedForCurrentAccess = (sectionName = "") => {
  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState === "premium" || premiumAccessState === "loading") {
    return false;
  }
  return !isGrammarSectionFreePreviewUnlocked(sectionName);
};

const openGrammarPremiumUpgrade = ({
  message = "Upgrade to Premium to unlock the full grammar map.",
} = {}) => {
  const snapshot =
    typeof window.cosmicaGamification?.getState === "function"
      ? window.cosmicaGamification.getState()
      : null;
  const isAuthenticated = Boolean(snapshot?.isAuthenticated);
  if (!isAuthenticated) {
    window.location.assign("/?openAuth=1&authPanel=signup#support");
    return;
  }
  if (typeof window.cosmicaAccountHub?.openPremium === "function") {
    window.cosmicaAccountHub.openPremium({ message });
    return;
  }
  const supportSection = document.getElementById("support");
  if (supportSection) {
    supportSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.location.href = "/?openAuth=1&authPanel=signup#support";
};

const createGrammarPreviewBanner = ({
  lockedSectionCount = 0,
  lockedTopicCount = 0,
  unlockedSectionNames = [],
} = {}) => {
  const banner = document.createElement("div");
  banner.className = "grammar-preview-banner";
  const title = document.createElement("p");
  title.className = "grammar-preview-title";
  title.textContent = "Free preview mode";
  const details = document.createElement("p");
  details.className = "grammar-preview-details";
  const unlockedLead = Array.isArray(unlockedSectionNames) && unlockedSectionNames.length
    ? `${unlockedSectionNames.join(" + ")} are fully open for free. `
    : "";
  details.textContent =
    lockedSectionCount > 0 || lockedTopicCount > 0
      ? `${unlockedLead}${lockedSectionCount} sections and ${lockedTopicCount} topics stay Premium-only.`
      : `${unlockedLead}Full grammar depth is available with Premium.`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "premium-setup-primary";
  button.textContent = "Unlock full grammar map";
  button.addEventListener("click", () => {
    openGrammarPremiumUpgrade({
      message: "Upgrade to Premium to unlock the full grammar map.",
    });
  });
  banner.appendChild(title);
  banner.appendChild(details);
  banner.appendChild(button);
  return banner;
};

const createGrammarPreviewUpgradeSection = ({
  lockedSectionCount = 0,
  lockedTopicCount = 0,
  unlockedSectionNames = [],
} = {}) => {
  const section = document.createElement("section");
  section.className = "section grammar-group grammar-preview-upgrade reveal";
  const titleWrap = document.createElement("div");
  titleWrap.className = "section-title";
  const heading = document.createElement("h2");
  heading.textContent = "Ready for full grammar?";
  titleWrap.appendChild(heading);
  const copy = document.createElement("p");
  copy.className = "grammar-preview-upgrade-copy";
  const unlockedLead = Array.isArray(unlockedSectionNames) && unlockedSectionNames.length
    ? `${unlockedSectionNames.join(" + ")} are free right now. `
    : "";
  copy.textContent =
    lockedSectionCount > 0 || lockedTopicCount > 0
      ? `${unlockedLead}Unlock ${lockedSectionCount} more sections and ${lockedTopicCount} more topics with Premium.`
      : `${unlockedLead}Unlock full grammar depth with Premium.`;
  const action = document.createElement("button");
  action.type = "button";
  action.className = "premium-setup-primary";
  action.textContent = "Upgrade to Premium";
  action.addEventListener("click", () => {
    openGrammarPremiumUpgrade({
      message: "Upgrade to Premium to unlock the full grammar map.",
    });
  });
  section.appendChild(titleWrap);
  section.appendChild(copy);
  section.appendChild(action);
  return section;
};

const createMapPreviewBanner = ({
  mapLabel = "map",
  itemLabel = "items",
  lockedSectionCount = 0,
  lockedItemCount = 0,
  unlockedSectionNames = [],
  upgradeMessage = "Upgrade to Premium to unlock the full map.",
} = {}) => {
  const banner = document.createElement("div");
  banner.className = "grammar-preview-banner";
  const title = document.createElement("p");
  title.className = "grammar-preview-title";
  title.textContent = "Free preview mode";
  const details = document.createElement("p");
  details.className = "grammar-preview-details";
  const unlockedLead = Array.isArray(unlockedSectionNames) && unlockedSectionNames.length
    ? `${unlockedSectionNames.join(" + ")} are fully open for free. `
    : "";
  details.textContent =
    lockedSectionCount > 0 || lockedItemCount > 0
      ? `${unlockedLead}${lockedSectionCount} sections and ${lockedItemCount} ${itemLabel} stay Premium-only.`
      : `${unlockedLead}Full ${mapLabel} is available with Premium.`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "premium-setup-primary";
  button.textContent = `Unlock full ${mapLabel}`;
  button.addEventListener("click", () => {
    openGrammarPremiumUpgrade({ message: upgradeMessage });
  });
  banner.appendChild(title);
  banner.appendChild(details);
  banner.appendChild(button);
  return banner;
};

const createMapPreviewUpgradeSection = ({
  mapLabel = "map",
  itemLabel = "items",
  lockedSectionCount = 0,
  lockedItemCount = 0,
  unlockedSectionNames = [],
  upgradeMessage = "Upgrade to Premium to unlock the full map.",
} = {}) => {
  const section = document.createElement("section");
  section.className = "section grammar-group grammar-preview-upgrade reveal";
  const titleWrap = document.createElement("div");
  titleWrap.className = "section-title";
  const heading = document.createElement("h2");
  heading.textContent = `Ready for full ${mapLabel}?`;
  titleWrap.appendChild(heading);
  const copy = document.createElement("p");
  copy.className = "grammar-preview-upgrade-copy";
  const unlockedLead = Array.isArray(unlockedSectionNames) && unlockedSectionNames.length
    ? `${unlockedSectionNames.join(" + ")} are free right now. `
    : "";
  copy.textContent =
    lockedSectionCount > 0 || lockedItemCount > 0
      ? `${unlockedLead}Unlock ${lockedSectionCount} more sections and ${lockedItemCount} more ${itemLabel} with Premium.`
      : `${unlockedLead}Unlock full ${mapLabel} with Premium.`;
  const action = document.createElement("button");
  action.type = "button";
  action.className = "premium-setup-primary";
  action.textContent = "Upgrade to Premium";
  action.addEventListener("click", () => {
    openGrammarPremiumUpgrade({ message: upgradeMessage });
  });
  section.appendChild(titleWrap);
  section.appendChild(copy);
  section.appendChild(action);
  return section;
};

const applySectionCompleteButtonState = (button, mapKey, sectionKey, mode = "complete") => {
  if (!button) {
    return;
  }
  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState !== "premium") {
    button.hidden = true;
    button.classList.remove("is-complete");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "");
    button.title = "";
    button.setAttribute("data-status-label", "");
    return;
  }

  button.hidden = false;
  const normalizedMode = String(mode || "complete").trim().toLowerCase();
  const isPracticeMode = normalizedMode === "practice";
  const isComplete = isSectionCompletedInProgressState(mapKey, sectionKey, normalizedMode);
  const statusLabel = isPracticeMode
    ? isComplete
      ? "Section practiced"
      : "Mark section as practiced"
    : isComplete
      ? "Completed"
      : "";
  button.classList.toggle("is-complete", isComplete);
  button.setAttribute("aria-pressed", isComplete ? "true" : "false");
  button.setAttribute(
    "aria-label",
    isPracticeMode
      ? isComplete
        ? "Unmark section as practiced"
        : "Mark section as practiced"
      : isComplete
        ? "Mark section incomplete"
        : ""
  );
  button.title = button.getAttribute("aria-label") || "";
  button.setAttribute("data-status-label", statusLabel);
};

const createSectionCompleteButton = (mapKey, sectionKey, options = {}) => {
  const mode = String(options?.mode || "complete").trim().toLowerCase() || "complete";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-section-complete-btn";
  button.style.position = "absolute";
  button.style.top = "16px";
  button.style.right = "16px";
  button.style.left = "auto";
  button.style.zIndex = "3";
  button.textContent = "✓";
  button.dataset.mapKey = String(mapKey || "").trim().toLowerCase();
  button.dataset.sectionKey = String(sectionKey || "").trim();
  button.dataset.toggleMode = mode;
  applySectionCompleteButtonState(button, button.dataset.mapKey, button.dataset.sectionKey, mode);
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const guestNotAuthenticated =
      window.cosmicaGamification &&
      typeof window.cosmicaGamification.getState === "function" &&
      !window.cosmicaGamification.getState()?.isAuthenticated;
    const premiumAccessState = getPremiumAccessState();
    if (premiumAccessState === "loading") {
      return;
    }
    const targetMapKey = String(button.dataset.mapKey || "").trim().toLowerCase();
    const targetSectionKey = String(button.dataset.sectionKey || "").trim();
    const targetMode = String(button.dataset.toggleMode || "complete").trim().toLowerCase();
    const targetIsPracticeMode = targetMode === "practice";
    const overrideSectionKey = targetIsPracticeMode ? `practice::${targetSectionKey}` : targetSectionKey;
    if (!targetMapKey || !targetSectionKey || button.dataset.busy === "1") {
      return;
    }
    const shouldUncheck = button.classList.contains("is-complete");
    const statusToSend = shouldUncheck ? "uncompleted" : "completed";
    if (typeof window.cosmicaSetSectionCompletionOverride === "function") {
      window.cosmicaSetSectionCompletionOverride({
        worldKey: WORLD_KEY,
        mapKey: targetMapKey,
        sectionKey: overrideSectionKey,
        isComplete: !shouldUncheck,
      });
    }

    button.dataset.busy = "1";
    button.disabled = true;
    try {
      if (
        window.cosmicaGamification &&
        typeof window.cosmicaGamification.trackProgress === "function" &&
        !guestNotAuthenticated
      ) {
        await window.cosmicaGamification.trackProgress({
          worldKey: WORLD_KEY,
          mapKey: targetMapKey,
          sectionKey: targetSectionKey,
          status: statusToSend,
          questToggleMode: targetIsPracticeMode ? "practice" : undefined,
        });
      } else {
        trackMapSectionEvent(
          targetMapKey,
          targetSectionKey,
          statusToSend,
          null,
          targetIsPracticeMode ? "practice" : ""
        );
      }
    } finally {
      button.disabled = false;
      delete button.dataset.busy;
      applySectionCompleteButtonState(button, targetMapKey, targetSectionKey, targetMode);
      if (targetMapKey === "words") {
        refreshWordsLessonShell();
      }
      if (targetMapKey === "phrases") {
        refreshPhrasesLessonShell();
      }
    }
  });
  return button;
};

const refreshAllSectionCompleteButtons = () => {
  document.querySelectorAll(".map-section-complete-btn").forEach((button) => {
    const mapKey = String(button?.dataset?.mapKey || "").trim().toLowerCase();
    const sectionKey = String(button?.dataset?.sectionKey || "").trim();
    const mode = String(button?.dataset?.toggleMode || "complete").trim().toLowerCase();
    if (!mapKey || !sectionKey) {
      return;
    }
    applySectionCompleteButtonState(button, mapKey, sectionKey, mode);
  });
  refreshWordsLessonShell();
  refreshPhrasesLessonShell();
};

let refreshAllSectionCompleteButtonsRafId = 0;
const scheduleRefreshAllSectionCompleteButtons = () => {
  if (refreshAllSectionCompleteButtonsRafId) {
    return;
  }
  refreshAllSectionCompleteButtonsRafId = window.requestAnimationFrame(() => {
    refreshAllSectionCompleteButtonsRafId = 0;
    refreshAllSectionCompleteButtons();
  });
};

if (typeof window.cosmicaGamification?.subscribe === "function") {
  window.cosmicaGamification.subscribe(() => {
    scheduleRefreshAllSectionCompleteButtons();
  });
}

const createCardPracticeButton = (mapKey, sectionKey, cardKey) => {
  const practiceSectionKey = buildCardPracticeSectionKey(sectionKey, cardKey);
  const button = createSectionCompleteButton(mapKey, practiceSectionKey, { mode: "practice" });
  button.classList.add("map-card-practice-btn");
  return button;
};

const ensureWordsSectionProgressButtons = (root) => {
  if (!(root instanceof HTMLElement)) {
    return;
  }
  root.querySelectorAll(".words-group[data-section]").forEach((section) => {
    const sectionKey = String(section.dataset.section || "").trim();
    if (!sectionKey) {
      return;
    }
    if (!section.querySelector('.map-section-complete-btn[data-map-key="words"]:not(.map-card-practice-btn)')) {
      const grid = section.querySelector(".words-grid");
      const button = createSectionCompleteButton("words", sectionKey);
      if (grid) {
        section.insertBefore(button, grid);
      } else {
        section.appendChild(button);
      }
    }
    section.querySelectorAll(".word-card").forEach((card, index) => {
      if (card.querySelector('.map-card-practice-btn[data-map-key="words"]')) {
        return;
      }
      const cardKey = String(card.dataset.word || "").trim() || `word-${index}`;
      card.appendChild(createCardPracticeButton("words", sectionKey, cardKey));
    });
  });
};

const ensurePhrasesSectionProgressButtons = (root) => {
  if (!(root instanceof HTMLElement)) {
    return;
  }
  root.querySelectorAll(".phrases-group[data-section]").forEach((section) => {
    const sectionKey = String(section.dataset.section || "").trim();
    if (!sectionKey) {
      return;
    }
    if (
      !section.querySelector('.map-section-complete-btn[data-map-key="phrases"]:not(.map-card-practice-btn)')
    ) {
      const grid = section.querySelector(".words-grid");
      const button = createSectionCompleteButton("phrases", sectionKey);
      if (grid) {
        section.insertBefore(button, grid);
      } else {
        section.appendChild(button);
      }
    }
    section.querySelectorAll(".phrase-card").forEach((card, index) => {
      if (card.querySelector('.map-card-practice-btn[data-map-key="phrases"]')) {
        return;
      }
      const cardKey = String(card.dataset.phrase || "").trim() || `phrase-${index}`;
      card.appendChild(createCardPracticeButton("phrases", sectionKey, cardKey));
    });
  });
};

const ensureGrammarSectionProgressButtons = (root) => {
  if (!(root instanceof HTMLElement)) {
    return;
  }
  root.querySelectorAll(".grammar-group[data-section]").forEach((section) => {
    const sectionKey = String(section.dataset.section || "").trim();
    if (!sectionKey) {
      return;
    }
    if (
      !section.querySelector('.map-section-complete-btn[data-map-key="grammar"]:not(.map-card-practice-btn)')
    ) {
      const grid = section.querySelector(".words-grid");
      const button = createSectionCompleteButton("grammar", sectionKey);
      if (grid) {
        section.insertBefore(button, grid);
      } else {
        section.appendChild(button);
      }
    }
  });
};

const getMapRenderBatchSize = () => {
  const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
  if (isMobileViewport) {
    return 1;
  }
  const connectionInfo =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const prefersReducedData = Boolean(connectionInfo && connectionInfo.saveData === true);
  const effectiveNetworkType = String((connectionInfo && connectionInfo.effectiveType) || "").toLowerCase();
  const isSlowNetwork = effectiveNetworkType === "slow-2g" || effectiveNetworkType === "2g";
  const deviceMemoryGb = Number(navigator.deviceMemory || 0);
  const cpuThreadCount = Number(navigator.hardwareConcurrency || 0);
  const isLowPowerDevice =
    (deviceMemoryGb > 0 && deviceMemoryGb <= 4) ||
    (cpuThreadCount > 0 && cpuThreadCount <= 4);
  return isLowPowerDevice || prefersReducedData || isSlowNetwork ? 1 : 2;
};

const scheduleMapRenderStep = (callback) => {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(callback);
    return;
  }
  window.setTimeout(callback, 0);
};

const renderSectionsProgressively = ({
  entries,
  buildSection,
  onSectionReady,
  onFirstSectionReady,
  onComplete,
  shouldContinue,
}) => {
  if (typeof shouldContinue === "function" && !shouldContinue()) {
    return;
  }
  if (!Array.isArray(entries) || !entries.length) {
    if (
      typeof onComplete === "function" &&
      (typeof shouldContinue !== "function" || shouldContinue())
    ) {
      onComplete();
    }
    return;
  }

  let index = 0;
  const batchSize = Math.max(1, getMapRenderBatchSize());

  const renderBatch = () => {
    if (typeof shouldContinue === "function" && !shouldContinue()) {
      return;
    }
    let rendered = 0;
    while (index < entries.length && rendered < batchSize) {
      if (typeof shouldContinue === "function" && !shouldContinue()) {
        return;
      }
      const entry = entries[index];
      const section = buildSection(entry);
      if (typeof onSectionReady === "function") {
        onSectionReady(section, entry, index);
      }
      if (index === 0 && typeof onFirstSectionReady === "function") {
        onFirstSectionReady(section, entry, index);
      }
      index += 1;
      rendered += 1;
    }

    if (index < entries.length) {
      if (typeof shouldContinue === "function" && !shouldContinue()) {
        return;
      }
      scheduleMapRenderStep(renderBatch);
      return;
    }

    if (
      typeof onComplete === "function" &&
      (typeof shouldContinue !== "function" || shouldContinue())
    ) {
      onComplete();
    }
  };

  renderBatch();
};

let wordsSectionsRenderRunId = 0;
let phrasesSectionsRenderRunId = 0;
let grammarSectionsRenderRunId = 0;
let refreshWordsLessonShell = () => {};
let refreshPhrasesLessonShell = () => {};

const dedupeRenderedMapSections = (container, selector) => {
  if (!container) {
    return [];
  }
  const seenSections = new Set();
  return Array.from(container.querySelectorAll(selector)).filter((section) => {
    const sectionKey = String(section?.dataset?.section || "").trim();
    if (!sectionKey) {
      return false;
    }
    if (seenSections.has(sectionKey)) {
      section.remove();
      return false;
    }
    seenSections.add(sectionKey);
    return true;
  });
};

const replaceMapSectionsArray = (target, nextSections) => {
  target.length = 0;
  nextSections.forEach((section) => target.push(section));
};

const buildStaticWordSectionEntries = (sections = []) =>
  sections
    .map((section) => {
      const sectionName = String(section?.dataset?.section || "").trim();
      if (!sectionName) {
        return null;
      }
      const words = Array.from(section.querySelectorAll(".word-card[data-word]"))
        .map((card) => String(card?.dataset?.word || "").trim())
        .filter(Boolean);
      if (!words.length) {
        return null;
      }
      return { sectionName, words };
    })
    .filter(Boolean);

const buildStaticPhraseSectionEntries = (sections = []) =>
  sections
    .map((section) => {
      const sectionName = String(section?.dataset?.section || "").trim();
      if (!sectionName) {
        return null;
      }
      const phrases = Array.from(section.querySelectorAll(".phrase-card[data-phrase]"))
        .map((card) => String(card?.dataset?.phrase || "").trim())
        .filter(Boolean);
      if (!phrases.length) {
        return null;
      }
      return { sectionName, phrases };
    })
    .filter(Boolean);

const buildStaticGrammarSectionEntries = (sections = []) =>
  sections
    .map((section) => {
      const sectionName = String(section?.dataset?.section || "").trim();
      if (!sectionName) {
        return null;
      }
      const concepts = Array.from(section.querySelectorAll(".grammar-card")).map((card) => ({
        title: String(
          card?.dataset?.sourceTitle ||
            card?.dataset?.concept ||
            card.querySelector(".grammar-title-main")?.textContent ||
            ""
        ).trim(),
      }));
      const filteredConcepts = concepts.filter((concept) => concept.title);
      if (!filteredConcepts.length) {
        return null;
      }
      return { sectionName, concepts: filteredConcepts };
    })
    .filter(Boolean);

const renderWordsSections = () => {
  const renderRunId = ++wordsSectionsRenderRunId;
  const isActiveRender = () => renderRunId === wordsSectionsRenderRunId;
  const container = document.getElementById("wordsSections");
  const controls = document.getElementById("wordsControls");
  if (!container) {
    return;
  }
  const existingSections = dedupeRenderedMapSections(
    container,
    ".words-group[data-section]"
  );
  const existingSectionMap = new Map(
    existingSections.map((section) => [String(section.dataset.section || "").trim(), section])
  );
  if (controls) {
    controls.innerHTML = "";
  }
  container.querySelectorAll(".map-unavailable, .grammar-preview-upgrade").forEach((node) => {
    node.remove();
  });
  if (!existingSections.length) {
    container.innerHTML = "";
  }

  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState === "loading") {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshWordsMapTranslations();
      return;
    }
    renderMapLoadingState("words");
    return;
  }
  const isPreviewMode = premiumAccessState !== "premium";

  const sectionEntries = [];
  WORD_SECTION_ORDER.forEach((sectionName) => {
    const words = getWorldWordList(sectionName);
    if (!Array.isArray(words) || !words.length) {
      return;
    }
    sectionEntries.push({ sectionName, words });
  });

  const staticSectionEntries =
    !sectionEntries.length && existingSections.length
      ? buildStaticWordSectionEntries(existingSections)
      : [];
  const usingStaticSectionFallback = !sectionEntries.length && staticSectionEntries.length > 0;
  const sourceSectionEntries = usingStaticSectionFallback ? staticSectionEntries : sectionEntries;

  if (!sourceSectionEntries.length) {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshWordsMapTranslations();
      return;
    }
    container.appendChild(buildMapUnavailableState("Words"));
    return;
  }

  const totalSectionCount = sourceSectionEntries.length;
  const totalWordCount = sourceSectionEntries.reduce((sum, entry) => sum + entry.words.length, 0);
  const renderEntries =
    isPreviewMode && !usingStaticSectionFallback
      ? sourceSectionEntries
          .slice(0, WORDS_PREVIEW_SECTION_LIMIT)
          .map(({ sectionName, words }) => ({
            sectionName,
            words: words.slice(),
          }))
      : sourceSectionEntries.map(({ sectionName, words }) => ({
          sectionName,
          words: words.slice(),
        }));
  const unlockedSectionNames = renderEntries.map((entry) => entry.sectionName);
  const previewSectionSet = new Set(renderEntries.map((entry) => entry.sectionName));
  const previewSectionCount = renderEntries.length;
  const previewWordCount = renderEntries.reduce((sum, entry) => sum + entry.words.length, 0);
  const lockedSectionCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalSectionCount - previewSectionCount);
  const lockedWordCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalWordCount - previewWordCount);
  const hasLockedPreviewContent = lockedSectionCount > 0 || lockedWordCount > 0;

  const sections = [];
  const renderSectionNameSet = new Set(renderEntries.map((entry) => entry.sectionName));
  existingSections.forEach((section) => {
    if (!renderSectionNameSet.has(String(section.dataset.section || "").trim())) {
      section.remove();
    }
  });
  renderEntries.forEach((entry) => {
    const existing = existingSectionMap.get(entry.sectionName);
    if (existing) {
      sections.push(existing);
    }
  });

  const buildWordsSection = ({ sectionName, words }) => {
    const section = document.createElement("section");
    section.className = "section words-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    const sourceSectionName = sectionName;
    const displaySectionName =
      getWorldSectionLabelFromPack("words", sourceSectionName) || sourceSectionName;
    const titleHeading = document.createElement("h2");
    titleHeading.dataset.sourceTitle = sourceSectionName;
    // Keep translation source stable in English so "(...)" remains meaning-focused.
    titleHeading.dataset.baseTitle = sourceSectionName;
    const titleMain = document.createElement("span");
    titleMain.className = "map-section-title-main";
    titleMain.textContent = displaySectionName;
    titleHeading.appendChild(titleMain);
    title.appendChild(titleHeading);
    const grid = document.createElement("div");
    grid.className = "words-grid";
    words.forEach((word) => {
      const card = document.createElement("div");
      card.className = "card word-card";
      card.dataset.word = word;
      card.innerHTML = `
        <div class="word">${word}</div>
        <div class="word-translation"></div>
        <button class="word-audio" type="button" data-word="${word}" aria-hidden="true" tabindex="-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
            <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      const worldEntry = WORLD_TRANSLATIONS?.words?.[sectionName]?.[word] || null;
      applyCardRegisterBadge(card, worldEntry?.register);
      card.appendChild(createCardPracticeButton("words", sectionName, word));
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(createSectionCompleteButton("words", sectionName));
    section.appendChild(grid);
    return section;
  };

  const entriesToBuild = renderEntries.filter(({ sectionName }) => !existingSectionMap.has(sectionName));
  if (sections.length) {
    document.body.classList.remove("maps-loading");
  }

  const initializeWordsControls = () => {
    if (!controls) {
      return;
    }
    let activeFilter = "all";
    let activeRegisterFilter = getDefaultRegisterFilterForWorld();
    const wordsUi = getWordsUiLabels();
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = wordsUi.words;
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = wordsUi.chooseSection;
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const allButton = createSectionFilterButton(wordsUi.allSections, "all", "All");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("words-page")) {
      document.body.dataset.wordsFilter = "all";
    }

    sourceSectionEntries.forEach(({ sectionName }) => {
      const displayName =
        getWorldSectionLabelFromPack("words", sectionName) ||
        (sectionName === "countries" ? "Countries" : sectionName);
      const button = createSectionFilterButton(displayName, sectionName, sectionName);
      const isLockedPreviewSection = isPreviewMode && !previewSectionSet.has(sectionName);
      if (isLockedPreviewSection) {
        lockSectionFilterButton(button);
      }
      list.appendChild(button);
    });

    const applyFilter = () => {
      if (document.body.classList.contains("words-page")) {
        document.body.dataset.wordsFilter = activeFilter;
      }
      applySectionAndRegisterFilter(
        sections,
        activeFilter,
        activeRegisterFilter,
        ".word-card",
        updateWordsTopState
      );
    };

    const activateFilter = (filter = "all", { scroll = true } = {}) => {
      const nextFilter = String(filter || "all").trim() || "all";
      activeFilter = nextFilter;
      list.querySelectorAll(".words-filter").forEach((btn) => {
        btn.classList.toggle("is-active", (btn.dataset.filter || "all") === nextFilter);
      });
      applyFilter();
      if (!scroll) {
        return;
      }
      if (nextFilter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
        return;
      }
      const target = sections.find((section) => section.dataset.section === nextFilter);
      if (target) {
        const nav = document.querySelector(".nav");
        const navHeight = nav ? nav.offsetHeight : 0;
        const offset = Math.max(0, navHeight - 60);
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      if (button.disabled || button.classList.contains("is-locked")) {
        return;
      }
      const filter = button.dataset.filter || "all";
      activateFilter(filter, { scroll: true });
    });

    const registerOptions = getRegisterFilterOptionsForSections(sections, ".word-card");
    if (registerOptions.length && !registerOptions.includes(activeRegisterFilter)) {
      activeRegisterFilter = "all";
    }

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);

    if (registerOptions.length) {
      const shouldLockRegisterControls = isPreviewMode;
      const registerLabel = document.createElement("div");
      registerLabel.className = "words-controls-register-label";
      registerLabel.textContent = "Register";
      registerLabel.classList.toggle("is-locked", shouldLockRegisterControls);
      const registerList = document.createElement("div");
      registerList.className = "words-controls-list words-register-list";
      registerList.classList.toggle("is-locked", shouldLockRegisterControls);
      registerOptions.forEach((value) => {
        const button = createSectionFilterButton(getRegisterFilterLabel(value), value);
        button.dataset.registerFilter = value;
        if (value === activeRegisterFilter) {
          button.classList.add("is-active");
        }
        if (shouldLockRegisterControls) {
          lockSectionFilterButton(button, "Unlock with Premium");
        }
        registerList.appendChild(button);
      });
      registerList.addEventListener("click", (event) => {
        const button = event.target.closest(".words-filter[data-register-filter]");
        if (!button) {
          return;
        }
        if (button.disabled || button.classList.contains("is-locked")) {
          return;
        }
        registerList
          .querySelectorAll(".words-filter[data-register-filter]")
          .forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        activeRegisterFilter = String(button.dataset.registerFilter || "all").toLowerCase();
        applyFilter();
      });
      controls.appendChild(registerLabel);
      controls.appendChild(registerList);
    }

    applyFilter();
  };

  renderSectionsProgressively({
    entries: entriesToBuild,
    buildSection: buildWordsSection,
    onSectionReady: (section) => {
      if (!isActiveRender()) {
        return;
      }
      container.appendChild(section);
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".words-group[data-section]")
      );
    },
    onFirstSectionReady: () => {
      if (!isActiveRender()) {
        return;
      }
      document.body.classList.remove("maps-loading");
    },
    onComplete: () => {
      if (!isActiveRender()) {
        return;
      }
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".words-group[data-section]")
      );
      ensureWordsSectionProgressButtons(container);
      initializeWordsControls();
      if (isPreviewMode && hasLockedPreviewContent) {
        container.appendChild(
          createMapPreviewUpgradeSection({
            mapLabel: "words map",
            itemLabel: "words",
            lockedSectionCount,
            lockedItemCount: lockedWordCount,
            unlockedSectionNames,
            upgradeMessage: "Upgrade to Premium to unlock the full words map.",
          })
        );
      }
      refreshWordsMapTranslations();
    },
    shouldContinue: isActiveRender,
  });
};

const renderPhrasesSections = () => {
  const renderRunId = ++phrasesSectionsRenderRunId;
  const isActiveRender = () => renderRunId === phrasesSectionsRenderRunId;
  const container = document.getElementById("phrasesSections");
  const controls = document.getElementById("phrasesControls");
  if (!container) {
    return;
  }
  const existingSections = dedupeRenderedMapSections(
    container,
    ".phrases-group[data-section]"
  );
  const existingSectionMap = new Map(
    existingSections.map((section) => [String(section.dataset.section || "").trim(), section])
  );
  if (controls) {
    controls.innerHTML = "";
  }
  container.querySelectorAll(".map-unavailable, .grammar-preview-upgrade").forEach((node) => {
    node.remove();
  });
  if (!existingSections.length) {
    container.innerHTML = "";
  }

  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState === "loading") {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshPhrasesMapTranslations();
      return;
    }
    renderMapLoadingState("phrases");
    return;
  }
  const isPreviewMode = premiumAccessState !== "premium";

  const sectionEntries = [];
  PHRASE_SECTION_ORDER.forEach((sectionName) => {
    const phrases = getWorldPhraseList(sectionName);
    if (!Array.isArray(phrases) || !phrases.length) {
      return;
    }
    sectionEntries.push({ sectionName, phrases });
  });

  const staticSectionEntries =
    !sectionEntries.length && existingSections.length
      ? buildStaticPhraseSectionEntries(existingSections)
      : [];
  const usingStaticSectionFallback = !sectionEntries.length && staticSectionEntries.length > 0;
  const sourceSectionEntries = usingStaticSectionFallback ? staticSectionEntries : sectionEntries;

  if (!sourceSectionEntries.length) {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshPhrasesMapTranslations();
      return;
    }
    container.appendChild(buildMapUnavailableState("Phrases"));
    return;
  }

  const totalSectionCount = sourceSectionEntries.length;
  const totalPhraseCount = sourceSectionEntries.reduce((sum, entry) => sum + entry.phrases.length, 0);
  const renderEntries =
    isPreviewMode && !usingStaticSectionFallback
      ? sourceSectionEntries
          .slice(0, PHRASES_PREVIEW_SECTION_LIMIT)
          .map(({ sectionName, phrases }) => ({
            sectionName,
            phrases: phrases.slice(),
          }))
      : sourceSectionEntries.map(({ sectionName, phrases }) => ({
          sectionName,
          phrases: phrases.slice(),
        }));
  const unlockedSectionNames = renderEntries.map((entry) => entry.sectionName);
  const previewSectionSet = new Set(renderEntries.map((entry) => entry.sectionName));
  const previewSectionCount = renderEntries.length;
  const previewPhraseCount = renderEntries.reduce((sum, entry) => sum + entry.phrases.length, 0);
  const lockedSectionCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalSectionCount - previewSectionCount);
  const lockedPhraseCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalPhraseCount - previewPhraseCount);
  const hasLockedPreviewContent = lockedSectionCount > 0 || lockedPhraseCount > 0;

  const sections = [];
  const renderSectionNameSet = new Set(renderEntries.map((entry) => entry.sectionName));
  existingSections.forEach((section) => {
    if (!renderSectionNameSet.has(String(section.dataset.section || "").trim())) {
      section.remove();
    }
  });
  renderEntries.forEach((entry) => {
    const existing = existingSectionMap.get(entry.sectionName);
    if (existing) {
      sections.push(existing);
    }
  });

  const buildPhrasesSection = ({ sectionName, phrases }) => {
    const section = document.createElement("section");
    section.className = "section phrases-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    const sourceSectionName = sectionName;
    const displaySectionName =
      getWorldSectionLabelFromPack("phrases", sourceSectionName) || sourceSectionName;
    const titleHeading = document.createElement("h2");
    titleHeading.dataset.sourceTitle = sourceSectionName;
    // Keep translation source stable in English so "(...)" remains meaning-focused.
    titleHeading.dataset.baseTitle = sourceSectionName;
    const titleMain = document.createElement("span");
    titleMain.className = "map-section-title-main";
    titleMain.textContent = displaySectionName;
    titleHeading.appendChild(titleMain);
    title.appendChild(titleHeading);
    const grid = document.createElement("div");
    grid.className = "words-grid";
    phrases.forEach((phrase) => {
      const card = document.createElement("div");
      card.className = "card phrase-card";
      card.dataset.phrase = phrase;
      card.innerHTML = `
        <div class="phrase-text">${phrase}</div>
        <div class="phrase-translation"></div>
        <button class="word-audio" type="button" data-word="${phrase}" aria-hidden="true" tabindex="-1">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 9v6h4l5 4V5l-5 4H5Z" fill="currentColor"/>
            <path d="M17 8c1.5 1.2 2.5 3 2.5 4.9S18.5 16.7 17 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      applyCardRegisterBadge(card, resolvePhraseRegister(sectionName, phrase));
      card.appendChild(createCardPracticeButton("phrases", sectionName, phrase));
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(createSectionCompleteButton("phrases", sectionName));
    section.appendChild(grid);
    return section;
  };

  const entriesToBuild = renderEntries.filter(({ sectionName }) => !existingSectionMap.has(sectionName));
  if (sections.length) {
    document.body.classList.remove("maps-loading");
  }

  const initializePhrasesControls = () => {
    if (!controls) {
      return;
    }
    let activeFilter = "all";
    let activeRegisterFilter = getDefaultRegisterFilterForWorld();
    const phrasesUi = getPhrasesUiLabels();
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = phrasesUi.phrases;
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = phrasesUi.chooseSection;
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const allButton = createSectionFilterButton(phrasesUi.allSections, "all", "All");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("phrases-page")) {
      document.body.dataset.phrasesFilter = "all";
    }

    sourceSectionEntries.forEach(({ sectionName }) => {
      const displayName =
        getWorldSectionLabelFromPack("phrases", sectionName) || sectionName;
      const button = createSectionFilterButton(displayName, sectionName, sectionName);
      const isLockedPreviewSection = isPreviewMode && !previewSectionSet.has(sectionName);
      if (isLockedPreviewSection) {
        lockSectionFilterButton(button);
      }
      list.appendChild(button);
    });

    const applyFilter = () => {
      if (document.body.classList.contains("phrases-page")) {
        document.body.dataset.phrasesFilter = activeFilter;
      }
      applySectionAndRegisterFilter(
        sections,
        activeFilter,
        activeRegisterFilter,
        ".phrase-card",
        updatePhrasesTopState
      );
    };

    const activateFilter = (filter = "all", { scroll = true } = {}) => {
      const nextFilter = String(filter || "all").trim() || "all";
      activeFilter = nextFilter;
      list.querySelectorAll(".words-filter").forEach((btn) => {
        btn.classList.toggle("is-active", (btn.dataset.filter || "all") === nextFilter);
      });
      applyFilter();
      if (!scroll) {
        return;
      }
      if (nextFilter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
        return;
      }
      const target = sections.find((section) => section.dataset.section === nextFilter);
      if (target) {
        const nav = document.querySelector(".nav");
        const navHeight = nav ? nav.offsetHeight : 0;
        const offset = Math.max(0, navHeight - 60);
        const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      if (button.disabled || button.classList.contains("is-locked")) {
        return;
      }
      const filter = button.dataset.filter || "all";
      activateFilter(filter, { scroll: true });
    });

    const registerOptions = getRegisterFilterOptionsForSections(sections, ".phrase-card");
    if (registerOptions.length && !registerOptions.includes(activeRegisterFilter)) {
      activeRegisterFilter = "all";
    }

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);

    if (registerOptions.length) {
      const shouldLockRegisterControls = isPreviewMode;
      const registerLabel = document.createElement("div");
      registerLabel.className = "words-controls-register-label";
      registerLabel.textContent = "Register";
      registerLabel.classList.toggle("is-locked", shouldLockRegisterControls);
      const registerList = document.createElement("div");
      registerList.className = "words-controls-list words-register-list";
      registerList.classList.toggle("is-locked", shouldLockRegisterControls);
      registerOptions.forEach((value) => {
        const button = createSectionFilterButton(getRegisterFilterLabel(value), value);
        button.dataset.registerFilter = value;
        if (value === activeRegisterFilter) {
          button.classList.add("is-active");
        }
        if (shouldLockRegisterControls) {
          lockSectionFilterButton(button, "Unlock with Premium");
        }
        registerList.appendChild(button);
      });
      registerList.addEventListener("click", (event) => {
        const button = event.target.closest(".words-filter[data-register-filter]");
        if (!button) {
          return;
        }
        if (button.disabled || button.classList.contains("is-locked")) {
          return;
        }
        registerList
          .querySelectorAll(".words-filter[data-register-filter]")
          .forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        activeRegisterFilter = String(button.dataset.registerFilter || "all").toLowerCase();
        applyFilter();
      });
      controls.appendChild(registerLabel);
      controls.appendChild(registerList);
    }

    applyFilter();
  };

  renderSectionsProgressively({
    entries: entriesToBuild,
    buildSection: buildPhrasesSection,
    onSectionReady: (section) => {
      if (!isActiveRender()) {
        return;
      }
      container.appendChild(section);
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".phrases-group[data-section]")
      );
    },
    onFirstSectionReady: () => {
      if (!isActiveRender()) {
        return;
      }
      document.body.classList.remove("maps-loading");
    },
    onComplete: () => {
      if (!isActiveRender()) {
        return;
      }
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".phrases-group[data-section]")
      );
      ensurePhrasesSectionProgressButtons(container);
      initializePhrasesControls();
      if (isPreviewMode && hasLockedPreviewContent) {
        container.appendChild(
          createMapPreviewUpgradeSection({
            mapLabel: "phrases map",
            itemLabel: "phrases",
            lockedSectionCount,
            lockedItemCount: lockedPhraseCount,
            unlockedSectionNames,
            upgradeMessage: "Upgrade to Premium to unlock the full phrases map.",
          })
        );
      }
      refreshPhrasesMapTranslations();
    },
    shouldContinue: isActiveRender,
  });
};

const renderGrammarSections = () => {
  const renderRunId = ++grammarSectionsRenderRunId;
  const isActiveRender = () => renderRunId === grammarSectionsRenderRunId;
  const container = document.getElementById("grammarSections");
  const controls = document.getElementById("grammarControls");
  if (!container) {
    return;
  }
  const existingSections = dedupeRenderedMapSections(
    container,
    ".grammar-group[data-section]"
  );
  const existingSectionMap = new Map(
    existingSections.map((section) => [String(section.dataset.section || "").trim(), section])
  );
  if (controls) {
    controls.innerHTML = "";
  }
  container.querySelectorAll(".map-unavailable, .grammar-preview-upgrade").forEach((node) => {
    node.remove();
  });
  if (!existingSections.length) {
    container.innerHTML = "";
  }
  if (isGrammarWorldUnderExpertReview()) {
    document.body.classList.remove("maps-loading");
    container.appendChild(buildGrammarUnderExpertReviewState());
    return;
  }

  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState === "loading") {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshGrammarMapTranslations();
      return;
    }
    renderMapLoadingState("grammar");
    return;
  }
  const isPreviewMode = premiumAccessState !== "premium";

  const sectionEntries = [];
  GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
    const concepts = getGrammarCardsForSection(sectionName);
    if (!Array.isArray(concepts) || !concepts.length) {
      return;
    }
    sectionEntries.push({ sectionName, concepts });
  });

  const staticSectionEntries =
    !sectionEntries.length && existingSections.length
      ? buildStaticGrammarSectionEntries(existingSections)
      : [];
  const usingStaticSectionFallback = !sectionEntries.length && staticSectionEntries.length > 0;
  const sourceSectionEntries = usingStaticSectionFallback ? staticSectionEntries : sectionEntries;

  if (!sourceSectionEntries.length) {
    if (existingSections.length) {
      document.body.classList.remove("maps-loading");
      refreshGrammarMapTranslations();
      return;
    }
    container.appendChild(buildMapUnavailableState("Grammar"));
    return;
  }

  const totalSectionCount = sourceSectionEntries.length;
  const totalTopicCount = sourceSectionEntries.reduce((sum, entry) => sum + entry.concepts.length, 0);
  const namedUnlockedPreviewEntries = sourceSectionEntries.filter(({ sectionName }) =>
    isGrammarSectionFreePreviewUnlocked(sectionName)
  );
  const hasNamedUnlockedPreviewEntries = namedUnlockedPreviewEntries.length > 0;
  const renderEntries =
    isPreviewMode && !usingStaticSectionFallback
      ? hasNamedUnlockedPreviewEntries
        ? namedUnlockedPreviewEntries.map(({ sectionName, concepts }) => ({
            sectionName,
            concepts: concepts.slice(),
          }))
        : sourceSectionEntries
            .slice(0, GRAMMAR_PREVIEW_SECTION_LIMIT)
            .map(({ sectionName, concepts }) => ({
              sectionName,
              concepts: concepts.slice(0, GRAMMAR_PREVIEW_CARD_LIMIT),
            }))
      : sourceSectionEntries.map(({ sectionName, concepts }) => ({
          sectionName,
          concepts: concepts.slice(),
        }));
  const unlockedSectionNames = renderEntries.map((entry) => entry.sectionName);
  const previewSectionSet = new Set(renderEntries.map((entry) => entry.sectionName));
  const previewSectionCount = renderEntries.length;
  const previewTopicCount = renderEntries.reduce((sum, entry) => sum + entry.concepts.length, 0);
  const lockedSectionCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalSectionCount - previewSectionCount);
  const lockedTopicCount = usingStaticSectionFallback
    ? 0
    : Math.max(0, totalTopicCount - previewTopicCount);

  const sections = [];
  const renderSectionNameSet = new Set(renderEntries.map((entry) => entry.sectionName));
  existingSections.forEach((section) => {
    if (!renderSectionNameSet.has(String(section.dataset.section || "").trim())) {
      section.remove();
    }
  });
  renderEntries.forEach((entry) => {
    const existing = existingSectionMap.get(entry.sectionName);
    if (existing) {
      sections.push(existing);
    }
  });

  const buildGrammarSection = ({ sectionName, concepts }) => {
    const section = document.createElement("section");
    section.className = "section grammar-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    const displaySectionName = getWorldGrammarSectionLabel(sectionName) || sectionName;
    const titleHeading = document.createElement("h2");
    titleHeading.dataset.sourceTitle = sectionName;
    titleHeading.dataset.baseTitle = sectionName;
    const titleMain = document.createElement("span");
    titleMain.className = "map-section-title-main";
    titleMain.textContent = displaySectionName;
    titleHeading.appendChild(titleMain);
    title.appendChild(titleHeading);
    const grid = document.createElement("div");
    grid.className = "words-grid";
    concepts.forEach((concept, conceptIndex) => {
      const card = document.createElement("div");
      card.className = "card grammar-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.dataset.concept = concept.title;
      card.dataset.section = sectionName;
      card.dataset.index = String(conceptIndex);
      const hasWorldCards =
        !!WORLD_TRANSLATIONS?.grammar?.cards?.[sectionName]?.length;
      const sourceTitle = resolveWorldGrammarSourceTitle(
        sectionName,
        String(concept?.sourceTitle || concept?.title || "")
      );
      const displayTitle = hasWorldCards
        ? concept.title
        : getWorldGrammarTitle(sectionName, concept.title);
      card.dataset.sourceTitle = sourceTitle || displayTitle;
      card.setAttribute("aria-label", displayTitle);
      const lockThisCardForPreview =
        isPreviewMode &&
        hasNamedUnlockedPreviewEntries &&
        !isGrammarSectionFreePreviewUnlocked(sectionName);
      if (lockThisCardForPreview) {
        card.dataset.premiumLocked = "true";
        card.title = "Premium feature";
      }
      const text = document.createElement("div");
      text.className = "grammar-text";
      const textMain = document.createElement("span");
      textMain.className = "grammar-title-main";
      textMain.textContent = displayTitle;
      const textTranslation = document.createElement("span");
      textTranslation.className = "grammar-title-translation";
      textTranslation.hidden = true;
      text.appendChild(textMain);
      text.appendChild(document.createTextNode(" "));
      text.appendChild(textTranslation);
      card.appendChild(text);
      if (lockThisCardForPreview) {
        const lockBadge = document.createElement("span");
        lockBadge.className = "grammar-preview-lock";
        lockBadge.textContent = "Premium";
        card.appendChild(lockBadge);
      }
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(createSectionCompleteButton("grammar", sectionName));
    section.appendChild(grid);
    return section;
  };

  const entriesToBuild = renderEntries.filter(({ sectionName }) => !existingSectionMap.has(sectionName));
  if (sections.length) {
    document.body.classList.remove("maps-loading");
  }

  const initializeGrammarControls = () => {
    if (!controls) {
      return;
    }
    let activeFilter = "all";
    const grammarUi = getGrammarUiLabels();
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = grammarUi.grammar;
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = grammarUi.chooseSection;
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const allButton = createSectionFilterButton(grammarUi.allSections, "all", "All");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("grammar-page")) {
      document.body.dataset.grammarFilter = "all";
    }

    sourceSectionEntries.forEach(({ sectionName }) => {
      const button = createSectionFilterButton(
        getWorldGrammarSectionLabel(sectionName),
        sectionName,
        sectionName
      );
      const isLockedPreviewSection = isPreviewMode && !previewSectionSet.has(sectionName);
      if (isLockedPreviewSection) {
        button.classList.add("is-locked");
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.title = "Locked section";
      }
      list.appendChild(button);
    });

    const applyFilter = (filter) => {
      activeFilter = String(filter || "all");
      if (document.body.classList.contains("grammar-page")) {
        document.body.dataset.grammarFilter = filter;
      }
      sections.forEach((section) => {
        const show = filter === "all" || section.dataset.section === filter;
        section.style.display = show ? "" : "none";
        if (show) {
          section.classList.add("is-visible");
        } else {
          section.classList.remove("is-visible");
        }
      });
      updateGrammarTopState();
    };

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      if (button.disabled || button.classList.contains("is-locked")) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter === "all") {
        const first = sections[0];
        if (first) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = first.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        } else {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = container.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      } else {
        const target = sections.find((section) => section.dataset.section === filter);
        if (target) {
          const nav = document.querySelector(".nav");
          const navHeight = nav ? nav.offsetHeight : 0;
          const offset = Math.max(0, navHeight - 60);
          const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        }
      }
    });

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);
  };

  renderSectionsProgressively({
    entries: entriesToBuild,
    buildSection: buildGrammarSection,
    onSectionReady: (section) => {
      if (!isActiveRender()) {
        return;
      }
      container.appendChild(section);
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".grammar-group[data-section]")
      );
    },
    onFirstSectionReady: () => {
      if (!isActiveRender()) {
        return;
      }
      document.body.classList.remove("maps-loading");
    },
    onComplete: () => {
      if (!isActiveRender()) {
        return;
      }
      replaceMapSectionsArray(
        sections,
        dedupeRenderedMapSections(container, ".grammar-group[data-section]")
      );
      ensureGrammarSectionProgressButtons(container);
      initializeGrammarControls();
      if (isPreviewMode) {
        container.appendChild(
          createGrammarPreviewUpgradeSection({
            lockedSectionCount,
            lockedTopicCount,
            unlockedSectionNames,
          })
        );
      }
      refreshGrammarMapTranslations();
    },
    shouldContinue: isActiveRender,
  });
};

const buildAltGrammarExample = (() => {
  const subjects = [
    "We",
    "They",
    "You",
    "People",
    "Friends",
    "Students",
    "Workers",
    "Families",
    "Teams",
    "Neighbors",
  ];
  const verbs = [
    "meet",
    "visit",
    "need",
    "want",
    "call",
    "help",
    "check",
    "finish",
    "start",
    "plan",
    "share",
    "order",
  ];
  const objects = [
    "the manager",
    "the schedule",
    "the report",
    "a ticket",
    "the plan",
    "the task",
    "the room",
    "the meeting",
    "the email",
    "the project",
    "the map",
    "the problem",
  ];
  const times = [
    "today",
    "this morning",
    "tonight",
    "this week",
    "later",
    "tomorrow",
    "right now",
    "after lunch",
    "this evening",
    "next week",
  ];

  return (card, index) => {
    if (card && card.title.toLowerCase().includes("adding details")) {
      return "We talked in the kitchen after dinner because it was late.";
    }
    const s = subjects[index % subjects.length];
    const v = verbs[Math.floor(index / subjects.length) % verbs.length];
    const o =
      objects[
        Math.floor(index / (subjects.length * verbs.length)) % objects.length
      ];
    const t =
      times[
        Math.floor(
          index /
            (subjects.length * verbs.length * objects.length)
        ) % times.length
      ];
    return `${s} ${v} ${o} ${t}.`;
  };
})();

const GRAMMAR_EXPLANATION_TEMPLATES = {
  english: (title) =>
    `This card explains ${title} and how to form it clearly in real sentences.`,
  french: (title) =>
    `Cette carte explique ${title} et son usage correct dans des phrases reelles.`,
  german: (title) =>
    `Diese Karte erklaert ${title} und zeigt die korrekte Verwendung in echten Saetzen.`,
  spanish: (title) =>
    `Esta tarjeta explica ${title} y muestra su uso correcto en oraciones reales.`,
  portuguese: (title) =>
    `Este card explica ${title} e mostra o uso correto em frases reais.`,
  dutch: (title) =>
    `Deze kaart legt ${title} uit en toont correct gebruik in echte zinnen.`,
  swedish: (title) =>
    `Det har kortet forklarar ${title} och visar korrekt anvandning i riktiga meningar.`,
  arabic: (title) =>
    `تشرح هذه البطاقة ${title} وتوضح الاستخدام الصحيح في جمل حقيقية.`,
  chinese: (title) =>
    `这张卡片讲解${title}，并展示在真实句子中的正确用法。`,
  japanese: (title) =>
    `このカードでは${title}を説明し、実際の文での正しい使い方を示します。`,
  korean: (title) =>
    `이 카드는 ${title}을 설명하고 실제 문장에서의 올바른 사용을 보여 줍니다.`,
  hindi: (title) =>
    `यह कार्ड ${title} को समझाता है और वास्तविक वाक्यों में इसका सही प्रयोग दिखाता है।`,
};

const buildGrammarExplanation = (card) => {
  const title = String(card?.title || card?.sourceTitle || "").trim() || "this topic";
  const buildExplanation =
    GRAMMAR_EXPLANATION_TEMPLATES[WORLD_KEY] || GRAMMAR_EXPLANATION_TEMPLATES.english;
  return buildExplanation(title);
};

const normalizeTranslationLookupKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/â€™/g, "'")
    .replace(/\s+/g, " ")
    .trim();

const buildTranslationLookupVariants = (value) => {
  const normalized = normalizeTranslationLookupKey(value);
  if (!normalized) {
    return [];
  }
  const stripped = normalized.replace(/[.!?â€¦]+$/g, "").trim();
  const variants = [normalized];
  if (stripped && stripped !== normalized) {
    variants.push(stripped);
  }
  if (stripped) {
    variants.push(`${stripped}.`);
    variants.push(`${stripped}?`);
    variants.push(`${stripped}!`);
  }
  return [...new Set(variants.filter(Boolean))];
};

const lookupGrammarExplanationCache = (sectionKey, keyVariants, langKey) => {
  const variantSet = new Set(keyVariants);
  const bySection = GRAMMAR_EXPLANATION_TRANSLATIONS || {};
  const sectionOrder = [
    sectionKey,
    ...Object.keys(bySection).filter((name) => name !== sectionKey),
  ];
  for (const sectionName of sectionOrder) {
    const entries = bySection?.[sectionName];
    if (!entries) {
      continue;
    }
    for (const variant of keyVariants) {
      const value = entries?.[variant]?.[langKey];
      if (value) {
        return value;
      }
    }
    for (const [rawKey, translations] of Object.entries(entries)) {
      if (!variantSet.has(normalizeTranslationLookupKey(rawKey))) {
        continue;
      }
      const value = translations?.[langKey];
      if (value) {
        return value;
      }
    }
  }
  return "";
};

const resolveGrammarExplanation = (section, explanationText, baseLanguage) => {
  const sectionKey =
    resolveGrammarSectionName(section) || GRAMMAR_SECTION_ORDER[0];
  const keyVariants = buildTranslationLookupVariants(explanationText);
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  if (!langKey) {
    return "";
  }
  const direct = lookupGrammarExplanationCache(sectionKey, keyVariants, langKey);
  if (direct) {
    return direct;
  }

  const worldExplanations = WORLD_TRANSLATIONS?.grammar?.explanations;
  if (!worldExplanations || typeof worldExplanations !== "object") {
    return "";
  }
  const variantSet = new Set(keyVariants);
  const worldSections = [
    sectionKey,
    ...Object.keys(worldExplanations).filter((name) => name !== sectionKey),
  ];
  for (const worldSection of worldSections) {
    const entries = worldExplanations?.[worldSection];
    if (!entries || typeof entries !== "object") {
      continue;
    }
    for (const [rawWorldExplanation, payload] of Object.entries(entries)) {
      if (!variantSet.has(normalizeTranslationLookupKey(rawWorldExplanation))) {
        continue;
      }
      const sourceExplanation = String(payload?.source || "").trim();
      if (!sourceExplanation) {
        continue;
      }
      const sourceVariants = buildTranslationLookupVariants(sourceExplanation);
      const sourceHit = lookupGrammarExplanationCache(
        resolveGrammarSectionName(worldSection) || sectionKey,
        sourceVariants,
        langKey
      );
      if (sourceHit) {
        return sourceHit;
      }
    }
  }
  return "";
};

const GRAMMAR_EXPLANATION_RUNTIME_CACHE_KEY =
  "cosmicaGrammarExplanationRuntimeCache:v2";
const runtimeGrammarExplanationCache = new Map();
const runtimeGrammarExplanationRequests = new Map();

const loadRuntimeGrammarExplanationCache = () => {
  try {
    const raw = localStorage.getItem(GRAMMAR_EXPLANATION_RUNTIME_CACHE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    Object.entries(parsed).forEach(([cacheKey, value]) => {
      if (typeof value !== "string" || !value.trim()) {
        return;
      }
      runtimeGrammarExplanationCache.set(cacheKey, value);
      const [section, lang, ...rest] = cacheKey.split("|");
      const normalizedKey = rest.join("|");
      const entry = ensureGrammarExplanationEntry(section, normalizedKey);
      if (entry) {
        entry[String(lang || "").toLowerCase()] = value;
      }
    });
  } catch {}
};

const persistRuntimeGrammarExplanationCache = () => {
  try {
    localStorage.setItem(
      GRAMMAR_EXPLANATION_RUNTIME_CACHE_KEY,
      JSON.stringify(Object.fromEntries(runtimeGrammarExplanationCache))
    );
  } catch {}
};

loadRuntimeGrammarExplanationCache();

const cacheRuntimeGrammarExplanationTranslation = (
  section,
  explanationText,
  baseLanguage,
  translation
) => {
  const sectionKey =
    resolveGrammarSectionName(section) || GRAMMAR_SECTION_ORDER[0];
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const normalizedKey = normalizeTranslationLookupKey(explanationText);
  if (!sectionKey || !langKey || !normalizedKey || !translation) {
    return;
  }
  runtimeGrammarExplanationCache.set(
    `${sectionKey}|${langKey}|${normalizedKey}`,
    translation
  );
  const entry = ensureGrammarExplanationEntry(sectionKey, normalizedKey);
  if (entry) {
    entry[langKey] = translation;
  }
  persistRuntimeGrammarExplanationCache();
};

const requestRuntimeGrammarExplanationTranslation = async (
  section,
  explanationText,
  baseLanguage
) => {
  const sectionKey =
    resolveGrammarSectionName(section) || GRAMMAR_SECTION_ORDER[0];
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const normalizedKey = normalizeTranslationLookupKey(explanationText);
  if (!sectionKey || !langKey || !normalizedKey) {
    return "";
  }
  const cacheKey = `${sectionKey}|${langKey}|${normalizedKey}`;
  const cachedValue = runtimeGrammarExplanationCache.get(cacheKey);
  if (typeof cachedValue === "string" && cachedValue.trim()) {
    return cachedValue;
  }
  const pending = runtimeGrammarExplanationRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const toTranslateEndpoint = (candidate) =>
    String(candidate || "").replace(/\/api\/chat(?=$|[?#])/i, "/api/translate");
  const toChatEndpoint = (candidate) =>
    String(candidate || "").replace(/\/api\/translate(?=$|[?#])/i, "/api/chat");
  const isChatEndpoint = (endpoint) =>
    /\/api\/chat(?=$|[?#])/i.test(String(endpoint || ""));
  const addEndpointPair = (candidates, addCandidate, candidate) => {
    addCandidate(toTranslateEndpoint(candidate));
    addCandidate(toChatEndpoint(candidate));
  };

  const endpointCandidates = (() => {
    if (typeof getApiEndpointCandidates === "function") {
      const sharedCandidates = getApiEndpointCandidates();
      if (Array.isArray(sharedCandidates) && sharedCandidates.length) {
        const candidates = [];
        const addCandidate = (url) => {
          const normalized = String(url || "").trim();
          if (!normalized || candidates.includes(normalized)) {
            return;
          }
          candidates.push(normalized);
        };
        // Prefer same-origin translate route first for mobile stability.
        addCandidate("/api/translate");
        sharedCandidates.forEach((candidate) =>
          addEndpointPair(candidates, addCandidate, candidate)
        );
        return candidates;
      }
    }
    const endpoint = "/api/translate";
    const { protocol, hostname, port } = window.location;
    const normalizedHost = String(hostname || "").toLowerCase();
    const candidates = [];
    const addCandidate = (url) => {
      if (!url) {
        return;
      }
      if (!candidates.includes(url)) {
        candidates.push(url);
      }
    };
    const isLocalDevHost =
      normalizedHost === "localhost" ||
      normalizedHost === "127.0.0.1" ||
      normalizedHost === "::1" ||
      /^10\./.test(normalizedHost) ||
      /^192\.168\./.test(normalizedHost) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalizedHost) ||
      normalizedHost.endsWith(".local");
    const isCosmicaPublicHost =
      normalizedHost === "cosmicalearn.com" ||
      normalizedHost === "www.cosmicalearn.com" ||
      normalizedHost === "cosmica-03wo.onrender.com";

    if (!hostname || protocol === "file:") {
      addEndpointPair(
        candidates,
        addCandidate,
        `http://localhost:3000${endpoint}`
      );
      addEndpointPair(candidates, addCandidate, endpoint);
      return candidates;
    }

    if (isCosmicaPublicHost) {
      addEndpointPair(
        candidates,
        addCandidate,
        `https://www.cosmicalearn.com${endpoint}`
      );
      addEndpointPair(candidates, addCandidate, endpoint);
      return candidates;
    }

    if (port && port !== "3000" && isLocalDevHost) {
      addEndpointPair(
        candidates,
        addCandidate,
        `${protocol}//${hostname}:3000${endpoint}`
      );
    }
    addEndpointPair(candidates, addCandidate, endpoint);
    return candidates;
  })();

  const createAbortController = () => {
    if (typeof AbortController === "undefined") {
      return null;
    }
    return new AbortController();
  };

  const getTimeoutMs = () => {
    return window.matchMedia("(max-width: 960px)").matches ? 12000 : 10000;
  };

  const translateOnce = async (endpoint) => {
    const controller = createAbortController();
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), getTimeoutMs())
      : null;
    try {
      const useChatEndpoint = isChatEndpoint(endpoint);
      const body = useChatEndpoint
        ? {
            messages: [
              {
                role: "system",
                content:
                  "Translate the text to the requested target language. Return only the translated text without commentary.",
              },
              {
                role: "user",
                content: `Target language: ${langKey}\nText: ${explanationText}`,
              },
            ],
          }
        : {
            text: explanationText,
            targetLanguage: langKey,
          };
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        credentials: "same-origin",
      };
      if (controller) {
        requestOptions.signal = controller.signal;
      }
      const response = await fetch(endpoint, requestOptions);
      if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      const translated = String(data?.translation || data?.content || "")
        .replace(/^["'`]|["'`]$/g, "")
        .trim();
      if (!translated) {
        throw new Error("Empty translation response");
      }
      return translated;
    } finally {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    }
  };

  const request = (async () => {
    try {
      const isMobileViewport = window.matchMedia("(max-width: 960px)").matches;
      const attemptLimit = navigator.onLine ? (isMobileViewport ? 4 : 3) : 1;
      for (let attemptIndex = 0; attemptIndex < attemptLimit; attemptIndex += 1) {
        for (let endpointIndex = 0; endpointIndex < endpointCandidates.length; endpointIndex += 1) {
          try {
            const translated = await translateOnce(endpointCandidates[endpointIndex]);
            cacheRuntimeGrammarExplanationTranslation(
              sectionKey,
              explanationText,
              langKey,
              translated
            );
            return translated;
          } catch {}
        }
        if (attemptIndex < attemptLimit - 1) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, 340 + attemptIndex * 360)
          );
        }
      }
      return "";
    } finally {
      runtimeGrammarExplanationRequests.delete(cacheKey);
    }
  })();

  runtimeGrammarExplanationRequests.set(cacheKey, request);
  return request;
};

const prewarmGrammarExplanationTranslations = () => {
  return;
};

const GRAMMAR_TEMPLATES = {
  "basic word order": "subject + verb (+ object)",
  "sentence parts": "subject + verb (+ object) (+ complement)",
  "adding details": "subject + verb + object + (time) + (place)",
  "linking clauses": "main clause + connector + clause",
  "sentence variety": "short sentence + longer sentence + correct punctuation",
  "action verbs": "subject + action verb (+ object)",
  "state verbs": "subject + state verb + complement",
  "linking verbs": "subject + linking verb + adjective/noun",
  "verb patterns": "verb + object + preposition + noun phrase",
  "verb combinations": "verb + to-infinitive",
  "phrasal verbs": "verb + particle + object",
  "present simple": "subject + base verb (I/you/we/they) | subject + verb-s/-es (he/she/it)",
  "present continuous": "subject + be + verb-ing",
  "past simple": "subject + past verb",
  "past continuous": "subject + was/were + verb-ing",
  "present perfect": "subject + have/has + past participle",
  "past perfect": "subject + had + past participle",
  "future forms": "will + base verb | be going to + base verb | present continuous + future time",
  "future continuous": "will be + verb-ing",
  "future perfect": "will have + past participle",
  "aspect contrasts": "simple = whole; continuous = in progress; perfect = result",
  "countable nouns": "a/an + singular noun | number + plural noun",
  "uncountable nouns": "some + uncountable noun | a piece of + uncountable noun",
  "articles": "a/an + singular noun | the + specific noun",
  "plural forms": "number + regular plural noun | number + irregular plural noun",
  "possessive nouns": "noun + 's",
  "noun phrases": "determiner + adjective + noun",
  "quantifiers": "many + plural countable noun | much + uncountable noun",
  "subject pronouns": "subject pronoun + verb",
  "object pronouns": "verb + object pronoun",
  "possessive forms": "my/your + noun | mine/yours",
  "reflexive pronouns": "subject + verb + reflexive",
  "demonstratives": "this/that/these/those + noun",
  "relative reference": "noun + who/which/that + clause",
  "indefinite reference": "someone/anyone/anything",
  "adjectives basics": "adjective + noun | linking verb + adjective",
  "adjective order": "opinion + size + color + noun",
  "comparatives": "comparative adjective + than + noun/pronoun",
  "superlatives": "the + superlative adjective (+ noun)",
  "adverbs basics": "verb + adverb of manner",
  "frequency adverbs": "subject + frequency adverb + main verb | subject + be + frequency adverb",
  "time and place adverbs": "subject + verb + place + time",
  "degree words": "very/too + adjective/adverb | adjective/adverb + enough",
  "participles": "-ing adjective (cause) | -ed adjective (feeling)",
  "modifier stacking": "subject + verb + degree word + adjective + noun + adverb",
  "yes no questions": "do/does/did + subject + base verb",
  "wh questions": "wh-word + do/does/did + subject + base verb",
  "questions with be": "be + subject + complement",
  "questions with do": "do/does/did + subject + base verb",
  "questions with modals": "modal + subject + base verb",
  "tag questions": "statement, auxiliary + pronoun?",
  "indirect questions": "intro + wh-word + subject + verb",
  "not with be": "subject + be (am/is/are/was/were) + not + complement",
  "not with do": "subject + do/does/did + not + base verb",
  "negative short forms": "subject + don't/doesn't/isn't/aren't + complement/base verb",
  "negative words": "no/none/never/nothing + clause element",
  "negative questions": "don't/doesn't/didn't + subject + base verb?",
  "limited negatives": "hardly/barely/rarely + verb",
  "basic connectors": "clause + and/but/or + clause",
  "reason and result": "clause + because + clause | clause + so + clause",
  "contrast and choice": "clause + but/although + clause | either + option + or + option",
  "time connectors": "main clause + before/after/when + clause",
  "comparison links": "subject + verb + like/as + noun phrase | comparative + than + noun/pronoun",
  "adding ideas": "subject + also + clause | in addition, clause",
  "ordering ideas": "first + clause, then + clause (+ finally + clause)",
  "real conditions": "if + present simple, present simple",
  "future conditions": "if + present simple, will + base verb",
  "unreal present": "if + past simple, would + base verb",
  "unreal past": "if + past perfect, would have + past participle",
  "mixed conditions": "if + past perfect, would + base verb (present result)",
  "unless and otherwise": "result clause + unless + present clause",
  "active voice": "doer (subject) + action verb + object",
  "passive voice": "receiver/object + be + past participle (+ by + doer)",
  "focus shifts": "fronted focus phrase, + subject + verb + rest of clause",
  "cleft sentences": "it + be + focus + who/that + clause",
  "there and it subjects": "there + be + noun phrase | it + be + adjective/noun phrase",
  "ability": "subject + can/could + base verb",
  "permission": "can/may/could + subject + base verb",
  "obligation": "subject + must/have to + base verb",
  "advice": "subject + should/ought to + base verb",
  "possibility": "subject + may/might + base verb",
  "probability": "subject + will + probably + base verb",
  "polite requests": "could/would + subject + base verb + object",
  "offers and invitations": "would you like + noun | would you like to + verb",
  "reporting statements": "said + (that) + clause",
  "reporting questions": "asked + if/whether + clause | asked + wh-word + clause",
  "reporting requests": "asked + object + to + base verb",
  "reporting commands": "told/ordered + object + to + base verb",
  "backshift basics": "reported clause: present -> past | will -> would | can -> could",
  "time place changes": "now -> then | here -> there | today -> that day",
  "formal vs informal": "formal request form | informal request form",
  "contractions": "subject + contraction + verb",
  "polite softening": "could/would + subject + base verb (+ please)",
  "spoken vs written": "written standard sentence (no slang)",
  "professional style": "polite greeting/closing + clear request",
  "casual style": "casual greeting + simple clause",
  "clarity and brevity": "short direct clause",
  "opening and closing": "greeting + main message + closing signal",
  "topic shifts": "shift marker + complete clause",
  "cohesion tools": "clause + linker + reference word",
  "sequencing ideas": "first + clause, then + clause",
  "clarification moves": "do you mean + noun phrase",
  "summaries": "in short/to sum up + main point",
  "emphasis and repetition": "subject + do/really + base verb + key phrase",
  "conversation flow": "listening signal + turn-taking signal",
  "giving examples": "for example/for instance + clause",
  "repair and correction": "sorry/i mean + correction",
};

const expandGrammarPoint = (point) => {
  // Rules that already include examples in parentheses should not be expanded again.
  if (String(point || "").includes("(")) {
    return point;
  }
  const lower = point.toLowerCase();
  const hasWord = (word) => new RegExp(`\\b${word}\\b`, "i").test(lower);
  const hasAnyWord = (...words) => words.some((word) => hasWord(word));
  const hasPlaceLabel =
    lower.includes("place phrase") ||
    lower.includes("place clause") ||
    lower.includes("place after verb") ||
    lower.includes("add a place phrase");
  if (hasPlaceLabel) {
    return `${point} (at the station, in the kitchen)`;
  }
  const hasTimeLabel =
    lower.includes("time phrase") ||
    lower.includes("time clause") ||
    lower.includes("time connector") ||
    lower.includes("time at sentence end") ||
    lower.includes("add a time phrase");
  if (hasTimeLabel) {
    return `${point} (yesterday, at noon)`;
  }
  if (lower.includes("reason")) {
    return `${point} (because it rained)`;
  }
  if (lower.includes("manner")) {
    return `${point} (quickly, with care)`;
  }
  if (lower.includes("question")) {
    return `${point} (who, what, where, why)`;
  }
  if (hasAnyWord("particle", "particles")) {
    return `${point} (up, out, off)`;
  }
  if (hasAnyWord("article", "articles")) {
    return `${point} (a, an, the)`;
  }
  if (lower.includes("pronoun")) {
    return `${point} (he, she, they)`;
  }
  if (lower.includes("connector")) {
    return `${point} (and, but, because)`;
  }
  if (lower.includes("modal")) {
    return `${point} (can, should, must)`;
  }
  return point;
};

const buildStructureExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("basic word order")) {
    return [
      {
        labels: ["Subject: She", "Verb: reads", "Object: a book"],
        base: "She reads.",
        expanded: "She reads a book.",
      },
    ];
  }
  if (title.includes("sentence parts")) {
    return [
      {
        labels: [
          "Subject: They",
          "Verb: named",
          "Object: her",
          "Complement: captain",
        ],
        base: "They named her captain.",
        expanded: "They named her captain.",
      },
    ];
  }
  if (title.includes("adding details")) {
    return [
      {
        labels: [
          "Subject: She",
          "Verb: met",
          "Object: him",
          "Time: at noon",
          "Place: at the station",
        ],
        base: "She met him.",
        expanded: "She met him at noon at the station.",
      },
    ];
  }
  if (title.includes("linking clauses")) {
    return [
      {
        labels: [
          "Main clause: I stayed home",
          "Connector: because",
          "Clause: it rained",
        ],
        base: "I stayed home.",
        expanded: "I stayed home because it rained.",
      },
    ];
  }
  if (title.includes("sentence variety")) {
    return [
      {
        labels: [
          "Short sentence: We finished early",
          "Long sentence: We went home after class because we were tired",
        ],
        base: "We finished early.",
        expanded: "We finished early. We went home after class because we were tired.",
      },
    ];
  }
  return null;
};

const buildVerbExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("action verbs")) {
    return [
      {
        labels: ["Subject: They", "Action verb: carry", "Object: the boxes"],
        base: "They carry the boxes.",
        expanded: "They carry the boxes.",
      },
    ];
  }
  if (title.includes("state verbs")) {
    return [
      {
        labels: ["Subject: She", "State verb: feels", "Complement: tired"],
        base: "She feels tired.",
        expanded: "She feels tired.",
      },
    ];
  }
  if (title.includes("linking verbs")) {
    return [
      {
        labels: ["Subject: The room", "Linking verb: feels", "Complement: quiet"],
        base: "The room feels quiet.",
        expanded: "The room feels quiet.",
      },
    ];
  }
  if (title.includes("verb patterns")) {
    return [
      {
        labels: ["Verb: placed", "Object: the book", "Preposition: on the table"],
        base: "He placed the book.",
        expanded: "He placed the book on the table.",
      },
    ];
  }
  if (title.includes("verb combinations")) {
    return [
      {
        labels: ["Verb: decided", "Infinitive: to stay"],
        base: "We decided.",
        expanded: "We decided to stay.",
      },
    ];
  }
  if (title.includes("phrasal verbs")) {
    return [
      {
        labels: ["Verb: turned", "Particle: off", "Object: the light"],
        base: "She turned off the light.",
        expanded: "She turned off the light.",
      },
    ];
  }
  return null;
};

const buildTenseExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("present simple")) {
    return [
      {
        labels: ["Subject: She", "Verb: works"],
        base: "She works every day.",
        expanded: "She works every day.",
      },
    ];
  }
  if (title.includes("present continuous")) {
    return [
      {
        labels: ["Subject: I", "Be verb: am", "Verb-ing: waiting"],
        base: "I am waiting outside.",
        expanded: "I am waiting outside.",
      },
    ];
  }
  if (title.includes("past simple")) {
    return [
      {
        labels: ["Subject: They", "Past verb: visited"],
        base: "They visited Paris last year.",
        expanded: "They visited Paris last year.",
      },
    ];
  }
  if (title.includes("past continuous")) {
    return [
      {
        labels: ["Subject: I", "Be verb: was", "Verb-ing: cooking"],
        base: "I was cooking.",
        expanded: "I was cooking when he called.",
      },
    ];
  }
  if (title.includes("present perfect")) {
    return [
      {
        labels: ["Subject: He", "Auxiliary: has", "Past participle: lived"],
        base: "He has lived here for years.",
        expanded: "He has lived here for years.",
      },
    ];
  }
  if (title.includes("past perfect")) {
    return [
      {
        labels: ["Subject: She", "Auxiliary: had", "Past participle: left"],
        base: "She had left.",
        expanded: "She had left before I arrived.",
      },
    ];
  }
  if (title.includes("future forms")) {
    return [
      {
        labels: [
          "Future marker: will",
          "Base verb: call",
          "Future marker: going to",
          "Base verb: study",
          "Verb-ing: meeting",
        ],
        base: "I will call you tonight.",
        expanded: "I will call you tonight. I am going to study later. I am meeting Sam tomorrow.",
      },
    ];
  }
  if (title.includes("future continuous")) {
    return [
      {
        labels: [
          "Subject: I",
          "Future marker: will",
          "Be verb: be",
          "Verb-ing: working",
        ],
        base: "I will be working at six.",
        expanded: "I will be working at six.",
      },
    ];
  }
  if (title.includes("future perfect")) {
    return [
      {
        labels: [
          "Subject: They",
          "Future marker: will",
          "Auxiliary: have",
          "Past participle: finished",
        ],
        base: "They will have finished by Friday.",
        expanded: "They will have finished by Friday.",
      },
    ];
  }
  if (title.includes("aspect contrasts")) {
    return [
      {
        labels: [
          "Simple form: work",
          "Continuous form: am working",
          "Past participle: worked",
        ],
        base: "I work every day. I am working now.",
        expanded: "I work every day. I am working now. I have worked here for years.",
      },
    ];
  }
  return null;
};

const buildNounExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("countable nouns")) {
    return [
      {
        labels: ["Article: a", "Noun: coin", "Number: two", "Plural noun: apples"],
        base: "I have a coin and two apples.",
        expanded: "I have a coin and two apples.",
      },
    ];
  }
  if (title.includes("uncountable nouns")) {
    return [
      {
        labels: ["Quantifier: some", "Noun: rice", "Unit phrase: a piece of bread"],
        base: "We need some rice and a piece of bread.",
        expanded: "We need some rice and a piece of bread.",
      },
    ];
  }
  if (title.includes("articles")) {
    return [
      {
        labels: ["Article: a", "Article: The", "Noun: dog"],
        base: "I saw a dog.",
        expanded: "I saw a dog. The dog is outside.",
      },
    ];
  }
  if (title.includes("plural forms")) {
    return [
      {
        labels: ["Regular plural noun: apples", "Irregular plural noun: children"],
        base: "Two apples and three children are here.",
        expanded: "Two apples and three children are here.",
      },
    ];
  }
  if (title.includes("possessive nouns")) {
    return [
      {
        labels: ["Possessive: Sara's", "Noun: phone"],
        base: "Sara's phone is new.",
        expanded: "Sara's phone is new.",
      },
    ];
  }
  if (title.includes("noun phrases")) {
    return [
      {
        labels: ["Determiner: the", "Adjective: red", "Noun: dress"],
        base: "She bought the red dress.",
        expanded: "She bought the red dress.",
      },
    ];
  }
  if (title.includes("quantifiers")) {
    return [
      {
        labels: [
          "Quantifier: many",
          "Noun: options",
          "Quantifier: much",
          "Noun: information",
        ],
        base: "There are many options, and there is much information.",
        expanded: "There are many options, and there is much information.",
      },
    ];
  }
  return null;
};

const buildPronounExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("subject pronouns")) {
    return [
      {
        labels: ["Subject pronoun: They", "Verb: are", "Complement: ready"],
        base: "They are ready.",
        expanded: "They are ready.",
      },
    ];
  }
  if (title.includes("object pronouns")) {
    return [
      {
        labels: ["Subject: He", "Verb: saw", "Object pronoun: me"],
        base: "He saw me.",
        expanded: "He saw me.",
      },
    ];
  }
  if (title.includes("possessive forms")) {
    return [
      {
        labels: ["Possessive adjective: My", "Noun: bag", "Possessive pronoun: Hers"],
        base: "My bag is new. Hers is old.",
        expanded: "My bag is new. Hers is old.",
      },
    ];
  }
  if (title.includes("reflexive pronouns")) {
    return [
      {
        labels: ["Subject: I", "Verb: hurt", "Reflexive: myself"],
        base: "I hurt myself.",
        expanded: "I hurt myself.",
      },
    ];
  }
  if (title.includes("demonstratives")) {
    return [
      {
        labels: ["Demonstrative: These", "Noun: keys", "Verb: are"],
        base: "These keys are mine.",
        expanded: "These keys are mine.",
      },
    ];
  }
  if (title.includes("relative reference")) {
    return [
      {
        labels: ["Noun: man", "Relative pronoun: who", "Clause: called me"],
        base: "The man who called me left.",
        expanded: "The man who called me left.",
      },
    ];
  }
  if (title.includes("indefinite reference")) {
    return [
      {
        labels: ["Indefinite pronoun: Someone", "Verb phrase: is waiting"],
        base: "Someone is waiting outside.",
        expanded: "Someone is waiting outside.",
      },
    ];
  }
  return null;
};

const buildModifierExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("adjectives basics")) {
    return [
      {
        labels: ["Adjective: quiet", "Noun: house", "Linking verb: is", "Adjective: empty"],
        base: "The quiet house is empty.",
        expanded: "The quiet house is empty.",
      },
    ];
  }
  if (title.includes("adjective order")) {
    return [
      {
        labels: [
          "Opinion: lovely",
          "Size: small",
          "Color: red",
          "Noun: bag",
        ],
        base: "She bought a lovely small red bag.",
        expanded: "She bought a lovely small red bag.",
      },
    ];
  }
  if (title.includes("comparatives")) {
    return [
      {
        labels: ["Comparative: faster", "Than: than"],
        base: "This is faster than that.",
        expanded: "This is faster than that.",
      },
    ];
  }
  if (title.includes("superlatives")) {
    return [
      {
        labels: ["Article: the", "Superlative: tallest"],
        base: "He is the tallest.",
        expanded: "He is the tallest.",
      },
    ];
  }
  if (title.includes("adverbs basics")) {
    return [
      {
        labels: ["Verb: speaks", "Adverb: clearly"],
        base: "She speaks clearly.",
        expanded: "She speaks clearly.",
      },
    ];
  }
  if (title.includes("frequency adverbs")) {
    return [
      {
        labels: ["Frequency adverb: usually", "Verb: wakes"],
        base: "She usually wakes early.",
        expanded: "She usually wakes early.",
      },
    ];
  }
  if (title.includes("time and place adverbs")) {
    return [
      {
        labels: ["Place adverb: here", "Time adverb: yesterday"],
        base: "We met here yesterday.",
        expanded: "We met here yesterday.",
      },
    ];
  }
  if (title.includes("degree words")) {
    return [
      {
        labels: ["Degree word: very", "Adjective: warm"],
        base: "The room is very warm.",
        expanded: "The room is very warm.",
      },
    ];
  }
  if (title.includes("participles")) {
    return [
      {
        labels: ["-ing adjective: boring", "-ed adjective: bored"],
        base: "The movie was boring, and I was bored.",
        expanded: "The movie was boring, and I was bored.",
      },
    ];
  }
  if (title.includes("modifier stacking")) {
    return [
      {
        labels: ["Degree word: very", "Adjective: difficult", "Noun: question", "Adverb: quickly"],
        base: "She answered the very difficult question quickly.",
        expanded: "She answered the very difficult question quickly.",
      },
    ];
  }
  return null;
};

const buildConditionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("real conditions")) {
    return [
      {
        labels: ["If clause: if you press this", "Result clause: it starts"],
        base: "if you press this, it starts",
        expanded: "If you press this, it starts.",
      },
    ];
  }
  if (title.includes("future conditions")) {
    return [
      {
        labels: ["If clause: if it is sunny", "Result clause: we will go"],
        base: "if it is sunny, we will go",
        expanded: "If it is sunny, we will go.",
      },
    ];
  }
  if (title.includes("unreal present")) {
    return [
      {
        labels: ["If clause: if i had time", "Would clause: i would help"],
        base: "if i had time, i would help",
        expanded: "If I had time, I would help.",
      },
    ];
  }
  if (title.includes("unreal past")) {
    return [
      {
        labels: [
          "If clause: if we had left earlier",
          "Would have clause: we would have arrived",
        ],
        base: "if we had left earlier, we would have arrived",
        expanded: "If we had left earlier, we would have arrived.",
      },
    ];
  }
  if (title.includes("mixed conditions")) {
    return [
      {
        labels: [
          "If clause: if she had studied",
          "Would clause: she would be calm now",
        ],
        base: "if she had studied, she would be calm now",
        expanded: "If she had studied, she would be calm now.",
      },
    ];
  }
  if (title.includes("unless and otherwise")) {
    return [
      {
        labels: ["Result clause: we will go", "Unless clause: unless it rains"],
        base: "we will go unless it rains",
        expanded: "We will go unless it rains.",
      },
    ];
  }
  return null;
};

const buildVoiceExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("active voice")) {
    return [
      {
        labels: ["Doer: the chef", "Action verb: cooked", "Object: dinner"],
        base: "the chef cooked dinner",
        expanded: "The chef cooked dinner.",
      },
    ];
  }
  if (title.includes("passive voice")) {
    return [
      {
        labels: ["Object: the meal", "Be verb: was", "Past participle: cooked"],
        base: "the meal was cooked",
        expanded: "The meal was cooked.",
      },
    ];
  }
  if (title.includes("focus shifts")) {
    return [
      {
        labels: [
          "Focus phrase: that book",
          "Subject: i",
          "Verb: finished",
        ],
        base: "that book, i finished",
        expanded: "That book, I finished yesterday.",
      },
    ];
  }
  if (title.includes("cleft sentences")) {
    return [
      {
        labels: [
          "It subject: it is",
          "Focus phrase: john",
          "Clause: who called",
        ],
        base: "it is john who called",
        expanded: "It is John who called.",
      },
    ];
  }
  if (title.includes("there and it subjects")) {
    return [
      {
        labels: ["There subject: there is", "Noun: a problem"],
        base: "there is a problem",
        expanded: "There is a problem.",
      },
    ];
  }
  return null;
};

const buildModalityExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("ability")) {
    return [
      {
        labels: ["Subject: she", "Modal: can", "Base verb: swim"],
        base: "she can swim",
        expanded: "She can swim.",
      },
    ];
  }
  if (title.includes("permission")) {
    return [
      {
        labels: ["Modal: may", "Subject: i", "Base verb: sit"],
        base: "may i sit",
        expanded: "May I sit here?",
      },
    ];
  }
  if (title.includes("obligation")) {
    return [
      {
        labels: ["Subject: you", "Modal: must", "Base verb: wear"],
        base: "you must wear",
        expanded: "You must wear a seatbelt.",
      },
    ];
  }
  if (title.includes("advice")) {
    return [
      {
        labels: ["Subject: you", "Modal: should", "Base verb: rest"],
        base: "you should rest",
        expanded: "You should rest.",
      },
    ];
  }
  if (title.includes("possibility")) {
    return [
      {
        labels: ["Modal: might", "Base verb: rain"],
        base: "might rain",
        expanded: "It might rain today.",
      },
    ];
  }
  if (title.includes("probability")) {
    return [
      {
        labels: [
          "Subject: he",
          "Modal: will",
          "Probability word: probably",
          "Base verb: come",
        ],
        base: "he will probably come",
        expanded: "He will probably come.",
      },
    ];
  }
  if (title.includes("polite requests")) {
    return [
      {
        labels: [
          "Modal: could",
          "Subject: you",
          "Base verb: open",
          "Object: the window",
        ],
        base: "could you open the window",
        expanded: "Could you open the window?",
      },
    ];
  }
  if (title.includes("offers and invitations")) {
    return [
      {
        labels: ["Modal phrase: would you like", "Object: some tea"],
        base: "would you like some tea",
        expanded: "Would you like some tea?",
      },
    ];
  }
  return null;
};

const buildReportedSpeechExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("reporting statements")) {
    return [
      {
        labels: ["Reporting verb: said", "Clause: she was ready"],
        base: "she said she was ready",
        expanded: "She said she was ready.",
      },
    ];
  }
  if (title.includes("reporting questions")) {
    return [
      {
        labels: ["Reporting verb: asked", "If clause: if I was okay"],
        base: "he asked if i was okay",
        expanded: "He asked if I was okay.",
      },
    ];
  }
  if (title.includes("reporting requests")) {
    return [
      {
        labels: ["Reporting verb: asked", "Object: me", "To-infinitive: to wait"],
        base: "she asked me to wait",
        expanded: "She asked me to wait.",
      },
    ];
  }
  if (title.includes("reporting commands")) {
    return [
      {
        labels: ["Reporting verb: told", "Object: us", "To-infinitive: to leave"],
        base: "he told us to leave",
        expanded: "He told us to leave.",
      },
    ];
  }
  if (title.includes("backshift basics")) {
    return [
      {
        labels: ["Reporting verb: said", "Backshifted clause: they had time"],
        base: "they said they had time",
        expanded: "They said they had time.",
      },
    ];
  }
  if (title.includes("time place changes")) {
    return [
      {
        labels: ["Reporting verb: said", "Shifted phrase: he was there"],
        base: "he said he was there",
        expanded: "He said he was there.",
      },
    ];
  }
  return null;
};

const buildFormalityExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("formal vs informal")) {
    return [
      {
        labels: ["Formal request: could you assist me", "Addressee: you"],
        base: "could you assist me",
        expanded: "Could you assist me?",
      },
    ];
  }
  if (title.includes("contractions")) {
    return [
      {
        labels: ["Subject: I", "Contraction: can't", "Base verb: stay"],
        base: "i can't stay",
        expanded: "I can't stay long.",
      },
    ];
  }
  if (title.includes("polite softening")) {
    return [
      {
        labels: ["Softener: could", "Subject: you", "Base verb: close", "Object: the door"],
        base: "could you close the door",
        expanded: "Could you close the door?",
      },
    ];
  }
  if (title.includes("spoken vs written")) {
    return [
      {
        labels: ["Polite marker: please", "Written clause: see the details below"],
        base: "please see the details below",
        expanded: "Please see the details below.",
      },
    ];
  }
  if (title.includes("professional style")) {
    return [
      {
        labels: ["Polite closing: thank you", "Noun phrase: your time"],
        base: "thank you for your time",
        expanded: "Thank you for your time.",
      },
    ];
  }
  if (title.includes("casual style")) {
    return [
      {
        labels: ["Casual greeting: hey", "Clause: how is it going"],
        base: "hey, how is it going",
        expanded: "Hey, how is it going?",
      },
    ];
  }
  if (title.includes("clarity and brevity")) {
    return [
      {
        labels: ["Subject: we", "Direct clause: need a quick answer"],
        base: "we need a quick answer",
        expanded: "We need a quick answer.",
      },
    ];
  }
  return null;
};

const buildDiscourseExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("opening and closing")) {
    return [
      {
        labels: ["Opening: hi everyone", "Closing: that is all for today"],
        base: "hi everyone, that is all for today",
        expanded: "Hi everyone, that is all for today.",
      },
    ];
  }
  if (title.includes("topic shifts")) {
    return [
      {
        labels: ["Shift marker: by the way", "New-topic clause: i have news"],
        base: "by the way, i have news",
        expanded: "By the way, I have news.",
      },
    ];
  }
  if (title.includes("cohesion tools")) {
    return [
      {
        labels: ["Clause 1: i bought a book", "Linker: and", "Reference: it"],
        base: "i bought a book, and it is useful",
        expanded: "I bought a book, and it is useful.",
      },
    ];
  }
  if (title.includes("sequencing ideas")) {
    return [
      {
        labels: ["Sequence: first", "Clause 1: we pack", "Sequence: then", "Clause 2: we leave"],
        base: "first we pack, then we leave",
        expanded: "First we pack, then we leave.",
      },
    ];
  }
  if (title.includes("clarification moves")) {
    return [
      {
        labels: ["Clarification marker: do you mean", "Focus phrase: the morning meeting"],
        base: "do you mean the morning meeting",
        expanded: "Do you mean the morning meeting?",
      },
    ];
  }
  if (title.includes("summaries")) {
    return [
      {
        labels: ["Summary marker: in short", "Main point: we are ready"],
        base: "in short, we are ready",
        expanded: "In short, we are ready.",
      },
    ];
  }
  if (title.includes("emphasis and repetition")) {
    return [
      {
        labels: ["Emphasis marker: do", "Main clause: need your answer today"],
        base: "i do need your answer today",
        expanded: "I do need your answer today.",
      },
    ];
  }
  if (title.includes("conversation flow")) {
    return [
      {
        labels: ["Listening signal: i see", "Turn signal: please continue"],
        base: "i see, please continue",
        expanded: "I see, please continue.",
      },
    ];
  }
  if (title.includes("giving examples")) {
    return [
      {
        labels: ["Example marker: for example", "Example clause: call the help desk"],
        base: "for example, call the help desk",
        expanded: "For example, call the help desk.",
      },
    ];
  }
  if (title.includes("repair and correction")) {
    return [
      {
        labels: [
          "Repair marker: sorry",
          "Correction marker: i mean",
          "Corrected phrase: tuesday, not monday",
        ],
        base: "sorry, i mean tuesday, not monday",
        expanded: "Sorry, I mean Tuesday, not Monday.",
      },
    ];
  }
  return null;
};

const buildQuestionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("yes no questions")) {
    return [
      {
        labels: ["Aux: do", "Subject: you", "Base verb: work"],
        base: "Do you work here?",
        expanded: "Do you work here?",
      },
    ];
  }
  if (title.includes("wh questions")) {
    return [
      {
        labels: [
          "Wh word: where",
          "Aux: does",
          "Subject: he",
          "Base verb: live",
        ],
        base: "Where does he live?",
        expanded: "Where does he live?",
      },
    ];
  }
  if (title.includes("questions with be")) {
    return [
      {
        labels: ["Be verb: is", "Subject: the store", "Complement: open"],
        base: "Is the store open?",
        expanded: "Is the store open?",
      },
    ];
  }
  if (title.includes("questions with do")) {
    return [
      {
        labels: ["Aux: did", "Subject: you", "Base verb: call"],
        base: "Did you call her?",
        expanded: "Did you call her?",
      },
    ];
  }
  if (title.includes("questions with modals")) {
    return [
      {
        labels: ["Modal: could", "Subject: you", "Base verb: help"],
        base: "Could you help me?",
        expanded: "Could you help me?",
      },
    ];
  }
  if (title.includes("tag questions")) {
    return [
      {
        labels: ["Statement: you are ready", "Tag: aren't you"],
        base: "You are ready, aren't you?",
        expanded: "You are ready, aren't you?",
      },
    ];
  }
  if (title.includes("indirect questions")) {
    return [
      {
        labels: ["Intro: could you tell me", "Wh clause: where it is"],
        base: "Could you tell me where it is?",
        expanded: "Could you tell me where it is?",
      },
    ];
  }
  return null;
};

const buildNegationExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("not with be")) {
    return [
      {
        labels: [
          "Subject: she",
          "Be verb: is",
          "Not: not",
          "Complement: tired",
        ],
        base: "she is not tired",
        expanded: "She is not tired.",
      },
    ];
  }
  if (title.includes("not with do")) {
    return [
      {
        labels: [
          "Subject: they",
          "Aux: do",
          "Not: not",
          "Base verb: agree",
        ],
        base: "they do not agree",
        expanded: "They do not agree.",
      },
    ];
  }
  if (title.includes("negative short forms")) {
    return [
      {
        labels: ["Subject: I", "Aux: don't", "Base verb: know"],
        base: "i don't know",
        expanded: "I don't know.",
      },
    ];
  }
  if (title.includes("negative words")) {
    return [
      {
        labels: ["Negative word: no", "Noun: milk"],
        base: "no milk",
        expanded: "There is no milk.",
      },
    ];
  }
  if (title.includes("negative questions")) {
    return [
      {
        labels: ["Aux: don't", "Subject: you", "Base verb: want", "Object: coffee"],
        base: "don't you want coffee",
        expanded: "Don't you want coffee?",
      },
    ];
  }
  if (title.includes("limited negatives")) {
    return [
      {
        labels: ["Subject: he", "Negative adverb: rarely", "Verb: eats"],
        base: "he rarely eats",
        expanded: "He rarely eats out.",
      },
    ];
  }
  return null;
};

const buildConnectionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("basic connectors")) {
    return [
      {
        labels: [
          "Clause 1: I called",
          "Connector: but",
          "Clause 2: no one answered",
        ],
        base: "i called, but no one answered",
        expanded: "I called, but no one answered.",
      },
    ];
  }
  if (title.includes("reason and result")) {
    return [
      {
        labels: [
          "Reason clause: it rained",
          "Connector: so",
          "Result clause: we stayed",
        ],
        base: "it rained, so we stayed",
        expanded: "It rained, so we stayed.",
      },
    ];
  }
  if (title.includes("contrast and choice")) {
    return [
      {
        labels: [
          "Clause 1: she went",
          "Contrast connector: although",
          "Clause 2: she was tired",
        ],
        base: "she went, although she was tired",
        expanded: "She went, although she was tired.",
      },
    ];
  }
  if (title.includes("time connectors")) {
    return [
      {
        labels: ["Main clause: call me", "Time connector: when", "Clause: you arrive"],
        base: "call me when you arrive",
        expanded: "Call me when you arrive.",
      },
    ];
  }
  if (title.includes("comparison links")) {
    return [
      {
        labels: [
          "Subject: this",
          "Verb: feels",
          "Comparison: like",
          "Object: home",
        ],
        base: "this feels like home",
        expanded: "This feels like home.",
      },
    ];
  }
  if (title.includes("adding ideas")) {
    return [
      {
        labels: ["Addition marker: also", "Clause: need chairs"],
        base: "also need chairs",
        expanded: "We also need chairs.",
      },
    ];
  }
  if (title.includes("ordering ideas")) {
    return [
      {
        labels: [
          "Sequence: first",
          "Clause: we plan",
          "Sequence: then",
          "Clause: we act",
        ],
        base: "first we plan, then we act",
        expanded: "First we plan, then we act.",
      },
    ];
  }
  return null;
};

const SLOT_COLOR_VARIANT_COUNT = 6;

const getSlotColorClass = (prefix, index = 0) => {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const variant = (safeIndex % SLOT_COLOR_VARIANT_COUNT) + 1;
  return `${prefix}-slot-${variant}`;
};

const getExampleLabelClass = (label, index = 0, options = {}) => {
  if (options?.colorByOrder) {
    return getSlotColorClass("label", index);
  }
  const type = normalizeLabelType(label);
  switch (type) {
    case "time":
      return "label-time";
    case "place":
      return "label-place";
    case "reason":
      return "label-reason";
    case "manner":
      return "label-manner";
    case "subject":
      return "label-subject";
    case "action-verb":
      return "label-action-verb";
    case "state-verb":
      return "label-state-verb";
    case "linking-verb":
      return "label-linking-verb";
    case "verb":
      return "label-verb";
    case "be-verb":
      return "label-be-verb";
    case "verb-ing":
      return "label-verb-ing";
    case "past-verb":
      return "label-past-verb";
    case "past-participle":
      return "label-past-participle";
    case "auxiliary":
      return "label-auxiliary";
    case "aux":
      return "label-aux";
    case "wh-word":
      return "label-wh-word";
    case "wh-clause":
      return "label-wh-clause";
    case "modal":
      return "label-modal";
    case "intro":
      return "label-intro";
    case "statement":
      return "label-statement";
    case "tag":
      return "label-tag";
    case "not":
      return "label-not";
    case "negative-word":
      return "label-negative-word";
    case "negative-adverb":
      return "label-negative-adverb";
    case "reason-clause":
      return "label-reason-clause";
    case "result-clause":
      return "label-result-clause";
    case "if-clause":
      return "label-if-clause";
    case "unless-clause":
      return "label-unless-clause";
    case "would-clause":
      return "label-would-clause";
    case "would-have-clause":
      return "label-would-have-clause";
    case "time-connector":
      return "label-time-connector";
    case "contrast-connector":
      return "label-contrast-connector";
    case "addition-marker":
      return "label-addition-marker";
    case "comparison":
      return "label-comparison";
    case "sequence":
      return "label-sequence";
    case "clause-1":
      return "label-clause-1";
    case "clause-2":
      return "label-clause-2";
    case "doer":
      return "label-doer";
    case "focus-phrase":
      return "label-focus-phrase";
    case "it-subject":
      return "label-it-subject";
    case "there-subject":
      return "label-there-subject";
    case "probability-word":
      return "label-probability-word";
    case "modal-phrase":
      return "label-modal-phrase";
    case "future-marker":
      return "label-future-marker";
    case "base-verb":
      return "label-base-verb";
    case "simple-form":
      return "label-simple-form";
    case "continuous-form":
      return "label-continuous-form";
    case "article":
      return "label-article";
    case "determiner":
      return "label-determiner";
    case "adjective":
      return "label-adjective";
    case "adverb":
      return "label-adverb";
    case "frequency-adverb":
      return "label-frequency-adverb";
    case "time-adverb":
      return "label-time-adverb";
    case "place-adverb":
      return "label-place-adverb";
    case "degree-word":
      return "label-degree-word";
    case "opinion":
      return "label-opinion";
    case "size":
      return "label-size";
    case "age":
      return "label-age";
    case "color":
      return "label-color";
    case "comparative":
      return "label-comparative";
    case "than":
      return "label-than";
    case "superlative":
      return "label-superlative";
    case "participle":
      return "label-participle";
    case "number":
      return "label-number";
    case "quantifier":
      return "label-quantifier";
    case "plural-noun":
      return "label-plural-noun";
    case "possessive":
      return "label-possessive";
    case "noun":
      return "label-noun";
    case "subject-pronoun":
      return "label-subject-pronoun";
    case "object-pronoun":
      return "label-object-pronoun";
    case "reflexive":
      return "label-reflexive";
    case "demonstrative":
      return "label-demonstrative";
    case "relative":
      return "label-relative";
    case "indefinite":
      return "label-indefinite";
    case "particle":
      return "label-particle";
    case "preposition":
      return "label-preposition";
    case "infinitive":
      return "label-infinitive";
    case "gerund":
      return "label-gerund";
    case "that-clause":
      return "label-that-clause";
    case "object":
      return "label-object";
    case "complement":
      return "label-complement";
    case "connector":
      return "label-connector";
    case "main-clause":
      return "label-main-clause";
    case "contrast":
      return "label-contrast";
    case "clause":
      return "label-clause";
    case "sentence-1":
      return "label-sentence-1";
    case "sentence-2":
      return "label-sentence-2";
    case "sentence":
      return "label-sentence";
    default:
      if (WORLD_KEY !== "english") {
        return getSlotColorClass("label", index);
      }
      return "label-generic";
  }
};

const getExampleLabelText = (label) => {
  const raw = label.split(":")[0]?.trim() || label;
  const lower = raw.toLowerCase();
  if (lower.includes("sentence 1")) return "Sentence 1";
  if (lower.includes("sentence 2")) return "Sentence 2";
  if (lower.includes("short sentence")) return "Short sentence";
  if (lower.includes("long sentence")) return "Long sentence";
  if (lower.includes("main clause")) return "Main clause";
  if (lower.includes("sentence")) return "Sentence";
  if (lower.includes("time connector")) return "Time connector";
  if (lower.includes("contrast connector")) return "Contrast connector";
  if (lower.includes("addition marker")) return "Addition marker";
  if (lower.includes("reason clause")) return "Reason clause";
  if (lower.includes("result clause")) return "Result clause";
  if (lower.includes("would have clause")) return "Would have clause";
  if (lower.includes("would clause")) return "Would clause";
  if (lower.includes("if clause")) return "If clause";
  if (lower.includes("unless clause")) return "Unless clause";
  if (lower.includes("negative word")) return "Negative word";
  if (lower.includes("negative adverb")) return "Negative adverb";
  if (lower === "not") return "Not";
  if (lower.includes("wh word")) return "Wh word";
  if (lower.includes("wh clause")) return "Wh clause";
  if (lower.includes("intro")) return "Intro";
  if (lower.includes("modal")) return "Modal";
  if (lower === "aux") return "Aux";
  if (lower.includes("tag")) return "Tag";
  if (lower.includes("statement")) return "Statement";
  if (lower.includes("comparison")) return "Comparison";
  if (lower.includes("sequence")) return "Sequence";
  if (lower.includes("clause 1")) return "Clause 1";
  if (lower.includes("clause 2")) return "Clause 2";
  if (lower.includes("doer")) return "Doer";
  if (lower.includes("focus phrase")) return "Focus phrase";
  if (lower.includes("it subject")) return "It subject";
  if (lower.includes("there subject")) return "There subject";
  if (lower.includes("probability word")) return "Probability word";
  if (lower.includes("modal phrase")) return "Modal phrase";
  if (lower.includes("action verb")) return "Action verb";
  if (lower.includes("state verb")) return "State verb";
  if (lower.includes("linking verb")) return "Linking verb";
  if (lower.includes("subject pronoun")) return "Subject pronoun";
  if (lower.includes("object pronoun")) return "Object pronoun";
  if (lower.includes("be verb")) return "Be verb";
  if (lower.includes("verb-ing")) return "Verb-ing";
  if (lower.includes("past verb")) return "Past verb";
  if (lower.includes("past participle")) return "Past participle";
  if (lower.includes("auxiliary")) return "Auxiliary";
  if (lower.includes("future marker")) return "Future marker";
  if (lower.includes("base verb")) return "Base verb";
  if (lower.includes("simple form")) return "Simple form";
  if (lower.includes("continuous form")) return "Continuous form";
  if (lower.includes("particle")) return "Particle";
  if (lower.includes("determiner")) return "Determiner";
  if (lower.includes("adjective")) return "Adjective";
  if (lower.includes("frequency adverb")) return "Frequency adverb";
  if (lower.includes("time adverb")) return "Time adverb";
  if (lower.includes("place adverb")) return "Place adverb";
  if (lower.includes("degree word")) return "Degree word";
  if (lower.includes("adverb")) return "Adverb";
  if (lower.includes("opinion")) return "Opinion";
  if (lower.includes("size")) return "Size";
  if (lower.includes("age")) return "Age";
  if (lower.includes("color")) return "Color";
  if (lower.includes("comparative")) return "Comparative";
  if (lower.includes("than")) return "Than";
  if (lower.includes("superlative")) return "Superlative";
  if (lower.includes("participle")) return "Participle";
  if (lower.includes("number")) return "Number";
  if (lower.includes("quantifier")) return "Quantifier";
  if (lower.includes("plural noun")) return "Plural noun";
  if (lower.includes("possessive")) return "Possessive";
  if (lower.includes("noun")) return "Noun";
  if (lower.includes("subject pronoun")) return "Subject pronoun";
  if (lower.includes("object pronoun")) return "Object pronoun";
  if (lower.includes("reflexive")) return "Reflexive";
  if (lower.includes("demonstrative")) return "Demonstrative";
  if (lower.includes("relative")) return "Relative";
  if (lower.includes("indefinite")) return "Indefinite";
  if (lower.includes("subject")) return "Subject";
  if (lower.includes("verb")) return "Verb";
  if (lower.includes("article")) return "Article";
  if (lower.includes("preposition")) return "Preposition";
  if (lower.includes("infinitive")) return "Infinitive";
  if (lower.includes("gerund")) return "Gerund";
  if (lower.includes("that clause")) return "That clause";
  if (lower.includes("object")) return "Object";
  if (lower.includes("complement")) return "Complement";
  if (lower.includes("contrast")) return "Contrast";
  if (lower.includes("connector")) return "Connector";
  if (lower.includes("time")) return "Time";
  if (lower.includes("place")) return "Place";
  if (lower.includes("reason")) return "Reason";
  if (lower.includes("manner")) return "Manner";
  if (lower.includes("clause")) return "Clause";
  return raw;
};

const localizeGrammarChipLabel = (labelText) => {
  const text = String(labelText || "").trim();
  if (!text || WORLD_KEY !== "french") {
    return text;
  }
  const map = {
    "Sentence 1": "Phrase 1",
    "Sentence 2": "Phrase 2",
    "Short sentence": "Phrase courte",
    "Long sentence": "Phrase longue",
    "Main clause": "Proposition principale",
    Sentence: "Phrase",
    "Time connector": "Connecteur de temps",
    "Contrast connector": "Connecteur d'opposition",
    "Addition marker": "Marqueur d'ajout",
    "Reason clause": "Proposition de cause",
    "Result clause": "Proposition de conséquence",
    "Would have clause": "Proposition au conditionnel passé",
    "Would clause": "Proposition au conditionnel",
    "If clause": "Proposition avec si",
    "Unless clause": "Proposition avec sauf si",
    "Negative word": "Mot négatif",
    "Negative adverb": "Adverbe négatif",
    Not: "Négation",
    "Wh word": "Mot interrogatif",
    "Wh clause": "Proposition interrogative",
    Intro: "Introduction",
    Modal: "Modal",
    Aux: "Auxiliaire",
    Tag: "Question-tag",
    Statement: "Énoncé",
    Comparison: "Comparaison",
    Sequence: "Séquence",
    "Clause 1": "Proposition 1",
    "Clause 2": "Proposition 2",
    Doer: "Agent",
    "Focus phrase": "Mise en relief",
    "It subject": "Sujet it",
    "There subject": "Sujet there",
    "Probability word": "Marqueur de probabilité",
    "Modal phrase": "Expression modale",
    "Action verb": "Verbe d'action",
    "State verb": "Verbe d'état",
    "Linking verb": "Verbe copule",
    "Subject pronoun": "Pronom sujet",
    "Object pronoun": "Pronom objet",
    "Be verb": "Verbe être",
    "Verb-ing": "Participe présent",
    "Past verb": "Verbe au passé",
    "Past participle": "Participe passé",
    Auxiliary: "Auxiliaire",
    "Future marker": "Marqueur du futur",
    "Base verb": "Verbe à l'infinitif",
    "Simple form": "Forme simple",
    "Continuous form": "Forme continue",
    Particle: "Particule",
    Determiner: "Déterminant",
    Adjective: "Adjectif",
    "Frequency adverb": "Adverbe de fréquence",
    "Time adverb": "Adverbe de temps",
    "Place adverb": "Adverbe de lieu",
    "Degree word": "Marqueur d'intensité",
    Adverb: "Adverbe",
    Opinion: "Opinion",
    Size: "Taille",
    Age: "Âge",
    Color: "Couleur",
    Comparative: "Comparatif",
    Than: "Comparant",
    Superlative: "Superlatif",
    Participle: "Participe",
    Number: "Nombre",
    Quantifier: "Quantifieur",
    "Plural noun": "Nom au pluriel",
    Possessive: "Possessif",
    Noun: "Nom",
    Reflexive: "Réfléchi",
    Demonstrative: "Démonstratif",
    Relative: "Relatif",
    Indefinite: "Indéfini",
    Subject: "Sujet",
    Verb: "Verbe",
    Article: "Article",
    Preposition: "Préposition",
    Infinitive: "Infinitif",
    Gerund: "Gérondif",
    "That clause": "Proposition complétive",
    Object: "Complément",
    Contrast: "Opposition",
    Connector: "Connecteur",
    Time: "Temps",
    Place: "Lieu",
    Reason: "Cause",
    Manner: "Manière",
    Clause: "Proposition",
  };
  return map[text] || text;
};

const formatGrammarChipLabel = (value) =>
  String(value || "")
    .replace(/\s*\+\s*/g, " + ")
    .replace(/\s{2,}/g, " ")
    .trim();

const normalizeLabelType = (label) => {
  const key = label.split(":")[0]?.trim().toLowerCase();
  if (key.includes("sentence 1")) return "sentence-1";
  if (key.includes("sentence 2")) return "sentence-2";
  if (key.includes("short sentence")) return "sentence-1";
  if (key.includes("long sentence")) return "sentence-2";
  if (key.includes("main clause")) return "main-clause";
  if (key.includes("clause 1")) return "clause-1";
  if (key.includes("clause 2")) return "clause-2";
  if (key.includes("would have clause")) return "would-have-clause";
  if (key.includes("would clause")) return "would-clause";
  if (key.includes("if clause")) return "if-clause";
  if (key.includes("unless clause")) return "unless-clause";
  if (key.includes("doer")) return "doer";
  if (key.includes("focus phrase")) return "focus-phrase";
  if (key.includes("it subject")) return "it-subject";
  if (key.includes("there subject")) return "there-subject";
  if (key.includes("probability word")) return "probability-word";
  if (key.includes("modal phrase")) return "modal-phrase";
  if (key.includes("wh clause")) return "wh-clause";
  if (key.includes("reason clause")) return "reason-clause";
  if (key.includes("result clause")) return "result-clause";
  if (key.includes("time connector")) return "time-connector";
  if (key.includes("contrast connector")) return "contrast-connector";
  if (key.includes("addition marker")) return "addition-marker";
  if (key.includes("comparison")) return "comparison";
  if (key.includes("sequence")) return "sequence";
  if (key.includes("wh word")) return "wh-word";
  if (key.includes("intro")) return "intro";
  if (key === "aux") return "aux";
  if (key.includes("modal")) return "modal";
  if (key.includes("statement")) return "statement";
  if (key.includes("tag")) return "tag";
  if (key === "not") return "not";
  if (key.includes("negative word")) return "negative-word";
  if (key.includes("negative adverb")) return "negative-adverb";
  if (key.includes("time")) return "time";
  if (key.includes("place")) return "place";
  if (key.includes("reason")) return "reason";
  if (key.includes("manner")) return "manner";
  if (key.includes("subject")) return "subject";
  if (key.includes("action verb")) return "action-verb";
  if (key.includes("state verb")) return "state-verb";
  if (key.includes("linking verb")) return "linking-verb";
  if (key.includes("be verb")) return "be-verb";
  if (key.includes("verb-ing")) return "verb-ing";
  if (key.includes("past verb")) return "past-verb";
  if (key.includes("past participle")) return "past-participle";
  if (key.includes("auxiliary")) return "auxiliary";
  if (key.includes("future marker")) return "future-marker";
  if (key.includes("base verb")) return "base-verb";
  if (key.includes("simple form")) return "simple-form";
  if (key.includes("continuous form")) return "continuous-form";
  if (key.includes("particle")) return "particle";
  if (key.includes("determiner")) return "determiner";
  if (key.includes("adjective")) return "adjective";
  if (key.includes("frequency adverb")) return "frequency-adverb";
  if (key.includes("time adverb")) return "time-adverb";
  if (key.includes("place adverb")) return "place-adverb";
  if (key.includes("degree word")) return "degree-word";
  if (key.includes("adverb")) return "adverb";
  if (key.includes("opinion")) return "opinion";
  if (key.includes("size")) return "size";
  if (key.includes("age")) return "age";
  if (key.includes("color")) return "color";
  if (key.includes("comparative")) return "comparative";
  if (key.includes("than")) return "than";
  if (key.includes("superlative")) return "superlative";
  if (key.includes("participle")) return "participle";
  if (key.includes("number")) return "number";
  if (key.includes("quantifier")) return "quantifier";
  if (key.includes("plural noun")) return "plural-noun";
  if (key.includes("possessive")) return "possessive";
  if (key.includes("noun")) return "noun";
  if (key.includes("subject pronoun")) return "subject-pronoun";
  if (key.includes("object pronoun")) return "object-pronoun";
  if (key.includes("reflexive")) return "reflexive";
  if (key.includes("demonstrative")) return "demonstrative";
  if (key.includes("relative")) return "relative";
  if (key.includes("indefinite")) return "indefinite";
  if (key.includes("verb")) return "verb";
  if (key.includes("article")) return "article";
  if (key.includes("preposition")) return "preposition";
  if (key.includes("infinitive")) return "infinitive";
  if (key.includes("gerund")) return "gerund";
  if (key.includes("that clause")) return "that-clause";
  if (key.includes("object")) return "object";
  if (key.includes("complement")) return "complement";
  if (key.includes("contrast")) return "contrast";
  if (key.includes("connector")) return "connector";
  if (key.includes("sentence")) return "sentence";
  if (key.includes("clause")) return "clause";
  return "generic";
};

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasLetterOrNumber = (value) => /[\p{L}\p{N}]/u.test(String(value || ""));

const isBoundaryChar = (char) => {
  if (!char) {
    return true;
  }
  return !/[\p{L}\p{N}]/u.test(char);
};

const findPhraseMatchSpan = (sentence, phrase, fromIndex = 0) => {
  const source = String(sentence || "");
  const target = String(phrase || "").trim();
  if (!source || !target) {
    return null;
  }
  const sourceLower = source.toLocaleLowerCase();
  const targetLower = target.toLocaleLowerCase();
  const starts = [];
  const preferredStart = Math.max(0, Number(fromIndex) || 0);
  starts.push(preferredStart);
  if (preferredStart > 0) {
    starts.push(0);
  }
  const shouldCheckBoundary = /\s/u.test(source) && hasLetterOrNumber(target);
  for (const searchStart of starts) {
    let at = sourceLower.indexOf(targetLower, searchStart);
    while (at >= 0) {
      const before = source[at - 1] || "";
      const after = source[at + target.length] || "";
      const isBoundaryMatch =
        !shouldCheckBoundary || (isBoundaryChar(before) && isBoundaryChar(after));
      if (isBoundaryMatch) {
        return { start: at, end: at + target.length };
      }
      at = sourceLower.indexOf(targetLower, at + 1);
    }
  }
  return null;
};

const buildWordBoundaryPattern = (phrase) => {
  const escaped = escapeRegExp(phrase);
  const startsWord = /^\w/.test(phrase);
  const endsWord = /\w$/.test(phrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  return new RegExp(`${prefix}${escaped}${suffix}`, "i");
};

const applyGrammarHighlights = (sentence, labels = [], options = {}) => {
  const source = String(sentence || "");
  const ranges = [];
  let cursor = 0;
  labels.forEach((label, index) => {
    const parts = label.split(":");
    if (parts.length < 2) {
      return;
    }
    const phrase = parts.slice(1).join(":").trim();
    if (!phrase || !hasLetterOrNumber(phrase)) {
      return;
    }
    const type = normalizeLabelType(label);
    const useSlotColors =
      !!options?.colorByOrder || (WORLD_KEY !== "english" && type === "generic");
    const highlightClass = useSlotColors
      ? getSlotColorClass("highlight", index)
      : `highlight-${type}`;
    let match = findPhraseMatchSpan(source, phrase, cursor);
    if (!match) {
      match = findPhraseMatchSpan(source, phrase, 0);
    }
    if (!match) {
      return;
    }
    const overlaps = ranges.some(
      (existing) => match.start < existing.end && match.end > existing.start
    );
    if (overlaps) {
      return;
    }
    ranges.push({
      ...match,
      className: highlightClass,
    });
    cursor = match.end;
  });
  if (!ranges.length) {
    return source;
  }
  ranges.sort((a, b) => a.start - b.start);
  let output = "";
  let cursorOut = 0;
  ranges.forEach((range) => {
    output += source.slice(cursorOut, range.start);
    output += `<span class="highlight ${range.className}">${source.slice(
      range.start,
      range.end
    )}</span>`;
    cursorOut = range.end;
  });
  output += source.slice(cursorOut);
  return output;
};


const findFirstMatch = (sentence, patterns = []) => {
  const lower = sentence.toLowerCase();
  for (const pattern of patterns) {
    const idx = lower.indexOf(pattern);
    if (idx >= 0) {
      return { phrase: sentence.slice(idx, idx + pattern.length), index: idx };
    }
  }
  return null;
};

const splitByConnector = (sentence) => {
  const connectors = [
    "because",
    "so",
    "but",
    "and",
    "or",
    "although",
    "while",
    "when",
    "if",
    "unless",
    "before",
    "after",
    "until",
  ];
  const lower = sentence.toLowerCase();
  for (const conn of connectors) {
    const idx = lower.indexOf(` ${conn} `);
    if (idx >= 0) {
      const left = sentence.slice(0, idx).replace(/[,\s]+$/, "").trim();
      const right = sentence.slice(idx + conn.length + 2).replace(/^[,\s]+/, "").trim();
      return { left, connector: conn, right };
    }
  }
  return null;
};

const splitReportedStructure = (sentence) => {
  const clean = String(sentence || "").replace(/[.!?]+$/, "").trim();
  if (!clean) return null;

  const reportClauseMatch = clean.match(
    /^(.*?\b(?:said|asked|told)\b)\s+(that|if|who|what|where|when|why|how)\s+(.+)$/i
  );
  if (reportClauseMatch) {
    return {
      main: reportClauseMatch[1].trim(),
      connector: reportClauseMatch[2].trim(),
      clause: reportClauseMatch[3].trim(),
    };
  }

  const reportToMatch = clean.match(
    /^(.*?\b(?:asked|told|ordered)\b)\s+(to)\s+(.+)$/i
  );
  if (reportToMatch) {
    return {
      main: reportToMatch[1].trim(),
      connector: reportToMatch[2].trim(),
      clause: reportToMatch[3].trim(),
    };
  }

  const reportBareClauseMatch = clean.match(
    /^(.*?\b(?:said|asked|told)\b)\s+(.+)$/i
  );
  if (reportBareClauseMatch) {
    return {
      main: reportBareClauseMatch[1].trim(),
      connector: "",
      clause: reportBareClauseMatch[2].trim(),
    };
  }

  return null;
};

const parseSVO = (sentence) => {
  const clean = sentence.replace(/[.!?]$/, "").trim();
  const words = clean.split(/\s+/);
  if (words.length < 2) return null;
  const determiners = [
    "the",
    "a",
    "an",
    "my",
    "your",
    "his",
    "her",
    "our",
    "their",
    "this",
    "that",
    "these",
    "those",
  ];
  const startsWithDet = determiners.includes(words[0].toLowerCase());
  const subject = startsWithDet && words.length >= 3 ? `${words[0]} ${words[1]}` : words[0];
  const verbIndex = startsWithDet && words.length >= 3 ? 2 : 1;
  const verb = words[verbIndex] || "";
  const object = words.slice(verbIndex + 1).join(" ").trim();
  return { subject, verb, object };
};

const findTimePhrase = (sentence) => {
  const timePhrases = [
    "today",
    "yesterday",
    "tomorrow",
    "tonight",
    "this morning",
    "this afternoon",
    "this evening",
    "this week",
    "next week",
    "after dinner",
    "after lunch",
    "after class",
    "before lunch",
    "before dinner",
    "at noon",
    "at night",
    "in the morning",
    "in the evening",
  ];
  return findFirstMatch(sentence, timePhrases);
};

const findPlacePhrase = (sentence) => {
  const placeRegex = /\b(?:in|at|on)\s+(?:the\s+)?([a-z]+(?:\s+[a-z]+)?)/i;
  const match = sentence.match(placeRegex);
  if (!match) return null;
  return { phrase: match[0].trim(), index: match.index ?? 0 };
};

const findVerbPhrase = (sentence) => {
  const auxRegex = /\b(am|is|are|was|were|has|have|had|will|would|can|could|should|might|must)\s+([a-z]+(?:ing|ed)?)\b/i;
  const auxMatch = sentence.match(auxRegex);
  if (auxMatch) {
    return auxMatch[0];
  }
  const svo = parseSVO(sentence);
  if (svo?.verb) return svo.verb;
  return "";
};

const buildLabelsForCard = (card, sentence) => {
  const title = card.title.toLowerCase();
  const section = card.section?.toLowerCase?.() || "";
  const labels = [];

  const addLabel = (type, phrase) => {
    if (!phrase) return;
    const label = `${type}: ${phrase}`;
    if (!labels.includes(label)) labels.push(label);
  };

  if (
    section.includes("reported") ||
    title.includes("reporting ") ||
    title.includes("backshift") ||
    title.includes("time place")
  ) {
    const reported = splitReportedStructure(sentence);
    if (reported) {
      addLabel("Main clause", reported.main);
      if (reported.connector) {
        addLabel("Connector", reported.connector);
      }
      addLabel("Clause", reported.clause);
      return labels;
    }
  }

  if (section.includes("formality") || section.includes("discourse")) {
    const split = splitByConnector(sentence);
    if (split) {
      addLabel("Main clause", split.left);
      addLabel("Connector", split.connector);
      addLabel("Clause", split.right);
      return labels;
    }

    const commaMatch = String(sentence || "")
      .replace(/[.!?]+$/, "")
      .match(/^\s*([^,]+),\s+(.+)\s*$/);
    if (commaMatch) {
      const lead = commaMatch[1].trim();
      const rest = commaMatch[2].trim();
      const leadLower = lead.toLowerCase();
      if (
        leadLower.startsWith("for example") ||
        leadLower.startsWith("for instance") ||
        leadLower.startsWith("in short") ||
        leadLower.startsWith("anyway") ||
        leadLower.startsWith("by the way") ||
        leadLower.startsWith("sorry")
      ) {
        addLabel("Connector", lead);
        addLabel("Clause", rest);
      } else {
        addLabel("Clause 1", lead);
        addLabel("Clause 2", rest);
      }
      return labels;
    }

    addLabel("Sentence", String(sentence || "").replace(/[.!?]+$/, "").trim());
    return labels;
  }

  if (title.includes("linking clauses") || section.includes("connections") || section.includes("conditions")) {
    const split = splitByConnector(sentence);
    if (split) {
      addLabel("Main clause", split.left);
      addLabel("Connector", split.connector);
      addLabel("Clause", split.right);
      return labels;
    }
  }

  if (section.includes("verbs") || title.includes("verb")) {
    const svo = parseSVO(sentence);
    if (svo) {
      if (title.includes("action")) {
        addLabel("Subject", svo.subject);
        addLabel("Action verb", svo.verb);
        addLabel("Object", svo.object);
        return labels;
      }
      if (title.includes("state")) {
        addLabel("Subject", svo.subject);
        addLabel("State verb", svo.verb);
        addLabel("Complement", svo.object);
        return labels;
      }
      if (title.includes("linking")) {
        addLabel("Subject", svo.subject);
        addLabel("Linking verb", svo.verb);
        addLabel("Complement", svo.object);
        return labels;
      }
      if (title.includes("phrasal")) {
        addLabel("Verb", svo.verb);
        const particleMatch = sentence.match(/\b([a-z]+)\s+(up|out|off|in|on|down)\b/i);
        if (particleMatch) {
          addLabel("Particle", particleMatch[2]);
        }
        let obj = svo.object || "";
        if (particleMatch) {
          const particle = particleMatch[2];
          obj = obj.replace(new RegExp(`^${escapeRegExp(particle)}\\s+`, "i"), "");
        }
        addLabel("Object", obj);
        return labels;
      }
      if (title.includes("patterns")) {
        addLabel("Verb", svo.verb);
        const prepMatch = sentence.match(/\b(on|in|at|with|to|for)\s+(the\s+)?[a-z]+\b/i);
        if (prepMatch) {
          addLabel("Preposition", prepMatch[0]);
        }
        addLabel("Object", svo.object);
        return labels;
      }
      if (title.includes("combinations")) {
        addLabel("Verb", svo.verb);
        const toMatch = sentence.match(/\bto\s+[a-z]+\b/i);
        const ingMatch = sentence.match(/\b[a-z]+ing\b/i);
        if (toMatch) addLabel("Infinitive", toMatch[0]);
        if (ingMatch) addLabel("Gerund", ingMatch[0]);
        return labels;
      }
      addLabel("Subject", svo.subject);
      addLabel("Verb", svo.verb);
      addLabel("Object", svo.object);
      return labels;
    }
  }

  if (section.includes("tenses")) {
    const time = findTimePhrase(sentence);
    if (time) addLabel("Time", time.phrase);
    const verbPhrase = findVerbPhrase(sentence);
    if (verbPhrase) addLabel("Verb", verbPhrase);
    if (labels.length) return labels;
  }

  if (section.includes("nouns") || title.includes("article") || title.includes("quantifier")) {
    const articleMatch = sentence.match(/\b(a|an|the|some|many|much|few|little)\b/i);
    if (articleMatch) addLabel("Article", articleMatch[0]);
    const nounMatch = sentence.match(/\b[a-z]+(?:s|ren)?\b(?!.*\b(a|an|the|some|many|much|few|little)\b)/i);
    if (nounMatch) addLabel("Noun", nounMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("pronouns") || title.includes("pronoun")) {
    const pronounMatch = sentence.match(/\b(i|you|he|she|we|they|me|him|her|us|them|my|your|his|their|our|mine|yours|hers|theirs|myself|yourself|himself|herself|ourselves|themselves)\b/i);
    if (pronounMatch) addLabel("Pronoun", pronounMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("modifiers") || title.includes("adjective") || title.includes("adverb")) {
    const adjMatch = sentence.match(/\b(quiet|small|red|tall|fast|slow|happy|cold|warm|new|old|clear|bright)\b/i);
    const advMatch = sentence.match(/\b(quickly|slowly|clearly|quietly|carefully)\b/i);
    if (adjMatch) addLabel("Adjective", adjMatch[0]);
    if (advMatch) addLabel("Adverb", advMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("questions")) {
    const whMatch = sentence.match(/\b(who|what|where|when|why|how)\b/i);
    if (whMatch) addLabel("Question word", whMatch[0]);
    const auxMatch = sentence.match(/\b(do|does|did|is|are|was|were|can|could|should)\b/i);
    if (auxMatch) addLabel("Auxiliary", auxMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("negation") || title.includes("negation")) {
    const negMatch = sentence.match(/\b(not|never|no|nothing|nobody|none|nowhere)\b/i);
    if (negMatch) addLabel("Negative", negMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("modality")) {
    const modalMatch = sentence.match(/\b(can|could|should|must|might|may|will|would)\b/i);
    if (modalMatch) addLabel("Modal", modalMatch[0]);
    if (labels.length) return labels;
  }

  if (section.includes("reported")) {
    const reportMatch = sentence.match(/\b(said|told|asked)\b/i);
    if (reportMatch) addLabel("Reporting verb", reportMatch[0]);
    const clauseMatch = splitByConnector(sentence);
    if (clauseMatch) addLabel("Clause", clauseMatch.right);
    if (labels.length) return labels;
  }

  const split = splitByConnector(sentence);
  if (split) {
    addLabel("Main clause", split.left);
    addLabel("Connector", split.connector);
    addLabel("Clause", split.right);
    return labels;
  }

  const time = findTimePhrase(sentence);
  if (time) addLabel("Time", time.phrase);
  const place = findPlacePhrase(sentence);
  if (place) addLabel("Place", place.phrase);
  const reasonMatch = sentence.match(/\bbecause\s+[^.?!]+/i);
  if (reasonMatch) addLabel("Reason", reasonMatch[0]);
  if (labels.length) return labels;

  const svo = parseSVO(sentence);
  if (svo) {
    addLabel("Subject", svo.subject);
    addLabel("Verb", svo.verb);
    addLabel("Object", svo.object);
    return labels;
  }

  const clean = sentence.replace(/[.!?]$/, "").trim();
  if (clean) {
    addLabel("Sentence", clean);
  }
  return labels;
};

const stripLabelPhrases = (sentence, labels) => {
  let output = sentence;
  labels.forEach((label) => {
    const parts = label.split(":");
    if (parts.length < 2) {
      return;
    }
    const phrase = parts.slice(1).join(":").trim();
    if (!phrase) {
      return;
    }
    const pattern = buildWordBoundaryPattern(phrase);
    output = output.replace(pattern, "").replace(/\s{2,}/g, " ");
  });
  output = output
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+\?/g, "?")
    .replace(/\s+\!/g, "!")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!output) {
    return sentence;
  }
  return output;
};

const trimHighlightEdges = (value) =>
  String(value || "")
    .trim()
    .replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, "")
    .trim();

const buildRuleOrderFallbackLabels = (ruleOrder, sentence) => {
  const slots = (Array.isArray(ruleOrder) ? ruleOrder : [])
    .map((item) => String(item || "").trim())
    .filter(Boolean);
  const source = String(sentence || "").trim();
  if (slots.length < 2 || !source) {
    return [];
  }
  if (!/\s/u.test(source)) {
    return [];
  }
  const cleaned = source.replace(/[\s\p{P}\p{S}]+$/gu, "").trim();
  const words = cleaned.split(/\s+/).filter((part) => hasLetterOrNumber(part));
  if (words.length < 2) {
    return [];
  }
  const labels = [];
  if (words.length >= slots.length) {
    for (let i = 0; i < slots.length - 1; i += 1) {
      labels.push(`${slots[i]}: ${words[i]}`);
    }
    labels.push(`${slots[slots.length - 1]}: ${words.slice(slots.length - 1).join(" ")}`);
    return labels;
  }
  for (let i = 0; i < words.length - 1 && i < slots.length; i += 1) {
    labels.push(`${slots[i]}: ${words[i]}`);
  }
  labels.push(
    `${slots[Math.min(slots.length - 1, words.length - 1)]}: ${words[words.length - 1]}`
  );
  return labels;
};

const buildRuleDrivenExampleItem = (payload, fallbackRuleOrder = []) => {
  const expanded = String(payload?.example || payload?.expanded || "").trim();
  if (!expanded) {
    return null;
  }
  const ruleOrder = Array.isArray(payload?.ruleOrder)
    ? payload.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : Array.isArray(fallbackRuleOrder)
      ? fallbackRuleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const highlights = Array.isArray(payload?.exampleHighlights)
    ? payload.exampleHighlights
        .map((entry) => ({
          label: String(entry?.label || "").trim(),
          text: trimHighlightEdges(entry?.text),
        }))
        .filter((entry) => entry.label && entry.text && hasLetterOrNumber(entry.text))
    : [];
  if (ruleOrder.length < 2) {
    return null;
  }

  const labels = [];
  let cursor = 0;
  for (let i = 0; i < ruleOrder.length; i += 1) {
    const entry = highlights[i];
    const text = String(entry?.text || "").trim();
    if (!text) {
      continue;
    }
    const span = findPhraseMatchSpan(expanded, text, cursor);
    if (!span) {
      continue;
    }
    const slot = ruleOrder[i] || entry?.label || `Part ${i + 1}`;
    const phrase = expanded.slice(span.start, span.end);
    labels.push(`${slot}: ${phrase}`);
    cursor = span.end;
  }
  const dedupedLabels = [];
  const seen = new Set();
  labels.forEach((label) => {
    const parts = label.split(":");
    const phrase = parts.slice(1).join(":").trim().toLocaleLowerCase();
    if (!phrase || seen.has(phrase)) {
      return;
    }
    seen.add(phrase);
    dedupedLabels.push(label);
  });
  let finalLabels = dedupedLabels;
  const expectedLabelCount = ruleOrder.length;
  const shouldRequireExactCount = expectedLabelCount >= 2 && /\s/u.test(expanded);
  if (shouldRequireExactCount && finalLabels.length !== expectedLabelCount) {
    finalLabels = buildRuleOrderFallbackLabels(ruleOrder, expanded);
  }
  if (finalLabels.length < 2) {
    finalLabels = buildRuleOrderFallbackLabels(ruleOrder, expanded);
  }
  if (finalLabels.length < 2) {
    return null;
  }
  let base = stripLabelPhrases(expanded, finalLabels);
  if (!base || base.trim().length < 2) {
    base = expanded;
  }
  const variantLabel = String(payload?.variantLabel || "").trim();
  return {
    base,
    expanded,
    labels: finalLabels,
    colorByOrder: WORLD_KEY !== "english",
    variantLabel: variantLabel || "",
  };
};

const SINGULAR_PLURAL_TITLE_TOKENS = {
  english: ["singular", "plural"],
  french: ["singulier", "pluriel"],
  german: ["singular", "plural"],
  spanish: ["singular", "plural"],
  portuguese: ["singular", "plural"],
  dutch: ["enkelvoud", "meervoud"],
  swedish: ["singular", "plural"],
  arabic: ["المفرد", "الجمع"],
  chinese: ["单数", "复数"],
  japanese: ["単数", "複数"],
  korean: ["단수", "복수"],
  hindi: ["एकवचन", "बहुवचन"],
};

const SINGULAR_PLURAL_VARIANT_LABELS = {
  english: { singular: "Singular", plural: "Plural" },
  french: { singular: "Singulier", plural: "Pluriel" },
  german: { singular: "Singular", plural: "Plural" },
  spanish: { singular: "Singular", plural: "Plural" },
  portuguese: { singular: "Singular", plural: "Plural" },
  dutch: { singular: "Enkelvoud", plural: "Meervoud" },
  swedish: { singular: "Singular", plural: "Plural" },
  arabic: { singular: "المفرد", plural: "الجمع" },
  chinese: { singular: "单数", plural: "复数" },
  japanese: { singular: "単数", plural: "複数" },
  korean: { singular: "단수", plural: "복수" },
  hindi: { singular: "एकवचन", plural: "बहुवचन" },
};

const isSingularPluralCardTitle = (cardData) => {
  const source = String(cardData?.sourceTitle || cardData?.title || "").trim();
  if (!source) {
    return false;
  }
  const lower = source.toLowerCase();
  const tokens = SINGULAR_PLURAL_TITLE_TOKENS[WORLD_KEY] || SINGULAR_PLURAL_TITLE_TOKENS.english;
  return Array.isArray(tokens) && tokens.every((token) => lower.includes(String(token).toLowerCase()));
};

const applySingularPluralVariantLabels = (pairs, cardData) => {
  if (!Array.isArray(pairs) || pairs.length !== 2 || !isSingularPluralCardTitle(cardData)) {
    return pairs;
  }
  const labels = SINGULAR_PLURAL_VARIANT_LABELS[WORLD_KEY] || SINGULAR_PLURAL_VARIANT_LABELS.english;
  return pairs.map((item, index) => {
    const existing = String(item?.variantLabel || "").trim();
    if (existing) {
      return item;
    }
    return {
      ...item,
      variantLabel: index === 0 ? labels.singular : labels.plural,
    };
  });
};

const formatExampleVariantLabel = (value) => {
  const label = String(value || "").trim();
  if (!label) {
    return "";
  }
  return label.endsWith(":") ? label : `${label}:`;
};

const buildRuleDrivenExamplePair = (cardData) => {
  const sharedRuleOrder = Array.isArray(cardData?.ruleOrder)
    ? cardData.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const explicitPairs = Array.isArray(cardData?.examplePairs)
    ? cardData.examplePairs.filter((entry) => entry && typeof entry === "object")
    : [];
  if (explicitPairs.length) {
    const builtPairs = explicitPairs
      .map((entry) => buildRuleDrivenExampleItem(entry, sharedRuleOrder))
      .filter(Boolean);
    if (builtPairs.length === explicitPairs.length) {
      return applySingularPluralVariantLabels(builtPairs, cardData);
    }
  }
  const single = buildRuleDrivenExampleItem(cardData, sharedRuleOrder);
  if (!single) {
    return null;
  }
  return applySingularPluralVariantLabels([single], cardData);
};

const normalizeGrammarTextKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const parseGrammarExampleLabels = (labels = []) =>
  (Array.isArray(labels) ? labels : [])
    .map((labelText) => {
      const raw = String(labelText || "");
      const idx = raw.indexOf(":");
      if (idx < 0) {
        return null;
      }
      const slot = raw.slice(0, idx).trim();
      const phrase = raw.slice(idx + 1).trim();
      if (!slot || !phrase) {
        return null;
      }
      return { slot, phrase };
    })
    .filter(Boolean);

const normalizeSlotCategory = (slot) => {
  const key = normalizeGrammarTextKey(slot);
  const has = (tokens) => tokens.some((token) => key.includes(token));
  if (
    has([
      "subject",
      "sujet",
      "subjekt",
      "sujeto",
      "sujeito",
      "onderwerp",
      "주어",
      "主语",
      "主語",
      "فاعل",
      "विषय",
    ])
  ) {
    return "subject";
  }
  if (
    has([
      "verb",
      "verbe",
      "verbo",
      "werkwoord",
      "동사",
      "谓语",
      "動詞",
      "فعل",
      "क्रिया",
    ])
  ) {
    return "verb";
  }
  if (
    has([
      "object",
      "objet",
      "objekt",
      "objeto",
      "voorwerp",
      "目的語",
      "宾语",
      "목적어",
      "مفعول",
      "वस्तु",
      "complement",
      "compl",
      "補語",
      "보어",
    ])
  ) {
    return "object";
  }
  if (has(["time", "temps", "zeit", "tiempo", "tempo", "tijd", "tid", "时间", "時", "시간", "وقت", "زمان", "समय"])) {
    return "time";
  }
  if (has(["place", "lieu", "ort", "lugar", "plaats", "plats", "場所", "地点", "장소", "مكان", "स्थान"])) {
    return "place";
  }
  if (has(["connector", "connecteur", "conector", "conjunction", "link", "接続", "连接", "연결", "ربط", "समुच्चय"])) {
    return "connector";
  }
  if (has(["clause", "proposition", "satz", "oracion", "oração", "从句", "節", "절", "جملة", "उपवाक्य"])) {
    return "clause";
  }
  if (has(["noun", "nom", "nomen", "sustantivo", "substantivo", "substantiv", "名词", "名詞", "명사", "اسم", "संज्ञा"])) {
    return "noun";
  }
  return "generic";
};

const GRAMMAR_VARIANT_POOLS = {
  english: {
    subject: ["They", "We", "The student", "My friend"],
    verb: ["reads", "writes", "checks", "visits"],
    object: ["the lesson", "a message", "the plan", "the report"],
    time: ["today", "tomorrow", "this evening", "right now"],
    place: ["at home", "at school", "in the office", "at the park"],
    connector: ["because", "but", "and", "so"],
    clause: ["it is raining", "we are ready", "the class starts", "time is short"],
    noun: ["students", "books", "ideas", "tickets"],
    generic: ["another example", "a similar sentence", "this pattern"],
  },
  french: {
    subject: ["Nous", "Ils", "Le professeur", "Mon ami"],
    verb: ["lisons", "regardent", "ecrit", "prepare"],
    object: ["la lecon", "un message", "le plan", "le rapport"],
    time: ["aujourd'hui", "demain", "ce soir", "maintenant"],
    place: ["a la maison", "a l'ecole", "au bureau", "au parc"],
    connector: ["parce que", "mais", "et", "donc"],
    clause: ["il pleut", "nous sommes prets", "le cours commence", "le temps manque"],
    noun: ["eleves", "livres", "idees", "billets"],
    generic: ["un autre exemple", "une phrase similaire", "ce schema"],
  },
  german: {
    subject: ["Wir", "Sie", "Der Lehrer", "Meine Freundin"],
    verb: ["lesen", "sehen", "schreibt", "plant"],
    object: ["die Lektion", "eine Nachricht", "den Plan", "den Bericht"],
    time: ["heute", "morgen", "heute Abend", "jetzt"],
    place: ["zu Hause", "in der Schule", "im Buro", "im Park"],
    connector: ["weil", "aber", "und", "deshalb"],
    clause: ["es regnet", "wir sind bereit", "der Kurs beginnt", "die Zeit ist knapp"],
    noun: ["Schuler", "Bucher", "Ideen", "Tickets"],
    generic: ["ein anderes Beispiel", "ein ahnlicher Satz", "dieses Muster"],
  },
  spanish: {
    subject: ["Nosotros", "Ellos", "La profesora", "Mi amigo"],
    verb: ["leemos", "miran", "escribe", "prepara"],
    object: ["la leccion", "un mensaje", "el plan", "el informe"],
    time: ["hoy", "manana", "esta noche", "ahora"],
    place: ["en casa", "en la escuela", "en la oficina", "en el parque"],
    connector: ["porque", "pero", "y", "asi que"],
    clause: ["esta lloviendo", "estamos listos", "la clase empieza", "falta tiempo"],
    noun: ["estudiantes", "libros", "ideas", "boletos"],
    generic: ["otro ejemplo", "una frase similar", "este patron"],
  },
  portuguese: {
    subject: ["Nos", "Eles", "A professora", "Meu amigo"],
    verb: ["lemos", "veem", "escreve", "prepara"],
    object: ["a licao", "uma mensagem", "o plano", "o relatorio"],
    time: ["hoje", "amanha", "esta noite", "agora"],
    place: ["em casa", "na escola", "no escritorio", "no parque"],
    connector: ["porque", "mas", "e", "entao"],
    clause: ["esta chovendo", "estamos prontos", "a aula comeca", "o tempo e curto"],
    noun: ["alunos", "livros", "ideias", "bilhetes"],
    generic: ["outro exemplo", "uma frase parecida", "este padrao"],
  },
  dutch: {
    subject: ["Wij", "Zij", "De leraar", "Mijn vriend"],
    verb: ["lezen", "kijken", "schrijft", "plant"],
    object: ["de les", "een bericht", "het plan", "het rapport"],
    time: ["vandaag", "morgen", "vanavond", "nu"],
    place: ["thuis", "op school", "op kantoor", "in het park"],
    connector: ["omdat", "maar", "en", "dus"],
    clause: ["het regent", "we zijn klaar", "de les begint", "de tijd is kort"],
    noun: ["studenten", "boeken", "ideeen", "tickets"],
    generic: ["een ander voorbeeld", "een vergelijkbare zin", "dit patroon"],
  },
  swedish: {
    subject: ["Vi", "De", "Lararen", "Min van"],
    verb: ["laser", "ser", "skriver", "planerar"],
    object: ["lektionen", "ett meddelande", "planen", "rapporten"],
    time: ["idag", "imorgon", "ikvall", "nu"],
    place: ["hemma", "i skolan", "pa kontoret", "i parken"],
    connector: ["eftersom", "men", "och", "sa"],
    clause: ["det regnar", "vi ar redo", "lektionen borjar", "tiden ar kort"],
    noun: ["studenter", "bocker", "ideer", "biljetter"],
    generic: ["ett annat exempel", "en liknande mening", "detta monster"],
  },
  arabic: {
    subject: ["الطالبة", "نحن", "هم", "المعلم"],
    verb: ["يقرأ", "يكتب", "يشاهد", "يذهب"],
    object: ["الكتاب", "الرسالة", "الدرس", "التقرير"],
    time: ["اليوم", "غدا", "الآن", "مساء"],
    place: ["في البيت", "في المدرسة", "في المكتب", "في الحديقة"],
    connector: ["لأن", "لكن", "و", "ثم"],
    clause: ["الجو ممطر", "نحن جاهزون", "الدرس يبدأ", "الوقت قصير"],
    noun: ["طلاب", "كتب", "أفكار", "تذاكر"],
    generic: ["مثال آخر", "جملة مشابهة", "هذا النمط"],
  },
  chinese: {
    subject: ["他", "她", "我们", "学生"],
    verb: ["看", "写", "学", "买"],
    object: ["书", "报告", "电影", "作业"],
    time: ["今天", "明天", "现在", "今晚"],
    place: ["在家", "在学校", "在办公室", "在公园"],
    connector: ["因为", "但是", "而且", "所以"],
    clause: ["今天下雨", "我们准备好了", "课程开始了", "时间不够"],
    noun: ["学生", "书", "想法", "票"],
    generic: ["另一个例子", "类似句子", "这个模式"],
  },
  japanese: {
    subject: ["彼は", "彼女は", "私たちは", "学生は"],
    verb: ["読みます", "書きます", "見ます", "行きます"],
    object: ["本を", "手紙を", "映画を", "宿題を"],
    time: ["今日", "明日", "今", "今夜"],
    place: ["家で", "学校で", "会社で", "公園で"],
    connector: ["でも", "そして", "だから", "ので"],
    clause: ["雨が降っています", "準備ができています", "授業が始まります", "時間が足りません"],
    noun: ["学生", "本", "考え", "切符"],
    generic: ["別の例", "似た文", "この型"],
  },
  korean: {
    subject: ["그는", "그녀는", "우리는", "학생은"],
    verb: ["읽는다", "쓴다", "본다", "간다"],
    object: ["책을", "편지를", "영화를", "숙제를"],
    time: ["오늘", "내일", "지금", "오늘 밤"],
    place: ["집에서", "학교에서", "회사에서", "공원에서"],
    connector: ["왜냐하면", "하지만", "그리고", "그래서"],
    clause: ["비가 온다", "우리는 준비됐다", "수업이 시작된다", "시간이 부족하다"],
    noun: ["학생들", "책", "생각", "표"],
    generic: ["다른 예시", "비슷한 문장", "이 패턴"],
  },
  hindi: {
    subject: ["वह", "वे", "हम", "शिक्षक"],
    verb: ["पढ़ता है", "लिखता है", "देखता है", "जाता है"],
    object: ["किताब", "संदेश", "रिपोर्ट", "फिल्म"],
    time: ["आज", "कल", "अभी", "शाम को"],
    place: ["घर में", "स्कूल में", "दफ्तर में", "पार्क में"],
    connector: ["क्योंकि", "लेकिन", "और", "इसलिए"],
    clause: ["बारिश हो रही है", "हम तैयार हैं", "कक्षा शुरू होती है", "समय कम है"],
    noun: ["छात्र", "किताबें", "विचार", "टिकट"],
    generic: ["एक और उदाहरण", "मिलता-जुलता वाक्य", "यह पैटर्न"],
  },
};

const pickVariantPhraseForLabel = (slot, originalPhrase, seed = 0) => {
  const category = normalizeSlotCategory(slot);
  const pools = GRAMMAR_VARIANT_POOLS[WORLD_KEY] || GRAMMAR_VARIANT_POOLS.english;
  const list = pools[category] || pools.generic || [];
  if (!Array.isArray(list) || !list.length) {
    return "";
  }
  const normalizedOriginal = normalizeGrammarTextKey(originalPhrase);
  const start = Math.abs(Number(seed) || 0) % list.length;
  for (let offset = 0; offset < list.length; offset += 1) {
    const candidate = String(list[(start + offset) % list.length] || "").trim();
    if (!candidate) {
      continue;
    }
    if (normalizeGrammarTextKey(candidate) !== normalizedOriginal) {
      return candidate;
    }
  }
  return "";
};

const splitTrailingPunctuation = (phrase) => {
  const value = String(phrase || "");
  const match = value.match(/^(.*?)([.!?。！？،؛]+)?$/u);
  if (!match) {
    return { core: value, suffix: "" };
  }
  return {
    core: String(match[1] || "").trim(),
    suffix: String(match[2] || ""),
  };
};

const replaceLabelPhrasesInSentence = (sentence, originalPhrases = [], nextPhrases = []) => {
  const source = String(sentence || "");
  if (!source || originalPhrases.length !== nextPhrases.length || !originalPhrases.length) {
    return "";
  }
  let cursor = 0;
  let output = "";
  for (let i = 0; i < originalPhrases.length; i += 1) {
    const oldPhrase = String(originalPhrases[i] || "");
    const newPhrase = String(nextPhrases[i] || "");
    if (!oldPhrase || !newPhrase) {
      return "";
    }
    let at = source.indexOf(oldPhrase, cursor);
    if (at < 0) {
      at = source.indexOf(oldPhrase);
    }
    if (at < 0) {
      return "";
    }
    output += source.slice(cursor, at) + newPhrase;
    cursor = at + oldPhrase.length;
  }
  output += source.slice(cursor);
  return output;
};

const buildAdditionalExampleFromItem = (primaryItem, seed = 0) => {
  if (!primaryItem || typeof primaryItem !== "object") {
    return null;
  }
  const expanded = String(primaryItem.expanded || "").trim();
  if (!expanded) {
    return null;
  }
  const parsedLabels = parseGrammarExampleLabels(primaryItem.labels);
  if (!parsedLabels.length) {
    return null;
  }
  const preferredIndices = [];
  const fallbackIndices = [];
  parsedLabels.forEach((part, index) => {
    const category = normalizeSlotCategory(part.slot);
    if (["object", "place", "time", "clause", "noun", "generic"].includes(category)) {
      preferredIndices.push(index);
    } else {
      fallbackIndices.push(index);
    }
  });
  const orderedIndices = [...preferredIndices, ...fallbackIndices];
  for (const targetIndex of orderedIndices) {
    const updatedPhrases = parsedLabels.map((part, index) => {
      if (index !== targetIndex) {
        return part.phrase;
      }
      const { core, suffix } = splitTrailingPunctuation(part.phrase);
      const replacement = pickVariantPhraseForLabel(part.slot, core, seed + index + 17);
      if (!replacement) {
        return part.phrase;
      }
      return `${replacement}${suffix}`;
    });
    const sentenceVariant = replaceLabelPhrasesInSentence(
      expanded,
      parsedLabels.map((part) => part.phrase),
      updatedPhrases
    );
    if (!sentenceVariant || normalizeGrammarTextKey(sentenceVariant) === normalizeGrammarTextKey(expanded)) {
      continue;
    }
    const labels = parsedLabels.map(
      (part, index) => `${part.slot}: ${String(updatedPhrases[index] || "").trim()}`
    );
    let base = stripLabelPhrases(sentenceVariant, labels);
    if (!base || base.trim().length < 2) {
      base = sentenceVariant;
    }
    return {
      ...primaryItem,
      base,
      expanded: sentenceVariant,
      labels,
      variantLabel: "",
    };
  }
  return null;
};

// Strict pedagogy mode: keep one canonical example per card.
const PEDAGOGY_STRICT_SINGLE_EXAMPLE = true;

const ensureTwoGrammarExamples = (examples, cardData, sectionName, index) => {
  const source = Array.isArray(examples) ? examples.filter(Boolean) : [];
  const unique = [];
  const seen = new Set();
  source.forEach((item) => {
    const key = normalizeGrammarTextKey(item?.expanded);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(item);
  });
  if (PEDAGOGY_STRICT_SINGLE_EXAMPLE) {
    if (unique.length > 0) {
      return unique.slice(0, 1);
    }
    const fallbackExpanded = String(
      cardData?.example || buildAltGrammarExample(cardData, Number(index || 0) + 71)
    ).trim();
    if (!fallbackExpanded) {
      return [];
    }
    const labels = buildLabelsForCard(
      {
        ...cardData,
        section: sectionName || cardData?.section || "",
      },
      fallbackExpanded
    );
    let base = stripLabelPhrases(fallbackExpanded, labels);
    if (!base || base.trim().length < 2) {
      base = fallbackExpanded;
    }
    return [
      {
        base,
        expanded: fallbackExpanded,
        labels,
        colorByOrder: !!cardData?.ruleOrder?.length && WORLD_KEY !== "english",
      },
    ];
  }
  if (unique.length >= 2) {
    return unique.slice(0, 2);
  }
  const primary = unique[0] || null;
  if (primary) {
    const extra = buildAdditionalExampleFromItem(primary, Number(index) || 0);
    const extraKey = normalizeGrammarTextKey(extra?.expanded);
    if (extra && extraKey && !seen.has(extraKey)) {
      seen.add(extraKey);
      unique.push(extra);
    }
  }
  if (unique.length < 2) {
    const fallbackExpanded = String(
      cardData?.example || buildAltGrammarExample(cardData, Number(index || 0) + 71)
    ).trim();
    if (fallbackExpanded) {
      const labels = buildLabelsForCard(
        {
          ...cardData,
          section: sectionName || cardData?.section || "",
        },
        fallbackExpanded
      );
      const fallbackItem = buildAdditionalExampleFromItem(
        {
          base: fallbackExpanded,
          expanded: fallbackExpanded,
          labels,
          colorByOrder: !!cardData?.ruleOrder?.length && WORLD_KEY !== "english",
        },
        Number(index || 0) + 131
      );
      const fallbackKey = normalizeGrammarTextKey(fallbackItem?.expanded);
      if (fallbackItem && fallbackKey && !seen.has(fallbackKey)) {
        seen.add(fallbackKey);
        unique.push(fallbackItem);
      }
    }
  }
  return unique.slice(0, 2);
};

const buildGenericExamplePairs = (cardData, index, sectionName = "") => {
  const strictPairs = buildRuleDrivenExamplePair(cardData);
  if (strictPairs) {
    return strictPairs;
  }
  if (WORLD_KEY !== "english") {
    const expanded = cardData.example || buildAltGrammarExample(cardData, index);
    return [{ base: expanded, expanded, labels: [] }];
  }
  const exampleA = cardData.example || buildAltGrammarExample(cardData, index);
  const examples = [exampleA];
  return examples.map((expanded) => {
    const labels = buildLabelsForCard(
      {
        ...cardData,
        section: sectionName || cardData.section || "",
      },
      expanded
    );
    let base = stripLabelPhrases(expanded, labels);
    if (!base || base.trim().length < 2) {
      base = expanded;
    }
    return { base, expanded, labels };
  });
};

const buildGrammarHowItWorks = (card) => {
  const sourceTitle = String(card.sourceTitle || card.title || "");
  const title = sourceTitle.toLowerCase();
  const tokenize = (value) =>
    (String(value || "").match(/[\p{L}\p{N}]+/gu) || [])
      .map((token) => normalizeGrammarTextKey(token))
      .filter((token) => token.length >= 2);
  const buildTopicAnchorSet = () => {
    const anchors = new Set();
    tokenize(card?.title).forEach((token) => anchors.add(token));
    tokenize(card?.example).forEach((token) => anchors.add(token));
    (Array.isArray(card?.ruleOrder) ? card.ruleOrder : []).forEach((part) => {
      tokenize(part).forEach((token) => anchors.add(token));
    });
    (Array.isArray(card?.exampleHighlights) ? card.exampleHighlights : []).forEach((entry) => {
      tokenize(entry?.label).forEach((token) => anchors.add(token));
      tokenize(entry?.text).forEach((token) => anchors.add(token));
    });
    return anchors;
  };
  const topicAnchors = buildTopicAnchorSet();
  const isTopicSpecificPoint = (point) => {
    const normalizedPoint = normalizeGrammarTextKey(point);
    if (!normalizedPoint) {
      return false;
    }
    const explicitOrder = Array.isArray(card?.ruleOrder)
      ? card.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    if (
      explicitOrder.some((slot) => {
        const normalizedSlot = normalizeGrammarTextKey(slot);
        return normalizedSlot && normalizedPoint.includes(normalizedSlot);
      })
    ) {
      return true;
    }
    const tokens = tokenize(point);
    let overlap = 0;
    for (const token of tokens) {
      if (topicAnchors.has(token)) {
        overlap += 1;
        if (overlap >= 2) {
          return true;
        }
      }
    }
    return false;
  };
  const buildRuleSpecificFallbackBullets = (explicitOrder = []) => {
    const fallback = [];
    if (explicitOrder.length >= 2) {
      fallback.push(explicitOrder.join(" + "));
    }
    const highlightPairs = (Array.isArray(card?.exampleHighlights) ? card.exampleHighlights : [])
      .map((entry) => {
        const label = String(entry?.label || "").trim();
        const text = String(entry?.text || "").trim();
        if (!label || !text) {
          return "";
        }
        return `${label}: ${text}`;
      })
      .filter(Boolean);
    if (highlightPairs.length >= 2) {
      fallback.push(highlightPairs.join(" + "));
    }
    const example = String(card?.example || "").trim();
    if (example) {
      fallback.push(example);
    }
    return fallback.slice(0, 3);
  };
  const explicitOrder = Array.isArray(card?.ruleOrder)
    ? card.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (explicitOrder.length >= 2) {
    const expandedPoints = (card.points || []).map(expandGrammarPoint);
    const topicPoints = expandedPoints.filter((point) => isTopicSpecificPoint(point));
    const fallbackBullets = buildRuleSpecificFallbackBullets(explicitOrder);
    const orderText = explicitOrder.join(" + ");
    return {
      order: orderText,
      bullets: (topicPoints.length ? topicPoints : fallbackBullets).slice(0, 3),
      template: orderText,
    };
  }
  if (WORLD_KEY === "english" && title.includes("adding details")) {
    return {
      order: "(time) + (place)",
      bullets: [
        "add a time phrase after the main clause (for example, at noon or yesterday)",
        "add a place phrase after the time phrase (for example, at the station or in the kitchen)",
      ],
      template: "subject + verb + object + (time) + (place)",
    };
  }
  const expandedPoints = (card.points || []).map(expandGrammarPoint);
  if (WORLD_KEY !== "english") {
    return {
      bullets: expandedPoints,
      template: null,
    };
  }
  const template = GRAMMAR_TEMPLATES[sourceTitle] || null;
  return {
    bullets: expandedPoints,
    template,
  };
};

const GRAMMAR_MISTAKES = {
  "basic word order": {
    wrong: "She reads book.",
    fix: "She reads a book.",
  },
  "sentence parts": {
    wrong: "They named captain.",
    fix: "They named her captain.",
  },
  "adding details": {
    wrong: "She met him at noon the station.",
    fix: "She met him at noon at the station.",
  },
  "linking clauses": {
    wrong: "I stayed home because.",
    fix: "I stayed home because it rained.",
  },
  "sentence variety": {
    wrong: "We finished early we went home after class because we were tired.",
    fix: "We finished early, and we went home after class because we were tired.",
  },
  "action verbs": {
    wrong: "They carries the boxes.",
    fix: "They carry the boxes.",
  },
  "state verbs": {
    wrong: "She is feeling tired.",
    fix: "She feels tired.",
  },
  "linking verbs": {
    wrong: "The room feels quietly.",
    fix: "The room feels quiet.",
  },
  "verb patterns": {
    wrong: "He placed the book on.",
    fix: "He placed the book on the table.",
  },
  "verb combinations": {
    wrong: "We decided stay.",
    fix: "We decided to stay.",
  },
  "phrasal verbs": {
    wrong: "He turned the light on off.",
    fix: "He turned off the light.",
  },
  "present simple": {
    wrong: "She work every day.",
    fix: "She works every day.",
  },
  "present continuous": {
    wrong: "I am wait outside.",
    fix: "I am waiting outside.",
  },
  "past simple": {
    wrong: "They visit Paris last year.",
    fix: "They visited Paris last year.",
  },
  "past continuous": {
    wrong: "She was cook when I called.",
    fix: "She was cooking when I called.",
  },
  "present perfect": {
    wrong: "He has live here for years.",
    fix: "He has lived here for years.",
  },
  "past perfect": {
    wrong: "He had leave before I arrived.",
    fix: "He had left before I arrived.",
  },
  "future forms": {
    wrong: "She will going to call tomorrow.",
    fix: "She is going to call tomorrow.",
  },
  "future continuous": {
    wrong: "I will working at six.",
    fix: "I will be working at six.",
  },
  "future perfect": {
    wrong: "They will have finish by Friday.",
    fix: "They will have finished by Friday.",
  },
  "aspect contrasts": {
    wrong: "I have work here for years.",
    fix: "I have worked here for years.",
  },
  "countable nouns": {
    wrong: "I have coin and two apples.",
    fix: "I have a coin and two apples.",
  },
  "uncountable nouns": {
    wrong: "I need two breads.",
    fix: "I need two pieces of bread.",
  },
  "articles": {
    wrong: "I saw movie.",
    fix: "I saw a movie.",
  },
  "plural forms": {
    wrong: "Three child play.",
    fix: "Three children play.",
  },
  "possessive nouns": {
    wrong: "The teachers book is new.",
    fix: "The teacher's book is new.",
  },
  "noun phrases": {
    wrong: "She bought the red.",
    fix: "She bought the red dress.",
  },
  "quantifiers": {
    wrong: "How much apples?",
    fix: "How many apples?",
  },
  "subject pronouns": {
    wrong: "Them are ready.",
    fix: "They are ready.",
  },
  "object pronouns": {
    wrong: "He saw I.",
    fix: "He saw me.",
  },
  "possessive forms": {
    wrong: "This bag is her.",
    fix: "This bag is hers.",
  },
  "reflexive pronouns": {
    wrong: "I hurt me.",
    fix: "I hurt myself.",
  },
  "demonstratives": {
    wrong: "This books are mine.",
    fix: "These books are mine.",
  },
  "relative reference": {
    wrong: "The man which called me left.",
    fix: "The man who called me left.",
  },
  "indefinite reference": {
    wrong: "I saw anyone at the station.",
    fix: "I saw someone at the station.",
  },
  "adjectives basics": {
    wrong: "The quiet house is noisily.",
    fix: "The quiet house is noisy.",
  },
  "adjective order": {
    wrong: "She bought a small red.",
    fix: "She bought a small red bag.",
  },
  "comparatives": {
    wrong: "This is more faster than that.",
    fix: "This is faster than that.",
  },
  "superlatives": {
    wrong: "He is tallest.",
    fix: "He is the tallest.",
  },
  "adverbs basics": {
    wrong: "She speaks slow.",
    fix: "She speaks slowly.",
  },
  "frequency adverbs": {
    wrong: "She always go early.",
    fix: "She always goes early.",
  },
  "time and place adverbs": {
    wrong: "He arrive here yesterday.",
    fix: "He arrived here yesterday.",
  },
  "degree words": {
    wrong: "It is enoughly hot.",
    fix: "It is hot enough.",
  },
  "participles": {
    wrong: "I am boring.",
    fix: "I am bored.",
  },
  "modifier stacking": {
    wrong: "She answered the very difficult question quick.",
    fix: "She answered the very difficult question quickly.",
  },
  "yes no questions": {
    wrong: "Do you works here?",
    fix: "Do you work here?",
  },
  "wh questions": {
    wrong: "Where does he lives?",
    fix: "Where does he live?",
  },
  "questions with be": {
    wrong: "Does the store open?",
    fix: "Is the store open?",
  },
  "questions with do": {
    wrong: "Did you did call her?",
    fix: "Did you call her?",
  },
  "questions with modals": {
    wrong: "Do could you help me?",
    fix: "Could you help me?",
  },
  "tag questions": {
    wrong: "You are ready, are you?",
    fix: "You are ready, aren't you?",
  },
  "indirect questions": {
    wrong: "Could you tell me where it are?",
    fix: "Could you tell me where it is?",
  },
  "not with be": {
    wrong: "He not happy.",
    fix: "He is not happy.",
  },
  "not with do": {
    wrong: "She not like tea.",
    fix: "She does not like tea.",
  },
  "negative short forms": {
    wrong: "He don't know.",
    fix: "He doesn't know.",
  },
  "negative words": {
    wrong: "I don't have nothing.",
    fix: "I don't have anything.",
  },
  "negative questions": {
    wrong: "Don't you likes coffee?",
    fix: "Don't you like coffee?",
  },
  "limited negatives": {
    wrong: "She hardly doesn't sleep.",
    fix: "She hardly sleeps.",
  },
  "basic connectors": {
    wrong: "I called but and no one answered.",
    fix: "I called, but no one answered.",
  },
  "reason and result": {
    wrong: "I was late because the bus.",
    fix: "I was late because the bus was late.",
  },
  "contrast and choice": {
    wrong: "I like either tea but coffee.",
    fix: "I like either tea or coffee.",
  },
  "time connectors": {
    wrong: "I left before I will eat.",
    fix: "I left before I ate.",
  },
  "comparison links": {
    wrong: "She is taller like me.",
    fix: "She is taller than me.",
  },
  "adding ideas": {
    wrong: "We need chairs in addition also.",
    fix: "We also need chairs.",
  },
  "ordering ideas": {
    wrong: "First we met, first we left.",
    fix: "First we met, then we left.",
  },
  "real conditions": {
    wrong: "If you will press this, it starts.",
    fix: "If you press this, it starts.",
  },
  "future conditions": {
    wrong: "If it will be sunny, we will go.",
    fix: "If it is sunny, we will go.",
  },
  "unreal present": {
    wrong: "If I will have time, I would go.",
    fix: "If I had time, I would go.",
  },
  "unreal past": {
    wrong: "If I knew, I would have told.",
    fix: "If I had known, I would have told.",
  },
  "mixed conditions": {
    wrong: "If I studied harder, I would have the job now.",
    fix: "If I had studied harder, I would have the job now.",
  },
  "unless and otherwise": {
    wrong: "We will go unless it will rain.",
    fix: "We will go unless it rains.",
  },
  "active voice": {
    wrong: "Dinner was cooked by the chef.",
    fix: "The chef cooked dinner.",
  },
  "passive voice": {
    wrong: "The meal cooked by the chef.",
    fix: "The meal was cooked by the chef.",
  },
  "focus shifts": {
    wrong: "That book, I finished it yesterday.",
    fix: "That book, I finished yesterday.",
  },
  "cleft sentences": {
    wrong: "It was she called.",
    fix: "It was she who called.",
  },
  "there and it subjects": {
    wrong: "There are a problem in the room.",
    fix: "There is a problem in the room.",
  },
  "ability": {
    wrong: "She can to swim.",
    fix: "She can swim.",
  },
  "permission": {
    wrong: "May I to sit here?",
    fix: "May I sit here?",
  },
  "obligation": {
    wrong: "You must to wear a badge.",
    fix: "You must wear a badge.",
  },
  "advice": {
    wrong: "You should to rest.",
    fix: "You should rest.",
  },
  "possibility": {
    wrong: "It might to rain.",
    fix: "It might rain.",
  },
  "probability": {
    wrong: "He will probably arrives late.",
    fix: "He will probably arrive late.",
  },
  "polite requests": {
    wrong: "Could you opens the window?",
    fix: "Could you open the window?",
  },
  "offers and invitations": {
    wrong: "Do you like to come?",
    fix: "Would you like to come?",
  },
  "reporting statements": {
    wrong: "She said me she was tired.",
    fix: "She said she was tired.",
  },
  "reporting questions": {
    wrong: "He asked where is the station.",
    fix: "He asked where the station was.",
  },
  "reporting requests": {
    wrong: "She asked me help.",
    fix: "She asked me to help.",
  },
  "reporting commands": {
    wrong: "He told me to went.",
    fix: "He told me to go.",
  },
  "backshift basics": {
    wrong: "She said she will come.",
    fix: "She said she would come.",
  },
  "time place changes": {
    wrong: "He said he would come here today.",
    fix: "He said he would come there that day.",
  },
  "formal vs informal": {
    wrong: "In a formal email, Hey, could you assist me?",
    fix: "In a formal email, Could you assist me?",
  },
  "contractions": {
    wrong: "I cant stay long.",
    fix: "I can't stay long.",
  },
  "polite softening": {
    wrong: "Close the door.",
    fix: "Could you close the door?",
  },
  "spoken vs written": {
    wrong: "In formal writing, I arrived lol.",
    fix: "In formal writing, I arrived.",
  },
  "professional style": {
    wrong: "Thanks for your time.",
    fix: "Thank you for your time.",
  },
  "casual style": {
    wrong: "Dear Sam, how is it going?",
    fix: "Hey, how is it going?",
  },
  "clarity and brevity": {
    wrong: "We need a quick answer at this point in time.",
    fix: "We need a quick answer.",
  },
  "opening and closing": {
    wrong: "Anyway, that is all for today.",
    fix: "Hi everyone, that is all for today.",
  },
  "topic shifts": {
    wrong: "By the way, about the schedule.",
    fix: "By the way, can we talk about the schedule?",
  },
  "cohesion tools": {
    wrong: "I bought a book, and book is useful.",
    fix: "I bought a book, and it is useful.",
  },
  "sequencing ideas": {
    wrong: "First we pack, first we leave.",
    fix: "First we pack, then we leave.",
  },
  "clarification moves": {
    wrong: "Do you mean?",
    fix: "Do you mean the morning meeting?",
  },
  "summaries": {
    wrong: "In short, need more time.",
    fix: "In short, we need more time.",
  },
  "emphasis and repetition": {
    wrong: "I really needs your answer today.",
    fix: "I really need your answer today.",
  },
  "conversation flow": {
    wrong: "I see continue.",
    fix: "I see, please continue.",
  },
  "giving examples": {
    wrong: "For example, call help desk.",
    fix: "For example, call the help desk.",
  },
  "repair and correction": {
    wrong: "I mean Tuesday, not Tuesday.",
    fix: "I mean Tuesday, not Monday.",
  },
};

const buildMistakeFromExample = (exampleItem) => {
  const fix = String(exampleItem?.expanded || "").trim();
  if (!fix) {
    return null;
  }
  const parts = parseGrammarExampleLabels(exampleItem?.labels);
  if (parts.length < 2) {
    return null;
  }
  const first = String(parts[0]?.phrase || "").trim();
  const second = String(parts[1]?.phrase || "").trim();
  if (!first || !second || normalizeGrammarTextKey(first) === normalizeGrammarTextKey(second)) {
    return null;
  }
  const firstAt = fix.indexOf(first);
  const secondAt = fix.indexOf(second, firstAt + first.length);
  if (firstAt < 0 || secondAt < 0) {
    return null;
  }
  const wrong =
    fix.slice(0, firstAt) +
    second +
    fix.slice(firstAt + first.length, secondAt) +
    first +
    fix.slice(secondAt + second.length);
  if (!wrong || normalizeGrammarTextKey(wrong) === normalizeGrammarTextKey(fix)) {
    return null;
  }
  return { wrong, fix };
};

const tokenizeGrammarSentence = (value) =>
  (String(value || "").match(/[\p{L}\p{N}]+/gu) || [])
    .map((token) => normalizeGrammarTextKey(token))
    .filter((token) => token.length >= 2);

const buildGrammarMistakeContext = (card, examples = []) => {
  const phrases = [];
  const push = (value) => {
    const normalized = normalizeGrammarTextKey(value);
    if (!normalized || normalized.length < 3) {
      return;
    }
    phrases.push(normalized);
  };

  push(card?.example);
  (Array.isArray(examples) ? examples : []).forEach((example) => {
    push(example?.expanded);
    push(example?.base);
    const labels = parseGrammarExampleLabels(example?.labels);
    labels.forEach((label) => {
      push(label?.phrase);
    });
  });

  const tokens = new Set();
  phrases.forEach((phrase) => {
    tokenizeGrammarSentence(phrase).forEach((token) => {
      tokens.add(token);
    });
  });

  return {
    phrases,
    tokens,
  };
};

// Keep mistake reasons anchored to the card concept, not side-topic errors.
const GRAMMAR_MISTAKE_TOPIC_CUES = {
  "basic word order": ["subject", "verb", "object", "reads", "book"],
  "sentence parts": ["subject", "verb", "object", "complement", "named", "captain"],
  "adding details": ["at noon", "at the station", "time", "place"],
  "linking clauses": ["because", "clause", "rained"],
  "sentence variety": ["punctuation", ".", ","],
  "action verbs": ["action", "carry", "boxes"],
  "state verbs": ["state", "knowing", "knows", "answer"],
  "linking verbs": ["linking", "feels", "quiet", "quietly"],
  "verb patterns": ["preposition", "on", "table", "placed"],
  "verb combinations": ["to", "infinitive", "decided", "stay"],
  "phrasal verbs": ["particle", "off", "turned", "light"],
  "present simple": ["every day", "works", "work"],
  "present continuous": ["am", "is", "are", "waiting", "verb-ing", "now"],
  "past simple": ["yesterday", "last", "ago", "went", "visited"],
  "past continuous": ["was", "were", "when", "cooking"],
  "present perfect": ["has", "have", "past participle", "finished", "already"],
  "past perfect": ["had", "past participle", "left", "before"],
  "future forms": ["will", "going to", "meeting", "future"],
  "future continuous": ["will be", "working", "verb-ing"],
  "future perfect": ["will have", "finished", "past participle", "by"],
  "aspect contrasts": ["simple", "continuous", "perfect", "worked", "work"],
  "countable nouns": ["countable", "a", "an", "number", "plural", "apple", "coin"],
  "uncountable nouns": ["uncountable", "some", "much", "little", "piece", "bread", "rice"],
  "articles": ["article", "a", "an", "the", "dog", "movie"],
  "plural forms": ["plural", "children", "child", "number", "three"],
  "possessive nouns": ["possessive", "apostrophe", "ownership", "teacher's", "teachers"],
  "noun phrases": ["noun phrase", "determiner", "adjective", "noun", "dress", "red"],
  "quantifiers": ["quantifier", "many", "much", "few", "little", "apples", "options"],
  "subject pronouns": ["subject pronoun", "i", "you", "he", "she", "it", "we", "they"],
  "object pronouns": ["object pronoun", "me", "him", "her", "it", "us", "them"],
  "possessive forms": ["possessive", "my", "your", "her", "his", "our", "their", "mine", "hers"],
  "reflexive pronouns": ["reflexive", "myself", "yourself", "himself", "herself", "ourselves", "themselves"],
  "demonstratives": ["demonstrative", "this", "that", "these", "those", "books", "keys"],
  "relative reference": ["relative", "who", "which", "that", "man", "called"],
  "indefinite reference": ["indefinite", "someone", "anyone", "something", "anything", "everyone"],
  "adjectives basics": ["adjective", "quiet", "house", "linking verb", "be"],
  "adjective order": ["adjective order", "opinion", "size", "color", "small", "red", "bag"],
  "comparatives": ["comparative", "faster", "more", "than", "compare"],
  "superlatives": ["superlative", "tallest", "most", "the", "group"],
  "adverbs basics": ["adverb", "clearly", "slowly", "-ly", "verb"],
  "frequency adverbs": ["frequency adverb", "always", "usually", "often", "sometimes", "never"],
  "time and place adverbs": ["time adverb", "place adverb", "here", "yesterday", "where", "when"],
  "degree words": ["degree", "very", "too", "enough", "warm", "hot"],
  "participles": ["participle", "-ing", "-ed", "boring", "bored", "feeling"],
  "modifier stacking": ["modifier", "very", "difficult", "question", "quickly", "order"],
  "yes no questions": ["question", "do", "does", "did", "subject", "base verb"],
  "wh questions": ["wh", "where", "what", "when", "why", "how", "auxiliary"],
  "questions with be": ["be question", "is", "are", "subject", "store", "open"],
  "questions with do": ["do question", "did", "does", "base verb", "call"],
  "questions with modals": ["modal question", "can", "could", "subject", "base verb"],
  "tag questions": ["tag question", "statement", "tag", "isn't", "aren't"],
  "indirect questions": ["indirect question", "could you tell me", "where it is", "word order"],
  "formal vs informal": ["formal", "informal", "register", "email", "assist", "hey"],
  "contractions": ["contraction", "apostrophe", "can't", "cant", "full form"],
  "polite softening": ["could", "would", "please", "request", "send"],
  "spoken vs written": ["formal writing", "written", "slang", "lol"],
  "professional style": ["professional", "hello", "polite", "could you", "request"],
  "casual style": ["casual", "friendly", "hey", "sam"],
  "clarity and brevity": ["clarity", "brevity", "short", "direct", "quick answer", "filler"],
  "opening and closing": ["opening", "closing", "hi", "everyone", "that is all for today"],
  "topic shifts": ["by the way", "topic", "schedule", "talk"],
  "cohesion tools": ["cohesion", "reference", "it", "this", "linker", "connect"],
  "sequencing ideas": ["sequence", "first", "then", "order"],
  "clarification moves": ["clarification", "do you mean", "mean", "meeting"],
  "summaries": ["summary", "in short", "to sum up", "main point"],
  "emphasis and repetition": ["emphasis", "repetition", "really", "do", "stress"],
  "conversation flow": ["conversation", "flow", "i see", "please continue", "turn"],
  "giving examples": ["for example", "for instance", "such as", "example"],
  "repair and correction": ["repair", "correction", "sorry", "i mean", "not monday"],
};

const isMistakeFocusedOnCardTopic = (entry, card) => {
  const title = String(card?.sourceTitle || card?.title || "").trim().toLowerCase();
  const cues = GRAMMAR_MISTAKE_TOPIC_CUES[title];
  if (!Array.isArray(cues) || cues.length === 0) {
    return true;
  }
  const wrong = normalizeGrammarTextKey(entry?.wrong || "");
  const fix = normalizeGrammarTextKey(entry?.fix || "");
  if (!wrong || !fix) {
    return false;
  }
  const combined = `${wrong} ${fix}`;
  return cues.some((cue) => combined.includes(normalizeGrammarTextKey(cue)));
};

const isTopicAlignedMistake = (entry, card, examples = []) => {
  const wrong = normalizeGrammarTextKey(entry?.wrong || "");
  const fix = normalizeGrammarTextKey(entry?.fix || "");
  const title = String(card?.sourceTitle || card?.title || "").trim().toLowerCase();
  const hasTopicCues = Array.isArray(GRAMMAR_MISTAKE_TOPIC_CUES[title]) &&
    GRAMMAR_MISTAKE_TOPIC_CUES[title].length > 0;
  if (!wrong || !fix) {
    return false;
  }
  if (!isMistakeFocusedOnCardTopic(entry, card)) {
    return false;
  }

  const context = buildGrammarMistakeContext(card, examples);
  if (context.phrases.some((phrase) => (wrong.includes(phrase) || fix.includes(phrase)))) {
    return true;
  }

  const fixTokens = tokenizeGrammarSentence(fix);
  if (!fixTokens.length || context.tokens.size === 0) {
    return false;
  }
  let overlap = 0;
  for (const token of fixTokens) {
    if (context.tokens.has(token)) {
      overlap += 1;
      if (overlap >= 2) {
        return true;
      }
    }
  }
  return hasTopicCues;
};

const buildGrammarMistakes = (card, examples = []) => {
  const unique = [];
  const seen = new Set();
  const sourceTitle = String(card?.sourceTitle || card?.title || "");
  const title = sourceTitle.toLowerCase();
  const curatedPair = GRAMMAR_MISTAKES[title];
  const pushMistake = (entry) => {
    const wrong = String(entry?.wrong || "").trim();
    const fix = String(entry?.fix || "").trim();
    if (!wrong || !fix) {
      return;
    }
    const key = `${normalizeGrammarTextKey(wrong)}|||${normalizeGrammarTextKey(fix)}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push({ wrong, fix });
  };

  if (Array.isArray(card.mistakes) && card.mistakes.length) {
    const firstCardMistake = card.mistakes[0];
    if (isTopicAlignedMistake(firstCardMistake, card, examples)) {
      pushMistake(firstCardMistake);
    }
  }

  if (curatedPair && isTopicAlignedMistake(curatedPair, card, examples)) {
    pushMistake(curatedPair);
  }

  const generatedMistakes = (Array.isArray(examples) ? examples : [])
    .map((item) => buildMistakeFromExample(item))
    .filter(Boolean);

  generatedMistakes.forEach((generated) => {
    pushMistake(generated);
  });

  if (unique.length === 0 && curatedPair && isTopicAlignedMistake(curatedPair, card, examples)) {
    pushMistake(curatedPair);
  }

  if (unique.length === 0) {
    pushMistake({
      wrong: "She not explain well.",
      fix: "She did not explain well.",
    });
  }

  return unique.slice(0, 2);
};

const getGrammarUiLabels = () => ({
  grammar: "Grammar",
  chooseSection: "Choose a section",
  allSections: "All sections",
  rules: "Rules",
  rule: "Rule:",
  examples: "Examples",
  commonMistakes: "Common mistakes",
  wrong: "Wrong:",
  fix: "Fix:",
  phrase: "Sentence:",
  order: "Order:",
});

const getWordsUiLabels = () => ({
  words: "Words",
  chooseSection: "Choose a section",
  allSections: "All sections",
});

const getPhrasesUiLabels = () => ({
  phrases: "Phrases",
  chooseSection: "Choose a section",
  allSections: "All sections",
});

/* ==========================================================================
   GRAMMAR MODAL OVERLAY
   Lazy-creates and refreshes the grammar deep-dive modal on grammar pages.
   ========================================================================== */
const ensureGrammarOverlay = () => {
  let overlay = document.getElementById("grammarOverlay");
  const needsRebuild =
    !overlay ||
    !overlay.querySelector(".grammar-modal") ||
    !overlay.querySelector(".grammar-modal-body");
  if (needsRebuild) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "grammar-overlay";
      overlay.id = "grammarOverlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="grammar-modal" role="dialog" aria-modal="true" aria-live="polite">
        <button class="grammar-close" type="button" aria-label="Close">&times;</button>
        <div class="grammar-modal-body"></div>
      </div>
    `;
  }
  return overlay;
};
const renderGrammarModal = (section, index) => {
  const overlay = ensureGrammarOverlay();
  if (!overlay) {
    return;
  }
  const modalBody = overlay.querySelector(".grammar-modal-body");
  if (!modalBody) {
    return;
  }
  overlay.dataset.section = section || "";
  overlay.dataset.index = String(index ?? "0");
  const cardData = getGrammarCardData(section, index);
  if (!cardData) {
    modalBody.innerHTML = "";
    overlay.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    return;
  }

  const isRtlWorld = WORLD_KEY === "arabic";
  const rtlAttr = isRtlWorld ? ' dir="rtl"' : "";

  const grammarTranslationLanguage = readMapsBaseLanguagePreference();
  const shouldTranslateExplanation =
    !!grammarTranslationLanguage &&
    !isWorldNativeBaseLanguage(grammarTranslationLanguage);
  const explanation =
    String(cardData?.explanation || "").trim() || buildGrammarExplanation(cardData);
  const explanationTranslation = shouldTranslateExplanation
    ? resolveGrammarExplanation(section, explanation, grammarTranslationLanguage)
    : "";
  const grammarUi = getGrammarUiLabels();
  const howItWorks = buildGrammarHowItWorks(cardData);
  const rulesBullets = Array.isArray(howItWorks?.bullets)
    ? howItWorks.bullets
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    : [];
  const encodedRuleTemplate = howItWorks.template
    ? encodeURIComponent(String(howItWorks.template || "").trim())
    : "";
  const renderedRuleBullets = rulesBullets
    .map((item) => {
      const translated = shouldTranslateExplanation
        ? resolveGrammarExplanation(section, item, grammarTranslationLanguage)
        : "";
      const displayText = shouldTranslateExplanation ? translated || "..." : item;
      const sourceAttr = shouldTranslateExplanation
        ? ` data-grammar-rule-source="${encodeURIComponent(item)}"`
        : "";
      return `<li${sourceAttr}><span class="grammar-rule-prefix">${grammarUi.rule}</span> ${displayText}</li>`;
    })
    .join("");
  const renderedRuleTemplate = howItWorks.template
    ? (() => {
        const translated = shouldTranslateExplanation
          ? resolveGrammarExplanation(
              section,
              String(howItWorks.template || "").trim(),
              grammarTranslationLanguage
            )
          : "";
        const displayText = shouldTranslateExplanation
          ? translated || "..."
          : String(howItWorks.template || "").trim();
        const sourceAttr =
          shouldTranslateExplanation && encodedRuleTemplate
            ? ` data-grammar-template-source="${encodedRuleTemplate}"`
            : "";
        return `<div class="grammar-template"${rtlAttr}${sourceAttr}>${displayText}</div>`;
      })()
    : "";
  const shouldCapPhrase = true;

  const shouldUseTemplateExamples = WORLD_KEY === "english";
  const structureExamples =
    shouldUseTemplateExamples && section === "Sentence Structure"
      ? buildStructureExamples(cardData)
      : null;
  const verbExamples =
    shouldUseTemplateExamples && section === "Verbs" ? buildVerbExamples(cardData) : null;
  const tenseExamples =
    shouldUseTemplateExamples && section === "Tenses & Aspect"
      ? buildTenseExamples(cardData)
      : null;
  const nounExamples =
    shouldUseTemplateExamples && section === "Nouns & Articles"
      ? buildNounExamples(cardData)
      : null;
  const pronounExamples =
    shouldUseTemplateExamples && section === "Pronouns & Reference"
      ? buildPronounExamples(cardData)
      : null;
  const modifierExamples =
    shouldUseTemplateExamples && section === "Modifiers"
      ? buildModifierExamples(cardData)
      : null;
  const questionExamples =
    shouldUseTemplateExamples && section === "Questions"
      ? buildQuestionExamples(cardData)
      : null;
  const negationExamples =
    shouldUseTemplateExamples && section === "Negation"
      ? buildNegationExamples(cardData)
      : null;
  const connectionExamples =
    shouldUseTemplateExamples && section === "Connections"
      ? buildConnectionExamples(cardData)
      : null;
  const conditionExamples =
    shouldUseTemplateExamples && section === "Conditions"
      ? buildConditionExamples(cardData)
      : null;
  const voiceExamples =
    shouldUseTemplateExamples && section === "Voice & Focus"
      ? buildVoiceExamples(cardData)
      : null;
  const modalityExamples =
    shouldUseTemplateExamples && section === "Modality"
      ? buildModalityExamples(cardData)
      : null;
  const reportedSpeechExamples =
    shouldUseTemplateExamples && section === "Reported Speech"
      ? buildReportedSpeechExamples(cardData)
      : null;
  const formalityExamples =
    shouldUseTemplateExamples && section === "Formality & Style"
      ? buildFormalityExamples(cardData)
      : null;
  const discourseExamples =
    shouldUseTemplateExamples && section === "Discourse & Flow"
      ? buildDiscourseExamples(cardData)
      : null;
  const activeExamples =
    structureExamples ||
    verbExamples ||
    tenseExamples ||
    nounExamples ||
    pronounExamples ||
    modifierExamples ||
    questionExamples ||
    negationExamples ||
    connectionExamples ||
    conditionExamples ||
    voiceExamples ||
    modalityExamples ||
    reportedSpeechExamples ||
    formalityExamples ||
    discourseExamples;
  const rawExamples = activeExamples || buildGenericExamplePairs(cardData, index, section);
  const exampleItems = ensureTwoGrammarExamples(rawExamples, cardData, section, index);
  const limitedExamples = exampleItems.slice(0, 1);
  const mistakes = buildGrammarMistakes(cardData, exampleItems);
  const limitedMistakes = mistakes.slice(0, 1);
  const renderedExamples = limitedExamples
    .map((item) => {
      const isRtlExample = WORLD_KEY === "arabic";
      const labels = Array.isArray(item?.labels) ? item.labels : [];
      const expandedText =
        shouldCapPhrase && item.expanded
          ? item.expanded.charAt(0).toUpperCase() + item.expanded.slice(1)
          : item.expanded;
      let exampleTranslation = "";
      if (shouldTranslateExplanation) {
        const baseTranslation = resolveGrammarTranslation(
          section,
          item.base,
          grammarTranslationLanguage
        );
        const expandedTranslation = resolveGrammarTranslation(
          section,
          item.expanded,
          grammarTranslationLanguage
        );
        exampleTranslation = expandedTranslation || baseTranslation;
      }
      const highlightedExampleText = applyGrammarHighlights(expandedText, labels, {
        colorByOrder: !!item.colorByOrder,
      });
      const renderedExampleLine = isRtlExample
        ? `<div class="grammar-example-expanded" dir="ltr"><span class="grammar-example-prefix" dir="ltr">${grammarUi.phrase}</span> <span class="grammar-example-content" dir="rtl">${highlightedExampleText}</span></div>`
        : `<div class="grammar-example-expanded">${grammarUi.phrase} ${highlightedExampleText}</div>`;
      return `
        <div class="grammar-example"${isRtlExample ? ' dir="rtl"' : ""}>
          ${item.variantLabel ? `<div class="grammar-example-variant">${formatExampleVariantLabel(item.variantLabel)}</div>` : ""}
          <div class="grammar-example-labels"${isRtlExample ? ' dir="rtl"' : ""}>
            ${labels
                .map(
                  (label, labelIndex) =>
                    `<span class="grammar-label ${getExampleLabelClass(label, labelIndex, { colorByOrder: !!item.colorByOrder })}">${formatGrammarChipLabel(localizeGrammarChipLabel(getExampleLabelText(label)))}</span>`
                )
                .join("")}
          </div>
          ${renderedExampleLine}
          ${exampleTranslation ? `<div class="grammar-translation">${exampleTranslation}</div>` : ""}
        </div>
      `;
    })
    .join("");

  modalBody.innerHTML = `
    <div class="grammar-modal-header"${rtlAttr}>
      <h3>${cardData.title}</h3>
      <p class="grammar-explanation-text">${explanation}</p>
      ${shouldTranslateExplanation && explanationTranslation ? `<p class="grammar-translation grammar-explanation-translation">${explanationTranslation}</p>` : ""}
    </div>
    <div class="grammar-modal-grid">
      <div class="grammar-block"${rtlAttr}>
        <h4>${grammarUi.rules}</h4>
        <ul>
          ${renderedRuleBullets}
        </ul>
        ${renderedRuleTemplate}
      </div>
      <div class="grammar-block"${rtlAttr}>
        <h4>${grammarUi.examples}</h4>
        ${renderedExamples}
      </div>
      <div class="grammar-block"${rtlAttr}>
        <h4>${grammarUi.commonMistakes}</h4>
        <div class="grammar-mistake-list">
          ${limitedMistakes
            .map(
              (mistake) =>
                `<div class="grammar-example grammar-mistake"${isRtlWorld ? ' dir="rtl"' : ""}>
                  <div class="grammar-mistake-line"><span class="mistake-wrong">${grammarUi.wrong}</span> ${mistake.wrong}</div>
                  <div class="grammar-mistake-line"><span class="mistake-fix">${grammarUi.fix}</span> ${mistake.fix}</div>
                </div>`
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
  modalBody.scrollTop = 0;
  overlay.querySelector(".grammar-modal")?.scrollTo(0, 0);

  if (shouldTranslateExplanation && !explanationTranslation) {
    void requestRuntimeGrammarExplanationTranslation(
      section,
      explanation,
      grammarTranslationLanguage
    ).then((translated) => {
      const expectedSection = String(section || "");
      const expectedIndex = String(index ?? "0");
      if (
        overlay.dataset.section !== expectedSection ||
        overlay.dataset.index !== expectedIndex
      ) {
        return;
      }
      const activeBody = overlay.querySelector(".grammar-modal-body");
      const header = activeBody?.querySelector(".grammar-modal-header");
      const translationNode = header?.querySelector(
        ".grammar-explanation-translation"
      );
      if (!translated) {
        return;
      }
      if (!header) {
        return;
      }
      const explanationNode = header.querySelector(".grammar-explanation-text");
      let liveTranslationNode = header.querySelector(
        ".grammar-explanation-translation"
      );
      if (!liveTranslationNode) {
        liveTranslationNode = document.createElement("p");
        liveTranslationNode.className =
          "grammar-translation grammar-explanation-translation";
        if (explanationNode) {
          explanationNode.insertAdjacentElement("afterend", liveTranslationNode);
        } else {
          header.appendChild(liveTranslationNode);
        }
      }
      liveTranslationNode.textContent = translated;
    });
  }

  if (shouldTranslateExplanation) {
    modalBody
      .querySelectorAll("[data-grammar-rule-source]")
      .forEach((node) => {
        const sourceText = decodeURIComponent(
          String(node.getAttribute("data-grammar-rule-source") || "").trim()
        );
        if (!sourceText) {
          return;
        }
        void requestRuntimeGrammarExplanationTranslation(
          section,
          sourceText,
          grammarTranslationLanguage
        ).then((translated) => {
          const expectedSection = String(section || "");
          const expectedIndex = String(index ?? "0");
          if (
            overlay.dataset.section !== expectedSection ||
            overlay.dataset.index !== expectedIndex ||
            !translated
          ) {
            return;
          }
          node.textContent = translated;
        });
      });

    const templateNode = modalBody.querySelector("[data-grammar-template-source]");
    const templateSource = decodeURIComponent(
      String(templateNode?.getAttribute("data-grammar-template-source") || "").trim()
    );
    if (templateNode && templateSource) {
      void requestRuntimeGrammarExplanationTranslation(
        section,
        templateSource,
        grammarTranslationLanguage
      ).then((translated) => {
        const expectedSection = String(section || "");
        const expectedIndex = String(index ?? "0");
        if (
          overlay.dataset.section !== expectedSection ||
          overlay.dataset.index !== expectedIndex ||
          !translated
        ) {
          return;
        }
        templateNode.textContent = translated;
      });
    }
  }
};


const openGrammarModal = (section, index) => {
  if (isGrammarWorldUnderExpertReview()) {
    return;
  }
  if (isGrammarSectionLockedForCurrentAccess(section)) {
    openGrammarPremiumUpgrade({
      message: "Upgrade to Premium to open full grammar card explanations.",
    });
    return;
  }
  const overlay = ensureGrammarOverlay();
  if (!overlay) {
    return;
  }
  if (section) {
    trackMapSectionEvent("grammar", section, "reviewed", 86);
  }

  const showModal = () => {
    renderGrammarModal(section, index);
    overlay.classList.add("is-visible");
    document.body.classList.add("modal-open");
    lockModalScroll();
    const modal = overlay.querySelector(".grammar-modal");
    const modalBody = overlay.querySelector(".grammar-modal-body");
    if (modal) {
      modal.scrollTop = 0;
    }
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
    overlay.querySelector(".grammar-modal")?.focus?.();
  };

  showModal();
};

let modalScrollLockY = 0;
const lockModalScroll = () => {
  if (document.body.style.position === "fixed") {
    return;
  }
  modalScrollLockY = window.scrollY || 0;
  document.body.style.position = "fixed";
  document.body.style.top = `-${modalScrollLockY}px`;
  document.body.style.width = "100%";
};

const unlockModalScroll = () => {
  if (document.body.style.position !== "fixed") {
    return;
  }
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, modalScrollLockY || 0);
};
let grammarModalListenersBound = false;
const setupGrammarModal = () => {
  const hasGrammarPage = document.body.classList.contains("grammar-page");
  const hasGrammarCards = !!document.querySelector(".grammar-card");
  if (!hasGrammarPage && !hasGrammarCards) {
    return;
  }
  const overlay = ensureGrammarOverlay();
  const modal = overlay.querySelector(".grammar-modal");
  const closeBtn = overlay.querySelector(".grammar-close");

  overlay.__refresh = () => {
    if (!overlay.classList.contains("is-visible")) {
      return;
    }
    const section = overlay.dataset.section || "";
    const index = Number(overlay.dataset.index || "0");
    renderGrammarModal(section, index);
  };
  if (grammarModalListenersBound) {
    return;
  }
  grammarModalListenersBound = true;

  const closeModal = () => {
    overlay.classList.remove("is-visible");
    document.body.classList.remove("modal-open");
    unlockModalScroll();
  };

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-visible")) {
      closeModal();
    }
  });
  document.addEventListener("click", (event) => {
    const card = event.target.closest(".grammar-card");
    if (!card) {
      return;
    }
    if (
      card.dataset.premiumLocked === "true" ||
      isGrammarSectionLockedForCurrentAccess(card.dataset.section)
    ) {
      event.preventDefault();
      openGrammarPremiumUpgrade({
        message: "Upgrade to Premium to open full grammar card explanations.",
      });
      return;
    }
    if (isRecentTouchActivation(card)) {
      return;
    }
    const section = card.dataset.section;
    const index = Number(card.dataset.index);
    openGrammarModal(section, index);
  });
  document.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") {
      return;
    }
    const card = event.target.closest(".grammar-card");
    if (!card) {
      return;
    }
    event.preventDefault();
    markTouchActivation(card);
    if (
      card.dataset.premiumLocked === "true" ||
      isGrammarSectionLockedForCurrentAccess(card.dataset.section)
    ) {
      openGrammarPremiumUpgrade({
        message: "Upgrade to Premium to open full grammar card explanations.",
      });
      return;
    }
    const section = card.dataset.section;
    const index = Number(card.dataset.index);
    openGrammarModal(section, index);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const card = event.target?.closest?.(".grammar-card");
    if (!card) {
      return;
    }
    event.preventDefault();
    if (
      card.dataset.premiumLocked === "true" ||
      isGrammarSectionLockedForCurrentAccess(card.dataset.section)
    ) {
      openGrammarPremiumUpgrade({
        message: "Upgrade to Premium to open full grammar card explanations.",
      });
      return;
    }
    const section = card.dataset.section;
    const index = Number(card.dataset.index);
    openGrammarModal(section, index);
  });
};

const hydrateBaseTranslationsPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }
  hydrateTranslations(WORD_TRANSLATIONS, payload.words);
  hydrateTranslations(PHRASE_TRANSLATIONS, payload.phrases);
  hydrateTranslations(GRAMMAR_TRANSLATIONS, payload.grammar);
  if (needsGrammarDetails && (payload?.grammar?.explanations || payload?.grammarExplanations)) {
    hydrateGrammarExplanationTranslations(payload);
  }
};

const hydrateMapsWorldTranslationsPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }
  const packWorldLanguage = String(payload?.worldLanguage || "")
    .trim()
    .toLowerCase();
  if (!packWorldLanguage || packWorldLanguage !== WORLD_KEY) {
    return;
  }
  WORLD_TRANSLATIONS = payload;
  if (needsGrammarDetails) {
    buildWorldGrammarMaps();
    hydrateGrammarExplanationTranslations(payload);
  }
};

const readMapsBundleTranslationsCache = () => {
  try {
    const raw = localStorage.getItem(MAPS_BUNDLE_TRANSLATIONS_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    if (!Number.isFinite(savedAt) || savedAt <= 0) {
      return null;
    }
    if (Date.now() - savedAt > MAPS_BUNDLE_TRANSLATIONS_CACHE_MAX_AGE_MS) {
      return null;
    }
    const payload = parsed?.payload;
    if (!payload || typeof payload !== "object") {
      return null;
    }
    if (!payload.words && !payload.phrases && !payload.grammar) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const readMapsWorldTranslationsCache = () => {
  if (!isNonEnglishWorld) {
    return null;
  }
  try {
    const raw = localStorage.getItem(buildMapsWorldTranslationsCacheKey(WORLD_KEY));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    const savedAt = Number(parsed?.savedAt || 0);
    if (!Number.isFinite(savedAt) || savedAt <= 0) {
      return null;
    }
    if (Date.now() - savedAt > MAPS_WORLD_TRANSLATIONS_CACHE_MAX_AGE_MS) {
      return null;
    }
    const payload = parsed?.payload;
    const packWorldLanguage = String(payload?.worldLanguage || "")
      .trim()
      .toLowerCase();
    if (!payload || typeof payload !== "object") {
      return null;
    }
    if (!payload.words || !payload.phrases) {
      return null;
    }
    if (!packWorldLanguage || packWorldLanguage !== WORLD_KEY) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const writeMapsBundleTranslationsCache = (payload) => {
  if (!payload || typeof payload !== "object") {
    return;
  }
  if (!payload.words && !payload.phrases && !payload.grammar) {
    return;
  }
  try {
    localStorage.setItem(
      MAPS_BUNDLE_TRANSLATIONS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        payload,
      })
    );
  } catch {}
};

const writeMapsWorldTranslationsCache = (payload) => {
  if (!isNonEnglishWorld || !payload || typeof payload !== "object") {
    return;
  }
  const packWorldLanguage = String(payload?.worldLanguage || "")
    .trim()
    .toLowerCase();
  if (!packWorldLanguage || packWorldLanguage !== WORLD_KEY) {
    return;
  }
  if (!payload.words || !payload.phrases) {
    return;
  }
  try {
    localStorage.setItem(
      buildMapsWorldTranslationsCacheKey(packWorldLanguage),
      JSON.stringify({
        savedAt: Date.now(),
        payload,
      })
    );
  } catch {}
};

const normalizeWordLookupKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019`]/g, "'")
    .replace(/Ã¢â‚¬â„¢|Ã¢â‚¬Ëœ/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const WORD_TRANSLATION_ALIASES = {
  fiance: "fianc\u00e9",
  fiancee: "fianc\u00e9e",
  "cote d'ivoire": "c\u00f4te d\u2019ivoire",
};

const resolveEntryByNormalizedKey = (entries, rawValue) => {
  if (!entries || typeof entries !== "object") {
    return null;
  }
  const target = normalizeWordLookupKey(rawValue);
  if (!target) {
    return null;
  }
  for (const [key, value] of Object.entries(entries)) {
    if (normalizeWordLookupKey(key) === target) {
      return value || null;
    }
  }
  return null;
};

const resolveWorldWordEntry = (sectionKey, word) => {
  const worldSection = WORLD_TRANSLATIONS?.words?.[sectionKey] || {};
  return (
    worldSection?.[String(word || "").toLowerCase()] ||
    resolveEntryByNormalizedKey(worldSection, word)
  );
};

const isWorldNativeBaseLanguage = (baseLanguage) =>
  String(baseLanguage || "").trim().toLowerCase() === WORLD_KEY;

const resolveWordRomanization = (section, worldWord) => {
  if (!shouldDisplayCardRomanization()) {
    return "";
  }
  const sectionKey = section || WORD_SECTION_ORDER[0];
  const worldEntry = resolveWorldWordEntry(sectionKey, worldWord);
  return String(worldEntry?.romanization || "").trim();
};

const resolveWordRegister = (section, worldWord) => {
  const sectionKey = section || WORD_SECTION_ORDER[0];
  const worldEntry = resolveWorldWordEntry(sectionKey, worldWord);
  return resolveCardRegister(worldEntry?.register, worldWord);
};

const resolveWordTranslation = (section, englishWord, baseLanguage) => {
  if (!baseLanguage || !translationPayloadReady) {
    return "";
  }
  if (isWorldNativeBaseLanguage(baseLanguage)) {
    return "";
  }
  const sectionKey = section || WORD_SECTION_ORDER[0];
  const wordKey = (englishWord || "").toLowerCase();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const aliasSource =
    WORD_TRANSLATION_ALIASES[normalizeWordLookupKey(englishWord)] || "";
  let translation = "";

  const worldSection = WORLD_TRANSLATIONS?.words?.[sectionKey] || {};
  const worldEntry = resolveWorldWordEntry(sectionKey, englishWord);
  const worldAliasEntry = aliasSource
    ? worldSection?.[aliasSource.toLowerCase()] ||
      resolveEntryByNormalizedKey(worldSection, aliasSource)
    : null;
  const worldSourceWord = String(
    worldEntry?.source || worldAliasEntry?.source || ""
  ).trim();
  if (worldEntry && worldEntry.translations) {
    translation = worldEntry.translations?.[langKey] || "";
  }
  if (!translation && worldAliasEntry && worldAliasEntry.translations) {
    translation = worldAliasEntry.translations?.[langKey] || "";
  }
  if (!translation && langKey === "english" && worldSourceWord) {
    translation = worldSourceWord;
  }
  if (!translation && worldSourceWord) {
    const sectionEntries = WORD_TRANSLATIONS?.[sectionKey] || {};
    const sourceEntry =
      sectionEntries?.[worldSourceWord.toLowerCase()] ||
      resolveEntryByNormalizedKey(sectionEntries, worldSourceWord);
    translation = sourceEntry?.[langKey] || "";
  }

  if (!translation) {
    const sectionEntries = WORD_TRANSLATIONS?.[sectionKey] || {};
    const sectionEntry =
      sectionEntries?.[wordKey] || resolveEntryByNormalizedKey(sectionEntries, englishWord);
    const aliasEntry = aliasSource
      ? sectionEntries?.[aliasSource.toLowerCase()] ||
        resolveEntryByNormalizedKey(sectionEntries, aliasSource)
      : null;
    translation = sectionEntry?.[langKey] || "";
    if (!translation) {
      translation = aliasEntry?.[langKey] || "";
    }
  }
  if (!translation) {
    translation = getRuntimePhraseTranslation(sectionKey, englishWord, langKey);
  }
  if (!translation) {
    if (englishWord && baseLanguage) {
      console.warn(
        `Missing translation: section="${sectionKey}", word="${englishWord}", language="${baseLanguage}"`
      );
    }
    return "";
  }
  return translation;
};

const applyWordTranslations = () => {
  const baseLanguage = readMapsBaseLanguagePreference();
  document.querySelectorAll(".word-card").forEach((card) => {
    const word = card.dataset.word || card.querySelector(".word")?.textContent?.trim() || "";
    const section = card.closest("[data-section]")?.dataset.section || "Core words";
    let translationEl = card.querySelector(".word-translation");
    if (!translationEl) {
      translationEl = document.createElement("div");
      translationEl.className = "word-translation";
      const audioEl = card.querySelector(".word-audio");
      card.insertBefore(translationEl, audioEl || null);
    }
    let romanizationEl = card.querySelector(".word-romanization");
    if (!romanizationEl) {
      romanizationEl = document.createElement("div");
      romanizationEl.className = "word-romanization";
      romanizationEl.setAttribute("lang", "en");
      romanizationEl.setAttribute("dir", "ltr");
      card.insertBefore(romanizationEl, translationEl);
    }
    const romanization = resolveWordRomanization(section, word);
    const register = resolveWordRegister(section, word);
    applyCardRegisterBadge(card, register);
    romanizationEl.textContent = romanization;
    romanizationEl.hidden = !romanization;
    const resolved = resolveWordTranslation(section, word, baseLanguage);
    translationEl.textContent = resolved;
    if (!resolved && baseLanguage && !isWorldNativeBaseLanguage(baseLanguage)) {
      requestRuntimePhraseTranslation(section, word, baseLanguage).then((translated) => {
        if (!translated) {
          return;
        }
        const currentWord = card.dataset.word || card.querySelector(".word")?.textContent?.trim() || "";
        if (currentWord !== word) {
          return;
        }
        if (translationEl) {
          translationEl.textContent = translated;
        }
      });
    }
  });
};

const PHRASE_RUNTIME_TRANSLATION_CACHE_KEY = "cosmicaRuntimePhraseTranslationCache:v1";
const runtimePhraseTranslationCache = new Map();
const runtimePhraseTranslationRequests = new Map();

const persistRuntimePhraseTranslationCache = () => {
  try {
    localStorage.setItem(
      PHRASE_RUNTIME_TRANSLATION_CACHE_KEY,
      JSON.stringify(Object.fromEntries(runtimePhraseTranslationCache))
    );
  } catch {}
};

const loadRuntimePhraseTranslationCache = () => {
  try {
    const raw = localStorage.getItem(PHRASE_RUNTIME_TRANSLATION_CACHE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        runtimePhraseTranslationCache.set(key, value.trim());
      }
    });
  } catch {}
};

loadRuntimePhraseTranslationCache();

const buildRuntimePhraseCacheKey = (section, phrase, baseLanguage) => {
  const sectionKey = String(section || PHRASE_SECTION_ORDER[0]).trim();
  const phraseKey = normalizeWordLookupKey(phrase);
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  return `${WORLD_KEY}|${sectionKey}|${langKey}|${phraseKey}`;
};

const cacheRuntimePhraseTranslation = (section, phrase, baseLanguage, translation) => {
  const cacheKey = buildRuntimePhraseCacheKey(section, phrase, baseLanguage);
  if (!cacheKey || !translation) {
    return;
  }
  runtimePhraseTranslationCache.set(cacheKey, String(translation).trim());
  persistRuntimePhraseTranslationCache();
};

const getRuntimePhraseTranslation = (section, phrase, baseLanguage) => {
  const cacheKey = buildRuntimePhraseCacheKey(section, phrase, baseLanguage);
  const value = runtimePhraseTranslationCache.get(cacheKey);
  return typeof value === "string" ? value : "";
};

const buildTranslateEndpointCandidates = () => {
  const candidates = [];
  const addCandidate = (url) => {
    const normalized = String(url || "").trim();
    if (!normalized || candidates.includes(normalized)) {
      return;
    }
    candidates.push(normalized);
  };
  addCandidate("/api/translate");
  if (typeof getApiEndpointCandidates === "function") {
    const sharedCandidates = getApiEndpointCandidates();
    if (Array.isArray(sharedCandidates)) {
      sharedCandidates.forEach((candidate) =>
        addCandidate(
          String(candidate || "").replace(/\/api\/chat(?=$|[?#])/i, "/api/translate")
        )
      );
    }
  }
  return candidates;
};

const SECTION_TITLE_RUNTIME_TRANSLATION_CACHE_KEY =
  "cosmicaRuntimeSectionTitleTranslationCache:v1";
const runtimeSectionTitleTranslationCache = new Map();
const runtimeSectionTitleTranslationRequests = new Map();

const persistRuntimeSectionTitleTranslationCache = () => {
  try {
    localStorage.setItem(
      SECTION_TITLE_RUNTIME_TRANSLATION_CACHE_KEY,
      JSON.stringify(Object.fromEntries(runtimeSectionTitleTranslationCache))
    );
  } catch {}
};

const loadRuntimeSectionTitleTranslationCache = () => {
  try {
    const raw = localStorage.getItem(SECTION_TITLE_RUNTIME_TRANSLATION_CACHE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        runtimeSectionTitleTranslationCache.set(key, value.trim());
      }
    });
  } catch {}
};

loadRuntimeSectionTitleTranslationCache();

const buildRuntimeSectionTitleCacheKey = (mapType, sectionTitle, baseLanguage) => {
  const mapKey = String(mapType || "").trim().toLowerCase();
  const titleKey = normalizeWordLookupKey(sectionTitle);
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  return `${WORLD_KEY}|${mapKey}|${langKey}|${titleKey}`;
};

const isInvalidRuntimeTitleTranslation = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return true;
  }
  if (/^\?+(?:\s+\?+)*$/.test(text)) {
    return true;
  }
  const lower = text.toLowerCase();
  if (
    lower.includes("appears to be in a different language") ||
    lower.includes("does not translate directly into english") ||
    lower.includes("please provide a clear text for translation")
  ) {
    return true;
  }
  if (
    text.startsWith("[") &&
    text.endsWith("]") &&
    (lower.includes("translation") || lower.includes("text appears"))
  ) {
    return true;
  }
  return false;
};

const cacheRuntimeSectionTitleTranslation = (
  mapType,
  sectionTitle,
  baseLanguage,
  translation
) => {
  const cacheKey = buildRuntimeSectionTitleCacheKey(mapType, sectionTitle, baseLanguage);
  const text = String(translation || "").trim();
  if (!cacheKey || !text || isInvalidRuntimeTitleTranslation(text)) {
    return;
  }
  runtimeSectionTitleTranslationCache.set(cacheKey, text);
  persistRuntimeSectionTitleTranslationCache();
};

const getRuntimeSectionTitleTranslation = (mapType, sectionTitle, baseLanguage) => {
  const cacheKey = buildRuntimeSectionTitleCacheKey(mapType, sectionTitle, baseLanguage);
  const value = runtimeSectionTitleTranslationCache.get(cacheKey);
  if (typeof value !== "string") {
    return "";
  }
  const text = value.trim();
  if (!text || isInvalidRuntimeTitleTranslation(text)) {
    runtimeSectionTitleTranslationCache.delete(cacheKey);
    persistRuntimeSectionTitleTranslationCache();
    return "";
  }
  return text;
};

const requestRuntimeSectionTitleTranslation = async (mapType, sectionTitleText, baseLanguage) => {
  const mapKey = String(mapType || "").trim().toLowerCase();
  const sectionTitle = String(sectionTitleText || "").trim();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  if (
    !mapKey ||
    !["words", "phrases", "grammar"].includes(mapKey) ||
    !sectionTitle ||
    !langKey
  ) {
    return "";
  }

  const cacheKey = buildRuntimeSectionTitleCacheKey(mapKey, sectionTitle, langKey);
  const cached = runtimeSectionTitleTranslationCache.get(cacheKey);
  if (typeof cached === "string" && cached.trim()) {
    return cached.trim();
  }
  const pending = runtimeSectionTitleTranslationRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const endpointCandidates = buildTranslateEndpointCandidates();
  const createAbortController = () => {
    if (typeof AbortController === "undefined") {
      return null;
    }
    return new AbortController();
  };

  const translateOnce = async (endpoint) => {
    const controller = createAbortController();
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), 10000)
      : null;
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sectionTitle,
          targetLanguage: langKey,
        }),
        cache: "no-store",
        credentials: "same-origin",
      };
      if (controller) {
        options.signal = controller.signal;
      }
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`Section title translation failed with status ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      const translated = String(data?.translation || data?.content || "")
        .replace(/^["'`]|["'`]$/g, "")
        .trim();
      if (!translated || isInvalidRuntimeTitleTranslation(translated)) {
        throw new Error("Empty section title translation response");
      }
      cacheRuntimeSectionTitleTranslation(mapKey, sectionTitle, langKey, translated);
      return translated;
    } finally {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    }
  };

  const request = (async () => {
    try {
      const attempts = navigator.onLine ? 2 : 1;
      for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex += 1) {
        for (let i = 0; i < endpointCandidates.length; i += 1) {
          try {
            return await translateOnce(endpointCandidates[i]);
          } catch {}
        }
        if (attemptIndex < attempts - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 300));
        }
      }
      return "";
    } finally {
      runtimeSectionTitleTranslationRequests.delete(cacheKey);
    }
  })();

  runtimeSectionTitleTranslationRequests.set(cacheKey, request);
  return request;
};

const PREVIEW_UI_TRANSLATION_CACHE_KEY = "cosmicaPreviewUiTranslationCache:v1";
const previewUiTranslationCache = new Map();
const previewUiTranslationRequests = new Map();

const persistPreviewUiTranslationCache = () => {
  try {
    localStorage.setItem(
      PREVIEW_UI_TRANSLATION_CACHE_KEY,
      JSON.stringify(Object.fromEntries(previewUiTranslationCache))
    );
  } catch {}
};

const loadPreviewUiTranslationCache = () => {
  try {
    const raw = localStorage.getItem(PREVIEW_UI_TRANSLATION_CACHE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim()) {
        previewUiTranslationCache.set(key, value.trim());
      }
    });
  } catch {}
};

loadPreviewUiTranslationCache();

const buildPreviewUiCacheKey = (sourceText, baseLanguage) => {
  const textKey = normalizeWordLookupKey(sourceText);
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  return `${WORLD_KEY}|preview-ui|${langKey}|${textKey}`;
};

const getPreviewUiTranslation = (sourceText, baseLanguage) => {
  const cacheKey = buildPreviewUiCacheKey(sourceText, baseLanguage);
  const value = previewUiTranslationCache.get(cacheKey);
  return typeof value === "string" ? value.trim() : "";
};

const cachePreviewUiTranslation = (sourceText, baseLanguage, translation) => {
  const cacheKey = buildPreviewUiCacheKey(sourceText, baseLanguage);
  const text = String(translation || "").trim();
  if (!cacheKey || !text || isInvalidRuntimeTitleTranslation(text)) {
    return;
  }
  previewUiTranslationCache.set(cacheKey, text);
  persistPreviewUiTranslationCache();
};

const requestPreviewUiTranslation = async (sourceText, baseLanguage) => {
  const text = String(sourceText || "").trim();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  if (!text || !langKey || langKey === "english") {
    return text;
  }

  const cacheKey = buildPreviewUiCacheKey(text, langKey);
  const cached = previewUiTranslationCache.get(cacheKey);
  if (typeof cached === "string" && cached.trim()) {
    return cached.trim();
  }
  const pending = previewUiTranslationRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const endpointCandidates = buildTranslateEndpointCandidates();
  const request = (async () => {
    try {
      for (const endpoint of endpointCandidates) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              targetLanguage: langKey,
            }),
            cache: "no-store",
            credentials: "same-origin",
          });
          if (!response.ok) {
            continue;
          }
          const data = await response.json().catch(() => ({}));
          const translated = String(data?.translation || data?.content || "")
            .replace(/^["'`]|["'`]$/g, "")
            .trim();
          if (!translated || isInvalidRuntimeTitleTranslation(translated)) {
            continue;
          }
          cachePreviewUiTranslation(text, langKey, translated);
          return translated;
        } catch {}
      }
      return "";
    } finally {
      previewUiTranslationRequests.delete(cacheKey);
    }
  })();

  previewUiTranslationRequests.set(cacheKey, request);
  return request;
};

const formatPreviewFallbackText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());

const refreshSeoPreviewTranslations = (mapKey) => {
  const baseLanguage = readMapsBaseLanguagePreference();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  if (langKey) {
    document.body.dataset.previewBaseLanguage = langKey;
  } else {
    delete document.body.dataset.previewBaseLanguage;
  }
  const previewRoot = document.querySelector(".seo-map-support, .seo-map-preview-section");
  if (!previewRoot) {
    return;
  }

  document.querySelectorAll("[data-preview-ui-source]").forEach((node) => {
    const sourceText = String(node.dataset.previewUiSource || "").trim();
    if (!sourceText) {
      return;
    }
    if (!langKey || langKey === "english") {
      node.textContent = sourceText;
      return;
    }
    const cached = getPreviewUiTranslation(sourceText, langKey);
    if (cached) {
      node.textContent = cached;
      return;
    }
    node.textContent = sourceText;
    const requestKey = `${langKey}|${sourceText}|${Date.now()}`;
    node.dataset.previewUiRequest = requestKey;
    requestPreviewUiTranslation(sourceText, langKey).then((translated) => {
      if (node.dataset.previewUiRequest !== requestKey) {
        return;
      }
      if (!translated) {
        return;
      }
      node.textContent = translated;
    });
  });

  document
    .querySelectorAll(`[data-preview-map="${mapKey}"][data-preview-section-title-source]`)
    .forEach((node) => {
      const sourceTitle = String(node.dataset.previewSectionTitleSource || "").trim();
      if (!sourceTitle) {
        return;
      }
      if (!langKey || langKey === "english") {
        node.textContent = sourceTitle;
        return;
      }
      const cached = getRuntimeSectionTitleTranslation(mapKey, sourceTitle, langKey);
      if (cached) {
        node.textContent = cached;
        return;
      }
      node.textContent = sourceTitle;
      const requestKey = `${mapKey}|preview-title|${sourceTitle}|${langKey}|${Date.now()}`;
      node.dataset.previewSectionTitleRequest = requestKey;
      requestRuntimeSectionTitleTranslation(mapKey, sourceTitle, langKey).then((translated) => {
        if (node.dataset.previewSectionTitleRequest !== requestKey) {
          return;
        }
        if (!translated) {
          return;
        }
        node.textContent = translated;
      });
    });

  if (mapKey === "words" || mapKey === "phrases") {
    document.querySelectorAll(`.seo-preview-gloss[data-preview-map="${mapKey}"]`).forEach((node) => {
      const sourceText = String(node.dataset.previewSource || "").trim();
      const sectionKey = String(node.dataset.previewSectionSource || "").trim();
      const hideByDefault = String(node.dataset.previewDefaultHidden || "").trim() === "true";
      if (!sourceText || !sectionKey) {
        return;
      }
      if (!langKey || langKey === "english") {
        node.textContent = formatPreviewFallbackText(sourceText);
        node.hidden = hideByDefault;
        return;
      }
      if (isWorldNativeBaseLanguage(baseLanguage)) {
        node.hidden = true;
        return;
      }
      const translated =
        mapKey === "words"
          ? resolveWordTranslation(sectionKey, sourceText, baseLanguage)
          : resolvePhraseTranslation(sectionKey, sourceText, baseLanguage);
      if (translated) {
        node.textContent = translated;
        node.hidden = false;
        return;
      }
      node.textContent = formatPreviewFallbackText(sourceText);
      node.hidden = false;
      if (mapKey === "phrases") {
        requestRuntimePhraseTranslation(sectionKey, sourceText, baseLanguage).then((runtimeText) => {
          if (!runtimeText) {
            return;
          }
          node.textContent = runtimeText;
          node.hidden = false;
        });
      }
    });
    return;
  }

  if (mapKey === "grammar") {
    document.querySelectorAll(".seo-preview-note[data-preview-grammar-section-source][data-preview-source]").forEach((node) => {
      const sourceText = String(node.dataset.previewSource || "").trim();
      const sectionKey = String(node.dataset.previewGrammarSectionSource || "").trim();
      if (!sourceText || !sectionKey) {
        return;
      }
      if (!langKey || langKey === "english") {
        node.textContent = sourceText;
        return;
      }
      const translated = resolveGrammarExplanation(sectionKey, sourceText, baseLanguage);
      if (translated) {
        node.textContent = translated;
        return;
      }
      node.textContent = sourceText;
      requestRuntimeGrammarExplanationTranslation(sectionKey, sourceText, baseLanguage).then(
        (runtimeText) => {
          if (!runtimeText) {
            return;
          }
          node.textContent = runtimeText;
        }
      );
    });
  }
};

const hasStaticPrerenderedMapSections = () => {
  if (isWordsPage) {
    if (
      document.querySelector(
        '#wordsSections[data-static-prerender="true"] .words-group[data-section]'
      ) ||
      document.querySelector("#wordsSections .words-group[data-section]")
    ) {
      return true;
    }
  }
  if (isPhrasesPage) {
    if (
      document.querySelector(
        '#phrasesSections[data-static-prerender="true"] .phrases-group[data-section]'
      ) ||
      document.querySelector("#phrasesSections .phrases-group[data-section]")
    ) {
      return true;
    }
  }
  if (isGrammarPage) {
    if (
      document.querySelector(
        '#grammarSections[data-static-prerender="true"] .grammar-group[data-section]'
      ) ||
      document.querySelector("#grammarSections .grammar-group[data-section]")
    ) {
      return true;
    }
  }
  return false;
};

const ensureFilterButtonMainText = (button, text) => {
  if (!button) {
    return;
  }
  const normalized = String(text || "").trim();
  let mainNode = button.querySelector(".words-filter-main");
  if (!mainNode) {
    mainNode = document.createElement("span");
    mainNode.className = "words-filter-main";
    const currentText = String(button.textContent || "").trim();
    button.textContent = "";
    mainNode.textContent = normalized || currentText;
    button.appendChild(mainNode);
  } else if (normalized) {
    mainNode.textContent = normalized;
  }
  let translationNode = button.querySelector(".words-filter-translation");
  if (!translationNode) {
    translationNode = document.createElement("span");
    translationNode.className = "words-filter-translation";
    translationNode.hidden = true;
    translationNode.setAttribute("dir", "auto");
    button.appendChild(translationNode);
  }
};

const setFilterButtonTranslationText = (button, translation) => {
  if (!button) {
    return;
  }
  ensureFilterButtonMainText(button, "");
  const translationNode = button.querySelector(".words-filter-translation");
  if (!translationNode) {
    return;
  }
  const normalized = String(translation || "").trim();
  if (!normalized) {
    translationNode.textContent = "";
    translationNode.hidden = true;
    button.classList.remove("has-translation");
    return;
  }
  translationNode.textContent = normalized;
  translationNode.hidden = false;
  button.classList.add("has-translation");
};

const applySectionFilterButtonTranslations = (mapType) => {
  const mapKey = String(mapType || "").trim().toLowerCase();
  if (!["words", "phrases", "grammar"].includes(mapKey)) {
    return;
  }

  const controls =
    mapKey === "words"
      ? document.getElementById("wordsControls")
      : mapKey === "phrases"
        ? document.getElementById("phrasesControls")
        : document.getElementById("grammarControls");
  if (!controls) {
    return;
  }

  const baseLanguage = readMapsBaseLanguagePreference();

  controls.querySelectorAll(".words-filter").forEach((button) => {
    ensureFilterButtonMainText(button, "");
    const mainText = String(
      button.querySelector(".words-filter-main")?.textContent || ""
    ).trim();
    if (button.dataset.filter === "all") {
      ensureFilterButtonMainText(
        button,
        mainText ||
          (button.dataset.registerFilter === "all" ? "All Registers" : "All")
      );
      setFilterButtonTranslationText(button, "");
      return;
    }
    const sourceTitle = String(
      button.dataset.baseTitle || button.dataset.sourceTitle || mainText
    ).trim();

    if (!sourceTitle || !baseLanguage || isWorldNativeBaseLanguage(baseLanguage)) {
      setFilterButtonTranslationText(button, "");
      return;
    }

    const cached = getRuntimeSectionTitleTranslation(mapKey, sourceTitle, baseLanguage);
    if (cached) {
      setFilterButtonTranslationText(button, cached);
      return;
    }

    if (baseLanguage === "english") {
      setFilterButtonTranslationText(button, sourceTitle);
      return;
    }

    const requestKey = `${mapKey}|filter|${sourceTitle}|${baseLanguage}|${Date.now()}`;
    button.dataset.filterTranslationRequest = requestKey;
    setFilterButtonTranslationText(button, "");
    requestRuntimeSectionTitleTranslation(mapKey, sourceTitle, baseLanguage).then(
      (translated) => {
        if (button.dataset.filterTranslationRequest !== requestKey) {
          return;
        }
        setFilterButtonTranslationText(button, translated);
      }
    );
  });
};

const applySectionTitleTranslations = (mapType) => {
  const mapKey = String(mapType || "").trim().toLowerCase();
  if (!["words", "phrases", "grammar"].includes(mapKey)) {
    return;
  }

  const baseLanguage = readMapsBaseLanguagePreference();
  const sectionSelector =
    mapKey === "words"
      ? ".words-group[data-section]"
      : mapKey === "phrases"
        ? ".phrases-group[data-section]"
        : ".grammar-group[data-section]";
  document.querySelectorAll(sectionSelector).forEach((sectionEl) => {
    const heading = sectionEl.querySelector(".section-title h2");
    if (!heading) {
      return;
    }
    const baseTitle = String(
      heading.dataset.baseTitle ||
        heading.dataset.sourceTitle ||
        sectionEl.dataset.section ||
        heading.textContent ||
        ""
    ).trim();
    if (!baseTitle) {
      return;
    }
    let translationNode = heading.querySelector(".map-section-title-translation");
    if (!translationNode) {
      translationNode = document.createElement("span");
      translationNode.className = "map-section-title-translation";
      translationNode.setAttribute("dir", "auto");
      heading.appendChild(document.createTextNode(" "));
      heading.appendChild(translationNode);
    }

    if (!baseLanguage || isWorldNativeBaseLanguage(baseLanguage)) {
      translationNode.textContent = "";
      translationNode.hidden = true;
      return;
    }

    const cached = getRuntimeSectionTitleTranslation(mapKey, baseTitle, baseLanguage);
    if (cached) {
      translationNode.textContent = `(${cached})`;
      translationNode.hidden = false;
      return;
    }

    if (baseLanguage === "english") {
      translationNode.textContent = `(${baseTitle})`;
      translationNode.hidden = false;
      return;
    }

    const requestKey = `${mapKey}|${baseTitle}|${baseLanguage}|${Date.now()}`;
    heading.dataset.sectionTitleTranslationRequest = requestKey;
    translationNode.hidden = true;
    requestRuntimeSectionTitleTranslation(mapKey, baseTitle, baseLanguage).then((translated) => {
      if (heading.dataset.sectionTitleTranslationRequest !== requestKey) {
        return;
      }
      if (!translated) {
        translationNode.textContent = "";
        translationNode.hidden = true;
        return;
      }
      translationNode.textContent = `(${translated})`;
      translationNode.hidden = false;
    });
  });
};

const setMapSectionTitleMainText = (heading, text) => {
  if (!heading) {
    return;
  }
  const normalized = String(text || "").trim();
  if (!normalized) {
    return;
  }
  let mainNode = heading.querySelector(".map-section-title-main");
  if (!mainNode) {
    mainNode = document.createElement("span");
    mainNode.className = "map-section-title-main";
    const currentText = String(heading.textContent || "").trim();
    if (currentText) {
      mainNode.textContent = currentText;
      heading.textContent = "";
      heading.appendChild(mainNode);
    } else if (heading.firstChild) {
      heading.insertBefore(mainNode, heading.firstChild);
    } else {
      heading.appendChild(mainNode);
    }
  }
  mainNode.textContent = normalized;
};

const applyWorldSectionTitleLabels = (mapType) => {
  const mapKey = String(mapType || "").trim().toLowerCase();
  if (!["words", "phrases", "grammar"].includes(mapKey) || !isNonEnglishWorld) {
    return;
  }

  const sectionSelector =
    mapKey === "words"
      ? ".words-group[data-section]"
      : mapKey === "phrases"
        ? ".phrases-group[data-section]"
        : ".grammar-group[data-section]";
  document.querySelectorAll(sectionSelector).forEach((sectionEl) => {
    const heading = sectionEl.querySelector(".section-title h2");
    if (!heading) {
      return;
    }
    const sourceTitle = String(
      heading.dataset.sourceTitle || sectionEl.dataset.section || ""
    ).trim();
    if (!sourceTitle) {
      return;
    }
    heading.dataset.sourceTitle = sourceTitle;
    heading.dataset.baseTitle = sourceTitle;

    const fromPack = getWorldSectionLabelFromPack(mapKey, sourceTitle);
    if (fromPack) {
      setMapSectionTitleMainText(heading, fromPack);
      return;
    }

    const cached = getRuntimeSectionTitleTranslation(mapKey, sourceTitle, WORLD_KEY);
    if (cached) {
      setMapSectionTitleMainText(heading, cached);
      return;
    }

    const requestKey = `${mapKey}|${sourceTitle}|${WORLD_KEY}|${Date.now()}`;
    heading.dataset.worldSectionTitleRequest = requestKey;
    requestRuntimeSectionTitleTranslation(mapKey, sourceTitle, WORLD_KEY).then((translated) => {
      if (heading.dataset.worldSectionTitleRequest !== requestKey) {
        return;
      }
      if (!translated) {
        return;
      }
      setMapSectionTitleMainText(heading, translated);
    });
  });
};

function refreshWordsMapTranslations() {
  if (!isWordsPage) {
    return;
  }
  applyWorldSectionTitleLabels("words");
  applyWordTranslations();
  applySectionTitleTranslations("words");
  applySectionFilterButtonTranslations("words");
  refreshSeoPreviewTranslations("words");
  if (typeof setupSpeechCards === "function") {
    setupSpeechCards();
  }
}

function refreshPhrasesMapTranslations() {
  if (!isPhrasesPage) {
    return;
  }
  applyWorldSectionTitleLabels("phrases");
  applyPhraseTranslations();
  applySectionTitleTranslations("phrases");
  applySectionFilterButtonTranslations("phrases");
  refreshSeoPreviewTranslations("phrases");
  if (typeof setupSpeechCards === "function") {
    setupSpeechCards();
  }
}

function refreshGrammarMapTranslations() {
  if (!isGrammarPage) {
    return;
  }
  applyWorldSectionTitleLabels("grammar");
  applySectionTitleTranslations("grammar");
  applySectionFilterButtonTranslations("grammar");
  applyGrammarCardTitleTranslations();
  refreshSeoPreviewTranslations("grammar");
}

const applyGrammarCardTitleTranslations = () => {
  if (!isGrammarPage) {
    return;
  }
  const baseLanguage = readMapsBaseLanguagePreference();
  document.querySelectorAll(".grammar-card").forEach((card) => {
    const titleNode = card.querySelector(".grammar-text");
    if (!titleNode) {
      return;
    }
    const sourceTitle = String(
      card.dataset.sourceTitle ||
        card.dataset.concept ||
        titleNode.querySelector(".grammar-title-main")?.textContent ||
        titleNode.textContent ||
        ""
    ).trim();
    if (!sourceTitle) {
      return;
    }
    let translationNode = titleNode.querySelector(".grammar-title-translation");
    if (!translationNode) {
      translationNode = document.createElement("span");
      translationNode.className = "grammar-title-translation";
      translationNode.hidden = true;
      titleNode.appendChild(document.createTextNode(" "));
      titleNode.appendChild(translationNode);
    }

    if (!baseLanguage || isWorldNativeBaseLanguage(baseLanguage)) {
      translationNode.textContent = "";
      translationNode.hidden = true;
      return;
    }

    const mainText = String(
      titleNode.querySelector(".grammar-title-main")?.textContent || ""
    ).trim();
    const hideIfSameAsMain = (value) =>
      normalizeWordLookupKey(value) === normalizeWordLookupKey(mainText);

    const cached = getRuntimeSectionTitleTranslation("grammar", sourceTitle, baseLanguage);
    if (cached) {
      translationNode.textContent = `(${cached})`;
      translationNode.hidden = hideIfSameAsMain(cached);
      return;
    }

    const requestKey = `grammar-card|${sourceTitle}|${baseLanguage}|${Date.now()}`;
    card.dataset.cardTitleTranslationRequest = requestKey;
    translationNode.hidden = true;
    requestRuntimeSectionTitleTranslation("grammar", sourceTitle, baseLanguage).then(
      (translated) => {
        if (card.dataset.cardTitleTranslationRequest !== requestKey) {
          return;
        }
        if (!translated) {
          translationNode.textContent = "";
          translationNode.hidden = true;
          return;
        }
        translationNode.textContent = `(${translated})`;
        translationNode.hidden = hideIfSameAsMain(translated);
      }
    );
  });
};

const requestRuntimePhraseTranslation = async (section, phraseText, baseLanguage) => {
  const sectionKey = String(section || PHRASE_SECTION_ORDER[0]).trim();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const phrase = String(phraseText || "").trim();
  if (!sectionKey || !langKey || !phrase) {
    return "";
  }
  if (langKey === WORLD_KEY) {
    return "";
  }
  const cacheKey = buildRuntimePhraseCacheKey(sectionKey, phrase, langKey);
  const cached = runtimePhraseTranslationCache.get(cacheKey);
  if (typeof cached === "string" && cached.trim()) {
    return cached.trim();
  }
  const pending = runtimePhraseTranslationRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const endpointCandidates = buildTranslateEndpointCandidates();
  const createAbortController = () => {
    if (typeof AbortController === "undefined") {
      return null;
    }
    return new AbortController();
  };

  const translateOnce = async (endpoint) => {
    const controller = createAbortController();
    const timeout = controller
      ? window.setTimeout(() => controller.abort(), 10000)
      : null;
    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: phrase,
          targetLanguage: langKey,
        }),
        cache: "no-store",
        credentials: "same-origin",
      };
      if (controller) {
        options.signal = controller.signal;
      }
      const response = await fetch(endpoint, options);
      if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
      }
      const data = await response.json().catch(() => ({}));
      const translated = String(data?.translation || data?.content || "")
        .replace(/^["'`]|["'`]$/g, "")
        .trim();
      if (!translated) {
        throw new Error("Empty translation response");
      }
      cacheRuntimePhraseTranslation(sectionKey, phrase, langKey, translated);
      return translated;
    } finally {
      if (timeout) {
        window.clearTimeout(timeout);
      }
    }
  };

  const request = (async () => {
    try {
      const attempts = navigator.onLine ? 2 : 1;
      for (let attemptIndex = 0; attemptIndex < attempts; attemptIndex += 1) {
        for (let i = 0; i < endpointCandidates.length; i += 1) {
          try {
            return await translateOnce(endpointCandidates[i]);
          } catch {}
        }
        if (attemptIndex < attempts - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 300));
        }
      }
      return "";
    } finally {
      runtimePhraseTranslationRequests.delete(cacheKey);
    }
  })();

  runtimePhraseTranslationRequests.set(cacheKey, request);
  return request;
};

const resolveWorldPhraseEntry = (sectionKey, phrase) => {
  const worldSection = WORLD_TRANSLATIONS?.phrases?.[sectionKey] || {};
  return (
    worldSection?.[String(phrase || "").toLowerCase()] ||
    resolveEntryByNormalizedKey(worldSection, phrase)
  );
};

const resolvePhraseRomanization = (section, worldPhrase) => {
  if (!shouldDisplayCardRomanization()) {
    return "";
  }
  const sectionKey = section || PHRASE_SECTION_ORDER[0];
  const worldEntry = resolveWorldPhraseEntry(sectionKey, worldPhrase);
  return String(worldEntry?.romanization || "").trim();
};

const resolvePhraseRegister = (section, worldPhrase) => {
  const sectionKey = section || PHRASE_SECTION_ORDER[0];
  const worldEntry = resolveWorldPhraseEntry(sectionKey, worldPhrase);
  let resolved = resolveCardRegister(worldEntry?.register, worldPhrase);
  if (resolved === "neutral") {
    resolved = inferPhraseRegisterByWorld(worldPhrase, sectionKey);
  }
  if (resolved === "neutral") {
    const fallback = resolvePhraseNeutralFallbackRegister();
    if (fallback !== "neutral") {
      return fallback;
    }
  }
  return resolved;
};

const resolvePhraseTranslation = (section, englishPhrase, baseLanguage) => {
  if (!baseLanguage || !translationPayloadReady) {
    return "";
  }
  if (isWorldNativeBaseLanguage(baseLanguage)) {
    return "";
  }
  const sectionKey = section || PHRASE_SECTION_ORDER[0];
  const phraseKey = (englishPhrase || "").toLowerCase();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  let translation = "";
  const worldEntry =
    WORLD_TRANSLATIONS?.phrases?.[sectionKey]?.[phraseKey] ||
    resolveWorldPhraseEntry(sectionKey, englishPhrase);
  const worldSourcePhrase = String(worldEntry?.source || "").trim();
  if (worldEntry && worldEntry.translations) {
    translation = worldEntry.translations?.[langKey] || "";
  }
  if (!translation && langKey === "english" && worldSourcePhrase) {
    translation = worldSourcePhrase;
  }
  if (!translation && worldSourcePhrase) {
    translation =
      PHRASE_TRANSLATIONS?.[sectionKey]?.[worldSourcePhrase.toLowerCase()]?.[langKey] || "";
  }
  if (!translation) {
    translation = PHRASE_TRANSLATIONS[sectionKey]?.[phraseKey]?.[langKey] || "";
  }
  if (!translation) {
    translation = getRuntimePhraseTranslation(sectionKey, englishPhrase, langKey);
  }
  if (!translation) {
    if (englishPhrase && baseLanguage) {
      console.warn(
        `Missing translation: section="${sectionKey}", phrase="${englishPhrase}", language="${baseLanguage}"`
      );
    }
    return "";
  }
  return translation;
};

const applyPhraseTranslations = () => {
  const baseLanguage = readMapsBaseLanguagePreference();
  document.querySelectorAll(".phrase-card").forEach((card) => {
    const phrase =
      card.dataset.phrase || card.querySelector(".phrase-text")?.textContent?.trim() || "";
    const section = card.closest("[data-section]")?.dataset.section || PHRASE_SECTION_ORDER[0];
    const worldEntry = resolveWorldPhraseEntry(section, phrase);
    let translationEl = card.querySelector(".phrase-translation");
    if (!translationEl) {
      translationEl = document.createElement("div");
      translationEl.className = "phrase-translation";
      const audioEl = card.querySelector(".word-audio");
      card.insertBefore(translationEl, audioEl || null);
    }
    let romanizationEl = card.querySelector(".phrase-romanization");
    if (!romanizationEl) {
      romanizationEl = document.createElement("div");
      romanizationEl.className = "phrase-romanization";
      romanizationEl.setAttribute("lang", "en");
      romanizationEl.setAttribute("dir", "ltr");
      card.insertBefore(romanizationEl, translationEl);
    }
    const romanization = resolvePhraseRomanization(section, phrase);
    const register = resolvePhraseRegister(section, phrase);
    applyCardRegisterBadge(card, register);
    romanizationEl.textContent = romanization;
    romanizationEl.hidden = !romanization;
    const resolved = resolvePhraseTranslation(section, phrase, baseLanguage);
    translationEl.textContent = resolved;
    if (!resolved && baseLanguage && !isWorldNativeBaseLanguage(baseLanguage)) {
      requestRuntimePhraseTranslation(section, phrase, baseLanguage).then((translated) => {
        if (!translated) {
          return;
        }
        const currentPhrase =
          card.dataset.phrase || card.querySelector(".phrase-text")?.textContent?.trim() || "";
        if (currentPhrase !== phrase) {
          return;
        }
        if (translationEl) {
          translationEl.textContent = translated;
        }
      });
    }
  });
};

const resolveGrammarTranslationFromSource = (sourceSentence, langKey, preferredSection = "") => {
  const source = String(sourceSentence || "").trim();
  if (!source) {
    return "";
  }
  if (langKey === "english") {
    return source;
  }
  const sourceKey = source.toLowerCase();
  const candidateSections = [
    preferredSection,
    ...Object.keys(GRAMMAR_TRANSLATIONS).filter((sectionName) => sectionName !== preferredSection),
  ].filter(Boolean);
  for (const sectionName of candidateSections) {
    const value = GRAMMAR_TRANSLATIONS?.[sectionName]?.[sourceKey]?.[langKey];
    if (value) {
      return value;
    }
  }
  return "";
};

const resolveGrammarTranslation = (section, exampleSentence, baseLanguage) => {
  const sectionKey = section || GRAMMAR_SECTION_ORDER[0];
  const keyVariants = buildTranslationLookupVariants(exampleSentence);
  const variantSet = new Set(keyVariants);
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  let translation = "";

  const worldExamples = WORLD_TRANSLATIONS?.grammar?.examples || {};
  const worldSections = [
    sectionKey,
    ...Object.keys(worldExamples).filter((name) => name !== sectionKey),
  ];
  for (const sectionName of worldSections) {
    const sectionEntries = worldExamples?.[sectionName];
    if (!sectionEntries) {
      continue;
    }
    for (const variant of keyVariants) {
      const entry = sectionEntries?.[variant];
      const direct = entry?.translations?.[langKey];
      if (direct) {
        return direct;
      }
      const bySource = resolveGrammarTranslationFromSource(
        entry?.source,
        langKey,
        sectionName
      );
      if (bySource) {
        return bySource;
      }
    }
    for (const [rawKey, payload] of Object.entries(sectionEntries)) {
      if (!variantSet.has(normalizeTranslationLookupKey(rawKey))) {
        continue;
      }
      const value = payload?.translations?.[langKey];
      if (value) {
        return value;
      }
      const bySource = resolveGrammarTranslationFromSource(
        payload?.source,
        langKey,
        sectionName
      );
      if (bySource) {
        return bySource;
      }
    }
  }

  const grammarSections = [
    sectionKey,
    ...Object.keys(GRAMMAR_TRANSLATIONS).filter((name) => name !== sectionKey),
  ];
  for (const sectionName of grammarSections) {
    const sectionEntries = GRAMMAR_TRANSLATIONS?.[sectionName];
    if (!sectionEntries) {
      continue;
    }
    for (const variant of keyVariants) {
      const direct = sectionEntries?.[variant]?.[langKey];
      if (direct) {
        return direct;
      }
    }
    for (const [rawKey, payload] of Object.entries(sectionEntries)) {
      if (!variantSet.has(normalizeTranslationLookupKey(rawKey))) {
        continue;
      }
      const value = payload?.[langKey];
      if (value) {
        return value;
      }
    }
  }

  if (exampleSentence && baseLanguage) {
    console.warn(
      `Missing translation: section="${sectionKey}", example="${exampleSentence}", language="${baseLanguage}"`
    );
  }
  return "";
};

refreshMapsForBaseLanguage = () => {
  const selectedBaseLanguage = readMapsBaseLanguagePreference();
  const shouldPrioritizeTranslations =
    !!selectedBaseLanguage && (isNonEnglishWorld || selectedBaseLanguage !== "english");

  const refreshRenderedMaps = () => {
    refreshWordsMapTranslations();
    refreshPhrasesMapTranslations();
    if (isGrammarPage) {
      refreshGrammarMapTranslations();
      prewarmGrammarExplanationTranslations();
    }
    const overlay = ensureGrammarOverlay();
    if (overlay && typeof overlay.__refresh === "function") {
      overlay.__refresh();
    }
  };

  if (!shouldPrioritizeTranslations) {
    refreshRenderedMaps();
    return;
  }

  refreshRenderedMaps();
  ensureTranslationsLoaded({ awaitNetwork: false }).then(() => {
    refreshRenderedMaps();
    if (isGrammarPage) {
      prewarmGrammarExplanationTranslations();
      const overlay = ensureGrammarOverlay();
      if (overlay && typeof overlay.__refresh === "function") {
        overlay.__refresh();
      }
    }
  });
};

const updateWordsTopState = () => {
  if (!document.body.classList.contains("words-page")) {
    return;
  }
  document.body.classList.remove("words-at-top");
};

const updatePhrasesTopState = () => {
  if (!document.body.classList.contains("phrases-page")) {
    return;
  }
  document.body.classList.remove("phrases-at-top");
};

const updateGrammarTopState = () => {
  if (!document.body.classList.contains("grammar-page")) {
    return;
  }
  document.body.classList.remove("grammar-at-top");
};

/* ==========================================================================
   APPLICATION BOOTSTRAP
   Render page modules, wire observers/listeners, then hydrate translations only
   on map pages that actually require translation payloads.
   ========================================================================== */
const cachedBaseTranslations = readMapsBundleTranslationsCache();
if (cachedBaseTranslations) {
  hydrateBaseTranslationsPayload(cachedBaseTranslations);
  translationPayloadReady = true;
}
const cachedWorldTranslations = readMapsWorldTranslationsCache();
if (cachedWorldTranslations) {
  hydrateMapsWorldTranslationsPayload(cachedWorldTranslations);
}
const shouldRenderLoadingSkeleton =
  needsMapTranslations && isNonEnglishWorld && !cachedWorldTranslations && !hasStaticPrerenderedMapSections();

if (shouldRenderLoadingSkeleton) {
  if (isWordsPage) {
    renderMapLoadingState("words");
  }
  if (isPhrasesPage) {
    renderMapLoadingState("phrases");
  }
  if (isGrammarPage) {
    renderMapLoadingState("grammar");
  }
} else {
  if (isWordsPage) {
    renderWordsSections();
  }
  if (isPhrasesPage) {
    renderPhrasesSections();
  }
  if (isGrammarPage) {
    renderGrammarSections();
    setupGrammarModal();
  }
}
if (typeof initializeCommonShell === "function") {
  initializeCommonShell();
}
if (!shouldRenderLoadingSkeleton && isWordsPage && document.querySelector(".word-card")) {
  refreshWordsMapTranslations();
}
if (!shouldRenderLoadingSkeleton && isPhrasesPage && document.querySelector(".phrase-card")) {
  refreshPhrasesMapTranslations();
}
if (!shouldRenderLoadingSkeleton && isGrammarPage) {
  refreshGrammarMapTranslations();
}
if (isWordsPage) {
  updateWordsTopState();
  let wordsTopStateRafId = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (wordsTopStateRafId) {
        return;
      }
      wordsTopStateRafId = window.requestAnimationFrame(() => {
        wordsTopStateRafId = 0;
        updateWordsTopState();
      });
    },
    { passive: true }
  );
}
if (isPhrasesPage) {
  updatePhrasesTopState();
  let phrasesTopStateRafId = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (phrasesTopStateRafId) {
        return;
      }
      phrasesTopStateRafId = window.requestAnimationFrame(() => {
        phrasesTopStateRafId = 0;
        updatePhrasesTopState();
      });
    },
    { passive: true }
  );
}
if (isGrammarPage) {
  updateGrammarTopState();
  let grammarTopStateRafId = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (grammarTopStateRafId) {
        return;
      }
      grammarTopStateRafId = window.requestAnimationFrame(() => {
        grammarTopStateRafId = 0;
        updateGrammarTopState();
      });
    },
    { passive: true }
  );
}

if (needsMapTranslations) {
  const selectedBaseLanguage = readMapsBaseLanguagePreference();
  const shouldPrioritizeTranslations =
    !!selectedBaseLanguage && (isNonEnglishWorld || selectedBaseLanguage !== "english");
  const shouldAwaitNetworkHydration =
    isNonEnglishWorld || (shouldPrioritizeTranslations && isGrammarPage);

  const refreshAfterTranslations = () => {
    ensureTranslationsLoaded({ awaitNetwork: shouldAwaitNetworkHydration })
      .then(() => {
        if (isNonEnglishWorld) {
          if (isWordsPage) {
            renderWordsSections();
          }
          if (isPhrasesPage) {
            renderPhrasesSections();
          }
          if (isGrammarPage) {
            renderGrammarSections();
            setupGrammarModal();
          }
          if (typeof setupSpeechCards === "function") {
            setupSpeechCards();
          }
        }
        refreshWordsMapTranslations();
        refreshPhrasesMapTranslations();
        if (isGrammarPage) {
          refreshGrammarMapTranslations();
          prewarmGrammarExplanationTranslations();
          const overlay = ensureGrammarOverlay();
          if (overlay && typeof overlay.__refresh === "function") {
            overlay.__refresh();
          }
        }
      })
      .finally(() => {
        document.body.classList.remove("maps-loading");
      });
  };

  if (shouldPrioritizeTranslations || shouldRenderLoadingSkeleton) {
    refreshAfterTranslations();
  } else {
    runWhenBrowserIdle(refreshAfterTranslations);
  }
}

if ((isWordsPage || isPhrasesPage || isGrammarPage) && typeof window.cosmicaGamification?.subscribe === "function") {
  let lastPremiumAccessState = getPremiumAccessState();
  let premiumModeRerenderTimerId = 0;
  window.cosmicaGamification.subscribe(() => {
    const nextPremiumAccessState = getPremiumAccessState();
    if (nextPremiumAccessState === lastPremiumAccessState) {
      return;
    }
    lastPremiumAccessState = nextPremiumAccessState;
    if (premiumModeRerenderTimerId) {
      window.clearTimeout(premiumModeRerenderTimerId);
    }
    premiumModeRerenderTimerId = window.setTimeout(() => {
      premiumModeRerenderTimerId = 0;
      if (isWordsPage) {
        renderWordsSections();
      }
      if (isPhrasesPage) {
        renderPhrasesSections();
      }
      if (isGrammarPage) {
        renderGrammarSections();
        setupGrammarModal();
      }
      if (typeof refreshMapsForBaseLanguage === "function") {
        refreshMapsForBaseLanguage();
      }
    }, 0);
  });
}
