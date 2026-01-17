import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ limit = 50, offset = 0 }, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const response = await api.get(`/notifications/users/${userId}`, {
        params: { limit, offset }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب الإشعارات');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const response = await api.get(`/notifications/users/${userId}/unread-count`);
      return response.data.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب عدد الإشعارات غير المقروءة');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث الإشعار');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.id;
      if (!userId) throw new Error('User not authenticated');

      await api.patch(`/notifications/users/${userId}/read-all`);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث الإشعارات');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل حذف الإشعار');
    }
  }
);

export const deleteAllNotifications = createAsyncThunk(
  'notification/deleteAllNotifications',
  async (_, { rejectWithValue, getState }) => {
    try {
      const userId = getState().auth.user?.id;
      if (!userId) throw new Error('User not authenticated');

      await api.delete(`/notifications/users/${userId}/all`);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل حذف الإشعارات');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Add real-time notification from WebSocket
      state.notifications.unshift(action.payload);
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });

    // Mark As Read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });

    // Mark All As Read
    builder
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          if (!notification.is_read) {
            notification.is_read = true;
            notification.read_at = new Date().toISOString();
          }
        });
        state.unreadCount = 0;
      });

    // Delete Notification
    builder
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });

    // Delete All Notifications
    builder
      .addCase(deleteAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  }
});

export const {
  addNotification,
  clearError,
  resetNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectIsLoading = (state) => state.notification.isLoading;
export const selectError = (state) => state.notification.error;
export const selectUnreadNotifications = (state) =>
  state.notification.notifications.filter(n => !n.is_read);
export const selectReadNotifications = (state) =>
  state.notification.notifications.filter(n => n.is_read);
