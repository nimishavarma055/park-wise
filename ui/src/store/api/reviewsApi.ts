import { baseApi } from './baseApi';

export interface Review {
  id: string;
  parkingId: string;
  userId: string;
  bookingId: string;
  rating: number;
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateReviewRequest {
  parkingId: string;
  bookingId: string;
  rating: number;
  reviewText?: string;
}

export interface ReviewListResponse {
  data: Review[];
  total: number;
  averageRating: number;
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewsByParking: builder.query<ReviewListResponse, string>({
      query: (parkingId) => `/reviews/parking/${parkingId}`,
      providesTags: (result, error, parkingId) => [
        { type: 'Review', id: `parking-${parkingId}` },
      ],
    }),
    createReview: builder.mutation<Review, CreateReviewRequest>({
      query: (body) => ({
        url: '/reviews',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { parkingId }) => [
        { type: 'Review', id: `parking-${parkingId}` },
        'Parking',
      ],
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetReviewsByParkingQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;

