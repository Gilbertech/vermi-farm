import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, Plus, Download, Search, Filter, Calendar, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import PaybillForm from './forms/PaybillForm';
import SinglePaymentForm from './forms/SinglePaymentForm';
import BuyGoodsForm from './forms/BuyGoodsForm';
import BulkPaymentsForm from './forms/BulkPaymentsForm';

const Payments: React.FC = () => {
  const { canMakePayment, addNotification, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'normal' | 'b2b'>('normal');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'paybill' | 'single' | 'buygoods' | 'bulk' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const walletBalance = 49.00;

  // Mock payment data
  const normalPayments = [
    {
      id: '1',
      txCode: 'TXN001234567',
      recipientName: 'John Doe',
      recipientMSISDN: '+254712345678',
      amount: 5000,
      cost: 25,
      time: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      txCode: 'TXN001234568',
      recipientName: 'Jane Smith',
      recipientMSISDN: '+254787654321',
      amount: 3500,
      cost: 20,
      time: '2024-01-20T14:15:00Z'
    }
  ];

  const b2bPayments = [
    {
      id: '1',
      initiator: 'Admin User',
      paybill: '4703932',
      account: 'VermiFarm001',
      amount: 15000,
      cost: 50,
      mpesaReceipt: 'QGH7K8L9M0',
      description: 'Equipment purchase',
      status: 'completed',
      time: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      initiator: 'Group Admin',
      paybill: '4703933',
      account: 'VermiFarm002',
      amount: 8500,
      cost: 35,
      mpesaReceipt: 'RTY5U6I7O8',
      description: 'Loan disbursement',
      status: 'pending',
      time: '2024-01-20T14:15:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handlePaymentAction = (type: 'paybill' | 'single' | 'buygoods' | 'bulk') => {
    setModalType(type);
    setDropdownOpen(false);
  };

  const copyBalance = () => {
    navigator.clipboard.writeText(walletBalance.toString());
  };

  const filteredPayments = (activeTab === 'normal' ? normalPayments : b2bPayments).filter(payment => {
    const matchesSearch = 
      payment.txCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).initiator?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || payment.amount >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(payment.time).toDateString() === new Date().toDateString());
    
    return matchesSearch && matchesAmount && matchesTime;
  });

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center">Payments</h1>

      {/* Access Restriction Notice for Initiators */}
      {!canMakePayment() && (
        <div className="bg-[#983F21] bg-opacity-10 border border-[#983F21] border-opacity-30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#983F21]" />
            <div>
              <h3 className="text-sm font-medium text-[#983F21]">Payment Request System</h3>
              <p className="text-sm text-[#983F21] opacity-90">You can submit payment requests with detailed information. Click payment options to send requests to Super Admin for approval.</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2d8e41] rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-200">Main Wallet Balance</h3>
              <p className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200">KES {walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={copyBalance}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            title="Copy Balance"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Make Payment Dropdown */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-[#983F21] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#7a3219] transition-colors duration-200 font-medium"
          >
            <span>{canMakePayment() ? 'Make Payment' : 'Request Payment'}</span>
            <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => handlePaymentAction('single')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#983F21] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Single Payment</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('paybill')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#983F21] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Paybill</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('buygoods')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#983F21] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Buy Goods</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('bulk')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#983F21] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Filter className="w-4 h-4" />
                  <span>Bulk Payments</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Type Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'normal'
                ? 'bg-[#983F21] text-white'
                : 'bg-transparent text-[#983F21] dark:text-orange-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Normal Payments
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'b2b'
                ? 'bg-[#983F21] text-white'
                : 'bg-transparent text-[#983F21] dark:text-orange-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            B2B Payments
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div>
            <input
              type="number"
              placeholder="Min Amount (KES)"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {activeTab === 'normal' ? (
                  <>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TXCODE</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient MSISDN</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Initiator</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paybill</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mpesa Receipt</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment, index) => (
                <tr key={payment.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'}`}>
                  {activeTab === 'normal' ? (
                    <>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {payment.txCode}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).recipientName}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).recipientMSISDN}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        KES {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        KES {payment.cost}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(payment.time).toLocaleString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).initiator}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).paybill}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).account}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                        KES {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        KES {payment.cost}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).mpesaReceipt}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {(payment as any).description}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor((payment as any).status)}`}>
                          {(payment as any).status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(payment.time).toLocaleString()}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No payments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Payment Forms Modals */}
      <Modal
        isOpen={modalType === 'paybill'}
        onClose={() => setModalType(null)}
        title={canMakePayment() ? "Paybill Payment" : "Request Paybill Payment"}
      >
        <PaybillForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'single'}
        onClose={() => setModalType(null)}
        title={canMakePayment() ? "Single Payment" : "Request Single Payment"}
      >
        <SinglePaymentForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'buygoods'}
        onClose={() => setModalType(null)}
        title={canMakePayment() ? "Buy Goods Payment" : "Request Buy Goods Payment"}
      >
        <BuyGoodsForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'bulk'}
        onClose={() => setModalType(null)}
        title={canMakePayment() ? "Bulk Payments" : "Request Bulk Payments"}
      >
        <BulkPaymentsForm onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
};

export default Payments;