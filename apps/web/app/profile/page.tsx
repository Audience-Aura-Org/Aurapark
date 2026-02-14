'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function ProfilePage() {
    const { isCollapsed } = useSidebar();
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            if (data.user) {
                setUser(data.user);
                setName(data.user.name);
                setPhone(data.user.phone || '');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await axios.patch('/api/users/profile', { name, phone });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    const hasSidebar = !!user;

    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <PageHeader
                        title="Account Profile"
                        subtitle="Manage your personal information and contact details."
                        breadcrumbs={['Home', 'Profile']}
                    />

                    <div className="max-w-2xl">
                        <div className="glass-card p-10">
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary-200">
                                        {name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-neutral-900 leading-tight">{name}</h3>
                                        <p className="text-neutral-500 font-bold text-sm">{user?.email}</p>
                                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                                            {user?.role?.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+237 ..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div>
                                        {message && (
                                            <p className={`text-sm font-bold ${message.includes('success') ? 'text-success-600' : 'text-danger-600'} animate-in fade-in slide-in-from-left-2`}>
                                                {message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[160px] shadow-lg shadow-primary-100"
                                        isLoading={saving}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
