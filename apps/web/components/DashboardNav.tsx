'use client';

import Link from 'next/link';
import { Button } from './Button';

interface DashboardNavProps {
    title: string;
    backLink: string;
    backLabel?: string;
}

export default function DashboardNav({ title, backLink, backLabel = 'Back to Console' }: DashboardNavProps) {
    return (
        <nav className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-6">
                <Link href={backLink} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-primary hover:border-accent transition-all group">
                    <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                </Link>
                <div>
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-1">Navigation System</div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/" className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors mr-4">
                    Network Home
                </Link>
                <div className="h-10 px-6 rounded-2xl glass-dark border border-white/5 flex items-center justify-center font-black text-[9px] uppercase tracking-widest text-accent">
                    {backLabel}
                </div>
            </div>
        </nav>
    );
}
