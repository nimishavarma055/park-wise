export interface Booking {
  id: string;
  parkingId: string;
  parkingName: string;
  userId: string;
  startDate: string;
  endDate: string;
  duration: 'hourly' | 'daily' | 'monthly';
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'upi' | 'razorpay';
  createdAt: string;
}

export const mockBookings: Booking[] = [
  {
    id: 'booking1',
    parkingId: '1',
    parkingName: 'Secure Parking - MG Road',
    userId: 'user1',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    duration: 'daily',
    totalAmount: 150,
    status: 'confirmed',
    paymentMethod: 'upi',
    createdAt: '2024-01-14T10:00:00Z',
  },
  {
    id: 'booking2',
    parkingId: '2',
    parkingName: 'Open Parking - Koramangala',
    userId: 'user1',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    duration: 'monthly',
    totalAmount: 2500,
    status: 'confirmed',
    paymentMethod: 'razorpay',
    createdAt: '2024-01-09T14:30:00Z',
  },
  {
    id: 'booking3',
    parkingId: '3',
    parkingName: 'Premium Covered Parking - Indiranagar',
    userId: 'user1',
    startDate: '2024-01-12',
    endDate: '2024-01-12',
    duration: 'hourly',
    totalAmount: 50,
    status: 'completed',
    paymentMethod: 'upi',
    createdAt: '2024-01-12T08:00:00Z',
  },
  {
    id: 'booking4',
    parkingId: '7',
    parkingName: 'Secure EV Parking - Electronic City',
    userId: 'user1',
    startDate: '2024-01-20',
    endDate: '2024-01-20',
    duration: 'hourly',
    totalAmount: 44,
    status: 'confirmed',
    paymentMethod: 'upi',
    createdAt: '2024-01-19T15:00:00Z',
  },
  {
    id: 'booking5',
    parkingId: '9',
    parkingName: 'Luxury Valet Parking - UB City',
    userId: 'user1',
    startDate: '2024-01-18',
    endDate: '2024-01-18',
    duration: 'hourly',
    totalAmount: 80,
    status: 'completed',
    paymentMethod: 'razorpay',
    createdAt: '2024-01-18T10:00:00Z',
  },
  {
    id: 'booking6',
    parkingId: '6',
    parkingName: 'Convenient Parking - Marathahalli',
    userId: 'user1',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    duration: 'daily',
    totalAmount: 120,
    status: 'completed',
    paymentMethod: 'upi',
    createdAt: '2024-01-15T12:00:00Z',
  },
];

