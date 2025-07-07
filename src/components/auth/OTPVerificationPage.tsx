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

  useEffect(() => {
    generateOTP();
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

  const generateOTP = () => {
    const otpArray = new Uint32Array(1);
    window.crypto.getRandomValues(otpArray);
    const otp = (otpArray[0] % 1000000).toString().padStart(6, '0');
    setGeneratedOTP(otp);
    setOtpExpired(false);
    setCanResend(false);
    setTimeLeft(300);

    if (import.meta.env.DEV) {
      setTimeout(() => {
        window.alert(`🔐 OTP Code: ${otp}\n(This is for testing only)`);
      }, 500);
    }
  };

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
    } catch (err) {
      setError('❌ Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      generateOTP();
      setAttempts(0);
      setOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">OTP Authentication</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-10 text-center text-lg border rounded-md"
              />
            ))}
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6 || otpExpired || attempts >= maxAttempts}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">Code expires in {formatTime(timeLeft)}</p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={!canResend}
              className="text-green-600 hover:underline text-sm"
            >
              <RefreshCw className="inline-block w-4 h-4 mr-1" /> Resend Code
            </button>
          )}
        </div>
        <div className="text-center mt-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:underline text-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
