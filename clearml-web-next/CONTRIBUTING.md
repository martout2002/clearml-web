# Contributing to ClearML Web Next.js

Thank you for considering contributing to the ClearML Web Next.js project! This document provides guidelines and best practices for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guide](#code-style-guide)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing Requirements](#testing-requirements)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Commit Message Conventions](#commit-message-conventions)

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Bun 1.3+** (or Node.js 20+)
- **Git**
- A code editor (VS Code recommended)
- Basic knowledge of:
  - TypeScript
  - React and React hooks
  - Next.js App Router
  - TanStack Query
  - Tailwind CSS

### Recommended VS Code Extensions

- **ESLint**: For linting
- **Prettier**: For code formatting
- **Tailwind CSS IntelliSense**: For Tailwind autocomplete
- **TypeScript Error Translator**: For better error messages
- **Pretty TypeScript Errors**: For readable TypeScript errors

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/allegroai/clearml-web.git
cd clearml-web/clearml-web-next
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your API configuration
```

### 4. Start Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### 5. Run Tests

```bash
# Unit tests
bun run test

# Unit tests with UI
bun run test:ui

# E2E tests
bun run test:e2e

# Type check
bun run type-check

# Lint
bun run lint
```

## Code Style Guide

### TypeScript

#### Use Strict Mode

Always use TypeScript in strict mode. No `any` types unless absolutely necessary.

```typescript
// ✅ Good
function getTaskById(id: string): Promise<Task> {
  return apiClient.get(`tasks/${id}`).json();
}

// ❌ Bad
function getTaskById(id: any): Promise<any> {
  return apiClient.get(`tasks/${id}`).json();
}
```

#### Prefer Type Inference

Let TypeScript infer types when possible:

```typescript
// ✅ Good - Type inferred
const tasks = await getTasks();

// ❌ Bad - Redundant type annotation
const tasks: Task[] = await getTasks();
```

#### Use Interface for Objects, Type for Unions

```typescript
// ✅ Good
interface Task {
  id: string;
  name: string;
  status: TaskStatus;
}

type TaskStatus = 'created' | 'queued' | 'in_progress' | 'completed';

// ❌ Bad
type Task = {
  id: string;
  name: string;
  status: TaskStatus;
};

interface TaskStatus {
  // This doesn't make sense for unions
}
```

#### Use Discriminated Unions for Complex States

```typescript
// ✅ Good
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'success':
      // TypeScript knows state.data exists here
      return state.data;
    case 'error':
      // TypeScript knows state.error exists here
      throw state.error;
    default:
      return null;
  }
}
```

### React Components

#### Use Functional Components

Always use functional components with hooks:

```typescript
// ✅ Good
export function TaskCard({ task, onSelect }: TaskCardProps) {
  return (
    <Card onClick={() => onSelect(task)}>
      <CardHeader>
        <CardTitle>{task.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}

// ❌ Bad - No class components
export class TaskCard extends React.Component<TaskCardProps> {
  render() {
    return <div>{this.props.task.name}</div>;
  }
}
```

#### Define Props with Interface

```typescript
// ✅ Good
interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  variant?: 'default' | 'compact';
}

export function TaskCard({ task, onSelect, variant = 'default' }: TaskCardProps) {
  // ...
}
```

#### Use Destructuring for Props

```typescript
// ✅ Good
function TaskCard({ task, onSelect }: TaskCardProps) {
  return <div onClick={() => onSelect(task)}>{task.name}</div>;
}

// ❌ Bad
function TaskCard(props: TaskCardProps) {
  return <div onClick={() => props.onSelect(props.task)}>{props.task.name}</div>;
}
```

#### Extract Complex JSX into Components

```typescript
// ✅ Good
function TaskDetails({ task }: TaskDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <TaskHeader task={task} />
      </CardHeader>
      <CardContent>
        <TaskMetadata task={task} />
        <TaskExecution task={task} />
      </CardContent>
    </Card>
  );
}

// ❌ Bad - Too much JSX in one component
function TaskDetails({ task }: TaskDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h1>{task.name}</h1>
          <div>{task.status}</div>
          {/* 100+ lines of JSX */}
        </div>
      </CardHeader>
    </Card>
  );
}
```

### Naming Conventions

#### Components

Use PascalCase for component names:

```typescript
// ✅ Good
export function TaskCard() {}
export function TaskStatusBadge() {}

// ❌ Bad
export function taskCard() {}
export function task_status_badge() {}
```

#### Files

- **Components**: `task-card.tsx`, `task-list.tsx`
- **Hooks**: `use-tasks.ts`, `use-auth.ts`
- **API**: `tasks.ts`, `projects.ts`
- **Types**: `api.ts`, `task.ts`
- **Utils**: `format.ts`, `validation.ts`

#### Variables and Functions

Use camelCase:

```typescript
// ✅ Good
const taskList = getTasks();
function handleTaskSelect(task: Task) {}

// ❌ Bad
const TaskList = getTasks();
function HandleTaskSelect(task: Task) {}
```

#### Constants

Use UPPER_SNAKE_CASE for constants:

```typescript
// ✅ Good
const API_BASE_URL = 'https://api.clear.ml';
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Bad
const apiBaseUrl = 'https://api.clear.ml';
const maxRetryAttempts = 3;
```

### Tailwind CSS

#### Use Utility Classes

```typescript
// ✅ Good
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  {/* Content */}
</div>

// ❌ Bad - Don't write custom CSS
<div className="custom-container">
  {/* Content */}
</div>
```

#### Use `cn()` Helper for Conditional Classes

```typescript
import { cn } from '@/lib/utils/cn';

// ✅ Good
<div className={cn(
  'p-4 rounded-lg',
  variant === 'compact' && 'p-2',
  isSelected && 'bg-primary text-primary-foreground'
)}>
  {/* Content */}
</div>

// ❌ Bad
<div className={`p-4 rounded-lg ${variant === 'compact' ? 'p-2' : ''} ${isSelected ? 'bg-primary' : ''}`}>
  {/* Content */}
</div>
```

#### Use Consistent Spacing

Use Tailwind's spacing scale (0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, ...):

```typescript
// ✅ Good
<div className="p-4 mb-6 gap-2">

// ❌ Bad
<div className="p-[17px] mb-[25px] gap-[9px]">
```

## Component Guidelines

### Component Structure

Organize components with this structure:

```typescript
'use client'; // Only if needed

// 1. Imports
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTasks } from '@/lib/hooks/use-tasks';
import type { Task } from '@/types/api';

// 2. Types
interface TaskListProps {
  projectId?: string;
  onTaskSelect?: (task: Task) => void;
}

// 3. Component
export function TaskList({ projectId, onTaskSelect }: TaskListProps) {
  // 3a. Hooks
  const { data, isLoading, error } = useTasks({ project: projectId });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 3b. Derived state
  const selectedTask = data?.items.find(t => t.id === selectedId);

  // 3c. Event handlers
  const handleSelect = (task: Task) => {
    setSelectedId(task.id);
    onTaskSelect?.(task);
  };

  // 3d. Early returns
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.items.length) return <EmptyState />;

  // 3e. Main render
  return (
    <div className="space-y-4">
      {data.items.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isSelected={task.id === selectedId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

// 4. Helper components (if small and related)
function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  return (
    <Card
      className={cn('cursor-pointer', isSelected && 'ring-2 ring-primary')}
      onClick={() => onSelect(task)}
    >
      <CardHeader>
        <CardTitle>{task.name}</CardTitle>
      </CardHeader>
    </Card>
  );
}
```

### Component Size

Keep components small and focused:

- **Small**: < 50 lines (perfect)
- **Medium**: 50-150 lines (acceptable)
- **Large**: 150-300 lines (should be split)
- **Too Large**: > 300 lines (must be split)

### Component Composition

Prefer composition over props:

```typescript
// ✅ Good - Composition
<Card>
  <CardHeader>
    <CardTitle>Task Details</CardTitle>
    <CardDescription>View task information</CardDescription>
  </CardHeader>
  <CardContent>
    <TaskInfo task={task} />
  </CardContent>
  <CardFooter>
    <Button onClick={handleSave}>Save</Button>
  </CardFooter>
</Card>

// ❌ Bad - Too many props
<Card
  title="Task Details"
  description="View task information"
  content={<TaskInfo task={task} />}
  footer={<Button onClick={handleSave}>Save</Button>}
/>
```

### Accessibility

Always consider accessibility:

```typescript
// ✅ Good
<button
  type="button"
  aria-label="Delete task"
  onClick={handleDelete}
>
  <TrashIcon className="h-4 w-4" />
</button>

// ❌ Bad - No label
<button onClick={handleDelete}>
  <TrashIcon />
</button>
```

Use Shadcn/UI components which have built-in accessibility.

## State Management

### Server State (TanStack Query)

Use TanStack Query for all API data:

```typescript
// ✅ Good
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    staleTime: 30_000, // Cache for 30 seconds
  });
}

function TasksList() {
  const { data, isLoading } = useTasks({ status: ['in_progress'] });
  // ...
}
```

### Client State (Zustand)

Use Zustand for UI state:

```typescript
// ✅ Good - Global UI state
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

// ❌ Bad - Don't use Zustand for server data
interface TasksState {
  tasks: Task[];
  loadTasks: () => Promise<void>;
}
```

### Local Component State

Use `useState` for local state:

```typescript
// ✅ Good
function TaskFilter() {
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);

  return (
    <div>
      <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      <Select value={selectedStatus} onChange={setSelectedStatus}>
        {/* Options */}
      </Select>
    </div>
  );
}
```

## API Integration

### API Function Structure

```typescript
// src/lib/api/tasks.ts

/**
 * Get all tasks with optional filters
 */
export async function getTasks(
  params?: GetTasksParams
): Promise<PaginatedResponse<Task>> {
  const response = await apiRequest<{ tasks: Task[]; total: number }>(
    'tasks.get_all_ex',
    params
  );

  return {
    items: response.tasks || [],
    total: response.total || 0,
    returned: response.tasks?.length || 0,
  };
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: string): Promise<Task> {
  const response = await apiRequest<{ task: Task }>('tasks.get_by_id', {
    task: id,
  });

  return response.task;
}
```

### Hook Structure

```typescript
// src/lib/hooks/use-tasks.ts

/**
 * Query key factory for tasks
 */
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: GetTasksParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

/**
 * Fetch all tasks with optional filters
 */
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
    staleTime: 30_000,
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
```

## Testing Requirements

### What to Test

#### Unit Tests

- Utility functions
- Custom hooks (with `renderHook`)
- Type guards and validators
- Business logic

```typescript
// format.test.ts
import { formatDate } from './format';

describe('formatDate', () => {
  it('should format ISO date string', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBe('Jan 15, 2024');
  });

  it('should handle invalid date', () => {
    const result = formatDate('invalid');
    expect(result).toBe('Invalid Date');
  });
});
```

#### Component Tests

- User interactions
- Conditional rendering
- Error states
- Loading states

```typescript
// task-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from './task-card';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    name: 'Test Task',
    status: 'in_progress' as const,
  };

  it('should render task name', () => {
    render(<TaskCard task={mockTask} onSelect={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', async () => {
    const handleSelect = vi.fn();
    render(<TaskCard task={mockTask} onSelect={handleSelect} />);

    await userEvent.click(screen.getByRole('button'));
    expect(handleSelect).toHaveBeenCalledWith(mockTask);
  });
});
```

#### E2E Tests

- Critical user flows
- Multi-step processes
- Cross-page interactions

```typescript
// tasks.spec.ts
import { test, expect } from '@playwright/test';

test('user can create and delete a task', async ({ page }) => {
  await page.goto('/tasks');

  // Create task
  await page.click('text=Create Task');
  await page.fill('input[name="name"]', 'New Task');
  await page.click('button:has-text("Create")');

  await expect(page.locator('text=New Task')).toBeVisible();

  // Delete task
  await page.click('[aria-label="Delete task"]');
  await page.click('button:has-text("Confirm")');

  await expect(page.locator('text=New Task')).not.toBeVisible();
});
```

### Test Coverage

Aim for:
- **80%+ coverage** for utility functions
- **70%+ coverage** for hooks
- **60%+ coverage** for components
- **100% coverage** for critical paths (authentication, data mutations)

## Git Workflow

### Branch Naming

Use descriptive branch names:

```bash
# Features
feature/add-pipeline-visualization
feature/task-comparison-view

# Bug fixes
fix/task-status-update-race-condition
fix/incorrect-date-formatting

# Refactoring
refactor/simplify-task-hooks
refactor/extract-table-logic

# Documentation
docs/update-contributing-guide
docs/add-architecture-diagram
```

### Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/add-something
   ```

2. **Make changes** and commit frequently:
   ```bash
   git add .
   git commit -m "feat: add task filtering"
   ```

3. **Keep branch updated** with main:
   ```bash
   git fetch origin
   git rebase origin/main
   ```

4. **Push changes**:
   ```bash
   git push origin feature/add-something
   ```

5. **Create a Pull Request**

## Pull Request Process

### Before Creating a PR

- [ ] Run all tests: `bun run test`
- [ ] Run type check: `bun run type-check`
- [ ] Run linter: `bun run lint`
- [ ] Build succeeds: `bun run build`
- [ ] Manual testing completed
- [ ] Documentation updated

### PR Description Template

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Added task filtering by status
- Updated TaskList component to use filters
- Added TaskFilter component

## Screenshots (if applicable)

[Add screenshots here]

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Code Review

When reviewing PRs:

1. **Check functionality**: Does it work as intended?
2. **Check tests**: Are there adequate tests?
3. **Check code quality**: Is it readable and maintainable?
4. **Check types**: Is everything properly typed?
5. **Check performance**: Are there any performance concerns?
6. **Check accessibility**: Is the UI accessible?

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Simple commit
feat: add task filtering by status

# With scope
feat(tasks): add filtering by status

# With body
feat(tasks): add filtering by status

Users can now filter tasks by status (in_progress, completed, etc.)
using the new filter dropdown in the tasks list.

# Breaking change
feat(api)!: change task status enum values

BREAKING CHANGE: Task status values changed from camelCase to snake_case.
Update all existing code that references task.status.

# Multiple changes
feat(tasks): add filtering and sorting

- Add status filter dropdown
- Add sorting by date
- Add reset filters button
```

### Scope

Use the module or feature name:
- `tasks`
- `projects`
- `models`
- `datasets`
- `auth`
- `api`
- `ui`
- `docs`

## Questions?

If you have questions or need help:

1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
2. Review [MIGRATION.md](./MIGRATION.md) for migration patterns
3. Look at existing code for examples
4. Ask in the team chat or create an issue

Thank you for contributing to ClearML Web Next.js!
