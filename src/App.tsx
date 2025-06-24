import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import PasswordResetPage from './components/auth/PasswordResetPage';
import AdminDashboard from './components/AdminDashboard';

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
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;