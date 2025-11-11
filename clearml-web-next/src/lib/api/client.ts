import ky from 'ky';
import packageJson from '../../../package.json';

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
 * ClearML API response wrapper
 */
export interface ClearMLResponse<T = any> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
  };
}

/**
 * ClearML credentials structure
 */
export interface ClearMLCredentials {
  access_key: string;
  secret_key: string;
}

/**
 * Base API client configured with ClearML API defaults
 */
export const apiClient = ky.create({
  prefixUrl: API_URL,
  credentials: 'include',
  timeout: 30000,
  retry: {
    limit: 3,
    methods: ['get', 'post'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    backoffLimit: 3000,
  },
  headers: {
    'Content-Type': 'application/json',
    'X-Clearml-Client': `Webapp-${packageJson.version}`,
  },
  hooks: {
    beforeRequest: [
      (request) => {
        console.log('🔵 API Request:', {
          url: request.url,
          method: request.method,
        });
        
        // Add Basic Auth from credentials
        const credentials = getCredentials();
        if (credentials) {
          const basicAuth = btoa(`${credentials.access_key}:${credentials.secret_key}`);
          request.headers.set('Authorization', `Basic ${basicAuth}`);
          console.log('🔑 Added auth header:', `Basic ${credentials.access_key.substring(0, 10)}...`);
        } else {
          console.warn('⚠️ No credentials found!');
        }
      },
    ],
    beforeRetry: [
      async ({ request, error, retryCount }) => {
        console.log(`Retrying request (${retryCount}/3):`, request.url, error);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        console.log('🔴 API Response:', {
          url: request.url,
          status: response.status,
          statusText: response.statusText,
        });
        
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          console.warn('⚠️ 401 Unauthorized - redirecting to login');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }

        if (!response.ok) {
          // Try to parse ClearML error format
          const error: any = await response.json().catch(() => ({
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
 * Get ClearML credentials from storage
 */
function getCredentials(): ClearMLCredentials | null {
  if (typeof window === 'undefined') return null;

  // Check localStorage
  const stored = localStorage.getItem('clearml_credentials');
  if (stored) {
    try {
      return JSON.parse(stored) as ClearMLCredentials;
    } catch (e) {
      console.error('Failed to parse stored credentials:', e);
    }
  }

  // Check environment variables (for development)
  const envKey = process.env.NEXT_PUBLIC_CLEARML_ACCESS_KEY;
  const envSecret = process.env.NEXT_PUBLIC_CLEARML_SECRET_KEY;

  if (envKey && envSecret) {
    return {
      access_key: envKey,
      secret_key: envSecret,
    };
  }

  return null;
}

/**
 * Set ClearML credentials
 */
export function setCredentials(credentials: ClearMLCredentials): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clearml_credentials', JSON.stringify(credentials));
}

/**
 * Clear ClearML credentials
 */
export function clearCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('clearml_credentials');
}

/**
 * Generic API request wrapper with automatic response unwrapping
 */
export async function apiRequest<T>(
  endpoint: string,
  body?: unknown
): Promise<{ data: T; meta?: any }> {
  const response = await apiClient.post(endpoint, {
    json: body,
  });

  const result = await response.json() as ClearMLResponse<T>;

  console.log('📦 API Data received:', { endpoint, hasData: !!result.data });

  return {
    data: result.data,
    meta: result.meta,
  };
}
