'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Plus, Edit, Trash2, Save, X, Eye, PenLine } from 'lucide-react';
import { supabase, BlogPost } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { TiptapEditor } from '@/components/editor/TiptapEditor';

export default function ContentPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        status: 'Draft',
        read_time: '',
        featured: false,
        image_url: '',
        author: 'Asrul Basri',
        publish_date: '',
        seo_title: '',
        seo_description: '',
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('ab_blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingPost) {
                const { error } = await supabase
                    .from('ab_blog_posts')
                    .update(formData)
                    .eq('id', editingPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('ab_blog_posts')
                    .insert(formData);
                if (error) throw error;
            }

            setShowForm(false);
            setEditingPost(null);
            resetForm();
            fetchPosts();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Error saving post. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const { error } = await supabase
                .from('ab_blog_posts')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = (post: BlogPost) => {
        // Redirect to full write page with post ID for editing
        router.push(`/dashboard/content/write?edit=${post.id}`);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            category: '',
            tags: '',
            status: 'Draft',
            read_time: '',
            featured: false,
            image_url: '',
            author: 'Asrul Basri',
            publish_date: '',
            seo_title: '',
            seo_description: '',
        });
    };

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    // Calculate read time from content
    const calculateReadTime = (content: string) => {
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return `${minutes} min`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-serif font-bold">Stories</h1>
                <Button primary onClick={() => router.push('/dashboard/content/write')}>
                    Write a story
                </Button>
            </header>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-600 mb-1">Total Views</p>
                    <p className="text-2xl font-bold text-slate-900">
                        {posts.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-600 mb-1">Published</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {posts.filter(p => p.status === 'Published').length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-600 mb-1">Drafts</p>
                    <p className="text-2xl font-bold text-slate-600">
                        {posts.filter(p => p.status === 'Draft').length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-600 mb-1">Avg. Read Time</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {posts.length > 0
                            ? Math.round(posts.filter(p => p.read_time).reduce((sum, p) => {
                                const mins = parseInt(p.read_time?.replace(' min', '') || '0');
                                return sum + mins;
                            }, 0) / Math.max(1, posts.filter(p => p.read_time).length))
                            : 0} min
                    </p>
                </div>
            </div>

            {/* Post Form Modal via Portal */}
            {showForm && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingPost ? 'Edit Post' : 'Add New Post'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title & Slug */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        setFormData({
                                            ...formData,
                                            title,
                                            slug: formData.slug || generateSlug(title),
                                            seo_title: formData.seo_title || title
                                        });
                                    }}
                                    className="w-full p-3 border border-slate-200 rounded-lg"
                                    placeholder="Article title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">URL Slug</label>
                                <div className="flex gap-2">
                                    <input
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 p-3 border border-slate-200 rounded-lg font-mono text-sm"
                                        placeholder="article-url-slug"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Excerpt</label>
                                <textarea
                                    value={formData.excerpt}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            excerpt: e.target.value,
                                            seo_description: formData.seo_description || e.target.value.slice(0, 160)
                                        });
                                    }}
                                    className="w-full p-3 border border-slate-200 rounded-lg h-16"
                                    placeholder="Short summary for preview..."
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                                <div className="border border-slate-200 rounded-lg p-4 min-h-[300px] bg-white">
                                    <TiptapEditor
                                        content={formData.content}
                                        onChange={(html) => {
                                            setFormData({
                                                ...formData,
                                                content: html,
                                                read_time: calculateReadTime(html.replace(/<[^>]*>/g, ''))
                                            });
                                        }}
                                        placeholder="Write or paste your article content here..."
                                    />
                                </div>
                                {formData.read_time && (
                                    <p className="text-xs text-slate-400 mt-1">📖 {formData.read_time} read</p>
                                )}
                            </div>

                            {/* Category, Status, Author */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                    >
                                        <option value="">Select</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Tech">Tech</option>
                                        <option value="Business">Business</option>
                                        <option value="Mindset">Mindset</option>
                                        <option value="Strategy">Strategy</option>
                                        <option value="Productivity">Productivity</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Published">Published</option>
                                        <option value="Scheduled">Scheduled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Author</label>
                                    <input
                                        value={formData.author}
                                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-lg"
                                        placeholder="Author name"
                                    />
                                </div>
                            </div>

                            {/* Tags & Publish Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
                                    <input
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-lg"
                                        placeholder="startup, tips, guide (comma separated)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Publish Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.publish_date}
                                        onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Featured Image URL</label>
                                <input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Featured Checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="w-4 h-4 accent-emerald-600"
                                />
                                <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                                    Mark as Featured Article
                                </label>
                            </div>

                            {/* SEO Section */}
                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    🔍 SEO Settings
                                </h3>
                                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">SEO Title</label>
                                        <input
                                            value={formData.seo_title}
                                            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-lg"
                                            placeholder="Title for search engines (50-60 chars)"
                                            maxLength={60}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">{formData.seo_title.length}/60 characters</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
                                        <textarea
                                            value={formData.seo_description}
                                            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-lg h-20"
                                            placeholder="Description for search results (150-160 chars)"
                                            maxLength={160}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">{formData.seo_description.length}/160 characters</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button primary type="submit">
                                    <Save size={16} /> {editingPost ? 'Update' : 'Create'} Post
                                </Button>
                                <Button onClick={() => setShowForm(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Medium-style Stories Layout */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-slate-100">
                    <div className="flex gap-6 px-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            All <span className="ml-1 text-slate-400">{posts.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'published'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Published <span className="ml-1">{posts.filter(p => p.status === 'Published').length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('drafts')}
                            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'drafts'
                                ? 'border-slate-900 text-slate-900'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Drafts <span className="ml-1">{posts.filter(p => p.status === 'Draft').length}</span>
                        </button>
                    </div>
                </div>

                {/* Stories List */}
                <div className="divide-y divide-slate-100">
                    {posts
                        .filter(post => {
                            if (activeTab === 'published') return post.status === 'Published';
                            if (activeTab === 'drafts') return post.status === 'Draft';
                            return true; // 'all'
                        })
                        .length > 0 ? (
                        posts
                            .filter(post => {
                                if (activeTab === 'published') return post.status === 'Published';
                                if (activeTab === 'drafts') return post.status === 'Draft';
                                return true;
                            })
                            .map((post) => (
                                <div key={post.id} className="flex items-start gap-4 p-6 hover:bg-slate-50 transition group">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        {post.image_url ? (
                                            <img
                                                src={post.image_url}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <path d="M21 15l-5-5L5 21" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                {/* Title */}
                                                <h3 className="font-bold text-slate-900 truncate group-hover:text-emerald-600 transition cursor-pointer" onClick={() => handleEdit(post)}>
                                                    {post.title}
                                                    {post.featured && (
                                                        <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold align-middle">
                                                            FEATURED
                                                        </span>
                                                    )}
                                                </h3>

                                                {/* Metadata */}
                                                <p className="text-sm text-slate-600 mt-1">
                                                    <span className={`inline-flex items-center gap-1 ${post.status === 'Published' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'Published' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                        {post.status}
                                                    </span>
                                                    <span className="mx-2">·</span>
                                                    {formatDate(post.publish_date || post.created_at)}
                                                    {post.read_time && (
                                                        <>
                                                            <span className="mx-2">·</span>
                                                            {post.read_time} read
                                                        </>
                                                    )}
                                                </p>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Eye size={12} />
                                                        {post.views || 0}
                                                    </span>
                                                    {post.category && (
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {post.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions Menu */}
                                            <div className="relative group/menu">
                                                <button
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Simple dropdown - for now just show actions inline
                                                    }}
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <circle cx="12" cy="5" r="1.5" />
                                                        <circle cx="12" cy="12" r="1.5" />
                                                        <circle cx="12" cy="19" r="1.5" />
                                                    </svg>
                                                </button>

                                                {/* Quick Actions (visible on hover) */}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    {post.status === 'Published' && (
                                                        <a
                                                            href={`/articles/${post.slug}`}
                                                            target="_blank"
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="View"
                                                        >
                                                            <Eye size={16} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PenLine size={24} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No stories yet</h3>
                            <p className="text-slate-600 mb-4">Start writing your first article</p>
                            <Button primary onClick={() => router.push('/dashboard/content/write')}>
                                <PenLine size={16} /> Write your first story
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
