import React, { useState } from 'react';
import { ArrowLeft, Phone, Users, DollarSign, MapPin, Edit, Save, X, RotateCcw, Eye, History, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import UserTransactionsModal from './modals/UserTransactionsModal';
import UserLoanHistoryModal from './modals/UserLoanHistoryModal';

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onBack }) => {
  const { users, groups, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showTransactions, setShowTransactions] = useState(false);
  const [showLoanHistory, setShowLoanHistory] = useState(false);
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [actionStatus, setActionStatus] = useState<{type: string, message: string} | null>(null);

  const user = users.find(u => u.id === userId);
  const userGroup = user?.groupId ? groups.find(g => g.id === user.groupId) : null;

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
        <button onClick={onBack} className="mt-4 text-[#2d8e41] hover:text-[#246b35] dark:text-green-400 dark:hover:text-green-300">
          Back to Users
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      name: user.name,
      phone: user.phone,
      role: user.role,
      balance: user.balance
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(user.id, editData);
      setIsEditing(false);
      setActionStatus({
        type: 'success',
        message: 'User details updated successfully!'
      });
      
      // Clear status after 3 seconds
      setTimeout(() => setActionStatus(null), 3000);
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to update user details. Please try again.'
      });
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleResetPin = async () => {
    setIsResettingPin(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random PIN for demo
      const newPin = Math.floor(1000 + Math.random() * 9000);
      
      setActionStatus({
        type: 'success',
        message: `PIN reset successfully for ${user.name}. New PIN: ${newPin} (Demo)`
      });
      
      // In production, this would send SMS
      console.log(`PIN reset for user ${user.id}: ${newPin}`);
      
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: 'Failed to reset PIN. Please try again.'
      });
    } finally {
      setIsResettingPin(false);
      setTimeout(() => setActionStatus(null), 5000);
    }
  };

  const handleViewTransactions = () => {
    setShowTransactions(true);
    setActionStatus({
      type: 'info',
      message: 'Loading user transactions...'
    });
    setTimeout(() => setActionStatus(null), 2000);
  };

  const handleViewLoanHistory = () => {
    setShowLoanHistory(true);
    setActionStatus({
      type: 'info',
      message: 'Loading loan history...'
    });
    setTimeout(() => setActionStatus(null), 2000);
  };

  const getRoleBadgeColor = (role: string) => {
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
    <div className="space-y-4 lg:space-y-6">
      {/* Action Status */}
      {actionStatus && (
        <div className={`p-4 rounded-lg border ${
          actionStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : actionStatus.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            {actionStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{actionStatus.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-800 dark:text-white">User Details</h1>
        </div>
        
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="bg-[#2d8e41] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 self-start sm:self-auto"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-[#2d8e41] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-gray-800 dark:text-gray-200">{user.phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              {isEditing ? (
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="member">Member</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="secretary">Secretary</option>
                  <option value="chairperson">Chairperson</option>
                </select>
              ) : (
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Loan Limit</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editData.balance}
                  onChange={(e) => setEditData({...editData, balance: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {user.balance.toLocaleString()}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Group Association</label>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-gray-800 dark:text-gray-200">{userGroup ? userGroup.name : 'No Group'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Member Since</label>
              <p className="text-gray-800 dark:text-gray-200">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleResetPin}
            disabled={isResettingPin}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3 mb-2">
              <RotateCcw className={`w-5 h-5 text-[#983F21] dark:text-orange-400 ${isResettingPin ? 'animate-spin' : ''}`} />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Reset PIN</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isResettingPin ? 'Resetting PIN...' : 'Reset user\'s PIN for security'}
            </p>
          </button>
          
          <button 
            onClick={handleViewTransactions}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-5 h-5 text-[#2d8e41] dark:text-green-400" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">View Transactions</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">See all user transactions</p>
          </button>
          
          <button 
            onClick={handleViewLoanHistory}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <History className="w-5 h-5 text-[#983F21] dark:text-orange-400" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Loan History</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">View loan applications</p>
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showTransactions}
        onClose={() => setShowTransactions(false)}
        title={`${user.name}'s Transactions`}
      >
        <UserTransactionsModal userId={user.id} />
      </Modal>

      <Modal
        isOpen={showLoanHistory}
        onClose={() => setShowLoanHistory(false)}
        title={`${user.name}'s Loan History`}
      >
        <UserLoanHistoryModal userId={user.id} />
      </Modal>
    </div>
  );
};

export default UserDetailView;