# ClearML Web Next.js Architecture

This document describes the technical architecture of the ClearML Web Next.js application.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Core Technologies](#core-technologies)
- [State Management](#state-management)
- [API Client Design](#api-client-design)
- [Component Organization](#component-organization)
- [Routing Structure](#routing-structure)
- [Type System](#type-system)
- [Performance Optimizations](#performance-optimizations)

## Overview

ClearML Web Next.js is a modern, type-safe React application built with Next.js 16's App Router. The architecture follows React and Next.js best practices while maintaining compatibility with the ClearML API backend.

### Key Architectural Principles

1. **Type Safety First**: TypeScript strict mode with comprehensive type definitions
2. **Server State Separation**: TanStack Query manages all server state
3. **Component Composition**: Small, reusable components with clear responsibilities
4. **Colocation**: Features are organized by domain, with related code kept together
5. **Performance**: Lazy loading, code splitting, and optimistic updates
6. **Accessibility**: WCAG 2.1 AA compliance using Radix UI primitives

## Project Structure

```
clearml-web-next/
├── src/
│   ├── app/                          # Next.js App Router (routing + pages)
│   │   ├── (auth)/                  # Auth layout group
│   │   │   └── login/               # Login page
│   │   ├── (dashboard)/             # Main app layout group
│   │   │   ├── projects/            # Projects pages
│   │   │   ├── tasks/               # Tasks pages
│   │   │   │   └── [taskId]/        # Task detail pages
│   │   │   │       ├── info/        # Task info tab
│   │   │   │       ├── execution/   # Task execution tab
│   │   │   │       ├── configuration/
│   │   │   │       └── artifacts/
│   │   │   ├── models/              # Models pages
│   │   │   ├── datasets/            # Datasets pages
│   │   │   ├── workers/             # Workers pages
│   │   │   ├── queues/              # Queues pages
│   │   │   ├── reports/             # Reports pages
│   │   │   ├── settings/            # Settings pages
│   │   │   └── page.tsx             # Dashboard home
│   │   ├── layout.tsx               # Root layout (theme providers)
│   │   ├── providers.tsx            # Client providers (React Query)
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/                   # React components
│   │   ├── ui/                      # Base UI components (Shadcn/UI)
│   │   │   ├── button.tsx           # Button component
│   │   │   ├── card.tsx             # Card component
│   │   │   ├── dialog.tsx           # Dialog/Modal component
│   │   │   ├── form.tsx             # Form components
│   │   │   ├── table.tsx            # Table component
│   │   │   └── ...                  # 27+ UI components
│   │   ├── features/                # Feature-specific components
│   │   │   ├── tasks/               # Task-related components
│   │   │   │   ├── task-list.tsx
│   │   │   │   ├── task-card.tsx
│   │   │   │   ├── task-filters.tsx
│   │   │   │   └── task-status-badge.tsx
│   │   │   ├── projects/            # Project components
│   │   │   ├── models/              # Model components
│   │   │   ├── datasets/            # Dataset components
│   │   │   ├── workers/             # Worker components
│   │   │   ├── queues/              # Queue components
│   │   │   └── reports/             # Report components
│   │   └── layout/                  # Layout components
│   │       ├── header.tsx           # Top navigation bar
│   │       ├── sidebar.tsx          # Side navigation
│   │       └── theme-toggle.tsx     # Theme switcher
│   │
│   ├── lib/                         # Core utilities and logic
│   │   ├── api/                     # API client and endpoints
│   │   │   ├── client.ts            # Base API client (ky setup)
│   │   │   ├── auth.ts              # Auth endpoints
│   │   │   ├── tasks.ts             # Tasks endpoints
│   │   │   ├── projects.ts          # Projects endpoints
│   │   │   ├── models.ts            # Models endpoints
│   │   │   ├── datasets.ts          # Datasets endpoints
│   │   │   ├── workers.ts           # Workers endpoints
│   │   │   └── queues.ts            # Queues endpoints
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── use-auth.ts          # Auth hooks (login, logout, etc.)
│   │   │   ├── use-tasks.ts         # Tasks hooks (CRUD operations)
│   │   │   ├── use-projects.ts      # Projects hooks
│   │   │   ├── use-models.ts        # Models hooks
│   │   │   ├── use-datasets.ts      # Datasets hooks
│   │   │   ├── use-workers.ts       # Workers hooks
│   │   │   ├── use-queues.ts        # Queues hooks
│   │   │   └── use-toast.ts         # Toast notifications
│   │   ├── stores/                  # Zustand stores (client state)
│   │   │   ├── auth.ts              # Auth store (user, token)
│   │   │   └── preferences.ts       # User preferences store
│   │   └── utils/                   # Utility functions
│   │       ├── cn.ts                # Class name utility
│   │       ├── format.ts            # Formatting utilities
│   │       └── validation.ts        # Validation utilities
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── api.ts                   # API response types
│   │
│   └── styles/                      # Global styles
│       └── globals.css              # Global CSS + Tailwind imports
│
├── public/                          # Static assets
├── tests/                           # Test files
├── .env.local.example               # Environment variables template
├── next.config.js                   # Next.js configuration
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── vitest.config.ts                 # Vitest configuration
```

## Core Technologies

### Next.js 16 App Router

The application uses Next.js 16's App Router for:

- **File-based routing**: Pages are defined by the file structure in `src/app/`
- **Route groups**: `(auth)` and `(dashboard)` for layout organization
- **Layouts**: Shared layouts for authentication and dashboard pages
- **Server Components**: Default to Server Components for better performance
- **Client Components**: Use `'use client'` directive for interactive components

### React 19

React 19 provides:

- **Improved hydration**: Faster initial page loads
- **Automatic batching**: Better performance for state updates
- **Suspense improvements**: Better loading states
- **Server Actions**: Future-ready for server-side mutations

### Tailwind CSS 4.0

Styling architecture:

- **Utility-first CSS**: Rapid UI development
- **Custom theme**: Extended color palette, spacing, and typography
- **Dark mode**: Built-in theme support via `next-themes`
- **Component variants**: Using `class-variance-authority`
- **Responsive design**: Mobile-first approach

### TypeScript 5.8+

Type system features:

- **Strict mode**: Enabled for maximum type safety
- **No implicit any**: All types must be explicit
- **Discriminated unions**: For complex state management
- **Generic types**: Reusable type-safe functions
- **Type inference**: Minimal type annotations needed

## State Management

### Server State (TanStack Query)

**Philosophy**: All data from the ClearML API is managed by TanStack Query (React Query).

**Benefits**:
- Automatic caching and background refetching
- Optimistic updates for better UX
- Request deduplication
- Stale-while-revalidate pattern
- Built-in loading and error states

**Example**:

```typescript
// Hook definition
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    staleTime: 30_000, // Cache for 30 seconds
  });
}

// Usage in component
function TasksList() {
  const { data, isLoading, error } = useTasks({ status: ['in_progress'] });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.items.map(task => <TaskCard task={task} />)}</div>;
}
```

**Query Key Factory Pattern**:

Each resource has a query key factory for consistent cache management:

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: GetTasksParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};
```

**Mutations**:

Mutations automatically invalidate related queries:

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate task lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

### Client State (Zustand)

**Philosophy**: Minimal client state, only for UI state that doesn't come from the server.

**Use cases**:
- Authentication state (user, token)
- User preferences (theme, sidebar state)
- UI transient state (modals, toasts)

**Example - Auth Store**:

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'clearml-auth',
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);
```

## API Client Design

### Base Client (ky)

The API client is built on `ky`, a modern fetch wrapper:

```typescript
export const apiClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Auto-inject auth token
        const token = getAuthToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 globally
        if (response.status === 401) {
          window.location.href = '/login';
        }

        // Parse errors
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        return response;
      },
    ],
  },
});
```

### API Endpoint Organization

Each resource has its own API module:

```typescript
// src/lib/api/tasks.ts
export async function getTasks(params?: GetTasksParams) {
  const response = await apiRequest<{ tasks: Task[] }>('tasks.get_all_ex', params);
  return response.tasks;
}

export async function getTaskById(id: string) {
  const response = await apiRequest<{ task: Task }>('tasks.get_by_id', { task: id });
  return response.task;
}

export async function createTask(params: CreateTaskParams) {
  const response = await apiRequest<{ id: string }>('tasks.create', params);
  return getTaskById(response.id);
}
```

### Type Safety

All API functions are fully typed:

```typescript
export interface GetTasksParams extends PaginationParams {
  status?: TaskStatus[];
  project?: string[];
  tags?: string[];
  search_text?: string;
}

export async function getTasks(
  params?: GetTasksParams
): Promise<PaginatedResponse<Task>> {
  // Implementation
}
```

## Component Organization

### Component Hierarchy

1. **UI Components** (`components/ui/`):
   - Atomic, reusable components
   - Built with Radix UI primitives
   - Styled with Tailwind CSS
   - No business logic
   - Fully accessible

2. **Feature Components** (`components/features/`):
   - Domain-specific components
   - Contain business logic
   - Use custom hooks for data fetching
   - Compose UI components

3. **Layout Components** (`components/layout/`):
   - App-wide layout components
   - Navigation, headers, footers
   - Shared across routes

### Component Patterns

**Compound Components**:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
    <CardDescription>View task information</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Render Props**:

```typescript
<DataTable
  data={tasks}
  columns={columns}
  renderEmpty={() => <EmptyState message="No tasks found" />}
  renderLoading={() => <Skeleton />}
/>
```

**Custom Hooks for Logic**:

```typescript
function TasksList() {
  const { data, isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();

  // Component only handles rendering
  return <TasksTable data={data} onDelete={deleteTask.mutate} />;
}
```

## Routing Structure

### Route Groups

**`(auth)` group**: Authentication pages

```
(auth)/
└── login/
    └── page.tsx       # Login page
```

**`(dashboard)` group**: Main application

```
(dashboard)/
├── page.tsx                          # Dashboard home
├── projects/
│   ├── page.tsx                     # Projects list
│   └── [projectId]/
│       └── page.tsx                 # Project details
├── tasks/
│   ├── page.tsx                     # Tasks list
│   └── [taskId]/
│       ├── page.tsx                 # Task overview (redirects to info)
│       ├── info/page.tsx            # Task info tab
│       ├── execution/page.tsx       # Task execution tab
│       ├── configuration/page.tsx   # Task configuration tab
│       └── artifacts/page.tsx       # Task artifacts tab
├── models/
│   ├── page.tsx                     # Models list
│   └── [modelId]/page.tsx           # Model details
├── datasets/
│   ├── page.tsx                     # Datasets list
│   └── [datasetId]/page.tsx         # Dataset details
├── workers/
│   └── page.tsx                     # Workers list
├── queues/
│   └── page.tsx                     # Queues list
├── reports/
│   └── page.tsx                     # Reports list
└── settings/
    └── page.tsx                     # Settings page
```

### Layouts

**Root Layout** (`app/layout.tsx`):
- Applies to all pages
- Sets up HTML structure
- Provides theme and query client

**Dashboard Layout** (`app/(dashboard)/layout.tsx`):
- Wraps all dashboard pages
- Includes header and sidebar
- Handles authentication checks

### Navigation

Navigation uses Next.js `Link` component for:
- Client-side navigation
- Automatic prefetching
- No page reloads

```typescript
import Link from 'next/link';

<Link href="/tasks/123">View Task</Link>
```

## Type System

### API Types

Located in `src/types/api.ts`:

```typescript
export interface Task {
  id: string;
  name: string;
  status: TaskStatus;
  project?: {
    id: string;
    name: string;
  };
  // ... more fields
}

export type TaskStatus =
  | 'created'
  | 'queued'
  | 'in_progress'
  | 'stopped'
  | 'completed'
  | 'failed';

export interface PaginatedResponse<T> {
  total: number;
  returned: number;
  items: T[];
}
```

### Generic Types

Reusable generic types for common patterns:

```typescript
// Pagination
export interface PaginationParams {
  page?: number;
  page_size?: number;
  order_by?: string[];
}

// API responses
export interface ApiResponse<T> {
  meta: ResponseMeta;
  data: T;
}

// Component props
export interface ListProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}
```

### Type Guards

Type guards for runtime type checking:

```typescript
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  );
}
```

## Performance Optimizations

### Code Splitting

- **Dynamic imports**: Heavy components loaded on demand
- **Route-based splitting**: Each page is a separate chunk
- **Component lazy loading**: Non-critical components deferred

```typescript
const HeavyChart = dynamic(() => import('./heavy-chart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Memoization

- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Cache expensive calculations
- **useCallback**: Stable function references

```typescript
const TasksList = React.memo(({ tasks }) => {
  const sortedTasks = useMemo(
    () => tasks.sort((a, b) => a.name.localeCompare(b.name)),
    [tasks]
  );

  const handleSelect = useCallback(
    (id: string) => {
      // Handle selection
    },
    []
  );

  return <div>{sortedTasks.map(task => <TaskCard task={task} />)}</div>;
});
```

### React Query Optimizations

- **Stale time**: Reduce unnecessary refetches
- **Cache time**: Keep data in cache longer
- **Placeholders**: Show cached data while refetching
- **Prefetching**: Load data before user navigates

```typescript
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
    staleTime: 30_000,      // Don't refetch for 30 seconds
    cacheTime: 5 * 60_000,  // Keep in cache for 5 minutes
    placeholderData: (previousData) => previousData, // Show old data while loading
  });
}

// Prefetch on hover
function TaskLink({ id }: { id: string }) {
  const queryClient = useQueryClient();

  return (
    <Link
      href={`/tasks/${id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: taskKeys.detail(id),
          queryFn: () => getTaskById(id),
        });
      }}
    >
      View Task
    </Link>
  );
}
```

### Image Optimization

Using Next.js Image component:

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="ClearML Logo"
  width={200}
  height={50}
  priority // Load above the fold
/>
```

### Bundle Size

- Tree shaking enabled by default
- Import only needed components
- Use dynamic imports for large dependencies

```typescript
// Good: Import only what you need
import { Button } from '@/components/ui/button';

// Bad: Import everything
import * as UI from '@/components/ui';
```

## Error Handling

### API Errors

Errors are handled at multiple levels:

1. **API Client**: Catches network errors and 401s
2. **React Query**: Provides error state to components
3. **Components**: Display user-friendly error messages
4. **Global Error Boundary**: Catches unexpected errors

```typescript
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

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to service
    console.error('Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

## Testing Strategy

### Unit Tests (Vitest)

- Test utility functions
- Test custom hooks
- Test component logic

```typescript
import { renderHook } from '@testing-library/react';
import { useTasks } from '@/lib/hooks/use-tasks';

test('useTasks fetches tasks', async () => {
  const { result, waitFor } = renderHook(() => useTasks());

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toHaveLength(10);
});
```

### Component Tests (React Testing Library)

- Test user interactions
- Test accessibility
- Test error states

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './task-card';

test('TaskCard displays task name', () => {
  render(<TaskCard task={mockTask} />);
  expect(screen.getByText('My Task')).toBeInTheDocument();
});

test('TaskCard handles click', async () => {
  const handleClick = vi.fn();
  render(<TaskCard task={mockTask} onClick={handleClick} />);

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### E2E Tests (Playwright)

- Test critical user flows
- Test across browsers
- Test responsive design

```typescript
import { test, expect } from '@playwright/test';

test('user can create a task', async ({ page }) => {
  await page.goto('/tasks');
  await page.click('text=Create Task');
  await page.fill('input[name="name"]', 'New Task');
  await page.click('button:has-text("Create")');

  await expect(page.locator('text=New Task')).toBeVisible();
});
```

## Security

### Authentication

- Token stored in localStorage
- Auto-injected into requests
- 401 responses redirect to login
- Token refresh on expiry

### XSS Prevention

- React escapes content by default
- No `dangerouslySetInnerHTML` unless necessary
- Sanitize user input

### CSRF Protection

- Credentials: 'include' sends cookies
- API validates CSRF tokens
- SameSite cookies

## Accessibility

### WCAG 2.1 AA Compliance

- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- ARIA labels and roles

### Radix UI

All UI components use Radix UI primitives which provide:
- Built-in accessibility
- Keyboard navigation
- ARIA attributes
- Focus management

```typescript
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    {/* Radix handles focus trap, ESC key, click outside, etc. */}
  </DialogContent>
</Dialog>
```

## Future Enhancements

### Planned Architecture Changes

1. **Server Actions**: Migrate mutations to Next.js server actions
2. **Streaming**: Use React Server Components streaming for better loading states
3. **Partial Prerendering**: Static shell with dynamic content
4. **Edge Runtime**: Deploy API routes to edge for lower latency
5. **WebSockets**: Real-time updates for task status changes
6. **Offline Support**: Service worker for offline functionality
7. **Module Federation**: Share components across micro-frontends

---

This architecture is designed to be scalable, maintainable, and performant while providing an excellent developer experience.
