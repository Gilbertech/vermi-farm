import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface LoanFormProps {
  onClose: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onClose }) => {
  const { addLoan, users, groups } = useApp();
  const { canDisburseLoan, addNotification, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    groupId: '',
    amount: 0,
    interestRate: 5,
    dueDate: '',
    purpose: '',
    loanType: 'group' as 'group' | 'individual'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (canDisburseLoan()) {
      // Super admin can directly disburse loans
      addLoan({
        ...formData,
        repaidAmount: 0,
        status: 'active',
        type: formData.loanType
      });
      alert(`✅ Loan of KES ${formData.amount.toLocaleString()} disbursed successfully!`);
    } else {
      // Initiators send notification to super admin
      if (currentUser) {
        const borrower = users.find(u => u.id === formData.userId);
        const group = groups.find(g => g.id === formData.groupId);
        
        addNotification({
          type: 'loan_initiated',
          message: `Loan disbursement of KES ${formData.amount.toLocaleString()} requested`,
          initiatorName: currentUser.name,
          amount: formData.amount,
          actionType: 'loan',
          details: {
            borrowerName: borrower?.name,
            groupName: group?.name,
            loanType: formData.loanType,
            interestRate: formData.interestRate,
            dueDate: formData.dueDate,
            purpose: formData.purpose
          }
        });
        
        alert(`📤 Loan request sent to Super Admin for approval!\n\nAmount: KES ${formData.amount.toLocaleString()}\nBorrower: ${borrower?.name}\nGroup: ${group?.name}\nPurpose: ${formData.purpose}`);
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'interestRate' ? parseFloat(value) || 0 : value
    }));
  };

  const filteredUsers = users.filter(user => user.groupId === formData.groupId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loan Type
        </label>
        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="group">Group Loan</option>
          <option value="individual">Individual Loan</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Group
        </label>
        <select
          name="groupId"
          value={formData.groupId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select a group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Borrower
        </label>
        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required
          disabled={!formData.groupId}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select a borrower</option>
          {filteredUsers.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loan Amount (KES)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="1"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Interest Rate (%)
        </label>
        <input
          type="number"
          name="interestRate"
          value={formData.interestRate}
          onChange={handleChange}
          required
          min="0"
          max="100"
          step="0.1"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Purpose of Loan
        </label>
        <textarea
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Describe the purpose of this loan..."
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
          className="flex-1 px-4 py-2 bg-[#983F21] text-white rounded-lg hover:bg-[#7a3219] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {canDisburseLoan() ? 'Disbursing...' : 'Sending Request...'}
            </div>
          ) : (
            canDisburseLoan() ? 'Disburse Loan' : 'Send Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default LoanForm;