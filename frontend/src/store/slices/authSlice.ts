import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

interface User {
  id: string;
  email: string;
  name: string;
  hasPassword?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

export const setPassword = createAsyncThunk<
  void,
  { newPassword: string },
  { state: RootState }
>('auth/setPassword', async ({ newPassword }, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    await axios.post('/api/user/set-password', { newPassword }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to set password');
  }
});

export const changePassword = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string },
  { state: RootState }
>('auth/changePassword', async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
  try {
    const token = getState().auth.token;
    await axios.post('/api/user/change-password', { currentPassword, newPassword }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to change password');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure: (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    register: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, register } = authSlice.actions;
export default authSlice.reducer;