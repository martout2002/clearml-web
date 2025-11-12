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
import { WorkerStatusBadge } from './worker-status-badge';
import type { Worker } from '@/types/api';
import { Clock, Server, Activity, ListTodo } from 'lucide-react';

interface WorkerCardProps {
  worker: Worker;
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const lastActivity = worker.last_activity_time
    ? new Date(worker.last_activity_time)
    : worker.register_time
    ? new Date(worker.register_time)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">
              {worker.name || worker.id}
            </CardTitle>
            {worker.ip && (
              <CardDescription className="mt-1">
                {worker.ip}
              </CardDescription>
            )}
          </div>
          <WorkerStatusBadge worker={worker} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {worker.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {worker.tags && worker.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{worker.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {worker.queues && worker.queues.length > 0 && (
            <div className="flex items-center gap-2">
              <ListTodo className="h-3.5 w-3.5" />
              <span className="truncate">
                {worker.queues.length} queue{worker.queues.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {worker.task && (
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5" />
              <Link
                href={`/tasks/${worker.task.id}`}
                className="truncate hover:text-primary transition-colors"
              >
                {worker.task.name}
              </Link>
            </div>
          )}

          {lastActivity && (
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" />
              <span>
                Active {formatDistance(lastActivity, new Date(), { addSuffix: true })}
              </span>
            </div>
          )}

          {worker.register_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Registered {formatDistance(new Date(worker.register_time), new Date(), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
