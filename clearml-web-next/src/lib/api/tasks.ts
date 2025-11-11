import { apiRequest } from './client';
import type { Task, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetTasksParams extends PaginationParams {
  id?: string[];
  name?: string;
  type?: string[];
  status?: string[];
  project?: string[];
  tags?: string[];
  system_tags?: string[];
  user?: string[];
  search_text?: string;
  _all_?: {
    pattern: string;
    fields: string[];
  };
  only_fields?: string[];
}

export interface CreateTaskParams {
  name: string;
  type: string;
  project?: string;
  tags?: string[];
  comment?: string;
  script?: {
    repository?: string;
    branch?: string;
    entry_point?: string;
  };
}

export interface UpdateTaskParams {
  task: string;
  name?: string;
  comment?: string;
  tags?: string[];
  system_tags?: string[];
  project?: string;
  status?: string;
  status_reason?: string;
  status_message?: string;
}

/**
 * Fetch all tasks with optional filters
 */
export async function getTasks(
  params?: GetTasksParams
): Promise<PaginatedResponse<Task>> {
  const { data } = await apiRequest<{ tasks: Task[]; total: number }>(
    'tasks.get_all_ex',
    params
  );

  return {
    items: data.tasks || [],
    total: data.total || 0,
    returned: data.tasks?.length || 0,
  };
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<Task> {
  const { data } = await apiRequest<{ task: Task }>('tasks.get_by_id', {
    task: id,
  });

  return data.task;
}

/**
 * Create a new task
 */
export async function createTask(params: CreateTaskParams): Promise<Task> {
  const { data } = await apiRequest<{ id: string }>('tasks.create', params);

  // Fetch the created task
  return getTaskById(data.id);
}

/**
 * Update an existing task
 */
export async function updateTask(params: UpdateTaskParams): Promise<Task> {
  await apiRequest('tasks.edit', params);

  // Fetch the updated task
  return getTaskById(params.task);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  await apiRequest('tasks.delete', {
    task: id,
  });
}

/**
 * Enqueue a task
 */
export async function enqueueTask(
  taskId: string,
  queueId: string
): Promise<void> {
  await apiRequest('tasks.enqueue', {
    task: taskId,
    queue: queueId,
  });
}

/**
 * Dequeue a task
 */
export async function dequeueTask(taskId: string): Promise<void> {
  await apiRequest('tasks.dequeue', {
    task: taskId,
  });
}

/**
 * Reset a task
 */
export async function resetTask(taskId: string): Promise<void> {
  await apiRequest('tasks.reset', {
    task: taskId,
  });
}

/**
 * Stop a task
 */
export async function stopTask(taskId: string): Promise<void> {
  await apiRequest('tasks.stop', {
    task: taskId,
  });
}

/**
 * Publish a task
 */
export async function publishTask(taskId: string): Promise<void> {
  await apiRequest('tasks.publish', {
    task: taskId,
  });
}
