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

### Core Infrastructure (Phase 1 - Complete)

- ✅ **Next.js 16** with App Router and React 19
- ✅ **Tailwind CSS 4.0** with custom theme configuration
- ✅ **TypeScript 5.8+** in strict mode with comprehensive type definitions
- ✅ **Shadcn/UI** component library (27+ components including Card, Button, Dialog, Table, Form, etc.)
- ✅ **API Client** infrastructure with ky and automatic authentication
- ✅ **TanStack Query** (React Query) for server state management
- ✅ **Zustand** stores for client state (auth, preferences)
- ✅ **React Hook Form** + **Zod** for form validation
- ✅ **Responsive Layout** with collapsible sidebar and mobile support
- ✅ **Theme System** with light/dark mode toggle using next-themes
- ✅ **Testing Setup** with Vitest + React Testing Library + Playwright

### Authentication System (Phase 2 - Complete)

- ✅ **Login/Logout** functionality with credential-based authentication
- ✅ **Auth State Management** with Zustand store and React Query integration
- ✅ **Token Management** with automatic token storage and refresh
- ✅ **Protected Routes** using useRequireAuth hook
- ✅ **Password Management** (change password, request reset, reset with token)
- ✅ **Current User** fetching and profile management
- ✅ **Auth Hooks** for login, logout, token validation

### Projects Module (Phase 3 - Complete)

- ✅ **Projects List** with search, filtering, and sorting
- ✅ **Project Details** page with task statistics
- ✅ **Project Creation** with form validation
- ✅ **Project Update** and delete operations
- ✅ **Project Statistics** showing task counts by status
- ✅ **Project Tags** management

### Tasks Module (Phase 4 - Complete)

- ✅ **Tasks List** with advanced filtering (status, type, project, tags)
- ✅ **Task Details** page with comprehensive information
- ✅ **Task Info Tab** showing metadata, dates, and user information
- ✅ **Task Execution Tab** showing execution details and parameters
- ✅ **Task Configuration Tab** for viewing task configuration
- ✅ **Task Artifacts Tab** for managing task artifacts
- ✅ **Task Actions** (create, update, delete, enqueue, dequeue, stop, reset, publish)
- ✅ **Task Status** indicators with colored badges
- ✅ **Task Search** with full-text search capabilities

### Models Module (Phase 5 - Complete)

- ✅ **Models Registry** list with filtering and search
- ✅ **Model Details** page with metadata and lineage
- ✅ **Model Creation** and update operations
- ✅ **Model Versioning** support
- ✅ **Model Publishing** workflow
- ✅ **Framework Detection** (PyTorch, TensorFlow, etc.)
- ✅ **Model URI** and artifact management

### Datasets Module (Phase 6 - Complete)

- ✅ **Datasets List** with filtering and search
- ✅ **Dataset Details** page with version history
- ✅ **Dataset Creation** and management
- ✅ **Dataset Versioning** with parent-child relationships
- ✅ **Dataset Statistics** (size, file count)
- ✅ **Dataset Publishing** workflow
- ✅ **Dataset Metadata** viewing and editing

### Workers & Queues Module (Phase 7 - Complete)

- ✅ **Workers List** showing active and idle workers
- ✅ **Worker Details** with current task and activity
- ✅ **Worker Status** indicators and last activity time
- ✅ **Queues List** with task counts
- ✅ **Queue Management** (create, update, delete)
- ✅ **Queue Task Assignment** via drag-and-drop or enqueue actions

### Reports Module (Phase 8 - Complete)

- ✅ **Reports List** with filtering
- ✅ **Report Creation** from tasks
- ✅ **Report Viewing** with rich content display
- ✅ **Report Sharing** capabilities

### Settings Module (Phase 9 - Complete)

- ✅ **User Preferences** management
- ✅ **Theme Settings** (light/dark mode)
- ✅ **Profile Settings** with avatar support
- ✅ **Password Change** functionality
- ✅ **Notification Preferences**

### UI Components (Complete)

27+ Shadcn/UI components including:
- Layout: Card, Separator, Tabs, ScrollArea
- Forms: Input, Label, Textarea, Select, Checkbox, Radio, Switch, Slider
- Navigation: Breadcrumb, Dropdown Menu, Popover
- Feedback: Alert, Toast, Dialog, Progress, Skeleton
- Data Display: Table, Avatar, Badge, Tooltip
- Buttons: Button (with variants)

### Planned Enhancements

- ⏳ **Advanced Data Tables** with column resizing, sorting, and filtering
- ⏳ **Charts & Visualizations** (Plotly integration for experiment metrics)
- ⏳ **Real-time Updates** via WebSocket connections
- ⏳ **Pipelines DAG Visualization** with interactive graph
- ⏳ **Code Editor** integration (Monaco) for viewing/editing scripts
- ⏳ **Hyperparameter Optimization** visualization
- ⏳ **Comparison Views** for tasks and experiments
- ⏳ **Advanced Search** with filters and saved searches
- ⏳ **Offline Support** with service workers
- ⏳ **Performance Optimizations** (code splitting, lazy loading)
- ⏳ **Complete E2E Test Coverage**

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
NEXT_PUBLIC_AUTH_COOKIE_NAME=clearml_token
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | ClearML API endpoint | `https://api.clear.ml/v2.0` | Yes |
| `NEXT_PUBLIC_WEB_SERVER_URL` | Web server URL | `https://app.clear.ml` | Yes |
| `NEXT_PUBLIC_AUTH_COOKIE_NAME` | Auth cookie name | `clearml_token` | No |

### Local Development

For local ClearML server development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8008/v2.0
NEXT_PUBLIC_WEB_SERVER_URL=http://localhost:8080
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

## Troubleshooting

### Common Issues

#### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
bun run dev -- -p 3001
```

#### API Connection Issues

If you cannot connect to the ClearML API:

1. Check that `NEXT_PUBLIC_API_URL` is set correctly in `.env.local`
2. Verify the API server is running and accessible
3. Check browser console for CORS errors
4. For local development, ensure the API server allows your origin

```bash
# Test API connectivity
curl -X POST https://api.clear.ml/v2.0/auth.login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

#### Authentication Not Working

If authentication fails:

1. Clear browser local storage and cookies
2. Check that the token is being stored correctly (browser DevTools > Application > Local Storage)
3. Verify the API credentials are correct
4. Check the network tab for 401 responses

```javascript
// Clear auth state in browser console
localStorage.removeItem('clearml_token');
```

#### Build Errors

If you encounter build errors:

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules bun.lock
bun install

# Type check for TypeScript errors
bun run type-check
```

#### Styling Issues

If Tailwind styles are not applied:

```bash
# Rebuild with cleared cache
rm -rf .next
bun run build
```

### Performance Issues

If the app is running slowly:

1. Check React DevTools Profiler for component re-renders
2. Verify React Query is caching data properly (check DevTools)
3. Enable production mode for better performance: `bun run build && bun run start`
4. Check Network tab for unnecessary API calls

### Getting Help

For additional help:

- Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [MIGRATION.md](./MIGRATION.md) for migration-specific issues
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
- Check [API.md](./API.md) for API integration details

## Contributing

This is an active migration project. Key principles:

1. **Type Safety**: Use TypeScript strictly, no `any` types
2. **Performance**: Optimize bundle size and runtime performance
3. **Accessibility**: Follow WCAG 2.1 AA standards
4. **Testing**: Write tests for critical paths
5. **Code Style**: Follow existing patterns, use Prettier

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel
```

### Docker

Build and run with Docker:

```dockerfile
# Dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["bun", "run", "start"]
```

```bash
# Build and run
docker build -t clearml-web-next .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.clear.ml/v2.0 clearml-web-next
```

### Static Export

For static hosting (note: some features may not work):

```javascript
// next.config.js
module.exports = {
  output: 'export',
}
```

```bash
bun run build
# Deploy the 'out' directory to your static host
```

## License

Same as ClearML Web (see main repository)

## Links

- [ClearML Main Repository](https://github.com/allegroai/clearml-web)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand.docs.pmnd.rs/)
