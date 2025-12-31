'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, ChevronRight, X, Mail, CheckCircle } from 'lucide-react';
import { LibraryBook, LibraryChapter, supabase } from '@/lib/supabase';
import { SimpleMarkdown } from './SimpleMarkdown';
import { Button } from '@/components/ui/Button';
import { ContentProtection } from '@/components/ContentProtection';

interface ReaderViewProps {
    book: LibraryBook;
    onBack: () => void;
}

export function ReaderView({ book, onBack }: ReaderViewProps) {
    const [chapters, setChapters] = useState<LibraryChapter[]>([]);
    const [activeChapter, setActiveChapter] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    // Navigate to chapter and scroll to top
    const navigateToChapter = (index: number) => {
        setActiveChapter(index);
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Email modal state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState('');

    const downloadPrice = book.download_price || "Paid";
    const isDownloadFree = downloadPrice === 'Free';

    useEffect(() => {
        fetchChapters();
    }, [book.id]);

    const fetchChapters = async () => {
        try {
            const { data, error } = await supabase
                .from('ab_library_chapters')
                .select('*')
                .eq('book_id', book.id)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setChapters(data || []);
        } catch (error) {
            console.error('Error fetching chapters:', error);
            // Demo content if no chapters
            setChapters([{
                id: 1,
                book_id: book.id,
                title: 'Introduction',
                content: `# ${book.title}\n\n${book.description || 'Welcome to this guide.'}\n\n## Getting Started\n\nThis is the beginning of your journey. Let's explore the key concepts together.\n\n> "The best way to learn is by doing."\n\n## Key Points\n\n- Start with the basics\n- Build your foundation\n- Practice regularly\n- Apply what you learn`,
                sort_order: 1,
                created_at: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const currentChapter = chapters[activeChapter];

    // Helper to clean content - remove first heading if it matches title
    const getCleanedContent = (chapter: typeof currentChapter) => {
        if (!chapter?.content) return '';
        const lines = chapter.content.split('\n');
        const title = chapter.title.toLowerCase();

        // Check first few lines for duplicate heading
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line.startsWith('#')) {
                const headingText = line.replace(/^#+\s*/, '').replace(/\*+/g, '').trim().toLowerCase();
                if (headingText === title || title.includes(headingText) || headingText.includes(title)) {
                    lines.splice(i, 1);
                    return lines.join('\n').trim();
                }
            }
        }
        return chapter.content;
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setSending(true);
        setEmailError('');

        try {
            const response = await fetch('/api/download/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, bookId: book.id })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
            } else {
                setEmailError(data.error || 'Failed to send email');
            }
        } catch {
            setEmailError('Network error. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-800">Get Your PDF</h3>
                            <button onClick={() => { setShowEmailModal(false); setEmailSent(false); setEmail(''); }} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {emailSent ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-emerald-600" size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Check Your Email!</h4>
                                <p className="text-slate-600 text-sm">We've sent a download link to <strong>{email}</strong></p>
                                <p className="text-slate-400 text-xs mt-2">Link expires in 48 hours</p>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailSubmit}>
                                <p className="text-slate-600 text-sm mb-4">Enter your email to receive the download link for <strong>{book.title}</strong></p>

                                <div className="relative mb-4">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                </div>

                                {emailError && (
                                    <p className="text-red-500 text-sm mb-4">{emailError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            Send Download Link
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-slate-400 text-center mt-4">
                                    By downloading, you agree to receive occasional updates from us.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-[80] bg-[#fcfaf2] flex flex-col h-screen overflow-hidden animate-fade-in font-serif">
                {/* Header */}
                <div className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 shadow-sm shrink-0 font-sans">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wide"
                    >
                        <ArrowLeft size={16} /> Exit Reader
                    </button>
                    <span className="font-bold text-slate-900 line-clamp-1 hidden md:block">{book.title}</span>
                    {!isDownloadFree ? (
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-emerald-700"
                        >
                            Download PDF ({downloadPrice})
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-2 rounded-full text-xs font-bold uppercase hover:bg-stone-200"
                        >
                            <Download size={14} /> Download
                        </button>
                    )}
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Chapter List */}
                    {sidebarOpen && chapters.length > 1 && (
                        <aside className="w-64 bg-white border-r border-stone-200 overflow-y-auto shrink-0 hidden md:block">
                            <div className="p-4 border-b border-stone-100">
                                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Contents</h3>
                            </div>
                            <nav className="p-2">
                                {chapters.map((chapter, index) => (
                                    <button
                                        key={chapter.id}
                                        onClick={() => navigateToChapter(index)}
                                        className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-2 transition-colors ${activeChapter === index
                                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-xs font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</span>
                                        <span className="line-clamp-1">{chapter.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>
                    )}

                    {/* Content */}
                    <div ref={contentRef} className="flex-1 overflow-y-auto py-8 px-4 md:py-12 md:px-8 flex justify-center items-start bg-[#e8e4dc]">
                        <div className="w-full max-w-[650px] bg-white shadow-2xl px-10 py-14 md:px-16 md:py-20 relative mb-8 min-h-[850px]">
                            <ContentProtection
                                enableRightClickBlock={true}
                                enableTextSelectionBlock={true}
                                showCopyrightNotice={true}
                            >
                                {loading ? (
                                    <div className="text-center py-20 text-stone-500">
                                        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                        Loading content...
                                    </div>
                                ) : currentChapter ? (
                                    <>
                                        {/* Book Header */}
                                        <div className="mb-12 text-center">
                                            <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-4">SatuLibrary Collection</p>
                                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">{book.title}</h1>
                                            <div className="w-12 h-1 bg-emerald-600 mx-auto"></div>
                                        </div>

                                        {/* Chapter Title */}
                                        {chapters.length > 1 && (
                                            <div className="mb-8 pb-4 border-b border-stone-200">
                                                {currentChapter.title.toLowerCase().startsWith('chapter') ? (
                                                    <>
                                                        <span className="text-xs font-mono text-slate-400 uppercase">
                                                            {currentChapter.title.split(':')[0]}
                                                        </span>
                                                        <h2 className="text-2xl font-bold text-slate-900">
                                                            {currentChapter.title.includes(':')
                                                                ? currentChapter.title.split(':').slice(1).join(':').trim()
                                                                : currentChapter.title}
                                                        </h2>
                                                    </>
                                                ) : (
                                                    <h2 className="text-2xl font-bold text-slate-900">{currentChapter.title}</h2>
                                                )}
                                            </div>
                                        )}

                                        {/* Content */}
                                        <SimpleMarkdown content={getCleanedContent(currentChapter)} />

                                        {/* Navigation */}
                                        <div className="mt-20 pt-10 border-t border-stone-100 flex justify-between items-center">
                                            {activeChapter > 0 ? (
                                                <button
                                                    onClick={() => navigateToChapter(activeChapter - 1)}
                                                    className="text-sm font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2"
                                                >
                                                    <ArrowLeft size={16} /> Previous
                                                </button>
                                            ) : (
                                                <div></div>
                                            )}
                                            {activeChapter < chapters.length - 1 ? (
                                                <button
                                                    onClick={() => navigateToChapter(activeChapter + 1)}
                                                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
                                                >
                                                    Next <ChevronRight size={16} />
                                                </button>
                                            ) : (
                                                <span className="italic text-stone-400 text-sm">* End of Reading *</span>
                                            )}
                                        </div>

                                        {/* Download CTA */}
                                        {!isDownloadFree && activeChapter === chapters.length - 1 && (
                                            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 mt-8 text-center">
                                                <h4 className="font-sans font-bold text-emerald-800 mb-2">Want to keep this guide?</h4>
                                                <p className="font-sans text-sm text-emerald-600 mb-4">Download the full PDF version for offline reference.</p>
                                                <Button onClick={() => setShowEmailModal(true)} className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                                                    Get PDF ({downloadPrice})
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-20 text-stone-500">
                                        <p>No content available for this book.</p>
                                    </div>
                                )}
                            </ContentProtection>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
