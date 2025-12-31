'use client';

import React, { useState, useEffect } from 'react';
import { Save, Twitter, Linkedin, Instagram, Github, Mail, Globe, CheckCircle2, AlertCircle } from 'lucide-react';

interface Setting {
    key: string;
    value: string;
    description: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings(data.settings);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    };

    const saveSettings = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: `Failed to update settings: ${error.message}` });
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

    const socialSettings = settings.filter(s => s.key.startsWith('social_'));
    const contactSettings = settings.filter(s => s.key.startsWith('contact_'));

    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
                <p className="text-slate-600">Configure your social media links and contact information</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Social Media Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Twitter size={20} className="text-emerald-500" /> Social Media Links
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    {socialSettings.map((setting) => (
                        <div key={setting.key} className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 block capitalize">
                                {setting.key.replace('social_', '').replace('_', ' ')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Globe size={16} />
                                </span>
                                <input
                                    type="text"
                                    value={setting.value}
                                    onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                    placeholder="https://"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-slate-400">{setting.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Mail size={20} className="text-emerald-500" /> Contact Information
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    {contactSettings.map((setting) => (
                        <div key={setting.key} className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 block capitalize">
                                {setting.key.replace('contact_', '').replace('_', ' ')}
                            </label>
                            <input
                                type="text"
                                value={setting.value}
                                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-400">{setting.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
