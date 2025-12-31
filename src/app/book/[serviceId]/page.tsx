'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Clock, User, Mail, Phone, MessageSquare, CreditCard } from 'lucide-react';
import { Service } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

// Time slots from 10am to 8pm
const TIME_SLOTS = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export default function BookingPage({ params }: { params: Promise<{ serviceId: string }> }) {
    const { serviceId } = use(params);
    const router = useRouter();

    const [service, setService] = useState<Service | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('10:00');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, [serviceId]);

    const fetchData = async () => {
        try {
            const [serviceRes, availabilityRes] = await Promise.all([
                fetch(`/api/admin/services/${serviceId}`),
                fetch('/api/bookings/available'),
            ]);

            const serviceData = await serviceRes.json();
            const availabilityData = await availabilityRes.json();

            setService(serviceData.service);
            setAvailableDates(availabilityData.availableDates || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatDateString = (date: Date) => {
        // Use local timezone instead of UTC to avoid off-by-one errors
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isDateAvailable = (date: Date) => {
        const dateStr = formatDateString(date);
        return availableDates.includes(dateStr);
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDate || !form.name || !form.email) {
            alert('Please fill in all required fields');
            return;
        }

        if (!service?.stripe_price_id) {
            alert('Payment link not configured for this service. Please contact admin.');
            return;
        }

        setSubmitting(true);

        try {
            // Create pending booking first
            const res = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: parseInt(serviceId),
                    bookingDate: selectedDate,
                    bookingTime: selectedTime,
                    customerName: form.name,
                    customerEmail: form.email,
                    customerPhone: form.phone,
                    notes: form.notes,
                }),
            });

            const data = await res.json();

            if (data.error) {
                alert(data.error);
                setSubmitting(false);
                return;
            }

            // Redirect to Stripe Payment Link
            // stripe_price_id now contains the full payment link URL
            const paymentUrl = new URL(service.stripe_price_id);
            paymentUrl.searchParams.set('prefilled_email', form.email);
            paymentUrl.searchParams.set('client_reference_id', data.bookingId.toString());

            window.location.href = paymentUrl.toString();
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Something went wrong. Please try again.');
            setSubmitting(false);
        }
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Service not found</h1>
                <Link href="/work-with-me" className="text-emerald-600 hover:underline">
                    ← Back to services
                </Link>
            </div>
        );
    }

    const days = getDaysInMonth();
    const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-slate-50 pt-24">
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/work-with-me"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        Back to services
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900">Book: {service.name}</h1>
                    <p className="text-slate-600 mt-2">
                        {service.price_label} • {service.duration}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Calendar */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-emerald-500" size={20} />
                                <h2 className="font-bold text-lg">Select Date</h2>
                            </div>

                            {/* Calendar Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button type="button" onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-medium">{monthName}</span>
                                <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                                        {day}
                                    </div>
                                ))}

                                {days.map((date, index) => {
                                    if (!date) {
                                        return <div key={`empty-${index}`} className="aspect-square" />;
                                    }

                                    const dateStr = formatDateString(date);
                                    const available = isDateAvailable(date);
                                    const past = isPastDate(date);
                                    const isSelected = selectedDate === dateStr;
                                    const isToday = dateStr === formatDateString(new Date());

                                    let bgColor = 'hover:bg-slate-50';
                                    let textColor = 'text-slate-900';
                                    let cursor = 'cursor-pointer';

                                    if (past || !available) {
                                        bgColor = '';
                                        textColor = 'text-slate-300';
                                        cursor = 'cursor-not-allowed';
                                    } else if (isSelected) {
                                        bgColor = 'bg-emerald-500';
                                        textColor = 'text-white';
                                    }

                                    return (
                                        <button
                                            key={dateStr}
                                            type="button"
                                            disabled={past || !available}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${bgColor} ${textColor} ${cursor} transition-colors ${isToday && !isSelected ? 'ring-1 ring-emerald-500' : ''}`}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Selected Date Display */}
                            {selectedDate && (() => {
                                const [year, month, day] = selectedDate.split('-').map(Number);
                                const displayDate = new Date(year, month - 1, day);
                                return (
                                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                                        Selected: {displayDate.toLocaleDateString('en-MY', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                );
                            })()}

                            {/* Time Selection */}
                            <div className="mt-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="text-emerald-500" size={18} />
                                    <h3 className="font-medium">Preferred Time</h3>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {TIME_SLOTS.map(time => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${selectedTime === time
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="font-bold text-lg mb-4">Your Details</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <User size={14} />
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <Mail size={14} />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <Phone size={14} />
                                        Phone (optional)
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                                        <MessageSquare size={14} />
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Anything you'd like me to know..."
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-slate-600">Service</span>
                                    <span className="font-medium">{service.name}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-slate-600">Total</span>
                                    <span className="font-bold text-xl text-emerald-600">{service.price_label}</span>
                                </div>

                                <Button
                                    type="submit"
                                    primary
                                    className="w-full justify-center"
                                    disabled={!selectedDate || submitting}
                                >
                                    <CreditCard size={18} />
                                    {submitting ? 'Processing...' : 'Pay Now'}
                                </Button>

                                <p className="text-xs text-slate-400 text-center mt-3">
                                    You'll be redirected to Stripe for secure payment
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
