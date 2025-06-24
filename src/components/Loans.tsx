import React, { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import LoanForm from './LoanForm';

const Loans: React.FC = () => {
  const { loans, users, groups } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLoans = loans.filter(loan => {
    const user = users.find(u => u.id === loan.userId);
    const group = groups.find(g => g.id === loan.groupId);
    return (
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Disburse Loan</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent w-full max-w-md transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {filteredLoans.map((loan) => (
            <div key={loan.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      KES {loan.amount.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500">Loan ID: {loan.id}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Borrower</span>
                  <span className="text-sm font-medium text-gray-800">{getUserName(loan.userId)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Group</span>
                  <span className="text-sm font-medium text-gray-800">{getGroupName(loan.groupId)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Interest Rate</span>
                  <span className="text-sm font-medium text-gray-800">{loan.interestRate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Due Date</span>
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(loan.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Repayment Progress</span>
                  <span className="text-sm font-medium text-gray-800">
                    {calculateProgress(loan.repaidAmount, loan.amount)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#2d8e41] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(loan.repaidAmount, loan.amount)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Repaid: KES {loan.repaidAmount.toLocaleString()}</span>
                  <span>Remaining: KES {(loan.amount - loan.repaidAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Created {new Date(loan.createdAt).toLocaleDateString()}
                  </span>
                  <button className="text-[#2d8e41] hover:text-[#246b35] text-sm font-medium transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Disburse New Loan"
      >
        <LoanForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Loans;