import React, { useState } from 'react';
import { X, Settings, Shield, Palette, Users, Activity, Globe, Moon, Sun, Smartphone, Mail, Key, Clock, AlertTriangle, Eye, Bell, Download, Upload } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'display' | 'access' | 'monitoring'>('security');
  const [settings, setSettings] = useState({
    // Security Settings
    twoFactorEnabled: true,
    twoFactorMethod: 'sms',
    emailVerified: true,
    passkeyEnabled: false,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    
    // Display Settings
    theme: 'light',
    language: 'en',
    timezone: 'Africa/Nairobi',
    compactMode: false,
    
    // Access Management
    role: 'super_admin',
    permissions: ['read', 'write', 'delete', 'admin'],
    
    // Monitoring
    activityLogging: true,
    loginNotifications: true,
    securityAlerts: true,
    emailReports: false
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'display', label: 'Display', icon: Palette },
    { id: 'access', label: 'Access', icon: Users },
    { id: 'monitoring', label: 'Monitoring', icon: Activity }
  ];

  if (!isOpen) return null;

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#2d8e41]" />
            <h3 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2d8e41]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d8e41]"></div>
          </label>
        </div>
        
        {settings.twoFactorEnabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'sms', label: 'SMS', icon: Smartphone, desc: 'Text message' },
                  { id: 'email', label: 'Email', icon: Mail, desc: 'Email verification' },
                  { id: 'app', label: 'Authenticator', icon: Key, desc: 'App-based' }
                ].map(method => (
                  <label key={method.id} className="relative">
                    <input
                      type="radio"
                      name="twoFactorMethod"
                      value={method.id}
                      checked={settings.twoFactorMethod === method.id}
                      onChange={(e) => handleSettingChange('twoFactorMethod', e.target.value)}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-[#2d8e41] peer-checked:bg-green-50 hover:border-gray-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <method.icon className="w-5 h-5 text-gray-600 peer-checked:text-[#2d8e41]" />
                        <div>
                          <div className="font-medium text-gray-800">{method.label}</div>
                          <div className="text-xs text-gray-500">{method.desc}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Verification */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Email Verification</h3>
          </div>
          <div className="flex items-center space-x-2">
            {settings.emailVerified ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Verified</span>
            ) : (
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Verify Email
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Email verification adds an extra layer of security to your account.
        </p>
      </div>

      {/* Passkey Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Passkey Authentication</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.passkeyEnabled}
              onChange={(e) => handleSettingChange('passkeyEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Use biometric authentication or security keys for passwordless login.
        </p>
        {settings.passkeyEnabled && (
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
            Configure Passkey
          </button>
        )}
      </div>

      {/* Session & Security Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Clock className="w-5 h-5 text-orange-600" />
          <span>Session & Security Controls</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={480}>8 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <select
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d8e41] focus:border-transparent"
            >
              <option value={3}>3 attempts</option>
              <option value={5}>5 attempts</option>
              <option value={10}>10 attempts</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Palette className="w-5 h-5 text-purple-600" />
          <span>Theme Preferences</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Light', icon: Sun, desc: 'Clean and bright' },
            { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
            { id: 'auto', label: 'Auto', icon: Globe, desc: 'Follow system' }
          ].map(theme => (
            <label key={theme.id} className="relative">
              <input
                type="radio"
                name="theme"
                value={theme.id}
                checked={settings.theme === theme.id}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <theme.icon className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-800">{theme.label}</div>
                    <div className="text-xs text-gray-500">{theme.desc}</div>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <span>Language & Region</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
              <option value="fr">Français</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="Africa/Nairobi">East Africa Time (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="Europe/London">Greenwich Mean Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Layout Options */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Layout Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Compact Mode</div>
              <div className="text-sm text-gray-600">Reduce spacing and padding for more content</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccessSettings = () => (
    <div className="space-y-6">
      {/* Role Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Users className="w-5 h-5 text-[#2d8e41]" />
          <span>Role & Permissions</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
            <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Super Administrator</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Full system access and administrative privileges</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'read', label: 'Read', granted: true },
                { id: 'write', label: 'Write', granted: true },
                { id: 'delete', label: 'Delete', granted: true },
                { id: 'admin', label: 'Admin', granted: true },
                { id: 'users', label: 'User Mgmt', granted: true },
                { id: 'finance', label: 'Finance', granted: true },
                { id: 'reports', label: 'Reports', granted: true },
                { id: 'settings', label: 'Settings', granted: true }
              ].map(permission => (
                <div key={permission.id} className={`p-3 rounded-lg border ${
                  permission.granted 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      permission.granted ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">{permission.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Access Level Monitoring */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Eye className="w-5 h-5 text-blue-600" />
          <span>Access Monitoring</span>
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-blue-800">Active Sessions</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-sm text-green-800">Actions Today</div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-2">Recent Access</h4>
            <div className="space-y-2">
              {[
                { action: 'User Management', time: '2 minutes ago', status: 'success' },
                { action: 'Financial Reports', time: '15 minutes ago', status: 'success' },
                { action: 'System Settings', time: '1 hour ago', status: 'success' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-800">{item.action}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonitoringSettings = () => (
    <div className="space-y-6">
      {/* Activity Logging */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Activity className="w-5 h-5 text-orange-600" />
          <span>Activity Logging</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Enable Activity Logging</div>
              <div className="text-sm text-gray-600">Track all user actions and system events</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.activityLogging}
                onChange={(e) => handleSettingChange('activityLogging', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          
          {settings.activityLogging && (
            <div className="pl-4 border-l-2 border-orange-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Login/Logout Events</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Data Access</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Administrative Actions</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Security Events</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications & Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Notifications & Alerts</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Login Notifications</div>
              <div className="text-sm text-gray-600">Get notified of new login attempts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.loginNotifications}
                onChange={(e) => handleSettingChange('loginNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Security Alerts</div>
              <div className="text-sm text-gray-600">Immediate alerts for security events</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.securityAlerts}
                onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">Email Reports</div>
              <div className="text-sm text-gray-600">Weekly activity summary reports</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailReports}
                onChange={(e) => handleSettingChange('emailReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-600/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-3">
          <Download className="w-5 h-5 text-purple-600" />
          <span>Data Export</span>
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Export your activity logs and security data</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-800">Activity Logs</div>
                  <div className="text-sm text-gray-600">Last 30 days</div>
                </div>
              </div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-800">Security Events</div>
                  <div className="text-sm text-gray-600">All time</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-[#2d8e41]" />
            <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#2d8e41] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'display' && renderDisplaySettings()}
            {activeTab === 'access' && renderAccessSettings()}
            {activeTab === 'monitoring' && renderMonitoringSettings()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Settings are automatically saved
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-[#2d8e41] text-white rounded-lg hover:bg-[#246b35] transition-colors duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;