'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

function downloadCSV(rows: any[][], filename: string) {
    const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function AgencyFinanceTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await axios.get('/api/agency/settlements');
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => transactions.filter(tx => {
        const typeOk = typeFilter === 'ALL' || tx.txType === typeFilter;
        const statusOk = statusFilter === 'ALL' || tx.paymentStatus === statusFilter;
        return typeOk && statusOk;
    }), [transactions, typeFilter, statusFilter]);

    const totalGross = filtered.reduce((s, tx) => s + (tx.totalAmount || tx.price || 0), 0);
    const totalNet = totalGross * 0.9;

    const handleExportCSV = () => {
        const rows = [
            ['Date', 'Reference', 'Type', 'Gross Amount (XAF)', 'Net Earnings (XAF)', 'Payment Status'],
            ...filtered.map(tx => {
                const amount = tx.totalAmount || tx.price || 0;
                return [
                    new Date(tx.createdAt).toLocaleDateString(),
                    tx.pnr || tx.trackingNumber || tx._id?.slice(-8).toUpperCase(),
                    tx.txType,
                    amount,
                    (amount * 0.9).toFixed(0),
                    tx.paymentStatus,
                ];
            }),
        ];
        downloadCSV(rows, `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Transaction Ledger"
                subtitle="Complete history of all bookings and shipment payments"
                breadcrumbs={['Agency', 'Finance', 'Transactions']}
                actions={<Button variant="glass" onClick={handleExportCSV}>Download CSV</Button>}
            />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Showing</div>
                    <div className="text-3xl font-black text-neutral-900">{filtered.length}</div>
                    <div className="text-xs text-neutral-400 mt-1">of {transactions.length} transactions</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Gross Total</div>
                    <div className="text-2xl font-black text-neutral-900">XAF {totalGross.toLocaleString()}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Net Earnings</div>
                    <div className="text-2xl font-black text-success-600">XAF {totalNet.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400 mt-1">After 10% platform fee</div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Type:</span>
                    {['ALL', 'BOOKING', 'SHIPMENT'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${typeFilter === t ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-500 uppercase">Status:</span>
                    {['ALL', 'PAID', 'PENDING', 'CANCELLED'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${statusFilter === s ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                {(typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                    <button onClick={() => { setTypeFilter('ALL'); setStatusFilter('ALL'); }}
                        className="text-xs font-bold text-danger-500 hover:text-danger-700 transition-colors ml-auto">
                        ✕ Clear Filters
                    </button>
                )}
            </div>

            {/* Ledger */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Gross</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Net (90%)</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.length > 0 ? filtered.map((tx) => {
                                const amount = tx.totalAmount || tx.price || 0;
                                return (
                                    <tr key={tx._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-neutral-500 font-mono">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{tx.txType === 'SHIPMENT' ? '📦' : '🎫'}</span>
                                                <span className="font-black text-neutral-900 text-xs">
                                                    {tx.pnr || tx.trackingNumber || tx._id?.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                                                {tx.txType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-black text-neutral-900 text-sm">
                                            XAF {amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-black text-success-600 text-sm">
                                            XAF {(amount * 0.9).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Badge
                                                variant={tx.paymentStatus === 'PAID' ? 'success' : tx.paymentStatus === 'CANCELLED' ? 'danger' : 'warning'}
                                                size="sm"
                                            >
                                                {tx.paymentStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20">
                                        <EmptyState
                                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                                            title="No Transactions"
                                            description="No transactions match the current filters."
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
