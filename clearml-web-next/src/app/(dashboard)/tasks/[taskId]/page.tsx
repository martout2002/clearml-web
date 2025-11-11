'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistance, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskStatusBadge } from '@/components/features/tasks/task-status-badge';
import { TaskActionsMenu } from '@/components/features/tasks/task-actions-menu';
import { useTask, useStopTask, useResetTask } from '@/lib/hooks/use-tasks';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderOpen,
  User,
  Play,
  StopCircle,
  RotateCcw,
} from 'lucide-react';

interface TaskDetailPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: task, isLoading, isError, error } = useTask(resolvedParams.taskId);

  const stopMutation = useStopTask();
  const resetMutation = useResetTask();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/tasks')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
        <Card className="p-8 text-center">
          <p className="text-destructive">
            Error loading task: {error?.message || 'Task not found'}
          </p>
        </Card>
      </div>
    );
  }

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to stop task:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to reset task:', error);
    }
  };

  const canStop = ['queued', 'in_progress'].includes(task.status);
  const canReset = ['stopped', 'failed', 'completed'].includes(task.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/tasks')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {task.name}
            </h1>
            {task.comment && (
              <p className="text-muted-foreground mt-2">{task.comment}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canStop && (
              <Button
                variant="outline"
                onClick={handleStop}
                disabled={stopMutation.isPending}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop
              </Button>
            )}
            {canReset && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={resetMutation.isPending}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
            <TaskActionsMenu task={task} />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskStatusBadge status={task.status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize">
              {task.type.replace(/_/g, ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project</CardTitle>
          </CardHeader>
          <CardContent>
            {task.project ? (
              <Link
                href={`/projects/${task.project.id}`}
                className="text-sm hover:text-primary transition-colors"
              >
                {task.project.name}
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">No project</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User</CardTitle>
          </CardHeader>
          <CardContent>
            {task.user ? (
              <span className="text-sm">{task.user.name}</span>
            ) : (
              <span className="text-sm text-muted-foreground">Unknown</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Task ID
                  </p>
                  <p className="text-sm font-mono">{task.id}</p>
                </div>

                {task.created && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                    <p className="text-sm">
                      {format(new Date(task.created), 'PPpp')}
                    </p>
                  </div>
                )}

                {task.started && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Started
                    </p>
                    <p className="text-sm">
                      {format(new Date(task.started), 'PPpp')}
                    </p>
                  </div>
                )}

                {task.completed && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Completed
                    </p>
                    <p className="text-sm">
                      {format(new Date(task.completed), 'PPpp')}
                    </p>
                  </div>
                )}

                {task.last_update && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {formatDistance(new Date(task.last_update), new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
              </div>

              {task.tags && task.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.system_tags && task.system_tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    System Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {task.system_tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Task parameters and hyperparameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {task.configuration ? (
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(task.configuration, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No configuration available
                </p>
              )}
            </CardContent>
          </Card>

          {task.execution?.parameters && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(task.execution.parameters, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Execution Tab */}
        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Script Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.script ? (
                <div className="space-y-3">
                  {task.script.repository && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Repository
                      </p>
                      <p className="text-sm font-mono break-all">
                        {task.script.repository}
                      </p>
                    </div>
                  )}

                  {task.script.branch && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Branch
                      </p>
                      <p className="text-sm font-mono">{task.script.branch}</p>
                    </div>
                  )}

                  {task.script.entry_point && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Entry Point
                      </p>
                      <p className="text-sm font-mono">
                        {task.script.entry_point}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No script information available
                </p>
              )}
            </CardContent>
          </Card>

          {task.runtime && (
            <Card>
              <CardHeader>
                <CardTitle>Runtime Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(task.runtime, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Artifacts Tab */}
        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Models</CardTitle>
            </CardHeader>
            <CardContent>
              {task.models?.input && task.models.input.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm font-medium">Input Models</h4>
                  <div className="space-y-2">
                    {task.models.input.map((model, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {model.model}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.models?.output && task.models.output.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Output Models</h4>
                  <div className="space-y-2">
                    {task.models.output.map((model, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {model.model}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!task.models?.input || task.models.input.length === 0) &&
                (!task.models?.output || task.models.output.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No models available
                  </p>
                )}
            </CardContent>
          </Card>

          {task.execution?.model && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Model</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-mono">{task.execution.model}</p>
                {task.execution.model_labels && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Model Labels</h4>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(task.execution.model_labels, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
