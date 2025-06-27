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
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://i.postimg.cc/MTpyCg68/logo.png"
                alt="Vermi-Farm Logo"
               className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-full object-cover"


              />
            <h1 className="text-sm sm:text-base md:text-lg font-semibold" style={{ color: '#983F21' }}>
  Vermi-Farm 
</h1>



            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-left transition-colors duration-200 rounded-lg ${
                    isActive 
                      ? 'bg-[#2d8e41] text-white' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  <span className="font-medium text-sm lg:text-base truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Vermi-Farm
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;