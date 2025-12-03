import type { Category, GoalSettings, AppSettings, AppState } from "./types"

const STORAGE_KEY = "time-slicer-data"
const API_STATE_URL = "/api/state"

export const defaultCategories: Category[] = [
  { id: "work", name: "Work / Productivity", type: "productive", color: "#4ade80" },
  { id: "sleep", name: "Sleep", type: "neutral", color: "#60a5fa" },
  { id: "movies", name: "Movies & Series", type: "unproductive", color: "#f472b6" },
  { id: "doom", name: "Doom Scrolling", type: "unproductive", color: "#fb923c" },
  { id: "misc", name: "Misc", type: "neutral", color: "#a78bfa" },
]

export const defaultGoalSettings: GoalSettings = {
  dailyProductiveMinutes: 300, // 5 hours
}

export const defaultAppSettings: AppSettings = {
  skipLandingOnNextVisit: false,
  userName: "Akshat",
}

export function getInitialState(): AppState {
  if (typeof window === "undefined") {
    return {
      entries: [],
      categories: defaultCategories,
      goalSettings: defaultGoalSettings,
      appSettings: defaultAppSettings,
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return {
        entries: parsed.entries || [],
        categories: parsed.categories || defaultCategories,
        goalSettings: parsed.goalSettings || defaultGoalSettings,
        appSettings: parsed.appSettings || defaultAppSettings,
      }
    } catch {
      return {
        entries: [],
        categories: defaultCategories,
        goalSettings: defaultGoalSettings,
        appSettings: defaultAppSettings,
      }
    }
  }

  return {
    entries: [],
    categories: defaultCategories,
    goalSettings: defaultGoalSettings,
    appSettings: defaultAppSettings,
  }
}

export function saveState(state: AppState): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export async function fetchRemoteState(): Promise<AppState | null> {
  if (typeof window === "undefined") return null

  try {
    const res = await fetch(API_STATE_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    })

    if (!res.ok) return null

    const data = (await res.json()) as AppState | null
    return data
  } catch {
    // If the network/database is unavailable, fall back to local state only
    return null
  }
}

export async function saveRemoteState(state: AppState): Promise<void> {
  if (typeof window === "undefined") return

  try {
    await fetch(API_STATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    })
  } catch {
    // Ignore network errors so UI/UX is not disturbed
  }
}

export function isEditable(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const entryDate = new Date(dateStr)
  entryDate.setHours(0, 0, 0, 0)

  return entryDate >= yesterday
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)

  const startMinutes = startH * 60 + startM
  let endMinutes = endH * 60 + endM

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60
  }

  return endMinutes - startMinutes
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export function getDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Converts time string to minutes from midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

// Check if a new time range overlaps with existing entries
// Edge timing is allowed (e.g., 10:00-11:00 and 11:00-13:00 are OK)
export function checkTimeOverlap(
  startTime: string,
  endTime: string,
  existingEntries: { startTime: string; endTime: string; id: string }[],
  excludeEntryId?: string, // Used when editing to exclude the current entry
): { hasOverlap: boolean; conflictingEntry?: { startTime: string; endTime: string } } {
  const newStart = timeToMinutes(startTime)
  let newEnd = timeToMinutes(endTime)

  // Handle overnight entries
  if (newEnd <= newStart) {
    newEnd += 24 * 60
  }

  for (const entry of existingEntries) {
    // Skip the entry being edited
    if (excludeEntryId && entry.id === excludeEntryId) continue

    const existingStart = timeToMinutes(entry.startTime)
    let existingEnd = timeToMinutes(entry.endTime)

    // Handle overnight entries
    if (existingEnd <= existingStart) {
      existingEnd += 24 * 60
    }

    // Check for overlap: newStart < existingEnd AND newEnd > existingStart
    // Using strict inequality allows edge timing (11:00 can follow 10:00-11:00)
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        hasOverlap: true,
        conflictingEntry: { startTime: entry.startTime, endTime: entry.endTime },
      }
    }
  }

  return { hasOverlap: false }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
