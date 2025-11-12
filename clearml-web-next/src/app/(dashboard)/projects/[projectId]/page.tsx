'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectStats } from '@/components/features/projects/project-stats';
import { ProjectForm } from '@/components/features/projects/project-form';
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
} from '@/lib/hooks/use-projects';
import { useTasks } from '@/lib/hooks/use-tasks';
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { toast } = useToast();

  // Fetch project details
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useProject(projectId);

  // Fetch project tasks
  const {
    data: tasksData,
    isLoading: isLoadingTasks,
  } = useTasks({
    project: [projectId],
    page_size: 10,
  });

  // Mutations
  const updateProjectMutation = useUpdateProject({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Project updated successfully',
      });
      setIsFormOpen(false);
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
      router.push('/projects');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });

  const handleUpdateProject = (data: any) => {
    updateProjectMutation.mutate({
      project: projectId,
      ...data,
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`
      )
    ) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-destructive">Error loading project</p>
        <p className="text-sm text-muted-foreground">
          {projectError instanceof Error
            ? projectError.message
            : 'Project not found'}
        </p>
        <Button asChild className="mt-4">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  const tasks = tasksData?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-muted-foreground ml-12">{project.description}</p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {project.created && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Created {new Date(project.created).toLocaleDateString()}
            </span>
          </div>
        )}
        {project.last_update && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Updated {new Date(project.last_update).toLocaleDateString()}
            </span>
          </div>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <ProjectStats stats={project.stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>
                Details and configuration for this project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Project ID</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {project.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    {project.stats?.total_tasks || 0}
                  </p>
                </div>
                {project.default_output_destination && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium">Default Output Destination</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {project.default_output_destination}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>
                Latest tasks in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <Link
                          href={`/tasks/${task.id}`}
                          className="font-medium hover:underline"
                        >
                          {task.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {task.type} • {task.status}
                        </p>
                      </div>
                      <Badge variant="secondary">{task.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>
                All tasks associated with this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Task list implementation coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Models</CardTitle>
              <CardDescription>
                Models generated in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Model list implementation coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datasets</CardTitle>
              <CardDescription>
                Datasets used in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dataset list implementation coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>
                Configure project preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Settings implementation coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Project Form Dialog */}
      <ProjectForm
        project={project}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleUpdateProject}
        isLoading={updateProjectMutation.isPending}
      />
    </div>
  );
}
