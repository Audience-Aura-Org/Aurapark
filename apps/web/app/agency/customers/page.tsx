'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

function downloadCSV(rows: any[][], filename: string) {
    const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function AgencyCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'spent' | 'bookings' | 'recent'>('recent');

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get('/api/agency/customers');
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        const list = q
            ? customers.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                c.phone?.includes(q) ||
                c.email?.toLowerCase().includes(q)
            )
            : customers;

        return [...list].sort((a, b) => {
            if (sortBy === 'spent') return (b.totalSpent || 0) - (a.totalSpent || 0);
            if (sortBy === 'bookings') return (b.totalBookings || 0) - (a.totalBookings || 0);
            return new Date(b.lastBooking || 0).getTime() - new Date(a.lastBooking || 0).getTime();
        });
    }, [customers, search, sortBy]);

    // Stats
    const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
    const avgLTV = customers.length > 0 ? Math.round(totalSpent / customers.length) : 0;
    const returnRate = customers.length > 0
        ? ((customers.filter(c => c.totalBookings > 1).length / customers.length) * 100).toFixed(1)
        : '0.0';
    const activeRecently = customers.filter(c =>
        new Date(c.lastBooking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const handleExport = () => {
        const rows = [
            ['Name', 'Phone', 'Email', 'Total Bookings', 'Total Spent (XAF)', 'Last Booking'],
            ...customers.map(c => [c.name, c.phone, c.email || '', c.totalBookings, c.totalSpent, c.lastBooking ? new Date(c.lastBooking).toLocaleDateString() : '']),
        ];
        downloadCSV(rows, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Customers"
                subtitle="Passenger profiles and booking history for your agency"
                breadcrumbs={['Agency', 'Customers']}
                actions={
                    <Button variant="glass" onClick={handleExport}>Export CSV</Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-4 md:p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Customers</div>
                    <div className="text-2xl md:text-3xl font-black text-neutral-900">{customers.length}</div>
                    <div className="text-xs text-neutral-500 mt-1 hidden sm:block">Unique passengers</div>
                </div>
                <div className="glass-card p-4 md:p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Avg. Spend</div>
                    <div className="text-2xl md:text-3xl font-black text-success-600">
                        XAF {avgLTV.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1 hidden sm:block">Per customer</div>
                </div>
                <div className="glass-card p-4 md:p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Return Rate</div>
                    <div className="text-2xl md:text-3xl font-black text-amber-600">{returnRate}%</div>
                    <div className="text-xs text-neutral-500 mt-1 hidden sm:block">Booked more than once</div>
                </div>
                <div className="glass-card p-4 md:p-6 border-l-4 border-blue-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active (30d)</div>
                    <div className="text-2xl md:text-3xl font-black text-blue-600">{activeRecently}</div>
                    <div className="text-xs text-neutral-500 mt-1 hidden sm:block">Recent passengers</div>
                </div>
            </div>

            {/* Search & Sort */}
            <div className="glass-panel p-4 md:p-5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, phone or email..."
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/60 border border-white/30 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {([
                        { key: 'recent', label: 'Recent' },
                        { key: 'spent', label: 'Top Spend' },
                        { key: 'bookings', label: 'Most Trips' },
                    ] as const).map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSortBy(s.key)}
                            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${sortBy === s.key ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer List */}
            {filtered.length > 0 ? (
                <div className="space-y-3">
                    {filtered.map((customer) => (
                        <div key={customer._id} className="glass-panel p-4 md:p-5 hover:shadow-md transition-all">
                            {/* Mobile: stacked layout, Desktop: row layout */}
                            <div className="flex items-start gap-4">
                                {/* Avatar */}
                                <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-base shadow-lg shrink-0">
                                    {customer.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    {/* Name + Badge row */}
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="font-black text-neutral-900 text-sm">{customer.name}</span>
                                        {customer.totalBookings > 1 && (
                                            <Badge variant="success" size="sm">Returning</Badge>
                                        )}
                                    </div>

                                    {/* Contact row */}
                                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500 font-medium mb-3">
                                        {customer.phone && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {customer.phone}
                                            </span>
                                        )}
                                        {customer.email && (
                                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {customer.email}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats row — responsive grid */}
                                    <div className="grid grid-cols-3 gap-2 md:gap-6">
                                        <div>
                                            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Bookings</div>
                                            <div className="text-sm font-black text-neutral-900">{customer.totalBookings}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Total Spent</div>
                                            <div className="text-sm font-black text-neutral-900">
                                                <span className="hidden sm:inline">XAF </span>
                                                {(customer.totalSpent || 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Last Trip</div>
                                            <div className="text-xs font-semibold text-neutral-600">
                                                {customer.lastBooking
                                                    ? new Date(customer.lastBooking).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : '—'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel p-12">
                    <EmptyState
                        icon={<svg className="w-14 h-14 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        title={search ? 'No customers found' : 'No customers yet'}
                        description={search ? `No customers match "${search}". Try a different search.` : 'Passenger profiles will appear here as bookings come in.'}
                    />
                </div>
            )}
        </div>
    );
}
