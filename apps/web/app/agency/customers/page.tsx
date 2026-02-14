'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AgencyCustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get('/api/agency/customers');
            setCustomers(data.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
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
                title="Unified Passenger Registry"
                subtitle="Cross-platform customer intelligence and relationship management"
                breadcrumbs={['Agency', 'Customers']}
                actions={
                    <Button variant="glass">Export CRM Data</Button>
                }
            />

            {/* Loyalty & Retention Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Clientele</div>
                    <div className="text-3xl font-black text-neutral-900">{customers.length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Unique Passengers</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Revenue per User</div>
                    <div className="text-3xl font-black text-success-600">
                        XAF {customers.length > 0 ? (customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.length).toFixed(0).toLocaleString() : 0}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">Average Lifetime Value</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Repeat Interaction</div>
                    <div className="text-3xl font-black text-amber-600">
                        {((customers.filter(c => c.totalBookings > 1).length / (customers.length || 1)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">Return Customer Rate</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active This Cycle</div>
                    <div className="text-3xl font-black text-blue-600">
                        {customers.filter(c => new Date(c.lastBooking) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">Engagement (30 Days)</div>
                </div>
            </div>

            {/* Customer Intelligence Grid */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">Passenger behavioral Matrix</h2>
                    <div className="flex gap-2">
                        <div className="p-2 bg-neutral-100 rounded-lg flex gap-2">
                            <input type="text" placeholder="Filter by PNR, Name or Phone..." className="bg-transparent border-none outline-none text-xs font-bold w-64 px-2" />
                            <button className="text-primary-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {customers.length > 0 ? (
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-5 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                            <div>Client Identity</div>
                            <div>Engagement Frequency</div>
                            <div>Lifetime Monetary Value</div>
                            <div>Last Operational Event</div>
                            <div className="text-right">Intelligence Profile</div>
                        </div>
                        {customers.map((customer) => (
                            <div key={customer._id} className="flex items-center gap-4 py-4 px-6 bg-white/60 border border-white/40 rounded-2xl hover:bg-white transition-all shadow-sm group">
                                <div className="flex-[1.2] flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-black text-xs shadow-lg">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-neutral-900 text-sm uppercase">{customer.name}</div>
                                        <div className="text-[10px] font-bold text-neutral-400 tracking-wider">TEL: {customer.phone}</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">Total Interactions</div>
                                    <div className="font-bold text-neutral-900">{customer.totalBookings} <span className="text-[10px] opacity-40">Bookings</span></div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">Fiscal Yield</div>
                                    <div className="font-black text-neutral-900">XAF {customer.totalSpent.toLocaleString()}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1">Recent Activity</div>
                                    <div className="font-bold text-neutral-600 text-xs">{new Date(customer.lastBooking).toLocaleDateString()}</div>
                                </div>
                                <div className="flex-1 text-right">
                                    <Button variant="glass" size="sm" className="scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-100 transition-all">Audit Dossier</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="👥"
                        title="Registry Vacuum Detected"
                        description="Customer profiles will manifest as transactional events synchronize with the platform core."
                    />
                )}
            </div>
        </div>
    );
}
