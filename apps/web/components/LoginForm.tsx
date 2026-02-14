'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from './Input';
import { Button } from './Button';
import Link from 'next/link';

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/login', form);
            router.push('/dashboard'); // or /admin depending on role, handled by middleware later
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass p-8 w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
            />

            <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
            />

            <Button type="submit" disabled={loading} className="mt-4">
                {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="mt-6 text-center text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-secondary hover:text-white transition-colors">
                    Create Account
                </Link>
            </p>
        </form>
    );
}
