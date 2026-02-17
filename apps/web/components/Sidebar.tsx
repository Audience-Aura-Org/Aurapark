'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import axios from 'axios';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    roles?: string[];
}

const navItems: NavItem[] = [
    // Admin Navigation
    {
        label: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Agencies',
        href: '/admin/agencies',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Trips Management',
        href: '/admin/trips',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Bookings',
        href: '/admin/bookings',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Disputes',
        href: '/admin/disputes',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Revenue',
        href: '/admin/payments',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Settlements',
        href: '/admin/settlements',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Reports',
        href: '/admin/reports',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Settings',
        href: '/admin/settings',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'System Audit',
        href: '/admin/audit',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
        roles: ['ADMIN']
    },
    {
        label: 'Users',
        href: '/admin/users',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        roles: ['ADMIN']
    },

    // Agency Navigation
    {
        label: 'Dashboard',
        href: '/agency/dashboard',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Manage Trips',
        href: '/agency/trips',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Routes',
        href: '/agency/routes',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Bookings',
        href: '/agency/bookings',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Check-In',
        href: '/agency/check-in',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Shipments',
        href: '/agency/shipments',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Orders',
        href: '/agency/orders',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Customers',
        href: '/agency/customers',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Drivers',
        href: '/agency/drivers',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Fleet Management',
        href: '/agency/fleet',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Live Tracking',
        href: '/agency/tracking',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Finance',
        href: '/agency/finance',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Settlements',
        href: '/agency/settlements',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Disputes',
        href: '/agency/disputes',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Reports',
        href: '/agency/reports',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Marketing',
        href: '/agency/marketing',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Support',
        href: '/agency/support',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Notifications',
        href: '/agency/notifications',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Roles & Staff',
        href: '/agency/roles',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Settings',
        href: '/agency/settings',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Design',
        href: '/agency/design',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-3M9.707 3.293l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 0z" /></svg>,
        roles: ['AGENCY_STAFF']
    },
    {
        label: 'Audit Logs',
        href: '/agency/audit',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        roles: ['AGENCY_STAFF']
    },

    // Driver Navigation
    {
        label: 'My Trips',
        href: '/driver/trips',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        roles: ['DRIVER']
    },
    // User (Passenger) Navigation
    {
        label: 'Book Trip',
        href: '/',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        roles: ['USER']
    },
    {
        label: 'Track Delivery',
        href: '/tracking',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
        roles: ['USER']
    },
    {
        label: 'My Orders',
        href: '/orders',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
        roles: ['USER']
    },
    {
        label: 'My Bookings',
        href: '/bookings',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
        roles: ['USER']
    },
    {
        label: 'My Disputes',
        href: '/disputes',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
        roles: ['USER']
    },
    {
        label: 'My Profile',
        href: '/profile',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        roles: ['USER']
    },
    {
        label: 'Support',
        href: '/support',
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        roles: ['USER']
    },
];

import { useSidebar } from './SidebarProvider';

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
    const { user, loading } = useAuth();

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item =>
        !item.roles || (user && item.roles.includes(user.role))
    );

    if (loading) {
        return (
            <aside className={`fixed top-0 left-0 h-full z-[100] glass-panel-strong border-r border-white/20 transition-all ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
                </div>
            </aside>
        );
    }

    if (!user) return null;

    return (
        <>
            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-full z-[100]
                bg-white border-r border-neutral-100
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
                overflow-hidden flex flex-col
            `}>
                <div className="h-20 flex items-center px-4 border-b border-neutral-50 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                            <img src="/logo-black.png" alt="Aura Park" className="w-10 h-10 object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                                <h1 className="text-sm font-black text-neutral-900 tracking-tighter leading-none">AURA PARK</h1>
                                <p className="text-[10px] font-semibold text-primary-600 mt-0.5">Network</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col h-full p-4 gap-2">
                    {/* User Profile Hook */}
                    <div className={`
                        p-3 rounded-2xl transition-all duration-300
                        ${isCollapsed ? 'bg-transparent' : 'bg-neutral-50'}
                        flex items-center gap-3 mb-4
                    `}>
                        <div className="w-10 h-10 bg-gradient-to-br from-neutral-800 to-black rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
                                <div className="text-xs font-black text-neutral-900 truncate">{user.name || 'User'}</div>
                                <div className="text-[10px] font-medium text-neutral-400">{user.role?.replace('_', ' ')}</div>
                            </div>
                        )}
                    </div>

                    {/* Main Scrollable Navigation */}
                    <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar py-2">
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={`
                                        flex items-center gap-4 px-4 py-3.5 rounded-2xl
                                        transition-all duration-200 group relative
                                        ${isActive
                                            ? 'bg-primary-600 text-white shadow-xl shadow-primary-100'
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                        }
                                        ${isCollapsed ? 'lg:justify-center lg:px-0 lg:w-12 lg:mx-auto' : ''}
                                    `}
                                >
                                    <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-primary-600'}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="text-[11px] font-semibold animate-in fade-in slide-in-from-left-2">
                                            {item.label}
                                        </span>
                                    )}

                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Utility Actions */}
                    <div className="pt-4 border-t border-neutral-100 space-y-2">
                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`
                                hidden lg:flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl
                                text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all
                                ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}
                            `}
                        >
                            <svg className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                            </svg>
                            {!isCollapsed && <span className="text-[11px] font-semibold">Collapse view</span>}
                        </button>

                        {/* Sign Out */}
                        <button
                            onClick={async () => {
                                await axios.post('/api/auth/logout');
                                window.location.href = '/login';
                            }}
                            className={`
                                flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl
                                text-danger-500 hover:bg-danger-50 transition-all
                                ${isCollapsed ? 'justify-center px-0 w-12 mx-auto' : ''}
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {!isCollapsed && <span className="text-[11px] font-semibold">Sign out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile / Interaction Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[95] animate-in fade-in duration-300"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}

