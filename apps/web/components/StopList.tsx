'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Stop {
    _id: string;
    name: string;
    description?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    pickupPoints: any[];
}

export default function StopList({ agencyId }: { agencyId?: string }) {
    const [stops, setStops] = useState<Stop[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStops();
    }, [agencyId]);

    const fetchStops = async () => {
        try {
            const url = agencyId ? `/api/stops?agencyId=${agencyId}` : '/api/stops';
            const { data } = await axios.get(url);
            setStops(data.stops);
        } catch (error) {
            console.error('Error fetching stops:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-10">
            <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-center bg-white/[0.02] p-8 glass-dark rounded-[32px] border border-white/5">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Base Infrastructure</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Transit Hubs & Terminals</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {stops.map((stop) => (
                    <div key={stop._id} className="glass p-8 group hover:border-token-accent border-white/5 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-8xl grayscale-0 font-black -rotate-12">HUB</div>

                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent text-lg mb-6 group-hover:scale-110 transition-transform">📍</div>
                            <h3 className="text-xl font-black text-white tracking-tight mb-2 uppercase group-hover:text-accent transition-colors">{stop.name}</h3>
                            {stop.description && (
                                <p className="text-gray-500 text-[10px] font-medium leading-relaxed uppercase tracking-wider mb-6 line-clamp-2">{stop.description}</p>
                            )}

                            {stop.coordinates && (
                                <div className="flex items-center gap-3 text-xs font-mono text-gray-600 mb-6 bg-black/20 w-fit px-3 py-1 rounded-lg">
                                    <span className="text-accent/50 opacity-40">LAT</span>
                                    <span className="text-gray-400">{stop.coordinates.latitude.toFixed(6)}</span>
                                    <span className="text-accent/50 opacity-40">LNG</span>
                                    <span className="text-gray-400">{stop.coordinates.longitude.toFixed(6)}</span>
                                </div>
                            )}

                            {stop.pickupPoints.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-700 mb-4">Boarding Zones</p>
                                    <div className="flex flex-wrap gap-2">
                                        {stop.pickupPoints.map((point, idx) => (
                                            <div key={idx} className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:border-white/10 transition-colors">
                                                {point.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {stops.length === 0 && (
                    <div className="col-span-full text-center py-20 glass rounded-[40px] border-dashed border-white/10">
                        <div className="text-4xl mb-4 opacity-10">🛰️</div>
                        <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Global positioning database empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
