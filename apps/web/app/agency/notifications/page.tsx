'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyNotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/api/agency/notifications');
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAllRead = async () => {
        try {
            await axios.patch('/api/agency/notifications', { markAllRead: true });
            await fetchNotifications();
        } catch (e) { console.error(e); }
    };

    const unread = notifications.filter(n => n.status !== 'READ').length;
    const filtered = filter ? notifications.filter(n => n.type === filter) : notifications;
    const types = [...new Set(notifications.map(n => n.type))];

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Notifications"
                subtitle="All automated messages and alerts for your agency"
                breadcrumbs={['Agency', 'Notifications']}
                actions={
                    unread > 0 ? (
                        <Button variant="glass" onClick={markAllRead}>
                            Mark All Read ({unread})
                        </Button>
                    ) : undefined
                }
            />

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Total</div>
                    <div className="text-3xl font-black text-neutral-900">{notifications.length}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Unread</div>
                    <div className="text-3xl font-black text-warning-600">{unread}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Sent</div>
                    <div className="text-3xl font-black text-success-600">{notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED').length}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Failed</div>
                    <div className="text-3xl font-black text-danger-600">{notifications.filter(n => n.status === 'FAILED').length}</div>
                </div>
            </div>

            {/* Filter tabs */}
            {types.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${!filter ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                    >
                        ALL
                    </button>
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(filter === t ? '' : t)}
                            className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${filter === t ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-neutral-900">
                        Notification Feed
                        <span className="text-sm font-semibold text-neutral-400 ml-2">({filtered.length})</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-neutral-400 uppercase">Live</span>
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="divide-y divide-neutral-50">
                        {filtered.map((notif) => (
                            <div key={notif._id} className={`flex items-start gap-4 px-6 py-4 hover:bg-white/50 transition-colors ${notif.status !== 'READ' ? 'bg-primary-50/30' : ''}`}>
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.status === 'SENT' || notif.status === 'DELIVERED' ? 'bg-success-500' : notif.status === 'FAILED' ? 'bg-danger-500' : 'bg-neutral-300'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <Badge variant="info" size="sm">{notif.type}</Badge>
                                        <span className="text-xs font-bold text-neutral-700 truncate">{notif.recipient}</span>
                                        {notif.provider && <span className="text-[10px] text-neutral-400">via {notif.provider}</span>}
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{notif.message}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge variant={notif.status === 'SENT' || notif.status === 'DELIVERED' ? 'success' : notif.status === 'FAILED' ? 'danger' : 'warning'} size="sm">
                                        {notif.status}
                                    </Badge>
                                    <div className="text-[10px] text-neutral-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20">
                        <EmptyState
                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                            title="No Notifications"
                            description={filter ? `No ${filter} notifications found.` : 'Automated messages will appear here once activity begins.'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
