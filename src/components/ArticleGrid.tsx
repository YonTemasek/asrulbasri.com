'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/lib/supabase';

interface ArticleGridProps {
    posts: BlogPost[];
    initialLimit?: number;
    incrementBy?: number;
}

export function ArticleGrid({ posts, initialLimit = 9, incrementBy = 6 }: ArticleGridProps) {
    const [visibleCount, setVisibleCount] = useState(initialLimit);

    const visiblePosts = posts.slice(0, visibleCount);
    const hasMore = visibleCount < posts.length;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const stripHtml = (html: string | null): string => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    };

    const getExcerpt = (post: BlogPost, maxLength: number = 120): string => {
        if (post.excerpt) return stripHtml(post.excerpt).slice(0, maxLength);
        return stripHtml(post.content).slice(0, maxLength) + '...';
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {visiblePosts.map((post: BlogPost) => (
                    <Link key={post.id} href={post.slug ? `/articles/${post.slug}` : `/articles`}>
                        <article className="group bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full">
                            <div className="aspect-[3/2] rounded-2xl overflow-hidden mb-6 relative">
                                <img
                                    src={post.image_url || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800'}
                                    alt={post.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-900">
                                    {post.category}
                                </div>
                            </div>
                            <div className="px-2 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
                                    <Calendar size={12} /> {formatDate(post.publish_date || post.created_at)}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-emerald-700 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-1">
                                    {getExcerpt(post, 120)}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={12} /> {post.read_time}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:underline">
                                        Read Now <ArrowRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="text-center mt-12">
                    <button
                        onClick={() => setVisibleCount(prev => prev + incrementBy)}
                        className="px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors"
                    >
                        Load More Articles ({posts.length - visibleCount} remaining)
                    </button>
                </div>
            )}
        </>
    );
}
