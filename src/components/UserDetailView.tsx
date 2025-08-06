import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, DollarSign, Calendar, MoreVertical, Edit, RotateCcw, Eye, Download, Search, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import UserTransactionsModal from './modals/UserTransactionsModal';
import UserLoanHistoryModal from './modals/UserLoanHistoryModal';
import { generateReceipt } from '../utils/receiptGenerator';

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onBack }) => {
  const { users, groups, transactions, loans, updateUser, resetUserPin } = useApp();
  const { addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'loans'>('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isLoansModalOpen, setIsLoansModalOpen] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);

  const user = users.find(u => u.id === userId);
  const userGroup = user?.groupId ? groups.find(g => g.id === user.groupId) : null;
  const userTransactions = transactions.filter(t => t.userId === userId);
  const userLoans = loans.filter(l => l.userId === userId);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
        <button onClick={onBack} className="mt-4 text-[#2d8e41] hover:text-[#246b35]">
          Back to Users
        </button>
      </div>
    );
  }

  const handleResetPin = async () => {
    if (!window.confirm(`Are you sure you want to reset PIN for ${user.name}?`)) {
      return;
    }

    setIsResettingPin(true);
    setDropdownOpen(false);

    try {
      await resetUserPin(user.id);
      addNotification({
        type: 'payment_initiated',
        message: `PIN reset completed for ${user.name}`,
        initiatorName: 'System',
        amount: 0,
        actionType: 'payment'
      });
    } catch (error) {
      console.error('Error resetting PIN:', error);
    } finally {
      setIsResettingPin(false);
    }
  };

  const handleEditUser = () => {
    setIsEditModalOpen(true);
    setDropdownOpen(false);
  };

  const handleViewTransactions = () => {
    setIsTransactionsModalOpen(true);
  };

  const handleViewLoans = () => {
    setIsLoansModalOpen(true);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chairperson':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'secretary':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'treasurer':
        return 'bg-[#983F21] bg-opacity-10 text-[#983F21] dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalLoanAmount = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalRepaidAmount = userLoans.reduce((sum, loan) => sum + loan.repaidAmount, 0);
  const activeLoanCount = userLoans.filter(loan => loan.status === 'active').length;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">User Details & Management</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={isResettingPin}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={handleEditUser}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit User</span>
                </button>
                <button
                  onClick={handleResetPin}
                  disabled={isResettingPin}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isResettingPin ? 'Resetting...' : 'Reset PIN'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{user.email || 'Not provided'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">KES {user.balance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Status and Role */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
          {userGroup && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Group:</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{userGroup.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 lg:p-6">
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-200">{userTransactions.length}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Total Transactions</p>
          <button 
            onClick={handleViewTransactions}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 lg:p-6">
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-200">{activeLoanCount}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Active Loans</p>
          <button 
            onClick={handleViewLoans}
            className="mt-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>View History</span>
          </button>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 lg:p-6">
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-200">KES {totalLoanAmount.toLocaleString()}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">Total Loans</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Repaid: KES {totalRepaidAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tab Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 lg:space-x-8 px-4 lg:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Transactions ({userTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'loans'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Loans ({userLoans.length})
            </button>
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Group Information */}
              {userGroup && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Group Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Group Name:</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{userGroup.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Registration No:</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{userGroup.regNo || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{userGroup.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Group Balance:</span>
                      <p className="font-medium text-gray-800 dark:text-gray-200">KES {userGroup.totalBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  {userTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()} • KES {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  ))}
                  {userTransactions.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <UserTransactionsModal userId={userId} />
          )}

          {activeTab === 'loans' && (
            <UserLoanHistoryModal userId={userId} />
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Edit user functionality will be implemented with the database integration.</p>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="w-full px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Transactions Modal */}
      <Modal
        isOpen={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        title={`${user.name}'s Transactions`}
      >
        <UserTransactionsModal userId={userId} />
      </Modal>

      {/* Loans Modal */}
      <Modal
        isOpen={isLoansModalOpen}
        onClose={() => setIsLoansModalOpen(false)}
        title={`${user.name}'s Loan History`}
      >
        <UserLoanHistoryModal userId={userId} />
      </Modal>
    </div>
  );
};

export default UserDetailView;