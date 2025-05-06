"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMood } from "./mood-provider"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"

export function MoodEntryList() {
  const { entries, deleteEntry } = useMood()

  // Sort entries by timestamp (newest first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Get feeling color
  const getFeelingColor = (feeling: string) => {
    switch (feeling) {
      case "Afraid":
        return "bg-purple-500"
      case "Sad":
        return "bg-blue-500"
      case "Bland":
        return "bg-gray-500"
      case "Angry":
        return "bg-red-500"
      case "Happy":
        return "bg-green-500"
      case "Other":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entry History</CardTitle>
        <CardDescription>View and manage your past emotional state entries</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No entries yet. Add your first emotional state entry to see it here.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 relative hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getFeelingColor(entry.feeling)}`} />
                    <h3 className="font-medium">
                      {entry.feeling === "Other" && entry.customFeeling ? entry.customFeeling : entry.feeling}
                    </h3>
                  </div>
                  <span className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <span className="font-semibold">
                    Level: {entry.functionLevel}
                    <span className="text-sm font-normal ml-1">
                      ({getFunctionLevelDescriptor(entry.functionLevel)})
                    </span>
                  </span>
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
                    title={`Function Level: ${entry.functionLevel} - ${getFunctionLevelDescriptor(entry.functionLevel)}`}
                  >
                    <div
                      className={`h-2.5 rounded-full ${
                        entry.functionLevel > 0
                          ? "bg-green-500"
                          : entry.functionLevel < 0
                            ? "bg-red-500"
                            : "bg-gray-500"
                      }`}
                      style={{
                        width: `${Math.abs(entry.functionLevel) * 5 + 50}%`,
                        marginLeft: entry.functionLevel < 0 ? "auto" : undefined,
                        marginRight: entry.functionLevel > 0 ? "auto" : undefined,
                      }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-sm">{entry.reason}</p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete entry</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
