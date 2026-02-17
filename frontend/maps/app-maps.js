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
  if (WORLD_KEY === "french") {
    const worldLabel = WORLD_TRANSLATIONS?.grammar?.sectionLabels?.[section];
    if (typeof worldLabel === "string" && worldLabel.trim()) {
      return worldLabel.trim();
    }
  }
  return section;
};

const getWorldSectionLabelFromPack = (mapType, section) => {
  const labels = WORLD_TRANSLATIONS?.[mapType]?.sectionLabels;
  if (!labels || typeof labels !== "object") {
    return "";
  }
  const value = labels?.[section];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return "";
};

const getGrammarCardsForSection = (section) => {
  const worldCards = WORLD_TRANSLATIONS?.grammar?.cards?.[section];
  if (Array.isArray(worldCards) && worldCards.length) {
    return worldCards;
  }
  return GRAMMAR_SECTION_LISTS[section] || [];
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
  return cards[numericIndex] || null;
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
        WORLD_TRANSLATIONS = null;
        return;
      }
      if (data?.worldLanguage) {
        WORLD_TRANSLATIONS = data;
        if (needsGrammarDetails) {
          buildWorldGrammarMaps();
          hydrateGrammarExplanationTranslations(data);
        }
      }
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
    if (!words) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section words-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${sectionName}</h2>`;
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
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = "Words";
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = "Choose a section";
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton("All sections", "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("words-page")) {
      document.body.dataset.wordsFilter = "all";
    }

    WORD_SECTION_ORDER.forEach((sectionName) => {
      const displayName = sectionName === "countries" ? "Countries" : sectionName;
      list.appendChild(makeButton(displayName, sectionName));
    });

    const applyFilter = (filter) => {
      if (document.body.classList.contains("words-page")) {
        document.body.dataset.wordsFilter = filter;
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
      updateWordsTopState();
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
    if (!phrases) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section phrases-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${sectionName}</h2>`;
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
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = "Phrases";
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = "Choose a section";
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton("All sections", "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("phrases-page")) {
      document.body.dataset.phrasesFilter = "all";
    }

    PHRASE_SECTION_ORDER.forEach((sectionName) => {
      list.appendChild(makeButton(sectionName, sectionName));
    });

    const applyFilter = (filter) => {
      if (document.body.classList.contains("phrases-page")) {
        document.body.dataset.phrasesFilter = filter;
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
      updatePhrasesTopState();
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
    if (!concepts) {
      return;
    }
    const section = document.createElement("section");
    section.className = "section grammar-group reveal";
    section.dataset.section = sectionName;
    const title = document.createElement("div");
    title.className = "section-title";
    title.innerHTML = `<h2>${getWorldGrammarSectionLabel(sectionName)}</h2>`;
    const grid = document.createElement("div");
    grid.className = "words-grid";
    concepts.forEach((concept, conceptIndex) => {
      const card = document.createElement("div");
      card.className = "card grammar-card";
      card.dataset.concept = concept.title;
      card.dataset.section = sectionName;
      card.dataset.index = String(conceptIndex);
      const hasWorldCards =
        !!WORLD_TRANSLATIONS?.grammar?.cards?.[sectionName]?.length;
      const displayTitle = hasWorldCards
        ? concept.title
        : getWorldGrammarTitle(sectionName, concept.title);
      card.innerHTML = `<div class="grammar-text">${displayTitle}</div>`;
      grid.appendChild(card);
    });
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
    sections.push(section);
  });

  if (controls) {
    const grammarUi = getGrammarUiLabels();
    const eyebrow = document.createElement("div");
    eyebrow.className = "words-controls-eyebrow";
    eyebrow.textContent = grammarUi.grammar;
    const label = document.createElement("div");
    label.className = "words-controls-label";
    label.textContent = grammarUi.chooseSection;
    const list = document.createElement("div");
    list.className = "words-controls-list";

    const makeButton = (title, value) => {
      const button = document.createElement("button");
      button.className = "words-filter";
      button.type = "button";
      button.dataset.filter = value;
      button.textContent = title;
      return button;
    };

    const allButton = makeButton(grammarUi.allSections, "all");
    allButton.classList.add("is-all");
    allButton.classList.add("is-active");
    list.appendChild(allButton);
    if (document.body.classList.contains("grammar-page")) {
      document.body.dataset.grammarFilter = "all";
    }

    GRAMMAR_SECTION_ORDER.forEach((sectionName) => {
      list.appendChild(makeButton(getWorldGrammarSectionLabel(sectionName), sectionName));
    });

    const applyFilter = (filter) => {
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

const buildGrammarExplanation = (card) => {
  if (WORLD_KEY === "french") {
    return `Cette carte explique ${card.title} et son usage correct dans des phrases réelles.`;
  }
  return `This card explains ${card.title} and how to form it clearly in real sentences.`;
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
        labels: ["Plural noun: boxes"],
        base: "The boxes are heavy.",
        expanded: "The boxes are heavy.",
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
        labels: ["Unless clause: unless it rains", "Result clause: we will go"],
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

const getExampleLabelClass = (label) => {
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

const buildWordBoundaryPattern = (phrase) => {
  const escaped = escapeRegExp(phrase);
  const startsWord = /^\w/.test(phrase);
  const endsWord = /\w$/.test(phrase);
  const prefix = startsWord ? "\\b" : "";
  const suffix = endsWord ? "\\b" : "";
  return new RegExp(`${prefix}${escaped}${suffix}`, "i");
};

const applyGrammarHighlights = (sentence, labels = []) => {
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
    const type = normalizeLabelType(label);
    const pattern = buildWordBoundaryPattern(phrase);
    if (!pattern.test(output)) {
      return;
    }
    output = output.replace(
      pattern,
      (match) => `<span class="highlight highlight-${type}">${match}</span>`
    );
  });
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

const buildGenericExamplePairs = (cardData, index, sectionName = "") => {
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
  if (title.includes("adding details")) {
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

const buildGrammarMistakes = (card) => {
  if (Array.isArray(card.mistakes) && card.mistakes.length) {
    return card.mistakes;
  }
  const sourceTitle = String(card.sourceTitle || card.title || "");
  const title = sourceTitle.toLowerCase();
  const pair = GRAMMAR_MISTAKES[title];
  if (pair) {
    return [pair];
  }
  return [
    {
      wrong: "She not explain well.",
      fix: "She did not explain well.",
    },
  ];
};

const getGrammarUiLabels = () => {
  if (WORLD_KEY === "french") {
    return {
      grammar: "Grammaire",
      chooseSection: "Choisissez une section",
      allSections: "Toutes les sections",
      rules: "Règles",
      examples: "Exemples",
      commonMistakes: "Erreurs courantes",
      wrong: "Incorrect :",
      fix: "Correction :",
      phrase: "Phrase :",
      order: "Ordre :",
    };
  }
  return {
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
  };
};

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

  const shouldTranslateExplanation = false;
  const grammarTranslationLanguage = "";
  const explanation = buildGrammarExplanation(cardData);
  const explanationTranslation = "";
  const mistakes = buildGrammarMistakes(cardData);
  const howItWorks = buildGrammarHowItWorks(cardData);
  const examples = [cardData.example, buildAltGrammarExample(cardData, index)];
  const shouldCapPhrase = true;
  const grammarUi = getGrammarUiLabels();

  let renderedExamples = "";
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
  if (activeExamples) {
    const item = activeExamples[0];
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
    renderedExamples = `
      <div class="grammar-example">
        <div class="grammar-example-labels">
          ${item.labels
            .map((label) => `<span class="grammar-label ${getExampleLabelClass(label)}">${localizeGrammarChipLabel(getExampleLabelText(label))}</span>`)
            .join("")}
        </div>
        <div class="grammar-example-expanded">${grammarUi.phrase} ${applyGrammarHighlights(expandedText, item.labels)}</div>
        ${exampleTranslation ? `<div class="grammar-translation">${exampleTranslation}</div>` : ""}
      </div>
    `;
  } else {
    const genericPairs = buildGenericExamplePairs(cardData, index, section);
    renderedExamples = genericPairs
      .map((item) => {
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
        return `
          <div class="grammar-example">
            <div class="grammar-example-labels">
              ${item.labels
                .map((label) => `<span class="grammar-label ${getExampleLabelClass(label)}">${localizeGrammarChipLabel(getExampleLabelText(label))}</span>`)
                .join("")}
            </div>
            <div class="grammar-example-expanded">${grammarUi.phrase} ${applyGrammarHighlights(expandedText, item.labels)}</div>
            ${exampleTranslation ? `<div class="grammar-translation">${exampleTranslation}</div>` : ""}
          </div>
        `;
      })
      .join("");
  }

  modalBody.innerHTML = `
    <div class="grammar-modal-header">
      <h3>${cardData.title}</h3>
      <p class="grammar-explanation-text">${explanation}</p>
      ${shouldTranslateExplanation && explanationTranslation ? `<p class="grammar-translation grammar-explanation-translation">${explanationTranslation}</p>` : ""}
    </div>
    <div class="grammar-modal-grid">
      <div class="grammar-block">
        <h4>${grammarUi.rules}</h4>
        ${howItWorks.order ? `<div class="grammar-order">${grammarUi.order} ${howItWorks.order}</div>` : ""}
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
          ${mistakes
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

const resolveWordTranslation = (section, englishWord, baseLanguage) => {
  if (!baseLanguage || !translationPayloadReady) {
    return "";
  }
  const sectionKey = section || WORD_SECTION_ORDER[0];
  const wordKey = (englishWord || "").toLowerCase();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const aliasSource =
    WORD_TRANSLATION_ALIASES[normalizeWordLookupKey(englishWord)] || "";
  let translation = "";

  const worldSection = WORLD_TRANSLATIONS?.words?.[sectionKey] || {};
  const worldEntry =
    worldSection?.[wordKey] || resolveEntryByNormalizedKey(worldSection, englishWord);
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
  const baseLanguage = String(localStorage.getItem("cosmicaBaseLanguage") || "").trim();
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

const requestRuntimePhraseTranslation = async (section, phraseText, baseLanguage) => {
  const sectionKey = String(section || PHRASE_SECTION_ORDER[0]).trim();
  const langKey = String(baseLanguage || "").trim().toLowerCase();
  const phrase = String(phraseText || "").trim();
  if (!sectionKey || !langKey || !phrase || langKey === "english") {
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

const resolvePhraseTranslation = (section, englishPhrase, baseLanguage) => {
  if (!baseLanguage || !translationPayloadReady) {
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
  const baseLanguage = String(localStorage.getItem("cosmicaBaseLanguage") || "").trim();
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
    const resolved = resolvePhraseTranslation(section, phrase, baseLanguage);
    translationEl.textContent = resolved;
    if (
      !resolved &&
      worldEntry?.intent &&
      baseLanguage &&
      String(baseLanguage).trim().toLowerCase() !== "english"
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
  const selectedBaseLanguage = String(
    localStorage.getItem("cosmicaBaseLanguage") || ""
  )
    .trim()
    .toLowerCase();
  const shouldPrioritizeTranslations =
    !!selectedBaseLanguage && selectedBaseLanguage !== "english";

  const refreshRenderedMaps = () => {
    if (document.querySelector(".word-card")) {
      applyWordTranslations();
    }
    if (document.querySelector(".phrase-card")) {
      applyPhraseTranslations();
    }
    if (isGrammarPage) {
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
if (typeof initializeCommonShell === "function") {
  initializeCommonShell();
}
if (isWordsPage && document.querySelector(".word-card")) {
  applyWordTranslations();
}
if (isPhrasesPage && document.querySelector(".phrase-card")) {
  applyPhraseTranslations();
}
if (isWordsPage) {
  updateWordsTopState();
  window.addEventListener(
    "scroll",
    () => {
      window.requestAnimationFrame(updateWordsTopState);
    },
    { passive: true }
  );
}
if (isPhrasesPage) {
  updatePhrasesTopState();
  window.addEventListener(
    "scroll",
    () => {
      window.requestAnimationFrame(updatePhrasesTopState);
    },
    { passive: true }
  );
}
if (isGrammarPage) {
  updateGrammarTopState();
  window.addEventListener(
    "scroll",
    () => {
      window.requestAnimationFrame(updateGrammarTopState);
    },
    { passive: true }
  );
}

if (needsMapTranslations) {
  const selectedBaseLanguage = String(
    localStorage.getItem("cosmicaBaseLanguage") || ""
  )
    .trim()
    .toLowerCase();
  const shouldPrioritizeTranslations =
    !!selectedBaseLanguage && selectedBaseLanguage !== "english";
  const shouldAwaitNetworkHydration =
    isNonEnglishWorld || (shouldPrioritizeTranslations && isGrammarPage);

  const refreshAfterTranslations = () => {
    ensureTranslationsLoaded({ awaitNetwork: shouldAwaitNetworkHydration }).then(() => {
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
      if (isPhrasesPage && document.querySelector(".phrase-card")) {
        applyPhraseTranslations();
      }
      if (isGrammarPage) {
        prewarmGrammarExplanationTranslations();
        const overlay = ensureGrammarOverlay();
        if (overlay && typeof overlay.__refresh === "function") {
          overlay.__refresh();
        }
      }
    });
  };

  if (shouldPrioritizeTranslations) {
    refreshAfterTranslations();
  } else {
    runWhenBrowserIdle(refreshAfterTranslations);
  }
}














