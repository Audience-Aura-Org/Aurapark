'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Route {
    _id: string;
    routeName: string;
    agencyId: {
        _id: string;
        name: string;
    };
    stops: any[];
    isActive: boolean;
}

export default function RouteList({ agencyId }: { agencyId?: string }) {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
    }, [agencyId]);

    const fetchRoutes = async () => {
        try {
            const url = agencyId ? `/api/routes?agencyId=${agencyId}` : '/api/routes';
            const { data } = await axios.get(url);
            setRoutes(data.routes);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-10 gap-4">
            <div className="w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="glass p-10 animate-in fade-in duration-700 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] text-9xl font-black">RLINE</div>

            <header className="flex justify-between items-center mb-12 relative z-10">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Bookable Corridors</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Logistics Paths</p>
                </div>
                <Link
                    href="/agency/routes/new"
                    className="h-12 px-6 bg-white/5 hover:bg-accent hover:text-primary border border-white/10 hover:border-accent rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                >
                    + Map New Corridor
                </Link>
            </header>

            <div className="space-y-4 relative z-10">
                {routes.map((route) => (
                    <Link
                        key={route._id}
                        href={`/agency/routes/${route._id}`}
                        className="block glass bg-white/[0.02] p-6 hover:bg-white/[0.05] border-white/5 hover:border-accent/40 transition-all group"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${route.isActive ? 'bg-success animate-pulse' : 'bg-gray-600'}`}></div>
                                    <h3 className="text-xl font-black text-white tracking-tighter group-hover:text-accent transition-colors uppercase">{route.routeName}</h3>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    <span className="flex items-center gap-1">📍 {route.stops.length} VERTICES</span>
                                    <span className="opacity-20">|</span>
                                    <span className="text-accent/60">STATUS: {route.isActive ? 'OPERATIONAL' : 'DECOMMISSIONED'}</span>
                                </div>
                            </div>

                            {/* Prototypical Mini Map Visualization */}
                            <div className="hidden lg:flex items-center gap-2 max-w-[200px] w-full px-6 opacity-30 group-hover:opacity-100 transition-opacity">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                <div className="flex-1 h-px bg-dashed border-t border-dashed border-white/20"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                <div className="flex-1 h-px bg-white/20"></div>
                                <div className="w-2 h-2 rounded-full border border-accent bg-accent"></div>
                            </div>

                            <div className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[9px] uppercase tracking-widest group-hover:bg-accent group-hover:text-primary group-hover:border-accent transition-all">
                                Protocol Entry →
                            </div>
                        </div>
                    </Link>
                ))}

                {routes.length === 0 && (
                    <div className="text-center py-20 glass border-dashed border-white/10 rounded-[40px]">
                        <div className="text-4xl mb-4 opacity-10">🗺️</div>
                        <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest leading-loose">No active logistics routes detected.<br />Initialize system coordinates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
