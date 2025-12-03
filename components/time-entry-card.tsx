"use client"

import { motion } from "framer-motion"
import { Pencil, Trash2, Lock, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { TimeEntry, Category } from "@/lib/types"
import { formatTime, formatDuration } from "@/lib/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TimeEntryCardProps {
  entry: TimeEntry
  category: Category | undefined
  isEditable: boolean
  onEdit: () => void
  onDelete: () => void
  index: number
}

export function TimeEntryCard({ entry, category, isEditable, onEdit, onDelete, index }: TimeEntryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <Card
        className={`p-4 border-border bg-card hover:bg-card/80 transition-all duration-200 ${
          !isEditable ? "opacity-75" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
              </span>
              <span className="text-sm text-muted-foreground">({formatDuration(entry.durationMinutes)})</span>
            </div>

            <h4 className="font-semibold text-foreground truncate mb-2">{entry.activityLabel}</h4>

            {category && (
              <div
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                  border: `1px solid ${category.color}40`,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isEditable ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onEdit}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit entry</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete entry</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Only today and yesterday can be edited</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
