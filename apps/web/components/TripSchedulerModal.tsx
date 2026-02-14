'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';

interface TripSchedulerModalProps {
    isOpen: boolean;
    onClose: () => void;
    bus: any;
    onSuccess: () => void;
}

export function TripSchedulerModal({ isOpen, onClose, bus, onSuccess }: TripSchedulerModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState<any[]>([]);
    const [allStops, setAllStops] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [selectedStops, setSelectedStops] = useState<any[]>([]);
    const [newStopSearch, setNewStopSearch] = useState('');
    const [formData, setFormData] = useState({
        departureDate: '',
        departureTime: '09:00',
        arrivalDate: '',
        arrivalTime: '',
        basePrice: '',
        routeId: '',
        autoCreateRoute: false,
        origin: '',
        destination: ''
    });

    useEffect(() => {
        if (isOpen && bus) {
            fetchInitialData();
            // Reset form when modal opens
            setFormData({
                departureDate: '',
                departureTime: '09:00',
                arrivalDate: '',
                arrivalTime: '',
                basePrice: '',
                routeId: '',
                autoCreateRoute: false,
                origin: '',
                destination: ''
            });
            setSelectedRoute(null);
            setSelectedStops([]);
            setStep(1);
        }
    }, [isOpen, bus]);

    const fetchInitialData = async () => {
        try {
            const [routesRes, stopsRes] = await Promise.all([
                axios.get(`/api/routes?agencyId=${bus.agencyId}`),
                axios.get(`/api/stops?agencyId=${bus.agencyId}`)
            ]);
            setRoutes(routesRes.data.routes || []);
            setAllStops(stopsRes.data.stops || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        // Map the route stops (strings/objects) to common objects for the trip
        const stops = (route.stops || []).map((s: any) => ({
            stopId: s._id || s,
            name: s.name || 'Unnamed Stop',
            isPermanent: true
        }));
        setSelectedStops(stops);
        setFormData(prev => ({
            ...prev,
            routeId: route._id,
            basePrice: route.defaultPrice?.toString() || '',
            autoCreateRoute: false
        }));
    };

    const addStop = (stop: any) => {
        if (selectedStops.some(s => s.stopId === stop._id)) return;
        setSelectedStops(prev => [...prev, {
            stopId: stop._id,
            name: stop.name,
            isPermanent: false
        }]);
        setNewStopSearch('');
    };

    const removeStop = (stopId: string) => {
        setSelectedStops(prev => prev.filter(s => s.stopId !== stopId));
    };

    const handleAutoCreate = () => {
        setSelectedRoute(null);
        setSelectedStops([]);
        setFormData(prev => ({
            ...prev,
            routeId: '',
            basePrice: '',
            autoCreateRoute: true,
            origin: '',
            destination: ''
        }));
    };

    const handleSchedule = async () => {
        if (!formData.departureDate || !formData.departureTime) {
            alert('Please select departure date and time');
            return;
        }

        if (!formData.basePrice) {
            alert('Please enter a ticket price');
            return;
        }

        setLoading(true);
        try {
            const departureDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
            if (isNaN(departureDateTime.getTime())) {
                throw new Error('Invalid departure date or time');
            }

            // Logic for arrival time
            let arrivalDateTime;
            if (formData.arrivalTime) {
                // If arrival date is not set, assume same day as departure, unless time is earlier (then next day)
                const arrDate = formData.arrivalDate || formData.departureDate;
                arrivalDateTime = new Date(`${arrDate}T${formData.arrivalTime}`);

                // Smart rollover: if arrival time is before departure time and dates are same, assume next day
                if (arrivalDateTime < departureDateTime && arrDate === formData.departureDate) {
                    arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
                }
            } else {
                // Defaulting to 4 hours as backup
                arrivalDateTime = new Date(departureDateTime.getTime() + 4 * 60 * 60 * 1000);
            }

            const payload: any = {
                busId: bus._id,
                agencyId: bus.agencyId,
                departureTime: departureDateTime.toISOString(),
                arrivalTime: arrivalDateTime.toISOString(),
                basePrice: parseFloat(formData.basePrice),
                stops: selectedStops.map(s => ({
                    stopId: s.stopId,
                    name: s.name
                }))
            };

            if (formData.routeId) {
                payload.routeId = formData.routeId;
            } else {
                payload.autoCreateRoute = formData.autoCreateRoute;
                payload.origin = formData.origin;
                payload.destination = formData.destination;
            }

            await axios.post('/api/trips', payload);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Scheduling failed:', error);
            alert(error.response?.data?.error || error.message || 'Failed to schedule trip');
        } finally {
            setLoading(false);
        }
    };

    const filteredStops = allStops.filter(s =>
        s.name.toLowerCase().includes(newStopSearch.toLowerCase()) &&
        !selectedStops.some(ss => ss.stopId === s._id)
    );

    if (!isOpen || !bus) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-up">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                            🪄
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Schedule Trip</h2>
                            <p className="text-primary-100 text-xs font-medium">Configure route and stops for {bus.busNumber}</p>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-white' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {/* Step 1: Main Route Selection */}
                    {step === 1 && (
                        <div className="space-y-6 animate-slide-in">
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 mb-4">Select Main Route</h3>

                                {/* Manual Route Creation */}
                                <div className={`p-6 rounded-2xl border-2 transition-all mb-6 ${formData.autoCreateRoute
                                    ? 'bg-primary-50 border-primary-500 ring-4 ring-primary-100'
                                    : 'bg-white border-neutral-200 hover:border-primary-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="font-black text-neutral-900">Custom / One-off Route</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAutoCreate}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${formData.autoCreateRoute
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                                }`}
                                        >
                                            {formData.autoCreateRoute ? 'Selected' : 'Use Custom'}
                                        </button>
                                    </div>

                                    {formData.autoCreateRoute && (
                                        <div className="grid grid-cols-2 gap-4 animate-scale-in">
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
                                    )}
                                </div>

                                {/* Existing routes */}
                                {routes.length > 0 && (
                                    <>
                                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Or select existing route</div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {routes.map((route) => (
                                                <button
                                                    key={route._id}
                                                    type="button"
                                                    onClick={() => handleRouteSelect(route)}
                                                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedRoute?._id === route._id
                                                        ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-200'
                                                        : 'bg-white border-neutral-200 hover:border-primary-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-neutral-900">{route.routeName}</div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="info" size="sm">{route.stops?.length || 0} stops</Badge>
                                                                {route.defaultPrice && (
                                                                    <Badge variant="success" size="sm">${route.defaultPrice}</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {selectedRoute?._id === route._id && (
                                                            <Badge variant="success">Selected</Badge>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full py-4 text-base"
                                onClick={() => setStep(2)}
                                disabled={!formData.autoCreateRoute && !selectedRoute}
                            >
                                Continue to Stops & Date
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Date & Ad-hoc Stops */}
                    {step === 2 && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="glass-panel p-4 space-y-4 bg-neutral-50/50">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Departure Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Departure Date"
                                        type="date"
                                        value={formData.departureDate}
                                        onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Departure Time"
                                        type="time"
                                        value={formData.departureTime}
                                        onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Arrival Date"
                                        type="date"
                                        value={formData.arrivalDate || formData.departureDate}
                                        onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                                    />
                                    <Input
                                        label="Arrival Time"
                                        type="time"
                                        value={formData.arrivalTime}
                                        onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Street Stops</h3>
                                    <Badge variant="info">{selectedStops.length} Total</Badge>
                                </div>

                                {/* Current Stops List */}
                                <div className="space-y-2">
                                    {selectedStops.map((stop, index) => (
                                        <div key={stop.stopId} className="flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-black text-primary-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-neutral-900">{stop.name}</div>
                                                <div className="text-[10px] text-neutral-500 font-semibold uppercase">
                                                    {stop.isPermanent ? 'Route Stop' : 'Trip Specific Stop'}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeStop(stop.stopId)}
                                                className="p-1.5 text-neutral-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    {selectedStops.length === 0 && (
                                        <div className="text-center py-6 border-2 border-dashed border-neutral-100 rounded-2xl text-neutral-400 text-sm">
                                            No stops added yet
                                        </div>
                                    )}
                                </div>

                                {/* Add Stop Search */}
                                <div className="relative pt-2">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-neutral-300 rounded-xl text-sm font-bold text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all shadow-soft"
                                            placeholder="Search and add a street stop (e.g. Mile 4)..."
                                            value={newStopSearch}
                                            onChange={(e) => setNewStopSearch(e.target.value)}
                                        />
                                    </div>

                                    {newStopSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto p-1">
                                            {filteredStops.length > 0 ? (
                                                <>
                                                    {filteredStops.map(stop => (
                                                        <button
                                                            key={stop._id}
                                                            onClick={() => addStop(stop)}
                                                            className="w-full text-left p-3 hover:bg-primary-50 rounded-lg text-sm font-bold text-neutral-700 flex items-center justify-between group"
                                                        >
                                                            {stop.name}
                                                            <svg className="w-4 h-4 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                    <div className="h-px bg-neutral-100 my-1"></div>
                                                </>
                                            ) : null}

                                            <button
                                                onClick={() => {
                                                    const newStop = { stopId: `manual-${Date.now()}`, name: newStopSearch, isPermanent: false };
                                                    setSelectedStops(prev => [...prev, newStop]);
                                                    setNewStopSearch('');
                                                }}
                                                className="w-full text-left p-3 hover:bg-primary-50 rounded-lg text-sm font-bold text-primary-600 flex items-center gap-2 group"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                                <span>Add "{newStopSearch}" as Manual Stop</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="glass" onClick={() => setStep(1)} className="flex-1">Back</Button>
                                <Button
                                    variant="primary"
                                    className="flex-[2]"
                                    onClick={() => setStep(3)}
                                    disabled={!formData.departureDate || !formData.departureTime}
                                >
                                    Continue to Pricing
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Pricing & Confirm */}
                    {step === 3 && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="glass-panel p-6 bg-primary-50/50 border-2 border-primary-100">
                                <label className="block text-xs font-black text-primary-600 mb-4 uppercase tracking-widest">
                                    Base Ticket Price ($)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary-300">$</span>
                                    <input
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-4 rounded-2xl text-3xl font-black text-primary-600 focus:ring-4 focus:ring-primary-100 outline-none border-2 border-primary-400 bg-white transition-all shadow-soft"
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        value={formData.basePrice}
                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/30 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500 font-bold uppercase">Main Route</span>
                                    <span className="text-neutral-900 font-black">
                                        {selectedRoute ? selectedRoute.routeName : `Custom Route`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500 font-bold uppercase">Departure</span>
                                    <span className="text-neutral-900 font-black">
                                        {formData.departureDate} @ {formData.departureTime}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-neutral-500 font-bold uppercase">Street Stops</span>
                                    <span className="text-neutral-900 font-black">{selectedStops.length} stops configured</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="glass" onClick={() => setStep(2)} className="flex-1">Back</Button>
                                <Button
                                    variant="primary"
                                    className="flex-[2] py-4 shadow-xl shadow-primary-200"
                                    onClick={handleSchedule}
                                    isLoading={loading}
                                    disabled={!formData.basePrice || loading}
                                >
                                    Launch Trip
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
