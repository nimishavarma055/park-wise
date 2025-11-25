import { CheckCircle, XCircle, TrendingUp, ParkingCircle, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useParking } from '../context/ParkingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { parkings, bookings } = useParking();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-600 mb-4">Access denied. Admin only.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const pendingListings = parkings.filter((p) => p.status === 'pending');
  const approvedListings = parkings.filter((p) => p.status === 'approved');
  const totalBookings = bookings.length;

  const handleApprove = (id: string) => {
    alert(`Parking ${id} approved!`);
  };

  const handleReject = (id: string) => {
    alert(`Parking ${id} rejected!`);
  };

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900">{parkings.length}</p>
              </div>
              <ParkingCircle className="text-primary" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <Calendar className="text-green-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900">{pendingListings.length}</p>
              </div>
              <TrendingUp className="text-yellow-600" size={32} />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Pending Listings</h2>
          {pendingListings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending listings</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/Day</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingListings.map((listing) => (
                    <tr key={listing.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{listing.name}</td>
                      <td className="py-3 px-4">{listing.address}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          listing.type === 'covered' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-accent'
                        }`}>
                          {listing.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">₹{listing.pricePerDay}</td>
                      <td className="py-3 px-4">{listing.ownerName}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            onClick={() => handleApprove(listing.id)}
                            className="flex items-center space-x-1 text-sm px-3 py-1"
                          >
                            <CheckCircle size={16} />
                            <span>Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReject(listing.id)}
                            className="flex items-center space-x-1 text-sm px-3 py-1 text-red-600 hover:text-red-700"
                          >
                            <XCircle size={16} />
                            <span>Reject</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

