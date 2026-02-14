'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgencyFinancePage() {
    const [stats, setStats] = useState<any>({
        totalRevenue: 0,
        pendingSettlements: 0,
        thisMonthEarnings: 0,
        lastMonthEarnings: 0,
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchFinanceStats();
    }, []);

    const fetchFinanceStats = async () => {
        try {
            const { data } = await axios.get('/api/agency/settlements');
            setStats({
                totalRevenue: data.stats?.totalRevenue || 0,
                totalEarnings: data.stats?.totalEarnings || 0,
                pendingSettlements: data.stats?.pendingPayout || 0,
                thisMonthEarnings: data.stats?.netRevenue || 0,
                lastMonthEarnings: (data.stats?.netRevenue || 0) * 0.85,
                recentTransactions: data.transactions?.slice(0, 5) || [],
                bookingRevenue: data.stats?.bookingRevenue || 0,
                shipmentRevenue: data.stats?.shipmentRevenue || 0,
                bookingCount: data.stats?.currentMonth?.bookings || 0,
                shipmentCount: data.stats?.currentMonth?.shipments || 0
            });
        } catch (error) {
            console.error('Failed to fetch finance stats:', error);
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
                title="Financial Overview"
                subtitle="Track your income, payments, and total earnings."
                breadcrumbs={['Agency', 'Finance']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass">Download Report</Button>
                        <Button
                            variant="primary"
                            type="button"
                            onClick={() => router.push('/agency/settlements')}
                        >
                            Request Payment
                        </Button>
                    </div>
                }
            />

            {/* Financial Multi-Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 12a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    </div>
                    <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-3xl font-black">XAF {stats.totalRevenue.toLocaleString()}</div>
                    <div className="mt-4 flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="opacity-60">BOOKINGS:</span>
                            <span>XAF {(stats.bookingRevenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="opacity-60">SHIPMENTS:</span>
                            <span>XAF {(stats.shipmentRevenue || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pending Payout</div>
                    <div className="text-3xl font-black text-neutral-900">XAF {stats.pendingSettlements.toLocaleString()}</div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary-500 h-full w-[65%]" />
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Earnings This Month</div>
                    <div className="text-3xl font-black text-success-600">XAF {stats.thisMonthEarnings.toLocaleString()}</div>
                    <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase">
                        {stats.bookingCount || 0} Bookings | {stats.shipmentCount || 0} Shipments
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Estimated Tax</div>
                    <div className="text-3xl font-black text-neutral-900">XAF {(stats.totalRevenue * 0.05).toLocaleString()}</div>
                    <div className="mt-4 text-[10px] font-bold text-neutral-400 uppercase underline cursor-pointer hover:text-primary-600">Review Tax Obligations</div>
                </div>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/agency/finance/transactions" className="glass-panel p-8 hover:bg-white/90 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tighter mb-2">Transactions</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">Immutable record of every monetary event synchronized across the platform infrastructure.</p>
                </Link>

                <Link href="/agency/finance/invoices" className="glass-panel p-8 hover:bg-white/90 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tighter mb-2">Invoices</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">Smart invoicing system for corporate clients and recurring agency settlements.</p>
                </Link>

                <Link href="/agency/finance/payouts" className="glass-panel p-8 hover:bg-white/90 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center text-success-600 mb-6 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tighter mb-2">Payout History</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">Manage your payments and verify your earnings across all channels.</p>
                </Link>
            </div>

            {/* Recent Fiscal Events */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Recent Payments</h2>
                    <Badge variant="info" className="animate-pulse">LIVE UPDATES</Badge>
                </div>

                <div className="space-y-3">
                    {stats.recentTransactions.map((tx: any) => (
                        <div key={tx._id} className="flex items-center justify-between p-4 bg-white/50 border border-white/40 rounded-xl hover:bg-white transition-all shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs ${tx.txType === 'SHIPMENT' ? 'bg-primary-100 text-primary-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {tx.txType === 'SHIPMENT' ? '📦' : '🎫'}
                                </div>
                                <div>
                                    <div className="font-black text-neutral-900 text-sm">
                                        {tx.txType}: {tx.pnr || tx.trackingNumber || tx._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{new Date(tx.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-neutral-900">XAF {(tx.totalAmount || tx.price || 0).toLocaleString()}</div>
                                <div className={`text-[10px] font-black uppercase ${tx.paymentStatus === 'PAID' ? 'text-success-600' : 'text-amber-600'}`}>
                                    {tx.paymentStatus}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
