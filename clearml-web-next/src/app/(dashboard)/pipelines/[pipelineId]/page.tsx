'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PipelineStatusBadge } from '@/components/features/pipelines/pipeline-status-badge';
import { PipelineDAG } from '@/components/features/pipelines/pipeline-dag';
import { usePipeline, useStartPipeline, useStopPipeline } from '@/lib/hooks/use-pipelines';
import { formatDistance } from 'date-fns';
import {
  Play,
  StopCircle,
  ArrowLeft,
  FolderOpen,
  User,
  Clock,
  GitBranch,
  FileText,
  Settings,
  Activity,
  ChevronRight,
} from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { PipelineStep } from '@/types/api';
import Link from 'next/link';

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.pipelineId as string;

  const [activeTab, setActiveTab] = useState('dag');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const { data: pipeline, isLoading, isError, error } = usePipeline(pipelineId);
  const startMutation = useStartPipeline();
  const stopMutation = useStopPipeline();

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(pipelineId);
    } catch (error) {
      console.error('Failed to start pipeline:', error);
    }
  };

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(pipelineId);
    } catch (error) {
      console.error('Failed to stop pipeline:', error);
    }
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError || !pipeline) {
    return (
      <Card className="p-8 text-center">
        <p className="text-destructive">
          Error loading pipeline: {error?.message || 'Pipeline not found'}
        </p>
        <Button className="mt-4" onClick={() => router.push('/pipelines')}>
          Back to Pipelines
        </Button>
      </Card>
    );
  }

  const canStart = ['draft', 'stopped', 'failed'].includes(pipeline.status);
  const canStop = ['running'].includes(pipeline.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/pipelines')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{pipeline.name}</h1>
            <PipelineStatusBadge status={pipeline.status} />
          </div>
          {pipeline.description && (
            <p className="text-muted-foreground">{pipeline.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canStart && (
            <Button onClick={handleStart} disabled={startMutation.isPending}>
              <Play className="mr-2 h-4 w-4" />
              {startMutation.isPending ? 'Starting...' : 'Start'}
            </Button>
          )}
          {canStop && (
            <Button
              variant="outline"
              onClick={handleStop}
              disabled={stopMutation.isPending}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              {stopMutation.isPending ? 'Stopping...' : 'Stop'}
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/pipelines" className="hover:text-foreground">
          Pipelines
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{pipeline.name}</span>
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipeline.project && (
              <div className="flex items-start gap-3">
                <FolderOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{pipeline.project.name}</p>
                </div>
              </div>
            )}

            {pipeline.user && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Created by</p>
                  <p className="font-medium">{pipeline.user.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <GitBranch className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Steps</p>
                <p className="font-medium">{pipeline.steps.length}</p>
              </div>
            </div>

            {pipeline.last_update && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="font-medium">
                    {formatDistance(new Date(pipeline.last_update), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {pipeline.tags && pipeline.tags.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {pipeline.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dag">
            <GitBranch className="mr-2 h-4 w-4" />
            DAG
          </TabsTrigger>
          <TabsTrigger value="runs">
            <Activity className="mr-2 h-4 w-4" />
            Runs
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dag" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PipelineDAG pipeline={pipeline} onNodeClick={handleNodeClick} />
            </div>

            {/* Node Details Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Node Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{(selectedNode.data as PipelineStep).name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge variant="secondary">
                        {(selectedNode.data as PipelineStep).type}
                      </Badge>
                    </div>
                    {(selectedNode.data as PipelineStep).status && (
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge
                          variant={
                            (selectedNode.data as PipelineStep).status === 'completed'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {(selectedNode.data as PipelineStep).status}
                        </Badge>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Position</p>
                      <p className="text-sm font-mono">
                        x: {(selectedNode.data as PipelineStep).position.x}, y:{' '}
                        {(selectedNode.data as PipelineStep).position.y}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click on a node to view details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Pipeline execution history will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pipeline Configuration</h3>
                  <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(
                      {
                        id: pipeline.id,
                        name: pipeline.name,
                        status: pipeline.status,
                        steps: pipeline.steps.length,
                        edges: pipeline.edges.length,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Pipeline execution logs will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
