'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const { data } = await axios.get('/api/agency/disputes');
            setDisputes(data.disputes || []);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id: string, status: string) => {
        if (!reason && (status === 'RESOLVED' || status === 'REJECTED')) {
            alert('Please provide a reason for this decision.');
            return;
        }

        try {
            await axios.patch('/api/agency/disputes', {
                id,
                status,
                resolutionSummary: reason
            });
            setReason('');
            setResolvingId(null);
            fetchDisputes();
        } catch (error) {
            console.error('Failed to resolve dispute:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Conflict Resolution Center"
                subtitle="High-priority arbitration of passenger-agency friction events"
                breadcrumbs={['Agency', 'Disputes']}
            />

            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic">Active Disputes Ledger</h2>
                    <Badge variant="warning">{disputes.filter(d => d.status === 'OPEN').length} CRITICAL EVENTS</Badge>
                </div>

                {disputes.length > 0 ? (
                    <div className="space-y-4">
                        {disputes.map((dispute) => (
                            <div key={dispute._id} className="p-6 bg-white/40 hover:bg-white rounded-3xl transition-all border border-neutral-100 group shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <Badge variant={dispute.status === 'OPEN' ? 'danger' : 'success'} size="sm" className="scale-75 origin-left">
                                                {dispute.status}
                                            </Badge>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">#{dispute._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-neutral-900 tracking-tighter">{dispute.subject}</h3>
                                        <p className="text-sm text-neutral-500 max-w-2xl">{dispute.description}</p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded">Passenger: {dispute.userId?.name}</div>
                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded">Registry: {dispute.bookingId?.pnr}</div>
                                        </div>
                                    </div>
                                    {dispute.status === 'OPEN' ? (
                                        <div className="w-full md:w-80 space-y-4">
                                            {resolvingId === dispute._id ? (
                                                <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                                                    <textarea
                                                        className="w-full h-24 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-400"
                                                        placeholder="Provide reason for resolution..."
                                                        value={reason}
                                                        onChange={(e) => setReason(e.target.value)}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button variant="primary" size="sm" onClick={() => handleResolve(dispute._id, 'RESOLVED')} className="flex-1 text-[10px] uppercase font-black">Approve</Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleResolve(dispute._id, 'REJECTED')} className="flex-1 text-[10px] uppercase font-black">Reject</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => { setResolvingId(null); setReason(''); }} className="text-[10px] uppercase font-black">Cancel</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="primary"
                                                    onClick={() => setResolvingId(dispute._id)}
                                                    className="w-full text-[10px] uppercase font-black tracking-widest h-12"
                                                >
                                                    Process Claim
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="md:text-right">
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Final Resolution</div>
                                            <p className="text-xs font-bold text-neutral-900 italic">"{dispute.resolutionSummary || 'Resolved via Platform Protocol'}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="🤝"
                        title="Conflict Matrix Clear"
                        description="All agency-passenger interactions are synchronized and harmonious."
                    />
                )}
            </div>
        </div>
    );
}
