import { useState } from 'react';
import { Phone, Store, Truck } from 'lucide-react';
import { dbQueries } from '../lib/supabase';
import { isValidIndianMobile } from '../utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';

interface LoginProps {
  onLogin: (user: any) => void;
  onUserTypeSelect: (type: 'vendor' | 'supplier') => void;
  onShowRegistration: (type: 'vendor' | 'supplier') => void;
}

const Login = ({ onLogin, onUserTypeSelect, onShowRegistration }: LoginProps) => {
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isValidIndianMobile(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    
    try {
      let userData = null;
      
      if (userType === 'vendor') {
        const { data, error } = await dbQueries.getVendorByPhone(phone);
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        userData = data;
      } else {
        const { data, error } = await dbQueries.getSupplierByPhone(phone);
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        userData = data;
      }
      
      if (userData) {
        // User exists, log them in
        localStorage.setItem('userType', userType);
        localStorage.setItem('userData', JSON.stringify(userData));
        onUserTypeSelect(userType);
        onLogin(userData);
      } else {
        // New user, show registration form
        setError('Phone number not found. Please register first or check if you selected the correct user type.');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">StreetVendor</h1>
          <p className="text-gray-600">Connect with trusted suppliers</p>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setUserType('vendor')}
            className={`p-4 rounded-lg border-2 transition-all ${
              userType === 'vendor'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Store className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Food Vendor</span>
          </button>
          
          <button
            type="button"
            onClick={() => setUserType('supplier')}
            className={`p-4 rounded-lg border-2 transition-all ${
              userType === 'supplier'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Truck className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Supplier</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                maxLength={10}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              `Login as ${userType === 'vendor' ? 'Food Vendor' : 'Supplier'}`
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => onShowRegistration(userType)}
              className="text-orange-600 hover:text-orange-700 font-medium underline"
            >
              Sign up here
            </button>
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default Login;
