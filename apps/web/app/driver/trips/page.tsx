'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

export default function DriverTripsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const { data } = await axios.get('/api/driver/trips');
            setTrips(data.trips || []);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateTripStatus = async (tripId: string, status: string) => {
        if (!confirm(`Are you sure you want to change status to ${status}?`)) return;

        try {
            await axios.patch(`/api/driver/trips/${tripId}/status`, { status });
            // Refresh trips
            fetchTrips();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update trip status');
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
                title="My Trips"
                subtitle="Your assigned trips and schedules"
            />

            {/* Today's Trips */}
            <div className="glass-panel p-8">
                <h2 className="text-xl font-black text-neutral-900 mb-6">Today's Schedule</h2>
                {trips.length > 0 ? (
                    <div className="space-y-4">
                        {trips.map((trip: any, index: number) => (
                            <div key={trip._id || index} className="glass-card p-6 hover-lift">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900">{trip.routeName || 'Lagos → Abuja'}</h3>
                                            <p className="text-sm text-neutral-600 mt-1">
                                                Departure: {trip.departureTime || '08:00 AM'} • Bus: {trip.busNumber || 'BUS-001'}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-2">
                                                Passengers: {trip.bookedSeats || 0}/{trip.totalSeats || 40}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        trip.status === 'COMPLETED' ? 'success' :
                                            trip.status === 'IN_PROGRESS' ? 'orange' :
                                                'info'
                                    } size="sm">
                                        {trip.status || 'SCHEDULED'}
                                    </Badge>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={`/driver/trips/${trip._id}/manifest`} className="flex-1">
                                        <Button variant="primary" size="sm" className="w-full">View Manifest</Button>
                                    </Link>

                                    {trip.status === 'SCHEDULED' && (
                                        <Button
                                            variant="glass"
                                            size="sm"
                                            onClick={() => updateTripStatus(trip._id, 'EN_ROUTE')}
                                        >
                                            Start Trip
                                        </Button>
                                    )}

                                    {trip.status === 'EN_ROUTE' && (
                                        <Button
                                            variant="glass"
                                            size="sm"
                                            className="text-success-600 hover:text-success-700 hover:bg-success-50"
                                            onClick={() => updateTripStatus(trip._id, 'COMPLETED')}
                                        >
                                            Complete Trip
                                        </Button>
                                    )}

                                    <Button variant="glass" size="sm" onClick={() => alert('Feature coming soon')}>
                                        Report Issue
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }
                        title="No Trips Scheduled"
                        description="You don't have any trips assigned for today."
                    />
                )}
            </div>
        </div>
    );
}
