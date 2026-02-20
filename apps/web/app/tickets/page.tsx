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
function printUserTicket(booking: any) {
    if (!booking) return;

    const trip = booking.tripId || {};
    const route = trip.routeId || {};
    const origin = route.origin || '';
    const destination = route.destination || '';
    const date = trip.departureTime ? new Date(trip.departureTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const time = trip.departureTime ? new Date(trip.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const agencyName = trip.agencyId?.name || booking.agencyId?.name || 'Aura Park Transport Network';
    const seatsList = trip.busId?.seatMap?.seats || [];

    const passesHtml = booking.passengers.map((p: any, i: number) => {
        const seatIndex = seatsList.findIndex((s: any) => s.seatNumber === p.seatNumber);
        const displaySeat = seatIndex !== -1 ? (seatIndex + 1).toString() : (p.seatNumber || (i + 1));

        return `
        <div class="ticket">
            <div class="ticket-header">
                <div>
                    <img src="/logo-black.png" alt="Logo" class="logo">
                    <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-top:4px">${agencyName}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:24px;font-weight:900;letter-spacing:2px;font-family:monospace">${booking.pnr}</div>
                    <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-top:2px">Booking Reference</div>
                </div>
            </div>
            
            <div class="ticket-body">
                <div class="route-display">
                    <div>
                        <div style="font-size:10px;color:#999;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:4px">Origin</div>
                        <div style="font-size:22px;font-weight:900">${origin || 'Origin'}</div>
                    </div>
                    <div style="font-size:24px;color:#ccc">&#x2708;</div>
                    <div style="text-align:right">
                        <div style="font-size:10px;color:#999;text-transform:uppercase;font-weight:800;letter-spacing:1px;margin-bottom:4px">Destination</div>
                        <div style="font-size:22px;font-weight:900">${destination || 'Destination'}</div>
                    </div>
                </div>

                <div class="grid">
                    <div>
                        <div class="label">Passenger</div>
                        <div class="value" style="font-size:16px">${p.name || 'Passenger ' + (i + 1)}</div>
                        <div style="font-size:11px;color:#666;margin-top:2px">Age: ${p.age || '—'} &bull; ${p.gender || '—'}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="label">Assigned Seat</div>
                        <div style="font-size:32px;font-weight:900;color:#15803d;line-height:1">${displaySeat}</div>
                    </div>
                </div>

                <div class="separator"></div>

                <div class="grid">
                    <div>
                        <div class="label">Date & Time</div>
                        <div class="value">${date}</div>
                        <div style="font-size:12px;color:#555;font-weight:700;margin-top:2px">${time}</div>
                    </div>
                    <div style="text-align:right">
                        <div class="label">Bus Class / Plate</div>
                        <div class="value">${trip.busId?.model || 'Standard Unit'}</div>
                        <div style="font-size:12px;color:#555;font-weight:700;margin-top:2px">${trip.busId?.plateNumber || 'TBD'}</div>
                    </div>
                </div>
            </div>

            <div class="barcode">
                |||||||||||||||||||||||||||||||||||||||
            </div>

            <div class="ticket-footer">
                <div>
                    <div>Status: <strong style="color:#166534">CONFIRMED</strong></div>
                    <div style="margin-top:4px">Pass ${i + 1} of ${booking.passengers.length}</div>
                </div>
                <div style="text-align:right">
                    <div>Contact: ${booking.contactPhone || '—'}</div>
                    <div style="margin-top:4px;color:#15803d;font-weight:bold">Present at boarding gate</div>
                </div>
            </div>
        </div>
        `;
    }).join('<div class="page-break"></div>');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Tickets - ${booking.pnr}</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f0f2f5; padding: 40px 20px; color: #111; }
            .ticket { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
            .ticket-header { padding: 30px 40px; border-bottom: 2px dashed #90ee90; display: flex; justify-content: space-between; align-items: center; background: #90ee904d; color: #111; }
            .logo { height: 36px; object-fit: contain; }
            .ticket-body { padding: 30px 40px; }
            .route-display { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #90ee901a; border-radius: 12px; margin-bottom: 24px; border: 1px solid #90ee904d; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .label { font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
            .value { font-size: 14px; font-weight: 800; color: #111; }
            .separator { height: 1px; border-top: 2px dashed #e5e7eb; margin: 24px 0; }
            .barcode { font-family: monospace; font-size: 28px; letter-spacing: 6px; color: #90ee90; text-align: center; padding: 20px 40px; border-top: 2px dashed #e5e7eb; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
            .ticket-footer { padding: 20px 40px; background: #90ee904d; display: flex; justify-content: space-between; font-size: 11px; color: #333; }
            .page-break { page-break-after: always; height: 40px; }
            @media print {
                body { background: #fff; padding: 0; }
                .ticket { box-shadow: none; border-radius: 0; border: none; margin-bottom: 0; }
                .ticket-header { border-bottom: 2px dashed #000; }
                .route-display { background: #fff; border: 2px solid #000; }
                .separator { border-top: 2px dashed #000; }
                .barcode { border-top: 2px dashed #000; border-bottom: 2px solid #000; background: #fff; color: #000; opacity: 0.5; }
                .ticket-footer { background: #fff; border-top: 2px solid #000; }
                .page-break { page-break-after: always; height: 0; }
                /* Ensure colors don't get stripped entirely if supported */
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        ${passesHtml}
    </body>
    </html>
    `;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        win.setTimeout(() => { win.print(); }, 250); // slight delay to ensure logo loads
    }
}

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
            <div className="print:hidden">
                <PageHeader
                    title="Your Tickets"
                    subtitle={`Booking Ref: ${booking.pnr}`}
                    breadcrumbs={['Home', 'Bookings', 'Passes']}
                    actions={
                        <Button variant="glass" size="sm" onClick={() => printUserTicket(booking)}>
                            Print Passes
                        </Button>
                    }
                />
            </div>

            {/* Ticket Cards */}
            <div className="grid grid-cols-1 gap-8">
                {booking.passengers?.map((passenger: any, index: number) => (
                    <div key={index} className="ticket-print glass-panel-strong p-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
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
                                        {(() => {
                                            const seats = booking.tripId?.busId?.seatMap?.seats || [];
                                            const seatIndex = seats.findIndex((s: any) => s.seatNumber === passenger.seatNumber);
                                            return seatIndex !== -1 ? (seatIndex + 1).toString() : passenger.seatNumber;
                                        })()}
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
                                            <div className="text-7xl mb-2 grayscale transition-all">📱</div>
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
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto pt-8 print:hidden">
                <Link href="/bookings" className="flex-1">
                    <Button variant="glass" size="lg" className="w-full font-black uppercase text-xs">
                        Back to Bookings
                    </Button>
                </Link>
                <Button variant="primary" size="lg" className="flex-1 font-black uppercase text-xs shadow-xl shadow-primary-200" onClick={() => printUserTicket(booking)}>
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
        <div className="min-h-screen bg-mesh-green print:bg-white selection:bg-primary-500 selection:text-white print:min-h-0">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 print:pt-0 print:m-0 safe-bottom-nav print:pb-0 ${isCollapsed ? 'lg:pl-20 print:pl-0' : 'lg:pl-72 print:pl-0'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 print:p-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-40 print:hidden">
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
