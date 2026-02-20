'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

function downloadCSV(rows: any[][], filename: string) {
    const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

export default function AgencyReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const { data } = await axios.get('/api/agency/reports');
            setData(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    const handleExportCSV = () => {
        if (!data) return;
        const rows: any[][] = [['Report Type', 'Agency Reports', 'Generated', new Date().toLocaleDateString()], []];
        rows.push(['FINANCIALS'], ['Total Revenue', data.totalRevenue, 'Total Bookings', data.totalBookings, 'Occupancy Rate', `${data.occupancyRate}%`], []);
        if (data.routeRevenue?.length > 0) {
            rows.push(['ROUTE REVENUE'], ['Route', 'Revenue (XAF)', 'Trips']);
            data.routeRevenue.forEach((r: any) => rows.push([r._id || 'Unknown', r.revenue, r.count || '']));
            rows.push([]);
        }
        if (data.monthlyRevenue?.length > 0) {
            rows.push(['MONTHLY REVENUE'], ['Month', 'Revenue (XAF)']);
            data.monthlyRevenue.forEach((m: any) => rows.push([m._id, m.revenue]));
            rows.push([]);
        }
        if (data.fuelCosts?.length > 0) {
            rows.push(['FUEL COSTS'], ['Month', 'Volume (L)', 'Total Cost (XAF)']);
            data.fuelCosts.forEach((c: any) => rows.push([c._id, c.volume?.toFixed(1), c.totalCost]));
        }
        downloadCSV(rows, `agency-report-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Business Reports"
                subtitle="Financial performance, operational efficiency, and growth analytics."
                breadcrumbs={['Agency', 'Reports']}
                actions={
                    <Button variant="glass" onClick={handleExportCSV} disabled={!data}>Export CSV</Button>
                }
            />

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-2xl font-black text-neutral-900">XAF {data?.totalRevenue?.toLocaleString()}</div>
                    <div className="text-[10px] text-primary-600 font-bold mt-1">LIFETIME YIELD</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Bookings</div>
                    <div className="text-2xl font-black text-neutral-900">{data?.totalBookings?.toLocaleString()}</div>
                    <div className="text-[10px] text-success-600 font-bold mt-1">CONFIRMED TICKETS</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-indigo-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Occupancy</div>
                    <div className="text-2xl font-black text-neutral-900">{data?.occupancyRate}%</div>
                    <div className="text-[10px] text-indigo-600 font-bold mt-1">FLEET UTILIZATION</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Operational Cost</div>
                    <div className="text-2xl font-black text-neutral-900">XAF {data?.fuelCosts?.reduce((sum: any, c: any) => sum + c.totalCost, 0).toLocaleString()}</div>
                    <div className="text-[10px] text-amber-600 font-bold mt-1">FUEL EXPENDITURE</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Route Performance */}
                <div className="glass-panel p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-neutral-900 tracking-tight">Revenue by Route</h3>
                        <Badge variant="info">TOP ROUTES</Badge>
                    </div>
                    <div className="space-y-6">
                        {data?.routeRevenue?.map((route: any) => (
                            <div key={route._id} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-neutral-600 uppercase tracking-tight">{route._id || 'Unknown Route'}</span>
                                    <span className="text-neutral-900">XAF {route.revenue.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 rounded-full"
                                        style={{ width: `${Math.min((route.revenue / (data.routeRevenue[0]?.revenue || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {(!data?.routeRevenue || data.routeRevenue.length === 0) && (
                            <div className="text-center py-12 text-neutral-400 text-sm">No route data available yet.</div>
                        )}
                    </div>
                </div>

                {/* Monthly Growth */}
                <div className="glass-panel p-8 bg-neutral-900 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black tracking-tight">Monthly Revenue Trend</h3>
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {data?.monthlyRevenue?.map((month: any) => (
                            <div key={month._id} className="flex items-end justify-between gap-4 h-16">
                                <div className="text-[10px] font-black text-neutral-500 uppercase rotate-0">{month._id}</div>
                                <div className="flex-1 h-full flex items-end">
                                    <div
                                        className="w-full bg-primary-500 rounded-t-lg transition-all duration-1000"
                                        style={{ height: `${(month.revenue / (Math.max(...data.monthlyRevenue.map((m: any) => m.revenue)) || 1)) * 100}%` }}
                                    />
                                </div>
                                <div className="text-xs font-black">XAF {(month.revenue / 1000).toFixed(1)}k</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cost vs Revenue Section */}
            <div className="glass-panel p-8">
                <h3 className="text-lg font-black text-neutral-900 mb-8 tracking-tight">Fuel Expenditure Analysis</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-100 pb-4">
                                <th className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-4">Month</th>
                                <th className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-4">Consumption (L)</th>
                                <th className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-4">Total Cost</th>
                                <th className="text-[10px] font-black text-neutral-400 uppercase tracking-widest pb-4">Revenue Attribution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {data?.fuelCosts?.map((cost: any) => {
                                const revenue = data.monthlyRevenue.find((r: any) => r._id === cost._id)?.revenue || 0;
                                return (
                                    <tr key={cost._id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="py-4 text-xs font-black text-neutral-900">{cost._id}</td>
                                        <td className="py-4 text-xs font-bold text-neutral-600">{cost.volume.toFixed(1)} L</td>
                                        <td className="py-4 text-xs font-black text-neutral-900">XAF {cost.totalCost.toLocaleString()}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-xs font-bold text-neutral-600">
                                                    {revenue > 0 ? ((cost.totalCost / revenue) * 100).toFixed(1) : 0}%
                                                </div>
                                                <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-amber-500 rounded-full"
                                                        style={{ width: `${Math.min(revenue > 0 ? (cost.totalCost / revenue) * 100 : 0, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
