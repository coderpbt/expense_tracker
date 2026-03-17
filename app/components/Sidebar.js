"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/deposits', label: 'Deposits', icon: '💰' },
    { href: '/expenses', label: 'Expenses', icon: '💸' },
    { href: '/categories', label: 'Categories', icon: '📁' },
    { href: '/loans', label: 'Loans', icon: '💳' },
    { href: '/reports', label: 'Reports', icon: '📈' },
   // { href: '/audit', label: 'Audit Log', icon: '📋' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Mobile hamburger button - visible only on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between z-50">
        {/* <div className="text-lg font-bold">Expense Tracker D</div> */}
        <Link className="text-lg font-bold" href='/dashboard'>Expense Tracker</Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - responsive */}
      <aside
        className={`fixed md:relative w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:pt-0 pt-16`}
      >
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:block p-4 text-xl font-bold border-b dark:border-gray-700">         
          <Link href='/dashboard'>Expense Tracker </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded transition ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content wrapper for mobile spacing */}
      <style>{`
        @media (max-width: 767px) {
          main {
            margin-top: 0;
          }
        }
      `}</style>
    </>
  );
}
