import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import * as tasksApi from '../api/tasks';
import type { Task, PaginatedResponse } from '@/types/api';

/**
 * Query key factory for tasks
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: tasksApi.GetTasksParams) =>
    [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * Fetch all tasks with optional filters
 */
export function useTasks(
  params?: tasksApi.GetTasksParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Task>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.getTasks(params),
    staleTime: 30_000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch a single task by ID
 */
export function useTask(
  id: string,
  options?: Omit<UseQueryOptions<Task>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTaskById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new task
 */
export function useCreateTask(
  options?: UseMutationOptions<Task, Error, tasksApi.CreateTaskParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      options?.onSuccess?.(data, {} as tasksApi.CreateTaskParams, undefined);
    },
    ...options,
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask(
  options?: UseMutationOptions<Task, Error, tasksApi.UpdateTaskParams>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.task) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Delete a task
 */
export function useDeleteTask(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.removeQueries({ queryKey: taskKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Enqueue a task
 */
export function useEnqueueTask(
  options?: UseMutationOptions<void, Error, { taskId: string; queueId: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, queueId }) => tasksApi.enqueueTask(taskId, queueId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Stop a task
 */
export function useStopTask(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.stopTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Reset a task
 */
export function useResetTask(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.resetTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}

/**
 * Publish a task
 */
export function usePublishTask(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.publishTask,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables) });
      options?.onSuccess?.(data, variables, undefined);
    },
    ...options,
  });
}
