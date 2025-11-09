import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Parking } from '../data/mockParkings';
import { mockParkings } from '../data/mockParkings';
import type { Booking } from '../data/mockBookings';
import { mockBookings } from '../data/mockBookings';

interface ParkingContextType {
  parkings: Parking[];
  bookings: Booking[];
  getParkingById: (id: string) => Parking | undefined;
  getBookingsByUserId: (userId: string) => Booking[];
}

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export const ParkingProvider = ({ children }: { children: ReactNode }) => {
  const parkings = mockParkings;
  const bookings = mockBookings;

  const getParkingById = (id: string) => {
    return parkings.find((p) => p.id === id);
  };

  const getBookingsByUserId = (userId: string) => {
    return bookings.filter((b) => b.userId === userId);
  };

  return (
    <ParkingContext.Provider
      value={{
        parkings,
        bookings,
        getParkingById,
        getBookingsByUserId,
      }}
    >
      {children}
    </ParkingContext.Provider>
  );
};

export const useParking = () => {
  const context = useContext(ParkingContext);
  if (context === undefined) {
    throw new Error('useParking must be used within a ParkingProvider');
  }
  return context;
};

