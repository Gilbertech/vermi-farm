import React, { useState } from 'react';
import { Sprout, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PasswordResetPage: React.FC = () => {
  const { resetPassword, setCurrentView } = useAuth();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await resetPassword(phone);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#2d8e41]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Instructions Sent</h1>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to your phone number <strong>{phone}</strong>. 
              Please check your messages and follow the instructions.
            </p>
            <button
              onClick={() => {
                setCurrentView('login');
                setIsSuccess(false);
                setPhone('');
              }}
              className="w-full bg-[#2d8e41] text-white py-3 rounded-lg font-medium hover:bg-[#246b35] transition-colors duration-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Title */}
          <img
              src="https://i.postimg.cc/MTpyCg68/logo.png"
              alt="Vermi-Farm Logo"
              className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-600 mt-2">Enter your phone number to receive reset instructions</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07xxxxxxxx or 01xxxxxxxx"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2d8e41] text-white py-3 rounded-lg font-medium hover:bg-[#246b35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Instructions...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center justify-center text-[#2d8e41] hover:text-[#246b35] font-medium transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;