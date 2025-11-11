'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreatePipeline } from '@/lib/hooks/use-pipelines';
import type { CreatePipelineParams } from '@/lib/api/pipelines';

interface PipelineFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface PipelineFormData {
  name: string;
  description?: string;
  tags?: string;
}

export function PipelineForm({ open, onOpenChange, onSuccess }: PipelineFormProps) {
  const createMutation = useCreatePipeline();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PipelineFormData>({
    defaultValues: {
      name: '',
      description: '',
      tags: '',
    },
  });

  const onSubmit = async (data: PipelineFormData) => {
    try {
      const params: CreatePipelineParams = {
        name: data.name,
        description: data.description,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
        steps: [
          {
            name: 'Start',
            type: 'task',
            position: { x: 100, y: 100 },
          },
        ],
        edges: [],
      };

      await createMutation.mutateAsync(params);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create pipeline:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Pipeline</DialogTitle>
          <DialogDescription>
            Create a new pipeline to orchestrate your ML workflows and experiments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="My ML Pipeline"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your pipeline..."
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="ml, production, experiment (comma-separated)"
                {...register('tags')}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags for organizing pipelines
              </p>
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
              {isSubmitting ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
