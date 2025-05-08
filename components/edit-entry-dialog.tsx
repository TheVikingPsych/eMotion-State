"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SimpleDateTimeSelector } from "@/components/simple-date-time-selector"
import { useMood, type MoodEntry, type Feeling, type Location } from "./mood-provider"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"

// Emoticons for each feeling
const feelingEmoticons: Record<Feeling, string> = {
  Afraid: "😨",
  Sad: "😢",
  Bland: "😐",
  Angry: "😠",
  Happy: "😊",
  Other: "🤔",
}

interface EditEntryDialogProps {
  entry: MoodEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEntryDialog({ entry, open, onOpenChange }: EditEntryDialogProps) {
  const { updateEntry } = useMood()
  const [functionLevel, setFunctionLevel] = useState(0)
  const [feeling, setFeeling] = useState<Feeling>("Bland")
  const [customFeeling, setCustomFeeling] = useState("")
  const [location, setLocation] = useState<Location>("Home")
  const [customLocation, setCustomLocation] = useState("")
  const [reason, setReason] = useState("")
  const [entryDate, setEntryDate] = useState<Date>(new Date())

  // Reset form when entry changes
  useEffect(() => {
    if (entry) {
      setFunctionLevel(entry.functionLevel)
      setFeeling(entry.feeling)
      setCustomFeeling(entry.customFeeling || "")
      setLocation(entry.location)
      setCustomLocation(entry.customLocation || "")
      setReason(entry.reason)
      setEntryDate(new Date(entry.timestamp))
    }
  }, [entry])

  const handleSubmit = () => {
    if (!entry) return

    updateEntry(entry.id, {
      functionLevel,
      feeling,
      customFeeling: feeling === "Other" ? customFeeling : undefined,
      location,
      customLocation: location === "Other" ? customLocation : undefined,
      reason,
      timestamp: entryDate.toISOString(),
    })

    onOpenChange(false)
  }

  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Function Level:</h3>
              <span className="text-lg font-semibold">
                {functionLevel} - <span className="text-sm">{getFunctionLevelDescriptor(functionLevel)}</span>
              </span>
            </div>

            <div className="py-2">
              <Slider
                value={[functionLevel]}
                min={-10}
                max={10}
                step={1}
                onValueChange={(values) => setFunctionLevel(values[0])}
              />

              <div className="flex justify-between mt-2 text-sm">
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-destructive">-10</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-semibold">0</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-semibold text-green-600 dark:text-green-500">10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">I Feel:</h3>
            <RadioGroup value={feeling} onValueChange={(value) => setFeeling(value as Feeling)}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Afraid" id="edit-afraid" />
                  <Label htmlFor="edit-afraid">{feelingEmoticons.Afraid} Afraid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sad" id="edit-sad" />
                  <Label htmlFor="edit-sad">{feelingEmoticons.Sad} Sad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bland" id="edit-bland" />
                  <Label htmlFor="edit-bland">{feelingEmoticons.Bland} Bland</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Angry" id="edit-angry" />
                  <Label htmlFor="edit-angry">{feelingEmoticons.Angry} Angry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Happy" id="edit-happy" />
                  <Label htmlFor="edit-happy">{feelingEmoticons.Happy} Happy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="edit-other" />
                  <Label htmlFor="edit-other">{feelingEmoticons.Other} Other</Label>
                </div>
              </div>
            </RadioGroup>

            {feeling === "Other" && (
              <div className="pt-2">
                <Label htmlFor="edit-custom-feeling">Specify feeling:</Label>
                <Input
                  id="edit-custom-feeling"
                  value={customFeeling}
                  onChange={(e) => setCustomFeeling(e.target.value)}
                  placeholder="Enter your feeling"
                  required={feeling === "Other"}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-reason">Because:</Label>
            <Textarea
              id="edit-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you feel this way?"
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Where Are You?:</h3>
            <RadioGroup value={location} onValueChange={(value) => setLocation(value as Location)}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Home" id="edit-home" />
                  <Label htmlFor="edit-home">Home</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Work" id="edit-work" />
                  <Label htmlFor="edit-work">Work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="School" id="edit-school" />
                  <Label htmlFor="edit-school">School</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Church" id="edit-church" />
                  <Label htmlFor="edit-church">Church</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Restaurant" id="edit-restaurant" />
                  <Label htmlFor="edit-restaurant">Restaurant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="edit-other-location" />
                  <Label htmlFor="edit-other-location">Other</Label>
                </div>
              </div>
            </RadioGroup>

            {location === "Other" && (
              <div className="pt-2">
                <Label htmlFor="edit-custom-location">Specify location:</Label>
                <Input
                  id="edit-custom-location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter your location"
                  required={location === "Other"}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date and Time:</Label>
            <SimpleDateTimeSelector value={entryDate} onChange={setEntryDate} label="Entry date and time" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
