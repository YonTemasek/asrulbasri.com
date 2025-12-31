import React from 'react';
import Link from 'next/link';
import { Briefcase, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';

export default function AboutPage() {
    return (
        <div className="animate-fade-in pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8">
                <SectionLabel text="About Me" />
                <h1 className="text-5xl md:text-7xl font-bold mb-8">How I Work.</h1>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 grid md:grid-cols-12 gap-12">
                {/* Sticky Image */}
                <div className="md:col-span-5">
                    <div className="sticky top-24">
                        <img
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop"
                            alt="Workspace"
                            className="w-full aspect-[4/5] object-cover grayscale rounded-2xl shadow-xl"
                        />
                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                            <Camera size={14} /> <span>Workspace • Kuala Lumpur</span>
                        </div>
                    </div>
                </div>

                {/* Story Content */}
                <div className="md:col-span-7">
                    <div className="prose prose-lg prose-slate mb-12">
                        <p className="text-2xl text-slate-900 leading-relaxed font-medium mb-6">
                            "Is there a simpler way to do this?"
                        </p>
                        <p className="text-slate-600">
                            I've always been obsessed with fixing things. My career taught me that success isn't about having the fanciest ideas—it's about getting things done consistently.
                        </p>
                        <p className="text-slate-600">
                            I moved from managing chaotic projects to designing simple systems that prevent the chaos in the first place.
                        </p>
                    </div>

                    {/* Experience Card */}
                    <div className="bg-slate-50 p-8 border border-slate-200 rounded-2xl mb-12">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-emerald-600" /> My Experience
                        </h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="font-mono text-emerald-600 font-bold">01</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Corporate Operations</h4>
                                    <p className="text-sm text-slate-600">Helping big teams work faster and with less stress.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-mono text-emerald-600 font-bold">02</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Travel Planning</h4>
                                    <p className="text-sm text-slate-600">Managing complex trips and logistics so everything runs smoothly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-mono text-emerald-600 font-bold">03</div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Digital Systems</h4>
                                    <p className="text-sm text-slate-600">Setting up technology that serves humans, not the other way around.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 text-white p-10 text-center rounded-2xl">
                        <h3 className="text-2xl font-bold mb-4">What I'm Doing Now</h3>
                        <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                            I'm currently helping people install a better "Operating System" for their life and business.
                        </p>
                        <Link href="/services">
                            <Button className="bg-emerald-500 text-white border-none mx-auto hover:bg-emerald-400">
                                See What I Build
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
