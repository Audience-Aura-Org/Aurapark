'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNav from '@/components/DashboardNav';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

export default function ManualBookingPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [availableSeats, setAvailableSeats] = useState<string[]>([]);
    const [selectedSeat, setSelectedSeat] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUpcomingTrips();
    }, []);

    const fetchUpcomingTrips = async () => {
        try {
            const { data } = await axios.get('/api/trips/search');
            setTrips(data.trips || []);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        }
    };

    const handleTripSelect = (trip: any) => {
        setSelectedTrip(trip);
        setAvailableSeats(trip.availableSeats || []);
        setSelectedSeat('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrip || !selectedSeat || !passengerName || !passengerPhone) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/agency/bookings/manual', {
                tripId: selectedTrip._id,
                seatNumber: selectedSeat,
                passengerName,
                passengerPhone,
                reason
            });
            alert('Manual booking created successfully!');
            // Reset form
            setSelectedTrip(null);
            setSelectedSeat('');
            setPassengerName('');
            setPassengerPhone('');
            setReason('');
            fetchUpcomingTrips();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen liquid-gradient p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
                <DashboardNav title="Manual Booking" backLink="/agency/dashboard" backLabel="Dashboard" />

                <div className="glass p-8">
                    <h2 className="text-2xl font-black text-white mb-6">Create Manual Reservation</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Trip Selection */}
                        <div>
                            <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                Select Trip
                            </label>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {trips.map((trip) => (
                                    <div
                                        key={trip._id}
                                        onClick={() => handleTripSelect(trip)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all ${selectedTrip?._id === trip._id
                                                ? 'bg-accent/20 border-2 border-accent'
                                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-white font-black">{trip.routeId?.routeName}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(trip.departureTime).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-accent font-black">${trip.basePrice}</div>
                                                <div className="text-xs text-gray-500">{trip.availableSeats?.length} seats</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedTrip && (
                            <>
                                {/* Seat Selection */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                        Select Seat
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {availableSeats.map((seat) => (
                                            <button
                                                key={seat}
                                                type="button"
                                                onClick={() => setSelectedSeat(seat)}
                                                className={`h-12 rounded-lg font-black transition-all ${selectedSeat === seat
                                                        ? 'bg-accent text-primary'
                                                        : 'bg-white/5 text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {seat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Passenger Details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <Input
                                        label="Passenger Name"
                                        value={passengerName}
                                        onChange={(e) => setPassengerName(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={passengerPhone}
                                        onChange={(e) => setPassengerPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Reason */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-black uppercase tracking-widest mb-3">
                                        Booking Reason
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/40"
                                        placeholder="E.g., Walk-in customer, Phone booking, Emergency..."
                                    />
                                </div>

                                {/* Submit */}
                                <Button type="submit" disabled={loading} className="w-full h-14">
                                    {loading ? 'Creating Booking...' : 'Create Manual Booking'}
                                </Button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
