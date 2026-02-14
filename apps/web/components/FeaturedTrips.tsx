'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './Button';

export default function FeaturedTrips() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const { data } = await axios.get('/api/trips/search');
            setTrips(data.trips.slice(0, 6));
        } catch (error) {
            console.error('Failed to fetch featured trips:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    if (trips.length === 0) return null;

    // Generic stock images for better fallback
    const fallbackImage = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop';

    const getDestinationImage = (destinationName: string) => {
        const lower = destinationName.toLowerCase();
        if (lower.includes('nairobi')) return 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=800&h=600&fit=crop';
        if (lower.includes('lagos')) return 'https://images.unsplash.com/photo-1619546952812-1b7c8e0b2c8e?w=800&h=600&fit=crop';
        if (lower.includes('accra')) return 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=800&h=600&fit=crop';
        if (lower.includes('kampala')) return 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop';
        if (lower.includes('dar')) return 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&h=600&fit=crop';
        if (lower.includes('kigali')) return 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&h=600&fit=crop';
        return fallbackImage;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip, index) => {
                const routeName = trip.routeId?.routeName || 'Direct Route';
                const destinationName = routeName.split(' - ').pop() || 'Destination';
                const seatsLeft = trip.availableSeats?.length || 0;
                const amenities = trip.busId?.amenities || [];

                return (
                    <div
                        key={trip._id}
                        className="group relative overflow-hidden rounded-3xl h-80 animate-fade-up hover-lift cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => window.location.href = `/book/${trip._id}`}
                    >
                        {/* Background Image */}
                        <img
                            src={getDestinationImage(destinationName)}
                            alt={destinationName}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Frosted Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-white/20 backdrop-blur-sm group-hover:backdrop-blur-md transition-all duration-300"></div>

                        {/* Content */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            {/* Top Section */}
                            <div className="flex justify-between items-start">
                                <div className="glass-panel px-3 py-1.5 text-center min-w-[100px]">
                                    <span className="text-[10px] font-medium text-neutral-500 block leading-none mb-1">Carrier</span>
                                    <span className="text-xs font-semibold text-neutral-900">
                                        {trip.agencyId?.name || 'Partner'}
                                    </span>
                                </div>
                                {seatsLeft <= 5 && seatsLeft > 0 && (
                                    <div className="bg-accent-400 text-white px-3 py-1.5 rounded-xl shadow-inner-glow-orange animate-pop">
                                        <span className="text-xs font-semibold">
                                            Only {seatsLeft} left!
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Section */}
                            <div className="space-y-4">
                                {/* Destination */}
                                <div>
                                    <h3 className="text-3xl font-black text-neutral-900 mb-1">
                                        {destinationName}
                                    </h3>
                                    <p className="text-sm font-medium text-neutral-600 leading-none">
                                        {routeName}
                                    </p>
                                </div>

                                {/* Details */}
                                <div className="glass-panel-strong p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] font-medium text-neutral-500 mb-1">Departure</div>
                                            <div className="text-2xl font-black text-neutral-900">
                                                {new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-medium text-neutral-500 mb-1">Price</div>
                                            <div className="text-2xl font-black text-gradient-green">
                                                XAF {trip.basePrice}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 border-t border-white/30">
                                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-700">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(trip.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="h-3 w-px bg-neutral-300"></div>
                                        {amenities.slice(0, 2).map((a: string) => (
                                            <div key={a} className="flex items-center gap-1 text-[10px] font-medium text-neutral-700">
                                                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                {a}
                                            </div>
                                        ))}
                                        {amenities.length > 2 && (
                                            <div className="text-[10px] font-black text-neutral-400">+{amenities.length - 2}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
