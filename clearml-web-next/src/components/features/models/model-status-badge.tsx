import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface ModelStatusBadgeProps {
  ready: boolean;
  className?: string;
}

export function ModelStatusBadge({ ready, className }: ModelStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent',
        ready
          ? 'bg-green-100 text-green-800 hover:bg-green-100/80'
          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80',
        className
      )}
    >
      {ready ? 'Ready' : 'Draft'}
    </Badge>
  );
}
