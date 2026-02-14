'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function CheckInPage() {
    const [pnr, setPnr] = useState('');
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const getDisplaySeatNumber = (seatNumber: string) => {
        const seats = booking?.tripId?.busId?.seatMap?.seats || [];
        const index = seats.findIndex((s: any) => s.seatNumber === seatNumber);
        return index !== -1 ? (index + 1).toString() : seatNumber;
    };

    const handleSearch = async () => {
        if (!pnr.trim()) return;

        setLoading(true);
        setError('');
        setSuccess('');
        setBooking(null);

        try {
            const { data } = await axios.get(`/api/bookings/lookup?pnr=${pnr.toUpperCase()}`);
            setBooking(data.booking);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Booking not found');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async (passenger: any, index: number) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/tickets/check-in', {
                pnr: booking.pnr,
                ticketNumber: passenger.ticketNumber
            });

            const updatedBooking = { ...booking };
            updatedBooking.passengers[index].checkedIn = true;
            setBooking(updatedBooking);
            setSuccess(`Checked in ${passenger.name} successfully!`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to check in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Passenger Check-in"
                subtitle="Scan or enter PNR to check in passengers"
                breadcrumbs={['Dashboard', 'Check-in']}
            />

            {/* Search Section */}
            <div className="glass-panel-strong p-8 max-w-2xl mx-auto">
                <div className="flex gap-4">
                    <Input
                        label="PNR Number"
                        placeholder="Enter PNR (e.g., ABC123)"
                        value={pnr}
                        onChange={(e) => setPnr(e.target.value.toUpperCase())}
                        leftIcon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }
                    />
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSearch}
                        isLoading={loading}
                        className="mt-auto"
                    >
                        Search
                    </Button>
                </div>
                {error && (
                    <p className="mt-4 text-sm font-bold text-danger-600">{error}</p>
                )}
                {success && (
                    <p className="mt-4 text-sm font-bold text-success-600">{success}</p>
                )}
            </div>

            {/* Booking Details */}
            {booking && (
                <div className="max-w-4xl mx-auto space-y-6 animate-scale-in">
                    {/* Booking Info */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900 mb-1">
                                    {booking.tripId?.routeId?.routeName || 'Unknown Route'}
                                </h3>
                                <p className="text-sm font-semibold text-neutral-600">
                                    {booking.tripId?.departureTime ? new Date(booking.tripId.departureTime).toLocaleString() : ''}
                                </p>
                            </div>
                            <Badge variant="info" size="lg">
                                {booking.pnr}
                            </Badge>
                        </div>
                    </div>

                    {/* Passengers */}
                    <div className="space-y-4">
                        {booking.passengers.map((passenger: any, index: number) => (
                            <div key={index} className="glass-card p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner-glow">
                                            {getDisplaySeatNumber(passenger.seatNumber)}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-neutral-900">
                                                {passenger.name}
                                            </h4>
                                            <p className="text-sm font-semibold text-neutral-600">
                                                Seat {getDisplaySeatNumber(passenger.seatNumber)}
                                            </p>
                                        </div>
                                    </div>
                                    {passenger.checkedIn ? (
                                        <Badge variant="success" size="lg">
                                            ✓ Checked In
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="accent"
                                            size="lg"
                                            onClick={() => handleCheckIn(passenger, index)}
                                            isLoading={loading}
                                        >
                                            Check In
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
