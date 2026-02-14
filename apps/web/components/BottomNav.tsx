'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

// --- Icons ---
const Icons = {
    Search: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Ticket: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    ),
    MapPin: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    User: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    LayoutDashboard: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Bus: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
    ),
    TicketCheck: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Users: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
        </svg>
    ),
    ScanLine: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 12h10" />
        </svg>
    ),
    ClipboardList: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    Building2: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    AlertTriangle: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    HelpCircle: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    Login: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
    )
};

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType;
    isPrimary?: boolean;
    color: string;
}

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    const role = user ? user.role : 'GUEST';

    const config: Record<string, NavItem[]> = {
        GUEST: [
            { label: 'Book', href: '/', icon: Icons.Search, isPrimary: true, color: 'sky' },
            { label: 'Trips', href: '/trips', icon: Icons.Bus, color: 'teal' },
            { label: 'Login', href: '/login', icon: Icons.Login, color: 'teal' },
            { label: 'Track', href: '/tracking', icon: Icons.MapPin, color: 'teal' },
            { label: 'Support', href: '/support', icon: Icons.HelpCircle, color: 'green' }
        ],
        PASSENGER: [
            { label: 'Book', href: '/', icon: Icons.Search, isPrimary: true, color: 'sky' },
            { label: 'Tickets', href: '/bookings', icon: Icons.Ticket, color: 'teal' },
            { label: 'Track', href: '/tracking', icon: Icons.MapPin, color: 'teal' },
            { label: 'Support', href: '/support', icon: Icons.HelpCircle, color: 'green' },
            { label: 'Profile', href: '/profile', icon: Icons.User, color: 'green' }
        ],
        AGENCY_STAFF: [
            { label: 'Dash', href: '/agency/dashboard', icon: Icons.LayoutDashboard, color: 'teal' },
            { label: 'Trips', href: '/agency/trips', icon: Icons.Bus, color: 'sky' },
            { label: 'Bookings', href: '/agency/bookings', icon: Icons.TicketCheck, color: 'green' },
            { label: 'Manifest', href: '/agency/customers', icon: Icons.Users, color: 'orange' },
            { label: 'Settings', href: '/agency/settings', icon: Icons.Settings, color: 'teal' }
        ],
        DRIVER: [
            { label: 'Trips', href: '/driver/trips', icon: Icons.Bus, color: 'sky' },
            { label: 'Scan', href: '/driver/scan', icon: Icons.ScanLine, isPrimary: true, color: 'orange' },
            { label: 'List', href: '/driver/manifest', icon: Icons.ClipboardList, color: 'teal' },
            { label: 'Profile', href: '/profile', icon: Icons.User, color: 'green' }
        ],
        ADMIN: [
            { label: 'Overview', href: '/admin/dashboard', icon: Icons.LayoutDashboard, color: 'teal' },
            { label: 'Agencies', href: '/admin/agencies', icon: Icons.Building2, color: 'sky' },
            { label: 'Trips', href: '/admin/trips', icon: Icons.Bus, color: 'green' },
            { label: 'Disputes', href: '/admin/disputes', icon: Icons.AlertTriangle, color: 'orange' },
            { label: 'Settings', href: '/admin/settings', icon: Icons.Settings, color: 'teal' }
        ]
    };

    // Use GUEST-style tabs for both guest and passenger (Trips, Login/Profile, Track, Support)
    let tabs = (role === 'PASSENGER' || role === 'GUEST') ? config.GUEST : (config[role] || config.GUEST);

    // When logged in, replace Login with Profile
    if (user) {
        tabs = tabs.map(tab =>
            tab.href === '/login'
                ? { ...tab, label: 'Profile', href: '/profile', icon: Icons.User }
                : tab
        );
    }

    // Helper to get color classes
    const getColorClasses = (color: string, isActive: boolean) => {
        if (!isActive) return 'text-neutral-400';
        switch (color) {
            case 'sky': return 'text-sky-500';
            case 'teal': return 'text-teal-500';
            case 'green': return 'text-green-500';
            case 'orange': return 'text-orange-500';
            default: return 'text-primary-600';
        }
    };

    const getBgClasses = (color: string, isActive: boolean) => {
        if (!isActive) return 'bg-transparent';
        switch (color) {
            case 'sky': return 'bg-sky-400/20 backdrop-blur-md border border-white/30';
            case 'teal': return 'bg-teal-400/20 backdrop-blur-md border border-white/30';
            case 'green': return 'bg-green-400/20 backdrop-blur-md border border-white/30';
            case 'orange': return 'bg-orange-400/20 backdrop-blur-md border border-white/30';
            default: return 'bg-primary-400/20 backdrop-blur-md border border-white/30';
        }
    };

    const primaryTab = tabs.find(t => t.isPrimary);
    const secondaryTabs = tabs.filter(t => !t.isPrimary);
    const PrimaryIcon = primaryTab?.icon;

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-[150] px-2 flex items-end gap-3">
            {/* Container 1: Blue Search/Book - completely separate */}
            {primaryTab && PrimaryIcon && (
                <Link
                    href={primaryTab.href}
                    className={`
                        flex-shrink-0 relative flex flex-col items-center justify-center
                        w-16 h-16 rounded-full transition-all duration-300 transform
                        ${pathname === primaryTab.href ? 'scale-110 -translate-y-2' : 'hover:scale-105'}
                        ${primaryTab.color === 'sky' ? 'bg-gradient-to-br from-sky-400 to-sky-600' :
                            primaryTab.color === 'orange' ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                                'bg-gradient-to-br from-primary-400 to-primary-600'}
                        shadow-xl text-white
                    `}
                >
                    <PrimaryIcon />
                    <span className={`text-[9px] font-semibold mt-0.5 ${pathname === primaryTab.href ? 'opacity-100' : 'opacity-80'}`}>
                        {primaryTab.label}
                    </span>
                    {pathname === primaryTab.href && (
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                </Link>
            )}
            {/* Container 2: The other 4 icons - App Store style separate pill */}
            <nav className="flex-1 min-w-0 rounded-[2.5rem] p-2 flex items-center justify-between bg-white/20 backdrop-blur-2xl border border-white/30 shadow-glass-lg ring-1 ring-white/20">
                {secondaryTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`
                                flex flex-col items-center justify-center flex-1 min-w-0
                                py-2 rounded-3xl transition-all duration-300
                                ${getBgClasses(tab.color, isActive)}
                                ${isActive ? 'scale-105' : 'hover:bg-white/25 hover:backdrop-blur-md'}
                            `}
                        >
                            <span className={`transition-all duration-300 ${getColorClasses(tab.color, isActive)} ${isActive ? 'scale-110' : ''}`}>
                                <Icon />
                            </span>
                            <span className={`
                                text-[10px] font-semibold mt-1 truncate w-full text-center
                                ${isActive ? getColorClasses(tab.color, true) : 'text-neutral-500'}
                            `}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
