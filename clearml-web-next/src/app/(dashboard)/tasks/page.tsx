'use client';

import { useState, useMemo } from 'react';
import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskTable } from '@/components/features/tasks/task-table';
import { TaskCard } from '@/components/features/tasks/task-card';
import { TaskFilters } from '@/components/features/tasks/task-filters';
import { TaskForm } from '@/components/features/tasks/task-form';
import { useTasks } from '@/lib/hooks/use-tasks';
import type { TaskStatus } from '@/types/api';
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

export default function TasksPage() {
  // URL state management with nuqs
  const [statusFilter, setStatusFilter] = useQueryState(
    'status',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [typeFilter, setTypeFilter] = useQueryState(
    'type',
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [searchQuery, setSearchQuery] = useQueryState('search', parseAsString.withDefault(''));

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Fetch tasks with filters
  const { data, isLoading, isError, error } = useTasks({
    status: statusFilter as TaskStatus[],
    type: typeFilter,
    search_text: searchQuery || undefined,
  });

  // Filter tasks locally for search (in case API doesn't support it)
  const filteredTasks = useMemo(() => {
    if (!data?.items) return [];

    let tasks = data.items;

    // Additional local filtering if needed
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.name.toLowerCase().includes(query) ||
          task.comment?.toLowerCase().includes(query) ||
          task.project?.name.toLowerCase().includes(query)
      );
    }

    return tasks;
  }, [data?.items, searchQuery]);

  const handleClearFilters = () => {
    setStatusFilter([]);
    setTypeFilter([]);
    setSearchQuery('');
  };

  const handleBulkDelete = () => {
    // TODO: Implement bulk delete
    console.log('Bulk delete:', selectedTaskIds);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export tasks');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and monitor your ML experiments and workflows
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
            {selectedTaskIds.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedTaskIds.length})
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
              <TaskFilters
                selectedStatuses={statusFilter as TaskStatus[]}
                onStatusChange={(statuses) => setStatusFilter(statuses)}
                selectedTypes={typeFilter}
                onTypeChange={(types) => setTypeFilter(types)}
                searchQuery={searchQuery}
                onSearchChange={(query) => setSearchQuery(query)}
                onClearAll={handleClearFilters}
              />
            </Card>
          </aside>
        )}

        {/* Tasks Display */}
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
                Error loading tasks: {error?.message || 'Unknown error'}
              </p>
            </Card>
          ) : viewMode === 'table' ? (
            <TaskTable
              tasks={filteredTasks}
              onSelectionChange={setSelectedTaskIds}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <Card className="col-span-full p-8 text-center">
                  <p className="text-muted-foreground">
                    No tasks found. Create your first task to get started.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && !isError && filteredTasks.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Showing {filteredTasks.length} of {data?.total || 0} tasks
            </div>
          )}
        </div>
      </div>

      {/* Create Task Dialog */}
      <TaskForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          // Tasks will be automatically refetched due to cache invalidation
        }}
      />
    </div>
  );
}
