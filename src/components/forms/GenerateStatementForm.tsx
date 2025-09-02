import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatementService, GenerateStatementRequest } from '../../services/statementService';
import { ApiError } from '../../services/api';

interface GenerateStatementFormProps {
  onClose: () => void;
}

const GenerateStatementForm: React.FC<GenerateStatementFormProps> = ({ onClose }) => {
  const { users, groups } = useApp();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    userId: '',
    groupId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const generateRequest: GenerateStatementRequest = {
        from_date: formData.from,
        to_date: formData.to,
        user_id: formData.userId || undefined,
        group_id: formData.groupId || undefined,
        format: 'pdf'
      };

      const statement = await StatementService.generateStatement(generateRequest);
      
      // Download the generated statement
      try {
        const blob = await StatementService.downloadStatement(statement.id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `statement-${statement.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (downloadErr) {
        console.warn('Download failed, statement generated but not downloaded:', downloadErr);
        alert('Statement generated successfully but download failed. Please check the statements list.');
      }
      
      alert('Statement generated successfully!');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to generate statement';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Date
          </label>
          <input
            type="date"
            name="from"
            value={formData.from}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To Date
          </label>
          <input
            type="date"
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          User (Optional)
        </label>
        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select a user (optional)</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Group (Optional)
        </label>
        <select
          name="groupId"
          value={formData.groupId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select a group (optional)</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating...
            </div>
          ) : (
            'Generate'
          )}
        </button>
      </div>
    </form>
  );
};

export default GenerateStatementForm;