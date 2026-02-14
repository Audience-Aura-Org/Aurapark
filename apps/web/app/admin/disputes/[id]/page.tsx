'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [dispute, setDispute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [arbitrating, setArbitrating] = useState(false);
    const [resolution, setResolution] = useState({
        summary: '',
        refundAmount: 0
    });

    useEffect(() => {
        if (id) fetchDispute();
    }, [id]);

    const fetchDispute = async () => {
        try {
            const { data } = await axios.get(`/api/disputes/${id}`);
            setDispute(data.dispute);
            setResolution({
                summary: data.dispute.resolutionSummary || '',
                refundAmount: data.dispute.refundAmount || data.dispute.amountRequested || 0
            });
        } catch (error) {
            console.error('Failed to fetch dispute details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArbitrate = async (status: 'RESOLVED' | 'REFUNDED' | 'REJECTED') => {
        if (!resolution.summary) {
            alert('Please provide a resolution summary.');
            return;
        }

        setArbitrating(true);
        try {
            await axios.patch(`/api/disputes/${id}`, {
                status,
                resolutionSummary: resolution.summary,
                refundAmount: status === 'REFUNDED' ? resolution.refundAmount : 0
            });
            fetchDispute();
            alert(`Dispute ${status.toLowerCase()} successfully.`);
        } catch (error) {
            console.error('Arbitration failed:', error);
            alert('Error updating dispute. Check console.');
        } finally {
            setArbitrating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    if (!dispute) return (
        <EmptyState
            icon={<svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            title="Dispute Not Found"
            description="The dispute you are looking for does not exist or has been removed."
            action={<Link href="/admin/disputes"><Button variant="primary">Back to List</Button></Link>}
        />
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Dispute #${dispute.id || dispute._id.slice(-6).toUpperCase()}`}
                subtitle={`Reason: ${dispute.reason}`}
                breadcrumbs={['Admin', 'Disputes', 'Detail']}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 space-y-6">
                        <section>
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Claimant</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-700">
                                    {dispute.userId?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-neutral-900">{dispute.userId?.name}</div>
                                    <div className="text-xs text-neutral-600">{dispute.userId?.email}</div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Defendant (Agency)</h3>
                            <div className="text-sm font-black text-neutral-900">{dispute.agencyId?.name}</div>
                            <div className="text-xs text-neutral-600 mt-0.5">{dispute.agencyId?.email}</div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Booking Reference</h3>
                            <div className="text-sm font-black text-neutral-900 font-mono">PNR: {dispute.bookingId?.pnr}</div>
                            <div className="text-xs text-neutral-600 mt-1">
                                {dispute.bookingId?.tripId?.routeId?.routeName}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">Amount Requested</h3>
                            <div className="text-2xl font-black text-danger-600">XAF {(dispute.amountRequested || 0).toLocaleString()}</div>
                        </section>
                    </div>
                </div>

                {/* Arbitration Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-black text-neutral-900 mb-4">Customer's Statement</h3>
                        <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-neutral-800 text-sm leading-relaxed">
                            "{dispute.description || 'No detailed statement provided.'}"
                        </div>
                    </div>

                    <div className="glass-panel p-6 space-y-6">
                        <h3 className="text-xl font-black text-neutral-900">Admin Arbitration</h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-neutral-700 ml-1">Resolution Summary</label>
                                <textarea
                                    className="w-full h-32 px-4 py-3 rounded-2xl bg-white/50 border border-white/20 text-neutral-900 font-medium focus:ring-2 focus:ring-primary-400 outline-none transition-all resize-none"
                                    placeholder="Explain the reason for this decision..."
                                    value={resolution.summary}
                                    onChange={(e) => setResolution({ ...resolution, summary: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Refund Amount (if any)</label>
                                    <input
                                        type="number"
                                        className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-black focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                        value={resolution.refundAmount}
                                        onChange={(e) => setResolution({ ...resolution, refundAmount: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="flex items-end gap-3">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        onClick={() => handleArbitrate('REFUNDED')}
                                        isLoading={arbitrating}
                                    >
                                        Refund & Close
                                    </Button>
                                    <Button
                                        variant="glass"
                                        className="flex-1 text-danger-600 border-danger-100"
                                        onClick={() => handleArbitrate('REJECTED')}
                                        isLoading={arbitrating}
                                    >
                                        Reject Claim
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {dispute.resolvedAt && (
                            <div className="p-4 bg-success-50 border border-success-100 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                                <div>
                                    <div className="text-sm font-black text-success-900">This dispute has been resolved.</div>
                                    <div className="text-xs text-success-700">Status: {dispute.status} • Finalized on {new Date(dispute.resolvedAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
