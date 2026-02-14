'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [agency, setAgency] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (id) fetchAgency();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchAgency = async () => {
        try {
            const { data } = await axios.get(`/api/agencies/${id}`);
            setAgency(data.agency);
        } catch (error) {
            console.error('Failed to fetch agency details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!agency) return;
        const nextStatus = agency.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        setStatusUpdating(true);
        try {
            const { data } = await axios.patch(`/api/agencies/${id}`, { status: nextStatus });
            setAgency(data.agency ?? { ...agency, status: nextStatus });
        } catch (error) {
            console.error('Failed to update agency status:', error);
            alert('Failed to update agency status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!agency) return;
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete agency "${agency.name}"? This action cannot be undone.`
        );
        if (!confirmed) return;

        setDeleting(true);
        try {
            await axios.delete(`/api/agencies/${id}`);
            router.push('/admin/agencies');
        } catch (error) {
            console.error('Failed to delete agency:', error);
            alert('Failed to delete agency');
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    if (!agency) return (
        <EmptyState
            icon={
                <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            }
            title="Agency Not Found"
            description="The agency you are looking for does not exist or has been removed."
            action={<Link href="/admin/agencies"><Button variant="primary">Back to List</Button></Link>}
        />
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={agency.name}
                subtitle={`Agency ID: ${agency._id}`}
                breadcrumbs={['Admin', 'Agencies', agency.name]}
                actions={
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm">
                            Edit Settings
                        </Button>
                        <Button
                            variant={agency.status === 'ACTIVE' ? 'danger' : 'success'}
                            size="sm"
                            type="button"
                            onClick={handleToggleStatus}
                            isLoading={statusUpdating}
                        >
                            {agency.status === 'ACTIVE' ? 'Suspend Agency' : 'Approve Agency'}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            type="button"
                            onClick={handleDelete}
                            isLoading={deleting}
                        >
                            Delete Agency
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-500 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-xl mx-auto mb-6">
                            {agency.name?.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 mb-1">{agency.name}</h2>
                        <p className="text-sm font-medium text-neutral-600 mb-4">{agency.email}</p>
                        <Badge variant={
                            agency.status === 'ACTIVE' ? 'success' :
                                agency.status === 'PENDING' ? 'warning' :
                                    'danger'
                        } size="lg">
                            {agency.status}
                        </Badge>
                    </div>

                    <div className="glass-panel p-6 space-y-4">
                        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Quick Stats</h3>
                        <div className="space-y-3">
                            <StatRow label="Trust Score" value={`${agency.trustScore || 50}/100`} />
                            <StatRow label="Total trips" value={agency.totalTrips || 0} />
                            <StatRow label="Total bookings" value={agency.totalBookings || 0} />
                            <StatRow label="Revenue share" value="XAF 12,500,000" />
                        </div>
                    </div>
                </div>

                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Performance Charts Placeholder */}
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black text-neutral-900 mb-6">Revenue Performance</h3>
                        <div className="h-64 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 font-medium border-2 border-dashed border-neutral-200">
                            Revenue chart will be initialized here
                        </div>
                    </div>

                    {/* Admin Actions Panel */}
                    <div className="glass-panel p-8 space-y-6">
                        <h3 className="text-xl font-black text-neutral-900">Administrative Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ActionCard
                                title="Adjust Trust Score"
                                description="Manually override the agency's quality rating"
                                icon="📈"
                                action="Adjust"
                            />
                            <ActionCard
                                title="Pricing Policy"
                                description="Override global platform fee for this agency"
                                icon="💰"
                                action="Override"
                            />
                            <ActionCard
                                title="Audit Trails"
                                description="View all system logs related to this agency"
                                icon="📋"
                                action="View Logs"
                                href="/admin/audit"
                            />
                            <ActionCard
                                title="Support Disputes"
                                description="Arbitrate open disputes for this agency"
                                icon="⚖️"
                                action="Resolve"
                                href="/admin/disputes"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
            <span className="text-sm font-semibold text-neutral-600">{label}</span>
            <span className="text-sm font-black text-neutral-900">{value}</span>
        </div>
    );
}

function ActionCard({ title, description, icon, action, href }: any) {
    const card = (
        <div className="p-5 glass-panel rounded-2xl hover:bg-white/60 transition-all group pointer-events-auto">
            <div className="flex items-start gap-4">
                <div className="text-2xl">{icon}</div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 mb-1">{title}</h4>
                    <p className="text-xs text-neutral-600 mb-3">{description}</p>
                    <Button variant="glass" size="sm" className="group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        {action}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (href) return <Link href={href}>{card}</Link>;
    return card;
}
