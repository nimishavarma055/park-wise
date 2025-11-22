import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Upload } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { MapPlaceholder } from '../components/MapPlaceholder';
import { useAuth } from '../context/AuthContext';
import { useGetParkingByIdQuery, useUpdateParkingMutation } from '../store/api/parkingApi';

export const EditParking = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: parking, isLoading: isLoadingParking } = useGetParkingByIdQuery(id || '', { skip: !id });
  const [updateParking, { isLoading: isUpdating }] = useUpdateParkingMutation();

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

  useEffect(() => {
    if (parking) {
      setFormData({
        name: parking.name || '',
        address: parking.address || '',
        type: parking.type || 'covered',
        vehicleType: parking.vehicleType || 'both',
        pricePerDay: parking.pricePerDay?.toString() || '',
        pricePerMonth: parking.pricePerMonth?.toString() || '',
        pricePerHour: parking.pricePerHour?.toString() || '',
        description: parking.description || '',
      });
      setLatitude(parking.latitude || 0);
      setLongitude(parking.longitude || 0);
    }
  }, [parking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) {
      navigate('/login');
      return;
    }

    try {
      await updateParking({
        id,
        data: {
          name: formData.name,
          address: formData.address,
          latitude: latitude || 0,
          longitude: longitude || 0,
          type: formData.type,
          vehicleType: formData.vehicleType,
          description: formData.description,
          pricePerDay: parseFloat(formData.pricePerDay),
          pricePerMonth: parseFloat(formData.pricePerMonth),
          pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
        },
      }).unwrap();

      alert('Parking listing updated successfully!');
      navigate('/my-parking');
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to update parking listing. Please try again.');
    }
  };

  if (isLoadingParking) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading parking details...</p>
        </div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Parking listing not found.</p>
          <Button onClick={() => navigate('/my-parking')}>Go Back</Button>
        </Card>
      </div>
    );
  }

  if (!user || user.id !== parking.ownerId) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">You don't have permission to edit this listing.</p>
          <Button onClick={() => navigate('/my-parking')}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Parking Listing</h1>

        <form onSubmit={handleSubmit}>
          <Card className="p-8 space-y-6">
            <div>
              <Input
                label="Parking Name"
                placeholder="e.g., Downtown Covered Parking"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Input
                label="Address"
                placeholder="Full address of the parking space"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (Latitude, Longitude)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  required
                />
                <Input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <MapPlaceholder lat={latitude} lon={longitude} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parking Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="covered"
                    checked={formData.type === 'covered'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'covered' | 'open' })}
                    className="mr-2"
                  />
                  <span>Covered</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="open"
                    checked={formData.type === 'open'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'covered' | 'open' })}
                    className="mr-2"
                  />
                  <span>Open</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="2W"
                    checked={formData.vehicleType === '2W'}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as '2W' | '4W' | 'both' })}
                    className="mr-2"
                  />
                  <span>Two-Wheeler</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="4W"
                    checked={formData.vehicleType === '4W'}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as '2W' | '4W' | 'both' })}
                    className="mr-2"
                  />
                  <span>Four-Wheeler</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="vehicleType"
                    value="both"
                    checked={formData.vehicleType === 'both'}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as '2W' | '4W' | 'both' })}
                    className="mr-2"
                  />
                  <span>Both</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Price per Hour (₹)"
                type="number"
                step="0.01"
                placeholder="50.00"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              />
              <Input
                label="Price per Day (₹)"
                type="number"
                step="0.01"
                placeholder="200.00"
                value={formData.pricePerDay}
                onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                required
              />
              <Input
                label="Price per Month (₹)"
                type="number"
                step="0.01"
                placeholder="5000.00"
                value={formData.pricePerMonth}
                onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
                placeholder="Describe your parking space..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Listing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-parking')}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

