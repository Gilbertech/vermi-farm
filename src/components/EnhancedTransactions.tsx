import React, { useState } from 'react';
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Clock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateReceipt } from '../utils/receiptGenerator';

const EnhancedTransactions: React.FC = () => {
  const { transactions, users, groups } = useApp();
  const [activeTab, setActiveTab] = useState<'inwallet' | 'outwallet' | 'withdrawals'>('inwallet');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showAmounts, setShowAmounts] = useState(true);

  // Mock enhanced transaction data
  const enhancedTransactions = [
    {
      id: '1',
      txCode: 'TXN001234567',
      type: 'inwallet',
      from: 'John Doe (+254712345678)',
      to: 'Nairobi Farmers Group',
      recipient: 'Nairobi Farmers Group',
      msisdn: '+254712345678',
      amount: 5000,
      fees: 25,
      txCost: 25,
      mpesaReceipt: 'QGH7K8L9M0',
      time: '2024-01-20T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      txCode: 'TXN001234568',
      type: 'outwallet',
      from: 'Nairobi Farmers Group',
      to: 'Jane Smith',
      recipient: 'Jane Smith',
      msisdn: '+254787654321',
      amount: 15000,
      fees: 50,
      txCost: 50,
      mpesaReceipt: 'RTY5U6I7O8',
      time: '2024-01-20T14:15:00Z',
      status: 'success'
    },
    {
      id: '3',
      txCode: 'TXN001234569',
      type: 'withdrawals',
      from: 'Mike Johnson',
      to: 'M-Pesa',
      amount: 3000,
      txCost: 30,
      mpesaReceipt: 'ASD2F3G4H5',
      time: '2024-01-19T09:45:00Z',
      status: 'pending'
    }
  ];

  const filteredTransactions = enhancedTransactions.filter(transaction => {
    const matchesTab = transaction.type === activeTab;
    const matchesSearch = 
      transaction.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(transaction.time).toDateString() === new Date().toDateString()) ||
      (timeFilter === 'week' && new Date(transaction.time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesTab && matchesSearch && matchesAmount && matchesTime;
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

  const handleDownload = (transactionId: string) => {
    const transaction = filteredTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Generate PDF receipt using the same function as portfolio
    const receiptData = {
      transactionId: transaction.txCode,
      date: transaction.time,
      userName: transaction.from,
      userPhone: transaction.msisdn || '+254712345678',
      amount: transaction.amount,
      type: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Transaction`,
      status: transaction.status,
      from: transaction.from,
      to: transaction.to,
      fees: transaction.fees ? `KES ${transaction.fees}` : undefined
    };

    generateReceipt(receiptData);
  };

  const renderInwalletTable = () => (
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
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransactions.map((transaction, index) => (
            <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {transaction.txCode}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.from}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.to}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.fees}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(transaction.time).toLocaleString()}
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

  const renderOutwalletTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Code</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MSISDN</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Cost</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransactions.map((transaction, index) => (
            <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {transaction.txCode}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.from}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.recipient}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {showAmounts ? transaction.msisdn : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.txCost}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(transaction.time).toLocaleString()}
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

  const renderWithdrawalsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Code</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Cost</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mpesa Receipt</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTransactions.map((transaction, index) => (
            <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {transaction.txCode}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {transaction.from}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {showAmounts ? `KES ${transaction.txCost}` : '****'}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {transaction.mpesaReceipt}
              </td>
              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(transaction.time).toLocaleString()}
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

      {/* Tabbed Interface */}
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
          {activeTab === 'inwallet' && renderInwalletTable()}
          {activeTab === 'outwallet' && renderOutwalletTable()}
          {activeTab === 'withdrawals' && renderWithdrawalsTable()}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No transactions found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTransactions;