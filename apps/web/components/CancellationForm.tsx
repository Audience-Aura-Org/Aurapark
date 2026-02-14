'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from './Button';

interface CancellationFormProps {
    bookingId: string;
    pnr: string;
    onSuccess: () => void;
}

export default function CancellationForm({ bookingId, pnr, onSuccess }: CancellationFormProps) {
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState('');

    const handleCancel = async () => {
        if (!confirm(`Are you sure you want to cancel booking ${pnr}?`)) return;

        setLoading(true);
        try {
            await axios.post('/api/bookings/cancel', { bookingId, reason });
            alert('Booking cancelled successfully. Refund initiated.');
            onSuccess();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to cancel booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-6 space-y-4 border-red-500/30 bg-red-500/5">
            <h3 className="text-xl font-bold text-red-400">Cancel Booking</h3>
            <p className="text-sm text-gray-400">
                Cancelling this booking will release your seats and initiate a refund according to the agency policy.
            </p>

            <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">Reason for cancellation</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-500/50"
                    placeholder="Optional: Why are you cancelling?"
                    rows={3}
                />
            </div>

            <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
            >
                {loading ? 'Processing...' : 'Confirm Cancellation'}
            </Button>
        </div>
    );
}
