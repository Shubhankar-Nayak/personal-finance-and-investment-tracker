import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { setDarkMode } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { Moon, Sun, User, Shield, Bell, Database, LogOut, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector(state => state.ui);
  const { user } = useAppSelector(state => state.auth);

  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState({ currentPassword: '', newPassword: '' });
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
    }
  };

  const handlePasswordClick = () => {
    setIsSettingPassword(!user?.hasPassword);
    setFormState({ currentPassword: '', newPassword: '' });
    setModalOpen(true);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
      const parsedAuth = root.auth ? JSON.parse(root.auth) : null;
      const token = parsedAuth?.token;

      if (!token) throw new Error('You are not logged in.');

      const endpoint = isSettingPassword ? 'set-password' : 'change-password';
      const res = await fetch(`/api/user/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formState),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Password update failed');

      setFeedback('Password updated successfully');
      setModalOpen(false);
    } catch (err: any) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if(!window.confirm('This will permanently delete all your data. Are you sure?')) return;

    setLoading(true);
    setFeedback(null);

    try {
      const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
      const parseAuth = root.auth ? JSON.parse(root.auth) : null;
      const token = parseAuth?.token;

      if (!token) throw new Error('You are not logged in.');

      const res = await fetch('api/user/data', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }, 
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to clear data');

      alert('Your data has been cleared successfully.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
      const root = JSON.parse(localStorage.getItem('persist:root') || '{}');
      const parseAuth = root.auth ? JSON.parse(root.auth) : null;
      const token = parseAuth?.token;

      if (!token) return alert('Not authenticated');

      try {
        const res = await axios.get('/api/user/export', {
          headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    }
  };

  const SettingSection: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, description, icon, children }) => (
    <div className={`
      p-6 rounded-xl shadow-sm border
      ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <SettingSection
        title="Profile Information"
        description="View and manage your account details"
        icon={<User className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className={`
                  w-full px-3 py-2 border rounded-lg bg-gray-50
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                  }
                `}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className={`
                  w-full px-3 py-2 border rounded-lg bg-gray-50
                  ${darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-400' 
                    : 'bg-gray-50 border-gray-300 text-gray-500'
                  }
                `}
              />
            </div>
          </div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Profile editing will be available in a future update
          </p>
        </div>
      </SettingSection>

      {/* Appearance Section */}
      <SettingSection
        title="Appearance"
        description="Customize the look and feel of your application"
        icon={darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dark Mode
            </h4>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={() => dispatch(setDarkMode(!darkMode))}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${darkMode ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </SettingSection>

      {/* Privacy Section */}
      <SettingSection
        title="Privacy & Security"
        description="Manage your privacy settings and account security"
        icon={<Shield className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.hasPassword ? 'Change Password' : 'Set Password'}
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.hasPassword
                    ? 'Update your account password'
                    : 'Set a password for your Google account'}
              </p>
            </div>
            <button
              onClick={handlePasswordClick} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {user?.hasPassword ? 'Change' : 'Set'}
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Password Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isSettingPassword ? 'Set Password' : 'Change Password'}
            </h3>
            {!isSettingPassword && (
              <input
                type="password"
                placeholder="Current password"
                value={formState.currentPassword}
                onChange={e => setFormState({ ...formState, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            )}
            <input
              type="password"
              placeholder="New password"
              value={formState.newPassword}
              onChange={e => setFormState({ ...formState, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            {feedback && (
              <p className="text-sm text-red-500 dark:text-red-400">{feedback}</p>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <SettingSection
        title="Notifications"
        description="Configure how you receive notifications"
        icon={<Bell className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Budget Alerts
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Get notified when you exceed your budget limits
              </p>
            </div>
            <button
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-blue-600
              `}
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Monthly Reports
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Receive monthly financial summary reports
              </p>
            </div>
            <button
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-200
              `}
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Data Section */}
      <SettingSection
        title="Data Management"
        description="Manage your data and application preferences"
        icon={<Database className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Export Data
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Download all your financial data
              </p>
            </div>
            <button
              onClick={handleExportData} 
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Export
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium text-red-600`}>
                Clear All Data
              </h4>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Permanently delete all your data
              </p>
            </div>
            <button
            onClick={handleClearData}
             className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Clear Data
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Account Actions */}
      <div className={`
        p-6 rounded-xl shadow-sm border border-red-200
        ${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Sign Out
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign out of your account on this device
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;