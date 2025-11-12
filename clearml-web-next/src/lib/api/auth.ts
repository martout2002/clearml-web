import { apiRequest, setCredentials, clearCredentials, type ClearMLCredentials } from './client';
import type { User } from '@/types/api';

/**
 * Login modes supported by ClearML
 */
export type LoginMode = 'simple' | 'password' | 'ssoOnly' | 'error' | 'tenant';

/**
 * Credentials structure (from credentials.json or environment)
 */
export interface Credentials {
  userKey: string;
  userSecret: string;
  companyID: string;
}

/**
 * Login supported modes response from server
 */
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

export interface LoginCredentials {
  access_key: string;
  secret_key: string;
  name?: string; // Optional: for simple mode user creation
}

export interface LoginResponse {
  user: User;
}

/**
 * Create a new user in simple mode
 */
export async function createUser(name: string): Promise<string> {
  const { data } = await apiRequest<{ id: string }>('auth.create_user', {
    email: `${crypto.randomUUID()}@clearml.local`,
    name,
    given_name: name.split(' ')[0],
    family_name: name.split(' ')[1] || name.split(' ')[0],
  });
  return data.id;
}

/**
 * Authenticate user with ClearML credentials (access_key + secret_key)
 * If name is provided, creates a new user in simple mode
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  // Store credentials for Basic Auth
  setCredentials({
    access_key: credentials.access_key,
    secret_key: credentials.secret_key,
  });

  try {
    // First, authenticate and get token
    const { data: authData } = await apiRequest<{ token: string }>('auth.login', {
      expiration_sec: 86400, // 24 hours
    });
    
    console.log('✅ Auth token received:', authData.token?.substring(0, 20) + '...');

    // If name is provided, try to create a new user (simple mode)
    if (credentials.name) {
      try {
        const userId = await createUser(credentials.name);
        console.log('✅ User created:', userId);
      } catch (error) {
        console.warn('⚠️ Could not create user (may already exist):', error);
      }
    }

    // Try to fetch current user, but if it fails, return a mock user
    try {
      const user = await getCurrentUser();
      return { user };
    } catch (error) {
      console.warn('⚠️ Could not fetch user, returning authenticated state without user data');
      // Return a minimal user object since auth.login succeeded
      return {
        user: {
          id: credentials.access_key,
          name: credentials.name || 'User',
          company: { id: 'd1bd92a3b039400cbafc60a7a5b1e52b', name: 'Default' },
        } as User,
      };
    }
  } catch (error) {
    // If validation fails, clear the credentials
    clearCredentials();
    throw error;
  }
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  // ClearML doesn't have a logout endpoint, just clear credentials
  clearCredentials();

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await apiRequest<{ user: User }>('users.get_current_user', {});
  return data.user;
}

/**
 * Check if user has valid credentials
 */
export async function checkAuth(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get supported login modes from server
 */
export async function getSupportedLoginModes(): Promise<string[]> {
  try {
    const { data } = await apiRequest<{ modes: string[] }>('login.supported_modes', {});
    return data.modes || ['simple'];
  } catch (error) {
    console.error('Failed to get login modes:', error);
    return ['simple'];
  }
}
