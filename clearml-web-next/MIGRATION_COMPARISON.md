# ClearML Web: Angular vs Next.js Migration Comparison

## Executive Summary

This document compares the Angular implementation (`clearml-web`) with the Next.js implementation (`clearml-web-next`) to identify functional gaps and create a migration plan.

---

## 1. API Client Implementation

### Angular Implementation
**Location**: `src/app/business-logic/api-services/api-requests.service.ts`

```typescript
@Injectable()
export class SmApiRequestsService {
  createRequest(request: IApiRequest): Observable<any> {
    return this.http.request(
      request.meta.method,
      `${HTTP.API_BASE_URL}/${request.meta.endpoint}`,
      {
        params: this.getParams(request.params),
        body: request.payload,
        withCredentials: true
      }
    );
  }

  post<T>(url: string, body: any | null, options?: {...}): Observable<T> {
    options.withCredentials = true;
    return this.http.post<SmHttpResponse>(url, body, options)
      .pipe(map(res => res.data));
  }
}
```

**Key Features**:
- ✅ Uses `withCredentials: true` for all requests (cookie-based auth)
- ✅ Base URL: `apiBaseUrl` from environment (defaults to `/api/v2.0`)
- ✅ Custom header: `X-Clearml-Client: Webapp-{version}`
- ✅ Response unwrapping: Extracts `.data` from `SmHttpResponse`
- ✅ Auto-generated service layer for each API domain
- ✅ HTTP Interceptor for 401 handling

### Next.js Implementation
**Location**: `src/lib/api/client.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/clearml';

export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  hooks: {
    beforeRequest: [...],
    afterResponse: [...]
  }
});
```

**Key Features**:
- ✅ Uses `credentials: 'include'` (equivalent to withCredentials)
- ✅ Proxy via Next.js rewrites to avoid CORS
- ✅ Authorization token from localStorage/cookies
- ✅ 401 auto-redirect to `/login`
- ❌ Missing: Custom `X-Clearml-Client` header
- ❌ Missing: Response data unwrapping
- ❌ Missing: Auto-generated typed service layer

**Gap Analysis**:
1. **Missing X-Clearml-Client Header**: Angular sends version info in header
2. **Response Structure**: Angular unwraps `.data` field automatically
3. **Type Safety**: Angular has full API service typings
4. **Retry Logic**: Angular has sophisticated retry with exponential backoff

---

## 2. Routing Structure

### Angular Routes
```
/ → redirects to /dashboard
/dashboard
/projects/:projectId
  /projects/:projectId/overview
  /projects/:projectId/experiments
  /projects/:projectId/models
/experiments
  /experiments/:experimentId/info
  /experiments/:experimentId/execution
  /experiments/:experimentId/hyper-params
  /experiments/:experimentId/artifacts
  /experiments/:experimentId/scalars
  /experiments/:experimentId/plots
  /experiments/:experimentId/debug-images
  /experiments/:experimentId/logs
/models
  /models/:modelId/general
  /models/:modelId/network
  /models/:modelId/labels
/datasets
  /datasets/simple/:projectId
/pipelines
  /pipelines/:pipelineId
/workers-and-queues
  /workers-and-queues/queues
  /workers-and-queues/workers
/reports
/settings
/login
```

### Next.js Routes (Current)
```
/ → Dashboard
/login
/projects
/projects/:projectId
/tasks
/tasks/:taskId
  /tasks/:taskId/info
  /tasks/:taskId/execution
  /tasks/:taskId/configuration
  /tasks/:taskId/artifacts
  /tasks/:taskId/charts
/models
/models/:modelId
/datasets
/datasets/:datasetId
/pipelines
/pipelines/:pipelineId
/reports
/workers
/queues
/settings
```

**Gap Analysis**:
1. ❌ Missing `/projects/:projectId/overview` route
2. ❌ Missing `/tasks/:taskId/hyper-params` route
3. ❌ Missing `/tasks/:taskId/plots` route
4. ❌ Missing `/tasks/:taskId/debug-images` route
5. ❌ Missing `/tasks/:taskId/logs` route
6. ❌ Missing model detail sub-routes (network, labels, metadata)
7. ❌ Missing `/workers-and-queues` combined view
8. ❌ Missing experiment comparison routes
9. ❌ Missing model comparison routes

---

## 3. Authentication & Authorization

### Angular Implementation
**Location**: `src/app/webapp-common/shared/services/login.service.ts`

```typescript
loginFlow() {
  // 1. Get login mode from server
  // 2. Load credentials from credentials.json
  // 3. Authenticate with Basic Auth
  // 4. Store auth state in NgRx store
  // 5. Cache login mode with TTL (10 min)
}

// Supports multiple login modes:
- 'simple': Auto-login with credentials
- 'password': Username/password form
- 'ssoOnly': SSO redirect only
- 'tenant': Multi-tenant login

// Basic Auth encoding:
Authorization: Basic {base64(userKey:userSecret)}
```

**Features**:
- ✅ Multiple authentication modes
- ✅ Credentials from `credentials.json` or env vars
- ✅ Login mode caching with TTL
- ✅ Auto-retry with exponential backoff
- ✅ S3 credential management for signed URLs
- ✅ Session persistence via cookies

### Next.js Implementation
**Current Status**: ⚠️ **BASIC PLACEHOLDER**

```typescript
// src/lib/api/client.ts
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('clearml_token');
  if (token) return token;

  // Check cookie fallback
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('clearml_token='));

  return cookie ? cookie.split('=')[1] : null;
}
```

**Gap Analysis**:
1. ❌ No login flow implementation
2. ❌ No support for multiple auth modes
3. ❌ No credentials.json loading
4. ❌ No Basic Auth encoding
5. ❌ No login mode detection/caching
6. ❌ No auto-retry logic
7. ❌ No S3 credential management
8. ⚠️ Simple localStorage token (not production-ready)

---

## 4. State Management

### Angular: NgRx Store Architecture

```typescript
// Central Store
StoreModule.forRoot({
  auth: authReducer,
  router: routerReducer,
  messages: messagesReducer,
  recentTasks: recentTasksReducer,
  views: viewReducer,
  users: usersReducer,
  login: loginReducer,
  rootProjects: projectsReducer,
  [userStatsFeatureKey]: usageStatsReducer
})

// Feature Modules with lazy-loaded stores
StoreModule.forFeature('experiments', experimentsReducer)
StoreModule.forFeature('models', modelsReducer)
StoreModule.forFeature('datasets', datasetsReducer)
```

**Meta-Reducers**:
1. **LocalStorage Sync**: Persists specific keys to localStorage
2. **UserPreferences Sync**: Persists to API
3. **Router State Sync**: Syncs router with store

**Key Patterns**:
- Actions with type constants (`AUTH_PREFIX`, `USERS_PREFIX`, etc.)
- Effects for all API side-effects
- Memoized selectors with `createSelector()`
- Optimistic updates with rollback
- Complex state composition

### Next.js: Current Implementation

```typescript
// React Query for server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// URL state with nuqs
const [statusFilter, setStatusFilter] = useQueryState(
  'status',
  parseAsArrayOf(parseAsString).withDefault([])
);

// Local state with useState/useReducer
const [viewMode, setViewMode] = useState<ViewMode>('table');
```

**Gap Analysis**:
1. ❌ No centralized application state
2. ❌ No user preferences persistence
3. ❌ No global UI state management (view settings, table configs)
4. ❌ No optimistic updates
5. ❌ No complex state composition
6. ✅ URL state management with `nuqs` (good!)
7. ✅ Server state caching with React Query (good!)

**Recommendation**: Consider Zustand or Redux Toolkit for global state

---

## 5. Key Missing Features

### 5.1 Experiments/Tasks

Angular has extensive experiment functionality:

1. **Multiple View Modes**
   - Table view with customizable columns
   - Card/Grid view
   - Comparison view (side-by-side)

2. **Detail Tabs** (Next.js Missing):
   - ❌ Hyper-parameters tab
   - ❌ Plots tab (custom visualizations)
   - ❌ Debug Images tab
   - ❌ Logs tab (console output)
   - ✅ Info, Execution, Artifacts (have basic structure)

3. **Advanced Table Features**:
   - ❌ Column customization
   - ❌ Column reordering
   - ❌ Save table configuration
   - ❌ Multi-column sorting
   - ❌ Advanced filtering
   - ❌ Bulk operations

4. **Comparison Features**:
   - ❌ Compare multiple experiments
   - ❌ Diff view for parameters
   - ❌ Parallel coordinates plot
   - ❌ Scatter plot matrix

### 5.2 Models

Angular model features:

1. **Detail Tabs** (Next.js Missing):
   - ❌ Network architecture visualization
   - ❌ Labels management
   - ❌ Metadata editor
   - ❌ Related tasks view
   - ❌ Scalars from model
   - ❌ Plots from model

2. **Model Operations**:
   - ❌ Publish/Archive
   - ❌ Clone model
   - ❌ Download model
   - ❌ Model lineage graph

### 5.3 Datasets

Angular dataset features:

1. **Version Management**:
   - ❌ Dataset versions/lineage
   - ❌ Version comparison
   - ❌ Parent-child relationships

2. **Dataset Operations**:
   - ❌ Preview dataset content
   - ❌ Dataset statistics
   - ❌ Download dataset
   - ❌ Dataset metadata editor

### 5.4 Pipelines

Angular pipeline features:

1. **Visualization**:
   - ✅ DAG visualization (Next.js has basic version)
   - ❌ Step-by-step execution tracking
   - ❌ Live status updates
   - ❌ Error highlighting

2. **Pipeline Operations**:
   - ❌ Run pipeline with parameters
   - ❌ Pause/Resume pipeline
   - ❌ Pipeline templates
   - ❌ Schedule pipeline runs

### 5.5 Workers & Queues

Angular worker features:

1. **Combined View**:
   - ❌ `/workers-and-queues` route with tabs
   - ❌ Worker stats dashboard
   - ❌ Queue management UI

2. **Worker Operations**:
   - ❌ Register new worker
   - ❌ Worker activity monitoring
   - ❌ Assign tasks to workers
   - ❌ Worker resource usage

3. **Queue Operations**:
   - ❌ Create/Edit queues
   - ❌ Queue priority management
   - ❌ Task assignment rules
   - ❌ Queue statistics

### 5.6 Global Features

1. **Search**:
   - ❌ Global search across all entities
   - ❌ Search history
   - ❌ Saved searches

2. **Notifications**:
   - ❌ Real-time notifications
   - ❌ Task completion alerts
   - ❌ Error notifications
   - ❌ System messages

3. **User Preferences**:
   - ❌ Theme selection (light/dark)
   - ❌ Table defaults
   - ❌ Notification settings
   - ❌ Privacy settings

4. **Admin Features**:
   - ❌ User management
   - ❌ Workspace settings
   - ❌ API credentials management
   - ❌ Usage statistics

---

## 6. Data Models & API Structure

### Angular API Response Structure

```typescript
interface SmHttpResponse<T = any> {
  data: T;        // Actual data payload
  meta?: {        // Optional metadata
    total?: number;
    page?: number;
    page_size?: number;
  };
}

// Example: tasks.get_all_ex response
{
  "data": {
    "tasks": [...],
    "total": 1234
  }
}
```

### Next.js Current Structure
Currently makes raw API calls without unwrapping:

```typescript
// Should be updated to match Angular structure
export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await apiClient.post(endpoint, { json: body });
  const data = await response.json();
  return data as T;  // ❌ Should unwrap .data field
}
```

**Fix Needed**:
```typescript
interface ClearMLResponse<T = any> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
  };
}

export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await apiClient.post(endpoint, { json: body });
  const result = await response.json() as ClearMLResponse<T>;
  return result.data;  // ✅ Unwrap data field
}
```

---

## 7. Implementation Priority Matrix

### Priority 1: Critical for MVP (Must Have)

1. **API Client Improvements**
   - [ ] Add X-Clearml-Client header with version
   - [ ] Response data unwrapping (.data field)
   - [ ] Retry logic with exponential backoff
   - [ ] Better error handling

2. **Authentication Flow**
   - [ ] Login mode detection
   - [ ] Basic Auth implementation
   - [ ] Credentials.json loading
   - [ ] Session management

3. **Core Task/Experiment Features**
   - [ ] Hyper-parameters tab
   - [ ] Plots tab
   - [ ] Debug Images tab
   - [ ] Console Logs tab

### Priority 2: Important (Should Have)

4. **Table Enhancements**
   - [ ] Column customization
   - [ ] Save table state
   - [ ] Multi-sort
   - [ ] Advanced filters

5. **Model Details**
   - [ ] Network architecture view
   - [ ] Labels management
   - [ ] Metadata editor

6. **Worker & Queue Management**
   - [ ] Combined workers-and-queues view
   - [ ] Queue operations
   - [ ] Worker monitoring

### Priority 3: Nice to Have (Could Have)

7. **Comparison Features**
   - [ ] Experiment comparison
   - [ ] Model comparison
   - [ ] Diff views

8. **Advanced Visualizations**
   - [ ] Parallel coordinates
   - [ ] Scatter plot matrix
   - [ ] Custom plot types

9. **Global Features**
   - [ ] Global search
   - [ ] Notifications system
   - [ ] User preferences

---

## 8. Recommended Next Steps

### Phase 1: Foundation (Week 1-2)
1. Fix API client to match Angular behavior
2. Implement proper authentication flow
3. Add missing response unwrapping
4. Set up global state management (Zustand)

### Phase 2: Core Features (Week 3-4)
1. Add missing task/experiment tabs
2. Implement table customization
3. Add model detail views
4. Implement workers & queues management

### Phase 3: Advanced Features (Week 5-6)
1. Comparison views
2. Advanced visualizations
3. Global search
4. User preferences system

### Phase 4: Polish (Week 7-8)
1. Notifications
2. Real-time updates
3. Performance optimization
4. Cross-browser testing

---

## 9. Code Examples: What to Implement

### Example 1: Add X-Clearml-Client Header

```typescript
// src/lib/api/client.ts
import packageJson from '../../package.json';

export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Clearml-Client': `Webapp-${packageJson.version}`,  // ✅ Add this
  },
  // ...
});
```

### Example 2: Response Unwrapping

```typescript
// src/lib/api/client.ts
interface ClearMLResponse<T = any> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
  };
}

export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<{ data: T; meta?: any }> {
  const response = await apiClient.post(endpoint, { json: body });
  const result = await response.json() as ClearMLResponse<T>;

  return {
    data: result.data,
    meta: result.meta
  };
}
```

### Example 3: Retry Logic

```typescript
// src/lib/api/client.ts
export const apiClient = ky.create({
  // ...
  retry: {
    limit: 3,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,
  },
  hooks: {
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        console.log(`Retrying request (${retryCount}/3):`, request.url);
      },
    ],
  },
});
```

### Example 4: Global State with Zustand

```typescript
// src/lib/store/use-app-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  tableConfigs: Record<string, any>;
  userPreferences: UserPreferences;

  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setTableConfig: (table: string, config: any) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      tableConfigs: {},
      userPreferences: {},

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTableConfig: (table, config) =>
        set((state) => ({
          tableConfigs: { ...state.tableConfigs, [table]: config }
        })),
      updatePreferences: (prefs) =>
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...prefs }
        })),
    }),
    {
      name: 'clearml-app-storage',
      partialize: (state) => ({
        theme: state.theme,
        tableConfigs: state.tableConfigs,
        userPreferences: state.userPreferences,
      }),
    }
  )
);
```

---

## 10. Summary

### Current State
The Next.js migration has established:
- ✅ Basic routing structure
- ✅ UI components with shadcn/ui
- ✅ Chart components
- ✅ React Query for data fetching
- ✅ Basic API client

### Major Gaps
- ❌ ~60% of Angular features missing
- ❌ Authentication not fully implemented
- ❌ No global state management
- ❌ Missing critical tabs and views
- ❌ API response handling incomplete

### Estimated Effort
- **Full feature parity**: 6-8 weeks with 1 developer
- **MVP with core features**: 3-4 weeks
- **Basic usability**: 1-2 weeks (Priority 1 items)

### Recommendation
Start with **Priority 1** items to achieve basic functional parity, then incrementally add Priority 2 and 3 features based on user feedback.
