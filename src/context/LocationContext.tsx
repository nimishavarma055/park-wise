import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserLocation } from '../utils/geolocation';

interface LocationContextType {
  userLocation: UserLocation | undefined;
  setUserLocation: (location: UserLocation | undefined) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | undefined>(undefined);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

