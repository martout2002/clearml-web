import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query';
import * as workersApi from '../api/workers';
import type { Worker, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for workers
 */
export const workerKeys = {
  all: ['workers'] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (params?: workersApi.GetWorkersParams) =>
    [...workerKeys.lists(), params] as const,
  details: () => [...workerKeys.all, 'detail'] as const,
  detail: (id: string) => [...workerKeys.details(), id] as const,
  stats: () => [...workerKeys.all, 'stats'] as const,
  stat: (id: string) => [...workerKeys.stats(), id] as const,
};

/**
 * Fetch all workers with optional filters
 */
export function useWorkers(
  params?: workersApi.GetWorkersParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Worker>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: workerKeys.list(params),
    queryFn: () => workersApi.getWorkers(params),
    staleTime: 10_000, // 10 seconds - workers change frequently
    refetchInterval: 30_000, // Refetch every 30 seconds for real-time updates
    ...options,
  });
}

/**
 * Fetch a single worker by ID
 */
export function useWorker(
  id: string,
  options?: Omit<UseQueryOptions<Worker>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workerKeys.detail(id),
    queryFn: () => workersApi.getWorkerById(id),
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds for real-time updates
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch worker statistics
 */
export function useWorkerStats(
  id: string,
  options?: Omit<UseQueryOptions<workersApi.WorkerStats>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: workerKeys.stat(id),
    queryFn: () => workersApi.getWorkerStats(id),
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Refetch every 30 seconds for real-time updates
    enabled: !!id,
    ...options,
  });
}
