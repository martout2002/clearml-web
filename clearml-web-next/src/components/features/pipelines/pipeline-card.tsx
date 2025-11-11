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
import { PipelineStatusBadge } from './pipeline-status-badge';
import { PipelineActionsMenu } from './pipeline-actions-menu';
import type { Pipeline } from '@/types/api';
import { Clock, FolderOpen, User, GitBranch } from 'lucide-react';

interface PipelineCardProps {
  pipeline: Pipeline;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  const updatedAt = pipeline.last_update
    ? new Date(pipeline.last_update)
    : pipeline.created
    ? new Date(pipeline.created)
    : null;

  const stepCount = pipeline.steps?.length || 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/pipelines/${pipeline.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {pipeline.name}
              </CardTitle>
            </Link>
            {pipeline.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {pipeline.description}
              </CardDescription>
            )}
          </div>
          <PipelineActionsMenu pipeline={pipeline} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PipelineStatusBadge status={pipeline.status} />
          <Badge variant="outline">
            <GitBranch className="h-3 w-3 mr-1" />
            {stepCount} {stepCount === 1 ? 'step' : 'steps'}
          </Badge>
          {pipeline.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {pipeline.tags && pipeline.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{pipeline.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {pipeline.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="truncate">{pipeline.project.name}</span>
            </div>
          )}

          {pipeline.user && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{pipeline.user.name}</span>
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
