"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClockPickerProps {
  value: string
  onChange: (time: string) => void
  label?: string
  error?: string
}

export function ClockPicker({ value, onChange, label, error }: ClockPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<"hours" | "minutes">("hours")
  const [selectedHour, setSelectedHour] = useState(12)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [period, setPeriod] = useState<"AM" | "PM">("AM")
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse the value when it changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number)
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      setSelectedHour(hour12)
      setSelectedMinute(m)
      setPeriod(h >= 12 ? "PM" : "AM")
    }
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDisplayTime = () => {
    if (!value) return "Select time"
    const [h, m] = value.split(":").map(Number)
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ampm = h >= 12 ? "PM" : "AM"
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  const getHandRotation = () => {
    if (mode === "hours") {
      // Hour 12 is at top (0°), each hour is 30°
      return (selectedHour % 12) * 30
    }
    // Minute 0 is at top (0°), each minute is 6°
    return selectedMinute * 6
  }

  const confirmTime = () => {
    let hour24 = selectedHour
    if (period === "PM" && selectedHour !== 12) hour24 += 12
    if (period === "AM" && selectedHour === 12) hour24 = 0

    const timeString = `${hour24.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`
    onChange(timeString)
    setIsOpen(false)
    setMode("hours")
  }

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  const getPosition = (index: number, total: number) => {
    // Start from -90° (top) and go clockwise
    const angle = (index * (360 / total) - 90) * (Math.PI / 180)
    const radius = 85
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    return { x, y }
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <label className="text-sm font-medium mb-1.5 block">{label}</label>}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border transition-colors text-left ${
          error
            ? "border-destructive"
            : isOpen
              ? "border-primary ring-1 ring-primary"
              : "border-input hover:border-primary/50"
        } bg-background`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{formatDisplayTime()}</span>
        <Clock className="w-4 h-4 text-muted-foreground" />
      </button>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 p-4 bg-card border border-border rounded-xl shadow-xl left-0"
          >
            {/* Mode Toggle */}
            <div className="flex justify-center items-center gap-1 mb-4">
              <button
                type="button"
                onClick={() => setMode("hours")}
                className={`px-4 py-2 rounded-lg text-2xl font-bold transition-colors ${
                  mode === "hours"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selectedHour}
              </button>
              <span className="text-2xl font-bold text-muted-foreground">:</span>
              <button
                type="button"
                onClick={() => setMode("minutes")}
                className={`px-4 py-2 rounded-lg text-2xl font-bold transition-colors ${
                  mode === "minutes"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {selectedMinute.toString().padStart(2, "0")}
              </button>
            </div>

            {/* Clock Face - Fixed layout */}
            <div className="relative w-56 h-56 rounded-full bg-secondary/50 border border-border mx-auto flex items-center justify-center">
              {/* Clock Hand */}
              <motion.div
                className="absolute w-1 origin-bottom rounded-full bg-primary"
                style={{
                  height: mode === "hours" ? 65 : 80,
                  bottom: "50%",
                  left: "calc(50% - 2px)",
                }}
                animate={{ rotate: getHandRotation() }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary" />
              </motion.div>

              {/* Center Dot */}
              <div className="absolute w-3 h-3 rounded-full bg-primary z-10" />

              {/* Numbers - Fixed positioning */}
              {(mode === "hours" ? hours : minutes).map((num, i) => {
                const { x, y } = getPosition(i, 12)
                const isSelected = mode === "hours" ? num === selectedHour : num === selectedMinute

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (mode === "hours") {
                        setSelectedHour(num)
                        setTimeout(() => setMode("minutes"), 200)
                      } else {
                        setSelectedMinute(num)
                      }
                    }}
                    className={`absolute w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isSelected ? "bg-primary text-primary-foreground scale-110" : "hover:bg-secondary text-foreground"
                    }`}
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    {mode === "minutes" ? num.toString().padStart(2, "0") : num}
                  </button>
                )
              })}
            </div>

            {/* AM/PM Toggle */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === "AM"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === "PM"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                PM
              </button>
            </div>

            {/* Confirm Button */}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false)
                  setMode("hours")
                }}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={confirmTime}>
                Confirm
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
