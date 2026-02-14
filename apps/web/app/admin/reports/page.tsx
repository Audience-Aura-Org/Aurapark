'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { format } from 'date-fns';

export default function AdminReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);

    const handleExport = async (type: string) => {
        setGenerating(type);
        // Simulate export delay
        await new Promise(r => setTimeout(r, 1500));
        alert(`${type} report generated and download started.`);
        setGenerating(null);
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Reports & Analytics"
                subtitle="Generate and export platform data for compliance and business review"
                breadcrumbs={['Admin', 'Reports']}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Revenue Ledger"
                    description="Full history of ticket sales, platform fees, and agency payouts."
                    type="Financial"
                    onExport={() => handleExport('Revenue Ledger')}
                    isLoading={generating === 'Revenue Ledger'}
                />
                <ReportCard
                    title="Agency Performance"
                    description="Trip completion rates, occupancy statistics, and user ratings per agency."
                    type="Operations"
                    onExport={() => handleExport('Agency Performance')}
                    isLoading={generating === 'Agency Performance'}
                />
                <ReportCard
                    title="Compliance & Audit"
                    description="Detailed log of all administrative actions and security flags over time."
                    type="Security"
                    onExport={() => handleExport('Compliance & Audit')}
                    isLoading={generating === 'Compliance & Audit'}
                />
                <ReportCard
                    title="Booking Trends"
                    description="Monthly breakdown of route popularity and peak travel times."
                    type="Marketing"
                    onExport={() => handleExport('Booking Trends')}
                    isLoading={generating === 'Booking Trends'}
                />
            </div>

            {/* Custom Range Export */}
            <div className="glass-panel p-8">
                <h3 className="text-xl font-black text-neutral-900 mb-6">Custom Data Export</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Data Source</label>
                        <select className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all">
                            <option>Ticket Bookings</option>
                            <option>Agency Settlements</option>
                            <option>System Audit Logs</option>
                            <option>User Support Tickets</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">Start Date</label>
                        <input type="date" className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-neutral-600 uppercase ml-1">End Date</label>
                        <input type="date" className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all" />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="primary" className="flex-1" size="sm" onClick={() => handleExport('Custom CSV')}>Export CSV</Button>
                        <Button variant="glass" className="flex-1" size="sm" onClick={() => handleExport('Custom PDF')}>Export PDF</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReportCard({ title, description, type, onExport, isLoading }: any) {
    return (
        <div className="glass-panel p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <Badge variant={type === 'Financial' ? 'success' : type === 'Security' ? 'danger' : 'info'} size="sm">
                    {type}
                </Badge>
                <div className="text-neutral-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">{title}</h3>
            <p className="text-sm text-neutral-600 mb-8 flex-1">{description}</p>
            <div className="flex gap-2">
                <Button
                    variant="glass"
                    className="flex-1"
                    size="sm"
                    onClick={onExport}
                    isLoading={isLoading}
                >
                    Download
                </Button>
                <Button variant="ghost" size="sm">Preview</Button>
            </div>
        </div>
    );
}
