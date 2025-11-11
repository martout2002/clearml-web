# ClearML Web: Angular vs Next.js Migration Comparison

This document provides a detailed comparison between the Angular implementation and the Next.js implementation of ClearML Web, highlighting key differences, missing features, and priority fixes needed for production deployment.

## Table of Contents

- [API Client Differences](#api-client-differences)
- [Authentication Flow Differences](#authentication-flow-differences)
- [Missing Features by Module](#missing-features-by-module)
- [State Management Differences](#state-management-differences)
- [Priority Levels for Fixes](#priority-levels-for-fixes)
- [Breaking Changes](#breaking-changes)

---

## API Client Differences

### Angular Implementation

**Location**: `src/app/business-logic/api-services/api-requests.service.ts`

**Key Features**:
1. **Response Structure**: Uses `SmHttpResponse` interface with `.data` wrapping
   ```typescript
   export interface SmHttpResponse {
     data: any;
     meta: any;
   }
   ```

2. **Automatic Response Unwrapping**: The `post` method automatically extracts `.data`
   ```typescript
   return this.http.post<SmHttpResponse>(url, body, options)
     .pipe(map(res => res.data));
   ```

3. **Client Headers**: Adds `X-Allegro-Client` header with version info
   ```typescript
   // From webapp-interceptor.ts
   'X-Allegro-Client': 'Webapp-' + environment.version
   ```

4. **Retry Logic**: Implements exponential backoff for failed requests
   ```typescript
   // From login.service.ts
   return this.getLoginMode().pipe(
     retry({count: 3, delay: (err, count) => timer(500 * count)}),
     catchError(err => {
       this.openServerError();
       throw err;
     })
   );
   ```

5. **Credentials**: Always includes credentials with `withCredentials: true`

6. **Error Handling**: Centralized interceptor handles 401 errors globally

### Next.js Implementation (Current)

**Location**: `src/lib/api/client.ts`

**Current Features**:
1. ❌ **No Response Unwrapping**: Expects flat response structure
   ```typescript
   const data = await response.json();
   return data as T;  // Missing .data extraction
   ```

2. ❌ **Missing Client Headers**: No `X-Clearml-Client` header
   ```typescript
   headers: {
     'Content-Type': 'application/json',
   }
   // Missing: 'X-Clearml-Client': 'NextJS-' + version
   ```

3. ❌ **No Retry Logic**: Fails immediately on network errors

4. ✅ **Credentials**: Correctly includes credentials
   ```typescript
   credentials: 'include',
   ```

5. ✅ **Error Handling**: Has basic 401 handling in afterResponse hook

### Required Changes for Next.js

**Priority 1 (Blocking)**:

1. **Add X-Clearml-Client header**:
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'X-Clearml-Client': `NextJS-${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`
   }
   ```

2. **Implement response unwrapping** to match `SmHttpResponse.data.data` pattern:
   ```typescript
   export async function apiRequest<T>(
     endpoint: string,
     body?: unknown
   ): Promise<T> {
     const response = await apiClient.post(endpoint, { json: body });
     const data = await response.json();

     // ClearML API returns: { data: { ...actual data }, meta: {...} }
     return data.data as T;
   }
   ```

3. **Add retry logic with exponential backoff**:
   ```typescript
   import { retry } from 'ky';

   const apiClient = ky.create({
     // ...existing config
     retry: {
       limit: 3,
       methods: ['post', 'get'],
       statusCodes: [408, 413, 429, 500, 502, 503, 504],
       backoffLimit: 5000,
     }
   });
   ```

4. **Add SmHttpResponse interface**:
   ```typescript
   export interface SmHttpResponse<T = any> {
     data: T;
     meta?: {
       id?: string;
       trx?: string;
       endpoint?: string;
       result_code?: number;
       result_subcode?: number;
       result_msg?: string;
     };
   }
   ```

---

## Authentication Flow Differences

### Angular Implementation

**Location**: `src/app/webapp-common/shared/services/login.service.ts`

**Key Features**:

1. **Login Modes Support**:
   ```typescript
   export type LoginMode = 'simple' | 'password' | 'ssoOnly' | 'error' | 'tenant';
   ```

2. **Login Flow**:
   - First calls `login.supported_modes` endpoint to check server auth configuration
   - Supports multiple authentication modes:
     - `simple`: Credentials from `credentials.json` file (passwordless)
     - `password`: Basic Auth with username/password
     - `ssoOnly`: SSO authentication only
     - `tenant`: Multi-tenant login with tenant selection
     - `error`: Server unavailable fallback

3. **Credentials Loading**:
   ```typescript
   initCredentials() {
     return this.getLoginMode().pipe(
       retry({count: 3, delay: (err, count) => timer(500 * count)}),
       switchMap(mode => mode === loginModes.simple ?
         this.httpClient.get('credentials.json').pipe(
           catchError(() => of(fromEnv())),
         ) : of(fromEnv())
       ),
       tap((credentials: any) => {
         this.userKey = credentials.userKey;
         this.userSecret = credentials.userSecret;
         this.companyID = credentials.companyID;
       }),
     );
   }
   ```

4. **Basic Auth Encoding**:
   ```typescript
   getHeaders(): HttpHeaders {
     let headers = new HttpHeaders();
     const auth = window.btoa(this.userKey + ':' + this.userSecret);
     headers = headers.append('Authorization', 'Basic ' + auth);
     return headers;
   }
   ```

5. **Password Login**:
   ```typescript
   passwordLogin(user: string, password: string) {
     let headers = new HttpHeaders();
     const auth = window.btoa(user + ':' + password);
     headers = headers.append('Authorization', 'Basic ' + auth);
     return this.httpClient.post<AuthCreateUserResponse>(
       `${this.basePath}/auth.login`,
       null,
       {headers, withCredentials: true}
     );
   }
   ```

6. **Simple Mode Auto-Login**:
   ```typescript
   login(userId: string) {
     let headers = this.getHeaders();
     headers = headers.append(`${this.environment().headerPrefix}-Impersonate-As`, userId);
     return this.httpClient.post(`${this.basePath}/auth.login`, null,
       {headers, withCredentials: true});
   }
   ```

7. **User Creation** (for simple mode):
   ```typescript
   createUser(name: string) {
     let headers = this.getHeaders();
     headers = headers.append('Content-Type', 'application/json');
     const data = {
       email: uuidV1() + '@test.ai',
       name,
       company: this.companyID,
       given_name: name.split(' ')[0],
       family_name: name.split(' ')[1] ? name.split(' ')[1] : name.split(' ')[0]
     };
     return this.httpClient.post<{data: AuthCreateUserResponse}>(
       `${this.basePath}/auth.create_user`,
       data,
       {headers}
     ).pipe(map(x => x.data.id));
   }
   ```

### Next.js Implementation (Current)

**Location**: `src/lib/api/auth.ts`

**Current Features**:

1. ❌ **No Login Mode Detection**: Always assumes password-based auth
   ```typescript
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
     // ...
   }
   ```

2. ❌ **No credentials.json Support**: Doesn't load from credentials file

3. ❌ **No Basic Auth Encoding**: Missing base64 encoding for key:secret

4. ❌ **No Simple Mode Support**: Can't auto-create users or impersonate

5. ❌ **Incorrect Response Unwrapping**: Doesn't handle `.data.data` pattern
   ```typescript
   export async function getCurrentUser(): Promise<User> {
     const response = await apiRequest<{ user: User }>('users.get_current_user', {});
     return response.user;  // Should be response.data.user
   }
   ```

6. ❌ **No Tenant Support**: Missing multi-tenant login flow

### Required Changes for Next.js

**Priority 1 (Blocking)**:

1. **Add LoginMode detection**:
   ```typescript
   export type LoginMode = 'simple' | 'password' | 'ssoOnly' | 'error' | 'tenant';

   export interface LoginModeResponse {
     authenticated: boolean;
     basic: {
       enabled: boolean;
     };
     sso?: {
       enabled: boolean;
       providers?: string[];
     };
     server_errors?: {
       missed_es_upgrade?: boolean;
       es_connection_error?: boolean;
     };
   }

   export async function getLoginSupportedModes(): Promise<LoginModeResponse> {
     const response = await apiClient.post('login.supported_modes', {
       json: {}
     });
     const data = await response.json();
     return data.data as LoginModeResponse;
   }
   ```

2. **Load credentials.json**:
   ```typescript
   export interface Credentials {
     userKey: string;
     userSecret: string;
     companyID: string;
   }

   export async function loadCredentials(): Promise<Credentials | null> {
     try {
       const response = await fetch('/credentials.json');
       if (!response.ok) return null;
       return await response.json();
     } catch {
       // Check environment variables as fallback
       return {
         userKey: process.env.NEXT_PUBLIC_USER_KEY || '',
         userSecret: process.env.NEXT_PUBLIC_USER_SECRET || '',
         companyID: process.env.NEXT_PUBLIC_COMPANY_ID || ''
       };
     }
   }
   ```

3. **Implement Basic Auth**:
   ```typescript
   export async function loginWithBasicAuth(
     username: string,
     password: string
   ): Promise<LoginResponse> {
     const auth = btoa(`${username}:${password}`);

     const response = await apiClient.post('auth.login', {
       headers: {
         'Authorization': `Basic ${auth}`,
       },
       credentials: 'include'
     });

     const data = await response.json();

     // Store token/cookie
     if (data.data?.token) {
       setAuthToken(data.data.token);
     }

     return {
       token: data.data?.token || '',
       user: data.data?.user
     };
   }
   ```

4. **Support Simple Mode (auto-create user)**:
   ```typescript
   export async function loginSimpleMode(
     name: string,
     credentials: Credentials
   ): Promise<LoginResponse> {
     // Step 1: Create user
     const auth = btoa(`${credentials.userKey}:${credentials.userSecret}`);

     const createResponse = await apiClient.post('auth.create_user', {
       json: {
         email: `${crypto.randomUUID()}@test.ai`,
         name,
         company: credentials.companyID,
         given_name: name.split(' ')[0],
         family_name: name.split(' ')[1] || name.split(' ')[0]
       },
       headers: {
         'Authorization': `Basic ${auth}`,
       }
     });

     const createData = await createResponse.json();
     const userId = createData.data.id;

     // Step 2: Login as created user
     const loginResponse = await apiClient.post('auth.login', {
       headers: {
         'Authorization': `Basic ${auth}`,
         'X-Clearml-Impersonate-As': userId
       },
       credentials: 'include'
     });

     const loginData = await loginResponse.json();

     return {
       token: loginData.data?.token || '',
       user: loginData.data?.user
     };
   }
   ```

5. **Fix getCurrentUser unwrapping**:
   ```typescript
   export async function getCurrentUser(): Promise<User> {
     const response = await apiRequest<{ user: User }>('users.get_current_user', {});
     // Response is already unwrapped by apiRequest, so:
     return response.user;

     // OR if apiRequest doesn't unwrap:
     const response = await apiClient.post('users.get_current_user', { json: {} });
     const data = await response.json();
     return data.data.user;  // ClearML pattern: response.data.user
   }
   ```

---

## Missing Features by Module

### Authentication Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Login mode detection | ✅ | ❌ | P1 | Medium |
| credentials.json support | ✅ | ❌ | P1 | Low |
| Basic Auth encoding | ✅ | ❌ | P1 | Low |
| Simple mode auto-login | ✅ | ❌ | P1 | Medium |
| SSO support | ✅ | ❌ | P2 | High |
| Tenant selection | ✅ | ❌ | P2 | Medium |
| User creation (simple mode) | ✅ | ❌ | P1 | Medium |
| Response unwrapping | ✅ | ❌ | P1 | Low |
| Retry logic | ✅ | ❌ | P1 | Low |

### Projects Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Project list | ✅ | ✅ | - | - |
| Project details | ✅ | ✅ | - | - |
| Create/edit project | ✅ | ✅ | - | - |
| Delete project | ✅ | ❌ | P2 | Low |
| Archive/restore | ✅ | ❌ | P2 | Low |
| Project statistics | ✅ | ✅ | - | - |
| Hierarchical projects | ✅ | ❌ | P2 | High |
| Project permissions | ✅ | ❌ | P3 | High |

### Tasks Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Task list | ✅ | ✅ | - | - |
| Task details | ✅ | ✅ | - | - |
| Task execution panel | ✅ | ✅ | - | - |
| Task configuration | ✅ | ✅ | - | - |
| Task artifacts | ✅ | ✅ | - | - |
| Task charts | ✅ | ✅ | - | - |
| Compare tasks | ✅ | ❌ | P2 | High |
| Clone/archive | ✅ | ❌ | P2 | Medium |
| Enqueue/dequeue | ✅ | ❌ | P1 | Medium |
| Reset/abort/publish | ✅ | ❌ | P1 | Medium |
| Debug samples | ✅ | ❌ | P2 | High |
| Scalar/plot customization | ✅ | ❌ | P2 | High |

### Models Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Model list | ✅ | ✅ | - | - |
| Model details | ✅ | ✅ | - | - |
| Model versions | ✅ | ❌ | P2 | Medium |
| Model comparison | ✅ | ❌ | P2 | High |
| Publish/archive | ✅ | ❌ | P2 | Medium |
| Model metadata | ✅ | ✅ | - | - |

### Datasets Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Dataset list | ✅ | ✅ | - | - |
| Dataset details | ✅ | ✅ | - | - |
| Dataset versions | ✅ | ❌ | P2 | Medium |
| Dataset preview | ✅ | ❌ | P2 | High |
| Dataset lineage | ✅ | ❌ | P3 | High |

### Pipelines Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Pipeline list | ✅ | ✅ | - | - |
| Pipeline details | ✅ | ✅ | - | - |
| DAG visualization | ✅ | ✅ | - | - |
| Run pipeline | ✅ | ❌ | P1 | Medium |
| Pipeline runs | ✅ | ❌ | P2 | High |
| Clone pipeline | ✅ | ❌ | P2 | Medium |

### Workers/Queues Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Workers list | ✅ | ✅ | - | - |
| Worker stats | ✅ | ✅ | - | - |
| Queues list | ✅ | ✅ | - | - |
| Queue management | ✅ | ❌ | P2 | Medium |
| Task assignment | ✅ | ❌ | P2 | Medium |

### Reports Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| Report list | ✅ | ✅ | - | - |
| Report viewer | ✅ | ❌ | P2 | High |
| Create report | ✅ | ❌ | P2 | Medium |
| Share reports | ✅ | ❌ | P3 | Medium |

### Settings Module

| Feature | Angular | Next.js | Priority | Effort |
|---------|---------|---------|----------|--------|
| User preferences | ✅ | ✅ | - | - |
| Workspace settings | ✅ | ❌ | P2 | Medium |
| API credentials | ✅ | ❌ | P1 | Low |
| User management | ✅ | ❌ | P3 | High |

---

## State Management Differences

### Angular Implementation

**Framework**: NgRx (Redux pattern)

**Key Concepts**:
1. **Store Structure**:
   ```typescript
   export interface UsersState {
     currentUser: GetCurrentUserResponseUserObject;
     activeWorkspace: GetCurrentUserResponseUserObjectCompany;
     userWorkspaces: OrganizationGetUserCompaniesResponseCompanies[];
     selectedWorkspaceTab: GetCurrentUserResponseUserObjectCompany;
     workspaces: GetCurrentUserResponseUserObjectCompany[];
     showOnlyUserWork: { [key: string]: boolean };
     serverVersions: { server: string; api: string };
     gettingStarted: GettingStarted;
     settings: UsersGetCurrentUserResponseSettings;
   }
   ```

2. **Actions**:
   - Defined as typed actions using `createAction`
   - Examples: `fetchCurrentUser`, `setCurrentUserName`, `logout`, `setApiVersion`

3. **Reducers**:
   - Pure functions that handle actions
   - Use `on()` helper for action handlers
   ```typescript
   on(setCurrentUserName, (state, action) => ({
     ...state,
     currentUser: {...state.currentUser, name: action.name}
   }))
   ```

4. **Selectors**:
   - Use `createSelector` for memoized derived state
   ```typescript
   export const selectCurrentUser = createSelector(users, state => state.currentUser);
   export const selectIsAdmin = createSelector(
     users,
     state => state.currentUser?.role === RoleEnum.Admin
   );
   ```

5. **Effects** (Side effects):
   - Handle async operations
   - Listen to actions, perform API calls, dispatch new actions

### Next.js Implementation

**Framework**: Zustand + TanStack Query

**Key Concepts**:

1. **Auth Store** (Zustand):
   ```typescript
   export interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     rememberMe: boolean;
   }

   export interface AuthActions {
     setUser: (user: User | null) => void;
     setToken: (token: string | null) => void;
     setRememberMe: (remember: boolean) => void;
     login: (user: User, token: string, remember?: boolean) => void;
     logout: () => void;
     updateUserPreferences: (preferences: Record<string, unknown>) => void;
   }
   ```

2. **Server State** (TanStack Query):
   - Handles API data fetching, caching, and synchronization
   - Automatic background refetching
   - Optimistic updates
   ```typescript
   const { data: tasks, isLoading } = useTasks({
     page: 1,
     pageSize: 50,
     project: projectId
   });
   ```

3. **Differences**:
   - **Simpler Mental Model**: Less boilerplate than NgRx
   - **Automatic Caching**: TanStack Query handles server state caching
   - **No Actions/Reducers**: Direct state mutations in Zustand
   - **Hooks-based**: More React-idiomatic
   - **Smaller Bundle**: Less code overhead

### Missing Auth Store Features

**Priority 1**:
1. ❌ **Auth Mode Storage**: Store selected login mode
   ```typescript
   export interface AuthState {
     // ... existing fields
     authMode: LoginMode | null;
     credentials: Credentials | null;
   }

   export interface AuthActions {
     // ... existing methods
     setAuthMode: (mode: LoginMode) => void;
     setCredentials: (credentials: Credentials) => void;
   }
   ```

2. ❌ **Tenant Support**: Store tenant selection
   ```typescript
   export interface AuthState {
     // ... existing fields
     selectedTenant: string | null;
     availableTenants: string[];
   }

   export interface AuthActions {
     // ... existing methods
     setTenant: (tenant: string) => void;
     setTenants: (tenants: string[]) => void;
   }
   ```

3. ❌ **Workspace State**: Store active workspace
   ```typescript
   export interface AuthState {
     // ... existing fields
     activeWorkspace: Workspace | null;
     userWorkspaces: Workspace[];
   }

   export interface AuthActions {
     // ... existing methods
     setActiveWorkspace: (workspace: Workspace) => void;
     setWorkspaces: (workspaces: Workspace[]) => void;
   }
   ```

---

## Priority Levels for Fixes

### Priority 1 (Blocking for Production)

**Timeline**: Immediate (Current Sprint)

**Issues**:

1. **API Client - Response Unwrapping** ⚠️
   - **Impact**: ALL API calls fail or return incorrect data
   - **File**: `src/lib/api/client.ts`
   - **Fix**: Implement `.data` extraction from `SmHttpResponse`
   - **Effort**: 1-2 hours
   - **Status**: ❌ Not started

2. **API Client - X-Clearml-Client Header** ⚠️
   - **Impact**: Server may reject requests or behave unexpectedly
   - **File**: `src/lib/api/client.ts`
   - **Fix**: Add header with version info
   - **Effort**: 30 minutes
   - **Status**: ❌ Not started

3. **API Client - Retry Logic** ⚠️
   - **Impact**: Network errors cause immediate failures
   - **File**: `src/lib/api/client.ts`
   - **Fix**: Add exponential backoff retry
   - **Effort**: 1 hour
   - **Status**: ❌ Not started

4. **Auth - Login Mode Detection** ⚠️
   - **Impact**: Can't connect to servers with different auth configs
   - **File**: `src/lib/api/auth.ts`
   - **Fix**: Call `login.supported_modes` before login
   - **Effort**: 2-3 hours
   - **Status**: ❌ Not started

5. **Auth - credentials.json Support** ⚠️
   - **Impact**: Simple mode (passwordless) auth doesn't work
   - **File**: `src/lib/api/auth.ts`
   - **Fix**: Load and use credentials from file/env
   - **Effort**: 1-2 hours
   - **Status**: ❌ Not started

6. **Auth - Basic Auth Encoding** ⚠️
   - **Impact**: Authentication fails for all modes
   - **File**: `src/lib/api/auth.ts`
   - **Fix**: Implement base64(key:secret) encoding
   - **Effort**: 30 minutes
   - **Status**: ❌ Not started

7. **Auth Store - Mode Support** ⚠️
   - **Impact**: Can't persist auth mode selection
   - **File**: `src/lib/stores/auth.ts`
   - **Fix**: Add authMode and credentials fields
   - **Effort**: 1 hour
   - **Status**: ❌ Not started

**Total Effort**: 1-2 days

### Priority 2 (Important for Feature Parity)

**Timeline**: Next 2-4 weeks

**Issues**:

1. **Task Actions** (enqueue, abort, reset, publish)
   - **Effort**: 3-5 days

2. **Model Versions Management**
   - **Effort**: 2-3 days

3. **Dataset Versions Management**
   - **Effort**: 2-3 days

4. **Task Comparison**
   - **Effort**: 5-7 days

5. **Pipeline Run Management**
   - **Effort**: 3-4 days

6. **Queue Management**
   - **Effort**: 2-3 days

7. **Workspace Settings**
   - **Effort**: 3-4 days

8. **SSO Authentication**
   - **Effort**: 5-7 days

9. **Tenant Selection**
   - **Effort**: 2-3 days

10. **Report Viewer**
    - **Effort**: 5-7 days

**Total Effort**: 6-8 weeks

### Priority 3 (Nice to Have)

**Timeline**: Future iterations

**Issues**:

1. **Project Permissions Management**
   - **Effort**: 7-10 days

2. **Dataset Lineage Visualization**
   - **Effort**: 5-7 days

3. **User Management (Admin)**
   - **Effort**: 7-10 days

4. **Share Reports**
   - **Effort**: 3-5 days

5. **Debug Samples Advanced Features**
   - **Effort**: 7-10 days

**Total Effort**: 6-8 weeks

---

## Breaking Changes

### API Patterns

**Angular Pattern**:
```typescript
// Request
this.http.post<{data: UsersGetAllResponse}>(`${this.basePath}/users.get_all`, null)
  .pipe(map(x => x.data.users));

// Response structure
{
  "data": {
    "users": [...]
  },
  "meta": {
    "id": "...",
    "trx": "..."
  }
}
```

**Next.js Pattern (Current - INCORRECT)**:
```typescript
// Request
const response = await apiRequest<{ user: User }>('users.get_current_user', {});
return response.user;  // ❌ Missing .data extraction

// Expected response structure (INCORRECT)
{
  "user": {...}
}
```

**Next.js Pattern (Corrected)**:
```typescript
// Request
const response = await apiClient.post('users.get_current_user', { json: {} });
const data = await response.json();
return data.data.user;  // ✅ Correct: response.data.user

// Actual response structure
{
  "data": {
    "user": {...}
  },
  "meta": {
    "id": "...",
    "trx": "..."
  }
}
```

### Authentication Flow

**Angular Flow**:
1. Call `login.supported_modes` → get auth config
2. Check if `simple` mode → load `credentials.json`
3. If simple: auto-create user → impersonate → login
4. If password: prompt credentials → Basic Auth login
5. If SSO: redirect to SSO provider
6. Store session cookie (server-side)

**Next.js Flow (Current - INCORRECT)**:
1. ❌ No mode detection
2. ❌ Always assume password mode
3. ❌ No credentials loading
4. ❌ No simple mode support
5. ❌ No SSO support
6. ✅ Store token in localStorage

**Next.js Flow (Corrected)**:
1. Call `login.supported_modes` → get auth config
2. If simple mode detected → load `credentials.json` or env vars
3. Show appropriate login UI based on mode
4. Execute mode-specific auth flow
5. Store token + mode in localStorage/auth store
6. Support session cookies for SSO

### Environment Configuration

**Angular**:
```typescript
// src/environments/base.ts
export interface Environment {
  apiBaseUrl: string;
  headerPrefix: string;  // 'X-Clearml'
  version: string;
  userKey: string;
  userSecret: string;
  companyID: string;
  // ... 50+ more fields
}
```

**Next.js**:
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.clear.ml/v2.0
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_USER_KEY=...
NEXT_PUBLIC_USER_SECRET=...
NEXT_PUBLIC_COMPANY_ID=...
```

---

## Implementation Checklist

### Phase 1: API Client Fixes (Priority 1)

- [ ] Add `SmHttpResponse` interface
- [ ] Implement automatic response unwrapping in `apiRequest()`
- [ ] Add `X-Clearml-Client` header with version
- [ ] Implement retry logic with exponential backoff
- [ ] Add error response parsing
- [ ] Update all API endpoint calls to use new pattern
- [ ] Add unit tests for API client

### Phase 2: Authentication Fixes (Priority 1)

- [ ] Add `LoginMode` types and interfaces
- [ ] Implement `getLoginSupportedModes()` function
- [ ] Add `loadCredentials()` function for credentials.json
- [ ] Implement `loginWithBasicAuth()` function
- [ ] Implement `loginSimpleMode()` with user creation
- [ ] Fix `getCurrentUser()` response unwrapping
- [ ] Update login page to support multiple modes
- [ ] Add mode selection UI

### Phase 3: Auth Store Updates (Priority 1)

- [ ] Add `authMode` field to store
- [ ] Add `credentials` field to store
- [ ] Add `setAuthMode()` action
- [ ] Add `setCredentials()` action
- [ ] Persist auth mode in localStorage
- [ ] Update login flow to store mode
- [ ] Add tenant fields (for future P2 support)

### Phase 4: Testing & Validation

- [ ] Test against ClearML community server
- [ ] Test against ClearML enterprise server
- [ ] Test simple mode (passwordless)
- [ ] Test password mode
- [ ] Test response unwrapping for all endpoints
- [ ] Test retry logic with network errors
- [ ] Verify X-Clearml-Client header is sent
- [ ] Load test with concurrent requests

---

## Migration Success Metrics

### Technical Metrics

1. **API Compatibility**: 100% compatible with ClearML API v2.0+
2. **Response Handling**: All endpoints correctly unwrap `.data.data` pattern
3. **Authentication**: Support all auth modes (simple, password, SSO)
4. **Error Rate**: < 0.1% for network errors (with retry)
5. **Performance**: API response time within 10% of Angular version

### Feature Parity Metrics

1. **Priority 1 Features**: 100% complete
2. **Priority 2 Features**: 80% complete (within 8 weeks)
3. **Priority 3 Features**: Backlog (future)

### User Experience Metrics

1. **Login Success Rate**: > 99%
2. **Page Load Time**: < 2s for initial load
3. **Time to Interactive**: < 3s
4. **Error Messages**: Clear, actionable messages for all failure cases

---

## Resources

### Angular Implementation References

- **API Service**: `src/app/business-logic/api-services/api-requests.service.ts`
- **Login Service**: `src/app/webapp-common/shared/services/login.service.ts`
- **API Models**: `src/app/business-logic/model/api-request.ts`
- **Interceptor**: `src/app/webapp-common/core/interceptors/webapp-interceptor.ts`
- **Environment**: `src/environments/base.ts`
- **Users Reducer**: `src/app/webapp-common/core/reducers/users-reducer.ts`

### Next.js Implementation Files

- **API Client**: `src/lib/api/client.ts`
- **Auth API**: `src/lib/api/auth.ts`
- **Auth Store**: `src/lib/stores/auth.ts`
- **Login Page**: `src/app/(auth)/login/page.tsx`
- **Auth Hook**: `src/lib/hooks/use-auth.ts`

### ClearML API Documentation

- API Base URL: `https://api.clear.ml/v2.0`
- Endpoint Format: `{base_url}/{service}.{method}`
- Examples:
  - `login.supported_modes`
  - `auth.login`
  - `auth.create_user`
  - `users.get_current_user`
  - `tasks.get_all`

---

## Conclusion

The Next.js migration is well underway with solid foundation work completed. However, **Priority 1 issues are blocking production deployment**. The main issues are:

1. **API Response Handling**: The ClearML API uses a nested `.data.data` structure that isn't currently being unwrapped
2. **Authentication Flow**: Missing support for multiple auth modes, especially the `simple` (passwordless) mode
3. **Client Headers**: Missing required `X-Clearml-Client` header
4. **Retry Logic**: No resilience for network errors

**Estimated effort to unblock**: 1-2 days of focused development

Once Priority 1 issues are resolved, the application will be **production-ready** for basic use cases, with Priority 2 features to follow over the next 6-8 weeks.
