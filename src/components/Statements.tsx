import React, { useState } from 'react';
import { Download, Search, Filter, Calendar, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import GenerateStatementForm from './forms/GenerateStatementForm';

const Statements: React.FC = () => {
  const { groups, users } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock statements data
  const statements = [
    {
      id: '1',
      from: '2024-01-01',
      to: '2024-01-31',
      groupId: '1',
      userId: '1',
      type: 'Monthly Statement',
      createdAt: '2024-02-01T00:00:00Z'
    },
    {
      id: '2',
      from: '2024-02-01',
      to: '2024-02-28',
      groupId: '1',
      userId: '2',
      type: 'Monthly Statement',
      createdAt: '2024-03-01T00:00:00Z'
    },
    {
      id: '3',
      from: '2024-01-01',
      to: '2024-01-31',
      groupId: '2',
      userId: '3',
      type: 'Monthly Statement',
      createdAt: '2024-02-01T00:00:00Z'
    }
  ];

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const filteredStatements = statements.filter(statement => {
    const matchesSearch = 
      getGroupName(statement.groupId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(statement.userId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'month' && new Date(statement.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  const handleDownload = (statementId: string) => {
    // Mock download functionality
    console.log(`Downloading statement ${statementId}`);
    // In real app, this would trigger a file download
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Available Statements</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Generate Statement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by group or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white"
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statements Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">From</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">To</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Group</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStatements.map((statement, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={statement.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      isEven ? 'bg-white' : 'bg-[#f9fafb]'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(statement.from).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(statement.to).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {getGroupName(statement.groupId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getUserName(statement.userId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {statement.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(statement.id)}
                        className="text-[#2d8e41] hover:text-[#246b35] transition-colors duration-200"
                        title="Download Statement"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStatements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No statements found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Generate Statement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Statement"
      >
        <GenerateStatementForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Statements;