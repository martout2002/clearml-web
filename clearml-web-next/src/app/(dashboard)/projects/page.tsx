'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectGrid } from '@/components/features/projects/project-grid';
import { ProjectTable } from '@/components/features/projects/project-table';
import { ProjectForm } from '@/components/features/projects/project-form';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/hooks/use-projects';
import type { Project } from '@/types/api';
import {
  Plus,
  Grid3x3,
  List,
  Search,
  Filter,
  SortAsc,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

type ViewMode = 'grid' | 'table';

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { toast } = useToast();

  // Fetch projects
  const {
    data: projectsData,
    isLoading,
    error,
  } = useProjects({
    page,
    page_size: pageSize,
    search_text: searchQuery || undefined,
    include_stats: true,
  });

  // Mutations
  const createProjectMutation = useCreateProject({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const updateProjectMutation = useUpdateProject({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      setIsFormOpen(false);
      setEditingProject(undefined);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
  });

  const deleteProjectMutation = useDeleteProject({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  const handleCreateProject = (data: any) => {
    createProjectMutation.mutate(data);
  };

  const handleUpdateProject = (data: any) => {
    if (editingProject) {
      updateProjectMutation.mutate({
        project: editingProject.id,
        ...data,
      });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = (project: Project) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(undefined);
  };

  const projects = projectsData?.items || [];
  const total = projectsData?.total || 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your ML experiments
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View controls */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Projects</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortAsc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Last Updated</DropdownMenuItem>
              <DropdownMenuItem>Created Date</DropdownMenuItem>
              <DropdownMenuItem>Task Count</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats summary */}
      {!isLoading && projects.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            <strong className="font-medium text-foreground">{total}</strong>{' '}
            projects
          </span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-destructive">Error loading projects</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <ProjectTable
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {!isLoading && projects.length > 0 && total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} projects
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page * pageSize >= total}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        project={editingProject}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        isLoading={
          createProjectMutation.isPending || updateProjectMutation.isPending
        }
      />
    </div>
  );
}
