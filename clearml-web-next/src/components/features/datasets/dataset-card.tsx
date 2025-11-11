'use client';

import Link from 'next/link';
import { formatDistance } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatasetVersionBadge } from './dataset-version-badge';
import { DatasetActionsMenu } from './dataset-actions-menu';
import type { Dataset } from '@/types/api';
import { Clock, FolderOpen, User, Database, FileText } from 'lucide-react';

interface DatasetCardProps {
  dataset: Dataset;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  const updatedAt = dataset.last_update
    ? new Date(dataset.last_update)
    : dataset.created
    ? new Date(dataset.created)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/datasets/${dataset.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {dataset.name}
              </CardTitle>
            </Link>
            {dataset.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {dataset.description}
              </CardDescription>
            )}
          </div>
          <DatasetActionsMenu dataset={dataset} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <DatasetVersionBadge version={dataset.version} />
          {dataset.status && (
            <Badge variant="outline" className="capitalize">
              {dataset.status.replace(/_/g, ' ')}
            </Badge>
          )}
          {dataset.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {dataset.tags && dataset.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{dataset.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {dataset.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="truncate">{dataset.project.name}</span>
            </div>
          )}

          {dataset.user && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{dataset.user.name}</span>
            </div>
          )}

          {dataset.size !== undefined && (
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5" />
              <span>{formatBytes(dataset.size)}</span>
            </div>
          )}

          {dataset.file_count !== undefined && (
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              <span>{dataset.file_count} files</span>
            </div>
          )}

          {updatedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Updated {formatDistance(updatedAt, new Date(), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
