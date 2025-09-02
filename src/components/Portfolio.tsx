import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet, PiggyBank as Piggy, ChevronDown, Search, Calendar, Download, Eye, EyeOff, ArrowUpRight, Check, X, AlertTriangle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/receiptGenerator';
import Modal from './Modal';
import TransferForm from './forms/TransferForm';

const Portfolio: React.FC = () => {
  const { stats, loans,} = useApp();
  const { canInitiate, canApprove, canTransferPortfolio, currentUser, addNotification } = useAuth();
  const [activeTab, setActiveTab] = useState<'loan' | 'revenue' | 'investment' | 'expense' | 'working' | 'b2b' | 'savings'>('loan');
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [transferDropdownOpen, setTransferDropdownOpen] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetPortfolio, setTargetPortfolio] = useState('');
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);

  const portfolioTabs = [
    { id: 'loan', label: 'Loan Portfolio', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue Portfolio', icon: DollarSign },
    { id: 'investment', label: 'Investment Portfolio', icon: BarChart3 },
    { id: 'expense', label: 'Expense Portfolio', icon: TrendingDown },
    { id: 'working', label: 'Working Account Portfolio', icon: Wallet },
    { id: 'b2b', label: 'B2B Holding Portfolio', icon: PieChart },
    { id: 'savings', label: 'Savings Portfolio', icon: Piggy }
  ];

  // Mock portfolio-specific transaction data for each portfolio
  const portfolioTransactions = {
    loan: [
      {
        id: '1',
        txCode: 'LN001234567',
        from: 'John Doe',
        to: 'Loan Portfolio',
        amount: 15000,
        fees: 50,
        time: '2024-01-20T10:30:00Z',
        status: 'completed'
      },
      {
        id: '2',
        txCode: 'LN001234568',
        from: 'Loan Portfolio',
        to: 'Jane Smith',
        amount: 12000,
        fees: 40,
        time: '2024-01-19T14:15:00Z',
        status: 'completed'
      }
    ],
    revenue: [
      {
        id: '3',
        txCode: 'RV001234569',
        from: 'Interest Collection',
        to: 'Revenue Portfolio',
        amount: 2500,
        fees: 15,
        time: '2024-01-20T16:30:00Z',
        status: 'completed'
      },
      {
        id: '4',
        txCode: 'RV001234570',
        from: 'Service Fees',
        to: 'Revenue Portfolio',
        amount: 800,
        fees: 10,
        time: '2024-01-19T11:20:00Z',
        status: 'completed'
      }
    ],
    investment: [
      {
        id: '5',
        txCode: 'IV001234571',
        from: 'Investment Portfolio',
        to: 'Stock Purchase',
        amount: 25000,
        fees: 100,
        time: '2024-01-18T09:45:00Z',
        status: 'completed'
      }
    ],
    expense: [
      {
        id: '6',
        txCode: 'EX001234572',
        from: 'Expense Portfolio',
        to: 'Office Rent',
        amount: 8000,
        fees: 30,
        time: '2024-01-17T08:00:00Z',
        status: 'completed'
      }
    ],
    working: [
      {
        id: '7',
        txCode: 'WA001234573',
        from: 'Working Account',
        to: 'Daily Operations',
        amount: 5000,
        fees: 25,
        time: '2024-01-20T12:00:00Z',
        status: 'completed'
      }
    ],
    b2b: [
      {
        id: '8',
        txCode: 'B2B001234574',
        from: 'B2B Holding',
        to: 'Partner Payment',
        amount: 18000,
        fees: 75,
        time: '2024-01-19T15:30:00Z',
        status: 'completed'
      }
    ],
    savings: [
      {
        id: '9',
        txCode: 'SV001234575',
        from: 'Monthly Savings',
        to: 'Savings Portfolio',
        amount: 10000,
        fees: 0,
        time: '2024-01-20T18:00:00Z',
        status: 'completed'
      }
    ]
  };

  const currentPortfolioTransactions = portfolioTransactions[activeTab] || [];

  const filteredTransactions = currentPortfolioTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || transaction.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(transaction.time).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesAmount && matchesTime;
  });

  const handleTransfer = (targetPortfolioId: string) => {
    if (!canTransferPortfolio() && !canInitiate()) {
      alert('You do not have permission to initiate transfers');
      return;
    }
    
    setTargetPortfolio(targetPortfolioId);
    setIsTransferModalOpen(true);
    setTransferDropdownOpen(false);
  };

  const handleTransferSubmit = (transferData: any) => {
    const newTransfer = {
      id: Date.now().toString(),
      ...transferData,
      fromPortfolio: activeTab,
      toPortfolio: targetPortfolio,
      initiatedBy: currentUser?.name,
      status: canApprove() ? 'approved' : 'pending',
      createdAt: new Date().toISOString()
    };

    if (canApprove()) {
      // Auto-approve if super admin
      console.log('Transfer approved and executed:', newTransfer);
      alert(`✅ Transfer of KES ${transferData.amount.toLocaleString()} from ${activeTab} to ${targetPortfolio} portfolio completed successfully!`);
    } else {
      // Send notification to super admin for approval
      if (currentUser) {
        addNotification({
          type: 'transfer_initiated',
          message: `Portfolio transfer of KES ${transferData.amount.toLocaleString()} initiated`,
          initiatorName: currentUser.name,
          amount: transferData.amount,
          actionType: 'transfer',
          details: { 
            type: 'portfolio_transfer',
            fromPortfolio: activeTab,
            toPortfolio: targetPortfolio,
            description: transferData.description,
            reference: transferData.reference
          }
        });
        alert(`📤 Transfer request sent to Super Admin for approval!\n\nAmount: KES ${transferData.amount.toLocaleString()}\nFrom: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Portfolio\nTo: ${targetPortfolio.charAt(0).toUpperCase() + targetPortfolio.slice(1)} Portfolio`);
      }
      
      // Add to pending transfers for display
      setPendingTransfers(prev => [...prev, newTransfer]);
    }

    setIsTransferModalOpen(false);
  };

  const handleApproveTransfer = (transferId: string) => {
    if (!canApprove()) {
      alert('You do not have permission to approve transfers');
      return;
    }

    setPendingTransfers(prev => 
      prev.map(transfer => 
        transfer.id === transferId 
          ? { ...transfer, status: 'approved', approvedBy: currentUser?.name }
          : transfer
      )
    );
  };

  const handleRejectTransfer = (transferId: string) => {
    if (!canApprove()) {
      alert('You do not have permission to reject transfers');
      return;
    }

    setPendingTransfers(prev => 
      prev.map(transfer => 
        transfer.id === transferId 
          ? { ...transfer, status: 'rejected', rejectedBy: currentUser?.name }
          : transfer
      )
    );
  };

  const handleDownload = (transactionId: string) => {
    const transaction = filteredTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const receiptData = {
      transactionId: transaction.txCode,
      date: transaction.time,
      userName: transaction.from,
      userPhone: '+254712345678', // Mock phone
      amount: transaction.amount,
      type: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Portfolio Transaction`,
      status: transaction.status,
      from: transaction.from,
      to: transaction.to
    };

    generateReceipt(receiptData);
  };

  const getPortfolioStats = (portfolioType: string) => {
    const transactions = portfolioTransactions[portfolioType as keyof typeof portfolioTransactions] || [];
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.fees, 0);
    const transactionCount = transactions.length;

    switch (portfolioType) {
      case 'loan':
        return {
          primary: { label: 'Total Disbursed', value: `KES ${stats.totalLoanDisbursed.toLocaleString()}`, trend: '+15%' },
          secondary: { label: 'Total Repaid', value: `KES ${stats.totalLoanRepaid.toLocaleString()}`, trend: '+8%' },
          tertiary: { label: 'Active Loans', value: loans.filter(l => l.status === 'active').length.toString(), trend: '-2%' }
        };
      case 'revenue':
        return {
          primary: { label: 'Total Revenue', value: `KES ${stats.totalEarned.toLocaleString()}`, trend: '+25%' },
          secondary: { label: 'Interest Income', value: `KES ${(stats.totalEarned * 0.3).toLocaleString()}`, trend: '+18%' },
          tertiary: { label: 'Service Fees', value: `KES ${(stats.totalEarned * 0.1).toLocaleString()}`, trend: '+12%' }
        };
      default:
        return {
          primary: { label: `Total ${portfolioType.charAt(0).toUpperCase() + portfolioType.slice(1)}`, value: `KES ${totalAmount.toLocaleString()}`, trend: '+5%' },
          secondary: { label: 'Total Fees', value: `KES ${totalFees.toLocaleString()}`, trend: '+3%' },
          tertiary: { label: 'Transactions', value: transactionCount.toString(), trend: '+10%' }
        };
    }
  };

  const renderPortfolioStats = () => {
    const stats = getPortfolioStats(activeTab);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xs lg:text-sm text-green-600 dark:text-green-400 font-medium">{stats.primary.trend}</span>
          </div>
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.primary.value}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{stats.primary.label}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-green-600 dark:text-green-400" />
            <span className="text-xs lg:text-sm text-green-600 dark:text-green-400 font-medium">{stats.secondary.trend}</span>
          </div>
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.secondary.value}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{stats.secondary.label}</p>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-6 h-6 lg:w-8 lg:h-8 text-[#983F21] dark:text-orange-400" />
            <span className="text-xs lg:text-sm text-red-600 dark:text-red-400 font-medium">{stats.tertiary.trend}</span>
          </div>
          <h3 className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.tertiary.value}</h3>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">{stats.tertiary.label}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Portfolio</h1>
        <button
          onClick={() => setShowAmounts(!showAmounts)}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 self-start sm:self-auto"
        >
          {showAmounts ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          <span>{showAmounts ? 'Hide Amounts' : 'Show Amounts'}</span>
        </button>
      </div>

      {/* Access Information for Initiators */}
      {!canTransferPortfolio() && canInitiate() && (
        <div className="bg-[#983F21] bg-opacity-10 border border-[#983F21] border-opacity-30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <Send className="w-5 h-5 text-[#983F21]" />
            <div>
              <h3 className="text-sm font-medium text-[#983F21]">Transfer Request System</h3>
              <p className="text-sm text-[#983F21] opacity-90">You can initiate portfolio transfer requests. Use the Transfer button to send requests to Super Admin for approval.</p>
            </div>
          </div>
        </div>
      )}

      {/* No Access Notice for Non-Initiators */}
      {!canTransferPortfolio() && !canInitiate() && (
        <div className="bg-[#983F21] bg-opacity-10 border border-[#983F21] border-opacity-30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#983F21]" />
            <div>
              <h3 className="text-sm font-medium text-[#983F21]">View Only Access</h3>
              <p className="text-sm text-[#983F21] opacity-90">Portfolio transfers are restricted to authorized personnel only. You can view portfolio data but cannot initiate transfers.</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Transfers Section */}
      {canApprove() && pendingTransfers.filter(t => t.status === 'pending').length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pending Transfer Approvals</h3>
          <div className="space-y-3">
            {pendingTransfers.filter(t => t.status === 'pending').map(transfer => (
              <div key={transfer.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg gap-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    KES {transfer.amount?.toLocaleString()} from {transfer.fromPortfolio} to {transfer.toPortfolio}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Initiated by: {transfer.initiatedBy}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApproveTransfer(transfer.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors duration-200"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectTransfer(transfer.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 lg:px-6 py-4 gap-4">
            <nav className="flex space-x-2 lg:space-x-8 overflow-x-auto pb-2 lg:pb-0">
              {portfolioTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-xs lg:text-sm transition-colors duration-200 whitespace-nowrap flex items-center space-x-1 lg:space-x-2 ${
                      activeTab === tab.id
                        ? 'border-[#2d8e41] text-[#2d8e41]'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}</span>
                  </button>
                );
              })}
            </nav>

            {/* Transfer Dropdown - Available for both Super Admin and Initiators */}
            {(canTransferPortfolio() || canInitiate()) && (
              <div className="relative">
                <button
                  onClick={() => setTransferDropdownOpen(!transferDropdownOpen)}
                  className={`${canTransferPortfolio() ? 'bg-[#983F21] hover:bg-[#7a3219]' : 'bg-[#983F21] hover:bg-[#7a3219]'} text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 w-full sm:w-auto justify-center`}
                >
                  {canTransferPortfolio() ? <ArrowUpRight className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>{canTransferPortfolio() ? 'Transfer' : 'Request Transfer'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {transferDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        {canTransferPortfolio() ? 'Transfer to:' : 'Request transfer to:'}
                      </div>
                      {portfolioTabs.filter(tab => tab.id !== activeTab).map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => handleTransfer(tab.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <tab.icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Portfolio Stats */}
          {renderPortfolioStats()}

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Min Amount (KES)"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portfolio Transactions Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tx Code</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">To</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fees</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {transaction.txCode}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {transaction.from}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {transaction.to}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {showAmounts ? `KES ${transaction.amount.toLocaleString()}` : '****'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {showAmounts ? `KES ${transaction.fees}` : '****'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(transaction.time).toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDownload(transaction.id)}
                          className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                          title="Download Transaction Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No transactions found for this portfolio</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transfer Modal - Available for both Super Admin and Initiators */}
      {(canTransferPortfolio() || canInitiate()) && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title={`${canTransferPortfolio() ? 'Transfer' : 'Request Transfer'} from ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Portfolio`}
        >
          <TransferForm 
            fromPortfolio={activeTab}
            toPortfolio={targetPortfolio}
            onSubmit={handleTransferSubmit}
            onClose={() => setIsTransferModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Portfolio;