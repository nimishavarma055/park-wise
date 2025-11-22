import { baseApi } from './baseApi';
import type { Parking } from './parkingApi';

export interface Favorite {
  id: string;
  userId: string;
  parkingId: string;
  createdAt: string;
  parking?: Parking;
}

export interface FavoriteListResponse {
  data: Favorite[];
  total: number;
}

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<FavoriteListResponse, void>({
      query: () => '/favorites',
      providesTags: ['Favorite'],
    }),
    addFavorite: builder.mutation<Favorite, string>({
      query: (parkingId) => ({
        url: `/favorites/${parkingId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Favorite'],
    }),
    removeFavorite: builder.mutation<void, string>({
      query: (parkingId) => ({
        url: `/favorites/${parkingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorite'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;

