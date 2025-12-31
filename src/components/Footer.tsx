import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Mail } from 'lucide-react';
import { BrandLogo } from './ui/BrandLogo';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                {/* Logo & Description */}
                <div className="col-span-2">
                    {/* Secret link to dashboard */}
                    <Link href="/dashboard" className="mb-6 block">
                        <BrandLogo dark align="start" />
                    </Link>
                    <p className="max-w-sm mb-6">
                        Execution over theory. Helping you build systems, leverage tools, and master the operator mindset.
                    </p>
                    <div className="flex gap-4">
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            <Linkedin size={20} />
                        </a>
                        <a href="mailto:hello@asrulbasri.com" className="hover:text-white transition-colors">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>

                {/* Sitemap */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Sitemap</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link>
                        </li>
                        <li>
                            <Link href="/services" className="hover:text-emerald-400 transition-colors">Systems</Link>
                        </li>
                        <li>
                            <Link href="/articles" className="hover:text-emerald-400 transition-colors">Thinking</Link>
                        </li>
                        <li>
                            <Link href="/work-with-me" className="hover:text-emerald-400 transition-colors">Work With Me</Link>
                        </li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Legal</h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        </li>
                        <li>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </li>
                    </ul>
                    <div className="mt-8 text-xs text-slate-600">
                        © {new Date().getFullYear()} Asrul Basri. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
