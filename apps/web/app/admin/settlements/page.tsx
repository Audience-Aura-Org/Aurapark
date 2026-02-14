'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AdminSettlementsPage() {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/admin/settlements');
            setSettlements(data.settlements || []);
        } catch (error) {
            console.error('Failed to fetch settlements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (id: string, status: 'PAID' | 'FAILED') => {
        if (!confirm(`Are you sure you want to mark this payout as ${status}?`)) return;

        setProcessing(id);
        try {
            const transactionId = status === 'PAID' ? prompt('Enter Payment Provider Transaction ID (Optional):') : '';
            await axios.patch(`/api/admin/settlements/${id}`, {
                status,
                transactionId: transactionId || undefined
            });
            fetchSettlements();
        } catch (error) {
            console.error('Failed to process payout:', error);
            alert('Error processing payout. Please check logs.');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Settlements & Payouts"
                subtitle="Manage agency withdrawal requests and financial distributions"
                breadcrumbs={['Admin', 'Settlements']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">Download Ledger</Button>
                    </div>
                }
            />

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Pending Requests</div>
                    <div className="text-3xl font-black text-warning-600">
                        {settlements.filter(s => s.status === 'PENDING').length}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Processing</div>
                    <div className="text-3xl font-black text-primary-600">
                        {settlements.filter(s => s.status === 'PROCESSING').length}
                    </div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Total Paid (MTD)</div>
                    <div className="text-3xl font-black text-success-600">XAF 12.4M</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Rejected/Failed</div>
                    <div className="text-3xl font-black text-danger-600">3</div>
                </div>
            </div>

            {/* Settlements List */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Gross</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Net (Payout)</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : settlements.length > 0 ? (
                                settlements.map((s) => (
                                    <tr key={s._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900">{s.agencyId?.name}</div>
                                            <div className="text-xs text-neutral-600">{s.agencyId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-neutral-900">{s.period}</div>
                                            <div className="text-xs text-neutral-500">Requested: {format(new Date(s.createdAt), 'MMM d, yyyy')}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-neutral-600">
                                            XAF {(s.grossRevenue || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900">XAF {(s.netRevenue || 0).toLocaleString()}</div>
                                            <div className="text-[10px] font-bold text-danger-500">Fee: XAF {(s.platformFee || 0).toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                s.status === 'PAID' ? 'success' :
                                                    s.status === 'PENDING' ? 'warning' :
                                                        s.status === 'PROCESSING' ? 'info' : 'danger'
                                            } size="sm">
                                                {s.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {s.status === 'PENDING' || s.status === 'PROCESSING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleProcessPayout(s._id, 'PAID')}
                                                        isLoading={processing === s._id}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                    <Button
                                                        variant="glass"
                                                        size="sm"
                                                        onClick={() => handleProcessPayout(s._id, 'FAILED')}
                                                        isLoading={processing === s._id}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-xs font-bold text-neutral-400">
                                                    {s.paidOn ? `Paid: ${format(new Date(s.paidOn), 'MMM d')}` : 'Finalized'}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <EmptyState
                                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            title="No Settlement Requests"
                                            description="There are currently no withdrawal requests from agencies."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
