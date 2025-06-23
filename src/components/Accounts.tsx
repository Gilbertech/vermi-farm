import React, { useState } from 'react';
import { Search, Filter, DollarSign, CreditCard } from 'lucide-react';

const Accounts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'number' | 'balance'>('number');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock transaction data
  const transactions = [
    {
      id: '1',
      mpesaReceipt: 'QGH7K8L9M0',
      sender: 'John Doe (+254712345678)',
      amount: 5000,
      completedAt: '2024-01-20T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      mpesaReceipt: 'RTY5U6I7O8',
      sender: 'Jane Smith (+254787654321)',
      amount: 3500,
      completedAt: '2024-01-20T14:15:00Z',
      status: 'success'
    },
    {
      id: '3',
      mpesaReceipt: 'ASD2F3G4H5',
      sender: 'Mike Johnson (+254798765432)',
      amount: 7200,
      completedAt: '2024-01-19T09:45:00Z',
      status: 'pending'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.mpesaReceipt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(transaction.completedAt).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesAmount && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalBalance = transactions
    .filter(t => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Accounts</h1>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('number')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'number'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Account Number
            </button>
            <button
              onClick={() => setActiveTab('balance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'balance'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <DollarSign className="w-8 h-8 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Account Name</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">Vermifarm</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'balance' && (
            <div className="space-y-6">
              {/* Balance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800">KES {totalBalance.toLocaleString()}</h3>
                  <p className="text-gray-600">Current Balance</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800">{transactions.filter(t => t.status === 'success').length}</h3>
                  <p className="text-gray-600">Successful Transactions</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800">{transactions.filter(t => t.status === 'pending').length}</h3>
                  <p className="text-gray-600">Pending Transactions</p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    placeholder="Filter by Amount (KES)"
                    value={amountFilter}
                    onChange={(e) => setAmountFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
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

              {/* Transactions Table */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mpesa Receipt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sender
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.map((transaction, index) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.mpesaReceipt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {transaction.sender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            KES {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.completedAt).toLocaleString()}
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;