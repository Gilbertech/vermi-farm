import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'super_admin' | 'admin_initiator';
  lastLogin?: string;
  loginAttempts?: number;
  isLocked?: boolean;
  lockoutUntil?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
}

interface Notification {
  id: string;
  type: 'payment_initiated' | 'loan_initiated' | 'transfer_initiated' | 'security_alert';
  message: string;
  initiatorName: string;
  amount: number;
  timestamp: string;
  read: boolean;
  actionType: 'payment' | 'loan' | 'transfer' | 'security';
  details?: any;
}

interface SecurityEvent {
  id: string;
  type: 'login_success' | 'login_failed' | 'logout' | 'password_reset' | 'account_locked';
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

interface EnhancedAuthContextType {
  isAuthenticated: boolean;
  currentView: 'login' | 'reset-password' | 'otp-verification';
  currentUser: User | null;
  notifications: Notification[];
  securityEvents: SecurityEvent[];
  sessionTimeout: number;
  login: (phone: string, password: string) => Promise<{ requiresOTP: boolean; tempToken?: string }>;
  verifyOTP: (otp: string, tempToken: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (phone: string) => Promise<boolean>;
  setCurrentView: (view: 'login' | 'reset-password' | 'otp-verification') => void;
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
  addSecurityEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => void;
  getSecurityEvents: (userId?: string) => SecurityEvent[];
  updateUserSettings: (settings: Partial<User>) => void;
  checkAccountLockout: (phone: string) => boolean;
  incrementLoginAttempts: (phone: string) => void;
  resetLoginAttempts: (phone: string) => void;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'reset-password' | 'otp-verification'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessionTimeout, setSessionTimeout] = useState(30 * 60 * 1000); // 30 minutes

  // Mock admin users with enhanced security features
  const adminUsers: User[] = [
    { 
      id: '1', 
      name: 'Super Admin', 
      phone: '0712345678', 
      email: 'admin@vermi-farm.org',
      role: 'super_admin',
      twoFactorEnabled: true,
      emailVerified: true,
      loginAttempts: 0,
      isLocked: false
    },
    { 
      id: '2', 
      name: 'Admin Initiator 1', 
      phone: '0712345679', 
      email: 'initiator1@vermi-farm.org',
      role: 'admin_initiator',
      twoFactorEnabled: true,
      emailVerified: true,
      loginAttempts: 0,
      isLocked: false
    },
    { 
      id: '3', 
      name: 'Admin Initiator 2', 
      phone: '0712345680', 
      email: 'initiator2@vermi-farm.org',
      role: 'admin_initiator',
      twoFactorEnabled: true,
      emailVerified: false,
      loginAttempts: 0,
      isLocked: false
    },
  ];

  const [users, setUsers] = useState<User[]>(adminUsers);

  const validateKenyanPhone = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(07|01)\d{8}$/;
    return kenyanPhoneRegex.test(phone);
  };

  const generateSecurityEvent = (type: SecurityEvent['type'], userId: string, details?: any): SecurityEvent => {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.1', // Mock IP
      userAgent: navigator.userAgent,
      details
    };
  };

  const addSecurityEvent = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setSecurityEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
  };

  const checkAccountLockout = (phone: string): boolean => {
    const user = users.find(u => u.phone === phone);
    if (!user) return false;
    
    if (user.isLocked && user.lockoutUntil) {
      const lockoutTime = new Date(user.lockoutUntil);
      if (new Date() < lockoutTime) {
        return true;
      } else {
        // Unlock account if lockout period has passed
        setUsers(prev => prev.map(u => 
          u.phone === phone 
            ? { ...u, isLocked: false, lockoutUntil: undefined, loginAttempts: 0 }
            : u
        ));
        return false;
      }
    }
    
    return false;
  };

  const incrementLoginAttempts = (phone: string) => {
    setUsers(prev => prev.map(user => {
      if (user.phone === phone) {
        const newAttempts = (user.loginAttempts || 0) + 1;
        const shouldLock = newAttempts >= 3;
        
        return {
          ...user,
          loginAttempts: newAttempts,
          isLocked: shouldLock,
          lockoutUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : undefined
        };
      }
      return user;
    }));
  };

  const resetLoginAttempts = (phone: string) => {
    setUsers(prev => prev.map(user => 
      user.phone === phone 
        ? { ...user, loginAttempts: 0, isLocked: false, lockoutUntil: undefined }
        : user
    ));
  };

  const login = async (phone: string, password: string): Promise<{ requiresOTP: boolean; tempToken?: string }> => {
    if (!validateKenyanPhone(phone)) {
      throw new Error('Please enter a valid Kenyan phone number (07xxxxxxxx or 01xxxxxxxx)');
    }

    if (checkAccountLockout(phone)) {
      throw new Error('Account is temporarily locked due to multiple failed login attempts');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication check
    const user = users.find(u => u.phone === phone);
    const validCredentials = user && password === 'admin123';
    
    if (validCredentials && user) {
      resetLoginAttempts(phone);
      
      // Add security event
      addSecurityEvent({
        type: 'login_success',
        userId: user.id,
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent,
        details: { method: 'password' }
      });

      // Update last login
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
      ));

      if (user.twoFactorEnabled) {
        // Generate temporary token for OTP verification
        const tempToken = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return { requiresOTP: true, tempToken };
      } else {
        // Direct login if 2FA is disabled
        setIsAuthenticated(true);
        setCurrentUser(user);
        return { requiresOTP: false };
      }
    } else {
      if (user) {
        incrementLoginAttempts(phone);
        addSecurityEvent({
          type: 'login_failed',
          userId: user.id,
          ipAddress: '192.168.1.1',
          userAgent: navigator.userAgent,
          details: { reason: 'invalid_credentials' }
        });
      }
      
      throw new Error('Invalid phone number or password');
    }
  };

  const verifyOTP = async (otp: string, tempToken: string): Promise<boolean> => {
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock OTP validation (in real app, this would verify against backend)
    const isValid = otp === '123456'; // Mock valid OTP
    
    if (isValid) {
      // Extract user info from temp token (in real app, this would be validated server-side)
      const user = users.find(u => u.phone === '0712345678'); // Mock user lookup
      
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        addSecurityEvent({
          type: 'login_success',
          userId: user.id,
          ipAddress: '192.168.1.1',
          userAgent: navigator.userAgent,
          details: { method: '2fa_otp' }
        });

        // Add sample notifications for super admin
        if (user.role === 'super_admin') {
          const sampleNotifications: Notification[] = [
            {
              id: '1',
              type: 'payment_initiated',
              message: 'Payment request initiated',
              initiatorName: 'Admin Initiator 1',
              amount: 15000,
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: false,
              actionType: 'loan',
              details: { type: 'group_loan', groupName: 'Nairobi Farmers' }
            }
          ];
          setNotifications(sampleNotifications);
        }
        
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addSecurityEvent({
        type: 'logout',
        userId: currentUser.id,
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent
      });
    }
    
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
    setNotifications([]);
  };

  const resetPassword = async (phone: string): Promise<boolean> => {
    if (!validateKenyanPhone(phone)) {
      throw new Error('Please enter a valid Kenyan phone number (07xxxxxxxx or 01xxxxxxxx)');
    }

    const user = users.find(u => u.phone === phone);
    if (user) {
      addSecurityEvent({
        type: 'password_reset',
        userId: user.id,
        ipAddress: '192.168.1.1',
        userAgent: navigator.userAgent
      });
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
    
    // Show browser notification if permission granted
    if (currentUser?.role === 'super_admin' && Notification.permission === 'granted') {
      new Notification('Vermi-Farm Admin', {
        body: `New ${notification.actionType} request: KES ${notification.amount.toLocaleString()} from ${notification.initiatorName}`,
        icon: 'https://i.postimg.cc/MTpyCg68/logo.png'
      });
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
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const actionName = notification.actionType.charAt(0).toUpperCase() + notification.actionType.slice(1);
      let detailsText = '';
      
      if (notification.actionType === 'transfer' && notification.details) {
        detailsText = `\nFrom: ${notification.details.fromPortfolio} Portfolio\nTo: ${notification.details.toPortfolio} Portfolio`;
        if (notification.details.description) {
          detailsText += `\nDescription: ${notification.details.description}`;
        }
      }
      
      alert(`✅ ${actionName} of KES ${notification.amount.toLocaleString()} approved successfully!\n\nInitiated by: ${notification.initiatorName}\nAmount: KES ${notification.amount.toLocaleString()}\nTime: ${new Date(notification.timestamp).toLocaleString()}${detailsText}`);
    }
  };

  const rejectAction = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const actionName = notification.actionType.charAt(0).toUpperCase() + notification.actionType.slice(1);
      alert(`❌ ${actionName} of KES ${notification.amount.toLocaleString()} rejected.\n\nInitiated by: ${notification.initiatorName}\nReason: Administrative decision`);
    }
  };

  const getSecurityEvents = (userId?: string): SecurityEvent[] => {
    if (userId) {
      return securityEvents.filter(event => event.userId === userId);
    }
    return securityEvents;
  };

  const updateUserSettings = (settings: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...settings };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  // Session timeout management
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAuthenticated) {
      const resetTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          alert('Session expired due to inactivity. Please log in again.');
          logout();
        }, sessionTimeout);
      };

      // Reset timeout on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimeout, true);
      });

      resetTimeout();

      return () => {
        clearTimeout(timeoutId);
        events.forEach(event => {
          document.removeEventListener(event, resetTimeout, true);
        });
      };
    }
  }, [isAuthenticated, sessionTimeout]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <EnhancedAuthContext.Provider value={{
      isAuthenticated,
      currentView,
      currentUser,
      notifications,
      securityEvents,
      sessionTimeout,
      login,
      verifyOTP,
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
      rejectAction,
      addSecurityEvent,
      getSecurityEvents,
      updateUserSettings,
      checkAccountLockout,
      incrementLoginAttempts,
      resetLoginAttempts
    }}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};