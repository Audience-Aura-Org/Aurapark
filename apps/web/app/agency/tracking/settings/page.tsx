'use client';

import { PageHeader } from '@/components/PageHeader';

export default function AgencyTrackingSettingsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Tracking Settings"
                subtitle="Configure GPS refresh rates and tracking parameters"
            />
            <div className="glass-panel p-8 text-center text-neutral-500 italic">
                Configuration tools coming soon...
            </div>
        </div>
    );
}
