import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { TabSwitch } from '../components/TabSwitch';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGetBookingsQuery } from '../store/api/bookingsApi';
import { useGetParkingsQuery } from '../store/api/parkingApi';

export const MyParking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'listings'>('bookings');
  
  const { data: bookingsData, isLoading: isLoadingBookings } = useGetBookingsQuery(
    { page: 1, limit: 100 },
    { skip: !user }
  );
  
  const { data: parkingsData, isLoading: isLoadingParkings } = useGetParkingsQuery(
    { page: 1, limit: 100, ownerId: user?.id },
    { skip: !user || activeTab !== 'listings' }
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Please login to view your parking.</p>
          <Button onClick={() => navigate('/login')}>Login</Button>
        </Card>
      </div>
    );
  }

  const userBookings = bookingsData?.data || [];
  const userListings = parkingsData?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Parking</h1>

        <TabSwitch
          tabs={[
            { id: 'bookings', label: 'My Bookings' },
            { id: 'listings', label: 'My Listings' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as 'bookings' | 'listings')}
        />

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {userBookings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">No bookings found.</p>
                <Button onClick={() => navigate('/')}>Find Parking</Button>
              </Card>
            ) : (
              userBookings.map((booking) => (
                <Card key={booking.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{booking.parkingName}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="capitalize">{booking.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className="text-lg font-bold text-primary">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/parking/${booking.parkingId}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            {userListings.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500 mb-4">No listings found.</p>
                <Button onClick={() => navigate('/list-parking')}>List Your Parking</Button>
              </Card>
            ) : (
              userListings.map((listing) => (
                <Card key={listing.id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48">
                      <img
                        src={listing.images[0] || 'https://via.placeholder.com/300x200?text=Parking'}
                        alt={listing.name}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Parking+Space';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{listing.name}</h3>
                          <div className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin size={16} className="mr-1" />
                            <span>{listing.location}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mb-4 text-sm">
                        <span className="text-gray-600">
                          ₹{listing.pricePerDay}/day
                        </span>
                        <span className="text-gray-600">
                          ₹{listing.pricePerMonth}/month
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          listing.type === 'covered' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-accent'
                        }`}>
                          {listing.type}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/parking/${listing.id}`)}
                          className="flex items-center space-x-1"
                        >
                          <span>View</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

