'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';

export default function CancelTripPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [tripId, setTripId] = useState<string | null>(null);
    const [trip, setTrip] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [refundPolicy, setRefundPolicy] = useState('full');
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
        } catch (error) {
            console.error('Failed to fetch trip:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            alert('Please select a cancellation reason');
            return;
        }

        const confirmed = confirm(
            'Are you sure you want to cancel this trip? This action cannot be undone. All passengers will be notified and refunded.'
        );
        if (!confirmed) return;

        setLoading(true);
        try {
            await axios.patch(`/api/agency/trips/${tripId}/cancel`, {
                reason,
                refundPolicy
            });
            alert('Trip cancelled successfully. Passengers will be notified and refunded.');
            router.push('/agency/trips');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to cancel trip');
        } finally {
            setLoading(false);
        }
    };

    if (!trip) return null;

    const bookedSeats = (trip.busId?.capacity || 0) - (trip.availableSeats?.length || 0);

    return (
        <div className="min-h-screen liquid-gradient p-8 pt-24">
            <div className="max-w-3xl mx-auto space-y-8">
                <DashboardNav title="Cancel Trip" backLink={`/agency/trips/${tripId}`} backLabel="Trip Details" />

                <div className="glass p-8 border-2 border-red-500/20">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-4xl">⚠️</div>
                            <h2 className="text-3xl font-black text-red-400">Cancel Trip</h2>
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">{trip.routeId?.routeName}</h3>
                        <p className="text-gray-400">Departure: {new Date(trip.departureTime).toLocaleString()}</p>
                    </div>

                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                        <h3 className="text-white font-black mb-3">Impact Summary</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p>• {bookedSeats} passengers will be affected</p>
                            <p>• All bookings will be automatically refunded</p>
                            <p>• SMS and email notifications will be sent</p>
                            <p>• This action cannot be undone</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                Cancellation Reason
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-red-400"
                                required
                            >
                                <option value="">Select reason...</option>
                                <option value="Mechanical Failure">Mechanical Failure</option>
                                <option value="Weather">Severe Weather</option>
                                <option value="Driver Unavailable">Driver Unavailable</option>
                                <option value="Low Bookings">Insufficient Bookings</option>
                                <option value="Road Closure">Road Closure</option>
                                <option value="Emergency">Emergency Situation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                Refund Policy
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="radio"
                                        name="refund"
                                        value="full"
                                        checked={refundPolicy === 'full'}
                                        onChange={(e) => setRefundPolicy(e.target.value)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <div className="text-white font-black">Full Refund (100%)</div>
                                        <div className="text-xs text-gray-400">Recommended for agency-initiated cancellations</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <input
                                        type="radio"
                                        name="refund"
                                        value="partial"
                                        checked={refundPolicy === 'partial'}
                                        onChange={(e) => setRefundPolicy(e.target.value)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <div className="text-white font-black">Partial Refund (50%)</div>
                                        <div className="text-xs text-gray-400">For special circumstances</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="glass" onClick={() => router.back()} className="flex-1">
                                Go Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                            >
                                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
