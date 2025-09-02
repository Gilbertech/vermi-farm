import React, { useState } from 'react';
import { Plus, Search, Eye, EyeOff, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import UserForm from './UserForm';
import UserDetailView from './UserDetailView';

const Users: React.FC = () => {
  const { users,  } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createdAtFilter, setCreatedAtFilter] = useState('all');
  const [loanLimitFilter, setLoanLimitFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  
  const itemsPerPage = 10;

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
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
      {/* Header with Add User Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Users</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            {showSensitiveData ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            <span>{showSensitiveData ? 'Hide Data' : 'Show Data'}</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2d8e41] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Created At Filter */}
          <div>
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                value={createdAtFilter}
                onChange={(e) => setCreatedAtFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">No.</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">First Name</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Last Name</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Phone Number</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Loan Limit</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedUsers.map((user, index) => {
                const { firstName, lastName } = splitName(user.name);
                const rowNumber = startIndex + index + 1;
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      isEven ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{rowNumber}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{firstName}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{lastName}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {showSensitiveData ? user.phone : '****'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {showSensitiveData ? `KES ${user.balance.toLocaleString()}` : '****'}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        disabled={isLoading}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200 disabled:opacity-50"
                        title="View User Details"
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
          <div className="px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading user details...</p>
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