# ClearML Web - Angular to Next.js Migration Guide

This document describes the migration from Angular 19 to Next.js 16 + React 19.

## Table of Contents

- [Overview](#overview)
- [Migration Phases](#migration-phases)
- [Key Differences](#key-differences)
- [Component Mapping](#component-mapping)
- [State Management Changes](#state-management-changes)
- [Styling Migration](#styling-migration)
- [Routing Changes](#routing-changes)
- [API Client Migration](#api-client-migration)
- [Forms Migration](#forms-migration)
- [Testing Migration](#testing-migration)
- [Breaking Changes](#breaking-changes)

## Overview

### Why Migrate?

The migration from Angular to Next.js was driven by several factors:

1. **Modern React Ecosystem**: Access to the latest React features (Server Components, Suspense, etc.)
2. **Better Performance**: Next.js provides superior build times and runtime performance
3. **Developer Experience**: Simpler mental model, less boilerplate, faster development
4. **Type Safety**: Improved TypeScript integration and inference
5. **Community & Libraries**: Larger ecosystem with more UI libraries and tools
6. **Bundle Size**: Smaller bundle sizes and better code splitting
7. **Flexibility**: Easier to adopt new patterns and technologies

### Migration Strategy

The migration follows an **incremental, phased approach**:

- Each phase delivers a working, deployable application
- Features are migrated one module at a time
- Both applications can coexist during migration
- No big-bang rewrite, reducing risk

## Migration Phases

### Phase 1: Foundation (Complete)

**Goal**: Set up the Next.js project with core infrastructure

**Migrated**:
- Project setup with Next.js 16 and bun
- Tailwind CSS 4.0 configuration
- TypeScript 5.8+ strict mode
- Base API client with ky
- TanStack Query setup
- Zustand stores
- Shadcn/UI component library (27+ components)
- Layout structure (Header, Sidebar)
- Theme system (light/dark mode)
- Testing infrastructure (Vitest, Playwright)

**Changes**:
- Angular CLI → Next.js + bun
- SCSS modules → Tailwind CSS
- Angular HttpClient → ky
- RxJS → TanStack Query + Zustand
- Angular Material → Shadcn/UI (Radix UI)

### Phase 2: Authentication (Complete)

**Goal**: Implement authentication system

**Migrated**:
- Login page with form validation
- Auth state management
- Token storage and refresh
- Protected routes
- Current user fetching
- Password management (change, reset)

**Changes**:
- Angular Guards → Custom hooks (useRequireAuth)
- Angular Forms → React Hook Form + Zod
- Auth Service → Auth store (Zustand) + Auth hooks (TanStack Query)
- Route guards → Layout-level auth checks

### Phase 3: Projects Module (Complete)

**Goal**: Migrate projects functionality

**Migrated**:
- Projects list page
- Project details page
- Project creation/editing
- Project statistics
- Project filtering and search

**Changes**:
- Angular Components → React functional components
- NgRx → TanStack Query
- Angular Router → Next.js App Router
- Template-driven forms → React Hook Form

### Phase 4: Tasks Module (Complete)

**Goal**: Migrate tasks functionality

**Migrated**:
- Tasks list with filtering
- Task details page with tabs
- Task info tab
- Task execution tab
- Task configuration tab
- Task artifacts tab
- Task CRUD operations
- Task actions (enqueue, stop, reset, publish)

**Changes**:
- Complex Angular components → Simplified React components
- Multiple services → Single API module + hooks
- Template complexity → JSX clarity
- Two-way binding → Controlled components

### Phase 5: Models Module (Complete)

**Goal**: Migrate models registry

**Migrated**:
- Models list
- Model details
- Model creation/editing
- Model versioning
- Model publishing

**Changes**:
- Model service → Models API + hooks
- Model state → React Query cache
- Forms → React Hook Form + Zod validation

### Phase 6: Datasets Module (Complete)

**Goal**: Migrate datasets functionality

**Migrated**:
- Datasets list
- Dataset details
- Dataset versioning
- Dataset creation/editing
- Dataset publishing

**Changes**:
- Dataset service → Datasets API + hooks
- Version history → React component
- Complex templates → Simple JSX

### Phase 7: Workers & Queues (Complete)

**Goal**: Migrate workers and queues

**Migrated**:
- Workers list with status
- Queues list
- Queue management
- Worker-queue assignment

**Changes**:
- Real-time updates → React Query polling
- Observables → Query refetching
- Service subscriptions → Query invalidation

### Phase 8: Reports Module (Complete)

**Goal**: Migrate reports functionality

**Migrated**:
- Reports list
- Report creation
- Report viewing
- Report sharing

### Phase 9: Settings Module (Complete)

**Goal**: Migrate settings and preferences

**Migrated**:
- User settings
- Theme preferences
- Profile management
- Password change

**Changes**:
- Settings service → Preferences store
- Multiple forms → Unified form handling

### Phase 10: Charts & Visualizations (Planned)

**Goal**: Migrate experiment charts

**To Migrate**:
- Plotly integration
- Metric charts
- Comparison views
- Debug samples

**Challenges**:
- Large library size
- Complex chart configurations
- Real-time updates

### Phase 11: Pipelines (Planned)

**Goal**: Migrate pipeline DAG visualization

**To Migrate**:
- DAG visualization
- Pipeline creation
- Pipeline execution
- Node configuration

**Challenges**:
- Complex graph library
- Interactive editing
- Large DAG rendering

## Key Differences

### Framework Philosophy

| Aspect | Angular | Next.js + React |
|--------|---------|-----------------|
| **Paradigm** | Object-oriented, class-based | Functional, component-based |
| **Data Flow** | Two-way binding | Unidirectional data flow |
| **State** | Services with RxJS | Hooks with React Query + Zustand |
| **Rendering** | Template syntax | JSX |
| **Modularity** | NgModules | ES modules |
| **Dependency Injection** | Built-in DI system | React Context + hooks |

### Component Model

**Angular**:
```typescript
@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent implements OnInit {
  @Input() task: Task;
  @Output() taskSelected = new EventEmitter<Task>();

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize
  }

  selectTask() {
    this.taskSelected.emit(this.task);
  }
}
```

**React**:
```typescript
interface TaskCardProps {
  task: Task;
  onTaskSelected: (task: Task) => void;
}

export function TaskCard({ task, onTaskSelected }: TaskCardProps) {
  return (
    <Card onClick={() => onTaskSelected(task)}>
      <CardHeader>
        <CardTitle>{task.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <TaskStatus status={task.status} />
      </CardContent>
    </Card>
  );
}
```

### State Management

**Angular (NgRx)**:
```typescript
// Actions
export const loadTasks = createAction('[Tasks] Load Tasks');
export const loadTasksSuccess = createAction(
  '[Tasks] Load Tasks Success',
  props<{ tasks: Task[] }>()
);

// Reducer
export const tasksReducer = createReducer(
  initialState,
  on(loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
  }))
);

// Effects
@Injectable()
export class TasksEffects {
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTasks),
      switchMap(() =>
        this.taskService.getTasks().pipe(
          map(tasks => loadTasksSuccess({ tasks })),
          catchError(error => of(loadTasksFailure({ error })))
        )
      )
    )
  );
}

// Component
@Component({...})
export class TasksComponent {
  tasks$ = this.store.select(selectAllTasks);

  constructor(private store: Store) {
    this.store.dispatch(loadTasks());
  }
}
```

**React (TanStack Query)**:
```typescript
// API function
export async function getTasks(params?: GetTasksParams) {
  const response = await apiClient.post('tasks.get_all_ex', { json: params });
  return response.json();
}

// Hook
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
  });
}

// Component
export function TasksList() {
  const { data, isLoading, error } = useTasks();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{data.items.map(task => <TaskCard task={task} />)}</div>;
}
```

**Benefits of React approach**:
- Less boilerplate (no actions, reducers, effects)
- Automatic caching and background updates
- Built-in loading and error states
- Simpler debugging

## Component Mapping

### UI Components

| Angular Material | Shadcn/UI (Radix UI) | Notes |
|------------------|----------------------|-------|
| `mat-button` | `Button` | More variant options |
| `mat-card` | `Card` | Compound component pattern |
| `mat-dialog` | `Dialog` | Better accessibility |
| `mat-form-field` | `Input`, `Label` | Separate components |
| `mat-select` | `Select` | Similar API |
| `mat-checkbox` | `Checkbox` | Simpler API |
| `mat-radio-button` | `RadioGroup` | Compound pattern |
| `mat-slider` | `Slider` | Similar functionality |
| `mat-table` | `Table` | More flexible |
| `mat-tabs` | `Tabs` | Similar API |
| `mat-tooltip` | `Tooltip` | Better positioning |
| `mat-menu` | `DropdownMenu` | Similar API |
| `mat-snackbar` | `Toast` | Queue support |
| `mat-progress-bar` | `Progress` | Similar API |
| `mat-spinner` | `Skeleton` | Better UX |

### Form Components

**Angular Template-Driven**:
```html
<form #taskForm="ngForm" (ngSubmit)="onSubmit()">
  <mat-form-field>
    <mat-label>Task Name</mat-label>
    <input matInput [(ngModel)]="task.name" name="name" required>
    <mat-error *ngIf="taskForm.controls.name?.errors?.required">
      Name is required
    </mat-error>
  </mat-form-field>

  <button mat-raised-button type="submit" [disabled]="!taskForm.valid">
    Create
  </button>
</form>
```

**React Hook Form + Zod**:
```typescript
const taskSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string(),
  project: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

function CreateTaskForm() {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const createTask = useCreateTask();

  const onSubmit = (data: TaskFormData) => {
    createTask.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={!form.formState.isValid}>
          Create
        </Button>
      </form>
    </Form>
  );
}
```

**Benefits**:
- Type-safe form data
- Schema validation
- Better error handling
- No template complexity

## Styling Migration

### SCSS to Tailwind CSS

**Angular (SCSS)**:
```scss
// task-card.component.scss
.task-card {
  padding: 16px;
  border-radius: 8px;
  background-color: var(--background);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .task-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--foreground);
    margin-bottom: 8px;
  }

  .task-status {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;

    &.status-completed {
      background-color: var(--success);
      color: white;
    }
  }
}
```

**React (Tailwind CSS)**:
```typescript
export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="p-4 rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {task.name}
      </h3>
      <Badge
        variant="default"
        className={cn(
          'text-xs',
          task.status === 'completed' && 'bg-green-500'
        )}
      >
        {task.status}
      </Badge>
    </div>
  );
}
```

**Benefits**:
- No CSS files to maintain
- Consistent spacing and sizing
- Responsive utilities built-in
- Purged unused styles
- Smaller bundle size

### Theme Variables

**Angular**:
```scss
// _theme.scss
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #2196f3;
  --secondary: #9e9e9e;
}

[data-theme='dark'] {
  --background: #1a1a1a;
  --foreground: #ffffff;
}
```

**React (Tailwind)**:
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
  }
}
```

## Routing Changes

### Route Configuration

**Angular**:
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/:id',
    component: TaskDetailsComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'info', component: TaskInfoComponent },
      { path: 'execution', component: TaskExecutionComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**Next.js**:
```
app/
├── (dashboard)/
│   ├── layout.tsx          # Auth check happens here
│   ├── tasks/
│   │   ├── page.tsx        # /tasks
│   │   └── [taskId]/
│   │       ├── page.tsx    # /tasks/:id (redirects to info)
│   │       ├── info/
│   │       │   └── page.tsx
│   │       └── execution/
│   │           └── page.tsx
```

**Benefits**:
- File-system based routing
- Automatic code splitting
- Nested layouts
- Parallel routes
- Loading states

### Navigation

**Angular**:
```typescript
constructor(private router: Router) {}

navigateToTask(id: string) {
  this.router.navigate(['/tasks', id]);
}
```

**React**:
```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Declarative
<Link href={`/tasks/${id}`}>View Task</Link>

// Imperative
const router = useRouter();
router.push(`/tasks/${id}`);
```

### Route Guards

**Angular**:
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
```

**React**:
```typescript
// In layout
export default function DashboardLayout({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <div>{children}</div>;
}

// Or use hook in pages
function TasksPage() {
  useRequireAuth(); // Redirects if not authenticated
  // ...
}
```

## API Client Migration

### HTTP Client

**Angular (HttpClient)**:
```typescript
@Injectable()
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(params?: GetTasksParams): Observable<Task[]> {
    return this.http.post<{ tasks: Task[] }>(
      `${environment.apiUrl}/tasks.get_all_ex`,
      params
    ).pipe(
      map(response => response.tasks),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error(error.message));
  }
}
```

**React (ky + TanStack Query)**:
```typescript
// API function
export async function getTasks(params?: GetTasksParams): Promise<Task[]> {
  const response = await apiClient.post('tasks.get_all_ex', {
    json: params,
  }).json<{ tasks: Task[] }>();

  return response.tasks;
}

// Hook
export function useTasks(params?: GetTasksParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => getTasks(params),
    staleTime: 30_000,
  });
}
```

**Benefits**:
- Simpler API (no observables for basic requests)
- Automatic caching
- Background refetching
- Request deduplication
- Optimistic updates

### Interceptors

**Angular**:
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.auth.getToken();

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(req);
  }
}
```

**React (ky hooks)**:
```typescript
export const apiClient = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAuthToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          window.location.href = '/login';
        }
        return response;
      },
    ],
  },
});
```

## Forms Migration

### Form Validation

**Angular (Template-driven)**:
```typescript
@Component({...})
export class TaskFormComponent {
  task: Task = {
    name: '',
    type: '',
    project: '',
  };

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.taskService.createTask(this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => console.error(err)
      });
    }
  }
}
```

```html
<form #taskForm="ngForm" (ngSubmit)="onSubmit(taskForm)">
  <mat-form-field>
    <input
      matInput
      [(ngModel)]="task.name"
      name="name"
      required
      minlength="3"
    >
    <mat-error *ngIf="taskForm.controls.name?.errors?.required">
      Required
    </mat-error>
  </mat-form-field>
</form>
```

**React (React Hook Form + Zod)**:
```typescript
const taskSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['training', 'testing', 'inference']),
  project: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

function TaskForm() {
  const router = useRouter();
  const createTask = useCreateTask();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      type: 'training',
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    await createTask.mutateAsync(data);
    router.push('/tasks');
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Task Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button type="submit" disabled={form.formState.isSubmitting}>
        Create Task
      </Button>
    </form>
  );
}
```

**Benefits**:
- Type-safe form data
- Schema-based validation
- Better error messages
- Easier testing

## Testing Migration

### Unit Tests

**Angular (Jasmine + Karma)**:
```typescript
describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch tasks', () => {
    const mockTasks = [{ id: '1', name: 'Task 1' }];

    service.getTasks().subscribe(tasks => {
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/tasks.get_all_ex`);
    req.flush({ tasks: mockTasks });
  });
});
```

**React (Vitest + React Testing Library)**:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTasks } from './use-tasks';

describe('useTasks', () => {
  it('should fetch tasks', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useTasks(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(10);
  });
});
```

### Component Tests

**Angular**:
```typescript
describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskCardComponent]
    });

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
  });

  it('should display task name', () => {
    component.task = { id: '1', name: 'My Task' };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.task-title').textContent).toContain('My Task');
  });
});
```

**React**:
```typescript
import { render, screen } from '@testing-library/react';
import { TaskCard } from './task-card';

describe('TaskCard', () => {
  it('should display task name', () => {
    const task = { id: '1', name: 'My Task', status: 'created' };
    render(<TaskCard task={task} onSelect={() => {}} />);

    expect(screen.getByText('My Task')).toBeInTheDocument();
  });
});
```

## Breaking Changes

### What Changed

1. **No More Services**: All Angular services replaced with API functions + hooks
2. **No More RxJS** (for most cases): Observables replaced with Promises + React Query
3. **No More Decorators**: No `@Component`, `@Injectable`, `@Input`, `@Output`
4. **No More Templates**: HTML templates replaced with JSX
5. **No More NgModules**: ES modules + Next.js app structure
6. **No More Lifecycle Hooks**: React hooks replace Angular lifecycle
7. **No More Dependency Injection**: React Context + hooks

### Migration Patterns

#### Pattern 1: Service → API Module + Hook

**Before (Angular)**:
```typescript
// task.service.ts
@Injectable()
export class TaskService {
  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }
}

// task-list.component.ts
@Component({...})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]>;

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();
  }
}
```

**After (React)**:
```typescript
// api/tasks.ts
export async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get('tasks');
  return response.json();
}

// hooks/use-tasks.ts
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });
}

// components/task-list.tsx
export function TaskList() {
  const { data: tasks, isLoading } = useTasks();

  if (isLoading) return <Skeleton />;

  return <div>{tasks.map(task => <TaskCard task={task} />)}</div>;
}
```

#### Pattern 2: Component Communication

**Before (Angular)**:
```typescript
// Parent
@Component({
  template: '<app-task-card [task]="task" (taskSelected)="onSelect($event)">'
})
export class ParentComponent {
  onSelect(task: Task) {
    console.log('Selected:', task);
  }
}

// Child
@Component({...})
export class TaskCardComponent {
  @Input() task: Task;
  @Output() taskSelected = new EventEmitter<Task>();

  onClick() {
    this.taskSelected.emit(this.task);
  }
}
```

**After (React)**:
```typescript
// Parent
function Parent() {
  const handleSelect = (task: Task) => {
    console.log('Selected:', task);
  };

  return <TaskCard task={task} onSelect={handleSelect} />;
}

// Child
interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

function TaskCard({ task, onSelect }: TaskCardProps) {
  return (
    <div onClick={() => onSelect(task)}>
      {task.name}
    </div>
  );
}
```

#### Pattern 3: Shared State

**Before (Angular)**:
```typescript
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private selectedTaskSubject = new BehaviorSubject<Task | null>(null);
  selectedTask$ = this.selectedTaskSubject.asObservable();

  selectTask(task: Task) {
    this.selectedTaskSubject.next(task);
  }
}
```

**After (React)**:
```typescript
// Zustand store
interface AppState {
  selectedTask: Task | null;
  selectTask: (task: Task) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedTask: null,
  selectTask: (task) => set({ selectedTask: task }),
}));

// Usage
function Component() {
  const { selectedTask, selectTask } = useAppStore();
  // ...
}
```

## Lessons Learned

### What Went Well

1. **TanStack Query**: Eliminated tons of boilerplate for data fetching
2. **Tailwind CSS**: Faster styling, smaller bundle, better consistency
3. **TypeScript Inference**: Less need for explicit types
4. **Component Simplicity**: Functional components are easier to understand
5. **Testing**: Simpler tests with less mocking needed
6. **Developer Experience**: Faster development, better tooling

### Challenges

1. **Learning Curve**: Team needed time to learn React patterns
2. **Migration Effort**: Significant time investment
3. **Parallel Development**: Managing two codebases temporarily
4. **API Compatibility**: Ensuring both apps work with same API
5. **Feature Parity**: Matching all Angular features
6. **Complex Components**: Some Angular components were harder to migrate

### Best Practices

1. **Start Small**: Begin with simple features
2. **Test Thoroughly**: Write tests before and after migration
3. **Document Changes**: Keep migration notes
4. **Incremental Approach**: Migrate module by module
5. **Type Safety**: Use TypeScript strictly
6. **Code Review**: Review all migrated code
7. **Performance**: Measure and compare performance

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

This migration guide will continue to evolve as we complete the remaining phases.
