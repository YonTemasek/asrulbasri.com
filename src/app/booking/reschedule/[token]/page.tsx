'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Calendar, Clock, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface BookingDetails {
    id: number;
    customer_name: string;
    customer_email: string;
    booking_date: string;
    booking_time: string;
    status: string;
    price_paid: number;
    service: { name: string } | null;
}

export default function RescheduleBookingPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings/reschedule?token=${token}`);
            const data = await res.json();

            if (res.ok) {
                setBooking(data.booking);
                setUnavailableDates(data.unavailableDates || []);
            } else {
                setError(data.error || 'Failed to load booking');
            }
        } catch {
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleReschedule = async () => {
        if (!selectedDate) {
            setError('Please select a new date');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch('/api/bookings/reschedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newDate: selectedDate,
                    newTime: booking?.booking_time,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to reschedule booking');
            }
        } catch {
            setError('Failed to reschedule booking');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calendar helpers
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
        return date.toISOString().split('T')[0];
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isUnavailable = (date: Date) => {
        const dateStr = formatDateString(date);
        return unavailableDates.includes(dateStr) || dateStr === booking?.booking_date;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto text-slate-400" />
                    <p className="mt-4 text-slate-600">Loading booking details...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Rescheduled</h1>
                    <p className="text-slate-600 mb-4">
                        Your session has been rescheduled to:
                    </p>
                    <p className="text-lg font-semibold text-slate-900 mb-6">
                        {selectedDate && formatDate(selectedDate)}
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h1>
                    <p className="text-slate-600 mb-6">
                        {error || 'This reschedule link is invalid or has expired.'}
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700 mb-8"
                >
                    <ArrowLeft size={16} />
                    Back to Home
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
                        <h1 className="text-2xl font-bold">Reschedule Booking</h1>
                        <p className="text-blue-100 mt-1">Select a new date for your session</p>
                    </div>

                    {/* Current Booking */}
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-sm font-medium text-slate-600 mb-2">Current Booking</h3>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h2 className="font-semibold text-slate-900 mb-2">
                                {booking.service?.name || 'Session'}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar size={16} />
                                <span>{formatDate(booking.booking_date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-slate-600 mb-4">Select New Date</h3>

                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h4 className="font-semibold">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h4>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                                    {day}
                                </div>
                            ))}

                            {getDaysInMonth().map((date, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="aspect-square" />;
                                }

                                const dateStr = formatDateString(date);
                                const past = isPastDate(date);
                                const unavailable = isUnavailable(date);
                                const selected = selectedDate === dateStr;
                                const isCurrentBooking = dateStr === booking.booking_date;

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => !past && !unavailable && setSelectedDate(dateStr)}
                                        disabled={past || unavailable}
                                        className={`
                                            aspect-square rounded-lg text-sm font-medium transition-colors
                                            ${past ? 'text-slate-300 cursor-default' : ''}
                                            ${unavailable && !past ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''}
                                            ${isCurrentBooking ? 'bg-amber-100 text-amber-700' : ''}
                                            ${selected ? 'bg-blue-500 text-white' : ''}
                                            ${!past && !unavailable && !selected ? 'hover:bg-blue-50 text-slate-700' : ''}
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 text-xs mb-6">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-amber-100 rounded"></div>
                                <span className="text-slate-600">Current</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-slate-100 rounded"></div>
                                <span className="text-slate-600">Unavailable</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                                <span className="text-slate-600">Selected</span>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Selected Date Preview */}
                        {selectedDate && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-700 text-sm">
                                    <strong>New Date:</strong> {formatDate(selectedDate)}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleReschedule}
                                disabled={submitting || !selectedDate}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Reschedule'
                                )}
                            </button>
                            <Link
                                href={`/booking/cancel/${token}`}
                                className="flex-1 px-6 py-3 border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors text-center"
                            >
                                Cancel Instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
