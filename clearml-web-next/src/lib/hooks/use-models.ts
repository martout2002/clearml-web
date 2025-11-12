import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as modelsApi from '../api/models';
import type { Model, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for models
 */
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  list: (params?: modelsApi.GetModelsParams) =>
    [...modelKeys.lists(), params] as const,
  details: () => [...modelKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
};

/**
 * Fetch all models with optional filters
 */
export function useModels(
  params?: modelsApi.GetModelsParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Model>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: modelKeys.list(params),
    queryFn: () => modelsApi.getModels(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single model by ID
 */
export function useModel(
  id: string,
  options?: Omit<UseQueryOptions<Model>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: modelKeys.detail(id),
    queryFn: () => modelsApi.getModelById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new model
 */
export function useCreateModel(
  options?: UseMutationOptions<Model, Error, modelsApi.CreateModelParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelsApi.createModel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
      options?.onSuccess?.(data, {} as modelsApi.CreateModelParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing model
 */
export function useUpdateModel(
  options?: UseMutationOptions<Model, Error, modelsApi.UpdateModelParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelsApi.updateModel,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(variables.model) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a model
 */
export function useDeleteModel(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelsApi.deleteModel,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.lists() });
      queryClient.removeQueries({ queryKey: modelKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Publish a model
 */
export function usePublishModel(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: modelsApi.publishModel,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}
