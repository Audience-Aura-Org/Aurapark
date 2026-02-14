'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Bus {
    _id: string;
    busNumber: string;
    capacity: number;
    amenities: string[];
    isActive: boolean;
    seatMap: {
        rows: number;
        columns: number;
    };
}

export default function BusList({ agencyId }: { agencyId?: string }) {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBuses();
    }, [agencyId]);

    const fetchBuses = async () => {
        try {
            const url = agencyId ? `/api/buses?agencyId=${agencyId}` : '/api/buses';
            const { data } = await axios.get(url);
            setBuses(data.buses);
        } catch (error) {
            console.error('Error fetching buses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scanning Hangar</span>
        </div>
    );

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-center bg-white/[0.02] p-8 glass-dark rounded-[32px] border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Fleet Inventory</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Managed Transport Units</p>
                </div>
                <Link
                    href="/agency/buses/new"
                    className="h-12 px-8 bg-accent hover:bg-accent-hover text-primary rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-accent/10 transition-all"
                >
                    + Induct Bus
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {buses.map((bus) => (
                    <Link
                        key={bus._id}
                        href={`/agency/buses/${bus._id}`}
                        className="glass p-8 hover:border-accent/30 transition-all group relative overflow-hidden"
                    >
                        {/* Visual depth element */}
                        <div className="absolute -bottom-8 -right-8 text-8xl opacity-[0.03] grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all font-black -rotate-12">BUS</div>

                        <div className="flex justify-between items-start mb-8 border-b border-white/5 pb-6">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter group-hover:text-accent transition-colors">{bus.busNumber}</h3>
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Classification: Series-{bus.capacity > 40 ? 'Heavy' : 'Light'}</div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${bus.isActive
                                    ? 'bg-success text-primary shadow-lg shadow-success/20'
                                    : 'bg-white/5 text-gray-600 border border-white/5'
                                }`}>
                                {bus.isActive ? 'ACTIVE' : 'IDLE'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="space-y-1">
                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">Payload</span>
                                <div className="text-white font-black text-lg tracking-tight">{bus.capacity} SEATS</div>
                            </div>
                            <div className="text-right space-y-1">
                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">Matrix</span>
                                <div className="text-white font-black text-lg tracking-tight">{bus.seatMap.rows}×{bus.seatMap.columns}</div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {bus.amenities.slice(0, 3).map(a => (
                                <span key={a} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:border-accent/20 transition-colors">{a}</span>
                            ))}
                            {bus.amenities.length > 3 && <span className="text-[8px] font-black text-accent ml-1">+{bus.amenities.length - 3} MORE</span>}
                        </div>
                    </Link>
                ))}

                {buses.length === 0 && (
                    <div className="col-span-full text-center py-20 glass rounded-[40px] border-dashed border-white/10">
                        <div className="text-6xl mb-6 opacity-20">🏗️</div>
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Hangar Empty</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">No transport units detected in the local registry.</p>
                        <Link href="/agency/buses/new" className="mt-8 inline-block text-accent font-black text-[10px] uppercase tracking-[0.2em] hover:tracking-[0.4em] transition-all">Download New Blueprint →</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
