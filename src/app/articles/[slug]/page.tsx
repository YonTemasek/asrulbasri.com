import { supabase, BlogPost } from '@/lib/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Comments } from '@/components/Comments';

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    const { data: post } = await supabase
        .from('ab_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt || '',
            type: 'article',
            publishedTime: post.publish_date,
            authors: [post.author || 'Asrul Basri'],
            images: post.image_url ? [post.image_url] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || '',
        },
    };
}

export default async function FrameworkPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    console.log('Looking for post with slug:', slug);

    const { data: post, error } = await supabase
        .from('ab_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'Published')
        .single();

    console.log('Post found:', post?.title, 'Error:', error?.message);

    if (!post) {
        notFound();
    }

    // Schema.org Article structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.image_url,
        author: {
            '@type': 'Person',
            name: post.author || 'Asrul Basri',
            url: 'https://asrulbasri.com',
        },
        publisher: {
            '@type': 'Person',
            name: 'Asrul Basri',
            url: 'https://asrulbasri.com',
        },
        datePublished: post.publish_date,
        dateModified: post.publish_date,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://asrulbasri.com/articles/${post.slug}`,
        },
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Remove first image from content if it matches the featured image
    const getCleanContent = (content: string, imageUrl?: string) => {
        if (!content || !imageUrl) return content;

        // Remove first <img> tag if it appears at the start of content
        const cleaned = content.replace(/^\s*<p>\s*<img[^>]*src="[^"]*"[^>]*>\s*<\/p>/i, '');
        // Also check for standalone img tag
        return cleaned.replace(/^\s*<img[^>]*src="[^"]*"[^>]*>/i, '');
    };

    return (
        <>
            {/* Schema.org JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="min-h-screen bg-white">
                {/* Back Navigation */}
                <div className="pt-24 px-6 max-w-3xl mx-auto">
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors mb-8"
                    >
                        ← Back to Articles
                    </Link>
                </div>

                {/* Header */}
                <header className="pb-12 px-6 max-w-3xl mx-auto">
                    {/* Category/Tags */}
                    {post.category && (
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
                            {post.category}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-slate-600 text-sm">
                        <span className="font-medium text-slate-900">{post.author || 'Asrul Basri'}</span>
                        <span>·</span>
                        <time dateTime={post.publish_date}>{formatDate(post.publish_date || post.created_at)}</time>
                        <span>·</span>
                        <span>{post.read_time} read</span>
                    </div>
                </header>

                {/* Featured Image */}
                {post.image_url && (
                    <div className="max-w-4xl mx-auto px-6 mb-12">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-auto rounded-xl shadow-lg"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="max-w-3xl mx-auto px-6 pb-24">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .blog-content p {
                            font-size: 1.25rem;
                            line-height: 1.9;
                            margin-bottom: 1.75rem;
                            color: #1a1a1a;
                        }
                        .blog-content h1 {
                            font-size: 2.5rem;
                            font-weight: 700;
                            margin-top: 2.5rem;
                            margin-bottom: 1rem;
                            line-height: 1.2;
                            color: #0a0a0a;
                        }
                        .blog-content h2 {
                            font-size: 1.875rem;
                            font-weight: 700;
                            margin-top: 2.5rem;
                            margin-bottom: 1rem;
                            line-height: 1.3;
                            color: #0a0a0a;
                        }
                        .blog-content h3 {
                            font-size: 1.5rem;
                            font-weight: 600;
                            margin-top: 2rem;
                            margin-bottom: 0.75rem;
                            color: #0a0a0a;
                        }
                        .blog-content ul, .blog-content ol {
                            margin: 1.5rem 0;
                            padding-left: 2rem;
                        }
                        .blog-content li {
                            font-size: 1.25rem;
                            line-height: 1.9;
                            margin-bottom: 0.75rem;
                            color: #1a1a1a;
                        }
                        .blog-content blockquote {
                            border-left: 4px solid #10b981;
                            padding-left: 1.5rem;
                            margin: 2rem 0;
                            font-style: italic;
                            color: #4a5568;
                        }
                        .blog-content a {
                            color: #10b981;
                            text-decoration: underline;
                        }
                        .blog-content code {
                            background: #f1f5f9;
                            padding: 0.25rem 0.5rem;
                            border-radius: 4px;
                            font-size: 0.9em;
                        }
                        .blog-content img {
                            border-radius: 12px;
                            margin: 2rem 0;
                            max-width: 100%;
                        }
                    `}} />
                    <div
                        className="blog-content"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                        dangerouslySetInnerHTML={{ __html: getCleanContent(post.content || '', post.image_url) }}
                    />

                    {/* Tags */}
                    {post.tags && (
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.split(',').map((tag: string) => (
                                    <span
                                        key={tag.trim()}
                                        className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                                    >
                                        #{tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Author Bio */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                                AB
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Written by Asrul Basri</h3>
                                <p className="text-slate-600 text-sm mt-1">
                                    System Builder. Helping businesses scale with better operations and technology.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <Comments postId={post.id} />

                    {/* Back to Articles */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/articles"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors"
                        >
                            ← More Articles
                        </Link>
                    </div>
                </div>
            </article>
        </>
    );
}
