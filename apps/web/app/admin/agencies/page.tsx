'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import Link from 'next/link';

interface NewAgencyForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    ownerId: string;
}

export default function AdminAgenciesPage() {
    const [agencies, setAgencies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [newAgency, setNewAgency] = useState<NewAgencyForm>({
        name: '',
        email: '',
        phone: '',
        address: '',
        ownerId: ''
    });

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const { data } = await axios.get('/api/agencies');
            setAgencies(data.agencies || []);
        } catch (error) {
            console.error('Failed to fetch agencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCreateError(null);
        setNewAgency({
            name: '',
            email: '',
            phone: '',
            address: '',
            ownerId: ''
        });
        setShowCreateModal(true);
    };

    const handleCreateAgency = async (e: FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError(null);

        try {
            await axios.post('/api/agencies', newAgency);
            setShowCreateModal(false);
            await fetchAgencies();
        } catch (error: any) {
            console.error('Failed to create agency:', error);
            const message = error?.response?.data?.error || 'Failed to create agency';
            setCreateError(message);
            alert(message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Agency Management"
                subtitle={`${agencies.length} ${agencies.length === 1 ? 'agency' : 'agencies'} registered`}
                breadcrumbs={['Admin', 'Agencies']}
                actions={
                    <Button variant="primary" type="button" onClick={handleOpenCreate}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Agency
                    </Button>
                }
            />

            {agencies.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {agencies.map((agency, index) => (
                        <div key={agency._id} className="glass-card p-6 hover-lift" style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">
                                    {agency.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900">{agency.name}</h3>
                                            <p className="text-sm text-neutral-600 font-medium">{agency.email}</p>
                                        </div>
                                        <Badge variant={
                                            agency.status === 'ACTIVE' ? 'success' :
                                                agency.status === 'PENDING' ? 'warning' :
                                                    'danger'
                                        } size="sm">
                                            {agency.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <div className="text-xs font-semibold text-neutral-600 mb-1">Trust Score</div>
                                            <div className="text-lg font-black text-neutral-900">{agency.trustScore || 50}/100</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-neutral-600 mb-1">Active Trips</div>
                                            <div className="text-lg font-black text-neutral-900">{agency.activeTrips || 0}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/admin/agencies/${agency._id}`} className="flex-1">
                                            <Button variant="primary" size="sm" className="w-full">View Details</Button>
                                        </Link>
                                        <Button variant="glass" size="sm">Edit</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    }
                    title="No Agencies Yet"
                    description="No agencies have registered on the platform yet."
                    action={
                        <Button variant="primary" size="lg" type="button" onClick={handleOpenCreate}>
                            Add First Agency
                        </Button>
                    }
                />
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-neutral-900">Create New Agency</h2>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateAgency} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Agency Name
                                </label>
                                <input
                                    type="text"
                                    value={newAgency.name}
                                    onChange={e => setNewAgency({ ...newAgency, name: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none text-sm font-medium text-neutral-900"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        value={newAgency.email}
                                        onChange={e => setNewAgency({ ...newAgency, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none text-sm font-medium text-neutral-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={newAgency.phone}
                                        onChange={e => setNewAgency({ ...newAgency, phone: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none text-sm font-medium text-neutral-900"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    value={newAgency.address}
                                    onChange={e => setNewAgency({ ...newAgency, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none text-sm font-medium text-neutral-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                                    Owner User ID
                                </label>
                                <input
                                    type="text"
                                    value={newAgency.ownerId}
                                    onChange={e => setNewAgency({ ...newAgency, ownerId: e.target.value })}
                                    placeholder="Paste the platform user ID for the agency owner"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 focus:border-primary-400 focus:ring-0 outline-none text-sm font-medium text-neutral-900"
                                />
                                <p className="mt-1 text-[11px] text-neutral-500">
                                    This should correspond to an existing platform user who will manage this agency.
                                </p>
                            </div>

                            {createError && (
                                <p className="text-xs text-danger-600 font-medium">{createError}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="glass"
                                    className="flex-1"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={creating}
                                >
                                    Create Agency
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
