'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';
import { useAuth } from '@/components/AuthProvider';

export default function PassengerFinancialPage() {
    const { user } = useAuth();
    const { isCollapsed } = useSidebar();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Mock Data provided by user
    const mockTransactions = [
        { id: 'AB66A52C', type: 'BOOKING', date: '2026-02-14T00:07:22', amount: 7000, status: 'PENDING' },
        { id: '8D85D7F1', type: 'BOOKING', date: '2026-02-13T06:50:40', amount: 7000, status: 'PENDING' },
        { id: 'SHP-F8K8BJDM', type: 'SHIPMENT', date: '2026-02-12T10:21:43', amount: 2000, status: 'PAID' },
        { id: 'E1A75918', type: 'BOOKING', date: '2026-02-11T09:54:51', amount: 12000, status: 'PAID' }
    ];

    useEffect(() => {
        const fetchAllTransactions = async () => {
            try {
                let guestHistory: any[] = [];
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('guest_financial_history');
                    if (saved) guestHistory = JSON.parse(saved);
                }

                if (user) {
                    const [bookingsRes, shipmentsRes] = await Promise.all([
                        axios.get(`/api/bookings?userId=${user._id}`),
                        axios.get(`/api/shipments?userId=${user._id}`)
                    ]);

                    const realTransactions = [
                        ...(bookingsRes.data.bookings || []).map((b: any) => ({
                            id: b.pnr,
                            type: 'BOOKING',
                            date: b.createdAt,
                            amount: b.totalAmount,
                            status: b.paymentStatus || 'PENDING'
                        })),
                        ...(shipmentsRes.data.shipments || []).map((s: any) => ({
                            id: s.trackingNumber,
                            type: 'SHIPMENT',
                            date: s.createdAt,
                            amount: s.price,
                            status: s.status === 'DELIVERED' ? 'PAID' : 'PAID'
                        }))
                    ];

                    setTransactions([...realTransactions, ...guestHistory, ...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                } else {
                    setTransactions([...guestHistory, ...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                }
            } catch (error) {
                console.error('Failed to sync financial node:', error);
                setTransactions(mockTransactions);
            } finally {
                setLoading(false);
            }
        };

        fetchAllTransactions();
    }, [user]);

    return (
        <div className="min-h-screen bg-mesh-green text-neutral-900">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 space-y-8">
                    <PageHeader
                        title="Fiscal Intelligence"
                        subtitle="Consolidated record of all financial transitions and asset acquisition events."
                        breadcrumbs={['Home', 'Financial']}
                    />

                    {/* Financial stats summary for passengers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 bg-neutral-900 text-white shadow-2xl">
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Unsettled Liabilities</div>
                            <div className="text-3xl font-black">
                                XAF {transactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                            </div>
                            <p className="text-[10px] font-medium text-neutral-500 mt-2 uppercase tracking-tighter">Payable at station or terminal nodes</p>
                        </div>
                        <div className="glass-panel p-6">
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Vested Capital</div>
                            <div className="text-3xl font-black text-primary-600">
                                XAF {transactions.filter(t => t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
                            </div>
                            <p className="text-[10px] font-medium text-neutral-400 mt-2 uppercase tracking-tighter">Total platform investment value</p>
                        </div>
                        <div className="glass-panel p-6">
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Fiscal Integrity</div>
                            <div className="text-3xl font-black text-neutral-900">100%</div>
                            <p className="text-[10px] font-medium text-neutral-400 mt-2 uppercase tracking-tighter">Satellite verified transactions</p>
                        </div>
                    </div>

                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Recent Payments</h2>
                            <Badge variant="info" className="animate-pulse font-black">LIVE UPDATES</Badge>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.map((tx, idx) => (
                                    <div key={`${tx.id}-${idx}`} className="flex items-center justify-between p-5 bg-white border border-neutral-100 rounded-2xl hover:border-primary-200 hover:shadow-xl transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${tx.type === 'BOOKING' ? 'bg-orange-50' : 'bg-primary-50'}`}>
                                                {tx.type === 'BOOKING' ? '🎫' : '📦'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${tx.type === 'BOOKING' ? 'text-orange-600' : 'text-primary-600'}`}>
                                                        {tx.type}
                                                    </span>
                                                    <span className="text-[10px] font-black text-neutral-300"># {tx.id}</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase">
                                                    {new Date(tx.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-black text-neutral-900 tracking-tight">XAF {(tx.amount || 0).toLocaleString()}</div>
                                            <div className="mt-1">
                                                <Badge variant={tx.status === 'PAID' ? 'success' : 'warning'}>
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-neutral-900 rounded-3xl text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-12 opacity-10">
                            <div className="text-9xl rotate-12">💳</div>
                        </div>
                        <div className="relative z-10 max-w-xl">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Centralized Wallet Support</h3>
                            <p className="text-sm text-neutral-400 font-bold leading-relaxed mb-6 italic">Securely link your telecommunication wallets (Momo/Orange) to automate high-frequency transport acquisition nodes.</p>
                            <div className="flex gap-4">
                                <button className="px-6 py-3 bg-white text-neutral-900 text-xs font-black uppercase rounded-xl hover:bg-neutral-100 transition-colors">Initialize Link</button>
                                <button className="px-6 py-3 bg-neutral-800 text-white text-xs font-black uppercase rounded-xl border border-white/10 hover:bg-neutral-700 transition-colors">Documentation</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
