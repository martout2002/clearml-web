'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { WorkerTable } from '@/components/features/workers/worker-table';
import { WorkerCard } from '@/components/features/workers/worker-card';
import { useWorkers } from '@/lib/hooks/use-workers';
import type { Worker } from '@/types/api';
import {
  LayoutGrid,
  LayoutList,
  Search,
  Filter,
  Activity,
  ServerOff,
} from 'lucide-react';

type ViewMode = 'table' | 'grid';
type StatusFilter = 'all' | 'online' | 'offline';

/**
 * Determine if worker is online based on last activity time
 */
function isWorkerOnline(worker: Worker): boolean {
  if (!worker.last_activity_time) {
    return false;
  }

  const lastActivity = new Date(worker.last_activity_time);
  const now = new Date();
  const diffMs = now.getTime() - lastActivity.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes < 2;
}

export default function WorkersPage() {
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Fetch workers with auto-refresh for real-time updates
  const { data, isLoading, isError, error } = useWorkers();

  // Filter workers locally
  const filteredWorkers = useMemo(() => {
    if (!data?.items) return [];

    let workers = data.items;

    // Status filter
    if (statusFilter !== 'all') {
      workers = workers.filter((worker) => {
        const online = isWorkerOnline(worker);
        return statusFilter === 'online' ? online : !online;
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      workers = workers.filter(
        (worker) =>
          worker.name?.toLowerCase().includes(query) ||
          worker.id.toLowerCase().includes(query) ||
          worker.ip?.toLowerCase().includes(query) ||
          worker.task?.name.toLowerCase().includes(query)
      );
    }

    return workers;
  }, [data?.items, statusFilter, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const workers = data?.items || [];
    const online = workers.filter(isWorkerOnline).length;
    const offline = workers.length - online;
    const active = workers.filter((w) => !!w.task).length;

    return { total: workers.length, online, offline, active };
  }, [data?.items]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground">
            Monitor and manage your ClearML workers
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Workers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ServerOff className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-purple-600">{stats.active}</p>
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
                placeholder="Search workers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="h-8"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'online' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('online')}
                className="h-8"
              >
                <Activity className="mr-1 h-3 w-3 text-green-600" />
                Online
              </Button>
              <Button
                variant={statusFilter === 'offline' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('offline')}
                className="h-8"
              >
                <ServerOff className="mr-1 h-3 w-3 text-gray-600" />
                Offline
              </Button>
            </div>

            {(searchQuery || statusFilter !== 'all') && (
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

      {/* Workers Display */}
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
              Error loading workers: {error?.message || 'Unknown error'}
            </p>
          </Card>
        ) : viewMode === 'table' ? (
          <WorkerTable workers={filteredWorkers} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))
            ) : (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">
                  No workers found. Workers will appear here once they connect to the server.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && !isError && filteredWorkers.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {filteredWorkers.length} of {data?.total || 0} workers
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Activity className="h-3 w-3 animate-pulse" />
        <span>Auto-refreshing every 30 seconds</span>
      </div>
    </div>
  );
}
