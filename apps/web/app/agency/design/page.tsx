'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import axios from 'axios';

type Toast = { type: 'success' | 'error'; text: string } | null;

export default function AgencyDesignPage() {
    const [theme, setTheme] = useState({
        primaryColor: '#3b82f6',
        accentColor: '#90ee904d',
        ticketHeadline: 'Safe, Reliable, Swift.',
        agencyName: 'Your Agency',
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<Toast>(null);

    useEffect(() => { fetchTheme(); }, []);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchTheme = async () => {
        setError(null);
        try {
            const { data } = await axios.get('/api/agency/settings');
            const s = data.settings || {};
            setTheme({
                primaryColor: s.branding?.primaryColor || '#3b82f6',
                accentColor: s.branding?.accentColor || '#90ee904d',
                ticketHeadline: s.branding?.ticketHeadline || 'Safe, Reliable, Swift.',
                agencyName: data.agencyName || 'Your Agency',
            });
        } catch (e: any) {
            console.error('Failed to load branding:', e);
            setError(e?.response?.data?.error || 'Failed to load branding settings.');
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
                },
            });
            showToast('success', 'Branding saved successfully!');
        } catch (e: any) {
            console.error('Failed to save theme:', e);
            showToast('error', e?.response?.data?.error || 'Failed to save branding.');
        } finally {
            setSaving(false);
        }
    };

    const set = (key: keyof typeof theme) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setTheme(p => ({ ...p, [key]: e.target.value }));

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-400 rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="text-danger-600 font-bold text-sm">{error}</div>
            <Button variant="primary" onClick={fetchTheme}>Retry</Button>
        </div>
    );

    return (
        <div className="space-y-8">
            <PageHeader
                title="Branding & Design"
                subtitle="Customise your agency's visual identity on tickets and communications"
                breadcrumbs={['Agency', 'Design']}
                actions={
                    <div className="flex items-center gap-3">
                        {toast && (
                            <span className={`text-sm font-bold flex items-center gap-1.5 ${toast.type === 'success' ? 'text-success-600' : 'text-danger-600'}`}>
                                {toast.type === 'success' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {toast.text}
                            </span>
                        )}
                        <Button variant="primary" onClick={handleSave} isLoading={saving}>
                            Save Branding
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Controls ── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Colors */}
                    <div className="glass-panel p-6 md:p-8">
                        <h3 className="text-lg font-black text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
                            Brand Colors
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Primary */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">
                                    Primary Color
                                </label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <label className="relative cursor-pointer">
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md border-2 border-white ring-2 ring-neutral-200"
                                            style={{ backgroundColor: theme.primaryColor }}
                                        />
                                        <input
                                            type="color"
                                            value={theme.primaryColor}
                                            onChange={set('primaryColor')}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                    </label>
                                    <div>
                                        <div className="text-sm font-black text-neutral-900 font-mono">
                                            {theme.primaryColor.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-neutral-400 mt-0.5">
                                            Buttons, badges & ticket headers
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Accent */}
                            <div>
                                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-3">
                                    Accent Color
                                </label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <label className="relative cursor-pointer">
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md border-2 border-white ring-2 ring-neutral-200"
                                            style={{ backgroundColor: theme.accentColor }}
                                        />
                                        <input
                                            type="color"
                                            value={theme.accentColor}
                                            onChange={set('accentColor')}
                                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                        />
                                    </label>
                                    <div>
                                        <div className="text-sm font-black text-neutral-900 font-mono">
                                            {theme.accentColor.toUpperCase()}
                                        </div>
                                        <div className="text-xs text-neutral-400 mt-0.5">
                                            Highlights, banners &amp; promotions
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color preset swatches */}
                        <div className="mt-6 pt-5 border-t border-neutral-100">
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-3">Quick Presets — Primary</div>
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
                                    '#ef4444', '#f97316', '#eab308', '#22c55e',
                                    '#14b8a6', '#0ea5e9', '#1e3a8a', '#111827',
                                ].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setTheme(p => ({ ...p, primaryColor: color }))}
                                        className={`w-7 h-7 rounded-lg shadow-sm transition-all hover:scale-110 ${theme.primaryColor === color ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : ''}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tagline */}
                    <div className="glass-panel p-6 md:p-8">
                        <h3 className="text-lg font-black text-neutral-900 mb-6 pb-4 border-b border-neutral-100">
                            Ticket Messaging
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wide mb-2">
                                Ticket Tagline
                            </label>
                            <input
                                type="text"
                                className="w-full bg-neutral-50 border-2 border-neutral-100 focus:border-primary-400 rounded-2xl p-4 text-sm font-bold text-neutral-900 tracking-tight outline-none transition-all"
                                value={theme.ticketHeadline}
                                onChange={set('ticketHeadline')}
                                placeholder="Safe. Reliable. Swift."
                                maxLength={80}
                            />
                            <div className="flex justify-between mt-2">
                                <p className="text-xs text-neutral-400">Appears on all printed and digital tickets.</p>
                                <span className="text-xs text-neutral-400">{theme.ticketHeadline.length}/80</span>
                            </div>
                        </div>
                    </div>

                    {/* Save reminder on mobile (sticky bottom) */}
                    <div className="lg:hidden">
                        <Button variant="primary" className="w-full" onClick={handleSave} isLoading={saving}>
                            Save Branding
                        </Button>
                    </div>
                </div>

                {/* ── Live Preview ── */}
                <div className="space-y-4">
                    <div
                        className="glass-panel p-6 text-white flex flex-col items-center justify-center text-center overflow-hidden relative rounded-3xl min-h-[400px]"
                        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
                    >
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                backgroundSize: '16px 16px',
                            }}
                        />

                        <div className="text-[9px] font-black uppercase tracking-widest mb-8 text-slate-500">
                            Live Preview
                        </div>

                        {/* Ticket Card */}
                        <div className="w-56 bg-white rounded-2xl shadow-2xl overflow-hidden text-neutral-900">
                            {/* Header strip */}
                            <div
                                className="px-4 py-3 flex items-center gap-2"
                                style={{ backgroundColor: theme.primaryColor }}
                            >
                                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
                                    </svg>
                                </div>
                                <span className="text-white text-[10px] font-black uppercase tracking-tight truncate">
                                    {theme.agencyName}
                                </span>
                                <span className="ml-auto text-white/60 text-[8px] font-bold">E-TICKET</span>
                            </div>

                            {/* Body */}
                            <div className="px-4 py-4">
                                <div className="text-[7px] font-black text-neutral-400 uppercase tracking-widest mb-1">
                                    Boarding Pass
                                </div>
                                <div
                                    className="text-xs font-black leading-snug mb-4"
                                    style={{ color: theme.primaryColor }}
                                >
                                    {theme.ticketHeadline || 'Your tagline here'}
                                </div>

                                <div className="flex items-center justify-between text-[8px] font-bold text-neutral-400 mb-4">
                                    <span>YAOUNDÉ</span>
                                    <div className="flex-1 mx-2 border-t border-dashed border-neutral-200" />
                                    <span>DOUALA</span>
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="text-[8px] font-black font-mono text-neutral-300 bg-neutral-50 px-2 py-1 rounded flex-1">
                                        PNR: XXXXXX
                                    </div>
                                    <div
                                        className="w-4 h-4 rounded-full shrink-0"
                                        style={{ backgroundColor: theme.accentColor }}
                                    />
                                </div>
                            </div>

                            {/* Barcode */}
                            <div className="px-4 pb-4 border-t-2 border-dashed border-neutral-100 pt-3">
                                <div className="h-6 bg-neutral-100 rounded font-mono text-[6px] font-black text-neutral-300 flex items-center justify-center tracking-widest">
                                    |||||||||||||||||||||||||||
                                </div>
                            </div>
                        </div>

                        <p className="mt-6 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
                            Updates as you edit
                        </p>
                    </div>

                    {/* Swatch */}
                    <div className="glass-panel p-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-500 uppercase">Colour Swatch</span>
                        <div className="flex gap-2">
                            <div
                                className="w-8 h-8 rounded-lg shadow-md ring-2 ring-white"
                                style={{ backgroundColor: theme.primaryColor }}
                                title={`Primary: ${theme.primaryColor}`}
                            />
                            <div
                                className="w-8 h-8 rounded-lg shadow-md ring-2 ring-white"
                                style={{ backgroundColor: theme.accentColor }}
                                title={`Accent: ${theme.accentColor}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
