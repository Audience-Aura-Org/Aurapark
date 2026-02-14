'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencySettlementsPage() {
    const [settlements, setSettlements] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({
        settlements: { page: 1, pages: 1 },
        transactions: { page: 1, pages: 1 }
    });
    const [stats, setStats] = useState<any>({
        pendingPayout: 0,
        netRevenue: 0, // This month
        totalEarnings: 0
    });
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestAmount, setRequestAmount] = useState<number | ''>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('MOBILE_MONEY');

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async (sPage = 1, tPage = 1) => {
        try {
            const { data } = await axios.get(`/api/agency/settlements?settlementPage=${sPage}&transactionPage=${tPage}`);
            setSettlements(data.settlements || []);
            setTransactions(data.transactions || []);
            setPagination(data.pagination || {
                settlements: { page: 1, pages: 1 },
                transactions: { page: 1, pages: 1 }
            });
            if (data.stats) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch settlements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTransaction) return;

        setUpdating(true);
        try {
            await axios.patch(`/api/agency/bookings/${editingTransaction._id}`, {
                totalAmount: editingTransaction.totalAmount,
                paymentStatus: editingTransaction.paymentStatus,
                status: editingTransaction.status
            });
            setEditingTransaction(null);
            fetchSettlements(pagination.settlements.page, pagination.transactions.page);
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction');
        } finally {
            setUpdating(false);
        }
    };

    const openRequestModal = () => {
        setRequestAmount(stats.pendingPayout || 0);
        setShowRequestModal(true);
    };

    const handleRequestSettlement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestAmount || requestAmount <= 0) {
            alert('Please enter a valid amount to request.');
            return;
        }

        setRequesting(true);
        try {
            await axios.post('/api/agency/settlements', {
                amount: requestAmount,
                paymentMethod
            });
            setShowRequestModal(false);
            await fetchSettlements(pagination.settlements.page, pagination.transactions.page);
        } catch (error) {
            console.error('Failed to request settlement:', error);
            alert('Failed to request settlement');
        } finally {
            setRequesting(false);
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
                title="Settlements"
                subtitle="Track payments and financial transactions"
                breadcrumbs={['Agency', 'Settlements']}
                actions={
                    <Button variant="primary" type="button" onClick={openRequestModal}>
                        Request Settlement
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Pending Payment</div>
                    <div className="text-3xl font-black text-warning-600">XAF {(stats.pendingPayout || 0).toLocaleString()}</div>
                    <div className="text-xs text-neutral-600 mt-1">Awaiting check-in / manual payment</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Received Payment</div>
                    <div className="text-3xl font-black text-success-600">XAF {(stats.netRevenue || 0).toLocaleString()}</div>
                    <div className="text-xs text-neutral-600 mt-1">Settled successfully</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Total Earnings</div>
                    <div className="text-3xl font-black text-neutral-900">XAF {(stats.totalEarnings || 0).toLocaleString()}</div>
                    <div className="text-xs text-neutral-600 mt-1">All time revenue</div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-neutral-900">Recent Transactions</h2>
                    <Badge variant="info">Real-time Bookings</Badge>
                </div>
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        <div className="hidden md:grid grid-cols-5 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                            <div>Date</div>
                            <div>Reference</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div className="text-right">Action</div>
                        </div>
                        {transactions.map((tx: any) => (
                            <div key={tx._id} className={`flex items-center gap-4 py-2 px-4 bg-white/60 border-l-4 rounded-xl hover:bg-white/90 transition-all text-sm group shadow-sm hover:shadow-md ${tx.status === 'CONFIRMED' ? 'border-l-success-500' : 'border-l-danger-500'}`}>
                                <div className="flex-[0.8] min-w-0">
                                    <div className="font-medium text-neutral-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <span className="w-4 h-4 rounded bg-primary-100 flex items-center justify-center text-[10px]">🎫</span>
                                        <span className="font-black text-neutral-900">{tx.pnr}</span>
                                    </div>
                                </div>

                                <div className="flex-[1.5] min-w-0 hidden md:flex items-center gap-2">
                                    <div className="font-bold text-neutral-700 truncate max-w-[100px]">{tx.passengers?.[0]?.name || 'Booking'}</div>
                                </div>

                                <div className="flex-1 min-w-0 text-right md:text-left">
                                    <div className="font-black text-neutral-900">XAF {(tx.totalAmount || 0).toLocaleString()}</div>
                                </div>

                                <div className="flex items-center gap-3 ml-auto">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <Badge variant={tx.status === 'CONFIRMED' ? 'success' : 'danger'} size="sm" className="scale-[0.8] origin-right">
                                            {tx.status}
                                        </Badge>
                                        <Badge variant={
                                            tx.paymentStatus === 'PAID' ? 'success' :
                                                tx.paymentStatus === 'REFUNDED' ? 'info' : 'warning'
                                        } size="sm" className="scale-[0.8] origin-right">
                                            {tx.paymentStatus}
                                        </Badge>
                                    </div>

                                    <button
                                        onClick={() => setEditingTransaction({ ...tx })}
                                        className="w-7 h-7 flex items-center justify-center text-primary-600 hover:bg-primary-50 rounded-lg transition-colors group-hover:scale-110 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination for Transactions */}
                        {pagination.transactions.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.transactions.page === 1}
                                    onClick={() => fetchSettlements(pagination.settlements.page, pagination.transactions.page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-xs font-bold text-neutral-400">
                                    Page {pagination.transactions.page} of {pagination.transactions.pages}
                                </span>
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.transactions.page === pagination.transactions.pages}
                                    onClick={() => fetchSettlements(pagination.settlements.page, pagination.transactions.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon="💳"
                        title="No Transactions"
                        description="Once tickets are booked, they will appear here."
                    />
                )}
            </div>

            {/* Settlements List */}
            <div className="glass-panel p-8">
                <h2 className="text-xl font-black text-neutral-900 mb-6">Settlement History</h2>
                {settlements.length > 0 ? (
                    <div className="space-y-3">
                        {settlements.map((settlement: any) => (
                            <div key={settlement._id} className={`flex items-center justify-between py-2 px-4 bg-white/60 border-l-4 rounded-xl hover:bg-white/90 transition-all group shadow-sm hover:shadow-md ${settlement.status === 'PAID' ? 'border-l-success-500' : 'border-l-warning-500'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-black text-neutral-900">Settlement #{settlement._id.slice(-6).toUpperCase()}</div>
                                        <div className="text-[10px] font-bold text-neutral-400 h-fit leading-none mb-[-1px] opacity-60">• {new Date(settlement.createdAt || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="text-sm font-black text-neutral-900 leading-none">XAF {(settlement.amount || 0).toLocaleString()}</div>
                                    <Badge variant={settlement.status === 'PAID' ? 'success' : 'warning'} size="sm" className="scale-[0.8] origin-right">
                                        {settlement.status || 'PENDING'}
                                    </Badge>
                                </div>
                            </div>
                        ))}

                        {/* Pagination for Settlements */}
                        {pagination.settlements.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.settlements.page === 1}
                                    onClick={() => fetchSettlements(pagination.settlements.page - 1, pagination.transactions.page)}
                                >
                                    Previous
                                </Button>
                                <span className="text-xs font-bold text-neutral-400">
                                    Page {pagination.settlements.page} of {pagination.settlements.pages}
                                </span>
                                <Button
                                    variant="glass"
                                    size="sm"
                                    disabled={pagination.settlements.page === pagination.settlements.pages}
                                    onClick={() => fetchSettlements(pagination.settlements.page + 1, pagination.transactions.page)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title="No Settlements Yet"
                        description="Your settlement history will appear here once you start receiving payments."
                    />
                )}
            </div>

            {/* Edit Transaction Modal */}
            {editingTransaction && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Edit Transaction</h3>
                            <button onClick={() => setEditingTransaction(null)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTransaction} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">PNR Reference</label>
                                <input
                                    type="text"
                                    value={editingTransaction.pnr}
                                    disabled
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-sm font-bold text-neutral-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Amount (XAF)</label>
                                <input
                                    type="number"
                                    value={editingTransaction.totalAmount}
                                    onChange={(e) => setEditingTransaction({ ...editingTransaction, totalAmount: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Payment Status</label>
                                <select
                                    value={editingTransaction.paymentStatus}
                                    onChange={(e) => setEditingTransaction({ ...editingTransaction, paymentStatus: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PAID">PAID</option>
                                    <option value="FAILED">FAILED</option>
                                    <option value="REFUNDED">REFUNDED</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Booking Status</label>
                                <select
                                    value={editingTransaction.status}
                                    onChange={(e) => setEditingTransaction({ ...editingTransaction, status: e.target.value })}
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
                                    onClick={() => setEditingTransaction(null)}
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

            {/* Request Settlement Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Request Settlement</h3>
                            <button
                                type="button"
                                onClick={() => setShowRequestModal(false)}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleRequestSettlement} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Amount (XAF)
                                </label>
                                <input
                                    type="number"
                                    value={requestAmount}
                                    onChange={e => setRequestAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                    min={0}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                    required
                                />
                                <p className="mt-1 text-[11px] text-neutral-500">
                                    Suggested amount: XAF {(stats.pendingPayout || 0).toLocaleString()}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Payout Method
                                </label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                                >
                                    <option value="MOBILE_MONEY">Mobile Money</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="glass"
                                    className="flex-1"
                                    onClick={() => setShowRequestModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={requesting}
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
