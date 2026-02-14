'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { TripStatus, BusType } from '@/lib/types';

interface Trip {
    _id: string;
    routeId: { routeName: string };
    busId: {
        busNumber: string,
        capacity: number,
        type: BusType,
        amenities: string[]
    };
    departureTime: string;
    arrivalTime: string;
    status: TripStatus;
    basePrice: number;
    availableSeats: string[];
}

export default function TripList({ agencyId }: { agencyId: string }) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTrips();
    }, [agencyId, dateFilter]);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const url = `/api/trips?agencyId=${agencyId}&date=${dateFilter}`;
            const { data } = await axios.get(url);
            setTrips(data.trips);
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: TripStatus) => {
        switch (status) {
            case TripStatus.SCHEDULED: return 'bg-accent text-primary shadow-lg shadow-accent/20';
            case TripStatus.EN_ROUTE: return 'bg-success text-primary shadow-lg shadow-success/20 animate-pulse';
            case TripStatus.COMPLETED: return 'bg-white/10 text-gray-500 border border-white/10';
            case TripStatus.CANCELLED: return 'bg-red-500 text-white shadow-lg shadow-red-500/20';
            default: return 'bg-white/5 text-gray-400';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="glass overflow-hidden animate-in fade-in duration-700 shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-white/[0.02]">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Bookable Ledger</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live Deployment Scheduling</p>
                </div>
                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-4">Temporal Filter</span>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-token text-[10px] font-black uppercase tracking-[0.1em] focus:outline-none focus:border-accent/40 text-gray-400"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#0F172A]/40 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-6">Origin</th>
                            <th className="px-8 py-6">Destination</th>
                            <th className="px-8 py-6">Unit ID (Bus)</th>
                            <th className="px-8 py-6">Features</th>
                            <th className="px-8 py-6">T-Minus (Departure)</th>
                            <th className="px-8 py-6 text-center">Protocol Status</th>
                            <th className="px-8 py-6 text-center">Payload (Seats)</th>
                            <th className="px-8 py-6 text-right">Yield (Price)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {trips.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()).map((trip) => {
                            const [origin, destination] = (trip.routeId.routeName || '').includes(' - ')
                                ? trip.routeId.routeName.split(' - ')
                                : [trip.routeId.routeName || 'Unknown', 'Unknown'];

                            return (
                                <tr key={trip._id} className="text-white hover:bg-white/[0.03] transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="font-black text-lg tracking-tight group-hover:text-accent transition-colors uppercase">{origin}</div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Terminal: A_Alpha</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="font-black text-lg tracking-tight group-hover:text-accent transition-colors uppercase">{destination}</div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Terminal: B_Beta</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg group-hover:border-accent/30 transition-colors">
                                            {trip.busId.busNumber}
                                        </span>
                                        <div className="mt-2 text-[9px] uppercase tracking-wider text-accent font-bold">
                                            {trip.busId.type || 'Standard'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-1 w-24">
                                            {trip.busId.amenities && trip.busId.amenities.length > 0 ? (
                                                trip.busId.amenities.slice(0, 4).map((a, i) => (
                                                    <span key={i} className="text-[8px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                        {a}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[8px] text-gray-700 italic">Basic Config</span>
                                            )}
                                            {trip.busId.amenities && trip.busId.amenities.length > 4 && (
                                                <span className="text-[8px] text-gray-500">+{trip.busId.amenities.length - 4}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-xl font-black text-white tracking-tighter">
                                            {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </div>
                                        <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">UTC Synchronization</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusStyle(trip.status)}`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <div className="text-sm font-black text-white">{trip.availableSeats.length} / {trip.busId.capacity}</div>
                                            <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-accent transition-all duration-1000"
                                                    style={{ width: `${(trip.availableSeats.length / trip.busId.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-2xl font-black text-white tracking-tighter group-hover:text-accent transition-all">${trip.basePrice.toFixed(0)}</div>
                                    </td>
                                </tr>
                            );
                        })}
                        {trips.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-8 py-20 text-center text-gray-600">
                                    <div className="text-4xl mb-4 opacity-10">🗓️</div>
                                    <div className="font-black uppercase tracking-[0.3em] text-xs">No Missions Scheduled</div>
                                    <div className="text-[10px] font-medium opacity-40 mt-1 uppercase">Awaiting daily bookable schedule init</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
