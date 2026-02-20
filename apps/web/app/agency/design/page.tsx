'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import axios from 'axios';

export default function AgencyDesignPage() {
    const [theme, setTheme] = useState({
        primaryColor: '#3b82f6',
        accentColor: '#fbbf24',
        ticketHeadline: 'Safe, Reliable, Swift.',
        agencyName: 'Your Agency',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const [settingsRes, meRes] = await Promise.all([
                axios.get('/api/agency/settings'),
                axios.get('/api/auth/me'),
            ]);
            const s = settingsRes.data.settings || {};
            setTheme({
                primaryColor: s.branding?.primaryColor || '#3b82f6',
                accentColor: s.branding?.accentColor || '#fbbf24',
                ticketHeadline: s.branding?.ticketHeadline || 'Safe, Reliable, Swift.',
                agencyName: meRes.data.agency?.name || 'Your Agency',
            });
        } catch (e) {
            console.error('Failed to load theme:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.patch('/api/agency/settings', {
                branding: {
                    primaryColor: theme.primaryColor,
                    accentColor: theme.accentColor,
                    ticketHeadline: theme.ticketHeadline,
                }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e) {
            console.error('Failed to save theme:', e);
            alert('Failed to save branding settings.');
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
                title="Branding & Design"
                subtitle="Customize your agency's visual identity on tickets and communications"
                breadcrumbs={['Agency', 'Design']}
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
                        <Button variant="primary" onClick={handleSave} isLoading={saving}>Save Branding</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Colors */}
                    <div className="glass-panel p-8">
                        <h3 className="text-lg font-black text-neutral-900 mb-6 pb-4 border-b border-neutral-100">Brand Colors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">Primary Color</label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input
                                        type="color"
                                        value={theme.primaryColor}
                                        onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <div>
                                        <div className="text-sm font-black text-neutral-900 font-mono">{theme.primaryColor.toUpperCase()}</div>
                                        <div className="text-xs text-neutral-400 mt-1">Used on buttons, badges & ticket headers</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">Accent Color</label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input
                                        type="color"
                                        value={theme.accentColor}
                                        onChange={e => setTheme(p => ({ ...p, accentColor: e.target.value }))}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <div>
                                        <div className="text-sm font-black text-neutral-900 font-mono">{theme.accentColor.toUpperCase()}</div>
                                        <div className="text-xs text-neutral-400 mt-1">Highlights, banners &amp; promotions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messaging */}
                    <div className="glass-panel p-8">
                        <h3 className="text-lg font-black text-neutral-900 mb-6 pb-4 border-b border-neutral-100">Ticket Messaging</h3>
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">Ticket Tagline</label>
                            <input
                                type="text"
                                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-black text-neutral-900 tracking-tight focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                                value={theme.ticketHeadline}
                                onChange={e => setTheme(p => ({ ...p, ticketHeadline: e.target.value }))}
                                placeholder="Safe. Reliable. Swift."
                            />
                            <p className="text-xs text-neutral-400 mt-2">This tagline appears on all printed and digital tickets.</p>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 bg-neutral-900 text-white min-h-[420px] flex flex-col items-center justify-center text-center overflow-hidden relative rounded-3xl">
                        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-10 text-neutral-500">Ticket Preview</h4>

                        {/* Ticket Mockup */}
                        <div className="w-60 bg-white rounded-3xl p-6 text-neutral-900 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10" style={{ backgroundColor: theme.primaryColor }} />
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-7 h-7 rounded-lg shadow-sm" style={{ backgroundColor: theme.primaryColor }} />
                                <div className="text-[10px] font-black uppercase tracking-tighter text-neutral-800">{theme.agencyName}</div>
                            </div>
                            <div className="mb-6 text-left">
                                <div className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">BOARDING PASS</div>
                                <div className="text-base font-black tracking-tighter leading-snug text-neutral-900">{theme.ticketHeadline}</div>
                            </div>
                            <div className="flex items-center gap-1 mb-4">
                                <div className="text-[8px] font-mono font-black text-neutral-300 tracking-widest px-2 py-1 bg-neutral-50 rounded-lg">PNR: XXXXXX</div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                            </div>
                            <div className="flex border-t-2 border-dashed border-neutral-100 pt-4">
                                <div className="w-full h-7 bg-neutral-100 rounded-lg flex items-center justify-center font-mono text-[7px] font-black tracking-widest text-neutral-400">
                                    |||||||||||||||||||||||||||
                                </div>
                            </div>
                        </div>

                        <p className="mt-8 text-[9px] font-bold text-neutral-600 uppercase">Live preview updates as you edit</p>
                    </div>

                    <div className="glass-panel p-5 text-center">
                        <div className="text-xs font-bold text-neutral-600 mb-1">Colour Swatch</div>
                        <div className="flex gap-2 justify-center mt-2">
                            <div className="w-10 h-10 rounded-xl shadow-md" style={{ backgroundColor: theme.primaryColor }} title="Primary" />
                            <div className="w-10 h-10 rounded-xl shadow-md" style={{ backgroundColor: theme.accentColor }} title="Accent" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
