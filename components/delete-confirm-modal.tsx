"use client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useData } from "@/lib/data-context"
import type { TimeEntry } from "@/lib/types"
import { toast } from "sonner"

interface DeleteConfirmModalProps {
  entry: TimeEntry | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteConfirmModal({ entry, isOpen, onClose }: DeleteConfirmModalProps) {
  const { deleteEntry } = useData()

  const handleDelete = () => {
    if (!entry) return

    deleteEntry(entry.id)
    toast.success("Entry deleted")
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{entry?.activityLabel}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
