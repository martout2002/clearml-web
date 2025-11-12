'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateQueue, useUpdateQueue } from '@/lib/hooks/use-queues';
import type { CreateQueueParams, UpdateQueueParams } from '@/lib/api/queues';
import type { Queue } from '@/types/api';
import { useEffect } from 'react';

interface QueueFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  queue?: Queue;
}

interface QueueFormData {
  name: string;
  tags?: string;
}

export function QueueForm({ open, onOpenChange, onSuccess, queue }: QueueFormProps) {
  const createMutation = useCreateQueue();
  const updateMutation = useUpdateQueue();
  const isEditMode = !!queue;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QueueFormData>({
    defaultValues: {
      name: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (queue) {
      reset({
        name: queue.name,
        tags: queue.tags?.join(', ') || '',
      });
    } else {
      reset({
        name: '',
        tags: '',
      });
    }
  }, [queue, reset]);

  const onSubmit = async (data: QueueFormData) => {
    try {
      if (isEditMode) {
        const params: UpdateQueueParams = {
          queue: queue.id,
          name: data.name,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
        };
        await updateMutation.mutateAsync(params);
      } else {
        const params: CreateQueueParams = {
          name: data.name,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
        };
        await createMutation.mutateAsync(params);
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} queue:`, error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Queue' : 'Create New Queue'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the queue details below.'
              : 'Create a new queue for organizing and managing tasks.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="default"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="production, high-priority (comma-separated)"
              {...register('tags')}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated tags for organizing queues
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                ? 'Update Queue'
                : 'Create Queue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
