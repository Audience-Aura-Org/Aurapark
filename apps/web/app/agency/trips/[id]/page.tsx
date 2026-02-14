'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';
import { TripActionModals } from '@/components/TripActionModals';
import Link from 'next/link';

export default function AgencyTripDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [tripId, setTripId] = useState<string | null>(null);
    const [trip, setTrip] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalAction, setModalAction] = useState<'edit' | 'delay' | 'cancel' | null>(null);

    useEffect(() => {
        params.then(p => {
            setTripId(p.id);
            fetchTripDetails(p.id);
        });
    }, [params]);

    const fetchTripDetails = async (id: string) => {
        try {
            const [tripRes, bookingsRes] = await Promise.all([
                axios.get(`/api/trips/${id}`),
                axios.get(`/api/agency/trips/${id}/bookings`)
            ]);
            setTrip(tripRes.data.trip);
            setBookings(bookingsRes.data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch trip details:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (bookings.length === 0) return;

        const headers = ['PNR', 'Passenger Name', 'Seat', 'Contact', 'Status', 'Amount'];
        const rows = bookings.flatMap(booking =>
            booking.passengers.map((passenger: any) => [
                booking.pnr,
                passenger.name,
                getDisplaySeatNumber(passenger.seatNumber),
                booking.contactPhone,
                passenger.checkedIn ? 'Checked In' : 'Pending',
                `$${(booking.totalAmount / booking.passengers.length).toFixed(2)}`
            ])
        );

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trip-${tripId}-manifest.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'info';
            case 'ACTIVE': return 'success';
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'danger';
            case 'DELAYED': return 'warning';
            default: return 'default';
        }
    };

    const getDisplaySeatNumber = (seatNumber: string) => {
        const seats = trip?.busId?.seatMap?.seats || [];
        const index = seats.findIndex((s: any) => s.seatNumber === seatNumber);
        return index !== -1 ? (index + 1).toString() : seatNumber;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (loading) return (
        <div className="flex items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    if (!trip) return (
        <div className="text-center py-20">
            <div className="text-6xl mb-6">🚫</div>
            <h3 className="text-2xl font-black text-neutral-900 mb-2">Trip Not Found</h3>
            <Link href="/agency/trips">
                <Button variant="primary" className="mt-6">Back to Trips</Button>
            </Link>
        </div>
    );

    const departure = formatDateTime(trip.departureTime);
    const arrival = formatDateTime(trip.arrivalTime);
    const passengers = bookings.flatMap(b => b.passengers);
    const bookedSeats = passengers.length;
    const totalSeats = trip.busId?.capacity || 0;
    const occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return (
        <div className="p-8 space-y-6">
            <PageHeader
                title={trip.routeId?.routeName || 'Trip Details'}
                subtitle={`${trip.busId?.model || 'Standard Unit'} • ${trip.busId?.type || 'Standard Class'}`}
                breadcrumbs={['Dashboard', 'Trips', 'Details']}
                actions={
                    <div className="flex gap-3">
                        <Button
                            variant="glass"
                            onClick={() => {
                                setModalAction('delay');
                                setIsModalOpen(true);
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Delay
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => {
                                setModalAction('cancel');
                                setIsModalOpen(true);
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Trip
                        </Button>
                    </div>
                }
            />

            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-neutral-900">Trip Overview</h2>
                    <Badge variant={getStatusColor(trip.status)} size="lg">
                        {trip.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-4">
                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Departure</div>
                        <div className="text-2xl font-black text-neutral-900 mb-1">{departure.time}</div>
                        <div className="text-sm text-neutral-600">{departure.date}</div>
                    </div>

                    <div className="glass-panel p-4">
                        <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Arrival</div>
                        <div className="text-2xl font-black text-neutral-900 mb-1">{arrival.time}</div>
                        <div className="text-sm text-neutral-600">{arrival.date}</div>
                    </div>

                    <div className="glass-panel p-4 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200">
                        <div className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-2">Occupancy</div>
                        <div className="text-2xl font-black text-primary-900 mb-1">{occupancyRate}%</div>
                        <div className="text-sm text-primary-700">{bookedSeats}/{totalSeats} seats</div>
                    </div>

                    <div className="glass-panel p-4 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                        <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Revenue</div>
                        <div className="text-2xl font-black text-green-900 mb-1">XAF {totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-green-700">XAF {trip.basePrice.toLocaleString()}/seat</div>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-neutral-900">Passenger Manifest</h2>
                        <p className="text-sm text-neutral-600 mt-1">
                            {bookings.reduce((sum, b) => sum + b.passengers.length, 0)} passengers booked
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="glass" onClick={exportToCSV} disabled={bookings.length === 0}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export CSV
                        </Button>
                        <Button variant="glass" onClick={() => window.print()}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print
                        </Button>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-black text-neutral-900 mb-2">No Bookings Yet</h3>
                        <p className="text-neutral-600">This trip hasn't received any bookings yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-100 border-b-2 border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-black text-neutral-700 uppercase tracking-wider">PNR</th>
                                    <th className="px-4 py-3 text-left text-xs font-black text-neutral-700 uppercase tracking-wider">Passenger</th>
                                    <th className="px-4 py-3 text-center text-xs font-black text-neutral-700 uppercase tracking-wider">Seat</th>
                                    <th className="px-4 py-3 text-left text-xs font-black text-neutral-700 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-3 text-center text-xs font-black text-neutral-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-black text-neutral-700 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {bookings.flatMap((booking) =>
                                    booking.passengers.map((passenger: any, idx: number) => (
                                        <tr key={`${booking._id}-${idx}`} className="hover:bg-neutral-50 transition-colors">
                                            <td className="px-4 py-4 text-sm font-black text-primary-600">{booking.pnr}</td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-neutral-900">{passenger.name}</div>
                                                <div className="text-xs text-neutral-500">{passenger.age} years • {passenger.gender}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant="info" size="sm">{getDisplaySeatNumber(passenger.seatNumber)}</Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-neutral-900">{booking.contactPhone}</div>
                                                <div className="text-xs text-neutral-500">{booking.contactEmail}</div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <Badge variant={passenger.checkedIn ? 'success' : 'default'} size="sm">
                                                    {passenger.checkedIn ? 'Checked In' : 'Pending'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-neutral-900">
                                                XAF {(booking.totalAmount / booking.passengers.length).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TripActionModals
                    trip={trip}
                    action={modalAction}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        if (tripId) fetchTripDetails(tripId);
                    }}
                />
            )}
        </div>
    );
}
