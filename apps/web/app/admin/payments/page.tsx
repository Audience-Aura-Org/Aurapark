'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([]);
    const [agencies, setAgencies] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        agencyId: '',
        status: '',
        date: ''
    });

    useEffect(() => {
        fetchAgencies();
        fetchStats();
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [filters]);

    const fetchAgencies = async () => {
        try {
            const { data } = await axios.get('/api/agencies');
            setAgencies(data.agencies || []);
        } catch (error) {
            console.error('Failed to fetch agencies:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/api/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.agencyId) queryParams.append('agencyId', filters.agencyId);
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.date) queryParams.append('date', filters.date);

            const { data } = await axios.get(`/api/admin/payments?${queryParams.toString()}`);
            setPayments(data.payments || []);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Payment Logs"
                subtitle="Monitor all platform-wide transactions and revenue shares"
                breadcrumbs={['Admin', 'Payments']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">Export Finance Report</Button>
                    </div>
                }
            />

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Total Volume</div>
                    <div className="text-3xl font-black text-neutral-900">XAF {(stats?.totalVolume || 0).toLocaleString()}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Platform Fees (10%)</div>
                    <div className="text-3xl font-black text-primary-600">XAF {(stats?.platformRevenue || 0).toLocaleString()}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Refunded Amount</div>
                    <div className="text-3xl font-black text-danger-600">{stats?.activeRefunds || 0}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-panel p-6 flex flex-wrap gap-4 items-end">
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
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>
                <div className="w-48 space-y-1.5">
                    <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Date</label>
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                    />
                </div>
                <Button
                    variant="glass"
                    onClick={() => setFilters({ agencyId: '', status: '', date: '' })}
                >
                    Reset
                </Button>
            </div>

            {/* Payments Table */}
            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Agency</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Booking / Trip</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Fee / Net</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            ) : payments.length > 0 ? (
                                payments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900 font-mono">
                                                {payment.transactionId || payment._id.slice(-8).toUpperCase()}
                                            </div>
                                            <div className="text-[10px] font-bold text-neutral-400">{payment.paymentMethod}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-neutral-900">{payment.agencyId?.name || 'Unknown'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-neutral-900">{payment.userId?.name || 'Unknown User'}</div>
                                            <div className="text-xs text-neutral-500">{payment.userId?.email || 'No Email'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.type === 'SHIPMENT' ? (
                                                <>
                                                    <div className="text-sm font-semibold text-neutral-900">
                                                        SHP: {payment.shipmentId?.trackingNumber || payment.transactionId || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-neutral-600">
                                                        Shipment
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm font-semibold text-neutral-900">
                                                        PNR: {payment.bookingId?.pnr || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-neutral-600 truncate max-w-[150px]">
                                                        {payment.bookingId?.tripId?.routeId?.routeName || 'Manual Payment'}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900">
                                                XAF {(payment.amount || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-bold text-danger-600">-{payment.platformFee?.toLocaleString()} (10%)</div>
                                            <div className="text-xs font-bold text-success-600">+{payment.agencyAmount?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                payment.status === 'PAID' ? 'success' :
                                                    payment.status === 'PENDING' ? 'warning' :
                                                        payment.status === 'REFUNDED' ? 'info' : 'danger'
                                            } size="sm">
                                                {payment.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-medium text-neutral-900">
                                                {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {format(new Date(payment.createdAt), 'h:mm a')}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <EmptyState
                                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                            title="No Payments Found"
                                            description="No transaction logs match your criteria."
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
