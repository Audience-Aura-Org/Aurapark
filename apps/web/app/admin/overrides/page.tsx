'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardNav from '@/components/DashboardNav';

export default function ManualOverrideLogPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

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

    if (loading) return (
        <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen liquid-gradient p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <DashboardNav title="Manual Override Log" backLink="/admin/dashboard" backLabel="Dashboard" />

                <div className="glass p-8">
                    <h2 className="text-2xl font-black text-white mb-6">System Override History</h2>

                    {logs.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <div className="text-4xl mb-4">📋</div>
                            <p>No manual overrides recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5 text-gray-400 text-xs uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Timestamp</th>
                                        <th className="px-6 py-4 text-left">Admin</th>
                                        <th className="px-6 py-4 text-left">Action</th>
                                        <th className="px-6 py-4 text-left">Entity</th>
                                        <th className="px-6 py-4 text-left">Reason</th>
                                        <th className="px-6 py-4 text-center">Impact</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-white font-bold">{log.adminName}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-xs font-black uppercase">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">{log.entityType}: {log.entityId}</td>
                                            <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{log.reason}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${log.impact === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                                                        log.impact === 'MEDIUM' ? 'bg-accent/20 text-accent' :
                                                            'bg-gray-700 text-gray-400'
                                                    }`}>
                                                    {log.impact}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
