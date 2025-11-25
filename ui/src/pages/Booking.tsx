import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGetParkingByIdQuery } from '../store/api/parkingApi';
import { useCreateBookingMutation } from '../store/api/bookingsApi';

export const Booking = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: parking, isLoading } = useGetParkingByIdQuery(id || '', { skip: !id });
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();

  const [duration, setDuration] = useState<'hourly' | 'daily' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState(1);
  const [selectedHour, setSelectedHour] = useState<number | undefined>();
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay'>('upi');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Parking space not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (duration === 'hourly') {
      return (parking.pricePerHour || parking.pricePerDay / 8) * hours;
    }
    if (duration === 'daily') {
      const days = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 1;
      return parking.pricePerDay * days;
    }
    return parking.pricePerMonth;
  };

  const handleConfirm = async () => {
    if (!user || !parking) {
      navigate('/login');
      return;
    }

    try {
      // Calculate start and end times based on duration
      let startTime: string;
      let endTime: string;

      if (duration === 'hourly') {
        const now = new Date();
        startTime = now.toISOString();
        const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
        endTime = end.toISOString();
      } else if (duration === 'daily') {
        startTime = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
        endTime = endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else {
        // Monthly
        const now = new Date();
        startTime = now.toISOString();
        const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        endTime = end.toISOString();
      }

      await createBooking({
        parkingId: parking.id,
        bookingType: duration,
        startTime,
        endTime,
      }).unwrap();

      setBookingConfirmed(true);
      setTimeout(() => {
        navigate('/my-parking');
      }, 2000);
    } catch (error: any) {
      alert(error?.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your parking space has been booked successfully.</p>
          <Button onClick={() => navigate('/my-parking')}>View My Bookings</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2" size={20} />
                Select Duration
              </h2>
              <div className="flex space-x-2 mb-6">
                {parking.pricePerHour && (
                  <button
                    onClick={() => setDuration('hourly')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      duration === 'hourly'
                        ? 'bg-cta text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Hourly
                  </button>
                )}
                <button
                  onClick={() => setDuration('daily')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    duration === 'daily'
                      ? 'bg-cta text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setDuration('monthly')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    duration === 'monthly'
                      ? 'bg-cta text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {duration === 'hourly' && (
                <div className="space-y-4">
                  {parking.timeSlots && (
                    <div>
                      <TimeSlotPicker
                        timeSlot={parking.timeSlots}
                        selectedHour={selectedHour}
                        onHourSelect={setSelectedHour}
                      />
                    </div>
                  )}
                  <Input
                    type="number"
                    label="Number of Hours"
                    value={hours.toString()}
                    onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                    min="1"
                    max={parking.timeSlots ? parking.timeSlots.availableHours.length : undefined}
                  />
                  {parking.timeSlots && selectedHour && (
                    <div className="text-sm text-gray-600 bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <Clock size={16} className="inline mr-2 inline" />
                      Selected time: {selectedHour.toString().padStart(2, '0')}:00
                      {hours > 1 && ` - ${(selectedHour + hours - 1).toString().padStart(2, '0')}:00`}
                    </div>
                  )}
                </div>
              )}

              {duration === 'daily' && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <Input
                    type="date"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}

              {duration === 'monthly' && (
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2" size={20} />
                Payment Method
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">UPI</div>
                  <div className="text-sm text-gray-600">Pay using UPI apps</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                    paymentMethod === 'razorpay'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">Razorpay</div>
                  <div className="text-sm text-gray-600">Credit/Debit Card, Net Banking</div>
                </button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Parking Space</div>
                  <div className="font-semibold">{parking.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-semibold">{parking.address}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-semibold capitalize">
                    {duration === 'hourly' && selectedHour
                      ? `${duration} (${selectedHour.toString().padStart(2, '0')}:00)`
                      : duration}
                  </div>
                  {duration === 'hourly' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {hours} {hours === 1 ? 'hour' : 'hours'}
                    </div>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold text-cta">₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleConfirm}
                disabled={isCreatingBooking}
              >
                {isCreatingBooking ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

