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

    useEffect(() => {
        fetchNotifications();
    }, []);

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

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="System Signal Registry"
                subtitle="High-fidelity log of all automated communications and mission advisories"
                breadcrumbs={['Agency', 'Notifications']}
                actions={
                    <Button variant="glass">Broadcast Signal</Button>
                }
            />

            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Transmission Feed</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-neutral-400">Tactical Comm Link Active</span>
                    </div>
                </div>

                {notifications.length > 0 ? (
                    <div className="space-y-2">
                        <div className="hidden lg:grid grid-cols-6 px-4 py-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-50 mb-4">
                            <div>Timestamp</div>
                            <div>Recipient Vector</div>
                            <div>Transmission Type</div>
                            <div className="col-span-2">Signal Content</div>
                            <div className="text-right">Integrity Status</div>
                        </div>
                        {notifications.map((notif) => (
                            <div key={notif._id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-4 bg-white/40 hover:bg-white rounded-xl transition-all border border-transparent hover:border-neutral-100 group">
                                <div className="text-[10px] font-bold text-neutral-500 font-mono">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                                <div className="text-xs font-black text-neutral-900 truncate tracking-tighter">{notif.recipient}</div>
                                <div>
                                    <Badge variant="info" size="sm" className="scale-75 origin-left text-[8px] border-none font-black">{notif.type}</Badge>
                                </div>
                                <div className="col-span-2 text-xs text-neutral-500 truncate group-hover:whitespace-normal group-hover:text-neutral-900 transition-colors">
                                    {notif.message}
                                </div>
                                <div className="text-right">
                                    <Badge variant={notif.status === 'SENT' || notif.status === 'DELIVERED' ? 'success' : 'warning'} size="sm" className="scale-75 origin-right">
                                        {notif.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📡"
                        title="Signal Void"
                        description="Automated transmissions will appear here as the system communicates with stakeholders."
                    />
                )}
            </div>
        </div>
    );
}
