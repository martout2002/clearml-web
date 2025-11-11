import { apiRequest } from './client';
import type { Worker, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetWorkersParams extends PaginationParams {
  id?: string[];
  name?: string;
  ip?: string;
  queue?: string[];
  tags?: string[];
  system_tags?: string[];
  last_activity_time?: {
    from?: string;
    to?: string;
  };
  only_fields?: string[];
}

export interface WorkerStats {
  id: string;
  worker: string;
  queue?: string;
  task?: {
    id: string;
    name: string;
    status?: string;
  };
  last_activity_time?: string;
  last_report_time?: string;
  register_time?: string;
}

/**
 * Fetch all workers with optional filters
 */
export async function getWorkers(
  params?: GetWorkersParams
): Promise<PaginatedResponse<Worker>> {
  const { data } = await apiRequest<{ workers: Worker[]; total: number }>(
    'workers.get_all',
    params
  );

  return {
    items: data.workers || [],
    total: data.total || 0,
    returned: data.workers?.length || 0,
  };
}

/**
 * Get a single worker by ID
 */
export async function getWorkerById(id: string): Promise<Worker> {
  const { data } = await apiRequest<{ worker: Worker }>('workers.get_by_id', {
    worker: id,
  });

  return data.worker;
}

/**
 * Get worker statistics
 */
export async function getWorkerStats(id: string): Promise<WorkerStats> {
  const { data } = await apiRequest<{ stats: WorkerStats }>(
    'workers.get_stats',
    {
      worker: id,
    }
  );

  return data.stats;
}
