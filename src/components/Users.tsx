import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, EyeOff, Filter, ChevronLeft, ChevronRight, Download, Upload, RefreshCw } from 'lucide-react';
import { UserService, User, UserFilters } from '../services/userService';
import { ApiError } from '../services/api';
import Modal from './Modal';
import UserForm from './UserForm';
import UserDetailView from './UserDetailView';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createdAtFilter, setCreatedAtFilter] = useState('all');
  const [loanLimitFilter, setLoanLimitFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 50,
    has_next: false,
    has_prev: false
  });
  
  const itemsPerPage = 50; // Increased from 10 to 50

  // Load users with enhanced pagination
  const loadUsers = async (page = 1, limit = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);

      const filters: UserFilters = {
        page,
        limit,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
        balance_min: loanLimitFilter ? parseFloat(loanLimitFilter) : undefined,
        created_from: createdAtFilter === 'today' ? new Date().toISOString().split('T')[0] : 
                     createdAtFilter === 'week' ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                     createdAtFilter === 'month' ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] :
                     undefined
      };

      try {
        const response = await UserService.getUsers(filters);
        setUsers(response.items);
        setPagination(response.pagination);
      } catch (apiError) {
        console.warn('API users failed, using mock data:', apiError);
        // Enhanced mock data for testing pagination
        const mockUsers: User[] = Array.from({ length: 150 }, (_, i) => ({
          id: `user_${i + 1}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          phone: `071234${String(i + 1).padStart(4, '0')}`,
          role: ['member', 'secretary', 'chairperson', 'treasurer'][i % 4] as any,
          group_id: `group_${Math.floor(i / 10) + 1}`,
          balance: Math.floor(Math.random() * 50000) + 5000,
          status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as any,
          created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }));

        // Apply filters to mock data
        let filteredMockUsers = mockUsers;
        
        if (searchTerm) {
          filteredMockUsers = filteredMockUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)
          );
        }
        
        if (roleFilter !== 'all') {
          filteredMockUsers = filteredMockUsers.filter(user => user.role === roleFilter);
        }
        
        if (statusFilter !== 'all') {
          filteredMockUsers = filteredMockUsers.filter(user => user.status === statusFilter);
        }
        
        if (loanLimitFilter) {
          filteredMockUsers = filteredMockUsers.filter(user => user.balance >= parseFloat(loanLimitFilter));
        }

        // Apply pagination to mock data
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredMockUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setPagination({
          current_page: page,
          total_pages: Math.ceil(filteredMockUsers.length / limit),
          total_items: filteredMockUsers.length,
          per_page: limit,
          has_next: endIndex < filteredMockUsers.length,
          has_prev: page > 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage, itemsPerPage);
  }, [currentPage, searchTerm, createdAtFilter, loanLimitFilter, roleFilter, statusFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBackToUsers = () => {
    setSelectedUserId(null);
  };

  const handleExportUsers = async () => {
    try {
      const filters: UserFilters = {
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
        balance_min: loanLimitFilter ? parseFloat(loanLimitFilter) : undefined
      };

      const blob = await UserService.exportUsers(filters, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadUsers(1, itemsPerPage);
  };

  const splitName = (fullName: string) => {
    const parts = fullName.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'chairperson':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'secretary':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'treasurer':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Users</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
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

      {/* Enhanced Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="secretary">Secretary</option>
              <option value="chairperson">Chairperson</option>
              <option value="treasurer">Treasurer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Balance Filter */}
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

        {/* Additional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

          {/* Items Per Page */}
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setCurrentPage(1);
                loadUsers(1, newLimit);
              }}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
              <option value="250">250 per page</option>
              <option value="500">500 per page</option>
              <option value="1000">1000 per page</option>
            </select>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total_items)} of {pagination.total_items.toLocaleString()} users
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d8e41] mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">Error loading users: {error}</p>
            <button 
              onClick={handleRefresh}
              className="text-[#2d8e41] hover:text-[#246b35] font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">No.</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">First Name</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Last Name</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Phone Number</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Role</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Status</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Balance</th>
                  <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user, index) => {
                  const { firstName, lastName } = splitName(user.name);
                  const rowNumber = ((currentPage - 1) * itemsPerPage) + index + 1;
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
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {showSensitiveData ? `KES ${user.balance.toLocaleString()}` : '****'}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          disabled={loading}
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
        )}

        {/* Enhanced Pagination */}
        {!loading && !error && pagination.total_pages > 1 && (
          <div className="px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total_items)} of {pagination.total_items.toLocaleString()} users
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              
              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_prev}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-[#2d8e41] text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* Last Page */}
              <button
                onClick={() => handlePageChange(pagination.total_pages)}
                disabled={currentPage === pagination.total_pages}
                className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No users found matching your criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
                setLoanLimitFilter('');
                setCreatedAtFilter('all');
                setCurrentPage(1);
              }}
              className="mt-2 text-[#2d8e41] hover:text-[#246b35] font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
      >
        <UserForm onClose={() => {
          setIsModalOpen(false);
          handleRefresh();
        }} />
      </Modal>
    </div>
  );
};

export default Users;