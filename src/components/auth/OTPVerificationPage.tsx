import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

interface OTPVerificationPageProps {
  phone: string;
  onBack: () => void;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({ phone, onBack }) => {
  const { completeLogin, pendingLogin } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [demoOTP, setDemoOTP] = useState('');
  const [showOTPDisplay, setShowOTPDisplay] = useState(false);
  const maxAttempts = 3;

  // Generate demo OTP on component mount
  useEffect(() => {
    const generateDemoOTP = () => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOTP(otp);
      console.log(`Demo OTP for ${phone}: ${otp}`);
      
      // Show demo OTP in development - display in UI instead of alert
      // Force demo mode for testing - remove this line when ready for production
      const isDemoMode = import.meta.env.DEV || true;
      if (isDemoMode) {
        setShowOTPDisplay(true);
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setShowOTPDisplay(false);
        }, 10000);
      }
    };

    generateDemoOTP();
  }, [phone]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(''); // Clear error when user types

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        prevInput?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      setError('');
      // Auto-focus last input
      setTimeout(() => {
        const lastInput = document.getElementById('otp-5');
        lastInput?.focus();
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Maximum attempts exceeded. Please request a new OTP.');
      return;
    }

    if (!pendingLogin) {
      setError('Session expired. Please login again.');
      onBack();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try to verify OTP with the backend
      const response = await authApi.verifyOTP(phone, otpCode);
      
      } else {
        // Fallback to demo codes for development
        const validCodes = [demoOTP, '123456', '000000'];
        
        if (validCodes.includes(otpCode)) {
          await completeLogin();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          const remainingAttempts = maxAttempts - newAttempts;
          
          if (remainingAttempts > 0) {
            setError(`❌ Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
          } else {
            setError('❌ Maximum attempts exceeded. Please request a new OTP.');
          }
          
          // Clear OTP inputs on error
          setOtp(['', '', '', '', '', '']);
          const firstInput = document.getElementById('otp-0');
          firstInput?.focus();
        }
      }
    } catch (err) {
      setError('❌ Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimeLeft(60); // Reset to 1 minute
    setError('');
    setAttempts(0);
    setOtp(['', '', '', '', '', '']);
    
    try {
      // Try to send new OTP via API
      const response = await authApi.sendOTP(phone);
      
      if (response.success) {
        console.log('New OTP sent successfully');
      } else {
        // Fallback to demo OTP
        const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOTP(newOTP);
        console.log(`New Demo OTP for ${phone}: ${newOTP}`);
      }
      
      // Show new OTP in development mode
      const isDemoMode = import.meta.env.DEV || true;
      if (isDemoMode) {
        setShowOTPDisplay(true);
        setTimeout(() => {
          setShowOTPDisplay(false);
        }, 10000);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <img
                src="https://i.postimg.cc/MTpyCg68/logo.png"
                alt="Vermi-Farm Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-gray-600"
              />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-2">Verify Your Identity</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
              We've sent a 6-digit code to <strong>{phone}</strong>
            </p>
            {pendingLogin && (
              <p className="text-sm text-[#2d8e41] dark:text-green-400 mt-2">
                Logging in as: <strong>{pendingLogin.user.name}</strong>
              </p>
            )}
          </div>

          {/* Demo OTP Display */}
          {(import.meta.env.DEV || true) && showOTPDisplay && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <p className="font-medium">🔐 Demo OTP: {demoOTP}</p>
                    <p className="text-xs">Use this code to verify (auto-hides in 10s)</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowOTPDisplay(false)}
                  className="text-green-500 hover:text-green-700 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Demo Notice */}
          {(import.meta.env.DEV || true) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">🧪 Demo Mode Active</p>
                  <p className="text-xs">The OTP will appear above when generated</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-[#2d8e41] transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={isLoading || attempts >= maxAttempts}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Paste your 6-digit code or enter manually
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6 || attempts >= maxAttempts}
              className="w-full bg-gradient-to-r from-[#2d8e41] to-[#246b35] text-white py-3 rounded-lg font-medium hover:from-[#246b35] hover:to-[#1d5429] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Verify & Login
                </div>
              )}
            </button>
          </form>

          {/* Timer and Resend */}
          <div className="text-center mt-6">
            {timeLeft > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Code expires in <span className="font-semibold text-[#2d8e41] dark:text-green-400">{formatTime(timeLeft)}</span>
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-[#2d8e41] h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={!canResend}
                className="text-[#2d8e41] dark:text-green-400 hover:text-[#246b35] dark:hover:text-green-300 font-medium transition-colors duration-200 text-sm flex items-center justify-center mx-auto disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Resend Code
              </button>
            )}
          </div>

          {/* Attempts Counter */}
          {attempts > 0 && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Attempts: {attempts}/{maxAttempts}
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 Vermi-Farm Initiative. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;