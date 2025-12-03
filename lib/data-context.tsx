"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { AppState, TimeEntry, Category, GoalSettings, AppSettings } from "./types"
import { getInitialState, saveState, generateId, calculateDuration, fetchRemoteState, saveRemoteState } from "./store"

interface DataContextType {
  state: AppState
  addEntry: (entry: Omit<TimeEntry, "id" | "durationMinutes">) => void
  updateEntry: (id: string, entry: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  updateGoalSettings: (settings: Partial<GoalSettings>) => void
  updateAppSettings: (settings: Partial<AppSettings>) => void
  getEntriesForDate: (date: string) => TimeEntry[]
  getEntriesForMonth: (year: number, month: number) => TimeEntry[]
  getCategoryById: (id: string) => Category | undefined
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => getInitialState())
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 1. Load from localStorage immediately so the UI behaves as before
    setState(getInitialState())
    setIsInitialized(true)

    // 2. Then try to override with the latest shared state from the server
    let cancelled = false

    const loadRemote = async () => {
      const remote = await fetchRemoteState()
      if (!cancelled && remote) {
        setState(remote)
      }
    }

    void loadRemote()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isInitialized) {
      // Persist to localStorage (original behavior)
      saveState(state)
      // Also mirror to the shared database in the background
      void saveRemoteState(state)
    }
  }, [state, isInitialized])

  const addEntry = useCallback((entry: Omit<TimeEntry, "id" | "durationMinutes">) => {
    const duration = calculateDuration(entry.startTime, entry.endTime)
    const newEntry: TimeEntry = {
      ...entry,
      id: generateId(),
      durationMinutes: duration,
    }
    setState((prev) => ({
      ...prev,
      entries: [...prev.entries, newEntry],
    }))
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...updates }
          if (updates.startTime || updates.endTime) {
            updated.durationMinutes = calculateDuration(
              updates.startTime || entry.startTime,
              updates.endTime || entry.endTime,
            )
          }
          return updated
        }
        return entry
      }),
    }))
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((entry) => entry.id !== id),
    }))
  }, [])

  const addCategory = useCallback((category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
    }
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }))
  }, [])

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat.id !== id),
    }))
  }, [])

  const updateGoalSettings = useCallback((settings: Partial<GoalSettings>) => {
    setState((prev) => ({
      ...prev,
      goalSettings: { ...prev.goalSettings, ...settings },
    }))
  }, [])

  const updateAppSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      appSettings: { ...prev.appSettings, ...settings },
    }))
  }, [])

  const getEntriesForDate = useCallback(
    (date: string) => {
      return state.entries.filter((entry) => entry.date === date)
    },
    [state.entries],
  )

  const getEntriesForMonth = useCallback(
    (year: number, month: number) => {
      return state.entries.filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate.getFullYear() === year && entryDate.getMonth() === month
      })
    },
    [state.entries],
  )

  const getCategoryById = useCallback(
    (id: string) => {
      return state.categories.find((cat) => cat.id === id)
    },
    [state.categories],
  )

  return (
    <DataContext.Provider
      value={{
        state,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
        updateGoalSettings,
        updateAppSettings,
        getEntriesForDate,
        getEntriesForMonth,
        getCategoryById,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return {
    ...context,
    entries: context.state.entries,
    categories: context.state.categories,
    goalSettings: context.state.goalSettings,
    appSettings: context.state.appSettings,
  }
}
