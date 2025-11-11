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
  Trash2,
  Upload,
  Copy,
  FileEdit,
  Download,
} from 'lucide-react';
import {
  useDeleteDataset,
  usePublishDataset,
} from '@/lib/hooks/use-datasets';
import type { Dataset } from '@/types/api';
import { useRouter } from 'next/navigation';

interface DatasetActionsMenuProps {
  dataset: Dataset;
  onEdit?: () => void;
}

export function DatasetActionsMenu({ dataset, onEdit }: DatasetActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMutation = useDeleteDataset();
  const publishMutation = usePublishDataset();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dataset.id);
      setDeleteDialogOpen(false);
      router.push('/datasets');
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(dataset.id);
    } catch (error) {
      console.error('Failed to publish dataset:', error);
    }
  };

  const handleClone = () => {
    // TODO: Implement clone functionality
    console.log('Clone dataset:', dataset.id);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download dataset:', dataset.id);
  };

  const canPublish = dataset.status === 'created' || dataset.status === 'in_progress';

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

          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>

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
            <DialogTitle>Delete Dataset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{dataset.name}&quot;? This
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
