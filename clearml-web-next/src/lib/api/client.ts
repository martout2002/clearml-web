import ky from 'ky';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.clear.ml/v2.0';

/**
 * Base API client configured with ClearML API defaults
 */
export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
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
          const error = await response.json().catch(() => ({
            message: 'An error occurred',
          }));
          throw new Error(error.message || 'API request failed');
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
 */
export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  const response = await apiClient.post(endpoint, {
    json: body,
  });

  const data = await response.json();
  return data as T;
}
