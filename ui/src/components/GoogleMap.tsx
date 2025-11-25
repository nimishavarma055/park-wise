import { useMemo } from 'react';
import { GoogleMap as GoogleMapComponent, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../context/GoogleMapsContext';

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places'];

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
    icon?: string;
  }>;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (markerId: string) => void;
  selectedMarkerId?: string;
  className?: string;
  height?: string;
}

export const GoogleMap = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  onMarkerClick,
  selectedMarkerId,
  className = '',
  height = '400px',
}: GoogleMapProps) => {
  const { isLoaded, loadError } = useGoogleMaps();

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
    }),
    [],
  );

  if (loadError) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Error loading Google Maps</p>
            <p className="text-gray-600 text-sm mt-2">
              {apiKey ? 'Please check your API key' : 'Please add VITE_GOOGLE_MAPS_API_KEY to your .env file'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-gray-600 text-sm mt-2">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <GoogleMapComponent
        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onClick={onMapClick}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => onMarkerClick?.(marker.id)}
            icon={
              selectedMarkerId === marker.id
                ? {
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    scaledSize: new google.maps.Size(40, 40),
                  }
                : marker.icon
                ? {
                    url: marker.icon,
                    scaledSize: new google.maps.Size(32, 32),
                  }
                : undefined
            }
          />
        ))}
      </GoogleMapComponent>
    </div>
  );
};

