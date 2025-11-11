import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRememberMe: (remember: boolean) => void;
  login: (user: User, token: string, remember?: boolean) => void;
  logout: () => void;
  updateUserPreferences: (preferences: Record<string, unknown>) => void;
}

export type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  rememberMe: false,
};

/**
 * Zustand store for authentication state management
 *
 * Features:
 * - User state management
 * - Token persistence in localStorage
 * - Remember me functionality
 * - User preferences management
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

      login: (user, token, remember = false) => {
        set({
          user,
          token,
          isAuthenticated: true,
          rememberMe: remember,
        });

        // Store token in localStorage for API client
        if (typeof window !== 'undefined') {
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
