# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClearML Web Application - An Angular-based web UI for the ClearML machine learning operations platform. Built with Angular 20, NgRx for state management, and uses Bun as the runtime.

## Build & Development Commands

### Installation
```bash
npm ci  # Install dependencies
```

### Development Server
```bash
npm run start      # Start dev server with proxy (default port 4200)
npm run hmr        # Start with hot module replacement
npm run start-widgets  # Start widgets server (port 4201)
```

**Important**: Update `proxy.config.mjs` line 3 with your API server URI before starting development.

### Build
```bash
npm run build       # Production build with source maps
npm run build-dev   # Development build without CSS extraction
npm run build-widgets  # Build report widgets
```

### Testing & Quality
```bash
npm run test        # Run unit tests
npm run lint        # Run ESLint
npm run e2e         # Run e2e tests (port 4300)
```

### Other
```bash
npm run bundle-report  # Analyze bundle size
npm run submodule      # Update git submodules
```

## Architecture

### Module Structure

The application follows a strict modular architecture with three main layers:

#### 1. Business Logic Module (`src/app/business-logic/`)
- **Purpose**: ClearML-specific logic, API calls, and domain objects (tasks, models, etc.)
- **Key Components**:
  - `api-services/`: API client services (e.g., `tasks.service.ts`, `models.service.ts`)
  - `services/`: Business logic services (prefixed with `Bl`, e.g., `BlTasksService`)
  - `model/`: Type definitions for ClearML domain objects
- **Dependencies**: No UI dependencies, only NgRx
- **Example**: `isTaskHidden()` logic, task API calls

#### 2. Core Module (`src/app/core/`)
- **Purpose**: Application-wide utilities and state management
- **Contains**:
  - `actions/`: NgRx action definitions
  - `effects/`: NgRx effects for side effects and data flow
  - `reducers/`: State composition functions
  - `services/`: Utility services (e.g., `*.service.ts`)
  - `models/`: Core type definitions
- **Dependencies**: Only NgRx, no UI components
- **No Declarations**: This module only provides logic

#### 3. Feature Modules (`src/app/features/` and `src/app/webapp-common/`)

Each feature follows this structure:
- `<feature>.module.ts` - Feature module definition
- `<feature>.component.ts/html/scss` - Main feature component
- `containers/` - Smart components (connect to NgRx store, dispatch actions)
- `dumb/` - Presentational components (stateless, inputs/outputs only)
- `actions/` - Feature-specific NgRx actions
- `effects/` - Feature-specific NgRx effects
- `reducers/` - Feature-specific reducers
- `services/` - Feature-specific services
- `<feature>.utils.ts` - Pure utility functions
- `<feature>.const.ts` - Constants
- `<feature>.model.ts` - Type definitions and interfaces

**Key Features**:
- `experiments/` - Experiment management, including lineage visualization
- `models/` - Model management
- `projects/` - Project hierarchy and management
- `dashboard/` - Main dashboard
- `pipelines/` - Pipeline orchestration
- `workers-and-queues/` - Worker and queue management

#### 4. Shared Module (`src/app/webapp-common/shared/`)
- **Purpose**: Reusable UI components, directives, and pipes
- **Contains**: Only declarations (components, directives, pipes)
- **Rule**: All components must be reusable across features

### Path Aliases

Configure in `tsconfig.json`:
- `@common/*` → `src/app/webapp-common/*`
- `~/*` → `src/app/*`

Always use these aliases for imports.

### State Management (NgRx)

The application uses NgRx for state management following the Redux pattern:

1. **Actions** (`*.actions.ts`): Define what can happen
2. **Reducers** (`*.reducer.ts`): Define how state changes
3. **Effects** (`*.effects.ts`): Handle side effects (API calls, routing)
4. **Selectors**: Query state (defined in reducer files or separate selector files)

**Modern Angular Patterns**:
- Uses Angular Signals alongside NgRx where appropriate
- `store.selectSignal()` for reactive signal-based state
- `computed()` for derived state
- `signal()` for local component state

### API Proxy Configuration

Development uses `proxy.config.mjs` to proxy API requests:
- Proxies `/service/{n}/api` to configured backend servers
- Update `targets` array (line 3) with your API server URLs
- Multiple servers supported - enumeration matches `apiBaseUrl` in `environment.ts`

## Component Patterns

### Container vs. Dumb Components

**Container Components** (`containers/`):
- Connect to NgRx store via `store.select()` or `store.selectSignal()`
- Dispatch actions
- Handle business logic
- Pass data down to dumb components
- Example: `experiment-info-lineage.component.ts`

**Dumb Components** (`dumb/`):
- Receive data via `@Input()`
- Emit events via `@Output()`
- No direct store access
- Purely presentational
- Example: `lineage-node.component.ts`

### Modern Angular Features

This codebase uses Angular 20 with modern features:
- **Standalone components** (where applicable)
- **Signals**: `signal()`, `computed()`, `effect()`
- **ViewChild queries**: `viewChild()`, `viewChildren()`
- **Control flow**: `@if`, `@for`, `@switch` (new syntax)
- **Dependency injection**: `inject()` function

## Lineage Visualization

The lineage feature visualizes experiment/task relationships as a DAG (Directed Acyclic Graph):

**Key Files**:
- `experiments/containers/experiment-info-lineage/` - Single experiment lineage
- `experiments/containers/project-lineage-view/` - Project-wide lineage
- `experiments/dumb/lineage-node/` - Individual node rendering

**Arrow Rendering**:
- Uses `curved-arrows` library (`getBoxToBoxArrow`)
- Arrows drawn in SVG overlay positioned absolutely
- **Critical**: Use `getBoundingClientRect()` dimensions directly without ratio adjustments for accurate arrow positioning
- DOM node elements queried by `data-node-id` attribute

**Architecture**:
- `ExperimentLineageService` builds graph from API data
- Nodes arranged in DAG layers (rows)
- Arrows calculated after DOM render using `setTimeout()` for layout stability
- Uses Angular Signals for reactive updates

## Styling

- **SCSS** with global includes from `src/app/webapp-common/styles/`
- **CSS Variables**: Use `var(--color-*)` for theming
- **Material Design**: Angular Material components throughout
- **Dark mode**: Supported via CSS variable overrides

## Important Conventions

1. **File Naming**:
   - Services: `<name>.service.ts`
   - Components: `<name>.component.ts`
   - Actions: `<name>.actions.ts`
   - Effects: `<name>.effects.ts`
   - Reducers: `<name>.reducer.ts`

2. **Import Order** (enforced by ESLint):
   - Angular core imports
   - Third-party libraries
   - Application imports (use path aliases)

3. **State Management**:
   - Never mutate state directly
   - Use immutable patterns in reducers
   - Effects handle all side effects
   - Selectors for derived state

4. **Component Communication**:
   - Parent → Child: `@Input()`
   - Child → Parent: `@Output()` with `EventEmitter`
   - Unrelated components: NgRx store

5. **API Calls**:
   - Always through Business Logic services
   - Never call APIs directly from components
   - Handle errors in effects

## Testing

- Unit tests use Jasmine
- Test files colocated with source: `<name>.component.spec.ts`
- Run specific test: `npm run test -- --include='**/path/to/file.spec.ts'`
