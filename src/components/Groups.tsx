import React, { useState } from 'react';
import { Plus, Search, Eye, MoreVertical, MapPin, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import GroupForm from './GroupForm';
import GroupDetailView from './GroupDetailView';

const Groups: React.FC = () => {
  const { groups, users } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.regNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Groups</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups by name, location, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent w-full transition-colors duration-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">No.</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Name</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Reg No</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Location</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Description</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGroups.map((group, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={group.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      isEven ? 'bg-white' : 'bg-[#f9fafb]'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 font-medium">{group.name}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{group.regNo || 'N/A'}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{group.location || 'Not specified'}</span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
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
            <p className="text-gray-500">No groups found matching your search criteria</p>
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