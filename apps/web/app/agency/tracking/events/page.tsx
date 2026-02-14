'use client';

import { PageHeader } from '@/components/PageHeader';

export default function AgencyTrackingEventsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Tracking Events"
                subtitle="Geofencing alerts, delays, and critical tracking events"
            />
            <div className="glass-panel p-8 text-center text-neutral-500 italic">
                Event monitoring coming soon...
            </div>
        </div>
    );
}
