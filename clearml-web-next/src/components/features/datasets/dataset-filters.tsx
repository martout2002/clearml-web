'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface DatasetFiltersProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
}

const DATASET_STATUSES = [
  'created',
  'in_progress',
  'published',
  'closed',
];

export function DatasetFilters({
  selectedStatuses,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onClearAll,
}: DatasetFiltersProps) {
  const handleStatusToggle = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    searchQuery.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="space-y-2">
            {DATASET_STATUSES.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {status.replace(/_/g, ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
