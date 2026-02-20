'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/Input';
import { Badge } from '@/components/Badge';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({
        platformFeePercentage: 10,
        bookingCancellationHours: 24,
        refundProcessingDays: 7,
        smsNotifications: true,
        emailNotifications: true,
        autoApproveAgencies: false,
        maintenanceMode: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/admin/settings');
            if (data.settings) setSettings(data.settings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch('/api/admin/settings', settings);
            setToast({ type: 'success', msg: 'Platform settings saved successfully!' });
        } catch (error) {
            console.error('Failed to save settings:', error);
            setToast({ type: 'error', msg: 'Error saving settings. Please try again.' });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 4000);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl">
            <PageHeader
                title="Platform Configuration"
                subtitle="Manage core business rules, fees, and system-wide automation"
                breadcrumbs={['Admin', 'Settings']}
                actions={
                    <div className="flex items-center gap-3">
                        {toast && (
                            <span className={`text-sm font-bold flex items-center gap-1 ${toast.type === 'success' ? 'text-success-600' : 'text-danger-600'}`}>
                                {toast.type === 'success'
                                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                                {toast.msg}
                            </span>
                        )}
                        <Button variant="primary" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Rules */}
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <span className="text-primary-500">💰</span> Financial Rules
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Platform Fee (%)</label>
                            <input
                                type="number"
                                className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-black focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                value={settings.platformFeePercentage}
                                onChange={(e) => setSettings({ ...settings, platformFeePercentage: Number(e.target.value) })}
                            />
                            <p className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Percentage taken from each ticket sale</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Refund Processing Days</label>
                            <input
                                type="number"
                                className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-black focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                value={settings.refundProcessingDays}
                                onChange={(e) => setSettings({ ...settings, refundProcessingDays: Number(e.target.value) })}
                            />
                            <p className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Target turnaround for customer refunds</p>
                        </div>
                    </div>
                </div>

                {/* Booking Policies */}
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <span className="text-primary-500">📅</span> Booking Policies
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Free Cancellation Window (Hours)</label>
                            <input
                                type="number"
                                className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-black focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                value={settings.bookingCancellationHours}
                                onChange={(e) => setSettings({ ...settings, bookingCancellationHours: Number(e.target.value) })}
                            />
                            <p className="text-[10px] font-bold text-neutral-500 uppercase ml-1">Minimum time before departure for 100% refund</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50">
                            <div>
                                <div className="text-sm font-bold text-neutral-900">Auto-Approve Agencies</div>
                                <div className="text-[10px] font-bold text-neutral-500 uppercase">Skip manual review for new registrations</div>
                            </div>
                            <Toggle
                                checked={settings.autoApproveAgencies}
                                onChange={(val) => setSettings({ ...settings, autoApproveAgencies: val })}
                            />
                        </div>
                    </div>
                </div>

                {/* System Controls */}
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 flex items-center gap-2">
                        <span className="text-primary-500">⚡</span> System & Comms
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-neutral-100">
                            <div>
                                <div className="text-sm font-bold text-neutral-900">SMS Notifications</div>
                                <div className="text-[10px] font-bold text-neutral-500 uppercase">Send ticket PNR via SMS/WhatsApp</div>
                            </div>
                            <Toggle
                                checked={settings.smsNotifications}
                                onChange={(val) => setSettings({ ...settings, smsNotifications: val })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-neutral-100">
                            <div>
                                <div className="text-sm font-bold text-neutral-900">Email Alerts</div>
                                <div className="text-[10px] font-bold text-neutral-500 uppercase">System alerts & booking summaries</div>
                            </div>
                            <Toggle
                                checked={settings.emailNotifications}
                                onChange={(val) => setSettings({ ...settings, emailNotifications: val })}
                            />
                        </div>
                    </div>
                </div>

                {/* Maintenance Section */}
                <div className="glass-panel p-8 border-2 border-danger-200 bg-danger-50/10">
                    <h3 className="text-xl font-black text-danger-600 flex items-center gap-2">
                        <span className="text-danger-500">🛑</span> Maintenance Mode
                    </h3>
                    <p className="text-xs font-medium text-neutral-700 mt-2 mb-6 leading-relaxed">
                        Activating maintenance mode will prevent customers from searching or booking trips. Administrators and agency staff will still have access to the dashboard.
                    </p>

                    <div className="flex items-center justify-between p-4 bg-white/80 rounded-2xl border border-danger-100 shadow-sm">
                        <div className="text-sm font-black text-danger-900 uppercase tracking-tighter">Emergency Lockdown</div>
                        <Toggle
                            checked={settings.maintenanceMode}
                            onChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
                            variant="danger"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, variant = 'primary' }: { checked: boolean, onChange: (val: boolean) => void, variant?: 'primary' | 'danger' }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? (variant === 'danger' ? 'bg-danger-500' : 'bg-primary-500') : 'bg-neutral-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}
