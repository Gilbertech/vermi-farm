import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface UpdateLoanLimitFormProps {
  group: any;
  onClose: () => void;
}

const UpdateLoanLimitForm: React.FC<UpdateLoanLimitFormProps> = ({ group, onClose }) => {
  const { updateGroupLoanLimit } = useApp();
  const [loanLimit, setLoanLimit] = useState(group.loanLimit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateGroupLoanLimit(group.id, loanLimit);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loan Limit (KES)
        </label>
        <input
          type="number"
          value={loanLimit}
          onChange={(e) => setLoanLimit(parseFloat(e.target.value) || 0)}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update'
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateLoanLimitForm;