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
  Trash2,
  Copy,
  FileEdit,
} from 'lucide-react';
import {
  useStartPipeline,
  useStopPipeline,
  useDeletePipeline,
} from '@/lib/hooks/use-pipelines';
import type { Pipeline } from '@/types/api';
import { useRouter } from 'next/navigation';

interface PipelineActionsMenuProps {
  pipeline: Pipeline;
  onEdit?: () => void;
}

export function PipelineActionsMenu({ pipeline, onEdit }: PipelineActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const startMutation = useStartPipeline();
  const stopMutation = useStopPipeline();
  const deleteMutation = useDeletePipeline();

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(pipeline.id);
    } catch (error) {
      console.error('Failed to start pipeline:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(pipeline.id);
    } catch (error) {
      console.error('Failed to stop pipeline:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(pipeline.id);
      setDeleteDialogOpen(false);
      router.push('/pipelines');
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Clone pipeline:', pipeline.id);
  };

  const canStart = ['draft', 'stopped', 'failed'].includes(pipeline.status);
  const canStop = ['running'].includes(pipeline.status);

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

          {canStart && (
            <DropdownMenuItem
              onClick={handleStart}
              disabled={startMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
          )}

          {canStop && (
            <DropdownMenuItem
              onClick={handleStop}
              disabled={stopMutation.isPending}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
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
            <DialogTitle>Delete Pipeline</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{pipeline.name}&quot;? This
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
