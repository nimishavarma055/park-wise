import { X } from 'lucide-react';

interface FilterBarProps {
  filters: {
    type?: 'covered' | 'open';
    vehicleType?: '2W' | '4W' | 'both';
    duration?: 'hourly' | 'daily' | 'monthly';
    amenities?: string[];
  };
  onFilterChange: (filters: FilterBarProps['filters']) => void;
}

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const removeFilter = (key: keyof typeof filters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFilterChange(newFilters);
  };

  const activeFilters = Object.entries(filters).filter(([_, value]) => value !== undefined);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map(([key, value]) => {
        const isArray = Array.isArray(value);
        const displayValue = key === 'type' 
          ? value 
          : key === 'vehicleType' 
            ? (value === '2W' ? 'Two-Wheeler' : value === '4W' ? 'Four-Wheeler' : 'Both') 
            : key === 'duration'
              ? value
              : key === 'amenities'
                ? (isArray && value.length > 0 ? `${value.length} selected` : '')
                : String(value);
        
        if (key === 'amenities' && (!isArray || value.length === 0)) return null;
        
        return (
          <div
            key={key}
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <span className="capitalize">
              {displayValue}
            </span>
            <button
              onClick={() => removeFilter(key as keyof typeof filters)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors ml-1"
              aria-label={`Remove ${key} filter`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

