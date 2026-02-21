'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/register', form);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating Orbs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary-300/40 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Register Card */}
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
                        Create Account
                    </h1>
                    <p className="text-neutral-700 font-medium">
                        Join thousands of travelers worldwide
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
                        label="Full Name"
                        placeholder="John Doe"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wide">
                            Account Type
                        </label>
                        <select
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            className="input-glass"
                        >
                            <option value="USER">Passenger</option>
                            <option value="AGENCY_STAFF">Agency Staff</option>
                            <option value="DRIVER">Driver</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <input type="checkbox" required className="w-4 h-4 flex-shrink-0 mt-0.5 rounded border-neutral-300 text-primary-400 focus:ring-primary-200" />
                        <label className="text-sm font-medium text-neutral-700">
                            I agree to the{' '}
                            <Link href="/terms" className="font-bold text-primary-600 hover:text-primary-700">
                                Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="font-bold text-primary-600 hover:text-primary-700">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        isLoading={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-white/30 mt-8">
                    <p className="text-sm font-medium text-neutral-700">
                        Already have an account?{' '}
                        <Link href="/login" className="font-black text-primary-600 hover:text-primary-700 transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
