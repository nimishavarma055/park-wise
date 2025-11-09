import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Clock, Shield, Car, Bike } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ImageCarousel } from '../components/ImageCarousel';
import { TimeSlotPicker } from '../components/TimeSlotPicker';
import { DistanceBadge } from '../components/DistanceBadge';
import { AmenityIcons } from '../components/AmenityIcons';
import { useParking } from '../context/ParkingContext';
import { useState } from 'react';

export const ParkingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getParkingById } = useParking();
  const parking = id ? getParkingById(id) : undefined;
  const [priceType, setPriceType] = useState<'hourly' | 'daily' | 'monthly'>('daily');

  if (!parking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Parking space not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const getPrice = () => {
    if (priceType === 'hourly') return parking.pricePerHour || parking.pricePerDay / 8;
    if (priceType === 'monthly') return parking.pricePerMonth;
    return parking.pricePerDay;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ImageCarousel images={parking.images} />
            
            <Card variant="elevated" className="p-8 mt-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {parking.name}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={20} className="mr-2 text-gray-400" />
                    <span className="text-lg">{parking.address}</span>
                  </div>
                  {parking.distance && (
                    <div className="mb-4">
                      <DistanceBadge distance={parking.distance} className="text-base" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center">
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm ${
                    parking.type === 'covered' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}>
                    {parking.type === 'covered' ? 'Covered' : 'Open'} Parking
                  </span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  {parking.vehicleType === '2W' ? (
                    <Bike size={20} className="mr-2 text-primary" />
                  ) : parking.vehicleType === '4W' ? (
                    <Car size={20} className="mr-2 text-primary" />
                  ) : (
                    <>
                      <Bike size={20} className="mr-2 text-primary" />
                      <Car size={20} className="mr-2 text-primary" />
                    </>
                  )}
                  <span className="text-sm font-medium">
                    {parking.vehicleType === '2W' ? 'Two-Wheeler' : parking.vehicleType === '4W' ? 'Four-Wheeler' : 'Both'}
                  </span>
                </div>
                {parking.ownerVerified && (
                  <div className="flex items-center bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <CheckCircle size={18} className="text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Verified Owner</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                  About this parking
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg">{parking.description}</p>
              </div>

              <div className="border-t pt-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                  Amenities
                </h2>
                <AmenityIcons amenities={parking.amenities} />
              </div>

              {parking.distance && (
                <div className="border-t pt-6 mb-6">
                  <DistanceBadge distance={parking.distance} className="text-base" />
                </div>
              )}

              {priceType === 'hourly' && parking.timeSlots && (
                <div className="border-t pt-6">
                  <TimeSlotPicker timeSlot={parking.timeSlots} />
                </div>
              )}

              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                  Owner Information
                </h2>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {parking.ownerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-lg text-gray-900">{parking.ownerName}</span>
                      {parking.ownerVerified && (
                        <CheckCircle size={20} className="text-green-600" />
                      )}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">Parking Owner</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="elevated" className="p-8 bg-gradient-to-br from-primary/5 to-blue-50/50 border-primary/20">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-1 h-6 bg-primary rounded-full mr-3"></span>
                  Pricing
                </h2>
                
                <div className="flex space-x-2 mb-8">
                  {parking.pricePerHour && (
                    <button
                      onClick={() => setPriceType('hourly')}
                      className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                        priceType === 'hourly'
                          ? 'bg-primary text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                      }`}
                    >
                      Hourly
                    </button>
                  )}
                  <button
                    onClick={() => setPriceType('daily')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      priceType === 'daily'
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setPriceType('monthly')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-sm ${
                      priceType === 'monthly'
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="text-5xl font-bold text-primary mb-2">
                    ₹{getPrice()}
                  </div>
                  <div className="text-gray-600 font-medium text-lg mb-4">
                    per {priceType === 'hourly' ? 'hour' : priceType === 'daily' ? 'day' : 'month'}
                  </div>
                  {parking.distance && (
                    <div className="pt-4 border-t border-gray-200">
                      <DistanceBadge distance={parking.distance} className="text-base" />
                    </div>
                  )}
                </div>

                {priceType === 'hourly' && parking.timeSlots && (
                  <div className="mb-6">
                    <TimeSlotPicker timeSlot={parking.timeSlots} />
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full mb-4"
                  onClick={() => navigate(`/booking/${parking.id}`)}
                >
                  Book Now
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock size={16} className="mr-2" />
                    <span>24/7 Available</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Shield size={16} className="mr-2" />
                    <span>Secure & Verified</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

