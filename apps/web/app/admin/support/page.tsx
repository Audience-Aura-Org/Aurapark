'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

const priorityVariant = (p: string) =>
    p === 'URGENT' || p === 'HIGH' ? 'danger' : p === 'MEDIUM' ? 'warning' : 'info';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ open: 0, pending: 0, resolved: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [pagination, setPagination] = useState<any>({ page: 1, pages: 1, total: 0 });

    useEffect(() => { fetchTickets(); }, [filter]);

    const fetchTickets = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter) params.set('status', filter);
            params.set('page', String(page));
            const { data } = await axios.get(`/api/admin/support?${params}`);
            setTickets(data.tickets || []);
            setStats(data.stats || {});
            setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await axios.patch('/api/admin/support', { id, status });
            await fetchTickets(pagination.page);
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        try {
            await axios.patch('/api/admin/support', { id, message: replyText });
            setReplyText('');
            setReplyingTo(null);
            await fetchTickets(pagination.page);
        } catch (error) {
            console.error('Failed to reply:', error);
        }
    };

    const statusBorder = (s: string) =>
        s === 'OPEN' ? 'border-l-warning-400' : s === 'RESOLVED' ? 'border-l-success-400' : 'border-l-primary-400';

    return (
        <div className="space-y-8">
            <PageHeader
                title="Support Tickets"
                subtitle="Platform-wide customer and agency support requests"
                breadcrumbs={['Admin', 'Support']}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'All Tickets', count: stats.total, color: 'text-neutral-900', f: '' },
                    { label: 'Open', count: stats.open, color: 'text-warning-600', f: 'OPEN' },
                    { label: 'Pending', count: stats.pending, color: 'text-primary-600', f: 'PENDING' },
                    { label: 'Resolved', count: stats.resolved, color: 'text-success-600', f: 'RESOLVED' },
                ].map(s => (
                    <div
                        key={s.label}
                        onClick={() => setFilter(filter === s.f ? '' : s.f)}
                        className={`glass-card p-5 cursor-pointer hover:ring-2 ring-primary-300 transition-all ${filter === s.f ? 'ring-2' : ''}`}
                    >
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">{s.label}</div>
                        <div className={`text-3xl font-black ${s.color}`}>{s.count ?? '—'}</div>
                    </div>
                ))}
            </div>

            {/* Filter bar */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-neutral-900">
                        {filter || 'All'} Tickets
                        <span className="text-sm font-semibold text-neutral-400 ml-2">({pagination.total})</span>
                    </h2>
                    <div className="flex gap-2">
                        {['', 'OPEN', 'PENDING', 'RESOLVED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(filter === f ? '' : f)}
                                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${filter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                            >
                                {f || 'ALL'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
                    </div>
                ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                        {tickets.map(ticket => (
                            <div key={ticket._id} className={`p-5 bg-white/60 hover:bg-white border-l-4 rounded-2xl transition-all ${statusBorder(ticket.status)}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                                            #{ticket.ticketNumber || ticket._id?.slice(-6).toUpperCase()}
                                        </span>
                                        <Badge variant={priorityVariant(ticket.priority)} size="sm">{ticket.priority}</Badge>
                                        <Badge variant={ticket.status === 'OPEN' ? 'warning' : ticket.status === 'RESOLVED' ? 'success' : 'info'} size="sm">
                                            {ticket.status}
                                        </Badge>
                                        {ticket.agencyId?.name && (
                                            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-1 rounded-lg">
                                                {ticket.agencyId.name}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400 whitespace-nowrap">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h4 className="font-black text-neutral-900 text-base mb-1">{ticket.subject}</h4>
                                <p className="text-sm text-neutral-500 mb-4">{ticket.description}</p>

                                {/* Messages thread */}
                                {ticket.messages?.length > 0 && (
                                    <div className="space-y-2 mb-4 pl-4 border-l-2 border-neutral-100">
                                        {ticket.messages.slice(-3).map((msg: any, i: number) => (
                                            <div key={i} className={`text-xs rounded-lg p-3 ${msg.text?.startsWith('[Admin]') ? 'bg-primary-50 text-primary-900' : 'bg-neutral-50 text-neutral-700'}`}>
                                                <span className="font-bold block mb-1">{new Date(msg.timestamp).toLocaleString()}</span>
                                                {msg.text}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 flex-wrap">
                                    {ticket.status !== 'RESOLVED' && (
                                        <>
                                            <Button variant="primary" size="sm" onClick={() => setReplyingTo(replyingTo === ticket._id ? null : ticket._id)}>
                                                Reply
                                            </Button>
                                            <Button variant="glass" size="sm" onClick={() => handleUpdateStatus(ticket._id, 'RESOLVED')}>
                                                Mark Resolved
                                            </Button>
                                            {ticket.status === 'OPEN' && (
                                                <Button variant="glass" size="sm" onClick={() => handleUpdateStatus(ticket._id, 'PENDING')}>
                                                    Set Pending
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    <span className="text-xs text-neutral-400 ml-auto">
                                        From: {ticket.userId?.name || 'Unknown'} &nbsp;·&nbsp; {ticket.userId?.email || ''}
                                    </span>
                                </div>

                                {replyingTo === ticket._id && (
                                    <div className="mt-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Type admin reply..."
                                            onKeyDown={e => e.key === 'Enter' && handleReply(ticket._id)}
                                            className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                                        />
                                        <Button variant="primary" size="sm" onClick={() => handleReply(ticket._id)}>Send</Button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                <Button variant="glass" size="sm" disabled={pagination.page === 1} onClick={() => fetchTickets(pagination.page - 1)}>Previous</Button>
                                <span className="text-xs font-bold text-neutral-400 self-center">Page {pagination.page} of {pagination.pages}</span>
                                <Button variant="glass" size="sm" disabled={pagination.page === pagination.pages} onClick={() => fetchTickets(pagination.page + 1)}>Next</Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon={<svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        title="No Tickets"
                        description={filter ? `No ${filter} tickets right now.` : 'No support tickets across the platform.'}
                    />
                )}
            </div>
        </div>
    );
}
