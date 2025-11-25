import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FilterBar } from '../components/FilterBar';
import { ViewToggle } from '../components/ViewToggle';
import { MapView } from '../components/MapView';
import { ParkingCard } from '../components/ParkingCard';
import { SortDropdown } from '../components/SortDropdown';
import { LocationSearch } from '../components/LocationSearch';
import { useLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/geolocation';
import { sortParkings, type SortOption } from '../utils/sorting';
import { useSearchParkingsQuery, useGetParkingsQuery, type Parking } from '../store/api/parkingApi';

export const Home = () => {
  const navigate = useNavigate();
  const { userLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'map' | 'list'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('price-low');
  const [selectedParkingId, setSelectedParkingId] = useState<string | undefined>();
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Auto-switch to distance sorting when location is set
  useEffect(() => {
    if (searchLocation || userLocation) {
      setSortBy('distance');
    }
  }, [searchLocation, userLocation]);
  const [filters, setFilters] = useState<{
    type?: 'covered' | 'open';
    vehicleType?: '2W' | '4W' | 'both';
    duration?: 'hourly' | 'daily' | 'monthly';
    amenities?: string[];
  }>({});

  // Fetch parkings using RTK Query
  // Use searchLocation if set, otherwise use userLocation
  const locationToUse = searchLocation || (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null);
  const shouldSearch = locationToUse && (locationToUse.lat && locationToUse.lng);
  
  const searchParams = shouldSearch ? {
    latitude: locationToUse.lat,
    longitude: locationToUse.lng,
    radius: 10,
    type: filters.type,
    vehicleType: filters.vehicleType,
    amenities: filters.amenities,
    page: 1,
    limit: 100,
  } : undefined;

  const { data: searchData, isLoading: isSearchLoading } = useSearchParkingsQuery(
    searchParams!,
    { skip: !shouldSearch }
  );

  const { data: listData, isLoading: isListLoading } = useGetParkingsQuery(
    {
      page: 1,
      limit: 100,
      type: filters.type,
      status: 'approved',
    },
    { skip: !!shouldSearch }
  );

  const isLoading = isSearchLoading || isListLoading;
  const parkingsData = shouldSearch ? searchData : listData;
  
  // Handle both response structures (with meta or flat)
  const parkings = useMemo(() => {
    if (!parkingsData) return [];
    // Check if response has meta (backend structure) or is flat (frontend structure)
    if (parkingsData.data && Array.isArray(parkingsData.data)) {
      return parkingsData.data;
    }
    // Fallback: if data is directly an array (shouldn't happen, but safety check)
    if (Array.isArray(parkingsData)) {
      return parkingsData;
    }
    return [];
  }, [parkingsData]);

  // Calculate distances when location changes
  const parkingsWithDistance = useMemo(() => {
    if (!Array.isArray(parkings) || parkings.length === 0) return [];
    const location = searchLocation || (userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : null);
    if (!location) return parkings;
    return parkings.map((parking) => ({
      ...parking,
      distance: parking.distance || calculateDistance(
        location.lat,
        location.lng,
        parking.latitude,
        parking.longitude
      ),
    }));
  }, [parkings, userLocation, searchLocation]);

  // Filter parkings
  const filteredParkings = useMemo(() => {
    if (!Array.isArray(parkingsWithDistance)) return [];
    return parkingsWithDistance.filter((parking) => {
      // Search filter
      if (
        searchQuery &&
        !parking.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !parking.address.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (filters.type && parking.type !== filters.type) return false;

      // Vehicle type filter
      if (
        filters.vehicleType &&
        parking.vehicleType !== filters.vehicleType &&
        parking.vehicleType !== 'both'
      )
        return false;

      // Duration filter
      if (filters.duration) {
        if (filters.duration === 'hourly' && !parking.pricePerHour) return false;
        if (filters.duration === 'daily' && !parking.pricePerDay) return false;
        if (filters.duration === 'monthly' && !parking.pricePerMonth) return false;
      }

      // Amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        const parkingAmenities = parking.amenities || [];
        const hasAllAmenities = filters.amenities.every((amenity: string) =>
          parkingAmenities.some((p: string) =>
            p.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) return false;
      }

      return parking.status === 'approved';
    });
  }, [parkingsWithDistance, searchQuery, filters]);

  // Sort parkings
  const sortedParkings = useMemo(() => {
    return sortParkings(filteredParkings, sortBy, userLocation);
  }, [filteredParkings, sortBy, userLocation]);

  const handleParkingClick = (parking: Parking) => {
    setSelectedParkingId(parking.id);
    if (view === 'map') {
      // On mobile, navigate directly; on desktop, show details
      if (window.innerWidth < 768) {
        navigate(`/parking/${parking.id}`);
      }
    } else {
      navigate(`/parking/${parking.id}`);
    }
  };

  // Get all unique amenities for filter
  const allAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    parkingsWithDistance.forEach((parking) => {
      (parking.amenities || []).forEach((amenity: string) => {
        amenitySet.add(amenity);
      });
    });
    return Array.from(amenitySet);
  }, [parkingsWithDistance]);

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-accent mb-2 bg-gradient-to-r from-primary to-cta bg-clip-text text-transparent">
              Find Parking Near You
            </h1>
            <p className="text-gray-600 text-lg">Discover the perfect parking spot for your needs</p>
          </div>
          
          {/* Search and Controls */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by parking name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white shadow-sm hover:shadow-md"
                />
              </div>
              <div className="flex-1">
                <LocationSearch
                  onLocationSelect={(address, lat, lng) => {
                    setSearchLocation({ lat, lng, address });
                    setSearchQuery(address);
                  }}
                  placeholder="Search for a location..."
                  className="w-full"
                />
              </div>
            </div>
            {searchLocation && (
              <div className="flex items-center justify-between bg-primary/10 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} className="text-primary" />
                  <span className="text-sm text-gray-700">
                    Searching near: {searchLocation.address || `${searchLocation.lat.toFixed(4)}, ${searchLocation.lng.toFixed(4)}`}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchLocation(null);
                    setSearchQuery('');
                  }}
                  className="text-xs px-3 py-1"
                >
                  Clear
                </Button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <ViewToggle view={view} onViewChange={setView} />
              <Button
                variant={showFilters ? "primary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-6"
              >
                <Filter size={20} />
                <span className="hidden sm:inline">Filters</span>
                {Object.keys(filters).length > 0 && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {Object.keys(filters).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card variant="elevated" className="p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        type: (e.target.value as 'covered' | 'open') || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="covered">Covered</option>
                    <option value="open">Open</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Type
                  </label>
                  <select
                    value={filters.vehicleType || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        vehicleType: (e.target.value as '2W' | '4W' | 'both') || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Vehicles</option>
                    <option value="2W">Two-Wheeler</option>
                    <option value="4W">Four-Wheeler</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={filters.duration || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        duration: (e.target.value as 'hourly' | 'daily' | 'monthly') || undefined,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Durations</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const amenity = e.target.value;
                      if (amenity) {
                        setFilters({
                          ...filters,
                          amenities: [...(filters.amenities || []), amenity],
                        });
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Amenity</option>
                    {allAmenities
                      .filter((a) => !filters.amenities?.includes(a))
                      .map((amenity) => (
                        <option key={amenity} value={amenity}>
                          {amenity}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Active Filters and Sort */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <FilterBar filters={filters} onFilterChange={setFilters} />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Sort by:</span>
              <SortDropdown 
                sortBy={sortBy} 
                onSortChange={setSortBy}
                showDistance={!!userLocation}
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading parking spaces...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && view === 'map' ? (
          <div className="mb-6">
            <MapView
              parkings={sortedParkings}
              userLocation={searchLocation ? { latitude: searchLocation.lat, longitude: searchLocation.lng } : userLocation}
              onParkingClick={handleParkingClick}
              selectedParkingId={selectedParkingId}
            />
            {selectedParkingId && window.innerWidth >= 768 && (
              <div className="mt-4">
                {(() => {
                  const parking = sortedParkings.find((p) => p.id === selectedParkingId);
                  return parking ? (
                    <ParkingCard parking={parking} showTimeSlots={true} />
                  ) : null;
                })()}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedParkings.map((parking) => (
              <ParkingCard
                key={parking.id}
                parking={parking}
                showTimeSlots={filters.duration === 'hourly'}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedParkings.length === 0 && (
          <Card variant="outlined" className="text-center py-16 my-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-gray-400" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No parking spaces found</h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search query to find more results
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({});
                  setShowFilters(false);
                }}
                className="px-8"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        {sortedParkings.length > 0 && (
          <div className="mt-10">
            <Card variant="elevated" className="p-8 bg-gradient-to-br from-primary/5 to-cta/10 border-primary/20">
              <h3 className="text-xl font-bold text-accent mb-6 flex items-center">
                <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-sm mb-2 font-medium">Total Listings</p>
                  <p className="text-3xl font-bold text-primary">{sortedParkings.length}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-sm mb-2 font-medium">Covered</p>
                  <p className="text-3xl font-bold text-primary">
                    {sortedParkings.filter((p) => p.type === 'covered').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-sm mb-2 font-medium">Open</p>
                  <p className="text-3xl font-bold text-secondary">
                    {sortedParkings.filter((p) => p.type === 'open').length}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-600 text-sm mb-2 font-medium">Hourly Available</p>
                  <p className="text-3xl font-bold text-cta">
                    {sortedParkings.filter((p) => p.pricePerHour).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
