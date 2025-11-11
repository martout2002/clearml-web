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
import { TaskStatusBadge } from './task-status-badge';
import { TaskActionsMenu } from './task-actions-menu';
import type { Task } from '@/types/api';
import { Clock, FolderOpen, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updatedAt = task.last_update
    ? new Date(task.last_update)
    : task.created
    ? new Date(task.created)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/tasks/${task.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {task.name}
              </CardTitle>
            </Link>
            {task.comment && (
              <CardDescription className="mt-1 line-clamp-2">
                {task.comment}
              </CardDescription>
            )}
          </div>
          <TaskActionsMenu task={task} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={task.status} />
          <Badge variant="outline">{task.type}</Badge>
          {task.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {task.tags && task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {task.project && (
            <div className="flex items-center gap-2">
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="truncate">{task.project.name}</span>
            </div>
          )}

          {task.user && (
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              <span className="truncate">{task.user.name}</span>
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
