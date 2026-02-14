'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function AdminProfilePage() {
    const [admin, setAdmin] = useState({
        name: 'System Administrator',
        email: 'admin@transport.cm',
        role: 'SUPER_ADMIN',
        permissions: [
            'READ_ALL_DATA',
            'WRITE_SYSTEM_CONFIG',
            'MANAGE_AGENCIES',
            'ARBITRATE_DISPUTES',
            'PROCESS_SETTLEMENTS',
            'VIEW_AUDIT_LOGS'
        ],
        twoFactorEnabled: true,
        lastActive: new Date()
    });

    return (
        <div className="space-y-6 max-w-4xl">
            <PageHeader
                title="Admin Profile & Access"
                subtitle="Manage your administrative credentials and security preferences"
                breadcrumbs={['Admin', 'Profile']}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-6 text-center bg-neutral-900 text-white">
                        <div className="w-24 h-24 bg-primary-400 rounded-3xl flex items-center justify-center text-neutral-900 font-black text-4xl mx-auto mb-6 shadow-2xl">
                            AD
                        </div>
                        <h2 className="text-xl font-black mb-1">{admin.name}</h2>
                        <Badge variant="orange" size="sm" className="mb-4">
                            {admin.role}
                        </Badge>
                        <div className="text-xs text-neutral-400 mt-2">
                            Member since Oct 2025
                        </div>
                    </div>

                    <div className="glass-panel p-6 space-y-4">
                        <h4 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Security Status</h4>
                        <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl border border-success-100">
                            <span className="text-xs font-bold text-success-700">2FA Active</span>
                            <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                        </div>
                        <Button variant="glass" size="sm" className="w-full">Change Password</Button>
                    </div>
                </div>

                {/* Permissions & Settings */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-xl font-black text-neutral-900">Your Permissions</h3>
                        <div className="flex flex-wrap gap-2">
                            {admin.permissions.map(perm => (
                                <div key={perm} className="px-3 py-1.5 bg-neutral-100/50 border border-neutral-200 rounded-lg text-[10px] font-black text-neutral-600 uppercase tracking-tight">
                                    {perm.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 italic mt-4">
                            Your permissions are managed by the System Root. Contact IT for access level adjustments.
                        </p>
                    </div>

                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-xl font-black text-neutral-900">Active Session</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">Current Device</div>
                                    <div className="text-xs text-neutral-500">Windows 11 • Chrome 120.0.0</div>
                                </div>
                                <Badge variant="success" size="sm">Active Now</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">IP Address</div>
                                    <div className="text-xs text-neutral-500">197.243.12.XXX (Yaounde, CM)</div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-danger-500">Logout</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
