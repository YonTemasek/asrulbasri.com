'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Calendar, Clock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [booking, setBooking] = useState<{
        service_name: string;
        booking_date: string;
        booking_time: string;
        customer_email: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            // Fetch booking details
            fetchBookingDetails();
        } else {
            setLoading(false);
        }
    }, [sessionId]);

    const fetchBookingDetails = async () => {
        try {
            const res = await fetch(`/api/bookings/success?session_id=${sessionId}`);
            const data = await res.json();
            if (data.booking) {
                setBooking(data.booking);
            }
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
            <div className="max-w-lg mx-auto px-6 text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-emerald-500" size={40} />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-4">
                    Booking Confirmed!
                </h1>

                <p className="text-slate-600 mb-8">
                    Thank you for your booking. We've sent a confirmation to your email.
                </p>

                {/* Booking Details */}
                {booking && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 text-left mb-8">
                        <h2 className="font-bold text-lg mb-4">Booking Details</h2>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-emerald-500" size={18} />
                                <span>
                                    {new Date(booking.booking_date).toLocaleDateString('en-MY', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="text-emerald-500" size={18} />
                                <span>{booking.booking_time?.slice(0, 5) || '10:00'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="text-emerald-500" size={18} />
                                <span>{booking.customer_email}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* What's Next */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-left mb-8">
                    <h3 className="font-bold text-amber-800 mb-2">What's Next?</h3>
                    <ul className="text-sm text-amber-700 space-y-2">
                        <li>• Check your email for confirmation</li>
                        <li>• You'll receive a Google Meet link before your session</li>
                        <li>• We'll send you reminders 24h and 1h before</li>
                    </ul>
                </div>

                {/* CTA */}
                <Link href="/">
                    <Button primary className="inline-flex items-center gap-2">
                        Back to Home
                        <ArrowRight size={16} />
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
