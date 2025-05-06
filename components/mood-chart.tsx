"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMood } from "./mood-provider"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { getFunctionLevelDescriptor } from "@/lib/function-level-utils"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export function MoodChart() {
  const { entries, timeRange, setTimeRange } = useMood()
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  })

  // Get feeling color
  const getFeelingColor = (feeling: string) => {
    switch (feeling) {
      case "Afraid":
        return "rgba(147, 51, 234, 1)" // purple
      case "Sad":
        return "rgba(59, 130, 246, 1)" // blue
      case "Bland":
        return "rgba(156, 163, 175, 1)" // gray
      case "Angry":
        return "rgba(239, 68, 68, 1)" // red
      case "Happy":
        return "rgba(34, 197, 94, 1)" // green
      case "Other":
        return "rgba(249, 115, 22, 1)" // orange
      default:
        return "rgba(156, 163, 175, 1)" // gray
    }
  }

  // Filter entries based on time range
  const getFilteredEntries = () => {
    const now = new Date()
    const filtered = entries.filter((entry) => {
      const entryDate = new Date(entry.timestamp)
      switch (timeRange) {
        case "day":
          return entryDate.toDateString() === now.toDateString()
        case "week": {
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          return entryDate >= weekAgo
        }
        case "month": {
          const monthAgo = new Date()
          monthAgo.setMonth(now.getMonth() - 1)
          return entryDate >= monthAgo
        }
        case "all":
        default:
          return true
      }
    })

    return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  // Update chart data when entries or time range changes
  useEffect(() => {
    const filteredEntries = getFilteredEntries()

    const data: ChartData<"line"> = {
      labels: filteredEntries.map((entry) => {
        const date = new Date(entry.timestamp)
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      }),
      datasets: [
        {
          label: "Function Level",
          data: filteredEntries.map((entry) => entry.functionLevel),
          borderColor: "rgba(59, 130, 246, 0.8)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.3,
          fill: true,
          pointBackgroundColor: filteredEntries.map((entry) => getFeelingColor(entry.feeling)),
          pointBorderColor: filteredEntries.map((entry) => getFeelingColor(entry.feeling)),
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }

    setChartData(data)
  }, [entries, timeRange, document.documentElement.classList.contains("dark")])

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -10,
        max: 10,
        ticks: {
          stepSize: 2,
          color: (context) => {
            // Use different colors for dark mode
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)"
          },
          callback: (value) => {
            if (value === -10) return "-10 (Suicidal)"
            if (value === 0) return "0 (Neutral)"
            if (value === 10) return "10 (Thriving)"
            return value
          },
        },
        title: {
          display: true,
          text: "Function Level",
          color: (context) => {
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.9)"
          },
        },
        grid: {
          color: (context) => {
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)"
          },
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: (context) => {
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(0, 0, 0, 0.7)"
          },
        },
        grid: {
          color: (context) => {
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)"
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: (context) => {
            return typeof window !== "undefined" && document.documentElement.classList.contains("dark")
              ? "rgba(255, 255, 255, 0.9)"
              : "rgba(0, 0, 0, 0.9)"
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            const descriptor = getFunctionLevelDescriptor(value)
            return `Function Level: ${value} (${descriptor})`
          },
          afterLabel: (context) => {
            const index = context.dataIndex
            const entry = getFilteredEntries()[index]
            return [
              `Feeling: ${entry.feeling === "Other" && entry.customFeeling ? entry.customFeeling : entry.feeling}`,
              `Reason: ${entry.reason}`,
            ]
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Emotion Chart</CardTitle>
          <CardDescription>Visualize your function level over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-muted-foreground">No entries yet. Add your first mood entry to see your chart.</p>
          </div>
        ) : (
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        <div className="mt-6">
          <h4 className="font-medium mb-2">Function Level Scale:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div>-10: Suicidal</div>
            <div>-8 to -9: Severe crisis</div>
            <div>-6 to -7: In despair</div>
            <div>-4 to -5: Struggling</div>
            <div>-2 to -3: Feeling down</div>
            <div>0: Neutral</div>
            <div>1 to 2: Okay</div>
            <div>3 to 4: Good</div>
            <div>5 to 6: Very good</div>
            <div>7 to 8: Excellent</div>
            <div>9 to 10: Thriving</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {["Afraid", "Sad", "Bland", "Angry", "Happy", "Other"].map((feeling) => (
            <div key={feeling} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getFeelingColor(feeling) }} />
              <span className="text-sm">{feeling}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
