import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/api';
import type { LoginMode, Credentials } from '@/lib/api/auth';

export interface Workspace {
  id: string;
  name: string;
  tier?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  authMode: LoginMode | null;
  credentials: Credentials | null;
  activeWorkspace: Workspace | null;
  userWorkspaces: Workspace[];
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRememberMe: (remember: boolean) => void;
  setAuthMode: (mode: LoginMode | null) => void;
  setCredentials: (credentials: Credentials | null) => void;
  setActiveWorkspace: (workspace: Workspace | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  login: (user: User, token?: string, remember?: boolean) => void;
  logout: () => void;
  updateUserPreferences: (preferences: Record<string, unknown>) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  rememberMe: false,
  authMode: null,
  credentials: null,
  activeWorkspace: null,
  userWorkspaces: [],
};

/**
 * Zustand store for authentication state management
 *
 * Features:
 * - User state management
 * - Token persistence in localStorage
 * - Remember me functionality
 * - User preferences management
 * - Auth mode support (simple, password, SSO, tenant)
 * - Workspace management
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) =>
        set({
          token,
        }),

      setRememberMe: (remember) =>
        set({
          rememberMe: remember,
        }),

      setAuthMode: (mode) =>
        set({
          authMode: mode,
        }),

      setCredentials: (credentials) =>
        set({
          credentials,
        }),

      setActiveWorkspace: (workspace) =>
        set({
          activeWorkspace: workspace,
        }),

      setWorkspaces: (workspaces) =>
        set({
          userWorkspaces: workspaces,
        }),

      login: (user, token, remember = false) => {
        set({
          user,
          token: token || null,
          isAuthenticated: true,
          rememberMe: remember,
        });

        // Store token in localStorage for API client (if provided)
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('clearml_token', token);
        }
      },

      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('clearml_token');
        }

        set({
          ...initialState,
        });
      },

      updateUserPreferences: (preferences) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              preferences: {
                ...currentUser.preferences,
                ...preferences,
              },
            },
          });
        }
      },
    }),
    {
      name: 'clearml-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.rememberMe ? state.user : null,
        token: state.rememberMe ? state.token : null,
        isAuthenticated: state.rememberMe ? state.isAuthenticated : false,
        rememberMe: state.rememberMe,
        authMode: state.authMode, // Always persist auth mode
        credentials: state.credentials, // Always persist credentials (for simple mode)
        activeWorkspace: state.activeWorkspace,
        userWorkspaces: state.userWorkspaces,
      }),
    }
  )
);

/**
 * Selectors for common auth state
 */
export const selectUser = (state: AuthStore) => state.user;
export const selectToken = (state: AuthStore) => state.token;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectRememberMe = (state: AuthStore) => state.rememberMe;
export const selectAuthMode = (state: AuthStore) => state.authMode;
export const selectCredentials = (state: AuthStore) => state.credentials;
export const selectActiveWorkspace = (state: AuthStore) => state.activeWorkspace;
export const selectUserWorkspaces = (state: AuthStore) => state.userWorkspaces;
