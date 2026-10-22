import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskStats, FilterStatus, TaskCategory, SortOption } from '../../types';
import { api } from '../../services/api';
import { StorageService } from '../../services/storage';
import { calculateSmartScore, sortTasks } from '../../utils/smartAlgorithm';

interface TaskState {
  tasks: Task[];
  stats: TaskStats;
  filterStatus: FilterStatus;
  selectedCategory: TaskCategory | 'ALL';
  sortBy: SortOption;
  searchQuery: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

const initialStats: TaskStats = {
  total: 0,
  completed: 0,
  pending: 0,
  overdue: 0,
  highPriority: 0,
  completionRate: 0,
};

const initialState: TaskState = {
  tasks: [],
  stats: initialStats,
  filterStatus: 'ALL',
  selectedCategory: 'ALL',
  sortBy: 'createdAt',
  searchQuery: '',
  isLoading: false,
  isRefreshing: false,
  error: null,
};

/**
 * Fetch all tasks matching active filters & sort options from API
 */
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (
    params: {
      status?: string;
      category?: string;
      priority?: string;
      search?: string;
      sortBy?: string;
      order?: string;
      isRefresh?: boolean;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/tasks', { params });
      const tasks: Task[] = response.data.data.tasks;

      // Cache tasks in AsyncStorage for offline resilience
      await StorageService.saveCachedTasks(tasks);

      return { tasks, isRefresh: !!params.isRefresh };
    } catch (err: any) {
      // Fallback to local cache if network request fails
      console.warn('Network error fetching tasks, attempting to load cached tasks...');
      const cached = await StorageService.getCachedTasks();
      if (cached && cached.length > 0) {
        return { tasks: cached, isRefresh: false };
      }
      return rejectWithValue(err.response?.data?.message || err.message || 'Error fetching tasks');
    }
  }
);

/**
 * Fetch dashboard task statistics
 */
export const fetchStats = createAsyncThunk('tasks/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/tasks/stats');
    return response.data.data as TaskStats;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message || 'Error fetching stats');
  }
});

/**
 * Create a new task
 */
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    payload: {
      title: string;
      description?: string;
      dateTime?: string;
      deadline: string;
      priority?: string;
      category?: string;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post('/tasks', payload);
      const newTask = response.data.data.task as Task;
      dispatch(fetchStats());
      return newTask;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Error creating task');
    }
  }
);

/**
 * Update task details
 */
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    {
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        title: string;
        description: string;
        dateTime: string;
        deadline: string;
        priority: string;
        category: string;
      }>;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/tasks/${id}`, payload);
      const updatedTask = response.data.data.task as Task;
      dispatch(fetchStats());
      return updatedTask;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Error updating task');
    }
  }
);

/**
 * Toggle task completion status
 */
export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(`/tasks/${id}/toggle`);
      const toggledTask = response.data.data.task as Task;
      dispatch(fetchStats());
      return toggledTask;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Error toggling task');
    }
  }
);

/**
 * Delete a task
 */
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch(fetchStats());
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Error deleting task');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilterStatus: (state, action: PayloadAction<FilterStatus>) => {
      state.filterStatus = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<TaskCategory | 'ALL'>) => {
      state.selectedCategory = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
      state.tasks = sortTasks(state.tasks, action.payload);
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state, action) => {
      if (action.meta.arg?.isRefresh) {
        state.isRefreshing = true;
      } else {
        state.isLoading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.tasks = action.payload.tasks;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.isRefreshing = false;
      state.error = (action.payload as string) || 'Failed to fetch tasks';
    });

    // Fetch Stats
    builder.addCase(fetchStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Create Task
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload);
      state.tasks = sortTasks(state.tasks, state.sortBy);
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks = sortTasks(state.tasks, state.sortBy);
      }
    });

    // Toggle Task
    builder.addCase(toggleTaskCompletion.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
        state.tasks = sortTasks(state.tasks, state.sortBy);
      }
    });

    // Delete Task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
    });
  },
});

export const {
  setFilterStatus,
  setSelectedCategory,
  setSortBy,
  setSearchQuery,
  clearTaskError,
} = taskSlice.actions;

export default taskSlice.reducer;
