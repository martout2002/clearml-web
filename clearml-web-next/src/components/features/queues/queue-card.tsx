'use client';

import Link from 'next/link';
import { formatDistance } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Queue } from '@/types/api';
import { Clock, ListTodo } from 'lucide-react';

interface QueueCardProps {
  queue: Queue;
}

export function QueueCard({ queue }: QueueCardProps) {
  const taskCount = queue.entries?.length || 0;
  const created = queue.created ? new Date(queue.created) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/queues/${queue.id}`}>
              <CardTitle className="text-lg hover:text-primary transition-colors truncate">
                {queue.name}
              </CardTitle>
            </Link>
          </div>
          <Badge
            variant="outline"
            className={
              taskCount > 0
                ? 'bg-blue-100 text-blue-800 border-transparent'
                : 'bg-gray-100 text-gray-800 border-transparent'
            }
          >
            {taskCount} task{taskCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {queue.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {queue.tags && queue.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{queue.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          {taskCount > 0 && (
            <div className="flex items-center gap-2">
              <ListTodo className="h-3.5 w-3.5" />
              <span>
                {taskCount} task{taskCount > 1 ? 's' : ''} in queue
              </span>
            </div>
          )}

          {created && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Created {formatDistance(created, new Date(), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
