import React from 'react';
import Link from 'next/link';
import { Cpu, Layers, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionLabel } from '@/components/ui/SectionLabel';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Services",
    description: "Business operations, digital tools, and life systems. Simple workflows that actually work in real life.",
    openGraph: {
        title: "Services | Asrul Basri",
        description: "Business operations, digital tools, and life systems. Simple workflows that actually work in real life.",
    },
};

export default function SystemsPage() {
    return (
        <div className="animate-fade-in pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20">
                {/* Header */}
                <div className="mb-12">
                    <SectionLabel text="What I Build" />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple Systems.</h1>
                    <p className="text-xl text-slate-600 max-w-2xl">
                        I turn chaos into order. Here are the things I build to help you find clarity.
                    </p>
                </div>

                {/* Service Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <Card className="p-8 group cursor-default" hover={false}>
                        <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center rounded-lg mb-6 group-hover:bg-emerald-500 transition-colors">
                            <Cpu className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Business Operations</h3>
                        <p className="text-slate-600 mb-4">
                            Workflows that let your business run without you constantly checking in.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-4">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Team Onboarding
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Project Tracking
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Simple Dashboards
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-8 group cursor-default" hover={false}>
                        <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center rounded-lg mb-6 group-hover:bg-emerald-500 transition-colors">
                            <Layers className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Digital Tools</h3>
                        <p className="text-slate-600 mb-4">
                            Connecting your apps so they talk to each other and save you time.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-4">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Notion Setup
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Automations (Zapier)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Organizing Files
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-8 group cursor-default" hover={false}>
                        <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center rounded-lg mb-6 group-hover:bg-emerald-500 transition-colors">
                            <PenTool className="text-emerald-600 group-hover:text-white transition-colors" size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Life & Travel</h3>
                        <p className="text-slate-600 mb-4">
                            Planning frameworks for smooth travel and a well-organized life.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-2 mb-6 border-t border-slate-100 pt-4">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Travel Checklists
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Personal Contacts
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Asset Tracking
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Why Section */}
                <div className="border-t border-slate-200 pt-16 grid md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Why Most Plans Fail</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Most systems fail because they are too rigid. They look good on paper but are annoying to use. I design systems that are flexible—easy enough to use on a bad day, but powerful enough to get results.
                        </p>
                    </div>
                    <div className="bg-slate-50 p-8 flex flex-col justify-center items-center text-center rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-xl mb-2">Need help organizing?</h4>
                        <p className="text-sm text-slate-600 mb-6">Let's chat about your current workflow.</p>
                        <Link href="/work-with-me">
                            <Button primary>Work With Me</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
