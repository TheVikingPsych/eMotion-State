"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SimpleDateTimeSelector } from "@/components/simple-date-time-selector"
import { useMood, type Feeling } from "./mood-provider"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"

interface MoodEntryFormProps {
  onSuccess?: () => void
}

export function MoodEntryForm({ onSuccess }: MoodEntryFormProps) {
  const { addEntry } = useMood()
  const [functionLevel, setFunctionLevel] = useState(0)
  const [feeling, setFeeling] = useState<Feeling>("Bland")
  const [customFeeling, setCustomFeeling] = useState("")
  const [reason, setReason] = useState("")

  // Date and time state
  const [useCustomDateTime, setUseCustomDateTime] = useState(false)
  const [customDate, setCustomDate] = useState<Date>(new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Use custom date/time or current time
    const timestamp = useCustomDateTime ? customDate.toISOString() : new Date().toISOString()

    addEntry({
      functionLevel,
      feeling,
      customFeeling: feeling === "Other" ? customFeeling : undefined,
      reason,
      timestamp,
    })

    // Reset form
    setFunctionLevel(0)
    setFeeling("Bland")
    setCustomFeeling("")
    setReason("")
    // Don't reset date/time settings to allow for multiple backdated entries

    if (onSuccess) {
      onSuccess()
    }
  }

  // Reset the custom date to now when toggling off custom date/time
  useEffect(() => {
    if (!useCustomDateTime) {
      setCustomDate(new Date())
    }
  }, [useCustomDateTime])

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
        <CardDescription>Record your current emotional state and function level</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Function Level:</h3>
              <span className="text-lg font-semibold">
                {functionLevel} - <span className="text-sm">{getFunctionLevelDescriptor(functionLevel)}</span>
              </span>
            </div>

            <div className="py-4">
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
                  <span className="text-xs text-destructive">Suicidal</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="font-semibold">0</span>
                  <span className="text-xs">Neutral</span>
                </div>

                <div className="flex flex-col items-end">
                  <span className="font-semibold text-green-600 dark:text-green-500">10</span>
                  <span className="text-xs text-green-600 dark:text-green-500">Thriving</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-destructive">-10 to -7:</span> Crisis, need immediate help
                  </div>
                  <div>
                    <span className="font-semibold text-amber-600">-6 to -3:</span> Struggling, may need support
                  </div>
                  <div>
                    <span className="font-semibold text-green-600 dark:text-green-500">7 to 10:</span> Thriving
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">I Feel:</h3>
            <RadioGroup value={feeling} onValueChange={(value) => setFeeling(value as Feeling)}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Afraid" id="afraid" />
                  <Label htmlFor="afraid">Afraid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sad" id="sad" />
                  <Label htmlFor="sad">Sad</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bland" id="bland" />
                  <Label htmlFor="bland">Bland</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Angry" id="angry" />
                  <Label htmlFor="angry">Angry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Happy" id="happy" />
                  <Label htmlFor="happy">Happy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </div>
            </RadioGroup>

            {feeling === "Other" && (
              <div className="pt-2">
                <Label htmlFor="custom-feeling">Specify feeling:</Label>
                <Input
                  id="custom-feeling"
                  value={customFeeling}
                  onChange={(e) => setCustomFeeling(e.target.value)}
                  placeholder="Enter your feeling"
                  required={feeling === "Other"}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Because:</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you feel this way?"
              required
              className="min-h-[100px]"
            />
          </div>

          {/* Date and Time Section */}
          <div className="space-y-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Entry Date & Time</h3>
                <p className="text-sm text-muted-foreground">
                  {useCustomDateTime ? "Manually set the date and time for this entry" : "Using current date and time"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="custom-date-time" checked={useCustomDateTime} onCheckedChange={setUseCustomDateTime} />
                <Label htmlFor="custom-date-time">Backdate entry</Label>
              </div>
            </div>

            {useCustomDateTime && (
              <div className="p-4 border rounded-md bg-muted/30">
                <SimpleDateTimeSelector
                  value={customDate}
                  onChange={setCustomDate}
                  label="Select date and time for this entry"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Save Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
