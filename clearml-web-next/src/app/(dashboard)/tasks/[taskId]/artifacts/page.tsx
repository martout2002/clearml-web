'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTask } from '@/lib/hooks/use-tasks';
import { ExternalLink, Download, FileText } from 'lucide-react';

interface TaskArtifactsPageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskArtifactsPage({ params }: TaskArtifactsPageProps) {
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
        <p className="text-destructive">Error loading task artifacts</p>
      </Card>
    );
  }

  const hasInputModels = task.models?.input && task.models.input.length > 0;
  const hasOutputModels = task.models?.output && task.models.output.length > 0;
  const hasExecutionModel = task.execution?.model;

  return (
    <div className="space-y-4">
      {/* Input Models */}
      {hasInputModels && (
        <Card>
          <CardHeader>
            <CardTitle>Input Models</CardTitle>
            <CardDescription>
              Models used as input for this task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {task.models!.input!.map((model, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{model.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {model.model}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/models/${model.model}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Output Models */}
      {hasOutputModels && (
        <Card>
          <CardHeader>
            <CardTitle>Output Models</CardTitle>
            <CardDescription>
              Models produced by this task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {task.models!.output!.map((model, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{model.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {model.model}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/models/${model.model}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution Model */}
      {hasExecutionModel && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Model</CardTitle>
            <CardDescription>
              Model used during task execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Model ID
              </p>
              <p className="text-sm font-mono break-all">
                {task.execution.model}
              </p>
            </div>

            {task.execution.model_labels &&
              Object.keys(task.execution.model_labels).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Model Labels
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(task.execution.model_labels).map(
                      ([label, count]) => (
                        <Badge key={label} variant="secondary">
                          {label}: {count}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* No Artifacts Message */}
      {!hasInputModels && !hasOutputModels && !hasExecutionModel && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No artifacts available for this task
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
