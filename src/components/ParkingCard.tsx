import { useNavigate } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { DistanceBadge } from './DistanceBadge';
import { AmenityIcons } from './AmenityIcons';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { Parking } from '../data/mockParkings';
import { useState } from 'react';

interface ParkingCardProps {
  parking: Parking;
  showTimeSlots?: boolean;
}

export const ParkingCard = ({ parking, showTimeSlots = false }: ParkingCardProps) => {
  const navigate = useNavigate();
  const [priceType, setPriceType] = useState<'hourly' | 'daily' | 'monthly'>('daily');

  const getPrice = () => {
    if (priceType === 'hourly') return parking.pricePerHour || parking.pricePerDay / 8;
    if (priceType === 'monthly') return parking.pricePerMonth;
    return parking.pricePerDay;
  };

  const getPriceLabel = () => {
    if (priceType === 'hourly') return 'hour';
    if (priceType === 'monthly') return 'month';
    return 'day';
  };

  return (
    <Card
      onClick={() => navigate(`/parking/${parking.id}`)}
      variant="elevated"
      className="overflow-hidden group"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={parking.images[0] || 'https://via.placeholder.com/400x300?text=Parking'}
          alt={parking.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Parking+Space';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-white/20">
          <div className="flex items-center space-x-1 mb-1.5">
            {parking.pricePerHour && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPriceType('hourly');
                }}
                className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${
                  priceType === 'hourly'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hr
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPriceType('daily');
              }}
              className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${
                priceType === 'daily'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPriceType('monthly');
              }}
              className={`text-xs px-2 py-1 rounded-md font-medium transition-all ${
                priceType === 'monthly'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mo
            </button>
          </div>
          <div className="text-base font-bold text-primary">
            ₹{getPrice()}<span className="text-xs font-normal text-gray-500">/{getPriceLabel()}</span>
          </div>
        </div>
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md backdrop-blur-sm ${
              parking.type === 'covered'
                ? 'bg-blue-600/90 text-white'
                : 'bg-green-600/90 text-white'
            }`}
          >
            {parking.type}
          </span>
          {parking.ownerVerified && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-green-700 shadow-md">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-primary transition-colors">
          {parking.name}
        </h3>
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <MapPin size={16} className="mr-1.5 text-gray-400" />
          <span className="truncate">{parking.location}</span>
        </div>
        <DistanceBadge distance={parking.distance} className="mb-3" />
        <AmenityIcons amenities={parking.amenities} className="mb-4" />
        {showTimeSlots && parking.timeSlots && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <TimeSlotPicker timeSlot={parking.timeSlots} />
          </div>
        )}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {parking.vehicleType === '2W'
                ? 'Two-Wheeler'
                : parking.vehicleType === '4W'
                ? 'Four-Wheeler'
                : 'Both'}
            </span>
          </div>
          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/parking/${parking.id}`);
            }}
            className="text-sm px-5 py-2.5"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

