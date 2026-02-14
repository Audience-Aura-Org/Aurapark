'use client';

import { PageHeader } from '@/components/PageHeader';

export default function AgencyTrackingHistoryPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Tracking History"
                subtitle="Review historical routes and movement logs"
            />
            <div className="glass-panel p-8 text-center text-neutral-500 italic">
                Route history playback coming soon...
            </div>
        </div>
    );
}
