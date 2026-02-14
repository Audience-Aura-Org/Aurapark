'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Sidebar } from '@/components/Sidebar';
import { useSidebar } from '@/components/SidebarProvider';
import axios from 'axios';
import Link from 'next/link';

export default function PassengerTrackingPage() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [recentTracking, setRecentTracking] = useState<any[]>([]);
    const { isCollapsed } = useSidebar();

    useEffect(() => {
        const saved = localStorage.getItem('guest_tracking_history');
        if (saved) setRecentTracking(JSON.parse(saved));
    }, []);

    const handleTrack = async (idToTrack?: string) => {
        const targetId = idToTrack || trackingNumber.trim();
        if (!targetId) return;

        setSearching(true);
        setError(null);
        setResult(null);

        try {
            const { data } = await axios.get(`/api/tracking?id=${targetId.toUpperCase()}`);
            setResult(data);

            // Decentralized Tracking History (Save to LocalStorage)
            const newHistory = [
                { id: targetId.toUpperCase(), type: data.type, timestamp: new Date(), label: data.type === 'BOOKING' ? data.data.agencyName : data.data.content },
                ...recentTracking.filter(h => h.id !== targetId.toUpperCase())
            ].slice(0, 5);

            setRecentTracking(newHistory);
            localStorage.setItem('guest_tracking_history', JSON.stringify(newHistory));
        } catch (err: any) {
            setError(err.response?.data?.error || 'Tracking synchronization failed. Verify identifier.');
        } finally {
            setSearching(false);
        }
    };

    const clearHistory = () => {
        setRecentTracking([]);
        localStorage.removeItem('guest_tracking_history');
    };

    return (
        <div className="min-h-screen bg-mesh-green">
            <Sidebar />
            <main className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen pt-20 safe-bottom-nav ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
                <div className="max-w-[1400px] p-4 md:p-8 space-y-8">
                    <PageHeader
                        title="Logistical Asset Tracking"
                        subtitle="Real-time telemetry for your cargo, shipments, and transport vectors"
                        breadcrumbs={['Home', 'Tracking']}
                    />

                    <div className="max-w-4xl mx-auto py-12">
                        <div className="liquid-glass-premium p-8 md:p-10 space-y-8 text-center">
                            <div className="w-24 h-24 bg-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-2xl shadow-primary-200">
                                📡
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Track your mission</h2>
                                <p className="text-neutral-500 font-bold text-sm tracking-wide">Enter your Tracking ID or PNR to initiate link</p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        label="Tracking / PNR Identifier"
                                        placeholder="Ex: TRK-982-AX"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                        className="h-14 font-black text-lg"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="primary"
                                        className="h-14 px-10 font-semibold text-sm"
                                        onClick={() => handleTrack()}
                                        isLoading={searching}
                                    >
                                        Initialize Link
                                    </Button>
                                </div>
                            </div>

                            {/* Decentralized Recent Activity Section */}
                            {!result && recentTracking.length > 0 && (
                                <div className="pt-8 border-t border-neutral-100 animate-in fade-in duration-500">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recent Node Synchronizations</h3>
                                        <button onClick={clearHistory} className="text-[10px] font-bold text-primary-600 hover:text-primary-700">Purge Data Cache</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {recentTracking.map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleTrack(item.id)}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-primary-200 hover:bg-white transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    {item.type === 'BOOKING' ? '🎫' : '📦'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-black text-neutral-900 truncate uppercase">{item.id}</div>
                                                    <div className="text-[9px] font-bold text-neutral-400 truncate uppercase">{item.label || 'Satellite Asset'}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                                    ⚠️ {error}
                                </div>
                            )}

                            <p className="text-[10px] font-medium text-neutral-400 pt-4">
                                Secure end-to-end encrypted satellite telemetry
                            </p>
                        </div>

                        {searching && (
                            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="p-6 glass-panel flex items-center gap-6">
                                    <div className="w-4 h-4 rounded-full bg-primary-500 animate-ping"></div>
                                    <div className="flex-1">
                                        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-primary-600">Synchronizing...</span>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                {result.type === 'SHIPMENT' ? (
                                    <div className="liquid-glass-premium p-8 space-y-8 border-l-8 border-primary-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full mb-3 inline-block">Parcel Found</span>
                                                <h3 className="text-3xl font-black text-neutral-900">{result.data.trackingNumber}</h3>
                                                <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{result.data.agencyId?.name || 'Carrier Hub'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Current Status</div>
                                                <div className="px-5 py-2 bg-neutral-900 text-white rounded-xl font-black text-xs uppercase tracking-tighter">
                                                    {result.data.status}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="relative pl-8">
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
                                                    <div className="absolute left-[-4px] top-0 w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-primary-100"></div>
                                                    <div className="absolute left-[-4px] bottom-0 w-2.5 h-2.5 rounded-full bg-neutral-300"></div>

                                                    <div className="space-y-8">
                                                        <div>
                                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Origin</div>
                                                            <div className="text-lg font-black text-neutral-900">{result.data.origin}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Destination</div>
                                                            <div className="text-lg font-black text-neutral-900">{result.data.destination}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-neutral-50/50 rounded-2xl p-6 space-y-4 border border-neutral-100">
                                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Shipment Details</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <div className="text-[9px] font-bold text-neutral-500 uppercase">Contents</div>
                                                        <div className="text-sm font-black text-neutral-800 uppercase">{result.data.content}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-bold text-neutral-500 uppercase">Weight</div>
                                                        <div className="text-sm font-black text-neutral-800">{result.data.weight} KG</div>
                                                    </div>
                                                </div>
                                                <Button variant="glass" size="sm" className="w-full" as={Link} href={`/support?tracking=${result.data.trackingNumber}`}>
                                                    Contact Logistics Support
                                                </Button>
                                            </div>
                                        </div>

                                        {result.data.history?.length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Transit History</h4>
                                                <div className="space-y-3">
                                                    {result.data.history.map((h: any, i: number) => (
                                                        <div key={i} className="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-white/20">
                                                            <div className="text-[10px] font-black text-neutral-400 w-20">{new Date(h.timestamp).toLocaleDateString()}</div>
                                                            <div className="w-2 h-2 rounded-full bg-primary-400"></div>
                                                            <div className="flex-1 text-xs font-black text-neutral-700 uppercase">{h.status}</div>
                                                            <div className="text-[10px] font-bold text-neutral-400 italic">{h.location || 'Hub Site'}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="liquid-glass-premium p-8 space-y-8 border-l-8 border-orange-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full mb-3 inline-block">PNR Verified</span>
                                                <h3 className="text-3xl font-black text-neutral-900">{result.data.pnr}</h3>
                                                <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">{result.data.agencyName}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Trip Status</div>
                                                <div className="px-5 py-2 bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-tighter">
                                                    {result.data.trip?.status || 'SCHEDULED'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="bg-white/40 p-5 rounded-2xl border border-white/50">
                                                <div className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Route</div>
                                                <div className="text-sm font-black text-neutral-900 uppercase">
                                                    {result.data.trip?.routeId?.routeName || 'Standard Route'}
                                                </div>
                                            </div>
                                            <div className="bg-white/40 p-5 rounded-2xl border border-white/50">
                                                <div className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Departure</div>
                                                <div className="text-sm font-black text-neutral-900">
                                                    {result.data.trip?.departureTime
                                                        ? new Date(result.data.trip.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                                                        : 'TBD'}
                                                </div>
                                            </div>
                                            <div className="bg-white/40 p-5 rounded-2xl border border-white/50">
                                                <div className="text-[9px] font-bold text-neutral-400 uppercase mb-1">Passengers</div>
                                                <div className="text-sm font-black text-neutral-900">{result.data.passengerCount} Personnel</div>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-neutral-900 rounded-2xl flex items-center justify-between text-white">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-xl">🚌</div>
                                                <div>
                                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assigned Unit</div>
                                                    <div className="font-black">BUS #{result.data.trip?.busId?.busNumber || 'PENDING'}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button variant="glass" size="sm" className="text-white border-white/20" as={Link} href={`/support?pnr=${result.data.pnr}`}>
                                                    Support Vector
                                                </Button>
                                                <Button variant="primary" size="sm" as={Link} href={`/search?from=${result.data.trip?.routeId?.routeName?.split(' - ')[0] || ''}`}>
                                                    Live Map
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
