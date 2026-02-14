'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button';
import { Input } from './Input';

interface Agency {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
    status: string;
    trustScore: number;
    settings: {
        pricingRules?: {
            platformFeePercentage?: number;
        };
    };
}

export default function AgencyProfile({ agencyId }: { agencyId: string }) {
    const [agency, setAgency] = useState<Agency | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        fetchAgency();
    }, [agencyId]);

    const fetchAgency = async () => {
        try {
            const { data } = await axios.get(`/api/agencies/${agencyId}`);
            setAgency(data.agency);
            setFormData(data.agency);
        } catch (error) {
            console.error('Error fetching agency:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.patch(`/api/agencies/${agencyId}`, formData);
            setAgency(formData);
            setEditing(false);
            alert('Agency updated successfully!');
        } catch (error) {
            console.error('Error updating agency:', error);
            alert('Failed to update agency');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await axios.patch(`/api/agencies/${agencyId}`, { status: newStatus });
            fetchAgency();
            alert(`Agency status changed to ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return <div className="text-white text-center py-8">Loading...</div>;
    }

    if (!agency) {
        return <div className="text-white text-center py-8">Agency not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="glass p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{agency.name}</h2>
                        <p className="text-gray-400">{agency.email}</p>
                    </div>
                    <div className="flex gap-2">
                        {!editing && (
                            <Button variant="secondary" onClick={() => setEditing(true)}>
                                Edit
                            </Button>
                        )}
                        {editing && (
                            <>
                                <Button variant="outline" onClick={() => setEditing(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdate}>
                                    Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Phone</label>
                        {editing ? (
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                label=""
                                className="bg-white"
                            />
                        ) : (
                            <p className="text-white">{agency.phone}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Address</label>
                        {editing ? (
                            <Input
                                value={formData.address || ''}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                label=""
                                className="bg-white"
                            />
                        ) : (
                            <p className="text-white">{agency.address || 'N/A'}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Trust Score</label>
                        <p className="text-white text-2xl font-bold">{agency.trustScore}/100</p>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm mb-2">Platform Fee</label>
                        <p className="text-white">{agency.settings?.pricingRules?.platformFeePercentage || 10}%</p>
                    </div>
                </div>
            </div>

            <div className="glass p-6">
                <h3 className="text-xl font-bold text-white mb-4">Status Management</h3>
                <div className="flex gap-3">
                    <Button
                        variant={agency.status === 'ACTIVE' ? 'primary' : 'secondary'}
                        onClick={() => handleStatusChange('ACTIVE')}
                    >
                        Activate
                    </Button>
                    <Button
                        variant={agency.status === 'SUSPENDED' ? 'primary' : 'secondary'}
                        onClick={() => handleStatusChange('SUSPENDED')}
                    >
                        Suspend
                    </Button>
                    <Button
                        variant={agency.status === 'REJECTED' ? 'primary' : 'secondary'}
                        onClick={() => handleStatusChange('REJECTED')}
                    >
                        Reject
                    </Button>
                </div>
            </div>

            <AgencyFleet agencyId={agencyId} />
        </div>
    );
}

function AgencyFleet({ agencyId }: { agencyId: string }) {
    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const { data } = await axios.get(`/api/buses?agencyId=${agencyId}`);
                setBuses(data.buses || []);
            } catch (error) {
                console.error('Error fetching buses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBuses();
    }, [agencyId]);

    if (loading) return <div className="text-white text-center py-8 opacity-50">Loading fleet...</div>;

    return (
        <div className="glass p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>Fleet Overview</span>
                <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">{buses.length} Vehicles</span>
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10">
                        <tr>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-4">Bus Details</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Default Route</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Capacity</th>
                            <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right pr-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {buses.map((bus) => (
                            <tr key={bus._id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-lg">
                                            🚌
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{bus.busNumber}</div>
                                            <div className="text-xs text-gray-400">{bus.model || 'Standard Bus'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4">
                                    {bus.origin || bus.destination ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-200">
                                            <span className="font-semibold">{bus.origin || 'Depot'}</span>
                                            <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            <span className="font-semibold">{bus.destination || 'Unknown'}</span>
                                            {bus.departureTime && (
                                                <span className="text-xs text-gray-500 ml-1">({bus.departureTime})</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">No route assigned</span>
                                    )}
                                </td>
                                <td className="py-4 text-gray-300 font-medium">
                                    {bus.capacity} Seats
                                </td>
                                <td className="py-4 text-right pr-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${bus.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                        }`}>
                                        {bus.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {buses.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                                    No buses registered for this agency.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
