'use client';

import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';
import Link from 'next/link';

export default function PassengerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data: meData } = await axios.get('/api/auth/me');
            const userId = meData.user._id;

            const [shipmentsRes, bookingsRes] = await Promise.all([
                axios.get(`/api/shipments?userId=${userId}`),
                axios.get(`/api/bookings?userId=${userId}`)
            ]);

            const shipments = (shipmentsRes.data.shipments || []).map((s: any) => ({
                ...s,
                type: 'SHIPMENT',
                date: s.createdAt,
                id: s.trackingNumber,
                title: `${s.origin} → ${s.destination}`
            }));

            const bookings = (bookingsRes.data.bookings || []).map((b: any) => ({
                ...b,
                type: 'BOOKING',
                date: b.createdAt,
                id: b.pnr,
                title: b.tripId?.routeId?.routeName || 'Transport Journey'
            }));

            const allOrders = [...shipments, ...bookings].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setOrders(allOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-mesh-green">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 space-y-8">
                    <PageHeader
                        title="Your Bookings & Shipments"
                        subtitle="Review your past trips and package deliveries."
                        breadcrumbs={['Home', 'Orders']}
                    />

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {orders.map((order) => (
                                <div key={order._id} className={`glass-panel p-6 hover:bg-white transition-all border-l-4 ${order.type === 'SHIPMENT' ? 'border-primary-500' : 'border-orange-500'}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white ${order.type === 'SHIPMENT' ? 'bg-primary-600' : 'bg-orange-600'}`}>
                                                {order.type === 'SHIPMENT' ? '📦' : '🎫'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.type === 'SHIPMENT' ? 'bg-primary-50 text-primary-600' : 'bg-orange-50 text-orange-600'}`}>
                                                        {order.type}
                                                    </span>
                                                    <span className="text-xs font-black text-neutral-400">#{order.id}</span>
                                                </div>
                                                <h3 className="text-lg font-black text-neutral-900 tracking-tight lowercase first-letter:uppercase">
                                                    {order.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                                            <Badge variant={
                                                order.status === 'DELIVERED' || order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'success' :
                                                    order.status === 'CANCELLED' ? 'danger' : 'info'
                                            }>
                                                {order.status || 'ACTIVE'}
                                            </Badge>
                                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                                                {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                                        <div className="text-sm font-black text-neutral-900">
                                            XAF {(order.price || order.totalAmount || 0).toLocaleString()}
                                        </div>
                                        <Link href={order.type === 'SHIPMENT' ? `/tracking?id=${order.id}` : `/bookings`}>
                                            <button className="text-[10px] font-black uppercase text-primary-600 hover:underline">
                                                View Details →
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📂"
                            title="No orders found"
                            description="You haven't made any bookings or shipments yet."
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
