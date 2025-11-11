# ClearML Web - Next.js Migration

This is the Next.js migration of the ClearML Web application, moving from Angular 19 to a modern React + Next.js + Tailwind CSS stack.

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **UI Library**: React 19+
- **Styling**: Tailwind CSS 4.0
- **Components**: Shadcn/UI (Radix UI)
- **State Management**:
  - TanStack Query (React Query) for server state
  - Zustand for client state
- **Forms**: React Hook Form + Zod
- **API Client**: ky (fetch wrapper)
- **Testing**: Vitest + React Testing Library + Playwright
- **Type Safety**: TypeScript 5.8+ (strict mode)

## Getting Started

### Prerequisites

- Bun 1.3+ (or Node.js 20+)
- Git

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API endpoints
```

### Development

```bash
# Start development server
bun run dev

# Open http://localhost:3000
```

### Building

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Testing

```bash
# Run unit tests
bun run test

# Run unit tests with UI
bun run test:ui

# Run E2E tests
bun run test:e2e

# Type check
bun run type-check
```

## Project Structure

```
clearml-web-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth layout group
│   │   ├── (dashboard)/       # Main app layout
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Client providers
│   │   └── page.tsx           # Home page
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (Shadcn)
│   │   ├── features/         # Feature-specific components
│   │   ├── layout/           # Layout components
│   │   └── shared/           # Shared components
│   │
│   ├── lib/                  # Core utilities
│   │   ├── api/             # API client & endpoints
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── constants/       # Constants
│   │
│   ├── types/               # TypeScript types
│   └── styles/              # Global styles
│
├── public/                  # Static assets
├── tests/                   # Tests
└── config files
```

## Features

### Completed (Phase 1 - Foundation)

- ✅ Next.js project setup with bun
- ✅ Tailwind CSS configuration with theme support
- ✅ Shadcn/UI component library (10+ base components)
- ✅ TypeScript strict mode configuration
- ✅ API client infrastructure with ky
- ✅ React Query setup for data fetching
- ✅ Core layout components (Header, Sidebar)
- ✅ Dashboard page structure
- ✅ Theme toggle (light/dark mode)
- ✅ Responsive design foundation

### In Progress

- 🚧 Authentication system
- 🚧 Login page and auth flow
- 🚧 Projects module
- 🚧 Tasks module
- 🚧 Models registry
- 🚧 Datasets management
- 🚧 Pipelines with DAG visualization
- 🚧 Workers & Queues
- 🚧 Reports

### Planned

- ⏳ Advanced data tables with TanStack Table
- ⏳ Charts and visualizations (Recharts, Plotly)
- ⏳ Code editor integration (Monaco)
- ⏳ Real-time updates
- ⏳ Offline support
- ⏳ Performance optimizations
- ⏳ E2E test coverage

## Migration Strategy

This project follows a **phased incremental migration** approach:

1. **Phase 1**: Foundation (✅ Complete)
2. **Phase 2**: Authentication & Core Services
3. **Phase 3**: Simple Features (Dashboard, Settings)
4. **Phase 4**: Medium Features (Projects, Workers, Queues)
5. **Phase 5**: Complex Features (Tasks, Models, Datasets, Pipelines)
6. **Phase 6**: Polish & Optimization

## API Configuration

The app connects to the ClearML API server. Configure the endpoint in `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.clear.ml/v2.0
NEXT_PUBLIC_WEB_SERVER_URL=https://app.clear.ml
```

## Component Development

### Adding a New UI Component

```bash
# Components are in src/components/ui/
# Follow Shadcn/UI patterns for consistency
```

### Creating a Feature Component

```typescript
// src/components/features/tasks/task-card.tsx
import { Card } from '@/components/ui/card';

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card>
      {/* Your component */}
    </Card>
  );
}
```

### Using API Hooks

```typescript
import { useTasks } from '@/lib/hooks/use-tasks';

export function TasksList() {
  const { data, isLoading, error } = useTasks({
    status: ['in_progress', 'queued'],
  });

  if (isLoading) return <Skeleton />;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div>
      {data?.items.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

## Contributing

This is an active migration project. Key principles:

1. **Type Safety**: Use TypeScript strictly, no `any` types
2. **Performance**: Optimize bundle size and runtime performance
3. **Accessibility**: Follow WCAG 2.1 AA standards
4. **Testing**: Write tests for critical paths
5. **Code Style**: Follow existing patterns, use Prettier

## License

Same as ClearML Web (see main repository)

## Links

- [ClearML Main Repository](https://github.com/allegroai/clearml-web)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
