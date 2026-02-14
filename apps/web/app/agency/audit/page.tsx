'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyAuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await axios.get('/api/agency/audit');
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
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
                title="Activity Logs"
                subtitle="View all actions taken by agency staff."
                breadcrumbs={['Agency', 'Audit']}
                actions={
                    <Button variant="glass">Download Logs</Button>
                }
            />

            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic">Staff Activity</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-neutral-400">Live updates active</span>
                    </div>
                </div>

                {logs.length > 0 ? (
                    <div className="space-y-2">
                        <div className="hidden lg:grid grid-cols-6 px-4 py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 mb-4">
                            <div>Timestamp</div>
                            <div>Staff Member</div>
                            <div>Action</div>
                            <div>Item Managed</div>
                            <div className="col-span-2 text-right">Location/Device</div>
                        </div>
                        {logs.map((log) => (
                            <div key={log._id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-4 bg-white/40 hover:bg-white rounded-xl transition-all border border-transparent hover:border-neutral-100 group">
                                <div className="text-[10px] font-bold text-neutral-500 font-mono italic">
                                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-[8px] font-black uppercase">
                                        {log.userId?.role?.slice(0, 1) || 'S'}
                                    </div>
                                    <div className="text-[10px] font-black text-neutral-900 truncate tracking-tighter w-24">{log.userId?.name || 'System'}</div>
                                </div>
                                <div>
                                    <Badge variant="default" size="sm" className="scale-75 origin-left text-[8px] border-none font-black italic bg-neutral-100 text-neutral-700">
                                        {log.action}
                                    </Badge>
                                </div>
                                <div className="text-xs font-bold text-neutral-500 italic">
                                    {log.resource} <span className="text-[8px] font-black text-neutral-300 font-mono ml-1">#{log.resourceId?.slice(-6).toUpperCase() || 'N/A'}</span>
                                </div>
                                <div className="col-span-2 text-right text-[10px] font-mono text-neutral-400 opacity-60">
                                    {log.ipAddress || '0.0.0.0'} • {log.userAgent?.split(' ')[0] || 'ORBITAL_ENGINE'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📜"
                        title="No logs yet"
                        description="Staff activity will appear here as it happens."
                    />
                )}
            </div>
        </div>
    );
}
