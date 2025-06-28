import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import PasswordResetPage from './components/auth/PasswordResetPage';
import AdminDashboard from './components/AdminDashboard';

// Loading Screen Component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center">
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
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Vermi-Farm Initiative</h1>
        <p className="text-lg text-gray-600 mb-6">Management Information System</p>
        
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-4">
          <div className="h-2 bg-gradient-to-r from-[#2d8e41] to-[#983F21] rounded-full animate-pulse" style={{ width: '70%' }}></div>
        </div>
        
        <p className="text-sm text-gray-500">Loading system...</p>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>Changing Lives, One Farm at a Time</p>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { isAuthenticated, currentView } = useAuth();
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
    return <LoginPage />;
  }

  return <AdminDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;