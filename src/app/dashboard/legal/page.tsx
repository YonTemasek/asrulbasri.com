'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Save, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RichTextEditor } from '@/components/RichTextEditor';

interface LegalPage {
    slug: string;
    title: string;
    content: string;
    updated_at?: string;
}

export default function LegalPagesPage() {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [pages, setPages] = useState<{ privacy: LegalPage; terms: LegalPage }>({
        privacy: { slug: 'privacy', title: 'Privacy Policy', content: '' },
        terms: { slug: 'terms', title: 'Terms of Service', content: '' },
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const response = await fetch('/api/legal');
            const data = await response.json();

            if (data.pages) {
                const privacyPage = data.pages.find((p: LegalPage) => p.slug === 'privacy');
                const termsPage = data.pages.find((p: LegalPage) => p.slug === 'terms');

                setPages({
                    privacy: privacyPage || { slug: 'privacy', title: 'Privacy Policy', content: '' },
                    terms: termsPage || { slug: 'terms', title: 'Terms of Service', content: '' },
                });
            }
        } catch (error) {
            console.error('Error fetching legal pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentPage = pages[activeTab];
            const response = await fetch('/api/legal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: activeTab,
                    title: currentPage.title,
                    content: currentPage.content,
                }),
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error saving:', error);
        } finally {
            setSaving(false);
        }
    };

    const updatePage = (field: 'title' | 'content', value: string) => {
        setPages(prev => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [field]: value }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Legal Pages</h1>
                    <p className="text-slate-600 mt-1">Manage Privacy Policy and Terms of Service</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showPreview
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                    >
                        <Eye size={16} />
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <Button
                        primary
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saved ? (
                            <><Check size={16} className="mr-2" /> Saved</>
                        ) : saving ? (
                            'Saving...'
                        ) : (
                            <><Save size={16} className="mr-2" /> Save Changes</>
                        )}
                    </Button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('privacy')}
                    className={`pb-3 px-1 font-medium transition-colors ${activeTab === 'privacy'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-slate-600 hover:text-slate-700'
                        }`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Privacy Policy
                </button>
                <button
                    onClick={() => setActiveTab('terms')}
                    className={`pb-3 px-1 font-medium transition-colors ${activeTab === 'terms'
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-slate-600 hover:text-slate-700'
                        }`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Terms of Service
                </button>
            </div>

            {/* Editor/Preview Area */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                {/* Title */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Page Title
                    </label>
                    <input
                        value={pages[activeTab].title}
                        onChange={(e) => updatePage('title', e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-lg text-lg font-semibold"
                        placeholder="Enter page title..."
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        Page Content
                    </label>

                    {showPreview ? (
                        // Preview Mode
                        <div className="border border-slate-200 rounded-lg p-6 min-h-[400px] bg-slate-50">
                            <div
                                className="prose prose-slate max-w-none
                                    prose-headings:font-bold prose-headings:text-slate-900
                                    prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                                    prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                                    prose-p:text-slate-600 prose-p:leading-relaxed
                                    prose-ul:list-disc prose-ol:list-decimal
                                    prose-a:text-emerald-600"
                                dangerouslySetInnerHTML={{ __html: pages[activeTab].content || '<p class="text-slate-400">No content yet...</p>' }}
                            />
                        </div>
                    ) : (
                        // Edit Mode with Rich Text Editor
                        <RichTextEditor
                            value={pages[activeTab].content}
                            onChange={(value) => updatePage('content', value)}
                            placeholder={`Start typing your ${activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}...`}
                        />
                    )}

                    <p className="text-xs text-slate-400 mt-2">
                        Use the toolbar to format text. Click Preview to see how it will look.
                    </p>
                </div>

                {/* Preview Link */}
                <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-sm text-slate-600">
                        Public URL: <code className="bg-slate-100 px-2 py-1 rounded">/{activeTab}</code>
                    </p>
                    <a
                        href={`/${activeTab}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                        Open Public Page →
                    </a>
                </div>
            </div>
        </div>
    );
}
