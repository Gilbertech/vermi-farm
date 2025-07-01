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
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePaymentAction = (type: 'paybill' | 'single' | 'buygoods' | 'bulk') => {
    if (!canMakePayment()) {
      // Send notification to super admin
      if (currentUser) {
        addNotification({
          type: 'payment_initiated',
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} payment request initiated`,
          initiatorName: currentUser.name,
          amount: 0, // Will be filled when form is submitted
          actionType: 'payment',
          details: { type }
        });
        alert('Payment request sent to Super Admin for approval');
      }
      setDropdownOpen(false);
      return;
    }
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
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 text-center">Payments</h1>

      {/* Access Restriction Notice for Initiators */}
      {!canMakePayment() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 lg:p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
              <p className="text-sm text-yellow-700">Payment processing requires Super Admin approval. Click payment options to send requests.</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#2d8e41] rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-800">Main Wallet Balance</h3>
              <p className="text-xl lg:text-2xl font-bold text-gray-800">KES {walletBalance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={copyBalance}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
            className="bg-[#2d8e41] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium"
          >
            <span>Make Payment</span>
            <ChevronDown className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handlePaymentAction('single')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2d8e41] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Single Payment</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('paybill')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2d8e41] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Paybill</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('buygoods')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2d8e41] hover:text-white flex items-center space-x-2 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Buy Goods</span>
                </button>
                <button
                  onClick={() => handlePaymentAction('bulk')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#2d8e41] hover:text-white flex items-center space-x-2 transition-colors duration-200"
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
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('normal')}
            className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'normal'
                ? 'bg-[#2d8e41] text-white'
                : 'bg-transparent text-[#2d8e41] hover:bg-gray-200'
            }`}
          >
            Normal Payments
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
              activeTab === 'b2b'
                ? 'bg-[#2d8e41] text-white'
                : 'bg-transparent text-[#2d8e41] hover:bg-gray-200'
            }`}
          >
            B2B Payments
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              />
            </div>
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
          
          <div>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'normal' ? (
                  <>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TXCODE</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient MSISDN</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initiator</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paybill</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mpesa Receipt</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment, index) => (
                <tr key={payment.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}`}>
                  {activeTab === 'normal' ? (
                    <>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.txCode}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).recipientName}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).recipientMSISDN}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        KES {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {payment.cost}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.time).toLocaleString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).initiator}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).paybill}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).account}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        KES {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        KES {payment.cost}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).mpesaReceipt}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(payment as any).description}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor((payment as any).status)}`}>
                          {(payment as any).status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            <p className="text-gray-500">No payments found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Payment Forms Modals */}
      <Modal
        isOpen={modalType === 'paybill'}
        onClose={() => setModalType(null)}
        title="Paybill Payment"
      >
        <PaybillForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'single'}
        onClose={() => setModalType(null)}
        title="Single Payment"
      >
        <SinglePaymentForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'buygoods'}
        onClose={() => setModalType(null)}
        title="Buy Goods Payment"
      >
        <BuyGoodsForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'bulk'}
        onClose={() => setModalType(null)}
        title="Bulk Payments"
      >
        <BulkPaymentsForm onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
};

export default Payments;