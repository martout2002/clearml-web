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
  Upload,
  Trash2,
  Copy,
  FileEdit,
  Download,
} from 'lucide-react';
import {
  useDeleteModel,
  usePublishModel,
} from '@/lib/hooks/use-models';
import type { Model } from '@/types/api';
import { useRouter } from 'next/navigation';

interface ModelActionsMenuProps {
  model: Model;
  onEdit?: () => void;
}

export function ModelActionsMenu({ model, onEdit }: ModelActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useDeleteModel();
  const publishMutation = usePublishModel();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(model.id);
      setDeleteDialogOpen(false);
      router.push('/models');
    } catch (error) {
      console.error('Failed to delete model:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(model.id);
    } catch (error) {
      console.error('Failed to publish model:', error);
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Clone model:', model.id);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    if (model.uri) {
      window.open(model.uri, '_blank');
    }
  };

  const canPublish = !model.ready;

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

          {model.uri && (
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

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
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{model.name}&quot;? This
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
