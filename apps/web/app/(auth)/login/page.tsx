'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.post('/api/auth/login', { email, password });

            // Role-based redirection
            const role = data.user.role;
            if (role === 'ADMIN') {
                window.location.href = '/admin/dashboard';
            } else if (role === 'AGENCY_STAFF') {
                window.location.href = '/agency/dashboard';
            } else if (role === 'DRIVER') {
                window.location.href = '/driver/trips';
            } else {
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-primary-300/40 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Login Card */}
            <div className="max-w-md w-full glass-panel-strong p-10 relative z-10 animate-scale-in">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-inner-glow">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-gradient-green leading-none">
                            Aura Park
                        </span>
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-neutral-700 font-medium">
                        Sign in to access your account
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 glass-panel border-2 border-danger-300 rounded-2xl">
                        <p className="text-sm font-bold text-danger-700 text-center">{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        }
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-3 sm:gap-0">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 flex-shrink-0 rounded border-neutral-300 text-primary-400 focus:ring-primary-200" />
                            <span className="font-semibold text-neutral-700 whitespace-nowrap">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 glass-panel text-neutral-600 font-semibold">Or continue with</span>
                    </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <button className="glass-panel px-4 py-3 flex items-center justify-center gap-2 font-semibold text-neutral-700 hover:bg-white/80 transition-all hover:scale-105">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className="glass-panel px-4 py-3 flex items-center justify-center gap-2 font-semibold text-neutral-700 hover:bg-white/80 transition-all hover:scale-105">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-white/30">
                    <p className="text-sm font-medium text-neutral-700">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-black text-primary-600 hover:text-primary-700 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
