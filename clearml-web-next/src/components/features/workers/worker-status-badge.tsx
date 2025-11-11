import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import type { Worker } from '@/types/api';

interface WorkerStatusBadgeProps {
  worker: Worker;
  className?: string;
}

/**
 * Determine if worker is online based on last activity time
 * Worker is considered online if activity was within last 2 minutes
 */
function isWorkerOnline(worker: Worker): boolean {
  if (!worker.last_activity_time) {
    return false;
  }

  const lastActivity = new Date(worker.last_activity_time);
  const now = new Date();
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes < 2;
}

export function WorkerStatusBadge({ worker, className }: WorkerStatusBadgeProps) {
  const isOnline = isWorkerOnline(worker);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        )}
      />
      <Badge
        variant="outline"
        className={cn(
          'border-transparent',
          isOnline
            ? 'bg-green-100 text-green-800 hover:bg-green-100/80'
            : 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
        )}
      >
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
    </div>
  );
}
