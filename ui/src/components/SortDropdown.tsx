import { ChevronDown } from 'lucide-react';
import type { SortOption } from '../utils/sorting';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showDistance?: boolean;
}

const allSortOptions: { value: SortOption; label: string }[] = [
  { value: 'distance', label: 'Distance (Nearest)' },
  { value: 'price-low', label: 'Price (Low to High)' },
  { value: 'price-high', label: 'Price (High to Low)' },
  { value: 'price-hourly-low', label: 'Hourly Price (Low to High)' },
  { value: 'price-hourly-high', label: 'Hourly Price (High to Low)' },
  { value: 'name', label: 'Name (A-Z)' },
];

export const SortDropdown = ({ sortBy, onSortChange, showDistance = false }: SortDropdownProps) => {
  const sortOptions = showDistance 
    ? allSortOptions 
    : allSortOptions.filter(opt => opt.value !== 'distance');
  
  // If current sort is distance but distance is not available, reset to price-low
  const currentSort = sortBy === 'distance' && !showDistance ? 'price-low' : sortBy;

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
};

