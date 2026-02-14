'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { RefundReason } from '@/lib/types';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function MyBookingsPage() {
    const { isCollapsed } = useSidebar();
    const [bookings, setBookings] = useState<any[]>([]);
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    // Review form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // Dispute form state
    const [disputeReason, setDisputeReason] = useState<RefundReason>(RefundReason.OTHER);
    const [disputeDescription, setDisputeDescription] = useState('');
    const [requestedAmount, setRequestedAmount] = useState('');

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.user) {
                setUser(authData.user);
                const [bookingsRes, disputesRes] = await Promise.all([
                    axios.get(`/api/bookings?userId=${authData.user._id}`),
                    axios.get(`/api/disputes?userId=${authData.user._id}`)
                ]);
                setBookings(bookingsRes.data.bookings);
                setDisputes(disputesRes.data.disputes || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking || !user) return;

        setSubmitting(true);
        try {
            await axios.post('/api/reviews', {
                userId: user._id,
                tripId: selectedBooking.tripId._id,
                agencyId: selectedBooking.tripId.agencyId,
                rating,
                comment
            });
            alert('Thank you for your review!');
            setIsReviewModalOpen(false);
            setRating(5);
            setComment('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisputeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBooking || !user) return;

        setSubmitting(true);
        try {
            await axios.post('/api/disputes', {
                bookingId: selectedBooking._id,
                reason: disputeReason,
                description: disputeDescription,
                amountRequested: parseFloat(requestedAmount)
            });
            alert('Your dispute has been filed and is under review.');
            setIsDisputeModalOpen(false);
            setDisputeDescription('');
            setRequestedAmount('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to file dispute');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );



    return (
        <div className="min-h-screen bg-mesh-green selection:bg-primary-500 selection:text-white">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <PageHeader
                        title="My Bookings"
                        subtitle={`${bookings.length} ${bookings.length === 1 ? 'booking' : 'bookings'} found`}
                        breadcrumbs={['Home', 'My Bookings']}
                        actions={
                            <Link href="/">
                                <Button variant="primary">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Booking
                                </Button>
                            </Link>
                        }
                    />

                    <div className="space-y-6">
                        {bookings.map((booking, index) => {
                            const isCompleted = booking.tripId?.status === 'COMPLETED';

                            return (
                                <div
                                    key={booking._id}
                                    className="glass-card p-8 hover-lift"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Booking Info */}
                                        <div className="flex-1 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Badge variant="info" size="lg">
                                                            {booking.pnr}
                                                        </Badge>
                                                        <h3 className="text-2xl font-black text-neutral-900">
                                                            {booking.tripId?.routeId?.routeName || 'Route'}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                                                        <span>{new Date(booking.tripId?.departureTime).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{booking.passengers?.length || 0} passenger(s)</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge variant={
                                                        booking.status === 'CONFIRMED' ? 'success' :
                                                            booking.status === 'PENDING' ? 'warning' :
                                                                'danger'
                                                    }>
                                                        {booking.status}
                                                    </Badge>
                                                    {isCompleted && (
                                                        <div className="mt-2 text-right">
                                                            <Badge variant="orange">Completed</Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Seats */}
                                            <div>
                                                <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">
                                                    Seats
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {booking.passengers?.map((p: any, idx: number) => (
                                                        <div key={idx} className="glass-panel px-3 py-2 rounded-xl">
                                                            <div className="text-xs font-bold text-neutral-700">
                                                                {p.seatNumber}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-600">{p.name}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Contact */}
                                            <div className="flex items-center gap-4 text-sm font-medium text-neutral-700">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {booking.contactEmail}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {booking.contactPhone}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price & Actions */}
                                        <div className="flex flex-col justify-between items-end gap-4 border-t lg:border-t-0 lg:border-l border-white/30 pt-6 lg:pt-0 lg:pl-8 min-w-[200px]">
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-1">Total Paid</div>
                                                <div className="text-2xl font-bold text-gradient-green">XAF {booking.totalAmount?.toLocaleString()}</div>
                                            </div>
                                            <div className="flex flex-col gap-2 w-full">
                                                <Link href={`/tickets?bookingId=${booking._id}`}>
                                                    <Button variant="primary" size="md" className="w-full">
                                                        View Tickets
                                                    </Button>
                                                </Link>

                                                {isCompleted && (
                                                    <Button
                                                        variant="warning"
                                                        size="md"
                                                        className="w-full"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setIsReviewModalOpen(true);
                                                        }}
                                                    >
                                                        Rate Agency
                                                    </Button>
                                                )}

                                                {disputes.find(d => d.bookingId?._id === booking._id) ? (
                                                    <Link href="/disputes">
                                                        <Button variant="success" size="sm" className="w-full">
                                                            View Dispute
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="glass" size="sm" className="w-full" onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setRequestedAmount(booking.totalAmount.toString());
                                                        setIsDisputeModalOpen(true);
                                                    }}>
                                                        Raise Dispute
                                                    </Button>
                                                )}

                                                <Button variant="glass" size="sm" className="w-full">
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {bookings.length === 0 && (
                            <EmptyState
                                icon={
                                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                }
                                title="No Bookings Yet"
                                description="You haven't made any bookings yet. Start exploring routes and book your first trip!"
                                action={
                                    <Link href="/">
                                        <Button variant="primary" size="lg">
                                            Browse Routes
                                        </Button>
                                    </Link>
                                }
                            />
                        )}
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {isReviewModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Rate your Trip</h2>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wide">
                                    {selectedBooking.tripId?.routeId?.routeName}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-900 p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-xs font-black text-neutral-400 uppercase tracking-widest">Select Rating</div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-all hover:scale-125 focus:outline-none"
                                        >
                                            <svg
                                                className={`w-12 h-12 ${star <= rating ? 'text-accent-400 fill-accent-400' : 'text-neutral-200'}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <div className="text-lg font-black text-neutral-900">
                                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="relative">
                                <label className="absolute left-4 top-2 text-xs font-black text-primary-700 bg-white px-1.5 rounded z-10">
                                    Tell us more (Optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Share your experience with Aura Park..."
                                    rows={4}
                                    className="w-full px-4 pt-6 pb-4 rounded-2xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900 resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="glass"
                                    className="flex-1 h-14 font-black uppercase tracking-widest text-xs"
                                    type="button"
                                    onClick={() => setIsReviewModalOpen(false)}
                                >
                                    Later
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-200"
                                    type="submit"
                                    isLoading={submitting}
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Dispute Modal */}
            {isDisputeModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Report an Issue</h2>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wide">PNR: {selectedBooking.pnr}</p>
                            </div>
                            <button
                                onClick={() => setIsDisputeModalOpen(false)}
                                className="text-neutral-400 hover:text-neutral-900 p-2"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleDisputeSubmit} className="space-y-6">
                            <div className="relative">
                                <label className="absolute left-4 top-2 text-xs font-black text-primary-700 bg-white px-1.5 rounded z-10">Reason for Dispute</label>
                                <select
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value as RefundReason)}
                                    className="w-full h-[56px] px-4 pt-4 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900"
                                >
                                    {Object.values(RefundReason).map(reason => (
                                        <option key={reason} value={reason}>{reason.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Refund Amount Requested (XAF)"
                                type="number"
                                value={requestedAmount}
                                onChange={(e) => setRequestedAmount(e.target.value)}
                                max={selectedBooking.totalAmount}
                                required
                            />

                            <div className="relative">
                                <label className="absolute left-4 top-2 text-xs font-black text-primary-700 bg-white px-1.5 rounded z-10">
                                    Explain the issue
                                </label>
                                <textarea
                                    value={disputeDescription}
                                    onChange={(e) => setDisputeDescription(e.target.value)}
                                    placeholder="Please provide details about what went wrong..."
                                    required
                                    rows={4}
                                    className="w-full px-4 pt-6 pb-4 rounded-2xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900 resize-none"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="glass"
                                    className="flex-1 h-14 font-black uppercase tracking-widest text-xs"
                                    type="button"
                                    onClick={() => setIsDisputeModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    className="flex-1 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-red-100"
                                    type="submit"
                                    isLoading={submitting}
                                >
                                    Submit Dispute
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
