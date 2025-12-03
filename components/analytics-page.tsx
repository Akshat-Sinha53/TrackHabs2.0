"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { BarChart3, TrendingUp, Moon, Zap, Clock, Activity, Flame, Brain, AlertTriangle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-context"
import { formatDuration, getDateString } from "@/lib/store"
import { DatePicker } from "./date-picker"
import { CustomPieChart } from "./pie-chart"

const CHART_COLORS = {
  productive: "#22c55e",
  sleep: "#3b82f6",
  other: "#ef4444",
  pink: "#ec4899",
  orange: "#f97316",
  purple: "#a855f7",
}

const PIE_COLORS = ["#22c55e", "#3b82f6", "#ef4444", "#ec4899", "#f97316", "#a855f7", "#06b6d4", "#eab308"]

const MONTHS = [
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

function formatDateLabel(day: number, month: number, year: number): string {
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

type AnalyticsTab = "daily" | "monthly"

function CustomLineTooltip({
  active,
  payload,
  label,
}: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="font-semibold text-foreground mb-2">Day {label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">
              {entry.dataKey === "productive" ? "Productive" : entry.dataKey === "sleep" ? "Sleep" : "Other"}:
            </span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.value}h
            </span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnalyticsPage() {
  const { entries, categories, getCategoryById } = useData()
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("daily")
  const [selectedDate, setSelectedDate] = useState(() => getDateString(new Date()))
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary" />
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Insights into how you spend your time</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <Button
          variant={activeTab === "daily" ? "default" : "outline"}
          onClick={() => setActiveTab("daily")}
          className={cn("transition-all", activeTab === "daily" && "bg-primary text-primary-foreground")}
        >
          Daily Analytics
        </Button>
        <Button
          variant={activeTab === "monthly" ? "default" : "outline"}
          onClick={() => setActiveTab("monthly")}
          className={cn("transition-all", activeTab === "monthly" && "bg-primary text-primary-foreground")}
        >
          Monthly Analytics
        </Button>
      </div>

      {activeTab === "daily" ? (
        <DailyAnalytics
          value={selectedDate}
          onChange={setSelectedDate} // Use onChange prop
          entries={entries}
          categories={categories} // Pass categories
          getCategoryById={getCategoryById}
        />
      ) : (
        <MonthlyAnalytics
          month={selectedMonth}
          year={selectedYear}
          onYearChange={setSelectedYear} // Use onYearChange prop
          onMonthChange={setSelectedMonth} // Use onMonthChange prop
          entries={entries}
          categories={categories} // Pass categories
          getCategoryById={getCategoryById}
        />
      )}
    </motion.div>
  )
}

// Type definitions for components
interface DailyAnalyticsProps {
  value: string
  onChange: (date: string) => void
  entries: TimeEntry[]
  categories: Category[]
  getCategoryById: (id: string) => Category | undefined
}

interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  activityLabel: string
  categoryId: string
}

interface Category {
  id: string
  name: string
  type: "productive" | "neutral" | "unproductive"
  color: string
}

function DailyAnalytics({ value, onChange, entries, categories, getCategoryById }: DailyAnalyticsProps) {
  const safeEntries = entries || []
  const safeCategories = categories || []

  console.log("[v0] DailyAnalytics - selectedDate:", value)
  console.log("[v0] DailyAnalytics - safeEntries count:", safeEntries.length)
  console.log("[v0] DailyAnalytics - sample entries:", JSON.stringify(safeEntries.slice(0, 3)))

  const dayEntries = useMemo(() => {
    const filtered = safeEntries.filter((e) => e.date === value)
    console.log("[v0] DailyAnalytics - filtered dayEntries:", filtered.length)
    return filtered
  }, [safeEntries, value])

  const stats = useMemo(() => {
    const byCategory: Record<string, { minutes: number; color: string; name: string; type: string }> = {}
    const hourlyData: Record<number, { productive: number; sleep: number; other: number }> = {}

    // Initialize hourly data
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { productive: 0, sleep: 0, other: 0 }
    }

    let totalMinutes = 0
    let productiveMinutes = 0
    let sleepMinutes = 0
    let otherMinutes = 0

    dayEntries.forEach((entry) => {
      const cat = getCategoryById(entry.categoryId)
      if (!cat) return

      const catColor =
        cat.color && cat.color.startsWith("#")
          ? cat.color
          : PIE_COLORS[Object.keys(byCategory).length % PIE_COLORS.length]

      if (!byCategory[cat.id]) {
        byCategory[cat.id] = { minutes: 0, color: catColor, name: cat.name, type: cat.type }
      }
      byCategory[cat.id].minutes += entry.durationMinutes
      totalMinutes += entry.durationMinutes

      // Calculate hourly breakdown
      const [startH] = entry.startTime.split(":").map(Number)
      const [endH] = entry.endTime.split(":").map(Number)

      for (let h = startH; h < (endH <= startH ? 24 : endH); h++) {
        const hour = h % 24
        if (cat.type === "productive") {
          hourlyData[hour].productive += entry.durationMinutes / Math.max(1, endH - startH)
          productiveMinutes += entry.durationMinutes / Math.max(1, endH - startH)
        } else if (cat.id === "sleep") {
          hourlyData[hour].sleep += entry.durationMinutes / Math.max(1, endH - startH)
          sleepMinutes += entry.durationMinutes / Math.max(1, endH - startH)
        } else {
          hourlyData[hour].other += entry.durationMinutes / Math.max(1, endH - startH)
          otherMinutes += entry.durationMinutes / Math.max(1, endH - startH)
        }
      }

      // Also track totals without hourly distribution
      if (cat.type === "productive") {
        productiveMinutes = productiveMinutes || 0
      } else if (cat.id === "sleep") {
        sleepMinutes = sleepMinutes || 0
      } else {
        otherMinutes = otherMinutes || 0
      }
    })

    // Recalculate correct totals
    productiveMinutes = 0
    sleepMinutes = 0
    otherMinutes = 0

    dayEntries.forEach((entry) => {
      const cat = getCategoryById(entry.categoryId)
      if (!cat) return

      if (cat.type === "productive") {
        productiveMinutes += entry.durationMinutes
      } else if (cat.id === "sleep") {
        sleepMinutes += entry.durationMinutes
      } else {
        otherMinutes += entry.durationMinutes
      }
    })

    const pieData = Object.entries(byCategory)
      .map(([id, data], index) => {
        const totalMinutes = Object.values(byCategory).reduce((sum, cat) => sum + cat.minutes, 0)
        return {
          name: data.name,
          value: data.minutes,
          color: data.color && data.color.startsWith("#") ? data.color : PIE_COLORS[index % PIE_COLORS.length],
          percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
        }
      })
      .sort((a, b) => b.value - a.value)

    console.log("[v0] pieData:", JSON.stringify(pieData))

    const hourlyChartData = Object.entries(hourlyData).map(([hour, data]) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      productive: Math.round((data.productive / 60) * 100) / 100,
      sleep: Math.round((data.sleep / 60) * 100) / 100,
      other: Math.round((data.other / 60) * 100) / 100,
    }))

    return {
      byCategory,
      pieData,
      hourlyChartData,
      totalMinutes,
      productiveMinutes,
      sleepMinutes,
      otherMinutes,
    }
  }, [dayEntries, getCategoryById])

  if (dayEntries.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4">
          <DatePicker value={value} onChange={onChange} restrictToEditableDates={false} />
        </div>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data for This Day</h3>
            <p className="text-muted-foreground">Start logging time entries to see analytics.</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <DatePicker value={value} onChange={onChange} restrictToEditableDates={false} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Productive</p>
                  <p className="text-2xl font-bold text-green-500">{formatDuration(stats.productiveMinutes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Moon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sleep</p>
                  <p className="text-2xl font-bold text-blue-500">{formatDuration(stats.sleepMinutes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Other</p>
                  <p className="text-2xl font-bold text-red-500">{formatDuration(stats.otherMinutes)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <CustomPieChart data={stats.pieData} size={280} innerRadius={60} outerRadius={100} />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {stats.pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Line Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Hourly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="hour"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickFormatter={(value) => value.split(":")[0]}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                              <p className="font-semibold text-foreground mb-2">{label}</p>
                              {payload.map(
                                (entry: { value?: number; dataKey?: string; color?: string }, index: number) => (
                                  <p key={index} className="text-sm flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground capitalize">{String(entry.dataKey)}:</span>
                                    <span className="font-medium" style={{ color: entry.color }}>
                                      {entry.value}h
                                    </span>
                                  </p>
                                ),
                              )}
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="productive"
                      name="Productive"
                      stroke={CHART_COLORS.productive}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sleep"
                      name="Sleep"
                      stroke={CHART_COLORS.sleep}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="other"
                      name="Other"
                      stroke={CHART_COLORS.other}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Moved MonthlyAnalytics below DailyAnalytics and updated props
interface MonthlyAnalyticsProps {
  year: number
  month: number
  onYearChange: (year: number) => void
  onMonthChange: (month: number) => void
  entries: TimeEntry[]
  categories: Category[]
  getCategoryById: (id: string) => Category | undefined
}

function MonthlyAnalytics({
  year,
  month,
  onYearChange,
  onMonthChange,
  entries,
  categories,
  getCategoryById,
}: MonthlyAnalyticsProps) {
  const safeEntries = entries || []

  console.log("[v0] MonthlyAnalytics - year:", year, "month:", month)
  console.log("[v0] MonthlyAnalytics - safeEntries count:", safeEntries.length)

  const monthEntries = useMemo(() => {
    return safeEntries.filter((entry) => {
      const [entryYear, entryMonth] = entry.date.split("-").map(Number)
      const matches = entryYear === year && entryMonth === month
      if (matches) {
        console.log("[v0] MonthlyAnalytics - matched entry:", entry.date)
      }
      return matches
    })
  }, [safeEntries, year, month])

  console.log("[v0] MonthlyAnalytics - filtered monthEntries:", monthEntries.length)

  const stats = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const totalHoursInMonth = daysInMonth * 24

    const dailyData: { day: number; dateLabel: string; productive: number; sleep: number; other: number }[] = []
    const byCategory: Record<string, { minutes: number; color: string; name: string }> = {}
    const productiveActivities: Record<string, number> = {}
    let totalProductiveMinutes = 0
    let totalSleepMinutes = 0
    let totalOtherMinutes = 0

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayEntries = safeEntries.filter((e) => e.date === dateStr)

      let dayProductive = 0
      let daySleep = 0
      let dayOther = 0

      dayEntries.forEach((entry) => {
        const cat = getCategoryById(entry.categoryId)
        if (!cat) return

        const catColor =
          cat.color && cat.color.startsWith("#")
            ? cat.color
            : PIE_COLORS[Object.keys(byCategory).length % PIE_COLORS.length]

        if (!byCategory[cat.id]) {
          byCategory[cat.id] = { minutes: 0, color: catColor, name: cat.name }
        }
        byCategory[cat.id].minutes += entry.durationMinutes

        if (cat.type === "productive") {
          dayProductive += entry.durationMinutes
          totalProductiveMinutes += entry.durationMinutes
          productiveActivities[entry.activityLabel] =
            (productiveActivities[entry.activityLabel] || 0) + entry.durationMinutes
        } else if (cat.id === "sleep") {
          daySleep += entry.durationMinutes
          totalSleepMinutes += entry.durationMinutes
        } else {
          dayOther += entry.durationMinutes
          totalOtherMinutes += entry.durationMinutes
        }
      })

      dailyData.push({
        day,
        dateLabel: formatDateLabel(day, month, year),
        productive: Math.round((dayProductive / 60) * 100) / 100,
        sleep: Math.round((daySleep / 60) * 100) / 100,
        other: Math.round((dayOther / 60) * 100) / 100,
      })
    }

    const pieData = Object.entries(byCategory)
      .map(([id, data], index) => {
        const totalMinutes = Object.values(byCategory).reduce((sum, cat) => sum + cat.minutes, 0)
        return {
          name: data.name,
          value: data.minutes,
          color: data.color && data.color.startsWith("#") ? data.color : PIE_COLORS[index % PIE_COLORS.length],
          fill: data.color && data.color.startsWith("#") ? data.color : PIE_COLORS[index % PIE_COLORS.length], // Recharts uses fill property
          percentage: totalMinutes > 0 ? (data.minutes / totalMinutes) * 100 : 0,
        }
      })
      .sort((a, b) => b.value - a.value)

    const topActivities = Object.entries(productiveActivities)
      .map(([name, minutes]) => ({
        name,
        minutes,
        percentage: totalProductiveMinutes > 0 ? (minutes / totalProductiveMinutes) * 100 : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5)

    const daysWithData = safeEntries.length > 0 ? new Set(safeEntries.map((e) => e.date)).size : 0
    const avgSleepPerDay = daysWithData > 0 ? totalSleepMinutes / daysWithData : 0
    const avgProductivePerDay = daysWithData > 0 ? totalProductiveMinutes / daysWithData : 0
    const totalLoggedMinutes = totalProductiveMinutes + totalSleepMinutes + totalOtherMinutes

    return {
      dailyData,
      pieData,
      topActivities,
      totalProductiveMinutes,
      totalSleepMinutes,
      totalOtherMinutes,
      totalLoggedMinutes,
      totalHoursInMonth,
      avgSleepPerDay,
      avgProductivePerDay,
      daysWithData,
    }
  }, [safeEntries, year, month, getCategoryById])

  if (monthEntries.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={month}
            onChange={(e) => onMonthChange(Number.parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Data for This Month</h3>
            <p className="text-muted-foreground">Start logging time entries to see monthly analytics.</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={month}
          onChange={(e) => onMonthChange(Number.parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => onYearChange(Number.parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly Time Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Monthly Time Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Productive */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Productive</span>
                  </div>
                  <span className="text-green-500 font-bold">{formatDuration(stats.totalProductiveMinutes)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalLoggedMinutes > 0 ? (stats.totalProductiveMinutes / stats.totalLoggedMinutes) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLoggedMinutes > 0
                    ? ((stats.totalProductiveMinutes / stats.totalLoggedMinutes) * 100).toFixed(1)
                    : 0}
                  % of logged time
                </p>
              </div>

              {/* Sleep */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Sleep</span>
                  </div>
                  <span className="text-blue-500 font-bold">{formatDuration(stats.totalSleepMinutes)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalLoggedMinutes > 0 ? (stats.totalSleepMinutes / stats.totalLoggedMinutes) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLoggedMinutes > 0
                    ? ((stats.totalSleepMinutes / stats.totalLoggedMinutes) * 100).toFixed(1)
                    : 0}
                  % of logged time
                </p>
              </div>

              {/* Other/Wasted */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Other / Wasted</span>
                  </div>
                  <span className="text-red-500 font-bold">{formatDuration(stats.totalOtherMinutes)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats.totalLoggedMinutes > 0 ? (stats.totalOtherMinutes / stats.totalLoggedMinutes) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalLoggedMinutes > 0
                    ? ((stats.totalOtherMinutes / stats.totalLoggedMinutes) * 100).toFixed(1)
                    : 0}
                  % of logged time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Trends Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Daily Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="h" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        // Get the dateLabel from the payload's original data
                        const dataPoint = payload[0]?.payload as { dateLabel?: string }
                        const displayLabel = dataPoint?.dateLabel || `Day ${label}`
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                            <p className="font-semibold text-foreground mb-2">{displayLabel}</p>
                            {payload.map(
                              (entry: { value?: number; dataKey?: string; color?: string }, index: number) => (
                                <p key={index} className="text-sm flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                  <span className="text-muted-foreground capitalize">{String(entry.dataKey)}:</span>
                                  <span className="font-medium" style={{ color: entry.color }}>
                                    {entry.value}h
                                  </span>
                                </p>
                              ),
                            )}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="productive"
                    name="Productive"
                    stroke={CHART_COLORS.productive}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    name="Sleep"
                    stroke={CHART_COLORS.sleep}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="other"
                    name="Other"
                    stroke={CHART_COLORS.other}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Monthly Category Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <CustomPieChart data={stats.pieData} size={280} innerRadius={60} outerRadius={100} />
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {stats.pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Activities */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                Top Productive Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topActivities.length > 0 ? (
                <div className="space-y-4">
                  {stats.topActivities.map((activity, index) => (
                    <div key={activity.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(activity.minutes)} ({activity.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${activity.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No productive activities logged this month.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Insights & Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">Average Sleep Per Day</p>
                <p className="text-2xl font-bold text-blue-500">{formatDuration(stats.avgSleepPerDay)}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400">Average Productive Hours</p>
                <p className="text-2xl font-bold text-green-500">{formatDuration(stats.avgProductivePerDay)}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-sm text-purple-400">Days with Data</p>
                <p className="text-2xl font-bold text-purple-500">{stats.daysWithData} days</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">Time Wasted</p>
                <p className="text-2xl font-bold text-red-500">{formatDuration(stats.totalOtherMinutes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
