import React, { useState } from 'react';
import { ArrowLeft, Phone, Users, DollarSign, MapPin, Edit, Save, X, RotateCcw, Eye, History, CheckCircle, AlertTriangle, Wallet, PiggyBank, CreditCard, Shield } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'wallet' | 'savings' | 'loans'>('wallet');

  const user = users.find(u => u.id === userId);
  const userGroup = user?.groupId ? groups.find(g => g.id === user.groupId) : null;

  // Mock data for demonstration
  const mockWalletData = {
    balance: 15750.00,
    pendingDeposits: 500.00,
    pendingWithdrawals: 250.00,
    totalDeposits: 45000.00,
    totalWithdrawals: 29250.00,
    transactions: [
      { id: 1, type: 'deposit', amount: 5000, date: '2024-01-15', description: 'Mobile Money Deposit' },
      { id: 2, type: 'withdrawal', amount: 2000, date: '2024-01-14', description: 'Cash Withdrawal' },
      { id: 3, type: 'deposit', amount: 3000, date: '2024-01-13', description: 'Bank Transfer' },
    ]
  };

  const mockSavingsData = {
    totalSavings: 25000.00,
    monthlyTarget: 5000.00,
    currentMonthSavings: 3500.00,
    interestEarned: 1250.00,
    savingsGoal: 100000.00,
    accounts: [
      { id: 1, name: 'Emergency Fund', balance: 15000.00, target: 50000.00 },
      { id: 2, name: 'Holiday Fund', balance: 7500.00, target: 20000.00 },
      { id: 3, name: 'Investment Fund', balance: 2500.00, target: 30000.00 },
    ]
  };

  const mockLoanData = {
    activeLoan: {
      id: 1,
      amount: 50000.00,
      remaining: 35000.00,
      interestRate: 2.5,
      dueDate: '2024-06-15',
      monthlyPayment: 5500.00,
      status: 'active'
    },
    loanLimit: 75000.00,
    availableCredit: 40000.00,
    totalPaid: 15000.00,
    history: [
      { id: 1, amount: 50000, date: '2024-01-01', status: 'active', purpose: 'Business Expansion' },
      { id: 2, amount: 25000, date: '2023-06-01', status: 'completed', purpose: 'Home Improvement' },
    ]
  };

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
      // Simulate API call with more realistic processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random PIN for demo
      const newPin = Math.floor(1000 + Math.random() * 9000);
      
      // Simulate sending SMS notification
      const smsMessage = `Your new PIN is: ${newPin}. Keep it secure and don't share with anyone.`;
      
      setActionStatus({
        type: 'success',
        message: `PIN reset successful! SMS sent to ${user.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3')}`
      });
      
      // In production, this would:
      // 1. Call backend API to reset PIN
      // 2. Send SMS via SMS gateway
      // 3. Log the action for audit trail
      console.log(`PIN reset for user ${user.id}: ${newPin}`);
      console.log(`SMS sent to ${user.phone}: ${smsMessage}`);
      
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

  const renderWalletTab = () => (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-2xl font-bold">KES {mockWalletData.balance.toLocaleString()}</p>
            </div>
            <Wallet className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Deposits</p>
              <p className="text-2xl font-bold">KES {mockWalletData.totalDeposits.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Withdrawals</p>
              <p className="text-2xl font-bold">KES {mockWalletData.totalWithdrawals.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pending Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-yellow-200 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Deposits</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {mockWalletData.pendingDeposits.toLocaleString()}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Withdrawals</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {mockWalletData.pendingWithdrawals.toLocaleString()}</p>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {mockWalletData.transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  transaction.type === 'deposit' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'deposit' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {transaction.type === 'deposit' ? '+' : '-'}KES {transaction.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSavingsTab = () => (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Savings</p>
              <p className="text-2xl font-bold">KES {mockSavingsData.totalSavings.toLocaleString()}</p>
            </div>
            <PiggyBank className="w-8 h-8 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Monthly Target</p>
              <p className="text-2xl font-bold">KES {mockSavingsData.monthlyTarget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-indigo-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">This Month</p>
              <p className="text-2xl font-bold">KES {mockSavingsData.currentMonthSavings.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-pink-200 rounded-full flex items-center justify-center">
              <span className="text-pink-600 text-sm font-bold">
                {Math.round((mockSavingsData.currentMonthSavings / mockSavingsData.monthlyTarget) * 100)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Interest Earned</p>
              <p className="text-2xl font-bold">KES {mockSavingsData.interestEarned.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center">
              <span className="text-teal-600 text-sm font-bold">5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goal Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Savings Goal Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Progress to Goal</span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">
              KES {mockSavingsData.totalSavings.toLocaleString()} / KES {mockSavingsData.savingsGoal.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(mockSavingsData.totalSavings / mockSavingsData.savingsGoal) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((mockSavingsData.totalSavings / mockSavingsData.savingsGoal) * 100)}% of goal achieved
          </p>
        </div>
      </div>

      {/* Savings Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Savings Accounts</h3>
        <div className="space-y-4">
          {mockSavingsData.accounts.map((account) => (
            <div key={account.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{account.name}</h4>
                <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  KES {account.balance.toLocaleString()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Target: KES {account.target.toLocaleString()}</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {Math.round((account.balance / account.target) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((account.balance / account.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoansTab = () => (
    <div className="space-y-6">
      {/* Loan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Active Loan</p>
              <p className="text-2xl font-bold">KES {mockLoanData.activeLoan.remaining.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 text-red-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Monthly Payment</p>
              <p className="text-2xl font-bold">KES {mockLoanData.activeLoan.monthlyPayment.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Credit</p>
              <p className="text-2xl font-bold">KES {mockLoanData.availableCredit.toLocaleString()}</p>
            </div>
            <Shield className="w-8 h-8 text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Paid</p>
              <p className="text-2xl font-bold">KES {mockLoanData.totalPaid.toLocaleString()}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Active Loan Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Active Loan Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Original Amount</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {mockLoanData.activeLoan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{mockLoanData.activeLoan.interestRate}% per month</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{mockLoanData.activeLoan.dueDate}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">KES {mockLoanData.activeLoan.remaining.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Progress</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    KES {mockLoanData.totalPaid.toLocaleString()} / KES {mockLoanData.activeLoan.amount.toLocaleString()}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {Math.round((mockLoanData.totalPaid / mockLoanData.activeLoan.amount) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(mockLoanData.totalPaid / mockLoanData.activeLoan.amount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                mockLoanData.activeLoan.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {mockLoanData.activeLoan.status.charAt(0).toUpperCase() + mockLoanData.activeLoan.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Loan History</h3>
        <div className="space-y-3">
          {mockLoanData.history.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  loan.status === 'active' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{loan.purpose}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Applied on {loan.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  KES {loan.amount.toLocaleString()}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  loan.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'wallet'
                ? 'border-[#2d8e41] text-[#2d8e41] dark:text-green-400 dark:border-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'savings'
                ? 'border-[#2d8e41] text-[#2d8e41] dark:text-green-400 dark:border-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PiggyBank className="w-4 h-4" />
              <span>Savings</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('loans')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === 'loans'
                ? 'border-[#2d8e41] text-[#2d8e41] dark:text-green-400 dark:border-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Loans</span>
            </div>
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'wallet' && renderWalletTab()}
          {activeTab === 'savings' && renderSavingsTab()}
          {activeTab === 'loans' && renderLoansTab()}
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