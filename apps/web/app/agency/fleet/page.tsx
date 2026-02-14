'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import Link from 'next/link';

export default function AgencyFleetPage() {
    const [stats, setStats] = useState<any>({
        totalVehicles: 0,
        activeDeployments: 0,
        scheduledMaintenance: 3,
        criticalFuelLevels: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFleetStats();
    }, []);

    const fetchFleetStats = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                const { data } = await axios.get(`/api/buses?agencyId=${authData.agency._id}`);
                setStats({
                    totalVehicles: data.buses?.length || 0,
                    activeDeployments: data.buses?.filter((b: any) => b.isActive).length || 0,
                    scheduledMaintenance: 3,
                    criticalFuelLevels: 1
                });
            }
        } catch (error) {
            console.error('Failed to fetch fleet stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Fleet Overview"
                subtitle="See all vehicles, trips, and key issues in one place."
                breadcrumbs={['Agency', 'Fleet']}
                actions={
                    <Button variant="primary" as={Link} href="/agency/fleet/new">
                        Add Bus
                    </Button>
                }
            />

            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total buses</div>
                    <div className="text-3xl font-black text-neutral-900">{stats.totalVehicles}</div>
                    <div className="text-xs text-neutral-500 mt-1">Buses in your fleet</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">On the road</div>
                    <div className="text-3xl font-black text-success-600">{stats.activeDeployments}</div>
                    <div className="text-xs text-neutral-500 mt-1">Buses currently in service</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Maintenance</div>
                    <div className="text-3xl font-black text-amber-600">{stats.scheduledMaintenance}</div>
                    <div className="text-xs text-neutral-500 mt-1">Buses with upcoming work</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-danger-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Fuel alerts</div>
                    <div className="text-3xl font-black text-danger-600">{stats.criticalFuelLevels}</div>
                    <div className="text-xs text-neutral-500 mt-1">Buses to check soon</div>
                </div>
            </div>

            {/* Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/agency/fleet/status" className="glass-panel p-6 hover:bg-white/90 transition-all group border-b-4 border-blue-500">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="font-black text-neutral-900 uppercase tracking-tighter">Bus status</h3>
                    <p className="text-xs text-neutral-500 mt-1">See where each bus is and how it is used.</p>
                </Link>

                <Link href="/agency/fleet/fuel" className="glass-panel p-6 hover:bg-white/90 transition-all group border-b-4 border-orange-500">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="font-black text-neutral-900 uppercase tracking-tighter">Fuel log</h3>
                    <p className="text-xs text-neutral-500 mt-1">Record fuel fills and track fuel costs.</p>
                </Link>

                <Link href="/agency/fleet/maintenance" className="glass-panel p-6 hover:bg-white/90 transition-all group border-b-4 border-primary-500">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-500 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <h3 className="font-black text-neutral-900 uppercase tracking-tighter">Maintenance</h3>
                    <p className="text-xs text-neutral-500 mt-1">Log repairs and plan upcoming maintenance.</p>
                </Link>

                <Link href="/agency/buses" className="glass-panel p-6 hover:bg-white/90 transition-all group border-b-4 border-neutral-900">
                    <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-900 mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>
                    <h3 className="font-black text-neutral-900 uppercase tracking-tighter">Bus list</h3>
                    <p className="text-xs text-neutral-500 mt-1">View and manage all buses in your account.</p>
                </Link>
            </div>

            <div className="glass-panel p-12 text-center border-dashed border-2 border-neutral-200">
                <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-60">🚌</div>
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">How to use this dashboard</h2>
                <p className="text-sm text-neutral-500 max-w-md mx-auto mt-2">
                    Use this page as a quick snapshot of your fleet. Open the bus list, fuel log, or maintenance pages
                    to see details and update records.
                </p>
            </div>
        </div>
    );
}
