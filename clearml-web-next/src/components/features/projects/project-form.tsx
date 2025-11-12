'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import type { Project } from '@/types/api';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  tags: z.string().optional(),
  default_output_destination: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData & { tags?: string[] }) => void;
  isLoading?: boolean;
}

export function ProjectForm({
  project,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      tags: project?.tags?.join(', ') || '',
      default_output_destination: project?.default_output_destination || '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        tags: project.tags?.join(', ') || '',
        default_output_destination: project.default_output_destination || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        tags: '',
        default_output_destination: '',
      });
    }
  }, [project, reset]);

  const handleFormSubmit = (data: ProjectFormData) => {
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    onSubmit({
      ...data,
      tags,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project
              ? 'Update the project details below.'
              : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My Project"
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="A brief description of your project"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              {...register('tags')}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas
            </p>
            {errors.tags && (
              <p className="text-sm text-destructive">{errors.tags.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_output_destination">
              Default Output Destination
            </Label>
            <Input
              id="default_output_destination"
              placeholder="s3://bucket/path"
              {...register('default_output_destination')}
              disabled={isLoading}
            />
            {errors.default_output_destination && (
              <p className="text-sm text-destructive">
                {errors.default_output_destination.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {project ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
