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

    // Redirect to home if logged out on a role-protected page
    useEffect(() => {
        const roleProtectedPaths = ['/agency', '/admin', '/driver', '/profile', '/orders', '/bookings'];
        const isRolePath = roleProtectedPaths.some(path => pathname.startsWith(path));

        if (!loading && !user && isRolePath) {
            router.push('/');
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
