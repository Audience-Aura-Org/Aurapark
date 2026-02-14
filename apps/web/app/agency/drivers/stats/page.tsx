'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyDriversStatsPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await axios.get('/api/agency/drivers/stats');
            setStats(data.stats || []);
        } catch (error) {
            console.error('Failed to fetch driver stats:', error);
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
                title="Driver Performance Matrix"
                subtitle="Quantitative and qualitative analysis of agency personnel performance"
                breadcrumbs={['Agency', 'Drivers', 'Analytics']}
            />

            {/* Performance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Personnel</div>
                    <div className="text-3xl font-black text-neutral-900">{stats.length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Authorized Drivers</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Avg Rating</div>
                    <div className="text-3xl font-black text-primary-600">4.85</div>
                    <div className="text-xs text-neutral-500 mt-1">Across 12k Reviews</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Safety Index</div>
                    <div className="text-3xl font-black text-success-600">99.2%</div>
                    <div className="text-xs text-neutral-500 mt-1">Incident Free Trips</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Avg Efficiency</div>
                    <div className="text-3xl font-black text-neutral-900">94%</div>
                    <div className="text-xs text-neutral-500 mt-1">Schedule Integrity</div>
                </div>
            </div>

            {/* Drivers Leaderboard/List */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Personnel Performance Ranking</h2>
                    <Button variant="glass" size="sm">Download Technical Report</Button>
                </div>

                {stats.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {stats.map((driver) => (
                            <div key={driver.driverId} className="group relative overflow-hidden bg-white/60 hover:bg-white/90 border border-white/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-inner group-hover:from-primary-400 group-hover:to-primary-600 transition-colors">
                                        {driver.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-neutral-900">{driver.name}</h3>
                                            <Badge variant="success" size="sm" className="bg-success-50 text-success-700 border-success-200">ACTIVE</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                                            <span>{driver.email}</span>
                                            <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                            <span className="text-primary-600">Licensed Class A</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8 px-8 border-x border-neutral-100 italic">
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-neutral-400 uppercase mb-1">Total Trips</div>
                                            <div className="text-lg font-black text-neutral-900">{driver.stats.totalTrips}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-neutral-400 uppercase mb-1">Mileage</div>
                                            <div className="text-lg font-black text-neutral-900">{driver.stats.totalDistance.toLocaleString()}km</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] font-black text-neutral-400 uppercase mb-1">Rating</div>
                                            <div className="text-lg font-black text-amber-500">★ {driver.stats.rating}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button variant="glass" size="sm">Vector Stats</Button>
                                        <Button variant="primary" size="sm">Audit Trip logs</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="👨‍✈️"
                        title="No Driver Data Detected"
                        description="Deployment metrics will sync once drivers initiate their first mission logs."
                    />
                )}
            </div>
        </div>
    );
}
