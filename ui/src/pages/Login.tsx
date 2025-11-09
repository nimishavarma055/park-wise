import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Mail, Lock, Smartphone } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { mockUsers } from '../data/mockUsers';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      login(user);
      navigate('/');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleOtpRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      setShowOtp(true);
    }
  };

  const handleOtpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      const user = mockUsers[0];
      login(user);
      navigate('/');
    } else {
      alert('Invalid OTP');
    }
  };

  const handleGoogleLogin = () => {
    const user = mockUsers[0];
    login(user);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-soft flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MapPin className="text-primary" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ParkWise</h1>
          <p className="text-gray-600 mt-2">Find. Park. Earn.</p>
        </div>

        <Card className="p-8">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => {
                setLoginMethod('email');
                setShowOtp(false);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                loginMethod === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => {
                setLoginMethod('otp');
                setShowOtp(false);
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              OTP
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          ) : (
            <>
              {!showOtp ? (
                <form onSubmit={handleOtpRequest} className="space-y-4">
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpLogin} className="space-y-4">
                  <Input
                    type="text"
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Verify OTP
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Change number
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-4 w-full flex items-center justify-center space-x-2 border-2 border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

