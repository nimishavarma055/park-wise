import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['User', 'Parking', 'Booking', 'Payment', 'Review', 'Favorite'],
  endpoints: () => ({}),
});

