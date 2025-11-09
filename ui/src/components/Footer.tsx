import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="text-primary" size={24} />
              <span className="text-xl font-bold">ParkWise</span>
            </div>
            <p className="text-gray-400 text-sm">
              Find. Park. Earn.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Drivers</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Find Parking</Link></li>
              <li><Link to="/my-parking" className="hover:text-white">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Owners</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/list-parking" className="hover:text-white">List Your Parking</Link></li>
              <li><Link to="/my-parking" className="hover:text-white">My Listings</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ParkWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

