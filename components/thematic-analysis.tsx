"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMood } from "./mood-provider"
import { analyzeEntries, getTopItems, getThemeColor } from "@/lib/text-analysis"
import { Bar, Pie, Line } from "react-chartjs-2"
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

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export function ThematicAnalysis() {
  const { entries } = useMood()
  const [activeTab, setActiveTab] = useState("themes")
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeEntries> | null>(null)

  // Run analysis when entries change
  useEffect(() => {
    if (entries.length > 0) {
      const result = analyzeEntries(entries)
      setAnalysis(result)
    }
  }, [entries])

  // If no entries or analysis, show placeholder
  if (!analysis || entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thematic Analysis</CardTitle>
          <CardDescription>Discover patterns and themes in your emotional state entries</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-muted-foreground">
            {entries.length === 0
              ? "No entries yet. Add your first emotional state entry to see thematic analysis."
              : "Analyzing your entries..."}
          </p>
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

  // Prepare chart data for themes by function level
  const themesByFunctionLevelData: ChartData<"bar"> = {
    labels: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    datasets: topThemes.map((theme) => {
      const themeData = analysis.themesByFunctionLevel[theme] || []
      const dataByLevel: Record<number, number> = {}

      // Initialize all levels with zero
      for (let i = -10; i <= 10; i++) {
        dataByLevel[i] = 0
      }

      // Fill in actual values
      themeData.forEach(({ level, count }) => {
        dataByLevel[level] = count
      })

      return {
        label: theme,
        data: Object.values(dataByLevel),
        backgroundColor: getThemeColor(theme, 0.7),
        borderColor: getThemeColor(theme),
        borderWidth: 1,
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
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`,
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
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`,
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
            <TabsTrigger value="by-level">Themes by Function Level</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Top Themes</h3>
                <div className="h-[300px]">
                  <Bar data={themeFrequencyData} options={barOptions} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This chart shows the most common themes mentioned in your entries.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Common Words</h3>
                <div className="h-[300px]">
                  <Pie data={wordCloudData} options={pieOptions} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This chart shows the most frequently used words in your entries.
                </p>
              </div>
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

          <TabsContent value="by-level" className="mt-4">
            <h3 className="text-lg font-medium mb-2">Themes by Function Level</h3>
            <div className="h-[400px]">
              <Bar data={themesByFunctionLevelData} options={barOptions} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This chart shows how themes correlate with your function level.
            </p>

            <div className="bg-muted p-4 rounded-md mt-4">
              <h3 className="text-md font-medium mb-2">Correlation Insights</h3>
              <p className="text-sm">
                This visualization helps identify which themes tend to appear when you're feeling better or worse.
                Themes that appear more at higher function levels may be positive influences, while those at lower
                levels might be stressors or challenges.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
