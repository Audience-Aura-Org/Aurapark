'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ShipmentStatus } from '@/lib/types';

export default function AgencyShipmentsPage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        origin: '',
        destination: '',
        content: '',
        weight: '',
        price: ''
    });

    const [editingShipment, setEditingShipment] = useState<any>(null);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        try {
            const { data } = await axios.get('/api/agency/shipments');
            setShipments(data.shipments || []);
        } catch (error) {
            console.error('Failed to fetch shipments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdating(true);
        try {
            await axios.patch('/api/agency/shipments', {
                id,
                status: newStatus,
                notes: `Status updated to ${newStatus} by agency staff.`
            });
            fetchShipments();
            setEditingShipment(null);
        } catch (error) {
            console.error('Failed to update shipment status:', error);
            alert('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic client-side validation
        if (!formData.senderName || !formData.senderPhone ||
            !formData.receiverName || !formData.receiverPhone ||
            !formData.origin || !formData.destination ||
            !formData.content || !formData.weight || !formData.price) {
            alert('Please fill in all required fields before saving the shipment.');
            return;
        }

        const weight = parseFloat(formData.weight);
        const price = parseFloat(formData.price);

        if (Number.isNaN(weight) || Number.isNaN(price) || price <= 0) {
            alert('Please enter valid numeric values for weight and price.');
            return;
        }

        setSaving(true);
        try {
            await axios.post('/api/agency/shipments', {
                sender: { name: formData.senderName, phone: formData.senderPhone },
                receiver: { name: formData.receiverName, phone: formData.receiverPhone },
                origin: formData.origin,
                destination: formData.destination,
                content: formData.content,
                weight,
                price,
                status: ShipmentStatus.PENDING
            });
            setIsModalOpen(false);
            setFormData({
                senderName: '',
                senderPhone: '',
                receiverName: '',
                receiverPhone: '',
                origin: '',
                destination: '',
                content: '',
                weight: '',
                price: ''
            });
            fetchShipments();
        } catch (error: any) {
            console.error('Failed to create shipment:', error);
            const message = error?.response?.data?.error || 'Failed to create shipment';
            alert(message);
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
                title="Shipment Management"
                subtitle="Manage your packages and cargo deliveries."
                breadcrumbs={['Agency', 'Shipments']}
                actions={
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                        New Shipment
                    </Button>
                }
            />

            {/* Logical Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-primary-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">On the Way</div>
                    <div className="text-3xl font-black text-neutral-900">{shipments.filter(s => s.status === 'EN_ROUTE').length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Packages being delivered</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-amber-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Pending</div>
                    <div className="text-3xl font-black text-amber-600">{shipments.filter(s => s.status === 'PENDING' || s.status === 'RECEIVED').length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Waiting to be sent</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-success-500">
                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Delivered</div>
                    <div className="text-3xl font-black text-success-600">{shipments.filter(s => s.status === 'DELIVERED').length}</div>
                    <div className="text-xs text-neutral-500 mt-1">Finished deliveries</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-neutral-900">
                    <div className="text-xs text-neutral-500 mt-1">Total Revenue</div>
                </div>
            </div>

            {/* Shipment Ledger */}
            <div className="glass-panel p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">All Shipments</h2>
                    <Badge variant="info" className="animate-pulse">LIVE TRACKING</Badge>
                </div>
                {shipments.length > 0 ? (
                    <div className="space-y-4">
                        <div className="hidden md:grid grid-cols-6 px-6 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                            <div>Tracking Number</div>
                            <div>Route</div>
                            <div>Items</div>
                            <div>Receiver</div>
                            <div>Payment</div>
                            <div className="text-right">Action</div>
                        </div>
                        {shipments.map((shipment) => (
                            <div key={shipment._id} className="flex flex-col md:flex-row md:items-center gap-4 py-6 px-6 bg-white/60 border border-white/40 rounded-[2rem] hover:bg-white transition-all shadow-sm group">
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1 md:hidden">Tracking Number</div>
                                    <div className="font-black text-neutral-900 text-sm">{shipment.trackingNumber || 'UNASSIGNED'}</div>
                                    <div className="text-[10px] font-bold text-neutral-400">{new Date(shipment.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1 md:hidden">Route</div>
                                    <div className="font-bold text-neutral-700 text-xs uppercase">{shipment.origin} → {shipment.destination}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1 md:hidden">Items</div>
                                    <div className="font-bold text-neutral-900 text-xs uppercase truncate max-w-[150px]">{shipment.content}</div>
                                    <div className="text-[10px] font-black text-primary-600">{shipment.weight} KG</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1 md:hidden">Receiver</div>
                                    <div className="font-bold text-neutral-900 text-xs uppercase">{shipment.receiver.name}</div>
                                    <div className="text-[10px] font-medium text-neutral-500">{shipment.receiver.phone}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter mb-1 md:hidden">Payment</div>
                                    <div className="font-black text-neutral-900">XAF {shipment.price.toLocaleString()}</div>
                                    <Badge variant={shipment.paymentStatus === 'PAID' ? 'success' : 'warning'} className="scale-75 origin-left">
                                        {shipment.paymentStatus}
                                    </Badge>
                                </div>
                                <div className="flex-1 text-right">
                                    {editingShipment === shipment._id ? (
                                        <div className="flex flex-col items-end gap-2 animate-in fade-in slide-in-from-right-2">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="text-[10px] font-black uppercase bg-white border-2 border-primary-500 text-neutral-900 rounded-lg h-8 outline-none focus:ring-2 focus:ring-primary-600 shadow-md px-2"
                                                    value={updateStatus || shipment.status}
                                                    onChange={(e) => setUpdateStatus(e.target.value)}
                                                >
                                                    {Object.values(ShipmentStatus).map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => handleUpdateStatus(shipment._id, updateStatus || shipment.status)}
                                                    disabled={updating}
                                                    className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setEditingShipment(null)}
                                                    className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-900 flex items-center justify-center hover:bg-neutral-300"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            {shipment.paymentStatus === 'PENDING' && (
                                                <button
                                                    onClick={async () => {
                                                        await axios.patch('/api/agency/shipments', { id: shipment._id, paymentStatus: 'PAID' });
                                                        fetchShipments();
                                                    }}
                                                    className="text-[8px] font-black uppercase text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-full shadow-lg transition-all hover:scale-105"
                                                >
                                                    Mark as Paid
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3">
                                            <Badge variant={
                                                shipment.status === 'DELIVERED' ? 'success' :
                                                    shipment.status === 'EN_ROUTE' ? 'info' :
                                                        shipment.status === 'CANCELLED' ? 'danger' : 'warning'
                                            } size="sm">
                                                {shipment.status}
                                            </Badge>
                                            <button
                                                onClick={() => {
                                                    setEditingShipment(shipment._id);
                                                    setUpdateStatus(shipment.status);
                                                }}
                                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400 hover:text-neutral-900"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="📦"
                        title="No shipments found"
                        description="Create a new shipment to see it in the list."
                    />
                )}
            </div>

            {/* Shipment Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl p-10 animate-scale-in border border-white/20">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tighter">Add New Shipment</h2>
                                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">Fill in the details below</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors p-3 bg-neutral-50 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8 p-8 bg-neutral-50 rounded-[2.5rem] border border-neutral-100 shadow-inner">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2 px-1">Sender Details</h3>
                                    <Input label="Legal Name" placeholder="Full Name" value={formData.senderName} onChange={(e) => setFormData({ ...formData, senderName: e.target.value })} required />
                                    <Input label="Phone Number" placeholder="+237 ..." value={formData.senderPhone} onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })} required />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 px-1">Receiver Details</h3>
                                    <Input label="Legal Name" placeholder="Full Name" value={formData.receiverName} onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })} required />
                                    <Input label="Phone Number" placeholder="+237 ..." value={formData.receiverPhone} onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Route Information</h3>
                                    <Input label="From" placeholder="Douala" value={formData.origin} onChange={(e) => setFormData({ ...formData, origin: e.target.value })} required />
                                    <Input label="To" placeholder="Yaounde" value={formData.destination} onChange={(e) => setFormData({ ...formData, destination: e.target.value })} required />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Package Details</h3>
                                    <Input label="Content Description" placeholder="Electronics, Clothing, etc" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Weight (kg)" type="number" placeholder="2.5" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required />
                                        <Input label="Price (XAF)" type="number" placeholder="5000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-10">
                                <Button variant="glass" className="flex-1 font-black text-[12px] uppercase h-16 tracking-widest border-neutral-200" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 font-black text-[12px] uppercase h-16 tracking-widest shadow-2xl shadow-primary-200" type="submit" isLoading={saving}>Save Shipment</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
