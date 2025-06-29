import React from 'react';
import { Menu, LogOut, User, Bell, Check, X, AlertTriangle, DollarSign, CreditCard, ArrowLeftRight } from 'lucide-react';
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_initiated':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'loan_initiated':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'transfer_initiated':
        return <ArrowLeftRight className="w-5 h-5 text-purple-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'payment_initiated':
        return 'Payment Request';
      case 'loan_initiated':
        return 'Loan Request';
      case 'transfer_initiated':
        return 'Transfer Request';
      default:
        return 'Request';
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#2d8e41] to-[#246b35]">
                    <h3 className="text-sm font-medium text-white flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span>Approval Requests ({unreadCount} pending)</span>
                    </h3>
                  </div>
                  <div>
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p>No pending requests</p>
                        <p className="text-xs text-gray-400 mt-1">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                            !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {getNotificationIcon(notification.type)}
                                <p className="text-sm font-medium text-gray-800">
                                  {getNotificationTitle(notification.type)}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">{notification.initiatorName}</span> requested{' '}
                                <span className="font-semibold text-[#2d8e41]">
                                  KES {notification.amount.toLocaleString()}
                                </span>
                              </p>
                              
                              <p className="text-xs text-gray-500 mb-3">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => handleApprove(notification.id, e)}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 shadow-sm"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={(e) => handleReject(notification.id, e)}
                                  className="bg-red-600 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 transition-colors duration-200 flex items-center space-x-1 shadow-sm"
                                >
                                  <X className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <p className="text-xs text-gray-500 text-center">
                        💡 Tip: Click on notifications to mark as read
                      </p>
                    </div>
                  )}
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