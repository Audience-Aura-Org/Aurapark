'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Agency {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    trustScore: number;
    createdAt: string;
}

export default function AgencyList() {
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchAgencies();
    }, [filter]);

    const fetchAgencies = async () => {
        try {
            const url = filter ? `/api/agencies?status=${filter}` : '/api/agencies';
            const { data } = await axios.get(url);
            setAgencies(data.agencies);
        } catch (error) {
            console.error('Error fetching agencies:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-success text-primary shadow-lg shadow-success/20';
            case 'PENDING': return 'bg-accent text-primary shadow-lg shadow-accent/20';
            case 'SUSPENDED': return 'bg-red-500 text-white shadow-lg shadow-red-500/20';
            case 'REJECTED': return 'bg-gray-700 text-gray-400';
            default: return 'bg-white/5 text-gray-400';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 gap-4">
            <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Indexing Entities</span>
        </div>
    );

    return (
        <div className="glass overflow-hidden animate-in fade-in duration-700 shadow-2xl">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.02]">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Fleet Partners</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Verified Transport Agencies</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="h-12 bg-white/5 border border-white/10 rounded-2xl px-5 text-token text-[10px] font-black uppercase tracking-[0.1em] focus:outline-none focus:border-accent/40 text-gray-400"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                    <Link
                        href="/admin/agencies/new"
                        className="h-12 px-6 bg-accent hover:bg-accent-hover text-primary rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-accent/10 transition-all"
                    >
                        + Register Agency
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#0F172A]/40 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                        <tr>
                            <th className="px-8 py-6">Partner Identity</th>
                            <th className="px-8 py-6 text-center">Status</th>
                            <th className="px-8 py-6 text-center">Trust Intensity</th>
                            <th className="px-8 py-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {agencies.map((agency) => (
                            <tr key={agency._id} className="text-white hover:bg-white/[0.03] transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                            🏢
                                        </div>
                                        <div>
                                            <div className="text-lg font-black tracking-tight group-hover:translate-x-1 transition-transform">{agency.name}</div>
                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                                <span>{agency.email}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                <span>{agency.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusStyle(agency.status)}`}>
                                        {agency.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                style={{ width: `${agency.trustScore}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-accent tracking-widest">{agency.trustScore} INDEX</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Link
                                        href={`/admin/agencies/${agency._id}`}
                                        className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[9px] uppercase tracking-widest hover:bg-white/10 transition-all ml-auto w-fit"
                                    >
                                        Inspect Proxy →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {agencies.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-20 text-center text-gray-600">
                                    <div className="text-4xl mb-4 opacity-10">📡</div>
                                    <div className="font-black uppercase tracking-[0.3em] text-xs">No Agencies Registered</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
