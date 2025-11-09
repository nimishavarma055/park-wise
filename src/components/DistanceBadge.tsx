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
    <div className={`inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium ${className}`}>
      <MapPin size={16} />
      <span>{distance} km away</span>
    </div>
  );
};

