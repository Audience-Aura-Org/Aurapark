'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { FuelType } from '@/lib/types';

export default function AgencyFleetFuelPage() {
    const [fuelLogs, setFuelLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [buses, setBuses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        busId: '',
        quantity: '',
        costPerLitre: '',
        odometerReading: '',
        fuelType: FuelType.DIESEL,
        stationName: '',
        location: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
        fetchBuses();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axios.get('/api/agency/fleet/fuel');
            setFuelLogs(data.fuelLogs || []);
        } catch (error) {
            console.error('Failed to fetch fuel logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                const { data } = await axios.get(`/api/buses?agencyId=${authData.agency._id}`);
                setBuses(data.buses || []);
            }
        } catch (error) {
            console.error('Failed to fetch buses:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const totalCost = parseFloat(formData.quantity) * parseFloat(formData.costPerLitre);
            await axios.post('/api/agency/fleet/fuel', {
                ...formData,
                quantity: parseFloat(formData.quantity),
                costPerLitre: parseFloat(formData.costPerLitre),
                totalCost,
                odometerReading: parseInt(formData.odometerReading)
            });
            setIsModalOpen(false);
            fetchData();
            setFormData({
                busId: '',
                quantity: '',
                costPerLitre: '',
                odometerReading: '',
                fuelType: FuelType.DIESEL,
                stationName: '',
                location: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Failed to save fuel log:', error);
            alert('Failed to save fuel log');
        } finally {
            setSaving(false);
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
                title="Fuel log"
                subtitle="Record fuel fills and track fuel costs."
                breadcrumbs={['Agency', 'Fleet', 'Fuel']}
                actions={
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Add fuel entry
                    </Button>
                }
            />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Monthly Expenditure</div>
                    <div className="text-3xl font-black text-neutral-900">
                        XAF {fuelLogs.reduce((acc, log) => acc + log.totalCost, 0).toLocaleString()}
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Volume (L)</div>
                    <div className="text-3xl font-black text-neutral-900">
                        {fuelLogs.reduce((acc, log) => acc + log.quantity, 0).toLocaleString()} <span className="text-sm">Litres</span>
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Efficiency Average</div>
                    <div className="text-3xl font-black text-neutral-900">
                        2.4 <span className="text-sm">km / L</span>
                    </div>
                </div>
            </div>

            {/* Fuel entries */}
            <div className="glass-panel p-8">
                <h2 className="text-xl font-black text-neutral-900 mb-6 tracking-tight">Fuel entries</h2>
                {fuelLogs.length > 0 ? (
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-6 px-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                            <div>Date</div>
                            <div>Bus</div>
                            <div>Volume</div>
                            <div>Odometer</div>
                            <div>Amount</div>
                            <div className="text-right">Station</div>
                        </div>
                        {fuelLogs.map((log) => (
                            <div key={log._id} className="flex items-center gap-4 py-3 px-4 bg-white/60 border-l-4 border-primary-400 rounded-xl hover:bg-white/90 transition-all text-sm group shadow-sm">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Timestamp</div>
                                    <div className="font-bold text-neutral-900">{new Date(log.date).toLocaleDateString()}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Unit ID</div>
                                    <div className="font-black text-primary-600">{log.busId?.busNumber}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Volume</div>
                                    <div className="font-bold text-neutral-900">{log.quantity} L</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Odometer</div>
                                    <div className="font-bold text-neutral-900">{log.odometerReading.toLocaleString()} km</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Payload Cost</div>
                                    <div className="font-black text-neutral-900">XAF {log.totalCost.toLocaleString()}</div>
                                </div>
                                <div className="flex-1 text-right">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Location</div>
                                    <div className="font-bold text-neutral-600 truncate">{log.stationName || log.location || 'Fleet Depot'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="⛽"
                        title="No Fuel Logs Recorded"
                        description="Start tracking your fleet's energy consumption to optimize operational efficiency."
                    />
                )}
            </div>

            {/* Log Fuel Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-scale-in border border-white/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Add fuel entry</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors p-2">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Bus</label>
                                    <select
                                        value={formData.busId}
                                        onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs font-black uppercase text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none h-[42px]"
                                        required
                                    >
                                        <option value="">Select Vehicle</option>
                                        {buses.map(bus => (
                                            <option key={bus._id} value={bus._id}>{bus.busNumber} ({bus.busModel || 'Standard'})</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Quantity (L)"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Price per litre (XAF)"
                                    type="number"
                                    placeholder="840"
                                    value={formData.costPerLitre}
                                    onChange={(e) => setFormData({ ...formData, costPerLitre: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Odometer (km)"
                                    type="number"
                                    placeholder="Ex: 45000"
                                    value={formData.odometerReading}
                                    onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Fuel type</label>
                                    <select
                                        value={formData.fuelType}
                                        onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as FuelType })}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs font-black uppercase text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none h-[42px]"
                                    >
                                        {Object.values(FuelType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Station name"
                                    placeholder="Tradex, Total, etc"
                                    value={formData.stationName}
                                    onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                                />
                                <Input
                                    label="Location"
                                    placeholder="Bonaberi, Douala"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-6">
                                <Button variant="glass" className="flex-1 font-black text-[11px] uppercase h-12 tracking-widest border-neutral-200" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 font-black text-[11px] uppercase h-12 tracking-widest shadow-lg shadow-primary-200" type="submit" isLoading={saving}>Save entry</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
