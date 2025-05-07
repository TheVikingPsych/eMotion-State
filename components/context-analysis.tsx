"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMood, type Location } from "./mood-provider"
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Minimum entries required for analysis
const MIN_ENTRIES_REQUIRED = 15

// Helper function to get location color
const getLocationColor = (location: string, opacity = 1): string => {
  const colors: Record<string, string> = {
    Home: `rgba(34, 197, 94, ${opacity})`, // green
    Work: `rgba(59, 130, 246, ${opacity})`, // blue
    School: `rgba(249, 115, 22, ${opacity})`, // orange
    Church: `rgba(168, 85, 247, ${opacity})`, // purple
    Restaurant: `rgba(236, 72, 153, ${opacity})`, // pink
    Other: `rgba(156, 163, 175, ${opacity})`, // gray
  }

  return colors[location] || colors.Other
}

export function ContextAnalysis() {
  const { entries } = useMood()
  const [activeTab, setActiveTab] = useState("overview")

  const locationData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return null
    }

    const locationGroups: Record<string, typeof entries> = {}
    const locationCounts: Record<string, number> = {}
    const locationFunctionLevels: Record<string, number[]> = {}
    const locationAverages: Record<string, number> = {}
    const locationOverTime: Record<string, Record<string, number>> = {}
    const timeByLocation: Record<string, Record<string, number>> = {}

    // Initialize with standard locations
    const standardLocations: Location[] = ["Home", "Work", "School", "Church", "Restaurant", "Other"]
    standardLocations.forEach((loc) => {
      locationGroups[loc] = []
      locationCounts[loc] = 0
      locationFunctionLevels[loc] = []
      locationAverages[loc] = 0
      locationOverTime[loc] = {}
      timeByLocation[loc] = {}
    })

    // Process entries
    entries.forEach((entry) => {
      const location =
        entry.location === "Other" && entry.customLocation ? entry.customLocation : entry.location || "Unknown"

      // Initialize if this is a custom location we haven't seen before
      if (!locationGroups[location]) {
        locationGroups[location] = []
        locationCounts[location] = 0
        locationFunctionLevels[location] = []
        locationAverages[location] = 0
        locationOverTime[location] = {}
        timeByLocation[location] = {}
      }

      // Add to groups
      locationGroups[location].push(entry)
      locationCounts[location]++
      locationFunctionLevels[location].push(entry.functionLevel)

      // Process for time analysis
      const date = new Date(entry.timestamp)
      const dateStr = date.toISOString().split("T")[0] // YYYY-MM-DD
      const hour = date.getHours()

      // For location over time
      if (!locationOverTime[location][dateStr]) {
        locationOverTime[location][dateStr] = 0
      }
      locationOverTime[location][dateStr] += entry.functionLevel

      // For time of day analysis
      if (!timeByLocation[location][hour]) {
        timeByLocation[location][hour] = 0
      }
      timeByLocation[location][hour]++
    })

    // Calculate averages
    Object.keys(locationFunctionLevels).forEach((location) => {
      const levels = locationFunctionLevels[location]
      if (levels.length > 0) {
        locationAverages[location] = levels.reduce((sum, level) => sum + level, 0) / levels.length
      }
    })

    return {
      groups: locationGroups,
      counts: locationCounts,
      functionLevels: locationFunctionLevels,
      averages: locationAverages,
      overTime: locationOverTime,
      timeOfDay: timeByLocation,
    }
  }, [entries])

  // If not enough entries, show message
  if (entries.length < MIN_ENTRIES_REQUIRED) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Context Analysis</CardTitle>
          <CardDescription>Analyze how your environment affects your emotional state</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not enough entries</AlertTitle>
            <AlertDescription>
              You need at least {MIN_ENTRIES_REQUIRED} entries to use context analysis. You currently have{" "}
              {entries.length} {entries.length === 1 ? "entry" : "entries"}.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Context analysis helps you understand how different environments affect your emotional state. Continue
              adding entries with location information to unlock this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no location data, show placeholder
  if (!locationData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Context Analysis</CardTitle>
          <CardDescription>Analyze how your environment affects your emotional state</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-muted-foreground">Analyzing your entries...</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data for average function level by location
  const averagesByLocationData: ChartData<"bar"> = useMemo(() => {
    if (!locationData) return { labels: [], datasets: [] }

    // Sort locations by average function level (highest first)
    const sortedLocations = Object.keys(locationData.averages)
      .filter((loc) => locationData.counts[loc] > 0) // Only include locations with entries
      .sort((a, b) => locationData.averages[b] - locationData.averages[a])

    return {
      labels: sortedLocations,
      datasets: [
        {
          label: "Average Function Level",
          data: sortedLocations.map((loc) => locationData.averages[loc]),
          backgroundColor: sortedLocations.map((loc) => getLocationColor(loc, 0.7)),
          borderColor: sortedLocations.map((loc) => getLocationColor(loc)),
          borderWidth: 1,
        },
      ],
    }
  }, [locationData])

  // Prepare chart data for entry counts by location
  const countsByLocationData: ChartData<"pie"> = useMemo(() => {
    if (!locationData) return { labels: [], datasets: [] }

    // Filter out locations with no entries
    const locationsWithEntries = Object.keys(locationData.counts).filter((loc) => locationData.counts[loc] > 0)

    return {
      labels: locationsWithEntries,
      datasets: [
        {
          data: locationsWithEntries.map((loc) => locationData.counts[loc]),
          backgroundColor: locationsWithEntries.map((loc) => getLocationColor(loc, 0.7)),
          borderColor: locationsWithEntries.map((loc) => getLocationColor(loc)),
          borderWidth: 1,
        },
      ],
    }
  }, [locationData])

  // Chart options
  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            return `Average: ${value.toFixed(1)} (${getFunctionLevelDescriptor(value)})`
          },
          afterLabel: (context) => {
            const location = context.label
            return locationData ? `${locationData.counts[location]} entries` : ""
          },
        },
      },
    },
    scales: {
      y: {
        min: -10,
        max: 10,
        title: {
          display: true,
          text: "Function Level",
        },
      },
    },
  }

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const location = context.label as string
            const count = context.parsed
            const percentage = ((count / entries.length) * 100).toFixed(1)
            return `${location}: ${count} entries (${percentage}%)`
          },
          afterLabel: (context) => {
            const location = context.label as string
            if (!locationData) return ""
            const avg = locationData.averages[location]
            return `Avg. Function Level: ${avg.toFixed(1)} (${getFunctionLevelDescriptor(avg)})`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context Analysis</CardTitle>
        <CardDescription>Analyze how your environment affects your emotional state</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Average Function Level by Location</h3>
                <div className="h-[300px]">
                  <Bar data={averagesByLocationData} options={barOptions} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This chart shows your average function level in different environments.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Entry Distribution by Location</h3>
                <div className="h-[300px]">
                  <Pie data={countsByLocationData} options={pieOptions} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This chart shows how your entries are distributed across different locations.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="locations" className="mt-4">
            <div className="space-y-6">
              {Object.keys(locationData.groups)
                .filter((location) => locationData.counts[location] > 0)
                .sort((a, b) => locationData.counts[b] - locationData.counts[a])
                .map((location) => (
                  <div key={location} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getLocationColor(location) }} />
                      <h3 className="text-lg font-medium">{location}</h3>
                      <span className="text-sm text-muted-foreground">({locationData.counts[location]} entries)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1">
                          Average Function Level:{" "}
                          <span className="font-medium">{locationData.averages[location].toFixed(1)}</span>
                        </p>
                        <p className="mb-1">
                          Typical State:{" "}
                          <span className="font-medium">
                            {getFunctionLevelDescriptor(locationData.averages[location])}
                          </span>
                        </p>

                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              locationData.averages[location] > 0
                                ? "bg-green-500"
                                : locationData.averages[location] < 0
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                            }`}
                            style={{
                              width: `${Math.abs(locationData.averages[location]) * 5 + 50}%`,
                              marginLeft: locationData.averages[location] < 0 ? "auto" : undefined,
                              marginRight: locationData.averages[location] > 0 ? "auto" : undefined,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="mb-1">Function Level Range:</p>
                        <div className="flex items-center gap-1 text-sm">
                          <span>{Math.min(...locationData.functionLevels[location])}</span>
                          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 mx-1">
                            <div
                              className="h-1 bg-blue-500"
                              style={{
                                width: "100%",
                              }}
                            />
                          </div>
                          <span>{Math.max(...locationData.functionLevels[location])}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
