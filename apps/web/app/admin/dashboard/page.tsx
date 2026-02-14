'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';

export default function AdminDashboardPage() {
    const { isCollapsed } = useSidebar();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/api/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );



    return (
        <div className="space-y-6">
            <PageHeader
                title="Platform Administration"
                subtitle="System overview and management"
                actions={
                    <Link href="/admin/agencies">
                        <Button variant="primary">Manage Agencies</Button>
                    </Link>
                }
            />

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Agencies"
                    value={stats?.totalAgencies || 0}
                    subtitle={`${stats?.activeAgencies || 0} Active`}
                    trend="+5.2%"
                />
                <MetricCard
                    title="Total Trips"
                    value={stats?.totalTrips || 0}
                    subtitle={`${stats?.activeTrips || 0} Scheduled`}
                    trend="+12.8%"
                />
                <MetricCard
                    title="Total Bookings"
                    value={stats?.totalBookings || 0}
                    subtitle={`+${stats?.todayBookings || 0} Today`}
                    trend="+8.4%"
                />
                <MetricCard
                    title="Platform Revenue"
                    value={`XAF ${(stats?.platformRevenue || 0).toLocaleString()}`}
                    subtitle="This Month"
                    trend="+15.3%"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Agencies */}
                <div className="glass-panel p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-neutral-900">Recent Agencies</h2>
                        <Link href="/admin/agencies">
                            <Button variant="glass" size="sm">View All</Button>
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {stats?.recentAgencies?.slice(0, 5).map((agency: any) => (
                            <div key={agency._id} className="flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/60 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                        {agency.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-neutral-900">{agency.name}</div>
                                        <div className="text-xs text-neutral-600">{agency.email}</div>
                                    </div>
                                </div>
                                <Badge variant={
                                    agency.status === 'ACTIVE' ? 'success' :
                                        agency.status === 'PENDING' ? 'warning' :
                                            'danger'
                                } size="sm">
                                    {agency.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="glass-panel p-6 space-y-6">
                    <h2 className="text-xl font-black text-neutral-900">System Health</h2>
                    <div className="space-y-4">
                        <HealthMetric label="Database Status" value="Operational" status="success" />
                        <HealthMetric label="API Response Time" value="< 200ms" status="success" />
                        <HealthMetric label="Uptime" value="99.9%" status="success" />
                        <HealthMetric label="Active Users" value={stats?.activeUsers || 0} status="info" />
                        <HealthMetric
                            label="Pending Disputes"
                            value={stats?.pendingDisputes || 0}
                            status={stats?.pendingDisputes > 0 ? 'warning' : 'success'}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6">Administrative Tools</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/agencies">
                        <Button variant="glass" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Agencies
                        </Button>
                    </Link>
                    <Link href="/admin/disputes">
                        <Button variant="glass" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Disputes
                        </Button>
                    </Link>
                    <Link href="/admin/audit">
                        <Button variant="glass" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Audit Logs
                        </Button>
                    </Link>
                    <Link href="/admin/settings">
                        <Button variant="glass" className="w-full justify-start">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subtitle, trend }: any) {
    return (
        <div className="glass-card p-6 min-h-[160px] flex flex-col justify-between hover-lift">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">{title}</h4>
                    <span className="text-[10px] font-black text-success-600 bg-success-50 px-2 py-0.5 rounded-lg">{trend}</span>
                </div>
                <div className="text-3xl font-black text-neutral-900 mb-1">{value}</div>
            </div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight">{subtitle}</div>
        </div>
    );
}

function HealthMetric({ label, value, status }: any) {
    const statusColors = {
        success: 'text-success-600 bg-success-50',
        warning: 'text-warning-600 bg-warning-50',
        danger: 'text-danger-600 bg-danger-50',
        info: 'text-neutral-900 bg-neutral-50'
    };

    const dotColors = {
        success: 'bg-success-400',
        warning: 'bg-warning-400',
        danger: 'bg-danger-400',
        info: 'bg-primary-400'
    };

    return (
        <div className="flex items-center justify-between p-4 glass-panel rounded-2xl hover:bg-white/60 transition-all group">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${dotColors[status as keyof typeof dotColors]} group-hover:animate-pulse`}></div>
                <span className="text-sm font-bold text-neutral-600">{label}</span>
            </div>
            <span className={`text-[11px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${statusColors[status as keyof typeof statusColors]}`}>{value}</span>
        </div>
    );
}
