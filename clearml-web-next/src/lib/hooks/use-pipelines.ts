import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as pipelinesApi from '../api/pipelines';
import type { Pipeline, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for pipelines
 */
export const pipelineKeys = {
  all: ['pipelines'] as const,
  lists: () => [...pipelineKeys.all, 'list'] as const,
  list: (params?: pipelinesApi.GetPipelinesParams) =>
    [...pipelineKeys.lists(), params] as const,
  details: () => [...pipelineKeys.all, 'detail'] as const,
  detail: (id: string) => [...pipelineKeys.details(), id] as const,
};

/**
 * Fetch all pipelines with optional filters
 */
export function usePipelines(
  params?: pipelinesApi.GetPipelinesParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Pipeline>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: pipelineKeys.list(params),
    queryFn: () => pipelinesApi.getPipelines(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single pipeline by ID
 */
export function usePipeline(
  id: string,
  options?: Omit<UseQueryOptions<Pipeline>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: pipelineKeys.detail(id),
    queryFn: () => pipelinesApi.getPipelineById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new pipeline
 */
export function useCreatePipeline(
  options?: UseMutationOptions<Pipeline, Error, pipelinesApi.CreatePipelineParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pipelinesApi.createPipeline,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
      options?.onSuccess?.(data, {} as pipelinesApi.CreatePipelineParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing pipeline
 */
export function useUpdatePipeline(
  options?: UseMutationOptions<Pipeline, Error, pipelinesApi.UpdatePipelineParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pipelinesApi.updatePipeline,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables.pipeline) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a pipeline
 */
export function useDeletePipeline(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pipelinesApi.deletePipeline,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.lists() });
      queryClient.removeQueries({ queryKey: pipelineKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Start a pipeline execution
 */
export function useStartPipeline(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pipelinesApi.startPipeline,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Stop a pipeline execution
 */
export function useStopPipeline(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pipelinesApi.stopPipeline,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pipelineKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}
