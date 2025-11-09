import { Camera, Zap, Shield, Clock, Car, Wifi } from 'lucide-react';

interface AmenityIconsProps {
  amenities: string[];
  className?: string;
}

const amenityIconMap: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  'CCTV': { icon: Camera, color: 'text-blue-600' },
  'EV Charging': { icon: Zap, color: 'text-green-600' },
  'Security Guard': { icon: Shield, color: 'text-purple-600' },
  '24/7 Access': { icon: Clock, color: 'text-orange-600' },
  'Valet Service': { icon: Car, color: 'text-indigo-600' },
  'WiFi': { icon: Wifi, color: 'text-gray-600' },
};

export const AmenityIcons = ({ amenities, className = '' }: AmenityIconsProps) => {
  const getIcon = (amenity: string) => {
    const normalized = amenity.toLowerCase();
    for (const [key, value] of Object.entries(amenityIconMap)) {
      if (normalized.includes(key.toLowerCase().split(' ')[0])) {
        return value;
      }
    }
    return null;
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {amenities.slice(0, 6).map((amenity, index) => {
        const iconData = getIcon(amenity);
        if (iconData) {
          const Icon = iconData.icon;
          return (
            <div
              key={index}
              className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-primary/50 transition-all group"
              title={amenity}
            >
              <Icon size={16} className={`${iconData.color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm text-gray-700 font-medium">{amenity}</span>
            </div>
          );
        }
        return (
          <div
            key={index}
            className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
            title={amenity}
          >
            <span className="text-sm text-gray-700 font-medium">{amenity}</span>
          </div>
        );
      })}
      {amenities.length > 6 && (
        <div className="flex items-center bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
          <span className="text-sm text-primary font-semibold">+{amenities.length - 6} more</span>
        </div>
      )}
    </div>
  );
};

