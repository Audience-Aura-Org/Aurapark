import type { Metadata } from "next";
import './globals.css';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export const metadata = {
  title: 'Aura Park | Premium Transport Experience',
  description: 'Experience seamless inter-city travel with real-time tracking, instant booking, and premium comfort.',
  icons: {
    icon: '/logo-black.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { SidebarProvider } from '@/components/SidebarProvider';
import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-primary min-h-screen text-white selection:bg-accent selection:text-primary">
        <AuthProvider>
          <SidebarProvider>
            <Navbar />
            {children}
            <BottomNav />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
