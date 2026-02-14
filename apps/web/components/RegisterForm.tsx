'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Input } from './Input';
import { Button } from './Button';
import Link from 'next/link';
import { UserRole } from '@/lib/models/User'; // We'll just hardcode options for client to avoid importing server code directly if causing issues, but Enum import is fine usually.

export default function RegisterForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'USER' // Default
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/register', form);
            // Auto login or redirect to login? Let's redirect to login for now.
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass p-8 w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
                    {error}
                </div>
            )}

            <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
            />

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

            {/* Role Selection - In production, this might be restricted or separate flows */}
            <div className="mb-6">
                <label className="block text-gray-200 text-sm font-bold mb-2 ml-1">
                    Account Type
                </label>
                <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent [&>option]:text-black"
                >
                    <option value="USER">Passenger</option>
                    <option value="AGENCY_STAFF">Agency Staff</option>
                    <option value="DRIVER">Driver</option>
                </select>
            </div>

            <Button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <p className="mt-6 text-center text-gray-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-secondary hover:text-white transition-colors">
                    Sign In
                </Link>
            </p>
        </form>
    );
}
