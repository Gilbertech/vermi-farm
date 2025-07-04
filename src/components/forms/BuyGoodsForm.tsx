import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BuyGoodsFormProps {
  onClose: () => void;
}

const BuyGoodsForm: React.FC<BuyGoodsFormProps> = ({ onClose }) => {
  const { currentUser, addNotification, canMakePayment } = useAuth();
  const [formData, setFormData] = useState({
    businessNumber: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (canMakePayment()) {
      // Super admin can directly make payments
      alert(`✅ Buy goods payment of KES ${parseFloat(formData.amount).toLocaleString()} processed successfully!`);
    } else {
      // Initiators send notification to super admin
      if (currentUser) {
        addNotification({
          type: 'payment_initiated',
          message: `Buy goods payment of KES ${parseFloat(formData.amount).toLocaleString()} requested`,
          initiatorName: currentUser.name,
          amount: parseFloat(formData.amount),
          actionType: 'payment',
          details: {
            paymentType: 'buygoods',
            businessNumber: formData.businessNumber
          }
        });
        
        alert(`📤 Buy goods payment request sent to Super Admin for approval!\n\nAmount: KES ${parseFloat(formData.amount).toLocaleString()}\nBusiness: ${formData.businessNumber}`);
      }
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <p className="text-sm text-red-800 dark:text-red-300">Warning: Please enter correct business details.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Number
        </label>
        <input
          type="number"
          name="businessNumber"
          value={formData.businessNumber}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#983F21] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Enter business number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount (KES)
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
          placeholder="Enter amount"
        />
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
          className="flex-1 px-4 py-2 bg-[#983F21] text-white rounded-lg hover:bg-[#7a3219] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {canMakePayment() ? 'Processing...' : 'Sending Request...'}
            </div>
          ) : (
            canMakePayment() ? 'Make Payment' : 'Send Request'
          )}
        </button>
      </div>
    </form>
  );
};

export default BuyGoodsForm;