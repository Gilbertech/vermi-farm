import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet, PiggyBank as Piggy, ChevronDown, Search, Filter, Calendar, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Portfolio: React.FC = () => {
  const { stats, loans, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings'>('loan');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [transferDropdownOpen, setTransferDropdownOpen] = useState(false);

  const portfolioTabs = [
    { id: 'loan', label: 'Loan Portfolio', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Portfolio', icon: DollarSign },
    { id: 'investment', label: 'Investment Portfolio', icon: BarChart3 },
    { id: 'expense', label: 'Expense Portfolio', icon: TrendingDown },
    { id: 'working', label: 'Working Account Portfolio', icon: Wallet },
    { id: 'b2b', label: 'B2B Holding Portfolio', icon: PieChart },
    { id: 'savings', label: 'Savings Portfolio', icon: Piggy }
  ];

  // Mock portfolio transaction data
  const portfolioTransactions = [
    {
      id: '1',
      txCode: 'TXN001234567',
      from: 'John Doe',
      to: 'Loan Portfolio',
      amount: 15000,
      fees: 50,
      time: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      txCode: 'TXN001234568',
      from: 'Revenue Portfolio',
      to: 'Jane Smith',
      amount: 3500,
      fees: 25,
      time: '2024-01-20T14:15:00Z'
    },
    {
      id: '3',
      txCode: 'TXN001234569',
      from: 'Investment Portfolio',
      to: 'Working Account',
      amount: 7200,
      fees: 35,
      time: '2024-01-19T09:45:00Z'
    }
  ];

  const filteredTransactions = portfolioTransactions.filter(transaction => {
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
    console.log(`Transferring to ${targetPortfolio}`);
    setTransferDropdownOpen(false);
  };

  const handleDownload = (transactionId: string) => {
    console.log(`Downloading statement for transaction ${transactionId}`);
  };

  const renderLoanPortfolio = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-green-600 font-medium">+15%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalLoanDisbursed.toLocaleString()}</h3>
          <p className="text-gray-600">Total Disbursed</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalLoanRepaid.toLocaleString()}</h3>
          <p className="text-gray-600">Total Repaid</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-red-600 font-medium">-2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{loans.filter(l => l.status === 'active').length}</h3>
          <p className="text-gray-600">Active Loans</p>
        </div>
      </div>
    </div>
  );

  const renderRevenuePortfolio = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {stats.totalEarned.toLocaleString()}</h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.3).toLocaleString()}</h3>
          <p className="text-gray-600">Interest Income</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.1).toLocaleString()}</h3>
          <p className="text-gray-600">Service Fees</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES {(stats.totalEarned * 0.05).toLocaleString()}</h3>
          <p className="text-gray-600">Other Income</p>
        </div>
      </div>
    </div>
  );

  const renderGenericPortfolio = (title: string) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">KES 0</h3>
          <p className="text-gray-600">Total {title}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">0</h3>
          <p className="text-gray-600">Active Items</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800">0%</h3>
          <p className="text-gray-600">Growth Rate</p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'loan':
        return renderLoanPortfolio();
      case 'revenue':
        return renderRevenuePortfolio();
      case 'investment':
        return renderGenericPortfolio('Investment');
      case 'expense':
        return renderGenericPortfolio('Expense');
      case 'working':
        return renderGenericPortfolio('Working Account');
      case 'b2b':
        return renderGenericPortfolio('B2B Holding');
      case 'savings':
        return renderGenericPortfolio('Savings');
      default:
        return renderLoanPortfolio();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Portfolio</h1>

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

          {/* Transfer Dropdown */}
<div className="relative">
  <button
    onClick={() => setTransferDropdownOpen(!transferDropdownOpen)}
    className="bg-[#2d8e41] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200"
  >
    <span>Transfer</span>
    <ChevronDown className="w-4 h-4" />
  </button>

  {transferDropdownOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
      <div className="py-1">
        {portfolioTabs
          .filter(tab => tab.id !== activeTab)
          .map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedToPortfolio(tab.id as PortfolioType);
                setFromPortfolio(activeTab as PortfolioType);
                setTransferDropdownOpen(false);
                setShowTransferModal(true);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Transfer to {tab.label}
            </button>
          ))}
      </div>
    </div>
  )}
</div>


          {/* Search and Filters */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                      KES {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      KES {transaction.fees}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownload(transaction.id)}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                        title="Download Statement"
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