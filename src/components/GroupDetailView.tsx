import React, { useState } from 'react';
import { ArrowLeft, MapPin, Users, DollarSign, MoreVertical, ArrowRight, Edit,  TrendingUp, Percent,  } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import EditGroupForm from './EditGroupForm';
import UpdateExecutivesForm from './UpdateExecutivesForm';
import UpdateLoanLimitForm from './UpdateLoanLimitForm';
import UpdateInterestLimitForm from './UpdateInterestLimitForm';

interface GroupDetailViewProps {
  groupId: string;
  onBack: () => void;
}

const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, onBack }) => {
  const { groups, users, transactions } = useApp();
  const [activeTab, setActiveTab] = useState<'executives' | 'finances' | 'transactions'>('executives');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalType, setModalType] = useState<'edit' | 'executives' | 'loan-limit' | 'interest-limit' | null>(null);

  const group = groups.find(g => g.id === groupId);
  const groupMembers = users.filter(user => user.groupId === groupId);
  const groupTransactions = transactions.filter(t => t.groupId === groupId);

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Group not found</p>
        <button onClick={onBack} className="mt-4 text-[#2d8e41] hover:text-[#246b35]">
          Back to Village Banks
        </button>
      </div>
    );
  }

  const getExecutive = (role: 'secretary' | 'chairperson' | 'treasurer') => {
    const executive = groupMembers.find(member => member.role === role);
    return executive ? executive.name : 'Not assigned';
  };

  const handleDropdownAction = (action: string) => {
    setDropdownOpen(false);
    switch (action) {
      case 'edit':
        setModalType('edit');
        break;
      case 'executives':
        setModalType('executives');
        break;
      case 'loan-limit':
        setModalType('loan-limit');
        break;
      case 'interest-limit':
        setModalType('interest-limit');
        break;
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
          <h1 className="text-xl lg:text-3xl font-bold text-gray-800">{group.name}</h1>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors duration-200"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => handleDropdownAction('edit')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Group</span>
                </button>
                <button
                  onClick={() => handleDropdownAction('executives')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Update Executives</span>
                </button>
                <button
                  onClick={() => handleDropdownAction('loan-limit')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Update Loan Limit</span>
                </button>
                <button
                  onClick={() => handleDropdownAction('interest-limit')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Percent className="w-4 h-4" />
                  <span>Update Interest Limit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold text-gray-800">{group.location || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Members</p>
              <p className="font-semibold text-gray-800">{groupMembers.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="font-semibold text-gray-800">KES {group.totalBalance.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium text-gray-800">{group.description}</p>
            </div>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="text-[#2d8e41] hover:text-[#246b35] flex items-center space-x-1 text-sm font-medium"
            >
              <span>View Transactions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 lg:space-x-8 px-4 lg:px-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('executives')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'executives'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Executives
            </button>
            <button
              onClick={() => setActiveTab('finances')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'finances'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Finances
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-medium text-sm lg:text-base transition-colors duration-200 whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'border-[#2d8e41] text-[#2d8e41]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        <div className="p-4 lg:p-6">
          {activeTab === 'executives' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Secretary</h4>
                <p className="text-gray-600">{getExecutive('secretary')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Chairperson</h4>
                <p className="text-gray-600">{getExecutive('chairperson')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Treasurer</h4>
                <p className="text-gray-600">{getExecutive('treasurer')}</p>
              </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Loan Limit</h4>
                <p className="text-2xl font-bold text-blue-600">KES {group.loanLimit.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Interest Rate</h4>
                <p className="text-2xl font-bold text-green-600">{group.interestRate || 5}%</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Active Loans</h4>
                <p className="text-2xl font-bold text-purple-600">{group.activeLoans || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Total Disbursed</h4>
                <p className="text-2xl font-bold text-orange-600">KES {group.totalDisbursed?.toLocaleString() || '0'}</p>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {groupTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupTransactions.map((transaction, index) => (
                        <tr key={transaction.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'deposit' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'withdrawal' ? 'bg-red-100 text-red-800' :
                              transaction.type === 'loan' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            KES {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No transactions found for this group</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Group Members Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Group Members</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member No</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupMembers.map((member, index) => (
                <tr key={member.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'}`}>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'chairperson' ? 'bg-red-100 text-red-800' :
                      member.role === 'secretary' ? 'bg-blue-100 text-blue-800' :
                      member.role === 'treasurer' ? 'bg-[#983F21] bg-opacity-10 text-[#983F21]' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {member.role || 'Member'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalType === 'edit'}
        onClose={() => setModalType(null)}
        title="Edit Group"
      >
        <EditGroupForm group={group} onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'executives'}
        onClose={() => setModalType(null)}
        title="Update Executives"
      >
        <UpdateExecutivesForm group={group} members={groupMembers} onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'loan-limit'}
        onClose={() => setModalType(null)}
        title="Update Loan Limit"
      >
        <UpdateLoanLimitForm group={group} onClose={() => setModalType(null)} />
      </Modal>

      <Modal
        isOpen={modalType === 'interest-limit'}
        onClose={() => setModalType(null)}
        title="Update Interest Limit"
      >
        <UpdateInterestLimitForm group={group} onClose={() => setModalType(null)} />
      </Modal>
    </div>
  );
};

export default GroupDetailView;