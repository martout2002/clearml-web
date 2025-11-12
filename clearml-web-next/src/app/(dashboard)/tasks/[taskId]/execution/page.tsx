'use client';

import { use } from 'react';
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
import { ExternalLink } from 'lucide-react';

interface TaskExecutionPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskExecutionPage({ params }: TaskExecutionPageProps) {
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
        <p className="text-destructive">Error loading task execution details</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Script Details</CardTitle>
          <CardDescription>
            Information about the script that runs this task
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.script ? (
            <div className="space-y-4">
              {task.script.repository && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Repository
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono break-all flex-1">
                      {task.script.repository}
                    </p>
                    {task.script.repository.startsWith('http') && (
                      <a
                        href={task.script.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {task.script.branch && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Branch
                    </p>
                    <Badge variant="outline" className="font-mono">
                      {task.script.branch}
                    </Badge>
                  </div>
                )}

                {task.script.entry_point && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Entry Point
                    </p>
                    <Badge variant="outline" className="font-mono">
                      {task.script.entry_point}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No script information available
            </p>
          )}
        </CardContent>
      </Card>

      {task.runtime && Object.keys(task.runtime).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Runtime Information</CardTitle>
            <CardDescription>
              Runtime environment and execution details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              {JSON.stringify(task.runtime, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {task.execution && Object.keys(task.execution).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Details</CardTitle>
            <CardDescription>
              Full execution configuration and metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
              {JSON.stringify(task.execution, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
