# ClearML API Integration

This document describes how the ClearML Web Next.js application integrates with the ClearML API.

## Table of Contents

- [Overview](#overview)
- [API Client Configuration](#api-client-configuration)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Type Definitions](#type-definitions)
- [Error Handling](#error-handling)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Overview

The ClearML Web application communicates with the ClearML API backend using a REST-like API. All API requests are made using the `ky` HTTP client with automatic authentication and error handling.

### API Architecture

```
┌─────────────────┐
│  React          │
│  Components     │
└────────┬────────┘
         │ use hooks
         ▼
┌─────────────────┐
│  Custom Hooks   │
│  (TanStack      │
│   Query)        │
└────────┬────────┘
         │ call API functions
         ▼
┌─────────────────┐
│  API Functions  │
│  (tasks.ts,     │
│   projects.ts)  │
└────────┬────────┘
         │ use apiClient
         ▼
┌─────────────────┐
│  API Client     │
│  (ky + hooks)   │
└────────┬────────┘
         │ HTTP requests
         ▼
┌─────────────────┐
│  ClearML API    │
│  Backend        │
└─────────────────┘
```

## API Client Configuration

### Base Configuration

Located in `src/lib/api/client.ts`:

```typescript
import ky from 'ky';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clear.ml/v2.0';

export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Automatically inject authentication token
        const token = getAuthToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle unauthorized responses globally
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        // Parse and throw API errors
        if (!response.ok) {
          const error = await response.json().catch(() => ({
            message: 'An error occurred',
          }));
          throw new Error(error.message || 'API request failed');
        }

        return response;
      },
    ],
  },
});
```

### Environment Variables

Configure the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.clear.ml/v2.0
NEXT_PUBLIC_WEB_SERVER_URL=https://app.clear.ml
NEXT_PUBLIC_AUTH_COOKIE_NAME=clearml_token
```

### Generic Request Wrapper

```typescript
/**
 * Generic API request wrapper for ClearML API
 * @param endpoint - API endpoint name (e.g., 'tasks.get_all_ex')
 * @param body - Request body parameters
 * @returns Parsed response data
 */
export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await apiClient.post(endpoint, {
    json: body,
  });

  const data = await response.json();
  return data as T;
}
```

## Authentication Flow

### Login Process

1. User submits credentials
2. API returns token and user data
3. Token is stored in localStorage
4. Token is automatically included in subsequent requests

```typescript
// src/lib/api/auth.ts

/**
 * Authenticate user with credentials
 * @param credentials - Username and password
 * @returns Authentication token and user data
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await apiRequest<{
    token: string;
    user: User;
  }>('auth.login', {
    username: credentials.username,
    password: credentials.password,
  });

  // Store the token
  if (response.token) {
    setAuthToken(response.token);
  }

  return {
    token: response.token,
    user: response.user,
  };
}
```

### Token Management

```typescript
/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Check localStorage
  const token = localStorage.getItem('clearml_token');
  if (token) return token;

  // Check cookie
  const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'clearml_token';
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieName}=`));

  return cookie ? cookie.split('=')[1] : null;
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clearml_token', token);
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('clearml_token');
}
```

### Token Refresh

```typescript
/**
 * Refresh the authentication token
 * @returns New authentication token
 */
export async function refreshToken(): Promise<string> {
  const response = await apiRequest<RefreshTokenResponse>('auth.refresh', {});

  if (response.token) {
    setAuthToken(response.token);
  }

  return response.token;
}
```

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `auth.login` | POST | Authenticate with credentials |
| `auth.logout` | POST | Logout current user |
| `auth.refresh` | POST | Refresh authentication token |
| `auth.change_password` | POST | Change user password |
| `auth.request_password_reset` | POST | Request password reset email |
| `auth.reset_password` | POST | Reset password with token |
| `users.get_current_user` | POST | Get current user details |

### Tasks Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `tasks.get_all_ex` | POST | Get all tasks with filters |
| `tasks.get_by_id` | POST | Get single task by ID |
| `tasks.create` | POST | Create new task |
| `tasks.edit` | POST | Update existing task |
| `tasks.delete` | POST | Delete task |
| `tasks.enqueue` | POST | Add task to queue |
| `tasks.dequeue` | POST | Remove task from queue |
| `tasks.stop` | POST | Stop running task |
| `tasks.reset` | POST | Reset task state |
| `tasks.publish` | POST | Publish task |

### Projects Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `projects.get_all_ex` | POST | Get all projects with filters |
| `projects.get_by_id` | POST | Get single project by ID |
| `projects.create` | POST | Create new project |
| `projects.update` | POST | Update existing project |
| `projects.delete` | POST | Delete project |

### Models Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `models.get_all_ex` | POST | Get all models with filters |
| `models.get_by_id` | POST | Get single model by ID |
| `models.create` | POST | Create new model |
| `models.edit` | POST | Update existing model |
| `models.delete` | POST | Delete model |
| `models.publish` | POST | Publish model |

### Datasets Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `datasets.get_all_ex` | POST | Get all datasets with filters |
| `datasets.get_by_id` | POST | Get single dataset by ID |
| `datasets.create` | POST | Create new dataset |
| `datasets.update` | POST | Update existing dataset |
| `datasets.delete` | POST | Delete dataset |

### Queues Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `queues.get_all` | POST | Get all queues |
| `queues.get_by_id` | POST | Get single queue by ID |
| `queues.create` | POST | Create new queue |
| `queues.update` | POST | Update existing queue |
| `queues.delete` | POST | Delete queue |

### Workers Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `workers.get_all` | POST | Get all workers |
| `workers.get_by_id` | POST | Get single worker by ID |

## Type Definitions

### Common Types

Located in `src/types/api.ts`:

```typescript
/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  total: number;      // Total number of items
  returned: number;   // Number of items in this response
  items: T[];        // Array of items
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;           // Page number (0-indexed)
  page_size?: number;      // Items per page
  order_by?: string[];     // Sort fields
}

/**
 * API response metadata
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
```

### Task Types

```typescript
/**
 * Task entity
 */
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
}

/**
 * Task status enum
 */
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
```

### Project Types

```typescript
/**
 * Project entity
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  created?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  stats?: {
    active?: {
      status_count?: Record<TaskStatus, number>;
      total_tasks?: number;
    };
    total_tasks?: number;
  };
}
```

### Model Types

```typescript
/**
 * Model entity
 */
export interface Model {
  id: string;
  name: string;
  user?: {
    id: string;
    name: string;
  };
  created?: string;
  last_update?: string;
  tags?: string[];
  system_tags?: string[];
  comment?: string;
  framework?: string;
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
```

### Dataset Types

```typescript
/**
 * Dataset entity
 */
export interface Dataset {
  id: string;
  name: string;
  version?: string;
  description?: string;
  created?: string;
  last_update?: string;
  tags?: string[];
  project?: {
    id: string;
    name: string;
  };
  parent?: string;
  status?: 'created' | 'in_progress' | 'published' | 'closed';
  size?: number;
  file_count?: number;
  metadata?: Record<string, unknown>;
}
```

## Error Handling

### API Error Response

```typescript
interface ApiError {
  meta: {
    result_code: number;
    result_msg: string;
    error_stack?: string;
  };
}
```

### Error Handling in API Client

Errors are handled at multiple levels:

1. **API Client Level**: Catches HTTP errors and 401s
2. **API Function Level**: Can add specific error handling
3. **Hook Level**: TanStack Query provides error state
4. **Component Level**: Display user-friendly error messages

```typescript
// API Client (automatic)
afterResponse: [
  async (request, options, response) => {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    return response;
  },
]

// Component usage
function TasksList() {
  const { data, error, isLoading } = useTasks();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading tasks</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Render data
}
```

### Retry Logic

TanStack Query handles retries automatically:

```typescript
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    retry: 3,              // Retry failed requests 3 times
    retryDelay: 1000,      // Wait 1 second between retries
    staleTime: 30_000,     // Cache for 30 seconds
  });
}
```

## Usage Examples

### Fetching Data

```typescript
// In a component
import { useTasks } from '@/lib/hooks/use-tasks';

export function TasksList() {
  const { data, isLoading, error } = useTasks({
    status: ['in_progress', 'queued'],
    page_size: 50,
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.items.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

### Creating Data

```typescript
import { useCreateTask } from '@/lib/hooks/use-tasks';
import { useRouter } from 'next/navigation';

export function CreateTaskForm() {
  const router = useRouter();
  const createTask = useCreateTask();

  const handleSubmit = async (data: CreateTaskParams) => {
    try {
      const task = await createTask.mutateAsync(data);
      router.push(`/tasks/${task.id}`);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? 'Creating...' : 'Create Task'}
      </Button>
    </form>
  );
}
```

### Updating Data

```typescript
import { useUpdateTask } from '@/lib/hooks/use-tasks';

export function TaskEditor({ task }: { task: Task }) {
  const updateTask = useUpdateTask();

  const handleSave = async (updates: Partial<Task>) => {
    await updateTask.mutateAsync({
      task: task.id,
      ...updates,
    });
  };

  return (
    <div>
      {/* Edit form */}
      <Button onClick={() => handleSave({ name: 'New Name' })}>
        Save
      </Button>
    </div>
  );
}
```

### Optimistic Updates

```typescript
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: taskKeys.detail(variables.task)
      });

      // Snapshot previous value
      const previousTask = queryClient.getQueryData<Task>(
        taskKeys.detail(variables.task)
      );

      // Optimistically update cache
      queryClient.setQueryData<Task>(
        taskKeys.detail(variables.task),
        (old) => ({
          ...old!,
          ...variables,
        })
      );

      return { previousTask };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        taskKeys.detail(variables.task),
        context?.previousTask
      );
    },
    onSettled: (data, error, variables) => {
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.task)
      });
    },
  });
}
```

### Prefetching Data

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { taskKeys } from '@/lib/hooks/use-tasks';
import { getTaskById } from '@/lib/api/tasks';
import Link from 'next/link';

export function TaskLink({ id, name }: { id: string; name: string }) {
  const queryClient = useQueryClient();

  const prefetchTask = () => {
    queryClient.prefetchQuery({
      queryKey: taskKeys.detail(id),
      queryFn: () => getTaskById(id),
      staleTime: 60_000, // Cache for 1 minute
    });
  };

  return (
    <Link
      href={`/tasks/${id}`}
      onMouseEnter={prefetchTask}
      onFocus={prefetchTask}
    >
      {name}
    </Link>
  );
}
```

### Polling for Updates

```typescript
export function useTaskWithPolling(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTaskById(id),
    refetchInterval: (data) => {
      // Poll every 5 seconds if task is running
      if (data?.status === 'in_progress') {
        return 5000;
      }
      // Don't poll if task is completed
      return false;
    },
  });
}
```

## Best Practices

### 1. Use Query Key Factories

Always define query key factories for consistent cache management:

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: GetTasksParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
```

### 2. Invalidate Queries After Mutations

Always invalidate related queries after mutations:

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate task lists to show new task
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

### 3. Set Appropriate Stale Times

Configure stale times based on how often data changes:

```typescript
// Frequently changing data (task status)
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTaskById(id),
    staleTime: 10_000, // 10 seconds
  });
}

// Slowly changing data (projects)
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: getProjects,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
```

### 4. Type Everything

Always provide full type annotations:

```typescript
// ✅ Good
export async function getTasks(
  params?: GetTasksParams
): Promise<PaginatedResponse<Task>> {
  // ...
}

// ❌ Bad
export async function getTasks(params?: any): Promise<any> {
  // ...
}
```

### 5. Handle Loading and Error States

Always handle loading and error states in components:

```typescript
function TasksList() {
  const { data, isLoading, error } = useTasks();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.items.length) return <EmptyState />;

  return <div>{/* Render tasks */}</div>;
}
```

### 6. Use Optimistic Updates for Better UX

Implement optimistic updates for instant feedback:

```typescript
const updateTask = useMutation({
  mutationFn: api.updateTask,
  onMutate: async (variables) => {
    // Update cache immediately
    queryClient.setQueryData(['task', variables.id], variables);
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['task', variables.id], context.previousData);
  },
});
```

### 7. Prefetch Data on User Intent

Prefetch data when users show intent (hover, focus):

```typescript
<Link
  href={`/tasks/${id}`}
  onMouseEnter={() => queryClient.prefetchQuery(['task', id], () => getTask(id))}
>
  View Task
</Link>
```

---

For more information on specific API endpoints, refer to the [ClearML API Documentation](https://clear.ml/docs/latest/docs/references/api/index/).
