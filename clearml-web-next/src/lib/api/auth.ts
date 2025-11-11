import { apiRequest, apiClient, setAuthToken, clearAuthToken, SmHttpResponse } from './client';
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
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token?: string;
  user?: User;
}

export interface RefreshTokenResponse {
  token: string;
}

/**
 * Check what login modes are supported by the server
 */
export async function getLoginSupportedModes(): Promise<LoginModeResponse> {
  try {
    const response = await apiRequest<LoginModeResponse>('login.supported_modes', {});
    return response;
  } catch (error) {
    // Fallback if endpoint fails
    return {
      authenticated: false,
      basic: { enabled: true },
    };
  }
}

/**
 * Determine the login mode based on server response
 */
export function calcLoginMode(response: LoginModeResponse): LoginMode {
  // If already authenticated, simple mode
  if (response.authenticated) {
    return 'simple';
  }

  // If basic auth enabled, use password mode
  if (response.basic?.enabled) {
    return 'password';
  }

  // If SSO only
  if (response.sso?.enabled && !response.basic?.enabled) {
    return 'ssoOnly';
  }

  // Fallback to simple (passwordless)
  return 'simple';
}

/**
 * Load credentials from credentials.json or environment variables
 */
export async function loadCredentials(): Promise<Credentials | null> {
  // Try loading from public credentials.json first
  try {
    const response = await fetch('/credentials.json');
    if (response.ok) {
      const creds = await response.json();
      return {
        userKey: creds.userKey || creds.user_key,
        userSecret: creds.userSecret || creds.user_secret,
        companyID: creds.companyID || creds.company_id,
      };
    }
  } catch (error) {
    console.log('No credentials.json found, checking environment variables');
  }

  // Fallback to environment variables
  const userKey = process.env.NEXT_PUBLIC_USER_KEY;
  const userSecret = process.env.NEXT_PUBLIC_USER_SECRET;
  const companyID = process.env.NEXT_PUBLIC_COMPANY_ID;

  if (userKey && userSecret && companyID) {
    return { userKey, userSecret, companyID };
  }

  return null;
}

/**
 * Initialize credentials and determine login mode
 */
export async function initializeAuth(): Promise<{
  mode: LoginMode;
  credentials: Credentials | null;
  modeResponse: LoginModeResponse;
}> {
  // Get supported login modes
  const modeResponse = await getLoginSupportedModes();
  const mode = calcLoginMode(modeResponse);

  // Load credentials if in simple mode
  let credentials: Credentials | null = null;
  if (mode === 'simple') {
    credentials = await loadCredentials();
  }

  return { mode, credentials, modeResponse };
}

/**
 * Login with Basic Auth (username + password)
 */
export async function loginWithBasicAuth(
  username: string,
  password: string
): Promise<LoginResponse> {
  try {
    // Encode credentials as Basic Auth
    const auth = typeof window !== 'undefined'
      ? window.btoa(`${username}:${password}`)
      : Buffer.from(`${username}:${password}`).toString('base64');

    const response = await apiClient.post('auth.login', {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      credentials: 'include',
    });

    const data = await response.json() as SmHttpResponse<LoginResponse>;

    // ClearML uses session cookies, so token may not be present
    // Store token if provided
    if (data.data?.token) {
      setAuthToken(data.data.token);
    }

    return data.data || {};
  } catch (error: any) {
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Login in simple mode (passwordless) - creates user if needed
 */
export async function loginSimpleMode(
  name: string,
  credentials: Credentials
): Promise<LoginResponse> {
  try {
    // Encode credentials as Basic Auth
    const auth = typeof window !== 'undefined'
      ? window.btoa(`${credentials.userKey}:${credentials.userSecret}`)
      : Buffer.from(`${credentials.userKey}:${credentials.userSecret}`).toString('base64');

    // Step 1: Try to create a new user
    const createResponse = await apiClient.post('auth.create_user', {
      json: {
        email: `${crypto.randomUUID()}@test.ai`,
        name,
        company: credentials.companyID,
        given_name: name.split(' ')[0],
        family_name: name.split(' ')[1] || name.split(' ')[0],
      },
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const createData = await createResponse.json() as SmHttpResponse<{ id: string }>;
    const userId = createData.data.id;

    // Step 2: Login as the created user (impersonation)
    const loginResponse = await apiClient.post('auth.login', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'X-Clearml-Impersonate-As': userId,
      },
      credentials: 'include',
    });

    const loginData = await loginResponse.json() as SmHttpResponse<LoginResponse>;

    // Store token if provided
    if (loginData.data?.token) {
      setAuthToken(loginData.data.token);
    }

    return loginData.data || {};
  } catch (error: any) {
    throw new Error(error.message || 'Simple mode login failed');
  }
}

/**
 * Authenticate user with credentials (password mode)
 * @deprecated Use loginWithBasicAuth instead
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  return loginWithBasicAuth(credentials.username, credentials.password);
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest('auth.logout', {});
  } finally {
    // Always clear the token, even if the request fails
    clearAuthToken();
  }
}

/**
 * Get the currently authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  // apiRequest already unwraps the .data, so we get { user: User } directly
  const response = await apiRequest<{ user: User }>('users.get_current_user', {});
  return response.user;
}

/**
 * Refresh the authentication token
 */
export async function refreshToken(): Promise<string> {
  const response = await apiRequest<RefreshTokenResponse>('auth.refresh', {});

  if (response.token) {
    setAuthToken(response.token);
  }

  return response.token;
}

/**
 * Validate the current token
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest('auth.request_password_reset', {
    email,
  });
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await apiRequest('auth.reset_password', {
    token,
    password: newPassword,
  });
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await apiRequest('auth.change_password', {
    old_password: oldPassword,
    new_password: newPassword,
  });
}
