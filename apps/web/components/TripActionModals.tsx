import { useState } from 'react';
import { Button } from '@/components/Button';
import axios from 'axios';

interface TripActionModalsProps {
    trip: any;
    action: 'edit' | 'delay' | 'cancel' | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function TripActionModals({ trip, action, onClose, onSuccess }: TripActionModalsProps) {
    const [loading, setLoading] = useState(false);

    // Edit & Delay States
    const [departureTime, setDepartureTime] = useState(trip?.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : '');
    const [arrivalTime, setArrivalTime] = useState(trip?.arrivalTime ? new Date(trip.arrivalTime).toISOString().slice(0, 16) : '');
    const [basePrice, setBasePrice] = useState(trip?.basePrice || 0);

    if (!trip || !action) return null;

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await axios.patch(`/api/trips/${trip._id}`, {
                departureTime: new Date(departureTime),
                arrivalTime: new Date(arrivalTime),
                basePrice
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update trip');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (status: string) => {
        setLoading(true);
        try {
            await axios.patch(`/api/trips/${trip._id}`, { status });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Status change failed:', error);
            alert('Failed to update trip status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`glass-panel-strong w-full max-w-md p-6 relative animate-fade-in-up ${action === 'cancel' ? 'border-red-500/30' : ''}`}>
                <h3 className="text-xl font-black text-neutral-900 mb-4">
                    {action === 'edit' && 'Edit Trip Details'}
                    {action === 'delay' && 'Delay Trip'}
                    {action === 'cancel' && 'Cancel Trip'}
                </h3>

                {action === 'cancel' ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm">
                            <span className="font-bold">Warning:</span> Cancelling this trip will notify all booked passengers and process necessary refunds. This action cannot be undone.
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>Close</Button>
                            <Button variant="danger" onClick={() => handleStatusChange('CANCELLED')} isLoading={loading}>
                                Confirm Cancellation
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Departure Time</label>
                            <input
                                type="datetime-local"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Arrival Time</label>
                            <input
                                type="datetime-local"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>

                        {action === 'edit' && (
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Base Price ($)</label>
                                <input
                                    type="number"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(Number(e.target.value))}
                                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-primary-100"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end mt-6">
                            <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                            <Button variant="primary" onClick={handleUpdate} isLoading={loading}>
                                {action === 'delay' ? 'Update Schedule' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
