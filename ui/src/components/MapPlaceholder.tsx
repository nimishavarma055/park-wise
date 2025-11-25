import { useState, useEffect } from 'react';
import { GoogleMap } from './GoogleMap';
import { LocationSearch } from './LocationSearch';

interface MapPlaceholderProps {
  lat?: number;
  lon?: number;
  address?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  onAddressChange?: (address: string, lat: number, lng: number) => void;
  markerTitle?: string;
  showSearch?: boolean;
}

export const MapPlaceholder = ({ 
  lat, 
  lon,
  address,
  onLocationSelect,
  onAddressChange,
  markerTitle = 'Selected Location',
  showSearch = true,
}: MapPlaceholderProps) => {
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentAddress, setCurrentAddress] = useState(address || '');

  useEffect(() => {
    if (lat && lon) {
      const location = { lat, lng: lon };
      setCenter(location);
      setSelectedLocation(location);
    } else {
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCenter(location);
            if (!lat && !lon) {
              setSelectedLocation(location);
            }
          },
          () => {
            // Use default location if geolocation fails
          }
        );
      }
    }
  }, [lat, lon]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedLocation(location);
      setCenter(location);
      onLocationSelect?.(location.lat, location.lng);
      
      // Reverse geocode to get address
      if (window.google?.maps) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const addr = results[0].formatted_address;
            setCurrentAddress(addr);
            onAddressChange?.(addr, location.lat, location.lng);
          }
        });
      }
    }
  };

  const handleSearchSelect = (addr: string, lat: number, lng: number) => {
    const location = { lat, lng };
    setSelectedLocation(location);
    setCenter(location);
    setCurrentAddress(addr);
    onLocationSelect?.(lat, lng);
    onAddressChange?.(addr, lat, lng);
  };

  const markers = selectedLocation
    ? [
        {
          id: 'selected',
          position: selectedLocation,
          title: markerTitle,
        },
      ]
    : [];

  return (
    <div className="w-full space-y-3">
      {showSearch && (
        <LocationSearch
          onLocationSelect={handleSearchSelect}
          initialValue={currentAddress}
          placeholder="Search for an address or place..."
        />
      )}
      <GoogleMap
        center={center}
        zoom={lat && lon ? 15 : 12}
        markers={markers}
        onMapClick={handleMapClick}
        height="300px"
        className="rounded-lg overflow-hidden"
      />
      {onLocationSelect && (
        <p className="text-sm text-gray-600">
          {showSearch ? 'Search for a location or click on the map to select' : 'Click on the map to select a location'}
        </p>
      )}
      {currentAddress && (
        <p className="text-xs text-gray-500">
          <strong>Address:</strong> {currentAddress}
        </p>
      )}
    </div>
  );
};

