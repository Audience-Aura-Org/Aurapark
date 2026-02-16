'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: any;
    loading: boolean;
    setUser: (user: any) => void;
    refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refetchUser = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refetchUser();
    }, []);

    // Handle auth/role guarding for protected routes
    useEffect(() => {
        if (loading || !pathname) return;

        const path = pathname;
        const roleProtectedPaths = ['/agency', '/admin', '/driver', '/profile', '/orders', '/bookings'];
        const isRolePath = roleProtectedPaths.some(p => path.startsWith(p));

        // If not logged in and trying to access a protected area, send home
        if (!user && isRolePath) {
            router.push('/');
            return;
        }

        // If logged in, enforce basic role-to-area mapping
        if (user) {
            const role = user.role;

            if (path.startsWith('/admin') && role !== 'ADMIN') {
                router.push('/');
                return;
            }

            if (path.startsWith('/agency') && role !== 'AGENCY_STAFF') {
                router.push('/');
                return;
            }

            if (path.startsWith('/driver') && role !== 'DRIVER') {
                router.push('/');
                return;
            }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, loading, setUser, refetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
