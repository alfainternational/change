import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  discussions: [],
  currentDiscussion: null,
  replies: [],
  trendingDiscussions: [],
  userDiscussions: [],
  filters: {
    forum_id: null,
    discussion_type: null,
    search: '',
    sortBy: 'created_at',
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
export const fetchDiscussions = createAsyncThunk(
  'discussion/fetchDiscussions',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/discussions', { params: filters });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المناقشات');
    }
  }
);

export const fetchDiscussionById = createAsyncThunk(
  'discussion/fetchDiscussionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/discussions/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المناقشة');
    }
  }
);

export const fetchTrendingDiscussions = createAsyncThunk(
  'discussion/fetchTrending',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await api.get('/discussions/trending', { params: { limit } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب المناقشات الرائجة');
    }
  }
);

export const fetchUserDiscussions = createAsyncThunk(
  'discussion/fetchUserDiscussions',
  async ({ userId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/discussions/users/${userId}/discussions`, {
        params: { limit, offset }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل جلب مناقشات المستخدم');
    }
  }
);

export const createDiscussion = createAsyncThunk(
  'discussion/createDiscussion',
  async (discussionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/discussions', discussionData);
      return response.data.data.discussion;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل إنشاء المناقشة');
    }
  }
);

export const updateDiscussion = createAsyncThunk(
  'discussion/updateDiscussion',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/discussions/${id}`, data);
      return response.data.data.discussion;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث المناقشة');
    }
  }
);

export const deleteDiscussion = createAsyncThunk(
  'discussion/deleteDiscussion',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/discussions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل حذف المناقشة');
    }
  }
);

export const createReply = createAsyncThunk(
  'discussion/createReply',
  async ({ discussionId, content, parentReplyId = null }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/discussions/${discussionId}/replies`, {
        content,
        parent_reply_id: parentReplyId
      });
      return response.data.data.reply;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل إضافة الرد');
    }
  }
);

export const updateReply = createAsyncThunk(
  'discussion/updateReply',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/discussions/replies/${id}`, { content });
      return response.data.data.reply;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديث الرد');
    }
  }
);

export const deleteReply = createAsyncThunk(
  'discussion/deleteReply',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/discussions/replies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل حذف الرد');
    }
  }
);

export const likeDiscussion = createAsyncThunk(
  'discussion/likeDiscussion',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/discussions/${id}/like`);
      return { id, liked: response.data.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل الإعجاب');
    }
  }
);

export const likeReply = createAsyncThunk(
  'discussion/likeReply',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/discussions/replies/${id}/like`);
      return { id, liked: response.data.data.liked };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل الإعجاب');
    }
  }
);

export const markBestAnswer = createAsyncThunk(
  'discussion/markBestAnswer',
  async ({ discussionId, replyId }, { rejectWithValue }) => {
    try {
      await api.post(`/discussions/${discussionId}/best-answer/${replyId}`);
      return { discussionId, replyId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تحديد الإجابة الأفضل');
    }
  }
);

export const pinDiscussion = createAsyncThunk(
  'discussion/pinDiscussion',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/discussions/${id}/pin`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل تثبيت المناقشة');
    }
  }
);

export const lockDiscussion = createAsyncThunk(
  'discussion/lockDiscussion',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/discussions/${id}/lock`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'فشل قفل المناقشة');
    }
  }
);

const discussionSlice = createSlice({
  name: 'discussion',
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
    clearCurrentDiscussion: (state) => {
      state.currentDiscussion = null;
      state.replies = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch Discussions
    builder
      .addCase(fetchDiscussions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscussions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discussions = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          limit: action.payload.limit,
          offset: action.payload.offset
        };
      })
      .addCase(fetchDiscussions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Discussion By ID
    builder
      .addCase(fetchDiscussionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDiscussionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDiscussion = action.payload.discussion;
        state.replies = action.payload.replies || [];
      })
      .addCase(fetchDiscussionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Trending
    builder
      .addCase(fetchTrendingDiscussions.fulfilled, (state, action) => {
        state.trendingDiscussions = action.payload;
      });

    // Fetch User Discussions
    builder
      .addCase(fetchUserDiscussions.fulfilled, (state, action) => {
        state.userDiscussions = action.payload;
      });

    // Create Discussion
    builder
      .addCase(createDiscussion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDiscussion.fulfilled, (state, action) => {
        state.isLoading = false;
        state.discussions.unshift(action.payload);
      })
      .addCase(createDiscussion.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update Discussion
    builder
      .addCase(updateDiscussion.fulfilled, (state, action) => {
        const index = state.discussions.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.discussions[index] = action.payload;
        }
        if (state.currentDiscussion?.id === action.payload.id) {
          state.currentDiscussion = action.payload;
        }
      });

    // Delete Discussion
    builder
      .addCase(deleteDiscussion.fulfilled, (state, action) => {
        state.discussions = state.discussions.filter(d => d.id !== action.payload);
        if (state.currentDiscussion?.id === action.payload) {
          state.currentDiscussion = null;
          state.replies = [];
        }
      });

    // Create Reply
    builder
      .addCase(createReply.fulfilled, (state, action) => {
        state.replies.push(action.payload);
        if (state.currentDiscussion) {
          state.currentDiscussion.reply_count = (state.currentDiscussion.reply_count || 0) + 1;
        }
      });

    // Update Reply
    builder
      .addCase(updateReply.fulfilled, (state, action) => {
        const index = state.replies.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.replies[index] = action.payload;
        }
      });

    // Delete Reply
    builder
      .addCase(deleteReply.fulfilled, (state, action) => {
        state.replies = state.replies.filter(r => r.id !== action.payload);
        if (state.currentDiscussion) {
          state.currentDiscussion.reply_count = Math.max(0, (state.currentDiscussion.reply_count || 0) - 1);
        }
      });

    // Like Discussion
    builder
      .addCase(likeDiscussion.fulfilled, (state, action) => {
        const discussion = state.discussions.find(d => d.id === action.payload.id);
        if (discussion) {
          discussion.like_count = action.payload.liked
            ? (discussion.like_count || 0) + 1
            : Math.max(0, (discussion.like_count || 0) - 1);
          discussion.user_has_liked = action.payload.liked;
        }
        if (state.currentDiscussion?.id === action.payload.id) {
          state.currentDiscussion.like_count = action.payload.liked
            ? (state.currentDiscussion.like_count || 0) + 1
            : Math.max(0, (state.currentDiscussion.like_count || 0) - 1);
          state.currentDiscussion.user_has_liked = action.payload.liked;
        }
      });

    // Like Reply
    builder
      .addCase(likeReply.fulfilled, (state, action) => {
        const reply = state.replies.find(r => r.id === action.payload.id);
        if (reply) {
          reply.like_count = action.payload.liked
            ? (reply.like_count || 0) + 1
            : Math.max(0, (reply.like_count || 0) - 1);
          reply.user_has_liked = action.payload.liked;
        }
      });

    // Mark Best Answer
    builder
      .addCase(markBestAnswer.fulfilled, (state, action) => {
        // Clear previous best answer
        state.replies.forEach(r => {
          r.is_best_answer = r.id === action.payload.replyId;
        });

        if (state.currentDiscussion) {
          state.currentDiscussion.has_best_answer = true;
        }
      });

    // Pin Discussion
    builder
      .addCase(pinDiscussion.fulfilled, (state, action) => {
        const discussion = state.discussions.find(d => d.id === action.payload);
        if (discussion) {
          discussion.is_pinned = true;
        }
        if (state.currentDiscussion?.id === action.payload) {
          state.currentDiscussion.is_pinned = true;
        }
      });

    // Lock Discussion
    builder
      .addCase(lockDiscussion.fulfilled, (state, action) => {
        const discussion = state.discussions.find(d => d.id === action.payload);
        if (discussion) {
          discussion.is_locked = true;
        }
        if (state.currentDiscussion?.id === action.payload) {
          state.currentDiscussion.is_locked = true;
        }
      });
  }
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearCurrentDiscussion
} = discussionSlice.actions;

export default discussionSlice.reducer;

// Selectors
export const selectDiscussions = (state) => state.discussion.discussions;
export const selectCurrentDiscussion = (state) => state.discussion.currentDiscussion;
export const selectReplies = (state) => state.discussion.replies;
export const selectTrendingDiscussions = (state) => state.discussion.trendingDiscussions;
export const selectUserDiscussions = (state) => state.discussion.userDiscussions;
export const selectFilters = (state) => state.discussion.filters;
export const selectPagination = (state) => state.discussion.pagination;
export const selectIsLoading = (state) => state.discussion.isLoading;
export const selectError = (state) => state.discussion.error;
