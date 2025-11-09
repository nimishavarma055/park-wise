import { MapPin, Navigation } from 'lucide-react';
import type { Parking } from '../data/mockParkings';
import type { UserLocation } from '../utils/geolocation';
import { Card } from './Card';

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
  return (
    <div className="relative w-full h-[600px] bg-gray-200 rounded-lg overflow-hidden">
      {/* Map Placeholder with Markers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute z-20"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-blue-600 rounded-full p-2 shadow-lg">
                <Navigation size={20} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Parking Markers */}
        {parkings.map((parking, index) => {
          // Simulate marker positions (in real app, these would be calculated from lat/lng)
          const positions = [
            { left: '20%', top: '30%' },
            { left: '60%', top: '40%' },
            { left: '40%', top: '60%' },
            { left: '70%', top: '20%' },
            { left: '30%', top: '70%' },
          ];
          const position = positions[index % positions.length];
          const isSelected = selectedParkingId === parking.id;

          return (
            <div
              key={parking.id}
              className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={position}
              onClick={() => onParkingClick(parking)}
            >
              <div className="relative">
                {isSelected && (
                  <div className="absolute -inset-2 bg-primary rounded-full opacity-20 animate-pulse"></div>
                )}
                <div
                  className={`relative bg-white rounded-full p-2 shadow-lg border-2 transition-all ${
                    isSelected ? 'border-primary scale-110' : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  <MapPin
                    size={24}
                    className={isSelected ? 'text-primary' : 'text-gray-700'}
                  />
                </div>
                {isSelected && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48">
                    <Card className="p-3 shadow-xl">
                      <h4 className="font-semibold text-sm mb-1">{parking.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{parking.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">
                          ₹{parking.pricePerHour || parking.pricePerDay}/hr
                        </span>
                        {parking.distance && (
                          <span className="text-xs text-gray-500">
                            {parking.distance} km
                          </span>
                        )}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Info Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
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
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>You</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin size={14} className="text-gray-700" />
                <span>Parking</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

