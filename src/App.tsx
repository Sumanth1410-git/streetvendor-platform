import { useState, useEffect } from 'react';
import Login from './components/Login';
import Registration from './components/Registration';
import VendorDashboard from './components/VendorDashboard';
import SupplierDashboard from './components/SupplierDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

function App() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'vendor' | 'supplier' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationType, setRegistrationType] = useState<'vendor' | 'supplier'>('vendor');

  useEffect(() => {
    // Check if user is logged in from localStorage
    const getUser = async () => {
      const storedUserType = localStorage.getItem('userType') as 'vendor' | 'supplier' | null;
      const storedUserData = localStorage.getItem('userData');
      
      if (storedUserType && storedUserData) {
        setUserType(storedUserType);
        setUser(JSON.parse(storedUserData));
      }
      
      setLoading(false);
    };

    getUser();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setShowRegistration(false);
    localStorage.removeItem('userType');
    localStorage.removeItem('userData');
  };

  const handleShowRegistration = (type: 'vendor' | 'supplier') => {
    setRegistrationType(type);
    setShowRegistration(true);
  };

  const handleRegistrationSuccess = (userData: any) => {
    setUser(userData);
    setUserType(registrationType);
    setShowRegistration(false);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  // Show registration page
  if (showRegistration) {
    return (
      <Registration
        userType={registrationType}
        onSuccess={handleRegistrationSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Show login page
  if (!user) {
    return (
      <Login
        onLogin={setUser}
        onUserTypeSelect={setUserType}
        onShowRegistration={handleShowRegistration}
      />
    );
  }

  // Render appropriate dashboard based on user type
  if (userType === 'vendor') {
    return <VendorDashboard user={user} onLogout={handleLogout} />;
  }

  if (userType === 'supplier') {
    return <SupplierDashboard user={user} onLogout={handleLogout} />;
  }

  return null;
}

export default App;
