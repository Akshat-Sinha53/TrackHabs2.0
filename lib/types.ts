export interface Category {
  id: string
  name: string
  type: "productive" | "neutral" | "unproductive"
  color: string
}

export interface TimeEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  activityLabel: string
  categoryId: string
}

export interface GoalSettings {
  dailyProductiveMinutes: number
}

export interface AppSettings {
  skipLandingOnNextVisit: boolean
  userName: string
}

export interface AppState {
  entries: TimeEntry[]
  categories: Category[]
  goalSettings: GoalSettings
  appSettings: AppSettings
}
