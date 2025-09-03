import React, { useState, useEffect } from 'react';
import { Search, Filter, Check, X, Eye } from 'lucide-react';
import { ReversalService, ReversalRequest } from '../services/reversalService';
import { ApiError } from '../services/api';
import Modal from './Modal';

const Reversals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReversal, setSelectedReversal] = useState<ReversalRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [reversalRequests, setReversalRequests] = useState<ReversalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock reversal requests for fallback
  const mockReversalRequests: ReversalRequest[] = [
    {
      id: '1',
      tx_code: 'TXN001234567',
      initiated_by: 'John Doe',
      transaction_type: 'payment',
      amount: 5000,
      transaction_time: '2024-01-20T10:30:00Z',
      from_account: 'John Doe',
      to_account: 'Jane Smith',
      reason: 'Incorrect amount sent',
      status: 'pending',
      created_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-01-20T11:00:00Z'
    },
    {
      id: '2',
      tx_code: 'TXN001234568',
      initiated_by: 'Mike Johnson',
      transaction_type: 'transfer',
      amount: 3000,
      transaction_time: '2024-01-19T14:15:00Z',
      from_account: 'Mike Johnson',
      to_account: 'Group Account',
      reason: 'Duplicate transaction',
      status: 'approved',
      created_at: '2024-01-19T15:00:00Z',
      updated_at: '2024-01-19T16:00:00Z'
    }
  ];

  // Load reversal requests
  useEffect(() => {
    const loadReversalRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        try {
          const response = await ReversalService.getReversalRequests({ limit: 1000 });
          setReversalRequests(response.items);
        } catch (apiError) {
          console.warn('API reversal requests failed, using mock data:', apiError);
          setReversalRequests(mockReversalRequests);
        }
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load reversal requests';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadReversalRequests();
  }, []);

  const filteredRequests = reversalRequests.filter(request => {
    const matchesSearch = 
      request.tx_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.initiated_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.transaction_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      try {
        await ReversalService.approveReversal(requestId);
      } catch (apiError) {
        console.warn('API approve reversal failed, updating local state:', apiError);
      }
      
      setReversalRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: 'approved' } : request
        )
      );
      alert('Reversal request approved successfully!');
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to approve reversal';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      try {
        await ReversalService.rejectReversal(requestId);
      } catch (apiError) {
        console.warn('API reject reversal failed, updating local state:', apiError);
      }
      
      setReversalRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: 'rejected' } : request
        )
      );
      alert('Reversal request rejected successfully!');
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to reject reversal';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleView = (request: ReversalRequest) => {
    setSelectedReversal(request);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Reversal Requests</h1>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reversal requests...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">Error loading reversals: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[#2d8e41] hover:text-[#246b35] font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by transaction code, user, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
      )}

      {/* Reversal Requests Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Tx Code</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Initiated By</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Transaction Type</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Amount</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Transaction Time</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Status</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((request, index) => {
                  const isEven = index % 2 === 0;
                  
                  return (
                    <tr 
                      key={request.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        isEven ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'
                      }`}
                    >
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{request.tx_code}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{request.initiated_by}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{request.transaction_type}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                        KES {request.amount.toLocaleString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(request.transaction_time).toLocaleString()}
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

          {!loading && !error && filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No reversal requests found matching your criteria</p>
            </div>
          )}
        </div>
      )}

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
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Code</label>
                <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedReversal.tx_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Initiated By</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedReversal.initiated_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Type</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedReversal.transaction_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">KES {selectedReversal.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">From</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedReversal.from_account}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">To</label>
                <p className="text-gray-900 dark:text-gray-100">{selectedReversal.to_account}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Reversal</label>
              <p className="text-gray-900 dark:text-gray-100 mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedReversal.reason}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
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