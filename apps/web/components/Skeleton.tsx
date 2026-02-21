'use client';

export function Skeleton({ className = '', animate = true }: { className?: string; animate?: boolean }) {
    return (
        <div
            className={`
                bg-neutral-200 dark:bg-neutral-800 rounded-lg
                ${animate ? 'animate-pulse' : ''}
                ${className}
            `}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-5/6' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-card p-6 space-y-4 ${className}`}>
            <Skeleton className="h-8 w-2/3" />
            <SkeletonText lines={2} className="space-y-2" />
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
            </div>
        </div>
    );
}

export function SkeletonTripCard() {
    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    );
}

export function SkeletonSeatMap({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="glass-card p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex justify-center">
                <div className="space-y-2">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div key={r} className="flex gap-2">
                            {Array.from({ length: cols }).map((_, c) => (
                                <Skeleton key={`${r}-${c}`} className="w-12 h-12 rounded-xl" />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
