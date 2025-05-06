"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateTimeSelectorProps {
  value: Date
  onChange: (date: Date) => void
  label?: string
}

export function DateTimeSelector({ value, onChange, label = "Date and Time" }: DateTimeSelectorProps) {
  // Use refs to track if we're in the middle of an update
  const isUpdatingRef = useRef(false)

  // Create local state to track the date and time separately
  const [date, setDate] = useState<Date>(value)
  const [timeString, setTimeString] = useState<string>(
    format(value, "HH:mm"), // 24-hour format for the input
  )

  // Update the parent component when either date or time changes
  // But only if we're not already in the middle of an update from the parent
  const updateParent = () => {
    if (isUpdatingRef.current) return

    const [hours, minutes] = timeString.split(":").map(Number)

    // Only proceed if we have valid hours and minutes
    if (!isNaN(hours) && !isNaN(minutes)) {
      const newDate = new Date(date)
      newDate.setHours(hours, minutes, 0, 0)
      onChange(newDate)
    }
  }

  // When local date changes, update parent
  useEffect(() => {
    updateParent()
  }, [date])

  // When time string changes, update parent
  useEffect(() => {
    updateParent()
  }, [timeString])

  // Update local state when the value prop changes
  // But prevent infinite loops by tracking if we're in an update
  useEffect(() => {
    // Skip if the dates are already equal (within a second)
    if (Math.abs(date.getTime() - value.getTime()) < 1000 && timeString === format(value, "HH:mm")) {
      return
    }

    isUpdatingRef.current = true
    setDate(value)
    setTimeString(format(value, "HH:mm"))

    // Reset the updating flag after a short delay
    setTimeout(() => {
      isUpdatingRef.current = false
    }, 0)
  }, [value])

  // Handle date selection
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) return

    // Create a new date that preserves the time
    const [hours, minutes] = timeString.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      newDate.setHours(hours, minutes, 0, 0)
    }

    setDate(newDate)
  }

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeString(e.target.value)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="grid grid-cols-2 gap-2">
        {/* Date selector */}
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time selector */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <Input type="time" value={timeString} onChange={handleTimeChange} className="pl-10" />
        </div>
      </div>

      <div className="text-sm text-muted-foreground mt-1">
        Selected:{" "}
        <span className="font-medium">
          {format(date, "PPP")} at {format(date, "h:mm a")}
        </span>
      </div>
    </div>
  )
}
