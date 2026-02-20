'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export default function AdminDisputesPage() {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/disputes');
            setDisputes(data.disputes || []);
        } catch (error) {
            console.error('Failed to fetch disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!confirm(`Mark dispute as ${status}?`)) return;
        setUpdatingId(id);
        try {
            await axios.patch(`/api/disputes/${id}`, { status });
            await fetchDisputes();
        } catch (error) {
            console.error('Failed to update dispute:', error);
            alert('Error updating dispute status.');
        } finally {
            setUpdatingId(null);
        }
    };

    // Compute stats from real data
    const stats = {
        open: disputes.filter(d => d.status === 'OPEN').length,
        underReview: disputes.filter(d => d.status === 'UNDER_REVIEW').length,
        resolved: disputes.filter(d => d.status === 'RESOLVED').length,
        rejected: disputes.filter(d => d.status === 'REJECTED').length,
    };

    // Average resolution time in days
    const resolvedWithDates = disputes.filter(d => d.status === 'RESOLVED' && d.resolvedAt && d.createdAt);
    const avgResolutionDays = resolvedWithDates.length > 0
        ? (resolvedWithDates.reduce((acc, d) => {
            return acc + (new Date(d.resolvedAt).getTime() - new Date(d.createdAt).getTime());
        }, 0) / resolvedWithDates.length / (1000 * 60 * 60 * 24)).toFixed(1)
        : '—';

    const filtered = filter
        ? disputes.filter(d => d.status === filter)
        : disputes;

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Platform Disputes"
                subtitle="Manage escalated disputes and arbitration"
                breadcrumbs={['Admin', 'Disputes']}
            />

            {/* Stats — all live from DB */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 cursor-pointer hover:ring-2 ring-warning-400 transition-all" onClick={() => setFilter(filter === 'OPEN' ? '' : 'OPEN')}>
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Open</div>
                    <div className="text-3xl font-black text-warning-600">{stats.open}</div>
                </div>
                <div className="glass-card p-6 cursor-pointer hover:ring-2 ring-primary-400 transition-all" onClick={() => setFilter(filter === 'UNDER_REVIEW' ? '' : 'UNDER_REVIEW')}>
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Under Review</div>
                    <div className="text-3xl font-black text-primary-600">{stats.underReview}</div>
                </div>
                <div className="glass-card p-6 cursor-pointer hover:ring-2 ring-success-400 transition-all" onClick={() => setFilter(filter === 'RESOLVED' ? '' : 'RESOLVED')}>
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Resolved</div>
                    <div className="text-3xl font-black text-success-600">{stats.resolved}</div>
                </div>
                <div className="glass-card p-6">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Avg Resolution</div>
                    <div className="text-3xl font-black text-neutral-900">{avgResolutionDays}{avgResolutionDays !== '—' ? 'd' : ''}</div>
                </div>
            </div>

            {/* Filter indicator */}
            {filter && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-600">Filtering by:</span>
                    <Badge variant={filter === 'OPEN' ? 'warning' : filter === 'UNDER_REVIEW' ? 'info' : 'success'} size="sm">{filter}</Badge>
                    <button onClick={() => setFilter('')} className="text-xs text-neutral-400 hover:text-danger-500 transition-colors ml-1">✕ Clear</button>
                </div>
            )}

            {/* Disputes List */}
            <div className="glass-panel p-6">
                <h2 className="text-xl font-black text-neutral-900 mb-6">
                    All Disputes <span className="text-sm font-semibold text-neutral-400 ml-2">({filtered.length})</span>
                </h2>
                {filtered.length > 0 ? (
                    <div className="space-y-4">
                        {filtered.map((dispute: any, index: number) => (
                            <div key={dispute._id || index} className="glass-panel p-6 rounded-xl hover:bg-white/60 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-danger-400 to-danger-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900">
                                                Dispute #{dispute._id?.slice(-6).toUpperCase()}
                                            </h3>
                                            <p className="text-sm text-neutral-600 mt-1 capitalize">
                                                {dispute.reason?.replace(/_/g, ' ').toLowerCase() || 'No reason provided'}
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1 line-clamp-1">{dispute.description}</p>
                                            <p className="text-xs text-neutral-500 mt-2">
                                                <span className="font-bold">Agency:</span> {dispute.agencyId?.name || 'N/A'}
                                                {' • '}
                                                <span className="font-bold">Customer:</span> {dispute.userId?.name || 'N/A'}
                                                {' • '}
                                                <span className="font-bold">Amount:</span> XAF {(dispute.amountRequested || 0).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1">
                                                Filed: {new Date(dispute.createdAt).toLocaleDateString()}
                                                {dispute.resolvedAt && ` • Resolved: ${new Date(dispute.resolvedAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        dispute.status === 'OPEN' ? 'warning' :
                                            dispute.status === 'UNDER_REVIEW' ? 'info' :
                                                dispute.status === 'RESOLVED' ? 'success' : 'danger'
                                    } size="sm">
                                        {dispute.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="flex gap-3">
                                    {dispute.status === 'OPEN' && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleUpdateStatus(dispute._id, 'UNDER_REVIEW')}
                                            isLoading={updatingId === dispute._id}
                                        >
                                            Start Review
                                        </Button>
                                    )}
                                    {dispute.status === 'UNDER_REVIEW' && (
                                        <>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleUpdateStatus(dispute._id, 'RESOLVED')}
                                                isLoading={updatingId === dispute._id}
                                            >
                                                Mark Resolved
                                            </Button>
                                            <Button
                                                variant="glass"
                                                size="sm"
                                                onClick={() => handleUpdateStatus(dispute._id, 'REJECTED')}
                                                isLoading={updatingId === dispute._id}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    {(dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') && (
                                        <span className="text-xs font-semibold text-neutral-400 self-center">Finalized</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        title={filter ? `No ${filter.replace('_', ' ')} disputes` : 'No Disputes Found'}
                        description={filter ? 'Try clearing the filter to see all disputes.' : 'All disputes are being handled at the agency level.'}
                    />
                )}
            </div>
        </div>
    );
}
