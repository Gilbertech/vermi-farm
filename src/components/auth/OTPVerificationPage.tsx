import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface OTPVerificationPageProps {
  phone: string;
  onBack: () => void;
}

const OTPVerificationPage: React.FC<OTPVerificationPageProps> = ({ phone, onBack }) => {
  const { completeLogin, pendingLogin } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [demoOTP, setDemoOTP] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);
  const maxAttempts = 3;

  const generateNewOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setDemoOTP(otp);
    setOtpExpired(false);
    console.log(`Demo OTP for ${phone}: ${otp}`);
    if (import.meta.env.DEV) {
      alert(`🔐 Demo OTP: ${otp}`);
    }
  };

  useEffect(() => {
    generateNewOTP();
  }, [phone]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setOtpExpired(true);
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
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      setTimeout(() => document.getElementById('otp-5')?.focus(), 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (otpExpired || attempts >= maxAttempts) {
      setError('OTP expired or attempts exceeded. Please resend a new code.');
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
      await new Promise((res) => setTimeout(res, 1000));
      const validCodes = ['123456', '000000', demoOTP];

      if (validCodes.includes(otpCode)) {
        await completeLogin();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= maxAttempts) {
          setOtpExpired(true);
          setCanResend(true);
          setError('❌ Maximum attempts exceeded. Please request a new OTP.');
        } else {
          setError(`❌ Invalid OTP code. ${maxAttempts - newAttempts} attempt(s) left.`);
        }
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (err) {
      setError('❌ Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      generateNewOTP();
      setCanResend(false);
      setAttempts(0);
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      alert(`📱 OTP re-sent to ${phone}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
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
            {pendingLogin?.user?.name && (
              <p className="text-sm text-[#2d8e41] dark:text-green-400 mt-2">
                Logging in as: <strong>{pendingLogin.user.name}</strong>
              </p>
            )}
          </div>

          {import.meta.env.DEV && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">🧪 Demo Mode Active</p>
                  <p className="text-xs">Use the OTP from alert or test codes: 123456, 000000</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                <span>{error}</span>
              </div>
            </div>
          )}

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
                    disabled={isLoading || otpExpired || attempts >= maxAttempts}
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
              disabled={isLoading || otp.join('').length !== 6 || otpExpired || attempts >= maxAttempts}
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

          <div className="text-center mt-6">
            {timeLeft > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Code expires in <span className="font-semibold text-[#2d8e41] dark:text-green-400">{formatTime(timeLeft)}</span>
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-[#2d8e41] h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 300) * 100}%` }}
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

          {attempts > 0 && (
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Attempts: {attempts}/{maxAttempts}
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          </div>

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
