"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export type Feeling = "Afraid" | "Sad" | "Bland" | "Angry" | "Happy" | "Other"
export type Location = "Home" | "Work" | "School" | "Church" | "Restaurant" | "Other"

export interface MoodEntry {
  id: string
  functionLevel: number
  feeling: Feeling
  customFeeling?: string
  reason: string
  timestamp: string
  location: Location
  customLocation?: string
}

interface MoodContextType {
  entries: MoodEntry[]
  addEntry: (entry: Omit<MoodEntry, "id"> | MoodEntry) => void
  deleteEntry: (id: string) => void
  timeRange: "day" | "week" | "month" | "all"
  setTimeRange: (range: "day" | "week" | "month" | "all") => void
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "all">("week")

  // Load entries from localStorage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem("moodEntries")
    if (storedEntries) {
      try {
        // Handle migration of old entries without location
        const parsedEntries = JSON.parse(storedEntries)
        const migratedEntries = parsedEntries.map((entry: any) => ({
          ...entry,
          location: entry.location || "Home", // Default to Home for old entries
        }))
        setEntries(migratedEntries)
      } catch (e) {
        console.error("Failed to parse stored entries", e)
      }
    }
  }, [])

  // Save entries to localStorage when they change
  useEffect(() => {
    localStorage.setItem("moodEntries", JSON.stringify(entries))
  }, [entries])

  const addEntry = (entry: Omit<MoodEntry, "id"> | MoodEntry) => {
    // If the entry already has an ID (from import), use it
    // Otherwise, generate a new ID
    const newEntry =
      "id" in entry
        ? (entry as MoodEntry)
        : {
            ...entry,
            id: crypto.randomUUID(),
          }

    // Ensure we're using the timestamp exactly as provided
    setEntries((prev) => {
      // If an entry with this ID already exists, don't add it
      if ("id" in entry && prev.some((e) => e.id === entry.id)) {
        return prev
      }
      return [...prev, newEntry]
    })
  }

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  return (
    <MoodContext.Provider value={{ entries, addEntry, deleteEntry, timeRange, setTimeRange }}>
      {children}
    </MoodContext.Provider>
  )
}

export function useMood() {
  const context = useContext(MoodContext)
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}
