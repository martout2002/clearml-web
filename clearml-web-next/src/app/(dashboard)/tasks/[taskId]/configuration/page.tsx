'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask } from '@/lib/hooks/use-tasks';

interface TaskConfigurationPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskConfigurationPage({
  params,
}: TaskConfigurationPageProps) {
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
        <p className="text-destructive">Error loading task configuration</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Task parameters and hyperparameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {task.configuration && Object.keys(task.configuration).length > 0 ? (
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
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
            <CardDescription>
              Parameters used during task execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              {JSON.stringify(task.execution.parameters, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {task.container && Object.keys(task.container).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Container Configuration</CardTitle>
            <CardDescription>
              Container settings and environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              {JSON.stringify(task.container, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
