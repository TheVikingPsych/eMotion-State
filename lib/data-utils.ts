import type { MoodEntry } from "@/components/mood-provider"

export function exportEntriesToJSON(entries: MoodEntry[]): string {
  return JSON.stringify(entries, null, 2)
}

export function downloadAsFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportEntriesToCSV(entries: MoodEntry[]): string {
  // CSV header
  const header = "Date,Time,Function Level,Feeling,Custom Feeling,Reason\n"

  // CSV rows
  const rows = entries
    .map((entry) => {
      const date = new Date(entry.timestamp)
      const dateStr = date.toLocaleDateString()
      const timeStr = date.toLocaleTimeString()
      const feeling = entry.feeling
      const customFeeling = entry.customFeeling || ""
      // Escape quotes in reason text
      const reason = entry.reason.replace(/"/g, '""')

      return `${dateStr},${timeStr},${entry.functionLevel},"${feeling}","${customFeeling}","${reason}"`
    })
    .join("\n")

  return header + rows
}

export async function importEntriesFromFile(file: File): Promise<MoodEntry[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const result = event.target?.result as string
        if (file.name.endsWith(".json")) {
          const entries = JSON.parse(result) as MoodEntry[]
          resolve(entries)
        } else if (file.name.endsWith(".csv")) {
          reject(new Error("CSV import not supported yet"))
        } else {
          reject(new Error("Unsupported file format"))
        }
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}
