import { Clock } from 'lucide-react';
import type { TimeSlot } from '../data/mockParkings';
import { formatHour } from '../utils/timeSlots';

interface TimeSlotPickerProps {
  timeSlot?: TimeSlot;
  selectedHour?: number;
  onHourSelect?: (hour: number) => void;
  className?: string;
}

export const TimeSlotPicker = ({
  timeSlot,
  selectedHour,
  onHourSelect,
  className = '',
}: TimeSlotPickerProps) => {
  if (!timeSlot || !timeSlot.availableHours.length) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-1 text-sm text-gray-700">
        <Clock size={14} />
        <span className="font-medium">Available Hours</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {timeSlot.availableHours.map((hour) => {
          const isSelected = selectedHour === hour;
          return (
            <button
              key={hour}
              onClick={() => onHourSelect?.(hour)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatHour(hour)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

