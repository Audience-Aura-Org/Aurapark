'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { format } from 'date-fns';

// ─── Ticket Printer ──────────────────────────────────────────────
function printTicket(booking: any) {
    const trip = booking.tripId || {};
    const route = trip.routeId || {};
    const passengers = booking.passengers || [];
    const deptDate = trip.departureTime
        ? format(new Date(trip.departureTime), 'EEEE, MMMM d yyyy')
        : 'N/A';
    const deptTime = trip.departureTime
        ? format(new Date(trip.departureTime), 'HH:mm')
        : 'N/A';
    const busPlate = trip.busId?.plateNumber || '';
    const bookingDate = booking.createdAt
        ? format(new Date(booking.createdAt), 'MMM d, yyyy HH:mm')
        : '';

    const passengersHtml = passengers.map((p: any, i: number) => `
        <tr>
            <td style="padding:8px 12px;font-weight:700;color:#111">${i + 1}. ${p.name}</td>
            <td style="padding:8px 12px;color:#555">${p.idNumber || '—'}</td>
            <td style="padding:8px 12px;color:#555">${p.seatNumber || (i + 1)}</td>
        </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Ticket — ${booking.pnr}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#f4f4f4;padding:24px;color:#111}
    .ticket{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)}
    .header{background:linear-gradient(135deg,#1e3a8a,#3b82f6);padding:28px 32px;color:#fff}
    .header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
    .agency-name{font-size:22px;font-weight:900;letter-spacing:-.5px}
    .pnr-box{text-align:right}
    .pnr-label{font-size:10px;opacity:.7;text-transform:uppercase;letter-spacing:2px}
    .pnr-value{font-size:28px;font-weight:900;letter-spacing:4px;font-family:monospace}
    .route-row{display:flex;align-items:center;gap:12px}
    .city{font-size:26px;font-weight:900}
    .arrow{font-size:20px;opacity:.6}
    .body{padding:28px 32px;display:grid;grid-template-columns:1fr 1fr;gap:20px}
    .field label{font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:4px}
    .field span{font-size:14px;font-weight:700;color:#111}
    .divider{grid-column:1/-1;border:none;border-top:2px dashed #e5e7eb;margin:4px 0}
    .passengers{grid-column:1/-1}
    .passengers h3{font-size:11px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    thead tr{background:#f9fafb;border-bottom:1px solid #e5e7eb}
    thead th{padding:8px 12px;text-align:left;font-size:10px;font-weight:800;color:#999;text-transform:uppercase;letter-spacing:1px}
    tbody tr:nth-child(even){background:#f9fafb}
    .footer{background:#f9fafb;padding:16px 32px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e5e7eb}
    .footer-note{font-size:11px;color:#999}
    .amount{font-size:22px;font-weight:900;color:#1e3a8a}
    .barcode{font-family:monospace;font-size:24px;letter-spacing:4px;color:#1e3a8a;opacity:.3;font-weight:900;text-align:center;padding:12px 32px;letter-spacing:6px}
    @media print{body{background:#fff;padding:0}.ticket{box-shadow:none;border-radius:0}}
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="agency-name">${trip.agencyId?.name || 'Transport Agency'}</div>
          <div style="font-size:11px;opacity:.7;margin-top:4px">E-TICKET / BOARDING PASS</div>
        </div>
        <div class="pnr-box">
          <div class="pnr-label">Booking Ref</div>
          <div class="pnr-value">${booking.pnr}</div>
        </div>
      </div>
      <div class="route-row">
        <span class="city">${route.origin || 'ORIGIN'}</span>
        <span class="arrow">✈</span>
        <span class="city">${route.destination || 'DEST'}</span>
      </div>
    </div>

    <div class="body">
      <div class="field">
        <label>Departure Date</label>
        <span>${deptDate}</span>
      </div>
      <div class="field">
        <label>Departure Time</label>
        <span>${deptTime}</span>
      </div>
      <div class="field">
        <label>Route</label>
        <span>${route.routeName || route.origin + ' → ' + route.destination || '—'}</span>
      </div>
      <div class="field">
        <label>Bus / Plate</label>
        <span>${busPlate || '—'}</span>
      </div>
      <div class="field">
        <label>Seats</label>
        <span>${passengers.length} Passenger${passengers.length > 1 ? 's' : ''}</span>
      </div>
      <div class="field">
        <label>Payment Status</label>
        <span>${booking.paymentStatus || '—'}</span>
      </div>

      <hr class="divider"/>

      <div class="passengers">
        <h3>Passenger List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID / CNI</th>
              <th>Seat</th>
            </tr>
          </thead>
          <tbody>${passengersHtml}</tbody>
        </table>
      </div>
    </div>

    <div class="barcode">|||||||||||||||||||||||||||||||||||||||</div>

    <div class="footer">
      <div class="footer-note">
        <div>Booked: ${bookingDate}</div>
        <div>Contact: ${booking.contactPhone || '—'}</div>
        <div style="margin-top:4px;color:#3b82f6;font-weight:600">Present this ticket at the boarding gate.</div>
      </div>
      <div class="amount">XAF ${(booking.totalAmount || 0).toLocaleString()}</div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),800)}</script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=750,height=900');
    if (win) { win.document.write(html); win.document.close(); }
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AgencyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [agencyId, setAgencyId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ status: '', pnr: '', phone: '', date: '' });

    useEffect(() => { fetchInitialData(); }, []);

    useEffect(() => {
        if (agencyId) {
            const timer = setTimeout(() => fetchBookings(agencyId), 500);
            return () => clearTimeout(timer);
        }
    }, [filters, agencyId]);

    const fetchInitialData = async () => {
        try {
            const { data } = await axios.get('/api/auth/me');
            const id = data.agency?._id || data.user?.agencyId;
            if (id) setAgencyId(id);
            else setLoading(false);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            setLoading(false);
        }
    };

    const fetchBookings = async (id: string) => {
        setLoading(true);
        try {
            const qp = new URLSearchParams({ agencyId: id });
            if (filters.status) qp.append('status', filters.status);
            if (filters.pnr) qp.append('pnr', filters.pnr);
            if (filters.phone) qp.append('phone', filters.phone);
            if (filters.date) qp.append('date', filters.date);
            const { data } = await axios.get(`/api/bookings?${qp}`);
            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bookings"
                subtitle="Search, filter, and print tickets for all agency bookings"
                breadcrumbs={['Agency', 'Bookings']}
            />

            {/* Filters */}
            <div className="glass-panel p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Search PNR</label>
                        <input
                            type="text"
                            placeholder="e.g. A1B2C3D4"
                            value={filters.pnr}
                            onChange={e => setFilters(p => ({ ...p, pnr: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Phone Number</label>
                        <input
                            type="text"
                            placeholder="e.g. 677..."
                            value={filters.phone}
                            onChange={e => setFilters(p => ({ ...p, phone: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[160px] space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                    <div className="w-48 space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Date</label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={e => setFilters(p => ({ ...p, date: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none"
                        />
                    </div>
                    <Button variant="glass" onClick={() => setFilters({ status: '', pnr: '', phone: '', date: '' })}>
                        Reset
                    </Button>
                </div>
            </div>

            {/* ── Desktop Table ── */}
            <div className="glass-panel overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">PNR</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Passenger</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking._id} className="hover:bg-white/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-neutral-900 font-mono">#{booking.pnr}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-neutral-900">
                                                {booking.passengers?.[0]?.name || 'Unknown'}
                                                {booking.passengers?.length > 1 && (
                                                    <span className="text-xs text-neutral-400 ml-1">+{booking.passengers.length - 1}</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-500">{booking.contactPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-neutral-900 truncate max-w-[160px]">
                                                {booking.tripId?.routeId?.routeName || 'Unknown Route'}
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {booking.createdAt ? format(new Date(booking.createdAt), 'MMM d, h:mm a') : '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-neutral-900">
                                                XAF {(booking.totalAmount || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : booking.status === 'REFUNDED' ? 'warning' : 'info'}
                                                size="sm"
                                            >
                                                {booking.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => printTicket(booking)}
                                                    title="Print boarding ticket"
                                                >
                                                    🖨 Ticket
                                                </Button>
                                                {booking.tripId?._id && (
                                                    <Link href={`/agency/trips/${booking.tripId._id}`}>
                                                        <Button variant="glass" size="sm">Trip</Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20">
                                        <EmptyState
                                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                                            title="No Bookings Found"
                                            description="No ticket bookings match your search criteria."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
                    </div>
                ) : bookings.length > 0 ? bookings.map((booking) => (
                    <div key={booking._id} className={`glass-panel p-4 border-l-4 ${booking.status === 'CONFIRMED' ? 'border-l-success-400' : booking.status === 'CANCELLED' ? 'border-l-danger-400' : 'border-l-neutral-300'}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span className="font-black text-neutral-900 font-mono text-base">#{booking.pnr}</span>
                                <div className="text-xs text-neutral-500 mt-0.5">{booking.contactPhone}</div>
                            </div>
                            <Badge
                                variant={booking.status === 'CONFIRMED' ? 'success' : booking.status === 'CANCELLED' ? 'danger' : 'warning'}
                                size="sm"
                            >
                                {booking.status}
                            </Badge>
                        </div>

                        <div className="text-sm font-bold text-neutral-900 mb-1">
                            {booking.passengers?.[0]?.name || 'Unknown'}
                            {booking.passengers?.length > 1 && <span className="text-neutral-400 font-normal"> +{booking.passengers.length - 1} more</span>}
                        </div>
                        <div className="text-xs text-neutral-500 mb-1">
                            {booking.tripId?.routeId?.routeName || 'Unknown Route'}
                        </div>
                        <div className="text-xs text-neutral-400 mb-4">
                            {booking.createdAt ? format(new Date(booking.createdAt), 'MMM d, h:mm a') : '—'}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="font-black text-neutral-900">XAF {(booking.totalAmount || 0).toLocaleString()}</div>
                            <div className="flex gap-2">
                                <Button variant="primary" size="sm" onClick={() => printTicket(booking)}>
                                    🖨 Ticket
                                </Button>
                                {booking.tripId?._id && (
                                    <Link href={`/agency/trips/${booking.tripId._id}`}>
                                        <Button variant="glass" size="sm">Trip</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="glass-panel p-12">
                        <EmptyState
                            icon={<svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                            title="No Bookings Found"
                            description="No bookings match your search."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
