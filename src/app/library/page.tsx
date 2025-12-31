'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, Plus, Minus } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { supabase, LibraryBook } from '@/lib/supabase';
import { generatePDF } from '@/lib/generatePdf';
import { AuthModal } from '@/components/library/AuthModal';
import { ResourceModal } from '@/components/library/ResourceModal';
import { ReaderView } from '@/components/library/ReaderView';

// Sample data for initial display
const SAMPLE_BOOKS: LibraryBook[] = [
    {
        id: 1,
        title: "Panduan Bisnes 2025",
        description: "Strategi menghadapi cabaran ekonomi baru dengan mentaliti Operator.",
        price: "Free",
        download_price: "RM 29",
        payment_link: null,
        category: "Strategy",
        image_color: "bg-amber-50",
        text_color: "text-amber-800",
        tag: "Must Read",
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        title: "Daily Audit Protocol",
        description: "A 5-minute morning routine to align daily tasks with quarterly goals.",
        price: "Free",
        download_price: "Free",
        payment_link: null,
        category: "Productivity",
        image_color: "bg-blue-50",
        text_color: "text-blue-600",
        tag: null,
        created_at: new Date().toISOString(),
    },
    {
        id: 3,
        title: "Travel Logistics Checklist",
        description: "The exact packing and prep list I use for international business travel.",
        price: "RM 29",
        download_price: "RM 29",
        payment_link: "https://stripe.com",
        category: "Travel",
        image_color: "bg-green-50",
        text_color: "text-green-600",
        tag: "Premium",
        created_at: new Date().toISOString(),
    },
    {
        id: 4,
        title: "Project Scoping Playbook",
        description: "How to define requirements before you write a single line of code.",
        price: "RM 49",
        download_price: "RM 49",
        payment_link: "https://stripe.com",
        category: "Strategy",
        image_color: "bg-red-50",
        text_color: "text-red-600",
        tag: null,
        created_at: new Date().toISOString(),
    },
    {
        id: 5,
        title: "The Operator's Tech Stack",
        description: "A curated list of software that I consider 'Essential' vs 'Nice to have'.",
        price: "Free",
        download_price: "Free",
        payment_link: null,
        category: "Tech",
        image_color: "bg-purple-50",
        text_color: "text-purple-600",
        tag: null,
        created_at: new Date().toISOString(),
    },
];

const FAQS = [
    { q: "How do I access the library?", a: "Simply enter your email once to unlock all free resources." },
    { q: "Do I need to pay?", a: "Reading online is mostly free. Downloading PDFs usually requires a small fee." },
    { q: "Can I download the files?", a: "Yes, you can purchase the download capability for each book." },
];

export default function ToolsPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [books, setBooks] = useState<LibraryBook[]>([]);
    const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
    const [isReading, setIsReading] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingBook, setPendingBook] = useState<LibraryBook | null>(null);

    const categories = ['All', 'Strategy', 'Productivity', 'Tech', 'Travel'];

    useEffect(() => {
        // Check localStorage for existing access
        const hasAccess = localStorage.getItem('library_access') === 'true';
        setAccessGranted(hasAccess);

        // Fetch books from Supabase
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('ab_library_books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBooks(data && data.length > 0 ? data : SAMPLE_BOOKS);
        } catch (error) {
            console.error('Error fetching books:', error);
            setBooks(SAMPLE_BOOKS);
        }
    };

    const filteredBooks = books.filter(
        (book) => activeFilter === 'All' || book.category === activeFilter
    );

    const handleBookClick = (book: LibraryBook) => {
        if (!accessGranted) {
            setPendingBook(book);
            setShowAuthModal(true);
        } else {
            setSelectedBook(book);
        }
    };

    const handleAuthSuccess = (email: string) => {
        setAccessGranted(true);
        setShowAuthModal(false);
        if (pendingBook) {
            setSelectedBook(pendingBook);
            setPendingBook(null);
        }
    };

    const handleRead = () => {
        setIsReading(true);
    };

    const handleDownload = async () => {
        if (!selectedBook) return;

        const downloadPrice = selectedBook.download_price || selectedBook.price;
        const isFree = downloadPrice === 'Free';

        if (!isFree && selectedBook.payment_link) {
            // Redirect to payment
            window.open(selectedBook.payment_link, '_blank');
        } else {
            // Generate PDF directly
            try {
                await generatePDF(selectedBook);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF. Please try again.');
            }
        }
    };

    const handleBackFromReader = () => {
        setIsReading(false);
        setSelectedBook(null);
    };

    // Show ReaderView in fullscreen mode
    if (isReading && selectedBook) {
        return (
            <ReaderView
                book={selectedBook}
                onBack={handleBackFromReader}
            />
        );
    }

    return (
        <div className="animate-fade-in bg-slate-50 min-h-screen pt-24">
            {/* Auth Modal */}
            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* Resource Modal */}
            {selectedBook && !isReading && (
                <ResourceModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onRead={handleRead}
                    onDownload={handleDownload}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
                {/* Header */}
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <SectionLabel text="SatuLibrary" />
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">Library.</h1>
                        <p className="text-slate-600 max-w-xl">
                            Koleksi template ringkas, panduan praktikal dan sistem.
                            <br />
                            <span className="text-emerald-600 font-bold">Check-in sekali untuk akses penuh.</span>
                        </p>
                    </div>
                    {accessGranted && (
                        <span className="hidden md:inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                            Access Unlocked
                        </span>
                    )}
                </div>

                {/* Category Filters */}
                <div className="mt-8 flex flex-wrap gap-2">
                    {categories.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-[0.85rem] font-medium transition border ${activeFilter === filter
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Book Grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 mt-8">
                    {filteredBooks.map((book) => (
                        <article
                            key={book.id}
                            onClick={() => handleBookClick(book)}
                            className="group bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 cursor-pointer relative"
                        >
                            {/* Tag Badge */}
                            {book.tag && (
                                <div
                                    className={`absolute top-6 right-6 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${book.tag === 'Premium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                >
                                    {book.tag}
                                </div>
                            )}

                            {/* Book Cover */}
                            <div
                                className={`rounded-xl pt-[120%] relative overflow-hidden ${book.image_color || 'bg-slate-100'}`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                    <div>
                                        <div className="w-8 h-0.5 mx-auto mb-3 opacity-50 bg-current"></div>
                                        <span
                                            className={`font-bold text-xl uppercase tracking-wider leading-snug ${book.text_color || 'text-slate-700'}`}
                                        >
                                            {book.title.split(' ').map((word, i) => (
                                                <div key={i}>{word}</div>
                                            ))}
                                        </span>
                                    </div>
                                </div>
                                {/* Lock overlay for non-authenticated users */}
                                {!accessGranted && (
                                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <Lock className="text-slate-900 w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            {/* Book Info */}
                            <div className="flex flex-col gap-1 mt-2">
                                <h3 className="text-[1rem] font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                    {book.title}
                                </h3>
                                <p className="text-[0.85rem] text-slate-600 line-clamp-2 leading-relaxed">
                                    {book.description}
                                </p>
                            </div>

                            {/* Price & CTA */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <span
                                    className={`font-bold text-sm ${book.price === 'Free' ? 'text-emerald-600' : 'text-slate-900'}`}
                                >
                                    {book.price}
                                </span>
                                <span className="text-[0.8rem] font-medium text-slate-400 group-hover:text-emerald-600 group-hover:underline flex items-center gap-1 transition-colors">
                                    {accessGranted ? 'View Details' : 'Unlock Access'} <ArrowRight size={12} />
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-[800px] mx-auto py-20 mt-12">
                    <div className="text-center mb-16">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Why This Exists
                        </h2>
                        <p className="text-xl md:text-2xl font-medium leading-relaxed text-slate-900">
                            "Setiap template di sini dibina untuk satu tujuan — jadikan kerja harian lebih jelas, lebih laju, dan lebih profesional."
                        </p>
                    </div>

                    <h2 className="text-xl font-bold mb-8 text-center text-slate-900">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-3">
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className={`bg-white border rounded-2xl p-4 cursor-pointer transition-all duration-200 ${openFaqIndex === index
                                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500'
                                    : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                            >
                                <div className="flex justify-between items-center w-full font-medium text-[0.95rem] text-slate-900">
                                    <span>{faq.q}</span>
                                    {openFaqIndex === index ? (
                                        <Minus size={16} className="text-emerald-500" />
                                    ) : (
                                        <Plus size={16} className="text-slate-400" />
                                    )}
                                </div>
                                {openFaqIndex === index && (
                                    <div className="text-slate-600 mt-3 text-sm leading-relaxed border-t border-slate-100 pt-3 animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
