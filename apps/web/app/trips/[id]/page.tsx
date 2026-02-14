'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

function TripDetailContent({ tripId }: { tripId: string }) {
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrip();
    }, [tripId]);

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            <p className="text-primary-600 text-xs font-black tracking-[0.3em] uppercase animate-pulse">Synchronizing Data</p>
        </div>
    );

    if (!trip) return (
        <div className="text-center py-32 bg-white/50 backdrop-blur-xl rounded-3xl border border-dashed border-neutral-300">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-black text-neutral-900 mb-2">Trip Not Found</h3>
            <p className="text-neutral-500 mb-8 max-w-sm mx-auto">We couldn't locate this specific journey. It might have been updated or removed.</p>
            <Link href="/search">
                <Button variant="primary" size="lg">Explore Other Routes</Button>
            </Link>
        </div>
    );

    const durationInMs = new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime();
    const hours = Math.floor(durationInMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="space-y-8">
            <PageHeader
                title={trip.routeId?.routeName || 'Premium Journey'}
                subtitle={`Operated by ${trip.agencyId?.name}`}
                breadcrumbs={['Network', 'Trips', trip.routeId?.routeName || 'Details']}
                actions={
                    <div className="flex items-center gap-3">
                        <Badge variant="success" size="lg">
                            {trip.agencyId?.trustScore || 100}% Trust Score
                        </Badge>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Content (Left) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Journey Timeline Card */}
                    <div className="glass-panel p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/20 rounded-full blur-3xl -mr-32 -mt-32"></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                            {/* Departure */}
                            <div className="text-center md:text-left flex-1">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block mb-1">Departure</span>
                                <div className="text-5xl font-black text-neutral-900 leading-none mb-3">
                                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="text-lg font-bold text-neutral-700">
                                    {trip.routeId?.stops?.[0]?.name || 'Origin'}
                                </div>
                                <div className="text-sm font-semibold text-neutral-500 mt-1">
                                    {new Date(trip.departureTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                </div>
                            </div>

                            {/* Middle Timeline */}
                            <div className="flex-1 flex flex-col items-center w-full md:w-auto">
                                <div className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">
                                    {hours}H {minutes}M Total
                                </div>
                                <div className="w-full h-1 bg-neutral-100 relative flex items-center justify-between">
                                    <div className="w-4 h-4 rounded-full border-4 border-neutral-100 bg-white shadow-sm ring-1 ring-neutral-200"></div>
                                    <div className="flex-1 h-0.5 bg-gradient-to-r from-neutral-100 via-primary-400 to-neutral-100"></div>
                                    <div className="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-50"></div>
                                </div>
                                <Badge variant="info" className="mt-4 uppercase tracking-tighter">
                                    {trip.routeId?.stops?.length > 2 ? `${trip.routeId.stops.length - 2} Intermediate Stops` : 'Non-Stop Trip'}
                                </Badge>
                            </div>

                            {/* Arrival */}
                            <div className="text-center md:text-right flex-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Estimated Arrival</span>
                                <div className="text-5xl font-black text-neutral-900 leading-none mb-3">
                                    {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </div>
                                <div className="text-lg font-bold text-neutral-700">
                                    {trip.routeId?.stops?.[trip.routeId.stops.length - 1]?.name || 'Destination'}
                                </div>
                                <div className="text-sm font-semibold text-neutral-500 mt-1">
                                    {new Date(trip.arrivalTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features and Stops Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bus Details & Amenities */}
                        <div className="glass-panel p-8">
                            <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Vehicle Features
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100">
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Model</div>
                                        <div className="font-bold text-neutral-800">{trip.busId?.model || 'Coach'}</div>
                                    </div>
                                    <div className="bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100">
                                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Registration</div>
                                        <div className="font-bold text-neutral-800">{trip.busId?.busNumber || '---'}</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">On-Board Amenities</div>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.busId?.amenities?.map((amenity: string) => (
                                            <div key={amenity} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-100 shadow-sm">
                                                <span className="text-primary-500">{getAmenityIcon(amenity)}</span>
                                                <span className="text-xs font-bold text-neutral-700">{amenity}</span>
                                            </div>
                                        )) || <p className="text-xs text-neutral-400">Standard features included</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Path Vertical */}
                        <div className="glass-panel p-8">
                            <h3 className="text-xl font-black text-neutral-900 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Route Path
                            </h3>

                            <div className="space-y-0 relative">
                                <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-neutral-100"></div>
                                {((trip.stops && trip.stops.length > 0) ? trip.stops : (trip.routeId?.stops || [])).map((stop: any, index: number, array: any[]) => {
                                    const stopName = stop.stopId?.name || stop.name || 'Station';
                                    const isFirst = index === 0;
                                    const isLast = index === array.length - 1;

                                    return (
                                        <div key={index} className="flex items-start gap-5 relative z-10 py-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-sm ring-4 ring-white ${isFirst || isLast ? 'bg-primary-500 text-white' : 'bg-white border-2 border-neutral-100 text-neutral-400'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 pt-2">
                                                <div className="text-sm font-bold text-neutral-900 leading-none">{stopName}</div>
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase mt-1">
                                                    {isFirst ? 'Origin Point' : isLast ? 'Final Destination' : 'Transit Stop'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div className="lg:col-span-4 space-y-6 sticky top-28">
                    {/* Booking Control Card */}
                    <div className="glass-panel-strong p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/40 rounded-full blur-2xl -mr-10 -mt-10"></div>

                        <div className="text-center mb-8 relative z-10">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Price Per Passenger</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm font-bold text-neutral-400 mt-2">XAF</span>
                                <span className="text-5xl font-black text-neutral-900 tracking-tighter">
                                    {trip.basePrice?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-neutral-500">Available Seats</span>
                                    <span className="text-xs font-black text-neutral-900">{trip.availableSeats?.length || 0} left</span>
                                </div>
                                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-1000"
                                        style={{ width: `${(trip.availableSeats?.length / (trip.busId?.capacity || 40)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <Link href={`/book/${trip._id}`} className="block">
                                <Button variant="primary" size="lg" className="w-full h-16 text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-200">
                                    Secure Seats Now
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Button>
                            </Link>

                            <p className="text-[10px] text-center text-neutral-500 font-bold uppercase tracking-wide px-4">
                                Free cancellation up to 24 hours before departure
                            </p>
                        </div>
                    </div>

                    {/* Quick Support Card */}
                    <div className="glass-panel p-6">
                        <h4 className="text-[10px] font-black text-neutral-900 uppercase tracking-widest mb-4">Support & Info</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-neutral-900">Check-in Required</div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Please arrive 30 mins before.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-neutral-900">Contactless Tickets</div>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase">Digital QR code accepted.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper for Amenity Icons
function getAmenityIcon(amenity: string) {
    const a = amenity.toLowerCase();
    if (a.includes('wifi')) return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
    if (a.includes('ac') || a.includes('air')) return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (a.includes('power') || a.includes('usb')) return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { isCollapsed } = useSidebar();
    const [tripId, setTripId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        params.then(p => setTripId(p.id));
        axios.get('/api/auth/me').then(({ data }) => setUser(data.user)).catch(() => { });
    }, [params]);

    if (!tripId) return null;

    const hasSidebar = !!user;

    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-7xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
                            <p className="text-primary-600 text-xs font-black tracking-[0.3em] uppercase animate-pulse">Initializing Interface</p>
                        </div>
                    }>
                        <TripDetailContent tripId={tripId} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
