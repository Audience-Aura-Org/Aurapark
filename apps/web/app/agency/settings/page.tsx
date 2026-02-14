'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

export default function AgencySettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/agency/settings');
            setSettings(data.settings || {});
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await axios.patch('/api/agency/settings', settings);
            // Notification would be nice here
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="System Configuration"
                subtitle="High-level parameter adjustment and operational tuning for agency nodes"
                breadcrumbs={['Agency', 'Settings']}
                actions={
                    <Button variant="primary" onClick={handleSave} isLoading={saving}>Sync Configuration</Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-8 border-b border-neutral-100 pb-4">Tactical Communications</h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">WhatsApp Confirmation Hook</label>
                                    <textarea
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-xs font-mono"
                                        rows={4}
                                        value={settings.whatsappTemplates?.bookingConfirmation || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            whatsappTemplates: { ...settings.whatsappTemplates, bookingConfirmation: e.target.value }
                                        })}
                                        placeholder="MISSION_ID: {pnr}\n\nGreetings {name}, your transport vector is confirmed."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Signal Delay Protocol</label>
                                    <textarea
                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-xl p-4 text-xs font-mono"
                                        rows={4}
                                        value={settings.whatsappTemplates?.tripDelay || ''}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            whatsappTemplates: { ...settings.whatsappTemplates, tripDelay: e.target.value }
                                        })}
                                        placeholder="ALERT: Mission {pnr} experienced a vector deviation of {delay} minutes."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight mb-8 border-b border-neutral-100 pb-4">Economic Protocols</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Platform Tributary</div>
                                    <Badge variant="info" size="sm" className="font-black">FIXED</Badge>
                                </div>
                                <div className="text-3xl font-black text-neutral-900 mb-2">12.5%</div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mean Yield Share</p>
                            </div>
                            <div className="flex flex-col justify-center gap-4">
                                <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-neutral-100">
                                    <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Dynamic Pricing Vector</span>
                                    <div className="w-10 h-5 bg-primary-400 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-neutral-100">
                                    <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Manual Manifest Override</span>
                                    <div className="w-10 h-5 bg-neutral-200 rounded-full relative">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Column */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 bg-neutral-900 text-white">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-6">Operational Integrity</div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full border-4 border-primary-500 flex items-center justify-center font-black text-xl text-primary-400">92</div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Node Score</div>
                                <div className="text-xs font-bold text-success-400">OPTIMAL STATE</div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-400 w-[92%]" />
                            </div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-40">
                                <span>Signal Stability</span>
                                <span>98.4%</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8 bg-gradient-to-br from-primary-400 to-primary-600 text-neutral-900">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60 text-center">Cloud Synchronization</h4>
                        <div className="text-center">
                            <div className="text-4xl mb-2">☁️</div>
                            <div className="text-[10px] font-black uppercase tracking-widest">Last Remote Sync</div>
                            <div className="text-xl font-black tracking-tighter">0.4s AGO</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
