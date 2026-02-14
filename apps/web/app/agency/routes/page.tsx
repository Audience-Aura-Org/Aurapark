'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { RouteModal } from '@/components/RouteModal';
import { Badge } from '@/components/Badge';
import Link from 'next/link';

export default function AgencyRoutesPage() {
    const [routes, setRoutes] = useState<any[]>([]);
    const [routeStats, setRouteStats] = useState<Map<string, any>>(new Map());
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [agencyId, setAgencyId] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                setAgencyId(authData.agency._id);

                const [routesRes, tripsRes] = await Promise.all([
                    axios.get(`/api/routes?agencyId=${authData.agency._id}`),
                    axios.get(`/api/trips?agencyId=${authData.agency._id}`)
                ]);

                const fetchedRoutes = routesRes.data.routes || [];
                const trips = tripsRes.data.trips || [];

                // Calculate stats for each route
                const stats = new Map();
                fetchedRoutes.forEach((route: any) => {
                    const routeTrips = trips.filter((t: any) => t.routeId?._id === route._id);
                    const activeTrips = routeTrips.filter((t: any) => t.status === 'ACTIVE' || t.status === 'SCHEDULED');
                    const completedTrips = routeTrips.filter((t: any) => t.status === 'COMPLETED');

                    stats.set(route._id, {
                        totalTrips: routeTrips.length,
                        activeTrips: activeTrips.length,
                        completedTrips: completedTrips.length
                    });
                });

                setRoutes(fetchedRoutes);
                setRouteStats(stats);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (route: any) => {
        setSelectedRoute(route);
        setIsModalOpen(true);
    };

    const handleDelete = async (routeId: string) => {
        if (!confirm('Are you sure you want to delete this route? This will not affect existing trips.')) return;
        try {
            await axios.delete(`/api/routes/${routeId}`);
            fetchData();
        } catch (error) {
            console.error('Failed to delete route:', error);
            alert('Failed to delete route');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedRoute(null);
        fetchData();
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Routes"
                subtitle={`Manage your ${routes.length} configured ${routes.length === 1 ? 'route' : 'routes'}`}
                breadcrumbs={['Dashboard', 'Routes']}
                actions={
                    <Button variant="primary" onClick={() => {
                        setSelectedRoute(null);
                        setIsModalOpen(true);
                    }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Route
                    </Button>
                }
            />

            {/* Routes Grid */}
            {routes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {routes.map((route, index) => {
                        const stats = routeStats.get(route._id) || { totalTrips: 0, activeTrips: 0, completedTrips: 0 };

                        return (
                            <div
                                key={route._id}
                                className="glass-card p-6 hover-lift transition-all"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-neutral-900 mb-2">
                                            {route.routeName}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {route.stops?.length > 0 && (
                                                <Badge variant="info" size="sm">
                                                    {route.stops.length} stops
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Trip Statistics */}
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="glass-panel p-3 text-center">
                                        <div className="text-2xl font-black text-neutral-900">{stats.totalTrips}</div>
                                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Total Trips</div>
                                    </div>
                                    <div className="glass-panel p-3 text-center bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                                        <div className="text-2xl font-black text-green-700">{stats.activeTrips}</div>
                                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide">Active</div>
                                    </div>
                                    <div className="glass-panel p-3 text-center">
                                        <div className="text-2xl font-black text-neutral-600">{stats.completedTrips}</div>
                                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Completed</div>
                                    </div>
                                </div>

                                {/* Departure Times */}
                                {route.departureTimes && route.departureTimes.length > 0 && (
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">
                                            Departure Times
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {route.departureTimes.map((time: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-900 text-sm font-bold"
                                                >
                                                    {time}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-neutral-200">
                                    <Link href={`/agency/trips?routeId=${route._id}`} className="flex-1">
                                        <Button variant="glass" size="sm" className="w-full">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Trips
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="glass"
                                        size="sm"
                                        onClick={() => handleEdit(route)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(route._id)}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                    }
                    title="No Routes Yet"
                    description="Create your first route to start organizing your trips with stops, pricing, and schedules."
                    action={
                        <Button variant="primary" size="lg" onClick={() => {
                            setSelectedRoute(null);
                            setIsModalOpen(true);
                        }}>
                            Create First Route
                        </Button>
                    }
                />
            )}

            {/* Route Modal */}
            <RouteModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                route={selectedRoute}
            />
        </div>
    );
}
