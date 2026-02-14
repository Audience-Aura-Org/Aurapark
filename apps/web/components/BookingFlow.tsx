'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import SeatMap from './SeatMap';
import { Button } from './Button';
import { Input } from './Input';

interface BookingFlowProps {
    tripId: string;
    onBookingComplete: (booking: any) => void;
}

export default function BookingFlow({ tripId, onBookingComplete }: BookingFlowProps) {
    const [step, setStep] = useState(1); // 1: Seat selection, 2: Passenger details
    const [trip, setTrip] = useState<any>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [reservation, setReservation] = useState<any>(null);
    const [passengers, setPassengers] = useState<any[]>([]);
    const [contact, setContact] = useState({ email: '', phone: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTripDetails();
    }, [tripId]);

    const fetchTripDetails = async () => {
        try {
            const { data } = await axios.get(`/api/trips/${tripId}`);
            setTrip(data.trip);
        } catch (error) {
            console.error('Error fetching trip details:', error);
        }
    };

    const handleSeatSelect = (seatNumber: string) => {
        setSelectedSeats(prev =>
            prev.includes(seatNumber)
                ? prev.filter(s => s !== seatNumber)
                : [...prev, seatNumber]
        );
    };

    const handleReserve = async () => {
        if (selectedSeats.length === 0) return;
        setLoading(true);
        try {
            // Mock sessionId for now
            const sessionId = 'temp-session-' + Math.random().toString(36).substr(2, 9);
            const { data } = await axios.post('/api/bookings/reserve', {
                tripId,
                seatNumbers: selectedSeats,
                sessionId
            });
            setReservation(data);
            setStep(2);
            // Initialize passenger details
            setPassengers(selectedSeats.map(s => ({ seatNumber: s, name: '', age: '' })));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to reserve seats');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('/api/bookings', {
                reservationId: reservation.reservationId,
                passengers,
                contactEmail: contact.email,
                contactPhone: contact.phone,
                totalAmount: trip.basePrice * selectedSeats.length
            });
            onBookingComplete(data.booking);
        } catch (error: any) {
            alert(error.response?.data?.error || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (!trip) return <div className="text-white text-center py-8">Loading trip...</div>;

    return (
        <div className="max-w-4xl mx-auto safe-bottom-nav">
            {step === 1 && (
                <div className="space-y-6">
                    <div className="glass p-6">
                        <h2 className="text-2xl font-bold text-white mb-2">{trip.routeId.routeName}</h2>
                        <p className="text-gray-400">Departure: {new Date(trip.departureTime).toLocaleString()}</p>
                        <p className="text-secondary font-bold text-xl mt-2">${trip.basePrice} / seat</p>
                    </div>

                    <SeatMap
                        seatMap={{
                            ...trip.busId.seatMap,
                            seats: trip.busId.seatMap.seats.map((s: any) => ({
                                ...s,
                                isAvailable: trip.availableSeats.includes(s.seatNumber)
                            }))
                        }}
                        selectedSeats={selectedSeats}
                        onSeatSelect={handleSeatSelect}
                    />

                    <div className="flex justify-between items-center glass p-6">
                        <div>
                            <p className="text-gray-400">Selected: {selectedSeats.length} seats</p>
                            <p className="text-white font-bold text-xl">Total: ${trip.basePrice * selectedSeats.length}</p>
                        </div>
                        <Button
                            onClick={handleReserve}
                            disabled={selectedSeats.length === 0 || loading}
                            className="px-12"
                        >
                            {loading ? 'Reserving...' : 'Continue to Checkout'}
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <form onSubmit={handleConfirmBooking} className="space-y-6">
                    <div className="glass p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Passenger Details</h2>
                        <div className="space-y-8">
                            {passengers.map((p, idx) => (
                                <div key={idx} className="p-4 border border-white/10 rounded-lg bg-white/5">
                                    <p className="text-secondary font-bold mb-4">Seat {p.seatNumber}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Full Name"
                                            required
                                            value={p.name}
                                            onChange={(e) => {
                                                const newP = [...passengers];
                                                newP[idx].name = e.target.value;
                                                setPassengers(newP);
                                            }}
                                        />
                                        <Input
                                            label="Age"
                                            type="number"
                                            required
                                            value={p.age}
                                            onChange={(e) => {
                                                const newP = [...passengers];
                                                newP[idx].age = e.target.value;
                                                setPassengers(newP);
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                required
                                value={contact.email}
                                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                            />
                            <Input
                                label="Phone"
                                required
                                value={contact.phone}
                                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="w-1/3"
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-2/3"
                        >
                            {loading ? 'Processing...' : `Confirm & Pay $${trip.basePrice * selectedSeats.length}`}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
