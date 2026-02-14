'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyFleetStatusPage() {
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const { data: authData } = await axios.get('/api/auth/me');
                if (authData.agency) {
                    const { data } = await axios.get(`/api/buses?agencyId=${authData.agency._id}`);
                    setBuses(data.buses || []);
                }
            } catch (error) {
                console.error('Failed to load bus status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBuses();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bus status"
                subtitle="See where each bus is and how it is used."
                breadcrumbs={['Agency', 'Fleet', 'Status']}
            />

            {buses.length === 0 ? (
                <EmptyState
                    icon="🚌"
                    title="No buses yet"
                    description="Add buses to your account to start tracking their status."
                />
            ) : (
                <div className="glass-panel p-6 space-y-3">
                    <div className="hidden md:grid grid-cols-5 gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        <div>Bus</div>
                        <div>Model</div>
                        <div>Status</div>
                        <div>Seats</div>
                        <div className="text-right">Next trip</div>
                    </div>

                    <div className="space-y-3">
                        {buses.map((bus) => (
                            <div
                                key={bus._id}
                                className="flex flex-col md:grid md:grid-cols-5 gap-3 items-start md:items-center py-3 px-4 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="font-black text-neutral-900 text-sm">
                                    {bus.busNumber}
                                </div>
                                <div className="text-xs text-neutral-600">
                                    {bus.busModel || 'Not set'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={bus.isActive ? 'success' : 'danger'} size="sm">
                                        {bus.isActive ? 'In service' : 'Inactive'}
                                    </Badge>
                                </div>
                                <div className="text-sm font-black text-neutral-900">
                                    {bus.capacity} seats
                                </div>
                                <div className="text-xs text-neutral-600 md:text-right">
                                    {bus.nextTrip
                                        ? `${new Date(bus.nextTrip.departureTime).toLocaleDateString()} at ${new Date(
                                              bus.nextTrip.departureTime
                                          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : 'No trip planned'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
