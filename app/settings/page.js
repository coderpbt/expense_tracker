"use client";
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Get user from cookie
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('expense_user='));
    
    if (cookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        setUser(userData);
      } catch (e) {
        // Invalid cookie
      }
    }

    // Get saved theme preference
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded max-w-md">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">User Profile</h2>
          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <p><strong>Username:</strong> {user?.username || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-3">Theme</h2>
          <div className="flex items-center justify-between">
            <span>Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded text-white ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-400'}`}
            >
              {theme === 'dark' ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h2 className="text-lg font-semibold mb-3">Information</h2>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Deposits can only be edited by arafat</li>
            <li>• You can edit your own expenses</li>
            <li>• Audit logs track all changes</li>
            <li>• Balance includes loans in calculation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
