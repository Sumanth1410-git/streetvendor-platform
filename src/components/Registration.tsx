import { useState } from 'react';
import { Phone, Store, Truck, User, MapPin, ArrowLeft } from 'lucide-react';
import { dbQueries } from '../lib/supabase';
import { isValidIndianMobile } from '../utils/helpers';
import LoadingSpinner from './common/LoadingSpinner';

interface RegistrationProps {
  userType: 'vendor' | 'supplier';
  onSuccess: (user: any) => void;
  onBack: () => void;
}

const Registration = ({ userType, onSuccess, onBack }: RegistrationProps) => {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    businessName: '',
    area: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!isValidIndianMobile(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    
    if (!formData.area.trim()) {
      setError('Please enter your area/location');
      return false;
    }

    if (userType === 'supplier') {
      if (!formData.businessName.trim()) {
        setError('Please enter your business name');
        return false;
      }
      if (!formData.address.trim()) {
        setError('Please enter your business address');
        return false;
      }
    }

    return true;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      let userData = null;
      
      if (userType === 'vendor') {
        // Register new vendor
        const { data, error } = await dbQueries.createVendor({
          phone: formData.phone,
          name: formData.name,
          business_name: formData.businessName || null,
          area: formData.area,
          // You can add coordinates later with a geocoding service
          latitude: null,
          longitude: null
        });
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('Phone number already registered. Please try logging in instead.');
          }
          throw error;
        }
        userData = data;
        
      } else {
        // Register new supplier
        const { data, error } = await dbQueries.createSupplier({
          business_name: formData.businessName,
          owner_name: formData.name,
          phone: formData.phone,
          address: formData.address,
          area: formData.area,
          kyc_verified: false, // New suppliers start unverified
          rating: 0,
          total_reviews: 0,
          latitude: null,
          longitude: null
        });
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            throw new Error('Phone number already registered. Please try logging in instead.');
          }
          throw error;
        }
        userData = data;
      }
      
      // Store user data and redirect to dashboard
      localStorage.setItem('userType', userType);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      alert(`🎉 Registration successful! Welcome to StreetVendor, ${userData.name || userData.business_name}!`);
      onSuccess(userData);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {userType === 'vendor' ? (
              <Store className="w-8 h-8 text-white" />
            ) : (
              <Truck className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join StreetVendor
          </h1>
          <p className="text-gray-600">
            Register as a {userType === 'vendor' ? 'Food Vendor' : 'Supplier'}
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegistration} className="space-y-4">
          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {userType === 'vendor' ? 'Your Name' : 'Owner Name'} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={userType === 'vendor' ? 'Enter your full name' : 'Enter owner name'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Business Name (Required for suppliers, optional for vendors) */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name {userType === 'supplier' ? '*' : '(Optional)'}
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder={userType === 'vendor' ? 'e.g., Ramesh Tiffin Center' : 'e.g., Fresh Vegetables Store'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                required={userType === 'supplier'}
              />
            </div>
          </div>

          {/* Area/Location */}
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Area/Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                placeholder="e.g., Yeddumailaram, Kondapur, etc."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Address (Only for suppliers) */}
          {userType === 'supplier' && (
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete business address"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                required
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || formData.phone.length !== 10}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Creating Account...</span>
              </div>
            ) : (
              `Create ${userType === 'vendor' ? 'Vendor' : 'Supplier'} Account`
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Registration;
