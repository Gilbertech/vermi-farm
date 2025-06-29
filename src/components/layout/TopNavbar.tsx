import React from 'react';
import { Menu, LogOut, User, Bell, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopNavbarProps {
  title: string;
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ title, onMenuClick }) => {
  const { logout, currentUser, notifications, markNotificationAsRead, approveAction, rejectAction } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin_initiator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin_initiator':
        return 'Admin (Initiator)';
      default:
        return 'Admin';
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
  };

  const handleApprove = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    approveAction(notificationId);
  };

  const handleReject = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    rejectAction(notificationId);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications - Only for Super Admin */}
          {currentUser?.role === 'super_admin' && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-800">Approval Requests</h3>
                  </div>
                  <div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No pending requests
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800">
                                {notification.actionType.charAt(0).toUpperCase() + notification.actionType.slice(1)} Request
                              </p>
                              <p className="text-sm text-gray-600">
                                {notification.initiatorName} requested {notification.actionType} of KES {notification.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                              
                              <div className="flex items-center space-x-2 mt-3">
                                <button
                                  onClick={(e) => handleApprove(notification.id, e)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={(e) => handleReject(notification.id, e)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentUser && (
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-400" />
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;