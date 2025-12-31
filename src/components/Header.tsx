'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from './ui/BrandLogo';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about' },
    { id: 'systems', label: 'What I Build', path: '/services' },
    { id: 'frameworks', label: 'Insights', path: '/articles' },
    { id: 'tools', label: 'Library', path: '/library' },
    { id: 'work', label: 'Work With Me', path: '/work-with-me' },
];

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 h-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between">
                <Link href="/">
                    <BrandLogo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.id}
                            href={item.path}
                            className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-24 left-0 right-0 bg-white border-b border-slate-200 md:hidden animate-fade-in">
                    <nav className="flex flex-col p-6 max-w-7xl mx-auto">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.id}
                                href={item.path}
                                className="py-3 text-lg font-medium text-slate-900 hover:text-emerald-600 border-b border-slate-100 last:border-0"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
