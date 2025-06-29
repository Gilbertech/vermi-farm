import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'super_admin' | 'admin_initiator';
}

interface Notification {
  id: string;
  type: 'payment_initiated' | 'loan_initiated' | 'transfer_initiated';
  message: string;
  initiatorName: string;
  amount: number;
  timestamp: string;
  read: boolean;
  actionType: 'payment' | 'loan' | 'transfer';
  details?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentView: 'login' | 'reset-password';
  currentUser: User | null;
  notifications: Notification[];
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (phone: string) => Promise<boolean>;
  setCurrentView: (view: 'login' | 'reset-password') => void;
  canInitiate: () => boolean;
  canApprove: () => boolean;
  canTransferPortfolio: () => boolean;
  canDisburseLoan: () => boolean;
  canMakePayment: () => boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  approveAction: (notificationId: string) => void;
  rejectAction: (notificationId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'reset-password'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Mock admin users
  const adminUsers: User[] = [
    { id: '1', name: 'Super Admin', phone: '0712345678', role: 'super_admin' },
    { id: '2', name: 'Admin Initiator 1', phone: '0712345679', role: 'admin_initiator' },
    { id: '3', name: 'Admin Initiator 2', phone: '0712345680', role: 'admin_initiator' },
  ];

  const validateKenyanPhone = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(07|01)\d{8}$/;
    return kenyanPhoneRegex.test(phone);
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    if (!validateKenyanPhone(phone)) {
      throw new Error('Please enter a valid Kenyan phone number (07xxxxxxxx or 01xxxxxxxx)');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication
    const user = adminUsers.find(u => u.phone === phone);
    if (user && password === 'admin123') {
      setIsAuthenticated(true);
      setCurrentUser(user);
      
      // Add some sample notifications for super admin
      if (user.role === 'super_admin') {
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'payment_initiated',
            message: 'Payment request initiated',
            initiatorName: 'Admin Initiator 1',
            amount: 15000,
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            read: false,
            actionType: 'payment',
            details: { type: 'single_payment', recipient: 'John Doe' }
          },
          {
            id: '2',
            type: 'loan_initiated',
            message: 'Loan disbursement request initiated',
            initiatorName: 'Admin Initiator 2',
            amount: 25000,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: false,
            actionType: 'loan',
            details: { type: 'group_loan', groupName: 'Nairobi Farmers' }
          }
        ];
        setNotifications(sampleNotifications);
      }
      
      return true;
    }
    
    throw new Error('Invalid phone number or password');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
    setNotifications([]);
  };

  const resetPassword = async (phone: string): Promise<boolean> => {
    if (!validateKenyanPhone(phone)) {
      throw new Error('Please enter a valid Kenyan phone number (07xxxxxxxx or 01xxxxxxxx)');
    }

    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  };

  const canInitiate = (): boolean => {
    return currentUser?.role === 'super_admin' || currentUser?.role === 'admin_initiator';
  };

  const canApprove = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const canTransferPortfolio = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const canDisburseLoan = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const canMakePayment = (): boolean => {
    return currentUser?.role === 'super_admin';
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Simulate real-time notification (in real app, this would be via WebSocket or push notification)
    if (currentUser?.role === 'super_admin') {
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Vermi-Farm Admin', {
          body: `New ${notification.actionType} request: KES ${notification.amount.toLocaleString()} from ${notification.initiatorName}`,
          icon: 'https://i.postimg.cc/MTpyCg68/logo.png'
        });
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const approveAction = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      // Simulate approval process
      console.log(`Approved ${notification.actionType}:`, notification.details);
      
      // Remove notification after approval
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Show success message
      const actionName = notification.actionType.charAt(0).toUpperCase() + notification.actionType.slice(1);
      alert(`✅ ${actionName} of KES ${notification.amount.toLocaleString()} approved successfully!\n\nInitiated by: ${notification.initiatorName}\nAmount: KES ${notification.amount.toLocaleString()}\nTime: ${new Date(notification.timestamp).toLocaleString()}`);
      
      // In real app, this would trigger the actual action via API
    }
  };

  const rejectAction = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      // Remove notification after rejection
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const actionName = notification.actionType.charAt(0).toUpperCase() + notification.actionType.slice(1);
      alert(`❌ ${actionName} of KES ${notification.amount.toLocaleString()} rejected.\n\nInitiated by: ${notification.initiatorName}\nReason: Administrative decision`);
    }
  };

  // Request notification permission on mount
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentView,
      currentUser,
      notifications,
      login,
      logout,
      resetPassword,
      setCurrentView,
      canInitiate,
      canApprove,
      canTransferPortfolio,
      canDisburseLoan,
      canMakePayment,
      addNotification,
      markNotificationAsRead,
      clearNotifications,
      approveAction,
      rejectAction
    }}>
      {children}
    </AuthContext.Provider>
  );
};