import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'status' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationSystemProps {
  user: any;
  userType: 'vendor' | 'supplier';
}

const NotificationSystem = ({ user: _user, userType }: NotificationSystemProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Simulate real-time notifications for demo
  useEffect(() => {
    const simulateNotifications = () => {
      if (userType === 'supplier') {
        // Simulate new order notifications for suppliers
        const orderNotifications = [
          {
            id: `notif-${Date.now()}`,
            type: 'order' as const,
            title: 'New Order Received!',
            message: 'Order #1234 from Ramesh Tiffin Center - ₹850',
            timestamp: new Date(),
            read: false
          }
        ];
        
        setNotifications(prev => [...orderNotifications, ...prev]);
      } else {
        // Simulate order status updates for vendors
        const statusNotifications = [
          {
            id: `notif-${Date.now()}`,
            type: 'status' as const,
            title: 'Order Confirmed!',
            message: 'Your order #1234 has been confirmed and is being prepared',
            timestamp: new Date(),
            read: false
          }
        ];
        
        setNotifications(prev => [...statusNotifications, ...prev]);
      }
    };

    // Simulate notifications every 30 seconds for demo
    const interval = setInterval(simulateNotifications, 30000);
    
    // Add initial notification after 5 seconds
    setTimeout(simulateNotifications, 5000);

    return () => clearInterval(interval);
  }, [userType]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-gray-400 hover:text-gray-600 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-orange-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'order' ? 'bg-green-100' :
                      notification.type === 'status' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {notification.type === 'order' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
