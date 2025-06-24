import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { PortfolioType } from '../App';

interface TransferModalProps {
  fromPortfolio: PortfolioType;
  toPortfolio?: PortfolioType;
  onClose: () => void;
}

const portfolioLabels: Record<PortfolioType, string> = {
  loan: 'Loan Portfolio',
  revenue: 'Revenue Portfolio',
  investment: 'Investment Portfolio',
  expense: 'Expense Portfolio',
  working: 'Working Account Portfolio',
  b2b: 'B2B Holding Portfolio',
  savings: 'Savings Portfolio'
};

const portfolioOptions: { value: PortfolioType; label: string }[] = [
  { value: 'loan', label: 'Loan Portfolio' },
  { value: 'revenue', label: 'Revenue Portfolio' },
  { value: 'investment', label: 'Investment Portfolio' },
  { value: 'expense', label: 'Expense Portfolio' },
  { value: 'working', label: 'Working Account Portfolio' },
  { value: 'b2b', label: 'B2B Holding Portfolio' },
  { value: 'savings', label: 'Savings Portfolio' }
];

export const TransferModal: React.FC<TransferModalProps> = ({ fromPortfolio, toPortfolio, onClose }) => {
  const [selectedToPortfolio, setSelectedToPortfolio] = useState<PortfolioType | ''>(toPortfolio || '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle transfer logic here
    console.log('Transfer:', {
      from: fromPortfolio,
      to: selectedToPortfolio,
      amount,
      reference,
      description
    });
    onClose();
  };

  const availablePortfolios = portfolioOptions.filter(option => option.value !== fromPortfolio);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Transfer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Transfer Direction */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium text-gray-900">{portfolioLabels[fromPortfolio]}</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-green-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">To</p>
                  <p className="font-medium text-gray-900">
                    {selectedToPortfolio ? portfolioLabels[selectedToPortfolio] : 'Select Portfolio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <p className="text-amber-800 text-sm">
                Please ensure you have sufficient balance and correct portfolio selection before proceeding.
              </p>
            </div>

            {/* To Portfolio Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer To Portfolio
              </label>
              <select
                value={selectedToPortfolio}
                onChange={(e) => setSelectedToPortfolio(e.target.value as PortfolioType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select destination portfolio</option>
                {availablePortfolios.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter reference number"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter transfer description"
                required
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Portfolio;