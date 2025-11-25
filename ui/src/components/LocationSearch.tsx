import { useRef, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { useGoogleMaps } from '../context/GoogleMapsContext';

interface LocationSearchProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

export const LocationSearch = ({
  onLocationSelect,
  initialValue = '',
  placeholder = 'Search for a location...',
  className = '',
}: LocationSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const callbackRef = useRef(onLocationSelect);
  const { isReady, loadError } = useGoogleMaps();

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    // Wait a bit more to ensure everything is ready
    const initAutocomplete = () => {
      if (!inputRef.current || autocompleteRef.current) {
        return;
      }

      // Ensure Google Maps API is fully loaded
      if (!window.google?.maps?.places?.Autocomplete) {
        console.warn('Google Maps Places Autocomplete not available, retrying...');
        setTimeout(initAutocomplete, 200);
        return;
      }

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['formatted_address', 'geometry', 'name', 'place_id'],
        });

        const listener = autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          
          if (!place) {
            console.warn('No place selected');
            return;
          }

          if (place.geometry?.location) {
            const address = place.formatted_address || place.name || '';
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            console.log('Place selected:', { address, lat, lng });
            callbackRef.current(address, lat, lng);
          } else {
            console.warn('Place selected but no geometry available');
          }
        });

        // Store listener for cleanup
        (autocompleteRef.current as any)._listener = listener;
        console.log('Autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing Autocomplete:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initAutocomplete, 100);

    return () => {
      clearTimeout(timer);
      if (autocompleteRef.current) {
        try {
          if (window.google?.maps?.event) {
            const listener = (autocompleteRef.current as any)._listener;
            if (listener) {
              window.google.maps.event.removeListener(listener);
            }
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          }
        } catch (error) {
          console.error('Error cleaning up Autocomplete:', error);
        }
        autocompleteRef.current = null;
      }
    };
  }, [isReady]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (loadError) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <MapPin size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Error loading Google Maps"
          disabled
          className="w-full pl-10 pr-4 py-2.5 border border-red-300 rounded-lg bg-red-50 text-red-600 cursor-not-allowed"
          title={loadError.message || 'Google Maps API error'}
        />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <MapPin size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Google Maps API key required"
          disabled
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          title="Please add VITE_GOOGLE_MAPS_API_KEY to your .env file"
        />
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <MapPin size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Loading Google Maps..."
          disabled
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <MapPin size={20} className="text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={initialValue}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
      />
    </div>
  );
};
