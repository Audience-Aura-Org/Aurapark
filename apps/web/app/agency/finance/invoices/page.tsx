'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyFinanceInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Invoices = confirmed bookings for this agency (each booking is a billable event)
      const { data } = await axios.get('/api/agency/settlements');
      const bookings = (data.transactions || []).filter((t: any) => t.txType === 'BOOKING');
      setInvoices(bookings);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = (invoice: any) => {
    const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${invoice.pnr}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: 900; color: #000; }
                    .badge { background: #90ee904d; color: #15803d; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
                    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                    th { background: #90ee904d; text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; }
                    td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
                    .total { background: #90ee904d; font-weight: 900; font-size: 15px; }
                    .footer { margin-top: 40px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 16px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">AURA PARK</div>
                        <div style="font-size:12px;color:#666;margin-top:4px;">Transport Network</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:18px;font-weight:900;">INVOICE</div>
                        <div style="font-size:12px;color:#666;"># ${invoice.pnr}</div>
                        <div style="margin-top:8px;"><span class="badge">${invoice.status}</span></div>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
                    <div>
                        <div style="font-size:11px;color:#999;text-transform:uppercase;font-weight:700;">Issued</div>
                        <div>${new Date(invoice.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style="font-size:11px;color:#999;text-transform:uppercase;font-weight:700;">Contact</div>
                        <div>${invoice.contactEmail || 'N/A'}</div>
                        <div>${invoice.contactPhone || ''}</div>
                    </div>
                </div>
                <table>
                    <thead><tr>
                        <th>#</th><th>Passenger</th><th>Seat</th><th>Ticket No.</th><th style="text-align:right;">Check-in</th>
                    </tr></thead>
                    <tbody>
                        ${(invoice.passengers || []).map((p: any, i: number) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${p.name}</td>
                                <td>${p.seatNumber}</td>
                                <td>${p.ticketNumber}</td>
                                <td style="text-align:right;">${p.checkedIn ? '✓' : '—'}</td>
                            </tr>
                        `).join('')}
                        <tr class="total">
                            <td colspan="4" style="text-align:right;font-size:13px;font-weight:700;">Total Amount</td>
                            <td style="text-align:right;">XAF ${(invoice.totalAmount || 0).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <div>Payment Status: <strong>${invoice.paymentStatus}</strong> &nbsp;|&nbsp; Booking ID: ${invoice._id}</div>
                    <div style="margin-top:4px;">Thank you for choosing Aura Park Transport Network.</div>
                </div>
            </body>
            </html>
        `;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const filtered = filter ? invoices.filter((inv: any) => inv.paymentStatus === filter) : invoices;

  // Stats
  const totalInvoiced = invoices.reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.filter((inv: any) => inv.paymentStatus === 'PAID').reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);
  const totalPending = invoices.filter((inv: any) => inv.paymentStatus === 'PENDING').reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        subtitle="Booking invoices generated from confirmed passenger tickets"
        breadcrumbs={['Agency', 'Finance', 'Invoices']}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Total Invoiced</div>
          <div className="text-3xl font-black text-neutral-900">XAF {totalInvoiced.toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">{invoices.length} invoices</div>
        </div>
        <div className="glass-card p-6 cursor-pointer hover:ring-2 ring-success-400 transition-all" onClick={() => setFilter(filter === 'PAID' ? '' : 'PAID')}>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Paid</div>
          <div className="text-3xl font-black text-success-600">XAF {totalPaid.toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">{invoices.filter((i: any) => i.paymentStatus === 'PAID').length} paid invoices</div>
        </div>
        <div className="glass-card p-6 cursor-pointer hover:ring-2 ring-warning-400 transition-all" onClick={() => setFilter(filter === 'PENDING' ? '' : 'PENDING')}>
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-2">Outstanding</div>
          <div className="text-3xl font-black text-warning-600">XAF {totalPending.toLocaleString()}</div>
          <div className="text-xs text-neutral-400 mt-1">{invoices.filter((i: any) => i.paymentStatus === 'PENDING').length} pending</div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-neutral-900">
            Booking Invoices <span className="text-sm font-semibold text-neutral-400 ml-2">({filtered.length})</span>
          </h2>
          {filter && (
            <button onClick={() => setFilter('')} className="text-xs font-bold text-neutral-400 hover:text-danger-500 transition-colors flex items-center gap-1">
              <Badge variant={filter === 'PAID' ? 'success' : 'warning'} size="sm">{filter}</Badge>
              <span className="ml-1">✕ Clear</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.length > 0 ? filtered.map((inv: any) => (
                <tr key={inv._id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-neutral-900">🎫 {inv.pnr}</div>
                    <div className="text-xs text-neutral-400">{inv._id?.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-neutral-900">
                      {inv.passengers?.map((p: any) => p.name).join(', ') || '—'}
                    </div>
                    <div className="text-xs text-neutral-400">{inv.passengers?.length || 0} seat(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-neutral-900">XAF {(inv.totalAmount || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      inv.paymentStatus === 'PAID' ? 'success' :
                        inv.paymentStatus === 'REFUNDED' ? 'info' : 'warning'
                    } size="sm">{inv.paymentStatus}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'CONFIRMED' ? 'success' : 'danger'} size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => handlePrintInvoice(inv)}
                    >
                      Print Invoice
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <EmptyState
                      icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                      title="No Invoices"
                      description={filter ? `No ${filter} invoices found.` : "Invoices will appear here once bookings are confirmed."}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
