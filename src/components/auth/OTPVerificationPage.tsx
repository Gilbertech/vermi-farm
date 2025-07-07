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
  const [generatedOTP, setGeneratedOTP] = useState(() => {
    const otpArray = new Uint32Array(1);
    window.crypto.getRandomValues(otpArray);
    const otp = (otpArray[0] % 1000000).toString().padStart(6, '0');
    if (import.meta.env.DEV) {
      setTimeout(() => {
        alert(`🔐 OTP Code: ${otp}\nThis is for testing only.`);
      }, 500);
    }
    return otp;
  });
  const [otpExpired, setOtpExpired] = useState(false);
  const maxAttempts = 3;

  useEffect(() => {
    setOtpExpired(false);
    setCanResend(false);
    setTimeLeft(300);
  }, [generatedOTP]);

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
      const otpArray = new Uint32Array(1);
      window.crypto.getRandomValues(otpArray);
      const newOtp = (otpArray[0] % 1000000).toString().padStart(6, '0');
      setGeneratedOTP(newOtp);
      setCanResend(false);
      setAttempts(0);
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      setOtpExpired(false);
      if (import.meta.env.DEV) {
        setTimeout(() => {
          alert(`📱 OTP re-sent to ${phone}: ${newOtp}`);
        }, 500);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* ...existing JSX remains the same... */}
    </div>
  );
};

export default OTPVerificationPage;
