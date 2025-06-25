import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet, PiggyBank as Piggy, ChevronDown, Search, Filter, Calendar, Download, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Portfolio: React.FC = () => {
  const { stats, loans, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings'>('loan');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [transferDropdownOpen, setTransferDropdownOpen] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);

  const portfolioTabs = [
    { id: 'loan', label: 'Loan Portfolio', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Portfolio', icon: DollarSign },
    { id: 'investment', label: 'Investment Portfolio', icon: BarChart3 },
    { id: 'expense', label: 'Expense Portfolio', icon: TrendingDown },
    { id: 'working', label: 'Working Account Portfolio', icon: Wallet },
    { id: 'b2b', label: 'B2B Holding Portfolio', icon: PieChart },
    { id: 'savings', label: 'Savings Portfolio', icon: Piggy }
  ];

  // Mock portfolio-specific transaction data for each portfolio
  const portfolioTransactions = {
    loan: [
      {
        id: '1',
        txCode: 'LN001234567',
        from: 'John Doe',
        to: 'Loan Portfolio',
        amount: 15000,
        fees: 50,
        time: '2024-01-20T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        txCode: 'LN001234568',
        from: 'Loan Portfolio',
        to: 'Jane Smith',
        amount: 12000,
        fees: 40,
        time: '2024-01-19T14:15:00Z',
        status: 'completed'
      }
    ],
    revenue: [
      {
        id: '3',
        txCode: 'RV001234569',
        from: 'Interest Collection',
        to: 'Revenue Portfolio',
        amount: 2500,
        fees: 15,
        time: '2024-01-20T16:30:00Z',
        status: 'completed'
      },
      {
        id: '4',
        txCode: 'RV001234570',
        from: 'Service Fees',
        to: 'Revenue Portfolio',
        amount: 800,
        fees: 10,
        time: '2024-01-19T11:20:00Z',
        status: 'completed'
      }
    ],
    investment: [
      {
        id: '5',
        txCode: 'IV001234571',
        from: 'Investment Portfolio',
        to: 'Stock Purchase',
        amount: 25000,
        fees: 100,
        time: '2024-01-18T09:45:00Z',
        status: 'completed'
      }
    ],
    expense: [
      {
        id: '6',
        txCode: 'EX001234572',
        from: 'Expense Portfolio',
        to: 'Office Rent',
        amount: 8000,
        fees: 30,
        time: '2024-01-17T08:00:00Z',
        status: 'completed'
      }
    ],
    working: [
      {
        id: '7',
        txCode: 'WA001234573',
        from: 'Working Account',
        to: 'Daily Operations',
        amount: 5000,
        fees: 25,
        time: '2024-01-20T12:00:00Z',
        status: 'completed'
      }
    ],
    b2b: [
      {
        id: '8',
        txCode: 'B2B001234574',
        from: 'B2B Holding',
        to: 'Partner Payment',
        amount: 18000,
        fees: 75,
        time: '2024-01-19T15:30:00Z',
        status: 'completed'
      }
    ],
    savings: [
      {
        id: '9',
        txCode: 'SV001234575',
        from: 'Monthly Savings',
        to: 'Savings Portfolio',
        amount: 10000,
        fees: 0,
        time: '2024-01-20T18:00:00Z',
        status: 'completed'
      }
    ]
  };

  const currentPortfolioTransactions = portfolioTransactions[activeTab] || [];

  const filteredTransactions = currentPortfolioTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(transaction.time).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesAmount && matchesTime;
  });

  const handleTransfer = (targetPortfolio: string) => {
    console.log(`Transferring from ${activeTab} to ${targetPortfolio}`);
    // In real app, this would open a transfer modal
    setTransferDropdownOpen(false);
  };

  const handleDownload = (transactionId: string) => {
    // Create a mock CSV content
    const transaction = filteredTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const csvContent = `Transaction Code,From,To,Amount,Fees,Time,Status
${transaction.txCode},${transaction.from},${transaction.to},${transaction.amount},${transaction.fees},${transaction.time},${transaction.status}`;

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction_${transaction.txCode}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getPortfolioStats = (portfolioType: string) => {
    const transactions = portfolioTransactions[portfolioType as keyof typeof portfolioTransactions] || [];
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);
    const transactionCount = transactions.length;

    switch (portfolioType) {
      case 'loan':
        return {
          primary: { label: 'Total Disbursed', value: `KES ${stats.totalLoanDisbursed.toLocaleString()}`, trend: '+15%' },
          secondary: { label: 'Total Repaid', value: `KES ${stats.totalLoanRepaid.toLocaleString()}`, trend: '+8%' },
          tertiary: { label: 'Active Loans', value: loans.filter(l => l.status === 'active').length.toString(), trend: '-2%' }
        };
      case 'revenue':
        return {
          primary: { label: 'Total Revenue', value: `KES ${stats.totalEarned.toLocaleString()}`, trend: '+25%' },
          secondary: { label: 'Interest Income', value: `KES ${(stats.totalEarned * 0.3).toLocaleString()}`, trend: '+18%' },
          tertiary: { label: 'Service Fees', value: `KES ${(stats.totalEarned * 0.1).toLocaleString()}`, trend: '+12%' }
        };
      default:
        return {
          primary: { label: `Total ${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)}`, value: `KES ${totalAmount.toLocaleString()}`, trend: '+5%' },
          secondary: { label: 'Total Fees', value: `KES ${totalFees.toLocaleString()}`, trend: '+3%' },
          tertiary: { label: 'Transactions', value: transactionCount.toString(), trend: '+10%' }
        };
    }
  };

  const renderPortfolioStats = () => {
    const stats = getPortfolioStats(activeTab);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-green-600 font-medium">{stats.primary.trend}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.primary.value}</h3>
          <p className="text-gray-600">{stats.primary.label}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 font-medium">{stats.secondary.trend}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.secondary.value}</h3>
          <p className="text-gray-600">{stats.secondary.label}</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-red-600 font-medium">{stats.tertiary.trend}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{stats.tertiary.value}</h3>
          <p className="text-gray-600">{stats.tertiary.label}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          {showAmounts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          <span>{showAmounts ? 'Hide Amounts' : 'Show Amounts'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <nav className="flex space-x-8 overflow-x-auto">
              {portfolioTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-[#2d8e41] text-[#2d8e41]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            

          {/* Portfolio Stats */}
          {renderPortfolioStats()}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Min Amount (KES)"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              />
            </div>
            
            <div>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portfolio Transactions Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tx Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.txCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.from}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.to}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {showAmounts ? `KES ${transaction.fees}` : '****'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownload(transaction.id)}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                        title="Download Transaction Statement"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions found for this portfolio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;