"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMood } from "./mood-provider"
import { analyzeEntries, getTopItems, getThemeColor } from "@/lib/text-analysis"
import { Bar, Line } from "react-chartjs-2"
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
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

// Minimum entries required for analysis
const MIN_ENTRIES_REQUIRED = 15

export function ThematicAnalysis() {
  const { entries } = useMood()
  const [activeTab, setActiveTab] = useState("themes")
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeEntries> | null>(null)

  // Run analysis when entries change
  useEffect(() => {
    if (entries.length >= MIN_ENTRIES_REQUIRED) {
      const result = analyzeEntries(entries)
      setAnalysis(result)
    } else {
      setAnalysis(null)
    }
  }, [entries])

  // If not enough entries, show message
  if (entries.length < MIN_ENTRIES_REQUIRED) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thematic Analysis</CardTitle>
          <CardDescription>Discover patterns and themes in your emotional state entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Not enough entries</AlertTitle>
            <AlertDescription>
              You need at least {MIN_ENTRIES_REQUIRED} entries to use thematic analysis. You currently have{" "}
              {entries.length} {entries.length === 1 ? "entry" : "entries"}.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Thematic analysis helps identify patterns in your entries by analyzing the words you use to describe your
              feelings and experiences. Continue adding entries to unlock this feature.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no analysis yet, show loading
  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thematic Analysis</CardTitle>
          <CardDescription>Discover patterns and themes in your emotional state entries</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-muted-foreground">Analyzing your entries...</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data for theme frequency
  const themeFrequencyData: ChartData<"bar"> = {
    labels: getTopItems(analysis.themeFrequency, 10).map(([theme]) => theme),
    datasets: [
      {
        label: "Theme Frequency",
        data: getTopItems(analysis.themeFrequency, 10).map(([_, count]) => count),
        backgroundColor: getTopItems(analysis.themeFrequency, 10).map(([theme]) => getThemeColor(theme, 0.7)),
        borderColor: getTopItems(analysis.themeFrequency, 10).map(([theme]) => getThemeColor(theme)),
        borderWidth: 1,
      },
    ],
  }

  // Prepare chart data for word frequency
  const wordCloudData: ChartData<"pie"> = {
    labels: getTopItems(analysis.wordFrequency, 8).map(([word]) => word),
    datasets: [
      {
        data: getTopItems(analysis.wordFrequency, 8).map(([_, count]) => count),
        backgroundColor: getTopItems(analysis.wordFrequency, 8).map(([word]) => getThemeColor(word, 0.7)),
        borderColor: getTopItems(analysis.wordFrequency, 8).map(([word]) => getThemeColor(word)),
        borderWidth: 1,
      },
    ],
  }

  // Prepare chart data for words by function level
  const wordsByFunctionLevelData: ChartData<"bar"> = {
    labels: [
      ...getTopItems(analysis.wordsByFunctionLevel.positive, 7).map(([word]) => word),
      ...getTopItems(analysis.wordsByFunctionLevel.negative, 7).map(([word]) => word),
    ],
    datasets: [
      {
        label: "Positive Function Level",
        data: [
          ...getTopItems(analysis.wordsByFunctionLevel.positive, 7).map(([_, count]) => count),
          ...Array(getTopItems(analysis.wordsByFunctionLevel.negative, 7).length).fill(0),
        ],
        backgroundColor: "rgba(34, 197, 94, 0.7)", // green
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Negative Function Level",
        data: [
          ...Array(getTopItems(analysis.wordsByFunctionLevel.positive, 7).length).fill(0),
          ...getTopItems(analysis.wordsByFunctionLevel.negative, 7).map(([_, count]) => count),
        ],
        backgroundColor: "rgba(239, 68, 68, 0.7)", // red
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Get top 5 themes for themes over time chart
  const topThemes = getTopItems(analysis.themeFrequency, 5).map(([theme]) => theme)

  // Get all unique dates across all themes
  const allDates = new Set<string>()
  Object.values(analysis.themesOverTime).forEach((dateEntries) => {
    dateEntries.forEach((entry) => allDates.add(entry.date))
  })
  const sortedDates = Array.from(allDates).sort()

  // Prepare chart data for themes over time
  const themesOverTimeData: ChartData<"line"> = {
    labels: sortedDates,
    datasets: topThemes.map((theme) => {
      const themeData = analysis.themesOverTime[theme] || []
      const dataByDate: Record<string, number> = {}

      // Initialize all dates with zero
      sortedDates.forEach((date) => {
        dataByDate[date] = 0
      })

      // Fill in actual values
      themeData.forEach(({ date, count }) => {
        dataByDate[date] = count
      })

      return {
        label: theme,
        data: sortedDates.map((date) => dataByDate[date]),
        borderColor: getThemeColor(theme),
        backgroundColor: getThemeColor(theme, 0.1),
        tension: 0.3,
        fill: true,
      }
    }),
  }

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
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(0)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(0)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
          label: (context) => `${context.label}: ${context.parsed.toFixed(0)} occurrences`,
        },
      },
    },
  }

  // Function level words chart options
  const functionLevelWordsOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const, // Horizontal bar chart
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.x.toFixed(0)} occurrences`,
        },
      },
      title: {
        display: true,
        text: "Words Used in Positive vs Negative States",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Frequency",
        },
      },
      y: {
        title: {
          display: true,
          text: "Words",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thematic Analysis</CardTitle>
        <CardDescription>Discover patterns and themes in your emotional state entries</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Common Themes</TabsTrigger>
            <TabsTrigger value="over-time">Themes Over Time</TabsTrigger>
            <TabsTrigger value="by-mood">Words by Mood</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Top Themes</h3>
              <div className="h-[300px]">
                <Bar data={themeFrequencyData} options={barOptions} />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This chart shows the most common themes mentioned in your entries.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="text-md font-medium mb-2">Analysis Insights</h3>
              <p className="text-sm">
                Based on your {entries.length} entries, the most common themes in your emotional state are
                <strong>
                  {" "}
                  {getTopItems(analysis.themeFrequency, 3)
                    .map(([theme]) => theme)
                    .join(", ")}
                </strong>
                . These themes appear to be significant factors in your emotional well-being.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="over-time" className="mt-4">
            <h3 className="text-lg font-medium mb-2">Themes Over Time</h3>
            <div className="h-[400px]">
              <Line data={themesOverTimeData} options={lineOptions} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This chart shows how themes have evolved over time in your entries.
            </p>

            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="text-md font-medium mb-2">Trend Insights</h3>
              <p className="text-sm">
                This visualization shows how different themes have appeared in your entries over time. Look for patterns
                such as increasing or decreasing trends, or themes that appear together.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="by-mood" className="mt-4">
            <h3 className="text-lg font-medium mb-2">Words Used in Positive vs Negative States</h3>
            <div className="h-[500px]">
              <Bar data={wordsByFunctionLevelData} options={functionLevelWordsOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-md">
                <h4 className="text-md font-medium mb-2 text-green-700 dark:text-green-400">
                  Top Words in Positive States
                </h4>
                <p className="text-sm">
                  These are the words you use most frequently when your function level is positive (above 0). They may
                  represent positive influences or experiences in your life.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-md">
                <h4 className="text-md font-medium mb-2 text-red-700 dark:text-red-400">
                  Top Words in Negative States
                </h4>
                <p className="text-sm">
                  These are the words you use most frequently when your function level is negative (below 0). They may
                  represent challenges or stressors in your life.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
