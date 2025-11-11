'use client';

import { use } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask } from '@/lib/hooks/use-tasks';

interface TaskInfoPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskInfoPage({ params }: TaskInfoPageProps) {
  const resolvedParams = use(params);
  const { data: task, isLoading, isError } = useTask(resolvedParams.taskId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">Error loading task information</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Basic information about this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Task ID
              </p>
              <p className="text-sm font-mono">{task.id}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Task Name
              </p>
              <p className="text-sm">{task.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Type
              </p>
              <Badge variant="outline" className="capitalize">
                {task.type.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <p className="text-sm capitalize">{task.status.replace(/_/g, ' ')}</p>
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
                  {format(new Date(task.last_update), 'PPpp')}
                </p>
              </div>
            )}

            {task.project && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Project
                </p>
                <p className="text-sm">{task.project.name}</p>
              </div>
            )}

            {task.user && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  User
                </p>
                <p className="text-sm">{task.user.name}</p>
              </div>
            )}
          </div>

          {task.comment && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Description
              </p>
              <p className="text-sm">{task.comment}</p>
            </div>
          )}

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
    </div>
  );
}
