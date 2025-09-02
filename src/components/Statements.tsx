import React, { useState } from 'react';
import { Download, Search, Calendar, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatementService, Statement, GenerateStatementRequest } from '../services/statementService';
import { ApiError } from '../services/api';
import { generateStatement } from '../utils/statementGenerator';
import Modal from './Modal';
import GenerateStatementForm from './forms/GenerateStatementForm';

const Statements: React.FC = () => {
  const { groups, users, transactions, loading: appLoading, error: appError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load statements data
  React.useEffect(() => {
    const loadStatements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await StatementService.getStatements({ limit: 1000 });
        setStatements(response.items);
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : 'Failed to load statements';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadStatements();
  }, []);

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
      (statement.group_id && getGroupName(statement.group_id).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (statement.user_id && getUserName(statement.user_id).toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'month' && new Date(statement.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDate;
  });

  const handleDownload = async (statement: any) => {
    try {
      // Try to download from API first
      const blob = await StatementService.downloadStatement(statement.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `statement-${statement.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback to local generation
      console.warn('API download failed, generating locally:', err);
      
      const user = users.find(u => u.id === statement.user_id);
      const group = groups.find(g => g.id === statement.group_id);
    
      // Get transactions for the period
      const statementTransactions = transactions
        .filter(t => {
          const transactionDate = new Date(t.createdAt);
          const fromDate = new Date(statement.from_date);
          const toDate = new Date(statement.to_date);
          return transactionDate >= fromDate && transactionDate <= toDate;
        })
        .map((t, index) => ({
          id: t.id,
          date: t.createdAt,
          type: t.type,
          description: t.description,
          amount: t.amount,
          balance: 5000 + (index * 1000), // Mock running balance
          status: t.status
        }));

      const statementData = {
        fromDate: statement.from_date,
        toDate: statement.to_date,
        userName: user?.name,
        groupName: group?.name,
        transactions: statementTransactions
      };

      await generateStatement(statementData);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Available Statements</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2d8e41] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-[#246b35] transition-colors duration-200 font-medium self-start sm:self-auto"
        >
          <Plus className="w-4 lg:w-5 h-4 lg:h-5" />
          <span>Generate Statement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by group or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">No.</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">From</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">To</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Group</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">User</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Type</th>
                <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStatements.map((statement, index) => {
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={statement.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      isEven ? 'bg-white dark:bg-gray-800' : 'bg-[#f9fafb] dark:bg-gray-750'
                    }`}
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(statement.from_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(statement.to_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {getGroupName(statement.group_id)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {getUserName(statement.user_id)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {statement.type}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <button
                        onClick={() => handleDownload(statement)}
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
            <p className="text-gray-500 dark:text-gray-400">No statements found matching your criteria</p>
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