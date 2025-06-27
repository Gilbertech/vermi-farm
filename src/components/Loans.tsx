import React, { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, User, Users, Building2, Filter, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import LoanForm from './LoanForm';

const Loans: React.FC = () => {
  const { loans, users, groups } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'group' | 'individual'>('group');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  // Separate loans by type
  const groupLoans = loans.filter(loan => loan.type === 'group');
  const individualLoans = loans.filter(loan => loan.type === 'individual');
  
  const currentLoans = activeTab === 'group' ? groupLoans : individualLoans;

  const filteredLoans = currentLoans.filter(loan => {
    const user = users.find(u => u.id === loan.userId);
    const group = groups.find(g => g.id === loan.groupId);
    
    const matchesSearch = 
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || loan.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(loan.createdAt).toDateString() === new Date().toDateString()) ||
      (timeFilter === 'week' && new Date(loan.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (timeFilter === 'month' && new Date(loan.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesAmount && matchesTime;
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
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Loans</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
          <span>Disburse Loan</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 lg:space-x-8 px-4 lg:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('group')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'group'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Group Loans</span>
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'individual'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Individual Loans</span>
            </button>
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search loans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent w-full transition-colors duration-200"
              />
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
            
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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

          {/* Loans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredLoans.map((loan) => (
              <div key={loan.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
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
                    <button className="text-[#2d8e41] hover:text-[#246b35] text-sm font-medium transition-colors duration-200 flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLoans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No {activeTab} loans found matching your criteria</p>
            </div>
          )}
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