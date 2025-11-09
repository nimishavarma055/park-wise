import { Map, List } from 'lucide-react';

interface ViewToggleProps {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List size={18} />
        <span className="font-medium">List</span>
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
          view === 'map'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Map size={18} />
        <span className="font-medium">Map</span>
      </button>
    </div>
  );
};

