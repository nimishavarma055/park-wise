import { baseApi } from './baseApi';

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: 'upi' | 'razorpay';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InitiatePaymentRequest {
  bookingId: string;
  paymentMethod: 'upi' | 'razorpay';
}

export interface InitiatePaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
}

export interface ConfirmPaymentRequest {
  bookingId: string;
  paymentId: string;
  signature?: string;
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation<InitiatePaymentResponse, InitiatePaymentRequest>({
      query: (body) => ({
        url: '/payments/initiate',
        method: 'POST',
        body,
      }),
    }),
    confirmPayment: builder.mutation<Payment, ConfirmPaymentRequest>({
      query: (body) => ({
        url: '/payments/confirm',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    getPaymentById: builder.query<Payment, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useConfirmPaymentMutation,
  useGetPaymentByIdQuery,
} = paymentsApi;

