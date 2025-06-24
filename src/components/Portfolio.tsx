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

            import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { PortfolioType } from '../App';

interface TransferModalProps {
  fromPortfolio: PortfolioType;
  toPortfolio?: PortfolioType;
  onClose: () => void;
}

const portfolioLabels: Record<PortfolioType, string> = {
  loan: 'Loan Portfolio',
  revenue: 'Revenue Portfolio',
  investment: 'Investment Portfolio',
  expense: 'Expense Portfolio',
  working: 'Working Account Portfolio',
  b2b: 'B2B Holding Portfolio',
  savings: 'Savings Portfolio'
};

const portfolioOptions: { value: PortfolioType; label: string }[] = [
  { value: 'loan', label: 'Loan Portfolio' },
  { value: 'revenue', label: 'Revenue Portfolio' },
  { value: 'investment', label: 'Investment Portfolio' },
  { value: 'expense', label: 'Expense Portfolio' },
  { value: 'working', label: 'Working Account Portfolio' },
  { value: 'b2b', label: 'B2B Holding Portfolio' },
  { value: 'savings', label: 'Savings Portfolio' }
];

export const TransferModal: React.FC<TransferModalProps> = ({ fromPortfolio, toPortfolio, onClose }) => {
  const [selectedToPortfolio, setSelectedToPortfolio] = useState<PortfolioType | ''>(toPortfolio || '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle transfer logic here
    console.log('Transfer:', {
      from: fromPortfolio,
      to: selectedToPortfolio,
      amount,
      reference,
      description
    });
    onClose();
  };

  const availablePortfolios = portfolioOptions.filter(option => option.value !== fromPortfolio);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Transfer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Transfer Direction */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium text-gray-900">{portfolioLabels[fromPortfolio]}</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-green-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium text-gray-900">
                    {selectedToPortfolio ? portfolioLabels[selectedToPortfolio] : 'Select Portfolio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <p className="text-amber-800 text-sm">
                Please ensure you have sufficient balance and correct portfolio selection before proceeding.
              </p>
            </div>

            {/* To Portfolio Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer To Portfolio
              </label>
              <select
                value={selectedToPortfolio}
                onChange={(e) => setSelectedToPortfolio(e.target.value as PortfolioType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select destination portfolio</option>
                {availablePortfolios.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter reference number"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter transfer description"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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