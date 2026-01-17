import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contentService } from '../../services/api';

const initialState = {
  content: [],
  currentContent: null,
  trendingContent: [],
  filters: {
    content_type: null,
    difficulty_level: null,
    category_id: null,
    search: '',
    sortBy: 'published_at',
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
export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await contentService.getAll(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المحتوى');
    }
  }
);

export const fetchContentById = createAsyncThunk(
  'content/fetchContentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await contentService.getById(id);
      return response.data.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المحتوى');
    }
  }
);

export const fetchTrendingContent = createAsyncThunk(
  'content/fetchTrendingContent',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await contentService.getTrending(limit);
      return response.data.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المحتوى الرائج');
    }
  }
);

export const createContent = createAsyncThunk(
  'content/createContent',
  async (contentData, { rejectWithValue }) => {
    try {
      const response = await contentService.create(contentData);
      return response.data.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل إنشاء المحتوى');
    }
  }
);

export const updateContent = createAsyncThunk(
  'content/updateContent',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await contentService.update(id, data);
      return response.data.data.content;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث المحتوى');
    }
  }
);

export const deleteContent = createAsyncThunk(
  'content/deleteContent',
  async (id, { rejectWithValue }) => {
    try {
      await contentService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل حذف المحتوى');
    }
  }
);

export const likeContent = createAsyncThunk(
  'content/likeContent',
  async (id, { rejectWithValue }) => {
    try {
      await contentService.like(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل الإعجاب');
    }
  }
);

export const bookmarkContent = createAsyncThunk(
  'content/bookmarkContent',
  async (id, { rejectWithValue }) => {
    try {
      await contentService.bookmark(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل الحفظ');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
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
    clearCurrentContent: (state) => {
      state.currentContent = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Content
    builder
      .addCase(fetchContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.content = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          limit: action.payload.limit,
          offset: action.payload.offset
        };
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Content By ID
    builder
      .addCase(fetchContentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentContent = action.payload;
      })
      .addCase(fetchContentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Trending
    builder
      .addCase(fetchTrendingContent.fulfilled, (state, action) => {
        state.trendingContent = action.payload;
      });

    // Create Content
    builder
      .addCase(createContent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createContent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.content.unshift(action.payload);
      })
      .addCase(createContent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Content
    builder
      .addCase(updateContent.fulfilled, (state, action) => {
        const index = state.content.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.content[index] = action.payload;
        }
        if (state.currentContent?.id === action.payload.id) {
          state.currentContent = action.payload;
        }
      });

    // Delete Content
    builder
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.content = state.content.filter(c => c.id !== action.payload);
        if (state.currentContent?.id === action.payload) {
          state.currentContent = null;
        }
      });
  }
});

export const { setFilters, clearFilters, clearError, clearCurrentContent } = contentSlice.actions;
export default contentSlice.reducer;

// Selectors
export const selectContent = (state) => state.content.content;
export const selectCurrentContent = (state) => state.content.currentContent;
export const selectTrendingContent = (state) => state.content.trendingContent;
export const selectFilters = (state) => state.content.filters;
export const selectPagination = (state) => state.content.pagination;
export const selectIsLoading = (state) => state.content.isLoading;
export const selectError = (state) => state.content.error;
