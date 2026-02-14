'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

function TicketContent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams?.get('bookingId');
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            const { data } = await axios.get(`/api/bookings/${bookingId}`);
            setBooking(data.booking);
        } catch (error) {
            console.error('Failed to fetch booking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-xs font-black text-primary-600 uppercase tracking-widest animate-pulse">Generating Passes</p>
        </div>
    );

    if (!booking) return (
        <div className="glass-panel p-16 text-center border-dashed border-2">
            <div className="text-5xl mb-6">🎟️</div>
            <h2 className="text-2xl font-black text-neutral-900 mb-2">Ticket Not Found</h2>
            <p className="text-neutral-500 mb-8">We couldn't find the ticket associated with this booking ID.</p>
            <Link href="/bookings">
                <Button variant="primary">View My Bookings</Button>
            </Link>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Your Tickets"
                subtitle={`Booking Ref: ${booking.pnr}`}
                breadcrumbs={['Home', 'Bookings', 'Passes']}
                actions={
                    <Button variant="glass" size="sm" onClick={() => window.print()}>
                        Print Passes
                    </Button>
                }
            />

            {/* Ticket Cards */}
            <div className="grid grid-cols-1 gap-8">
                {booking.passengers?.map((passenger: any, index: number) => (
                    <div key={index} className="glass-panel-strong p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-200/20 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-200/20 rounded-full blur-[100px] pointer-events-none"></div>

                        {/* Ticket Content */}
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-10 border-b-2 border-dashed border-neutral-100">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-4xl shadow-xl shadow-primary-200">
                                        🎫
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-3xl font-black text-neutral-900 tracking-tight">Boarding Pass</h3>
                                            <Badge variant="success" size="lg">CONFIRMED</Badge>
                                        </div>
                                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">
                                            Passenger {index + 1} of {booking.passengers.length}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto text-center md:text-right bg-white/40 backdrop-blur-md px-8 py-4 rounded-3xl border border-white/60">
                                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Assigned Seat</div>
                                    <div className="text-5xl font-black text-primary-600 tracking-tighter">
                                        {passenger.seatNumber}
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                                <div className="glass-panel p-5 bg-white/30 border-white/40">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Traveler</div>
                                    <div className="text-lg font-black text-neutral-900 truncate">{passenger.name}</div>
                                    <div className="text-[10px] font-bold text-neutral-500 mt-1 uppercase">Age: {passenger.age} • {passenger.gender}</div>
                                </div>
                                <div className="glass-panel p-5 bg-white/30 border-white/40">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Origin</div>
                                    <div className="text-lg font-black text-neutral-900">
                                        {booking.tripId?.routeId?.stops?.[0]?.name || 'Origin Station'}
                                    </div>
                                    <div className="text-[10px] font-bold text-neutral-500 mt-1 uppercase">
                                        {new Date(booking.tripId?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="glass-panel p-5 bg-white/30 border-white/40">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Destination</div>
                                    <div className="text-lg font-black text-neutral-900">
                                        {booking.tripId?.routeId?.stops?.[booking.tripId.routeId.stops.length - 1]?.name || 'Final Stop'}
                                    </div>
                                    <div className="text-[10px] font-bold text-neutral-500 mt-1 uppercase">
                                        {new Date(booking.tripId?.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className="glass-panel p-5 bg-white/30 border-white/40">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Booking ID</div>
                                    <div className="text-lg font-black text-neutral-900">{booking.pnr}</div>
                                    <div className="text-[10px] font-bold text-neutral-500 mt-1 uppercase">{new Date(booking.tripId?.departureTime).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="flex flex-col items-center">
                                <div className="p-8 bg-white rounded-[40px] shadow-2xl border-8 border-neutral-50 relative group">
                                    <div className="w-48 h-48 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-7xl mb-2 grayscale group-hover:grayscale-0 transition-all">📱</div>
                                            <div className="text-[10px] font-bold text-neutral-400 tracking-[0.2em]">{booking.pnr}</div>
                                        </div>
                                    </div>
                                    {/* Corners */}
                                    <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary-500 rounded-tl-lg"></div>
                                    <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary-500 rounded-tr-lg"></div>
                                    <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary-500 rounded-bl-lg"></div>
                                    <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary-500 rounded-br-lg"></div>
                                </div>
                                <p className="mt-8 text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">Scan at Boarding Gate</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-8">
                <Link href="/bookings" className="flex-1">
                    <Button variant="glass" size="lg" className="w-full font-black uppercase text-xs">
                        Back to Bookings
                    </Button>
                </Link>
                <Button variant="primary" size="lg" className="flex-1 font-black uppercase text-xs shadow-xl shadow-primary-200">
                    Download All Passes
                </Button>
            </div>
        </div>
    );
}

export default function TicketsPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        axios.get('/api/auth/me').then(({ data }) => setUser(data.user)).catch(() => { });
    }, []);

    const hasSidebar = !!user;

    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-40">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
                        </div>
                    }>
                        <TicketContent />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
