'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, MessageSquare, Users, Briefcase, Layers, PenTool, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
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

// Color themes for cards
const COLOR_THEMES: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
};

export default function WorkWithMePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in pt-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
                {/* Header */}
                <div className="mb-16">
                    <SectionLabel text="Work Together" />
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Let's Get Started.</h1>
                    <p className="text-xl text-slate-600 max-w-2xl">
                        I can help you build these systems in your own life or business. Choose an option below.
                    </p>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const IconComponent = ICONS[service.icon] || Briefcase;
                        const themeClass = COLOR_THEMES[service.color_theme] || COLOR_THEMES.emerald;

                        return (
                            <Card
                                key={service.id}
                                className={`flex flex-col p-0 border-0 shadow-lg ${service.is_featured ? 'ring-2 ring-emerald-500' : ''}`}
                                hover={false}
                            >
                                {/* Header with color theme */}
                                <div className={`p-8 ${themeClass} relative h-40`}>
                                    {service.is_featured && (
                                        <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            POPULAR
                                        </span>
                                    )}
                                    <div className="bg-white/60 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-current">
                                        <IconComponent size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                                </div>

                                {/* Content */}
                                <div className="p-8 bg-white flex-1 flex flex-col">
                                    <div className="text-3xl font-bold mb-6 text-slate-900">
                                        {service.price_label}
                                        <span className="text-sm font-normal text-slate-400">{service.period}</span>
                                    </div>
                                    <p
                                        className="text-sm text-slate-600 mb-6 line-clamp-3"
                                        title={service.description || ''}
                                    >
                                        {service.description}
                                    </p>
                                    <ul className="text-sm text-slate-600 space-y-4 mb-8 flex-1">
                                        {(service.features || []).map((feature, i) => (
                                            <li key={i} className="flex gap-3">
                                                <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={`/book/${service.id}`}>
                                        <Button primary={service.is_featured} className="w-full justify-center">
                                            Book Now
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Custom Pricing Card */}
                <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <div className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                                CUSTOM PROJECT
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Need something custom?</h3>
                            <p className="text-slate-600">
                                Have a unique project or need a tailored solution? Let's discuss your specific requirements
                                and I'll provide a custom quote.
                            </p>
                        </div>
                        <a href="mailto:hello@asrulbasri.com?subject=Custom%20Project%20Inquiry">
                            <Button className="bg-amber-500 text-white border-none hover:bg-amber-600 whitespace-nowrap">
                                Request Custom Quote
                            </Button>
                        </a>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Have questions?</h2>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                        Not sure which service is right for you? Send me an email and I'll help you figure it out.
                    </p>
                    <a href="mailto:hello@asrulbasri.com">
                        <Button className="bg-emerald-500 text-white border-none hover:bg-emerald-400">
                            Email Me
                        </Button>
                    </a>
                </div>
            </div>
        </div>
    );
}
