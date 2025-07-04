import React, { useState } from 'react';
import { X, Moon, Sun, Shield, Key, Activity, Monitor, User, Bell, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'activity' | 'sessions'>('general');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
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

  if (!isOpen) return null;

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <div>
            <h3 className="font-medium">Theme</h3>
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
        <h3 className="font-medium flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.email ? 'bg-[#2d8e41]' : 'bg-gray-300'
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
            <span className="text-sm">SMS Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, sms: !prev.sms }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.sms ? 'bg-[#2d8e41]' : 'bg-gray-300'
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
            <span className="text-sm">Push Notifications</span>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.push ? 'bg-[#2d8e41]' : 'bg-gray-300'
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
      {/* 2FA Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
          </div>
        </div>
        <button
          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            twoFactorEnabled ? 'bg-[#2d8e41]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Change Password */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="w-5 h-5" />
          <h3 className="font-medium">Change Password</h3>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700"
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent bg-white dark:bg-gray-700"
          />
          <button className="w-full bg-[#2d8e41] text-white py-2 rounded-lg hover:bg-[#246b35] transition-colors">
            Update Password
          </button>
        </div>
      </div>

      {/* Security Status */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-green-600" />
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
      <h3 className="font-medium">Recent Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activityLogs.map((log) => (
          <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{log.action}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{log.device}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">{log.timestamp}</p>
                <p className="text-xs text-gray-500">{log.ip}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSessionManagement = () => (
    <div className="space-y-4">
      <h3 className="font-medium">Active Sessions</h3>
      <div className="space-y-3">
        {activeSessions.map((session) => (
          <div key={session.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm flex items-center">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{session.location}</p>
                  <p className="text-xs text-gray-500">Last active: {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
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
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
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
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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