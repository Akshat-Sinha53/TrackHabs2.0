"use client"

import { useMemo, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Flame, Clock, CheckCircle2, PartyPopper } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useData } from "@/lib/data-context"
import { formatDuration, getDateString } from "@/lib/store"
import { toast } from "sonner"
import ReactConfetti from "react-confetti"

interface DailySummaryProps {
  selectedDate: string
}

export function DailySummary({ selectedDate }: DailySummaryProps) {
  const { state, getEntriesForDate, getCategoryById } = useData()
  const entries = getEntriesForDate(selectedDate)
  const [showConfetti, setShowConfetti] = useState(false)
  const [prevGoalMet, setPrevGoalMet] = useState(false)

  const stats = useMemo(() => {
    const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0)

    const byCategory: Record<string, number> = {}
    let productiveMinutes = 0

    entries.forEach((entry) => {
      byCategory[entry.categoryId] = (byCategory[entry.categoryId] || 0) + entry.durationMinutes
      const cat = getCategoryById(entry.categoryId)
      if (cat?.type === "productive") {
        productiveMinutes += entry.durationMinutes
      }
    })

    const goalMinutes = state.goalSettings.dailyProductiveMinutes
    const goalProgress = Math.min((productiveMinutes / goalMinutes) * 100, 100)
    const goalMet = productiveMinutes >= goalMinutes

    return {
      totalMinutes,
      byCategory,
      productiveMinutes,
      goalProgress,
      goalMet,
      goalMinutes,
    }
  }, [entries, getCategoryById, state.goalSettings.dailyProductiveMinutes])

  // Calculate streak
  const streak = useMemo(() => {
    let count = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = getDateString(checkDate)
      const dayEntries = state.entries.filter((e) => e.date === dateStr)

      if (dayEntries.length > 0) {
        count++
      } else if (i > 0) {
        break
      }
    }

    return count
  }, [state.entries])

  // Goal celebration
  useEffect(() => {
    if (stats.goalMet && !prevGoalMet) {
      setShowConfetti(true)
      toast.success("Goal achieved!", {
        description: `You've hit your ${formatDuration(stats.goalMinutes)} productivity goal!`,
        icon: <PartyPopper className="w-4 h-4" />,
      })
      setTimeout(() => setShowConfetti(false), 5000)
    }
    setPrevGoalMet(stats.goalMet)
  }, [stats.goalMet, stats.goalMinutes, prevGoalMet])

  const categoryStats = Object.entries(stats.byCategory)
    .map(([catId, minutes]) => {
      const category = getCategoryById(catId)
      return {
        category,
        minutes,
        percentage: stats.totalMinutes > 0 ? (minutes / stats.totalMinutes) * 100 : 0,
      }
    })
    .sort((a, b) => b.minutes - a.minutes)

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <div className="space-y-4">
        {/* Daily Goal Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border bg-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Daily Goal Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Productive time</span>
                  <span className="font-semibold text-foreground">
                    {formatDuration(stats.productiveMinutes)} / {formatDuration(stats.goalMinutes)}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={stats.goalProgress} className="h-3" />
                  <AnimatePresence>
                    {stats.goalMet && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1">
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.goalMet
                    ? "Great job! You've reached your daily goal!"
                    : `${formatDuration(stats.goalMinutes - stats.productiveMinutes)} more to reach your goal`}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Today's Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total logged</span>
                  <span className="font-semibold">{formatDuration(stats.totalMinutes)}</span>
                </div>

                {categoryStats.length > 0 ? (
                  <div className="space-y-2">
                    {categoryStats.map(({ category, minutes, percentage }) => (
                      <div key={category?.id || "unknown"} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category?.color || "#666" }}
                        />
                        <span className="text-sm text-muted-foreground flex-1 truncate">
                          {category?.name || "Unknown"}
                        </span>
                        <span className="text-sm font-medium">{formatDuration(minutes)}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No entries logged yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Logging Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-foreground">{streak}</div>
                <div className="text-sm text-muted-foreground">{streak === 1 ? "day" : "days"} in a row</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {streak > 0 ? "Keep it up! You're building a great habit." : "Start logging to build your streak!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
