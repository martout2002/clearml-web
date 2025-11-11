/**
 * Common API response types for ClearML API
 */

export interface ApiResponse<T = unknown> {
  meta: {
    id: string;
    trx: string;
    endpoint: {
      name: string;
      requested_version: string;
      actual_version: string;
    };
    result_code: number;
    result_subcode: number;
    result_msg: string;
    error_stack?: string;
  };
  data: T;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  order_by?: string[];
}

export interface PaginatedResponse<T> {
  total: number;
  returned: number;
  items: T[];
}

export interface Task {
  id: string;
  name: string;
  type: string;
  status: TaskStatus;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  created?: string;
  started?: string;
  completed?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  comment?: string;
  script?: {
    repository?: string;
    branch?: string;
    entry_point?: string;
  };
  execution?: {
    model?: string;
    model_labels?: Record<string, number>;
    parameters?: Record<string, unknown>;
  };
  configuration?: Record<string, unknown>;
  runtime?: Record<string, unknown>;
  models?: {
    input?: Array<{ name: string; model: string }>;
    output?: Array<{ name: string; model: string }>;
  };
  container?: Record<string, unknown>;
}

export type TaskStatus =
  | 'created'
  | 'queued'
  | 'in_progress'
  | 'stopped'
  | 'published'
  | 'publishing'
  | 'closed'
  | 'failed'
  | 'completed'
  | 'unknown';

export interface Project {
  id: string;
  name: string;
  description?: string;
  created?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  default_output_destination?: string;
  stats?: {
    active?: {
      status_count?: Record<TaskStatus, number>;
      total_tasks?: number;
    };
    total_tasks?: number;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface Model {
  id: string;
  name: string;
  user?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  created?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  comment?: string;
  framework?: string;
  design?: Record<string, unknown>;
  labels?: Record<string, number>;
  uri?: string;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    name: string;
  };
  ready?: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  version?: string;
  description?: string;
  created?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  parent?: string;
  status?: 'created' | 'in_progress' | 'published' | 'closed';
  size?: number;
  file_count?: number;
  metadata?: Record<string, unknown>;
}

export interface DatasetVersion {
  id: string;
  version: string;
  created?: string;
  parent?: string;
  status?: string;
  size?: number;
  file_count?: number;
  comment?: string;
}

export interface Queue {
  id: string;
  name: string;
  company?: {
    id: string;
    name: string;
  };
  created?: string;
  tags?: string[];
  system_tags?: string[];
  entries?: Array<{
    task: string;
    added: string;
  }>;
}

export interface Worker {
  id: string;
  name?: string;
  company?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  ip?: string;
  queue?: string;
  queues?: string[];
  register_time?: string;
  last_activity_time?: string;
  last_report_time?: string;
  task?: {
    id: string;
    name: string;
  };
  tags?: string[];
  system_tags?: string[];
}

export interface User {
  id: string;
  name: string;
  company: {
    id: string;
    name: string;
  };
  avatar?: string;
  email?: string;
  role?: string;
  created?: string;
  preferences?: Record<string, unknown>;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'stopped' | 'completed' | 'failed';
  project?: { id: string; name: string };
  user?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
  created?: string;
  started?: string;
  completed?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  steps: PipelineStep[];
  edges: PipelineEdge[];
}

export interface PipelineStep {
  id: string;
  name: string;
  type: 'task' | 'dataset' | 'model' | 'code';
  status?: 'pending' | 'running' | 'completed' | 'failed';
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
}
