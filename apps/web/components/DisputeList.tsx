'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DisputeList({ agencyId }: { agencyId?: string }) {
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDisputes();
    }, [agencyId]);

    const fetchDisputes = async () => {
        try {
            const url = agencyId ? `/api/disputes?agencyId=${agencyId}` : '/api/disputes';
            const { data } = await axios.get(url);
            setDisputes(data.disputes);
        } catch (error) {
            console.error('Error fetching disputes:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-accent text-primary shadow-lg shadow-accent/20';
            case 'RESOLVED': return 'bg-success text-primary shadow-lg shadow-success/20';
            case 'REJECTED': return 'bg-red-500 text-white shadow-lg shadow-red-500/20';
            default: return 'bg-white/5 text-gray-400';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Parsing Conflict Data</span>
        </div>
    );

    return (
        <div className="glass overflow-hidden animate-in fade-in duration-700 shadow-2xl">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Dispute Ledger</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Pending and Resolved Claim Manifest</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#0F172A]/40 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-6">Transaction Hash (PNR)</th>
                            <th className="px-8 py-6">Claimant</th>
                            <th className="px-8 py-6 text-center">Incident Class</th>
                            <th className="px-8 py-6 text-center">Liability (Amt)</th>
                            <th className="px-8 py-6 text-right">Status Vector</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {disputes.map((d) => (
                            <tr key={d._id} className="text-white hover:bg-white/[0.03] transition-all group">
                                <td className="px-8 py-6">
                                    <span className="font-mono text-[11px] text-gray-400 border border-white/5 px-3 py-1.5 rounded-lg bg-black/20 tracking-tighter group-hover:border-accent/30 transition-colors">
                                        {d.bookingId?.pnr || 'N/A_PNR'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="font-black text-sm tracking-tight">{d.userId?.name}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[150px]">{d.userId?.email}</div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:border-white/20">
                                        {d.reason}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="text-lg font-black text-accent tracking-tighter">${d.amountRequested}</div>
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Locked for Verification</div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusStyle(d.status)}`}>
                                        {d.status}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {disputes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-gray-600">
                                    <div className="text-4xl mb-4 opacity-10">⚖️</div>
                                    <div className="font-black uppercase tracking-[0.3em] text-xs">Equilibrium Reached</div>
                                    <div className="text-[10px] font-medium opacity-40 mt-1 uppercase">No active claims on the ledger</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
