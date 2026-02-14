'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';

export default function AgencyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await axios.get('/api/agency/settlements'); // Reusing for list
            setBookings(data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
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
                title="Unified Booking Registry"
                subtitle="Centralized management of all passenger reservations and ticket lifecycles"
                breadcrumbs={['Agency', 'Bookings']}
                actions={
                    <Button variant="primary">Manual Ticket Entry</Button>
                }
            />

            {/* Registry Search Matrix */}
            <div className="glass-panel p-6 flex items-center gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="SEARCH BY PNR, PASSENGER, OR OMNI-SEARCH..."
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <Button variant="glass" className="h-full px-8">Advanced Synthesis</Button>
            </div>

            {/* Bookings Table */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic">Mission Critical Manifests</h2>
                    <Badge variant="info">GLOBAL SYNC ACTIVE</Badge>
                </div>

                {bookings.length > 0 ? (
                    <div className="space-y-3">
                        <div className="hidden lg:grid grid-cols-6 px-4 py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 mb-4">
                            <div>Registry Reference</div>
                            <div>Primary Passenger</div>
                            <div>Financial Status</div>
                            <div>Logistics Vector</div>
                            <div>Timestamp</div>
                            <div className="text-right">Action Signature</div>
                        </div>
                        {bookings.map((booking) => (
                            <div key={booking._id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-4 bg-white/40 hover:bg-white rounded-2xl transition-all border border-transparent shadow-sm hover:shadow-lg group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-black text-[10px]">🎫</div>
                                    <div className="font-black text-neutral-900 text-sm tracking-tighter">{booking.pnr || booking._id.slice(-6).toUpperCase()}</div>
                                </div>
                                <div className="font-bold text-neutral-700 text-xs">
                                    {booking.passengers?.[0]?.name || 'OMNI-PASSENGER'}
                                </div>
                                <div>
                                    <Badge variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm" className="scale-75 origin-left">
                                        {booking.paymentStatus}
                                    </Badge>
                                </div>
                                <div className="text-[10px] font-black text-neutral-400 uppercase truncate">
                                    {booking.origin} → {booking.destination}
                                </div>
                                <div className="text-[10px] font-bold text-neutral-500 font-mono">
                                    {new Date(booking.createdAt).toLocaleString()}
                                </div>
                                <div className="text-right">
                                    <Button variant="glass" size="sm" className="scale-90 opacity-40 group-hover:opacity-100 transition-all font-black text-[10px] uppercase">Audit Manifest</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📇"
                        title="Manifest Void Detected"
                        description="Deployment manifests will generate as passengers interact with agency routes."
                    />
                )}
            </div>
        </div>
    );
}
