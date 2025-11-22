import { baseApi } from './baseApi';
import type { User } from './authApi';

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = usersApi;

