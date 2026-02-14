'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        agencyId: '',
        status: '',
        pnr: '',
        phone: '',
        date: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBookings();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const { data } = await axios.get('/api/agencies');
            setAgencies(data.agencies || []);
        } catch (error) {
            console.error('Failed to fetch agencies:', error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.agencyId) queryParams.append('agencyId', filters.agencyId);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.pnr) queryParams.append('pnr', filters.pnr);
            if (filters.phone) queryParams.append('phone', filters.phone);
            if (filters.date) queryParams.append('date', filters.date);

            const { data } = await axios.get(`/api/bookings?${queryParams.toString()}`);
            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Global Bookings"
                subtitle="Search, filter, and manage all ticket bookings across the platform"
                breadcrumbs={['Admin', 'Bookings']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">Download CSV</Button>
                    </div>
                }
            />

            {/* Advanced Search & Filters */}
            <div className="glass-panel p-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Search PNR</label>
                        <input
                            type="text"
                            placeholder="e.g. A1B2C3D4"
                            value={filters.pnr}
                            onChange={(e) => setFilters({ ...filters, pnr: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Phone Number</label>
                        <input
                            type="text"
                            placeholder="e.g. 677..."
                            value={filters.phone}
                            onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px] space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Agency</label>
                        <select
                            value={filters.agencyId}
                            onChange={(e) => setFilters({ ...filters, agencyId: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        >
                            <option value="">All Agencies</option>
                            {agencies.map(a => (
                                <option key={a._id} value={a._id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-48 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        >
                            <option value="">All Statuses</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                    <div className="w-48 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Booking Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                    <Button
                        variant="glass"
                        onClick={() => setFilters({ agencyId: '', status: '', pnr: '', phone: '', date: '' })}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">PNR</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Passenger</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-neutral-900 font-mono">#{booking.pnr}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-neutral-900">{booking.passengers[0]?.name || 'Unknown'}</div>
                                            <div className="text-xs text-neutral-600">{booking.contactPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info" size="sm">{booking.agencyId?.name || 'Transport Co'}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-neutral-900 truncate max-w-[150px]">
                                                {booking.tripId?.routeId?.routeName || 'Unknown Route'}
                                            </div>
                                            <div className="text-xs text-neutral-600">
                                                {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900">
                                                XAF {(booking.totalAmount || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                booking.status === 'CONFIRMED' ? 'success' :
                                                    booking.status === 'CANCELLED' ? 'danger' :
                                                        booking.status === 'REFUNDED' ? 'warning' : 'info'
                                            } size="sm">
                                                {booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/bookings/${booking._id}`}>
                                                <Button variant="glass" size="sm">View</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20">
                                        <EmptyState
                                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                                            title="No Bookings Found"
                                            description="No ticket bookings match your search criteria."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
