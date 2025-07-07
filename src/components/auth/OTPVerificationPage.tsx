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
  const [generatedOTP, setGeneratedOTP] = useState('');
  const maxAttempts = 3;

  // Only generate OTP ONCE on mount
  useEffect(() => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    console.log(`Generated OTP for ${phone}: ${otp}`);
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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (data.length === 6) {
      setOtp(data.split(''));
      setTimeout(() => document.getElementById('otp-5')?.focus(), 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otp.join('');

    if (enteredCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (attempts >= maxAttempts || timeLeft === 0) {
      setError('OTP expired or maximum attempts reached. Please log in again.');
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
      await new Promise(res => setTimeout(res, 1000));
      if (enteredCode === generatedOTP) {
        await completeLogin();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Invalid OTP. ${maxAttempts - newAttempts} attempt(s) left.`);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setAttempts(0);
    setTimeLeft(300);
    setCanResend(false);
    alert(`📱 Code resent to ${phone} (Same code still valid)`);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-100 p-4 dark:bg-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <img src="https://i.postimg.cc/MTpyCg68/logo.png" alt="Logo" className="w-20 h-20 mx-auto rounded-full mb-2" />
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Verify Your Identity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Code sent to <strong>{phone}</strong></p>
        </div>

        {error && (
          <div className="text-red-600 text-sm mb-4 bg-red-100 p-2 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center space-x-2" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-10 h-12 text-xl text-center border rounded focus:ring-2 focus:ring-[#2d8e41]"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length !== 6 || isLoading}
            className="w-full mt-6 bg-[#2d8e41] hover:bg-[#256d36] text-white py-2 rounded-lg font-semibold"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          {timeLeft > 0 ? (
            <p>Code expires in <strong>{formatTime(timeLeft)}</strong></p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-[#2d8e41] font-medium flex items-center justify-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1" /> Resend Code
            </button>
          )}
          {attempts > 0 && <p>Attempts: {attempts}/{maxAttempts}</p>}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
