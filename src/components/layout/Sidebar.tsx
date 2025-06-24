import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Users2, 
  CreditCard, 
  ArrowLeftRight,
  RotateCcw,
  Banknote,
  FileText,
  Briefcase,
  Sprout,
  X,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'groups', icon: Users2, label: 'Groups' },
    { id: 'account', icon: CreditCard, label: 'Accounts' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'reversal', icon: RotateCcw, label: 'Reversals' },
    { id: 'loans', icon: Banknote, label: 'Loans' },
    { id: 'payments', icon: Wallet, label: 'Payments' },
    { id: 'statements', icon: FileText, label: 'Statements' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
  ];

  const handleMenuClick = (viewId: string) => {
    setActiveView(viewId);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      
        
        {/* Navigation */}
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                  isActive 
                    ? 'bg-[#2d8e41] text-white border-r-4 border-[#246b35]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;