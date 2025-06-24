import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import PasswordResetPage from './components/auth/PasswordResetPage';
import AdminDashboard from './components/AdminDashboard';
import Watermark from './components/Watermark'; // 👈 Import the watermark

function AppContent() {
  const { isAuthenticated, currentView } = useAuth();

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
        {/* 🔒 Watermark shown globally behind all content */}
        <Watermark />
        <div className="relative z-10">
          <AppContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
