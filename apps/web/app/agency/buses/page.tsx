'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { TripSchedulerModal } from '@/components/TripSchedulerModal';
import { Input } from '@/components/Input';
import { BusType, BusAmenity } from '@/lib/types';
import Link from 'next/link';

export default function AgencyBusesPage() {
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agency, setAgency] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedBus, setSelectedBus] = useState<any>(null);
    const [editingBus, setEditingBus] = useState<any>(null);
    const [formData, setFormData] = useState({
        busNumber: '',
        busModel: '',
        capacity: '',
        type: BusType.STANDARD,
        amenities: [] as string[],
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                setAgency(authData.agency);
                const { data } = await axios.get(`/api/buses?agencyId=${authData.agency._id}`);
                setBuses(data.buses || []);
            }
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        if (!agency) return;
        try {
            const { data } = await axios.get(`/api/buses?agencyId=${agency._id}`);
            setBuses(data.buses || []);
        } catch (error) {
            console.error('Failed to fetch buses:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agency) return;

        const capacityNum = parseInt(formData.capacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
            alert('Please enter a valid capacity.');
            return;
        }

        setSaving(true);
        try {
            const busData = {
                ...formData,
                agencyId: agency._id,
                capacity: capacityNum,
                seatMap: {
                    rows: Math.ceil(capacityNum / 4),
                    columns: 4,
                    seats: Array.from({ length: capacityNum }, (_, i) => {
                        const row = Math.floor(i / 4) + 1;
                        const column = (i % 4) + 1;
                        return { seatNumber: `${i + 1}`, type: 'STANDARD', row, column, isAvailable: true };
                    })
                }
            };

            if (editingBus) {
                await axios.patch(`/api/buses/${editingBus._id}`, busData);
            } else {
                await axios.post('/api/buses', busData);
            }

            setIsModalOpen(false);
            await fetchBuses();
            setFormData({ busNumber: '', busModel: '', capacity: '', type: BusType.STANDARD, amenities: [] });
            setEditingBus(null);
        } catch (error: any) {
            console.error('Failed to save bus:', error);
            alert(error.response?.data?.error || 'Failed to save bus.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (bus: any) => {
        setEditingBus(bus);
        setFormData({
            busNumber: bus.busNumber,
            busModel: bus.busModel || '',
            capacity: bus.capacity.toString(),
            type: bus.type || BusType.STANDARD,
            amenities: bus.amenities || [],
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this bus?')) return;
        try {
            await axios.delete(`/api/buses/${id}`);
            fetchBuses();
        } catch (error) {
            console.error('Failed to delete bus:', error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bus list"
                subtitle="View and manage all buses in your account."
                breadcrumbs={['Agency', 'Fleet', 'Buses']}
                actions={
                    <Button variant="primary" onClick={() => {
                        setEditingBus(null);
                        setFormData({ busNumber: '', busModel: '', capacity: '', type: BusType.STANDARD, amenities: [] });
                        setIsModalOpen(true);
                    }}>
                        Add bus
                    </Button>
                }
            />

            {/* Bus cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                {buses.map((bus) => (
                    <div key={bus._id} className="glass-card bg-white/60 border-l-4 border-primary-500 shadow-xl shadow-primary-900/5 hover:bg-white/90 transition-all flex flex-col overflow-hidden">
                        <div className="p-5 flex-1 space-y-4">
                            {/* Identity & status */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={bus.isActive ? 'success' : 'danger'} size="sm" className="font-black uppercase tracking-widest text-[9px] px-2 py-0.5">
                                            {bus.isActive ? 'Active' : 'Offline'}
                                        </Badge>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">{bus.type}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-neutral-900 leading-none uppercase tracking-tight">{bus.busNumber}</h3>
                                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{bus.busModel || 'OEM Standard'}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Payload Capacity</div>
                                    <div className="text-2xl font-black text-primary-600 leading-none">{bus.capacity} <span className="text-xs text-neutral-400">Seats</span></div>
                                </div>
                            </div>

                            {/* Deployment */}
                            <div className="glass-panel p-4 bg-neutral-900/95 border border-white/10 rounded-xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Deployment Status</span>
                                    {bus.nextTrip ? (
                                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${bus.nextTrip.status === 'EN_ROUTE' ? 'text-green-400' :
                                            bus.nextTrip.status === 'DELAYED' ? 'text-amber-400' : 'text-blue-400'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${bus.nextTrip.status === 'EN_ROUTE' ? 'bg-green-500 animate-pulse' :
                                                bus.nextTrip.status === 'DELAYED' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`}></span>
                                            {bus.nextTrip.status === 'EN_ROUTE' ? 'In Motion / En Route' :
                                                bus.nextTrip.status === 'DELAYED' ? 'Delayed / Staged' : 'Scheduled / Ready'}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black text-neutral-600 uppercase">Awaiting Mission</span>
                                    )}
                                </div>

                                {bus.nextTrip ? (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-black text-white/90 uppercase">
                                            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(bus.nextTrip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(bus.nextTrip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="bg-primary-500/10 border border-primary-500/20 px-3 py-2 rounded-lg">
                                            <div className="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-1">Assigned Route</div>
                                            <div className="text-xs font-black text-primary-50 uppercase truncate leading-tight">
                                                {bus.nextTrip.routeId?.routeName || (bus.nextTrip.shadowRouteName) || 'Assigned Mission'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-2 flex items-center gap-3 text-neutral-500 font-black text-[11px] uppercase tracking-tight">
                                        <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Unit Available for Dispatch
                                    </div>
                                )}
                            </div>

                            {/* Amenities */}
                            <div className="flex items-center gap-1.5 p-1">
                                <span className="text-[10px] font-black text-neutral-400 uppercase mr-2 tracking-widest">Built-in:</span>
                                {bus.amenities?.map((a: string) => (
                                    <div key={a} className="px-2 py-1 bg-neutral-100/80 border border-neutral-200 rounded text-[9px] font-black text-neutral-600 uppercase tracking-tighter" title={a}>
                                        {a === 'AC' ? '❄️ AC' : a === 'WIFI' ? '📶 WIFI' : a === 'FOOD' ? '🍱 FOOD' : a === 'WATER' ? '💧 WATER' : a === 'CHARGING' ? '⚡ POWER' : `✨ ${a}`}
                                    </div>
                                ))}
                                {(!bus.amenities || bus.amenities.length === 0) && <span className="text-[10px] font-bold text-neutral-300 uppercase">No Perks Defined</span>}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="bg-neutral-50 border-t border-neutral-200/60 p-3 grid grid-cols-4 gap-2">
                            <Link href={`/agency/buses/${bus._id}/layout`} className="contents">
                                <Button variant="glass" size="sm" className="h-9 py-0 px-1 border-neutral-200 font-black text-[10px] uppercase tracking-tight flex-1">
                                    Layout
                                </Button>
                            </Link>
                            <Button
                                variant="primary"
                                size="sm"
                                className="h-9 py-0 px-1 font-black text-[10px] uppercase tracking-tight shadow-md shadow-primary-200 flex-1"
                                onClick={() => { setSelectedBus(bus); setIsScheduleModalOpen(true); }}
                            >
                                Schedule
                            </Button>
                            <Button
                                variant="glass"
                                size="sm"
                                className="h-9 py-0 px-1 border-neutral-200 font-black text-[10px] uppercase tracking-tight flex-1"
                                onClick={() => handleEdit(bus)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                className="h-9 py-0 px-1 font-black text-[10px] uppercase tracking-tight flex-1"
                                onClick={() => handleDelete(bus._id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Registration Modal - Maintaining high visibility */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                                {editingBus ? 'Edit bus' : 'Add bus'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Bus number"
                                placeholder="e.g. AA 1234 XY"
                                value={formData.busNumber}
                                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Bus model"
                                    placeholder="e.g. Scania K410"
                                    value={formData.busModel}
                                    onChange={(e) => setFormData({ ...formData, busModel: e.target.value })}
                                />
                                <Input
                                    label="Number of seats"
                                    type="number"
                                    placeholder="45"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Bus type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as BusType })}
                                        className="w-full border-2 border-neutral-300 rounded-xl p-2.5 text-xs font-black uppercase text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none h-[42px] bg-white shadow-soft"
                                    >
                                        {Object.values(BusType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Amenities</label>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.values(BusAmenity).map(a => (
                                            <button
                                                key={a}
                                                type="button"
                                                onClick={() => {
                                                    const newAmenities = formData.amenities.includes(a)
                                                        ? formData.amenities.filter(x => x !== a)
                                                        : [...formData.amenities, a];
                                                    setFormData({ ...formData, amenities: newAmenities });
                                                }}
                                                className={`px-2 py-1.5 rounded text-[10px] font-black uppercase border transition-all ${formData.amenities.includes(a) ? 'bg-primary-500 border-primary-600 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-400 hover:border-primary-300'}`}
                                            >
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6">
                                <Button variant="glass" className="flex-1 font-black text-[11px] uppercase h-12 tracking-widest border-neutral-200" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 font-black text-[11px] uppercase h-12 tracking-widest shadow-lg shadow-primary-200" type="submit" isLoading={saving}>
                                    {editingBus ? 'Save changes' : 'Save bus'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <TripSchedulerModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                bus={selectedBus}
                onSuccess={fetchBuses}
            />
        </div>
    );
}
