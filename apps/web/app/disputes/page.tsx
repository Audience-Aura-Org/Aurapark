'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function PassengerDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchUserAndDisputes();
    }, []);

    const fetchUserAndDisputes = async () => {
        try {
            const { data: userData } = await axios.get('/api/auth/me');
            setUser(userData.user);

            const { data: disputeData } = await axios.get(`/api/disputes?userId=${userData.user._id}`);
            setDisputes(disputeData.disputes || []);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 space-y-8">
                    <PageHeader
                        title="My Service Disputes"
                        subtitle="Track and manage your refund requests and service quality claims"
                        breadcrumbs={['Home', 'Disputes']}
                        actions={
                            <Link href="/bookings">
                                <Button variant="primary">New Dispute from Booking</Button>
                            </Link>
                        }
                    />

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
                        </div>
                    ) : disputes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {disputes.map((dispute) => (
                                <div key={dispute._id} className="glass-panel p-8 hover:bg-white transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant={
                                                        dispute.status === 'OPEN' ? 'warning' :
                                                            dispute.status === 'REFUNDED' ? 'success' :
                                                                dispute.status === 'REJECTED' ? 'danger' : 'info'
                                                    }
                                                >
                                                    {dispute.status}
                                                </Badge>
                                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                                    Ref: #{dispute._id.slice(-6).toUpperCase()}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                                                    {dispute.reason}
                                                </h3>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    Booking PNR: <span className="font-mono font-bold text-neutral-900 uppercase">{dispute.bookingId?.pnr || 'N/A'}</span>
                                                </p>
                                            </div>

                                            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 italic text-neutral-600 text-sm">
                                                "{dispute.description}"
                                            </div>
                                        </div>

                                        <div className="md:w-80 space-y-4">
                                            <div className="glass-panel p-5 bg-white/50 border-white/40">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Claimed Amount</div>
                                                <div className="text-2xl font-black text-neutral-900">
                                                    XAF {dispute.amountRequested?.toLocaleString()}
                                                </div>
                                            </div>

                                            {dispute.resolutionSummary && (
                                                <div className="p-5 bg-primary-50 rounded-2xl border border-primary-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Agency Resolution</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-primary-900 leading-relaxed">
                                                        {dispute.resolutionSummary}
                                                    </p>
                                                    {dispute.refundAmount > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-primary-200">
                                                            <div className="text-[10px] font-black text-primary-600 uppercase">Refund Issued</div>
                                                            <div className="text-lg font-black text-primary-900">XAF {dispute.refundAmount.toLocaleString()}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="🛡️"
                            title="No Active Disputes"
                            description="All your journeys are currently in good standing. If you have an issue with a booking, you can initiate a claim."
                            action={
                                <Link href="/bookings">
                                    <Button variant="primary">Browse Bookings</Button>
                                </Link>
                            }
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
