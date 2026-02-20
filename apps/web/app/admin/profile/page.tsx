'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function AdminProfilePage() {
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [changingPassword, setChangingPassword] = useState(false);
    const [pwData, setPwData] = useState({ current: '', newPw: '', confirm: '' });
    const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/auth/me')
            .then(({ data }) => setAdmin(data.user || data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwData.newPw !== pwData.confirm) {
            setPwMsg({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setSaving(true);
        try {
            await axios.patch('/api/auth/change-password', { currentPassword: pwData.current, newPassword: pwData.newPw });
            setPwMsg({ type: 'success', text: 'Password changed successfully.' });
            setPwData({ current: '', newPw: '', confirm: '' });
            setChangingPassword(false);
        } catch (err: any) {
            setPwMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password.' });
        } finally {
            setSaving(false);
            setTimeout(() => setPwMsg(null), 5000);
        }
    };

    const initials = admin?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl">
            <PageHeader
                title="Admin Profile"
                subtitle="Manage your administrative credentials and account preferences"
                breadcrumbs={['Admin', 'Profile']}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-6 text-center bg-neutral-900 text-white">
                        <div className="w-24 h-24 bg-primary-400 rounded-3xl flex items-center justify-center text-neutral-900 font-black text-4xl mx-auto mb-6 shadow-2xl">
                            {initials}
                        </div>
                        <h2 className="text-xl font-black mb-1">{admin?.name || 'Administrator'}</h2>
                        <div className="text-sm text-neutral-400 mb-3">{admin?.email}</div>
                        <Badge variant="orange" size="sm">{admin?.role || 'ADMIN'}</Badge>
                        {admin?.createdAt && (
                            <div className="text-xs text-neutral-500 mt-4">
                                Member since {new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </div>
                        )}
                    </div>

                    <div className="glass-panel p-6 space-y-4">
                        <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Security</h4>
                        <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl border border-success-100">
                            <span className="text-xs font-bold text-success-700">Session Active</span>
                            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                        </div>
                        <Button
                            variant="glass"
                            size="sm"
                            className="w-full"
                            onClick={() => setChangingPassword(!changingPassword)}
                        >
                            {changingPassword ? 'Cancel' : 'Change Password'}
                        </Button>

                        {changingPassword && (
                            <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                                {pwMsg && (
                                    <div className={`text-xs font-bold rounded-xl p-3 ${pwMsg.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                                        {pwMsg.text}
                                    </div>
                                )}
                                {[
                                    { key: 'current', label: 'Current Password' },
                                    { key: 'newPw', label: 'New Password' },
                                    { key: 'confirm', label: 'Confirm New Password' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">{label}</label>
                                        <input
                                            type="password"
                                            value={(pwData as any)[key]}
                                            onChange={e => setPwData(p => ({ ...p, [key]: e.target.value }))}
                                            required
                                            className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                                        />
                                    </div>
                                ))}
                                <Button type="submit" variant="primary" size="sm" className="w-full" isLoading={saving}>
                                    Update Password
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-xl font-black text-neutral-900">Account Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Full Name', value: admin?.name },
                                { label: 'Email Address', value: admin?.email },
                                { label: 'Phone', value: admin?.phone || 'Not set' },
                                { label: 'Role', value: admin?.role },
                                { label: 'User ID', value: admin?._id?.slice(-12).toUpperCase(), mono: true },
                                { label: 'Last Login', value: admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'This session' },
                            ].map(({ label, value, mono }) => (
                                <div key={label}>
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1">{label}</div>
                                    <div className={`text-sm font-semibold text-neutral-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-black text-neutral-900 mb-4">Active Session</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">Current Browser</div>
                                    <div className="text-xs text-neutral-500">Authenticated via platform cookie</div>
                                </div>
                                <Badge variant="success" size="sm">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">Session Started</div>
                                    <div className="text-xs text-neutral-500">Your current admin session</div>
                                </div>
                                <Button
                                    variant="glass"
                                    size="sm"
                                    className="text-danger-500"
                                    onClick={() => { document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; window.location.href = '/login'; }}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
