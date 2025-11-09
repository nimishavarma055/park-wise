export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "18:00"
  availableHours: number[]; // [9, 10, 11, 12, 13, 14, 15, 16, 17]
}

/**
 * Generate time slots for a given time range
 */
export const generateTimeSlots = (startHour: number, endHour: number): number[] => {
  const slots: number[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(hour);
  }
  return slots;
};

/**
 * Format hour to time string (e.g., 9 -> "09:00")
 */
export const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

/**
 * Check if a time slot is available
 */
export const isTimeSlotAvailable = (
  timeSlot: TimeSlot | undefined,
  hour: number
): boolean => {
  if (!timeSlot) return false;
  return timeSlot.availableHours.includes(hour);
};

/**
 * Get available time slots for display
 */
export const getAvailableTimeSlots = (timeSlot: TimeSlot | undefined): string[] => {
  if (!timeSlot) return [];
  return timeSlot.availableHours.map(formatHour);
};

