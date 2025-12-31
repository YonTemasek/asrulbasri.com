import Link from 'next/link';
import { Clock, Calendar, ArrowRight, Star, Mail } from 'lucide-react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { supabase, BlogPost } from '@/lib/supabase';
import { ArticleGrid } from '@/components/ArticleGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Articles",
    description: "Insights, frameworks, and practical guides on systems, productivity, and building better workflows.",
    openGraph: {
        title: "Articles | Asrul Basri",
        description: "Insights, frameworks, and practical guides on systems, productivity, and building better workflows.",
    },
};

export const revalidate = 60; // Revalidate every 60 seconds

// Sample data fallback
const SAMPLE_POSTS = [
    {
        id: 1,
        slug: 'how-to-actually-finish-what-you-start',
        title: "How to Actually Finish What You Start",
        created_at: "2024-10-12",
        publish_date: "2024-10-12",
        category: "Operations",
        read_time: "5 min",
        featured: true,
        views: 1200,
        image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800&auto=format&fit=crop",
        excerpt: "Why setting big goals often fails without small steps. A simple guide to getting things done daily without burning out.",
        status: "Published",
    },
];

async function getPosts() {
    try {
        const { data, error } = await supabase
            .from('ab_blog_posts')
            .select('*')
            .eq('status', 'Published')
            .order('created_at', { ascending: false });

        console.log('Fetched posts:', data?.length, 'Slugs:', data?.map(p => p.slug), error);

        if (error) {
            console.error('Error fetching posts:', error);
            return SAMPLE_POSTS as unknown as BlogPost[];
        }

        return data && data.length > 0 ? data : SAMPLE_POSTS as unknown as BlogPost[];
    } catch (e) {
        console.error('Exception fetching posts:', e);
        return SAMPLE_POSTS as unknown as BlogPost[];
    }
}

export default async function FrameworksPage() {
    const posts = await getPosts();

    const featuredPost = posts.find((p: BlogPost) => p.featured) || posts[0];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Strip HTML tags from text
    const stripHtml = (html: string) => {
        return html?.replace(/<[^>]*>/g, '') || '';
    };

    // Truncate text with ellipsis at word boundary
    const truncateText = (text: string, maxLength: number = 150) => {
        const clean = stripHtml(text);
        if (clean.length <= maxLength) return clean;

        // Find last space before maxLength to avoid cutting words
        const truncated = clean.slice(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');

        // If no space found, just cut at maxLength
        const finalText = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
        return finalText.trim() + '...';
    };

    // Get clean excerpt - prefer content if excerpt looks truncated (missing ending punctuation)
    const getExcerpt = (post: BlogPost, maxLength: number = 150) => {
        // Use content instead of excerpt since excerpt might be pre-truncated in DB
        const source = post.content || post.excerpt || '';
        return truncateText(source, maxLength);
    };

    return (
        <div className="animate-fade-in min-h-screen bg-slate-50 pt-24">
            {/* Header */}
            <div className="pt-12 pb-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <SectionLabel text="The Knowledge Base" />
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
                        Insights &<br />Thinking.
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                {/* Featured Post */}
                {featuredPost && (
                    <Link href={featuredPost.slug ? `/articles/${featuredPost.slug}` : `/articles`}>
                        <div className="group cursor-pointer grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 items-center">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden relative shadow-2xl">
                                <img
                                    src={featuredPost.image_url || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=800'}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Star size={12} className="text-emerald-500 fill-emerald-500" /> Featured
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <span className="text-emerald-600">{featuredPost.category}</span>
                                    <span>•</span>
                                    <span>{formatDate(featuredPost.publish_date || featuredPost.created_at)}</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-slate-200 pl-6">
                                    {getExcerpt(featuredPost, 250)}
                                </p>
                                <div className="pt-4 flex items-center gap-4">
                                    <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <Clock size={16} /> {featuredPost.read_time} Read
                                    </span>
                                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Article Grid with Load More */}
                <ArticleGrid
                    posts={posts.filter((p: BlogPost) => !featuredPost || p.id !== featuredPost.id)}
                    initialLimit={9}
                    incrementBy={6}
                />

                {/* No posts message */}
                {posts.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-slate-600 text-lg">No articles yet. Check back soon!</p>
                    </div>
                )}

                {/* Newsletter Section */}
                <div className="mt-20 py-16 bg-slate-900 text-white rounded-3xl px-8 text-center">
                    <Mail size={48} className="mx-auto mb-6 text-emerald-400" />
                    <h2 className="text-3xl font-bold mb-4">Join the Inner Circle</h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Get practical systems, mental models, and operator playbooks delivered to your inbox weekly.
                    </p>
                    <Link
                        href="/work-with-me"
                        className="inline-block px-8 py-4 rounded-full bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition-colors"
                    >
                        Work With Me
                    </Link>
                </div>
            </div>
        </div>
    );
}
