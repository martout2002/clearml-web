import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth';
import * as authApi from '../api/auth';
import type { User } from '@/types/api';

/**
 * Query key factory for auth
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  validate: () => [...authKeys.all, 'validate'] as const,
};

/**
 * Hook to access auth state and actions
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUserPreferences = useAuthStore((state) => state.updateUserPreferences);

  return {
    user,
    token,
    isAuthenticated,
    rememberMe,
    login,
    logout,
    setUser,
    updateUserPreferences,
  };
}

/**
 * Get the current user from the API
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<User>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated, setUser } = useAuth();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const user = await authApi.getCurrentUser();
      setUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    ...options,
  });
}

/**
 * Login mutation
 */
export function useLogin(
  options?: UseMutationOptions<
    authApi.LoginResponse,
    Error,
    authApi.LoginCredentials
  >
) {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      // Update auth store
      authStore.login(data.user, data.token, variables.remember);

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      options?.onSuccess?.(data, variables, undefined);
    },
    onError: (error, variables, context) => {
      // Clear any stale auth data on login failure
      authStore.logout();
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

/**
 * Logout mutation
 */
export function useLogout(options?: UseMutationOptions<void, Error, void>) {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (data, variables, context) => {
      // Clear auth store
      authStore.logout();

      // Clear all queries
      queryClient.clear();

      // Redirect to login
      router.push('/login');

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Even on error, clear local auth state
      authStore.logout();
      queryClient.clear();
      router.push('/login');

      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken(
  options?: UseMutationOptions<string, Error, void>
) {
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (token, variables, context) => {
      authStore.setToken(token);
      options?.onSuccess?.(token, variables, context);
    },
    ...options,
  });
}

/**
 * Validate token query
 */
export function useValidateToken(
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: authApi.validateToken,
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    retry: false,
    ...options,
  });
}

/**
 * Hook to protect routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return { isAuthenticated };
}

/**
 * Hook to redirect authenticated users (e.g., from login page)
 */
export function useRedirectIfAuthenticated(redirectTo = '/') {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  return { isAuthenticated };
}

/**
 * Change password mutation
 */
export function useChangePassword(
  options?: UseMutationOptions<
    void,
    Error,
    { oldPassword: string; newPassword: string }
  >
) {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }) =>
      authApi.changePassword(oldPassword, newPassword),
    ...options,
  });
}

/**
 * Request password reset mutation
 */
export function useRequestPasswordReset(
  options?: UseMutationOptions<void, Error, string>
) {
  return useMutation({
    mutationFn: authApi.requestPasswordReset,
    ...options,
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword(
  options?: UseMutationOptions<
    void,
    Error,
    { token: string; newPassword: string }
  >
) {
  return useMutation({
    mutationFn: ({ token, newPassword }) =>
      authApi.resetPassword(token, newPassword),
    ...options,
  });
}
