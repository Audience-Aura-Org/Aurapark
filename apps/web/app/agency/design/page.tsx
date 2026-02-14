'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';

export default function AgencyDesignPage() {
    const [theme, setTheme] = useState({
        primaryColor: '#3b82f6',
        accentColor: '#fbbf24',
        logoUrl: '',
        ticketHeadline: 'Safe, Reliable, Swift.'
    });

    return (
        <div className="space-y-8">
            <PageHeader
                title="Aesthetic Orchestration"
                subtitle="Branding synthesis and visual identity management for agency nodes"
                breadcrumbs={['Agency', 'Design']}
                actions={
                    <Button variant="primary">Deploy Visual Assets</Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Branding Controls */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic mb-8 border-b border-neutral-100 pb-4">Brand Chromatics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Primary Vector Color</label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input
                                        type="color"
                                        value={theme.primaryColor}
                                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-neutral-900 font-mono italic">{theme.primaryColor.toUpperCase()}</div>
                                        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Core UI Influence</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Accent Highlight</label>
                                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                    <input
                                        type="color"
                                        value={theme.accentColor}
                                        onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                                        className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-neutral-900 font-mono italic">{theme.accentColor.toUpperCase()}</div>
                                        <div className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Conversion Optimization</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-8">
                        <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight italic mb-8 border-b border-neutral-100 pb-4">Mission Messaging</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Ticket Headline Protocol</label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-sm font-black tracking-tighter italic"
                                    value={theme.ticketHeadline}
                                    onChange={(e) => setTheme({ ...theme, ticketHeadline: e.target.value })}
                                    placeholder="SAFE. RELIABLE. SWIFT."
                                />
                                <p className="text-[9px] text-neutral-400 mt-2 font-bold uppercase tracking-widest">This slogan will manifest on all digital and physical ticket assets.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Hub */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 bg-neutral-900 text-white min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-12 text-primary-400">Live Asset Synthesis</h4>

                        {/* Ticket Mockup */}
                        <div className="w-56 bg-white rounded-3xl p-6 text-neutral-900 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-neutral-100 rounded-bl-full shadow-inner" />
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: theme.primaryColor }} />
                                <div className="text-[10px] font-black uppercase tracking-tighter">AGENCY_CORE</div>
                            </div>
                            <div className="space-y-2 mb-8 text-left">
                                <div className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">BOARDING_PASS</div>
                                <div className="text-lg font-black tracking-tighter leading-none">{theme.ticketHeadline}</div>
                            </div>
                            <div className="flex border-t-2 border-dashed border-neutral-200 pt-4 gap-2">
                                <div className="w-full h-8 bg-neutral-100 rounded-lg flex items-center justify-center font-mono text-[8px] font-black tracking-widest">||||||||||||||||||||</div>
                            </div>
                        </div>

                        <div className="mt-12 text-[9px] font-bold text-neutral-500 uppercase italic">Adaptive Vector Rendering Engine v1.02</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
