"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TimeEntryForm } from "./time-entry-form"
import { TimeEntryCard } from "./time-entry-card"
import { DailySummary } from "./daily-summary"
import { EditEntryModal } from "./edit-entry-modal"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import { DatePicker } from "./date-picker"
import { useData } from "@/lib/data-context"
import { isEditable, getDateString } from "@/lib/store"
import type { TimeEntry } from "@/lib/types"

export function LogTimePage() {
  const { getEntriesForDate, getCategoryById } = useData()
  const [selectedDate, setSelectedDate] = useState(getDateString(new Date()))
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null)

  const canEdit = isEditable(selectedDate)
  const entries = getEntriesForDate(selectedDate)

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const [aH, aM] = a.startTime.split(":").map(Number)
      const [bH, bM] = b.startTime.split(":").map(Number)
      return aH * 60 + aM - (bH * 60 + bM)
    })
  }, [entries])

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateStr === getDateString(today)) return "Today"
    if (dateStr === getDateString(yesterday)) return "Yesterday"

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Date Selector */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">{formatDateDisplay(selectedDate)}</h1>
          <DatePicker value={selectedDate} onChange={setSelectedDate} restrictToEditableDays={true} />
        </div>

        {!canEdit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-muted border border-border"
          >
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              This day is locked. Only today and yesterday's logs can be edited.
            </span>
          </motion.div>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Form & Entries */}
        <div className="lg:col-span-2 space-y-6">
          {/* Entry Form */}
          <TimeEntryForm selectedDate={selectedDate} isEditable={canEdit} />

          {/* Entry List */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              Time Log
              <span className="text-sm font-normal text-muted-foreground">
                ({sortedEntries.length} {sortedEntries.length === 1 ? "entry" : "entries"})
              </span>
            </h2>

            {sortedEntries.length > 0 ? (
              <div className="space-y-3">
                {sortedEntries.map((entry, index) => (
                  <TimeEntryCard
                    key={entry.id}
                    entry={entry}
                    category={getCategoryById(entry.categoryId)}
                    isEditable={canEdit}
                    onEdit={() => setEditingEntry(entry)}
                    onDelete={() => setDeletingEntry(entry)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card/50">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No logs yet</h3>
                  <p className="text-muted-foreground">
                    {canEdit ? "Start by adding a time block above." : "No entries were logged for this day."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-1">
          <DailySummary selectedDate={selectedDate} />
        </div>
      </div>

      {/* Modals */}
      <EditEntryModal entry={editingEntry} isOpen={!!editingEntry} onClose={() => setEditingEntry(null)} />
      <DeleteConfirmModal entry={deletingEntry} isOpen={!!deletingEntry} onClose={() => setDeletingEntry(null)} />
    </motion.div>
  )
}
