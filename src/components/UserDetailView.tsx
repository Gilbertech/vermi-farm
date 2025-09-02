import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Mail, CreditCard, MoreVertical, Edit, RotateCcw, History, Banknote, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserService, UserTransaction, UserLoan } from '../services/userService';
import { ApiError } from '../services/api';
import Modal from './Modal';
import UserTransactionsModal from './modals/UserTransactionsModal';
import UserLoanHistoryModal from './modals/UserLoanHistoryModal';

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onBack }) => {
  const { users, groups, updateUser, resetUserPin } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'transactions' | 'loans' | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const [userLoans, setUserLoans] = useState<UserLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = users.find(u => u.id === userId);
  const userGroup = user?.groupId ? groups.find(g => g.id === user.groupId) : null;

  // Load user-specific data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [transactionsResponse, loansResponse] = await Promise.allSettled([
          UserService.getUserTransactions(userId, { limit: 100 }),
          UserService.getUserLoans(userId, { limit: 100 })
        ]);

        if (transactionsResponse.status === 'fulfilled') {
          setUserTransactions(transactionsResponse.value.items);
        } else {
          console.error('Failed to load user transactions:', transactionsResponse.reason);
        }

        if (loansResponse.status === 'fulfilled') {
          setUserLoans(loansResponse.value.items);
        } else {
          console.error('Failed to load user loans:', loansResponse.reason);
        }

      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load user data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUserData();
    }
  }, [userId]);

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

  const handleDropdownAction = (action: string) => {
    setDropdownOpen(false);
    setModalType(action as any);
  };

  const handleResetPin = async () => {
    try {
      const result = await resetUserPin(userId);
      alert(`✅ PIN reset successfully!\n\nNew PIN: ${result.newPin}\nSMS Sent: ${result.smsSent ? 'Yes' : 'No'}`);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to reset PIN';
      alert(`❌ PIN reset failed: ${errorMessage}`);
    }
    setDropdownOpen(false);
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

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {showSensitiveData ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span>{showSensitiveData ? 'Hide Data' : 'Show Data'}</span>
          </button>
          
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors duration-200"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleDropdownAction('edit')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit User</span>
                  </button>
                  <button
                    onClick={handleResetPin}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset PIN</span>
                  </button>
                  <button
                    onClick={() => handleDropdownAction('transactions')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <History className="w-4 h-4" />
                    <span>View Transactions</span>
                  </button>
                  <button
                    onClick={() => handleDropdownAction('loans')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Loan History</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user details...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Error loading user data: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#2d8e41] hover:text-[#246b35] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* User Overview Card */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {showSensitiveData ? user.phone : '****'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {showSensitiveData ? (user.email || 'Not provided') : '****'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {showSensitiveData ? `KES ${user.balance.toLocaleString()}` : '****'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                  {user.role || 'Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Group Information */}
          {userGroup && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Group Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Group Name</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{userGroup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{userGroup.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Group Balance</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {showSensitiveData ? `KES ${userGroup.totalBalance.toLocaleString()}` : '****'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{userTransactions.length}</p>
              </div>
              <History className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Loans</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {userLoans.filter(l => l.status === 'active').length}
                </p>
              </div>
              <Banknote className="w-8 h-8 text-[#983F21] dark:text-orange-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Borrowed</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {showSensitiveData 
                    ? `KES ${userLoans.reduce((sum, l) => sum + l.amount, 0).toLocaleString()}`
                    : '****'
                  }
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Activity</h3>
          </div>
          
          <div className="p-4 lg:p-6">
            {userTransactions.length > 0 ? (
              <div className="space-y-3">
                {userTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {showSensitiveData ? `KES ${transaction.amount.toLocaleString()}` : '****'}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {userTransactions.length > 5 && (
                  <button
                    onClick={() => setModalType('transactions')}
                    className="w-full text-center py-2 text-[#2d8e41] hover:text-[#246b35] font-medium"
                  >
                    View All Transactions ({userTransactions.length})
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={modalType === 'transactions'}
        onClose={() => setModalType(null)}
        title="Transaction History"
      >
        <UserTransactionsModal userId={userId} />
      </Modal>

      <Modal
        isOpen={modalType === 'loans'}
        onClose={() => setModalType(null)}
        title="Loan History"
      >
        <UserLoanHistoryModal userId={userId} />
      </Modal>
    </div>
  );
};

export default UserDetailView;