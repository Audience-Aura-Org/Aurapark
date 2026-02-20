'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';

export default function TripManifestPage({ params }: { params: { id: string } }) {
    const [manifest, setManifest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchManifest();
    }, []);

    const fetchManifest = async () => {
        try {
            const { data } = await axios.get(`/api/driver/trips/${params.id}/manifest`);
            setManifest(data.manifest || null);
        } catch (error) {
            console.error('Failed to fetch manifest:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-mesh-green flex items-center justify-center pt-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="print:bg-white space-y-6">
            <div className="print:hidden">
                <PageHeader
                    title="Trip Manifest"
                    subtitle={manifest?.routeName || 'Passenger list and trip details'}
                    breadcrumbs={['Driver', 'Trips', 'Manifest']}
                    actions={
                        <Button variant="primary" onClick={() => window.print()}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Manifest
                        </Button>
                    }
                />
            </div>

            {/* Print header - only visible when printing */}
            <div className="hidden print:block mb-6 border-b-2 border-neutral-800 pb-4">
                <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Passenger Manifest</h1>
                <p className="text-sm text-neutral-600 mt-1">{manifest?.routeName}</p>
                <div className="flex gap-8 mt-3 text-sm">
                    <span><strong>Bus:</strong> {manifest?.busNumber}</span>
                    <span><strong>Departure:</strong> {manifest?.departureTime}</span>
                    <span><strong>Total Passengers:</strong> {manifest?.passengers?.length || 0}</span>
                </div>
            </div>

            {/* Trip Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Departure</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.departureTime || '08:00 AM'}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Bus Number</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.busNumber || 'BUS-001'}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Total Passengers</div>
                    <div className="text-lg font-black text-neutral-900">{manifest?.passengers?.length || 0}</div>
                </div>
                <div className="glass-card p-5">
                    <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Checked In</div>
                    <div className="text-lg font-black text-success-600">{manifest?.checkedIn || 0}</div>
                </div>
            </div>

            {/* Passenger Table — print-friendly */}
            <div className="glass-panel print:shadow-none print:border-0 overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between print:hidden">
                    <h2 className="text-xl font-black text-neutral-900">Passenger List</h2>
                    <Badge variant="info">{manifest?.passengers?.length || 0} Total</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100 print:bg-neutral-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">#</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Seat</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Passenger Name</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">PNR</th>
                                <th className="px-6 py-3 text-center text-xs font-black text-neutral-600 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-center text-xs font-black text-neutral-600 uppercase tracking-wider print:hidden">Check-In</th>
                                <th className="px-6 py-3 text-center text-xs font-black text-neutral-600 uppercase tracking-wider hidden print:table-cell">☑ Done</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {manifest?.passengers?.map((passenger: any, index: number) => (
                                <tr key={index} className="hover:bg-neutral-50 transition-colors print:hover:bg-white">
                                    <td className="px-6 py-4 text-sm font-bold text-neutral-500">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg print:bg-neutral-700">
                                            {passenger.displaySeatNumber || passenger.seatNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-black text-neutral-900">{passenger.name || 'Passenger Name'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded print:bg-transparent">{passenger.pnr || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant={passenger.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                                            {passenger.paymentStatus || 'PENDING'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center print:hidden">
                                        <Button
                                            variant={passenger.checkedIn ? 'success' : 'glass'}
                                            size="sm"
                                            onClick={() => alert(`Check-in for ${passenger.name} coming soon!`)}
                                        >
                                            {passenger.checkedIn ? '✓ Checked In' : 'Check In'}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center hidden print:table-cell">
                                        <div className={`w-6 h-6 mx-auto border-2 rounded ${passenger.checkedIn ? 'bg-green-500 border-green-500' : 'border-neutral-400'}`}></div>
                                    </td>
                                </tr>
                            )) || (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center text-neutral-600">
                                            No passengers for this trip
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
