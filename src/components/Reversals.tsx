import React, { useState } from 'react';
import { Search, Filter, Check, X, Eye } from 'lucide-react';
import Modal from './Modal';

interface ReversalRequest {
  id: string;
  txCode: string;
  initiatedBy: string;
  transactionType: string;
  amount: number;
  transactionTime: string;
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

const Reversals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReversal, setSelectedReversal] = useState<ReversalRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock reversal requests data
  const reversalRequests: ReversalRequest[] = [
    {
      id: '1',
      txCode: 'TX001234567',
      initiatedBy: 'John Doe',
      transactionType: 'Loan Disbursement',
      amount: 15000,
      transactionTime: '2024-01-20T10:30:00Z',
      from: 'Nairobi Farmers Group',
      to: 'John Doe',
      status: 'pending',
      reason: 'Incorrect amount disbursed'
    },
    {
      id: '2',
      txCode: 'TX001234568',
      initiatedBy: 'Jane Smith',
      transactionType: 'Deposit',
      amount: 5000,
      transactionTime: '2024-01-19T14:15:00Z',
      from: 'Jane Smith',
      to: 'Nairobi Farmers Group',
      status: 'approved',
      reason: 'Duplicate transaction'
    },
    {
      id: '3',
      txCode: 'TX001234569',
      initiatedBy: 'Mike Johnson',
      transactionType: 'Withdrawal',
      amount: 3000,
      transactionTime: '2024-01-18T09:45:00Z',
      from: 'Mombasa Collective',
      to: 'Mike Johnson',
      status: 'rejected',
      reason: 'Insufficient documentation'
    }
  ];

  const filteredRequests = reversalRequests.filter(request => {
    const matchesSearch = 
      request.txCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.initiatedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.transactionType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = (requestId: string) => {
    console.log(`Approving reversal request ${requestId}`);
    // In real app, this would make an API call
  };

  const handleReject = (requestId: string) => {
    console.log(`Rejecting reversal request ${requestId}`);
    // In real app, this would make an API call
  };

  const handleView = (request: ReversalRequest) => {
    setSelectedReversal(request);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Reversal Requests</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction code, user, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reversal Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Tx Code</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Initiated By</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Transaction Type</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Amount</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Transaction Time</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={request.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      isEven ? 'bg-white' : 'bg-[#f9fafb]'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{request.txCode}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{request.initiatedBy}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{request.transactionType}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900">
                      KES {request.amount.toLocaleString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      {new Date(request.transactionTime).toLocaleString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleView(request)}
                          className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reversal requests found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Reversal Request Details"
      >
        {selectedReversal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Transaction Code</label>
                <p className="text-gray-900 font-medium">{selectedReversal.txCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Initiated By</label>
                <p className="text-gray-900">{selectedReversal.initiatedBy}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Transaction Type</label>
                <p className="text-gray-900">{selectedReversal.transactionType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Amount</label>
                <p className="text-gray-900 font-semibold">KES {selectedReversal.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">From</label>
                <p className="text-gray-900">{selectedReversal.from}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">To</label>
                <p className="text-gray-900">{selectedReversal.to}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Reason for Reversal</label>
              <p className="text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedReversal.reason}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${getStatusColor(selectedReversal.status)}`}>
                {selectedReversal.status.charAt(0).toUpperCase() + selectedReversal.status.slice(1)}
              </span>
            </div>

            {selectedReversal.status === 'pending' && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    handleReject(selectedReversal.id);
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedReversal.id);
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reversals;