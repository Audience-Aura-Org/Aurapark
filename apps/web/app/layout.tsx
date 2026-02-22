import type { Metadata } from "next";
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { SidebarProvider } from '@/components/SidebarProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata = {
  title: 'Aura Park | Premium Transport Experience',
  description: 'Experience seamless inter-city travel with real-time tracking, instant booking, and premium comfort.',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-gradient-green-soft dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-100 selection:bg-primary-200 dark:selection:bg-purple-600 selection:text-neutral-900 dark:selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <SidebarProvider>
                <Navbar />
                {children}
                <BottomNav />
              </SidebarProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
