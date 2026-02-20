'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { format } from 'date-fns';

export default function AgencyFinancePayoutsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ pendingPayout: 0, totalEarnings: 0, netRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('MOBILE_MONEY');
  const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/agency/settlements?settlementPage=${page}`);
      setSettlements(data.settlements || []);
      setPagination(data.pagination?.settlements || { page: 1, pages: 1, total: 0 });
      if (data.stats) setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount || requestAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    setRequesting(true);
    try {
      await axios.post('/api/agency/settlements', { amount: requestAmount, paymentMethod });
      setShowModal(false);
      setRequestAmount('');
      await fetchData();
    } catch (error) {
      console.error('Failed to request payout:', error);
      alert('Failed to submit payout request.');
    } finally {
      setRequesting(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'PAID') return 'success';
    if (status === 'PROCESSING') return 'info';
    if (status === 'FAILED') return 'danger';
    return 'warning';
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
    </div>
  );

  const totalPaid = settlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.netRevenue || 0), 0);
  const totalPending = settlements.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').reduce((sum, s) => sum + (s.netRevenue || 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payout History"
        subtitle="Track your settlement requests and disbursement status"
        breadcrumbs={['Agency', 'Finance', 'Payouts']}
        actions={
          <Button variant="primary" onClick={() => { setRequestAmount(Math.round(stats.pendingPayout) || ''); setShowModal(true); }}>
            Request Payout
          </Button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Available to Request</div>
          <div className="text-3xl font-black text-warning-600">XAF {Math.round(stats.pendingPayout || 0).toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">Unpaid confirmed bookings</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Total Disbursed</div>
          <div className="text-3xl font-black text-success-600">XAF {totalPaid.toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">{settlements.filter(s => s.status === 'PAID').length} paid requests</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">In Progress</div>
          <div className="text-3xl font-black text-primary-600">XAF {totalPending.toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">{settlements.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').length} pending requests</div>
        </div>
      </div>

      {/* Payout Requests Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-xl font-black text-neutral-900">Settlement Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Gross</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Platform Fee</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Net Payout</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Paid On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {settlements.length > 0 ? settlements.map((s: any) => (
                <tr key={s._id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-neutral-900">#{s._id?.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-neutral-400">{format(new Date(s.createdAt), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700 font-semibold">{s.period || '—'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-neutral-600">XAF {(s.grossRevenue || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold text-danger-500">- XAF {(s.platformFee || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-neutral-900">XAF {(s.netRevenue || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-neutral-500">
                    {s.paymentMethod?.replace('_', ' ') || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusColor(s.status)} size="sm">{s.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {s.paidOn ? format(new Date(s.paidOn), 'MMM d, yyyy') : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <EmptyState
                      icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a1 1 0 11-2 0 1 1 0 012 0z" /></svg>}
                      title="No Payout Requests Yet"
                      description="Request your first payout when you have earnings available."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 py-6 border-t border-neutral-100">
            <Button variant="glass" size="sm" disabled={pagination.page === 1} onClick={() => fetchData(pagination.page - 1)}>Previous</Button>
            <span className="text-xs font-bold text-neutral-400">Page {pagination.page} of {pagination.pages}</span>
            <Button variant="glass" size="sm" disabled={pagination.page === pagination.pages} onClick={() => fetchData(pagination.page + 1)}>Next</Button>
          </div>
        )}
      </div>

      {/* Request Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-neutral-900">Request Payout</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-6">
              <div className="text-xs font-bold text-success-700 uppercase tracking-wide">Available Balance</div>
              <div className="text-2xl font-black text-success-700 mt-1">XAF {Math.round(stats.pendingPayout || 0).toLocaleString()}</div>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Amount (XAF)</label>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={e => setRequestAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  max={stats.pendingPayout}
                  min={1}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Payout Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none transition-all text-sm font-bold text-neutral-900"
                >
                  <option value="MOBILE_MONEY">Mobile Money (MTN / Orange)</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>
              <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-3">
                ⚡ Platform fee (10%) is already deducted. You will receive exactly what you request.
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="glass" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={requesting}>Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
