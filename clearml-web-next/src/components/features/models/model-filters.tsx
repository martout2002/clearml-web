'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

interface ModelFiltersProps {
  selectedFrameworks: string[];
  onFrameworkChange: (frameworks: string[]) => void;
  selectedReadyStatus: string[];
  onReadyStatusChange: (statuses: string[]) => void;
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
}

const MODEL_FRAMEWORKS = [
  'tensorflow',
  'pytorch',
  'keras',
  'scikit-learn',
  'xgboost',
  'lightgbm',
  'catboost',
  'onnx',
  'huggingface',
  'custom',
];

const READY_STATUSES = ['ready', 'draft'];

export function ModelFilters({
  selectedFrameworks,
  onFrameworkChange,
  selectedReadyStatus,
  onReadyStatusChange,
  selectedTags,
  onTagChange,
  searchQuery,
  onSearchChange,
  onClearAll,
}: ModelFiltersProps) {
  const handleFrameworkToggle = (framework: string) => {
    if (selectedFrameworks.includes(framework)) {
      onFrameworkChange(selectedFrameworks.filter((f) => f !== framework));
    } else {
      onFrameworkChange([...selectedFrameworks, framework]);
    }
  };

  const handleReadyStatusToggle = (status: string) => {
    if (selectedReadyStatus.includes(status)) {
      onReadyStatusChange(selectedReadyStatus.filter((s) => s !== status));
    } else {
      onReadyStatusChange([...selectedReadyStatus, status]);
    }
  };

  const hasActiveFilters =
    selectedFrameworks.length > 0 ||
    selectedReadyStatus.length > 0 ||
    selectedTags.length > 0 ||
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
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Separator />

        {/* Ready Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="space-y-2">
            {READY_STATUSES.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedReadyStatus.includes(status)}
                  onCheckedChange={() => handleReadyStatusToggle(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Framework Filter */}
        <div className="space-y-3">
          <Label>Framework</Label>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {MODEL_FRAMEWORKS.map((framework) => (
                <div key={framework} className="flex items-center space-x-2">
                  <Checkbox
                    id={`framework-${framework}`}
                    checked={selectedFrameworks.includes(framework)}
                    onCheckedChange={() => handleFrameworkToggle(framework)}
                  />
                  <label
                    htmlFor={`framework-${framework}`}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {framework}
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
