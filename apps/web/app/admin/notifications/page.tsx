'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AdminNotificationsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'LOGS' | 'TEMPLATES'>('LOGS');
    const [recipientSearch, setRecipientSearch] = useState('');

    useEffect(() => {
        if (view === 'LOGS') fetchLogs();
    }, [view, recipientSearch]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (recipientSearch) queryParams.append('recipient', recipientSearch);

            const { data } = await axios.get(`/api/admin/notifications?${queryParams.toString()}`);
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Failed to fetch notification logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Notifications Console"
                subtitle="Monitor automated communication and manage message templates"
                breadcrumbs={['Admin', 'Notifications']}
                actions={
                    <div className="flex bg-white/40 p-1 rounded-xl glass-panel">
                        <button
                            onClick={() => setView('LOGS')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'LOGS' ? 'bg-primary-500 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            Logs
                        </button>
                        <button
                            onClick={() => setView('TEMPLATES')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'TEMPLATES' ? 'bg-primary-500 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            Templates
                        </button>
                    </div>
                }
            />

            {view === 'LOGS' ? (
                <div className="space-y-6">
                    {/* Search bar */}
                    <div className="glass-panel p-4">
                        <input
                            type="text"
                            placeholder="Search by recipient phone/email..."
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                            value={recipientSearch}
                            onChange={(e) => setRecipientSearch(e.target.value)}
                        />
                    </div>

                    <div className="glass-panel overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Recipient</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Message Snippet</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">timestamp</th>
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
                                            <tr key={log._id} className="hover:bg-white/40 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-black text-neutral-900">{log.recipient}</div>
                                                    <div className="text-[10px] font-bold text-neutral-400 uppercase">{log.provider}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="info" size="sm">{log.type}</Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-neutral-700 max-w-[300px] truncate italic">
                                                        "{log.message}"
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={log.status === 'SENT' ? 'success' : 'warning'} size="sm">
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="text-sm font-medium text-neutral-900">
                                                        {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <EmptyState
                                                    icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
                                                    title="No Logs Found"
                                                    description="No notifications have been sent matching your search."
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TemplateCard
                        title="Booking Confirmation"
                        type="WhatsApp / SMS"
                        content="*Booking Confirmed!* Your PNR: {pnr}. Seats: {seats}. Check your ticket here: {url}"
                        vars={['pnr', 'seats', 'url']}
                    />
                    <TemplateCard
                        title="Cancellation Notice"
                        type="WhatsApp / SMS"
                        content="*Cancellation Notice* Your booking {pnr} has been cancelled. A refund has been initiated."
                        vars={['pnr']}
                    />
                    <TemplateCard
                        title="OTP Verification"
                        type="SMS"
                        content="Your platform verification code is: {otp}. Valid for 5 minutes."
                        vars={['otp']}
                    />
                </div>
            )}
        </div>
    );
}

function TemplateCard({ title, type, content, vars }: any) {
    return (
        <div className="glass-panel p-8 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-black text-neutral-900">{title}</h3>
                    <Badge variant="info" size="sm" className="mt-1">{type}</Badge>
                </div>
                <Button variant="glass" size="sm">Edit Template</Button>
            </div>
            <div className="p-4 bg-neutral-900 rounded-xl text-neutral-300 font-mono text-xs leading-relaxed">
                {content}
            </div>
            <div className="flex gap-2 flex-wrap">
                {vars.map((v: string) => (
                    <span key={v} className="px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                        {`{${v}}`}
                    </span>
                ))}
            </div>
        </div>
    );
}
