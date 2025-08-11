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
  LogOut,
  shield,
  Sprout
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'groups', icon: Users2, label: 'Groups' },
    { id: 'account', icon: CreditCard, label: 'Account' },
    { id: 'transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { id: 'reversal', icon: RotateCcw, label: 'Reversal' },
    { id: 'loans', icon: Banknote, label: 'Payments' },
    { id: 'statements', icon: FileText, label: 'Statements' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
   
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Vermi-Farm</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors duration-200 ${
                isActive 
                  ? 'bg-green-50 text-green-700 border-r-4 border-green-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;