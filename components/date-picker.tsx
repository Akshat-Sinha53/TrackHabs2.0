"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getDateString } from "@/lib/store"

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  restrictToEditableDays?: boolean
  restrictToEditableDates?: boolean // Alias for restrictToEditableDays
}

function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const [year, month, day] = dateStr.split("-").map(Number)
  if (isNaN(year) || isNaN(month) || isNaN(day)) return new Date()
  return new Date(year, month - 1, day)
}

export function DatePicker({
  value,
  onChange,
  restrictToEditableDays = false,
  restrictToEditableDates = false,
}: DatePickerProps) {
  const isRestricted = restrictToEditableDays || restrictToEditableDates

  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => parseLocalDate(value))
  const containerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  useEffect(() => {
    setViewDate(parseLocalDate(value))
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAllowed = (date: Date) => {
    if (!isRestricted) return true
    const dateStr = getDateString(date)
    const todayStr = getDateString(today)
    const yesterdayStr = getDateString(yesterday)
    return dateStr === todayStr || dateStr === yesterdayStr
  }

  const isDateSelected = (date: Date) => {
    return getDateString(date) === value
  }

  const isToday = (date: Date) => {
    return getDateString(date) === getDateString(today)
  }

  const handleDateSelect = (date: Date) => {
    if (isRestricted && !isDateAllowed(date)) return
    onChange(getDateString(date))
    setIsOpen(false)
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(viewDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setViewDate(newDate)
  }

  const formatDisplayDate = () => {
    const date = parseLocalDate(value)
    const todayStr = getDateString(today)
    const yesterdayStr = getDateString(yesterday)

    if (value === todayStr) return "Today"
    if (value === yesterdayStr) return "Yesterday"

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const days = getDaysInMonth(viewDate)

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-card border-border hover:bg-secondary"
      >
        <Calendar className="w-4 h-4 text-primary" />
        <span>{formatDisplayDate()}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-xl p-4 min-w-[280px]"
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-foreground">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-9" />
                }

                const allowed = isDateAllowed(date)
                const selected = isDateSelected(date)
                const todayDate = isToday(date)

                return (
                  <motion.button
                    key={getDateString(date)}
                    whileHover={allowed ? { scale: 1.1 } : undefined}
                    whileTap={allowed ? { scale: 0.95 } : undefined}
                    onClick={() => handleDateSelect(date)}
                    disabled={isRestricted && !allowed}
                    className={cn(
                      "h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-colors relative",
                      selected && "bg-primary text-primary-foreground",
                      !selected && allowed && "hover:bg-secondary text-foreground",
                      !selected && todayDate && "border border-primary",
                      isRestricted && !allowed && "text-muted-foreground/40 cursor-not-allowed",
                    )}
                  >
                    {date.getDate()}
                    {isRestricted && !allowed && (
                      <Lock className="w-2 h-2 absolute bottom-0.5 right-0.5 text-muted-foreground/40" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Quick Actions */}
            {isRestricted && (
              <div className="mt-4 pt-3 border-t border-border flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSelect(today)}
                  className={cn("flex-1", value === getDateString(today) && "bg-primary text-primary-foreground")}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateSelect(yesterday)}
                  className={cn("flex-1", value === getDateString(yesterday) && "bg-primary text-primary-foreground")}
                >
                  Yesterday
                </Button>
              </div>
            )}

            {isRestricted && (
              <p className="text-xs text-muted-foreground mt-3 text-center">Only today and yesterday can be edited</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
