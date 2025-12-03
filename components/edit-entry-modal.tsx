"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ClockPicker } from "@/components/clock-picker"
import { useData } from "@/lib/data-context"
import { checkTimeOverlap, formatTime } from "@/lib/store"
import type { TimeEntry } from "@/lib/types"
import { toast } from "sonner"

interface EditEntryModalProps {
  entry: TimeEntry | null
  isOpen: boolean
  onClose: () => void
}

export function EditEntryModal({ entry, isOpen, onClose }: EditEntryModalProps) {
  const { state, updateEntry, getEntriesForDate } = useData()
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [activity, setActivity] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (entry) {
      setStartTime(entry.startTime)
      setEndTime(entry.endTime)
      setActivity(entry.activityLabel)
      setCategoryId(entry.categoryId)
      setError("")
    }
  }, [entry])

  const handleSave = () => {
    if (!entry) return

    if (!startTime || !endTime || !activity.trim() || !categoryId) {
      toast.error("Please fill all fields")
      return
    }

    const existingEntries = getEntriesForDate(entry.date)
    const { hasOverlap, conflictingEntry } = checkTimeOverlap(
      startTime,
      endTime,
      existingEntries,
      entry.id, // Exclude current entry being edited
    )

    if (hasOverlap && conflictingEntry) {
      setError(
        `Overlaps with existing entry (${formatTime(conflictingEntry.startTime)} - ${formatTime(conflictingEntry.endTime)})`,
      )
      return
    }

    updateEntry(entry.id, {
      startTime,
      endTime,
      activityLabel: activity,
      categoryId,
    })

    toast.success("Entry updated")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <ClockPicker label="Start Time" value={startTime} onChange={setStartTime} />
            <ClockPicker label="End Time" value={endTime} onChange={setEndTime} />
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}

          <div>
            <Label htmlFor="edit-activity">Activity</Label>
            <Input id="edit-activity" value={activity} onChange={(e) => setActivity(e.target.value)} />
          </div>

          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue />
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
