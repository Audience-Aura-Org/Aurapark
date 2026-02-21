'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

export default function SearchForm() {
    const router = useRouter();
    const [query, setQuery] = useState({
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0],
        passengers: 1
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(query as any);
        router.push(`/search?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="liquid-glass-premium p-4 sm:p-6 md:p-8 lg:p-10 space-y-5 sm:space-y-6 animate-fade-up">
            <div className="space-y-1.5 sm:space-y-2 text-center">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-neutral-800 dark:text-white leading-tight">Find Your Journey</h3>
                <p className="text-[11px] sm:text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400">Search for available routes across 450+ destinations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 pl-0.5">
                        <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        From
                    </label>
                    <input
                        type="text"
                        placeholder="Departure city"
                        value={query.from}
                        onChange={(e) => setQuery({ ...query, from: e.target.value })}
                        className="input-glass min-h-[48px] text-base px-4"
                        required
                    />
                </div>

                <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 pl-0.5">
                        <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        To
                    </label>
                    <input
                        type="text"
                        placeholder="Arrival city"
                        value={query.to}
                        onChange={(e) => setQuery({ ...query, to: e.target.value })}
                        className="input-glass min-h-[48px] text-base px-4"
                        required
                    />
                </div>

                <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 pl-0.5">
                        <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Date
                    </label>
                    <input
                        type="date"
                        value={query.date}
                        onChange={(e) => setQuery({ ...query, date: e.target.value })}
                        className="input-glass min-h-[48px] text-base px-4"
                        required
                    />
                </div>

                <div className="relative">
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 pl-0.5">
                        <svg className="w-4 h-4 inline mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 19H9a6 6 0 016-6v0a6 6 0 016 6v0z" />
                        </svg>
                        Passengers
                    </label>
                    <select
                        value={query.passengers}
                        onChange={(e) => setQuery({ ...query, passengers: parseInt(e.target.value) })}
                        className="input-glass min-h-[48px] text-base px-4"
                    >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <option key={num} value={num}>
                                {num} {num === 1 ? 'Passenger' : 'Passengers'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm sm:text-base md:text-lg min-h-[48px] sm:min-h-[52px]"
                rightIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                }
            >
                Search Trips
            </Button>

            {/* Quick Stats */}
            <div className="pt-3 sm:pt-4 md:pt-5 border-t border-white/30 dark:border-neutral-700/30 flex flex-wrap gap-2 sm:gap-3 md:gap-6 justify-center text-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-primary-400 dark:bg-emerald-400 animate-pulse-soft shadow-inner-glow"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-700 dark:text-neutral-300">450+ Routes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-accent-400 dark:bg-purple-400 animate-pulse-soft shadow-inner-glow-orange"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-700 dark:text-neutral-300">120k+ Travelers</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-success-400 dark:bg-emerald-500 animate-pulse-soft"></div>
                    <span className="text-[10px] sm:text-xs font-bold text-neutral-700 dark:text-neutral-300">99.9% On-Time</span>
                </div>
            </div>
        </form>
    );
}
