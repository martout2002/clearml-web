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
import { useCreateTask } from '@/lib/hooks/use-tasks';
import type { CreateTaskParams } from '@/lib/api/tasks';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface TaskFormData {
  name: string;
  type: string;
  comment?: string;
  repository?: string;
  branch?: string;
  entry_point?: string;
  tags?: string;
}

export function TaskForm({ open, onOpenChange, onSuccess }: TaskFormProps) {
  const createMutation = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    defaultValues: {
      type: 'training',
      branch: 'main',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      const params: CreateTaskParams = {
        name: data.name,
        type: data.type,
        comment: data.comment,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
      };

      if (data.repository || data.branch || data.entry_point) {
        params.script = {
          repository: data.repository,
          branch: data.branch,
          entry_point: data.entry_point,
        };
      }

      await createMutation.mutateAsync(params);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create a new task to track your ML experiments and workflows.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="My Training Task"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="type"
                placeholder="training"
                {...register('type', { required: 'Type is required' })}
              />
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Common types: training, testing, inference, data_processing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Description</Label>
              <Input
                id="comment"
                placeholder="Describe your task..."
                {...register('comment')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="experiment, pytorch, cv (comma-separated)"
                {...register('tags')}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags for organizing tasks
              </p>
            </div>
          </div>

          {/* Script Configuration */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Script Configuration</h4>

            <div className="space-y-2">
              <Label htmlFor="repository">Repository</Label>
              <Input
                id="repository"
                placeholder="https://github.com/username/repo.git"
                {...register('repository')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="main"
                  {...register('branch')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry_point">Entry Point</Label>
                <Input
                  id="entry_point"
                  placeholder="train.py"
                  {...register('entry_point')}
                />
              </div>
            </div>
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
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
