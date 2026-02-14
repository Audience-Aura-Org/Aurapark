'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const from = searchParams?.get('from');
    const to = searchParams?.get('to');
    const date = searchParams?.get('date');

    useEffect(() => {
        fetchTrips();
    }, [searchParams]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/trips/search?${searchParams?.toString() || ''}`);
            setTrips(data.trips);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-neutral-50/50">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-neutral-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
                <p className="text-lg font-bold text-neutral-800 tracking-tight">Searching Routes</p>
                <p className="text-sm text-neutral-500 font-medium">Checking global availability...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 pt-28 pb-20 px-4 md:px-8 relative overflow-hidden safe-bottom-nav">
            {/* Professional Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/40 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-6xl mx-auto space-y-10 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-200/60">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-semibold text-neutral-500">
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {new Date(date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                {trips.length} Results
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-neutral-900 leading-tight tracking-tight flex items-center md:items-baseline gap-4 flex-wrap">
                            <span>{trips[0]?.routeId?.stops?.[0]?.name || from || 'Origin'}</span>
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            <span>{trips[0]?.routeId?.stops?.[trips[0]?.routeId?.stops?.length - 1]?.name || to || 'Destination'}</span>
                        </h1>
                    </div>

                    <Link href="/">
                        <Button variant="glass" className="bg-white border md:px-6 py-3 shadow-sm hover:shadow-md transition-all text-neutral-600 font-bold hover:text-primary-600 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            Edit Search
                        </Button>
                    </Link>
                </div>

                {/* Trip Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {trips.map((trip, index) => {
                        const seatsAvailable = trip.availableSeats?.length || 0;
                        const durationInMs = new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime();
                        const hours = Math.floor(durationInMs / (1000 * 60 * 60));
                        const minutes = Math.floor((durationInMs % (1000 * 60 * 60)) / (1000 * 60));

                        return (
                            <div
                                key={trip._id}
                                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:shadow-neutral-200/50 hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-0.5"
                                style={{ animation: `fadeUp 0.4s ease-out ${index * 0.05}s backwards` }}
                            >
                                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-10">

                                    {/* Column 1: Carrier & Vehicle */}
                                    <div className="lg:w-[280px] flex flex-col justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center border border-neutral-100 text-neutral-400 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-neutral-900 leading-tight">{trip.agencyId?.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-green-700 text-xs font-bold border border-green-100">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <span>{trip.agencyId?.trustScore || 100}% Score</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center justify-between text-xs font-medium text-neutral-500 border-b border-neutral-100 pb-2">
                                                <span>Vehicle Class</span>
                                                <span className="text-neutral-900 font-bold">
                                                    {trip.busId?.type ? trip.busId.type.charAt(0) + trip.busId.type.slice(1).toLowerCase() + ' Coach' : 'Standard Coach'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {trip.busId?.amenities?.map((a: string) => (
                                                    <span key={a} className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-500 bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
                                                        {getAmenityIcon(a)}
                                                        {a}
                                                    </span>
                                                ))}
                                                {(!trip.busId?.amenities || trip.busId?.amenities.length === 0) && (
                                                    <span className="text-[10px] text-neutral-400">Standard Amenities</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Schedule & Route */}
                                    <div className="flex-1 border-t lg:border-t-0 lg:border-l border-neutral-100 pt-6 lg:pt-0 lg:pl-10 flex flex-col justify-center">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="text-left min-w-[120px]">
                                                <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">
                                                    {new Date(trip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-3xl font-black text-neutral-900 tracking-tight leading-none mb-2">
                                                    {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase">
                                                    <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                    {trip.routeId?.stops?.[0]?.name || from || 'Origin'}
                                                </div>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center px-4 max-w-xs">
                                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {hours}h {minutes}m
                                                </div>
                                                <div className="w-full h-px bg-neutral-200 relative flex items-center justify-between group-hover:bg-primary-200 transition-colors">
                                                    <div className="w-2 h-2 rounded-full border-2 border-neutral-300 bg-white group-hover:border-primary-400"></div>

                                                    {/* Route Icon */}
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-neutral-300 group-hover:text-primary-500 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                                    </div>

                                                    <div className="w-2 h-2 rounded-full bg-neutral-900 group-hover:bg-primary-600"></div>
                                                </div>
                                                <div className="mt-2 text-[10px] text-neutral-400 font-medium">
                                                    {trip.routeId?.stops?.length > 2 ? `${trip.routeId.stops.length - 2} Intermediate Stops` : 'Direct Route'}
                                                </div>
                                            </div>

                                            <div className="text-right min-w-[120px]">
                                                <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">
                                                    {new Date(trip.arrivalTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-3xl font-black text-neutral-900 tracking-tight leading-none mb-2">
                                                    {new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                </div>
                                                <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-primary-700 uppercase">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                                    {trip.routeId?.stops?.[trip.routeId?.stops?.length - 1]?.name || to || 'Destination'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Price & Action */}
                                    <div className="lg:w-[220px] flex flex-row lg:flex-col items-center justify-between lg:justify-center border-t lg:border-t-0 lg:border-l border-neutral-100 pt-6 lg:pt-0 lg:pl-10">
                                        <div className="text-right lg:text-center w-full">
                                            <div className="flex items-baseline justify-end lg:justify-center gap-1">
                                                <span className="text-sm font-bold text-neutral-400">XAF</span>
                                                <span className="text-3xl font-bold text-neutral-900 tracking-tighter">{trip.basePrice}</span>
                                            </div>
                                            <p className="text-[10px] text-neutral-400 font-medium mt-1 uppercase tracking-wide">Per Passenger</p>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full lg:mt-6">
                                            <Button
                                                variant="primary"
                                                size="md"
                                                className="w-full justify-center rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20"
                                                onClick={() => window.location.href = `/book/${trip._id}`}
                                            >
                                                Select Seat
                                            </Button>

                                            <div className="flex items-center justify-end lg:justify-center gap-1.5 text-xs font-bold">
                                                <div className={`w-2 h-2 rounded-full ${seatsAvailable < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                                <span className={seatsAvailable < 5 ? 'text-red-600' : 'text-green-700'}>
                                                    {seatsAvailable} Seats Left
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {trips.length === 0 && !loading && (
                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-neutral-300">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900 mb-2">No Routes Found</h2>
                        <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                            We couldn't find any trips for this specific date and route configuration.
                        </p>
                        <Link href="/">
                            <Button variant="primary">Modify Search</Button>
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}

// Helper for Amenity Icons
function getAmenityIcon(amenity: string) {
    const a = amenity.toLowerCase();
    if (a.includes('wifi')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;
    if (a.includes('ac') || a.includes('air')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (a.includes('power') || a.includes('usb')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
}

export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <SearchResults />
        </Suspense>
    );
}
