'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({
        page: 1,
        pages: 1,
        total: 0
    });
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [search, setSearch] = useState('');

    const fetchOrders = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/agency/settlements?transactionPage=${page}`);
            setOrders(data.transactions || []);
            setPagination(data.pagination.transactions || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;

        setUpdating(true);
        try {
            await axios.patch(`/api/agency/bookings/${editingOrder._id}`, {
                totalAmount: editingOrder.totalAmount,
                paymentStatus: editingOrder.paymentStatus,
                status: editingOrder.status
            });
            setEditingOrder(null);
            fetchOrders(pagination.page);
        } catch (error) {
            console.error('Failed to update order:', error);
            alert('Failed to update order');
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter(tx =>
        tx.pnr?.toLowerCase().includes(search.toLowerCase()) ||
        tx.passengers?.[0]?.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Orders"
                subtitle="All booking orders, payments, and fulfillment statuses"
                breadcrumbs={['Agency', 'Orders']}
            />

            {/* Filters & Search */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by PNR or Passenger Name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-neutral-100 bg-white focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-semibold text-neutral-900 placeholder:text-neutral-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="info">{pagination.total} Total Orders</Badge>
                </div>
            </div>

            {/* Orders Table (same style as Transactions) */}
            <div className="glass-panel p-8">
                {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-6 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                            <div className="col-span-1">Date</div>
                            <div className="col-span-1">Order Ref</div>
                            <div className="col-span-2">Passenger</div>
                            <div className="col-span-1">Amount</div>
                            <div className="text-right col-span-1">Status & Action</div>
                        </div>

                        {filteredOrders.map((tx: any) => (
                            <div
                                key={tx._id}
                                className={`flex items-center gap-4 py-2 px-4 bg-white/60 border-l-4 rounded-xl hover:bg-white/90 transition-all text-sm group shadow-sm hover:shadow-md ${tx.status === 'CONFIRMED' ? 'border-l-success-500' : 'border-l-danger-500'}`}
                            >
                                <div className="flex-[0.8] min-w-0">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-0.5">Order Date</div>
                                    <div className="font-medium text-neutral-600 text-xs">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-0.5">Order Ref</div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded bg-primary-100 flex items-center justify-center text-[10px]">🎫</span>
                                        <span className="font-black text-neutral-900">{tx.pnr}</span>
                                    </div>
                                </div>

                                <div className="flex-[2] min-w-0 hidden md:block">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-0.5">Passenger</div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-neutral-800 truncate">
                                            {tx.passengers?.[0]?.name || 'Booking'}
                                        </div>
                                        <div className="text-[10px] font-bold text-neutral-400 uppercase opacity-60 flex items-center gap-1">
                                            <span>•</span>
                                            <span>{tx.contactPhone}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-0.5">Amount</div>
                                    <div className="font-black text-neutral-900 flex items-center gap-1">
                                        <span className="text-neutral-400 text-xs font-bold">XAF</span>
                                        {tx.totalAmount.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <Badge
                                            variant={tx.status === 'CONFIRMED' ? 'success' : 'danger'}
                                            size="sm"
                                            className="scale-[0.85] origin-right"
                                        >
                                            {tx.status}
                                        </Badge>
                                        <Badge
                                            variant={
                                                tx.paymentStatus === 'PAID'
                                                    ? 'success'
                                                    : tx.paymentStatus === 'REFUNDED'
                                                    ? 'info'
                                                    : 'warning'
                                            }
                                            size="sm"
                                            className="scale-[0.85] origin-right"
                                        >
                                            {tx.paymentStatus}
                                        </Badge>
                                    </div>

                                    <button
                                        onClick={() => setEditingOrder({ ...tx })}
                                        className="w-8 h-8 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group-hover:scale-110 active:scale-95"
                                        title="Edit Order"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchOrders(pagination.page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-xs font-bold text-neutral-400">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchOrders(pagination.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon="📦"
                        title="No Orders Found"
                        description={
                            search
                                ? "We couldn't find any orders matching your search."
                                : 'Your orders will appear here once bookings are made.'
                        }
                    />
                )}
            </div>

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Edit Order</h3>
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateOrder} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Order Reference
                                </label>
                                <input
                                    type="text"
                                    value={editingOrder.pnr}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-sm font-bold text-neutral-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Amount (XAF)
                                </label>
                                <input
                                    type="number"
                                    value={editingOrder.totalAmount}
                                    onChange={(e) =>
                                        setEditingOrder({
                                            ...editingOrder,
                                            totalAmount: parseInt(e.target.value, 10)
                                        })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Payment Status
                                </label>
                                <select
                                    value={editingOrder.paymentStatus}
                                    onChange={(e) =>
                                        setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })
                                    }
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PAID">PAID</option>
                                    <option value="FAILED">FAILED</option>
                                    <option value="REFUNDED">REFUNDED</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Booking Status
                                </label>
                                <select
                                    value={editingOrder.status}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                >
                                    <option value="CONFIRMED">CONFIRMED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="glass"
                                    className="flex-1"
                                    onClick={() => setEditingOrder(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={updating}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
