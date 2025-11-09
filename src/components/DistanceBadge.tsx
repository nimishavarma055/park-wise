import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
  distance?: number;
  className?: string;
}

export const DistanceBadge = ({ distance, className = '' }: DistanceBadgeProps) => {
  if (distance === undefined || distance === null) {
    return null;
  }

  return (
    <div className={`inline-flex items-center space-x-1 text-sm text-gray-600 ${className}`}>
      <MapPin size={14} />
      <span>{distance} km away</span>
    </div>
  );
};

