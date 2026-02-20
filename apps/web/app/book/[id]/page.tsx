'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import Link from 'next/link';

type Step = 'SELECT_SEATS' | 'PASSENGER_INFO' | 'CONFIRMATION';

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: tripId } = use(params);
    const [step, setStep] = useState<Step>('SELECT_SEATS');
    const [trip, setTrip] = useState<any>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [passengers, setPassengers] = useState<any[]>([]);
    const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
    const [reservation, setReservation] = useState<any>(null);
    const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

        const passesHtml = (booking.passengers || []).map((p: any, i: number) => {
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
                        <div style="font-size:32px;font-weight:900;color:#1e3a8a;line-height:1">${displaySeat}</div>
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
                    <div style="margin-top:4px">Pass ${i + 1} of ${(booking.passengers || []).length}</div>
                </div>
                <div style="text-align:right">
                    <div>Contact: ${booking.contactPhone || '—'}</div>
                    <div style="margin-top:4px;color:#3b82f6;font-weight:bold">Present at boarding gate</div>
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
            .ticket-header { padding: 30px 40px; border-bottom: 2px dashed #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #fff; }
            .logo { height: 36px; object-fit: contain; }
            .ticket-body { padding: 30px 40px; }
            .route-display { display: flex; justify-content: space-between; align-items: center; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 24px; border: 1px solid #f1f5f9; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .label { font-size: 10px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
            .value { font-size: 14px; font-weight: 800; color: #111; }
            .separator { height: 1px; border-top: 2px dashed #e5e7eb; margin: 24px 0; }
            .barcode { font-family: monospace; font-size: 28px; letter-spacing: 6px; color: #ccc; text-align: center; padding: 20px 40px; border-top: 2px dashed #e5e7eb; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
            .ticket-footer { padding: 20px 40px; background: #f8fafc; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
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
            win.setTimeout(() => { win.print(); }, 250);
        }
    }


    useEffect(() => {
        Promise.all([fetchTrip(), fetchUser()]);
    }, [tripId]);

    const fetchUser = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            if (data.user) {
                setUser(data.user);
                // Also pre-fill contact info if logged in
                setContactInfo({ email: data.user.email || '', phone: data.user.phone || '' });
            }
        } catch (error) {
            console.log('Proceeding as guest');
        }
    };

    const fetchTrip = async () => {
        try {
            const { data } = await axios.get(`/api/trips/${tripId}`);
            setTrip(data.trip);
        } catch (error) {
            console.error('Failed to fetch trip:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeatToggle = (seat: string) => {
        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seat));
        } else if (selectedSeats.length < 4) {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleReserve = async () => {
        if (selectedSeats.length === 0) return;
        try {
            const sessionId = Math.random().toString(36).substring(7);
            const { data } = await axios.post('/api/bookings/reserve', {
                tripId,
                seatNumbers: selectedSeats,
                sessionId,
                userId: user?._id
            });
            setReservation({ _id: data.reservationId, expiresAt: data.expiresAt });
            setStep('PASSENGER_INFO');
            setPassengers(selectedSeats.map(s => ({ seatNumber: s, name: user?.name || '', age: '', gender: 'other' })));
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.error || 'Reservation failed');
        }
    };

    const handleConfirmBooking = async () => {
        try {
            const { data } = await axios.post('/api/bookings', {
                reservationId: reservation._id,
                userId: user?._id,
                passengers,
                contactEmail: contactInfo.email,
                contactPhone: contactInfo.phone,
                totalAmount: trip.basePrice * selectedSeats.length
            });

            // Decentralized Financial History (Save for Guest)
            if (typeof window !== 'undefined') {
                const savedHistory = localStorage.getItem('guest_financial_history');
                const history = savedHistory ? JSON.parse(savedHistory) : [];
                const newTx = {
                    id: data.booking?.pnr || 'PENDING',
                    type: 'BOOKING',
                    date: new Date(),
                    amount: trip.basePrice * selectedSeats.length,
                    status: 'PENDING' // Pay on Site logic
                };
                localStorage.setItem('guest_financial_history', JSON.stringify([newTx, ...history].slice(0, 10)));
            }

            // The API returns the booking, but we'll populate tripId so it works seamlessly with printUserTicket
            const fullBooking = {
                ...data.booking,
                tripId: trip
            };
            setConfirmedBooking(fullBooking);
            setStep('CONFIRMATION');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Booking failed');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 max-w-sm w-full">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">Trip Not Found</h2>
                <Link href="/search"><Button variant="primary" className="w-full">Back to Search</Button></Link>
            </div>
        </div>
    );

    const seats = trip?.busId?.seatMap?.seats || Array.from({ length: 40 }, (_, i) => ({
        seatNumber: `${i + 1}`,
        type: 'REGULAR'
    }));

    const totalPrice = trip.basePrice * selectedSeats.length;
    const driver = trip.driverId || { name: 'Assigned at Station', phone: '---' };

    const getOrigin = () => {
        if (trip.routeId?.routeName) return trip.routeId.routeName.split('-')[0].trim();
        return 'Origin';
    };

    const getDestination = () => {
        if (trip.routeId?.routeName) {
            const parts = trip.routeId.routeName.split('-');
            return parts[parts.length - 1].trim();
        }
        return 'Destination';
    };

    const origin = getOrigin();
    const destination = getDestination();

    const getStopsLabel = () => {
        const interimStops = trip.routeId?.stops?.map((s: any) => s.name || s) || [];
        if (interimStops.length > 0) {
            return interimStops.join(' • ');
        }
        return 'Direct Route';
    };

    return (
        <div className="min-h-screen bg-neutral-50 pb-60 safe-bottom-nav">
            {/* Cinematic Header */}
            <div className="bg-neutral-900 text-white pt-20 pb-6 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 to-neutral-900 z-0"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col gap-2">
                        <Link href="/search" className="inline-flex items-center text-[10px] font-semibold text-neutral-400 hover:text-white uppercase tracking-widest">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back to Search
                        </Link>

                        <div className="bg-primary-500/10 border border-primary-500/20 px-3 py-2 rounded-lg mt-2 self-start">
                            <div className="text-[9px] font-bold text-primary-400 uppercase tracking-widest mb-1">Bus Stops</div>
                            <div className="text-xs font-bold text-primary-50 uppercase truncate leading-tight">
                                {getStopsLabel()}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 mt-4">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] leading-none mb-1">Departure</div>
                                <div className="text-xl md:text-2xl font-black text-white leading-none">{origin}</div>
                                <div className="text-xs font-bold text-neutral-400">
                                    {new Date(trip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <div className="hidden md:block">
                                <svg className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] leading-none mb-1">Arrival</div>
                                <div className="text-xl md:text-2xl font-black text-white leading-none">{destination}</div>
                                <div className="text-xs font-bold text-neutral-400">
                                    {new Date(trip.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Trip Summary Bar */}
            <div className="lg:hidden sticky top-[57px] z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-2.5 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase leading-none">Trip to</span>
                        <span className="font-bold text-neutral-900 text-sm leading-tight truncate max-w-[150px]">{destination}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] text-neutral-500 line-through">XAF {trip.basePrice + 10}</span>
                            <span className="font-bold text-primary-600 text-sm leading-none">XAF {trip.basePrice}</span>
                        </div>
                        {step === 'SELECT_SEATS' && (
                            <div className={`px-2 py-1 rounded-lg ${selectedSeats.length > 0 ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-400'} text-xs font-bold transition-colors`}>
                                {selectedSeats.length} Seats
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6 relative z-10 text-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-8 order-2 lg:order-1">
                        {/* Trip Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-6">
                            <h3 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-3">Trip Details</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-[10px] uppercase font-semibold text-neutral-400">Bus Number</div>
                                    <div className="font-semibold text-neutral-900">{trip.busId?.busNumber || '---'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-semibold text-neutral-400">Class</div>
                                    <div className="font-semibold text-neutral-900">{trip.busId?.model || 'Standard Unit'} • {trip.busId?.type || 'Standard'}</div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="text-[10px] uppercase font-semibold text-neutral-400 mb-1">Amenities</div>
                                <div className="flex flex-wrap gap-2">
                                    {trip.busId?.amenities?.length > 0 ? (
                                        trip.busId.amenities.map((a: string) => (
                                            <span key={a} className="text-[10px] font-semibold uppercase px-2 py-1 bg-neutral-100 rounded text-neutral-600 border border-neutral-200">{a}</span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-neutral-400 italic">No amenities listed</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-3 border-t border-neutral-100">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">👨‍✈️</div>
                                <div>
                                    <div className="text-xs font-bold text-neutral-900">{driver.name}</div>
                                    <div className="text-[10px] text-neutral-400">Rating: 4.9/5</div>
                                </div>
                            </div>
                        </div>

                        {step === 'SELECT_SEATS' && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-neutral-100/50">
                                <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
                                    <h2 className="text-base font-semibold text-neutral-900">Choose Seats</h2>
                                    <div className="flex gap-3 text-[10px] font-medium text-neutral-500 uppercase">
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-white border border-neutral-300"></div>Free</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-primary-600"></div>You</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-neutral-200"></div>Taken</div>
                                    </div>
                                </div>

                                <div className="p-6 bg-neutral-50 flex justify-center overflow-x-auto min-h-[300px]">
                                    <div className={`bg-white rounded-[2rem] px-5 py-8 shadow-xl border border-neutral-200 relative ${trip?.busId?.seatMap?.columns === 5 ? 'w-[280px]' : 'w-[240px]'} flex-shrink-0 transition-all`}>
                                        <div className="absolute top-5 left-5 w-8 h-8 rounded-full border-2 border-neutral-200 flex items-center justify-center">
                                            <div className="w-4 h-0.5 bg-neutral-300 rotate-45"></div>
                                        </div>
                                        <div className="text-[10px] font-bold text-neutral-300 uppercase text-center mb-6 tracking-widest">Front</div>
                                        <div className={`grid gap-2 ${trip?.busId?.seatMap?.columns === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                                            {seats.map((seat: any, i: number) => {
                                                const isAvailable = trip?.availableSeats?.includes(seat.seatNumber) ?? true;
                                                const isSelected = selectedSeats.includes(seat.seatNumber);
                                                const seatsPerRow = trip?.busId?.seatMap?.columns || 4;
                                                const seatIndexInRow = i % seatsPerRow;
                                                const aislePosition = seatsPerRow === 5 ? 2 : 1;
                                                const isAisle = (seatIndexInRow === aislePosition);
                                                return (
                                                    <div key={seat.seatNumber} className={isAisle ? 'mr-3' : ''}>
                                                        <button
                                                            disabled={!isAvailable}
                                                            onClick={() => handleSeatToggle(seat.seatNumber)}
                                                            className={`
                                                                w-9 h-10 rounded-md relative transition-all duration-150 flex items-center justify-center border-b-4
                                                                ${isSelected
                                                                    ? 'bg-primary-500 border-primary-700 text-white translate-y-0.5'
                                                                    : isAvailable
                                                                        ? 'bg-white border-neutral-200 text-neutral-600 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-sm'
                                                                        : 'bg-neutral-100 border-transparent text-neutral-300 cursor-not-allowed'}
                                                            `}
                                                        >
                                                            <span className={`text-[10px] font-black ${isSelected ? 'text-white' : isAvailable ? 'text-neutral-900' : 'text-neutral-300'}`}>
                                                                {i + 1}
                                                            </span>
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'PASSENGER_INFO' && (
                            <div className="bg-white rounded-2xl shadow-lg p-5 animate-fade-in-up">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-base font-semibold text-neutral-900">Passenger Details</h2>
                                    <Badge variant="info">Step 2 of 2</Badge>
                                </div>
                                <div className="space-y-4">
                                    {passengers.map((p, idx) => (
                                        <div key={idx} className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                            <div className="text-xs font-bold text-neutral-500 uppercase mb-2">
                                                Seat {seats.findIndex((s: any) => s.seatNumber === p.seatNumber) + 1}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input label="Name" placeholder="Full Name" value={p.name} className="border-2 border-neutral-300" onChange={(e) => {
                                                    const updated = [...passengers];
                                                    updated[idx].name = e.target.value;
                                                    setPassengers(updated);
                                                }} />
                                                <Input label="Age" type="number" placeholder="Age" value={p.age} className="border-2 border-neutral-300" onChange={(e) => {
                                                    const updated = [...passengers];
                                                    updated[idx].age = e.target.value;
                                                    setPassengers(updated);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-neutral-100 mt-4">
                                        <h3 className="text-sm font-bold text-neutral-900 mb-3">Contact Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input label="Email" type="email" placeholder="email@example.com" value={contactInfo.email} className="border-2 border-neutral-300" onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} />
                                            <Input label="Phone" type="tel" placeholder="Phone number" value={contactInfo.phone} className="border-2 border-neutral-300" onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="mt-8 p-6 bg-primary-50 border-2 border-dashed border-primary-200 rounded-2xl">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">💳</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-black text-neutral-900 mb-1">Payment Method: On-Site</div>
                                                <p className="text-xs text-neutral-600 leading-relaxed">
                                                    You'll pay your total of <span className="font-black text-primary-600">XAF {totalPrice}</span> at the station. We've reserved your seats!
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full mt-6 shadow-xl shadow-primary-500/20"
                                            onClick={handleConfirmBooking}
                                            disabled={!contactInfo.email || !contactInfo.phone || passengers.some(p => !p.name)}
                                        >
                                            Complete Reservation →
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'CONFIRMATION' && (
                            <div className="bg-white rounded-2xl shadow-lg p-10 text-center animate-fade-in-up border-b-8 border-success-500">
                                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6 text-success-600 ring-8 ring-success-50 shadow-inner">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h2 className="text-3xl font-black text-neutral-900 mb-2">Reservation Secured!</h2>
                                <p className="text-neutral-500 mb-8 max-w-sm mx-auto">
                                    Your seats are held. A confirmation email has been sent to <span className="font-bold text-neutral-900">{contactInfo.email}</span>.
                                </p>
                                <div className="bg-neutral-50 rounded-2xl p-6 mb-8 border border-neutral-100">
                                    <div className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Next Step</div>
                                    <div className="text-lg font-black text-neutral-900">Pay XAF {totalPrice} at the station</div>
                                    <p className="text-xs text-neutral-500 mt-2">Please arrive 15 minutes before departure.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button variant="glass" onClick={() => printUserTicket(confirmedBooking)}>Print Ticket</Button>
                                    <Link href="/"><Button variant="primary">Return Home</Button></Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Info Sidebar (Desktop Only) */}
                    <div className="lg:col-span-4 space-y-4 order-1 lg:order-2 hidden lg:block sticky top-24">
                        <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-5">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Trip Details</h3>
                            <div className="flex gap-3 mb-6">
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>
                                    <div className="w-0.5 h-8 bg-neutral-200 my-0.5"></div>
                                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="text-sm font-bold text-neutral-900 leading-none">{origin}</div>
                                        <div className="text-[10px] text-neutral-500 font-bold uppercase mt-1">
                                            {new Date(trip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-neutral-900 leading-none">{destination}</div>
                                        <div className="text-[10px] text-neutral-500 font-bold uppercase mt-1">
                                            {new Date(trip.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-neutral-100 mb-4"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-lg">👨‍✈️</div>
                                <div>
                                    <div className="text-xs font-bold text-neutral-900">{driver.name}</div>
                                    <div className="text-[10px] text-neutral-400">Professional Driver</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900 rounded-2xl p-5 text-white">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-neutral-400">Total</span>
                                <span className="font-bold text-xl">XAF {totalPrice || trip.basePrice}</span>
                            </div>
                            {step === 'SELECT_SEATS' && (
                                <Button variant="primary" size="sm" className="w-full" onClick={handleReserve} disabled={selectedSeats.length === 0}>
                                    Check Out
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Checkout Bar */}
            {step === 'SELECT_SEATS' && (
                <div className="lg:hidden fixed bottom-28 left-0 right-0 z-[100] px-4 animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none mb-1">Total Amount</span>
                            <span className="font-black text-white text-xl">XAF {totalPrice || trip.basePrice}</span>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            className="flex-1 max-w-[170px] h-14 text-sm font-black uppercase tracking-wider shadow-xl shadow-primary-500/20"
                            onClick={handleReserve}
                            disabled={selectedSeats.length === 0}
                        >
                            Checkout →
                        </Button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
