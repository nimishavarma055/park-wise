import { baseApi } from './baseApi';

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'user' | 'owner' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'owner' | 'admin';
  verified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        return response?.data || response;
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        return response?.data || response;
      },
    }),
  }),
});

export const { useSignupMutation, useLoginMutation } = authApi;

