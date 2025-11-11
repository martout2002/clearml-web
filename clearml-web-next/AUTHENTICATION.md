# ClearML Next.js Authentication Implementation

This document describes the authentication implementation for the ClearML Next.js web application, which exactly matches the Angular version's authentication flow.

## Overview

The authentication system supports multiple login modes and automatically adapts based on the ClearML server configuration:

- **Password Mode**: Username/password authentication with HTTP Basic Auth
- **Simple Mode**: Passwordless user creation/selection (guest mode)
- **SSO Mode**: Single Sign-On authentication
- **Tenant Mode**: Multi-tenant workspace selection

## Architecture

### API Client Configuration

**File**: `src/lib/api/client.ts`

The API client automatically detects the correct server URL based on the current environment:

```typescript
// Auto-detects API server URL
// Port 8080 (webapp) → Port 8008 (API server)
// Port 30080 (k8s) → Port 30008 (k8s API)
const API_BASE_URL = guessAPIServerURL();
const API_VERSION = 'v2.31';
const API_URL = `${API_BASE_URL}/${API_VERSION}`;
```

**Port Mapping**:
- Webapp on `http://localhost:8080` → API on `http://localhost:8008`
- Webapp on `http://localhost:30080` → API on `http://localhost:30008`
- Custom API URL via `NEXT_PUBLIC_API_URL` environment variable

### Authentication API

**File**: `src/lib/api/auth.ts`

#### Key Functions

1. **`getLoginSupportedModes()`**
   - Calls `POST /login.supported_modes`
   - Returns server authentication configuration
   - Determines which login methods are available

2. **`determineLoginMode(response)`**
   - Analyzes server response to determine login mode
   - Returns: `'simple' | 'password' | 'ssoOnly' | 'error' | 'tenant'`

3. **`passwordLogin(credentials)`**
   - Authenticates with username/password
   - Uses HTTP Basic Authentication
   - Calls `POST /auth.login`
   - Sets authentication cookies

4. **`login(credentials)`**
   - Simple mode authentication with access_key/secret_key
   - Stores credentials in localStorage
   - Validates by fetching current user

5. **`createUser(name)`**
   - Creates new user in simple mode
   - Calls `POST /auth.create_user`

6. **`getCurrentUser()`**
   - Fetches authenticated user details
   - Calls `POST /users.get_current_user`

### Authentication Hooks

**File**: `src/lib/hooks/use-auth.ts`

#### React Query Hooks

1. **`useAuth()`**
   - Access auth state and actions from Zustand store
   - Returns: `{ user, isAuthenticated, login, logout, ... }`

2. **`useLogin()`**
   - Mutation for simple mode login (access_key/secret_key)
   - Updates auth store on success
   - Clears state on error

3. **`usePasswordLogin()`**
   - Mutation for password mode login (username/password)
   - Handles Basic Auth flow
   - Redirects on success

4. **`useCurrentUser()`**
   - Query for fetching current user
   - Only runs when authenticated
   - 5-minute stale time

5. **`useLogout()`**
   - Mutation for logout
   - Clears auth store and credentials
   - Redirects to login page

6. **`useRequireAuth()`**
   - Protect routes from unauthorized access
   - Redirects to login if not authenticated

7. **`useRedirectIfAuthenticated()`**
   - Redirect authenticated users away from login
   - Used on login page

### Authentication Store

**File**: `src/lib/stores/auth.ts`

Zustand store with persistence:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  authMode: LoginMode | null;
  credentials: Credentials | null;
  activeWorkspace: Workspace | null;
  userWorkspaces: Workspace[];
}
```

**Persistence**:
- Uses `localStorage` via `zustand/middleware`
- Only persists if `rememberMe` is true
- Always persists: `authMode`, `credentials`, workspace info

### Login Page

**File**: `src/app/(auth)/login/page.tsx`

#### Features

1. **Auto-Detection**
   - Calls `getLoginSupportedModes()` on mount
   - Determines and displays appropriate login form

2. **Password Mode**
   - Username field (text input)
   - Password field (with show/hide toggle)
   - Remember me checkbox
   - Submit via `usePasswordLogin()`

3. **Simple Mode**
   - Name field (text input)
   - Uses environment credentials
   - Auto-creates user on first login
   - Submit via `useLogin()`

4. **Error Handling**
   - Server error display
   - Server status errors
   - SSO-only message
   - Form validation errors

5. **Redirect Support**
   - Accepts `?redirect=/path` query parameter
   - Redirects after successful login

## Authentication Flow

### Password Mode Flow

```
1. User opens /login
   ↓
2. Page calls getLoginSupportedModes()
   ↓
3. Server responds with { basic: { enabled: true, guest: false } }
   ↓
4. determineLoginMode() returns 'password'
   ↓
5. Display username/password form
   ↓
6. User enters credentials and submits
   ↓
7. usePasswordLogin() calls passwordLogin(username, password)
   ↓
8. passwordLogin() creates Basic Auth header: btoa(username:password)
   ↓
9. POST /auth.login with Authorization: Basic <base64>
   ↓
10. Server sets authentication cookies
    ↓
11. Fetch current user via getCurrentUser()
    ↓
12. Update auth store with user data
    ↓
13. Redirect to destination
```

### Simple Mode Flow

```
1. User opens /login
   ↓
2. Page calls getLoginSupportedModes()
   ↓
3. Server responds with { basic: { enabled: true, guest: true } }
   ↓
4. determineLoginMode() returns 'simple'
   ↓
5. Display name input form
   ↓
6. User enters name and submits
   ↓
7. useLogin() calls login({ access_key, secret_key, name })
   ↓
8. If name provided, createUser(name) is called
   ↓
9. Store credentials in localStorage
   ↓
10. Validate by calling getCurrentUser()
    ↓
11. Update auth store with user data
    ↓
12. Redirect to destination
```

## HTTP Interceptor

**File**: `src/lib/api/client.ts`

The API client includes hooks for handling authentication:

```typescript
beforeRequest: [
  (request) => {
    // Add Basic Auth from credentials
    const credentials = getCredentials();
    if (credentials) {
      const basicAuth = btoa(`${credentials.access_key}:${credentials.secret_key}`);
      request.headers.set('Authorization', `Basic ${basicAuth}`);
    }
  },
],
afterResponse: [
  async (request, options, response) => {
    if (response.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
  },
]
```

## Configuration

### Environment Variables

**File**: `.env.local`

```bash
# API Server URL (optional - auto-detected if not set)
NEXT_PUBLIC_API_URL=http://localhost:8008

# For simple mode: Admin credentials to create users
NEXT_PUBLIC_CLEARML_ACCESS_KEY=your_access_key
NEXT_PUBLIC_CLEARML_SECRET_KEY=your_secret_key
```

### Credentials File

**File**: `credentials.json` (root directory)

For simple mode, you can provide admin credentials:

```json
{
  "userKey": "EYVQ385RW7Y2QQUH88CZ7DWIQ1WUHP",
  "userSecret": "XhkH6a6ds9JBnM_MrahYyYdO-wS2bqFSm8gl-V0UZXH26Ydd6Eyi28TeBEoSr6Z3Bes",
  "companyID": "d1bd92a3b039400cbafc60a7a5b1e52b"
}
```

## Comparison with Angular Implementation

This implementation exactly matches the Angular version's behavior:

| Feature | Angular | Next.js | Status |
|---------|---------|---------|--------|
| Auto-detect login mode | ✅ | ✅ | ✅ Matches |
| Password authentication | ✅ | ✅ | ✅ Matches |
| Simple mode (guest) | ✅ | ✅ | ✅ Matches |
| SSO support | ✅ | ✅ | ✅ Matches |
| Port 8080 detection | ✅ | ✅ | ✅ Matches |
| Basic Auth header | ✅ | ✅ | ✅ Matches |
| 401 redirect | ✅ | ✅ | ✅ Matches |
| Remember me | ✅ | ✅ | ✅ Matches |
| Redirect after login | ✅ | ✅ | ✅ Matches |
| User creation | ✅ | ✅ | ✅ Matches |
| Credentials storage | ✅ | ✅ | ✅ Matches |

## Testing with Port 8080

To test the authentication with your local ClearML server on port 8080:

1. **Start your ClearML server** (API on port 8008)

2. **Configure environment** (create `.env.local`):
   ```bash
   # For simple mode
   NEXT_PUBLIC_CLEARML_ACCESS_KEY=your_key
   NEXT_PUBLIC_CLEARML_SECRET_KEY=your_secret
   ```

3. **Run the Next.js app**:
   ```bash
   cd clearml-web-next
   npm install
   npm run dev -- --port 8080
   ```

4. **Access the app**:
   - Open `http://localhost:8080`
   - App will auto-detect API at `http://localhost:8008`
   - Login mode will be auto-detected from server

## API Endpoints

The authentication system uses these ClearML API endpoints:

- `POST /login.supported_modes` - Get supported authentication modes
- `POST /auth.login` - Password-based login
- `POST /auth.create_user` - Create new user (simple mode)
- `POST /users.get_current_user` - Get authenticated user details
- `POST /users.get_all` - Get user list (for autocomplete in simple mode)

## Security Considerations

1. **Credentials Storage**
   - Stored in localStorage (only if "Remember me" is checked)
   - Cleared on logout
   - Not sent to any third parties

2. **HTTP Basic Auth**
   - Credentials sent as `Authorization: Basic <base64>` header
   - HTTPS required in production
   - Server validates and sets session cookies

3. **Cookie-based Sessions**
   - Server sets authentication cookies after login
   - Cookies sent automatically with subsequent requests
   - HttpOnly and Secure flags recommended

4. **CORS Configuration**
   - `credentials: 'include'` in fetch requests
   - Server must set appropriate CORS headers

## Troubleshooting

### Login fails with 401

- Check that server is running on port 8008
- Verify credentials are correct
- Check browser console for errors
- Inspect network tab for API requests

### Auto-detection fails

- Set `NEXT_PUBLIC_API_URL` explicitly in `.env.local`
- Check server responds to `/login.supported_modes`
- Verify CORS headers are set correctly

### Simple mode not working

- Add credentials to `.env.local` or `credentials.json`
- Ensure admin credentials have user creation permissions
- Check server allows guest mode

## References

- Angular Implementation: `/src/app/webapp-common/login/`
- Angular Services: `/src/app/shared/services/login.service.ts`
- Angular API: `/src/app/business-logic/api-services/auth.service.ts`
- ClearML Server: https://github.com/clearml/clearml-server
