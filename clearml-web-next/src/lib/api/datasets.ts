import { apiRequest } from './client';
import type { Dataset, DatasetVersion, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetDatasetsParams extends PaginationParams {
  id?: string[];
  name?: string;
  project?: string[];
  tags?: string[];
  system_tags?: string[];
  user?: string[];
  status?: string[];
  search_text?: string;
  _all_?: {
    pattern: string;
    fields: string[];
  };
  only_fields?: string[];
}

export interface CreateDatasetParams {
  name: string;
  project?: string;
  description?: string;
  tags?: string[];
  parent?: string;
  version?: string;
}

export interface UpdateDatasetParams {
  dataset: string;
  name?: string;
  description?: string;
  tags?: string[];
  system_tags?: string[];
  project?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fetch all datasets with optional filters
 */
export async function getDatasets(
  params?: GetDatasetsParams
): Promise<PaginatedResponse<Dataset>> {
  const response = await apiRequest<{ datasets: Dataset[]; total: number }>(
    'datasets.get_all_ex',
    params
  );

  return {
    items: response.datasets || [],
    total: response.total || 0,
    returned: response.datasets?.length || 0,
  };
}

/**
 * Get a single dataset by ID
 */
export async function getDatasetById(id: string): Promise<Dataset> {
  const response = await apiRequest<{ dataset: Dataset }>('datasets.get_by_id', {
    dataset: id,
  });

  return response.dataset;
}

/**
 * Create a new dataset
 */
export async function createDataset(params: CreateDatasetParams): Promise<Dataset> {
  const response = await apiRequest<{ id: string }>('datasets.create', params);

  // Fetch the created dataset
  return getDatasetById(response.id);
}

/**
 * Update an existing dataset
 */
export async function updateDataset(params: UpdateDatasetParams): Promise<Dataset> {
  await apiRequest('datasets.edit', params);

  // Fetch the updated dataset
  return getDatasetById(params.dataset);
}

/**
 * Delete a dataset
 */
export async function deleteDataset(id: string): Promise<void> {
  await apiRequest('datasets.delete', {
    dataset: id,
  });
}

/**
 * Get dataset versions
 */
export async function getDatasetVersions(id: string): Promise<DatasetVersion[]> {
  const response = await apiRequest<{ versions: DatasetVersion[] }>(
    'datasets.get_versions',
    {
      dataset: id,
    }
  );

  return response.versions || [];
}

/**
 * Publish a dataset
 */
export async function publishDataset(id: string): Promise<void> {
  await apiRequest('datasets.publish', {
    dataset: id,
  });
}

/**
 * Get dataset statistics
 */
export async function getDatasetStats(id: string): Promise<{
  size: number;
  file_count: number;
  preview?: unknown;
}> {
  const response = await apiRequest<{
    stats: {
      size: number;
      file_count: number;
      preview?: unknown;
    };
  }>('datasets.get_stats', {
    dataset: id,
  });

  return response.stats;
}
