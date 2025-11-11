import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

type PipelineStatus = 'draft' | 'running' | 'stopped' | 'completed' | 'failed';

interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  className?: string;
}

const statusConfig: Record<
  PipelineStatus,
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-800 hover:bg-slate-100/80',
  },
  running: {
    label: 'Running',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100/80',
  },
  stopped: {
    label: 'Stopped',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100/80',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 hover:bg-green-100/80',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 hover:bg-red-100/80',
  },
};

export function PipelineStatusBadge({ status, className }: PipelineStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
