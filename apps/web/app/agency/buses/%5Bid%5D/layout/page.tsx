'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function SeatLayoutEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: busId } = use(params);
    const [bus, setBus] = useState<any>(null);
    const [rows, setRows] = useState(10);
    const [seatsPerRow, setSeatsPerRow] = useState(4);
    const [layout, setLayout] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<'2-2' | '2-3' | 'custom'>('custom');

    useEffect(() => {
        if (busId) {
            fetchBus(busId);
        }
    }, [busId]);

    const fetchBus = async (id: string) => {
        try {
            const { data } = await axios.get(`/api/buses/${id}`);
            setBus(data.bus);
            if (data.bus.seatMap) {
                setRows(data.bus.seatMap.rows || 10);
                setSeatsPerRow(data.bus.seatMap.columns || 4);
            }
        } catch (error) {
            console.error('Failed to fetch bus:', error);
        }
    };

    // Auto-regenerate layout when dimensions change
    useEffect(() => {
        if (rows > 0 && seatsPerRow > 0 && seatsPerRow <= 6) {
            generateLayoutFromDimensions();
        }
    }, [rows, seatsPerRow]);

    const generateLayoutFromDimensions = () => {
        const seats: string[] = [];
        let seatCounter = 1;
        for (let row = 1; row <= rows; row++) {
            for (let seat = 0; seat < seatsPerRow; seat++) {
                seats.push(`${seatCounter}`);
                seatCounter++;
            }
        }
        setLayout(seats);
    };

    const applyTemplate = (type: '2-2' | '2-3') => {
        let newRows = 10;
        let newSeatsPerRow = 4;

        if (type === '2-3') {
            newRows = 14;
            newSeatsPerRow = 5;
        } else if (type === '2-2') {
            newRows = 18;
            newSeatsPerRow = 4;
        }

        setRows(newRows);
        setSeatsPerRow(newSeatsPerRow);
        setActiveTemplate(type);

        const seats: string[] = [];
        let seatCounter = 1;
        for (let row = 1; row <= newRows; row++) {
            for (let seat = 0; seat < newSeatsPerRow; seat++) {
                seats.push(`${seatCounter}`);
                seatCounter++;
            }
        }
        setLayout(seats);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Construct the real seatMap structure for the database
            const seatMap = {
                rows: rows,
                columns: seatsPerRow,
                seats: layout.map((seatNumber, index) => ({
                    seatNumber: seatNumber,
                    row: Math.floor(index / seatsPerRow) + 1,
                    column: (index % seatsPerRow) + 1,
                    type: seatNumber ? 'STANDARD' : 'EMPTY',
                    isAvailable: !!seatNumber
                }))
            };

            const bookableCapacity = layout.filter(s => !!s).length;

            await axios.patch(`/api/buses/${busId}`, {
                seatMap,
                capacity: bookableCapacity,
            });
            alert('Seat layout updated successfully! Every seat is now sequentially numbered.');
            router.push('/agency/buses');
        } catch (error) {
            console.error(error);
            alert('Failed to save seat layout');
        } finally {
            setLoading(false);
        }
    };

    if (!bus) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title={`Configure Bus ${bus.busNumber}`}
                subtitle="Design the seating arrangement for this vehicle"
                breadcrumbs={['Dashboard', 'Fleet', bus.busNumber, 'Layout']}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1 space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-black text-neutral-900 mb-4">Layout Templates</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => applyTemplate('2-3')}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${activeTemplate === '2-3'
                                    ? 'bg-primary-50 border-primary-500 shadow-md ring-2 ring-primary-200'
                                    : 'bg-white border-transparent hover:border-primary-200 hover:bg-neutral-50'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">70</div>
                                <div className="text-left">
                                    <div className="font-bold text-neutral-900">High Capacity (3+2)</div>
                                    <div className="text-xs text-neutral-500">Triple seats on the driver side</div>
                                </div>
                            </button>

                            <button
                                onClick={() => applyTemplate('2-2')}
                                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${activeTemplate === '2-2'
                                    ? 'bg-primary-50 border-primary-500 shadow-md ring-2 ring-primary-200'
                                    : 'bg-white border-transparent hover:border-primary-200 hover:bg-neutral-50'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">70</div>
                                <div className="text-left">
                                    <div className="font-bold text-neutral-900">Standard Luxury (2+2)</div>
                                    <div className="text-xs text-neutral-500">Balanced aisle configuration</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-neutral-900">Custom Dimensions</h3>
                            <Badge variant={activeTemplate === 'custom' ? 'warning' : 'info'}>
                                {activeTemplate === 'custom' ? 'Custom' : 'Template'}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase">Rows</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={rows}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1;
                                        setRows(val);
                                        setActiveTemplate('custom');
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-400 outline-none font-bold text-center transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 mb-2 uppercase">Seats/Row</label>
                                <input
                                    type="number"
                                    min={2}
                                    max={6}
                                    value={seatsPerRow}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 2;
                                        setSeatsPerRow(val);
                                        setActiveTemplate('custom');
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-400 outline-none font-bold text-center transition-all"
                                />
                            </div>
                        </div>

                        {/* Live Seat Count */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">Total Capacity</div>
                                    <div className="text-2xl font-black text-primary-700">{layout.length} Seats</div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white text-xl shadow-lg">
                                    💺
                                </div>
                            </div>
                            <div className="text-xs text-primary-600 font-semibold mt-2">
                                {rows} rows × {seatsPerRow} seats = {rows * seatsPerRow} total
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="glass" className="flex-1" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button variant="primary" className="flex-1" onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </div>

                <div className="xl:col-span-2 flex justify-center">
                    <div className="relative bg-neutral-50 border-4 border-neutral-300 rounded-[3rem] p-8 pb-16 shadow-2xl max-w-sm w-full">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-blue-100/50 to-transparent rounded-b-[2rem] border-b border-white/50"></div>
                        <div className="absolute top-8 right-8 w-12 h-12 border-4 border-neutral-400 rounded-full opacity-30">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-400 -translate-y-1/2"></div>
                        </div>

                        <div className="mt-20 space-y-3">
                            {/* Driver Seat Area */}
                            <div className="flex justify-start px-2 mb-8">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-neutral-900 border border-neutral-800 shadow-lg flex flex-col items-center justify-center relative">
                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter">Driver</span>
                                    <div className="w-6 h-6 border-2 border-white/20 rounded-full mt-0.5 flex items-center justify-center">
                                        <div className="w-1 h-3 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            {Array.from({ length: rows }).map((_, rowIndex) => {
                                return (
                                    <div key={rowIndex} className="flex justify-between items-center px-2">
                                        {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                                            const seatNumber = (rowIndex * seatsPerRow) + seatIndex + 1;
                                            const seatLabel = `${seatNumber}`;

                                            // User Request: Triple seat (3) should be on the left
                                            // If 5 seats (3+2), aisle is after the 3rd seat (index 2)
                                            // If 4 seats (2+2), aisle is after the 2nd seat (index 1)
                                            const aislePosition = seatsPerRow === 5 ? 2 : 1;
                                            const showAisle = (seatIndex === aislePosition);

                                            return (
                                                <div key={seatIndex} className={`flex ${showAisle ? 'mr-auto pr-8' : ''}`}>
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white border border-neutral-200 shadow-sm flex flex-col items-center justify-center relative hover:border-primary-400 transition-colors">
                                                        <span className="text-[10px] md:text-sm font-black text-neutral-900">{seatLabel}</span>
                                                        <div className="absolute bottom-1.5 w-8 h-1 rounded-full bg-neutral-900 opacity-20"></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                            Back of Bus
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
