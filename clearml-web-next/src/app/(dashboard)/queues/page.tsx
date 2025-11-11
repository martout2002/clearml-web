'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QueueTable } from '@/components/features/queues/queue-table';
import { QueueCard } from '@/components/features/queues/queue-card';
import { QueueForm } from '@/components/features/queues/queue-form';
import { useQueues, useDeleteQueue } from '@/lib/hooks/use-queues';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Plus,
  LayoutGrid,
  LayoutList,
  Search,
  Filter,
  ListTodo,
} from 'lucide-react';

type ViewMode = 'table' | 'grid';

export default function QueuesPage() {
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Hooks
  const { data, isLoading, isError, error } = useQueues();
  const deleteMutation = useDeleteQueue();
  const { toast } = useToast();

  // Filter queues locally
  const filteredQueues = useMemo(() => {
    if (!data?.items) return [];

    let queues = data.items;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      queues = queues.filter(
        (queue) =>
          queue.name.toLowerCase().includes(query) ||
          queue.id.toLowerCase().includes(query) ||
          queue.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return queues;
  }, [data?.items, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const queues = data?.items || [];
    const totalTasks = queues.reduce(
      (sum, queue) => sum + (queue.entries?.length || 0),
      0
    );
    const activeQueues = queues.filter((q) => (q.entries?.length || 0) > 0).length;

    return {
      total: queues.length,
      totalTasks,
      activeQueues,
      emptyQueues: queues.length - activeQueues,
    };
  }, [data?.items]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: 'Queue deleted',
        description: 'The queue has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete queue',
        variant: 'destructive',
      });
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Queues</h1>
          <p className="text-muted-foreground">
            Manage task queues and execution priorities
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Queue
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ListTodo className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Queues</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ListTodo className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTasks}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ListTodo className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Queues</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeQueues}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ListTodo className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Empty Queues</p>
              <p className="text-2xl font-bold text-gray-600">{stats.emptyQueues}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search queues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}

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

      {/* Queues Display */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <Card className="p-8 text-center">
            <p className="text-destructive">
              Error loading queues: {error?.message || 'Unknown error'}
            </p>
          </Card>
        ) : viewMode === 'table' ? (
          <QueueTable queues={filteredQueues} onDelete={handleDelete} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredQueues.length > 0 ? (
              filteredQueues.map((queue) => (
                <QueueCard key={queue.id} queue={queue} />
              ))
            ) : (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  No queues found. Create your first queue to get started.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Queue
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !isError && filteredQueues.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredQueues.length} of {data?.total || 0} queues
          </div>
        )}
      </div>

      {/* Create Queue Dialog */}
      <QueueForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          toast({
            title: 'Queue created',
            description: 'The queue has been successfully created.',
          });
        }}
      />
    </div>
  );
}
