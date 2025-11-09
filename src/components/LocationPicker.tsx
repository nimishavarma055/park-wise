import { useState } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { getCurrentLocation, type UserLocation } from '../utils/geolocation';

interface LocationPickerProps {
  onLocationSelect: (location: UserLocation) => void;
  currentLocation?: UserLocation;
}

export const LocationPicker = ({ onLocationSelect, currentLocation }: LocationPickerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocation();
      onLocationSelect(location);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get your location. Please enable location access.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Enter area or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={currentLocation?.address || ''}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="flex items-center space-x-2 whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="hidden sm:inline">Getting...</span>
            </>
          ) : (
            <>
              <Navigation size={18} />
              <span className="hidden sm:inline">Use Current</span>
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>{error}</span>
        </p>
      )}
      {currentLocation && !error && (
        <p className="text-sm text-green-600 flex items-center space-x-1">
          <MapPin size={14} />
          <span>Location set</span>
        </p>
      )}
    </div>
  );
};

