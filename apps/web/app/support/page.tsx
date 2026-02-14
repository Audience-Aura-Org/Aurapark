'use client';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';
import { useState, useEffect, Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';

function SupportForm() {
    const searchParams = useSearchParams();
    const pnr = searchParams.get('pnr');
    const tracking = searchParams.get('tracking');

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        subject: pnr ? 'BOOKING ANOMALY' : tracking ? 'LOGISTICAL DELAY' : 'GENERAL INQUIRY',
        priority: 'ROUTINE',
        message: pnr ? `Encountered problem with PNR: ${pnr}` : tracking ? `Investigation requested for Tracking ID: ${tracking}` : ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/support/tickets', {
                contactEmail: formData.email,
                subject: formData.subject,
                priority: formData.priority,
                description: formData.message,
                category: formData.subject
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to send support signal:', error);
            alert('Signal transmission failed. Please use satellite phone fallback.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="liquid-glass-premium p-12 text-center animate-fade-in">
                <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl shadow-xl shadow-success-200">
                    ✔️
                </div>
                <h2 className="text-2xl font-black text-neutral-900 mb-2">Signal Received</h2>
                <p className="text-neutral-500 font-bold mb-8">Our support vectors are currently triangulating your request.</p>
                <Button variant="glass" onClick={() => setSubmitted(false)}>Broadcast New Signal</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="liquid-glass-premium p-8 space-y-6">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Get support</h2>

            <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-neutral-400 ml-1">Personnel Email</label>
                <Input
                    placeholder="Personnel identification (email)"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-neutral-400 ml-1">Subject</label>
                    <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-400"
                    >
                        <option value="BOOKING ANOMALY">BOOKING ANOMALY</option>
                        <option value="LOGISTICAL DELAY">LOGISTICAL DELAY</option>
                        <option value="PAYMENT RECONCILIATION">PAYMENT RECONCILIATION</option>
                        <option value="GENERAL INQUIRY">GENERAL INQUIRY</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-neutral-400 ml-1">Priority</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 font-bold text-sm outline-none focus:ring-2 focus:ring-primary-400"
                    >
                        <option value="ROUTINE">ROUTINE</option>
                        <option value="URGENT">URGENT</option>
                        <option value="CRITICAL">CRITICAL (MISSION BLOCKER)</option>
                    </select>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-neutral-400 ml-1">Message Body</label>
                <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full h-40 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 font-medium text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                    placeholder="Describe the situation with all relevant telemetry/PNR data..."
                    required
                />
            </div>
            <Button
                type="submit"
                variant="primary"
                className="w-full h-14 font-semibold text-sm shadow-xl shadow-primary-200"
                isLoading={loading}
            >
                Transmit Support Signal
            </Button>
        </form>
    );
}

export default function PassengerSupportPage() {
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-mesh-green">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 space-y-8">
                    <PageHeader
                        title="Mission Support Control"
                        subtitle="Direct communication channel for operational assistance and service inquiries"
                        breadcrumbs={['Home', 'Support']}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Support Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <Suspense fallback={<div className="liquid-glass-premium h-96 animate-pulse" />}>
                                <SupportForm />
                            </Suspense>

                            <div className="glass-panel p-8">
                                <h3 className="text-sm font-semibold text-neutral-400 mb-6">Recent tickets</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/40 border border-neutral-50 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                                            <div>
                                                <div className="text-sm font-black text-neutral-900">CASE #88219 - Ticket Modification</div>
                                                <div className="text-[10px] font-medium text-neutral-400">2h ago</div>
                                            </div>
                                        </div>
                                        <Badge variant="success" size="sm">RESOLVED</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="glass-panel p-8 bg-neutral-900 text-white">
                                <h3 className="text-xl font-bold tracking-tight mb-6">Contact us</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 text-xl">
                                            📞
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-medium opacity-40">Phone</div>
                                            <div className="text-sm font-black">+237 600 000 000</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 text-xl">
                                            📧
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-medium opacity-40">Email</div>
                                            <div className="text-sm font-black">support@transport.platform</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center text-primary-400 text-xl">
                                            💬
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-medium opacity-40">Live chat</div>
                                            <div className="text-sm font-black">24/7 Platform Chat</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="text-[10px] font-medium opacity-40 mb-1 text-center">Status</div>
                                    <div className="text-center font-semibold text-success-400">Low latency</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
