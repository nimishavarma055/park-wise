import { baseApi } from './baseApi';

export interface Booking {
  id: string;
  userId: string;
  parkingId: string;
  bookingType: 'hourly' | 'daily' | 'monthly';
  startTime: string;
  endTime: string;
  totalAmount: number;
  bookingStatus: 'active' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  parking?: {
    id: string;
    name: string;
    address: string;
    ownerId: string;
  };
}

export interface CreateBookingRequest {
  parkingId: string;
  bookingType: 'hourly' | 'daily' | 'monthly';
  startTime: string;
  endTime: string;
}

export interface BookingListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const bookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<PaginatedResponse<Booking>, BookingListParams>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    getOwnerBookings: builder.query<PaginatedResponse<Booking>, BookingListParams>({
      query: (params) => ({
        url: '/bookings/owner',
        params,
      }),
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query<Booking, string>({
      query: (id) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
    createBooking: builder.mutation<Booking, CreateBookingRequest>({
      query: (body) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking', 'Parking'],
    }),
    cancelBooking: builder.mutation<Booking, string>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Booking', id }],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetOwnerBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = bookingsApi;

