'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, GripVertical, MessageSquare, Users, Briefcase, Layers, PenTool, Cpu } from 'lucide-react';
import { Service } from '@/lib/supabase';

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
    MessageSquare,
    Users,
    Briefcase,
    Layers,
    PenTool,
    Cpu,
};

// Color themes
const COLOR_THEMES: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
};

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/admin/services');
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (service: Service) => {
        try {
            await fetch(`/api/admin/services/${service.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !service.is_active }),
            });
            fetchServices();
        } catch (error) {
            console.error('Error toggling service:', error);
        }
    };

    const toggleFeatured = async (service: Service) => {
        try {
            await fetch(`/api/admin/services/${service.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_featured: !service.is_featured }),
            });
            fetchServices();
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    const deleteService = async (id: number) => {
        try {
            await fetch(`/api/admin/services/${id}`, {
                method: 'DELETE',
            });
            setDeleteConfirm(null);
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                    <p className="text-slate-600">Manage your booking services</p>
                </div>
                <Link
                    href="/dashboard/services/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    <Plus size={20} />
                    Add Service
                </Link>
            </div>

            {/* Services List */}
            {services.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <Briefcase className="mx-auto mb-4 text-slate-300" size={48} />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No services yet</h3>
                    <p className="text-slate-600 mb-6">Create your first service to start accepting bookings.</p>
                    <Link
                        href="/dashboard/services/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        <Plus size={20} />
                        Create Service
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {services.map((service) => {
                            const IconComponent = ICONS[service.icon] || Briefcase;
                            const colorClass = COLOR_THEMES[service.color_theme] || COLOR_THEMES.emerald;

                            return (
                                <div
                                    key={service.id}
                                    className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors ${!service.is_active ? 'opacity-50' : ''}`}
                                >
                                    {/* Drag Handle */}
                                    <GripVertical className="text-slate-300 cursor-grab" size={20} />

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorClass}`}>
                                        <IconComponent size={24} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 truncate">{service.name}</h3>
                                            {service.is_featured && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                                    POPULAR
                                                </span>
                                            )}
                                            {!service.is_active && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                                                    HIDDEN
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">{service.description}</p>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900">{service.price_label}</div>
                                        <div className="text-xs text-slate-400">{service.period}</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleFeatured(service)}
                                            className={`p-2 rounded-lg transition-colors ${service.is_featured ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-100 text-slate-400'}`}
                                            title={service.is_featured ? 'Remove featured' : 'Mark as featured'}
                                        >
                                            <Star size={18} fill={service.is_featured ? 'currentColor' : 'none'} />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(service)}
                                            className={`p-2 rounded-lg transition-colors ${service.is_active ? 'hover:bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
                                            title={service.is_active ? 'Hide service' : 'Show service'}
                                        >
                                            {service.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <Link
                                            href={`/dashboard/services/${service.id}`}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                            title="Edit service"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(service.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                            title="Delete service"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Delete Confirmation */}
                                    {deleteConfirm === service.id && (
                                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
                                                <h3 className="font-bold text-lg mb-2">Delete Service?</h3>
                                                <p className="text-slate-600 mb-4">
                                                    Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => deleteService(service.id)}
                                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <strong>Tip:</strong> Services marked as "Featured" will show a "POPULAR" badge. Hidden services won't appear on your booking page.
            </div>
        </div>
    );
}
