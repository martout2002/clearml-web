import { apiRequest } from './client';
import type { Project, PaginatedResponse, PaginationParams } from '@/types/api';

export interface GetProjectsParams extends PaginationParams {
  id?: string[];
  name?: string;
  search_text?: string;
  tags?: string[];
  system_tags?: string[];
  shallow_search?: boolean;
  only_fields?: string[];
}

export interface CreateProjectParams {
  name: string;
  description?: string;
  tags?: string[];
  default_output_destination?: string;
}

export interface UpdateProjectParams {
  project: string;
  name?: string;
  description?: string;
  tags?: string[];
  system_tags?: string[];
  default_output_destination?: string;
}

/**
 * Fetch all projects with optional filters
 */
export async function getProjects(
  params?: GetProjectsParams
): Promise<PaginatedResponse<Project>> {
  const response = await apiRequest<{ projects: Project[]; total: number }>(
    'projects.get_all_ex',
    params
  );

  return {
    items: response.projects || [],
    total: response.total || 0,
    returned: response.projects?.length || 0,
  };
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<Project> {
  const response = await apiRequest<{ project: Project }>(
    'projects.get_by_id',
    {
      project: id,
    }
  );

  return response.project;
}

/**
 * Create a new project
 */
export async function createProject(
  params: CreateProjectParams
): Promise<Project> {
  const response = await apiRequest<{ id: string }>('projects.create', params);

  // Fetch the created project
  return getProjectById(response.id);
}

/**
 * Update an existing project
 */
export async function updateProject(
  params: UpdateProjectParams
): Promise<Project> {
  await apiRequest('projects.update', params);

  // Fetch the updated project
  return getProjectById(params.project);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  await apiRequest('projects.delete', {
    project: id,
  });
}

/**
 * Get project statistics
 */
export async function getProjectStats(projectId: string): Promise<Project['stats']> {
  const project = await getProjectById(projectId);
  return project.stats;
}
