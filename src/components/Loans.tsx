import React, { useState } from 'react';
import {
  Plus, Search, DollarSign, User, 
  Building2, Filter, Eye, X, Clock, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoanForm from './LoanForm';

const Loans: React.FC = () => {
  const { loans, users, groups } = useApp();
  const { canDisburseLoan, addNotification, currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'group' | 'individual'>('group');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const handleDisburseLoan = () => {
    if (canDisburseLoan()) {
      setIsModalOpen(true);
    } else {
      // For initiators, show a message that they can request loan disbursement
      alert('You can request loan disbursement. Please fill out the loan form to send a request to Super Admin for approval.');
      setIsModalOpen(true);
    }
  };

  const filterLoans = (type: 'group' | 'individual') => {
    const filtered = loans.filter((loan) => loan.type === type);
    return filtered.filter((loan) => {
      const user = users.find((u) => u.id === loan.userId);
      const group = groups.find((g) => g.id === loan.groupId);

      const matchesSearch =
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAmount =
        !amountFilter || loan.amount >= parseFloat(amountFilter);

      const createdAt = new Date(loan.createdAt);
      const now = new Date();
      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'today' && createdAt.toDateString() === now.toDateString()) ||
        (timeFilter === 'week' && createdAt > new Date(now.getTime() - 7 * 86400000)) ||
        (timeFilter === 'month' && createdAt > new Date(now.getTime() - 30 * 86400000));

      return matchesSearch && matchesAmount && matchesTime;
    });
  };

  const currentLoans = filterLoans(activeTab);

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.name || 'Unknown User';

  const getGroupName = (groupId: string) =>
    groups.find((g) => g.id === groupId)?.name || 'Unknown Group';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const calculateProgress = (repaid: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((repaid / total) * 100);
  };

  const handleViewDetails = (loan: any) => {
    setSelectedLoan(loan);
  };

  const calculateDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const LoanDetailsModal = () => {
    if (!selectedLoan) return null;

    const user = users.find(u => u.id === selectedLoan.userId);
    const group = groups.find(g => g.id === selectedLoan.groupId);
    const progress = calculateProgress(selectedLoan.repaidAmount, selectedLoan.amount);
    const daysRemaining = calculateDaysRemaining(selectedLoan.dueDate);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Loan Details</h2>
            <button
              onClick={() => setSelectedLoan(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Loan Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">Loan Amount</span>
                </div>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                  KES {selectedLoan.amount.toLocaleString()}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-green-600 dark:text-green-400">Progress</span>
                </div>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">{progress}%</p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-orange-600 dark:text-orange-400">Days Remaining</span>
                </div>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                  {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">Repayment Progress</span>
                <span className="text-gray-700 dark:text-gray-300">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#2d8e41] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Repaid: KES {selectedLoan.repaidAmount.toLocaleString()}</span>
                <span>Remaining: KES {(selectedLoan.amount - selectedLoan.repaidAmount).toLocaleString()}</span>
              </div>
            </div>

            {/* Loan Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Loan Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Loan ID:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLoan.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedLoan.status)}`}>
                      {selectedLoan.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Interest Rate:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedLoan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Loan Type:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{selectedLoan.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedLoan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Borrower Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Unknown User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Group:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{group?.name || 'Unknown Group'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Payment Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">KES {selectedLoan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">KES {selectedLoan.repaidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
                    <p className="font-bold text-lg text-red-600 dark:text-red-400">KES {(selectedLoan.amount - selectedLoan.repaidAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Interest</p>
                    <p className="font-bold text-lg text-gray-900 dark:text-gray-100">KES {Math.round(selectedLoan.amount * selectedLoan.interestRate / 100).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex-1 bg-[#2d8e41] text-white py-2 px-4 rounded-lg hover:bg-[#246b35] transition">
                Record Payment
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                Send Reminder
              </button>
              <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition">
                Edit Loan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Loans</h1>
        <button
          onClick={handleDisburseLoan}
          className="bg-[#983F21] text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg flex items-center space-x-2 hover:bg-[#7a3219] transition self-start sm:self-auto"
        >
          <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
          <span>{canDisburseLoan() ? 'Disburse Loan' : 'Request Loan'}</span>
        </button>
      </div>

      {/* Access Restriction Notice for Initiators */}
      {!canDisburseLoan() && (
        <div className="bg-[#983F21] bg-opacity-10 border border-[#983F21] border-opacity-30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#983F21]" />
            <div>
              <h3 className="text-sm font-medium text-[#983F21]">Loan Request System</h3>
              <p className="text-sm text-[#983F21] opacity-90">You can submit loan disbursement requests. Click "Request Loan" to send detailed requests to Super Admin for approval.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <nav className="flex space-x-4 lg:space-x-6 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['group', 'individual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'group' | 'individual')}
              className={`py-3 lg:py-4 text-sm lg:text-base font-medium border-b-2 flex items-center space-x-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#2d8e41] border-[#2d8e41]'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'group' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
              <span>{tab === 'group' ? 'Group Loans' : 'Individual Loans'}</span>
            </button>
          ))}
        </nav>

        {/* Filters */}
        <div className="p-4 lg:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <input
            type="number"
            placeholder="Min Amount (KES)"
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />

          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Loan Cards */}
        <div className="p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {currentLoans.length > 0 ? currentLoans.map((loan) => (
            <div key={loan.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-full">
                    <DollarSign className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">KES {loan.amount.toLocaleString()}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loan ID: {loan.id}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300 mb-3">
                <div className="flex justify-between">
                  <span>Borrower:</span>
                  <span className="font-medium">{getUserName(loan.userId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Group:</span>
                  <span className="font-medium">{getGroupName(loan.groupId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest Rate:</span>
                  <span className="font-medium">{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Due Date:</span>
                  <span className="font-medium">{new Date(loan.dueDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                  <span className="text-gray-900 dark:text-gray-100">{calculateProgress(loan.repaidAmount, loan.amount)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                  <div
                    className="bg-[#2d8e41] h-2 rounded-full"
                    style={{ width: `${calculateProgress(loan.repaidAmount, loan.amount)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Repaid: KES {loan.repaidAmount.toLocaleString()}</span>
                  <span>Remaining: KES {(loan.amount - loan.repaidAmount).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                <span>Created: {new Date(loan.createdAt).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleViewDetails(loan)}
                  className="flex items-center space-x-1 text-[#2d8e41] hover:text-[#246b35] transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
              No {activeTab} loans found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={canDisburseLoan() ? "Disburse New Loan" : "Request Loan Disbursement"}
      >
        <LoanForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      {/* Loan Details Modal */}
      {selectedLoan && <LoanDetailsModal />}
    </div>
  );
};

export default Loans;