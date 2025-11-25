import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { MapPlaceholder } from '../components/MapPlaceholder';
import { useAuth } from '../context/AuthContext';
import { useCreateParkingMutation } from '../store/api/parkingApi';

export const ListParking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createParking, { isLoading: isCreating }] = useCreateParkingMutation();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'covered' as 'covered' | 'open',
    vehicleType: 'both' as '2W' | '4W' | 'both',
    pricePerDay: '',
    pricePerMonth: '',
    pricePerHour: '',
    description: '',
  });

  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (!latitude || !longitude) {
        alert('Please select a location on the map');
        return;
      }
      
      await createParking({
        name: formData.name,
        address: formData.address,
        latitude: latitude,
        longitude: longitude,
        type: formData.type,
        vehicleType: formData.vehicleType,
        description: formData.description,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerMonth: parseFloat(formData.pricePerMonth),
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
      }).unwrap();

      alert('Parking listing submitted for approval!');
      navigate('/my-parking');
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to create parking listing. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Please login to list your parking space.</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">List Your Parking Space</h1>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <Input
                label="Parking Name"
                placeholder="e.g., Secure Parking - MG Road"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  placeholder="Enter full address or use the map search below to auto-fill"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Location</label>
                <MapPlaceholder 
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  onAddressChange={(addr, lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setFormData({ ...formData, address: addr });
                  }}
                  markerTitle="Parking Location"
                  showSearch={true}
                />
                {latitude && longitude && (
                  <p className="text-xs text-gray-500 mt-2">
                    Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Parking Type</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coverage</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'covered' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'covered'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Covered
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'open' })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      formData.type === 'open'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Open
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as '2W' | '4W' | 'both' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="2W">Two-Wheeler Only</option>
                  <option value="4W">Four-Wheeler Only</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                label="Price per Hour (₹)"
                placeholder="20"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              />
              <Input
                type="number"
                label="Price per Day (₹)"
                placeholder="150"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                required
              />
              <Input
                type="number"
                label="Price per Month (₹)"
                placeholder="3500"
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                required
              />
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Availability</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(availability).map(([day, available]) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setAvailability({ ...availability, [day]: !available })}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    available
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Description & Photos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe your parking space, amenities, and any special features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isCreating}
            >
              {isCreating ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

