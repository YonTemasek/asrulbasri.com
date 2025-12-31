'use client';

import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: (email: string) => void;
}

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            // Save to ab_library_leads
            const { error: dbError } = await supabase.from('ab_library_leads').insert({
                email,
                source: 'library_gate'
            });

            if (dbError && !dbError.message.includes('duplicate')) {
                throw dbError;
            }

            // Save token to localStorage
            localStorage.setItem('library_access', 'true');
            localStorage.setItem('library_email', email);

            onSuccess(email);
        } catch (err) {
            console.error('Auth error:', err);
            // Still grant access for demo purposes
            localStorage.setItem('library_access', 'true');
            localStorage.setItem('library_email', email);
            onSuccess(email);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 transform transition-all scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Member Check-in</h2>
                    <p className="text-slate-600 text-sm">Enter your email to unlock the library.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Email Address
                        </label>
                        <input
                            autoFocus
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Unlock Access'}
                    </button>
                </form>
            </div>
        </div>
    );
}
