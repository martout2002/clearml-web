# ClearML Web Next.js - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Configure Environment Variables

Copy the example env file and add your ClearML credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your ClearML API credentials:

```env
# ClearML API Credentials
NEXT_PUBLIC_CLEARML_ACCESS_KEY=your_access_key_here
NEXT_PUBLIC_CLEARML_SECRET_KEY=your_secret_key_here
```

### 3. Getting Your ClearML Credentials

You can find your credentials in one of these places:

**Option A: From ClearML Server UI**
1. Log into your ClearML server
2. Go to Settings → Workspace
3. Find your Access Key and Secret Key

**Option B: From credentials.json (Angular app)**
If you have the Angular app running, credentials are in:
```
clearml-web/src/assets/credentials.json
```

**Option C: From Angular base.ts (Development Only)**
For testing, you can use the demo credentials from the Angular app:
```typescript
// From: clearml-web/src/environments/base.ts
NEXT_PUBLIC_CLEARML_ACCESS_KEY=EYVQ385RW7Y2QQUH88CZ7DWIQ1WUHP
NEXT_PUBLIC_CLEARML_SECRET_KEY=XhkH6a6ds9JBnM_MrahYyYdO-wS2bqFSm8gl-V0UZXH26Ydd6Eyi28TeBEoSr6Z3Bes
```

⚠️ **Warning**: Never commit real credentials to version control!

### 4. Start Development Server

```bash
bun dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Authentication Flow

The Next.js app uses **Free Access Mode** with ClearML API credentials, matching the Angular implementation's "simple" mode:

### How It Works (Free Access Mode)

1. **Credentials from Environment**: Access key and secret key loaded from `.env.local` or entered via login form
2. **Basic Auth**: Credentials are encoded as `Basic {base64(access_key:secret_key)}`
3. **Auto-Inject**: Every API request automatically includes the Authorization header
4. **No Login Required**: With credentials in `.env.local`, the app automatically authenticates

### Login Page

The login page allows manual entry of access_key + secret_key credentials if not using environment variables.

### API Client Features

✅ **Basic Authentication** with access_key + secret_key
✅ **X-Clearml-Client** header with version info
✅ **Response unwrapping** - automatically extracts `.data` field
✅ **Retry logic** - 3 attempts with exponential backoff
✅ **401 handling** - auto-redirect to /login
✅ **CORS proxy** - routes through Next.js to avoid CORS

---

## API Response Structure

ClearML API responses follow this structure:

```typescript
{
  "data": {
    // Actual payload
    "tasks": [...],
    "total": 1234
  },
  "meta": {
    // Optional metadata
    "total": 1234,
    "page": 1,
    "page_size": 50
  }
}
```

The API client automatically unwraps the `data` field, so you work with:

```typescript
const { data, meta } = await apiRequest<TasksResponse>('tasks.get_all_ex', {...});
// data = { tasks: [...], total: 1234 }
// meta = { total: 1234, page: 1, ... }
```

---

## Troubleshooting

### 401 Unauthorized Errors

If you see 401 errors in the console:
```
[WARNING] Returned 401 for auth.create_user - Unauthorized (invalid credentials)
```

**Causes**:
1. Invalid or missing credentials in `.env.local`
2. Credentials not matching your ClearML server
3. ClearML server not running

**Solutions**:
1. Verify credentials in `.env.local`
2. Check ClearML server is running
3. Restart Next.js dev server after changing `.env.local`

### CORS Errors

If you see CORS errors, the Next.js proxy should handle them automatically. Check:

1. `next.config.js` has the rewrite rule (already configured)
2. You're using the proxy URL: `/api/clearml` (default)
3. Restart dev server after config changes

### Hydration Warnings

Hydration mismatches are fixed in the dashboard. If you see them elsewhere:
- Use `useEffect` to generate random/date data client-side only
- Show loading skeleton during initial render

---

## Project Structure

```
clearml-web-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login)
│   │   ├── (dashboard)/       # Dashboard routes
│   │   └── providers.tsx      # Global providers
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── features/         # Feature-specific components
│   │   ├── charts/           # Chart components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utilities and libraries
│   │   ├── api/             # API client and services
│   │   ├── hooks/           # React Query hooks
│   │   └── utils/           # Utility functions
│   └── types/               # TypeScript types
├── MIGRATION_COMPARISON.md   # Angular vs Next.js comparison
├── SETUP.md                  # This file
└── .env.local.example       # Environment template
```

---

## Key Differences from Angular Version

### Authentication
- **Angular**: Multiple auth modes (simple, password, SSO, tenant)
- **Next.js**: Currently supports simple mode with credentials

### State Management
- **Angular**: NgRx store with effects
- **Next.js**: React Query for server state, Zustand for client state (planned)

### API Client
- **Angular**: RxJS observables, auto-generated services
- **Next.js**: Promises with ky, manual service definitions

See `MIGRATION_COMPARISON.md` for full comparison.

---

## Next Steps

1. ✅ **API Client** - Configured with Basic Auth
2. ✅ **Authentication** - Basic credentials-based auth
3. ⚠️ **Hooks** - Need updating for response unwrapping
4. 🔲 **Global State** - Consider Zustand for app state
5. 🔲 **Missing Features** - See MIGRATION_COMPARISON.md

---

## Resources

- [ClearML Documentation](https://clear.ml/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Migration Comparison](./MIGRATION_COMPARISON.md)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## Support

For issues or questions:
1. Check `MIGRATION_COMPARISON.md` for feature gaps
2. Review Angular implementation in `../clearml-web`
3. Check ClearML API documentation
