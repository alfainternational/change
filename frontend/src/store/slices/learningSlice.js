import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  paths: [],
  currentPath: null,
  enrolledPaths: [],
  userProgress: {},
  modules: [],
  currentLesson: null,
  filters: {
    difficulty_level: null,
    search: '',
    sortBy: 'enrollment_count',
    sortOrder: 'DESC'
  },
  pagination: {
    total: 0,
    limit: 20,
    offset: 0
  },
  isLoading: false,
  error: null
};

// Async thunks
export const fetchLearningPaths = createAsyncThunk(
  'learning/fetchPaths',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/learning-paths', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المسارات التعليمية');
    }
  }
);

export const fetchPathById = createAsyncThunk(
  'learning/fetchPathById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/learning-paths/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المسار التعليمي');
    }
  }
);

export const createLearningPath = createAsyncThunk(
  'learning/createPath',
  async (pathData, { rejectWithValue }) => {
    try {
      const response = await api.post('/learning-paths', pathData);
      return response.data.data.path;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل إنشاء المسار التعليمي');
    }
  }
);

export const updateLearningPath = createAsyncThunk(
  'learning/updatePath',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/learning-paths/${id}`, data);
      return response.data.data.path;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث المسار التعليمي');
    }
  }
);

export const enrollInPath = createAsyncThunk(
  'learning/enroll',
  async (pathId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/learning-paths/${pathId}/enroll`);
      return { pathId, enrollment: response.data.data.enrollment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل التسجيل في المسار');
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'learning/fetchProgress',
  async (pathId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/learning-paths/${pathId}/progress`);
      return { pathId, progress: response.data.data.progress };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب التقدم');
    }
  }
);

export const completeLesson = createAsyncThunk(
  'learning/completeLesson',
  async (lessonId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/complete`);
      return { lessonId, progress: response.data.data.progress };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل إكمال الدرس');
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'learning/updateLessonProgress',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/lessons/${lessonId}/progress`, data);
      return { lessonId, progress: response.data.data.progress };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث التقدم');
    }
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPath: (state) => {
      state.currentPath = null;
      state.modules = [];
    },
    setCurrentLesson: (state, action) => {
      state.currentLesson = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch Paths
    builder
      .addCase(fetchLearningPaths.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLearningPaths.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paths = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          limit: action.payload.limit,
          offset: action.payload.offset
        };
      })
      .addCase(fetchLearningPaths.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Path By ID
    builder
      .addCase(fetchPathById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPathById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPath = action.payload.path;
        state.modules = action.payload.modules || [];
      })
      .addCase(fetchPathById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create Path
    builder
      .addCase(createLearningPath.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLearningPath.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paths.unshift(action.payload);
      })
      .addCase(createLearningPath.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Path
    builder
      .addCase(updateLearningPath.fulfilled, (state, action) => {
        const index = state.paths.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.paths[index] = action.payload;
        }
        if (state.currentPath?.id === action.payload.id) {
          state.currentPath = action.payload;
        }
      });

    // Enroll
    builder
      .addCase(enrollInPath.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enrollInPath.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolledPaths.push(action.payload.pathId);

        // Update enrollment count in path
        const path = state.paths.find(p => p.id === action.payload.pathId);
        if (path) {
          path.enrollment_count = (path.enrollment_count || 0) + 1;
        }
        if (state.currentPath?.id === action.payload.pathId) {
          state.currentPath.enrollment_count = (state.currentPath.enrollment_count || 0) + 1;
        }
      })
      .addCase(enrollInPath.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Progress
    builder
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.userProgress[action.payload.pathId] = action.payload.progress;
      });

    // Complete Lesson
    builder
      .addCase(completeLesson.fulfilled, (state, action) => {
        // Update lesson progress in modules
        for (let module of state.modules) {
          const lesson = module.lessons?.find(l => l.id === action.payload.lessonId);
          if (lesson) {
            lesson.completed = true;
            lesson.completed_at = new Date().toISOString();
          }
        }
      });

    // Update Lesson Progress
    builder
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        // Update lesson progress in modules
        for (let module of state.modules) {
          const lesson = module.lessons?.find(l => l.id === action.payload.lessonId);
          if (lesson) {
            lesson.progress = action.payload.progress;
          }
        }
      });
  }
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentPath,
  setCurrentLesson
} = learningSlice.actions;

export default learningSlice.reducer;

// Selectors
export const selectPaths = (state) => state.learning.paths;
export const selectCurrentPath = (state) => state.learning.currentPath;
export const selectModules = (state) => state.learning.modules;
export const selectCurrentLesson = (state) => state.learning.currentLesson;
export const selectEnrolledPaths = (state) => state.learning.enrolledPaths;
export const selectUserProgress = (pathId) => (state) => state.learning.userProgress[pathId];
export const selectFilters = (state) => state.learning.filters;
export const selectPagination = (state) => state.learning.pagination;
export const selectIsLoading = (state) => state.learning.isLoading;
export const selectError = (state) => state.learning.error;
export const selectIsEnrolled = (pathId) => (state) =>
  state.learning.enrolledPaths.includes(pathId);
