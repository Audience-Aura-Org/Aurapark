'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencySupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'PENDING' | 'RESOLVED'>('ALL');
    const [showNewModal, setShowNewModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'MEDIUM' });
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get('/api/agency/support');
            setTickets(data.tickets || []);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/agency/support', newTicket);
            setShowNewModal(false);
            setNewTicket({ subject: '', description: '', priority: 'MEDIUM' });
            await fetchTickets();
        } catch (error) {
            console.error('Failed to create ticket:', error);
            alert('Failed to submit support ticket.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (ticketId: string) => {
        if (!replyText.trim()) return;
        try {
            await axios.patch('/api/agency/support', { id: ticketId, message: replyText });
            setReplyText('');
            setReplyingTo(null);
            await fetchTickets();
        } catch (error) {
            console.error('Failed to send reply:', error);
        }
    };

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        try {
            await axios.patch('/api/agency/support', { id: ticketId, status });
            setSavedId(ticketId);
            setTimeout(() => setSavedId(null), 2000);
            await fetchTickets();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filtered = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);
    const openCount = tickets.filter(t => t.status === 'OPEN').length;
    const pendingCount = tickets.filter(t => t.status === 'PENDING').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Support Tickets"
                subtitle="Manage customer complaints and support requests from your agency"
                breadcrumbs={['Agency', 'Support']}
                actions={
                    <Button variant="primary" onClick={() => setShowNewModal(true)}>
                        + New Ticket
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: tickets.length, color: 'text-neutral-900', filter: 'ALL' },
                    { label: 'Open', count: openCount, color: 'text-warning-600', filter: 'OPEN' },
                    { label: 'Pending', count: pendingCount, color: 'text-primary-600', filter: 'PENDING' },
                    { label: 'Resolved', count: resolvedCount, color: 'text-success-600', filter: 'RESOLVED' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        onClick={() => setFilter(stat.filter as any)}
                        className={`glass-card p-5 cursor-pointer transition-all hover:ring-2 ring-primary-300 ${filter === stat.filter ? 'ring-2' : ''}`}
                    >
                        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">{stat.label}</div>
                        <div className={`text-3xl font-black ${stat.color}`}>{stat.count}</div>
                    </div>
                ))}
            </div>

            {/* Ticket List */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
                    <h2 className="text-xl font-black text-neutral-900">
                        {filter === 'ALL' ? 'All Tickets' : `${filter} Tickets`}
                        <span className="text-sm font-semibold text-neutral-400 ml-2">({filtered.length})</span>
                    </h2>
                    <div className="flex gap-2">
                        {(['ALL', 'OPEN', 'PENDING', 'RESOLVED'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${filter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((ticket) => (
                            <div key={ticket._id} className={`p-5 bg-white/60 hover:bg-white border-l-4 rounded-2xl transition-all ${ticket.status === 'OPEN' ? 'border-l-warning-400' : ticket.status === 'RESOLVED' ? 'border-l-success-400' : 'border-l-primary-400'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-100 px-2 py-1 rounded">
                                            #{ticket.ticketNumber || ticket._id?.slice(-6).toUpperCase()}
                                        </span>
                                        <Badge variant={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'danger' : ticket.priority === 'MEDIUM' ? 'warning' : 'info'} size="sm">
                                            {ticket.priority}
                                        </Badge>
                                        <Badge variant={ticket.status === 'OPEN' ? 'warning' : ticket.status === 'RESOLVED' ? 'success' : 'info'} size="sm">
                                            {ticket.status}
                                        </Badge>
                                    </div>
                                    <span className="text-[10px] font-bold text-neutral-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                </div>

                                <h4 className="font-black text-neutral-900 text-base mb-1">{ticket.subject}</h4>
                                <p className="text-sm text-neutral-500 mb-4 leading-relaxed">{ticket.description}</p>

                                {/* Messages */}
                                {ticket.messages?.length > 0 && (
                                    <div className="space-y-2 mb-4 pl-4 border-l-2 border-neutral-100">
                                        {ticket.messages.map((msg: any, i: number) => (
                                            <div key={i} className="text-xs text-neutral-600 bg-neutral-50 rounded-lg p-3">
                                                <span className="font-bold text-neutral-400 block mb-1">{new Date(msg.timestamp).toLocaleString()}</span>
                                                {msg.text}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {ticket.status !== 'RESOLVED' && (
                                        <>
                                            <Button variant="primary" size="sm" onClick={() => setReplyingTo(replyingTo?._id === ticket._id ? null : ticket)}>
                                                Reply
                                            </Button>
                                            <Button variant="glass" size="sm" onClick={() => handleUpdateStatus(ticket._id, 'RESOLVED')}>
                                                {savedId === ticket._id ? '✓ Resolved' : 'Mark Resolved'}
                                            </Button>
                                        </>
                                    )}
                                    <span className="text-xs text-neutral-400 ml-auto">From: {ticket.userId?.name || 'Customer'}</span>
                                </div>

                                {replyingTo?._id === ticket._id && (
                                    <div className="mt-4 flex gap-2">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-primary-400 outline-none"
                                            onKeyDown={e => e.key === 'Enter' && handleReply(ticket._id)}
                                        />
                                        <Button variant="primary" size="sm" onClick={() => handleReply(ticket._id)}>Send</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        title="No Tickets Found"
                        description={filter !== 'ALL' ? `No ${filter} tickets at this time.` : "No support tickets yet."}
                    />
                )}
            </div>

            {/* New Ticket Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Raise a Support Ticket</h3>
                            <button onClick={() => setShowNewModal(false)} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmitTicket} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Subject</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 outline-none text-sm font-semibold text-neutral-900"
                                    placeholder="Brief description of the issue"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Priority</label>
                                <select
                                    value={newTicket.priority}
                                    onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 outline-none text-sm font-semibold text-neutral-900"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">Description</label>
                                <textarea
                                    value={newTicket.description}
                                    onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 outline-none text-sm text-neutral-900 resize-none"
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="glass" className="flex-1" onClick={() => setShowNewModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1" isLoading={submitting}>Submit Ticket</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
