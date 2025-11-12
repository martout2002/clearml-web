import { apiRequest } from './client';
import type { Pipeline, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetPipelinesParams extends PaginationParams {
  id?: string[];
  name?: string;
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

export interface CreatePipelineParams {
  name: string;
  description?: string;
  project?: string;
  tags?: string[];
  steps?: Array<{
    name: string;
    type: 'task' | 'dataset' | 'model' | 'code';
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges?: Array<{
    source: string;
    target: string;
  }>;
}

export interface UpdatePipelineParams {
  pipeline: string;
  name?: string;
  description?: string;
  tags?: string[];
  system_tags?: string[];
  project?: string;
  status?: string;
  steps?: Array<{
    id?: string;
    name: string;
    type: 'task' | 'dataset' | 'model' | 'code';
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges?: Array<{
    id?: string;
    source: string;
    target: string;
  }>;
}

/**
 * Fetch all pipelines with optional filters
 */
export async function getPipelines(
  params?: GetPipelinesParams
): Promise<PaginatedResponse<Pipeline>> {
  const { data } = await apiRequest<{ pipelines: Pipeline[]; total: number }>(
    'pipelines.get_all_ex',
    params
  );

  return {
    items: data.pipelines || [],
    total: data.total || 0,
    returned: data.pipelines?.length || 0,
  };
}

/**
 * Get a single pipeline by ID
 */
export async function getPipelineById(id: string): Promise<Pipeline> {
  const { data } = await apiRequest<{ pipeline: Pipeline }>('pipelines.get_by_id', {
    pipeline: id,
  });

  return data.pipeline;
}

/**
 * Create a new pipeline
 */
export async function createPipeline(params: CreatePipelineParams): Promise<Pipeline> {
  const { data } = await apiRequest<{ id: string }>('pipelines.create', params);

  // Fetch the created pipeline
  return getPipelineById(data.id);
}

/**
 * Update an existing pipeline
 */
export async function updatePipeline(params: UpdatePipelineParams): Promise<Pipeline> {
  await apiRequest('pipelines.edit', params);

  // Fetch the updated pipeline
  return getPipelineById(params.pipeline);
}

/**
 * Delete a pipeline
 */
export async function deletePipeline(id: string): Promise<void> {
  await apiRequest('pipelines.delete', {
    pipeline: id,
  });
}

/**
 * Start a pipeline execution
 */
export async function startPipeline(id: string): Promise<void> {
  await apiRequest('pipelines.start', {
    pipeline: id,
  });
}

/**
 * Stop a pipeline execution
 */
export async function stopPipeline(id: string): Promise<void> {
  await apiRequest('pipelines.stop', {
    pipeline: id,
  });
}
