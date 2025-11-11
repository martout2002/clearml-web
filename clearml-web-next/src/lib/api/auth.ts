import { apiRequest, apiClient, setAuthToken, clearAuthToken } from './client';
import type { User } from '@/types/api';

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
}

/**
 * Authenticate user with credentials
 */
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

  // Store the token
  if (response.token) {
    setAuthToken(response.token);
  }

  return {
    token: response.token,
    user: response.user,
  };
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
