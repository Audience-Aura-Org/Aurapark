'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyRolesPage() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await axios.get('/api/agency/roles');
            setStaff(data.staff || []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Operational Hierarchy"
                subtitle="Personnel management and tactical authorization protocols"
                breadcrumbs={['Agency', 'Staff']}
                actions={
                    <Button variant="primary">Onboard Personnel</Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hierarchy Overview */}
                <div className="glass-panel p-8 text-center border-b-4 border-indigo-600">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👑</div>
                    <div className="text-xl font-black text-neutral-900 tracking-tighter">Command</div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Founders & Owners</div>
                </div>
                <div className="glass-panel p-8 text-center border-b-4 border-primary-600">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🛂</div>
                    <div className="text-xl font-black text-neutral-900 tracking-tighter">Oversight</div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Managers & Admins</div>
                </div>
                <div className="glass-panel p-8 text-center border-b-4 border-success-600">
                    <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🛠️</div>
                    <div className="text-xl font-black text-neutral-900 tracking-tighter">Deployment</div>
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Operators & Logistics</div>
                </div>
            </div>

            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Personnel Registry</h2>
                    <Badge variant="info">SYSTEM ENCRYPTED</Badge>
                </div>

                {staff.length > 0 ? (
                    <div className="space-y-4">
                        {staff.map((member) => (
                            <div key={member._id} className="flex flex-wrap items-center justify-between gap-4 p-6 bg-white/40 border border-neutral-100 rounded-[2rem] hover:bg-white transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-50 flex items-center justify-center font-black text-neutral-400 group-hover:from-primary-400 group-hover:to-primary-200 group-hover:text-white transition-all duration-500">
                                        {member.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-neutral-900 tracking-tighter">{member.name}</h3>
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase font-mono">{member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <Badge variant="info" size="sm" className="bg-primary-50 text-primary-700 border-none h-6 font-black scale-90">
                                            {member.role}
                                        </Badge>
                                        <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mt-1">Operational Role</div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="scale-75 opacity-40 group-hover:opacity-100">Audit Permissions</Button>
                                    <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="👥"
                        title="Hierarchy Void"
                        description="Deployment of agency personnel will finalize the operational chain."
                    />
                )}
            </div>
        </div>
    );
}
