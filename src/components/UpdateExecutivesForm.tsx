import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface UpdateExecutivesFormProps {
  group: any;
  members: any[];
  onClose: () => void;
}

const UpdateExecutivesForm: React.FC<UpdateExecutivesFormProps> = ({ group, members, onClose }) => {
  const { updateGroupExecutives } = useApp();
  const [formData, setFormData] = useState({
    secretary: members.find(m => m.role === 'secretary')?.id || '',
    chairperson: members.find(m => m.role === 'chairperson')?.id || '',
    treasurer: members.find(m => m.role === 'treasurer')?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateRoleAssignments = () => {
    const errors: string[] = [];
    const selectedRoles = Object.values(formData).filter(id => id !== '');
    const uniqueRoles = new Set(selectedRoles);

    // Check for duplicate assignments
    if (selectedRoles.length !== uniqueRoles.size) {
      errors.push('Each member can only hold one executive role');
    }

    // Check if same person is assigned multiple roles
    const roleAssignments = Object.entries(formData);
    for (let i = 0; i < roleAssignments.length; i++) {
      for (let j = i + 1; j < roleAssignments.length; j++) {
        if (roleAssignments[i][1] && roleAssignments[j][1] && roleAssignments[i][1] === roleAssignments[j][1]) {
          const member = members.find(m => m.id === roleAssignments[i][1]);
          errors.push(`${member?.name} cannot be assigned to multiple roles`);
          break;
        }
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role assignments
    const errors = validateRoleAssignments();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateGroupExecutives(group.id, formData);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      setValidationErrors(['Failed to update executives. Please try again.']);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const getAvailableMembers = (currentRole: string) => {
    // Get members who are not assigned to other roles (except current role)
    const assignedMembers = Object.entries(formData)
      .filter(([role, memberId]) => role !== currentRole && memberId !== '')
      .map(([, memberId]) => memberId);
    
    return members.filter(member => !assignedMembers.includes(member.id));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'secretary':
        return 'text-blue-600 dark:text-blue-400';
      case 'chairperson':
        return 'text-red-600 dark:text-red-400';
      case 'treasurer':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Validation Errors</h4>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">Executive Role Rules</h4>
            <ul className="mt-2 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
              <li>Each member can only hold one executive role</li>
              <li>There can only be one Secretary, one Chairperson, and one Treasurer</li>
              <li>Roles can be left unassigned if no suitable member is available</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Secretary Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span className={getRoleColor('secretary')}>Secretary</span>
        </label>
        <select
          name="secretary"
          value={formData.secretary}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select Secretary (Optional)</option>
          {getAvailableMembers('secretary').map(member => (
            <option key={member.id} value={member.id}>
              {member.name} {member.role === 'secretary' ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Chairperson Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span className={getRoleColor('chairperson')}>Chairperson</span>
        </label>
        <select
          name="chairperson"
          value={formData.chairperson}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select Chairperson (Optional)</option>
          {getAvailableMembers('chairperson').map(member => (
            <option key={member.id} value={member.id}>
              {member.name} {member.role === 'chairperson' ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Treasurer Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span className={getRoleColor('treasurer')}>Treasurer</span>
        </label>
        <select
          name="treasurer"
          value={formData.treasurer}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select Treasurer (Optional)</option>
          {getAvailableMembers('treasurer').map(member => (
            <option key={member.id} value={member.id}>
              {member.name} {member.role === 'treasurer' ? '(Current)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Current Assignments Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Current Assignments Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Secretary:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formData.secretary ? members.find(m => m.id === formData.secretary)?.name : 'Not assigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-600 dark:text-red-400">Chairperson:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formData.chairperson ? members.find(m => m.id === formData.chairperson)?.name : 'Not assigned'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600 dark:text-orange-400">Treasurer:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formData.treasurer ? members.find(m => m.id === formData.treasurer)?.name : 'Not assigned'}
            </span>
          </div>
        </div>
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
          disabled={isSubmitting || validationErrors.length > 0}
          className="flex-1 px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Updating...
            </div>
          ) : (
            'Update Executives'
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateExecutivesForm;