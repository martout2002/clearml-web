import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as datasetsApi from '../api/datasets';
import type { Dataset, DatasetVersion, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for datasets
 */
export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (params?: datasetsApi.GetDatasetsParams) =>
    [...datasetKeys.lists(), params] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
  versions: (id: string) => [...datasetKeys.detail(id), 'versions'] as const,
  stats: (id: string) => [...datasetKeys.detail(id), 'stats'] as const,
};

/**
 * Fetch all datasets with optional filters
 */
export function useDatasets(
  params?: datasetsApi.GetDatasetsParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Dataset>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: datasetKeys.list(params),
    queryFn: () => datasetsApi.getDatasets(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single dataset by ID
 */
export function useDataset(
  id: string,
  options?: Omit<UseQueryOptions<Dataset>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: datasetKeys.detail(id),
    queryFn: () => datasetsApi.getDatasetById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch dataset versions
 */
export function useDatasetVersions(
  id: string,
  options?: Omit<UseQueryOptions<DatasetVersion[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: datasetKeys.versions(id),
    queryFn: () => datasetsApi.getDatasetVersions(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch dataset stats
 */
export function useDatasetStats(
  id: string,
  options?: Omit<
    UseQueryOptions<{ size: number; file_count: number; preview?: unknown }>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: datasetKeys.stats(id),
    queryFn: () => datasetsApi.getDatasetStats(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new dataset
 */
export function useCreateDataset(
  options?: UseMutationOptions<Dataset, Error, datasetsApi.CreateDatasetParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetsApi.createDataset,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      options?.onSuccess?.(data, {} as datasetsApi.CreateDatasetParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing dataset
 */
export function useUpdateDataset(
  options?: UseMutationOptions<Dataset, Error, datasetsApi.UpdateDatasetParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetsApi.updateDataset,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(variables.dataset) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a dataset
 */
export function useDeleteDataset(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetsApi.deleteDataset,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() });
      queryClient.removeQueries({ queryKey: datasetKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Publish a dataset
 */
export function usePublishDataset(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: datasetsApi.publishDataset,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}
