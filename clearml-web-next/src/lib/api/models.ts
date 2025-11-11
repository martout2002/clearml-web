import { apiRequest } from './client';
import type { Model, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetModelsParams extends PaginationParams {
  id?: string[];
  name?: string;
  framework?: string[];
  ready?: boolean;
  tags?: string[];
  system_tags?: string[];
  project?: string[];
  task?: string[];
  user?: string[];
  search_text?: string;
  _all_?: {
    pattern: string;
    fields: string[];
  };
  only_fields?: string[];
}

export interface CreateModelParams {
  name: string;
  uri: string;
  framework?: string;
  project?: string;
  task?: string;
  tags?: string[];
  comment?: string;
  labels?: Record<string, number>;
  design?: Record<string, unknown>;
  ready?: boolean;
}

export interface UpdateModelParams {
  model: string;
  name?: string;
  comment?: string;
  tags?: string[];
  system_tags?: string[];
  project?: string;
  task?: string;
  uri?: string;
  framework?: string;
  labels?: Record<string, number>;
  design?: Record<string, unknown>;
  ready?: boolean;
}

/**
 * Fetch all models with optional filters
 */
export async function getModels(
  params?: GetModelsParams
): Promise<PaginatedResponse<Model>> {
  const { data } = await apiRequest<{ models: Model[]; total: number }>(
    'models.get_all_ex',
    params
  );

  return {
    items: data.models || [],
    total: data.total || 0,
    returned: data.models?.length || 0,
  };
}

/**
 * Get a single model by ID
 */
export async function getModelById(id: string): Promise<Model> {
  const { data } = await apiRequest<{ model: Model }>('models.get_by_id', {
    model: id,
  });

  return data.model;
}

/**
 * Create a new model
 */
export async function createModel(params: CreateModelParams): Promise<Model> {
  const { data } = await apiRequest<{ id: string }>('models.create', params);

  // Fetch the created model
  return getModelById(data.id);
}

/**
 * Update an existing model
 */
export async function updateModel(params: UpdateModelParams): Promise<Model> {
  await apiRequest('models.edit', params);

  // Fetch the updated model
  return getModelById(params.model);
}

/**
 * Delete a model
 */
export async function deleteModel(id: string): Promise<void> {
  await apiRequest('models.delete', {
    model: id,
  });
}

/**
 * Publish a model
 */
export async function publishModel(id: string): Promise<void> {
  await apiRequest('models.publish', {
    model: id,
  });
}
