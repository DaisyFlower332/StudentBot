export type VocabWord = {
  word: string;
  definition: string;
  keywords: string[];
};

export const HANGMAN_WORDS: VocabWord[] = [
  { word: "CURIOUS", definition: "Eager to learn or know about something.", keywords: ["eager", "learn", "know", "interested", "wonder"] },
  { word: "FRAGILE", definition: "Easily broken or damaged.", keywords: ["break", "broken", "damage", "delicate", "weak"] },
  { word: "VOYAGE", definition: "A long journey, usually by sea or in space.", keywords: ["journey", "trip", "travel", "sea", "ocean", "space"] },
  { word: "GIGANTIC", definition: "Extremely large.", keywords: ["huge", "big", "large", "massive", "enormous"] },
  { word: "HARVEST", definition: "The time when crops are gathered from the fields.", keywords: ["crop", "crops", "gather", "collect", "farm", "field"] },
  { word: "BRAVE", definition: "Showing courage and not being afraid.", keywords: ["courage", "fearless", "bold", "not afraid"] },
  { word: "MYSTERY", definition: "Something that is hard to understand or explain.", keywords: ["unknown", "secret", "puzzle", "hard to explain"] },
  { word: "PLANET", definition: "A large round object in space that moves around a star.", keywords: ["space", "star", "orbit", "round", "world"] },
  { word: "VOLCANO", definition: "A mountain with an opening that lava can come out of.", keywords: ["lava", "mountain", "erupt", "magma"] },
  { word: "JOURNAL", definition: "A book where you write down your thoughts or what you did.", keywords: ["diary", "book", "write", "thoughts", "notes"] },
  { word: "INVENT", definition: "To make or design something completely new.", keywords: ["create", "make", "design", "new", "build"] },
  { word: "RECYCLE", definition: "To use something again instead of throwing it away.", keywords: ["reuse", "use again", "waste", "environment"] },
  { word: "GENTLE", definition: "Kind and careful, not rough.", keywords: ["kind", "soft", "careful", "calm", "not rough"] },
  { word: "EXPLORE", definition: "To travel through a place to learn about it.", keywords: ["discover", "travel", "search", "find", "investigate"] },
  { word: "HONEST", definition: "Always telling the truth and not cheating.", keywords: ["truth", "truthful", "not lying", "trustworthy"] },
  { word: "PUZZLE", definition: "A game or problem you have to think hard to solve.", keywords: ["problem", "solve", "think", "riddle", "tricky"] },
  { word: "RESCUE", definition: "To save someone or something from danger.", keywords: ["save", "help", "danger", "free"] },
  { word: "ANCIENT", definition: "Very old, from a time long ago.", keywords: ["old", "long ago", "history", "past"] },
  { word: "GLIMMER", definition: "A faint or small light that shines a little.", keywords: ["shine", "light", "sparkle", "glow", "twinkle"] },
  { word: "BREEZE", definition: "A light, gentle wind.", keywords: ["wind", "air", "blow", "light wind"] },
  { word: "TIMID", definition: "Shy and easily frightened.", keywords: ["shy", "scared", "nervous", "afraid", "frightened"] },
  { word: "WHISPER", definition: "To speak very quietly so only nearby people can hear.", keywords: ["quiet", "soft voice", "speak quietly", "low voice"] },
  { word: "GRATEFUL", definition: "Feeling thankful for something.", keywords: ["thankful", "thanks", "appreciate", "blessed"] },
  { word: "CLEVER", definition: "Quick at learning and understanding things.", keywords: ["smart", "intelligent", "bright", "quick", "wise"] },
  { word: "GLOOMY", definition: "Dark, dull, or unhappy.", keywords: ["sad", "dark", "dull", "unhappy", "miserable", "dim"] },
  { word: "STURDY", definition: "Strong and not easily broken.", keywords: ["strong", "tough", "solid", "firm", "not broken"] },
  { word: "BLOSSOM", definition: "A flower on a tree or plant.", keywords: ["flower", "bloom", "petal", "spring", "tree"] },
  { word: "GLACIER", definition: "A huge slow-moving river of ice.", keywords: ["ice", "frozen", "snow", "mountain", "cold"] },
  { word: "DESERT", definition: "A very dry place, often sandy and hot.", keywords: ["dry", "sand", "hot", "no water", "barren"] },
  { word: "FOREST", definition: "A large area of land covered with trees.", keywords: ["trees", "woods", "wood", "wildlife", "wild"] },
  { word: "SCIENTIST", definition: "A person who studies how the world works.", keywords: ["study", "research", "experiment", "lab", "discover"] },
  { word: "MUSEUM", definition: "A place where interesting old or special things are kept.", keywords: ["history", "art", "exhibit", "old things", "display"] },
  { word: "LIBRARY", definition: "A place full of books you can read or borrow.", keywords: ["books", "read", "borrow", "study", "quiet"] },
  { word: "TELESCOPE", definition: "A tube you look through to see faraway things like stars.", keywords: ["stars", "space", "see far", "lens", "astronomy"] },
  { word: "MAGNET", definition: "An object that pulls iron and steel toward it.", keywords: ["pull", "iron", "metal", "attract", "force"] },
  { word: "HABITAT", definition: "The natural home of an animal or plant.", keywords: ["home", "live", "environment", "ecosystem", "nature"] },
  { word: "GENEROUS", definition: "Willing to share and give to others.", keywords: ["sharing", "giving", "kind", "selfless"] },
  { word: "BRILLIANT", definition: "Extremely bright or very clever.", keywords: ["bright", "smart", "shining", "amazing", "clever"] },
  { word: "ENORMOUS", definition: "Very, very big.", keywords: ["huge", "big", "large", "massive", "giant"] },
  { word: "DELICATE", definition: "Easily broken and needing gentle care.", keywords: ["fragile", "soft", "careful", "tender", "weak"] },
  { word: "TRADITION", definition: "Something families or groups have done for many years.", keywords: ["custom", "habit", "passed down", "culture", "old"] },
  { word: "CONFIDENT", definition: "Sure of yourself and what you can do.", keywords: ["sure", "self belief", "bold", "trust"] },
  { word: "JOURNEY", definition: "A trip from one place to another.", keywords: ["trip", "travel", "voyage", "journey"] },
  { word: "WANDER", definition: "To walk slowly without a clear plan.", keywords: ["walk", "roam", "stroll", "no plan", "explore"] },
  { word: "BUDGET", definition: "A plan for how to spend or save money.", keywords: ["money", "save", "spend", "plan", "finance"] },
  { word: "HARMONY", definition: "When things go well together peacefully.", keywords: ["peace", "agree", "together", "music", "balance"] },
  { word: "CRYSTAL", definition: "A clear, hard, shiny mineral with flat sides.", keywords: ["clear", "shiny", "mineral", "rock", "gem"] },
  { word: "RIDDLE", definition: "A clever question that needs thinking to answer.", keywords: ["puzzle", "question", "trick", "clever", "wordplay"] },
  { word: "POWERFUL", definition: "Having a lot of strength or control.", keywords: ["strong", "mighty", "force", "energy"] },
  { word: "FRIENDLY", definition: "Behaving in a kind and helpful way.", keywords: ["kind", "nice", "helpful", "warm", "welcoming"] },
];

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export const QUIZ_GENERAL: QuizQuestion[] = [
  { question: "What is the capital of France?", options: ["Berlin", "Paris", "Madrid", "Rome"], correctIndex: 1 },
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 },
  { question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correctIndex: 2 },
  { question: "What do bees collect from flowers?", options: ["Pollen", "Sugar", "Salt", "Water"], correctIndex: 0 },
  { question: "Which animal is known as the king of the jungle?", options: ["Tiger", "Elephant", "Lion", "Bear"], correctIndex: 2 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctIndex: 3 },
  { question: "Who painted the Mona Lisa?", options: ["Picasso", "Leonardo da Vinci", "Van Gogh", "Michelangelo"], correctIndex: 1 },
  { question: "How many days are in a leap year?", options: ["365", "366", "364", "367"], correctIndex: 1 },
  { question: "Which gas do plants take in to make food?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], correctIndex: 2 },
  { question: "What is the tallest mountain in the world?", options: ["K2", "Mount Everest", "Kilimanjaro", "Mont Blanc"], correctIndex: 1 },
  { question: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Osaka"], correctIndex: 2 },
  { question: "Which is the smallest planet in our solar system?", options: ["Mercury", "Mars", "Venus", "Pluto"], correctIndex: 0 },
  { question: "What do you call a baby kangaroo?", options: ["Cub", "Joey", "Calf", "Kit"], correctIndex: 1 },
  { question: "Which country has the Eiffel Tower?", options: ["Italy", "Spain", "France", "Germany"], correctIndex: 2 },
  { question: "How many colours are in a rainbow?", options: ["5", "6", "7", "8"], correctIndex: 2 },
  { question: "Which body part pumps blood?", options: ["Brain", "Lungs", "Liver", "Heart"], correctIndex: 3 },
  { question: "What is H2O better known as?", options: ["Salt", "Water", "Sugar", "Hydrogen"], correctIndex: 1 },
  { question: "Which animal is the fastest on land?", options: ["Lion", "Cheetah", "Horse", "Greyhound"], correctIndex: 1 },
  { question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctIndex: 1 },
  { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "Mark Twain", "William Shakespeare", "Jane Austen"], correctIndex: 2 },
  { question: "Which is the hottest planet in our solar system?", options: ["Mercury", "Venus", "Mars", "Jupiter"], correctIndex: 1 },
  { question: "What do caterpillars turn into?", options: ["Bees", "Butterflies", "Beetles", "Birds"], correctIndex: 1 },
  { question: "Which country is home to the Great Wall?", options: ["Japan", "Korea", "China", "India"], correctIndex: 2 },
  { question: "How many bones are in the adult human body (about)?", options: ["106", "186", "206", "306"], correctIndex: 2 },
  { question: "What is the freezing point of water in Celsius?", options: ["0", "32", "100", "-10"], correctIndex: 0 },
  { question: "Which sea creature has eight arms?", options: ["Squid", "Octopus", "Starfish", "Crab"], correctIndex: 1 },
  { question: "What do you call a person who studies the stars?", options: ["Geologist", "Biologist", "Astronomer", "Chemist"], correctIndex: 2 },
  { question: "Which language has the most native speakers?", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"], correctIndex: 2 },
  { question: "What is a group of lions called?", options: ["Pack", "Pride", "Herd", "Flock"], correctIndex: 1 },
  { question: "Which is the largest desert in the world?", options: ["Sahara", "Gobi", "Antarctic", "Kalahari"], correctIndex: 2 },
];

export const QUIZ_MATHS: QuizQuestion[] = [
  { question: "What is 7 x 8?", options: ["54", "56", "58", "64"], correctIndex: 1 },
  { question: "What is half of 48?", options: ["18", "22", "24", "26"], correctIndex: 2 },
  { question: "Which of these is a prime number?", options: ["9", "15", "11", "21"], correctIndex: 2 },
  { question: "What is 1/4 of 100?", options: ["20", "25", "40", "50"], correctIndex: 1 },
  { question: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], correctIndex: 1 },
  { question: "What is 144 \u00f7 12?", options: ["10", "11", "12", "14"], correctIndex: 2 },
  { question: "Which is bigger: 0.5 or 0.45?", options: ["0.5", "0.45", "They are equal", "Cannot tell"], correctIndex: 0 },
  { question: "The perimeter of a square with side 5 cm is...", options: ["10 cm", "15 cm", "20 cm", "25 cm"], correctIndex: 2 },
  { question: "What is 9 squared?", options: ["18", "72", "81", "99"], correctIndex: 2 },
  { question: "What is the next number: 2, 4, 8, 16, ...?", options: ["18", "24", "32", "20"], correctIndex: 2 },
  { question: "What is 12 x 12?", options: ["120", "132", "144", "164"], correctIndex: 2 },
  { question: "Which fraction is equal to 1/2?", options: ["3/5", "4/8", "2/6", "5/12"], correctIndex: 1 },
  { question: "What is 25% of 80?", options: ["10", "15", "20", "25"], correctIndex: 2 },
  { question: "How many degrees are in a triangle?", options: ["90", "180", "270", "360"], correctIndex: 1 },
  { question: "Which shape has 4 equal sides and 4 right angles?", options: ["Rectangle", "Rhombus", "Square", "Trapezium"], correctIndex: 2 },
  { question: "What is 6 x 9?", options: ["48", "54", "56", "63"], correctIndex: 1 },
  { question: "Round 47 to the nearest 10.", options: ["40", "45", "50", "60"], correctIndex: 2 },
  { question: "What is 100 - 37?", options: ["53", "63", "67", "73"], correctIndex: 1 },
  { question: "Which is the smallest? 0.7, 0.07, 0.77, 0.707", options: ["0.7", "0.07", "0.77", "0.707"], correctIndex: 1 },
  { question: "What is 3/4 + 1/4?", options: ["1/2", "1", "3/8", "4/8"], correctIndex: 1 },
  { question: "How many minutes are in 2 hours?", options: ["100", "110", "120", "150"], correctIndex: 2 },
  { question: "If 5x = 35, what is x?", options: ["5", "6", "7", "8"], correctIndex: 2 },
  { question: "What is 8 \u00f7 0.5?", options: ["4", "8", "12", "16"], correctIndex: 3 },
  { question: "How many sides does an octagon have?", options: ["6", "7", "8", "10"], correctIndex: 2 },
  { question: "What is the area of a rectangle 4 cm by 6 cm?", options: ["10 cm\u00b2", "20 cm\u00b2", "24 cm\u00b2", "30 cm\u00b2"], correctIndex: 2 },
  { question: "Which is an even number?", options: ["17", "23", "31", "46"], correctIndex: 3 },
  { question: "What is 0.1 written as a fraction?", options: ["1/100", "1/10", "1/1000", "10/1"], correctIndex: 1 },
  { question: "What is 11 x 11?", options: ["111", "121", "131", "144"], correctIndex: 1 },
  { question: "How many faces does a cube have?", options: ["4", "5", "6", "8"], correctIndex: 2 },
  { question: "What is 200 - 56?", options: ["134", "144", "146", "154"], correctIndex: 1 },
];

export type ImposterScenario = {
  topic: string;
  insiderWords: string[];
  decoyWords: string[];
};

export const IMPOSTER_SCENARIOS: ImposterScenario[] = [
  {
    topic: "Photosynthesis",
    insiderWords: ["sunlight", "leaves", "chlorophyll", "oxygen", "water", "carbon dioxide", "green", "energy", "glucose", "plants"],
    decoyWords: ["growing", "outside", "important", "natural", "warm", "alive", "nature", "useful"],
  },
  {
    topic: "Fractions",
    insiderWords: ["numerator", "denominator", "half", "quarter", "equivalent", "simplify", "pizza slice", "divide", "whole", "thirds"],
    decoyWords: ["numbers", "small", "tricky", "school", "maths", "parts", "counting", "useful"],
  },
  {
    topic: "The Water Cycle",
    insiderWords: ["evaporation", "condensation", "precipitation", "clouds", "rivers", "rain", "ocean", "vapour", "collection", "puddles"],
    decoyWords: ["wet", "outside", "sky", "weather", "cold", "important", "everyday", "natural"],
  },
  {
    topic: "Roman Empire",
    insiderWords: ["emperor", "Colosseum", "gladiators", "Caesar", "togas", "legions", "Latin", "roads", "Senate", "shields"],
    decoyWords: ["old", "history", "powerful", "interesting", "long ago", "famous", "books", "people"],
  },
  {
    topic: "The Solar System",
    insiderWords: ["Mars", "Jupiter", "orbit", "Sun", "rings", "moons", "asteroid", "rocky", "telescope", "comet"],
    decoyWords: ["space", "far", "shiny", "big", "round", "interesting", "studying", "night"],
  },
  {
    topic: "Verbs",
    insiderWords: ["action", "running", "doing", "tense", "past", "present", "jumping", "speaking", "describes", "swimming"],
    decoyWords: ["words", "English", "school", "writing", "important", "tricky", "spelling", "useful"],
  },
  {
    topic: "World War II",
    insiderWords: ["Allies", "Axis", "1939", "rations", "evacuation", "tanks", "Churchill", "shelter", "blackout", "soldiers"],
    decoyWords: ["history", "old", "important", "books", "battle", "long ago", "remember", "famous"],
  },
  {
    topic: "The Human Skeleton",
    insiderWords: ["bones", "skull", "ribs", "spine", "joints", "calcium", "marrow", "femur", "support", "x-ray"],
    decoyWords: ["body", "health", "doctor", "inside", "important", "human", "growing", "structure"],
  },
  {
    topic: "Volcanoes",
    insiderWords: ["lava", "magma", "eruption", "crater", "ash", "tectonic", "molten", "Vesuvius", "dormant", "vent"],
    decoyWords: ["mountain", "hot", "natural", "amazing", "powerful", "earth", "scary", "loud"],
  },
  {
    topic: "Shakespeare",
    insiderWords: ["plays", "Globe", "sonnets", "Hamlet", "iambic", "actors", "tragedy", "comedy", "Stratford", "thee"],
    decoyWords: ["English", "writing", "old", "books", "school", "famous", "literature", "interesting"],
  },
  {
    topic: "The Tudors",
    insiderWords: ["Henry VIII", "Elizabeth", "monarch", "wives", "Anne", "throne", "1500s", "court", "England", "crown"],
    decoyWords: ["history", "royal", "old", "famous", "rulers", "long ago", "people", "important"],
  },
  {
    topic: "Algebra",
    insiderWords: ["variable", "equation", "solve", "x", "balance", "expression", "term", "coefficient", "substitute", "unknown"],
    decoyWords: ["maths", "tricky", "numbers", "school", "thinking", "harder", "useful", "subject"],
  },
  {
    topic: "Coral Reefs",
    insiderWords: ["polyps", "fish", "ocean", "shallow", "colourful", "bleaching", "shrimp", "tropical", "ecosystem", "tide"],
    decoyWords: ["sea", "underwater", "nature", "warm", "amazing", "wildlife", "natural", "interesting"],
  },
  {
    topic: "Ancient Egypt",
    insiderWords: ["pharaoh", "pyramids", "Nile", "mummies", "hieroglyphs", "Sphinx", "Tutankhamun", "sand", "temple", "papyrus"],
    decoyWords: ["history", "old", "long ago", "amazing", "famous", "interesting", "people", "stories"],
  },
  {
    topic: "Adverbs",
    insiderWords: ["quickly", "slowly", "softly", "verb", "describe", "how", "ending", "modify", "loudly", "carefully"],
    decoyWords: ["words", "English", "school", "writing", "useful", "tricky", "subject", "spelling"],
  },
  {
    topic: "Angles",
    insiderWords: ["right angle", "obtuse", "acute", "degrees", "protractor", "vertex", "reflex", "straight", "measure", "geometry"],
    decoyWords: ["maths", "tricky", "shapes", "school", "useful", "drawing", "subject", "lines"],
  },
];

export type TenSecondPrompt = {
  question: string;
  correct: string[];
  distractors: string[];
};

export const TEN_SECOND_PROMPTS: TenSecondPrompt[] = [
  {
    question: "Name 3 adjectives",
    correct: ["happy", "loud", "shiny"],
    distractors: ["run", "table", "quickly", "she", "and", "jump", "carefully", "mouse", "the"],
  },
  {
    question: "Name 3 verbs",
    correct: ["sing", "swim", "build"],
    distractors: ["red", "tall", "softly", "they", "or", "table", "happy", "school", "cloud"],
  },
  {
    question: "Name 3 nouns that are animals",
    correct: ["tiger", "rabbit", "dolphin"],
    distractors: ["table", "happy", "running", "bright", "she", "kindness", "Monday", "blue", "quickly"],
  },
  {
    question: "Name 3 synonyms of 'happy'",
    correct: ["joyful", "cheerful", "glad"],
    distractors: ["angry", "tired", "sleepy", "noisy", "hungry", "calm", "afraid", "bored", "rude"],
  },
  {
    question: "Name 3 antonyms of 'big'",
    correct: ["small", "tiny", "little"],
    distractors: ["huge", "tall", "loud", "soft", "fast", "shiny", "kind", "noisy", "wide"],
  },
  {
    question: "Name 3 punctuation marks",
    correct: ["comma", "full stop", "question mark"],
    distractors: ["letter", "word", "verb", "sentence", "noun", "syllable", "vowel", "paragraph", "title"],
  },
  {
    question: "Name 3 pronouns",
    correct: ["she", "they", "we"],
    distractors: ["run", "happy", "school", "kindly", "quickly", "table", "tall", "small", "shiny"],
  },
  {
    question: "Name 3 adverbs",
    correct: ["quickly", "softly", "carefully"],
    distractors: ["happy", "she", "table", "run", "school", "kind", "bright", "and", "between"],
  },
  {
    question: "Name 3 antonyms of 'fast'",
    correct: ["slow", "sluggish", "leisurely"],
    distractors: ["quick", "rapid", "swift", "speedy", "loud", "soft", "kind", "tall", "sharp"],
  },
  {
    question: "Name 3 synonyms of 'big'",
    correct: ["huge", "enormous", "massive"],
    distractors: ["tiny", "small", "little", "petite", "narrow", "loud", "kind", "shiny", "fast"],
  },
  {
    question: "Name 3 ocean animals",
    correct: ["shark", "octopus", "whale"],
    distractors: ["lion", "horse", "spider", "rabbit", "ant", "deer", "eagle", "monkey", "snake"],
  },
  {
    question: "Name 3 colours",
    correct: ["red", "green", "purple"],
    distractors: ["happy", "loud", "tall", "kind", "fast", "smooth", "shiny", "small", "rude"],
  },
  {
    question: "Name 3 days of the week",
    correct: ["Monday", "Friday", "Sunday"],
    distractors: ["January", "August", "April", "winter", "spring", "morning", "evening", "today", "tomorrow"],
  },
  {
    question: "Name 3 months of the year",
    correct: ["March", "June", "October"],
    distractors: ["Tuesday", "winter", "spring", "evening", "Friday", "today", "tomorrow", "summer", "autumn"],
  },
  {
    question: "Name 3 vegetables",
    correct: ["carrot", "broccoli", "potato"],
    distractors: ["apple", "banana", "grape", "cake", "bread", "milk", "biscuit", "cheese", "sugar"],
  },
  {
    question: "Name 3 fruits",
    correct: ["apple", "banana", "mango"],
    distractors: ["carrot", "potato", "broccoli", "cabbage", "lettuce", "onion", "pepper", "garlic", "celery"],
  },
  {
    question: "Name 3 even numbers",
    correct: ["4", "10", "22"],
    distractors: ["3", "7", "11", "15", "19", "27", "33", "41", "55"],
  },
  {
    question: "Name 3 shapes",
    correct: ["circle", "square", "triangle"],
    distractors: ["red", "tall", "shiny", "kind", "happy", "loud", "fast", "soft", "bright"],
  },
  {
    question: "Name 3 things in a kitchen",
    correct: ["fridge", "oven", "kettle"],
    distractors: ["pillow", "tyre", "blanket", "telescope", "bridge", "saddle", "anchor", "tent", "log"],
  },
];

export type TwoTruthsRound = {
  statements: [string, string, string];
  lieIndex: 0 | 1 | 2;
  topic: string;
  explanation: string;
};

export const TWO_TRUTHS_ROUNDS: TwoTruthsRound[] = [
  {
    topic: "Space",
    statements: [
      "A year on Mercury is shorter than a day on Mercury.",
      "The Sun is mostly made of hydrogen and helium.",
      "Astronauts on the Moon weigh more than they do on Earth.",
    ],
    lieIndex: 2,
    explanation: "Astronauts weigh much less on the Moon. The Moon's gravity is about one sixth of Earth's, so things feel a lot lighter there.",
  },
  {
    topic: "Animals",
    statements: [
      "An octopus has three hearts.",
      "Bats are the only mammals that can truly fly.",
      "A goldfish has a memory of only three seconds.",
    ],
    lieIndex: 2,
    explanation: "Goldfish actually have memories that last for months. Scientists have trained them to recognise sounds, colours and feeding times.",
  },
  {
    topic: "Geography",
    statements: [
      "Africa is the only continent that touches all four hemispheres.",
      "The Sahara is the largest hot desert in the world.",
      "Australia has more sheep than people.",
    ],
    lieIndex: 0,
    explanation: "Africa touches the Northern, Southern and Eastern hemispheres but not the Western one in the way that matters here. Africa lies in three hemispheres, not all four.",
  },
  {
    topic: "Human Body",
    statements: [
      "Your stomach grows a new lining every few days.",
      "Humans have 100 senses, not just five.",
      "Your bones are about five times stronger than steel by weight.",
    ],
    lieIndex: 1,
    explanation: "Humans have several extra senses like balance and temperature, but not 100. Most scientists count somewhere between 9 and around 20 senses, depending on how they group them.",
  },
  {
    topic: "Maths",
    statements: [
      "Zero is an even number.",
      "A triangle's interior angles always add up to 180 degrees.",
      "There are exactly 100 prime numbers between 1 and 100.",
    ],
    lieIndex: 2,
    explanation: "There are only 25 prime numbers between 1 and 100. The list starts 2, 3, 5, 7, 11... and ends at 97.",
  },
  {
    topic: "History",
    statements: [
      "The Great Fire of London happened in 1666.",
      "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
      "The Roman Empire fell in the 1500s.",
    ],
    lieIndex: 2,
    explanation: "The Western Roman Empire fell in 476 AD, more than a thousand years before the 1500s. The Eastern (Byzantine) Empire fell in 1453.",
  },
  {
    topic: "Plants",
    statements: [
      "Some plants eat insects to get nutrients.",
      "Trees take in oxygen and breathe out carbon dioxide.",
      "Bamboo is one of the fastest-growing plants on Earth.",
    ],
    lieIndex: 1,
    explanation: "Trees mainly take in carbon dioxide and release oxygen during photosynthesis. They do use a little oxygen for respiration, but they are net oxygen producers.",
  },
  {
    topic: "Earth Science",
    statements: [
      "Lightning is hotter than the surface of the Sun.",
      "The Pacific Ocean is shrinking by a few centimetres each year.",
      "Mount Everest is taller in the morning than in the evening.",
    ],
    lieIndex: 2,
    explanation: "Mount Everest is the same height all day. Its height changes only very slightly over years due to plate movement, not because of the time of day.",
  },
  {
    topic: "Inventions",
    statements: [
      "The first email was sent in the 1970s.",
      "The lightbulb was invented in the year 2000.",
      "The first ever website is still online today.",
    ],
    lieIndex: 1,
    explanation: "The lightbulb was developed in the late 1800s. Thomas Edison patented his version in 1879, far earlier than 2000.",
  },
  {
    topic: "World Cultures",
    statements: [
      "Mandarin Chinese has more native speakers than any other language.",
      "There are over 7,000 languages spoken around the world today.",
      "Every country in the world uses the same calendar.",
    ],
    lieIndex: 2,
    explanation: "Many cultures use other calendars alongside the Gregorian one, like the Islamic, Hebrew, Hindu and Chinese calendars.",
  },
  {
    topic: "Computers",
    statements: [
      "A 'bit' is the smallest unit of data and is either 0 or 1.",
      "The first computer mouse was made of wood.",
      "Wi-Fi works by using sound waves.",
    ],
    lieIndex: 2,
    explanation: "Wi-Fi uses radio waves, not sound waves. Routers send data through invisible radio signals, which travel through walls and air.",
  },
  {
    topic: "Sports",
    statements: [
      "A basketball hoop is exactly 10 feet (about 3 metres) above the floor.",
      "In football (soccer), a match is normally 90 minutes plus stoppage time.",
      "A marathon is exactly 10 kilometres long.",
    ],
    lieIndex: 2,
    explanation: "A marathon is about 42.2 km (26.2 miles) long. A 10 km race is called a 10K, which is much shorter than a marathon.",
  },
  {
    topic: "Food Science",
    statements: [
      "Honey can stay good to eat for thousands of years.",
      "Bananas are technically berries.",
      "All dairy milk is naturally bright blue when it leaves a cow.",
    ],
    lieIndex: 2,
    explanation: "Cow's milk is white, not blue. Its colour comes from fat droplets and proteins that scatter light in all directions.",
  },
  {
    topic: "Authors",
    statements: [
      "Roald Dahl wrote 'Charlie and the Chocolate Factory'.",
      "J.K. Rowling wrote the 'Harry Potter' books.",
      "William Shakespeare wrote 'The Hunger Games'.",
    ],
    lieIndex: 2,
    explanation: "Shakespeare lived in the 1500s and 1600s. 'The Hunger Games' was written by Suzanne Collins and first published in 2008.",
  },
  {
    topic: "Weather",
    statements: [
      "Snowflakes almost always have six sides.",
      "A rainbow only appears when there is sunlight and water in the air.",
      "Thunder travels faster than lightning.",
    ],
    lieIndex: 2,
    explanation: "Light travels much faster than sound, which is why we see lightning before we hear thunder. Lightning is essentially instant; thunder follows after.",
  },
];

export const STUDENT_NAMES = ["Alex", "Sam", "Jamie", "Riley", "Casey"];
