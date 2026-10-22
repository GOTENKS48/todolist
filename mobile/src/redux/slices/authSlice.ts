import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';
import { api } from '../../services/api';
import { StorageService } from '../../services/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

/**
 * Register a new user account
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: { email: string; password: string; name?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/register', payload);
      const { user, token } = response.data.data;

      // Persist session to AsyncStorage
      await StorageService.saveToken(token);
      await StorageService.saveUser(user);

      return { user, token };
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Log in with existing credentials
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    payload: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/login', payload);
      const { user, token } = response.data.data;

      // Persist session to AsyncStorage
      await StorageService.saveToken(token);
      await StorageService.saveUser(user);

      return { user, token };
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Login failed.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Hydrate session from AsyncStorage on app launch
 */
export const loadStoredSession = createAsyncThunk(
  'auth/loadStoredSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = await StorageService.getToken();
      const user = await StorageService.getUser();

      if (!token || !user) {
        return { user: null, token: null };
      }

      // Verify token validity with backend profile endpoint
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.data?.user) {
          return { user: res.data.data.user, token };
        }
      } catch (e) {
        // If offline or network error, keep cached session
        console.log('Backend verification offline, utilizing cached session.');
      }

      return { user, token };
    } catch (err: any) {
      return rejectWithValue('Failed to load session');
    }
  }
);

/**
 * Log out user and clear stored session
 */
export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await StorageService.clearSession();
});

/**
 * Update user profile (name, avatar, bio)
 */
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (
    payload: { name: string; avatar?: string; bio?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put('/auth/profile', payload);
      const updatedUser = response.data.data.user;

      // Update persisted session
      await StorageService.saveUser(updatedUser);

      return updatedUser;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update profile.';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Registration error';
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Login error';
    });

    // Hydrate Session
    builder.addCase(loadStoredSession.pending, (state) => {
      state.isInitializing = true;
    });
    builder.addCase(loadStoredSession.fulfilled, (state, action) => {
      state.isInitializing = false;
      if (action.payload.token && action.payload.user) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      }
    });
    builder.addCase(loadStoredSession.rejected, (state) => {
      state.isInitializing = false;
      state.isAuthenticated = false;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    });

    // Update Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Failed to update profile';
    });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
