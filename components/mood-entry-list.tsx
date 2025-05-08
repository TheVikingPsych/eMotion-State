"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMood, type MoodEntry, type Feeling } from "./mood-provider"
import { Button } from "@/components/ui/button"
import { Trash2, MapPin, Edit } from "lucide-react"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"
import { EditEntryDialog } from "./edit-entry-dialog"

// Emoticons for each feeling
const feelingEmoticons: Record<Feeling, string> = {
  Afraid: "😨",
  Sad: "😢",
  Bland: "😐",
  Angry: "😠",
  Happy: "😊",
  Other: "🤔",
}

export function MoodEntryList() {
  const { entries, deleteEntry } = useMood()
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const handleEditClick = (entry: MoodEntry) => {
    setEditingEntry(entry)
    setIsEditDialogOpen(true)
  }

  return (
    <>
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
                        {feelingEmoticons[entry.feeling as Feeling] || "🤔"}{" "}
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

                  {entry.location && (
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {entry.location === "Other" && entry.customLocation ? entry.customLocation : entry.location}
                      </span>
                    </div>
                  )}

                  <p className="mt-2 text-sm">{entry.reason}</p>

                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEditClick(entry)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit entry</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete entry</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditEntryDialog entry={editingEntry} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
    </>
  )
}
