"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMood } from "./mood-provider"
import { downloadAsFile, exportEntriesToJSON, exportEntriesToCSV, importEntriesFromFile } from "@/lib/data-utils"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"

export function DataManagement() {
  const { entries, addEntry } = useMood()
  const [activeTab, setActiveTab] = useState("export")
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    if (entries.length === 0) {
      setImportStatus({
        type: "error",
        message: "No entries to export",
      })
      return
    }

    const jsonData = exportEntriesToJSON(entries)
    const date = new Date().toISOString().split("T")[0]
    downloadAsFile(jsonData, `emotion-state-data-${date}.json`, "application/json")

    setImportStatus({
      type: "success",
      message: "Data exported successfully!",
    })
  }

  const handleExportCSV = () => {
    if (entries.length === 0) {
      setImportStatus({
        type: "error",
        message: "No entries to export",
      })
      return
    }

    const csvData = exportEntriesToCSV(entries)
    const date = new Date().toISOString().split("T")[0]
    downloadAsFile(csvData, `emotion-state-data-${date}.csv`, "text/csv")

    setImportStatus({
      type: "success",
      message: "Data exported successfully!",
    })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImportStatus({
        type: null,
        message: "Importing data...",
      })

      const importedEntries = await importEntriesFromFile(file)

      // Add each imported entry
      importedEntries.forEach((entry) => {
        // Skip entries with the same ID if they already exist
        if (!entries.some((e) => e.id === entry.id)) {
          addEntry(entry)
        }
      })

      setImportStatus({
        type: "success",
        message: `Successfully imported ${importedEntries.length} entries!`,
      })
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `Error importing data: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Export or import your emotional state data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Export your data to keep a backup or transfer to another device.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleExportJSON} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Import previously exported data. This will add entries to your current data.
            </p>
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
              <Button onClick={handleImportClick} className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import JSON File
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {importStatus.type && (
          <Alert variant={importStatus.type === "error" ? "destructive" : "default"} className="mt-4">
            {importStatus.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <AlertTitle>{importStatus.type === "error" ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{importStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Your data is currently stored in your browser's local storage. Export regularly to avoid data loss.
      </CardFooter>
    </Card>
  )
}
