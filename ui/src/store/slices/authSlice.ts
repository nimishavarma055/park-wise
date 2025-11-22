import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    loadUserFromStorage: (state) => {
      const storedUser = localStorage.getItem('user');
      if (storedUser && state.token) {
        try {
          state.user = JSON.parse(storedUser);
          state.isAuthenticated = true;
        } catch (e) {
          // Invalid stored user data
          state.user = null;
          state.isAuthenticated = false;
        }
      }
    },
  },
});

export const { setCredentials, logout, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;

