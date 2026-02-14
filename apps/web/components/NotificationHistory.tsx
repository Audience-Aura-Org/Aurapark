'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NotificationHistory({ bookingId }: { bookingId?: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [bookingId]);

    const fetchNotifications = async () => {
        try {
            const url = bookingId ? `/api/notifications?bookingId=${bookingId}` : '/api/notifications';
            const { data } = await axios.get(url);
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center py-4">Loading history...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Message History</h3>
            {notifications.map((n) => (
                <div key={n._id} className="glass p-4 text-sm flex justify-between items-start gap-4">
                    <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <span className="text-secondary font-bold uppercase text-[10px]">
                                {n.type.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500 text-[10px]">
                                {new Date(n.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-gray-300 truncate">{n.message}</p>
                        <p className="text-gray-500 text-xs">To: {n.recipient}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${n.status === 'SENT' ? 'bg-green-500/20 text-green-400' :
                            n.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {n.status}
                    </span>
                </div>
            ))}
            {notifications.length === 0 && (
                <p className="text-gray-500 italic text-center text-sm py-4">No notifications found.</p>
            )}
        </div>
    );
}
