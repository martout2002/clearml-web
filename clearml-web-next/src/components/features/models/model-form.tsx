'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateModel } from '@/lib/hooks/use-models';
import type { CreateModelParams } from '@/lib/api/models';

interface ModelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ModelFormData {
  name: string;
  uri: string;
  framework?: string;
  comment?: string;
  tags?: string;
  ready?: boolean;
}

const FRAMEWORKS = [
  'tensorflow',
  'pytorch',
  'keras',
  'scikit-learn',
  'xgboost',
  'lightgbm',
  'catboost',
  'onnx',
  'huggingface',
  'custom',
];

export function ModelForm({ open, onOpenChange, onSuccess }: ModelFormProps) {
  const createMutation = useCreateModel();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModelFormData>({
    defaultValues: {
      framework: 'pytorch',
      ready: false,
    },
  });

  const onSubmit = async (data: ModelFormData) => {
    try {
      const params: CreateModelParams = {
        name: data.name,
        uri: data.uri,
        framework: data.framework,
        comment: data.comment,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()) : undefined,
        ready: data.ready,
      };

      await createMutation.mutateAsync(params);
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create model:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Model</DialogTitle>
          <DialogDescription>
            Register a new model in the ClearML model registry.
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
                placeholder="My Model"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="uri">
                Model URI <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uri"
                placeholder="s3://bucket/path/to/model.pth"
                {...register('uri', { required: 'Model URI is required' })}
              />
              {errors.uri && (
                <p className="text-sm text-destructive">{errors.uri.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The storage location of your model file (S3, GCS, local path, etc.)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Select
                onValueChange={(value) => setValue('framework', value)}
                defaultValue="pytorch"
              >
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {FRAMEWORKS.map((framework) => (
                    <SelectItem
                      key={framework}
                      value={framework}
                      className="capitalize"
                    >
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Description</Label>
              <Textarea
                id="comment"
                placeholder="Describe your model..."
                rows={3}
                {...register('comment')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="production, v1.0, image-classification"
                {...register('tags')}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags for organizing your models
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ready"
                className="h-4 w-4 rounded border-gray-300"
                {...register('ready')}
              />
              <Label htmlFor="ready" className="font-normal cursor-pointer">
                Mark as ready for production
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
            >
              {isSubmitting || createMutation.isPending
                ? 'Creating...'
                : 'Create Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
