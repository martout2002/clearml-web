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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const rememberMe = useAuthStore((state) => state.rememberMe);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUserPreferences = useAuthStore((state) => state.updateUserPreferences);

  return {
    user,
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
    authApi.LoginCredentials & { remember?: boolean }
  >
) {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  return useMutation({
    mutationFn: ({ access_key, secret_key }: authApi.LoginCredentials & { remember?: boolean }) =>
      authApi.login({ access_key, secret_key }),
    onSuccess: (data, variables, context) => {
      // Update auth store (credentials are already stored by authApi.login)
      authStore.login(data.user, variables.remember ?? false);

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      options?.onSuccess?.(data, variables, context);
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
 * Check auth status query
 */
export function useCheckAuth(
  options?: Omit<UseQueryOptions<boolean>, 'queryKey' | 'queryFn'>
) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: authKeys.validate(),
    queryFn: authApi.checkAuth,
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

