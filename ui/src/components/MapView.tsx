import { useMemo } from 'react';
import { GoogleMap } from './GoogleMap';
import { Card } from './Card';
import type { Parking } from '../store/api/parkingApi';
import type { UserLocation } from '../utils/geolocation';

interface MapViewProps {
  parkings: Parking[];
  userLocation?: UserLocation;
  onParkingClick: (parking: Parking) => void;
  selectedParkingId?: string;
}

export const MapView = ({
  parkings,
  userLocation,
  onParkingClick,
  selectedParkingId,
}: MapViewProps) => {
  // Calculate center based on user location or first parking
  const center = useMemo(() => {
    if (userLocation) {
      return { lat: userLocation.latitude, lng: userLocation.longitude };
    }
    if (parkings.length > 0) {
      return { lat: parkings[0].latitude, lng: parkings[0].longitude };
    }
    return { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore
  }, [userLocation, parkings]);

  // Create markers for parking spaces
  const markers = useMemo(() => {
    const parkingMarkers = parkings.map((parking) => ({
      id: parking.id,
      position: { lat: parking.latitude, lng: parking.longitude },
      title: parking.name,
      onClick: () => onParkingClick(parking),
    }));

    // Add user location marker if available
    if (userLocation) {
      return [
        {
          id: 'user-location',
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          title: 'Your Location',
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
        ...parkingMarkers,
      ];
    }

    return parkingMarkers;
  }, [parkings, userLocation, onParkingClick]);

  const selectedParking = parkings.find((p) => p.id === selectedParkingId);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <GoogleMap
        center={center}
        zoom={userLocation ? 13 : 12}
        markers={markers}
        onMarkerClick={(markerId) => {
          if (markerId !== 'user-location') {
            const parking = parkings.find((p) => p.id === markerId);
            if (parking) {
              onParkingClick(parking);
            }
          }
        }}
        selectedMarkerId={selectedParkingId}
        height="600px"
        className="rounded-lg"
      />

      {/* Map Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="p-4 bg-white bg-opacity-95">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {parkings.length} parking {parkings.length === 1 ? 'space' : 'spaces'} found
              </p>
              {userLocation && (
                <p className="text-xs text-gray-600 mt-1">
                  Showing results near your location
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              {userLocation && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>You</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Parking</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Parking Info */}
      {selectedParking && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-4 bg-white shadow-lg">
            <h4 className="font-semibold text-sm mb-1">{selectedParking.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{selectedParking.address}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                ₹{selectedParking.pricePerHour || selectedParking.pricePerDay}/hr
              </span>
              {selectedParking.distance && (
                <span className="text-xs text-gray-500">
                  {selectedParking.distance.toFixed(2)} km
                </span>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

