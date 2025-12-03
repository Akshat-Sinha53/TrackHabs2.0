"use client"

import { motion } from "framer-motion"
import { Clock, BarChart3, Settings, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavbarProps {
  currentPage: "log" | "analytics"
  onNavigate: (page: "log" | "analytics") => void
  onOpenSettings: () => void
  onLogoClick?: () => void
}

export function Navbar({ currentPage, onNavigate, onOpenSettings, onLogoClick }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={onLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">Time Slicer</span>
          </button>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("log")}
              className={cn(
                "rounded-md transition-all duration-200",
                currentPage === "log"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Log Time
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("analytics")}
              className={cn(
                "rounded-md transition-all duration-200",
                currentPage === "analytics"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.nav>
  )
}
