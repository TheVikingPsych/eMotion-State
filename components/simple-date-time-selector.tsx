"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

interface SimpleDateTimeSelectorProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
}

export function SimpleDateTimeSelector({ value, onChange, label = "Date and Time" }: SimpleDateTimeSelectorProps) {
  // Format the date for the date input (YYYY-MM-DD)
  const [dateString, setDateString] = useState(format(value, "yyyy-MM-dd"))

  // Format the time for the time input (HH:mm)
  const [timeString, setTimeString] = useState(format(value, "HH:mm"))

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateString(e.target.value)
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeString(e.target.value)
  }

  // Update the parent component when either date or time changes
  useEffect(() => {
    try {
      // Only update if we have valid date and time strings
      if (dateString && timeString) {
        // Parse the date string
        const dateParts = dateString.split("-").map(Number)
        if (dateParts.length !== 3) return

        // Parse the time string
        const timeParts = timeString.split(":").map(Number)
        if (timeParts.length !== 2) return

        // Create a new date with the parsed values
        const newDate = new Date(
          dateParts[0], // year
          dateParts[1] - 1, // month (0-indexed)
          dateParts[2], // day
          timeParts[0], // hour
          timeParts[1], // minute
          0, // second
          0, // millisecond
        )

        // Only update if the date is valid and different from the current value
        if (!isNaN(newDate.getTime()) && Math.abs(newDate.getTime() - value.getTime()) > 1000) {
          onChange(newDate)
        }
      }
    } catch (error) {
      console.error("Error parsing date/time:", error)
    }
  }, [dateString, timeString])

  // Update local state when the value prop changes
  useEffect(() => {
    const newDateString = format(value, "yyyy-MM-dd")
    const newTimeString = format(value, "HH:mm")

    // Only update if the values are different to avoid infinite loops
    if (dateString !== newDateString) {
      setDateString(newDateString)
    }

    if (timeString !== newTimeString) {
      setTimeString(newTimeString)
    }
  }, [value])

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="entry-date" className="mb-2 block">
            Date:
          </Label>
          <Input id="entry-date" type="date" value={dateString} onChange={handleDateChange} />
        </div>
        <div>
          <Label htmlFor="entry-time" className="mb-2 block">
            Time:
          </Label>
          <Input id="entry-time" type="time" value={timeString} onChange={handleTimeChange} />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mt-1">
        Selected:{" "}
        <span className="font-medium">
          {format(value, "PPP")} at {format(value, "h:mm a")}
        </span>
      </div>
    </div>
  )
}
