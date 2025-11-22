import type { Parking } from '../store/api/parkingApi';

export type SortOption = 
  | 'distance'
  | 'price-low'
  | 'price-high'
  | 'price-hourly-low'
  | 'price-hourly-high'
  | 'name';

export const sortParkings = (
  parkings: Parking[],
  sortBy: SortOption,
  userLocation?: { latitude: number; longitude: number }
): Parking[] => {
  const sorted = [...parkings];

  switch (sortBy) {
    case 'distance':
      if (!userLocation) return sorted;
      return sorted.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      });

    case 'price-low':
      return sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);

    case 'price-high':
      return sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);

    case 'price-hourly-low':
      return sorted.sort((a, b) => {
        const priceA = a.pricePerHour ?? Infinity;
        const priceB = b.pricePerHour ?? Infinity;
        return priceA - priceB;
      });

    case 'price-hourly-high':
      return sorted.sort((a, b) => {
        const priceA = a.pricePerHour ?? 0;
        const priceB = b.pricePerHour ?? 0;
        return priceB - priceA;
      });

    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    default:
      return sorted;
  }
};

