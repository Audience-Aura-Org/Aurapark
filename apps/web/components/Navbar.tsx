'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from './SidebarProvider';
import { useAuth } from './AuthProvider';

export default function Navbar() {
    const { isCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { user, loading, setUser } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
            { label: 'Financial', href: '/financial' },
            { label: 'Support', href: '/support' },
        ],
        PASSENGER: [
            { label: 'Book', href: '/' },
            { label: 'Track', href: '/tracking' },
            { label: 'My Orders', href: '/orders' },
            { label: 'Financial', href: '/financial' },
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
            fixed top-0 inset-x-0 z-[80] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${scrolled ? 'h-14 bg-white/90 backdrop-blur-md shadow-sm border-b border-neutral-100' : 'h-16 bg-white/50 backdrop-blur-sm'}
            ${user ? (isCollapsed ? 'lg:pl-20' : 'lg:pl-72') : ''}
        `}>
            <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between">
                {/* Logo & Platform ID */}
                <Link href="/" className="flex items-center gap-2 group">
                    <img src="/logo-black.png" alt="Aura Park Logo" className="h-9 w-auto object-contain" />
                    <span className="text-xs font-bold tracking-tight text-neutral-900 group-hover:text-primary-600 transition-colors">
                        Aura Park
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    {currentLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all
                                ${pathname === link.href
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* User Controls */}
                <div className="flex items-center gap-4">
                    {!loading && (
                        user ? (
                            <div className="flex items-center gap-3">
                                {user.role === 'AGENCY_STAFF' && (
                                    <div className="hidden sm:block text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                        Agency
                                    </div>
                                )}
                                <Link href="/profile" className="group">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600 group-hover:border-neutral-900 transition-all overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-[10px] font-semibold text-neutral-400 hover:text-red-500 transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login" className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 px-2 py-1">
                                    Sign In
                                </Link>
                                <Link href="/register" className="text-[10px] font-semibold bg-neutral-900 text-white px-3 py-1.5 rounded-md hover:bg-neutral-800 transition-all">
                                    Register
                                </Link>
                            </div>
                        )
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        className="md:hidden min-w-[44px] min-h-[44px] p-2 -m-2 flex items-center justify-center text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-lg relative z-[110] touch-manipulation"
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

            {/* Mobile Menu Overflow (Only for non-logged in users) */}
            {mobileMenuOpen && !user && (
                <div className="absolute top-full inset-x-0 z-[200] bg-white/95 backdrop-blur-xl border-b border-neutral-100 shadow-2xl p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-3">
                        {currentLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`px-5 py-4 rounded-2xl text-xs font-semibold transition-all
                                    ${pathname === link.href
                                        ? 'bg-neutral-900 text-white shadow-lg'
                                        : 'text-neutral-600 active:bg-neutral-100 active:scale-95'}`}
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


