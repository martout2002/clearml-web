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
import { Separator } from '@/components/ui/separator';
import { ModelStatusBadge } from '@/components/features/models/model-status-badge';
import { ModelActionsMenu } from '@/components/features/models/model-actions-menu';
import { useModel, usePublishModel } from '@/lib/hooks/use-models';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderOpen,
  User,
  Upload,
  Box,
  Link2,
  FileCode,
  GitBranch,
} from 'lucide-react';

interface ModelDetailPageProps {
  params: Promise<{ modelId: string }>;
}

export default function ModelDetailPage({ params }: ModelDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: model, isLoading, isError, error } = useModel(resolvedParams.modelId);

  const publishMutation = usePublishModel();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !model) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/models')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </Button>
        <Card className="p-8 text-center">
          <p className="text-destructive">
            Error loading model: {error?.message || 'Model not found'}
          </p>
        </Card>
      </div>
    );
  }

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(model.id);
    } catch (error) {
      console.error('Failed to publish model:', error);
    }
  };

  const canPublish = !model.ready;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/models')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight truncate">
                {model.name}
              </h1>
              <ModelStatusBadge ready={model.ready || false} />
            </div>
            {model.comment && (
              <p className="text-muted-foreground">{model.comment}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canPublish && (
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {publishMutation.isPending ? 'Publishing...' : 'Publish'}
              </Button>
            )}
            <ModelActionsMenu model={model} />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {model.framework && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Framework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold capitalize">
                  {model.framework}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {model.project && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <Link
                  href={`/projects/${model.project.id}`}
                  className="text-lg font-semibold hover:text-primary transition-colors truncate"
                >
                  {model.project.name}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {model.user && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Created By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold truncate">
                  {model.user.name}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {model.created && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">
                  {formatDistance(new Date(model.created), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
              <CardDescription>
                Basic information about this model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Model ID
                  </p>
                  <p className="text-sm font-mono">{model.id}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div>
                    <ModelStatusBadge ready={model.ready || false} />
                  </div>
                </div>

                {model.framework && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Framework
                    </p>
                    <p className="text-sm capitalize">{model.framework}</p>
                  </div>
                )}

                {model.uri && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Model URI
                    </p>
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <a
                        href={model.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate"
                      >
                        {model.uri}
                      </a>
                    </div>
                  </div>
                )}

                {model.created && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Created At
                    </p>
                    <p className="text-sm">
                      {format(new Date(model.created), 'PPpp')}
                    </p>
                  </div>
                )}

                {model.last_update && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {format(new Date(model.last_update), 'PPpp')}
                    </p>
                  </div>
                )}
              </div>

              {model.tags && model.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Task Link */}
          {model.task && (
            <Card>
              <CardHeader>
                <CardTitle>Associated Task</CardTitle>
                <CardDescription>
                  The task that created or uses this model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Link
                        href={`/tasks/${model.task.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {model.task.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Task ID: {model.task.id}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/tasks/${model.task.id}`}>
                      View Task
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Metadata Tab */}
        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Metadata</CardTitle>
              <CardDescription>
                Additional metadata and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {model.labels && Object.keys(model.labels).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Labels</p>
                  <div className="rounded-lg border p-4">
                    <div className="space-y-2">
                      {Object.entries(model.labels).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {model.design && Object.keys(model.design).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Design</p>
                  <div className="rounded-lg border p-4">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(model.design, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {(!model.labels || Object.keys(model.labels).length === 0) &&
                (!model.design || Object.keys(model.design).length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No metadata available for this model
                  </p>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lineage Tab */}
        <TabsContent value="lineage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Lineage</CardTitle>
              <CardDescription>
                Trace the model's origins and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Parent Task */}
                {model.task && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileCode className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Created by Task</p>
                      <Link
                        href={`/tasks/${model.task.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {model.task.name}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Project */}
                {model.project && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Part of Project</p>
                      <Link
                        href={`/projects/${model.project.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {model.project.name}
                      </Link>
                    </div>
                  </div>
                )}

                {!model.task && !model.project && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No lineage information available for this model
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
