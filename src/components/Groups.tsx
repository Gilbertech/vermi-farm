import React, { useState } from 'react';
import { Plus, Search, Eye, MapPin,  Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import GroupForm from './GroupForm';
import GroupDetailView from './GroupDetailView';

const Groups: React.FC = () => {
  const { groups,  } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [amountFilter, setAmountFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  const filteredGroups = groups.filter(group => {
    const matchesSearch = 
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAmount = !amountFilter || group.totalBalance >= parseFloat(amountFilter);
    
    const matchesTime = timeFilter === 'all' || 
      (timeFilter === 'today' && new Date(group.createdAt).toDateString() === new Date().toDateString()) ||
      (timeFilter === 'week' && new Date(group.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (timeFilter === 'month' && new Date(group.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesAmount && matchesTime;
  });

  const handleViewGroup = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
  };

  if (selectedGroup) {
    return (
      <GroupDetailView 
        groupId={selectedGroup} 
        onBack={handleBackToGroups}
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Village Banks Associations</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Filters */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search groups by name, location, or registration number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent w-full transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <input
                type="number"
                placeholder="Min Balance (KES)"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">No.</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Name</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Reg No</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Location</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Balance</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Description</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGroups.map((group, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={group.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      isEven ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{group.name}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{group.regNo || 'N/A'}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{group.location || 'Not specified'}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                      KES {group.totalBalance.toLocaleString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {group.description}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <button
                        onClick={() => handleViewGroup(group.id)}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                        title="View Group Details"
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

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No groups found matching your search criteria</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Group"
      >
        <GroupForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Groups;