'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';

export default function AgencyTrackingPage() {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Live Tracking"
                subtitle="Watch your buses and shipments in real-time."
                breadcrumbs={['Agency', 'Tracking']}
            />

            {/* Tracking Map Mockup */}
            <div className="relative aspect-[21/9] w-full bg-neutral-900 rounded-[3rem] overflow-hidden border-8 border-neutral-800 shadow-2xl group">
                {/* Simulated Grid Lines */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* Simulated Heatmap/Signal effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-primary-900/40 opacity-50" />

                {/* Simulated Vehicle Icons */}
                <div className="absolute top-[30%] left-[40%] animate-pulse group-hover:scale-110 transition-transform cursor-pointer">
                    <div className="w-4 h-4 bg-primary-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] border-2 border-white" />
                    <div className="absolute top-6 left-0 bg-black/80 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded-md border border-white/20 whitespace-nowrap">
                        UNIT: BUS-701 • 82km/h
                    </div>
                </div>

                <div className="absolute top-[60%] left-[65%] animate-pulse delay-700 group-hover:scale-110 transition-transform cursor-pointer">
                    <div className="w-4 h-4 bg-success-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.8)] border-2 border-white" />
                    <div className="absolute top-6 left-0 bg-black/80 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded-md border border-white/20 whitespace-nowrap">
                        UNIT: BUS-403 • IDLE
                    </div>
                </div>

                <div className="absolute top-[20%] left-[80%] animate-pulse delay-300 group-hover:scale-110 transition-transform cursor-pointer">
                    <div className="w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.8)] border-2 border-white" />
                    <div className="absolute top-6 left-0 bg-black/80 backdrop-blur-md text-[8px] font-black text-white px-2 py-1 rounded-md border border-white/20 whitespace-nowrap">
                        SHIPMENT: SHP-X92 • IN-TRANSIT
                    </div>
                </div>

                {/* Overlays */}
                <div className="absolute bottom-8 left-8 p-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl w-80 text-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary-400">Live Feed</div>
                        <Badge variant="success" size="sm" className="bg-success-400/20 text-success-400 border-none animate-pulse">CONNECTED</Badge>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase">GPS Connection</span>
                            <span className="text-[10px] font-black text-success-400">100% (STABLE)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase">Active Units</span>
                            <span className="text-[10px] font-black">12 UNITS</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold opacity-40 uppercase">GPS Accuracy</span>
                            <span className="text-[10px] font-black text-amber-400">1.2m</span>
                        </div>
                    </div>
                    <Button variant="primary" className="w-full mt-6 h-10 text-[10px] uppercase font-black tracking-widest bg-primary-600 hover:bg-primary-500 border-none">Refresh Map</Button>
                </div>

                <div className="absolute top-8 right-8 flex gap-3">
                    <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-neutral-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 hover:bg-neutral-800 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-8">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">Buses on Road</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <div className="text-[11px] font-black text-neutral-900 group-hover:text-primary-600 transition-colors uppercase">UNIT-{700 + i}</div>
                                </div>
                                <div className="text-[10px] font-bold text-neutral-400">DOU → YAO • {70 + i}km/h</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">Active Shipments</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    <div className="text-[11px] font-black text-neutral-900 group-hover:text-primary-600 transition-colors uppercase">SHIPMENT-X{90 + i}</div>
                                </div>
                                <div className="text-[10px] font-bold text-neutral-400">IN-TRANSIT • BAFOUSSAM</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-8">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6 border-b border-neutral-100 pb-2">Alerts</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-danger-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" />
                                <div className="text-[11px] font-black text-danger-600 uppercase">OFFLINE: BUS-302</div>
                            </div>
                            <div className="text-[10px] font-bold text-neutral-400">NO SIGNAL • KRIBI</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
