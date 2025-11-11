'use client';

import { useState, useMemo } from 'react';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DatasetTable } from '@/components/features/datasets/dataset-table';
import { DatasetCard } from '@/components/features/datasets/dataset-card';
import { DatasetFilters } from '@/components/features/datasets/dataset-filters';
import { DatasetForm } from '@/components/features/datasets/dataset-form';
import { useDatasets } from '@/lib/hooks/use-datasets';
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

export default function DatasetsPage() {
  // URL state management with nuqs
  const [statusFilter, setStatusFilter] = useQueryState(
    'status',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [searchQuery, setSearchQuery] = useQueryState('search', parseAsString.withDefault(''));

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);

  // Fetch datasets with filters
  const { data, isLoading, isError, error } = useDatasets({
    status: statusFilter,
    search_text: searchQuery || undefined,
  });

  // Filter datasets locally for search (in case API doesn't support it)
  const filteredDatasets = useMemo(() => {
    if (!data?.items) return [];

    let datasets = data.items;

    // Additional local filtering if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      datasets = datasets.filter(
        (dataset) =>
          dataset.name.toLowerCase().includes(query) ||
          dataset.description?.toLowerCase().includes(query) ||
          dataset.project?.name.toLowerCase().includes(query)
      );
    }

    return datasets;
  }, [data?.items, searchQuery]);

  const handleClearFilters = () => {
    setStatusFilter([]);
    setSearchQuery('');
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log('Bulk delete:', selectedDatasetIds);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export datasets');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
          <p className="text-muted-foreground">
            Organize and version your data for ML experiments
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Dataset
        </Button>
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search datasets..."
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
            {selectedDatasetIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedDatasetIds.length})
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
              <DatasetFilters
                selectedStatuses={statusFilter}
                onStatusChange={(statuses) => setStatusFilter(statuses)}
                searchQuery={searchQuery}
                onSearchChange={(query) => setSearchQuery(query)}
                onClearAll={handleClearFilters}
              />
            </Card>
          </aside>
        )}

        {/* Datasets Display */}
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
                Error loading datasets: {error?.message || 'Unknown error'}
              </p>
            </Card>
          ) : viewMode === 'table' ? (
            <DatasetTable
              datasets={filteredDatasets}
              onSelectionChange={setSelectedDatasetIds}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDatasets.length > 0 ? (
                filteredDatasets.map((dataset) => (
                  <DatasetCard key={dataset.id} dataset={dataset} />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    No datasets found. Create your first dataset to get started.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Dataset
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isError && filteredDatasets.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredDatasets.length} of {data?.total || 0} datasets
            </div>
          )}
        </div>
      </div>

      {/* Create Dataset Dialog */}
      <DatasetForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Datasets will be automatically refetched due to cache invalidation
        }}
      />
    </div>
  );
}
