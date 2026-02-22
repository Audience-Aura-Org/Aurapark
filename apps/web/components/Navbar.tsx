'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';
import { useAuth } from './AuthProvider';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
    const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { user, loading, setUser } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark');
            setIsDark(isDarkMode);
        };
        
        checkDarkMode();
        
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        
        return () => observer.disconnect();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navLinks = {
        GUEST: [
            { label: 'Book', href: '/' },
            { label: 'Browse Trips', href: '/trips' },
            { label: 'Track', href: '/tracking' },
            { label: 'Support', href: '/support' },
        ],
        PASSENGER: [
            { label: 'Book', href: '/' },
            { label: 'Track', href: '/tracking' },
            { label: 'My Orders', href: '/orders' },
            { label: 'Support', href: '/support' },
        ],
        AGENCY_STAFF: [
            { label: 'Dashboard', href: '/agency/dashboard' },
            { label: 'Trips', href: '/agency/trips' },
            { label: 'Bookings', href: '/agency/bookings' },
            { label: 'Check-in', href: '/agency/check-in' },
            { label: 'Notifications', href: '/agency/notifications' },
        ],
        ADMIN: [
            { label: 'Dashboard', href: '/admin/dashboard' },
            { label: 'Agencies', href: '/admin/agencies' },
            { label: 'Users', href: '/admin/users' },
            { label: 'Payments', href: '/admin/payments' },
            { label: 'Reports', href: '/admin/reports' },
            { label: 'Settings', href: '/admin/settings' },
        ],
        DRIVER: [
            { label: 'My Trips', href: '/driver/trips' },
            { label: 'Support', href: '/support' },
        ]
    };

    const currentLinks = user ? (navLinks[user.role as keyof typeof navLinks] || navLinks.PASSENGER) : navLinks.GUEST;

    return (
        <nav className={`
            fixed top-0 left-0 right-0 z-[80] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${scrolled ? 'h-14 dark:bg-neutral-950/90 bg-white/90 backdrop-blur-md shadow-sm border-b dark:border-neutral-800 border-neutral-100' : 'h-16 dark:bg-neutral-950/50 bg-white/50 backdrop-blur-sm'}
            ${user ? (isCollapsed ? 'lg:pl-20' : 'lg:pl-72') : ''}
        `}>
            <div className="h-full flex items-center justify-center px-4 md:px-6 lg:px-8">
                <div className="w-full max-w-[2000px] h-full flex items-center justify-between gap-4">
                    {/* Logo & Platform ID */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <img 
                        src={isDark ? "/logo-white.png" : "/logo-black.png"}
                        alt="Aura Park Logo" 
                        className="h-9 w-auto object-contain"
                    />
                    <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        Aura Park
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                                ${pathname === link.href
                                    ? 'bg-neutral-900 dark:bg-purple-600 text-white'
                                    : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Controls */}
                <div className="flex items-center gap-2 md:gap-3 ml-auto">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {!loading && (
                        user ? (
                            <div className="hidden md:flex items-center gap-3">
                                {user.role === 'AGENCY_STAFF' && (
                                    <div className="text-xs font-semibold text-primary-600 dark:text-emerald-400 bg-primary-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
                                        Agency
                                    </div>
                                )}
                                <Link href="/profile" className="group" title={user.name}>
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 group-hover:border-neutral-900 dark:group-hover:border-neutral-500 transition-all overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 hover:text-danger-500 dark:hover:text-danger-400 transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-2 transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/register" className="text-xs font-semibold bg-neutral-900 dark:bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 dark:hover:bg-purple-700 transition-all">
                                    Register
                                </Link>
                            </div>
                        )
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        className="md:hidden min-w-[44px] min-h-[44px] p-2 -m-2 flex items-center justify-center text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-purple-500 rounded-lg relative z-[110] touch-manipulation transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (user) {
                                setIsMobileOpen(!isMobileOpen);
                            } else {
                                setMobileMenuOpen(!mobileMenuOpen);
                            }
                        }}
                        aria-expanded={user ? isMobileOpen : mobileMenuOpen}
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {(user ? isMobileOpen : mobileMenuOpen) ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
            </div>

            {/* Mobile Menu Overflow (Only for non-logged in users) */}
            {mobileMenuOpen && !user && (
                <div className="absolute top-full inset-x-0 z-[200] dark:bg-neutral-950/95 bg-white/95 backdrop-blur-xl dark:border-neutral-800 border-b border-neutral-100 shadow-2xl p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-3">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-5 py-4 rounded-2xl text-xs font-semibold transition-all
                                    ${pathname === link.href
                                        ? 'bg-neutral-900 dark:bg-purple-600 text-white shadow-lg'
                                        : 'text-neutral-600 dark:text-neutral-300 active:bg-neutral-100 dark:active:bg-neutral-800 active:scale-95'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}


