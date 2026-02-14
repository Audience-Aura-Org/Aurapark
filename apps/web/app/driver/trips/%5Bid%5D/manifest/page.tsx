'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function TripManifestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [manifest, setManifest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchManifest();
    }, []);

    const fetchManifest = async () => {
        try {
            const { data } = await axios.get(`/api/driver/trips/${id}/manifest`);
            setManifest(data.manifest || null);
        } catch (error) {
            console.error('Failed to fetch manifest:', error);
        } finally {
            setLoading(false);
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
                title="Trip Manifest"
                subtitle={manifest?.routeName || 'Passenger list and trip details'}
                breadcrumbs={['Driver', 'Trips', 'Manifest']}
                actions={
                    <Button variant="primary">Print Manifest</Button>
                }
            />

            {/* Trip Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Departure</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.departureTime || '08:00 AM'}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Bus Number</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.busNumber || 'BUS-001'}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Total Passengers</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.passengers?.length || 0}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Checked In</div>
                    <div className="text-lg font-black text-success-600">{manifest?.checkedIn || 0}</div>
                </div>
            </div>

            {/* Passenger List */}
            <div className="glass-panel p-8">
                <h2 className="text-xl font-black text-neutral-900 mb-6">Passenger List</h2>
                <div className="space-y-3">
                    {manifest?.passengers?.map((passenger: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 glass-panel rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                    {passenger.displaySeatNumber || passenger.seatNumber}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">{passenger.name || 'Passenger Name'}</div>
                                    <div className="text-xs text-neutral-600 flex items-center gap-2">
                                        PNR: {passenger.pnr || 'ABC123'}
                                        <Badge variant={passenger.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                                            {passenger.paymentStatus || 'PENDING'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={passenger.checkedIn ? 'success' : 'glass'}
                                    size="sm"
                                    onClick={() => alert(`Check-in for ${passenger.name} coming soon!`)}
                                >
                                    {passenger.checkedIn ? 'Checked In' : 'Check In'}
                                </Button>
                            </div>
                        </div>
                    )) || (
                            <div className="text-center py-12 text-neutral-600">
                                No passengers for this trip
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
