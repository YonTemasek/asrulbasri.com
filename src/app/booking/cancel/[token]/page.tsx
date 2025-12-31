'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';

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

export default function CancelBookingPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchBooking();
    }, [token]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/bookings/cancel?token=${token}`);
            const data = await res.json();

            if (res.ok) {
                setBooking(data.booking);
            } else {
                setError(data.error || 'Failed to load booking');
            }
        } catch {
            setError('Failed to load booking details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!reason.trim() || reason.length < 3) {
            setError('Please provide a reason for cancellation');
            return;
        }

        setCancelling(true);
        setError(null);

        try {
            const res = await fetch('/api/bookings/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, reason: reason.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to cancel booking');
            }
        } catch {
            setError('Failed to cancel booking');
        } finally {
            setCancelling(false);
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

    const formatTime = (timeStr: string) => {
        return timeStr?.slice(0, 5) || '';
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
                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Cancelled</h1>
                    <p className="text-slate-600 mb-6">
                        Your booking has been cancelled and a full refund has been processed.
                        It may take 5-10 business days to appear in your account.
                    </p>
                    <Link
                        href="/work-with-me"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Book Again
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
                        {error || 'This cancellation link is invalid or has expired.'}
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

    if (booking.status === 'cancelled') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Already Cancelled</h1>
                    <p className="text-slate-600 mb-6">
                        This booking has already been cancelled.
                    </p>
                    <Link
                        href="/work-with-me"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        Book New Session
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
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-white">
                        <h1 className="text-2xl font-bold">Cancel Booking</h1>
                        <p className="text-red-100 mt-1">Review your booking details before cancelling</p>
                    </div>

                    {/* Booking Details */}
                    <div className="p-6">
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <h2 className="font-semibold text-slate-900 mb-3">
                                {booking.service?.name || 'Session'}
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar size={16} />
                                    <span>{formatDate(booking.booking_date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock size={16} />
                                    <span>{formatTime(booking.booking_time)} (Malaysia Time)</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                                <span className="text-sm text-slate-600">Paid: </span>
                                <span className="font-semibold text-green-600">
                                    RM {booking.price_paid?.toLocaleString() || '0'}
                                </span>
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Why are you cancelling? <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Please let us know the reason for your cancellation..."
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                disabled={cancelling}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Refund Notice */}
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm">
                                ✓ A full refund of <strong>RM {booking.price_paid?.toLocaleString() || '0'}</strong> will be processed automatically.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleCancel}
                                disabled={cancelling || !reason.trim()}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing...
                                    </>
                                ) : (
                                    'Cancel & Refund'
                                )}
                            </button>
                            <Link
                                href={`/booking/reschedule/${token}`}
                                className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors text-center"
                            >
                                Reschedule Instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
