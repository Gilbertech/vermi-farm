import React, { useState } from 'react';
import { Download, Search, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateReceipt } from '../../utils/receiptGenerator';

interface UserTransactionsModalProps {
  userId: string;
}

const UserTransactionsModal: React.FC<UserTransactionsModalProps> = ({ userId }) => {
  const { transactions, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const user = users.find(u => u.id === userId);
  const userTransactions = transactions.filter(t => t.userId === userId);

  const filteredTransactions = userTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(transaction.createdAt).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesTime;
  });

  const handleDownload = (transaction: any) => {
    const receiptData = {
      transactionId: transaction.id,
      date: transaction.createdAt,
      userName: user?.name || 'Unknown User',
      userPhone: user?.phone || 'Unknown Phone',
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      from: user?.name,
      to: transaction.description
    };

    generateReceipt(receiptData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'loan':
        return 'bg-blue-100 text-blue-800';
      case 'repayment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(transaction)}
                    className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                    title="Download Receipt"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-semibold">KES {transaction.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm">{transaction.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTransactionsModal;