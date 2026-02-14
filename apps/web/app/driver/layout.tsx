'use client';

import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
