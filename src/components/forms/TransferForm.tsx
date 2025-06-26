import React, { useState } from 'react';

interface TransferFormProps {
  fromPortfolio: string;
  toPortfolio: string;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ fromPortfolio, toPortfolio, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    reference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">From:</span>
            <p className="font-medium text-gray-800 capitalize">{fromPortfolio} Portfolio</p>
          </div>
          <div>
            <span className="text-gray-500">To:</span>
            <p className="font-medium text-gray-800 capitalize">{toPortfolio} Portfolio</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transfer Amount (KES)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          required
          min="1"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          placeholder="Enter amount to transfer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Number (Optional)
        </label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          placeholder="Enter reference number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          placeholder="Enter transfer description"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
              Processing...
            </div>
          ) : (
            'Submit Transfer'
          )}
        </button>
      </div>
    </form>
  );
};

export default TransferForm;