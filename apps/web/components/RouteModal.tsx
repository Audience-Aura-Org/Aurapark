'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';

interface RouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    route?: any;
    onSuccess?: () => void;
}

export function RouteModal({ isOpen, onClose, route, onSuccess }: RouteModalProps) {
    const [loading, setLoading] = useState(false);
    const [agency, setAgency] = useState<any>(null);
    // const [allStops, setAllStops] = useState<any[]>([]); // Removed unused state
    const [formData, setFormData] = useState({
        origin: '',
        destination: '', // New fields
        defaultPrice: '',
        distance: '',
        duration: '',
        selectedStops: [] as string[]
        // Removed departureTimes
    });

    useEffect(() => {
        if (isOpen) {
            fetchAgency();
            if (route) {
                // Try to split routeName to populate origin/dest
                const [origin, destination] = route.routeName.includes(' - ') ? route.routeName.split(' - ') : ['', ''];

                // Filter out origin/destination from the interim stops list
                const interimStops = route.stops?.map((s: any) => s.name || s)
                    .filter((name: string) => name !== origin && name !== destination) || [];

                setFormData({
                    origin: origin || '',
                    destination: destination || '',
                    defaultPrice: route.defaultPrice?.toString() || '',
                    distance: route.distance?.toString() || '',
                    duration: route.duration?.toString() || '',
                    selectedStops: interimStops
                });
            } else {
                setFormData({
                    origin: '',
                    destination: '',
                    defaultPrice: '',
                    distance: '',
                    duration: '',
                    selectedStops: []
                });
            }
        }
    }, [isOpen, route]);

    const fetchAgency = async () => {
        try {
            const { data: authData } = await axios.get('/api/auth/me');
            if (authData.agency) {
                setAgency(authData.agency);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agency) {
            alert('Agency information missing');
            return;
        }

        setLoading(true);
        try {
            const constructedRouteName = `${formData.origin} - ${formData.destination}`;

            const payload = {
                routeName: constructedRouteName,
                origin: formData.origin,
                destination: formData.destination,
                agencyId: agency._id,
                stops: formData.selectedStops.filter(Boolean), // Only send interim stops
                defaultPrice: formData.defaultPrice ? parseFloat(formData.defaultPrice) : undefined,
                distance: formData.distance ? parseFloat(formData.distance) : undefined,
                duration: formData.duration ? parseFloat(formData.duration) : undefined,
                departureTimes: []
            };

            if (route) {
                await axios.patch(`/api/routes/${route._id}`, payload);
            } else {
                await axios.post('/api/routes', payload);
            }

            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error: any) {
            console.error('Failed to save route:', error);
            alert(error.response?.data?.error || 'Failed to save route');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">
                            🗺️
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">{route ? 'Edit Route' : 'Create New Route'}</h2>
                            <p className="text-primary-100 text-sm font-medium">Configure route details and stops</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="glass-panel p-6">
                            <h3 className="text-lg font-black text-neutral-900 mb-4">Route Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Origin (From)"
                                    placeholder="e.g. Douala"
                                    value={formData.origin}
                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Destination (To)"
                                    placeholder="e.g. Yaounde"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Stops Management - Manual Input */}
                        <div className="glass-panel p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-neutral-900">Interim Stops</h3>
                                    <p className="text-xs text-neutral-500 font-medium">Add stops between Origin and Destination</p>
                                </div>
                                <Button type="button" variant="glass" size="sm" onClick={() => setFormData(prev => ({ ...prev, selectedStops: [...prev.selectedStops, ''] }))}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Stop
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {formData.selectedStops.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed border-neutral-200 rounded-xl">
                                        <p className="text-neutral-400 text-sm font-medium">No interim stops added</p>
                                    </div>
                                )}

                                {formData.selectedStops.map((stopName, index) => (
                                    <div key={index} className="flex gap-3 items-center animate-fade-in-up">
                                        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-black text-neutral-500 shrink-0">
                                            {index + 1}
                                        </div>
                                        <Input
                                            placeholder={`Stop Name`}
                                            value={stopName}
                                            onChange={(e) => {
                                                const newStops = [...formData.selectedStops];
                                                newStops[index] = e.target.value;
                                                setFormData({ ...formData, selectedStops: newStops });
                                            }}
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            variant="danger"
                                            size="sm"
                                            onClick={() => {
                                                const newStops = formData.selectedStops.filter((_, i) => i !== index);
                                                setFormData({ ...formData, selectedStops: newStops });
                                            }}
                                            tabIndex={-1}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-4">
                    <Button variant="glass" className="flex-1" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={handleSubmit} isLoading={loading}>
                        {route ? 'Update Route' : 'Create Route'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
