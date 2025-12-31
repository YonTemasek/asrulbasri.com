import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | Asrul Basri',
    description: 'Terms of Service for asrulbasri.com',
};

export const revalidate = 3600; // Revalidate every hour

export default async function TermsPage() {
    const { data: page } = await supabase
        .from('ab_legal_pages')
        .select('*')
        .eq('slug', 'terms')
        .single();

    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                    {page?.title || 'Terms of Service'}
                </h1>
                <p className="text-sm text-slate-600 mb-8 pb-4 border-b border-slate-200">
                    Last updated: {page?.updated_at
                        ? new Date(page.updated_at).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : 'Not set'
                    }
                </p>

                {page?.content ? (
                    <div
                        className="prose prose-lg prose-slate max-w-none
                            prose-headings:font-bold prose-headings:text-slate-900
                            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                            prose-li:text-slate-600 prose-li:mb-1
                            prose-a:text-emerald-600 prose-a:underline hover:prose-a:text-emerald-700"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                ) : (
                    <div className="text-center py-16 text-slate-600">
                        <p>Terms of Service content not yet available.</p>
                        <p className="text-sm mt-2">Please update from dashboard.</p>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-200">
                    <Link
                        href="/"
                        className="text-emerald-600 hover:text-emerald-700"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
