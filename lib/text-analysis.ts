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

// Extract keywords from text
function extractKeywords(text: string): string[] {
  if (!text) return []

  // Normalize text: lowercase and remove punctuation
  const normalized = text.toLowerCase().replace(/[^\w\s]/g, "")

  // Split into words and filter out stopwords and short words
  const words = normalized.split(/\s+/).filter((word) => word.length > 2 && !STOPWORDS.has(word))

  return words
}

// Identify themes in text based on actual words used
export function identifyThemes(entries: MoodEntry[]): Record<string, number> {
  // First, extract all keywords from all entries
  const allKeywords: string[] = []
  entries.forEach((entry) => {
    allKeywords.push(...extractKeywords(entry.reason))
  })

  // Count word frequencies
  const wordFrequency: Record<string, number> = {}
  allKeywords.forEach((word) => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  })

  // Get top words to use as themes (words that appear at least twice)
  const themes: Record<string, number> = {}
  Object.entries(wordFrequency)
    .filter(([_, count]) => count >= 2) // Only include words that appear at least twice
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, 15) // Take top 15 words
    .forEach(([word, count]) => {
      // Capitalize first letter of each word for theme names
      const theme = word.charAt(0).toUpperCase() + word.slice(1)
      themes[theme] = count
    })

  return themes
}

// Analyze entries and return theme data
export function analyzeEntries(entries: MoodEntry[]): {
  themeFrequency: Record<string, number>
  themesOverTime: Record<string, { date: string; count: number }[]>
  wordFrequency: Record<string, number>
} {
  // Initialize result objects
  const themeFrequency: Record<string, number> = {}
  const themesOverTime: Record<string, { date: string; count: number }[]> = {}
  const wordFrequency: Record<string, number> = {}

  // Get themes based on actual words in entries
  const themes = identifyThemes(entries)
  Object.keys(themes).forEach((theme) => {
    themeFrequency[theme] = 0
    themesOverTime[theme] = []
  })

  // Process each entry
  entries.forEach((entry) => {
    // Extract date (just the day part)
    const date = new Date(entry.timestamp).toISOString().split("T")[0]

    // Extract all words for word cloud
    const words = extractKeywords(entry.reason)
    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })

    // Count theme occurrences in this entry
    Object.keys(themes).forEach((theme) => {
      const themeWord = theme.toLowerCase()
      const count = words.filter((word) => word === themeWord).length

      if (count > 0) {
        // Update overall frequency
        themeFrequency[theme] = (themeFrequency[theme] || 0) + count

        // Update themes over time
        const existingDateEntry = themesOverTime[theme].find((item) => item.date === date)
        if (existingDateEntry) {
          existingDateEntry.count += count
        } else {
          themesOverTime[theme].push({ date, count })
        }
      }
    })
  })

  // Sort themes over time by date
  Object.keys(themesOverTime).forEach((theme) => {
    themesOverTime[theme].sort((a, b) => a.date.localeCompare(b.date))
  })

  return {
    themeFrequency,
    themesOverTime,
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
