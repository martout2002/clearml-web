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
import { ModelStatusBadge } from './model-status-badge';
import { ModelActionsMenu } from './model-actions-menu';
import type { Model } from '@/types/api';
import { Clock, FolderOpen, User, Box } from 'lucide-react';

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  const updatedAt = model.last_update
    ? new Date(model.last_update)
    : model.created
    ? new Date(model.created)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/models/${model.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {model.name}
              </CardTitle>
            </Link>
            {model.comment && (
              <CardDescription className="mt-1 line-clamp-2">
                {model.comment}
              </CardDescription>
            )}
          </div>
          <ModelActionsMenu model={model} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ModelStatusBadge ready={model.ready || false} />
          {model.framework && (
            <Badge variant="outline" className="capitalize">
              <Box className="mr-1 h-3 w-3" />
              {model.framework}
            </Badge>
          )}
          {model.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {model.tags && model.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{model.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {model.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="truncate">{model.project.name}</span>
            </div>
          )}

          {model.user && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{model.user.name}</span>
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
