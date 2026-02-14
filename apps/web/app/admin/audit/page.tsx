'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        resource: '',
        action: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.resource) queryParams.append('resource', filters.resource);
            if (filters.action) queryParams.append('action', filters.action);

            const { data } = await axios.get(`/api/admin/audit?${queryParams.toString()}`);
            setLogs(data.logs || []);
            setAlerts(data.securityAlerts || []);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Audit & Security"
                subtitle="Monitor all administrative actions and security-sensitive events"
                breadcrumbs={['Admin', 'Audit']}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">Export for Compliance</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Security Flags Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6 border-danger-100 bg-danger-50/10">
                        <h3 className="text-sm font-black text-danger-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-danger-500"></span>
                            </span>
                            Security flags
                        </h3>

                        <div className="space-y-4">
                            {alerts.length > 0 ? alerts.map((alert) => (
                                <div key={alert._id} className="p-3 bg-white/60 rounded-xl border border-danger-50 shadow-sm">
                                    <div className="text-[10px] font-black text-danger-600 uppercase mb-1">{alert.action}</div>
                                    <div className="text-xs font-bold text-neutral-900 leading-tight mb-1">
                                        {alert.resource} ID: {alert.resourceId?.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="text-[10px] text-neutral-500">
                                        {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-xs font-medium text-neutral-500 italic py-4">
                                    No immediate security threats detected.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Storage & Retention</h3>
                        <div className="text-xs text-neutral-600 leading-relaxed">
                            Audit logs are retained for **90 days**. Large binary attachments or heavy metadata are pruned automatically.
                        </div>
                        <Button variant="glass" size="sm" className="w-full">System Health</Button>
                    </div>
                </div>

                {/* Audit Feed */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-panel p-4 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <select
                                className="w-full h-10 px-4 rounded-xl bg-white/50 border border-white/20 text-xs font-bold text-neutral-900 outline-none"
                                value={filters.resource}
                                onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                            >
                                <option value="">All Resources</option>
                                <option value="Booking">Bookings</option>
                                <option value="Trip">Trips</option>
                                <option value="Agency">Agencies</option>
                                <option value="User">Users</option>
                                <option value="Settlement">Settlements</option>
                            </select>
                        </div>
                        <div className="w-48">
                            <input
                                type="text"
                                placeholder="Filter action..."
                                className="w-full h-10 px-4 rounded-xl bg-white/50 border border-white/20 text-xs font-bold text-neutral-900 outline-none"
                                value={filters.action}
                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            />
                        </div>
                        <Button variant="glass" size="sm" onClick={() => setFilters({ resource: '', action: '' })}>Reset</Button>
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Event</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actor</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Target</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Metadata</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : logs.length > 0 ? (
                                        logs.map((log) => (
                                            <tr key={log._id} className="hover:bg-white/40 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-neutral-900">{log.action}</div>
                                                    <div className="text-[10px] font-bold text-neutral-400 uppercase">{log.resource}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {log.userId ? (
                                                        <>
                                                            <div className="text-sm font-bold text-neutral-900">{log.userId.name}</div>
                                                            <div className="text-[10px] text-neutral-500">{log.userId.role}</div>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm font-bold text-neutral-400 italic">System</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded inline-block">
                                                        {log.resourceId?.slice(-8) || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[10px] text-neutral-500 max-w-[200px] truncate group-hover:whitespace-normal group-hover:truncate-none transition-all">
                                                        {JSON.stringify(log.details || {})}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-400">{log.ipAddress}</div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <EmptyState
                                                    icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                                    title="No Logs Available"
                                                    description="System activity logs will appear here as they occur."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
