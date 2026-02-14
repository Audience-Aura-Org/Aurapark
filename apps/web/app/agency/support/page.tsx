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

    useEffect(() => {
        fetchTickets();
    }, []);

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

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Personnel Support Node"
                subtitle="High-fidelity communication layer for agency support operations"
                breadcrumbs={['Agency', 'Support']}
                actions={
                    <Button variant="primary">New Support Thread</Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Response Efficiency</div>
                        <div className="text-4xl font-black text-neutral-900 tracking-tighter">1.2h</div>
                        <p className="text-[10px] font-bold text-success-600 uppercase mt-2">Optimal Vector</p>
                    </div>
                    <div className="glass-panel p-6">
                        <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Resolution Velocity</div>
                        <div className="text-4xl font-black text-neutral-900 tracking-tighter">98%</div>
                        <p className="text-[10px] font-bold text-primary-600 uppercase mt-2">Stable Cycle</p>
                    </div>
                </div>

                {/* Tickets Thread */}
                <div className="lg:col-span-3 glass-panel p-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                        <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Active Communication Threads</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-neutral-900 text-white text-[10px] font-black rounded-lg">ALL</button>
                            <button className="px-3 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-black rounded-lg">UNRESOLVED</button>
                        </div>
                    </div>

                    {tickets.length > 0 ? (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div key={ticket._id} className="p-4 bg-white/60 hover:bg-white border border-transparent hover:border-neutral-100 rounded-2xl transition-all cursor-pointer group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black font-mono text-neutral-400">{ticket.ticketNumber}</span>
                                            <Badge variant={ticket.priority === 'HIGH' ? 'danger' : 'info'} size="sm" className="scale-75 origin-left">
                                                {ticket.priority}
                                            </Badge>
                                        </div>
                                        <span className="text-[10px] font-bold text-neutral-400">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h4 className="font-black text-neutral-900 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{ticket.subject}</h4>
                                            <p className="text-[11px] text-neutral-500 mt-1 truncate max-w-md">{ticket.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-neutral-900 mb-1">{ticket.userId?.name}</div>
                                            <Badge variant={ticket.status === 'OPEN' ? 'warning' : 'success'} size="sm" className="scale-75 origin-right">
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon="💬"
                            title="Synchronization Complete"
                            description="All support threads are currently in a resolved state."
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
