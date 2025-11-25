import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
  isReady: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const GoogleMapsProvider = ({ children }: { children: ReactNode }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [isReady, setIsReady] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  // Check if Google Maps API is fully loaded and ready
  useEffect(() => {
    if (isLoaded && !loadError) {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const checkReady = () => {
        attempts++;
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsReady(true);
        } else if (attempts < maxAttempts) {
          setTimeout(checkReady, 100);
        } else {
          console.error('Google Maps Places API failed to load after 5 seconds');
        }
      };
      checkReady();
    } else if (loadError) {
      console.error('Google Maps load error:', loadError);
    }
  }, [isLoaded, loadError]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, isReady }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};
