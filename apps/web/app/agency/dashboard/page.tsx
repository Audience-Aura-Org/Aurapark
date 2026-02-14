'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function AgencyDashboard() {
    const { isCollapsed } = useSidebar();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [agency, setAgency] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.user && authData.agency) {
                setAgency(authData.agency);
                const { data: statsData } = await axios.get(`/api/agency/stats?agencyId=${authData.agency._id}`);
                setStats(statsData);
            }
        } catch (error) {
            console.error('Error fetching dynamic data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    const agencyData = agency || {};
    const statsData = stats || {
        revenue: { totalRevenue: 0, totalAgencyAmount: 0 },
        bookings: [],
        activeTrips: 0,
        recentBookings: [],
        chartData: []
    };

    // Calculate total tickets (seats) across all bookings
    const totalTickets = statsData.bookings?.reduce((a: number, b: any) => a + (b.ticketCount || 0), 0) || 0;



    return (
        <div className="space-y-8">
            <PageHeader
                title={agencyData.name || 'Agency Dashboard'}
                subtitle="Overview and performance metrics"
                actions={
                    <div className="flex gap-3">
                        <Link href="/agency/trips">
                            <Button variant="glass">Schedule Trip</Button>
                        </Link>
                        <Link href="/agency/check-in">
                            <Button variant="primary">Check-in</Button>
                        </Link>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${(statsData.revenue?.totalRevenue || 0).toLocaleString()}`}
                    change="Live"
                    trend="neutral"
                />
                <StatCard
                    title="Net Earnings"
                    value={`$${(statsData.revenue?.totalAgencyAmount || 0).toLocaleString()}`}
                    change="Live"
                    trend="neutral"
                />
                <StatCard
                    title="Total Bookings"
                    value={totalTickets.toLocaleString()}
                    change="Seats"
                    trend="neutral"
                />
                <StatCard
                    title="Active Trips"
                    value={statsData.activeTrips || 0}
                    change="Available"
                    trend="neutral"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Column (Chart + Recent Bookings) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Revenue Chart */}
                    <div className="glass-panel p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-neutral-900">Revenue Overview</h3>
                            <Badge variant="info" size="sm">Last 7 Days</Badge>
                        </div>

                        {/* Dynamic Chart Visualization */}
                        <div className="h-64 flex items-end justify-between gap-2">
                            {statsData.chartData?.length > 0 ? (
                                statsData.chartData.map((day: any, i: number) => {
                                    const maxRevenue = Math.max(...statsData.chartData.map((d: any) => d.revenue), 1);
                                    const height = (day.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-gradient-to-t from-primary-400 to-primary-300 rounded-t-lg transition-all hover:from-primary-500 hover:to-primary-400 cursor-pointer"
                                                style={{ height: `${Math.max(height, 5)}%` }}
                                                title={`XAF ${day.revenue.toLocaleString()}`}
                                            ></div>
                                            <span className="text-[10px] font-semibold text-neutral-600 truncate w-full text-center">
                                                {new Date(day._id).toLocaleDateString([], { weekday: 'short' })}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                                    No revenue data for this period
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="glass-panel p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Recent Bookings</h3>
                            <Link href="/agency/settlements" className="text-xs font-bold text-primary-600 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {statsData.recentBookings?.length > 0 ? (
                                statsData.recentBookings.slice(0, 5).map((booking: any) => (
                                    <div key={booking._id} className={`flex items-center justify-between py-2 px-4 bg-white/60 border-l-4 rounded-xl hover:bg-white/90 transition-all shadow-sm hover:shadow-md ${booking.status === 'CONFIRMED' ? 'border-l-success-500' : 'border-l-danger-500'}`}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-black shadow-md shrink-0 text-xs">
                                                {booking.passengers?.length || 1}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-neutral-900 truncate">
                                                        {booking.passengers?.map((p: any) => p.name).join(', ') || 'Guest'}
                                                    </p>
                                                    <span className="text-[10px] text-neutral-400 font-bold opacity-60">• {new Date(booking.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider truncate max-w-[150px]">
                                                        {booking.tripId?.routeId?.routeName || 'Route'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex items-center gap-3">
                                            <div className="flex flex-col items-end gap-0.5">
                                                <div className="text-sm font-black text-neutral-900 leading-none">XAF {booking.totalAmount?.toLocaleString()}</div>
                                                <div className="flex gap-1 scale-[0.7] origin-right">
                                                    <Badge variant={
                                                        booking.status === 'CONFIRMED' ? 'success' :
                                                            booking.status === 'CANCELLED' ? 'danger' : 'warning'
                                                    } size="sm">
                                                        {booking.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/agency/transactions`}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-neutral-600 font-medium">
                                    No recent activity on your manifests
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Column (Performance + Actions) */}
                <div className="space-y-6">
                    {/* Performance Score */}
                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-bold text-neutral-600 uppercase tracking-wide mb-4">Performance Score</h3>
                        <div className="flex justify-center mb-6">
                            <div className="relative inline-block">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="56" className="stroke-neutral-200" strokeWidth="8" fill="transparent" />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        className="stroke-primary-400 transition-all duration-1000"
                                        strokeWidth="8"
                                        strokeDasharray={352}
                                        strokeDashoffset={352 * (1 - (statsData.trustScore || agencyData.trustScore || 100) / 100)}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-neutral-900">{statsData.trustScore || agencyData.trustScore || 100}</span>
                                    <span className="text-xs text-neutral-600 font-semibold">/ 100</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/30">
                            <div>
                                <div className="text-xs font-semibold text-neutral-600 mb-1">Status</div>
                                <div className="text-lg font-black text-success-600">Active</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-neutral-600 mb-1">Fleet Units</div>
                                <div className="text-lg font-black text-neutral-900">{statsData.busCount || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="glass-panel p-6 space-y-3">
                        <h3 className="text-sm font-bold text-neutral-900 mb-3 ml-1">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Link href="/agency/trips">
                                <Button variant="glass" size="sm" className="w-full justify-start text-left bg-white/40 ring-1 ring-black/5">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Schedule Mission
                                </Button>
                            </Link>
                            <Link href="/agency/check-in">
                                <Button variant="glass" size="sm" className="w-full justify-start text-left bg-white/40 ring-1 ring-black/5">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Fast Check-in
                                </Button>
                            </Link>
                            <Link href="/agency/buses">
                                <Button variant="glass" size="sm" className="w-full justify-start text-left bg-white/40 ring-1 ring-black/5">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Fleet Manager
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, trend }: any) {
    const trendColors = {
        up: 'text-success-600',
        down: 'text-danger-600',
        neutral: 'text-neutral-600'
    };

    return (
        <div className="glass-card p-6 min-h-[140px] flex flex-col justify-between hover-lift">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">{title}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg bg-neutral-50 ${trendColors[trend as keyof typeof trendColors]}`}>
                        {change}
                    </span>
                </div>
                <div className="text-3xl font-black text-neutral-900">
                    {title.toLowerCase().includes('revenue') || title.toLowerCase().includes('earnings')
                        ? `XAF ${value.toString().replace('$', '').replace('XAF ', '')}`
                        : value}
                </div>
            </div>
        </div>
    );
}
