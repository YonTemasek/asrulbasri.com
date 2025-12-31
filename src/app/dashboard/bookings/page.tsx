'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Video, Clock, Mail, Phone, MessageSquare, User, AlertCircle } from 'lucide-react';
import { Booking, BlockedDate, Service } from '@/lib/supabase';

interface BookingWithService extends Booking {
    service?: Service;
}

export default function BookingsPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [bookings, setBookings] = useState<BookingWithService[]>([]);
    const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState('');

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

            const [bookingsRes, blockedRes] = await Promise.all([
                fetch(`/api/admin/bookings?month=${month}`),
                fetch('/api/admin/blocked-dates'),
            ]);

            const bookingsData = await bookingsRes.json();
            const blockedData = await blockedRes.json();

            setBookings(bookingsData.bookings || []);
            setBlockedDates(blockedData.blockedDates || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Add empty days for alignment
        for (let i = 0; i < firstDay.getDay(); i++) {
            days.push(null);
        }

        // Add days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const formatDateString = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const getBookingForDate = (date: Date) => {
        const dateStr = formatDateString(date);
        return bookings.find(b => b.booking_date === dateStr && b.status !== 'cancelled');
    };

    const isDateBlocked = (date: Date) => {
        const dateStr = formatDateString(date);
        return blockedDates.some(b => b.blocked_date === dateStr);
    };

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateClick = (date: Date) => {
        const booking = getBookingForDate(date);
        if (booking) {
            setSelectedBooking(booking);
        } else if (!isPastDate(date)) {
            setSelectedDate(formatDateString(date));
        }
    };

    const handleBlockDate = async () => {
        if (!selectedDate) return;

        try {
            await fetch('/api/admin/blocked-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate, reason: blockReason }),
            });
            setSelectedDate(null);
            setBlockReason('');
            fetchData();
        } catch (error) {
            console.error('Error blocking date:', error);
        }
    };

    const handleUnblockDate = async (date: string) => {
        try {
            await fetch(`/api/admin/blocked-dates?date=${date}`, {
                method: 'DELETE',
            });
            fetchData();
        } catch (error) {
            console.error('Error unblocking date:', error);
        }
    };

    const handleUpdateBooking = async (id: number, data: Partial<Booking>) => {
        try {
            await fetch(`/api/admin/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            setSelectedBooking(null);
            fetchData();
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };

    const handleCancelBooking = async (id: number, reason: string) => {
        try {
            await fetch(`/api/admin/bookings/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            setSelectedBooking(null);
            fetchData();
        } catch (error) {
            console.error('Error cancelling booking:', error);
        }
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const days = getDaysInMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const upcomingBookings = bookings
        .filter(b => b.status === 'paid' && new Date(b.booking_date) >= new Date())
        .slice(0, 5);

    // Bookings that need Google Meet links (paid, future, no meet link)
    const bookingsNeedingMeetLink = bookings.filter(b =>
        b.status === 'paid' &&
        new Date(b.booking_date) >= new Date() &&
        !b.google_meet_link
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
                <p className="text-slate-600">Manage your calendar and bookings</p>
            </div>

            {/* Alert Banner for Missing Meet Links */}
            {bookingsNeedingMeetLink.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800">
                                Action Required: {bookingsNeedingMeetLink.length} booking{bookingsNeedingMeetLink.length > 1 ? 's' : ''} need Google Meet links
                            </h3>
                            <div className="mt-2 space-y-2">
                                {bookingsNeedingMeetLink.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-900">{booking.customer_name}</span>
                                            <span className="text-slate-600 text-sm ml-2">
                                                {new Date(booking.booking_date).toLocaleDateString('en-MY', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                                {booking.booking_time && ` • ${booking.booking_time.slice(0, 5)}`}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="text-sm px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                        >
                                            Add Link
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold">{monthName}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                                {day}
                            </div>
                        ))}

                        {/* Days */}
                        {days.map((date, index) => {
                            if (!date) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const booking = getBookingForDate(date);
                            const blocked = isDateBlocked(date);
                            const past = isPastDate(date);
                            const isToday = formatDateString(date) === formatDateString(new Date());

                            let bgColor = 'hover:bg-slate-50';
                            let textColor = 'text-slate-900';
                            let cursor = 'cursor-pointer';

                            if (past) {
                                bgColor = '';
                                textColor = 'text-slate-300';
                                cursor = 'cursor-default';
                            } else if (booking) {
                                if (booking.status === 'paid') {
                                    bgColor = 'bg-emerald-100 hover:bg-emerald-200';
                                    textColor = 'text-emerald-700';
                                } else if (booking.status === 'pending') {
                                    bgColor = 'bg-amber-100 hover:bg-amber-200';
                                    textColor = 'text-amber-700';
                                }
                            } else if (blocked) {
                                bgColor = 'bg-red-100 hover:bg-red-200';
                                textColor = 'text-red-700';
                            }

                            return (
                                <div
                                    key={formatDateString(date)}
                                    onClick={() => !past && handleDateClick(date)}
                                    className={`aspect-square p-1 rounded-lg ${bgColor} ${cursor} transition-colors relative`}
                                >
                                    <div className={`text-sm font-medium ${textColor} ${isToday ? 'underline' : ''}`}>
                                        {date.getDate()}
                                    </div>
                                    {booking && (
                                        <div className="text-[10px] truncate font-medium">
                                            {booking.service?.name || 'Booking'}
                                        </div>
                                    )}
                                    {blocked && !booking && (
                                        <div className="text-[10px] font-medium">Blocked</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mt-6 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                            <span>Booked</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-100 rounded"></div>
                            <span>Pending</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-100 rounded"></div>
                            <span>Blocked</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Upcoming Bookings</h3>
                    {upcomingBookings.length === 0 ? (
                        <p className="text-sm text-slate-400">No upcoming bookings</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingBookings.map(booking => (
                                <div
                                    key={booking.id}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                                >
                                    <div className="font-medium text-sm">{booking.customer_name}</div>
                                    <div className="text-xs text-slate-600">
                                        {new Date(booking.booking_date).toLocaleDateString('en-MY', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                        {booking.booking_time && ` • ${booking.booking_time.slice(0, 5)}`}
                                    </div>
                                    <div className="text-xs text-emerald-600 font-medium mt-1">
                                        {booking.service?.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Block Date Modal */}
            {selectedDate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {isDateBlocked(new Date(selectedDate)) ? 'Unblock Date' : 'Block Date'}
                            </h3>
                            <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-slate-600 mb-4">
                            {new Date(selectedDate).toLocaleDateString('en-MY', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>

                        {isDateBlocked(new Date(selectedDate)) ? (
                            <button
                                onClick={() => {
                                    handleUnblockDate(selectedDate);
                                    setSelectedDate(null);
                                }}
                                className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Unblock This Date
                            </button>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="Reason (optional)"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg mb-4"
                                />
                                <button
                                    onClick={handleBlockDate}
                                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Block This Date
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onUpdate={handleUpdateBooking}
                    onCancel={handleCancelBooking}
                />
            )}
        </div>
    );
}

// Booking Detail Modal Component
function BookingDetailModal({
    booking,
    onClose,
    onUpdate,
    onCancel,
}: {
    booking: BookingWithService;
    onClose: () => void;
    onUpdate: (id: number, data: Partial<Booking>) => void;
    onCancel: (id: number, reason: string) => void;
}) {
    const [meetLink, setMeetLink] = useState(booking.google_meet_link || '');
    const [adminNotes, setAdminNotes] = useState(booking.admin_notes || '');
    const [bookingTime, setBookingTime] = useState(booking.booking_time?.slice(0, 5) || '10:00');
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelError, setCancelError] = useState('');

    const handleSave = () => {
        onUpdate(booking.id, {
            google_meet_link: meetLink,
            admin_notes: adminNotes,
            booking_time: bookingTime + ':00',
        });
    };

    const handleCancelClick = () => {
        setShowCancelConfirm(true);
        setCancelError('');
    };

    const handleConfirmCancel = () => {
        if (!cancelReason.trim() || cancelReason.length < 3) {
            setCancelError('Please provide a reason for cancellation (minimum 3 characters)');
            return;
        }
        onCancel(booking.id, cancelReason.trim());
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Booking Details</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                        <User className="text-slate-400" size={18} />
                        <span className="font-medium">{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="text-slate-400" size={18} />
                        <a href={`mailto:${booking.customer_email}`} className="text-emerald-600 hover:underline">
                            {booking.customer_email}
                        </a>
                    </div>
                    {booking.customer_phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="text-slate-400" size={18} />
                            <a href={`tel:${booking.customer_phone}`} className="text-emerald-600 hover:underline">
                                {booking.customer_phone}
                            </a>
                        </div>
                    )}
                </div>

                {/* Booking Info */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Service</span>
                        <span className="font-medium">{booking.service?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Date</span>
                        <span className="font-medium">
                            {new Date(booking.booking_date).toLocaleDateString('en-MY', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600">Time</span>
                        <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="px-2 py-1 border border-slate-200 rounded text-sm"
                        />
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Amount</span>
                        <span className="font-medium text-emerald-600">
                            RM {booking.price_paid?.toLocaleString() || '0'}
                        </span>
                    </div>
                </div>

                {/* Customer Notes */}
                {booking.notes && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                            <MessageSquare size={16} />
                            Customer Notes
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                            {booking.notes}
                        </div>
                    </div>
                )}

                {/* Google Meet Link */}
                <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Video size={16} />
                        Google Meet Link
                    </label>
                    <input
                        type="url"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Admin Notes (Private)
                    </label>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notes for yourself..."
                        rows={3}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                        Save Changes
                    </button>
                    {booking.status !== 'cancelled' && !showCancelConfirm && (
                        <button
                            onClick={handleCancelClick}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>

                {/* Cancel Confirmation */}
                {showCancelConfirm && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-semibold text-red-800 mb-2">Confirm Cancellation</h4>
                        <p className="text-sm text-red-700 mb-3">This will cancel the booking and process a full refund to the customer.</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Why are you cancelling? (required)"
                            rows={2}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm mb-2"
                        />
                        {cancelError && (
                            <p className="text-sm text-red-600 mb-2">{cancelError}</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={handleConfirmCancel}
                                disabled={!cancelReason.trim()}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Confirm Cancel & Refund
                            </button>
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Open Meet Link */}
                {meetLink && (
                    <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 hover:underline"
                    >
                        <ExternalLink size={14} />
                        Open Google Meet
                    </a>
                )}
            </div>
        </div>
    );
}
