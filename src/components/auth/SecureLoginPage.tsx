import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Phone, Lock, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/EnhancedAuthContext';
import OTPVerification from './OTPVerification';

const SecureLoginPage: React.FC = () => {
  const { login, setCurrentView } = useAuth();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const validateKenyanPhone = (phone: string): boolean => {
    const kenyanPhoneRegex = /^(07|01)\d{8}$/;
    return kenyanPhoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Account locked. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`);
      return;
    }

    if (!validateKenyanPhone(formData.phone)) {
      setError('Please enter a valid Kenyan phone number (07xxxxxxxx or 01xxxxxxxx)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate initial authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication check
      const validCredentials = formData.phone === '0712345678' && formData.password === 'admin123';
      
      if (validCredentials) {
        // Generate temporary token and show OTP
        const token = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setTempToken(token);
        setShowOTP(true);
        setLoginAttempts(0);
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockoutTime(LOCKOUT_DURATION);
          setError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`);
        } else {
          setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = async () => {
    try {
      await login(formData.phone, formData.password);
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setShowOTP(false);
    }
  };

  const handleOTPFailure = () => {
    setShowOTP(false);
    setTempToken('');
    setError('OTP verification failed. Please try logging in again.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const formatLockoutTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (showOTP) {
    return (
      <OTPVerification
        phoneNumber={formData.phone}
        tempToken={tempToken}
        onSuccess={handleOTPSuccess}
        onFailure={handleOTPFailure}
        onBack={() => setShowOTP(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img
                src="https://i.postimg.cc/MTpyCg68/logo.png"
                alt="Vermi-Farm Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#2d8e41] rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Secure Admin Access</h1>
            <p className="text-gray-600 text-sm lg:text-base">Two-Factor Authentication Required</p>
          </div>

          {/* Security Status */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">Enhanced Security Enabled</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Login requires phone verification via SMS OTP
            </p>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">Account Temporarily Locked</span>
              </div>
              <p className="text-sm text-red-700">
                Too many failed attempts. Try again in: <span className="font-mono font-bold">{formatLockoutTime(lockoutTime)}</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocked && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Attempts Indicator */}
          {loginAttempts > 0 && !isLocked && (
            <div className="mb-4 flex justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < loginAttempts ? 'bg-red-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {loginAttempts}/{MAX_ATTEMPTS} attempts
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07xxxxxxxx or 01xxxxxxxx"
                  required
                  disabled={isLocked}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-[#2d8e41] transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  disabled={isLocked}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-[#2d8e41] transition-all duration-200 bg-gray-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full bg-gradient-to-r from-[#2d8e41] to-[#246b35] text-white py-3 rounded-lg font-medium hover:from-[#246b35] hover:to-[#1d5429] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Authenticating...
                </div>
              ) : isLocked ? (
                'Account Locked'
              ) : (
                'Continue to 2FA'
              )}
            </button>
          </form>

          {/* Security Features */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Security Features</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">SMS-based Two-Factor Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Account lockout protection</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Encrypted data transmission</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600">Session timeout protection</span>
              </div>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentView('reset-password')}
              disabled={isLocked}
              className="text-[#2d8e41] hover:text-[#246b35] font-medium transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forgot your password?
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2025 Vermi-Farm Initiative. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureLoginPage;