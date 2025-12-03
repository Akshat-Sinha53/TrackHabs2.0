"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClockPicker } from "@/components/clock-picker"
import { useData } from "@/lib/data-context"
import { checkTimeOverlap, formatTime } from "@/lib/store"
import { toast } from "sonner"

interface TimeEntryFormProps {
  selectedDate: string
  isEditable: boolean
}

export function TimeEntryForm({ selectedDate, isEditable }: TimeEntryFormProps) {
  const { state, addEntry, getEntriesForDate } = useData()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [activity, setActivity] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const quickAddCategories = [
    { id: "sleep", label: "Sleep", icon: "😴" },
    { id: "work", label: "Work", icon: "💼" },
    { id: "movies", label: "Movies", icon: "🎬" },
    { id: "doom", label: "Doom Scroll", icon: "📱" },
  ]

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!startTime) newErrors.startTime = "Required"
    if (!endTime) newErrors.endTime = "Required"
    if (!activity.trim()) newErrors.activity = "Required"
    if (!categoryId) newErrors.category = "Required"

    if (startTime && endTime) {
      const existingEntries = getEntriesForDate(selectedDate)
      const { hasOverlap, conflictingEntry } = checkTimeOverlap(startTime, endTime, existingEntries)

      if (hasOverlap && conflictingEntry) {
        newErrors.time = `Overlaps with existing entry (${formatTime(conflictingEntry.startTime)} - ${formatTime(conflictingEntry.endTime)})`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    addEntry({
      date: selectedDate,
      startTime,
      endTime,
      activityLabel: activity,
      categoryId,
    })

    toast.success("Entry added", {
      description: `Logged "${activity}" successfully`,
    })

    setStartTime("")
    setEndTime("")
    setActivity("")
    setCategoryId("")
    setErrors({})
  }

  const handleQuickAdd = (catId: string) => {
    setCategoryId(catId)
    const cat = state.categories.find((c) => c.id === catId)
    if (cat) {
      setActivity(cat.name.split(" / ")[0])
    }
  }

  if (!isEditable) {
    return (
      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">🔒</span>
            </div>
            <p className="text-muted-foreground">This day is locked. Only today and yesterday can be edited.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Log a Time Block
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quick Add Buttons */}
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground mb-2 block">
            <Zap className="w-3 h-3 inline mr-1" />
            Quick Add
          </Label>
          <div className="flex flex-wrap gap-2">
            {quickAddCategories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAdd(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  categoryId === cat.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ClockPicker label="Start Time" value={startTime} onChange={setStartTime} error={errors.startTime} />
            <ClockPicker label="End Time" value={endTime} onChange={setEndTime} error={errors.endTime} />
          </div>

          {errors.time && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{errors.time}</p>
          )}

          <div>
            <Label htmlFor="activity" className="text-sm">
              Activity
            </Label>
            <Input
              id="activity"
              placeholder="What did you do?"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className={errors.activity ? "border-destructive" : ""}
            />
            {errors.activity && <p className="text-xs text-destructive mt-1">{errors.activity}</p>}
          </div>

          <div>
            <Label htmlFor="category" className="text-sm">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {state.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
