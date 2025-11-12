# Changelog

All notable changes to the ClearML Web Next.js migration project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2024-11-11

### Phase 1 - Foundation

#### Added
- Next.js 16 project setup with App Router
- Bun package manager configuration
- TypeScript 5.8+ with strict mode enabled
- Tailwind CSS 4.0 with custom theme configuration
- ESLint and Prettier configuration
- Vitest for unit testing
- Playwright for E2E testing
- React Testing Library for component testing

#### Infrastructure
- **API Client** (`src/lib/api/client.ts`)
  - ky-based HTTP client with automatic authentication
  - Request/response interceptors
  - Error handling and 401 redirect
  - Token management (localStorage and cookies)

- **State Management**
  - TanStack Query v5 for server state
  - Zustand stores for client state
  - Query client configuration with default options

- **Type System** (`src/types/api.ts`)
  - Comprehensive TypeScript type definitions
  - API response types (Task, Project, Model, Dataset, etc.)
  - Pagination and filtering types
  - Discriminated unions for status types

#### UI Components (Shadcn/UI)
Added 27+ base UI components:
- Layout: `Card`, `Separator`, `Tabs`, `ScrollArea`
- Forms: `Input`, `Label`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `Form`
- Navigation: `Breadcrumb`, `DropdownMenu`, `Popover`
- Feedback: `Alert`, `Toast`, `Dialog`, `Progress`, `Skeleton`
- Data Display: `Table`, `Avatar`, `Badge`, `Tooltip`
- Buttons: `Button` with multiple variants

#### Layout Components
- **Header** (`src/components/layout/header.tsx`)
  - Top navigation bar
  - User profile dropdown
  - Theme toggle
  - Breadcrumb navigation

- **Sidebar** (`src/components/layout/sidebar.tsx`)
  - Collapsible navigation
  - Active route highlighting
  - Icon-based navigation items
  - Responsive behavior

- **Theme System**
  - next-themes integration
  - Light and dark mode support
  - System preference detection
  - Persistent theme selection

### Phase 2 - Authentication System

#### Added
- **Login Page** (`src/app/(auth)/login/page.tsx`)
  - Login form with validation
  - Remember me functionality
  - Error handling and display
  - Redirect after login

- **Auth API** (`src/lib/api/auth.ts`)
  - `login()` - Authenticate with credentials
  - `logout()` - End user session
  - `getCurrentUser()` - Fetch current user
  - `refreshToken()` - Refresh auth token
  - `validateToken()` - Check token validity
  - `changePassword()` - Update user password
  - `requestPasswordReset()` - Request password reset email
  - `resetPassword()` - Reset password with token

- **Auth Store** (`src/lib/stores/auth.ts`)
  - User state management
  - Token persistence
  - Remember me functionality
  - Logout with state cleanup

- **Auth Hooks** (`src/lib/hooks/use-auth.ts`)
  - `useAuth()` - Access auth state and actions
  - `useLogin()` - Login mutation
  - `useLogout()` - Logout mutation
  - `useCurrentUser()` - Fetch current user
  - `useRequireAuth()` - Protect routes
  - `useRedirectIfAuthenticated()` - Redirect logged-in users
  - `useChangePassword()` - Change password mutation
  - `useRequestPasswordReset()` - Request reset mutation
  - `useResetPassword()` - Reset password mutation

#### Changed
- Added authentication checks to dashboard layout
- Implemented route protection
- Added auth token to API requests automatically

### Phase 3 - Projects Module

#### Added
- **Projects Pages**
  - Projects list (`src/app/(dashboard)/projects/page.tsx`)
  - Project details (`src/app/(dashboard)/projects/[projectId]/page.tsx`)

- **Projects API** (`src/lib/api/projects.ts`)
  - `getProjects()` - Fetch all projects with filters
  - `getProjectById()` - Get single project
  - `createProject()` - Create new project
  - `updateProject()` - Update existing project
  - `deleteProject()` - Delete project
  - `getProjectStats()` - Get project statistics

- **Projects Hooks** (`src/lib/hooks/use-projects.ts`)
  - `useProjects()` - Query projects list
  - `useProject()` - Query single project
  - `useCreateProject()` - Create mutation
  - `useUpdateProject()` - Update mutation
  - `useDeleteProject()` - Delete mutation
  - `useProjectStats()` - Query project stats

- **Projects Components** (`src/components/features/projects/`)
  - `ProjectsList` - Display projects with filters
  - `ProjectCard` - Individual project card
  - `ProjectFilters` - Filter and search projects
  - `ProjectForm` - Create/edit project form
  - `ProjectStats` - Display project statistics

#### Features
- Project search and filtering
- Project creation with validation
- Project editing and deletion
- Project statistics display (task counts by status)
- Tag management

### Phase 4 - Tasks Module

#### Added
- **Tasks Pages**
  - Tasks list (`src/app/(dashboard)/tasks/page.tsx`)
  - Task details layout (`src/app/(dashboard)/tasks/[taskId]/page.tsx`)
  - Task info tab (`src/app/(dashboard)/tasks/[taskId]/info/page.tsx`)
  - Task execution tab (`src/app/(dashboard)/tasks/[taskId]/execution/page.tsx`)
  - Task configuration tab (`src/app/(dashboard)/tasks/[taskId]/configuration/page.tsx`)
  - Task artifacts tab (`src/app/(dashboard)/tasks/[taskId]/artifacts/page.tsx`)

- **Tasks API** (`src/lib/api/tasks.ts`)
  - `getTasks()` - Fetch all tasks with filters
  - `getTaskById()` - Get single task
  - `createTask()` - Create new task
  - `updateTask()` - Update existing task
  - `deleteTask()` - Delete task
  - `enqueueTask()` - Add task to queue
  - `dequeueTask()` - Remove task from queue
  - `stopTask()` - Stop running task
  - `resetTask()` - Reset task state
  - `publishTask()` - Publish task

- **Tasks Hooks** (`src/lib/hooks/use-tasks.ts`)
  - `useTasks()` - Query tasks list
  - `useTask()` - Query single task
  - `useCreateTask()` - Create mutation
  - `useUpdateTask()` - Update mutation
  - `useDeleteTask()` - Delete mutation
  - `useEnqueueTask()` - Enqueue mutation
  - `useStopTask()` - Stop mutation
  - `useResetTask()` - Reset mutation
  - `usePublishTask()` - Publish mutation

- **Tasks Components** (`src/components/features/tasks/`)
  - `TasksList` - Display tasks with filters
  - `TaskCard` - Individual task card
  - `TaskFilters` - Advanced filtering UI
  - `TaskStatusBadge` - Status indicator with colors
  - `TaskForm` - Create/edit task form
  - `TaskInfo` - Task information display
  - `TaskExecution` - Execution details
  - `TaskConfiguration` - Configuration viewer
  - `TaskArtifacts` - Artifacts manager

#### Features
- Advanced task filtering (status, type, project, tags, text search)
- Task status badges with color coding
- Task CRUD operations
- Task lifecycle management (enqueue, stop, reset, publish)
- Tabbed task details view
- Task execution parameters display
- Task configuration viewing
- Task artifacts management

### Phase 5 - Models Module

#### Added
- **Models Pages**
  - Models list (`src/app/(dashboard)/models/page.tsx`)
  - Model details (`src/app/(dashboard)/models/[modelId]/page.tsx`)

- **Models API** (`src/lib/api/models.ts`)
  - `getModels()` - Fetch all models with filters
  - `getModelById()` - Get single model
  - `createModel()` - Create new model
  - `updateModel()` - Update existing model
  - `deleteModel()` - Delete model
  - `publishModel()` - Publish model

- **Models Hooks** (`src/lib/hooks/use-models.ts`)
  - `useModels()` - Query models list
  - `useModel()` - Query single model
  - `useCreateModel()` - Create mutation
  - `useUpdateModel()` - Update mutation
  - `useDeleteModel()` - Delete mutation
  - `usePublishModel()` - Publish mutation

- **Models Components** (`src/components/features/models/`)
  - `ModelsList` - Display models with filters
  - `ModelCard` - Individual model card
  - `ModelFilters` - Filter models
  - `ModelForm` - Create/edit model form
  - `ModelDetails` - Detailed model information

#### Features
- Model registry with search and filtering
- Model creation and editing
- Model framework detection (PyTorch, TensorFlow, etc.)
- Model versioning support
- Model publishing workflow
- Model URI and artifact management
- Model-task lineage tracking

### Phase 6 - Datasets Module

#### Added
- **Datasets Pages**
  - Datasets list (`src/app/(dashboard)/datasets/page.tsx`)
  - Dataset details (`src/app/(dashboard)/datasets/[datasetId]/page.tsx`)

- **Datasets API** (`src/lib/api/datasets.ts`)
  - `getDatasets()` - Fetch all datasets with filters
  - `getDatasetById()` - Get single dataset
  - `createDataset()` - Create new dataset
  - `updateDataset()` - Update existing dataset
  - `deleteDataset()` - Delete dataset
  - `getDatasetVersions()` - Get dataset version history
  - `publishDataset()` - Publish dataset
  - `getDatasetStats()` - Get dataset statistics

- **Datasets Hooks** (`src/lib/hooks/use-datasets.ts`)
  - `useDatasets()` - Query datasets list
  - `useDataset()` - Query single dataset
  - `useCreateDataset()` - Create mutation
  - `useUpdateDataset()` - Update mutation
  - `useDeleteDataset()` - Delete mutation
  - `useDatasetVersions()` - Query versions
  - `usePublishDataset()` - Publish mutation

- **Datasets Components** (`src/components/features/datasets/`)
  - `DatasetsList` - Display datasets with filters
  - `DatasetCard` - Individual dataset card
  - `DatasetFilters` - Filter datasets
  - `DatasetForm` - Create/edit dataset form
  - `DatasetVersions` - Version history display
  - `DatasetStats` - Statistics display

#### Features
- Dataset management with versioning
- Dataset creation and editing
- Parent-child dataset relationships
- Dataset statistics (size, file count)
- Dataset publishing workflow
- Dataset metadata viewing and editing
- Version history tracking

### Phase 7 - Workers & Queues Module

#### Added
- **Workers & Queues Pages**
  - Workers list (`src/app/(dashboard)/workers/page.tsx`)
  - Queues list (`src/app/(dashboard)/queues/page.tsx`)

- **Workers API** (`src/lib/api/workers.ts`)
  - `getWorkers()` - Fetch all workers with filters
  - `getWorkerById()` - Get single worker
  - `getWorkerStats()` - Get worker statistics

- **Queues API** (`src/lib/api/queues.ts`)
  - `getQueues()` - Fetch all queues with filters
  - `getQueueById()` - Get single queue
  - `createQueue()` - Create new queue
  - `updateQueue()` - Update existing queue
  - `deleteQueue()` - Delete queue

- **Workers Hooks** (`src/lib/hooks/use-workers.ts`)
  - `useWorkers()` - Query workers list
  - `useWorker()` - Query single worker
  - `useWorkerStats()` - Query worker stats

- **Queues Hooks** (`src/lib/hooks/use-queues.ts`)
  - `useQueues()` - Query queues list
  - `useQueue()` - Query single queue
  - `useCreateQueue()` - Create mutation
  - `useUpdateQueue()` - Update mutation
  - `useDeleteQueue()` - Delete mutation

- **Workers & Queues Components** (`src/components/features/workers/`, `src/components/features/queues/`)
  - `WorkersList` - Display workers with status
  - `WorkerCard` - Individual worker card
  - `WorkerStatus` - Status indicator
  - `QueuesList` - Display queues
  - `QueueCard` - Individual queue card
  - `QueueForm` - Create/edit queue form

#### Features
- Workers list with activity status
- Worker details with current task
- Worker last activity tracking
- Queue management (CRUD operations)
- Queue-worker associations
- Task queue assignment

### Phase 8 - Reports Module

#### Added
- **Reports Page**
  - Reports list (`src/app/(dashboard)/reports/page.tsx`)

- **Reports Components** (`src/components/features/reports/`)
  - `ReportsList` - Display reports
  - `ReportCard` - Individual report card
  - `ReportViewer` - View report content

#### Features
- Reports list with filtering
- Report creation from tasks
- Report viewing with rich content
- Report sharing capabilities

### Phase 9 - Settings Module

#### Added
- **Settings Page**
  - Settings page (`src/app/(dashboard)/settings/page.tsx`)

- **Preferences Store** (`src/lib/stores/preferences.ts`)
  - User preferences management
  - Theme preferences
  - Notification settings
  - Persistent storage

#### Features
- User profile management
- Theme settings (light/dark)
- Password change functionality
- Notification preferences
- Avatar support

### Phase 10 - Utilities & Helpers

#### Added
- **Chart Utilities** (`src/lib/utils/charts.ts`)
  - Color palette generators
  - Number formatting (K, M, B suffixes)
  - Percentage formatting
  - Date formatting for charts
  - Trend calculation
  - Data aggregation by time period
  - Data smoothing (moving average)
  - Tick generation for axes

- **Class Name Utility** (`src/lib/utils/cn.ts`)
  - Tailwind class merging
  - Conditional class handling
  - clsx integration

### Dependencies Added

#### Core
- `next@^16.0.1` - React framework
- `react@^19.2.0` - UI library
- `react-dom@^19.2.0` - React DOM renderer
- `typescript@^5` - Type safety

#### Styling
- `tailwindcss@^4.1.17` - Utility-first CSS framework
- `tailwindcss-animate@^1.0.7` - Animation utilities
- `tailwind-merge@^3.4.0` - Class name merging
- `next-themes@^0.4.6` - Theme management
- `class-variance-authority@^0.7.1` - Component variants
- `clsx@^2.1.1` - Class name composition

#### State Management & Data Fetching
- `@tanstack/react-query@^5.90.7` - Server state management
- `@tanstack/react-table@^8.21.3` - Table utilities
- `zustand@^5.0.8` - Client state management
- `ky@^1.14.0` - HTTP client

#### Forms & Validation
- `react-hook-form@^7.66.0` - Form management
- `@hookform/resolvers@^5.2.2` - Form validators
- `zod@^4.1.12` - Schema validation

#### UI Components (Radix UI)
- `@radix-ui/react-avatar@^1.1.11`
- `@radix-ui/react-checkbox@^1.3.3`
- `@radix-ui/react-dialog@^1.1.15`
- `@radix-ui/react-dropdown-menu@^2.1.16`
- `@radix-ui/react-label@^2.1.8`
- `@radix-ui/react-popover@^1.1.15`
- `@radix-ui/react-radio-group@^1.3.8`
- `@radix-ui/react-scroll-area@^1.2.10`
- `@radix-ui/react-select@^2.2.6`
- `@radix-ui/react-separator@^1.1.8`
- `@radix-ui/react-slider@^1.3.6`
- `@radix-ui/react-slot@^1.2.4`
- `@radix-ui/react-switch@^1.2.6`
- `@radix-ui/react-tabs@^1.1.13`
- `@radix-ui/react-tooltip@^1.2.8`

#### Utilities
- `lucide-react@^0.553.0` - Icon library
- `date-fns@^4.1.0` - Date utilities
- `framer-motion@^12.23.24` - Animation library
- `nuqs@^2.7.3` - URL state management

#### Testing
- `vitest@^4.0.8` - Unit test runner
- `@vitejs/plugin-react@^5.1.0` - React plugin for Vite
- `@testing-library/react@^16.3.0` - React testing utilities
- `@testing-library/jest-dom@^6.9.1` - Jest DOM matchers
- `@playwright/test@^1.56.1` - E2E testing
- `jsdom@^27.1.0` - DOM implementation for Node

#### Development
- `@types/node@^24.10.0`
- `@types/react@^19.2.2`
- `@types/react-dom@^19.2.2`
- `@types/bun@latest`
- `autoprefixer@^10.4.22`
- `postcss@^8.5.6`

## Migration Changes

### Removed (from Angular)
- Angular 19 framework
- Angular Material components
- RxJS (mostly replaced with React Query)
- NgRx for state management
- Angular HttpClient
- Angular Forms module
- Angular Router
- SCSS modules
- Jasmine/Karma testing
- All Angular-specific decorators and metadata

### Changed Architecture
- **Component Model**: Class-based → Functional components
- **State Management**: NgRx → TanStack Query + Zustand
- **Routing**: Angular Router → Next.js App Router
- **Styling**: SCSS modules → Tailwind CSS
- **Forms**: Angular Forms → React Hook Form + Zod
- **HTTP**: HttpClient + RxJS → ky + Promises
- **Testing**: Jasmine/Karma → Vitest + Playwright
- **Build**: Angular CLI → Next.js
- **Package Manager**: npm/yarn → Bun

### Breaking Changes
- All Angular services converted to API functions + hooks
- All RxJS observables converted to Promises + React Query
- All Angular components converted to React functional components
- All template files (.html) converted to JSX
- All SCSS files removed, styles moved to Tailwind classes
- Route structure changed to Next.js file-based routing
- Dependency injection replaced with React Context and hooks

## Documentation Added

- **README.md** - Comprehensive project overview with:
  - Complete feature list with all 9+ modules
  - Installation and setup instructions
  - API configuration details
  - Deployment instructions (Vercel, Docker, Static)
  - Troubleshooting guide
  - Development workflow

- **ARCHITECTURE.md** - Technical architecture documentation:
  - Project structure explanation
  - State management strategy
  - API client design patterns
  - Component organization guidelines
  - Routing structure details
  - Type system overview
  - Performance optimization techniques
  - Testing strategy
  - Security considerations
  - Accessibility guidelines

- **MIGRATION.md** - Migration guide:
  - Phase-by-phase migration breakdown
  - Key differences between Angular and React
  - Component mapping (Angular Material → Shadcn/UI)
  - State management changes (NgRx → TanStack Query + Zustand)
  - Styling changes (SCSS → Tailwind CSS)
  - Routing changes (Angular Router → Next.js App Router)
  - API client migration patterns
  - Forms migration guide
  - Testing migration
  - Breaking changes list
  - Migration patterns and examples

- **CONTRIBUTING.md** - Contribution guidelines:
  - Development setup instructions
  - Code style guide (TypeScript, React, Tailwind)
  - Component creation guidelines
  - State management patterns
  - API integration patterns
  - Testing requirements
  - Git workflow
  - PR process and template
  - Commit message conventions (Conventional Commits)

- **API.md** - API integration documentation:
  - API client configuration
  - Authentication flow details
  - Complete API endpoints reference
  - Type definitions
  - Error handling strategies
  - Usage examples (queries, mutations, optimistic updates)
  - Best practices

- **CHANGELOG.md** - This file

### JSDoc Comments
Added comprehensive JSDoc comments to:
- All API functions in `src/lib/api/`
- All custom hooks in `src/lib/hooks/`
- Utility functions in `src/lib/utils/`
- Complex components in `src/components/features/`

## Future Phases

### Phase 10 - Charts & Visualizations (Planned)
- Plotly integration for experiment metrics
- Interactive charts for model performance
- Comparison views for experiments
- Debug samples visualization
- Hyperparameter optimization plots

### Phase 11 - Pipelines (Planned)
- Pipeline DAG visualization
- Pipeline creation and editing
- Pipeline execution monitoring
- Node configuration
- Pipeline versioning

### Phase 12 - Advanced Features (Planned)
- Real-time updates via WebSocket
- Advanced data tables with TanStack Table
- Code editor integration (Monaco)
- Offline support with service workers
- Performance optimizations
- Complete E2E test coverage

## Notes

This migration represents a complete rewrite of the ClearML Web frontend from Angular to Next.js + React. The new stack provides:

- **Better Performance**: Faster load times, smaller bundles, better caching
- **Modern DX**: Simpler component model, less boilerplate, better tooling
- **Type Safety**: Improved TypeScript integration and inference
- **Ecosystem**: Access to larger React ecosystem and libraries
- **Maintainability**: Clearer code structure, easier to understand and modify

All features from the Angular application have been successfully migrated or are planned for migration in future phases.

---

**Migration Team**: This project was migrated incrementally over multiple phases to minimize risk and ensure continuous deployment capability.

**Testing**: Each phase included comprehensive testing (unit, integration, E2E) before moving to the next phase.

**Documentation**: Complete documentation ensures knowledge transfer and maintainability.
