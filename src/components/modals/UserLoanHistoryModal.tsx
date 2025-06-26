import React, { useState } from 'react';
import { Download, Search, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateReceipt } from '../../utils/receiptGenerator';

interface UserLoanHistoryModalProps {
  userId: string;
}

const UserLoanHistoryModal: React.FC<UserLoanHistoryModalProps> = ({ userId }) => {
  const { loans, users, groups } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const user = users.find(u => u.id === userId);
  const userLoans = loans.filter(l => l.userId === userId);

  const filteredLoans = userLoans.filter(loan => {
    const group = groups.find(g => g.id === loan.groupId);
    const matchesSearch = group?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDownload = (loan: any) => {
    const group = groups.find(g => g.id === loan.groupId);
    const receiptData = {
      transactionId: loan.id,
      date: loan.createdAt,
      userName: user?.name || 'Unknown User',
      userPhone: user?.phone || 'Unknown Phone',
      amount: loan.amount,
      type: 'Loan Disbursement',
      status: loan.status,
      from: group?.name || 'Unknown Group',
      to: user?.name || 'Unknown User'
    };

    generateReceipt(receiptData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (repaid: number, total: number) => {
    return Math.round((repaid / total) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by group..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent appearance-none bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Loans List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredLoans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No loans found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLoans.map((loan) => {
              const group = groups.find(g => g.id === loan.groupId);
              const progress = calculateProgress(loan.repaidAmount, loan.amount);
              
              return (
                <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800">KES {loan.amount.toLocaleString()}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(loan)}
                      className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                      title="Download Loan Receipt"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Group:</span>
                      <p className="font-medium">{group?.name || 'Unknown Group'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Interest Rate:</span>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Due Date:</span>
                      <p className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Disbursed:</span>
                      <p className="font-medium">{new Date(loan.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Repayment Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#2d8e41] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Repaid: KES {loan.repaidAmount.toLocaleString()}</span>
                      <span>Remaining: KES {(loan.amount - loan.repaidAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLoanHistoryModal;