'use client';

import { useState, useMemo } from 'react';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ModelTable } from '@/components/features/models/model-table';
import { ModelCard } from '@/components/features/models/model-card';
import { ModelFilters } from '@/components/features/models/model-filters';
import { ModelForm } from '@/components/features/models/model-form';
import { useModels } from '@/lib/hooks/use-models';
import {
  Plus,
  LayoutGrid,
  LayoutList,
  Search,
  Filter,
  Download,
  Trash2,
} from 'lucide-react';

type ViewMode = 'table' | 'grid';

export default function ModelsPage() {
  // URL state management with nuqs
  const [frameworkFilter, setFrameworkFilter] = useQueryState(
    'framework',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [readyStatusFilter, setReadyStatusFilter] = useQueryState(
    'ready',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [searchQuery, setSearchQuery] = useQueryState('search', parseAsString.withDefault(''));

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  // Fetch models with filters
  const { data, isLoading, isError, error } = useModels({
    framework: frameworkFilter,
    ready: readyStatusFilter.includes('ready') ? true : readyStatusFilter.includes('draft') ? false : undefined,
    search_text: searchQuery || undefined,
  });

  // Filter models locally for search (in case API doesn't support it)
  const filteredModels = useMemo(() => {
    if (!data?.items) return [];

    let models = data.items;

    // Additional local filtering if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.comment?.toLowerCase().includes(query) ||
          model.framework?.toLowerCase().includes(query) ||
          model.project?.name.toLowerCase().includes(query)
      );
    }

    // Filter by ready status if both selected or none selected, show all
    if (readyStatusFilter.length === 1) {
      if (readyStatusFilter.includes('ready')) {
        models = models.filter((model) => model.ready);
      } else if (readyStatusFilter.includes('draft')) {
        models = models.filter((model) => !model.ready);
      }
    }

    return models;
  }, [data?.items, searchQuery, readyStatusFilter]);

  const handleClearFilters = () => {
    setFrameworkFilter([]);
    setReadyStatusFilter([]);
    setSearchQuery('');
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log('Bulk delete:', selectedModelIds);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export models');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            Manage and organize your ML models in the model registry
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Model
        </Button>
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedModelIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedModelIds.length})
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none"
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            <Card className="p-4 sticky top-6">
              <ModelFilters
                selectedFrameworks={frameworkFilter}
                onFrameworkChange={(frameworks) => setFrameworkFilter(frameworks)}
                selectedReadyStatus={readyStatusFilter}
                onReadyStatusChange={(statuses) => setReadyStatusFilter(statuses)}
                selectedTags={[]}
                onTagChange={() => {}}
                searchQuery={searchQuery}
                onSearchChange={(query) => setSearchQuery(query)}
                onClearAll={handleClearFilters}
              />
            </Card>
          </aside>
        )}

        {/* Models Display */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <Card className="p-8 text-center">
              <p className="text-destructive">
                Error loading models: {error?.message || 'Unknown error'}
              </p>
            </Card>
          ) : viewMode === 'table' ? (
            <ModelTable
              models={filteredModels}
              onSelectionChange={setSelectedModelIds}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    No models found. Create your first model to get started.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Model
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isError && filteredModels.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredModels.length} of {data?.total || 0} models
            </div>
          )}
        </div>
      </div>

      {/* Create Model Dialog */}
      <ModelForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Models will be automatically refetched due to cache invalidation
        }}
      />
    </div>
  );
}
