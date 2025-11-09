import { MapPin } from 'lucide-react';

export const MapPlaceholder = () => {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
      <div className="relative z-10 text-center">
        <MapPin className="mx-auto text-gray-600 mb-2" size={48} />
        <p className="text-gray-600 font-medium">Google Maps Integration</p>
        <p className="text-gray-500 text-sm mt-1">Map will be displayed here</p>
      </div>
    </div>
  );
};

