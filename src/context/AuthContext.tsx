import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'super_admin' | 'admin_initiator' | 'admin_approver';
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentView: 'login' | 'reset-password';
  currentUser: User | null;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (phone: string) => Promise<boolean>;
  setCurrentView: (view: 'login' | 'reset-password') => void;
  canInitiate: () => boolean;
  canApprove: () => boolean;
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
      return true;
    }
    
    throw new Error('Invalid phone number or password');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('login');
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

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentView,
      currentUser,
      login,
      logout,
      resetPassword,
      setCurrentView,
      canInitiate,
      canApprove
    }}>
      {children}
    </AuthContext.Provider>
  );
};