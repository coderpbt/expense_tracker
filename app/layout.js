import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { dbConnect } from "@/db/dbConnection/dbConnection";
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastProvider from './components/ToastProvider';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "Home Expense Tracker",
  description: "Expense tracker dashboard",
};

export default async function RootLayout({ children }) {
  await dbConnect();

  const c = await cookies();
  const cookie = c.get('expense_user')?.value;
  let user = null;
  if (cookie) {
    try { user = JSON.parse(cookie); } catch (e) { user = null; }
  }

  const isAuthed = !!user;

  return (
    <html lang="en">
      <head>
        {/* Initialize theme from localStorage to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const saved = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const isDark = saved ? saved === 'dark' : prefersDark;
              if (isDark) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-[family:var(--font-space-grotesk)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ToastProvider>
          {isAuthed && <Sidebar />}
          <div className={`flex-1 flex flex-col ${isAuthed ? '' : 'items-center justify-center min-h-screen'}`}>
            {isAuthed ? <Header user={user} /> : null}
            <main className="p-4 overflow-auto w-full">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
