'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyFinanceTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            // Aggregating from multiple sources would be ideal, 
            // but for now we'll use bookings and label them as revenue events.
            const { data } = await axios.get('/api/agency/settlements');
            setTransactions(data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch fiscal ledger:', error);
        } finally {
            setLoading(false);
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
                title="Financial Ledger"
                subtitle="Complete history of all payments and earnings for your agency."
                breadcrumbs={['Agency', 'Finance', 'Ledger']}
                actions={
                    <Button variant="glass">Download CSV</Button>
                }
            />

            {/* Fiscal Filter/Control Bar */}
            <div className="glass-panel p-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Category</label>
                    <select className="w-full bg-white border border-neutral-100 rounded-lg p-2 text-xs font-bold uppercase text-neutral-900">
                        <option>All Payments</option>
                        <option>Bookings</option>
                        <option>Shipments</option>
                        <option>Expenses</option>
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Month</label>
                    <select className="w-full bg-white border border-neutral-100 rounded-lg p-2 text-xs font-bold uppercase text-neutral-900">
                        <option>February 2026</option>
                        <option>January 2026</option>
                        <option>Q1 2026</option>
                    </select>
                </div>
                <div className="flex-none pt-6">
                    <Button variant="primary" size="sm">Filter List</Button>
                </div>
            </div>

            {/* Ledger List */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Payment History</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-neutral-400">Live updates active</span>
                    </div>
                </div>

                {transactions.length > 0 ? (
                    <div className="space-y-2">
                        <div className="hidden lg:grid grid-cols-7 px-4 py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 mb-4">
                            <div>Date</div>
                            <div>Reference</div>
                            <div>Type</div>
                            <div>Gross Amount</div>
                            <div>Net Earnings</div>
                            <div>Method</div>
                            <div className="text-right">Status</div>
                        </div>
                        {transactions.map((tx) => {
                            const amount = tx.totalAmount || tx.price || 0;
                            const net = amount * 0.9;
                            return (
                                <div key={tx._id} className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center p-4 bg-white/40 hover:bg-white rounded-xl transition-all border border-transparent hover:border-neutral-100 group">
                                    <div className="text-xs font-bold text-neutral-500 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                    <div className="font-black text-neutral-900 text-xs truncate max-w-[80px]">{tx.pnr || tx.trackingNumber || tx._id.slice(-8).toUpperCase()}</div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] shrink-0 ${tx.txType === 'SHIPMENT' ? 'bg-primary-100 text-primary-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {tx.txType === 'SHIPMENT' ? '📦' : '🎫'}
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-neutral-500">{tx.txType || 'REVENUE'}</span>
                                    </div>
                                    <div className="font-black text-neutral-900 text-xs">XAF {amount.toLocaleString()}</div>
                                    <div className="font-black text-success-600 text-xs">XAF {net.toLocaleString()}</div>
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase truncate">System Gateway</div>
                                    <div className="text-right">
                                        <Badge variant={tx.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm" className="scale-75 origin-right">
                                            {tx.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon="🏦"
                        title="No transactions found"
                        description="Your agency's payment history will appear here once activity starts."
                    />
                )}
            </div>
        </div>
    );
}
