'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { PromoStatus } from '@/lib/types';

export default function AgencyMarketingPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        startDate: '',
        endDate: '',
        usageLimit: '',
        minBookingAmount: '0'
    });

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const { data } = await axios.get('/api/agency/marketing');
            setPromotions(data.promotions || []);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/agency/marketing', {
                ...formData,
                value: Number(formData.value),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                minBookingAmount: Number(formData.minBookingAmount)
            });
            setIsModalOpen(false);
            fetchPromotions();
            setFormData({
                code: '',
                description: '',
                type: 'PERCENTAGE',
                value: '',
                startDate: '',
                endDate: '',
                usageLimit: '',
                minBookingAmount: '0'
            });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to create promotion');
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
                title="Marketing & Growth"
                subtitle="Create and manage promotional campaigns to grow your business."
                breadcrumbs={['Agency', 'Marketing']}
                actions={
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        Create Promotion
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Active Campaigns</div>
                    <div className="text-3xl font-black text-neutral-900">
                        {promotions.filter(p => p.status === PromoStatus.ACTIVE).length}
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Uses</div>
                    <div className="text-3xl font-black text-success-600">
                        {promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0)}
                    </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-indigo-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Coupon Savings</div>
                    <div className="text-3xl font-black text-indigo-600">
                        XAF {promotions.reduce((sum, p) => sum + (p.usageCount * p.value || 0), 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="glass-panel p-8">
                <h2 className="text-xl font-black text-neutral-900 mb-8 tracking-tight">Active Promotions</h2>

                {promotions.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {promotions.map((promo) => (
                            <div key={promo._id} className="p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-black text-lg tracking-widest uppercase">
                                        {promo.code}
                                    </div>
                                    <Badge variant={promo.status === PromoStatus.ACTIVE ? 'success' : 'info'}>
                                        {promo.status}
                                    </Badge>
                                </div>
                                <h3 className="font-black text-neutral-900 mb-1">{promo.description}</h3>
                                <div className="text-primary-600 font-bold text-sm mb-4">
                                    {promo.type === 'PERCENTAGE' ? `${promo.value}% OFF` : `XAF ${promo.value} OFF`}
                                </div>
                                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
                                    <div>
                                        <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">USAGE</div>
                                        <div className="text-xs font-bold text-neutral-700">{promo.usageCount} / {promo.usageLimit || '∞'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">VALID UNTIL</div>
                                        <div className="text-xs font-bold text-neutral-700">{new Date(promo.endDate).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="🎫"
                        title="No promotions created"
                        description="Start your first marketing campaign by creating a discount code."
                        action={<Button variant="primary" onClick={() => setIsModalOpen(true)}>Create First Promo</Button>}
                    />
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">New Promotion</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Promo Code"
                                    placeholder="SUMMER20"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                                <div className="relative">
                                    <label className="absolute left-4 top-2 text-xs font-black text-primary-700 bg-white px-1.5 rounded z-10">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-[56px] px-4 pt-4 rounded-xl border-2 border-neutral-300 bg-white shadow-soft focus:shadow-soft-lg outline-none focus:border-primary-500 font-bold text-neutral-900"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (XAF)</option>
                                    </select>
                                </div>
                            </div>

                            <Input
                                label="Description"
                                placeholder="Discount for summer bookings"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Discount Value"
                                    type="number"
                                    placeholder="10"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Usage Limit"
                                    type="number"
                                    placeholder="100"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Start Date"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                                <Input
                                    label="End Date"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button variant="glass" className="flex-1" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1" type="submit" isLoading={saving}>Create Promo</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
