'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminTripsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        agencyId: '',
        status: '',
        date: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchTrips();
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const { data } = await axios.get('/api/agencies');
            setAgencies(data.agencies || []);
        } catch (error) {
            console.error('Failed to fetch agencies:', error);
        }
    };

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.agencyId) queryParams.append('agencyId', filters.agencyId);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.date) queryParams.append('date', filters.date);

            const { data } = await axios.get(`/api/trips?${queryParams.toString()}`);
            setTrips(data.trips || []);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Trips & Routes Oversight"
                subtitle="Monitor all active and scheduled journeys across the platform"
                breadcrumbs={['Admin', 'Trips']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">Export Report</Button>
                        <Button variant="primary" size="sm">Routes Map</Button>
                    </div>
                }
            />

            {/* Filters */}
            <div className="glass-panel p-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Filter by Agency</label>
                    <select
                        value={filters.agencyId}
                        onChange={(e) => setFilters({ ...filters, agencyId: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                    >
                        <option value="">All Agencies</option>
                        {agencies.map(a => (
                            <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                    >
                        <option value="">All Statuses</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="EN_ROUTE">En Route</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="w-48 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                    />
                </div>
                <Button
                    variant="glass"
                    onClick={() => setFilters({ agencyId: '', status: '', date: format(new Date(), 'yyyy-MM-dd') })}
                >
                    Reset
                </Button>
            </div>

            {/* Trips List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
                </div>
            ) : trips.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {trips.map((trip) => (
                        <TripRow key={trip._id} trip={trip} />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={
                        <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    title="No Trips Found"
                    description="No trips match your current filter criteria."
                />
            )}
        </div>
    );
}

function TripRow({ trip }: { trip: any }) {
    const occupancy = Math.round(((trip.bookedCount || 0) / (trip.busId?.capacity || 1)) * 100);

    return (
        <div className="glass-panel p-6 rounded-2xl hover:bg-white/60 transition-all group">
            <div className="flex flex-wrap items-center gap-6">
                <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="info" size="sm">{trip.agencyId?.name || 'Loading...'}</Badge>
                        <Badge variant={trip.status === 'CANCELLED' ? 'danger' : trip.status === 'COMPLETED' ? 'success' : 'info'} size="sm">
                            {trip.status}
                        </Badge>
                    </div>
                    <h3 className="text-lg font-black text-neutral-900">
                        {trip.routeId?.routeName || 'Unknown Route'}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-600 mt-1">
                        {format(new Date(trip.departureTime), 'MMM d, h:mm a')} • Trip ID: {trip._id.slice(-6).toUpperCase()}
                    </p>
                </div>

                <div className="w-32 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Occupancy</div>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${occupancy > 90 ? 'bg-danger-500' : occupancy > 50 ? 'bg-warning-500' : 'bg-success-500'}`}
                                style={{ width: `${occupancy}%` }}
                            />
                        </div>
                        <span className="text-sm font-black text-neutral-900">{occupancy}%</span>
                    </div>
                </div>

                <div className="w-32 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Revenue</div>
                    <div className="text-sm font-black text-neutral-900">
                        XAF {(trip.actualRevenue || 0).toLocaleString()}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Link href={`/admin/trips/${trip._id}`}>
                        <Button variant="glass" size="sm">Manage</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
