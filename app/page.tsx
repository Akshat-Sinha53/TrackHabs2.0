"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { DataProvider, useData } from "@/lib/data-context"
import { LandingScreen } from "@/components/landing-screen"
import { Navbar } from "@/components/navbar"
import { LogTimePage } from "@/components/log-time-page"
import { AnalyticsPage } from "@/components/analytics-page"
import { SettingsModal } from "@/components/settings-modal"

function AppContent() {
  const { state, updateAppSettings } = useData()
  const [showLanding, setShowLanding] = useState(true)
  const [currentPage, setCurrentPage] = useState<"log" | "analytics">("log")
  const [showSettings, setShowSettings] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (state.appSettings.skipLandingOnNextVisit) {
      setShowLanding(false)
    }
  }, [state.appSettings.skipLandingOnNextVisit])

  const handleEnterDashboard = () => {
    setShowLanding(false)
    updateAppSettings({ skipLandingOnNextVisit: true })
  }

  const handleGoToLanding = () => {
    setShowLanding(true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LandingScreen userName={state.appSettings.userName} onEnter={handleEnterDashboard} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-background"
        >
          <Navbar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            onOpenSettings={() => setShowSettings(true)}
            onLogoClick={handleGoToLanding}
          />

          <AnimatePresence mode="wait">
            {currentPage === "log" ? (
              <motion.div
                key="log"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <LogTimePage />
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsPage />
              </motion.div>
            )}
          </AnimatePresence>

          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Page() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  )
}
