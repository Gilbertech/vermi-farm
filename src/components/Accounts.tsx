import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, CreditCard } from 'lucide-react';
import { AccountService, AccountTransaction } from '../services/accountService';
import { ApiError } from '../services/api';

const Accounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'number' | 'balance'>('number');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState(0);

  // Mock data for fallback
  const mockTransactions: AccountTransaction[] = [
    {
      id: '1',
      mpesa_receipt: 'QGH7K8L9M0',
      sender: 'John Doe',
      amount: 5000,
      completed_at: '2024-01-20T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      mpesa_receipt: 'RTY5U6I7O8',
      sender: 'Jane Smith',
      amount: 3500,
      completed_at: '2024-01-19T14:15:00Z',
      status: 'success'
    },
    {
      id: '3',
      mpesa_receipt: 'ASD2F3G4H5',
      sender: 'Mike Johnson',
      amount: 2000,
      completed_at: '2024-01-18T09:45:00Z',
      status: 'pending'
    }
  ];

  // Load account data
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setLoading(true);
        setError(null);

        try {
          const [transactionsResponse, balanceResponse] = await Promise.allSettled([
            AccountService.getAccountTransactions({ limit: 1000 }),
            AccountService.getAccountBalance()
          ]);

          if (transactionsResponse.status === 'fulfilled') {
            setTransactions(transactionsResponse.value.items);
          } else {
            console.warn('API account transactions failed, using mock data:', transactionsResponse.reason);
            setTransactions(mockTransactions);
          }

          if (balanceResponse.status === 'fulfilled') {
            setAccountBalance(balanceResponse.value.current_balance);
          } else {
            console.warn('API account balance failed, using mock data:', balanceResponse.reason);
            setAccountBalance(125000);
          }
        } catch (apiError) {
          console.warn('Account API failed, using mock data:', apiError);
          setTransactions(mockTransactions);
          setAccountBalance(125000);
        }

      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load account data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.mpesa_receipt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(transaction.completed_at).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesAmount && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Accounts</h1>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading account data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Error loading accounts: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#2d8e41] hover:text-[#246b35] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('number')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'number'
                    ? 'border-[#2d8e41] text-[#2d8e41]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Account Number
              </button>
              <button
                onClick={() => setActiveTab('balance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'balance'
                    ? 'border-[#2d8e41] text-[#2d8e41]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Account Balance
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'number' && (
              <div className="space-y-6">
                {/* Account Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#2d8e41] text-white rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CreditCard className="w-8 h-8" />
                      <h3 className="text-xl font-semibold">Paybill Number</h3>
                    </div>
                    <p className="text-3xl font-bold">4703932</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <DollarSign className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Account Name</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">Vermifarm</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="space-y-6">
                {/* Balance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">KES {accountBalance.toLocaleString()}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Current Balance</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{transactions.filter(t => t.status === 'success').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Successful Transactions</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{transactions.filter(t => t.status === 'pending').length}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Pending Transactions</p>
                  </div>
                </div>

                {/* Filters */}
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
                      placeholder="Filter by Amount (KES)"
                      value={amountFilter}
                      onChange={(e) => setAmountFilter(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <div className="relative">
                      <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
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

                {/* Transactions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Mpesa Receipt
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Sender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Completed At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTransactions.map((transaction, index) => (
                          <tr key={transaction.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {transaction.mpesa_receipt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {transaction.sender}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                              KES {transaction.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {new Date(transaction.completed_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No transactions found matching your criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;