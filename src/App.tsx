import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './components/auth/LoginPage';
import PasswordResetPage from './components/auth/PasswordResetPage';
import OTPVerificationPage from './components/auth/OTPVerificationPage';
import AdminDashboard from './components/AdminDashboard';

// Loading Screen Component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center transition-colors duration-200">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <img
            src="https://i.postimg.cc/MTpyCg68/logo.png"
            alt="Vermi-Farm Logo"
            className="w-32 h-32 rounded-full object-cover mx-auto shadow-2xl border-4 border-white animate-spin"
            style={{ animationDuration: '3s' }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#2d8e41]/30 to-transparent animate-pulse"></div>
        </div>
        
        <h1 className="text-3xl font-bold text-[#2d8e41] dark:text-green-400 mb-4">Vermi-Farm Initiative</h1>
        <p className="text-lg text-[#983F21] dark:text-orange-400 mb-6 font-medium">Management Information System</p>
        
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4">
          <div className="h-2 bg-gradient-to-r from-[#2d8e41] to-[#983F21] rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading system...</p>
        
        <div className="mt-8 text-xs text-[#983F21] dark:text-orange-400 font-medium">
          <p>Changing Lives, One Farm at a Time</p>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated, currentView, pendingLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    if (currentView === 'reset-password') {
      return <PasswordResetPage />;
    }
    if (currentView === 'otp-verification' && pendingLogin) {
      return (
        <OTPVerificationPage 
          phone={pendingLogin.phone}
          onBack={() => window.location.reload()}
        />
      );
    }
    return <LoginPage />;
  }

  return <AdminDashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <AppContent />
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;