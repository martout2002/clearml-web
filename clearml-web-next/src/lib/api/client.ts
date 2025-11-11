import ky from 'ky';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clear.ml/v2.0';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '2.2.0';

/**
 * ClearML API response structure
 * The API wraps all responses in a data/meta envelope
 */
export interface SmHttpResponse<T = any> {
  data: T;
  meta?: {
    id?: string;
    trx?: string;
    endpoint?: string;
    result_code?: number;
    result_subcode?: number;
    result_msg?: string;
    error_stack?: string;
  };
}

/**
 * Base API client configured with ClearML API defaults
 */
export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Clearml-Client': `NextJS-${APP_VERSION}`,
  },
  retry: {
    limit: 3,
    methods: ['post', 'get', 'put'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 5000,
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token from cookie or localStorage
        const token = getAuthToken();
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        if (!response.ok) {
          // Try to parse ClearML error format
          const error = await response.json().catch(() => ({
            meta: { result_msg: 'An error occurred' },
          }));

          const message = error.meta?.result_msg || error.message || 'API request failed';
          const errorObj = new Error(message) as any;
          errorObj.code = error.meta?.result_code;
          errorObj.subcode = error.meta?.result_subcode;
          errorObj.stack = error.meta?.error_stack;

          throw errorObj;
        }

        return response;
      },
    ],
  },
});

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Check localStorage
  const token = localStorage.getItem('clearml_token');
  if (token) return token;

  // Check cookie
  const cookieName = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'clearml_token';
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${cookieName}=`));

  return cookie ? cookie.split('=')[1] : null;
}

/**
 * Set authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clearml_token', token);
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('clearml_token');
}

/**
 * Generic API request wrapper
 * Automatically unwraps ClearML's response.data structure
 */
export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await apiClient.post(endpoint, {
    json: body,
  });

  const wrappedData = await response.json() as SmHttpResponse<T>;

  // ClearML API wraps responses: { data: {...}, meta: {...} }
  // We extract and return just the data portion
  return wrappedData.data;
}

/**
 * API request that returns the full SmHttpResponse with meta information
 * Use this when you need access to meta fields (trx, result_code, etc.)
 */
export async function apiRequestFull<T>(
  endpoint: string,
  body?: unknown
): Promise<SmHttpResponse<T>> {
  const response = await apiClient.post(endpoint, {
    json: body,
  });

  return await response.json() as SmHttpResponse<T>;
}
