"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    console.log('🎨 Theme init - saved:', saved, 'prefersDark:', prefersDark, 'dark:', dark);
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  function applyTheme(dark) {
    const html = document.documentElement;
    console.log('🎨 Applying theme - dark:', dark, 'html element:', html);
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('✅ Dark mode applied, class list:', html.className);
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('✅ Light mode applied, class list:', html.className);
    }
  }

  function toggleTheme() {
    const newValue = !isDark;
    console.log('🎨 Toggle theme clicked - new value:', newValue);
    setIsDark(newValue);
    applyTheme(newValue);
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
     // router.push('/login');
     router.push('/login'); // remove history
     router.refresh();         // clear cached layout/data
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Dashboard',
      '/deposits': 'Deposits',
      '/expenses': 'Expenses',
      '/categories': 'Categories',
      '/loans': 'Loans',
      '/reports': 'Reports',
      '/audit': 'Audit Log',
      '/settings': 'Settings',
    };
    return titles[pathname] || 'Dashboard';
  };

  return (
    <header className="hidden md:flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 mt-0">
      <div className="text-lg font-semibold">{getPageTitle()}</div>
      <div className="flex items-center gap-3">
        {mounted && (
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm md:text-base"
            title="Toggle theme"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        )}
        <button 
          onClick={() => router.push('/settings')} 
          className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm md:text-base"
        >
          ⚙️ Settings
        </button>
        {user ? (
          <>
            <div className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700">{user.username}</div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm md:text-base cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => router.push('/login')} className="px-4 py-2 rounded bg-blue-600 text-white">Login</button>
        )}
      </div>
    </header>
  );
}
