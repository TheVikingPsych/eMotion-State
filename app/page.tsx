"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoodEntryForm } from "@/components/mood-entry-form"
import { MoodChart } from "@/components/mood-chart"
import { MoodEntryList } from "@/components/mood-entry-list"
import { ThematicAnalysis } from "@/components/thematic-analysis"
import { ContextAnalysis } from "@/components/context-analysis"
import { MoodProvider } from "@/components/mood-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeForceRefresh } from "@/components/theme-force-refresh"
import { DataManagement } from "@/components/data-management"

export default function Home() {
  const [activeTab, setActiveTab] = useState("add")

  return (
    <MoodProvider>
      <ThemeForceRefresh />
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center my-6">
          <h1 className="text-3xl font-bold">eMotion State</h1>
          <ThemeToggle />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-8">
            <TabsTrigger value="add">Add Entry</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-0">
            <MoodEntryForm onSuccess={() => setActiveTab("chart")} />
          </TabsContent>

          <TabsContent value="chart" className="mt-0">
            <MoodChart />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <MoodEntryList />
          </TabsContent>

          <TabsContent value="themes" className="mt-0">
            <ThematicAnalysis />
          </TabsContent>

          <TabsContent value="context" className="mt-0">
            <ContextAnalysis />
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <DataManagement />
          </TabsContent>
        </Tabs>
      </main>
    </MoodProvider>
  )
}
