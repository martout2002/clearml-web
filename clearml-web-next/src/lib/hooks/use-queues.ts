import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as queuesApi from '../api/queues';
import type { Queue, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for queues
 */
export const queueKeys = {
  all: ['queues'] as const,
  lists: () => [...queueKeys.all, 'list'] as const,
  list: (params?: queuesApi.GetQueuesParams) =>
    [...queueKeys.lists(), params] as const,
  details: () => [...queueKeys.all, 'detail'] as const,
  detail: (id: string) => [...queueKeys.details(), id] as const,
};

/**
 * Fetch all queues with optional filters
 */
export function useQueues(
  params?: queuesApi.GetQueuesParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Queue>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queueKeys.list(params),
    queryFn: () => queuesApi.getQueues(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single queue by ID
 */
export function useQueue(
  id: string,
  options?: Omit<UseQueryOptions<Queue>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: queueKeys.detail(id),
    queryFn: () => queuesApi.getQueueById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new queue
 */
export function useCreateQueue(
  options?: UseMutationOptions<Queue, Error, queuesApi.CreateQueueParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queuesApi.createQueue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
      options?.onSuccess?.(data, {} as queuesApi.CreateQueueParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing queue
 */
export function useUpdateQueue(
  options?: UseMutationOptions<Queue, Error, queuesApi.UpdateQueueParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queuesApi.updateQueue,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queueKeys.detail(variables.queue) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a queue
 */
export function useDeleteQueue(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: queuesApi.deleteQueue,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queueKeys.lists() });
      queryClient.removeQueries({ queryKey: queueKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}
