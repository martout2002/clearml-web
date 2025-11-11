import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types/api';
import { cn } from '@/lib/utils/cn';

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  created: {
    label: 'Created',
    className: 'bg-slate-100 text-slate-800 hover:bg-slate-100/80',
  },
  queued: {
    label: 'Queued',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100/80',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80',
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80',
  },
  published: {
    label: 'Published',
    className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80',
  },
  publishing: {
    label: 'Publishing',
    className: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80',
  },
  closed: {
    label: 'Closed',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 hover:bg-red-100/80',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 hover:bg-green-100/80',
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80',
  },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
