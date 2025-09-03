import React, { useState, useEffect } from 'react';
import { Search, Download, ArrowUpRight, ArrowDownLeft, Clock, Eye, EyeOff } from 'lucide-react';
import { TransactionService, Transaction } from '../services/transactionService';
import { ApiError } from '../services/api';
import { generateReceipt } from '../utils/receiptGenerator';

const EnhancedTransactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inwallet' | 'outwallet' | 'withdrawals'>('inwallet');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showAmounts, setShowAmounts] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock enhanced transaction data for fallback
  const mockTransactions = [
    {
      id: '1',
      tx_code: 'TXN001234567',
      type: 'deposit' as const,
      amount: 5000,
      fees: 25,
      user_id: '1',
      group_id: '1',
      from_account: 'John Doe (+254712345678)',
      to_account: 'Nairobi Farmers Group',
      description: 'Monthly contribution',
      status: 'completed' as const,
      mpesa_receipt: 'QGH7K8L9M0',
      created_at: '2024-01-20T10:30:00Z',
      updated_at: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      tx_code: 'TXN001234568',
      type: 'withdrawal' as const,
      amount: 15000,
      fees: 50,
      user_id: '2',
      group_id: '1',
      from_account: 'Nairobi Farmers Group',
      to_account: 'Jane Smith',
      description: 'Equipment purchase',
      status: 'completed' as const,
      mpesa_receipt: 'RTY5U6I7O8',
      created_at: '2024-01-20T14:15:00Z',
      updated_at: '2024-01-20T14:15:00Z'
    },
    {
      id: '3',
      tx_code: 'TXN001234569',
      type: 'withdrawal' as const,
      amount: 3000,
      fees: 30,
      user_id: '3',
      group_id: '2',
      from_account: 'Mike Johnson',
      to_account: 'M-Pesa',
      description: 'Cash withdrawal',
      status: 'pending' as const,
      mpesa_receipt: 'ASD2F3G4H5',
      created_at: '2024-01-19T09:45:00Z',
      updated_at: '2024-01-19T09:45:00Z'
    }
  ];

  // Load transactions based on active tab
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          let response;
          switch (activeTab) {
            case 'inwallet':
              response = await TransactionService.getInwalletTransactions({ limit: 1000 });
              break;
            case 'outwallet':
              response = await TransactionService.getOutwalletTransactions({ limit: 1000 });
              break;
            case 'withdrawals':
              response = await TransactionService.getWithdrawalTransactions({ limit: 1000 });
              break;
            default:
              response = await TransactionService.getTransactions({ limit: 1000 });
          }
          
          setTransactions(response.items);
        } catch (apiError) {
          console.warn(`API ${activeTab} transactions failed, using mock data:`, apiError);
          // Filter mock data based on tab
          const filteredMockData = mockTransactions.filter(t => {
            switch (activeTab) {
              case 'inwallet':
                return t.type === 'deposit' || t.type === 'loan';
              case 'outwallet':
                return t.type === 'withdrawal' || t.type === 'repayment';
              case 'withdrawals':
                return t.type === 'withdrawal';
              default:
                return true;
            }
          });
          setTransactions(filteredMockData);
        }

      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load transactions';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [activeTab]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.tx_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from_account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to_account.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(transaction.created_at).toDateString() === new Date().toDateString()) ||
      (timeFilter === 'week' && new Date(transaction.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesAmount && matchesTime;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleDownload = (transactionId: string) => {
    const transaction = filteredTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const receiptData = {
      transactionId: transaction.tx_code,
      date: transaction.created_at,
      userName: transaction.from_account,
      userPhone: '+254712345678', // Mock phone
      amount: transaction.amount,
      type: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Transaction`,
      status: transaction.status,
      from: transaction.from_account,
      to: transaction.to_account,
      fees: transaction.fees ? `KES ${transaction.fees}` : undefined
    };

    generateReceipt(receiptData);
  };

  const renderTransactionTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Code</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fees</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransactions.map((transaction, index) => (
            <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {transaction.tx_code}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.from_account}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.to_account}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.fees || 0}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(transaction.created_at).toLocaleString()}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDownload(transaction.id)}
                  className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                  title="Download PDF Receipt"
                >
                  <Download className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Transactions</h1>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 self-start sm:self-auto"
        >
          {showAmounts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          <span>{showAmounts ? 'Hide Amounts' : 'Show Amounts'}</span>
        </button>
      </div>

      {/* Global Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Min Amount (KES)"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div>
            <div className="relative">
              <Clock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Error loading transactions: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#2d8e41] hover:text-[#246b35] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabbed Interface */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 lg:space-x-8 px-4 lg:px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('inwallet')}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'inwallet'
                    ? 'border-[#2d8e41] text-[#2d8e41]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Inwallet</span>
              </button>
              <button
                onClick={() => setActiveTab('outwallet')}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'outwallet'
                    ? 'border-[#2d8e41] text-[#2d8e41]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Outwallet</span>
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === 'withdrawals'
                    ? 'border-[#2d8e41] text-[#2d8e41]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Withdrawals</span>
              </button>
            </nav>
          </div>

          <div className="p-4 lg:p-6">
            {renderTransactionTable()}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No transactions found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTransactions;