'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManifestTable({ tripId }: { tripId: string }) {
    const [manifest, setManifest] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchManifest();
    }, [tripId]);

    const fetchManifest = async () => {
        try {
            const { data } = await axios.get(`/api/agency/trips/${tripId}/manifest`);
            setManifest(data.manifest);
        } catch (error) {
            console.error('Error fetching manifest:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Querying Intelligence</span>
        </div>
    );

    return (
        <div className="glass overflow-hidden animate-in fade-in duration-700">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Passenger Manifest</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Boarding Entries</p>
                </div>
                <div className="px-4 py-2 rounded-xl glass-dark border border-white/5 text-xs font-black text-accent uppercase tracking-widest">
                    {manifest.length} SEATS FILLED
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#0F172A]/40 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-6">Coordinates</th>
                            <th className="px-8 py-6">Passenger Integrity</th>
                            <th className="px-8 py-6 text-center">Security Hash (PNR)</th>
                            <th className="px-8 py-6 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {manifest.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true })).map((p, idx) => (
                            <tr key={idx} className="text-white hover:bg-white/[0.03] transition-all group">
                                <td className="px-8 py-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-accent text-sm group-hover:bg-accent group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                                        {p.seatNumber}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="font-black text-lg tracking-tight group-hover:translate-x-1 transition-transform">{p.name}</div>
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex gap-3 mt-1">
                                        <span>{p.gender}</span>
                                        <span className="opacity-20">|</span>
                                        <span>{p.age} YEARS</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="font-mono text-[11px] text-gray-400 border border-white/5 px-3 py-1.5 rounded-lg bg-black/20 tracking-tighter shadow-inner">
                                        {p.pnr}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${p.checkedIn
                                            ? 'bg-success text-primary shadow-lg shadow-success/20'
                                            : 'bg-white/5 text-gray-400 border border-white/5'
                                        }`}>
                                        {p.checkedIn && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
                                        {p.checkedIn ? 'CLEARED' : 'PENDING'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {manifest.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center text-gray-600">
                                    <div className="text-4xl mb-4 opacity-20">📡</div>
                                    <div className="font-black uppercase tracking-[0.3em] text-xs">No Signal Detected</div>
                                    <div className="text-[10px] font-medium opacity-40 mt-1 uppercase">Awaiting passenger reservations</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
                <button className="text-[10px] font-black text-gray-500 hover:text-accent uppercase tracking-widest transition-colors flex items-center gap-2">
                    <span className="w-4 h-4 border border-current rounded p-0.5 flex items-center justify-center">↓</span>
                    Download Hard-copy Manifest
                </button>
            </div>
        </div>
    );
}
