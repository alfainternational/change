import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { refreshToken }
          );

          const { token } = response.data.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'حدث خطأ ما';
      return Promise.reject({
        ...error,
        message,
        status: error.response.status,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        ...error,
        message: 'لا يوجد اتصال بالخادم',
      });
    } else {
      // Something else happened
      return Promise.reject({
        ...error,
        message: error.message || 'حدث خطأ غير متوقع',
      });
    }
  }
);

export default api;

// API service functions
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (updates) => api.patch('/auth/me', updates),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

export const contentService = {
  getAll: (params) => api.get('/content', { params }),
  getById: (id) => api.get(`/content/${id}`),
  create: (data) => api.post('/content', data),
  update: (id, data) => api.patch(`/content/${id}`, data),
  delete: (id) => api.delete(`/content/${id}`),
  publish: (id) => api.post(`/content/${id}/publish`),
  like: (id) => api.post(`/content/${id}/like`),
  unlike: (id) => api.delete(`/content/${id}/like`),
  bookmark: (id) => api.post(`/content/${id}/bookmark`),
  removeBookmark: (id) => api.delete(`/content/${id}/bookmark`),
  getTrending: (limit) => api.get('/content/trending', { params: { limit } }),
};

export const learningPathService = {
  getAll: (params) => api.get('/learning-paths', { params }),
  getById: (id) => api.get(`/learning-paths/${id}`),
  enroll: (pathId) => api.post(`/learning-paths/${pathId}/enroll`),
  getProgress: (pathId) => api.get(`/learning-paths/${pathId}/progress`),
  updateProgress: (lessonId, data) => api.post(`/lessons/${lessonId}/progress`, data),
  completeLesson: (lessonId) => api.post(`/lessons/${lessonId}/complete`),
};

export const discussionService = {
  getAll: (params) => api.get('/discussions', { params }),
  getById: (id) => api.get(`/discussions/${id}`),
  create: (data) => api.post('/discussions', data),
  update: (id, data) => api.patch(`/discussions/${id}`, data),
  delete: (id) => api.delete(`/discussions/${id}`),
  reply: (id, data) => api.post(`/discussions/${id}/replies`, data),
  like: (id) => api.post(`/discussions/${id}/like`),
  markSolved: (id, replyId) => api.post(`/discussions/${id}/mark-solved`, { replyId }),
};

export const userService = {
  getById: (id) => api.get(`/users/${id}`),
  getActivity: (id) => api.get(`/users/${id}/activity`),
  getReputation: (id) => api.get(`/users/${id}/reputation`),
  getBadges: (id) => api.get(`/users/${id}/badges`),
  follow: (id) => api.post(`/users/${id}/follow`),
  unfollow: (id) => api.delete(`/users/${id}/follow`),
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
};
