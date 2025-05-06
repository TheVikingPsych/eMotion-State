import type { MoodEntry } from "@/components/mood-provider"

// Common words to exclude from analysis (stopwords)
const STOPWORDS = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "aren't",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can't",
  "cannot",
  "could",
  "couldn't",
  "did",
  "didn't",
  "do",
  "does",
  "doesn't",
  "doing",
  "don't",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "hadn't",
  "has",
  "hasn't",
  "have",
  "haven't",
  "having",
  "he",
  "he'd",
  "he'll",
  "he's",
  "her",
  "here",
  "here's",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "how's",
  "i",
  "i'd",
  "i'll",
  "i'm",
  "i've",
  "if",
  "in",
  "into",
  "is",
  "isn't",
  "it",
  "it's",
  "its",
  "itself",
  "let's",
  "me",
  "more",
  "most",
  "mustn't",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "ought",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "shan't",
  "she",
  "she'd",
  "she'll",
  "she's",
  "should",
  "shouldn't",
  "so",
  "some",
  "such",
  "than",
  "that",
  "that's",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "there's",
  "these",
  "they",
  "they'd",
  "they'll",
  "they're",
  "they've",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "wasn't",
  "we",
  "we'd",
  "we'll",
  "we're",
  "we've",
  "were",
  "weren't",
  "what",
  "what's",
  "when",
  "when's",
  "where",
  "where's",
  "which",
  "while",
  "who",
  "who's",
  "whom",
  "why",
  "why's",
  "with",
  "won't",
  "would",
  "wouldn't",
  "you",
  "you'd",
  "you'll",
  "you're",
  "you've",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "just",
  "like",
  "get",
  "got",
  "feel",
  "felt",
  "feeling",
  "really",
  "much",
  "today",
  "still",
])

// Predefined themes with associated keywords
const THEMES = {
  "Work & Career": [
    "work",
    "job",
    "career",
    "boss",
    "colleague",
    "coworker",
    "meeting",
    "project",
    "deadline",
    "promotion",
    "office",
    "workplace",
    "professional",
    "employment",
  ],
  Relationships: [
    "relationship",
    "partner",
    "spouse",
    "husband",
    "wife",
    "boyfriend",
    "girlfriend",
    "date",
    "dating",
    "marriage",
    "divorce",
    "breakup",
    "love",
    "romantic",
    "romance",
  ],
  Family: [
    "family",
    "parent",
    "mother",
    "father",
    "mom",
    "dad",
    "child",
    "children",
    "kid",
    "kids",
    "son",
    "daughter",
    "brother",
    "sister",
    "sibling",
    "grandparent",
    "relative",
  ],
  Health: [
    "health",
    "sick",
    "illness",
    "disease",
    "pain",
    "doctor",
    "hospital",
    "medication",
    "medicine",
    "symptom",
    "diagnosis",
    "treatment",
    "recovery",
    "healing",
    "therapy",
  ],
  "Mental Health": [
    "anxiety",
    "depression",
    "stress",
    "therapy",
    "therapist",
    "counseling",
    "counselor",
    "mental",
    "emotional",
    "psychiatrist",
    "psychologist",
    "panic",
    "trauma",
    "overwhelm",
  ],
  "Social Life": [
    "friend",
    "social",
    "party",
    "gathering",
    "hangout",
    "outing",
    "event",
    "meetup",
    "community",
    "group",
    "club",
    "society",
    "network",
    "connection",
  ],
  "Personal Growth": [
    "growth",
    "learn",
    "learning",
    "improve",
    "improvement",
    "develop",
    "development",
    "progress",
    "goal",
    "achievement",
    "success",
    "challenge",
    "opportunity",
    "potential",
  ],
  Finances: [
    "money",
    "financial",
    "finance",
    "budget",
    "income",
    "expense",
    "debt",
    "saving",
    "investment",
    "bill",
    "payment",
    "afford",
    "cost",
    "economic",
    "economy",
  ],
  Education: [
    "school",
    "college",
    "university",
    "class",
    "course",
    "study",
    "student",
    "teacher",
    "professor",
    "lecture",
    "assignment",
    "exam",
    "test",
    "grade",
    "education",
    "academic",
  ],
  Leisure: [
    "hobby",
    "interest",
    "fun",
    "relax",
    "relaxation",
    "entertainment",
    "enjoy",
    "enjoyment",
    "leisure",
    "pleasure",
    "recreation",
    "vacation",
    "holiday",
    "break",
    "rest",
  ],
  Sleep: [
    "sleep",
    "tired",
    "exhausted",
    "fatigue",
    "insomnia",
    "rest",
    "nap",
    "bed",
    "dream",
    "nightmare",
    "awake",
    "wake",
    "slept",
  ],
  Exercise: [
    "exercise",
    "workout",
    "gym",
    "fitness",
    "run",
    "running",
    "walk",
    "walking",
    "jog",
    "jogging",
    "sport",
    "training",
    "physical",
    "active",
    "activity",
  ],
  "Food & Diet": [
    "food",
    "eat",
    "eating",
    "diet",
    "nutrition",
    "meal",
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "hungry",
    "appetite",
    "weight",
    "calorie",
  ],
  Technology: [
    "technology",
    "tech",
    "computer",
    "phone",
    "smartphone",
    "internet",
    "online",
    "digital",
    "device",
    "app",
    "application",
    "software",
    "hardware",
    "social media",
  ],
  Weather: [
    "weather",
    "rain",
    "snow",
    "sun",
    "sunny",
    "cloud",
    "cloudy",
    "storm",
    "wind",
    "windy",
    "temperature",
    "hot",
    "cold",
    "warm",
    "cool",
  ],
  Future: [
    "future",
    "plan",
    "planning",
    "hope",
    "dream",
    "aspiration",
    "ambition",
    "goal",
    "objective",
    "target",
    "aim",
    "intention",
    "purpose",
    "direction",
  ],
  Past: [
    "past",
    "memory",
    "remember",
    "reminisce",
    "history",
    "nostalgia",
    "regret",
    "mistake",
    "error",
    "failure",
    "success",
    "achievement",
    "experience",
    "lesson",
  ],
  Accomplishment: [
    "accomplish",
    "achievement",
    "success",
    "win",
    "victory",
    "triumph",
    "milestone",
    "progress",
    "advance",
    "improvement",
    "development",
    "growth",
    "result",
    "outcome",
  ],
  Frustration: [
    "frustrate",
    "frustration",
    "annoyed",
    "annoying",
    "irritated",
    "irritating",
    "bother",
    "bothered",
    "upset",
    "disappointed",
    "disappointment",
    "setback",
    "obstacle",
    "barrier",
  ],
  Gratitude: [
    "grateful",
    "gratitude",
    "thankful",
    "appreciate",
    "appreciation",
    "blessed",
    "blessing",
    "fortune",
    "fortunate",
    "luck",
    "lucky",
    "privilege",
    "privileged",
  ],
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  if (!text) return []

  // Normalize text: lowercase and remove punctuation
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, "")

  // Split into words and filter out stopwords and short words
  const words = normalized.split(/\s+/).filter((word) => word.length > 2 && !STOPWORDS.has(word))

  return words
}

// Identify themes in text
export function identifyThemes(text: string): Record<string, number> {
  const keywords = extractKeywords(text)
  const themeScores: Record<string, number> = {}

  // Initialize all themes with zero score
  Object.keys(THEMES).forEach((theme) => {
    themeScores[theme] = 0
  })

  // Score each theme based on keyword matches
  keywords.forEach((keyword) => {
    Object.entries(THEMES).forEach(([theme, themeKeywords]) => {
      if (themeKeywords.includes(keyword)) {
        themeScores[theme] += 1
      } else {
        // Check for partial matches (e.g., "work" in "working")
        for (const themeKeyword of themeKeywords) {
          if (keyword.includes(themeKeyword) || themeKeyword.includes(keyword)) {
            themeScores[theme] += 0.5
            break
          }
        }
      }
    })
  })

  // Filter out themes with zero score
  return Object.fromEntries(Object.entries(themeScores).filter(([_, score]) => score > 0))
}

// Analyze entries and return theme data
export function analyzeEntries(entries: MoodEntry[]): {
  themeFrequency: Record<string, number>
  themesOverTime: Record<string, { date: string; count: number }[]>
  themesByFunctionLevel: Record<string, { level: number; count: number }[]>
  themesByFeeling: Record<string, Record<string, number>>
  wordFrequency: Record<string, number>
} {
  // Initialize result objects
  const themeFrequency: Record<string, number> = {}
  const themesOverTime: Record<string, { date: string; count: number }[]> = {}
  const themesByFunctionLevel: Record<string, { level: number; count: number }[]> = {}
  const themesByFeeling: Record<string, Record<string, number>> = {}
  const wordFrequency: Record<string, number> = {}

  // Process each entry
  entries.forEach((entry) => {
    // Extract date (just the day part)
    const date = new Date(entry.timestamp).toISOString().split("T")[0]

    // Get themes for this entry
    const entryThemes = identifyThemes(entry.reason)

    // Extract all words for word cloud
    const words = extractKeywords(entry.reason)
    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })

    // Update theme frequency
    Object.entries(entryThemes).forEach(([theme, score]) => {
      // Update overall frequency
      themeFrequency[theme] = (themeFrequency[theme] || 0) + score

      // Update themes over time
      if (!themesOverTime[theme]) {
        themesOverTime[theme] = []
      }
      const existingDateEntry = themesOverTime[theme].find((item) => item.date === date)
      if (existingDateEntry) {
        existingDateEntry.count += score
      } else {
        themesOverTime[theme].push({ date, count: score })
      }

      // Update themes by function level
      if (!themesByFunctionLevel[theme]) {
        themesByFunctionLevel[theme] = []
      }
      const existingLevelEntry = themesByFunctionLevel[theme].find((item) => item.level === entry.functionLevel)
      if (existingLevelEntry) {
        existingLevelEntry.count += score
      } else {
        themesByFunctionLevel[theme].push({ level: entry.functionLevel, count: score })
      }

      // Update themes by feeling
      if (!themesByFeeling[theme]) {
        themesByFeeling[theme] = {}
      }
      const feeling = entry.feeling === "Other" && entry.customFeeling ? entry.customFeeling : entry.feeling
      themesByFeeling[theme][feeling] = (themesByFeeling[theme][feeling] || 0) + score
    })
  })

  // Sort themes over time by date
  Object.keys(themesOverTime).forEach((theme) => {
    themesOverTime[theme].sort((a, b) => a.date.localeCompare(b.date))
  })

  // Sort themes by function level
  Object.keys(themesByFunctionLevel).forEach((theme) => {
    themesByFunctionLevel[theme].sort((a, b) => a.level - b.level)
  })

  return {
    themeFrequency,
    themesOverTime,
    themesByFunctionLevel,
    themesByFeeling,
    wordFrequency,
  }
}

// Get top N items from a record
export function getTopItems<T>(record: Record<string, T>, n = 10): [string, T][] {
  return Object.entries(record)
    .sort((a, b) => {
      // Sort numerically if values are numbers
      if (typeof a[1] === "number" && typeof b[1] === "number") {
        return (b[1] as number) - (a[1] as number)
      }
      // Otherwise sort by key
      return a[0].localeCompare(b[0])
    })
    .slice(0, n)
}

// Get color for a theme (consistent colors for the same themes)
export function getThemeColor(theme: string, opacity = 1): string {
  // Generate a deterministic hash from the theme name
  let hash = 0
  for (let i = 0; i < theme.length; i++) {
    hash = theme.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Convert hash to RGB color
  const r = (hash & 0xff0000) >> 16
  const g = (hash & 0x00ff00) >> 8
  const b = hash & 0x0000ff

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
