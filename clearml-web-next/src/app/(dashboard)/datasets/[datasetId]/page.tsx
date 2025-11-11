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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatasetVersionBadge } from '@/components/features/datasets/dataset-version-badge';
import { DatasetActionsMenu } from '@/components/features/datasets/dataset-actions-menu';
import {
  useDataset,
  useDatasetVersions,
  useDatasetStats,
  usePublishDataset,
} from '@/lib/hooks/use-datasets';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FolderOpen,
  User,
  Database,
  FileText,
  Upload,
  Download,
} from 'lucide-react';

interface DatasetDetailPageProps {
  params: Promise<{ datasetId: string }>;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export default function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: dataset, isLoading, isError, error } = useDataset(resolvedParams.datasetId);
  const { data: versions } = useDatasetVersions(resolvedParams.datasetId);
  const { data: stats } = useDatasetStats(resolvedParams.datasetId);

  const publishMutation = usePublishDataset();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !dataset) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/datasets')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Datasets
        </Button>
        <Card className="p-8 text-center">
          <p className="text-destructive">
            Error loading dataset: {error?.message || 'Dataset not found'}
          </p>
        </Card>
      </div>
    );
  }

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(dataset.id);
    } catch (error) {
      console.error('Failed to publish dataset:', error);
    }
  };

  const canPublish = dataset.status === 'created' || dataset.status === 'in_progress';

  const displaySize = stats?.size || dataset.size;
  const displayFileCount = stats?.file_count || dataset.file_count;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/datasets')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Datasets
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {dataset.name}
            </h1>
            {dataset.description && (
              <p className="text-muted-foreground mt-2">{dataset.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canPublish && (
              <Button
                variant="outline"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <DatasetActionsMenu dataset={dataset} />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <DatasetVersionBadge version={dataset.version} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dataset.status ? (
              <Badge variant="outline" className="capitalize">
                {dataset.status.replace(/_/g, ' ')}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatBytes(displaySize)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {displayFileCount !== undefined ? displayFileCount : '-'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
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
                    Dataset ID
                  </p>
                  <p className="text-sm font-mono">{dataset.id}</p>
                </div>

                {dataset.project && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Project
                    </p>
                    <Link
                      href={`/projects/${dataset.project.id}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {dataset.project.name}
                    </Link>
                  </div>
                )}

                {dataset.user && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      User
                    </p>
                    <p className="text-sm">{dataset.user.name}</p>
                  </div>
                )}

                {dataset.created && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Created
                    </p>
                    <p className="text-sm">
                      {format(new Date(dataset.created), 'PPpp')}
                    </p>
                  </div>
                )}

                {dataset.last_update && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="text-sm">
                      {formatDistance(new Date(dataset.last_update), new Date(), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}

                {dataset.parent && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Parent Dataset
                    </p>
                    <Link
                      href={`/datasets/${dataset.parent}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      View Parent
                    </Link>
                  </div>
                )}
              </div>

              {dataset.tags && dataset.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {dataset.system_tags && dataset.system_tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    System Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dataset.system_tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {dataset.metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(dataset.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>
                Track changes and lineage of your dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versions && versions.length > 0 ? (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <DatasetVersionBadge version={version.version} />
                          {version.status && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {version.status}
                            </Badge>
                          )}
                        </div>
                        {version.comment && (
                          <p className="text-sm text-muted-foreground">
                            {version.comment}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {version.size !== undefined && (
                            <span>{formatBytes(version.size)}</span>
                          )}
                          {version.file_count !== undefined && (
                            <span>{version.file_count} files</span>
                          )}
                          {version.created && (
                            <span>
                              {formatDistance(
                                new Date(version.created),
                                new Date(),
                                { addSuffix: true }
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/datasets/${version.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No version history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Files</CardTitle>
              <CardDescription>
                Browse and manage files in this dataset
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>File browser coming soon</p>
                <p className="text-sm mt-2">
                  This feature will allow you to browse and download dataset files
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dataset Preview</CardTitle>
              <CardDescription>
                Preview dataset contents and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.preview ? (
                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(stats.preview, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No preview available</p>
                  <p className="text-sm mt-2">
                    Preview data will appear here once the dataset is processed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
