import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface SinglePaymentFormProps {
  onClose: () => void;
}

const SinglePaymentForm: React.FC<SinglePaymentFormProps> = ({ onClose }) => {
  const { users, groups } = useApp();
  const [userType, setUserType] = useState<'existing' | 'new'>('existing');
  const [formData, setFormData] = useState({
    purpose: '',
    amount: '',
    to: '',
    newUserName: '',
    newUserPhone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Combine users and groups for the dropdown
  const recipients = [
    ...users.map(user => ({ id: user.id, name: user.name, type: 'user' })),
    ...groups.map(group => ({ id: group.id, name: group.name, type: 'group' }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setUserType('existing')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
            userType === 'existing'
              ? 'bg-[#2d8e41] text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-200'
          }`}
        >
          To Existing User/Group
        </button>
        <button
          type="button"
          onClick={() => setUserType('new')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
            userType === 'new'
              ? 'bg-[#2d8e41] text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-200'
          }`}
        >
          To New User
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Purpose of Payment
        </label>
        <input
          type="text"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          placeholder="Enter payment purpose"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          placeholder="Enter amount"
        />
      </div>

      {userType === 'existing' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <select
            name="to"
            value={formData.to}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
          >
            <option value="">Select recipient</option>
            {recipients.map(recipient => (
              <option key={`${recipient.type}-${recipient.id}`} value={recipient.id}>
                {recipient.name} ({recipient.type})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="newUserName"
              value={formData.newUserName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              placeholder="Enter recipient name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="newUserPhone"
              value={formData.newUserPhone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
              placeholder="07xxxxxxxx or 01xxxxxxxx"
            />
          </div>
        </>
      )}

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
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
              Processing...
            </div>
          ) : (
            'Make Payment'
          )}
        </button>
      </div>
    </form>
  );
};

export default SinglePaymentForm;