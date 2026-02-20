'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-primary-500' : 'bg-neutral-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

export default function AgencySettingsPage() {
    const [settings, setSettings] = useState<any>({
        whatsappTemplates: {
            bookingConfirmation: '',
            tripDelay: '',
            tripCancellation: '',
            checkInReminder: '',
        },
        pricingRules: {
            allowDynamicPricing: false,
        },
        tripOverrides: {
            allowManualBooking: true,
            requireApprovalForCancellation: false,
        },
    });
    const [agencyInfo, setAgencyInfo] = useState<any>({ name: '', email: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'operations'>('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [settingsRes, meRes] = await Promise.all([
                axios.get('/api/agency/settings'),
                axios.get('/api/auth/me'),
            ]);
            if (settingsRes.data.settings) {
                setSettings((prev: any) => ({
                    ...prev,
                    ...settingsRes.data.settings,
                    whatsappTemplates: { ...prev.whatsappTemplates, ...settingsRes.data.settings.whatsappTemplates },
                    pricingRules: { ...prev.pricingRules, ...settingsRes.data.settings.pricingRules },
                    tripOverrides: { ...prev.tripOverrides, ...settingsRes.data.settings.tripOverrides },
                }));
            }
            if (meRes.data.agency) {
                setAgencyInfo({
                    name: meRes.data.agency.name || '',
                    email: meRes.data.agency.email || '',
                    phone: meRes.data.agency.phone || '',
                    address: meRes.data.agency.address || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch('/api/agency/settings', settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaved(false);
            // Show inline error via the saved state being false with a brief flash
            alert('Error saving settings. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const setTemplate = (key: string, val: string) =>
        setSettings((p: any) => ({ ...p, whatsappTemplates: { ...p.whatsappTemplates, [key]: val } }));

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Agency Settings"
                subtitle="Manage your agency profile, notification templates, and operational preferences"
                breadcrumbs={['Agency', 'Settings']}
                actions={
                    <div className="flex items-center gap-3">
                        {saved && (
                            <span className="text-sm font-bold text-success-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Saved!
                            </span>
                        )}
                        <Button variant="primary" onClick={handleSave} isLoading={saving}>Save Changes</Button>
                    </div>
                }
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-100 pb-0">
                {([
                    { key: 'general', label: 'General' },
                    { key: 'notifications', label: 'Notifications' },
                    { key: 'operations', label: 'Operations' },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-3 text-sm font-bold rounded-t-xl transition-all border-b-2 ${activeTab === tab.key ? 'border-primary-500 text-primary-600 bg-primary-50/50' : 'border-transparent text-neutral-500 hover:text-neutral-900'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-lg font-black text-neutral-900 mb-6">Agency Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide ml-1">Agency Name</label>
                            <input
                                type="text"
                                value={agencyInfo.name}
                                disabled
                                className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-900 font-semibold cursor-not-allowed opacity-70"
                            />
                            <p className="text-[10px] text-neutral-400 ml-1">Contact admin to change your agency name</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide ml-1">Contact Email</label>
                            <input
                                type="email"
                                value={agencyInfo.email}
                                disabled
                                className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-900 font-semibold cursor-not-allowed opacity-70"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide ml-1">Phone Number</label>
                            <input
                                type="text"
                                value={agencyInfo.phone}
                                disabled
                                className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-900 font-semibold cursor-not-allowed opacity-70"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-600 uppercase tracking-wide ml-1">Address</label>
                            <input
                                type="text"
                                value={agencyInfo.address}
                                disabled
                                className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-900 font-semibold cursor-not-allowed opacity-70"
                            />
                        </div>
                    </div>
                    <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-700 font-medium">
                        💡 To update your agency profile information, please contact the platform administrator.
                    </div>

                    <div className="border-t border-neutral-100 pt-6">
                        <h3 className="text-lg font-black text-neutral-900 mb-1">Platform Fee</h3>
                        <p className="text-xs text-neutral-400 mb-4">Your current platform commission rate (fixed by admin)</p>
                        <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                            <div className="text-4xl font-black text-neutral-900">
                                {settings.pricingRules?.platformFeePercentage || 10}%
                            </div>
                            <div>
                                <Badge variant="info" size="sm">FIXED</Badge>
                                <p className="text-xs text-neutral-500 mt-1">Deducted from each ticket sale</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-lg font-black text-neutral-900 mb-2">WhatsApp Message Templates</h3>
                    <p className="text-sm text-neutral-500 mb-6">
                        Customize the messages sent to passengers. Use <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">{'{name}'}</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">{'{pnr}'}</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">{'{route}'}</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded text-xs">{'{time}'}</code> as placeholders.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { key: 'bookingConfirmation', label: 'Booking Confirmation', placeholder: 'Hi {name}, your booking {pnr} is confirmed. Departs {route} at {time}.' },
                            { key: 'tripDelay', label: 'Trip Delay Alert', placeholder: 'Hi {name}, your trip {pnr} on {route} has been delayed. New departure: {time}.' },
                            { key: 'tripCancellation', label: 'Trip Cancellation', placeholder: 'Hi {name}, unfortunately your trip {pnr} on {route} has been cancelled.' },
                            { key: 'checkInReminder', label: 'Check-In Reminder', placeholder: 'Hi {name}, reminder to check in for your trip {pnr} departing {route} at {time}.' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key}>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">{label}</label>
                                <textarea
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-sm text-neutral-800 resize-none focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                    rows={4}
                                    value={settings.whatsappTemplates?.[key] || ''}
                                    onChange={e => setTemplate(key, e.target.value)}
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-lg font-black text-neutral-900 mb-6">Operational Preferences</h3>
                    <div className="space-y-4">
                        {[
                            {
                                key: 'allowDynamicPricing',
                                parent: 'pricingRules',
                                label: 'Dynamic Pricing',
                                description: 'Allow price adjustments based on demand and seat availability',
                            },
                            {
                                key: 'allowManualBooking',
                                parent: 'tripOverrides',
                                label: 'Manual Booking Override',
                                description: 'Staff can manually add passengers to trips at the counter',
                            },
                            {
                                key: 'requireApprovalForCancellation',
                                parent: 'tripOverrides',
                                label: 'Require Approval for Cancellations',
                                description: 'Trip cancellations by drivers or staff must be approved by management',
                            },
                        ].map(({ key, parent, label, description }) => (
                            <div key={key} className="flex items-center justify-between p-5 bg-white/40 rounded-2xl border border-neutral-100 hover:bg-white/70 transition-all">
                                <div>
                                    <div className="text-sm font-bold text-neutral-900">{label}</div>
                                    <div className="text-xs font-medium text-neutral-500 mt-0.5">{description}</div>
                                </div>
                                <Toggle
                                    checked={settings[parent]?.[key] || false}
                                    onChange={val => setSettings((p: any) => ({ ...p, [parent]: { ...p[parent], [key]: val } }))}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
