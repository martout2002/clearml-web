'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { TaskStatus } from '@/types/api';
import { X } from 'lucide-react';

interface TaskFiltersProps {
  selectedStatuses: TaskStatus[];
  onStatusChange: (statuses: TaskStatus[]) => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
}

const TASK_STATUSES: TaskStatus[] = [
  'created',
  'queued',
  'in_progress',
  'stopped',
  'published',
  'publishing',
  'closed',
  'failed',
  'completed',
];

const TASK_TYPES = [
  'training',
  'testing',
  'inference',
  'data_processing',
  'application',
  'monitor',
  'controller',
  'optimizer',
  'service',
  'qc',
  'custom',
];

export function TaskFilters({
  selectedStatuses,
  onStatusChange,
  selectedTypes,
  onTypeChange,
  searchQuery,
  onSearchChange,
  onClearAll,
}: TaskFiltersProps) {
  const handleStatusToggle = (status: TaskStatus) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedTypes.length > 0 ||
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Separator />

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {TASK_STATUSES.map((status) => (
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
          </ScrollArea>
        </div>

        <Separator />

        {/* Type Filter */}
        <div className="space-y-3">
          <Label>Type</Label>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {TASK_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {type.replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
