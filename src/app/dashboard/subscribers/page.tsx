'use client';

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Mail } from 'lucide-react';
import { supabase, LibraryLead } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function SubscribersPage() {
    const [leads, setLeads] = useState<LibraryLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'library_gate' | 'newsletter'>('all');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('ab_library_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Remove this subscriber?')) return;

        try {
            const { error } = await supabase
                .from('ab_library_leads')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchLeads();
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    };

    const exportCSV = () => {
        const filteredLeads = filter === 'all'
            ? leads
            : leads.filter(l => l.source === filter);

        const csv = [
            ['Email', 'Source', 'Date'],
            ...filteredLeads.map(l => [
                l.email,
                l.source || 'unknown',
                new Date(l.created_at).toISOString().split('T')[0]
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscribers-${filter}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredLeads = filter === 'all'
        ? leads
        : leads.filter(l => l.source === filter);

    const libraryCount = leads.filter(l => l.source === 'library_gate').length;
    const newsletterCount = leads.filter(l => l.source === 'newsletter').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">Subscribers</h1>
                    <p className="text-slate-600 mt-1">Email leads collected from your website.</p>
                </div>
                <Button onClick={exportCSV}>
                    <Download size={16} /> Export CSV
                </Button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div
                    onClick={() => setFilter('all')}
                    className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'all' ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="text-slate-600 text-sm font-medium mb-1">Total Subscribers</div>
                    <div className="text-3xl font-bold text-slate-900">{leads.length}</div>
                </div>
                <div
                    onClick={() => setFilter('library_gate')}
                    className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'library_gate' ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="text-slate-600 text-sm font-medium mb-1">Library Check-ins</div>
                    <div className="text-3xl font-bold text-blue-600">{libraryCount}</div>
                </div>
                <div
                    onClick={() => setFilter('newsletter')}
                    className={`bg-white p-6 rounded-2xl border cursor-pointer transition-all ${filter === 'newsletter' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-200 hover:border-slate-300'
                        }`}
                >
                    <div className="text-slate-600 text-sm font-medium mb-1">Newsletter Signups</div>
                    <div className="text-3xl font-bold text-purple-600">{newsletterCount}</div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                        {filter === 'all' ? 'All Subscribers' : filter === 'library_gate' ? 'Library Check-ins' : 'Newsletter Signups'}
                        <span className="text-slate-400 font-normal ml-2">({filteredLeads.length})</span>
                    </span>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                        <tr>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} className="text-slate-400" />
                                            <span className="font-medium">{lead.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${lead.source === 'library_gate'
                                            ? 'bg-blue-50 text-blue-600'
                                            : lead.source === 'newsletter'
                                                ? 'bg-purple-50 text-purple-600'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {lead.source || 'unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{formatDate(lead.created_at)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(lead.id)}
                                            className="text-red-400 hover:text-red-600"
                                            title="Remove"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-600">
                                    No subscribers yet. Share your library and newsletter to collect leads!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
