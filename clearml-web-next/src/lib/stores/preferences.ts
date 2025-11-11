import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface TablePreferences {
  pageSize: number;
  density: 'compact' | 'comfortable' | 'spacious';
  columnOrder?: string[];
  hiddenColumns?: string[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskComplete: boolean;
  taskFailed: boolean;
  projectUpdates: boolean;
  weeklyReports: boolean;
}

export interface PreferencesState {
  theme: Theme;
  locale: Locale;
  sidebarCollapsed: boolean;
  tablePreferences: TablePreferences;
  notifications: NotificationSettings;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

export interface PreferencesActions {
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTablePreferences: (preferences: Partial<TablePreferences>) => void;
  setNotifications: (notifications: Partial<NotificationSettings>) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  resetPreferences: () => void;
}

export type PreferencesStore = PreferencesState & PreferencesActions;

const initialState: PreferencesState = {
  theme: 'system',
  locale: 'en',
  sidebarCollapsed: false,
  tablePreferences: {
    pageSize: 20,
    density: 'comfortable',
  },
  notifications: {
    email: true,
    push: false,
    taskComplete: true,
    taskFailed: true,
    projectUpdates: true,
    weeklyReports: false,
  },
  autoRefresh: true,
  refreshInterval: 30,
};

/**
 * Zustand store for user preferences and UI settings
 *
 * Features:
 * - Theme management (light/dark/system)
 * - Locale/language settings
 * - Sidebar state persistence
 * - Table display preferences
 * - Notification preferences
 * - Auto-refresh settings
 * - Persisted to localStorage
 */
export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) =>
        set({
          theme,
        }),

      setLocale: (locale) =>
        set({
          locale,
        }),

      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setSidebarCollapsed: (collapsed) =>
        set({
          sidebarCollapsed: collapsed,
        }),

      setTablePreferences: (preferences) =>
        set((state) => ({
          tablePreferences: {
            ...state.tablePreferences,
            ...preferences,
          },
        })),

      setNotifications: (notifications) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...notifications,
          },
        })),

      setAutoRefresh: (enabled) =>
        set({
          autoRefresh: enabled,
        }),

      setRefreshInterval: (interval) =>
        set({
          refreshInterval: interval,
        }),

      resetPreferences: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: 'clearml-preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Selectors for common preferences
 */
export const selectTheme = (state: PreferencesStore) => state.theme;
export const selectLocale = (state: PreferencesStore) => state.locale;
export const selectSidebarCollapsed = (state: PreferencesStore) =>
  state.sidebarCollapsed;
export const selectTablePreferences = (state: PreferencesStore) =>
  state.tablePreferences;
export const selectNotifications = (state: PreferencesStore) =>
  state.notifications;
export const selectAutoRefresh = (state: PreferencesStore) => state.autoRefresh;
export const selectRefreshInterval = (state: PreferencesStore) =>
  state.refreshInterval;
