'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button';
import { Input } from './Input';

export default function TripScheduler({ agencyId, onTripAdded }: { agencyId: string, onTripAdded: () => void }) {
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    const [formData, setFormData] = useState({
        routeId: '',
        busId: '',
        departureTime: '',
        arrivalTime: '',
        basePrice: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [routesRes, busesRes] = await Promise.all([
                axios.get(`/api/routes?agencyId=${agencyId}`),
                axios.get(`/api/buses?agencyId=${agencyId}`)
            ]);
            setRoutes(routesRes.data.routes);
            setBuses(busesRes.data.buses);
        };
        fetchData();
    }, [agencyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/trips', { ...formData, agencyId });
            onTripAdded();
            setFormData({
                routeId: '',
                busId: '',
                departureTime: '',
                arrivalTime: '',
                basePrice: ''
            });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to schedule trip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-10 animate-in fade-in duration-700 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

            <header className="mb-10">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Initiate Deployment</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Bookable Scheduling Engine</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Logistics Corridor (Route)</label>
                        <select
                            required
                            value={formData.routeId}
                            onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-primary text-gray-500">Select Corridor</option>
                            {routes.map((r: any) => <option key={r._id} value={r._id} className="bg-primary">{r.routeName}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Assigned Transport Unit (Bus)</label>
                        <select
                            required
                            value={formData.busId}
                            onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-white text-sm font-medium focus:outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-primary text-gray-500">Select Unit</option>
                            {buses.map((b: any) => <option key={b._id} value={b._id} className="bg-primary">{b.busNumber} [{b.capacity} SEATS]</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Departure T-Minus"
                            type="datetime-local"
                            required
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                        />
                        <Input
                            label="Arrival Estimate"
                            type="datetime-local"
                            required
                            value={formData.arrivalTime}
                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Base Valuation (USD)"
                        type="number"
                        placeholder="0.00"
                        required
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full h-16 bg-accent hover:bg-accent-hover text-primary font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-accent/10">
                        {loading ? 'SYNCHRONIZING...' : 'COMMIT TO SCHEDULE'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
