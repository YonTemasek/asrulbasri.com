'use client';

import React from 'react';
import { X, Eye, Download, ShoppingBag, CheckCircle } from 'lucide-react';
import { LibraryBook } from '@/lib/supabase';

interface ResourceModalProps {
    book: LibraryBook;
    onClose: () => void;
    onRead: () => void;
    onDownload: () => void;
}

export function ResourceModal({ book, onClose, onRead, onDownload }: ResourceModalProps) {
    const isFree = book.price === 'Free';
    const downloadPrice = book.download_price || book.price;
    const isDownloadFree = downloadPrice === 'Free';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-slate-100"
                >
                    <X size={24} className="text-slate-600" />
                </button>

                {/* Book Cover */}
                <div className="p-8 md:p-12 flex flex-col justify-center items-center relative bg-slate-50 border-r border-slate-100">
                    <div
                        className={`w-48 md:w-64 aspect-[3/4] shadow-2xl bg-white rounded-lg border border-slate-200 flex items-center justify-center text-center p-6 transform rotate-1 ${book.image_color || 'bg-slate-100'}`}
                    >
                        <div>
                            <div className="w-8 h-1 bg-emerald-500 mx-auto mb-4"></div>
                            <h1 className={`font-bold text-2xl uppercase tracking-wider leading-tight ${book.text_color || 'text-slate-900'}`}>
                                {book.title}
                            </h1>
                            <p className="text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-semibold">
                                {book.category}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 overflow-y-auto bg-white flex-1">
                    <div className="mb-8">
                        {book.tag && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider mb-4 inline-block ${book.tag === 'Premium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                {book.tag}
                            </span>
                        )}
                        <span className="text-emerald-600 font-bold text-xs uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-full ml-2">
                            {book.category}
                        </span>

                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 mt-4 leading-tight">
                            {book.title}
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            {book.description}
                        </p>

                        <div className="flex items-center gap-4 mb-8">
                            {isFree ? (
                                <div>
                                    <span className="text-3xl font-bold text-slate-900 tracking-tight">Free Reading</span>
                                    {!isDownloadFree && (
                                        <div className="text-xs text-slate-600 mt-1">Download: {downloadPrice}</div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-3xl font-bold text-slate-900 tracking-tight">{book.price}</span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {isFree ? (
                                <>
                                    <button
                                        onClick={onRead}
                                        className="w-full bg-slate-900 text-white py-4 rounded-full font-medium text-[0.95rem] hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        Read Online <Eye size={18} />
                                    </button>
                                    {isDownloadFree ? (
                                        <button
                                            onClick={onDownload}
                                            className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-full font-medium text-[0.9rem] hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            Download PDF (Free) <Download size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => book.payment_link && window.open(book.payment_link, '_blank')}
                                            className="w-full bg-white text-slate-900 border border-slate-200 py-3 rounded-full font-medium text-[0.9rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            Download PDF ({downloadPrice}) <Download size={16} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => book.payment_link && window.open(book.payment_link, '_blank')}
                                    className="w-full bg-slate-900 text-white py-4 rounded-full font-medium text-[0.95rem] hover:bg-black hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-xl"
                                >
                                    Buy Full Access <ShoppingBag size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <hr className="border-slate-100 my-8" />

                    {/* What's Inside */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-500" /> What's Inside
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <span>Complete guide with step-by-step instructions</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <span>Practical examples and templates</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-600 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                <span>Checklists for implementation</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
