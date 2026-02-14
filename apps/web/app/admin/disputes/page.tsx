'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const { data } = await axios.get('/api/disputes');
            setDisputes(data.disputes || []);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Platform Disputes"
                subtitle="Manage escalated disputes and arbitration"
                breadcrumbs={['Admin', 'Disputes']}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Pending Review</div>
                    <div className="text-3xl font-black text-warning-600">5</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">In Progress</div>
                    <div className="text-3xl font-black text-primary-600">8</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Resolved</div>
                    <div className="text-3xl font-black text-success-600">142</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Resolution Time</div>
                    <div className="text-3xl font-black text-neutral-900">2.4d</div>
                </div>
            </div>

            {/* Disputes List */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6">Escalated Disputes</h2>
                {disputes.length > 0 ? (
                    <div className="space-y-4">
                        {disputes.map((dispute: any, index: number) => (
                            <div key={dispute._id || index} className="glass-panel p-6 rounded-xl hover:bg-white/60 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-danger-400 to-danger-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900">Dispute #{dispute.id || `AD${index + 1}`}</h3>
                                            <p className="text-sm text-neutral-600 mt-1">{dispute.reason || 'Escalated customer complaint'}</p>
                                            <p className="text-xs text-neutral-500 mt-2">Agency: {dispute.agencyName || 'Transport Co'} • Customer: {dispute.customerName || 'John Doe'}</p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        dispute.status === 'PENDING' ? 'warning' :
                                            dispute.status === 'IN_PROGRESS' ? 'info' :
                                                'success'
                                    } size="sm">
                                        {dispute.status || 'PENDING'}
                                    </Badge>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="primary" size="sm">Review</Button>
                                    <Button variant="glass" size="sm">View Details</Button>
                                    <Button variant="glass" size="sm">Arbitrate</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title="No Escalated Disputes"
                        description="All disputes are being handled at the agency level."
                    />
                )}
            </div>
        </div>
    );
}
