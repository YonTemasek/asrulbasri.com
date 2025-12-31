'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Save, MessageSquare, Users, Briefcase, Layers, PenTool, Cpu } from 'lucide-react';
import Link from 'next/link';

interface ServiceFormData {
    name: string;
    description: string;
    price: number;
    price_label: string;
    period: string;
    duration: string;
    features: string[];
    stripe_price_id: string;
    icon: string;
    color_theme: string;
    is_active: boolean;
    is_featured: boolean;
    sort_order: number;
}

interface ServiceFormProps {
    serviceId?: string;
}

const ICONS = [
    { value: 'MessageSquare', label: 'Chat', Icon: MessageSquare },
    { value: 'Users', label: 'Users', Icon: Users },
    { value: 'Briefcase', label: 'Briefcase', Icon: Briefcase },
    { value: 'Layers', label: 'Layers', Icon: Layers },
    { value: 'PenTool', label: 'Pen', Icon: PenTool },
    { value: 'Cpu', label: 'Tech', Icon: Cpu },
];

const COLORS = [
    { value: 'blue', label: 'Blue', bg: 'bg-blue-500' },
    { value: 'emerald', label: 'Green', bg: 'bg-emerald-500' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { value: 'amber', label: 'Amber', bg: 'bg-amber-500' },
    { value: 'red', label: 'Red', bg: 'bg-red-500' },
];

export default function ServiceForm({ serviceId }: ServiceFormProps) {
    const router = useRouter();
    const isEditing = !!serviceId;
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [newFeature, setNewFeature] = useState('');

    const [form, setForm] = useState<ServiceFormData>({
        name: '',
        description: '',
        price: 0,
        price_label: '',
        period: '/hour',
        duration: '',
        features: [],
        stripe_price_id: '',
        icon: 'Briefcase',
        color_theme: 'emerald',
        is_active: true,
        is_featured: false,
        sort_order: 0,
    });

    useEffect(() => {
        if (isEditing) {
            fetchService();
        }
    }, [serviceId]);

    const fetchService = async () => {
        try {
            const res = await fetch(`/api/admin/services/${serviceId}`);
            const data = await res.json();
            if (data.service) {
                setForm({
                    ...data.service,
                    features: data.service.features || [],
                    stripe_price_id: data.service.stripe_price_id || '',
                    description: data.service.description || '',
                    duration: data.service.duration || '',
                    period: data.service.period || '/hour',
                    icon: data.service.icon || 'Briefcase',
                    color_theme: data.service.color_theme || 'emerald',
                });
            }
        } catch (error) {
            console.error('Error fetching service:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePriceLabel = (price: number) => {
        setForm(prev => ({
            ...prev,
            price,
            price_label: `RM ${price.toLocaleString()}`,
        }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setForm(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()],
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = isEditing
                ? `/api/admin/services/${serviceId}`
                : '/api/admin/services';
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include', // Ensure cookies are sent
            });

            if (res.ok) {
                router.push('/dashboard/services');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/services"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {isEditing ? 'Edit Service' : 'New Service'}
                    </h1>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-bold text-slate-900">Basic Information</h2>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Service Name *
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="e.g., 1-on-1 Consultation"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                rows={3}
                                placeholder="Brief description of the service..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Duration
                            </label>
                            <input
                                type="text"
                                value={form.duration}
                                onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="e.g., 1 hour, 4 weeks"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-bold text-slate-900">Pricing</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Price (RM) *
                                </label>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => updatePriceLabel(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    min={0}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Period
                                </label>
                                <select
                                    value={form.period}
                                    onChange={(e) => setForm(prev => ({ ...prev, period: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="/hour">/hour</option>
                                    <option value="/session">/session</option>
                                    <option value="/pax">/pax</option>
                                    <option value="/project">/project</option>
                                    <option value="/month">/month</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Stripe Payment Link *
                            </label>
                            <input
                                type="url"
                                value={form.stripe_price_id}
                                onChange={(e) => setForm(prev => ({ ...prev, stripe_price_id: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="https://buy.stripe.com/xxxxx"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Create a Payment Link in Stripe Dashboard and paste the URL here
                            </p>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-bold text-slate-900">Features</h2>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                placeholder="Add a feature..."
                            />
                            <button
                                type="button"
                                onClick={addFeature}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {form.features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                                >
                                    <span className="flex-1 text-sm">{feature}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {form.features.length === 0 && (
                                <p className="text-sm text-slate-400">No features added yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Display Settings */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-bold text-slate-900">Display</h2>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Icon
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {ICONS.map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, icon: value }))}
                                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors ${form.icon === value
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-xs">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Color Theme
                            </label>
                            <div className="flex gap-2">
                                {COLORS.map(({ value, label, bg }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setForm(prev => ({ ...prev, color_theme: value }))}
                                        className={`w-10 h-10 rounded-full ${bg} transition-transform ${form.color_theme === value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                                            }`}
                                        title={label}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                value={form.sort_order}
                                onChange={(e) => setForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                min={0}
                            />
                            <p className="text-xs text-slate-400 mt-1">Lower numbers appear first</p>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h2 className="font-bold text-slate-900">Visibility</h2>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                            />
                            <div>
                                <div className="font-medium">Active</div>
                                <div className="text-xs text-slate-400">Show on booking page</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_featured}
                                onChange={(e) => setForm(prev => ({ ...prev, is_featured: e.target.checked }))}
                                className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                            />
                            <div>
                                <div className="font-medium">Featured</div>
                                <div className="text-xs text-slate-400">Show "POPULAR" badge</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </form>
    );
}
