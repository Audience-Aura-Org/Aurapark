'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from './Button';

interface ReviewFormProps {
    tripId: string;
    agencyId: string;
    userId: string;
    onSuccess?: () => void;
}

export default function ReviewForm({ tripId, agencyId, userId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating intensity.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post('/api/reviews', {
                userId,
                tripId,
                agencyId,
                rating,
                comment
            });
            if (onSuccess) onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Intelligence upload failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass p-12 relative overflow-hidden group animate-in zoom-in-95 duration-700">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-9xl font-black rotate-12">RATE</div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-[80px]"></div>

            <header className="mb-10 relative z-10">
                <div className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-2">Protocol: Feedback</div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Transmit Experience</h3>
                <p className="text-gray-500 font-medium text-sm mt-1">Upload your trip quality metrics to the network.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                <div className="space-y-4">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Rating Intensity</label>
                    <div className="flex gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${(hover || rating) >= star
                                    ? 'bg-accent text-primary scale-110 shadow-lg shadow-accent/20'
                                    : 'bg-white/5 text-gray-700 border border-white/5 hover:border-white/20'
                                    }`}
                            >
                                {star}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Detail Log (Optional)</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Log detailed performance metrics here..."
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:outline-none focus:border-accent/40 transition-all resize-none"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in">
                        Error: {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-accent hover:bg-accent-hover text-primary font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-accent/10"
                >
                    {loading ? 'UPLOADING METRICS...' : 'SUBMIT INTEL'}
                </Button>
            </form>
        </div>
    );
}
