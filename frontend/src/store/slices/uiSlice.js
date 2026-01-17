import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebar: {
    isOpen: false,
    isMobile: false
  },
  modals: {
    login: false,
    register: false,
    createContent: false,
    createDiscussion: false
  },
  notifications: [],
  loading: {
    global: false,
    actions: {}
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    closeSidebar: (state) => {
      state.sidebar.isOpen = false;
    },
    setSidebarMobile: (state, action) => {
      state.sidebar.isMobile = action.payload;
    },

    // Modals
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        // Close all other modals
        Object.keys(state.modals).forEach(key => {
          state.modals[key] = key === modalName;
        });
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Notifications
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info', // success, error, warning, info
        message: action.payload.message,
        duration: action.payload.duration || 5000,
        timestamp: Date.now()
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notif => notif.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Loading
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setActionLoading: (state, action) => {
      const { action, isLoading } = action.payload;
      state.loading.actions[action] = isLoading;
    },
    clearActionLoading: (state, action) => {
      delete state.loading.actions[action.payload];
    }
  }
});

export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  closeSidebar,
  setSidebarMobile,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setActionLoading,
  clearActionLoading
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebar = (state) => state.ui.sidebar;
export const selectModals = (state) => state.ui.modals;
export const selectNotifications = (state) => state.ui.notifications;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectActionLoading = (action) => (state) =>
  state.ui.loading.actions[action] || false;
