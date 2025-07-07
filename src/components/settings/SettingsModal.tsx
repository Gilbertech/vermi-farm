import React, { useState } from 'react';
import { X, Moon, Sun, Shield, Key, Activity, Monitor, User, Bell, Lock, Smartphone, QrCode, Copy, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'qrcode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'activity' | 'sessions'>('general');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false
  });

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'sessions', label: 'Sessions', icon: Monitor }
  ];

  const activityLogs = [
    { id: 1, action: 'Login', timestamp: '2025-01-20 10:30:00', ip: '192.168.1.1', device: 'Chrome on Windows' },
    { id: 2, action: 'Password Changed', timestamp: '2025-01-19 15:45:00', ip: '192.168.1.1', device: 'Chrome on Windows' },
    { id: 3, action: 'Login', timestamp: '2025-01-19 09:15:00', ip: '192.168.1.2', device: 'Safari on iPhone' },
    { id: 4, action: '2FA Enabled', timestamp: '2025-01-18 14:20:00', ip: '192.168.1.1', device: 'Chrome on Windows' },
    { id: 5, action: 'Login', timestamp: '2025-01-18 08:30:00', ip: '192.168.1.1', device: 'Chrome on Windows' }
  ];

  const activeSessions = [
    { id: 1, device: 'Chrome on Windows', location: 'Nairobi, Kenya', lastActive: '2025-01-20 10:30:00', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Nairobi, Kenya', lastActive: '2025-01-19 09:15:00', current: false },
    { id: 3, device: 'Firefox on Ubuntu', location: 'Mombasa, Kenya', lastActive: '2025-01-18 16:45:00', current: false }
  ];

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateQRCode = async (secret: string) => {
    try {
      const issuer = 'Vermi-Farm';
      const accountName = currentUser?.name || 'User';
      const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      
      const qrCodeDataURL = await QRCode.toDataURL(otpAuthUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#2d8e41',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataURL(qrCodeDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFactorEnabled) {
      // Generate a new secret key
      const secret = generateSecretKey();
      setSecretKey(secret);
      
      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
      
      // Generate QR code
      await generateQRCode(secret);
      setShowQRCode(true);
    } else {
      // Disable 2FA
      const confirmDisable = window.confirm('Are you sure you want to disable 2FA? This will make your account less secure.');
      if (confirmDisable) {
        setTwoFactorEnabled(false);
        setShowQRCode(false);
        setBackupCodes([]);
        setVerificationCode('');
        setQrCodeDataURL('');
        setSecretKey('');
      }
    }
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      // In a real app, this would verify the TOTP code against the secret
      // For demo purposes, we'll accept any 6-digit code
      setTwoFactorEnabled(true);
      setShowQRCode(false);
      alert('2FA has been successfully enabled! Your account is now more secure.');
    } else {
      alert('Please enter a valid 6-digit code from your authenticator app');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // Simulate password change
    alert('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!isOpen) return null;

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Theme</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            theme === 'dark' ? 'bg-[#2d8e41]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center text-gray-900 dark:text-gray-100">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Email Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-[#2d8e41]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">SMS Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.sms ? 'bg-[#2d8e41]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.sms ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Push Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-[#2d8e41]' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* 2FA Section */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {twoFactorEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
              </p>
            </div>
          </div>
          <button
            onClick={handleEnable2FA}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-[#2d8e41]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 2FA Setup Process */}
        {showQRCode && !twoFactorEnabled && (
          <div className="mt-4 space-y-4">
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Step 1: Scan QR Code</h4>
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  {qrCodeDataURL ? (
                    <img src={qrCodeDataURL} alt="2FA QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Scan this QR code with your authenticator app:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                    <li>• Any TOTP-compatible app</li>
                  </ul>
                  {secretKey && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Manual entry key:</p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                          {secretKey}
                        </code>
                        <button
                          onClick={() => copyToClipboard(secretKey)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {copiedCode === secretKey ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Step 2: Enter Verification Code</h4>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center font-mono"
                />
                <button
                  onClick={handleVerify2FA}
                  disabled={verificationCode.length !== 6}
                  className="px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <div className="p-4 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-800 dark:text-yellow-400">Backup Codes</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border">
                      <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{code}</span>
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {copiedCode === code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2FA Status */}
        {twoFactorEnabled && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-400">2FA is enabled</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your account is protected with two-factor authentication.
            </p>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <button 
            type="submit"
            className="w-full bg-[#2d8e41] text-white py-2 rounded-lg hover:bg-[#246b35] transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Security Status */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-green-800 dark:text-green-400">Account Security: Strong</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          Your account has strong security settings enabled.
        </p>
      </div>
    </div>
  );

  const renderActivityLogs = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activityLogs.map((log) => (
          <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{log.action}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{log.device}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">{log.timestamp}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{log.ip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSessionManagement = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-gray-100">Active Sessions</h3>
      <div className="space-y-3">
        {activeSessions.map((session) => (
          <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-sm flex items-center text-gray-900 dark:text-gray-100">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{session.location}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                  Terminate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
        Terminate All Other Sessions
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#2d8e41] text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'activity' && renderActivityLogs()}
            {activeTab === 'sessions' && renderSessionManagement()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;