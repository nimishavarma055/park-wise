import { baseApi } from './baseApi';

export interface Parking {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'covered' | 'open';
  vehicleType: '2W' | '4W' | 'both';
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  pricePerHour?: number;
  pricePerDay: number;
  pricePerMonth: number;
  createdAt: string;
  updatedAt: string;
  distance?: number;
  amenities?: string[];
  images?: string[];
  availability?: any[];
  timeSlots?: any;
  ownerName?: string;
  ownerVerified?: boolean;
}

export interface CreateParkingRequest {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'covered' | 'open';
  vehicleType: '2W' | '4W' | 'both';
  description?: string;
  pricePerHour?: number;
  pricePerDay: number;
  pricePerMonth: number;
  amenities?: string[];
  images?: string[];
  availability?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  timeSlots?: {
    startHour: number;
    endHour: number;
    availableHours: number[];
  };
}

export interface UpdateParkingRequest extends Partial<CreateParkingRequest> {}

export interface SearchParkingParams {
  latitude: number;
  longitude: number;
  radius?: number;
  type?: 'covered' | 'open';
  vehicleType?: '2W' | '4W' | 'both';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface ParkingListParams {
  page?: number;
  limit?: number;
  type?: 'covered' | 'open';
  status?: 'pending' | 'approved' | 'rejected';
  ownerId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const parkingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getParkings: builder.query<PaginatedResponse<Parking>, ParkingListParams>({
      query: (params) => ({
        url: '/parking',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        if (response?.data && Array.isArray(response.data)) {
          return response;
        }
        return response;
      },
      providesTags: ['Parking'],
    }),
    searchParkings: builder.query<PaginatedResponse<Parking>, SearchParkingParams>({
      query: (params) => ({
        url: '/parking/search',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        if (response?.data && Array.isArray(response.data)) {
          return response;
        }
        return response;
      },
      providesTags: ['Parking'],
    }),
    getParkingById: builder.query<Parking, string>({
      query: (id) => `/parking/${id}`,
      transformResponse: (response: any) => {
        // Handle both wrapped and unwrapped responses
        return response?.data || response;
      },
      providesTags: (result, error, id) => [{ type: 'Parking', id }],
    }),
    createParking: builder.mutation<Parking, CreateParkingRequest>({
      query: (body) => ({
        url: '/parking',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Parking'],
    }),
    updateParking: builder.mutation<Parking, { id: string; data: UpdateParkingRequest }>({
      query: ({ id, data }) => ({
        url: `/parking/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Parking', id }],
    }),
    deleteParking: builder.mutation<void, string>({
      query: (id) => ({
        url: `/parking/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Parking'],
    }),
  }),
});

export const {
  useGetParkingsQuery,
  useSearchParkingsQuery,
  useGetParkingByIdQuery,
  useCreateParkingMutation,
  useUpdateParkingMutation,
  useDeleteParkingMutation,
} = parkingApi;

