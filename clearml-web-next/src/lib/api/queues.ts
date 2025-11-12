import { apiRequest } from './client';
import type { Queue, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetQueuesParams extends PaginationParams {
  id?: string[];
  name?: string;
  tags?: string[];
  system_tags?: string[];
  only_fields?: string[];
}

export interface CreateQueueParams {
  name: string;
  tags?: string[];
  system_tags?: string[];
}

export interface UpdateQueueParams {
  queue: string;
  name?: string;
  tags?: string[];
  system_tags?: string[];
}

/**
 * Fetch all queues with optional filters
 */
export async function getQueues(
  params?: GetQueuesParams
): Promise<PaginatedResponse<Queue>> {
  const { data } = await apiRequest<{ queues: Queue[]; total: number }>(
    'queues.get_all',
    params
  );

  return {
    items: data.queues || [],
    total: data.total || 0,
    returned: data.queues?.length || 0,
  };
}

/**
 * Get a single queue by ID
 */
export async function getQueueById(id: string): Promise<Queue> {
  const { data } = await apiRequest<{ queue: Queue }>('queues.get_by_id', {
    queue: id,
  });

  return data.queue;
}

/**
 * Create a new queue
 */
export async function createQueue(params: CreateQueueParams): Promise<Queue> {
  const { data } = await apiRequest<{ id: string }>('queues.create', params);

  // Fetch the created queue
  return getQueueById(data.id);
}

/**
 * Update an existing queue
 */
export async function updateQueue(params: UpdateQueueParams): Promise<Queue> {
  await apiRequest('queues.update', params);

  // Fetch the updated queue
  return getQueueById(params.queue);
}

/**
 * Delete a queue
 */
export async function deleteQueue(id: string): Promise<void> {
  await apiRequest('queues.delete', {
    queue: id,
  });
}
