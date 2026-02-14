'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';

interface TripFiltersProps {
    onFilterChange: (filters: TripFilters) => void;
    buses: any[];
    routes: any[];
}

export interface TripFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
    busId?: string;
    routeId?: string;
    search?: string;
}

export function TripFilters({ onFilterChange, buses, routes }: TripFiltersProps) {
    const [filters, setFilters] = useState<TripFilters>({});
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key: keyof TripFilters, value: any) => {
        const newFilters = { ...filters, [key]: value || undefined };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    const activeFilterCount = Object.values(filters).filter(v => v).length;

    return (
        <div className="liquid-glass-premium p-4 md:p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-neutral-900">Filters</h3>
                    {activeFilterCount > 0 && (
                        <Badge variant="info">{activeFilterCount} active</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <Button variant="glass" size="sm" onClick={clearFilters}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </Button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 ${isExpanded ? 'block' : 'hidden lg:grid'}`}>
                {/* Date Range */}
                <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">From Date</label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-900"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">To Date</label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-900"
                    />
                </div>

                {/* Bus Filter */}
                <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">Bus</label>
                    <select
                        value={filters.busId || ''}
                        onChange={(e) => handleFilterChange('busId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-900"
                    >
                        <option value="">All Buses</option>
                        {buses.map(bus => (
                            <option key={bus._id} value={bus._id}>
                                {bus.busNumber || bus.registrationNumber}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">Route</label>
                    <select
                        value={filters.routeId || ''}
                        onChange={(e) => handleFilterChange('routeId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-900"
                    >
                        <option value="">All Routes</option>
                        {routes.map(route => (
                            <option key={route._id} value={route._id}>
                                {route.routeName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Search Bar */}
            <div className={`mt-3 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by trip ID or route name..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-neutral-200 bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-semibold text-neutral-900 placeholder:text-neutral-400"
                    />
                </div>
            </div>
        </div>
    );
}

