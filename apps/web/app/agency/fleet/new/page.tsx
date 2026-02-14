'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { BusType, BusAmenity } from '@/lib/types';

export default function AgencyFleetNewPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        busNumber: '',
        busModel: '',
        registrationNumber: '',
        type: BusType.STANDARD,
        capacity: 70,
        amenities: [] as string[]
    });

    const amenitiesList = Object.values(BusAmenity);

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (!authData.agency) throw new Error('No agency association found');

            // Default seat layout generation for 70 seats
            const seats = [];
            for (let i = 1; i <= formData.capacity; i++) {
                seats.push({
                    seatNumber: i.toString(),
                    type: 'STANDARD',
                    row: Math.ceil(i / 5),
                    column: ((i - 1) % 5) + 1,
                    isAvailable: true
                });
            }

            const payload = {
                ...formData,
                agencyId: authData.agency._id,
                seatMap: {
                    rows: Math.ceil(formData.capacity / 5),
                    columns: 5,
                    seats
                }
            };

            await axios.post('/api/buses', payload);
            router.push('/agency/buses');
        } catch (error: any) {
            console.error('Failed to add vehicle:', error);
            alert(error.response?.data?.error || 'Failed to register vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Commission New Unit"
                subtitle="Formal registration of mobile assets into the agency logistical framework"
                breadcrumbs={['Agency', 'Fleet', 'New Unit']}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-8">
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter border-b border-neutral-100 pb-4">Vehicle Identity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Unit ID / Bus Number"
                                    placeholder="Ex: BUS-701"
                                    value={formData.busNumber}
                                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Registration Mark"
                                    placeholder="Ex: LT 123 AB"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Manufacturer Model"
                                    placeholder="Ex: Marco Polo / Mercedes"
                                    value={formData.busModel}
                                    onChange={(e) => setFormData({ ...formData, busModel: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Classification Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as BusType })}
                                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs font-black uppercase text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none h-[46px]"
                                    >
                                        {Object.values(BusType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter border-b border-neutral-100 pb-4">Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Logistical Capacity (Seats)"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter border-b border-neutral-100 pb-4">On-Board Vector Systems</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {amenitiesList.map((amenity) => (
                                    <label key={amenity} className={`
                                        flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer group
                                        ${formData.amenities.includes(amenity)
                                            ? 'bg-primary-50 border-primary-500 shadow-md'
                                            : 'bg-white border-neutral-100 hover:border-primary-200'}
                                    `}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={() => toggleAmenity(amenity)}
                                        />
                                        <div className={`
                                            w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                            ${formData.amenities.includes(amenity)
                                                ? 'bg-primary-500 border-primary-500 text-white'
                                                : 'border-neutral-300 group-hover:border-primary-400'}
                                        `}>
                                            {formData.amenities.includes(amenity) && (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-tight ${formData.amenities.includes(amenity) ? 'text-primary-700' : 'text-neutral-500'}`}>
                                            {amenity}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <div className="flex gap-4 pt-8">
                            <Button variant="glass" className="flex-1 font-black text-[11px] uppercase h-14 tracking-widest border-neutral-200" type="button" onClick={() => router.back()}>Abort Registration</Button>
                            <Button variant="primary" className="flex-1 font-black text-[11px] uppercase h-14 tracking-widest shadow-xl shadow-primary-200" type="submit" isLoading={loading}>Seal Commissioning</Button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="glass-panel p-8 sticky top-28 bg-neutral-900 text-white h-fit">
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-6 italic opacity-80">Unit Visualization</h2>
                        <div className="space-y-6">
                            <div className="aspect-[4/3] bg-neutral-800 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                <div className="text-6xl group-hover:scale-110 transition-transform duration-500">🚌</div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-1">Active Preview</div>
                                    <div className="text-2xl font-black">{formData.busNumber || 'PENDING ID'}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Mechanical Spec</span>
                                    <span>Details</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-[10px] uppercase font-black opacity-40">Model Family</span>
                                        <span className="text-[10px] uppercase font-black">{formData.busModel || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-[10px] uppercase font-black opacity-40">Payload Limit</span>
                                        <span className="text-[10px] uppercase font-black">{formData.capacity} Personnel</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                        <span className="text-[10px] uppercase font-black opacity-40">Class Index</span>
                                        <span className="text-[10px] uppercase font-black text-primary-400">{formData.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <p className="text-[10px] font-bold italic text-primary-200 leading-relaxed text-center">
                                    "Registration into the unified logistics cloud will synchronize this unit across all agency dispatch nodes immediately upon seal."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
