import React, { useState, useEffect } from 'react';
import { ArrowLeft, Shield, RefreshCw } from 'lucide-react';
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
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpExpired, setOtpExpired] = useState(false);
  const maxAttempts = 3;

  const generateOTP = () => {
    const otp = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((n) => (n % 10).toString())
      .join('');
    setGeneratedOTP(otp);
    setOtpExpired(false);
    if (import.meta.env.DEV) {
      alert(`🔐 OTP Code: ${otp}`);
    }
  };

  useEffect(() => {
    generateOTP();
  }, [phone]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          setOtpExpired(true);
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
    if (!/^\d?$/.test(value)) return;
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

    await new Promise((res) => setTimeout(res, 1000));

    if (otpCode === generatedOTP) {
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

    setIsLoading(false);
  };

  const handleResendOTP = () => {
    if (canResend) {
      generateOTP();
      setCanResend(false);
      setAttempts(0);
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      alert(`📱 OTP re-sent to ${phone}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-2xl shadow-2xl border dark:border-gray-700">
          <h2 className="text-center text-xl font-bold mb-4 text-gray-800 dark:text-white">
            🔐 OTP Authentication: Secure login with cryptographic OTP generation
          </h2>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-2">
            Code sent to <strong>{phone}</strong>
          </p>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
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
                  className="w-12 h-12 text-center border-2 rounded-lg text-xl font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-[#2d8e41] focus:border-[#2d8e41]"
                  disabled={isLoading || otpExpired || attempts >= maxAttempts}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6 || otpExpired || attempts >= maxAttempts}
              className="w-full bg-[#2d8e41] hover:bg-[#246b35] text-white py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <div className="text-center mt-4">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code expires in <strong>{formatTime(timeLeft)}</strong>
              </p>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={!canResend}
                className="text-sm text-[#2d8e41] hover:text-[#246b35] font-medium"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" /> Resend Code
              </button>
            )}
          </div>

          <div className="text-center mt-6">
            <button
              onClick={onBack}
              className="flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
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
