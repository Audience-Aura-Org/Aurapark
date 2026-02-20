'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function AdminReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);
    const [summary, setSummary] = useState<any>(null);
    const [dateRange, setDateRange] = useState({ source: 'bookings', start: '', end: '' });

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const { data } = await axios.get('/api/admin/stats');
            setSummary(data);
        } catch (e) {
            console.error('Failed to load report summary:', e);
        }
    };

    // Build and download a real CSV from the API
    const handleExport = async (type: string) => {
        setGenerating(type);
        try {
            let rows: string[][] = [];
            let filename = '';

            if (type === 'Revenue Ledger') {
                const { data } = await axios.get('/api/admin/payments');
                const payments = data.payments || [];
                filename = 'revenue-ledger.csv';
                rows = [
                    ['Date', 'Agency', 'Booking ID', 'Amount (XAF)', 'Platform Fee (XAF)', 'Agency Amount (XAF)', 'Status', 'Method'],
                    ...payments.map((p: any) => [
                        new Date(p.createdAt).toLocaleDateString(),
                        p.agencyId?.name || 'N/A',
                        p.bookingId?._id || p.bookingId || 'N/A',
                        p.amount,
                        p.platformFee,
                        p.agencyAmount,
                        p.status,
                        p.paymentMethod,
                    ])
                ];
            } else if (type === 'Agency Performance') {
                const { data } = await axios.get('/api/admin/stats');
                const agencies = data.agencies || data.topAgencies || [];
                filename = 'agency-performance.csv';
                rows = [
                    ['Agency', 'Trips', 'Bookings', 'Revenue (XAF)', 'Trust Score'],
                    ...agencies.map((a: any) => [
                        a.name || a.agencyName || 'N/A',
                        a.tripCount || 0,
                        a.bookingCount || 0,
                        a.revenue || 0,
                        a.trustScore || 'N/A',
                    ])
                ];
            } else if (type === 'Booking Trends') {
                const { data } = await axios.get('/api/bookings');
                const bookings = data.bookings || [];
                filename = 'booking-trends.csv';
                rows = [
                    ['Date', 'PNR', 'Route', 'Passengers', 'Amount (XAF)', 'Status'],
                    ...bookings.map((b: any) => [
                        new Date(b.createdAt).toLocaleDateString(),
                        b.pnr,
                        b.tripId?.routeId?.routeName || 'N/A',
                        b.passengers?.length || 0,
                        b.totalAmount,
                        b.status,
                    ])
                ];
            } else if (type === 'Custom CSV') {
                const params = new URLSearchParams();
                if (dateRange.start) params.append('startDate', dateRange.start);
                if (dateRange.end) params.append('endDate', dateRange.end);

                const endpoint = dateRange.source === 'bookings'
                    ? `/api/bookings?${params}`
                    : dateRange.source === 'settlements'
                        ? `/api/admin/settlements?${params}`
                        : `/api/admin/payments?${params}`;

                const { data } = await axios.get(endpoint);
                const records = data.bookings || data.settlements || data.payments || [];
                filename = `export-${dateRange.source}-${Date.now()}.csv`;

                if (dateRange.source === 'bookings') {
                    rows = [
                        ['Date', 'PNR', 'Route', 'Passengers', 'Amount (XAF)', 'Status'],
                        ...records.map((b: any) => [
                            new Date(b.createdAt).toLocaleDateString(),
                            b.pnr,
                            b.tripId?.routeId?.routeName || 'N/A',
                            b.passengers?.length || 0,
                            b.totalAmount,
                            b.status,
                        ])
                    ];
                } else if (dateRange.source === 'settlements') {
                    rows = [
                        ['Period', 'Agency', 'Gross (XAF)', 'Fee (XAF)', 'Net (XAF)', 'Status'],
                        ...records.map((s: any) => [
                            s.period,
                            s.agencyId?.name || 'N/A',
                            s.grossRevenue,
                            s.platformFee,
                            s.netRevenue,
                            s.status,
                        ])
                    ];
                } else {
                    rows = [
                        ['Date', 'Agency', 'Amount (XAF)', 'Fee (XAF)', 'Status', 'Method'],
                        ...records.map((p: any) => [
                            new Date(p.createdAt).toLocaleDateString(),
                            p.agencyId?.name || 'N/A',
                            p.amount,
                            p.platformFee,
                            p.status,
                            p.paymentMethod,
                        ])
                    ];
                }
            } else {
                // Compliance & Audit — placeholder with summary data
                filename = 'compliance-audit.csv';
                rows = [
                    ['Generated At', 'Total Users', 'Total Bookings', 'Active Agencies', 'Platform Revenue (XAF)'],
                    [
                        new Date().toLocaleString(),
                        summary?.totalUsers || 0,
                        summary?.totalBookings || 0,
                        summary?.activeAgencies || 0,
                        summary?.totalRevenue || 0,
                    ]
                ];
            }

            downloadCSV(rows, filename);
        } catch (error) {
            console.error(`Export error for ${type}:`, error);
            alert(`Failed to generate ${type} report. Check console for details.`);
        } finally {
            setGenerating(null);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Reports & Analytics"
                subtitle="Generate and export platform data for compliance and business review"
                breadcrumbs={['Admin', 'Reports']}
            />

            {/* Platform Summary Snapshots */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-card p-5">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Total Users</div>
                        <div className="text-2xl font-black text-neutral-900">{(summary.totalUsers || 0).toLocaleString()}</div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Total Bookings</div>
                        <div className="text-2xl font-black text-neutral-900">{(summary.totalBookings || 0).toLocaleString()}</div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Active Agencies</div>
                        <div className="text-2xl font-black text-neutral-900">{(summary.activeAgencies || summary.totalAgencies || 0).toLocaleString()}</div>
                    </div>
                    <div className="glass-card p-5">
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Platform Revenue</div>
                        <div className="text-2xl font-black text-success-600">XAF {(summary.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Revenue Ledger"
                    description="Full history of ticket sales, platform fees, and agency payouts. Exports all payment records as CSV."
                    type="Financial"
                    onExport={() => handleExport('Revenue Ledger')}
                    isLoading={generating === 'Revenue Ledger'}
                />
                <ReportCard
                    title="Agency Performance"
                    description="Trip completion rates, occupancy statistics, and user ratings per agency."
                    type="Operations"
                    onExport={() => handleExport('Agency Performance')}
                    isLoading={generating === 'Agency Performance'}
                />
                <ReportCard
                    title="Compliance & Audit"
                    description="Snapshot of platform totals for compliance reporting — users, bookings, revenue."
                    type="Security"
                    onExport={() => handleExport('Compliance & Audit')}
                    isLoading={generating === 'Compliance & Audit'}
                />
                <ReportCard
                    title="Booking Trends"
                    description="Full booking history with routes, passenger counts, and amounts."
                    type="Marketing"
                    onExport={() => handleExport('Booking Trends')}
                    isLoading={generating === 'Booking Trends'}
                />
            </div>

            {/* Custom Range Export */}
            <div className="glass-panel p-8">
                <h3 className="text-xl font-black text-neutral-900 mb-6">Custom Data Export</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Data Source</label>
                        <select
                            className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                            value={dateRange.source}
                            onChange={e => setDateRange(p => ({ ...p, source: e.target.value }))}
                        >
                            <option value="bookings">Ticket Bookings</option>
                            <option value="settlements">Agency Settlements</option>
                            <option value="payments">Payment Transactions</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Start Date</label>
                        <input
                            type="date"
                            className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                            value={dateRange.start}
                            onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">End Date</label>
                        <input
                            type="date"
                            className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                            value={dateRange.end}
                            onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            className="flex-1"
                            size="sm"
                            onClick={() => handleExport('Custom CSV')}
                            isLoading={generating === 'Custom CSV'}
                        >
                            Export CSV
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ title, description, type, onExport, isLoading }: any) {
    return (
        <div className="glass-panel p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <Badge variant={type === 'Financial' ? 'success' : type === 'Security' ? 'danger' : 'info'} size="sm">
                    {type}
                </Badge>
                <div className="text-neutral-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 mb-8 flex-1">{description}</p>
            <div className="flex gap-2">
                <Button
                    variant="glass"
                    className="flex-1"
                    size="sm"
                    onClick={onExport}
                    isLoading={isLoading}
                >
                    Download CSV
                </Button>
            </div>
        </div>
    );
}

// Helper: build and trigger a CSV download from a 2D array
function downloadCSV(rows: any[][], filename: string) {
    const csv = rows.map(row =>
        row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
