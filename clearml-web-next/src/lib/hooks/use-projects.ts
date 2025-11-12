import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as projectsApi from '../api/projects';
import type { Project, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: projectsApi.GetProjectsParams) =>
    [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.detail(id), 'stats'] as const,
};

/**
 * Fetch all projects with optional filters
 */
export function useProjects(
  params?: projectsApi.GetProjectsParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Project>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsApi.getProjects(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single project by ID
 */
export function useProject(
  id: string,
  options?: Omit<UseQueryOptions<Project>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getProjectById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new project
 */
export function useCreateProject(
  options?: UseMutationOptions<Project, Error, projectsApi.CreateProjectParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      options?.onSuccess?.(data, {} as projectsApi.CreateProjectParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing project
 */
export function useUpdateProject(
  options?: UseMutationOptions<Project, Error, projectsApi.UpdateProjectParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.updateProject,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.project) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a project
 */
export function useDeleteProject(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Fetch project statistics
 */
export function useProjectStats(
  id: string,
  options?: Omit<UseQueryOptions<Project['stats']>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: projectKeys.stats(id),
    queryFn: () => projectsApi.getProjectStats(id),
    staleTime: 30_000, // 30 seconds
    enabled: !!id,
    ...options,
  });
}
