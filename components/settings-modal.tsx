"use client"

import { useState } from "react"
import { Settings, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/lib/data-context"
import { toast } from "sonner"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const colorOptions = [
  "#4ade80",
  "#60a5fa",
  "#f472b6",
  "#fb923c",
  "#a78bfa",
  "#fbbf24",
  "#34d399",
  "#f87171",
  "#818cf8",
  "#2dd4bf",
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, updateGoalSettings, updateAppSettings, addCategory, updateCategory, deleteCategory } = useData()
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<"productive" | "neutral" | "unproductive">("neutral")
  const [newCategoryColor, setNewCategoryColor] = useState(colorOptions[0])

  const handleGoalChange = (value: string) => {
    const hours = Number.parseFloat(value)
    if (!isNaN(hours) && hours >= 0) {
      updateGoalSettings({ dailyProductiveMinutes: Math.round(hours * 60) })
      toast.success("Goal updated")
    }
  }

  const handleUserNameChange = (value: string) => {
    updateAppSettings({ userName: value })
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    addCategory({
      name: newCategoryName,
      type: newCategoryType,
      color: newCategoryColor,
    })

    toast.success("Category added")
    setNewCategoryName("")
  }

  const handleDeleteCategory = (id: string) => {
    const defaultIds = ["work", "sleep", "movies", "doom", "misc"]
    if (defaultIds.includes(id)) {
      toast.error("Cannot delete default categories")
      return
    }

    deleteCategory(id)
    toast.success("Category deleted")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-4">
            <div>
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={state.appSettings.userName}
                onChange={(e) => handleUserNameChange(e.target.value)}
                placeholder="Enter your name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dailyGoal">Daily Productive Hours Goal</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="dailyGoal"
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={(state.goalSettings.dailyProductiveMinutes / 60).toFixed(1)}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">hours</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Set your daily target for productive work</p>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6 mt-4">
            {/* Add Category */}
            <div className="space-y-3">
              <Label>Add New Category</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Select value={newCategoryType} onValueChange={(v: any) => setNewCategoryType(v)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="productive">Productive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="unproductive">Unproductive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Color:</Label>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        newCategoryColor === color
                          ? "scale-125 ring-2 ring-foreground ring-offset-2 ring-offset-card"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCategory} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Category List */}
            <div className="space-y-2">
              <Label>Existing Categories</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {state.categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">{cat.type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
