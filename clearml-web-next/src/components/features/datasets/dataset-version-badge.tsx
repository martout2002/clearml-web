'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

interface DatasetVersionBadgeProps {
  version?: string;
  className?: string;
}

export function DatasetVersionBadge({ version, className }: DatasetVersionBadgeProps) {
  if (!version) {
    return (
      <Badge variant="outline" className={cn('capitalize', className)}>
        Draft
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn('font-mono text-xs', className)}>
      v{version}
    </Badge>
  );
}
