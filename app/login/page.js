"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(name, pass) {
    setUsername(name);
    setPassword(pass);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Expense Tracker</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">Manage your finances</p>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded border border-red-300 text-sm sm:text-base" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              placeholder="Enter username"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 sm:py-3 rounded transition text-sm sm:text-base"
          >
            {loading ? 'Logging in...' : 'Sign in'}
          </button>

          <div className="mt-6 border-t pt-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">Demo Credentials:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin('arafat', '112233')}
                className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-left transition"
              >
                <span className="font-mono font-bold">arafat / 112233</span> <span className="text-gray-600 dark:text-gray-400">(Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('arif', '123')}
                className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-left transition"
              >
                <span className="font-mono font-bold">arif / 123</span> <span className="text-gray-600 dark:text-gray-400">(User)</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('baba', '123')}
                className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-left transition"
              >
                <span className="font-mono font-bold">baba / 123</span> <span className="text-gray-600 dark:text-gray-400">(User)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
