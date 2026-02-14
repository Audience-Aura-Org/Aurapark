'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/Badge';
import { AuditService } from '@/lib/services/AuditService';

export default function AdminBrandingPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await axios.get('/api/admin/settings');
            setSettings(data.settings || {});
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
            alert('Branding settings updated successfully!');
        } catch (error) {
            console.error('Failed to update branding:', error);
            alert('Error updating settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    return (
        <div className="space-y-8 max-w-4xl">
            <PageHeader
                title="Design & Branding"
                subtitle="Customize the platform's visual identity and global branding"
                breadcrumbs={['Admin', 'Design']}
                actions={
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isLoading={saving}
                    >
                        Save Changes
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identity Section */}
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 border-b border-neutral-100 pb-4">Brand Identity</h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Platform Name</label>
                            <input
                                type="text"
                                className="w-full h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                value={settings.platformName || ''}
                                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Logo URL</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    className="flex-1 h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-semibold focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                    value={settings.logoUrl || ''}
                                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                                />
                                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center overflow-hidden border border-neutral-200">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo Preview" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase">No Img</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="glass-panel p-8 space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 border-b border-neutral-100 pb-4">Theme & Styling</h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-neutral-700 ml-1">Primary Brand Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    className="h-12 w-20 p-1 rounded-xl bg-white/50 border border-white/20 cursor-pointer"
                                    value={settings.primaryColor || '#3b82f6'}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 h-12 px-4 rounded-xl bg-white/50 border border-white/20 text-neutral-900 font-mono font-bold focus:ring-2 focus:ring-primary-400 outline-none transition-all uppercase"
                                    value={settings.primaryColor || '#3B82F6'}
                                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                            <div className="text-xs font-bold text-primary-700 mb-2 uppercase tracking-wider">Interface Preview</div>
                            <div className="flex gap-2">
                                <div className="h-6 w-12 rounded-lg" style={{ backgroundColor: settings.primaryColor || '#3b82f6' }}></div>
                                <div className="h-6 w-24 bg-white rounded-lg border border-primary-100"></div>
                                <div className="h-6 w-8 bg-neutral-900 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Rules Shortcut */}
            <div className="glass-panel p-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-neutral-900">Advanced Configuration</h3>
                    <p className="text-sm text-neutral-600">Platform fees, cancellation policies, and automated rules.</p>
                </div>
                <Button variant="glass" size="sm">Configure System Rules</Button>
            </div>
        </div>
    );
}
