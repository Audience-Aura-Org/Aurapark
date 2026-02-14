'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useRouter } from 'next/navigation';

export default function DelayTripPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [tripId, setTripId] = useState<string | null>(null);
    const [trip, setTrip] = useState<any>(null);
    const [newDepartureTime, setNewDepartureTime] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        params.then(p => {
            setTripId(p.id);
            fetchTrip(p.id);
        });
    }, [params]);

    const fetchTrip = async (id: string) => {
        try {
            const { data } = await axios.get(`/api/trips/${id}`);
            setTrip(data.trip);
            // Set default to current departure time
            setNewDepartureTime(new Date(data.trip.departureTime).toISOString().slice(0, 16));
        } catch (error) {
            console.error('Failed to fetch trip:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDepartureTime || !reason) {
            alert('Please provide new departure time and reason');
            return;
        }

        setLoading(true);
        try {
            await axios.patch(`/api/agency/trips/${tripId}/delay`, {
                newDepartureTime,
                reason
            });
            alert('Trip delayed successfully. Passengers will be notified.');
            router.push('/agency/trips');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delay trip');
        } finally {
            setLoading(false);
        }
    };

    if (!trip) return null;

    return (
        <div className="min-h-screen liquid-gradient p-8 pt-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <DashboardNav title="Delay Trip" backLink={`/agency/trips/${tripId}`} backLabel="Trip Details" />

                <div className="glass p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white mb-2">{trip.routeId?.routeName}</h2>
                        <p className="text-gray-400">Current Departure: {new Date(trip.departureTime).toLocaleString()}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                New Departure Time
                            </label>
                            <input
                                type="datetime-local"
                                value={newDepartureTime}
                                onChange={(e) => setNewDepartureTime(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent/40"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                Delay Reason
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent/40"
                                required
                            >
                                <option value="">Select reason...</option>
                                <option value="Traffic">Heavy Traffic</option>
                                <option value="Weather">Weather Conditions</option>
                                <option value="Mechanical">Mechanical Issue</option>
                                <option value="Operational">Operational Delay</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="p-6 bg-accent/10 border border-accent/20 rounded-xl">
                            <h3 className="text-white font-black mb-2">⚠️ Notification Preview</h3>
                            <p className="text-sm text-gray-300">
                                All passengers with confirmed bookings will receive an SMS and email notification about this delay.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button type="button" variant="glass" onClick={() => router.back()} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? 'Updating...' : 'Confirm Delay'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
