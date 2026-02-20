'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AdminOverridesPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await axios.get('/api/admin/overrides');
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Failed to fetch override logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const impactVariant = (impact: string) =>
        impact === 'HIGH' ? 'danger' : impact === 'MEDIUM' ? 'warning' : 'info';

    return (
        <div className="space-y-8">
            <PageHeader
                title="Manual Override Log"
                subtitle="Audit trail of all manual administrative actions performed on the platform"
                breadcrumbs={['Admin', 'Overrides']}
            />

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-neutral-900">System Override History</h2>
                    <Badge variant="info" size="sm">{logs.length} records</Badge>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-20">
                        <EmptyState
                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                            title="No Manual Overrides"
                            description="System override records will appear here when administrators make manual changes."
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Admin</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Entity</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-4 text-center text-xs font-black text-neutral-600 uppercase tracking-wider">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {format(new Date(log.timestamp || log.createdAt), 'MMM d, h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-neutral-900">
                                            {log.adminName || log.userId?.name || 'Admin'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-black uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600">
                                            {log.entityType || log.resource}: <span className="font-mono text-xs">{(log.entityId || log.resourceId)?.slice(-8)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500 max-w-xs truncate">
                                            {log.reason || log.details?.reason || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={impactVariant(log.impact || 'LOW')} size="sm">
                                                {log.impact || 'LOW'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
