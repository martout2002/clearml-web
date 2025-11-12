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
import { useCreateDataset } from '@/lib/hooks/use-datasets';
import type { CreateDatasetParams } from '@/lib/api/datasets';

interface DatasetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface DatasetFormData {
  name: string;
  version?: string;
  description?: string;
  tags?: string;
}

export function DatasetForm({ open, onOpenChange, onSuccess }: DatasetFormProps) {
  const createMutation = useCreateDataset();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DatasetFormData>({
    defaultValues: {
      version: '1.0',
    },
  });

  const onSubmit = async (data: DatasetFormData) => {
    try {
      const params: CreateDatasetParams = {
        name: data.name,
        version: data.version,
        description: data.description,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
      };

      await createMutation.mutateAsync(params);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create dataset:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dataset</DialogTitle>
          <DialogDescription>
            Create a new dataset to organize and version your data.
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
                placeholder="My Dataset"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="1.0"
                {...register('version')}
              />
              <p className="text-xs text-muted-foreground">
                Semantic version number (e.g., 1.0, 1.1, 2.0)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your dataset..."
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="training, images, cv (comma-separated)"
                {...register('tags')}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags for organizing datasets
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
              {isSubmitting ? 'Creating...' : 'Create Dataset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
