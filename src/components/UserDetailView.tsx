import React, { useState } from 'react';
import { ArrowLeft, Phone, Users, DollarSign,  Edit, Save, X, RotateCcw, Eye, History, CheckCircle, AlertTriangle, CreditCard, Wallet, PiggyBank, Shield, Key, Smartphone, Copy, TrendingUp, TrendingDown, } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';

interface UserDetailViewProps {
  userId: string;
  onBack: () => void;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_disbursement' | 'loan_payment' | 'savings_deposit' | 'savings_withdrawal';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  fromAccount?: string;
  toAccount?: string;
}

interface Loan {
  id: string;
  amount: number;
  balance: number;
  interestRate: number;
  dueDate: string;
  status: 'active' | 'completed' | 'overdue' | 'defaulted';
  disbursementDate: string;
  purpose: string;
  guarantors?: string[];
  paymentHistory: {
    id: string;
    amount: number;
    date: string;
    type: 'principal' | 'interest' | 'penalty';
    balance: number;
  }[];
}

const UserDetailView: React.FC<UserDetailViewProps> = ({ userId, onBack }) => {
  const { users, groups, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isResettingPin, setIsResettingPin] = useState(false);
  const [showResetPinModal, setShowResetPinModal] = useState(false);
  const [pinResetMethod, setPinResetMethod] = useState<'auto' | 'manual'>('auto');
  const [manualPin, setManualPin] = useState('');
  const [newGeneratedPin, setNewGeneratedPin] = useState('');
  const [activeTab, setActiveTab] = useState<'loans' | 'savings' | 'wallet'>('wallet');
  const [actionStatus, setActionStatus] = useState<{type: string, message: string} | null>(null);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
  const [loanFilter, setLoanFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [showTransactionDetails, setShowTransactionDetails] = useState<string | null>(null);
  const [showLoanDetails, setShowLoanDetails] = useState<string | null>(null);

  const user = users.find(u => u.id === userId);
  const userGroup = user?.groupId ? groups.find(g => g.id === user.groupId) : null;

  // Real-time data - in production, this would come from your state management or API
  const userTransactions: Transaction[] = [
    {
      id: 'txn_001',
      type: 'deposit',
      amount: 15000,
      date: '2024-02-28T10:30:00Z',
      description: 'Monthly savings contribution',
      status: 'completed',
      reference: 'SAV_2024_02_001'
    },
    {
      id: 'txn_002',
      type: 'loan_disbursement',
      amount: 50000,
      date: '2024-02-25T14:15:00Z',
      description: 'Business loan disbursement',
      status: 'completed',
      reference: 'LOAN_2024_02_003'
    },
    {
      id: 'txn_003',
      type: 'loan_payment',
      amount: 5500,
      date: '2024-02-20T09:45:00Z',
      description: 'Loan repayment - Principal + Interest',
      status: 'completed',
      reference: 'PAY_2024_02_015'
    },
    {
      id: 'txn_004',
      type: 'transfer',
      amount: 3000,
      date: '2024-02-18T16:20:00Z',
      description: 'Transfer to emergency fund',
      status: 'completed',
      fromAccount: 'Main Wallet',
      toAccount: 'Emergency Savings'
    },
    {
      id: 'txn_005',
      type: 'withdrawal',
      amount: 8000,
      date: '2024-02-15T11:10:00Z',
      description: 'Cash withdrawal',
      status: 'completed',
      reference: 'WD_2024_02_008'
    },
    {
      id: 'txn_006',
      type: 'savings_deposit',
      amount: 12000,
      date: '2024-02-10T13:30:00Z',
      description: 'Fixed deposit investment',
      status: 'completed',
      reference: 'FD_2024_02_002'
    }
  ];

  const userLoans: Loan[] = [
    {
      id: 'loan_001',
      amount: 50000,
      balance: 35000,
      interestRate: 2.5,
      dueDate: '2024-03-15T00:00:00Z',
      status: 'active',
      disbursementDate: '2024-01-15T00:00:00Z',
      purpose: 'Business expansion',
      guarantors: ['John Doe', 'Jane Smith'],
      paymentHistory: [
        {
          id: 'pay_001',
          amount: 5500,
          date: '2024-02-20T00:00:00Z',
          type: 'principal',
          balance: 35000
        },
        {
          id: 'pay_002',
          amount: 9500,
          date: '2024-01-20T00:00:00Z',
          type: 'principal',
          balance: 40500
        }
      ]
    },
    {
      id: 'loan_002',
      amount: 25000,
      balance: 15000,
      interestRate: 2.0,
      dueDate: '2024-04-20T00:00:00Z',
      status: 'active',
      disbursementDate: '2024-02-01T00:00:00Z',
      purpose: 'Education fees',
      paymentHistory: [
        {
          id: 'pay_003',
          amount: 10000,
          date: '2024-02-25T00:00:00Z',
          type: 'principal',
          balance: 15000
        }
      ]
    },
    {
      id: 'loan_003',
      amount: 30000,
      balance: 0,
      interestRate: 2.5,
      dueDate: '2024-01-15T00:00:00Z',
      status: 'completed',
      disbursementDate: '2023-10-15T00:00:00Z',
      purpose: 'Home improvement',
      paymentHistory: [
        {
          id: 'pay_004',
          amount: 30000,
          date: '2024-01-10T00:00:00Z',
          type: 'principal',
          balance: 0
        }
      ]
    }
  ];

  const mockLoanData = {
    activeLoans: userLoans.filter(loan => loan.status === 'active'),
    loanHistory: userLoans,
    totalBorrowed: userLoans.reduce((sum, loan) => sum + loan.amount, 0),
    totalRepaid: userLoans.reduce((sum, loan) => sum + (loan.amount - loan.balance), 0),
    creditScore: 750
  };

  const mockSavingsData = {
    totalSavings: 125000,
    monthlyContribution: 5000,
    interestEarned: 2500,
    savingsGoal: 200000,
    accounts: [
      { id: '1', type: 'Regular Savings', balance: 75000, interestRate: 4.5 },
      { id: '2', type: 'Fixed Deposit', balance: 50000, interestRate: 6.0, maturityDate: '2024-12-31' }
    ]
  };

  const mockWalletData = {
    availableBalance: user?.balance || 0,
    pendingTransactions: 2500,
    lastTransaction: userTransactions[0]?.date || '2024-02-28',
    transactionLimit: 100000,
    recentTransactions: userTransactions.slice(0, 5)
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser(user.id, editData);
      setIsEditing(false);
      setActionStatus({
        type: 'success',
        message: 'User details updated successfully!'
      });
      
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

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewGeneratedPin(pin);
    return pin;
  };

  const handleResetPin = async () => {
    setIsResettingPin(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalPin = pinResetMethod === 'auto' ? newGeneratedPin : manualPin;
      
      setActionStatus({
        type: 'success',
        message: `PIN reset successfully for ${user.name}. New PIN: ${finalPin} (Demo - PIN sent via SMS)`
      });
      
      console.log(`PIN reset for user ${user.id}: ${finalPin}`);
      setShowResetPinModal(false);
      setManualPin('');
      setNewGeneratedPin('');
      
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

  const copyPinToClipboard = () => {
    navigator.clipboard.writeText(newGeneratedPin);
    setActionStatus({
      type: 'success',
      message: 'PIN copied to clipboard!'
    });
    setTimeout(() => setActionStatus(null), 2000);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'savings_deposit':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
      case 'savings_withdrawal':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <ArrowLeft className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleViewTransactions = () => {
    setActiveTab('wallet');
    setActionStatus({
      type: 'info',
      message: 'Switched to wallet view to show transactions'
    });
    setTimeout(() => setActionStatus(null), 2000);
  };

  const handleViewLoanHistory = () => {
    setActiveTab('loans');
    setActionStatus({
      type: 'info',
      message: 'Switched to loans view to show history'
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

  const filteredTransactions = userTransactions.filter(transaction => {
    if (transactionFilter === 'all') return true;
    return transaction.type.includes(transactionFilter);
  });

  const filteredLoans = userLoans.filter(loan => {
    if (loanFilter === 'all') return true;
    return loan.status === loanFilter;
  });

  const TabContent = () => {
    switch (activeTab) {
      case 'loans':
        return (
          <div className="space-y-6">
            {/* Loan Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Total Borrowed</p>
                    <p className="text-xl font-bold text-red-800 dark:text-red-300">KES {mockLoanData.totalBorrowed.toLocaleString()}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Outstanding</p>
                    <p className="text-xl font-bold text-orange-800 dark:text-orange-300">KES {(mockLoanData.totalBorrowed - mockLoanData.totalRepaid).toLocaleString()}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Credit Score</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{mockLoanData.creditScore}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Active Loans */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Loan History</h4>
                <select
                  value={loanFilter}
                  onChange={(e) => setLoanFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Loans</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="space-y-3">
                {filteredLoans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                       onClick={() => setShowLoanDetails(showLoanDetails === loan.id ? null : loan.id)}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{loan.purpose}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(loan.dueDate).toLocaleDateString()}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                          loan.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          loan.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          loan.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {loan.balance.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">of KES {loan.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {loan.status !== 'completed' && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              loan.status === 'overdue' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${((loan.amount - loan.balance) / loan.amount) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{loan.interestRate}% interest rate</p>
                      </div>
                    )}

                    {/* Loan Details Expansion */}
                    {showLoanDetails === loan.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Disbursement Date</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{new Date(loan.disbursementDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{loan.interestRate}% per month</p>
                          </div>
                          {loan.guarantors && loan.guarantors.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Guarantors</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{loan.guarantors.join(', ')}</p>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Payment History</h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {loan.paymentHistory.map((payment) => (
                              <div key={payment.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">KES {payment.amount.toLocaleString()}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">Balance: KES {payment.balance.toLocaleString()}</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    payment.type === 'principal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                    payment.type === 'interest' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {payment.type}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'savings':
        return (
          <div className="space-y-6">
            {/* Savings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Total Savings</p>
                    <p className="text-xl font-bold text-green-800 dark:text-green-300">KES {mockSavingsData.totalSavings.toLocaleString()}</p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Monthly Goal</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">KES {mockSavingsData.monthlyContribution.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Interest Earned</p>
                    <p className="text-xl font-bold text-purple-800 dark:text-purple-300">KES {mockSavingsData.interestEarned.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Goal Progress</p>
                    <p className="text-xl font-bold text-orange-800 dark:text-orange-300">{Math.round((mockSavingsData.totalSavings / mockSavingsData.savingsGoal) * 100)}%</p>
                  </div>
                  <Eye className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Savings Goal Progress */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Savings Goal Progress</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current: KES {mockSavingsData.totalSavings.toLocaleString()}</span>
                  <span className="text-gray-600 dark:text-gray-400">Goal: KES {mockSavingsData.savingsGoal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(mockSavingsData.totalSavings / mockSavingsData.savingsGoal) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  KES {(mockSavingsData.savingsGoal - mockSavingsData.totalSavings).toLocaleString()} remaining to reach goal
                </p>
              </div>
            </div>

            {/* Savings Accounts */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Savings Accounts</h4>
              <div className="space-y-3">
                {mockSavingsData.accounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{account.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{account.interestRate}% interest rate</p>
                        {account.maturityDate && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">Matures: {new Date(account.maturityDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">KES {account.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-6">
            {/* Wallet Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Available Balance</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">KES {mockWalletData.availableBalance.toLocaleString()}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Pending</p>
                    <p className="text-xl font-bold text-orange-800 dark:text-orange-300">KES {mockWalletData.pendingTransactions.toLocaleString()}</p>
                  </div>
                  <History className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Daily Limit</p>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300">KES {mockWalletData.transactionLimit.toLocaleString()}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Transaction History</h4>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Transactions</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                       onClick={() => setShowTransactionDetails(showTransactionDetails === transaction.id ? null : transaction.id)}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{transaction.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${
                          transaction.type.includes('deposit') || transaction.type === 'loan_disbursement' ? 'text-green-600 dark:text-green-400' :
                          transaction.type.includes('withdrawal') || transaction.type === 'loan_payment' ? 'text-red-600 dark:text-red-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {transaction.type.includes('withdrawal') || transaction.type === 'loan_payment' ? '-' : '+'}KES {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Transaction Details Expansion */}
                    {showTransactionDetails === transaction.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                            <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{transaction.id}</p>
                          </div>
                          {transaction.reference && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                              <p className="font-mono text-sm text-gray-800 dark:text-gray-200">{transaction.reference}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{new Date(transaction.date).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">{transaction.type.replace('_', ' ')}</p>
                          </div>
                          {transaction.fromAccount && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">From Account</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{transaction.fromAccount}</p>
                            </div>
                          )}
                          {transaction.toAccount && (
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">To Account</p>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{transaction.toAccount}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
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
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Village Bank Association</label>
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
  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
    Member Since
  </label>
  <p className="text-gray-800 dark:text-gray-200">
    {new Date(user.createdAt).toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })}
  </p>
</div>

          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowResetPinModal(true)}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex items-center space-x-3 mb-2">
              <RotateCcw className="w-5 h-5 text-[#983F21] dark:text-orange-400" />
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Reset PIN</h4>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reset user's PIN for security</p>
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

      {/* Tabbed Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-4 lg:px-6" aria-label="Tabs">
            {[
              { id: 'wallet', name: 'Wallet Balance', icon: Wallet },
              { id: 'loans', name: 'Loans', icon: CreditCard },
              { id: 'savings', name: 'Savings', icon: PiggyBank }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-[#2d8e41] text-[#2d8e41] dark:border-green-400 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          <TabContent />
        </div>
      </div>

      {/* Enhanced PIN Reset Modal */}
      <Modal
        isOpen={showResetPinModal}
        onClose={() => setShowResetPinModal(false)}
        title="Reset User PIN"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Security Notice</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">This action will reset the user's current PIN. The new PIN will be sent via SMS.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reset Method</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="auto"
                    checked={pinResetMethod === 'auto'}
                    onChange={(e) => setPinResetMethod(e.target.value as 'auto')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Auto-generate secure PIN</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={pinResetMethod === 'manual'}
                    onChange={(e) => setPinResetMethod(e.target.value as 'manual')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Set custom PIN</span>
                </label>
              </div>
            </div>

            {pinResetMethod === 'auto' && (
              <div className="space-y-3">
                <button
                  onClick={generatePin}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Generate New PIN</span>
                </button>
                {newGeneratedPin && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Generated PIN:</p>
                        <p className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">{newGeneratedPin}</p>
                      </div>
                      <button
                        onClick={copyPinToClipboard}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {pinResetMethod === 'manual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom PIN (4 digits)</label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={manualPin}
                  onChange={(e) => setManualPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-xl font-mono"
                  placeholder="••••"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter a 4-digit PIN</p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">SMS Notification</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The new PIN will be sent to {user.phone} via SMS immediately after reset.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowResetPinModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPin}
              disabled={isResettingPin || (pinResetMethod === 'auto' && !newGeneratedPin) || (pinResetMethod === 'manual' && manualPin.length !== 4)}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isResettingPin ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Reset PIN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default UserDetailView;