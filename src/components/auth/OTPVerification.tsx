import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface OTPVerificationProps {
  phoneNumber: string;
  tempToken: string;
  onSuccess: () => void;
  onFailure: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  phoneNumber,
  tempToken,
  onSuccess,
  onFailure,
  onBack
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const MAX_ATTEMPTS = 3;
  const RESEND_COOLDOWN = 60; // 1 minute

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('OTP expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Enable resend after cooldown
    const resendTimer = setTimeout(() => {
      setCanResend(true);
    }, RESEND_COOLDOWN * 1000);

    return () => clearTimeout(resendTimer);
  }, []);

  useEffect(() => {
    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (attempts >= MAX_ATTEMPTS) {
      setError('Maximum attempts exceeded. Please try logging in again.');
      setTimeout(onFailure, 2000);
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification (in real app, this would be an API call)
      const isValid = otpCode === '123456'; // Mock valid OTP
      
      if (isValid) {
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Maximum attempts exceeded. Redirecting to login...');
          setTimeout(onFailure, 2000);
        } else {
          setError(`Invalid OTP. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');

    try {
      // Simulate resending OTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset state
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(300);
      setAttempts(0);
      setCanResend(false);
      
      // Reset resend cooldown
      setTimeout(() => setCanResend(true), RESEND_COOLDOWN * 1000);
      
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedPhone = phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#2d8e41] rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Verify Your Identity</h1>
            <p className="text-gray-600 text-sm lg:text-base">
              Enter the 6-digit code sent to <span className="font-semibold">{maskedPhone}</span>
            </p>
          </div>

          {/* Timer */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Code expires in:</span>
              </div>
              <span className={`font-mono font-bold text-lg ${
                timeLeft < 60 ? 'text-red-600' : 'text-blue-600'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Attempts Indicator */}
          {attempts > 0 && (
            <div className="mb-4 flex justify-center">
              <div className="flex space-x-1">
                {Array.from({ length: MAX_ATTEMPTS }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < attempts ? 'bg-red-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {attempts}/{MAX_ATTEMPTS} attempts
              </span>
            </div>
          )}

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter Verification Code
            </label>
            <div className="flex justify-center space-x-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  disabled={isVerifying || timeLeft === 0}
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 rounded-lg transition-all duration-200 ${
                    digit 
                      ? 'border-[#2d8e41] bg-green-50' 
                      : 'border-gray-300 bg-white'
                  } focus:border-[#2d8e41] focus:ring-2 focus:ring-[#2d8e41] focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerifyOTP(otp.join(''))}
            disabled={otp.some(digit => !digit) || isVerifying || timeLeft === 0}
            className="w-full bg-gradient-to-r from-[#2d8e41] to-[#246b35] text-white py-3 rounded-lg font-medium hover:from-[#246b35] hover:to-[#1d5429] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none mb-4"
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending || timeLeft === 0}
              className="text-[#2d8e41] hover:text-[#246b35] font-medium transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </button>
            {!canResend && !isResending && (
              <p className="text-xs text-gray-400 mt-1">
                Resend available in {RESEND_COOLDOWN} seconds
              </p>
            )}
          </div>

          {/* Security Info */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-800">Security Information</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Code expires in 5 minutes</li>
              <li>• Maximum 3 verification attempts</li>
              <li>• SMS delivery may take up to 2 minutes</li>
              <li>• Code is valid for single use only</li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={onBack}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Secure verification powered by Vermi-Farm Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;