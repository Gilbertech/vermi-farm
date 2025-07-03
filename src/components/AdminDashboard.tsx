import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import EnhancedTopNavbar from './layout/EnhancedTopNavbar';
import Dashboard from './Dashboard';
import Users from './Users';
import Groups from './Groups';
import EnhancedTransactions from './EnhancedTransactions';
import Loans from './Loans';
import Portfolio from './Portfolio';
import Statements from './Statements';
import Accounts from './Accounts';
import Reversals from './Reversals';
import Payments from './Payments';

const AdminDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'groups':
        return <Groups />;
      case 'account':
        return <Accounts />;
      case 'transactions':
        return <EnhancedTransactions />;
      case 'reversal':
        return <Reversals />;
      case 'loans':
        return <Loans />;
      case 'payments':
        return <Payments />;
      case 'statements':
        return <Statements />;
      case 'portfolio':
        return <Portfolio />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard';
      case 'users':
        return 'Users';
      case 'groups':
        return 'Groups';
      case 'account':
        return 'Accounts';
      case 'transactions':
        return 'Transactions';
      case 'reversal':
        return 'Reversals';
      case 'loans':
        return 'Loans';
      case 'payments':
        return 'Payments';
      case 'statements':
        return 'Statements';
      case 'portfolio':
        return 'Portfolio';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <EnhancedTopNavbar 
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;