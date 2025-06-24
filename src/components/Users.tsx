import React, { useState } from 'react';
import { Plus, Search, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import UserForm from './UserForm';
import UserDetailView from './UserDetailView';

const Users: React.FC = () => {
  const { users, groups } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createdAtFilter, setCreatedAtFilter] = useState('all');
  const [loanLimitFilter, setLoanLimitFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCreatedAt = createdAtFilter === 'all' || 
      (createdAtFilter === 'today' && new Date(user.createdAt).toDateString() === new Date().toDateString()) ||
      (createdAtFilter === 'week' && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (createdAtFilter === 'month' && new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    const matchesLoanLimit = !loanLimitFilter || user.balance >= parseFloat(loanLimitFilter);
    
    return matchesSearch && matchesCreatedAt && matchesLoanLimit;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'No Group';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
  };

  const splitName = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  if (selectedUserId) {
    return (
      <UserDetailView 
        userId={selectedUserId} 
        onBack={handleBackToUsers}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Add User Button */}
      <div className="flex justify-end mb-4">
  <button
    onClick={() => setIsModalOpen(true)}
    className="bg-[#2d8e41] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium"
  >
    <Plus className="w-5 h-5" />
    <span>Add User</span>
  </button>
</div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>

          {/* Created At Filter */}
          <div>
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={createdAtFilter}
                onChange={(e) => setCreatedAtFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Loan Limit Filter */}
          <div>
            <input
              type="number"
              placeholder="Min Balance (KES)"
              value={loanLimitFilter}
              onChange={(e) => setLoanLimitFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">First Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Last Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Phone Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Loan Limit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user, index) => {
                const { firstName, lastName } = splitName(user.name);
                const rowNumber = startIndex + index + 1;
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      isEven ? 'bg-white' : 'bg-[#f9fafb]'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{rowNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{firstName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">KES {user.balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        disabled={isLoading}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200 disabled:opacity-50"
                        title="View User"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === page
                        ? 'bg-[#2d8e41] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading user details...</p>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <UserForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Users;