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
        "basic word order for statements",
        "subject before verb",
        "object after verb",
      ],
      example: "She reads a book.",
    },
    {
      title: "sentence parts",
      points: [
        "core subject slot",
        "core verb slot",
        "object and complement slot",
      ],
      example: "They named her captain.",
    },
    {
      title: "adding details",
      points: [
        "time at sentence end",
        "place after verb",
        "extra phrases after objects",
      ],
      example: "She met him at noon at the station.",
    },
    {
      title: "linking clauses",
      points: [
        "main clause idea",
        "reason clause add-on",
        "time clause add-on",
      ],
      example: "I stayed home because it rained.",
    },
    {
      title: "sentence variety",
      points: [
        "short sentences for impact",
        "long sentences for detail",
        "avoid run-on sentences",
      ],
      example: "We finished early. We went home after class because we were tired.",
    },
  ],
  Verbs: [
    {
      title: "action verbs",
      points: [
        "action verbs for movement",
        "action verbs for tasks",
        "action verbs for change",
      ],
      example: "They carry the boxes.",
    },
    {
      title: "state verbs",
      points: [
        "state verbs for feelings",
        "state verbs for thoughts",
        "state verbs for possession",
      ],
      example: "She feels tired.",
    },
    {
      title: "linking verbs",
      points: [
        "be as linking verb",
        "feel and seem links",
        "become and remain links",
      ],
      example: "The room feels quiet.",
    },
    {
      title: "verb patterns",
      points: [
        "verb plus object pattern",
        "verb plus adjective pattern",
        "verb plus preposition pattern",
      ],
      example: "He placed the book on the table.",
    },
    {
      title: "verb combinations",
      points: [
        "verb plus infinitive",
        "verb plus gerund",
        "verb plus that clause",
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
      example: "They visited Paris.",
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
        "will for decisions",
        "going to for plans",
        "present continuous for plans",
      ],
      example: "We will meet tomorrow.",
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
      example: "I work every day, I am working now, and I have worked here for years.",
    },
  ],
  "Nouns & Articles": [
    {
      title: "countable nouns",
      points: [
        "countable nouns with numbers",
        "a or an before countables",
        "plural for more than one",
      ],
      example: "I have a coin.",
    },
    {
      title: "uncountable nouns",
      points: [
        "uncountable nouns without plural",
        "some with uncountables",
        "a piece of for units",
      ],
      example: "We need some rice.",
    },
    {
      title: "articles",
      points: [
        "a or an for first mention",
        "the for specific reference",
        "no article for general ideas",
      ],
      example: "The dog is outside.",
    },
    {
      title: "plural forms",
      points: [
        "regular plural endings",
        "spelling changes in plurals",
        "irregular plural forms",
      ],
      example: "Two children are here.",
    },
    {
      title: "possessive nouns",
      points: [
        "apostrophe s ownership",
        "plural possessive endings",
        "things and relationships",
      ],
      example: "Sara's phone is new.",
    },
    {
      title: "noun phrases",
      points: [
        "determiner plus noun",
        "adjective plus noun",
        "noun plus noun pairing",
      ],
      example: "The small kitchen table broke.",
    },
    {
      title: "quantifiers",
      points: [
        "many and much choice",
        "few and little choice",
        "a lot of for quantity",
      ],
      example: "There are many options.",
    },
  ],
  "Pronouns & Reference": [
    {
      title: "subject pronouns",
      points: [
        "i you he she set",
        "we and they plural",
        "it for things",
      ],
      example: "They are ready.",
    },
    {
      title: "object pronouns",
      points: [
        "me him her set",
        "us and them plural",
        "object position after verbs",
      ],
      example: "She called me.",
    },
    {
      title: "possessive forms",
      points: [
        "my your his her set",
        "our their with nouns",
        "mine yours for standalone",
      ],
      example: "This is my bag.",
    },
    {
      title: "reflexive pronouns",
      points: [
        "myself yourself pattern",
        "herself himself pattern",
        "emphasis with reflexives",
      ],
      example: "He hurt himself.",
    },
    {
      title: "demonstratives",
      points: [
        "this that for single",
        "these those for plural",
        "near vs far reference",
      ],
      example: "Those are my keys.",
    },
    {
      title: "relative reference",
      points: [
        "who for people",
        "which for things",
        "that for general use",
      ],
      example: "The man who called left.",
    },
    {
      title: "indefinite reference",
      points: [
        "someone anyone set",
        "everyone no one set",
        "something anything set",
      ],
      example: "Someone is waiting.",
    },
  ],
  Modifiers: [
    {
      title: "adjectives basics",
      points: [
        "adjectives describe nouns",
        "adjectives before nouns",
        "adjectives after be",
      ],
      example: "The house is quiet.",
    },
    {
      title: "adjective order",
      points: [
        "opinion before size",
        "age before color",
        "material near noun",
      ],
      example: "She bought a small red bag.",
    },
    {
      title: "comparatives",
      points: [
        "er or more forms",
        "than comparisons",
        "irregular comparative forms",
      ],
      example: "This is faster than that.",
    },
    {
      title: "superlatives",
      points: [
        "est or most forms",
        "the with superlative",
        "group comparison focus",
      ],
      example: "He is the tallest.",
    },
    {
      title: "adverbs basics",
      points: [
        "adverbs describe verbs",
        "adverbs after verb",
        "adverbs before adjectives",
      ],
      example: "She speaks clearly.",
    },
    {
      title: "frequency adverbs",
      points: [
        "always usually often set",
        "rarely never set",
        "position with be",
      ],
      example: "I usually wake early.",
    },
    {
      title: "time and place adverbs",
      points: [
        "time at end position",
        "place at the end",
        "time before place order",
      ],
      example: "We met there yesterday.",
    },
    {
      title: "degree words",
      points: [
        "very really set",
        "too and enough",
        "quite and rather",
      ],
      example: "The room is very warm.",
    },
    {
      title: "participles",
      points: [
        "ing adjectives for cause",
        "ed adjectives for feeling",
        "avoid confusion",
      ],
      example: "The movie was boring.",
    },
    {
      title: "modifier stacking",
      points: [
        "multiple adjectives",
        "multiple adverbs",
        "keep focus clear",
      ],
      example: "She quickly answered the hard question.",
    },
  ],
  Questions: [
    {
      title: "yes no questions",
      points: ["aux + subject + base verb"],
      example: "Do you work here?",
    },
    {
      title: "wh questions",
      points: ["wh word + aux + subject + base verb"],
      example: "Where does he live?",
    },
    {
      title: "questions with be",
      points: ["be + subject + complement"],
      example: "Is the store open?",
    },
    {
      title: "questions with do",
      points: ["aux + subject + base verb"],
      example: "Did you call her?",
    },
    {
      title: "questions with modals",
      points: ["modal + subject + base verb"],
      example: "Could you help me?",
    },
    {
      title: "tag questions",
      points: ["statement + tag"],
      example: "You are ready, aren't you?",
    },
    {
      title: "indirect questions",
      points: ["intro + wh clause"],
      example: "Could you tell me where it is?",
    },
  ],
  Negation: [
    {
      title: "not with be",
      points: ["subject + be + not + complement"],
      example: "She is not tired.",
    },
    {
      title: "not with do",
      points: ["subject + aux + not + base verb"],
      example: "They do not agree.",
    },
    {
      title: "negative short forms",
      points: ["subject + aux + not + base verb"],
      example: "I don't know.",
    },
    {
      title: "negative words",
      points: ["negative word + noun"],
      example: "There is no milk.",
    },
    {
      title: "negative questions",
      points: ["aux + not + subject + base verb + object"],
      example: "Don't you want coffee?",
    },
    {
      title: "limited negatives",
      points: ["subject + negative adverb + verb"],
      example: "He rarely eats out.",
    },
  ],
  Connections: [
    {
      title: "basic connectors",
      points: ["clause 1 + connector + clause 2"],
      example: "I called but no one answered.",
    },
    {
      title: "reason and result",
      points: ["reason clause + connector + result clause"],
      example: "It rained, so we stayed.",
    },
    {
      title: "contrast and choice",
      points: ["clause 1 + contrast connector + clause 2"],
      example: "She went, although she was tired.",
    },
    {
      title: "time connectors",
      points: ["main clause + time connector + clause"],
      example: "Call me when you arrive.",
    },
    {
      title: "comparison links",
      points: ["subject + verb + comparison + object"],
      example: "This feels like home.",
    },
    {
      title: "adding ideas",
      points: ["addition marker + clause"],
      example: "We also need chairs.",
    },
    {
      title: "ordering ideas",
      points: ["sequence + clause"],
      example: "First we plan, then we act.",
    },
  ],
  Conditions: [
    {
      title: "real conditions",
      points: ["if clause + result clause"],
      example: "If you press this, it starts.",
    },
    {
      title: "future conditions",
      points: ["if clause + result clause"],
      example: "If it is sunny, we will go.",
    },
    {
      title: "unreal present",
      points: ["if clause + would clause"],
      example: "If I had time, I would help.",
    },
    {
      title: "unreal past",
      points: ["if clause + would have clause"],
      example: "If we had left earlier, we would have arrived.",
    },
    {
      title: "mixed conditions",
      points: ["if clause (past perfect) + present result (would + base verb)"],
      example: "If she had studied, she would be calm now.",
    },
    {
      title: "unless and otherwise",
      points: ["result clause + unless clause"],
      example: "We will go unless it rains.",
    },
  ],
  "Voice & Focus": [
    {
      title: "active voice",
      points: ["doer + action verb + object"],
      example: "The chef cooked dinner.",
    },
    {
      title: "passive voice",
      points: ["object + be verb + past participle"],
      example: "The meal was cooked.",
    },
    {
      title: "focus shifts",
      points: ["focus phrase + subject + verb"],
      example: "That book, I finished yesterday.",
    },
    {
      title: "cleft sentences",
      points: ["it subject + focus phrase + clause"],
      example: "It is John who called.",
    },
    {
      title: "there and it subjects",
      points: ["there subject + be verb + noun"],
      example: "There is a problem.",
    },
  ],
  Modality: [
    {
      title: "ability",
      points: ["subject + modal + base verb"],
      example: "She can swim.",
    },
    {
      title: "permission",
      points: ["modal + subject + base verb"],
      example: "May I sit here?",
    },
    {
      title: "obligation",
      points: ["subject + modal + base verb"],
      example: "You must wear a seatbelt.",
    },
    {
      title: "advice",
      points: ["subject + modal + base verb"],
      example: "You should rest.",
    },
    {
      title: "possibility",
      points: ["modal + base verb"],
      example: "It might rain today.",
    },
    {
      title: "probability",
      points: ["subject + modal + probability word + base verb"],
      example: "He will probably come.",
    },
    {
      title: "polite requests",
      points: ["modal + subject + base verb + object"],
      example: "Could you open the window?",
    },
    {
      title: "offers and invitations",
      points: ["modal phrase + object"],
      example: "Would you like some tea?",
    },
  ],
  "Reported Speech": [
    {
      title: "reporting statements",
      points: [
        "say with (that) clause",
        "that often omitted",
        "reporting verb + clause",
      ],
      example: "She said she was ready.",
    },
    {
      title: "reporting questions",
      points: [
        "ask with if",
        "ask with question word",
        "no inversion",
      ],
      example: "He asked if I was okay.",
    },
    {
      title: "reporting requests",
      points: [
        "ask to do",
        "tell to do requests",
        "polite reporting",
      ],
      example: "She asked me to wait.",
    },
    {
      title: "reporting commands",
      points: [
        "tell to do commands",
        "order to do",
        "instruction shift",
      ],
      example: "He told us to leave.",
    },
    {
      title: "backshift basics",
      points: [
        "present to past shift",
        "will to would shift",
        "can to could shift",
      ],
      example: "They said they had time.",
    },
    {
      title: "time place changes",
      points: [
        "now to then",
        "here to there",
        "today to that day",
      ],
      example: "He said he was there.",
    },
  ],
  "Formality & Style": [
    {
      title: "formal vs informal",
      points: [
        "formal word choice",
        "informal word choice",
        "match audience tone",
      ],
      example: "Could you assist me?",
    },
    {
      title: "contractions",
      points: [
        "short forms in speech",
        "avoid in formal writing",
        "clarity choices",
      ],
      example: "I can't stay long.",
    },
    {
      title: "polite softening",
      points: [
        "please for politeness",
        "soft request forms",
        "indirect language",
      ],
      example: "Could you close the door?",
    },
    {
      title: "spoken vs written",
      points: [
        "spoken simplicity",
        "written clarity",
        "sentence length control",
      ],
      example: "Please see the details below.",
    },
    {
      title: "professional style",
      points: [
        "clear purpose first",
        "neutral tone",
        "polite closing",
      ],
      example: "Thank you for your time.",
    },
    {
      title: "casual style",
      points: [
        "friendly tone",
        "short phrases",
        "informal openings",
      ],
      example: "Hey, how is it going?",
    },
    {
      title: "clarity and brevity",
      points: [
        "short sentences",
        "avoid extra words",
        "main point first",
      ],
      example: "We need a quick answer.",
    },
  ],
  "Discourse & Flow": [
    {
      title: "opening and closing",
      points: [
        "start a talk",
        "end a talk",
        "closing signal words",
      ],
      example: "Hi everyone, anyway, that is all for today.",
    },
    {
      title: "topic shifts",
      points: [
        "change topic smoothly",
        "return to topic",
        "signal the shift",
      ],
      example: "By the way, I have news.",
    },
    {
      title: "cohesion tools",
      points: [
        "reference words",
        "linking phrases",
        "topic tracking",
      ],
      example: "This idea connects to the last point.",
    },
    {
      title: "sequencing ideas",
      points: [
        "first next last",
        "sequence signal words",
        "clear sequence",
      ],
      example: "First we pack, then we leave.",
    },
    {
      title: "clarification moves",
      points: [
        "rephrase key point",
        "ask for clarity",
        "confirm meaning",
      ],
      example: "Let me put it another way.",
    },
    {
      title: "summaries",
      points: [
        "in short",
        "to sum up",
        "main point recap",
      ],
      example: "In short, we are ready.",
    },
    {
      title: "emphasis and repetition",
      points: [
        "stress key idea",
        "repeat for focus",
        "signal emphasis",
      ],
      example: "It is really important.",
    },
    {
      title: "conversation flow",
      points: [
        "turn taking",
        "listening signals",
        "smooth exchange",
      ],
      example: "I see, please continue.",
    },
    {
      title: "giving examples",
      points: [
        "for example",
        "for instance",
        "such as",
      ],
      example: "For example, call the help desk.",
    },
    {
      title: "repair and correction",
      points: [
        "self correction",
        "clarify quickly",
        "restart phrasing",
      ],
      example: "Sorry, let me try again.",
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

const applySectionCompleteButtonState = (button, mapKey, sectionKey, mode = "complete") => {
  if (!button) {
    return;
  }
  const premiumAccessState = getPremiumAccessState();
  if (premiumAccessState === "loading") {
    button.hidden = true;
    button.classList.remove("is-complete");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "");
    button.title = "";
    button.setAttribute("data-status-label", "");
    return;
  }
  if (premiumAccessState !== "premium") {
    button.hidden = true;
    button.classList.remove("is-complete");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Premium only");
    button.title = "Premium only";
    button.setAttribute("data-status-label", "Premium only");
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
  const isPracticeMode = mode === "practice";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "map-section-complete-btn";
  button.style.position = "absolute";
  button.style.top = "8px";
  button.style.right = "8px";
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
    if (premiumAccessState !== "premium") {
      if (
        guestNotAuthenticated &&
        typeof window.cosmicaOpenSignupPanelUpwards === "function"
      ) {
        window.cosmicaOpenSignupPanelUpwards(
          "Sign up to save progress and unlock checkmarks."
        );
        return;
      }
      if (typeof window.cosmicaAccountHub?.openPremium === "function") {
        window.cosmicaAccountHub.openPremium({
          message: "Upgrade to Premium to unlock section and card checkmarks.",
        });
      }
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

    if (
      window.cosmicaGamification &&
      typeof window.cosmicaGamification.getState === "function" &&
      !window.cosmicaGamification.getState()?.isAuthenticated
    ) {
      if (typeof window.cosmicaOpenSignupPanelUpwards === "function") {
        window.cosmicaOpenSignupPanelUpwards("Sign up to save section completion.");
      }
      return;
    }

    button.dataset.busy = "1";
    button.disabled = true;
    try {
      if (
        window.cosmicaGamification &&
        typeof window.cosmicaGamification.trackProgress === "function"
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

const renderWordsSections = () => {
  const container = document.getElementById("wordsSections");
  const controls = document.getElementById("wordsControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  WORD_SECTION_ORDER.forEach((sectionName) => {
    const words = getWorldWordList(sectionName);
    if (!Array.isArray(words) || !words.length) {
      return;
    }
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
    section.appendChild(createSectionCompleteButton("words", sectionName));
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
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (!sections.length) {
    container.appendChild(buildMapUnavailableState("Words"));
    return;
  }
  document.body.classList.remove("maps-loading");

  if (controls) {
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

    WORD_SECTION_ORDER.forEach((sectionName) => {
      const displayName =
        getWorldSectionLabelFromPack("words", sectionName) ||
        (sectionName === "countries" ? "Countries" : sectionName);
      list.appendChild(createSectionFilterButton(displayName, sectionName, sectionName));
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

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      activeFilter = filter;
      applyFilter();
      if (filter !== "all") {
        trackMapSectionEvent("words", filter, "started");
      }
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

    const registerOptions = getRegisterFilterOptionsForSections(sections, ".word-card");
    if (registerOptions.length && !registerOptions.includes(activeRegisterFilter)) {
      activeRegisterFilter = "all";
    }

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);

    if (registerOptions.length) {
      const registerLabel = document.createElement("div");
      registerLabel.className = "words-controls-register-label";
      registerLabel.textContent = "Register";
      const registerList = document.createElement("div");
      registerList.className = "words-controls-list words-register-list";
      registerOptions.forEach((value) => {
        const button = createSectionFilterButton(getRegisterFilterLabel(value), value);
        button.dataset.registerFilter = value;
        if (value === activeRegisterFilter) {
          button.classList.add("is-active");
        }
        registerList.appendChild(button);
      });
      registerList.addEventListener("click", (event) => {
        const button = event.target.closest(".words-filter[data-register-filter]");
        if (!button) {
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
  }
};

const renderPhrasesSections = () => {
  const container = document.getElementById("phrasesSections");
  const controls = document.getElementById("phrasesControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  PHRASE_SECTION_ORDER.forEach((sectionName) => {
    const phrases = getWorldPhraseList(sectionName);
    if (!Array.isArray(phrases) || !phrases.length) {
      return;
    }
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
    section.appendChild(createSectionCompleteButton("phrases", sectionName));
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
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (!sections.length) {
    container.appendChild(buildMapUnavailableState("Phrases"));
    return;
  }
  document.body.classList.remove("maps-loading");

  if (controls) {
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

    PHRASE_SECTION_ORDER.forEach((sectionName) => {
      const displayName =
        getWorldSectionLabelFromPack("phrases", sectionName) || sectionName;
      list.appendChild(createSectionFilterButton(displayName, sectionName, sectionName));
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

    list.addEventListener("click", (event) => {
      const button = event.target.closest(".words-filter");
      if (!button) {
        return;
      }
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      activeFilter = filter;
      applyFilter();
      if (filter !== "all") {
        trackMapSectionEvent("phrases", filter, "started");
      }
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

    const registerOptions = getRegisterFilterOptionsForSections(sections, ".phrase-card");
    if (registerOptions.length && !registerOptions.includes(activeRegisterFilter)) {
      activeRegisterFilter = "all";
    }

    controls.appendChild(eyebrow);
    controls.appendChild(label);
    controls.appendChild(list);

    if (registerOptions.length) {
      const registerLabel = document.createElement("div");
      registerLabel.className = "words-controls-register-label";
      registerLabel.textContent = "Register";
      const registerList = document.createElement("div");
      registerList.className = "words-controls-list words-register-list";
      registerOptions.forEach((value) => {
        const button = createSectionFilterButton(getRegisterFilterLabel(value), value);
        button.dataset.registerFilter = value;
        if (value === activeRegisterFilter) {
          button.classList.add("is-active");
        }
        registerList.appendChild(button);
      });
      registerList.addEventListener("click", (event) => {
        const button = event.target.closest(".words-filter[data-register-filter]");
        if (!button) {
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
  }
};

const renderGrammarSections = () => {
  const container = document.getElementById("grammarSections");
  const controls = document.getElementById("grammarControls");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  if (controls) {
    controls.innerHTML = "";
  }

  const sections = [];
  GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
    const concepts = getGrammarCardsForSection(sectionName);
    if (!Array.isArray(concepts) || !concepts.length) {
      return;
    }
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
    section.appendChild(createSectionCompleteButton("grammar", sectionName));
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
      card.appendChild(
        createCardPracticeButton(
          "grammar",
          sectionName,
          `${sourceTitle || displayTitle || concept.title || "concept"}-${conceptIndex}`
        )
      );
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (!sections.length) {
    container.appendChild(buildMapUnavailableState("Grammar"));
    return;
  }
  document.body.classList.remove("maps-loading");

  if (controls) {
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

    GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
      list.appendChild(
        createSectionFilterButton(
          getWorldGrammarSectionLabel(sectionName),
          sectionName,
          sectionName
        )
      );
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
      list.querySelectorAll(".words-filter").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      const filter = button.dataset.filter || "all";
      applyFilter(filter);
      if (filter !== "all") {
        trackMapSectionEvent("grammar", filter, "started");
      }
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
  }
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
  "basic word order": "subject + verb + object",
  "sentence parts": "subject + verb + object + complement",
  "adding details": "subject + verb + object + (time) + (place) + (reason)",
  "linking clauses": "main clause + connector + clause",
  "sentence variety": "short sentence + longer sentence",
  "action verbs": "subject + action verb + object",
  "state verbs": "subject + state verb + complement",
  "linking verbs": "subject + linking verb + adjective/noun",
  "verb patterns": "verb + object | verb + adjective | verb + preposition",
  "verb combinations": "verb + to-infinitive | verb + -ing",
  "phrasal verbs": "verb + particle + object",
  "present simple": "subject + base verb",
  "present continuous": "subject + be + verb-ing",
  "past simple": "subject + past verb",
  "past continuous": "subject + was/were + verb-ing",
  "present perfect": "subject + have/has + past participle",
  "past perfect": "subject + had + past participle",
  "future forms": "will + base verb | be going to + base verb | present continuous + future time",
  "future continuous": "will be + verb-ing",
  "future perfect": "will have + past participle",
  "aspect contrasts": "simple = whole; continuous = in progress; perfect = result",
  "countable nouns": "a/an + noun | two + nouns",
  "uncountable nouns": "some + noun | much + noun",
  "articles": "a/an + noun | the + noun | no article",
  "plural forms": "noun + -s/-es",
  "possessive nouns": "noun + 's",
  "noun phrases": "determiner + adjective + noun",
  "quantifiers": "some/any/many/much + noun",
  "subject pronouns": "subject pronoun + verb",
  "object pronouns": "verb + object pronoun",
  "possessive forms": "my/your + noun | mine/yours",
  "reflexive pronouns": "subject + verb + reflexive",
  "demonstratives": "this/that/these/those + noun",
  "relative reference": "noun + who/which/that + clause",
  "indefinite reference": "someone/anyone/anything",
  "adjectives basics": "adjective + noun",
  "adjective order": "opinion + size + age + color + noun",
  "comparatives": "adj-er/more + than",
  "superlatives": "the + adj-est/most + noun",
  "adverbs basics": "verb + adverb",
  "frequency adverbs": "always/often + verb",
  "time and place adverbs": "verb + time/place adverb",
  "degree words": "very/too/enough + adjective",
  "participles": "boring/ bored + noun/person",
  "modifier stacking": "multiple modifiers before noun",
  "yes no questions": "do/does + subject + verb",
  "wh questions": "wh-word + do/does + subject + verb",
  "questions with be": "be + subject + complement",
  "questions with do": "do/does + subject + verb",
  "questions with modals": "modal + subject + base verb",
  "tag questions": "statement, auxiliary + pronoun?",
  "indirect questions": "intro + wh-word + subject + verb",
  "not with be": "subject + be + not + complement",
  "not with do": "subject + do/does + not + verb",
  "negative short forms": "don't/doesn't/isn't",
  "negative words": "no/none/never/nothing",
  "negative questions": "don't/doesn't + subject + verb?",
  "limited negatives": "hardly/barely/rarely + verb",
  "basic connectors": "and/but/or + clause",
  "reason and result": "because/so + clause",
  "contrast and choice": "but/although/either/or",
  "time connectors": "before/after/when + clause",
  "comparison links": "like/as/than + clause",
  "adding ideas": "also/in addition + clause",
  "ordering ideas": "first/then/finally + clause",
  "real conditions": "if + present, present",
  "future conditions": "if + present, will + verb",
  "unreal present": "if + past, would + verb",
  "unreal past": "if + had, would have + past participle",
  "mixed conditions": "if + past perfect, would + base verb",
  "unless and otherwise": "result + unless + clause | otherwise + result",
  "active voice": "subject + verb + object",
  "passive voice": "object + be + past participle",
  "focus shifts": "fronted phrase + sentence",
  "cleft sentences": "it is/was + focus + that + clause",
  "there and it subjects": "there is/are | it is/was",
  "ability": "can/could + base verb",
  "permission": "can/may + base verb",
  "obligation": "must/have to + base verb",
  "advice": "should/ought to + base verb",
  "possibility": "may/might + base verb",
  "probability": "will/probably + verb",
  "polite requests": "could you + base verb",
  "offers and invitations": "would you like + noun | would you like to + verb",
  "reporting statements": "said (that) + clause",
  "reporting questions": "asked + if/wh-word + clause",
  "reporting requests": "asked + to + verb",
  "reporting commands": "told + to + verb",
  "backshift basics": "present -> past, will -> would",
  "time place changes": "today -> that day, here -> there",
  "formal vs informal": "formal forms vs casual forms",
  "contractions": "I'm/you're vs I am/you are",
  "polite softening": "could/would + verb",
  "spoken vs written": "short spoken vs structured written",
  "professional style": "clear, neutral tone",
  "casual style": "simple, relaxed tone",
  "clarity and brevity": "short, direct sentences",
  "opening and closing": "greet + close",
  "topic shifts": "new topic + link",
  "cohesion tools": "this/that/these + noun",
  "sequencing ideas": "first/next/then",
  "clarification moves": "do you mean + ...",
  "summaries": "in short/in summary",
  "emphasis and repetition": "really + verb | do + verb",
  "conversation flow": "turn-taking signals",
  "giving examples": "for example + clause",
  "repair and correction": "sorry, I mean + ...",
};

const expandGrammarPoint = (point) => {
  const lower = point.toLowerCase();
  if (lower.includes("time")) {
    return `${point} (yesterday, at noon)`;
  }
  if (lower.includes("place")) {
    return `${point} (at the station, in the kitchen)`;
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
  if (lower.includes("article")) {
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
        labels: ["Subject: she", "Verb: reads", "Object: a book"],
        base: "She reads.",
        expanded: "She reads a book.",
      },
      {
        labels: ["Subject: The dog", "Verb: runs", "Place: in the park"],
        base: "The dog runs.",
        expanded: "The dog runs in the park.",
      },
      {
        labels: ["Subject: We", "Verb: made", "Object: dinner", "Place: at home"],
        base: "We made it.",
        expanded: "We made dinner at home.",
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
        expanded: "They named her captain today.",
      },
      {
        labels: [
          "Subject: My sister",
          "Verb: is",
          "Complement: a pilot",
          "Place: at the airport",
        ],
        base: "My sister is a pilot.",
        expanded: "My sister is a pilot at the airport.",
      },
      {
        labels: [
          "Subject: The room",
          "Verb: feels",
          "Complement: cold",
          "Time: after sunset",
        ],
        base: "The room feels cold.",
        expanded: "The room feels cold after sunset.",
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
      {
        labels: [
          "Subject: We",
          "Verb: talked",
          "Place: in the kitchen",
          "Time: after dinner",
        ],
        base: "We talked.",
        expanded: "We talked in the kitchen after dinner.",
      },
      {
        labels: [
          "Subject: I",
          "Verb: stayed",
          "Place: in the kitchen",
          "Time: after dinner",
          "Reason: because it was late",
        ],
        base: "I stayed.",
        expanded: "I stayed in the kitchen after dinner because it was late.",
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
      {
        labels: [
          "Main clause: She left early",
          "Connector: so",
          "Clause: she could rest",
        ],
        base: "She left early.",
        expanded: "She left early so she could rest.",
      },
      {
        labels: [
          "Main clause: We waited",
          "Connector: until",
          "Clause: the bus arrived",
        ],
        base: "We waited.",
        expanded: "We waited until the bus arrived.",
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
      {
        labels: [
          "Short sentence: He called me",
          "Long sentence: I missed it because I was busy",
        ],
        base: "He called me.",
        expanded: "He called me. I missed it because I was busy.",
      },
      {
        labels: [
          "Short sentence: We met",
          "Long sentence: We talked for a while after class",
        ],
        base: "We met.",
        expanded: "We met. We talked for a while after class.",
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
        labels: ["Verb: placed", "Preposition: on", "Object: the table"],
        base: "placed on the table",
        expanded: "He placed the book on the table.",
      },
    ];
  }
  if (title.includes("verb combinations")) {
    return [
      {
        labels: [
          "Verb: decided",
          "Infinitive: to stay",
          "Gerund: learning",
          "That clause: that it helps",
        ],
        base: "decided to stay, learning, that it helps",
        expanded: "We decided to stay, enjoy learning, and believe that it helps.",
      },
    ];
  }
  if (title.includes("phrasal verbs")) {
    return [
      {
        labels: ["Verb: turned", "Particle: off", "Object: the light"],
        base: "turned off the light",
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
        labels: ["Subject: She", "Be verb: is", "Verb-ing: working"],
        base: "She is working now.",
        expanded: "She is working now.",
      },
    ];
  }
  if (title.includes("past simple")) {
    return [
      {
        labels: ["Subject: They", "Past verb: visited"],
        base: "They visited Paris.",
        expanded: "They visited Paris.",
      },
    ];
  }
  if (title.includes("past continuous")) {
    return [
      {
        labels: ["Subject: I", "Be verb: was", "Verb-ing: cooking"],
        base: "I was cooking.",
        expanded: "I was cooking.",
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
        base: "She had left earlier.",
        expanded: "She had left earlier.",
      },
    ];
  }
  if (title.includes("future forms")) {
    return [
      {
        labels: ["Subject: We", "Future marker: will", "Base verb: meet"],
        base: "We will meet tomorrow.",
        expanded: "We will meet tomorrow.",
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
        expanded: "I work every day, I am working now, and I have worked here for years.",
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
        labels: ["Number: Two", "Noun: apples"],
        base: "Two apples are on the table.",
        expanded: "Two apples are on the table.",
      },
    ];
  }
  if (title.includes("uncountable nouns")) {
    return [
      {
        labels: ["Quantifier: Some", "Noun: rice"],
        base: "We need some rice.",
        expanded: "We need some rice.",
      },
    ];
  }
  if (title.includes("articles")) {
    return [
      {
        labels: ["Article: A", "Noun: dog"],
        base: "A dog is outside.",
        expanded: "A dog is outside.",
      },
    ];
  }
  if (title.includes("plural forms")) {
    return [
      {
        variantLabel: "Singular",
        labels: ["Singular noun: child", "Verb: is"],
        base: "The child is here.",
        expanded: "The child is here.",
      },
      {
        variantLabel: "Plural",
        labels: ["Plural noun: children", "Verb: are"],
        base: "The children are here.",
        expanded: "The children are here.",
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
        labels: ["Determiner: The", "Adjective: small", "Noun: table"],
        base: "The small table broke.",
        expanded: "The small table broke.",
      },
    ];
  }
  if (title.includes("quantifiers")) {
    return [
      {
        labels: ["Quantifier: many", "Noun: options"],
        base: "There are many options.",
        expanded: "There are many options.",
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
        labels: ["Subject pronoun: She", "Verb: is"],
        base: "She is.",
        expanded: "She is.",
      },
    ];
  }
  if (title.includes("object pronouns")) {
    return [
      {
        labels: ["Verb: saw", "Object pronoun: him"],
        base: "Saw him.",
        expanded: "Saw him.",
      },
    ];
  }
  if (title.includes("possessive forms")) {
    return [
      {
        labels: ["Possessive: her", "Noun: bag"],
        base: "her bag",
        expanded: "her bag",
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
        labels: ["Demonstrative: those", "Noun: keys"],
        base: "those keys",
        expanded: "those keys",
      },
    ];
  }
  if (title.includes("relative reference")) {
    return [
      {
        labels: ["Noun: man", "Relative: who", "Clause: called"],
        base: "the man who called",
        expanded: "the man who called",
      },
    ];
  }
  if (title.includes("indefinite reference")) {
    return [
      {
        labels: ["Indefinite: someone", "Verb: is"],
        base: "Someone is.",
        expanded: "Someone is.",
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
        labels: ["Adjective: quiet", "Noun: house"],
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
          "Age: old",
          "Color: red",
          "Noun: bag",
        ],
        base: "a lovely small old red bag",
        expanded: "She bought a lovely small old red bag.",
      },
    ];
  }
  if (title.includes("comparatives")) {
    return [
      {
        labels: ["Comparative: faster", "Than: than"],
        base: "faster than",
        expanded: "This is faster than that.",
      },
    ];
  }
  if (title.includes("superlatives")) {
    return [
      {
        labels: ["Article: the", "Superlative: tallest"],
        base: "the tallest",
        expanded: "He is the tallest.",
      },
    ];
  }
  if (title.includes("adverbs basics")) {
    return [
      {
        labels: ["Verb: speaks", "Adverb: clearly"],
        base: "speaks clearly",
        expanded: "She speaks clearly.",
      },
    ];
  }
  if (title.includes("frequency adverbs")) {
    return [
      {
        labels: ["Frequency adverb: usually", "Verb: wakes"],
        base: "usually wakes",
        expanded: "She usually wakes early.",
      },
    ];
  }
  if (title.includes("time and place adverbs")) {
    return [
      {
        labels: ["Place adverb: here", "Time adverb: yesterday"],
        base: "here yesterday",
        expanded: "We met here yesterday.",
      },
    ];
  }
  if (title.includes("degree words")) {
    return [
      {
        labels: ["Degree word: very", "Adjective: warm"],
        base: "very warm",
        expanded: "The room is very warm.",
      },
    ];
  }
  if (title.includes("participles")) {
    return [
      {
        labels: ["Participle: boring", "Noun: movie"],
        base: "boring movie",
        expanded: "The boring movie ended early.",
      },
    ];
  }
  if (title.includes("modifier stacking")) {
    return [
      {
        labels: ["Adverb: quickly", "Adjective: hard", "Noun: question"],
        base: "quickly hard question",
        expanded: "She quickly answered the hard question.",
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

const buildQuestionExamples = (card) => {
  const title = card.title.toLowerCase();
  if (title.includes("yes no questions")) {
    return [
      {
        labels: ["Aux: do", "Subject: you", "Base verb: work"],
        base: "do you work",
        expanded: "Do you work?",
      },
    ];
  }
  if (title.includes("wh questions")) {
    return [
      {
        labels: [
          "Wh word: where",
          "Aux: do",
          "Subject: you",
          "Base verb: live",
        ],
        base: "where do you live",
        expanded: "Where do you live?",
      },
    ];
  }
  if (title.includes("questions with be")) {
    return [
      {
        labels: ["Be verb: is", "Subject: the store", "Complement: open"],
        base: "is the store open",
        expanded: "Is the store open?",
      },
    ];
  }
  if (title.includes("questions with do")) {
    return [
      {
        labels: ["Aux: did", "Subject: she", "Base verb: call"],
        base: "did she call",
        expanded: "Did she call?",
      },
    ];
  }
  if (title.includes("questions with modals")) {
    return [
      {
        labels: ["Modal: could", "Subject: you", "Base verb: help"],
        base: "could you help",
        expanded: "Could you help?",
      },
    ];
  }
  if (title.includes("tag questions")) {
    return [
      {
        labels: ["Statement: you are ready", "Tag: aren't you"],
        base: "you are ready, aren't you",
        expanded: "You are ready, aren't you?",
      },
    ];
  }
  if (title.includes("indirect questions")) {
    return [
      {
        labels: ["Intro: could you tell me", "Wh clause: where it is"],
        base: "could you tell me where it is",
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
          "Complement: ready",
        ],
        base: "she is not ready",
        expanded: "She is not ready.",
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
  const explicitOrder = Array.isArray(card?.ruleOrder)
    ? card.ruleOrder.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  if (explicitOrder.length >= 2) {
    const expandedPoints = (card.points || []).map(expandGrammarPoint);
    const orderText = explicitOrder.join(" + ");
    return {
      order: orderText,
      bullets: expandedPoints,
      template: orderText,
    };
  }
  if (WORLD_KEY === "english" && title.includes("adding details")) {
    return {
      order: "(time) + (place)",
      bullets: [
        "add time phrases like at noon or yesterday",
        "add place phrases like at the station or in the kitchen",
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
    wrong: "Reads she a book.",
    fix: "She reads a book.",
  },
  "sentence parts": {
    wrong: "Is a pilot my brother.",
    fix: "My brother is a pilot.",
  },
  "adding details": {
    wrong: "She met him noon station.",
    fix: "She met him at noon at the station.",
  },
  "linking clauses": {
    wrong: "I stayed home because.",
    fix: "I stayed home because it rained.",
  },
  "sentence variety": {
    wrong: "We finished early so.",
    fix: "We finished early, so we left.",
  },
  "action verbs": {
    wrong: "She run every morning.",
    fix: "She runs every morning.",
  },
  "state verbs": {
    wrong: "He is knowing the answer.",
    fix: "He knows the answer.",
  },
  "linking verbs": {
    wrong: "The soup tastes is good.",
    fix: "The soup tastes good.",
  },
  "verb patterns": {
    wrong: "He placed the book on.",
    fix: "He placed the book on the table.",
  },
  "verb combinations": {
    wrong: "She enjoys to swim.",
    fix: "She enjoys swimming.",
  },
  "phrasal verbs": {
    wrong: "He turned the light on off.",
    fix: "He turned off the light.",
  },
  "present simple": {
    wrong: "She is work every day.",
    fix: "She works every day.",
  },
  "present continuous": {
    wrong: "She works now.",
    fix: "She is working now.",
  },
  "past simple": {
    wrong: "She go yesterday.",
    fix: "She went yesterday.",
  },
  "past continuous": {
    wrong: "She was cook when I called.",
    fix: "She was cooking when I called.",
  },
  "present perfect": {
    wrong: "She finished already.",
    fix: "She has finished already.",
  },
  "past perfect": {
    wrong: "He left when I arrive.",
    fix: "He had left when I arrived.",
  },
  "future forms": {
    wrong: "She will going to call.",
    fix: "She is going to call.",
  },
  "future continuous": {
    wrong: "She will work at 8.",
    fix: "She will be working at 8.",
  },
  "future perfect": {
    wrong: "She will finish by noon.",
    fix: "She will have finished by noon.",
  },
  "aspect contrasts": {
    wrong: "I am knowing him.",
    fix: "I know him.",
  },
  "countable nouns": {
    wrong: "She bought apple.",
    fix: "She bought an apple.",
  },
  "uncountable nouns": {
    wrong: "I need two breads.",
    fix: "I need some bread.",
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
    wrong: "She bought dress red.",
    fix: "She bought a red dress.",
  },
  "quantifiers": {
    wrong: "How much apples?",
    fix: "How many apples?",
  },
  "subject pronouns": {
    wrong: "Her is here.",
    fix: "She is here.",
  },
  "object pronouns": {
    wrong: "He saw I.",
    fix: "He saw me.",
  },
  "possessive forms": {
    wrong: "This is her book is.",
    fix: "This book is hers.",
  },
  "reflexive pronouns": {
    wrong: "I hurt me.",
    fix: "I hurt myself.",
  },
  "demonstratives": {
    wrong: "These book is mine.",
    fix: "This book is mine.",
  },
  "relative reference": {
    wrong: "The man which called me.",
    fix: "The man who called me.",
  },
  "indefinite reference": {
    wrong: "Anyone is here.",
    fix: "Someone is here.",
  },
  "adjectives basics": {
    wrong: "She has hair long.",
    fix: "She has long hair.",
  },
  "adjective order": {
    wrong: "A red small car.",
    fix: "A small red car.",
  },
  "comparatives": {
    wrong: "This is more cheap.",
    fix: "This is cheaper.",
  },
  "superlatives": {
    wrong: "He is the most fast.",
    fix: "He is the fastest.",
  },
  "adverbs basics": {
    wrong: "She speaks slow.",
    fix: "She speaks slowly.",
  },
  "frequency adverbs": {
    wrong: "She goes always early.",
    fix: "She always goes early.",
  },
  "time and place adverbs": {
    wrong: "He arrived yesterday here.",
    fix: "He arrived here yesterday.",
  },
  "degree words": {
    wrong: "It is enough hot.",
    fix: "It is hot enough.",
  },
  "participles": {
    wrong: "The story was boringed.",
    fix: "The story was boring.",
  },
  "modifier stacking": {
    wrong: "She bought a red small new bag.",
    fix: "She bought a small new red bag.",
  },
  "yes no questions": {
    wrong: "You like coffee?",
    fix: "Do you like coffee?",
  },
  "wh questions": {
    wrong: "Where you live?",
    fix: "Where do you live?",
  },
  "questions with be": {
    wrong: "You are ready?",
    fix: "Are you ready?",
  },
  "questions with do": {
    wrong: "She likes pizza?",
    fix: "Does she like pizza?",
  },
  "questions with modals": {
    wrong: "You can help me?",
    fix: "Can you help me?",
  },
  "tag questions": {
    wrong: "She is here, is she?",
    fix: "She is here, isn't she?",
  },
  "indirect questions": {
    wrong: "Can you tell me where is he?",
    fix: "Can you tell me where he is?",
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
    wrong: "He does notn't know.",
    fix: "He doesn't know.",
  },
  "negative words": {
    wrong: "I don't have nothing.",
    fix: "I don't have anything.",
  },
  "negative questions": {
    wrong: "You don't like it?",
    fix: "Don't you like it?",
  },
  "limited negatives": {
    wrong: "She hardly doesn't sleep.",
    fix: "She hardly sleeps.",
  },
  "basic connectors": {
    wrong: "I went and but stayed.",
    fix: "I went and stayed.",
  },
  "reason and result": {
    wrong: "I was late because the bus.",
    fix: "I was late because the bus was late.",
  },
  "contrast and choice": {
    wrong: "I like tea but also or coffee.",
    fix: "I like tea, but I also like coffee.",
  },
  "time connectors": {
    wrong: "I left before I will eat.",
    fix: "I left before I ate.",
  },
  "comparison links": {
    wrong: "She is like taller me.",
    fix: "She is taller than me.",
  },
  "adding ideas": {
    wrong: "He also went but too.",
    fix: "He also went.",
  },
  "ordering ideas": {
    wrong: "Finally, first we meet.",
    fix: "First we met, finally we left.",
  },
  "real conditions": {
    wrong: "If you will come, we meet.",
    fix: "If you come, we meet.",
  },
  "future conditions": {
    wrong: "If it will rain, we will stay.",
    fix: "If it rains, we will stay.",
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
    wrong: "If I studied, I would have the job now.",
    fix: "If I had studied, I would have the job now.",
  },
  "unless and otherwise": {
    wrong: "We will go unless it will rain.",
    fix: "We will go unless it rains.",
  },
  "active voice": {
    wrong: "The cake baked my mom.",
    fix: "My mom baked the cake.",
  },
  "passive voice": {
    wrong: "The report finished yesterday.",
    fix: "The report was finished yesterday.",
  },
  "focus shifts": {
    wrong: "This book I bought yesterday it.",
    fix: "This book, I bought yesterday.",
  },
  "cleft sentences": {
    wrong: "Was it she called.",
    fix: "It was she who called.",
  },
  "there and it subjects": {
    wrong: "Is a problem in the room.",
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
    wrong: "He probably to arrive late.",
    fix: "He will probably arrive late.",
  },
  "polite requests": {
    wrong: "Could you opens the door?",
    fix: "Could you open the door, please?",
  },
  "offers and invitations": {
    wrong: "Do you like to come?",
    fix: "Would you like to come?",
  },
  "reporting statements": {
    wrong: "She said me she is tired.",
    fix: "She said she was tired.",
  },
  "reporting questions": {
    wrong: "He asked where is the station.",
    fix: "He asked where the station was.",
  },
  "reporting requests": {
    wrong: "She asked me can I help.",
    fix: "She asked me to help.",
  },
  "reporting commands": {
    wrong: "He told me to went.",
    fix: "He told me to go.",
  },
  "backshift basics": {
    wrong: "She said she is ready.",
    fix: "She said she was ready.",
  },
  "time place changes": {
    wrong: "He said he will come here today.",
    fix: "He said he would come there that day.",
  },
  "formal vs informal": {
    wrong: "Hey, give me the report.",
    fix: "Hello, could you send the report?",
  },
  "contractions": {
    wrong: "I am late, do not wait.",
    fix: "I'm late, don't wait.",
  },
  "polite softening": {
    wrong: "Send me the file now.",
    fix: "Could you send me the file?",
  },
  "spoken vs written": {
    wrong: "In formal writing: I arrived lol.",
    fix: "In formal writing: I have arrived.",
  },
  "professional style": {
    wrong: "Hey, I need this ASAP.",
    fix: "Hello, I need this soon.",
  },
  "casual style": {
    wrong: "Dear Sir or Madam, what's up?",
    fix: "Hey, what's up?",
  },
  "clarity and brevity": {
    wrong: "Due to the fact that it is raining, we will not go.",
    fix: "It is raining, so we will not go.",
  },
  "opening and closing": {
    wrong: "I want to talk. Goodbye.",
    fix: "Hi, I wanted to talk. Thanks, goodbye.",
  },
  "topic shifts": {
    wrong: "By the way because schedule.",
    fix: "By the way, can we talk about the schedule?",
  },
  "cohesion tools": {
    wrong: "I bought a book. Book is new.",
    fix: "I bought a book. It is new.",
  },
  "sequencing ideas": {
    wrong: "First I left, then I woke up.",
    fix: "First I woke up, then I left.",
  },
  "clarification moves": {
    wrong: "What you said?",
    fix: "What do you mean?",
  },
  "summaries": {
    wrong: "In short, many things.",
    fix: "In short, we need more time.",
  },
  "emphasis and repetition": {
    wrong: "I do want to go not.",
    fix: "I do want to go.",
  },
  "conversation flow": {
    wrong: "Me too. And you is?",
    fix: "Me too. And you?",
  },
  "giving examples": {
    wrong: "For example, it is.",
    fix: "For example, it is useful for travel.",
  },
  "repair and correction": {
    wrong: "I mean, I am go.",
    fix: "Sorry, I mean I am going.",
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

const buildGrammarMistakes = (card, examples = []) => {
  const unique = [];
  const seen = new Set();
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
    pushMistake(card.mistakes[0]);
  }
  const sourceTitle = String(card.sourceTitle || card.title || "");
  const title = sourceTitle.toLowerCase();
  const pair = GRAMMAR_MISTAKES[title];
  if (unique.length === 0 && pair) {
    pushMistake(pair);
  }
  if (unique.length === 0) {
    pushMistake({
      wrong: "She not explain well.",
      fix: "She did not explain well.",
    });
  }
  if (unique.length < 2) {
    const preferredExample =
      examples[Math.min(unique.length, Math.max(0, examples.length - 1))] || examples[0];
    const generatedMistake = buildMistakeFromExample(preferredExample);
    if (generatedMistake) {
      pushMistake(generatedMistake);
    }
  }
  return unique.slice(0, 2);
};

const getGrammarUiLabels = () => ({
  grammar: "Grammar",
  chooseSection: "Choose a section",
  allSections: "All sections",
  rules: "Rules",
  examples: "Examples",
  commonMistakes: "Common mistakes",
  wrong: "Wrong:",
  fix: "Fix:",
  phrase: "Phrase:",
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

  const grammarTranslationLanguage = readMapsBaseLanguagePreference();
  const shouldTranslateExplanation =
    !!grammarTranslationLanguage &&
    !isWorldNativeBaseLanguage(grammarTranslationLanguage);
  const explanation =
    String(cardData?.explanation || "").trim() || buildGrammarExplanation(cardData);
  const explanationTranslation = shouldTranslateExplanation
    ? resolveGrammarExplanation(section, explanation, grammarTranslationLanguage)
    : "";
  const howItWorks = buildGrammarHowItWorks(cardData);
  const shouldCapPhrase = true;
  const grammarUi = getGrammarUiLabels();

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
    modalityExamples;
  const rawExamples = activeExamples || buildGenericExamplePairs(cardData, index, section);
  const exampleItems = ensureTwoGrammarExamples(rawExamples, cardData, section, index);
  const limitedExamples = exampleItems.slice(0, 1);
  const mistakes = buildGrammarMistakes(cardData, limitedExamples);
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
    <div class="grammar-modal-header">
      <h3>${cardData.title}</h3>
      <p class="grammar-explanation-text">${explanation}</p>
      ${shouldTranslateExplanation && explanationTranslation ? `<p class="grammar-translation grammar-explanation-translation">${explanationTranslation}</p>` : ""}
    </div>
    <div class="grammar-modal-grid">
      <div class="grammar-block">
        <h4>${grammarUi.rules}</h4>
        <ul>
          ${(howItWorks.bullets || []).map((item) => `<li>${item}</li>`).join("")}
        </ul>
        ${howItWorks.template ? `<div class="grammar-template">${howItWorks.template}</div>` : ""}
      </div>
      <div class="grammar-block">
        <h4>${grammarUi.examples}</h4>
        ${renderedExamples}
      </div>
      <div class="grammar-block">
        <h4>${grammarUi.commonMistakes}</h4>
        <ul>
          ${limitedMistakes
            .map(
              (mistake) =>
                `<li><span class="mistake-wrong">${grammarUi.wrong}</span> ${mistake.wrong}</li>
                 <li><span class="mistake-fix">${grammarUi.fix}</span> ${mistake.fix}</li>`
            )
            .join("")}
        </ul>
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
};


const openGrammarModal = (section, index) => {
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
    translationEl.textContent = resolveWordTranslation(section, word, baseLanguage);
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
    if (button.dataset.filter === "all") {
      ensureFilterButtonMainText(button, "All");
      setFilterButtonTranslationText(button, "");
      return;
    }
    const mainText = String(
      button.querySelector(".words-filter-main")?.textContent || ""
    ).trim();
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

    if (isNonEnglishWorld && mapKey === "grammar") {
      translationNode.textContent = "";
      translationNode.hidden = true;
      return;
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
  if (!sectionKey || !langKey || !phrase || langKey === "english") {
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
  if (!translation && worldEntry?.intent) {
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
    if (
      !resolved &&
      worldEntry?.intent &&
      baseLanguage &&
      String(baseLanguage).trim().toLowerCase() !== "english" &&
      !isWorldNativeBaseLanguage(baseLanguage)
    ) {
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
    if (isWordsPage) {
      applyWorldSectionTitleLabels("words");
    }
    if (document.querySelector(".word-card")) {
      applyWordTranslations();
    }
    if (isWordsPage) {
      applySectionTitleTranslations("words");
      applySectionFilterButtonTranslations("words");
    }
    if (isPhrasesPage) {
      applyWorldSectionTitleLabels("phrases");
    }
    if (document.querySelector(".phrase-card")) {
      applyPhraseTranslations();
    }
    if (isPhrasesPage) {
      applySectionTitleTranslations("phrases");
      applySectionFilterButtonTranslations("phrases");
    }
    if (isGrammarPage) {
      applyWorldSectionTitleLabels("grammar");
      applySectionTitleTranslations("grammar");
      applySectionFilterButtonTranslations("grammar");
      applyGrammarCardTitleTranslations();
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

  ensureTranslationsLoaded({ awaitNetwork: isNonEnglishWorld || isGrammarPage }).finally(
    refreshRenderedMaps
  );
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
  needsMapTranslations && isNonEnglishWorld && !cachedWorldTranslations;

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
  applyWordTranslations();
}
if (!shouldRenderLoadingSkeleton && isWordsPage) {
  applyWorldSectionTitleLabels("words");
  applySectionTitleTranslations("words");
  applySectionFilterButtonTranslations("words");
}
if (!shouldRenderLoadingSkeleton && isPhrasesPage && document.querySelector(".phrase-card")) {
  applyPhraseTranslations();
}
if (!shouldRenderLoadingSkeleton && isPhrasesPage) {
  applyWorldSectionTitleLabels("phrases");
  applySectionTitleTranslations("phrases");
  applySectionFilterButtonTranslations("phrases");
}
if (!shouldRenderLoadingSkeleton && isGrammarPage) {
  applyWorldSectionTitleLabels("grammar");
  applySectionTitleTranslations("grammar");
  applySectionFilterButtonTranslations("grammar");
  applyGrammarCardTitleTranslations();
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
        if (isWordsPage && document.querySelector(".word-card")) {
          applyWordTranslations();
        }
        if (isWordsPage) {
          applyWorldSectionTitleLabels("words");
          applySectionTitleTranslations("words");
          applySectionFilterButtonTranslations("words");
        }
        if (isPhrasesPage && document.querySelector(".phrase-card")) {
          applyPhraseTranslations();
        }
        if (isPhrasesPage) {
          applyWorldSectionTitleLabels("phrases");
          applySectionTitleTranslations("phrases");
          applySectionFilterButtonTranslations("phrases");
        }
        if (isGrammarPage) {
          applyWorldSectionTitleLabels("grammar");
          applySectionTitleTranslations("grammar");
          applySectionFilterButtonTranslations("grammar");
          applyGrammarCardTitleTranslations();
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
