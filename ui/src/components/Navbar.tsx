import { Link, useNavigate } from 'react-router-dom';
import { MapPin, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <MapPin className="text-primary" size={24} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">ParkWise</div>
              <div className="text-xs text-gray-500 -mt-1 font-medium">Find. Park. Earn.</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/my-parking" className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                  My Parking
                </Link>
                <Link to="/list-parking" className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                  List Your Parking
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-50">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || ''}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
                  Login
                </Link>
                <Link to="/signup">
                  <button className="bg-cta text-white px-5 py-2.5 rounded-lg hover:bg-[#00A693] transition-all shadow-md hover:shadow-lg font-semibold">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t">
            {isAuthenticated ? (
              <>
                <Link to="/my-parking" className="block py-2 text-gray-700 hover:text-primary">
                  My Parking
                </Link>
                <Link to="/list-parking" className="block py-2 text-gray-700 hover:text-primary">
                  List Your Parking
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700 hover:text-primary">
                    Admin
                  </Link>
                )}
                <div className="py-2 text-gray-700">{user?.name}</div>
                <button onClick={handleLogout} className="block py-2 text-gray-700 hover:text-primary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary">
                  Login
                </Link>
                <Link to="/signup" className="block py-2 text-gray-700 hover:text-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

