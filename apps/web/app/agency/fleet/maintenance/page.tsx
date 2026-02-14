'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { MaintenanceStatus, MaintenanceType } from '@/lib/types';

interface MaintenanceItem {
    _id: string;
    busId: {
        _id: string;
        busNumber?: string;
        busModel?: string;
    } | string;
    type: MaintenanceType;
    status: MaintenanceStatus;
    description: string;
    cost: number;
    startDate: string;
    completionDate?: string;
    performedBy?: string;
}

export default function AgencyFleetMaintenancePage() {
    const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        busId: '',
        type: MaintenanceType.ROUTINE,
        status: MaintenanceStatus.SCHEDULED,
        description: '',
        cost: '',
        performedBy: ''
    });

    const loadMaintenance = async () => {
        try {
            const [mRes, bRes] = await Promise.all([
                axios.get('/api/agency/fleet/maintenance'),
                axios.get('/api/auth/me').then(res => {
                    const agencyId = res.data?.agency?._id || res.data?.user?.agencyId;
                    if (agencyId) {
                        return axios.get(`/api/buses?agencyId=${agencyId}`);
                    }
                    return { data: { buses: [] } } as any;
                })
            ]);
            setMaintenance(mRes.data.maintenance || []);
            setBuses(bRes.data.buses || []);
        } catch (error) {
            console.error('Failed to load maintenance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMaintenance();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.busId || !form.description) {
            alert('Bus ID and description are required.');
            return;
        }

        setCreating(true);
        try {
            await axios.post('/api/agency/fleet/maintenance', {
                busId: form.busId,
                type: form.type,
                status: form.status,
                description: form.description,
                cost: form.cost ? Number(form.cost) : 0,
                performedBy: form.performedBy || undefined
            });
            setShowForm(false);
            setForm({
                busId: '',
                type: MaintenanceType.ROUTINE,
                status: MaintenanceStatus.SCHEDULED,
                description: '',
                cost: '',
                performedBy: ''
            });
            await loadMaintenance();
        } catch (error) {
            console.error('Failed to create maintenance record:', error);
            alert('Failed to create maintenance record');
        } finally {
            setCreating(false);
        }
    };

    const getStatusVariant = (status: MaintenanceStatus) => {
        switch (status) {
            case MaintenanceStatus.COMPLETED:
                return 'success';
            case MaintenanceStatus.IN_PROGRESS:
                return 'info';
            case MaintenanceStatus.CANCELLED:
                return 'danger';
            default:
                return 'warning';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Maintenance"
                subtitle="Log repairs and plan upcoming maintenance."
                breadcrumbs={['Agency', 'Fleet', 'Maintenance']}
                actions={
                    <Button type="button" variant="primary" onClick={() => setShowForm(true)}>
                        Add maintenance
                    </Button>
                }
            />

            {maintenance.length === 0 ? (
                <EmptyState
                    icon="🛠️"
                    title="No Maintenance Records"
                    description="Track inspections, repairs, and preventive maintenance for your fleet."
                    action={
                        <Button type="button" variant="primary" onClick={() => setShowForm(true)}>
                            Add First Record
                        </Button>
                    }
                />
            ) : (
                <div className="glass-panel p-6 space-y-4">
                    <div className="hidden md:grid grid-cols-5 gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                        <div>Bus</div>
                        <div>Type</div>
                        <div>Description</div>
                        <div>Cost</div>
                        <div>Status</div>
                    </div>
                    <div className="space-y-3">
                        {maintenance.map(item => {
                            const bus = item.busId as any;
                            return (
                                <div
                                    key={item._id}
                                    className="flex flex-col md:grid md:grid-cols-5 gap-3 items-start md:items-center py-3 px-4 bg-white/70 rounded-xl shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="font-bold text-neutral-900 text-sm">
                                        {bus?.busNumber || 'Bus'}{' '}
                                        {bus?.busModel && (
                                            <span className="text-[11px] text-neutral-500 font-medium ml-1">
                                                • {bus.busModel}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs font-semibold text-neutral-600">
                                        {item.type}
                                    </div>
                                    <div className="text-xs text-neutral-700 line-clamp-2">
                                        {item.description}
                                    </div>
                                    <div className="text-sm font-black text-neutral-900">
                                        XAF {Number(item.cost || 0).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getStatusVariant(item.status)} size="sm">
                                            {item.status}
                                        </Badge>
                                        <span className="hidden md:inline text-[10px] text-neutral-400 font-bold">
                                            {new Date(item.startDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-lg p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-neutral-900">Schedule Maintenance</h3>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="block text-xs font-black text-neutral-600 mb-2 uppercase tracking-wide">
                                    Bus
                                </label>
                                <select
                                    value={form.busId}
                                    onChange={e => setForm({ ...form, busId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900"
                                >
                                    <option value="">Select a bus</option>
                                    {buses.map(bus => (
                                        <option key={bus._id} value={bus._id}>
                                            {bus.busNumber} {bus.busModel ? `(${bus.busModel})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-neutral-600 mb-2 uppercase tracking-wide">
                                        Maintenance Type
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value as MaintenanceType })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900"
                                    >
                                        {Object.values(MaintenanceType).map(type => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-neutral-600 mb-2 uppercase tracking-wide">
                                        Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value as MaintenanceStatus })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900"
                                    >
                                        {Object.values(MaintenanceStatus).map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="absolute left-4 top-2 text-xs font-black text-primary-700 bg-white px-1.5 rounded z-10">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                    rows={3}
                                    className="w-full px-4 pt-6 pb-2 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Estimated Cost (XAF)"
                                    type="number"
                                    value={form.cost}
                                    onChange={e => setForm({ ...form, cost: e.target.value })}
                                    min={0}
                                />
                                <Input
                                    label="Performed By"
                                    type="text"
                                    value={form.performedBy}
                                    onChange={e => setForm({ ...form, performedBy: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="glass"
                                    className="flex-1"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={creating}
                                >
                                    Save Record
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
