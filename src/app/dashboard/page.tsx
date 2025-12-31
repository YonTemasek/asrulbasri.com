'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, ShoppingBag, Mail, Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Stats {
    revenue: number;
    subscribers: number;
    products: number;
    bookings: number;
}

interface RecentLead {
    id: number;
    email: string;
    source: string | null;
    created_at: string;
}

interface UpcomingBooking {
    id: number;
    customer_name: string;
    customer_email: string;
    booking_date: string;
    booking_time: string;
    status: string;
    service?: { name: string };
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<Stats>({
        revenue: 0,
        subscribers: 0,
        products: 0,
        bookings: 0,
    });
    const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Fetch all data
            const [booksRes, leadsRes, bookingsRes, upcomingRes] = await Promise.all([
                supabase.from('ab_library_books').select('id', { count: 'exact' }),
                supabase.from('ab_library_leads').select('*').order('created_at', { ascending: false }).limit(5),
                supabase.from('ab_bookings').select('price_paid').eq('status', 'paid'),
                supabase.from('ab_bookings')
                    .select('*, service:ab_services(name)')
                    .gte('booking_date', today)
                    .eq('status', 'paid')
                    .order('booking_date', { ascending: true })
                    .limit(5),
            ]);

            // Calculate total revenue from bookings
            const totalRevenue = bookingsRes.data?.reduce((sum, b) => sum + (b.price_paid || 0), 0) || 0;

            setStats({
                revenue: totalRevenue,
                subscribers: leadsRes.data?.length || 0,
                products: booksRes.count || 0,
                bookings: bookingsRes.data?.length || 0,
            });

            setRecentLeads(leadsRes.data || []);
            setUpcomingBookings(upcomingRes.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setStats({ revenue: 0, subscribers: 0, products: 0, bookings: 0 });
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, change, href }: { title: string; value: string | number; icon: React.ElementType; change?: string; href?: string }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                    <Icon size={20} className="text-slate-600" />
                </div>
                {change && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        {change}
                    </span>
                )}
            </div>
            <div className="text-slate-600 text-sm font-medium mb-1">{title}</div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
                {href && (
                    <Link href={href} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                        View <ArrowRight size={14} />
                    </Link>
                )}
            </div>
        </div>
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatBookingDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        }
        return date.toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="mb-10">
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-slate-600 mt-1">Welcome back! Here's what's happening.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Revenue" value={`RM ${stats.revenue.toLocaleString()}`} icon={BarChart3} href="/dashboard/bookings" />
                <StatCard title="Bookings" value={stats.bookings} icon={Calendar} href="/dashboard/bookings" />
                <StatCard title="Products" value={stats.products} icon={ShoppingBag} href="/dashboard/products" />
                <StatCard title="Subscribers" value={stats.subscribers} icon={Users} href="/dashboard/subscribers" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Bookings */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Upcoming Bookings</h3>
                        <Link href="/dashboard/bookings" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {upcomingBookings.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingBookings.map((booking) => (
                                <div key={booking.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="text-emerald-600" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 truncate">{booking.customer_name}</div>
                                        <div className="text-sm text-slate-600">{booking.service?.name}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-slate-900">{formatBookingDate(booking.booking_date)}</div>
                                        <div className="text-sm text-slate-600 flex items-center gap-1 justify-end">
                                            <Clock size={12} />
                                            {booking.booking_time?.slice(0, 5) || '10:00'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No upcoming bookings</p>
                        </div>
                    )}
                </div>

                {/* Recent Subscribers */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Recent Subscribers</h3>
                        <Link href="/dashboard/subscribers" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentLeads.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {recentLeads.map((lead) => (
                                <div key={lead.id} className="flex justify-between py-3">
                                    <div>
                                        <span className="font-medium text-slate-900">{lead.email}</span>
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${lead.source === 'library_gate'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-purple-50 text-purple-600'
                                            }`}>
                                            {lead.source || 'unknown'}
                                        </span>
                                    </div>
                                    <span className="text-slate-600 text-sm">{formatDate(lead.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <Mail size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No subscribers yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
