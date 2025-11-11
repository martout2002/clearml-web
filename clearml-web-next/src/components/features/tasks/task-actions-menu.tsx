'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Play,
  StopCircle,
  RotateCcw,
  Trash2,
  Upload,
  Copy,
  FileEdit,
} from 'lucide-react';
import {
  useStopTask,
  useResetTask,
  useDeleteTask,
  usePublishTask,
} from '@/lib/hooks/use-tasks';
import type { Task } from '@/types/api';
import { useRouter } from 'next/navigation';

interface TaskActionsMenuProps {
  task: Task;
  onEdit?: () => void;
}

export function TaskActionsMenu({ task, onEdit }: TaskActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const stopMutation = useStopTask();
  const resetMutation = useResetTask();
  const deleteMutation = useDeleteTask();
  const publishMutation = usePublishTask();

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to stop task:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to reset task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(task.id);
      setDeleteDialogOpen(false);
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to publish task:', error);
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Clone task:', task.id);
  };

  const canStop = ['queued', 'in_progress'].includes(task.status);
  const canReset = ['stopped', 'failed', 'completed'].includes(task.status);
  const canPublish = ['completed'].includes(task.status);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={handleClone}>
            <Copy className="mr-2 h-4 w-4" />
            Clone
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {canStop && (
            <DropdownMenuItem
              onClick={handleStop}
              disabled={stopMutation.isPending}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </DropdownMenuItem>
          )}

          {canReset && (
            <DropdownMenuItem
              onClick={handleReset}
              disabled={resetMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </DropdownMenuItem>
          )}

          {canPublish && (
            <DropdownMenuItem
              onClick={handlePublish}
              disabled={publishMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              Publish
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{task.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
