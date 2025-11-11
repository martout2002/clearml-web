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
  const response = await apiRequest<{ workers: Worker[]; total: number }>(
    'workers.get_all',
    params
  );

  return {
    items: response.workers || [],
    total: response.total || 0,
    returned: response.workers?.length || 0,
  };
}

/**
 * Get a single worker by ID
 */
export async function getWorkerById(id: string): Promise<Worker> {
  const response = await apiRequest<{ worker: Worker }>('workers.get_by_id', {
    worker: id,
  });

  return response.worker;
}

/**
 * Get worker statistics
 */
export async function getWorkerStats(id: string): Promise<WorkerStats> {
  const response = await apiRequest<{ stats: WorkerStats }>(
    'workers.get_stats',
    {
      worker: id,
    }
  );

  return response.stats;
}
