import React from 'react';
import { Menu, LogOut, User, Bell, Check, X, AlertTriangle, DollarSign, CreditCard, ArrowLeftRight, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SettingsModal from '../settings/SettingsModal';

interface TopNavbarProps {
  title: string;
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ title, onMenuClick }) => {
  const { logout, currentUser, notifications, markNotificationAsRead, approveAction, rejectAction } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin_initiator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Royford Mutegi';
      case 'admin_initiator':
        return 'Admin (Initiator)';
      default:
        return 'Admin';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_initiated':
        return <DollarSign className="w-5 h-5 text-[#2D8E41]" />;
      case 'loan_initiated':
        return <CreditCard className="w-5 h-5 text-[#983F21]" />;
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

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const renderNotificationDetails = (notification: any) => {
    const details = notification.details || {};

    switch (notification.type) {
      case 'loan_initiated':
        return (
          <div className="mt-2 p-3 bg-[#F9F9F9] dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Loan Details</h4>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {details.borrowerName && (
                <div className="flex justify-between">
                  <span>Borrower:</span>
                  <span className="font-medium">{details.borrowerName}</span>
                </div>
              )}
              {details.groupName && (
                <div className="flex justify-between">
                  <span>Village Banks:</span>
                  <span className="font-medium">{details.groupName}</span>
                </div>
              )}
              {details.loanType && (
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{details.loanType} Loan</span>
                </div>
              )}
              {details.interestRate && (
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-medium">{details.interestRate}%</span>
                </div>
              )}
              {details.dueDate && (
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-medium">{new Date(details.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {details.purpose && (
                <div className="mt-2">
                  <span className="font-medium">Purpose:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{details.purpose}</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'payment_initiated':
        return (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-semibold text-[#2D8E41] dark:text-green-400 mb-2">Payment Details</h4>
            <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
              {details.paymentType && (
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{details.paymentType}</span>
                </div>
              )}
              {details.recipientName && (
                <div className="flex justify-between">
                  <span>Recipient:</span>
                  <span className="font-medium">{details.recipientName}</span>
                </div>
              )}
              {details.recipientPhone && (
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium">{details.recipientPhone}</span>
                </div>
              )}
              {details.paybillNumber && (
                <div className="flex justify-between">
                  <span>Paybill:</span>
                  <span className="font-medium">{details.paybillNumber}</span>
                </div>
              )}
              {details.accountNumber && (
                <div className="flex justify-between">
                  <span>Account:</span>
                  <span className="font-medium">{details.accountNumber}</span>
                </div>
              )}
              {details.businessNumber && (
                <div className="flex justify-between">
                  <span>Business:</span>
                  <span className="font-medium">{details.businessNumber}</span>
                </div>
              )}
              {details.purpose && (
                <div className="mt-2">
                  <span className="font-medium">Purpose:</span>
                  <p className="text-[#2D8E41] dark:text-green-400 mt-1">{details.purpose}</p>
                </div>
              )}
              {details.bulkCount && (
                <div className="flex justify-between">
                  <span>Recipients:</span>
                  <span className="font-medium">{details.bulkCount} payments</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'transfer_initiated':
        return (
          <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-semibold text-[#983F21] dark:text-orange-400 mb-2">Transfer Details</h4>
            <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
              {details.fromPortfolio && (
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="font-medium capitalize">{details.fromPortfolio} Portfolio</span>
                </div>
              )}
              {details.toPortfolio && (
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="font-medium capitalize">{details.toPortfolio} Portfolio</span>
                </div>
              )}
              {details.reference && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium">{details.reference}</span>
                </div>
              )}
              {details.description && (
                <div className="mt-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{details.description}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center justify-between px-4 md:px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {currentUser?.role === 'super_admin' && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-[#E7F4EA] dark:bg-gray-800 rounded-lg shadow-xl border border-[#2D8E41] dark:border-gray-600 z-50 max-h-[80vh] overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-[#2D8E41] to-[#3FA853] flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <span>Approval Requests ({unreadCount} pending)</span>
                      </h3>
                      <button
                        onClick={handleCloseNotifications}
                        className="text-white hover:text-gray-200 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-96">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                          <AlertTriangle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                          <p>No pending requests</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                              !notification.read ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {getNotificationIcon(notification.type)}
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {getNotificationTitle(notification.type)}
                                  </p>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                  <span className="font-medium">{notification.initiatorName}</span> requested{' '}
                                  <span className="font-semibold text-[#2D8E41] dark:text-green-400">
                                    KES {notification.amount.toLocaleString()}
                                  </span>
                                </p>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>

                                {renderNotificationDetails(notification)}

                                <div className="flex items-center space-x-2 mt-3">
                                  <button
                                    onClick={(e) => handleApprove(notification.id, e)}
                                    className="bg-[#2D8E41] text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 transition-colors duration-200 flex items-center space-x-1 shadow-sm"
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
                      <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          💡 Tip: Click on notifications to mark as read
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            {currentUser && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.name}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(currentUser.role)}`}>
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

export default TopNavbar;