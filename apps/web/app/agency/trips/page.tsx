'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { TripFilters, TripFilters as TripFiltersType } from '@/components/TripFilters';
import { TripActionModals } from '@/components/TripActionModals';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function AgencyTripsPage() {
    const router = useRouter();
    const [trips, setTrips] = useState<any[]>([]);
    const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [agencyId, setAgencyId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'bookable' | 'inTransit' | 'idle' | 'completed' | 'cancelled'>('bookable');

    // Modal State
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [modalAction, setModalAction] = useState<'edit' | 'delay' | 'cancel' | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                setAgencyId(authData.agency._id);

                const [tripsRes, busesRes, routesRes] = await Promise.all([
                    axios.get(`/api/trips?agencyId=${authData.agency._id}`),
                    axios.get(`/api/buses?agencyId=${authData.agency._id}`),
                    axios.get(`/api/routes?agencyId=${authData.agency._id}`)
                ]);

                const tripsData = tripsRes.data.trips || [];
                const validTrips = tripsData.filter((t: any) => t.routeId && t.busId);

                setTrips(validTrips);
                setFilteredTrips(validTrips);
                setBuses(busesRes.data.buses || []);
                setRoutes(routesRes.data.routes || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (filters: TripFiltersType) => {
        try {
            const params = new URLSearchParams({ agencyId });
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);
            if (filters.busId) params.append('busId', filters.busId);
            if (filters.routeId) params.append('routeId', filters.routeId);
            if (filters.search) params.append('search', filters.search);

            const { data } = await axios.get(`/api/trips?${params.toString()}`);
            const tripsData = data.trips || [];
            const validTrips = tripsData.filter((t: any) => t.routeId && t.busId);
            setFilteredTrips(validTrips);
        } catch (error) {
            console.error('Failed to filter trips:', error);
        }
    };

    const handleDelete = async (tripId: string) => {
        if (!confirm('Are you sure you want to delete this trip?')) return;
        try {
            await axios.delete(`/api/trips/${tripId}`);
            fetchInitialData();
        } catch (error: any) {
            if (error.response?.status === 403) {
                if (confirm(`Deletion Blocked: ${error.response.data.error}\n\nDo you want to FORCE delete?`)) {
                    await axios.delete(`/api/trips/${tripId}?force=true`);
                    fetchInitialData();
                }
            } else {
                alert('Failed to delete trip.');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'info';
            case 'EN_ROUTE': return 'orange';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'neutral';
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const calculateOccupancy = (trip: any) => {
        const total = trip.busId?.capacity || 0;
        const booked = typeof trip.bookedCount === 'number' ? trip.bookedCount : (total - (trip.availableSeats?.length || 0));
        return { booked, total, percentage: total > 0 ? Math.round((booked / total) * 100) : 0 };
    };

    const getRoutePath = (trip: any) => {
        const routeName = trip.routeId?.routeName || '';
        if (routeName.includes(' - ')) {
            const [origin, destination] = routeName.split(' - ');
            return { origin, destination, stopCount: trip.stops?.length || 0 };
        }
        if (trip.stops && trip.stops.length > 0) {
            return { origin: trip.stops[0].name, destination: trip.stops[trip.stops.length - 1].name, stopCount: trip.stops.length };
        }
        return { origin: 'Unknown', destination: 'Unknown', stopCount: 0 };
    };

    const categories = (() => {
        const now = new Date();
        const bookable: any[] = [];
        const inTransit: any[] = [];
        const completed: any[] = [];
        const cancelled: any[] = [];
        const idle: any[] = [];

        filteredTrips.forEach((t: any) => {
            const dep = new Date(t.departureTime).getTime();
            const arr = new Date(t.arrivalTime).getTime();
            const nowMs = now.getTime();

            if (t.status === 'CANCELLED') {
                cancelled.push(t);
            } else if (t.status === 'COMPLETED' || arr < nowMs) {
                // Completed: explicit status OR arrival time has passed
                completed.push(t);
            } else if (t.status === 'EN_ROUTE') {
                inTransit.push(t);
            } else if (dep <= nowMs && arr >= nowMs) {
                // Between departure and arrival (status may still be SCHEDULED)
                inTransit.push(t);
            } else if (dep > nowMs) {
                // Future departure = bookable
                bookable.push(t);
            } else {
                completed.push(t); // Past arrival, status not updated
            }
        });

        // Idle: buses not assigned to any bookable or in-transit trip
        const getBusId = (t: any) => t.busId?._id?.toString?.() ?? t.busId?.toString?.();
        const assignedBusIds = new Set(
            [...bookable, ...inTransit].map(t => getBusId(t)).filter(Boolean)
        );
        buses.forEach((b: any) => {
            const bid = b._id?.toString?.() ?? b._id;
            if (bid && !assignedBusIds.has(bid)) idle.push(b);
        });

        return { bookable, inTransit, completed, cancelled, idle };
    })();

    const { isCollapsed } = useSidebar();

    if (loading) return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Trip Management"
                subtitle="Fleet operations and mission tracking"
                breadcrumbs={['Dashboard', 'Trips']}
                actions={<Link href="/agency/buses"><Button variant="primary">Schedule New Mission</Button></Link>}
            />

            <TripFilters onFilterChange={handleFilterChange} buses={buses} routes={routes} />

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { id: 'bookable', label: 'Bookable', count: categories.bookable.length, color: 'text-primary-600' },
                    { id: 'inTransit', label: 'In Transit', count: categories.inTransit.length, color: 'text-blue-600' },
                    { id: 'idle', label: 'Ready/Idle', count: categories.idle.length, color: 'text-amber-600' },
                    { id: 'completed', label: 'Completed', count: categories.completed.length, color: 'text-green-600' },
                    { id: 'cancelled', label: 'Cancelled', count: categories.cancelled.length, color: 'text-red-500' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3 transition-all duration-500 transform ${activeTab === tab.id ? 'bg-white text-neutral-900 shadow-md scale-[1.02]' : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/30'}`}
                    >
                        {tab.label}
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] tabular-nums font-bold ${activeTab === tab.id ? 'bg-neutral-900 text-white' : 'bg-neutral-200/50 text-neutral-500'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="space-y-4 pb-12">
                {activeTab === 'bookable' && (
                    <div className="grid grid-cols-1 gap-4">
                        {categories.bookable.length > 0 ? categories.bookable.map(item => (
                            <TripCard key={item._id} item={item} isActive={false} isPast={false} router={router} getStatusColor={getStatusColor} formatDateTime={formatDateTime} calculateOccupancy={calculateOccupancy} getRoutePath={getRoutePath} setSelectedTrip={setSelectedTrip} setModalAction={setModalAction} handleDelete={handleDelete} />
                        )) : <EmptyState icon="📅" title="No Bookable Missions" description="No future missions currently scheduled." action={<Link href="/agency/buses"><Button variant="primary">Schedule Now</Button></Link>} />}
                    </div>
                )}
                {activeTab === 'inTransit' && (
                    <div className="grid grid-cols-1 gap-4">
                        {categories.inTransit.length > 0 ? categories.inTransit.map(item => (
                            <TripCard key={item._id} item={item} isActive={true} isPast={false} router={router} getStatusColor={getStatusColor} formatDateTime={formatDateTime} calculateOccupancy={calculateOccupancy} getRoutePath={getRoutePath} setSelectedTrip={setSelectedTrip} setModalAction={setModalAction} handleDelete={handleDelete} />
                        )) : <EmptyState icon="⚡" title="No In-Transit Missions" description="No missions currently on the road." />}
                    </div>
                )}
                {activeTab === 'idle' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.idle.length > 0 ? categories.idle.map(bus => (
                            <div key={bus._id} className="glass-card p-4 border-l-4 border-l-amber-400 bg-white/80 flex flex-col justify-between gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-widest">Available</span>
                                        <div className="font-black text-neutral-900 text-lg mt-1">{bus.busNumber}</div>
                                        <div className="text-[10px] text-neutral-400 font-bold uppercase">{bus.type} • {bus.capacity} Seats</div>
                                    </div>
                                </div>
                                <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => router.push('/agency/buses')}>Deploy Unit</Button>
                            </div>
                        )) : <EmptyState icon="💤" title="No Idle Units" description="All units are currently assigned." />}
                    </div>
                )}
                {activeTab === 'completed' && (
                    <div className="space-y-4">
                        {categories.completed.length > 0 ? categories.completed.map(item => (
                            <TripCard key={item._id} item={item} isActive={false} isPast={true} router={router} getStatusColor={getStatusColor} formatDateTime={formatDateTime} calculateOccupancy={calculateOccupancy} getRoutePath={getRoutePath} setSelectedTrip={setSelectedTrip} setModalAction={setModalAction} handleDelete={handleDelete} />
                        )) : <EmptyState icon="✅" title="No Completed Missions" description="No history found." />}
                    </div>
                )}
                {activeTab === 'cancelled' && (
                    <div className="space-y-4">
                        {categories.cancelled.length > 0 ? categories.cancelled.map(item => (
                            <TripCard key={item._id} item={item} isActive={false} isPast={true} router={router} getStatusColor={getStatusColor} formatDateTime={formatDateTime} calculateOccupancy={calculateOccupancy} getRoutePath={getRoutePath} setSelectedTrip={setSelectedTrip} setModalAction={setModalAction} handleDelete={handleDelete} />
                        )) : <EmptyState icon="❌" title="No Cancelled Missions" description="No history found." />}
                    </div>
                )}
            </div>

            <TripActionModals
                trip={selectedTrip}
                action={modalAction}
                onClose={() => {
                    setModalAction(null);
                    setSelectedTrip(null);
                }}
                onSuccess={fetchInitialData}
            />
        </div>
    );
}

function TripCard({ item, isActive, isPast, router, getStatusColor, formatDateTime, calculateOccupancy, getRoutePath, setSelectedTrip, setModalAction, handleDelete }: any) {
    const departure = formatDateTime(item.departureTime);
    const arrival = formatDateTime(item.arrivalTime);
    const occupancy = calculateOccupancy(item);
    const routePath = getRoutePath(item);

    return (
        <div onClick={() => router.push(`/agency/trips/${item._id}`)} className={`glass-card hover:bg-white/90 transition-all border-l-4 p-4 flex flex-col gap-3 group cursor-pointer relative overflow-hidden ${isActive ? 'border-l-success-500 bg-success-50/40 shadow-md ring-1 ring-success-500/20' : isPast ? 'border-l-neutral-300 bg-neutral-50/50 opacity-75' : 'border-l-primary-500 bg-white shadow-sm'}`}>
            {isActive && <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 rounded-full bg-success-500 animate-ping"></div></div>}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Badge
                        variant={getStatusColor(item.status === 'CANCELLED' ? 'CANCELLED' : (isPast ? 'COMPLETED' : item.status))}
                        size="sm"
                    >
                        {item.status === 'CANCELLED' ? 'CANCELLED' : (isPast ? 'COMPLETED' : item.status)}
                    </Badge>
                    <div className="flex flex-col">
                        <div className={`text-xl font-black leading-none ${isActive ? 'text-success-800' : isPast ? 'text-neutral-500' : 'text-neutral-900'}`}>{departure.time}</div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase">{departure.date}</div>
                    </div>
                    <div className="h-8 w-px bg-neutral-200 mx-1"></div>
                    <div className="flex flex-col">
                        <div className={`text-xl font-black leading-none ${isActive ? 'text-success-600' : 'text-neutral-400'}`}>{arrival.time}</div>
                        <div className="text-[10px] font-bold text-neutral-300 uppercase">{isPast ? 'Arrived At' : 'Est. Arrival'}</div>
                    </div>
                </div>
                <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-6">
                    <span className={`text-[11px] font-black uppercase truncate ${isPast ? 'text-neutral-400' : 'text-neutral-800'}`}>{routePath.origin}</span>
                    <div className="flex-1 flex items-center">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPast ? 'bg-neutral-300' : 'bg-primary-600'}`}></div>
                        <div className="flex-1 border-t-2 border-dashed border-neutral-200"></div>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPast ? 'bg-neutral-300' : 'bg-neutral-900'}`}></div>
                    </div>
                    <span className={`text-[11px] font-black uppercase truncate ${isPast ? 'text-neutral-400' : 'text-neutral-800'}`}>{routePath.destination}</span>
                </div>
                <div className="text-right">
                    <div className="text-[9px] font-black text-neutral-400 uppercase tracking-tighter">{isPast ? 'Final Revenue' : 'Ticket Sales'}</div>
                    <div className={`text-2xl font-black ${isPast ? 'text-neutral-500' : 'text-green-600'}`}>XAF {(item.actualRevenue || 0).toLocaleString()}</div>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between border-t border-neutral-100 pt-3 gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-lg">🚌</div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-black text-neutral-700 leading-none">{item.busId?.busNumber}</div>
                            <div className="text-[10px] font-black text-neutral-400 uppercase opacity-60 h-fit leading-none mb-[-1px] tracking-tighter">• {item.busId?.type}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 w-32">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-tight">
                            <span className="text-neutral-400">Load Factor</span>
                            <span className="text-primary-600">{occupancy.percentage}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${isPast ? 'bg-neutral-300' : 'bg-primary-500'}`} style={{ width: `${occupancy.percentage}%` }} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isPast && (
                        <>
                            <Button variant="glass" size="sm" className="h-8 text-[10px] font-bold px-4" onClick={(e) => { e.stopPropagation(); setSelectedTrip(item); setModalAction('edit'); }}>Modify</Button>
                            <Button variant="glass" size="sm" className="h-8 text-[10px] font-bold px-4" onClick={(e) => { e.stopPropagation(); setSelectedTrip(item); setModalAction('delay'); }}>Delay</Button>
                            <Button variant="danger" size="sm" className="h-8 w-8 p-0 flex items-center justify-center rounded-lg" onClick={(e) => { e.stopPropagation(); setSelectedTrip(item); setModalAction('cancel'); }}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></Button>
                        </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }} className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
