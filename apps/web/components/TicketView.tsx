'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface TicketViewProps {
    pnr: string;
}

export default function TicketView({ pnr }: TicketViewProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, [pnr]);

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get(`/api/tickets?pnr=${pnr}`);
            setData(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center py-8">Generating tickets...</div>;
    if (!data) return <div className="text-white text-center py-8">Ticket not found</div>;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="glass p-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Your Tickets</h2>
                <p className="text-gray-400">PNR: <span className="text-white font-mono">{data.pnr}</span></p>
            </div>

            {data.passengers.map((p: any, idx: number) => (
                <div key={idx} className="glass p-6 overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                    <div className="bg-white p-2 rounded-lg">
                        <img src={p.qrCode} alt="Ticket QR" className="w-40 h-40" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white mb-1">{p.name}</h3>
                        <p className="text-secondary font-bold text-lg mb-4">Seat {p.seatNumber}</p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 uppercase text-xs">Ticket Number</p>
                                <p className="text-gray-300 font-mono">{p.ticketNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase text-xs">Status</p>
                                <p className={`${p.checkedIn ? 'text-green-400' : 'text-yellow-400'} font-bold`}>
                                    {p.checkedIn ? 'Checked In' : 'Ready'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="text-center pt-4">
                <button
                    onClick={() => window.print()}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/10"
                >
                    Print Tickets
                </button>
            </div>
        </div>
    );
}
